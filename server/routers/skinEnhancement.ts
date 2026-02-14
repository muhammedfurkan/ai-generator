import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { skinEnhancementJobs, users, creditTransactions } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { deductCredits, getUserById, recordCreditTransaction } from "../db";
import { generateImage } from "../_core/imageGeneration";

// Enhancement modes with their specific prompts and settings
const ENHANCEMENT_MODES = {
  natural_clean: {
    name: "Natural Clean",
    description: "Subtle skin tone uniformity, minimal noise reduction",
    prompt: "Enhance skin quality naturally. Improve skin tone uniformity and lighting balance while preserving all natural texture, pores, freckles, and imperfections. Do not change face shape, body proportions, or remove skin texture. The result should look like a high-quality smartphone photo with natural lighting. No filters, no plastic look, no over-smoothing.",
    creditCost: 20,
  },
  soft_glow: {
    name: "Soft Glow",
    description: "Gentle luminosity, balanced lighting",
    prompt: "Add subtle luminosity to skin while maintaining complete natural texture. Enhance lighting balance for a soft, healthy glow. Preserve all pores, freckles, and natural skin imperfections. Do not alter face shape or body proportions. Result should look like professional natural light photography, not a filter.",
    creditCost: 25,
  },
  studio_look: {
    name: "Studio Look",
    description: "Professional studio lighting simulation",
    prompt: "Apply professional studio lighting enhancement to skin. Improve micro texture clarity and lighting balance as if photographed in a professional studio. Maintain all natural skin texture, pores, and imperfections. Do not change facial features, body shape, or create artificial smoothness. The goal is camera-realistic, not beautification.",
    creditCost: 30,
  },
  no_makeup_real: {
    name: "No-Makeup Real",
    description: "Ultra-realistic, camera-quality enhancement",
    prompt: "Enhance skin to look like the best possible natural photo without any makeup. Focus on noise reduction and micro texture clarity while preserving every natural detail including pores, freckles, and skin imperfections. Do not alter face shape, body proportions, or create any artificial smoothness. The result must be indistinguishable from a high-quality camera photo.",
    creditCost: 25,
  },
} as const;

// Pro mode adds extra processing
const PRO_MODE_EXTRA_COST = 5;
const BATCH_COST = 50;

// Minimum resolution requirements
const MIN_WIDTH = 256;
const MIN_HEIGHT = 256;
const MAX_WIDTH = 4096;
const MAX_HEIGHT = 4096;

export const skinEnhancementRouter = router({
  // Get available enhancement modes
  getModes: publicProcedure.query(() => {
    return Object.entries(ENHANCEMENT_MODES).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      creditCost: value.creditCost,
    }));
  }),

  // Get pricing info
  getPricing: publicProcedure.query(() => {
    return {
      singleEnhancement: 20,
      batchEnhancement: 50,
      proModeExtra: 5,
      minResolution: { width: MIN_WIDTH, height: MIN_HEIGHT },
      maxResolution: { width: MAX_WIDTH, height: MAX_HEIGHT },
    };
  }),

  // Enhance a single image
  enhance: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        mode: z.enum(["natural_clean", "soft_glow", "studio_look", "no_makeup_real"]),
        proMode: z.boolean().default(false),
        imageWidth: z.number().optional(),
        imageHeight: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const modeConfig = ENHANCEMENT_MODES[input.mode];
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      // Calculate credit cost
      const creditCost = modeConfig.creditCost + (input.proMode ? PRO_MODE_EXTRA_COST : 0);

      // Check user credits
      const user = await getUserById(userId);
      const userCredits = user?.credits ?? 0;
      if (userCredits < creditCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. Bu işlem için ${creditCost} kredi gerekiyor, mevcut krediniz: ${userCredits}`,
        });
      }

      // Validate image resolution if provided
      if (input.imageWidth && input.imageHeight) {
        if (input.imageWidth < MIN_WIDTH || input.imageHeight < MIN_HEIGHT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Görsel çözünürlüğü çok düşük. Minimum ${MIN_WIDTH}x${MIN_HEIGHT} piksel gerekiyor.`,
          });
        }
        if (input.imageWidth > MAX_WIDTH || input.imageHeight > MAX_HEIGHT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Görsel çözünürlüğü çok yüksek. Maksimum ${MAX_WIDTH}x${MAX_HEIGHT} piksel destekleniyor.`,
          });
        }
      }

      // Create job record
      const [job] = await db
        .insert(skinEnhancementJobs)
        .values({
          userId,
          originalImageUrl: input.imageUrl,
          mode: input.mode,
          proMode: input.proMode,
          status: "processing",
          creditCost,
        })
        .$returningId();

      const jobId = job.id;

      try {
        // Deduct credits
        const creditDeducted = await deductCredits(userId, creditCost);
        if (!creditDeducted) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Kredi düşürülemedi",
          });
        }
        await recordCreditTransaction(userId, "deduct", creditCost, `Cilt iyileştirme - ${modeConfig.name}`);

        // Build enhancement prompt
        let enhancementPrompt = modeConfig.prompt;
        if (input.proMode) {
          enhancementPrompt += " Apply additional micro-detail enhancement and advanced noise reduction while strictly maintaining natural appearance.";
        }

        // Call image generation API with the original image as reference
        const result = await generateImage({
          prompt: enhancementPrompt,
          originalImages: [{
            url: input.imageUrl,
            mimeType: "image/jpeg",
          }],
        });

        if (!result.url) {
          throw new Error("Enhancement failed - no output image");
        }

        // Update job with result
        await db
          .update(skinEnhancementJobs)
          .set({
            enhancedImageUrl: result.url,
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(skinEnhancementJobs.id, jobId));

        return {
          success: true,
          jobId: jobId,
          originalImageUrl: input.imageUrl,
          enhancedImageUrl: result.url,
          mode: input.mode,
          modeName: modeConfig.name,
          creditCost,
        };
      } catch (error) {
        console.error("Skin enhancement failed:", error); // Log the actual error
        // Update job status to failed
        await db
          .update(skinEnhancementJobs)
          .set({
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(skinEnhancementJobs.id, jobId));

        // Refund credits on failure
        try {
          await db.insert(creditTransactions).values({
            userId,
            type: "add",
            amount: creditCost,
            reason: `İade: Cilt iyileştirme başarısız - ${modeConfig.name}`,
            balanceBefore: userCredits - creditCost,
            balanceAfter: userCredits,
          });
          await db
            .update(users)
            .set({ credits: userCredits })
            .where(eq(users.id, userId));
        } catch (refundError) {
          console.error("Credit refund failed:", refundError);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cilt iyileştirme işlemi başarısız oldu. Krediniz iade edildi.",
        });
      }
    }),

  // Batch enhance multiple images
  batchEnhance: protectedProcedure
    .input(
      z.object({
        images: z.array(
          z.object({
            imageUrl: z.string().url(),
            mode: z.enum(["natural_clean", "soft_glow", "studio_look", "no_makeup_real"]),
          })
        ).min(2).max(10),
        proMode: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      // Calculate total credit cost for batch
      const creditCost = BATCH_COST + (input.proMode ? PRO_MODE_EXTRA_COST : 0);

      // Check user credits
      const user = await getUserById(userId);
      const userCredits = user?.credits ?? 0;
      if (userCredits < creditCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. Toplu işlem için ${creditCost} kredi gerekiyor, mevcut krediniz: ${userCredits}`,
        });
      }

      // Deduct credits upfront
      const creditDeducted = await deductCredits(userId, creditCost);
      if (!creditDeducted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi düşürülemedi",
        });
      }
      await recordCreditTransaction(userId, "deduct", creditCost, `Toplu cilt iyileştirme - ${input.images.length} görsel`);

      // Process each image
      const results = [];
      for (const image of input.images) {
        const modeConfig = ENHANCEMENT_MODES[image.mode];

        // Create job record
        const [job] = await db
          .insert(skinEnhancementJobs)
          .values({
            userId,
            originalImageUrl: image.imageUrl,
            mode: image.mode,
            proMode: input.proMode,
            status: "processing",
            creditCost: 0, // Batch pricing
          })
          .$returningId();

        const jobId = job.id;

        try {
          let enhancementPrompt = modeConfig.prompt;
          if (input.proMode) {
            enhancementPrompt += " Apply additional micro-detail enhancement and advanced noise reduction while strictly maintaining natural appearance.";
          }

          const result = await generateImage({
            prompt: enhancementPrompt,
            originalImages: [{
              url: image.imageUrl,
              mimeType: "image/jpeg",
            }],
          });

          if (result.url) {
            await db
              .update(skinEnhancementJobs)
              .set({
                enhancedImageUrl: result.url,
                status: "completed",
                completedAt: new Date(),
              })
              .where(eq(skinEnhancementJobs.id, jobId));

            results.push({
              success: true,
              jobId: jobId,
              originalImageUrl: image.imageUrl,
              enhancedImageUrl: result.url,
              mode: image.mode,
            });
          } else {
            throw new Error("No output image");
          }
        } catch (error) {
          await db
            .update(skinEnhancementJobs)
            .set({
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            })
            .where(eq(skinEnhancementJobs.id, jobId));

          results.push({
            success: false,
            jobId: jobId,
            originalImageUrl: image.imageUrl,
            error: "Enhancement failed",
            mode: image.mode,
          });
        }
      }

      return {
        totalImages: input.images.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
        creditCost,
        results,
      };
    }),

  // Get job status
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      const [job] = await db
        .select()
        .from(skinEnhancementJobs)
        .where(
          and(
            eq(skinEnhancementJobs.id, input.jobId),
            eq(skinEnhancementJobs.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "İş bulunamadı",
        });
      }

      return job;
    }),

  // Get user's enhancement history
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      const jobs = await db
        .select()
        .from(skinEnhancementJobs)
        .where(eq(skinEnhancementJobs.userId, ctx.user.id))
        .orderBy(desc(skinEnhancementJobs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        jobs,
        hasMore: jobs.length === input.limit,
      };
    }),

  // Delete a job from history
  deleteJob: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      const [job] = await db
        .select()
        .from(skinEnhancementJobs)
        .where(
          and(
            eq(skinEnhancementJobs.id, input.jobId),
            eq(skinEnhancementJobs.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "İş bulunamadı",
        });
      }

      await db
        .delete(skinEnhancementJobs)
        .where(eq(skinEnhancementJobs.id, input.jobId));

      return { success: true };
    }),
});
