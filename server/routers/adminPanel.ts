import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  users,
  siteSettings,
  creditPackages,
  discountCodes,
  discountCodeUsage,
  featurePricing,
  announcements,
  faqs,
  viralAppsConfig,
  apiUsageStats,
  userSessions,
  creditTransactions,
  generatedImages,
  videoGenerations,
  feedbacks,
  blogPosts,
  aiCharacters,
  bannedIps,
  bannedEmails,
  homepageSections,
  aiModelConfig,
  promptBlacklist,
  flaggedPrompts,
  paymentRecords,
  adminRoles,
  adminUsersExtended,
  ipLoginHistory,
  jobQueue,
  systemRateLimits,
  userWarnings,
} from "../../drizzle/schema";
import {
  eq,
  desc,
  asc,
  sql,
  and,
  gte,
  lte,
  like,
  count,
  or,
  type SQL,
} from "drizzle-orm";
import type { UnifiedVideoModelType } from "../kieAiApi";
import {
  logAdminActivity as logActivity,
  requireAdminDb,
} from "./adminPanel/shared";

// Admin-only procedure wrapper
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin yetkisi gerekli",
    });
  }
  return next({ ctx });
});

export const adminPanelRouter = router({
  // ============ DASHBOARD STATS ============

  getDashboardOverview: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    // Get counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [imageCount] = await db
      .select({ count: count() })
      .from(generatedImages);
    const [videoCount] = await db
      .select({ count: count() })
      .from(videoGenerations);
    const [feedbackCount] = await db
      .select({ count: count() })
      .from(feedbacks)
      .where(eq(feedbacks.status, "new"));

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, today));

    const [todayImages] = await db
      .select({ count: count() })
      .from(generatedImages)
      .where(gte(generatedImages.createdAt, today));

    // Get total credits in circulation
    const [totalCredits] = await db
      .select({ total: sql<number>`SUM(credits)` })
      .from(users);

    // Get recent transactions sum
    const [recentRevenue] = await db
      .select({ total: sql<number>`SUM(amount)` })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.type, "purchase"),
          gte(creditTransactions.createdAt, today)
        )
      );

    return {
      totalUsers: userCount?.count || 0,
      totalImages: imageCount?.count || 0,
      totalVideos: videoCount?.count || 0,
      pendingFeedbacks: feedbackCount?.count || 0,
      todayNewUsers: todayUsers?.count || 0,
      todayImages: todayImages?.count || 0,
      totalCreditsInCirculation: totalCredits?.total || 0,
      todayRevenue: recentRevenue?.total || 0,
    };
  }),

  getAdvancedDashboardStats: adminProcedure
    .input(
      z.object({
        period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      if (input.period === "daily") {
        startDate.setHours(0, 0, 0, 0);
      } else if (input.period === "weekly") {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      // API cost by model
      const modelStats = await db
        .select({
          modelKey: aiModelConfig.modelKey,
          modelName: aiModelConfig.modelName,
          modelType: aiModelConfig.modelType,
          totalRequests: aiModelConfig.totalRequests,
          successfulRequests: aiModelConfig.successfulRequests,
          failedRequests: aiModelConfig.failedRequests,
          avgRenderTimeMs: aiModelConfig.avgRenderTimeMs,
          totalCostUsd: aiModelConfig.totalCostUsd,
          isActive: aiModelConfig.isActive,
        })
        .from(aiModelConfig);

      // Calculate error rates
      const modelStatsWithErrorRate = modelStats.map(m => ({
        ...m,
        errorRate:
          m.totalRequests > 0
            ? (((m.failedRequests || 0) / m.totalRequests) * 100).toFixed(2)
            : "0.00",
      }));

      // Sort by usage
      const mostUsedModels = [...modelStatsWithErrorRate]
        .sort((a, b) => (b.totalRequests || 0) - (a.totalRequests || 0))
        .slice(0, 5);
      const mostFailingModels = [...modelStatsWithErrorRate]
        .sort((a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate))
        .slice(0, 5);

      // Total API cost
      const totalApiCost = modelStats.reduce(
        (sum, m) => sum + parseFloat(m.totalCostUsd || "0"),
        0
      );

      // Queue status
      const [queueStats] = await db
        .select({
          pending: sql<number>`SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END)`,
          processing: sql<number>`SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END)`,
        })
        .from(jobQueue);

      // Images/Videos by period
      const [periodImages] = await db
        .select({ count: count() })
        .from(generatedImages)
        .where(gte(generatedImages.createdAt, startDate));

      const [periodVideos] = await db
        .select({ count: count() })
        .from(videoGenerations)
        .where(gte(videoGenerations.createdAt, startDate));

      // Credit consumption
      const [creditStats] = await db
        .select({
          totalSpent: sql<number>`COALESCE(SUM(CASE WHEN type = 'deduct' THEN amount ELSE 0 END), 0)`,
          totalAdded: sql<number>`COALESCE(SUM(CASE WHEN type = 'add' THEN amount ELSE 0 END), 0)`,
          totalPurchased: sql<number>`COALESCE(SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END), 0)`,
        })
        .from(creditTransactions)
        .where(gte(creditTransactions.createdAt, startDate));

      // Active users (users who generated content in period)
      const [activeUsers] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT userId)`,
        })
        .from(generatedImages)
        .where(gte(generatedImages.createdAt, startDate));

      // Payment stats for period
      const [periodPayments] = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0)`,
          successfulPayments: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        })
        .from(paymentRecords)
        .where(gte(paymentRecords.createdAt, startDate));

      return {
        period: input.period,
        modelStats: modelStatsWithErrorRate,
        mostUsedModels,
        mostFailingModels,
        totalApiCostUsd: totalApiCost.toFixed(2),
        queueStatus: {
          pending: queueStats?.pending || 0,
          processing: queueStats?.processing || 0,
        },
        periodStats: {
          images: periodImages?.count || 0,
          videos: periodVideos?.count || 0,
          activeUsers: activeUsers?.count || 0,
        },
        creditStats: {
          spent: creditStats?.totalSpent || 0,
          added: creditStats?.totalAdded || 0,
          purchased: creditStats?.totalPurchased || 0,
        },
        periodRevenue: {
          total: periodPayments?.totalRevenue || 0,
          transactions: periodPayments?.successfulPayments || 0,
        },
      };
    }),

  getRecentActivity: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    const recentImages = await db
      .select({
        id: generatedImages.id,
        userId: generatedImages.userId,
        prompt: generatedImages.prompt,
        status: generatedImages.status,
        generatedImageUrl: generatedImages.generatedImageUrl,
        createdAt: generatedImages.createdAt,
      })
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(10);

    return { recentUsers, recentImages };
  }),

  // ============ VIDEO MANAGEMENT ============

  getVideos: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["pending", "processing", "completed", "failed"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const conditions = [];
      if (input.status) {
        conditions.push(eq(videoGenerations.status, input.status));
      }

      const videos = await db
        .select({
          id: videoGenerations.id,
          userId: videoGenerations.userId,
          prompt: videoGenerations.prompt,
          videoUrl: videoGenerations.videoUrl,
          thumbnailUrl: videoGenerations.thumbnailUrl,
          model: videoGenerations.model,
          mode: videoGenerations.mode,
          duration: videoGenerations.duration,
          quality: videoGenerations.quality,
          creditsCost: videoGenerations.creditsCost,
          status: videoGenerations.status,
          createdAt: videoGenerations.createdAt,
          completedAt: videoGenerations.completedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(videoGenerations)
        .leftJoin(users, eq(videoGenerations.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(videoGenerations.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get counts
      const [totalCount] = await db
        .select({ count: count() })
        .from(videoGenerations);
      const [completedCount] = await db
        .select({ count: count() })
        .from(videoGenerations)
        .where(eq(videoGenerations.status, "completed"));
      const [processingCount] = await db
        .select({ count: count() })
        .from(videoGenerations)
        .where(eq(videoGenerations.status, "processing"));
      const [failedCount] = await db
        .select({ count: count() })
        .from(videoGenerations)
        .where(eq(videoGenerations.status, "failed"));

      return {
        videos,
        stats: {
          total: totalCount?.count || 0,
          completed: completedCount?.count || 0,
          processing: processingCount?.count || 0,
          failed: failedCount?.count || 0,
        },
      };
    }),

  // ============ IMAGE MANAGEMENT ============

  getImages: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["pending", "processing", "completed", "failed"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const conditions = [];
      if (input.status) {
        conditions.push(eq(generatedImages.status, input.status));
      }

      const images = await db
        .select({
          id: generatedImages.id,
          userId: generatedImages.userId,
          prompt: generatedImages.prompt,
          generatedImageUrl: generatedImages.generatedImageUrl,
          referenceImageUrl: generatedImages.referenceImageUrl,
          status: generatedImages.status,
          creditsCost: generatedImages.creditsCost,
          createdAt: generatedImages.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(generatedImages)
        .leftJoin(users, eq(generatedImages.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(generatedImages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get counts
      const [totalCount] = await db
        .select({ count: count() })
        .from(generatedImages);
      const [completedCount] = await db
        .select({ count: count() })
        .from(generatedImages)
        .where(eq(generatedImages.status, "completed"));
      const [processingCount] = await db
        .select({ count: count() })
        .from(generatedImages)
        .where(eq(generatedImages.status, "processing"));
      const [failedCount] = await db
        .select({ count: count() })
        .from(generatedImages)
        .where(eq(generatedImages.status, "failed"));

      return {
        images,
        stats: {
          total: totalCount?.count || 0,
          completed: completedCount?.count || 0,
          processing: processingCount?.count || 0,
          failed: failedCount?.count || 0,
        },
      };
    }),

  // ============ SITE SETTINGS ============

  getSiteSettings: adminProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      if (input.category) {
        return await db
          .select()
          .from(siteSettings)
          .where(
            eq(
              siteSettings.category,
              input.category as (typeof siteSettings.category.enumValues)[number]
            )
          )
          .orderBy(asc(siteSettings.key));
      }

      return await db
        .select()
        .from(siteSettings)
        .orderBy(asc(siteSettings.category), asc(siteSettings.key));
    }),

  updateSiteSetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [existing] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, input.key));

      if (existing) {
        await db
          .update(siteSettings)
          .set({ value: input.value })
          .where(eq(siteSettings.key, input.key));

        await logActivity(
          ctx.user.id,
          "setting.update",
          "siteSetting",
          existing.id,
          existing.value,
          input.value
        );
      }

      return { success: true };
    }),

  createSiteSetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string().nullable(),
        category: z.enum([
          "general",
          "seo",
          "contact",
          "social",
          "email",
          "notification",
          "security",
          "maintenance",
        ]),
        label: z.string(),
        description: z.string().optional(),
        inputType: z
          .enum([
            "text",
            "textarea",
            "number",
            "boolean",
            "url",
            "email",
            "json",
            "image",
          ])
          .default("text"),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [result] = await db
        .insert(siteSettings)
        .values(input)
        .$returningId();

      await logActivity(
        ctx.user.id,
        "setting.create",
        "siteSetting",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  // ============ CREDIT PACKAGES ============

  getCreditPackages: adminProcedure.query(async () => {
    const db = await requireAdminDb();
    return await db
      .select()
      .from(creditPackages)
      .orderBy(asc(creditPackages.sortOrder));
  }),

  createCreditPackage: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        credits: z.number().min(1),
        price: z.string(),
        originalPrice: z.string().optional(),
        badge: z.string().optional(),
        features: z.string().optional(),
        usage1k: z.number().optional(),
        usage2k: z.number().optional(),
        usage4k: z.number().optional(),
        shopierUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
        isHighlighted: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      // Boş stringleri null'a çevir
      const dataToInsert = {
        ...input,
        originalPrice: input.originalPrice === "" ? null : input.originalPrice,
        badge: input.badge === "" ? null : input.badge,
        shopierUrl: input.shopierUrl === "" ? null : input.shopierUrl,
      };

      // Features JSON doğrulama
      if (input.features && input.features.trim() !== "") {
        try {
          JSON.parse(input.features);
        } catch (e) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              'Özellikler (Features) alanı geçerli bir JSON formatında olmalıdır (örn: ["özellik 1", "özellik 2"])',
          });
        }
      }

      const [result] = await db
        .insert(creditPackages)
        .values(dataToInsert)
        .$returningId();

      await logActivity(
        ctx.user.id,
        "package.create",
        "creditPackage",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  updateCreditPackage: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        credits: z.number().min(1).optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        badge: z.string().optional(),
        features: z.string().optional(),
        usage1k: z.number().optional(),
        usage2k: z.number().optional(),
        usage4k: z.number().optional(),
        shopierUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        isHighlighted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [existing] = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.id, input.id));
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const { id, ...updateData } = input;

      // Boş stringleri null'a çevir (veritabanı hatalarını önlemek için)
      const dataToUpdate = {
        ...updateData,
        originalPrice:
          updateData.originalPrice === "" ? null : updateData.originalPrice,
        badge: updateData.badge === "" ? null : updateData.badge,
        shopierUrl: updateData.shopierUrl === "" ? null : updateData.shopierUrl,
      };

      // Features JSON doğrulama
      if (updateData.features && updateData.features.trim() !== "") {
        try {
          JSON.parse(updateData.features);
        } catch (e) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              'Özellikler (Features) alanı geçerli bir JSON formatında olmalıdır (örn: ["özellik 1", "özellik 2"])',
          });
        }
      }

      await db
        .update(creditPackages)
        .set(dataToUpdate)
        .where(eq(creditPackages.id, id));

      await logActivity(
        ctx.user.id,
        "package.update",
        "creditPackage",
        id,
        existing,
        updateData
      );

      return { success: true };
    }),

  deleteCreditPackage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(creditPackages).where(eq(creditPackages.id, input.id));

      await logActivity(
        ctx.user.id,
        "package.delete",
        "creditPackage",
        input.id
      );

      return { success: true };
    }),

  // ============ DISCOUNT CODES ============

  getDiscountCodes: adminProcedure.query(async () => {
    const db = await requireAdminDb();
    return await db
      .select()
      .from(discountCodes)
      .orderBy(desc(discountCodes.createdAt));
  }),

  createDiscountCode: adminProcedure
    .input(
      z.object({
        code: z.string().min(3).max(50),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed", "credits"]),
        discountValue: z.string(),
        minPurchase: z.string().optional(),
        maxUses: z.number().optional(),
        maxUsesPerUser: z.number().default(1),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      // Check if code already exists
      const [existing] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.code, input.code.toUpperCase()));
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu kod zaten mevcut",
        });

      const [result] = await db
        .insert(discountCodes)
        .values({
          ...input,
          code: input.code.toUpperCase(),
        })
        .$returningId();

      await logActivity(
        ctx.user.id,
        "discount.create",
        "discountCode",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  updateDiscountCode: adminProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed", "credits"]).optional(),
        discountValue: z.string().optional(),
        minPurchase: z.string().optional(),
        maxUses: z.number().optional(),
        maxUsesPerUser: z.number().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db
        .update(discountCodes)
        .set(updateData)
        .where(eq(discountCodes.id, id));

      await logActivity(
        ctx.user.id,
        "discount.update",
        "discountCode",
        id,
        null,
        updateData
      );

      return { success: true };
    }),

  deleteDiscountCode: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(discountCodes).where(eq(discountCodes.id, input.id));

      await logActivity(
        ctx.user.id,
        "discount.delete",
        "discountCode",
        input.id
      );

      return { success: true };
    }),

  // ============ FEATURE PRICING ============

  getFeaturePricing: adminProcedure.query(async () => {
    const db = await requireAdminDb();
    return await db
      .select()
      .from(featurePricing)
      .orderBy(asc(featurePricing.category), asc(featurePricing.featureKey));
  }),

  initializeFeaturePricing: adminProcedure.mutation(async ({ ctx }) => {
    const db = await requireAdminDb();

    const defaultPricing = [
      // Image Generation - Qwen
      {
        featureKey: "image_qwen_1k",
        featureName: "Görsel üretim (Qwen 1K)",
        category: "image",
        credits: 10,
        description: "Qwen modeli ile 1K çözünürlükte görsel üretimi",
      },
      {
        featureKey: "image_qwen_2k",
        featureName: "Görsel üretim (Qwen 2K)",
        category: "image",
        credits: 15,
        description: "Qwen modeli ile 2K çözünürlükte görsel üretimi",
      },
      {
        featureKey: "image_qwen_4k",
        featureName: "Görsel üretim (Qwen 4K)",
        category: "image",
        credits: 20,
        description: "Qwen modeli ile 4K çözünürlükte görsel üretimi",
      },

      // Image Generation - Nano Banana Pro
      {
        featureKey: "image_nano_banana_1k",
        featureName: "Görsel üretim (Nano Banana Pro 1K)",
        category: "image",
        credits: 12,
        description: "Nano Banana Pro ile 1K çözünürlükte görsel üretimi",
      },
      {
        featureKey: "image_nano_banana_2k",
        featureName: "Görsel üretim (Nano Banana Pro 2K)",
        category: "image",
        credits: 18,
        description: "Nano Banana Pro ile 2K çözünürlükte görsel üretimi",
      },
      {
        featureKey: "image_nano_banana_4k",
        featureName: "Görsel üretim (Nano Banana Pro 4K)",
        category: "image",
        credits: 25,
        description: "Nano Banana Pro ile 4K çözünürlükte görsel üretimi",
      },

      // Image Generation - SeeDream
      {
        featureKey: "image_seedream_basic",
        featureName: "Görsel üretim (SeeDream Basic)",
        category: "image",
        credits: 8,
        description: "SeeDream 4.5 ile 2K görsel üretimi",
      },
      {
        featureKey: "image_seedream_high",
        featureName: "Görsel üretim (SeeDream High)",
        category: "image",
        credits: 15,
        description: "SeeDream 4.5 ile 4K görsel üretimi",
      },

      // Video Generation - Veo 3.1
      {
        featureKey: "video_veo3_fast",
        featureName: "Video üretim (Veo 3.1 Hızlı)",
        category: "video",
        credits: 50,
        description: "Google Veo 3.1 hızlı mod - 8 saniye",
      },
      {
        featureKey: "video_veo3_quality",
        featureName: "Video üretim (Veo 3.1 Kalite)",
        category: "video",
        credits: 75,
        description: "Google Veo 3.1 kalite mod - 8 saniye",
      },

      // Video Generation - Grok
      {
        featureKey: "video_grok_standard",
        featureName: "Video üretim (Grok)",
        category: "video",
        credits: 15,
        description: "xAI Grok Imagine - 6 saniye",
      },

      // Video Generation - Kling
      {
        featureKey: "video_kling_5s",
        featureName: "Video üretim (Kling 5s)",
        category: "video",
        credits: 45,
        description: "Kling 2.5 Turbo - 5 saniye",
      },
      {
        featureKey: "video_kling_10s",
        featureName: "Video üretim (Kling 10s)",
        category: "video",
        credits: 75,
        description: "Kling 2.5 Turbo - 10 saniye",
      },

      // Video Generation - Sora 2
      {
        featureKey: "video_sora_10s",
        featureName: "Video üretim (Sora 10s)",
        category: "video",
        credits: 24,
        description: "OpenAI Sora 2 - 10 saniye",
      },
      {
        featureKey: "video_sora_15s",
        featureName: "Video üretim (Sora 15s)",
        category: "video",
        credits: 30,
        description: "OpenAI Sora 2 - 15 saniye",
      },

      // Upscale
      {
        featureKey: "upscale_2x",
        featureName: "Görsel upscale (2x)",
        category: "upscale",
        credits: 5,
        description: "2x çözünürlük artırma",
      },
      {
        featureKey: "upscale_4x",
        featureName: "Görsel upscale (4x)",
        category: "upscale",
        credits: 10,
        description: "4x çözünürlük artırma",
      },
      {
        featureKey: "skin_enhancement",
        featureName: "Cilt iyileştirme",
        category: "upscale",
        credits: 8,
        description: "AI cilt iyileştirme",
      },

      // AI Character
      {
        featureKey: "ai_character_create",
        featureName: "AI Karakter oluşturma",
        category: "ai_character",
        credits: 15,
        description: "Yeni AI karakter oluşturma",
      },
      {
        featureKey: "ai_character_generate",
        featureName: "AI Karakter görsel üretim",
        category: "ai_character",
        credits: 12,
        description: "Mevcut AI karakter ile görsel üretimi",
      },

      // Viral App
      {
        featureKey: "viral_app_basic",
        featureName: "Viral App (Basic)",
        category: "viral_app",
        credits: 20,
        description: "Basit viral app içeriği",
      },
      {
        featureKey: "viral_app_premium",
        featureName: "Viral App (Premium)",
        category: "viral_app",
        credits: 40,
        description: "Premium viral app içeriği",
      },
    ];

    let inserted = 0;
    let updated = 0;

    for (const pricing of defaultPricing) {
      try {
        const existing = await db
          .select()
          .from(featurePricing)
          .where(eq(featurePricing.featureKey, pricing.featureKey))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(featurePricing).values({
            ...pricing,
            isActive: true,
          });
          inserted++;
        } else {
          // Sadece description güncelle, fiyatı değiştirme
          await db
            .update(featurePricing)
            .set({ description: pricing.description })
            .where(eq(featurePricing.featureKey, pricing.featureKey));
          updated++;
        }
      } catch (e) {
        console.error(`Error initializing pricing ${pricing.featureKey}:`, e);
      }
    }

    await logActivity(
      ctx.user.id,
      "pricing.initialize",
      undefined,
      undefined,
      undefined,
      { inserted, updated }
    );

    return { success: true, inserted, updated };
  }),

  updateFeaturePricing: adminProcedure
    .input(
      z.object({
        id: z.number(),
        credits: z.number().min(0).optional(),
        featureName: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [existing] = await db
        .select()
        .from(featurePricing)
        .where(eq(featurePricing.id, input.id));
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const { id, ...updateData } = input;
      await db
        .update(featurePricing)
        .set(updateData)
        .where(eq(featurePricing.id, id));

      await logActivity(
        ctx.user.id,
        "pricing.update",
        "featurePricing",
        id,
        existing.credits,
        input.credits
      );

      return { success: true };
    }),

  createFeaturePricing: adminProcedure
    .input(
      z.object({
        featureKey: z.string(),
        featureName: z.string(),
        category: z.enum([
          "image",
          "video",
          "upscale",
          "ai_character",
          "viral_app",
          "multi_angle",
          "product_promo",
          "ugc_ad",
        ]),
        credits: z.number().min(0),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      // Check if already exists
      const existing = await db
        .select()
        .from(featurePricing)
        .where(eq(featurePricing.featureKey, input.featureKey))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu feature key zaten mevcut",
        });
      }

      const [result] = await db
        .insert(featurePricing)
        .values(input)
        .$returningId();

      await logActivity(
        ctx.user.id,
        "pricing.create",
        "featurePricing",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  deleteFeaturePricing: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(featurePricing).where(eq(featurePricing.id, input.id));
      await logActivity(
        ctx.user.id,
        "pricing.delete",
        "featurePricing",
        input.id
      );

      return { success: true };
    }),

  // ============ ANNOUNCEMENTS ============

  getAnnouncements: adminProcedure.query(async () => {
    const db = await requireAdminDb();
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));
  }),

  createAnnouncement: adminProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(["popup", "banner", "notification", "maintenance"]),
        targetAudience: z
          .enum(["all", "logged_in", "logged_out", "new_users"])
          .default("all"),
        buttonText: z.string().optional(),
        buttonUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().default(true),
        dismissible: z.boolean().default(true),
        showOnce: z.boolean().default(false),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [result] = await db
        .insert(announcements)
        .values(input)
        .$returningId();

      await logActivity(
        ctx.user.id,
        "announcement.create",
        "announcement",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  updateAnnouncement: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        type: z
          .enum(["popup", "banner", "notification", "maintenance"])
          .optional(),
        targetAudience: z
          .enum(["all", "logged_in", "logged_out", "new_users"])
          .optional(),
        buttonText: z.string().optional(),
        buttonUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
        dismissible: z.boolean().optional(),
        showOnce: z.boolean().optional(),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db
        .update(announcements)
        .set(updateData)
        .where(eq(announcements.id, id));

      await logActivity(
        ctx.user.id,
        "announcement.update",
        "announcement",
        id,
        null,
        updateData
      );

      return { success: true };
    }),

  deleteAnnouncement: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(announcements).where(eq(announcements.id, input.id));

      await logActivity(
        ctx.user.id,
        "announcement.delete",
        "announcement",
        input.id
      );

      return { success: true };
    }),

  // ============ FAQ ============

  getFaqs: adminProcedure.query(async () => {
    const db = await requireAdminDb();
    return await db
      .select()
      .from(faqs)
      .orderBy(asc(faqs.sortOrder), asc(faqs.id));
  }),

  createFaq: adminProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [result] = await db.insert(faqs).values(input).$returningId();

      await logActivity(
        ctx.user.id,
        "faq.create",
        "faq",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  updateFaq: adminProcedure
    .input(
      z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db.update(faqs).set(updateData).where(eq(faqs.id, id));

      await logActivity(ctx.user.id, "faq.update", "faq", id, null, updateData);

      return { success: true };
    }),

  deleteFaq: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(faqs).where(eq(faqs.id, input.id));

      await logActivity(ctx.user.id, "faq.delete", "faq", input.id);

      return { success: true };
    }),

  // ============ VIRAL APPS CONFIG ============

  getViralAppsConfig: adminProcedure.query(async () => {
    const db = await requireAdminDb();
    return await db
      .select()
      .from(viralAppsConfig)
      .orderBy(asc(viralAppsConfig.sortOrder), asc(viralAppsConfig.name));
  }),

  updateViralAppConfig: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        coverImage: z.string().optional(),
        promptTemplate: z.string().optional(),
        credits: z.number().optional(),
        category: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        isPopular: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db
        .update(viralAppsConfig)
        .set(updateData)
        .where(eq(viralAppsConfig.id, id));

      await logActivity(
        ctx.user.id,
        "viralApp.update",
        "viralAppConfig",
        id,
        null,
        updateData
      );

      return { success: true };
    }),

  createViralAppConfig: adminProcedure
    .input(
      z.object({
        appKey: z.string(),
        name: z.string(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        credits: z.number().default(20),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
        isPopular: z.boolean().default(false),
        promptTemplate: z.string().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      // Check if already exists
      const existing = await db
        .select()
        .from(viralAppsConfig)
        .where(eq(viralAppsConfig.appKey, input.appKey))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu app key zaten mevcut",
        });
      }

      const [result] = await db
        .insert(viralAppsConfig)
        .values(input)
        .$returningId();
      await logActivity(
        ctx.user.id,
        "viralApp.create",
        "viralAppConfig",
        result.id,
        null,
        input
      );

      return { success: true, id: result.id };
    }),

  deleteViralAppConfig: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(viralAppsConfig).where(eq(viralAppsConfig.id, input.id));
      await logActivity(
        ctx.user.id,
        "viralApp.delete",
        "viralAppConfig",
        input.id
      );

      return { success: true };
    }),

  initializeViralApps: adminProcedure.mutation(async ({ ctx }) => {
    const db = await requireAdminDb();

    const defaultApps = [
      {
        appKey: "story_generator",
        name: "Hikaye Oluşturucu",
        emoji: "📖",
        description: "AI ile sosyal medya hikayeleri oluşturun",
        credits: 15,
        sortOrder: 1,
        promptTemplate:
          "Create a cinematic social media story for this image, engaging and viral style, high quality, 4k",
      },
      {
        appKey: "meme_maker",
        name: "Meme Yapıcı",
        emoji: "😂",
        description: "Viral meme'ler oluşturun",
        credits: 10,
        sortOrder: 2,
        isPopular: true,
        promptTemplate:
          "Turn this image into a funny viral meme video, humorous atmosphere, internet culture style",
      },
      {
        appKey: "quote_designer",
        name: "Alıntı Tasarımcısı",
        emoji: "💬",
        description: "İlham verici alıntı görselleri",
        credits: 8,
        sortOrder: 3,
        promptTemplate:
          "Add an inspirational quote overlay to this image with beautiful typography, cinematic lighting, elegant style",
      },
      {
        appKey: "product_showcase",
        name: "Ürün Showcase",
        emoji: "🛍️",
        description: "E-ticaret ürün görselleri",
        credits: 20,
        sortOrder: 4,
        promptTemplate:
          "Showcase this product in a professional studio setting with dynamic lighting, 4k, advertising style",
      },
      {
        appKey: "before_after",
        name: "Önce & Sonra",
        emoji: "🔄",
        description: "Karşılaştırmalı görseller",
        credits: 15,
        sortOrder: 5,
        promptTemplate:
          "Create a transformation video showing before and after states, smooth transition, high quality",
      },
      {
        appKey: "carousel_creator",
        name: "Carousel Oluşturucu",
        emoji: "📱",
        description: "Instagram carousel postları",
        credits: 25,
        sortOrder: 6,
        isPopular: true,
        promptTemplate:
          "Create a seamless scrolling carousel video from this image, engaging motion, social media trend",
      },
      {
        appKey: "thumbnail_maker",
        name: "Thumbnail Yapıcı",
        emoji: "🎬",
        description: "YouTube thumbnail görselleri",
        credits: 12,
        sortOrder: 7,
        promptTemplate:
          "Create an eye-catching YouTube thumbnail motion poster, vibrant colors, high contrast, clickbait style",
      },
      {
        appKey: "avatar_generator",
        name: "Avatar Oluşturucu",
        emoji: "👤",
        description: "Kişisel AI avatarları",
        credits: 18,
        sortOrder: 8,
        promptTemplate:
          "Animate this avatar looking around and smiling, realistic facial expressions, high detail, 8k",
      },
    ];

    let inserted = 0;

    for (const app of defaultApps) {
      try {
        const existing = await db
          .select()
          .from(viralAppsConfig)
          .where(eq(viralAppsConfig.appKey, app.appKey))
          .limit(1);
        if (existing.length === 0) {
          await db.insert(viralAppsConfig).values({
            ...app,
            isActive: true,
            isPopular: app.isPopular || false,
          });
          inserted++;
        }
      } catch (e) {
        console.error(`Error initializing viral app ${app.appKey}:`, e);
      }
    }

    await logActivity(
      ctx.user.id,
      "viralApp.initialize",
      undefined,
      undefined,
      undefined,
      { inserted }
    );

    return { success: true, inserted };
  }),

  // ============ ACTIVITY LOGS ============

  getActivityLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        action: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      let query = db
        .select({
          id: activityLogs.id,
          userId: activityLogs.userId,
          action: activityLogs.action,
          entityType: activityLogs.entityType,
          entityId: activityLogs.entityId,
          createdAt: activityLogs.createdAt,
          userName: users.name,
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .orderBy(desc(activityLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return await query;
    }),

  // ============ USER MANAGEMENT (Extended) ============

  getUserDetails: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Get user's images count
      const [imageCount] = await db
        .select({ count: count() })
        .from(generatedImages)
        .where(eq(generatedImages.userId, input.userId));

      // Get user's videos count
      const [videoCount] = await db
        .select({ count: count() })
        .from(videoGenerations)
        .where(eq(videoGenerations.userId, input.userId));

      // Get recent transactions
      const transactions = await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, input.userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(20);

      // Get user's characters
      const characters = await db
        .select()
        .from(aiCharacters)
        .where(eq(aiCharacters.userId, input.userId))
        .orderBy(desc(aiCharacters.createdAt))
        .limit(10);

      return {
        user,
        stats: {
          totalImages: imageCount?.count || 0,
          totalVideos: videoCount?.count || 0,
        },
        transactions,
        characters,
      };
    }),

  updateUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]).optional(),
        credits: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const { userId, ...updateData } = input;
      await db.update(users).set(updateData).where(eq(users.id, userId));

      await logActivity(
        ctx.user.id,
        "user.update",
        "user",
        userId,
        existing,
        updateData
      );

      return { success: true };
    }),

  // ============ FEEDBACKS ============

  getFeedbacks: adminProcedure
    .input(
      z.object({
        status: z.enum(["new", "in_progress", "resolved", "closed"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      let conditions = [];
      if (input.status) {
        conditions.push(eq(feedbacks.status, input.status));
      }

      const result = await db
        .select({
          id: feedbacks.id,
          userId: feedbacks.userId,
          type: feedbacks.type,
          description: feedbacks.description,
          screenshotUrl: feedbacks.screenshotUrl,
          status: feedbacks.status,
          adminNotes: feedbacks.adminNotes,
          createdAt: feedbacks.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(feedbacks)
        .leftJoin(users, eq(feedbacks.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(feedbacks.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return result;
    }),

  updateFeedbackStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "in_progress", "resolved", "closed"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db.update(feedbacks).set(updateData).where(eq(feedbacks.id, id));

      await logActivity(
        ctx.user.id,
        "feedback.update",
        "feedback",
        id,
        null,
        updateData
      );

      return { success: true };
    }),

  // ============ AI CHARACTERS MODERATION ============

  getPendingCharacters: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select({
        id: aiCharacters.id,
        name: aiCharacters.name,
        characterImageUrl: aiCharacters.characterImageUrl,
        isPublic: aiCharacters.isPublic,
        usageCount: aiCharacters.usageCount,
        createdAt: aiCharacters.createdAt,
        userName: users.name,
      })
      .from(aiCharacters)
      .leftJoin(users, eq(aiCharacters.userId, users.id))
      .where(eq(aiCharacters.isPublic, true))
      .orderBy(desc(aiCharacters.createdAt))
      .limit(50);
  }),

  toggleCharacterPublic: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(aiCharacters)
        .set({ isPublic: input.isPublic })
        .where(eq(aiCharacters.id, input.id));

      await logActivity(
        ctx.user.id,
        "character.moderate",
        "aiCharacter",
        input.id,
        null,
        { isPublic: input.isPublic }
      );

      return { success: true };
    }),

  // ============ REPORTS ============

  getUserGrowthReport: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const result = await db
        .select({
          date: sql<string>`DATE(createdAt)`.as("date"),
          count: count(),
        })
        .from(users)
        .where(gte(users.createdAt, startDate))
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return result;
    }),

  getRevenueReport: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const result = await db
        .select({
          date: sql<string>`DATE(createdAt)`.as("date"),
          total: sql<number>`SUM(amount)`.as("total"),
          count: count(),
        })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.type, "purchase"),
            gte(creditTransactions.createdAt, startDate)
          )
        )
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return result;
    }),

  getCreditTransactions: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(10).max(100).default(20),
        search: z.string().trim().optional(),
        type: z.enum(["add", "deduct", "purchase"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();
      const filters: SQL<unknown>[] = [];

      if (input.type) {
        filters.push(eq(creditTransactions.type, input.type));
      }

      const searchTerm = input.search?.trim();
      if (searchTerm) {
        const pattern = `%${searchTerm}%`;
        const parsedUserId = Number.parseInt(searchTerm, 10);
        const searchFilter = Number.isFinite(parsedUserId)
          ? or(
              like(users.name, pattern),
              like(users.email, pattern),
              like(creditTransactions.reason, pattern),
              eq(creditTransactions.userId, parsedUserId)
            )
          : or(
              like(users.name, pattern),
              like(users.email, pattern),
              like(creditTransactions.reason, pattern)
            );
        if (searchFilter) {
          filters.push(searchFilter);
        }
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;
      const offset = (input.page - 1) * input.pageSize;

      const transactionsBase = db
        .select({
          id: creditTransactions.id,
          userId: creditTransactions.userId,
          userName: users.name,
          userEmail: users.email,
          type: creditTransactions.type,
          amount: creditTransactions.amount,
          reason: creditTransactions.reason,
          balanceBefore: creditTransactions.balanceBefore,
          balanceAfter: creditTransactions.balanceAfter,
          createdAt: creditTransactions.createdAt,
        })
        .from(creditTransactions)
        .innerJoin(users, eq(creditTransactions.userId, users.id));

      const transactions = whereClause
        ? await transactionsBase
            .where(whereClause)
            .orderBy(desc(creditTransactions.createdAt))
            .limit(input.pageSize)
            .offset(offset)
        : await transactionsBase
            .orderBy(desc(creditTransactions.createdAt))
            .limit(input.pageSize)
            .offset(offset);

      const totalBase = db
        .select({ count: count() })
        .from(creditTransactions)
        .innerJoin(users, eq(creditTransactions.userId, users.id));

      const [totalResult] = whereClause
        ? await totalBase.where(whereClause)
        : await totalBase;

      const total = totalResult?.count || 0;
      return {
        transactions,
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  getFeatureUsageReport: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    // Image generation stats
    const [imageStats] = await db
      .select({
        total: count(),
        completed:
          sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`.as(
            "completed"
          ),
        failed:
          sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`.as(
            "failed"
          ),
      })
      .from(generatedImages);

    // Video generation stats
    const [videoStats] = await db
      .select({
        total: count(),
        completed:
          sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`.as(
            "completed"
          ),
        failed:
          sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`.as(
            "failed"
          ),
      })
      .from(videoGenerations);

    return {
      images: imageStats,
      videos: videoStats,
    };
  }),

  // ============ BULK OPERATIONS ============

  bulkAddCredits: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.number()),
        amount: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const results = [];
      for (const userId of input.userIds) {
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));
          if (!user) {
            results.push({
              userId,
              success: false,
              error: "Kullanıcı bulunamadı",
            });
            continue;
          }

          await db
            .update(users)
            .set({ credits: sql`credits + ${input.amount}` })
            .where(eq(users.id, userId));

          await db.insert(creditTransactions).values({
            userId,
            type: "add",
            amount: input.amount,
            reason: input.reason || "Admin toplu kredi ekleme",
            balanceBefore: user.credits,
            balanceAfter: user.credits + input.amount,
          });

          results.push({
            userId,
            success: true,
            newBalance: user.credits + input.amount,
          });
        } catch (error) {
          results.push({ userId, success: false, error: String(error) });
        }
      }

      await logActivity(
        ctx.user.id,
        "credit.bulkAdd",
        "user",
        undefined,
        null,
        { userIds: input.userIds, amount: input.amount }
      );

      return { results };
    }),

  // ============ EXPORT ============

  exportUsers: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        credits: users.credits,
        role: users.role,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return allUsers;
  }),

  // ============ BAN SYSTEM ============

  getBannedUsers: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isBanned: users.isBanned,
        bannedAt: users.bannedAt,
        banReason: users.banReason,
        lastKnownIp: users.lastKnownIp,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.isBanned, true))
      .orderBy(desc(users.bannedAt));
  }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
        banIp: z.boolean().default(true),
        banEmail: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      // Get user info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });

      // Ban user
      await db
        .update(users)
        .set({
          isBanned: true,
          bannedAt: new Date(),
          banReason: input.reason || "Admin tarafından yasaklandı",
          bannedBy: ctx.user.id,
        })
        .where(eq(users.id, input.userId));

      // Ban IP if requested and IP exists
      if (input.banIp && user.lastKnownIp) {
        try {
          await db.insert(bannedIps).values({
            ipAddress: user.lastKnownIp,
            reason: input.reason || "Kullanıcı yasaklandığında eklendi",
            bannedBy: ctx.user.id,
            bannedUserId: input.userId,
          });
        } catch (e) {
          // IP already banned, ignore
        }
      }

      // Ban email if requested and email exists
      if (input.banEmail && user.email) {
        try {
          await db.insert(bannedEmails).values({
            email: user.email,
            isPattern: false,
            reason: input.reason || "Kullanıcı yasaklandığında eklendi",
            bannedBy: ctx.user.id,
            bannedUserId: input.userId,
          });
        } catch (e) {
          // Email already banned, ignore
        }
      }

      await logActivity(ctx.user.id, "user.ban", "user", input.userId, null, {
        reason: input.reason,
      });

      return { success: true };
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(users)
        .set({
          isBanned: false,
          bannedAt: null,
          banReason: null,
          bannedBy: null,
        })
        .where(eq(users.id, input.userId));

      await logActivity(ctx.user.id, "user.unban", "user", input.userId);

      return { success: true };
    }),

  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        credits: z.number().default(100),
        role: z.enum(["user", "admin"]).default("user"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      // Check if email already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu e-posta adresi zaten kullanılıyor",
        });
      }

      // Hash password
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const [result] = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          credits: input.credits,
          role: input.role,
          provider: "local",
          emailVerified: true, // Admin-created users are pre-verified
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .$returningId();

      await logActivity(ctx.user.id, "user.create", "user", result.id, null, {
        name: input.name,
        email: input.email,
        role: input.role,
      });

      return { success: true, userId: result.id };
    }),

  getBannedIps: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db.select().from(bannedIps).orderBy(desc(bannedIps.createdAt));
  }),

  addBannedIp: adminProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.insert(bannedIps).values({
        ipAddress: input.ipAddress,
        reason: input.reason,
        bannedBy: ctx.user.id,
      });

      await logActivity(
        ctx.user.id,
        "ip.ban",
        "bannedIp",
        undefined,
        null,
        input
      );

      return { success: true };
    }),

  removeBannedIp: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(bannedIps).where(eq(bannedIps.id, input.id));
      await logActivity(ctx.user.id, "ip.unban", "bannedIp", input.id);

      return { success: true };
    }),

  getBannedEmails: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select()
      .from(bannedEmails)
      .orderBy(desc(bannedEmails.createdAt));
  }),

  addBannedEmail: adminProcedure
    .input(
      z.object({
        email: z.string(),
        isPattern: z.boolean().default(false),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.insert(bannedEmails).values({
        email: input.email,
        isPattern: input.isPattern,
        reason: input.reason,
        bannedBy: ctx.user.id,
      });

      await logActivity(
        ctx.user.id,
        "email.ban",
        "bannedEmail",
        undefined,
        null,
        input
      );

      return { success: true };
    }),

  removeBannedEmail: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(bannedEmails).where(eq(bannedEmails.id, input.id));
      await logActivity(ctx.user.id, "email.unban", "bannedEmail", input.id);

      return { success: true };
    }),

  // ============ HOMEPAGE SECTIONS ============

  getHomepageSections: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select()
      .from(homepageSections)
      .orderBy(asc(homepageSections.order));
  }),

  initializeHomepageSections: adminProcedure.mutation(async ({ ctx }) => {
    const db = await requireAdminDb();

    const defaultSections = [
      { sectionKey: "hero", title: "Hero Bölümü", order: 1 },
      { sectionKey: "features", title: "Özellikler", order: 2 },
      { sectionKey: "howItWorks", title: "Nasıl Çalışır", order: 3 },
      { sectionKey: "gallery", title: "Galeri", order: 4 },
      { sectionKey: "testimonials", title: "Kullanıcı Yorumları", order: 5 },
      { sectionKey: "pricing", title: "Fiyatlandırma", order: 6 },
      { sectionKey: "faq", title: "Sıkça Sorulan Sorular", order: 7 },
      { sectionKey: "cta", title: "Aksiyon Çağrısı", order: 8 },
    ];

    for (const section of defaultSections) {
      try {
        await db.insert(homepageSections).values({
          sectionKey: section.sectionKey,
          title: section.title,
          order: section.order,
          isVisible: true,
        });
      } catch (e) {
        // Section already exists, update it
        await db
          .update(homepageSections)
          .set({ title: section.title, order: section.order })
          .where(eq(homepageSections.sectionKey, section.sectionKey));
      }
    }

    await logActivity(ctx.user.id, "homepage.initSections");

    return { success: true };
  }),

  updateHomepageSection: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isVisible: z.boolean().optional(),
        title: z.string().optional(),
        config: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const updateData: any = {};
      if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.config !== undefined) updateData.config = input.config;

      await db
        .update(homepageSections)
        .set(updateData)
        .where(eq(homepageSections.id, input.id));

      await logActivity(
        ctx.user.id,
        "homepage.updateSection",
        "homepageSection",
        input.id,
        null,
        updateData
      );

      return { success: true };
    }),

  updateHomepageSectionOrder: adminProcedure
    .input(
      z.object({
        sections: z.array(
          z.object({
            id: z.number(),
            order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      for (const section of input.sections) {
        await db
          .update(homepageSections)
          .set({ order: section.order })
          .where(eq(homepageSections.id, section.id));
      }

      await logActivity(ctx.user.id, "homepage.updateOrder");

      return { success: true };
    }),

  // ============ AI MODEL MANAGEMENT ============
  getAiModels: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select()
      .from(aiModelConfig)
      .orderBy(asc(aiModelConfig.modelName));
  }),

  initializeAiModels: adminProcedure.mutation(async ({ ctx }) => {
    const db = await requireAdminDb();

    const defaultModels = [
      // Image Generation Models
      {
        modelKey: "nano-banana-pro",
        modelName: "Nano Banana Pro",
        modelType: "image" as const,
        provider: "Kie AI",
        isActive: true,
        isMaintenanceMode: false,
        maxResolutionWidth: 4096,
        maxResolutionHeight: 4096,
        freeUserDailyLimit: 10,
        premiumUserDailyLimit: 100,
        priority: 1,
        description:
          "Ana görsel üretim modeli. Yüksek kaliteli, hızlı sonuçlar.",
        costPerRequest: "0.02",
      },
      {
        modelKey: "qwen",
        modelName: "Qwen",
        modelType: "image" as const,
        provider: "Kie AI",
        isActive: true,
        isMaintenanceMode: false,
        maxResolutionWidth: 4096,
        maxResolutionHeight: 4096,
        freeUserDailyLimit: 10,
        premiumUserDailyLimit: 100,
        priority: 2,
        description:
          "Alternatif görsel modeli. Referans görsel desteği mevcut.",
        costPerRequest: "0.015",
      },
      {
        modelKey: "seedream",
        modelName: "SeeDream 4.5",
        modelType: "image" as const,
        provider: "Kie AI",
        isActive: true,
        isMaintenanceMode: false,
        maxResolutionWidth: 4096,
        maxResolutionHeight: 4096,
        freeUserDailyLimit: 8,
        premiumUserDailyLimit: 80,
        priority: 3,
        description: "SeeDream görsel modeli. Ekonomik seçenek.",
        costPerRequest: "0.01",
      },
      // Video Generation Models
      {
        modelKey: "veo3",
        modelName: "Veo 3.1",
        modelType: "video" as const,
        provider: "Kie AI (Google)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 15,
        freeUserDailyLimit: 3,
        premiumUserDailyLimit: 30,
        priority: 1,
        description:
          "Google'ın en gelişmiş video modeli. Yüksek kalite, sesli video desteği.",
        costPerRequest: "0.50",
      },
      {
        modelKey: "sora2",
        modelName: "Sora 2",
        modelType: "video" as const,
        provider: "Kie AI (OpenAI)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 20,
        freeUserDailyLimit: 3,
        premiumUserDailyLimit: 30,
        priority: 2,
        description:
          "OpenAI'in güçlü video üretim modeli. Uzun süreli videolar.",
        costPerRequest: "0.40",
      },
      {
        modelKey: "kling",
        modelName: "Kling 2.0",
        modelType: "video" as const,
        provider: "Kie AI (Kuaishou)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 15,
        freeUserDailyLimit: 5,
        premiumUserDailyLimit: 50,
        priority: 3,
        description: "Kling video modeli. Görsel-to-video desteği.",
        costPerRequest: "0.25",
      },
      {
        modelKey: "grok",
        modelName: "Grok Video",
        modelType: "video" as const,
        provider: "xAI",
        isActive: false,
        isMaintenanceMode: true,
        maxVideoDurationSeconds: 15,
        freeUserDailyLimit: 3,
        premiumUserDailyLimit: 30,
        priority: 4,
        description: "xAI Grok video modeli. Deneysel.",
        costPerRequest: "0.30",
      },
      // New Kie.ai Video Models
      {
        modelKey: "sora-2-pro",
        modelName: "Sora 2 Pro",
        modelType: "video" as const,
        provider: "Kie AI (OpenAI)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 20,
        freeUserDailyLimit: 2,
        premiumUserDailyLimit: 20,
        priority: 2,
        description:
          "OpenAI Sora 2 Pro - Yüksek kalite, uzun süre desteği (10s/15s/20s).",
        costPerRequest: "0.60",
      },
      {
        modelKey: "sora-2-pro-storyboard",
        modelName: "Sora 2 Pro Storyboard",
        modelType: "video" as const,
        provider: "Kie AI (OpenAI)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 20,
        freeUserDailyLimit: 1,
        premiumUserDailyLimit: 10,
        priority: 2,
        description: "Sora 2 Pro Storyboard modu - Çok sahneli video üretimi.",
        costPerRequest: "0.90",
      },
      {
        modelKey: "kling-2.1",
        modelName: "Kling 2.1",
        modelType: "video" as const,
        provider: "Kie AI (Kuaishou)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 10,
        freeUserDailyLimit: 5,
        premiumUserDailyLimit: 50,
        priority: 4,
        description: "Kuaishou Kling 2.1 - Text-to-video ve image-to-video.",
        costPerRequest: "0.20",
      },
      {
        modelKey: "kling-2.5",
        modelName: "Kling 2.5",
        modelType: "video" as const,
        provider: "Kie AI (Kuaishou)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 10,
        freeUserDailyLimit: 5,
        premiumUserDailyLimit: 50,
        priority: 3,
        description: "Kuaishou Kling 2.5 - Geliştirilmiş kalite ve tutarlılık.",
        costPerRequest: "0.25",
      },
      {
        modelKey: "seedance/1.0-lite",
        modelName: "Seedance 1.0 Lite",
        modelType: "video" as const,
        provider: "Kie AI (ByteDance)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 6,
        freeUserDailyLimit: 8,
        premiumUserDailyLimit: 80,
        priority: 5,
        description: "ByteDance Seedance 1.0 Lite - Hızlı, kısa videolar.",
        costPerRequest: "0.12",
      },
      {
        modelKey: "seedance/1.0-pro",
        modelName: "Seedance 1.0 Pro",
        modelType: "video" as const,
        provider: "Kie AI (ByteDance)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 6,
        freeUserDailyLimit: 5,
        premiumUserDailyLimit: 50,
        priority: 4,
        description: "ByteDance Seedance 1.0 Pro - Profesyonel kalite.",
        costPerRequest: "0.18",
      },
      {
        modelKey: "seedance/1.5-pro",
        modelName: "Seedance 1.5 Pro",
        modelType: "video" as const,
        provider: "Kie AI (ByteDance)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 10,
        freeUserDailyLimit: 3,
        premiumUserDailyLimit: 30,
        priority: 2,
        description:
          "ByteDance Seedance 1.5 Pro - Sinema kalitesi, senkronize ses, çok dilli diyalog.",
        costPerRequest: "0.55",
      },
      {
        modelKey: "hailuo-2.3",
        modelName: "Hailuo 2.3",
        modelType: "video" as const,
        provider: "Kie AI (MiniMax)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 6,
        freeUserDailyLimit: 7,
        premiumUserDailyLimit: 70,
        priority: 5,
        description:
          "MiniMax Hailuo 2.3 - Yüksek kaliteli AI video, text-to-video ve image-to-video.",
        costPerRequest: "0.15",
      },
      {
        modelKey: "wan-2.2",
        modelName: "Wan 2.2",
        modelType: "video" as const,
        provider: "Kie AI (Alibaba)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 10,
        freeUserDailyLimit: 6,
        premiumUserDailyLimit: 60,
        priority: 5,
        description: "Alibaba Wan 2.2 - Çok sahneli video üretimi.",
        costPerRequest: "0.20",
      },
      {
        modelKey: "wan-2.5",
        modelName: "Wan 2.5",
        modelType: "video" as const,
        provider: "Kie AI (Alibaba)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 10,
        freeUserDailyLimit: 5,
        premiumUserDailyLimit: 50,
        priority: 4,
        description: "Alibaba Wan 2.5 - Geliştirilmiş görsel kalite.",
        costPerRequest: "0.25",
      },
      {
        modelKey: "wan-2.6",
        modelName: "Wan 2.6",
        modelType: "video" as const,
        provider: "Kie AI (Alibaba)",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 10,
        freeUserDailyLimit: 4,
        premiumUserDailyLimit: 40,
        priority: 3,
        description:
          "Alibaba Wan 2.6 - 1080p çoklu çekim, senkronize ses desteği.",
        costPerRequest: "0.30",
      },
      {
        modelKey: "sora-watermark-remover",
        modelName: "Sora Watermark Remover",
        modelType: "video" as const,
        provider: "Kie AI",
        isActive: true,
        isMaintenanceMode: false,
        maxVideoDurationSeconds: 60,
        freeUserDailyLimit: 10,
        premiumUserDailyLimit: 100,
        priority: 10,
        description: "Sora videolarındaki filigranları kaldırır.",
        costPerRequest: "0.10",
      },
    ];

    let inserted = 0;
    let updated = 0;

    for (const model of defaultModels) {
      try {
        // Check if exists
        const existing = await db
          .select()
          .from(aiModelConfig)
          .where(eq(aiModelConfig.modelKey, model.modelKey))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(aiModelConfig).values(model);
          inserted++;
        } else {
          // Update existing
          await db
            .update(aiModelConfig)
            .set({
              modelName: model.modelName,
              provider: model.provider,
              description: model.description,
              costPerRequest: model.costPerRequest,
              maxResolutionWidth: model.maxResolutionWidth,
              maxResolutionHeight: model.maxResolutionHeight,
              maxVideoDurationSeconds: model.maxVideoDurationSeconds,
            })
            .where(eq(aiModelConfig.modelKey, model.modelKey));
          updated++;
        }
      } catch (e) {
        console.error(`Error initializing model ${model.modelKey}:`, e);
      }
    }

    await logActivity(
      ctx.user.id,
      "models.initialize",
      undefined,
      undefined,
      undefined,
      { inserted, updated }
    );

    return { success: true, inserted, updated };
  }),

  createAiModel: adminProcedure
    .input(
      z.object({
        modelKey: z.string(),
        modelName: z.string(),
        modelType: z.enum(["image", "video", "upscale"]),
        provider: z.string(),
        isActive: z
          .union([z.boolean(), z.number()])
          .transform(v => !!v)
          .default(true),
        isMaintenanceMode: z
          .union([z.boolean(), z.number()])
          .transform(v => !!v)
          .default(false),
        maxResolutionWidth: z.number().optional(),
        maxResolutionHeight: z.number().optional(),
        maxVideoDurationSeconds: z.number().nullable().optional(),
        freeUserDailyLimit: z.number().optional(),
        premiumUserDailyLimit: z.number().optional(),
        creditCostOverride: z.number().nullable().optional(),
        fallbackModelId: z.number().nullable().optional(),
        costPerRequest: z.string().optional(),
        priority: z.number().optional(),
        description: z.string().optional(),
        coverImageDesktop: z.string().optional(),
        coverImageMobile: z.string().optional(),
        coverDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [result] = await db.insert(aiModelConfig).values({
        modelKey: input.modelKey,
        modelName: input.modelName,
        modelType: input.modelType,
        provider: input.provider,
        isActive: input.isActive,
        isMaintenanceMode: input.isMaintenanceMode,
        maxResolutionWidth: input.maxResolutionWidth,
        maxResolutionHeight: input.maxResolutionHeight,
        maxVideoDurationSeconds: input.maxVideoDurationSeconds,
        freeUserDailyLimit: input.freeUserDailyLimit,
        premiumUserDailyLimit: input.premiumUserDailyLimit,
        creditCostOverride: input.creditCostOverride,
        fallbackModelId: input.fallbackModelId,
        costPerRequest: input.costPerRequest,
        priority: input.priority || 0,
        description: input.description,
        coverImageDesktop: input.coverImageDesktop,
        coverImageMobile: input.coverImageMobile,
        coverDescription: input.coverDescription,
      });

      await logActivity(
        ctx.user.id,
        "model.create",
        "aiModelConfig",
        result.insertId,
        null,
        input
      );
      return { success: true, id: result.insertId };
    }),

  updateAiModel: adminProcedure
    .input(
      z.object({
        id: z.number(),
        modelName: z.string().optional(),
        isActive: z
          .union([z.boolean(), z.number()])
          .transform(v => !!v)
          .optional(),
        isMaintenanceMode: z
          .union([z.boolean(), z.number()])
          .transform(v => !!v)
          .optional(),
        maxResolutionWidth: z.number().optional(),
        maxResolutionHeight: z.number().optional(),
        maxVideoDurationSeconds: z.number().nullable().optional(),
        freeUserDailyLimit: z.number().optional(),
        premiumUserDailyLimit: z.number().optional(),
        creditCostOverride: z.number().nullable().optional(),
        fallbackModelId: z.number().nullable().optional(),
        costPerRequest: z.string().optional(),
        priority: z.number().optional(),
        description: z.string().optional(),
        coverImageDesktop: z.string().optional(),
        coverImageMobile: z.string().optional(),
        coverDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db
        .update(aiModelConfig)
        .set(updateData)
        .where(eq(aiModelConfig.id, id));

      await logActivity(
        ctx.user.id,
        "model.update",
        "aiModelConfig",
        id,
        null,
        updateData
      );
      return { success: true };
    }),

  toggleAiModel: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(aiModelConfig)
        .set({ isActive: input.isActive })
        .where(eq(aiModelConfig.id, input.id));
      await logActivity(
        ctx.user.id,
        "model.toggle",
        "aiModelConfig",
        input.id,
        null,
        { isActive: input.isActive }
      );
      return { success: true };
    }),

  // ============ PROMPT BLACKLIST & CONTROL ============
  getPromptBlacklist: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select()
      .from(promptBlacklist)
      .orderBy(desc(promptBlacklist.createdAt));
  }),

  createPromptBlacklist: adminProcedure
    .input(
      z.object({
        pattern: z.string(),
        patternType: z.enum([
          "exact",
          "contains",
          "regex",
          "starts_with",
          "ends_with",
        ]),
        category: z.enum([
          "nsfw",
          "spam",
          "abuse",
          "illegal",
          "copyright",
          "other",
        ]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        actionType: z.enum(["block", "warn", "flag_for_review", "auto_ban"]),
        warningMessage: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [result] = await db.insert(promptBlacklist).values({
        ...input,
        createdBy: ctx.user.id,
      });

      await logActivity(
        ctx.user.id,
        "blacklist.create",
        "promptBlacklist",
        result.insertId,
        null,
        input
      );
      return { success: true, id: result.insertId };
    }),

  updatePromptBlacklist: adminProcedure
    .input(
      z.object({
        id: z.number(),
        pattern: z.string().optional(),
        patternType: z
          .enum(["exact", "contains", "regex", "starts_with", "ends_with"])
          .optional(),
        category: z
          .enum(["nsfw", "spam", "abuse", "illegal", "copyright", "other"])
          .optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        actionType: z
          .enum(["block", "warn", "flag_for_review", "auto_ban"])
          .optional(),
        warningMessage: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db
        .update(promptBlacklist)
        .set(updateData)
        .where(eq(promptBlacklist.id, id));

      await logActivity(
        ctx.user.id,
        "blacklist.update",
        "promptBlacklist",
        id,
        null,
        updateData
      );
      return { success: true };
    }),

  deletePromptBlacklist: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(promptBlacklist).where(eq(promptBlacklist.id, input.id));
      await logActivity(
        ctx.user.id,
        "blacklist.delete",
        "promptBlacklist",
        input.id
      );
      return { success: true };
    }),

  getFlaggedPrompts: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const prompts = await db
        .select({
          id: flaggedPrompts.id,
          userId: flaggedPrompts.userId,
          userName: users.name,
          userEmail: users.email,
          prompt: flaggedPrompts.prompt,
          flagReason: flaggedPrompts.flagReason,
          status: flaggedPrompts.status,
          reviewNotes: flaggedPrompts.reviewNotes,
          createdAt: flaggedPrompts.createdAt,
        })
        .from(flaggedPrompts)
        .leftJoin(users, eq(flaggedPrompts.userId, users.id))
        .orderBy(desc(flaggedPrompts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return prompts;
    }),

  reviewFlaggedPrompt: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected", "banned"]),
        reviewNotes: z.string().optional(),
        banUser: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(flaggedPrompts)
        .set({
          status: input.status,
          reviewNotes: input.reviewNotes,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        })
        .where(eq(flaggedPrompts.id, input.id));

      if (input.banUser && input.status === "banned") {
        const [flagged] = await db
          .select()
          .from(flaggedPrompts)
          .where(eq(flaggedPrompts.id, input.id));
        if (flagged) {
          await db
            .update(users)
            .set({
              isBanned: true,
              bannedAt: new Date(),
              banReason:
                "Prompt abuse: " + (input.reviewNotes || "Tekrarlanan ihlal"),
              bannedBy: ctx.user.id,
            })
            .where(eq(users.id, flagged.userId));
        }
      }

      await logActivity(
        ctx.user.id,
        "prompt.review",
        "flaggedPrompts",
        input.id,
        null,
        input
      );
      return { success: true };
    }),

  // ============ JOB QUEUE MANAGEMENT ============
  getJobQueue: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        jobType: z.string().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      let query = db
        .select({
          id: jobQueue.id,
          userId: jobQueue.userId,
          userName: users.name,
          userEmail: users.email,
          jobType: jobQueue.jobType,
          status: jobQueue.status,
          priority: jobQueue.priority,
          queuedAt: jobQueue.queuedAt,
          startedAt: jobQueue.startedAt,
          completedAt: jobQueue.completedAt,
          attempts: jobQueue.attempts,
          maxAttempts: jobQueue.maxAttempts,
          lastError: jobQueue.lastError,
          actualDurationMs: jobQueue.actualDurationMs,
          modelKey: jobQueue.modelKey,
        })
        .from(jobQueue)
        .leftJoin(users, eq(jobQueue.userId, users.id))
        .orderBy(desc(jobQueue.queuedAt))
        .limit(input.limit)
        .offset(input.offset);

      const jobs = await query;
      return { jobs };
    }),

  getQueueStats: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    const [stats] = await db
      .select({
        queued: sql<number>`SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END)`,
        processing: sql<number>`SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
        cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
        avgDurationMs: sql<number>`AVG(actualDurationMs)`,
      })
      .from(jobQueue);

    return stats;
  }),

  cancelJob: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(jobQueue)
        .set({
          status: "cancelled",
          completedAt: new Date(),
        })
        .where(eq(jobQueue.id, input.id));

      await logActivity(ctx.user.id, "job.cancel", "jobQueue", input.id);
      return { success: true };
    }),

  retryJob: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(jobQueue)
        .set({
          status: "queued",
          attempts: 0,
          lastError: null,
          startedAt: null,
          completedAt: null,
        })
        .where(eq(jobQueue.id, input.id));

      await logActivity(ctx.user.id, "job.retry", "jobQueue", input.id);
      return { success: true };
    }),

  clearCompletedJobs: adminProcedure.mutation(async ({ ctx }) => {
    const db = await requireAdminDb();

    const result = await db
      .delete(jobQueue)
      .where(eq(jobQueue.status, "completed"));
    await logActivity(ctx.user.id, "job.clearCompleted");
    return { success: true, deletedCount: result[0]?.affectedRows || 0 };
  }),

  // Get pending/processing tasks from Kie AI API (video and image generations)
  getKieApiTasks: adminProcedure
    .input(
      z.object({
        checkLiveStatus: z.boolean().default(false),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      // Get pending/processing video generations
      const pendingVideos = await db
        .select({
          id: videoGenerations.id,
          userId: videoGenerations.userId,
          userName: users.name,
          userEmail: users.email,
          prompt: videoGenerations.prompt,
          model: videoGenerations.model,
          mode: videoGenerations.mode,
          duration: videoGenerations.duration,
          status: videoGenerations.status,
          taskId: videoGenerations.taskId,
          creditsCost: videoGenerations.creditsCost,
          createdAt: videoGenerations.createdAt,
          errorMessage: videoGenerations.errorMessage,
        })
        .from(videoGenerations)
        .leftJoin(users, eq(videoGenerations.userId, users.id))
        .where(
          or(
            eq(videoGenerations.status, "pending"),
            eq(videoGenerations.status, "processing")
          )
        )
        .orderBy(desc(videoGenerations.createdAt))
        .limit(input.limit);

      // Get pending/processing image generations
      const pendingImages = await db
        .select({
          id: generatedImages.id,
          userId: generatedImages.userId,
          userName: users.name,
          userEmail: users.email,
          prompt: generatedImages.prompt,
          model: generatedImages.aiModel,
          resolution: generatedImages.resolution,
          status: generatedImages.status,
          taskId: generatedImages.taskId,
          createdAt: generatedImages.createdAt,
          errorMessage: generatedImages.errorMessage,
        })
        .from(generatedImages)
        .leftJoin(users, eq(generatedImages.userId, users.id))
        .where(
          or(
            eq(generatedImages.status, "pending"),
            eq(generatedImages.status, "processing")
          )
        )
        .orderBy(desc(generatedImages.createdAt))
        .limit(input.limit);

      // If checkLiveStatus is true, fetch live status from Kie AI API
      let videoTasks = pendingVideos.map(v => ({
        ...v,
        type: "video" as const,
        liveStatus: null as string | null,
        liveError: null as string | null,
      }));

      let imageTasks = pendingImages.map(i => ({
        ...i,
        type: "image" as const,
        liveStatus: null as string | null,
        liveError: null as string | null,
      }));

      if (input.checkLiveStatus) {
        const { getVideoStatus, getTaskStatus } = await import("../kieAiApi");

        // Check live status for videos (limit to first 10 to avoid API overload)
        for (const video of videoTasks.slice(0, 10)) {
          if (video.taskId) {
            try {
              const modelType = video.model as UnifiedVideoModelType;
              const liveStatus = await getVideoStatus(video.taskId, modelType);
              video.liveStatus = liveStatus.status;
              video.liveError = liveStatus.error || null;
            } catch (e) {
              video.liveError =
                e instanceof Error ? e.message : "API check failed";
            }
          }
        }

        // Check live status for images (Seedream uses generic task API)
        for (const image of imageTasks.slice(0, 10)) {
          if (image.taskId) {
            try {
              const response = await getTaskStatus(image.taskId);
              if (response.code === 200 && response.data) {
                const state = response.data.state;
                if (
                  state === "waiting" ||
                  state === "queuing" ||
                  state === "queueing" ||
                  state === "generating" ||
                  state === "processing"
                ) {
                  image.liveStatus = "processing";
                } else if (state === "success") image.liveStatus = "completed";
                else if (state === "fail") {
                  image.liveStatus = "failed";
                  image.liveError = response.data.failMsg || "Task failed";
                } else image.liveStatus = "pending";
              }
            } catch (e) {
              image.liveError =
                e instanceof Error ? e.message : "API check failed";
            }
          }
        }
      }

      // Calculate stats
      const stats = {
        pendingVideos: pendingVideos.filter(v => v.status === "pending").length,
        processingVideos: pendingVideos.filter(v => v.status === "processing")
          .length,
        pendingImages: pendingImages.filter(i => i.status === "pending").length,
        processingImages: pendingImages.filter(i => i.status === "processing")
          .length,
        totalPending: pendingVideos.length + pendingImages.length,
      };

      return {
        videos: videoTasks,
        images: imageTasks,
        stats,
      };
    }),

  // ============ PAYMENT RECORDS ============
  getPaymentRecords: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        method: z.string().optional(),
        days: z.number().default(30),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Fetch from paymentRecords (Shopier, etc.)
      const paymentRecordsData = await db
        .select({
          id: paymentRecords.id,
          userId: paymentRecords.userId,
          userName: users.name,
          userEmail: users.email,
          packageId: paymentRecords.packageId,
          packageName: paymentRecords.packageName,
          credits: paymentRecords.credits,
          amount: paymentRecords.amount,
          currency: paymentRecords.currency,
          paymentMethod: paymentRecords.paymentMethod,
          paymentProvider: paymentRecords.paymentProvider,
          status: paymentRecords.status,
          discountAmount: paymentRecords.discountAmount,
          cardLastFour: paymentRecords.cardLastFour,
          externalTransactionId: paymentRecords.externalTransactionId,
          createdAt: paymentRecords.createdAt,
          completedAt: paymentRecords.completedAt,
        })
        .from(paymentRecords)
        .leftJoin(users, eq(paymentRecords.userId, users.id))
        .where(gte(paymentRecords.createdAt, startDate))
        .orderBy(desc(paymentRecords.createdAt));

      // Fetch from stripeOrders
      const { stripeOrders, creditPackages } =
        await import("../../drizzle/schema");
      const stripeOrdersData = await db
        .select({
          id: stripeOrders.id,
          userId: stripeOrders.userId,
          userName: users.name,
          userEmail: users.email,
          packageId: stripeOrders.packageId,
          packageName: creditPackages.name,
          credits: stripeOrders.creditsAmount,
          amount: stripeOrders.price,
          currency: stripeOrders.currency,
          paymentMethod: sql<string>`'credit_card'`,
          paymentProvider: sql<string>`'stripe'`,
          status: stripeOrders.status,
          discountAmount: sql<string | null>`NULL`,
          cardLastFour: sql<string | null>`NULL`,
          externalTransactionId: stripeOrders.stripeSessionId,
          createdAt: stripeOrders.createdAt,
          completedAt: stripeOrders.completedAt,
        })
        .from(stripeOrders)
        .leftJoin(users, eq(stripeOrders.userId, users.id))
        .leftJoin(creditPackages, eq(stripeOrders.packageId, creditPackages.id))
        .where(gte(stripeOrders.createdAt, startDate))
        .orderBy(desc(stripeOrders.createdAt));

      // Merge both arrays
      const allPayments = [
        ...paymentRecordsData.map(p => ({
          ...p,
          source: "paymentRecords" as const,
        })),
        ...stripeOrdersData.map(s => ({
          ...s,
          source: "stripeOrders" as const,
        })),
      ];

      // Sort by createdAt descending
      allPayments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply limit and offset
      const paginatedPayments = allPayments.slice(
        input.offset,
        input.offset + input.limit
      );

      return { payments: paginatedPayments };
    }),

  getPaymentStats: adminProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Stats from paymentRecords
      const [paymentRecordsStats] = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0)`,
          totalRevenueUsd: sql<number>`COALESCE(SUM(CASE WHEN status = 'completed' THEN amountUsd ELSE 0 END), 0)`,
          successfulCount: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
          totalCount: sql<number>`COUNT(*)`,
          refundedAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0)`,
          refundedCount: sql<number>`SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END)`,
        })
        .from(paymentRecords)
        .where(gte(paymentRecords.createdAt, startDate));

      // Stats from stripeOrders
      const { stripeOrders } = await import("../../drizzle/schema");
      const [stripeStats] = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'success' THEN price ELSE 0 END), 0)`,
          totalRevenueUsd: sql<number>`0`, // Stripe doesn't have separate USD field
          successfulCount: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
          totalCount: sql<number>`COUNT(*)`,
          refundedAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'refunded' THEN price ELSE 0 END), 0)`,
          refundedCount: sql<number>`SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END)`,
        })
        .from(stripeOrders)
        .where(gte(stripeOrders.createdAt, startDate));

      // Combine stats
      const stats = {
        totalRevenue:
          (paymentRecordsStats.totalRevenue || 0) +
          (stripeStats.totalRevenue || 0),
        totalRevenueUsd: paymentRecordsStats.totalRevenueUsd || 0,
        successfulCount:
          (paymentRecordsStats.successfulCount || 0) +
          (stripeStats.successfulCount || 0),
        totalCount:
          (paymentRecordsStats.totalCount || 0) + (stripeStats.totalCount || 0),
        refundedAmount:
          (paymentRecordsStats.refundedAmount || 0) +
          (stripeStats.refundedAmount || 0),
        refundedCount:
          (paymentRecordsStats.refundedCount || 0) +
          (stripeStats.refundedCount || 0),
      };

      const successRate =
        stats.totalCount > 0 ? stats.successfulCount / stats.totalCount : 0;

      // Package breakdown from paymentRecords
      const packageBreakdownPayments = await db
        .select({
          packageId: paymentRecords.packageId,
          packageName: paymentRecords.packageName,
          credits: paymentRecords.credits,
          saleCount: sql<number>`COUNT(*)`,
          totalRevenue: sql<number>`SUM(amount)`,
        })
        .from(paymentRecords)
        .where(
          and(
            gte(paymentRecords.createdAt, startDate),
            eq(paymentRecords.status, "completed")
          )
        )
        .groupBy(
          paymentRecords.packageId,
          paymentRecords.packageName,
          paymentRecords.credits
        );

      // Package breakdown from stripeOrders
      const { creditPackages } = await import("../../drizzle/schema");
      const packageBreakdownStripe = await db
        .select({
          packageId: stripeOrders.packageId,
          packageName: creditPackages.name,
          credits: stripeOrders.creditsAmount,
          saleCount: sql<number>`COUNT(*)`,
          totalRevenue: sql<number>`SUM(price)`,
        })
        .from(stripeOrders)
        .leftJoin(creditPackages, eq(stripeOrders.packageId, creditPackages.id))
        .where(
          and(
            gte(stripeOrders.createdAt, startDate),
            eq(stripeOrders.status, "success")
          )
        )
        .groupBy(
          stripeOrders.packageId,
          creditPackages.name,
          stripeOrders.creditsAmount
        );

      // Merge package breakdowns
      const packageBreakdownMap = new Map<number, any>();
      [...packageBreakdownPayments, ...packageBreakdownStripe].forEach(pkg => {
        if (pkg.packageId) {
          const existing = packageBreakdownMap.get(pkg.packageId);
          if (existing) {
            existing.saleCount += pkg.saleCount;
            existing.totalRevenue =
              Number(existing.totalRevenue) + Number(pkg.totalRevenue);
          } else {
            packageBreakdownMap.set(pkg.packageId, { ...pkg });
          }
        }
      });
      const packageBreakdown = Array.from(packageBreakdownMap.values());

      // Method breakdown from paymentRecords
      const methodBreakdownPayments = await db
        .select({
          method: paymentRecords.paymentMethod,
          count: sql<number>`COUNT(*)`,
          totalAmount: sql<number>`SUM(amount)`,
          avgAmount: sql<number>`AVG(amount)`,
          successCount: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        })
        .from(paymentRecords)
        .where(gte(paymentRecords.createdAt, startDate))
        .groupBy(paymentRecords.paymentMethod);

      // Add Stripe as a payment method
      const stripeMethodStats = await db
        .select({
          count: sql<number>`COUNT(*)`,
          totalAmount: sql<number>`SUM(price)`,
          avgAmount: sql<number>`AVG(price)`,
          successCount: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
        })
        .from(stripeOrders)
        .where(gte(stripeOrders.createdAt, startDate));

      const methodBreakdown = [
        ...methodBreakdownPayments,
        ...(stripeMethodStats[0]?.count > 0
          ? [
              {
                method: "credit_card",
                count: stripeMethodStats[0].count,
                totalAmount: stripeMethodStats[0].totalAmount,
                avgAmount: stripeMethodStats[0].avgAmount,
                successCount: stripeMethodStats[0].successCount,
              },
            ]
          : []),
      ];

      const methodBreakdownWithRate = methodBreakdown.map(m => ({
        ...m,
        successRate: m.count > 0 ? m.successCount / m.count : 0,
      }));

      return {
        ...stats,
        successRate,
        totalSales: stats.successfulCount,
        packageBreakdown,
        methodBreakdown: methodBreakdownWithRate,
      };
    }),

  refundPayment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db
        .update(paymentRecords)
        .set({
          status: "refunded",
        })
        .where(eq(paymentRecords.id, input.id));

      await logActivity(
        ctx.user.id,
        "payment.refund",
        "paymentRecords",
        input.id
      );
      return { success: true };
    }),

  getFraudAlerts: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    // Get cards used by multiple users
    const duplicateCards = await db
      .select({
        binNumber: paymentRecords.binNumber,
        cardLastFour: paymentRecords.cardLastFour,
        userCount: sql<number>`COUNT(DISTINCT userId)`,
        totalAmount: sql<number>`SUM(amount)`,
      })
      .from(paymentRecords)
      .where(eq(paymentRecords.status, "completed"))
      .groupBy(paymentRecords.binNumber, paymentRecords.cardLastFour)
      .having(sql`COUNT(DISTINCT userId) > 1`);

    const alerts = duplicateCards.map((card, idx) => ({
      id: idx + 1,
      alertType: "Aynı Kart - Farklı Hesaplar",
      description: `Kart ****${card.cardLastFour} (BIN: ${card.binNumber}) ${card.userCount} farklı hesapta kullanılmış`,
      cardLastFour: card.cardLastFour,
      userCount: card.userCount,
      totalAmount: card.totalAmount,
      createdAt: new Date(),
    }));

    return alerts;
  }),

  // ============ ADMIN ROLES & SECURITY ============
  getAdminRoles: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db.select().from(adminRoles).orderBy(asc(adminRoles.name));
  }),

  createAdminRole: adminProcedure
    .input(
      z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string().optional(),
        permissions: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const [result] = await db.insert(adminRoles).values({
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        permissions: input.permissions,
        isActive: true,
      });

      await logActivity(
        ctx.user.id,
        "role.create",
        "adminRoles",
        result.insertId,
        null,
        input
      );
      return { success: true, id: result.insertId };
    }),

  updateAdminRole: adminProcedure
    .input(
      z.object({
        id: z.number(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        permissions: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db.update(adminRoles).set(updateData).where(eq(adminRoles.id, id));

      await logActivity(
        ctx.user.id,
        "role.update",
        "adminRoles",
        id,
        null,
        updateData
      );
      return { success: true };
    }),

  deleteAdminRole: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      await db.delete(adminRoles).where(eq(adminRoles.id, input.id));
      await logActivity(ctx.user.id, "role.delete", "adminRoles", input.id);
      return { success: true };
    }),

  getAdminUsers: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    const admins = await db
      .select({
        id: adminUsersExtended.id,
        userId: adminUsersExtended.userId,
        userName: users.name,
        userEmail: users.email,
        roleId: adminUsersExtended.roleId,
        roleName: adminRoles.displayName,
        twoFactorEnabled: adminUsersExtended.twoFactorEnabled,
        ipWhitelist: adminUsersExtended.ipWhitelist,
        lastLoginAt: adminUsersExtended.lastLoginAt,
        lastLoginIp: adminUsersExtended.lastLoginIp,
      })
      .from(adminUsersExtended)
      .leftJoin(users, eq(adminUsersExtended.userId, users.id))
      .leftJoin(adminRoles, eq(adminUsersExtended.roleId, adminRoles.id));

    // Also get admin users from user table who don't have extended record
    const simpleAdmins = await db
      .select({
        id: users.id,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        roleId: sql<null>`NULL`,
        roleName: sql<string>`'Super Admin'`,
        twoFactorEnabled: sql<boolean>`false`,
        ipWhitelist: sql<null>`NULL`,
        lastLoginAt: users.lastSignedIn,
        lastLoginIp: users.lastKnownIp,
      })
      .from(users)
      .where(eq(users.role, "admin"));

    return [
      ...admins,
      ...simpleAdmins.filter(a => !admins.find(e => e.userId === a.id)),
    ];
  }),

  getRateLimits: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    return await db
      .select()
      .from(systemRateLimits)
      .orderBy(asc(systemRateLimits.limitKey));
  }),

  updateRateLimit: adminProcedure
    .input(
      z.object({
        id: z.number(),
        requestsPerWindow: z.number().optional(),
        windowSizeSeconds: z.number().optional(),
        freeUserMultiplier: z.string().optional(),
        premiumUserMultiplier: z.string().optional(),
        blockDurationSeconds: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const { id, ...updateData } = input;
      await db
        .update(systemRateLimits)
        .set(updateData)
        .where(eq(systemRateLimits.id, id));

      await logActivity(
        ctx.user.id,
        "rateLimit.update",
        "systemRateLimits",
        id,
        null,
        updateData
      );
      return { success: true };
    }),

  getLoginHistory: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const db = await requireAdminDb();

      const history = await db
        .select({
          id: ipLoginHistory.id,
          userId: ipLoginHistory.userId,
          userName: users.name,
          ipAddress: ipLoginHistory.ipAddress,
          country: ipLoginHistory.country,
          city: ipLoginHistory.city,
          deviceType: ipLoginHistory.deviceType,
          browser: ipLoginHistory.browser,
          os: ipLoginHistory.os,
          loginType: ipLoginHistory.loginType,
          isSuccessful: ipLoginHistory.isSuccessful,
          failReason: ipLoginHistory.failReason,
          createdAt: ipLoginHistory.createdAt,
        })
        .from(ipLoginHistory)
        .leftJoin(users, eq(ipLoginHistory.userId, users.id))
        .orderBy(desc(ipLoginHistory.createdAt))
        .limit(input.limit);

      return history;
    }),

  // ============ AI INFLUENCER SETTINGS ============

  getAiInfluencerSettings: adminProcedure.query(async () => {
    const db = await requireAdminDb();

    // Default values
    const defaults = {
      nanoBananaPricing: { "1K": 12, "2K": 18, "4K": 25 },
      qwenPricing: { "1K": 10, "2K": 15, "4K": 20 },
      seedreamPricing: { basic: 8, high: 15 },
      defaultModel: "nano-banana-pro",
      isNanoBananaEnabled: true,
      isQwenEnabled: true,
      isSeedreamEnabled: true,
    };

    try {
      // Get all AI Influencer related settings
      const settingsRows = await db
        .select()
        .from(siteSettings)
        .where(like(siteSettings.key, "ai_influencer_%"));

      const settings: Record<string, string> = {};
      for (const row of settingsRows) {
        settings[row.key] = row.value;
      }

      return {
        nanoBananaPricing: settings.ai_influencer_nano_banana_pricing
          ? JSON.parse(settings.ai_influencer_nano_banana_pricing)
          : defaults.nanoBananaPricing,
        qwenPricing: settings.ai_influencer_qwen_pricing
          ? JSON.parse(settings.ai_influencer_qwen_pricing)
          : defaults.qwenPricing,
        seedreamPricing: settings.ai_influencer_seedream_pricing
          ? JSON.parse(settings.ai_influencer_seedream_pricing)
          : defaults.seedreamPricing,
        defaultModel:
          settings.ai_influencer_default_model || defaults.defaultModel,
        isNanoBananaEnabled:
          settings.ai_influencer_nano_banana_enabled !== "false",
        isQwenEnabled: settings.ai_influencer_qwen_enabled !== "false",
        isSeedreamEnabled: settings.ai_influencer_seedream_enabled !== "false",
      };
    } catch (error) {
      console.error(
        "[AdminPanel] Error fetching AI Influencer settings:",
        error
      );
      return defaults;
    }
  }),

  updateAiInfluencerSettings: adminProcedure
    .input(
      z.object({
        nanoBananaPricing: z.object({
          "1K": z.number(),
          "2K": z.number(),
          "4K": z.number(),
        }),
        qwenPricing: z.object({
          "1K": z.number(),
          "2K": z.number(),
          "4K": z.number(),
        }),
        seedreamPricing: z.object({
          basic: z.number(),
          high: z.number(),
        }),
        defaultModel: z.string().optional(),
        isNanoBananaEnabled: z.boolean(),
        isQwenEnabled: z.boolean(),
        isSeedreamEnabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();

      const settingsToSave = [
        {
          key: "ai_influencer_nano_banana_pricing",
          value: JSON.stringify(input.nanoBananaPricing),
          label: "Nano Banana Fiyatlandırma",
        },
        {
          key: "ai_influencer_qwen_pricing",
          value: JSON.stringify(input.qwenPricing),
          label: "Qwen Fiyatlandırma",
        },
        {
          key: "ai_influencer_seedream_pricing",
          value: JSON.stringify(input.seedreamPricing),
          label: "SeeDream Fiyatlandırma",
        },
        {
          key: "ai_influencer_default_model",
          value: input.defaultModel || "nano-banana-pro",
          label: "Varsayılan Model",
        },
        {
          key: "ai_influencer_nano_banana_enabled",
          value: input.isNanoBananaEnabled ? "true" : "false",
          label: "Nano Banana Aktif",
        },
        {
          key: "ai_influencer_qwen_enabled",
          value: input.isQwenEnabled ? "true" : "false",
          label: "Qwen Aktif",
        },
        {
          key: "ai_influencer_seedream_enabled",
          value: input.isSeedreamEnabled ? "true" : "false",
          label: "SeeDream Aktif",
        },
      ];

      try {
        console.log(
          "[AdminPanel] Saving AI Influencer settings:",
          settingsToSave.map(s => ({ key: s.key, value: s.value }))
        );

        for (const setting of settingsToSave) {
          // Check if exists
          const [existing] = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, setting.key))
            .limit(1);
          console.log(`[AdminPanel] ${setting.key}: exists=${!!existing}`);

          if (existing) {
            await db
              .update(siteSettings)
              .set({ value: setting.value, updatedAt: new Date() })
              .where(eq(siteSettings.key, setting.key));
            console.log(`[AdminPanel] Updated ${setting.key}`);
          } else {
            await db.insert(siteSettings).values({
              key: setting.key,
              value: setting.value,
              category: "general",
              label: setting.label,
              inputType: "json",
              isPublic: false,
            });
            console.log(`[AdminPanel] Inserted ${setting.key}`);
          }
        }

        await logActivity(
          ctx.user.id,
          "aiInfluencer.updateSettings",
          undefined,
          undefined,
          null,
          input
        );

        console.log("[AdminPanel] AI Influencer settings saved successfully");
        return { success: true };
      } catch (error) {
        console.error(
          "[AdminPanel] Error updating AI Influencer settings:",
          error
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ayarlar kaydedilemedi",
        });
      }
    }),
});
