import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import * as db from "../db";
import {
  upscaleHistory,
  users,
  creditTransactions,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  upscaleImage,
  getUpscaleStatus,
  calculateUpscaleCreditCost,
  type UpscaleFactor,
} from "../kieAiApi";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";

// Helper function to download image and upload to S3
async function downloadAndUploadToS3(
  imageUrl: string,
  userId: number
): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `upscale/${userId}/${timestamp}-${randomSuffix}.png`;

  const { url } = await storagePut(fileKey, buffer, "image/png");
  return url;
}

export const upscaleRouter = router({
  // Create upscale task
  create: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        upscaleFactor: z.enum(["1", "2", "4", "8"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { imageUrl, upscaleFactor } = input;

      // Calculate credit cost
      const creditCost = calculateUpscaleCreditCost(
        upscaleFactor as UpscaleFactor
      );

      // Check user credits
      const user = await db.getUserById(userId);
      if (!user || user.credits < creditCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `INSUFFICIENT_CREDITS|Yetersiz kredi. Gerekli: ${creditCost}, Mevcut: ${user?.credits || 0}`,
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

      // Record transaction
      await db.recordCreditTransaction(
        userId,
        "deduct",
        creditCost,
        `Görsel upscale (${upscaleFactor}x)`
      );

      try {
        // Create upscale task
        const result = await upscaleImage({
          imageUrl,
          upscaleFactor: upscaleFactor as UpscaleFactor,
        });

        // Save to history
        const historyId = await db.createUpscaleHistory({
          userId,
          originalImageUrl: imageUrl,
          upscaleFactor,
          creditsCost: creditCost,
          status: "processing",
          taskId: result.taskId,
        });

        // Get updated user credits
        const updatedUser = await db.getUserById(userId);

        // Notify admin about credit spending
        notifyCreditSpending({
          userName: user?.name || null,
          userEmail: user?.email || null,
          creditsSpent: creditCost,
          creditsRemaining: updatedUser?.credits || 0,
          action: `Görsel Upscale (${upscaleFactor}x)`,
        });

        return {
          id: historyId,
          taskId: result.taskId,
          creditCost,
          remainingCredits: updatedUser?.credits || 0,
        };
      } catch (error) {
        // Refund credits if upscale failed
        console.error("[Upscale] Error occurred, refunding credits:", error);
        await db.refundCredits(
          userId,
          creditCost,
          `Upscale başarısız - ${upscaleFactor}x`
        );

        // Telegram'a hata bildirimi gönder
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        notifyGenerationFailure({
          generationType: "upscale",
          errorMessage,
          userId,
          userEmail: user?.email || undefined,
          creditsRefunded: creditCost,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Upscale işlemi başarısız oldu.",
        });
      }
    }),

  // Check upscale status
  checkStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { taskId } = input;

      // Get history record
      const record = await db.getUpscaleHistoryByTaskId(taskId, userId);

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upscale kaydı bulunamadı",
        });
      }

      // If already completed or failed, return cached result
      if (record.status === "completed" || record.status === "failed") {
        return {
          status: record.status,
          imageUrl: record.upscaledImageUrl,
          error: record.errorMessage,
        };
      }

      // Check status from API
      const statusResult = await getUpscaleStatus(taskId);

      // Update database based on status
      if (statusResult.status === "completed" && statusResult.imageUrl) {
        // Download and upload to S3
        const s3Url = await downloadAndUploadToS3(
          statusResult.imageUrl,
          userId
        );

        await db.updateUpscaleHistory(record.id, {
          status: "completed",
          upscaledImageUrl: s3Url,
          completedAt: new Date(),
        });

        return {
          status: "completed" as const,
          imageUrl: s3Url,
        };
      } else if (statusResult.status === "failed") {
        await db.updateUpscaleHistory(record.id, {
          status: "failed",
          errorMessage: statusResult.error,
        });

        // Refund credits if upscale failed
        if (record.creditsCost > 0) {
          console.log(
            `[Upscale] Task ${taskId} failed, refunding ${record.creditsCost} credits to user ${userId}`
          );
          await db.refundCredits(
            userId,
            record.creditsCost,
            `Upscale başarısız - ${record.upscaleFactor}x`
          );
        }

        return {
          status: "failed" as const,
          error: statusResult.error,
          refunded: record.creditsCost > 0,
        };
      }

      return {
        status: statusResult.status,
      };
    }),

  // Get upscale history
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { limit = 20, offset = 0 } = input || {};

      const records = await db.getUpscaleHistoryList(userId, limit, offset);
      return records;
    }),

  // Get single upscale record
  get: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id } = input;

      const record = await db.getUpscaleHistoryById(id, userId);

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upscale kaydı bulunamadı",
        });
      }

      return record;
    }),

  // Get pricing info
  getPricing: publicProcedure.query(() => {
    return {
      "1": { factor: "1x", credits: 15, description: "Kalite iyileştirme" },
      "2": { factor: "2x", credits: 15, description: "2K çözünürlük" },
      "4": { factor: "4x", credits: 30, description: "4K çözünürlük" },
      "8": { factor: "8x", credits: 60, description: "8K çözünürlük" },
    };
  }),
});
