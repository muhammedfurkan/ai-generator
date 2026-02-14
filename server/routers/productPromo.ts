import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { productPromoVideos, users } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { generateVideo, getVideoStatus } from "../kieAiApi";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";
import { storagePut } from "../storage";

// Stil preset tanımları
const STYLE_PRESETS = {
  minimal_clean: {
    name: "Minimal Clean",
    nameTr: "Minimal Temiz",
    description: "Apple tarzı, beyaz arka plan, yumuşak kamera hareketi",
    credits: 90,
    promptTemplate: `Create a short vertical product promo video using the provided product image.
The product must remain IDENTICAL in shape, color, logo, and texture.
Style: Minimal Clean - white or soft neutral background, smooth slow camera motion, Apple-style product reveal.
Add soft lighting transitions and a premium advertising feel.
Camera: Slow push-in and gentle orbit around the product.
Mood: clean, modern, high-conversion, social-media optimized.
No distortion. No logo changes. No extra objects.`,
  },
  premium_luxury: {
    name: "Premium Luxury",
    nameTr: "Premium Lüks",
    description: "Koyu arka plan, parlak yansımalar, dramatik aydınlatma",
    credits: 135,
    promptTemplate: `Create a short vertical product promo video using the provided product image.
The product must remain IDENTICAL in shape, color, logo, and texture.
Style: Premium Luxury - dark background, glossy reflections, dramatic lighting.
Add cinematic camera movement with spotlight effects.
Camera: Dramatic reveal with slow orbit and light sweeps.
Mood: luxurious, exclusive, high-end, premium feel.
No distortion. No logo changes. No extra objects.`,
  },
  tech_futuristic: {
    name: "Tech / Futuristic",
    nameTr: "Teknoloji / Fütüristik",
    description: "Neon aksan, dijital ışık efektleri, modern teknoloji estetiği",
    credits: 135,
    promptTemplate: `Create a short vertical product promo video using the provided product image.
The product must remain IDENTICAL in shape, color, logo, and texture.
Style: Tech/Futuristic - subtle neon accents, digital light streaks, modern tech aesthetic.
Add holographic effects and digital particle animations around the product.
Camera: Dynamic angles with tech-inspired transitions.
Mood: innovative, cutting-edge, futuristic, high-tech.
No distortion. No logo changes. No extra objects.`,
  },
  social_viral: {
    name: "Social Media Viral",
    nameTr: "Sosyal Medya Viral",
    description: "Hızlı kesimler, enerjik kamera hareketi, cesur aydınlatma",
    credits: 90,
    promptTemplate: `Create a short vertical product promo video using the provided product image.
The product must remain IDENTICAL in shape, color, logo, and texture.
Style: Social Media Viral - faster cuts, energetic camera movement, bold lighting.
Add trendy transitions and eye-catching visual effects.
Camera: Quick zooms, dynamic angles, attention-grabbing movements.
Mood: energetic, trendy, viral-ready, scroll-stopping.
No distortion. No logo changes. No extra objects.`,
  },
};

type StylePreset = keyof typeof STYLE_PRESETS;

// Prompt oluşturucu
function generatePrompt(
  stylePreset: StylePreset,
  productName?: string | null,
  slogan?: string | null
): string {
  const style = STYLE_PRESETS[stylePreset];
  let prompt = style.promptTemplate;

  if (productName) {
    prompt += `\n\nProduct name to display: "${productName}"`;
  }
  if (slogan) {
    prompt += `\nSlogan/tagline: "${slogan}"`;
  }

  return prompt;
}

// Video işleme (background)
async function processPromoVideo(
  videoId: number,
  productImageUrl: string,
  prompt: string,
  userId: number,
  userEmail: string
) {
  console.log(`[Product Promo] Starting video generation for videoId=${videoId}`);

  const db = await getDb();
  if (!db) {
    console.error("[Product Promo] Database connection failed");
    return;
  }

  try {
    // Update status to processing
    await db.update(productPromoVideos)
      .set({ status: "processing" })
      .where(eq(productPromoVideos.id, videoId));

    // Generate video using Kie AI (Veo 3.1 Fast for image-to-video)
    const videoResult = await generateVideo({
      modelType: "veo3",
      generationType: "image-to-video",
      prompt,
      imageUrl: productImageUrl,
      aspectRatio: "9:16", // Vertical for social media
      quality: "fast", // Veo 3.1 Fast mode
    });

    if (!videoResult.taskId) {
      throw new Error("Video generation failed - no task ID");
    }

    // Update with task ID
    await db.update(productPromoVideos)
      .set({ taskId: videoResult.taskId })
      .where(eq(productPromoVideos.id, videoId));

    // Poll for completion
    const maxAttempts = 360; // 30 minutes max (Kie AI can be slow under load)
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log(`[Product Promo] Polling for videoId=${videoId}, taskId=${videoResult.taskId}, attempt=${attempts + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second intervals

      const status = await getVideoStatus(videoResult.taskId, "veo3");

      if (status.status === "completed" && status.videoUrl) {
        console.log(`[Product Promo] Video completed in ${attempts + 1} attempts, for videoId=${videoId}`);
        // Download and save to S3
        const videoResponse = await fetch(status.videoUrl);
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const s3Key = `product-promo/${userId}/${videoId}-${timestamp}-${randomSuffix}.mp4`;

        const { url: s3Url } = await storagePut(s3Key, videoBuffer, "video/mp4");

        // Update as completed
        await db.update(productPromoVideos)
          .set({
            status: "completed",
            generatedVideoUrl: s3Url,
            duration: 8, // Default duration
            completedAt: new Date(),
          })
          .where(eq(productPromoVideos.id, videoId));

        console.log(`[Product Promo] Video saved to S3 and DB: ${s3Url}`);
        return;
      }

      if (status.status === "failed") {
        console.error(`[Product Promo] Video generation failed for videoId=${videoId}: ${status.error}`);
        throw new Error(status.error || "Video generation failed");
      }

      attempts++;
    }

    console.error(`[Product Promo] Video generation timed out after ${maxAttempts} attempts for videoId=${videoId}`);
    throw new Error("Video generation timed out");

  } catch (error) {
    console.error(`[Product Promo] Error:`, error);

    await db.update(productPromoVideos)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(productPromoVideos.id, videoId));

    // Notify failure
    await notifyGenerationFailure({
      generationType: "video",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      userId,
      userEmail,
    });
  }
}

export const productPromoRouter = router({
  // Get style presets
  getStylePresets: publicProcedure.query(() => {
    return Object.entries(STYLE_PRESETS).map(([key, value]) => ({
      id: key,
      name: value.name,
      nameTr: value.nameTr,
      description: value.description,
      credits: value.credits,
    }));
  }),

  // Create promo video
  create: protectedProcedure
    .input(z.object({
      productImageUrl: z.string().url(),
      stylePreset: z.enum(["minimal_clean", "premium_luxury", "tech_futuristic", "social_viral"]),
      productName: z.string().max(200).optional(),
      slogan: z.string().max(300).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const userId = ctx.user.id;
      const userEmail = ctx.user.email || "";
      const styleConfig = STYLE_PRESETS[input.stylePreset];
      const creditsNeeded = styleConfig.credits;

      // Check credits
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. ${creditsNeeded} kredi gerekli, mevcut: ${user?.credits || 0}`,
        });
      }

      // Generate prompt
      const prompt = generatePrompt(input.stylePreset, input.productName, input.slogan);

      // Deduct credits
      await db.update(users)
        .set({ credits: user.credits - creditsNeeded })
        .where(eq(users.id, userId));

      // Create video record
      const [result] = await db.insert(productPromoVideos).values({
        userId,
        productImageUrl: input.productImageUrl,
        stylePreset: input.stylePreset,
        productName: input.productName || null,
        slogan: input.slogan || null,
        prompt,
        creditsCost: creditsNeeded,
        status: "pending",
      });

      const videoId = result.insertId;

      // Start background processing
      processPromoVideo(videoId, input.productImageUrl, prompt, userId, userEmail);

      // Notify credit spending
      await notifyCreditSpending({
        userName: user.name,
        userEmail: ctx.user.email || null,
        creditsSpent: creditsNeeded,
        creditsRemaining: user.credits - creditsNeeded,
        action: "Product Promo Video - " + styleConfig.nameTr,
      });

      return {
        videoId,
        creditsUsed: creditsNeeded,
        style: styleConfig.nameTr,
      };
    }),

  // Get video status
  getStatus: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [video] = await db.select()
        .from(productPromoVideos)
        .where(eq(productPromoVideos.id, input.videoId));

      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video bulunamadı" });
      }

      return {
        id: video.id,
        status: video.status,
        stylePreset: video.stylePreset,
        productName: video.productName,
        slogan: video.slogan,
        productImageUrl: video.productImageUrl,
        generatedVideoUrl: video.generatedVideoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        errorMessage: video.errorMessage,
        createdAt: video.createdAt,
        completedAt: video.completedAt,
      };
    }),

  // List user's promo videos
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const videos = await db.select()
        .from(productPromoVideos)
        .where(eq(productPromoVideos.userId, ctx.user.id))
        .orderBy(desc(productPromoVideos.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return videos.map(v => ({
        id: v.id,
        status: v.status,
        stylePreset: v.stylePreset,
        productName: v.productName,
        productImageUrl: v.productImageUrl,
        generatedVideoUrl: v.generatedVideoUrl,
        thumbnailUrl: v.thumbnailUrl,
        creditsCost: v.creditsCost,
        createdAt: v.createdAt,
      }));
    }),

  // Retry failed video
  retry: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [video] = await db.select()
        .from(productPromoVideos)
        .where(eq(productPromoVideos.id, input.videoId));

      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (video.status !== "failed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Sadece başarısız videolar yeniden denenebilir" });
      }

      // Reset status
      await db.update(productPromoVideos)
        .set({ status: "pending", errorMessage: null })
        .where(eq(productPromoVideos.id, input.videoId));

      // Restart processing
      processPromoVideo(
        video.id,
        video.productImageUrl,
        video.prompt,
        ctx.user.id,
        ctx.user.email || ""
      );

      return { success: true };
    }),

  // Delete promo video
  delete: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [video] = await db.select()
        .from(productPromoVideos)
        .where(eq(productPromoVideos.id, input.videoId));

      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video bulunamadı" });
      }

      await db.delete(productPromoVideos)
        .where(eq(productPromoVideos.id, input.videoId));

      return { success: true, message: "Video silindi" };
    }),
});
