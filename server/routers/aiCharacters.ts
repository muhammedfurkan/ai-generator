import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";
import {
  createAiCharacter,
  getUserAiCharacters,
  getAiCharacterById,
  updateAiCharacter,
  deleteAiCharacter,
  incrementCharacterUsage,
  saveAiCharacterImage,
  getAiCharacterImages,
  getAllAiCharacterImages,
  deductCredits,
  refundCredits,
  getUserById,
  toggleCharacterPublic,
  getPublicCharacters,
  getPopularCharacters,
  getPublicCharactersCount,
  saveGeneratedImage,
  updateGeneratedImageStatus,
} from "../db";
import {
  createGenerationTask,
  pollTaskCompletionWithError,
} from "../nanoBananaApi";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";
import { createNotification } from "./notification";

// Kaliteye göre kredi maliyeti
const CREDIT_COSTS: Record<string, number> = {
  "1K": 10,
  "2K": 15,
  "4K": 20,
};

function getCreditsForResolution(resolution: string): number {
  return CREDIT_COSTS[resolution] || 10;
}

// Arka planda AI Character görsel işleme fonksiyonu
async function processAiCharacterImageInBackground(
  galleryImageId: number,
  taskId: string,
  userId: number,
  userName: string | null,
  userEmail: string | null,
  characterId: number,
  characterName: string,
  prompt: string,
  referenceImageUrl: string | undefined,
  characterImageUrl: string,
  resolution: string,
  aspectRatio: string,
  creditsNeeded: number
) {
  try {
    console.log(
      `[AI Character Background] Processing image ${galleryImageId}, task ${taskId}`
    );

    // Update status to processing
    await updateGeneratedImageStatus(galleryImageId, "processing");

    // Poll for completion with error details
    const pollResult = await pollTaskCompletionWithError(taskId);
    const imageUrl = pollResult.imageUrl;
    const errorDetails = pollResult.error;

    if (!imageUrl) {
      const errorMessage =
        errorDetails || "TIMEOUT - Görsel üretimi zaman aşımına uğradı";

      console.error(
        `[AI Character Background] No image URL for task ${taskId}. Error: ${errorMessage}`
      );
      await updateGeneratedImageStatus(galleryImageId, "failed", {
        errorMessage: errorMessage,
      });
      await refundCredits(
        userId,
        creditsNeeded,
        `AI Karakter görsel oluşturma başarısız`
      );

      // Create user-friendly notification message
      let notificationMessage =
        "Görsel üretimi başarısız oldu. Krediniz iade edildi.";
      if (errorDetails) {
        if (
          errorDetails.includes("CONTENT_POLICY") ||
          errorDetails.includes("NSFW")
        ) {
          notificationMessage =
            "İçerik politikası ihlali tespit edildi. Lütfen promptunuzu değiştirin. Krediniz iade edildi.";
        } else if (errorDetails.includes("TIMEOUT")) {
          notificationMessage =
            "Görsel üretimi zaman aşımına uğradı. Lütfen tekrar deneyin. Krediniz iade edildi.";
        }
      }

      await createNotification({
        userId,
        title: "Görsel Oluşturma Başarısız",
        message: notificationMessage,
        type: "system",
      });

      notifyGenerationFailure({
        generationType: "ai-character",
        errorMessage: errorMessage,
        userId,
        userEmail: userEmail || undefined,
        prompt,
        creditsRefunded: creditsNeeded,
      });
      return;
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(
        `[AI Character Background] Failed to download image: ${imageResponse.status}`
      );
      await updateGeneratedImageStatus(galleryImageId, "failed", {
        errorMessage: "Görsel indirilemedi",
      });
      await refundCredits(
        userId,
        creditsNeeded,
        `AI Karakter görsel indirme başarısız`
      );

      await createNotification({
        userId,
        title: "Görsel Oluşturma Başarısız",
        message: "Görsel indirilemedi. Krediniz iade edildi.",
        type: "system",
      });
      return;
    }

    // Upload to S3
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileName = `ai-character-${nanoid()}.png`;
    const s3Key = `${userId}/ai-characters/${characterId}/${fileName}`;
    const { url: s3Url } = await storagePut(
      s3Key,
      Buffer.from(imageBuffer),
      "image/png"
    );

    // Update database with completed status
    await updateGeneratedImageStatus(galleryImageId, "completed", {
      generatedImageUrl: s3Url,
    });

    // Also save to aiCharacterImages table
    try {
      await saveAiCharacterImage({
        characterId,
        userId,
        prompt,
        referenceImageUrl,
        generatedImageUrl: s3Url,
        aspectRatio,
        resolution,
        creditsCost: creditsNeeded,
        taskId,
      });
      console.log("[AI Character Background] Image saved to aiCharacterImages");
    } catch (characterImageError) {
      console.warn(
        "[AI Character Background] Failed to save to aiCharacterImages (non-critical):",
        characterImageError instanceof Error
          ? characterImageError.message
          : String(characterImageError)
      );
    }

    // Increment character usage
    await incrementCharacterUsage(characterId);

    // Notify user
    await createNotification({
      userId,
      title: "Görsel Hazır! 🎨",
      message: `${characterName} karakteri ile görseliniz oluşturuldu. Galeri'den görüntüleyebilirsiniz.`,
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
      action: `AI Karakter görsel oluşturma (${characterName}, ${resolution}, ${aspectRatio})`,
    }).catch(console.error);

    console.log(
      `[AI Character Background] Image ${galleryImageId} completed successfully`
    );
  } catch (error) {
    console.error(
      `[AI Character Background] Error processing image ${galleryImageId}:`,
      error
    );
    await updateGeneratedImageStatus(galleryImageId, "failed", {
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
    await refundCredits(
      userId,
      creditsNeeded,
      `AI Karakter görsel oluşturma başarısız`
    );

    await createNotification({
      userId,
      title: "Görsel Oluşturma Başarısız",
      message: "Beklenmeyen bir hata oluştu. Krediniz iade edildi.",
      type: "system",
    });

    notifyGenerationFailure({
      generationType: "ai-character",
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
      userId,
      prompt,
      creditsRefunded: creditsNeeded,
    });
  }
}

// Arka planda temporary (geçici) AI Character görsel işleme fonksiyonu
async function processTemporaryAiCharacterImageInBackground(
  galleryImageId: number,
  taskId: string,
  userId: number,
  userName: string | null,
  userEmail: string | null,
  characterImageUrl: string,
  prompt: string,
  resolution: string,
  aspectRatio: string,
  creditsNeeded: number
) {
  try {
    console.log(
      `[AI Character Temp Background] Processing image ${galleryImageId}, task ${taskId}`
    );

    // Update status to processing
    await updateGeneratedImageStatus(galleryImageId, "processing");

    // Poll for completion with error details
    const pollResult = await pollTaskCompletionWithError(taskId);
    const imageUrl = pollResult.imageUrl;
    const errorDetails = pollResult.error;

    if (!imageUrl) {
      const errorMessage =
        errorDetails || "TIMEOUT - Görsel üretimi zaman aşımına uğradı";

      console.error(
        `[AI Character Temp Background] No image URL for task ${taskId}. Error: ${errorMessage}`
      );
      await updateGeneratedImageStatus(galleryImageId, "failed", {
        errorMessage: errorMessage,
      });
      await refundCredits(
        userId,
        creditsNeeded,
        `AI Karakter geçici görsel oluşturma başarısız`
      );

      // Create user-friendly notification message
      let notificationMessage =
        "Görsel üretimi başarısız oldu. Krediniz iade edildi.";
      if (errorDetails) {
        if (
          errorDetails.includes("CONTENT_POLICY") ||
          errorDetails.includes("NSFW")
        ) {
          notificationMessage =
            "İçerik politikası ihlali tespit edildi. Lütfen promptunuzu değiştirin. Krediniz iade edildi.";
        } else if (errorDetails.includes("TIMEOUT")) {
          notificationMessage =
            "Görsel üretimi zaman aşımına uğradı. Lütfen tekrar deneyin. Krediniz iade edildi.";
        }
      }

      await createNotification({
        userId,
        title: "Görsel Oluşturma Başarısız",
        message: notificationMessage,
        type: "system",
      });

      notifyGenerationFailure({
        generationType: "ai-character",
        errorMessage: errorMessage,
        userId,
        userEmail: userEmail || undefined,
        prompt,
        creditsRefunded: creditsNeeded,
      });
      return;
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(
        `[AI Character Temp Background] Failed to download image: ${imageResponse.status}`
      );
      await updateGeneratedImageStatus(galleryImageId, "failed", {
        errorMessage: "Görsel indirilemedi",
      });
      await refundCredits(
        userId,
        creditsNeeded,
        `AI Karakter geçici görsel indirme başarısız`
      );

      await createNotification({
        userId,
        title: "Görsel Oluşturma Başarısız",
        message: "Görsel indirilemedi. Krediniz iade edildi.",
        type: "system",
      });
      return;
    }

    // Upload to S3
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileName = `ai-character-temp-${nanoid()}.png`;
    const s3Key = `${userId}/ai-characters/temporary/${fileName}`;
    const { url: s3Url } = await storagePut(
      s3Key,
      Buffer.from(imageBuffer),
      "image/png"
    );

    // Update database with completed status
    await updateGeneratedImageStatus(galleryImageId, "completed", {
      generatedImageUrl: s3Url,
    });

    // Notify user
    await createNotification({
      userId,
      title: "Görsel Hazır! 🎨",
      message:
        "Görseliniz başarıyla oluşturuldu. Galeri'den görüntüleyebilirsiniz.",
      type: "generation_complete",
      actionUrl: "/gallery",
    });

    // Get updated user credits for notification
    const updatedUserTemp = await getUserById(userId);

    // Notify admin
    notifyCreditSpending({
      userName,
      userEmail,
      creditsSpent: creditsNeeded,
      creditsRemaining: updatedUserTemp?.credits ?? 0,
      action: `AI Karakter geçici görsel oluşturma (${resolution}, ${aspectRatio})`,
    }).catch(console.error);

    console.log(
      `[AI Character Temp Background] Image ${galleryImageId} completed successfully`
    );
  } catch (error) {
    console.error(
      `[AI Character Temp Background] Error processing image ${galleryImageId}:`,
      error
    );
    await updateGeneratedImageStatus(galleryImageId, "failed", {
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
    await refundCredits(
      userId,
      creditsNeeded,
      `AI Karakter geçici görsel oluşturma başarısız`
    );

    await createNotification({
      userId,
      title: "Görsel Oluşturma Başarısız",
      message: "Beklenmeyen bir hata oluştu. Krediniz iade edildi.",
      type: "system",
    });

    notifyGenerationFailure({
      generationType: "ai-character",
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
      userId,
      prompt,
      creditsRefunded: creditsNeeded,
    });
  }
}

export const aiCharactersRouter = router({
  // Create a new AI character
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Karakter adı gereklidir").max(100),
        characterImageUrl: z
          .string()
          .url("Geçerli bir görsel URL'si gereklidir"),
        description: z.string().max(500).optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        style: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const characterId = await createAiCharacter({
        userId: ctx.user.id,
        name: input.name,
        characterImageUrl: input.characterImageUrl,
        description: input.description,
        gender: input.gender,
        style: input.style,
      });

      if (!characterId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Karakter oluşturulamadı",
        });
      }

      return { id: characterId, success: true };
    }),

  // List user's AI characters
  list: protectedProcedure.query(async ({ ctx }) => {
    const characters = await getUserAiCharacters(ctx.user.id);
    return characters;
  }),

  // Get a single character
  get: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const character = await getAiCharacterById(
        input.characterId,
        ctx.user.id
      );
      if (!character) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Karakter bulunamadı",
        });
      }
      return character;
    }),

  // Update a character
  update: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        style: z.string().max(50).optional(),
        characterImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { characterId, ...updateData } = input;
      const success = await updateAiCharacter(
        characterId,
        ctx.user.id,
        updateData
      );

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Karakter bulunamadı veya güncellenemedi",
        });
      }

      return { success: true };
    }),

  // Delete a character
  delete: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await deleteAiCharacter(input.characterId, ctx.user.id);

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Karakter bulunamadı veya silinemedi",
        });
      }

      return { success: true };
    }),

  // Get character's generated images
  getImages: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const images = await getAiCharacterImages(
        input.characterId,
        ctx.user.id,
        input.limit
      );
      return images;
    }),

  // Get all AI character images for user
  getAllImages: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const images = await getAllAiCharacterImages(ctx.user.id, input.limit);
      return images;
    }),

  // Generate image with character
  generateWithCharacter: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        prompt: z.string().min(1, "Prompt gereklidir"),
        referenceImageUrl: z.string().url().optional(), // Reference pose image
        aspectRatio: z.enum([
          "1:1",
          "16:9",
          "9:16",
          "4:3",
          "3:4",
          "3:2",
          "2:3",
        ]),
        resolution: z.enum(["1K", "2K", "4K"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Get character
      const character = await getAiCharacterById(input.characterId, userId);
      if (!character) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Karakter bulunamadı",
        });
      }

      // Check if user has enough credits
      const user = await getUserById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      const creditsNeeded = getCreditsForResolution(input.resolution);

      if (user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `INSUFFICIENT_CREDITS|Yetersiz kredi! Görsel oluşturmak için ${creditsNeeded} krediye ihtiyacınız var, ancak sadece ${user.credits} krediniz mevcut.`,
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
        // Build the prompt with character reference
        const fullPrompt = `${input.prompt}. Keep the same person/character appearance from the reference image.`;

        console.log("[AI Character] Creating task with prompt:", fullPrompt);
        console.log(
          "[AI Character] Character image:",
          character.characterImageUrl
        );
        console.log("[AI Character] Reference pose:", input.referenceImageUrl);

        // Create generation task with character image as reference
        const taskResponse = await createGenerationTask({
          prompt: fullPrompt,
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          referenceImageUrl: character.characterImageUrl,
        });

        if (!taskResponse.success) {
          await refundCredits(
            userId,
            creditsNeeded,
            `AI Karakter görsel oluşturma başarısız - API hatası`
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `API_ERROR|Görsel üretimi başlatılamadı. ${taskResponse.error || "API hatası oluştu"}`,
          });
        }

        // Save to generatedImages table with "pending" status so it appears in gallery immediately
        const galleryImageId = await saveGeneratedImage({
          userId,
          prompt: input.prompt,
          referenceImageUrl: character.characterImageUrl,
          generatedImageUrl: "", // Will be updated when completed
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          creditsCost: creditsNeeded,
          taskId: taskResponse.taskId,
          status: "pending",
        });

        if (!galleryImageId) {
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

        console.log(
          "[AI Character] Image saved to gallery with pending status, id:",
          galleryImageId
        );

        // Start background processing (don't await)
        processAiCharacterImageInBackground(
          galleryImageId,
          taskResponse.taskId,
          userId,
          user.name,
          user.email,
          character.id,
          character.name,
          input.prompt,
          input.referenceImageUrl,
          character.characterImageUrl,
          input.resolution,
          input.aspectRatio,
          creditsNeeded
        ).catch(console.error);

        // Return immediately
        return {
          success: true,
          imageId: galleryImageId,
          taskId: taskResponse.taskId,
          status: "pending",
          message:
            "Görsel oluşturma başlatıldı. Sayfadan ayrılabilirsiniz, tamamlandığında bildirim alacaksınız.",
          creditsRemaining: user.credits - creditsNeeded,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("[AI Character] Unexpected error:", error);
        await refundCredits(
          userId,
          creditsNeeded,
          `AI Karakter görsel oluşturma başarısız`
        );

        notifyGenerationFailure({
          generationType: "ai-character",
          errorMessage:
            error instanceof Error ? error.message : "Bilinmeyen hata",
          userId,
          userEmail: user?.email || undefined,
          prompt: input.prompt,
          creditsRefunded: creditsNeeded,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Görsel üretimi sırasında hata oluştu",
        });
      }
    }),

  // Toggle character public status
  togglePublic: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await toggleCharacterPublic(
        input.characterId,
        ctx.user.id
      );

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Karakter bulunamadı",
        });
      }

      return { success: true, isPublic: result.isPublic };
    }),

  // Get public characters (for community showcase) - public endpoint
  getPublic: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const characters = await getPublicCharacters(input.limit, input.offset);
      const total = await getPublicCharactersCount();
      return { characters, total };
    }),

  // Get popular characters (for homepage) - public endpoint
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
    .query(async ({ input }) => {
      const characters = await getPopularCharacters(input.limit);
      return characters;
    }),

  // Generate image with temporary character image (without saving character)
  generateWithTemporaryImage: protectedProcedure
    .input(
      z.object({
        characterImageUrl: z
          .string()
          .url("Geçerli bir görsel URL'si gereklidir"),
        prompt: z.string().min(1, "Prompt gereklidir"),
        referenceImageUrl: z.string().url().optional(),
        aspectRatio: z.enum([
          "1:1",
          "16:9",
          "9:16",
          "4:3",
          "3:4",
          "3:2",
          "2:3",
        ]),
        resolution: z.enum(["1K", "2K", "4K"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if user has enough credits
      const user = await getUserById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      const creditsNeeded = getCreditsForResolution(input.resolution);

      if (user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `INSUFFICIENT_CREDITS|Yetersiz kredi! Görsel oluşturmak için ${creditsNeeded} krediye ihtiyacınız var, ancak sadece ${user.credits} krediniz mevcut.`,
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
        const fullPrompt = `${input.prompt}. Keep the same person/character appearance from the reference image.`;

        console.log(
          "[AI Character Temp] Creating task with prompt:",
          fullPrompt
        );
        console.log(
          "[AI Character Temp] Character image:",
          input.characterImageUrl
        );

        // Create generation task with temporary character image
        const taskResponse = await createGenerationTask({
          prompt: fullPrompt,
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          referenceImageUrl: input.characterImageUrl,
        });

        if (!taskResponse.success) {
          await refundCredits(
            userId,
            creditsNeeded,
            `AI Karakter geçici görsel oluşturma başarısız - API hatası`
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `API_ERROR|Görsel üretimi başlatılamadı. ${taskResponse.error || "API hatası oluştu"}`,
          });
        }

        // Save to generatedImages table with "pending" status so it appears in gallery immediately
        const galleryImageId = await saveGeneratedImage({
          userId,
          prompt: input.prompt,
          referenceImageUrl: input.characterImageUrl,
          generatedImageUrl: "", // Will be updated when completed
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          creditsCost: creditsNeeded,
          taskId: taskResponse.taskId,
          status: "pending",
        });

        if (!galleryImageId) {
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

        console.log(
          "[AI Character Temp] Image saved to gallery with pending status, id:",
          galleryImageId
        );

        // Start background processing (don't await)
        processTemporaryAiCharacterImageInBackground(
          galleryImageId,
          taskResponse.taskId,
          userId,
          user.name,
          user.email,
          input.characterImageUrl,
          input.prompt,
          input.resolution,
          input.aspectRatio,
          creditsNeeded
        ).catch(console.error);

        // Return immediately
        return {
          success: true,
          imageId: galleryImageId,
          taskId: taskResponse.taskId,
          status: "pending",
          message:
            "Görsel oluşturma başlatıldı. Sayfadan ayrılabilirsiniz, tamamlandığında bildirim alacaksınız.",
          creditsRemaining: user.credits - creditsNeeded,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("[AI Character Temp] Unexpected error:", error);
        await refundCredits(
          userId,
          creditsNeeded,
          `AI Karakter geçici görsel oluşturma başarısız`
        );

        notifyGenerationFailure({
          generationType: "ai-character",
          errorMessage:
            error instanceof Error ? error.message : "Bilinmeyen hata",
          userId,
          userEmail: user?.email || undefined,
          prompt: input.prompt,
          creditsRefunded: creditsNeeded,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Görsel üretimi sırasında hata oluştu",
        });
      }
    }),

  // Generate AI prompt for character poses
  generatePrompt: protectedProcedure
    .input(
      z.object({
        characterName: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        style: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { characterName, gender, style } = input;

      // Lokasyonlar - Türkiye'nin en güzel mekanları (50+ lokasyon)
      const locations = [
        // İSTANBUL
        {
          name: "Kadıköy, İstanbul",
          landmarks: "Kadıköy İskelesi, Moda Sahili, Çarşı sokakları",
          environment:
            "tarihi binalar, sokak sanatçıları, canlı pazar atmosferi",
        },
        {
          name: "Üsküdar, İstanbul",
          landmarks:
            "Kız Kulesi manzarası, Üsküdar Meydanı, Mihrimah Sultan Camii",
          environment: "Boğaz manzarası, tarihi camiler, vapurlar",
        },
        {
          name: "Taksim, İstanbul",
          landmarks:
            "Cumhuriyet Anıtı, İstiklal Caddesi girişi, nostaljik tramvay",
          environment: "kalabalık meydan, alışveriş caddesi, kafeler",
        },
        {
          name: "Beşiktaş, İstanbul",
          landmarks: "Beşiktaş İskelesi, Çarşı, Barbaros Heykeli",
          environment: "deniz kenarı, balıkçılar, canlı sokak hayatı",
        },
        {
          name: "Galata Kulesi, İstanbul",
          landmarks: "tarihi Galata Kulesi, Galata Köprüsü manzarası",
          environment: "arı taşlı sokaklar, antik binalar, turistler",
        },
        {
          name: "Sultanahmet, İstanbul",
          landmarks: "Ayasofya, Sultanahmet Camii, Hipodrom",
          environment: "tarihi yarımada, turistik alan, antik kalıntılar",
        },
        {
          name: "Ortaköy, İstanbul",
          landmarks: "Ortaköy Camii, Boğaz Köprüsü manzarası",
          environment: "sahil kenarı, kumpir tezgahları, gece hayatı",
        },
        {
          name: "Bebek, İstanbul",
          landmarks: "Bebek Sahili, Boğaz manzarası, yalılar",
          environment: "lüks kafeler, sahil yürüyüş yolu, yatlar",
        },
        {
          name: "Sarıyer, İstanbul",
          landmarks: "Rumeli Hisarı, Sarıyer İskelesi",
          environment: "balıkçı köyü atmosferi, yeşil tepeler",
        },
        {
          name: "Balat, İstanbul",
          landmarks: "renkli evler, tarihi sokaklar, Fener Rum Patrikhanesi",
          environment: "nostaljik atmosfer, antik dükkanlar, sanat galerileri",
        },
        {
          name: "Eminonü, İstanbul",
          landmarks: "Mısır Çarşısı, Yeni Cami, balık ekmek tekneleri",
          environment: "kalabalık pazar, deniz kokusu, tarihi çarşı",
        },
        {
          name: "Kapalıçarşı, İstanbul",
          landmarks: "tarihi kapalı çarşı, kubbeli geçitler",
          environment: "altın dükkanları, halı satıcıları, antikacılar",
        },
        {
          name: "Boğaz Köprüsü, İstanbul",
          landmarks: "15 Temmuz Şehitler Köprüsü, Boğaz manzarası",
          environment: "deniz kıyısı, şehir silueti, gemi trafiği",
        },
        {
          name: "Adalar, İstanbul",
          landmarks: "Büyükada, fayton, Viktoryen köşkler",
          environment: "arabasiz ada, çam ormanları, deniz manzarası",
        },

        // EGE BÖLGESİ
        {
          name: "İzmir Kordon, İzmir",
          landmarks: "Kordon Boyu, Saat Kulesi, Konak Meydanı",
          environment: "deniz kenarı yürüyüş yolu, palmiyeler, kafeler",
        },
        {
          name: "Alsancak, İzmir",
          landmarks: "Kıbrıs Şehitleri Caddesi, tarihi binalar",
          environment: "canlı gece hayatı, barlar sokağı, butik dükkanlar",
        },
        {
          name: "Efes Antik Kenti, İzmir",
          landmarks: "Celsus Kütüphanesi, antik tiyatro",
          environment: "Roma kalıntıları, mermer sütunlar, tarihi yollar",
        },
        {
          name: "Alaçatı, İzmir",
          landmarks: "taş evler, yel değirmenleri, dar sokaklar",
          environment: "begonvil çiçekleri, butik oteller, rüzgar sörfü",
        },
        {
          name: "Çeşme, İzmir",
          landmarks: "Çeşme Kalesi, marina, plajlar",
          environment: "turkuaz deniz, beyaz kumsal, yatlar",
        },
        {
          name: "Bodrum, Muğla",
          landmarks: "Bodrum Kalesi, marina, beyaz evler",
          environment: "Ege mimarisi, gece hayatı, lüks yatlar",
        },
        {
          name: "Marmaris, Muğla",
          landmarks: "Marmaris Kalesi, uzun sahil, marina",
          environment: "turkuaz koylar, ormanlık tepeler, tekne turları",
        },
        {
          name: "Fethiye, Muğla",
          landmarks: "Ölüdeniz, kaya mezarları, Fethiye Limanı",
          environment: "mavi lagn, paragül, yeşil dağlar",
        },
        {
          name: "Ölüdeniz, Muğla",
          landmarks: "Mavi Lagün, Babadağ, kumsal",
          environment: "turkuaz su, beyaz kumsal, yamaparaşüt",
        },
        {
          name: "Pamukkale, Denizli",
          landmarks: "beyaz travertenler, antik Hierapolis",
          environment: "termal havuzlar, doğal oluşumlar, antik kalıntılar",
        },
        {
          name: "Kuşadası, Aydın",
          landmarks: "Güvercin Adası, kruvaziyer limanı",
          environment: "sahil kasabası, alışveriş sokakları, plajlar",
        },

        // AKDENİZ BÖLGESİ
        {
          name: "Antalya Kalıçi, Antalya",
          landmarks: "tarihi Kaleiçi, Hadrian Kapısı, marina",
          environment: "Osmanlı evleri, dar sokaklar, antik surlar",
        },
        {
          name: "Konyaaltı Plajı, Antalya",
          landmarks: "uzun sahil, Toros Dağları manzarası",
          environment: "çakıl plaj, mavi bayrak, sahil parkları",
        },
        {
          name: "Alanya, Antalya",
          landmarks: "Alanya Kalesi, Kızıl Kule, Kleopatra Plajı",
          environment: "tarihi kale, turkuaz deniz, muz bahçeleri",
        },
        {
          name: "Side, Antalya",
          landmarks: "Apollon Tapınağı, antik tiyatro",
          environment: "Roma kalıntıları, kumsal, gün batımı",
        },
        {
          name: "Kaş, Antalya",
          landmarks: "renkli sokaklar, antik tiyatro, Meis Adası manzarası",
          environment: "bohem atmosfer, dalış noktaları, butik oteller",
        },
        {
          name: "Mersin Sahili, Mersin",
          landmarks: "Mersin Marina, sahil yürüyüş yolu",
          environment: "palmiyeli bulvar, modern şehir, Akdeniz",
        },
        {
          name: "Tarsus, Mersin",
          landmarks: "Kleopatra Kapısı, Şelalesi, tarihi çarşı",
          environment: "antik şehir, tarihi dokular, yerel pazar",
        },

        // İÇ ANADOLU
        {
          name: "Kapadokya, Nevşehir",
          landmarks: "peri bacaları, sıcak hava balonları, kaya oteller",
          environment: "volkanik oluşumlar, gün doğumu, mağara evler",
        },
        {
          name: "Göreme, Nevşehir",
          landmarks: "Açık Hava Müzesi, peri bacaları",
          environment: "kaya kiliseleri, vadiler, balon festivali",
        },
        {
          name: "Uchisar Kalesi, Nevşehir",
          landmarks: "doğal kaya kalesi, panoramik manzara",
          environment: "Kapadokya vadileri, gün batımı, taş evler",
        },
        {
          name: "Ankara Kalesi, Ankara",
          landmarks: "tarihi kale, Anıtkabir manzarası",
          environment: "eski şehir, geleneksel evler, panoramik görünüm",
        },
        {
          name: "Anıtkabir, Ankara",
          landmarks: "Atatürk'un mozolesi, Zafer Meydanı",
          environment: "anıtsal yapı, aslan heykelleri, tören alanı",
        },
        {
          name: "Konya Mevlana Müzesi, Konya",
          landmarks: "Mevlana Türbesi, yeşil kubbe",
          environment: "manevi atmosfer, Selçuklu mimarisi, gül bahçeleri",
        },
        {
          name: "Tuz Gölü, Aksaray",
          landmarks: "beyaz tuz düzlüğü, ayna etkisi",
          environment: "sonsuz beyazlık, gün batımı, doğal güzellik",
        },

        // MARMARA BÖLGESİ
        {
          name: "Bursa Ulu Cami, Bursa",
          landmarks: "Ulu Cami, Koza Han, Yeşil Türbe",
          environment: "Osmanlı başkenti, tarihi çarşı, ipek ticareti",
        },
        {
          name: "Uludağ, Bursa",
          landmarks: "kayak pistleri, teleferik, dağ manzarası",
          environment: "kış sporları, ormanlar, dağ otelleri",
        },
        {
          name: "Cumalıkızık, Bursa",
          landmarks: "Osmanlı köyü, renkli evler, dar sokaklar",
          environment: "tarihi köy, el sanatları, gözlemeciler",
        },
        {
          name: "Edirne Selimiye Camii, Edirne",
          landmarks: "Selimiye Camii, Mimar Sinan eseri",
          environment: "Osmanlı mimarisi, şadirvan, tarihi çarşı",
        },

        // KARADENİZ BÖLGESİ
        {
          name: "Trabzon Uzungöl, Trabzon",
          landmarks: "göl manzarası, dağ evleri, çam ormanları",
          environment: "sis, yeşillik, ahşap evler, doğa",
        },
        {
          name: "Sümela Manastırı, Trabzon",
          landmarks: "kayalara oyulmuş manastır",
          environment: "dik yamaç, orman, mistik atmosfer",
        },
        {
          name: "Ayder Yaylası, Rize",
          landmarks: "yayla evleri, şelale, termal kaplıcalar",
          environment: "yeşil çayırları, bulutlar, geleneksel evler",
        },
        {
          name: "Rize Çay Bahçeleri, Rize",
          landmarks: "yeşil çay tarlaları, yamaç evler",
          environment: "teraslanmış tepeler, sis, çay toplama",
        },
        {
          name: "Safranbolu, Karabük",
          landmarks: "Osmanlı evleri, Cinci Han, tarihi çarşı",
          environment: "ahşap konak, arı taşlı sokak, safran",
        },
        {
          name: "Amasra, Bartın",
          landmarks: "Amasra Kalesi, küçük liman, adalar",
          environment: "Karadeniz kıyısı, balıkçı kasabası, tarihi surlar",
        },
        {
          name: "Sinop Kalesi, Sinop",
          landmarks: "tarihi kale, deniz feneri, liman",
          environment: "yarımada, Karadeniz, balıkçı tekneleri",
        },

        // GÜNEYDOĞU ANADOLU
        {
          name: "Mardin Eski Şehir, Mardin",
          landmarks: "taş evler, minareler, Mezopotamya manzarası",
          environment: "sarı taş mimari, dar sokaklar, kiliseler",
        },
        {
          name: "Midyat, Mardin",
          landmarks: "telkari atölyeleri, Süryani kiliseleri",
          environment: "taş işçiliği, geleneksel zanaat, tarihi dokular",
        },
        {
          name: "Diyarbakır Surları, Diyarbakır",
          landmarks: "tarihi surlar, Ulu Cami, Hevsel Bahçeleri",
          environment: "bazalt taşı, antik duvarlar, Dicle Nehri",
        },
        {
          name: "Şanlıurfa Balıklıgöl, Şanlıurfa",
          landmarks: "kutsal havuz, Halılürrahman Camii",
          environment: "tarihi alan, balıklar, manevi atmosfer",
        },
        {
          name: "Göbeklitepe, Şanlıurfa",
          landmarks: "dünyanın en eski tapınağı, T şekilli dikilitalar",
          environment: "arkeolojik alan, gizemli yapılar, tarih öncesi",
        },
        {
          name: "Gaziantep Kalesi, Gaziantep",
          landmarks: "tarihi kale, bakırcılar çarşısı",
          environment: "gastronomi şehri, geleneksel çarşı, baklava",
        },

        // DOĞU ANADOLU
        {
          name: "Van Kalesi, Van",
          landmarks: "Urartu kalesi, Van Gölü manzarası",
          environment: "tarihi kale, mavi göl, dağlar",
        },
        {
          name: "Akdamar Adası, Van",
          landmarks: "Akdamar Kilisesi, Van Gölü",
          environment: "ada, Ermeni mimarisi, turkuaz su",
        },
        {
          name: "Ishak Paşa Sarayı, Ağrı",
          landmarks: "Osmanlı sarayı, Ağrı Dağı manzarası",
          environment: "tarihi saray, karlı dağ, Doğu Anadolu",
        },
        {
          name: "Ani Harabeleri, Kars",
          landmarks: "antik şehir kalıntıları, kiliseler",
          environment: "sınır bölgesi, tarihi kalıntılar, boş şehir",
        },
        {
          name: "Erzurum Kalesi, Erzurum",
          landmarks: "tarihi kale, Çifte Minareli Medrese",
          environment: "kış şehri, Selçuklu eserleri, dağlar",
        },
      ];

      // Pozlar
      const poses = [
        {
          pose: "standing relaxed near a landmark",
          body: "one hip slightly shifted to the side, one leg casually bent, shoulders relaxed, natural confident posture",
        },
        {
          pose: "walking confidently down the street",
          body: "mid-stride position, arms swinging naturally, head held high, dynamic movement",
        },
        {
          pose: "sitting casually on steps or bench",
          body: "legs crossed or extended, leaning slightly back, relaxed arm placement, casual elegance",
        },
        {
          pose: "leaning against a wall or railing",
          body: "one shoulder against surface, arms crossed or one hand in pocket, relaxed stance",
        },
        {
          pose: "looking over shoulder at camera",
          body: "body turned away, head turned back, mysterious and engaging expression",
        },
        {
          pose: "hands in pockets, casual stance",
          body: "weight on one leg, relaxed shoulders, approachable demeanor",
        },
        {
          pose: "adjusting hair or accessories",
          body: "one hand near face or hair, natural candid moment, soft expression",
        },
        {
          pose: "holding coffee cup or phone",
          body: "natural grip, slight smile, lifestyle moment",
        },
      ];

      // Kıyafetler
      const outfits = {
        female: [
          "elegant summer dress with sandals",
          "fitted jeans and stylish blouse",
          "casual chic blazer with high-waisted pants",
          "trendy crop top and wide-leg trousers",
          "bohemian maxi skirt with simple top",
          "athleisure outfit with sneakers",
        ],
        male: [
          "fitted t-shirt and slim jeans",
          "casual button-up shirt with chinos",
          "smart casual blazer with dark jeans",
          "streetwear hoodie and joggers",
          "polo shirt and tailored shorts",
          "leather jacket with simple tee",
        ],
        other: [
          "modern minimalist outfit",
          "casual streetwear ensemble",
          "smart casual mix",
          "trendy urban style",
          "comfortable yet stylish look",
          "contemporary fashion-forward outfit",
        ],
      };

      // Rastgele seçim
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      const randomPose = poses[Math.floor(Math.random() * poses.length)];
      const genderKey = gender || "other";
      const outfitList = outfits[genderKey];
      const randomOutfit =
        outfitList[Math.floor(Math.random() * outfitList.length)];

      const characterRef = characterName
        ? `[${characterName}]`
        : "[Your Character]";

      const prompt = `Recreate ${characterRef} ${randomPose.pose} in ${randomLocation.name}, with ${randomLocation.landmarks}, preserving natural urban realism.

Pose & Body:
– ${randomPose.body}
– head slightly tilted
– gaze directed toward the camera
– realistic body proportions, no exaggeration

Framing & Composition (VERY IMPORTANT):
– full-body or three-quarter vertical framing
– camera at street-eye level
– subject positioned slightly off-center
– landmarks clearly visible in background
– subject occupies approximately 55–60% of the frame
– environment clearly readable
– no change in crop, zoom, or camera distance

Clothing (STYLE GUIDANCE – keep realistic):
– ${randomOutfit}
– colors complementing the environment
– no exaggerated fashion styling

Environment:
– ${randomLocation.name}
– ${randomLocation.landmarks}
– ${randomLocation.environment}
– authentic atmosphere

Lighting:
– natural daylight
– soft sunlight with mild shadows
– even illumination on subject
– no artificial or studio lighting
– no cinematic lighting effects

Camera Style:
– handheld smartphone street photography
– natural depth of field
– subject sharp, background slightly softer
– subtle phone lens perspective
– clean edges, no warping or distortion
– ultra-photorealistic, raw social-media realism`;

      return {
        success: true,
        prompt,
        location: randomLocation.name,
        pose: randomPose.pose,
        outfit: randomOutfit,
      };
    }),
});
