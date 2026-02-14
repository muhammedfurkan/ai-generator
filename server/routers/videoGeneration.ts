import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import {
  generateVideo,
  getVideoStatus,
  calculateVideoCreditCost,
  type UnifiedVideoModelType,
} from "../kieAiApi";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";

// Video model types
const videoModelSchema = z.enum([
  "veo3",
  "sora2", // Unified Sora 2 (normal + pro via quality)
  "kling",
  "kling-21",
  "kling-25",
  "grok",
  "kling-motion",
  "seedance-lite",
  "seedance-pro",
  "seedance-15-pro",
  "hailuo",
  "wan-26", // Unified Wan 2.6 (I2V, T2V, V2V via generationType)
  "seedream",
  "qwen",
  "qwen-video",
  "qwen-video-pro",
  "qwen-video-pro-4k"
]);
const generationTypeSchema = z.enum([
  "text-to-video",
  "image-to-video",
  "video-to-video",
]);

function mapModelTypeToPricingModel(modelType: string, quality?: string): string {
  const modelMap: Record<string, string> = {
    veo3: "veo3.1-fast", // Will be determined by quality
    // Sora 2: Use standard model unless quality is explicitly pro/high
    sora2: quality === "pro" || quality === "high" ? "sora-2-pro" : "sora-2",
    kling: "kling-2.6/text-to-video",
    "kling-21": "kling-2.1/text-to-video",
    "kling-25": "kling-2.5/text-to-video",
    "kling-motion": "kling-2.6-motion",
    grok: "grok-imagine/text-to-video",
    "seedance-lite": "seedance/1.0-lite",
    "seedance-pro": "seedance/1.0-pro",
    "seedance-15-pro": "seedance/1.5-pro",
    hailuo: "hailuo-2.3/text-to-video",
    "wan-26": "wan-2.6", // Unified Wan 2.6
  };
  return modelMap[modelType] || modelType;
}

type VideoCreditSettings = {
  veo3Fast: number;
  veo3Quality: number;
  veo3Fast4k: number;
  veo3Quality4k: number;
  grok: number;
  kling5s: number;
  kling5sAudio: number;
  kling10s: number;
  kling10sAudio: number;
  sora10s: number;
  sora15s: number;
  sora2Pro10s: number;
  sora2Pro15s: number;
  sora2Pro20s: number;
  sora2ProStoryboard: number;
  soraWatermarkRemover: number;
  kling21_5s: number;
  kling21_10s: number;
  kling25_5s: number;
  kling25_10s: number;
  seedanceLite3s: number;
  seedanceLite6s: number;
  seedancePro3s: number;
  seedancePro6s: number;
  seedance15Pro5s: number;
  seedance15Pro10s: number;
  hailuo6s: number;
  wan22_5s: number;
  wan22_10s: number;
  wan25_5s: number;
  wan25_10s: number;
  wan26_5s: number;
  wan26_10s: number;
};

function parseDurationSeconds(duration?: string, fallback = 5): number {
  if (!duration) return fallback;
  const match = duration.match(/\d+/);
  if (!match) return fallback;
  const parsed = parseInt(match[0], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function getVideoCreditSettings(): Promise<VideoCreditSettings> {
  const { getFeaturePricingByKey } = await import("../db");
  return {
    veo3Fast: await getFeaturePricingByKey("video_veo3_fast", 50),
    veo3Quality: await getFeaturePricingByKey("video_veo3_quality", 75),
    veo3Fast4k: await getFeaturePricingByKey("video_veo3_fast_4k", 100),
    veo3Quality4k: await getFeaturePricingByKey("video_veo3_quality_4k", 150),
    grok: await getFeaturePricingByKey("video_grok_standard", 15),
    kling5s: await getFeaturePricingByKey("video_kling_5s", 45),
    kling5sAudio: await getFeaturePricingByKey("video_kling_5s_audio", 90),
    kling10s: await getFeaturePricingByKey("video_kling_10s", 75),
    kling10sAudio: await getFeaturePricingByKey("video_kling_10s_audio", 150),
    sora10s: await getFeaturePricingByKey("video_sora_10s", 24),
    sora15s: await getFeaturePricingByKey("video_sora_15s", 30),
    sora2Pro10s: await getFeaturePricingByKey("video_sora2_pro_10s", 40),
    sora2Pro15s: await getFeaturePricingByKey("video_sora2_pro_15s", 50),
    sora2Pro20s: await getFeaturePricingByKey("video_sora2_pro_20s", 65),
    sora2ProStoryboard: await getFeaturePricingByKey(
      "video_sora2_pro_storyboard",
      80
    ),
    soraWatermarkRemover: await getFeaturePricingByKey(
      "video_sora_watermark_remover",
      20
    ),
    kling21_5s: await getFeaturePricingByKey("video_kling21_5s", 35),
    kling21_10s: await getFeaturePricingByKey("video_kling21_10s", 60),
    kling25_5s: await getFeaturePricingByKey("video_kling25_5s", 40),
    kling25_10s: await getFeaturePricingByKey("video_kling25_10s", 70),
    seedanceLite3s: await getFeaturePricingByKey("video_seedance_lite_3s", 20),
    seedanceLite6s: await getFeaturePricingByKey("video_seedance_lite_6s", 35),
    seedancePro3s: await getFeaturePricingByKey("video_seedance_pro_3s", 30),
    seedancePro6s: await getFeaturePricingByKey("video_seedance_pro_6s", 50),
    seedance15Pro5s: await getFeaturePricingByKey("video_seedance_15_pro_5s", 55),
    seedance15Pro10s: await getFeaturePricingByKey(
      "video_seedance_15_pro_10s",
      95
    ),
    hailuo6s: await getFeaturePricingByKey("video_hailuo_6s", 25),
    wan22_5s: await getFeaturePricingByKey("video_wan22_5s", 30),
    wan22_10s: await getFeaturePricingByKey("video_wan22_10s", 55),
    wan25_5s: await getFeaturePricingByKey("video_wan25_5s", 35),
    wan25_10s: await getFeaturePricingByKey("video_wan25_10s", 60),
    wan26_5s: await getFeaturePricingByKey("video_wan26_5s", 40),
    wan26_10s: await getFeaturePricingByKey("video_wan26_10s", 70),
  };
}

function estimateVideoCreditsFromSettings(
  input: {
    modelType: string;
    duration?: string;
    hasAudio?: boolean;
    quality?: string;
    resolution?: string;
    feature?: string;
  },
  settings: VideoCreditSettings
): number {
  const durationSec = parseDurationSeconds(input.duration, 5);
  const quality = input.quality || "standard";
  const resolution = (input.resolution || "720p").toLowerCase();
  const hasAudio = Boolean(input.hasAudio);
  const isProQuality =
    quality === "pro" || quality === "high" || quality === "quality";

  switch (input.modelType) {
    case "veo3": {
      const is4k =
        quality === "fast-4k" ||
        quality === "quality-4k" ||
        resolution === "4k";
      const wantsQuality = quality === "quality" || isProQuality;
      if (is4k) {
        return wantsQuality ? settings.veo3Quality4k : settings.veo3Fast4k;
      }
      return wantsQuality ? settings.veo3Quality : settings.veo3Fast;
    }
    case "sora2": {
      if (input.feature === "watermark-remover") {
        return settings.soraWatermarkRemover;
      }
      if (input.feature === "storyboard") {
        return settings.sora2ProStoryboard;
      }
      if (isProQuality) {
        if (durationSec >= 20) return settings.sora2Pro20s;
        if (durationSec >= 15) return settings.sora2Pro15s;
        return settings.sora2Pro10s;
      }
      return durationSec >= 15 ? settings.sora15s : settings.sora10s;
    }
    case "kling":
      if (durationSec >= 10) {
        return hasAudio ? settings.kling10sAudio : settings.kling10s;
      }
      return hasAudio ? settings.kling5sAudio : settings.kling5s;
    case "kling-21":
      return durationSec >= 10 ? settings.kling21_10s : settings.kling21_5s;
    case "kling-25":
      return durationSec >= 10 ? settings.kling25_10s : settings.kling25_5s;
    case "grok":
      return settings.grok;
    case "seedance-lite":
      return durationSec >= 6 ? settings.seedanceLite6s : settings.seedanceLite3s;
    case "seedance-pro":
      return durationSec >= 6 ? settings.seedancePro6s : settings.seedancePro3s;
    case "seedance-15-pro":
      return durationSec >= 10
        ? settings.seedance15Pro10s
        : settings.seedance15Pro5s;
    case "hailuo":
      return settings.hailuo6s;
    case "wan-22":
      return durationSec >= 10 ? settings.wan22_10s : settings.wan22_5s;
    case "wan-25":
      return durationSec >= 10 ? settings.wan25_10s : settings.wan25_5s;
    case "wan-26":
      return durationSec >= 10 ? settings.wan26_10s : settings.wan26_5s;
    default: {
      const pricingModel = mapModelTypeToPricingModel(input.modelType, input.quality);
      return calculateVideoCreditCost(pricingModel, {
        duration: `${durationSec}`,
        sound: input.hasAudio,
        quality: input.quality,
        resolution: input.resolution,
      });
    }
  }
}

export const videoGenerationRouter = router({
  // Get pricing info for all models
  getPricing: publicProcedure.query(async () => {
    const pricing = await getVideoCreditSettings();

    return {
      veo3: {
        name: "Veo 3.1",
        description: "Google'ın en gelişmiş video modeli",
        options: [
          {
            label: "Hızlı (Otomatik)",
            value: "fast",
            credits: pricing.veo3Fast,
            duration: "auto",
            quality: "fast",
          },
          {
            label: "Kalite (Otomatik)",
            value: "quality",
            credits: pricing.veo3Quality,
            duration: "auto",
            quality: "quality",
          },
        ],
        aspectRatios: ["16:9", "9:16"],
        supportsImageToVideo: true,
        supportsReferenceVideo: true,
      },
      kling: {
        name: "Kling 2.6",
        description: "Kuaishou'nun native audio destekli video modeli",
        options: [
          {
            label: "5 Saniye",
            value: "5s",
            credits: pricing.kling5s,
            duration: "5s",
          },
          {
            label: "10 Saniye",
            value: "10s",
            credits: pricing.kling10s,
            duration: "10s",
          },
        ],
        aspectRatios: ["1:1", "9:16", "16:9"],
        supportsImageToVideo: true,
        hasAudioSupport: true,
      },
      sora2: {
        name: "Sora 2",
        description: "OpenAI video modeli (Normal & Pro)",
        options: [
          {
            label: "Standard 10s",
            value: "standard",
            quality: "standard",
            credits: pricing.sora10s,
            duration: "10s",
          },
          {
            label: "Pro 10s",
            value: "pro",
            quality: "pro",
            credits: pricing.sora2Pro10s,
            duration: "10s",
          },
          {
            label: "Standard 15s",
            value: "standard-15s",
            quality: "standard",
            credits: pricing.sora15s,
            duration: "15s",
          },
          {
            label: "Pro 15s",
            value: "pro-15s",
            quality: "pro",
            credits: pricing.sora2Pro15s,
            duration: "15s",
          },
        ],
        aspectRatios: ["16:9", "9:16", "1:1"],
        supportsImageToVideo: true,
        hasAudioSupport: false,
      },
      "wan-26": {
        name: "Wan 2.6",
        description: "Alibaba 1080p multi-shot video (T2V, I2V, V2V)",
        options: [
          {
            label: "5 Saniye",
            value: "5s",
            credits: pricing.wan26_5s,
            duration: "5s",
          },
          {
            label: "10 Saniye",
            value: "10s",
            credits: pricing.wan26_10s,
            duration: "10s",
          },
        ],
        aspectRatios: ["16:9", "9:16"],
        supportsImageToVideo: true,
        supportsVideoToVideo: true,
        hasMultiShotSupport: true,
        supportedResolutions: ["720p", "1080p"],
      },
      "seedance-15-pro": {
        name: "Seedance 1.5 Pro",
        description: "ByteDance sinema kalitesi video",
        options: [
          {
            label: "5 Saniye",
            value: "5s",
            credits: pricing.seedance15Pro5s,
            duration: "5s",
          },
          {
            label: "10 Saniye",
            value: "10s",
            credits: pricing.seedance15Pro10s,
            duration: "10s",
          },
        ],
        aspectRatios: ["16:9", "9:16", "1:1"],
        supportsImageToVideo: true,
        hasAudioSupport: true,
        supportedResolutions: ["720p", "1080p"],
      },
      hailuo: {
        name: "Hailuo 2.3",
        description: "MiniMax yüksek kaliteli video",
        options: [
          {
            label: "6 Saniye",
            value: "6s",
            credits: pricing.hailuo6s,
            duration: "6s",
          },
        ],
        aspectRatios: ["16:9", "9:16", "1:1"],
        supportsImageToVideo: true,
      },
    };
  }),

  estimateCreditCost: publicProcedure
    .input(
      z.object({
        modelType: z.string().min(1),
        duration: z.string().optional(),
        hasAudio: z.boolean().optional(),
        feature: z
          .enum(["default", "characters", "watermark-remover", "storyboard"])
          .optional(),
        quality: z
          .enum([
            "fast",
            "standard",
            "high",
            "pro",
            "quality",
            "fast-4k",
            "quality-4k",
            "turbo",
          ])
          .optional(),
        resolution: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const settings = await getVideoCreditSettings();
      const hasAudio = input.modelType === "sora2" ? false : input.hasAudio;
      const credits = estimateVideoCreditsFromSettings({
        modelType: input.modelType,
        duration: input.duration,
        hasAudio,
        feature: input.feature,
        quality: input.quality,
        resolution: input.resolution,
      }, settings);

      return { credits };
    }),

  // Generate video
  generate: protectedProcedure
    .input(
      z.object({
        modelType: videoModelSchema,
        generationType: generationTypeSchema,
        prompt: z.string().min(1).max(2500),
        imageUrl: z.string().url().optional(), // Geriye uyumluluk
        imageUrls: z.array(z.string().url()).max(8).optional(), // Çoklu görsel desteği (Veo 3.1, Nano Banana Pro)
        videoUrl: z.string().url().optional(),
        aspectRatio: z.string().optional(),
        duration: z.string().optional(),
        hasAudio: z.boolean().optional(),
        quality: z
          .enum([
            "fast",
            "standard",
            "high",
            "pro",
            "quality",
            "fast-4k",
            "quality-4k",
            "turbo",
          ])
          .optional(),
        resolution: z.string().optional(), // ✨ NEW: Resolution support (480p, 720p, 1080p, 4K)
        characterOrientation: z.enum(["image", "video"]).optional(),
        feature: z
          .enum(["default", "characters", "watermark-remover", "storyboard"])
          .optional(), // ✨ Sora 2 features
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const hasAudio = input.modelType === "sora2" ? false : input.hasAudio;

      // Calculate credit cost using admin-configured pricing keys.
      const settings = await getVideoCreditSettings();
      const creditCost = estimateVideoCreditsFromSettings({
        modelType: input.modelType,
        duration: input.duration,
        hasAudio,
        feature: input.feature,
        quality: input.quality,
        resolution: input.resolution,
      }, settings);

      // Check user credits
      const user = await db.getUserById(userId);
      if (!user || user.credits < creditCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. Bu işlem için ${creditCost} kredi gerekiyor.`,
        });
      }

      // Validate image-to-video has image (single or multiple)
      if (
        input.generationType === "image-to-video" &&
        !input.imageUrl &&
        (!input.imageUrls || input.imageUrls.length === 0)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Image-to-video için en az bir görsel URL'si gerekli.",
        });
      }

      if (input.generationType === "video-to-video" && !input.videoUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video-to-video için bir video URL'si gerekli.",
        });
      }

      // Deduct credits BEFORE API call
      const creditDeducted = await db.deductCredits(userId, creditCost);
      if (!creditDeducted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi düşürülemedi",
        });
      }

      try {
        // Call Kie AI API
        const result = await generateVideo({
          modelType: input.modelType,
          generationType: input.generationType,
          prompt: input.prompt,
          imageUrl: input.imageUrl,
          videoUrl: input.videoUrl,
          aspectRatio: input.aspectRatio,
          duration: input.duration,
          sound: hasAudio,
          quality: input.quality,
          resolution: input.resolution, // ✨ NEW: Pass resolution
          characterOrientation: input.characterOrientation,
          feature: input.feature, // ✨ NEW: Pass Sora 2 feature
        });

        // Parse duration from string format (e.g., "5s", "10s", "auto") to number
        const parseDuration = (durationStr?: string): number => {
          if (!durationStr) return 5; // Default 5 seconds
          if (durationStr === "auto") return 5; // Default for auto
          const match = durationStr.match(/(\d+)/);
          return match ? parseInt(match[1]) : 5;
        };

        // Save to database
        const videoId = await db.createVideoGeneration({
          userId,
          prompt: input.prompt,
          referenceImageUrl: input.imageUrl,
          model: input.modelType,
          mode: input.generationType,
          duration: parseDuration(input.duration),
          quality: input.quality,
          hasAudio,
          creditsCost: creditCost,
          taskId: result.taskId,
        });

        // Notify admin about credit spending
        notifyCreditSpending({
          userName: user.name,
          userEmail: user.email,
          creditsSpent: creditCost,
          creditsRemaining: user.credits - creditCost,
          action: `Video oluşturma (${input.modelType}, ${input.generationType}, ${input.duration || "5"}s)`,
        });

        return {
          success: true,
          videoId,
          taskId: result.taskId,
          creditsCost: creditCost,
        };
      } catch (error) {
        // Refund credits if video generation failed
        console.error(
          "[VideoGeneration] Error occurred, refunding credits:",
          error
        );
        await db.refundCredits(
          userId,
          creditCost,
          `Video oluşturma başarısız - ${input.modelType}`
        );

        // Telegram'a hata bildirimi gönder
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        notifyGenerationFailure({
          generationType: "video",
          errorMessage,
          userId,
          userEmail: user?.email || undefined,
          prompt: input.prompt,
          creditsRefunded: creditCost,
        });

        // Update stats
        await db.updateAiModelStats(input.modelType, false, 0);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Video oluşturma başarısız oldu.",
        });
      }
    }),

  // Check video status
  checkStatus: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const video = await db.getVideoGenerationById(input.videoId);

      if (!video || video.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video bulunamadı.",
        });
      }

      // If already completed or failed, return from database
      if (video.status === "completed" || video.status === "failed") {
        return {
          status: video.status,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          errorMessage: video.errorMessage,
        };
      }

      // Check status from Kie AI
      if (video.taskId) {
        try {
          const modelType = video.model as UnifiedVideoModelType;
          const status = await getVideoStatus(video.taskId, modelType);

          // Update database if status changed
          if (status.status !== video.status) {
            await db.updateVideoGenerationStatus(video.id, status.status, {
              videoUrl: status.videoUrl,
              errorMessage: status.error,
            });

            // Refund credits if video generation failed
            if (status.status === "failed" && video.creditsCost > 0) {
              console.log(
                `[VideoGeneration] Video ${video.id} failed, refunding ${video.creditsCost} credits to user ${userId}`
              );
              await db.refundCredits(
                userId,
                video.creditsCost,
                `Video oluşturma başarısız - ${video.model}`
              );
            }

            // Update stats
            if (status.status === "completed" || status.status === "failed") {
              const duration = Date.now() - new Date(video.createdAt).getTime();
              await db.updateAiModelStats(
                video.model,
                status.status === "completed",
                duration
              );
            }
          }

          return {
            status: status.status,
            videoUrl: status.videoUrl,
            errorMessage: status.error,
            refunded: status.status === "failed" && video.creditsCost > 0,
          };
        } catch (error) {
          console.error("[VideoGeneration] Status check failed:", error);
          return {
            status: video.status,
            videoUrl: video.videoUrl,
            errorMessage: video.errorMessage,
          };
        }
      }

      return {
        status: video.status,
        videoUrl: video.videoUrl,
        errorMessage: video.errorMessage,
      };
    }),

  // Get user's videos
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const limit = input?.limit || 50;
      const offset = input?.offset || 0;

      const videos = await db.getUserVideoGenerations(userId, limit, offset);
      const totalCount = await db.getUserVideoCount(userId);

      return {
        videos,
        totalCount,
        hasMore: offset + videos.length < totalCount,
      };
    }),

  // Get single video details
  getById: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const video = await db.getVideoGenerationById(input.videoId);

      if (!video || video.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video bulunamadı.",
        });
      }

      return video;
    }),

  // Delete a video
  delete: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const video = await db.getVideoGenerationById(input.videoId);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video bulunamadı",
        });
      }

      if (video.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu videoyu silme yetkiniz yok",
        });
      }

      // Delete from database
      const { getDb } = await import("../db");
      const dbConn = await getDb();
      if (!dbConn) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      const { videoGenerations } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      await dbConn
        .delete(videoGenerations)
        .where(eq(videoGenerations.id, input.videoId));

      return { success: true, message: "Video silindi" };
    }),

  // AI Viral Video Prompt Üretici
  generateViralPrompt: protectedProcedure
    .input(
      z.object({
        model: z.enum(["sora2", "veo3"]),
      })
    )
    .mutation(async ({ input }) => {
      const { invokeLLM } = await import("../_core/llm");

      const systemPrompt = `Sen profesyonel bir Viral Video Prompt Mühendisisin.
Görevin: ${input.model === "sora2" ? "Sora 2" : "Veo 3.1"} için kullanılabilir, Türkçe, Türkiye'de geçen, TikTok'ta viral olma potansiyeli yüksek video promptları üretmek.

🎯 GENEL KURALLAR (ZORUNLU)
1. Her çalıştırmada TAMAMEN FARKLI bir senaryo üret
2. Videolar:
   - Türkiye'de geçmeli
   - Türk kültürü, gündemi veya sosyal hayat hissi vermeli
3. Dil:
   - %100 Türkçe
   - Günlük, doğal, TikTok dili
4. Format:
   - 9:16 (dikey)
   - 6–12 saniye arası
5. Stil:
   - TikTok / Reels / Shorts uyumlu
   - Viral, dikkat çekici, merak uyandıran
6. Gerçek kişi taklidi yapma
7. Şiddet, nefret, yasa dışı içerik YOK

🧩 ÜRETİLECEK PROMPT YAPISI (SABİT FORMAT)

Her çıktı TEK BLOK ve kopyalanabilir olmalı:

[${input.model === "sora2" ? "SORA 2" : "VEO 3.1"} VIDEO PROMPT]

Sahne:
...

Karakterler:
...

Ortam & Mekan:
...

Aksiyon:
...

Diyalog / Ses (Türkçe):
...

Kamera & Stil:
...

Işık & Atmosfer:
...

Viral Unsur:
...

Süre:
...

Aspect Ratio:
9:16

Platform:
TikTok

🎲 ÜRETİLEBİLECEK VİRAL KATEGORİLER
(Rastgele 1 veya 2 kategori seç):
- Sokak röportajı hissi
- WhatsApp / DM konuşması canlanıyor gibi
- Günlük hayat + beklenmedik twist
- Kıskançlık / flört / ilişki anı
- "Bir anda olan" komik olay
- Influencer tarzı POV video
- Fake değil ama temsili sosyal medya anı
- Türkiye'ye özgü diyaloglu sahne
- Mahalle / kafe / AVM / sahil / sokak
- "Durduk yere viral olacak" an

🎥 STİL TALİMATI (ÇOK ÖNEMLİ)
- Kamera: iPhone hissi, hafif sallantılı (doğal)
- Kurgu: Hızlı giriş, ilk 2 saniye dikkat çekici olmalı
- Ses: Doğal Türkçe konuşma, sokak/ortam sesi olabilir
- Abartı YOK, gerçekçilik yüksek

📍 MEKAN ÇEŞİTLENDİRME
İstanbul, Ankara, İzmir, sahil, mahalle, kafe, AVM, üniversite, toplu taşıma

🗣️ DİYALOG TONU
Komik, gerilimli, flörtöz, utandırıcı, şaşırtıcı

SADECE hazır prompt üret. Açıklama, analiz, yorum YOK.`;

      const userPrompt = `Şimdi ${input.model === "sora2" ? "Sora 2" : "Veo 3.1"} için yeni bir viral video promptu üret. Tamamen farklı ve yaratıcı bir senaryo olsun.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const generatedPrompt = response.choices[0]?.message?.content || "";

        return {
          success: true,
          prompt: generatedPrompt,
        };
      } catch (error) {
        console.error("[VideoGeneration] AI prompt generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Prompt üretilirken bir hata oluştu",
        });
      }
    }),
});
