import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { minimaxGenerateMusic } from "../minimaxApi";
import { notifyCreditSpending } from "../telegramBot";

// ─── Credit pricing helpers ───────────────────────────────────────────────────

async function getMusicCreditCost(): Promise<number> {
  return db.getFeaturePricingByKey("audio_music_minimax", 20);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const musicGenerationRouter = router({
  // Get credit pricing
  getPricing: publicProcedure.query(async () => {
    const credits = await getMusicCreditCost();
    return { credits, model: "music-2.5", provider: "minimax" };
  }),

  // Generate music from lyrics + optional style prompt
  generate: protectedProcedure
    .input(
      z.object({
        lyrics: z.string().min(1).max(3500),
        prompt: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if model is active / not in maintenance
      const modelCfg = await db.getAiModelConfig("minimax-music");
      if (modelCfg) {
        if (!modelCfg.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu müzik modeli şu anda kapalı.",
          });
        }
        if (modelCfg.isMaintenanceMode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu müzik modeli şu anda bakımda.",
          });
        }
      }

      const creditCost = await getMusicCreditCost();

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
      const musicId = await db.createMusicGeneration({
        userId,
        lyrics: input.lyrics,
        prompt: input.prompt,
        model: "music-2.5",
        creditsCost: creditCost,
      });

      try {
        const result = await minimaxGenerateMusic({
          model: "music-2.5",
          lyrics: input.lyrics,
          prompt: input.prompt,
          output_format: "url",
        });

        // Update DB record
        if (musicId) {
          await db.updateMusicGenerationStatus(musicId, "completed", {
            audioUrl: result.audioUrl,
            durationMs: result.durationMs,
          });
        }

        // Notify admin
        notifyCreditSpending({
          userName: user.name,
          userEmail: user.email,
          creditsSpent: creditCost,
          creditsRemaining: user.credits - creditCost,
          action: "Müzik üretimi (Minimax music-2.5)",
        });

        return {
          success: true,
          musicId,
          audioUrl: result.audioUrl,
          durationMs: result.durationMs,
          creditsCost: creditCost,
        };
      } catch (error) {
        // Refund on failure
        await db.refundCredits(
          userId,
          creditCost,
          "Müzik üretimi başarısız - Minimax"
        );
        if (musicId) {
          await db.updateMusicGenerationStatus(musicId, "failed", {
            errorMessage:
              error instanceof Error ? error.message : "Bilinmeyen hata",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Müzik üretimi başarısız oldu.",
        });
      }
    }),

  // List user's music generations
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
        db.getUserMusicGenerations(userId, limit, offset),
        db.getUserMusicCount(userId),
      ]);

      return {
        items,
        totalCount,
        hasMore: offset + items.length < totalCount,
      };
    }),

  // Get single music record
  getById: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const music = await db.getMusicGenerationById(input.musicId);

      if (!music || music.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kayıt bulunamadı.",
        });
      }

      return music;
    }),

  // Delete music record
  delete: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const music = await db.getMusicGenerationById(input.musicId);

      if (!music) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kayıt bulunamadı.",
        });
      }
      if (music.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu kaydı silme yetkiniz yok.",
        });
      }

      const { getDb } = await import("../db");
      const { generatedMusic } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const dbConn = await getDb();

      if (!dbConn) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı.",
        });
      }

      await dbConn
        .delete(generatedMusic)
        .where(eq(generatedMusic.id, input.musicId));
      return { success: true };
    }),
});
