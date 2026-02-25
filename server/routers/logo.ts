import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  deductCredits,
  refundCredits,
  getUserById,
  saveGeneratedImage,
  updateGeneratedImageStatus,
} from "../db";
import { createGenerationTask, pollTaskCompletion } from "../nanoBananaApi";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";
import { createNotification } from "./notification";

// Logo kredi maliyetleri - KIE.AI nano banana pro synced
const LOGO_CREDIT_COSTS: Record<string, number> = {
  "1K": 18, // KIE: nano banana pro 1/2K = 18
  "2K": 18,
  "4K": 24, // KIE: nano banana pro 4K = 24
};

function getCreditsForResolution(resolution: string): number {
  return LOGO_CREDIT_COSTS[resolution] || 18;
}

// Arka planda logo işleme
async function processLogoInBackground(
  imageId: number,
  taskId: string,
  userId: number,
  userName: string | null,
  userEmail: string | null,
  prompt: string,
  resolution: string,
  creditsNeeded: number,
  brandName: string
) {
  try {
    console.log(`[Logo Background] Processing logo ${imageId}, task ${taskId}`);

    await updateGeneratedImageStatus(imageId, "processing");

    const imageUrl = await pollTaskCompletion(taskId);

    if (!imageUrl) {
      console.error(`[Logo Background] No image URL for task ${taskId}`);
      await updateGeneratedImageStatus(imageId, "failed", {
        errorMessage: "Logo üretimi zaman aşımına uğradı",
      });
      await refundCredits(
        userId,
        creditsNeeded,
        `Logo oluşturma başarısız - ${resolution}`
      );

      await createNotification({
        userId,
        title: "Logo Oluşturma Başarısız",
        message: "Logo üretimi zaman aşımına uğradı. Krediniz iade edildi.",
        type: "system",
      });

      notifyGenerationFailure({
        generationType: "logo",
        errorMessage: "TIMEOUT - Logo üretimi zaman aşımına uğradı",
        userId,
        userEmail: userEmail || undefined,
        prompt,
        creditsRefunded: creditsNeeded,
      });
      return null;
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(
        `[Logo Background] Failed to download image: ${imageResponse.status}`
      );
      await updateGeneratedImageStatus(imageId, "failed", {
        errorMessage: "Logo indirilemedi",
      });
      await refundCredits(
        userId,
        creditsNeeded,
        `Logo indirme başarısız - ${resolution}`
      );

      await createNotification({
        userId,
        title: "Logo Oluşturma Başarısız",
        message: "Logo indirilemedi. Krediniz iade edildi.",
        type: "system",
      });
      return null;
    }

    // Upload to S3
    const imageBuffer = await imageResponse.arrayBuffer();
    const safeBrandName = brandName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const fileName = `logo-${safeBrandName}-${nanoid()}.png`;
    const s3Key = `${userId}/logos/${fileName}`;
    const { url: s3Url } = await storagePut(
      s3Key,
      Buffer.from(imageBuffer),
      "image/png"
    );

    // Update database
    await updateGeneratedImageStatus(imageId, "completed", {
      generatedImageUrl: s3Url,
    });

    // Notify user
    await createNotification({
      userId,
      title: "Logo Hazır! 🎨",
      message: `"${brandName}" logosu başarıyla oluşturuldu. Galeri'den görüntüleyebilirsiniz.`,
      type: "generation_complete",
      actionUrl: "/gallery",
    });

    // Get updated user credits for notification
    const updatedUser = await getUserById(userId);

    // Notify admin
    notifyCreditSpending({
      userName,
      userEmail,
      creditsSpent: creditsNeeded,
      creditsRemaining: updatedUser?.credits ?? 0,
      action: `Logo oluşturma (${resolution}, ${brandName})`,
    }).catch(console.error);

    console.log(`[Logo Background] Logo ${imageId} completed successfully`);
    return s3Url;
  } catch (error) {
    console.error(`[Logo Background] Error processing logo ${imageId}:`, error);
    await updateGeneratedImageStatus(imageId, "failed", {
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
    await refundCredits(
      userId,
      creditsNeeded,
      `Logo oluşturma başarısız - ${resolution}`
    );

    await createNotification({
      userId,
      title: "Logo Oluşturma Başarısız",
      message: "Beklenmeyen bir hata oluştu. Krediniz iade edildi.",
      type: "system",
    });

    notifyGenerationFailure({
      generationType: "logo",
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
      userId,
      prompt,
      creditsRefunded: creditsNeeded,
    });
    return null;
  }
}

export const logoRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt gereklidir"),
        resolution: z.enum(["1K", "2K", "4K"]).default("2K"),
        brandName: z.string().min(1, "Marka adı gereklidir"),
        industry: z.string().optional(),
        logoStyle: z.string().optional(),
        colorPalette: z.string().optional(),
        iconType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check user
      const user = await getUserById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Get credits needed
      const creditsNeeded = getCreditsForResolution(input.resolution);

      if (user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `INSUFFICIENT_CREDITS|Yetersiz kredi! Logo oluşturmak için ${creditsNeeded} krediye ihtiyacınız var, ancak sadece ${user.credits} krediniz mevcut.`,
        });
      }

      // Deduct credits
      const creditDeducted = await deductCredits(userId, creditsNeeded);
      if (!creditDeducted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi düşürülemedi",
        });
      }

      try {
        console.log("[Logo] Creating task with prompt:", input.prompt);

        const taskResponse = await createGenerationTask({
          prompt: input.prompt,
          aspectRatio: "1:1", // Logolar için kare format
          resolution: input.resolution,
        });

        if (!taskResponse.success) {
          console.error("[Logo] Task creation failed:", taskResponse.error);
          await refundCredits(
            userId,
            creditsNeeded,
            `Logo oluşturma başarısız - ${input.resolution}`
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `API_ERROR|Logo üretimi başlatılamadı. ${taskResponse.error || "API hatası oluştu"}. Lütfen tekrar deneyin.`,
          });
        }

        const taskId = taskResponse.taskId;

        // Save to database
        const imageId = await saveGeneratedImage({
          userId,
          prompt: input.prompt,
          generatedImageUrl: "",
          aspectRatio: "1:1",
          resolution: input.resolution,
          creditsCost: creditsNeeded,
          taskId,
          status: "pending",
        });

        if (!imageId) {
          await refundCredits(
            userId,
            creditsNeeded,
            `Veritabanı hatası - ${input.resolution}`
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Veritabanına kayıt yapılamadı",
          });
        }

        // Start background processing
        processLogoInBackground(
          imageId,
          taskId,
          userId,
          user.name,
          user.email,
          input.prompt,
          input.resolution,
          creditsNeeded,
          input.brandName
        )
          .then(url => {
            if (url) {
              console.log(
                "[Logo] Background processing completed with URL:",
                url
              );
            }
          })
          .catch(console.error);

        // Poll for completion (for immediate response)
        const imageUrl = await pollTaskCompletion(taskId, 120, 2000); // 4 dakika max

        if (imageUrl) {
          // Download and upload to S3
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const safeBrandName = input.brandName
              .replace(/[^a-zA-Z0-9]/g, "-")
              .toLowerCase();
            const fileName = `logo-${safeBrandName}-${nanoid()}.png`;
            const s3Key = `${userId}/logos/${fileName}`;
            const { url: s3Url } = await storagePut(
              s3Key,
              Buffer.from(imageBuffer),
              "image/png"
            );

            await updateGeneratedImageStatus(imageId, "completed", {
              generatedImageUrl: s3Url,
            });

            return {
              success: true,
              imageId,
              imageUrl: s3Url,
              status: "completed",
            };
          }
        }

        return {
          success: true,
          imageId,
          taskId,
          status: "pending",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Logo] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Logo oluşturma başarısız oldu",
        });
      }
    }),

  // Get credit costs
  getCreditCosts: protectedProcedure.query(async () => {
    return LOGO_CREDIT_COSTS;
  }),
});
