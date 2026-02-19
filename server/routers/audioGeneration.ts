import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { minimaxTextToSpeech, MINIMAX_SYSTEM_VOICES } from "../minimaxApi";
import {
  elevenlabsTextToSpeech,
  elevenlabsListVoices,
  ELEVENLABS_MODELS,
  ELEVENLABS_DEFAULT_VOICES,
} from "../elevenlabsApi";
import { storagePut } from "../storage";
import { notifyCreditSpending } from "../telegramBot";

// ─── Credit pricing helpers ───────────────────────────────────────────────────

async function getAudioCreditCost(
  provider: "minimax" | "elevenlabs"
): Promise<number> {
  const key =
    provider === "minimax" ? "audio_tts_minimax" : "audio_tts_elevenlabs";
  return db.getFeaturePricingByKey(key, 10);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const audioGenerationRouter = router({
  // List available voices per provider
  getVoices: publicProcedure
    .input(
      z.object({
        provider: z.enum(["minimax", "elevenlabs"]),
      })
    )
    .query(async ({ input }) => {
      if (input.provider === "minimax") {
        return {
          voices: MINIMAX_SYSTEM_VOICES.map(v => ({
            voice_id: v.id,
            name: v.name,
            gender: v.gender,
            lang: v.lang,
          })),
        };
      }

      // ElevenLabs — try to fetch from API, fall back to defaults
      try {
        const voices = await elevenlabsListVoices(50);
        return {
          voices: voices.map(v => ({
            voice_id: v.voice_id,
            name: v.name,
            gender: v.labels?.["gender"] ?? "unknown",
            lang: v.labels?.["accent"] ?? "en",
          })),
        };
      } catch {
        return {
          voices: ELEVENLABS_DEFAULT_VOICES.map(v => ({
            voice_id: v.voice_id,
            name: v.name,
            gender: v.gender,
            lang: v.accent,
          })),
        };
      }
    }),

  // Get available TTS models
  getModels: publicProcedure
    .input(z.object({ provider: z.enum(["minimax", "elevenlabs"]) }))
    .query(({ input }) => {
      if (input.provider === "minimax") {
        return {
          models: [
            {
              id: "speech-2.8-hd",
              name: "Speech 2.8 HD",
              description: "En yüksek kalite",
            },
            {
              id: "speech-2.8-turbo",
              name: "Speech 2.8 Turbo",
              description: "Hızlı, yüksek kalite",
            },
            {
              id: "speech-02-hd",
              name: "Speech 02 HD",
              description: "Dengeli kalite",
            },
            {
              id: "speech-02-turbo",
              name: "Speech 02 Turbo",
              description: "Düşük gecikme",
            },
          ],
        };
      }
      return { models: ELEVENLABS_MODELS };
    }),

  // Get credit pricing
  getPricing: publicProcedure.query(async () => {
    const [minimax, elevenlabs] = await Promise.all([
      db.getFeaturePricingByKey("audio_tts_minimax", 10),
      db.getFeaturePricingByKey("audio_tts_elevenlabs", 10),
    ]);
    return { minimax, elevenlabs };
  }),

  // Generate TTS audio
  generate: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["minimax", "elevenlabs"]),
        text: z.string().min(1).max(3000),
        voiceId: z.string().min(1),
        model: z.string().optional(),
        language: z.string().optional(),
        speed: z.number().min(0.5).max(2).optional(),
        stability: z.number().min(0).max(1).optional(),
        similarityBoost: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if model is active / not in maintenance
      const modelKey = `${input.provider}-tts`;
      const modelCfg = await db.getAiModelConfig(modelKey);
      if (modelCfg) {
        if (!modelCfg.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu ses modeli şu anda kapalı.",
          });
        }
        if (modelCfg.isMaintenanceMode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu ses modeli şu anda bakımda.",
          });
        }
      }

      const creditCost = await getAudioCreditCost(input.provider);

      const user = await db.getUserById(userId);
      if (!user || user.credits < creditCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. Bu işlem için ${creditCost} kredi gerekiyor.`,
        });
      }

      const creditDeducted = await db.deductCredits(userId, creditCost);
      if (!creditDeducted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi düşürülemedi",
        });
      }

      // Create DB record in pending state
      const audioId = await db.createAudioGeneration({
        userId,
        text: input.text,
        provider: input.provider,
        model:
          input.model ??
          (input.provider === "minimax"
            ? "speech-02-hd"
            : "eleven_multilingual_v2"),
        voiceId: input.voiceId,
        language: input.language,
        speed: input.speed,
        creditsCost: creditCost,
      });

      try {
        let audioUrl: string;
        let durationMs = 0;

        if (input.provider === "minimax") {
          const result = await minimaxTextToSpeech({
            model: (input.model as "speech-2.8-hd") ?? "speech-02-hd",
            text: input.text,
            voice_setting: {
              voice_id: input.voiceId,
              speed: input.speed ?? 1.0,
            },
            language_boost: (input.language as "Turkish") ?? "auto",
            output_format: "url",
          });
          audioUrl = result.audioUrl;
          durationMs = result.durationMs;
        } else {
          // ElevenLabs — get Buffer, upload to storage
          const audioBuffer = await elevenlabsTextToSpeech(input.voiceId, {
            text: input.text,
            model_id:
              (input.model as "eleven_multilingual_v2") ??
              "eleven_multilingual_v2",
            voice_settings: {
              stability: input.stability ?? 0.5,
              similarity_boost: input.similarityBoost ?? 0.75,
              speed: input.speed ?? 1.0,
            },
            ...(input.language ? { language_code: input.language } : {}),
          });

          const filename = `audio/${userId}/${Date.now()}_tts.mp3`;
          const stored = await storagePut(filename, audioBuffer, "audio/mpeg");
          audioUrl = stored.url;
        }

        // Update DB record
        if (audioId) {
          await db.updateAudioGenerationStatus(audioId, "completed", {
            audioUrl,
            durationMs,
          });
        }

        // Notify admin
        notifyCreditSpending({
          userName: user.name,
          userEmail: user.email,
          creditsSpent: creditCost,
          creditsRemaining: user.credits - creditCost,
          action: `TTS üretimi (${input.provider}, ${input.voiceId})`,
        });

        return {
          success: true,
          audioId,
          audioUrl,
          durationMs,
          creditsCost: creditCost,
        };
      } catch (error) {
        // Refund on failure
        await db.refundCredits(
          userId,
          creditCost,
          `TTS üretimi başarısız - ${input.provider}`
        );
        if (audioId) {
          await db.updateAudioGenerationStatus(audioId, "failed", {
            errorMessage:
              error instanceof Error ? error.message : "Bilinmeyen hata",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Ses üretimi başarısız oldu.",
        });
      }
    }),

  // List user's audio generations
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
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const [items, totalCount] = await Promise.all([
        db.getUserAudioGenerations(userId, limit, offset),
        db.getUserAudioCount(userId),
      ]);

      return {
        items,
        totalCount,
        hasMore: offset + items.length < totalCount,
      };
    }),

  // Get single audio record
  getById: protectedProcedure
    .input(z.object({ audioId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const audio = await db.getAudioGenerationById(input.audioId);

      if (!audio || audio.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kayıt bulunamadı.",
        });
      }

      return audio;
    }),

  // Delete audio record
  delete: protectedProcedure
    .input(z.object({ audioId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const audio = await db.getAudioGenerationById(input.audioId);

      if (!audio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kayıt bulunamadı.",
        });
      }
      if (audio.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu kaydı silme yetkiniz yok.",
        });
      }

      const { getDb } = await import("../db");
      const { generatedAudio } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const dbConn = await getDb();

      if (!dbConn) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı.",
        });
      }

      await dbConn
        .delete(generatedAudio)
        .where(eq(generatedAudio.id, input.audioId));
      return { success: true };
    }),
});
