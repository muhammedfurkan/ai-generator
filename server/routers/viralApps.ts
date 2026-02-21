// @ts-nocheck
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { VIRAL_APP_TEMPLATES } from "../../shared/const";
import { generateVeo31Video, getVeo31Status } from "../kieAiApi";
import {
  createVideoGeneration,
  getVideoGenerationById,
  getUserVideoGenerations,
  updateVideoGenerationStatus,
  getDb,
} from "../db";
import { viralAppsConfig } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

// Unified ViralApp interface
interface ViralApp {
  id: string;
  title: string;
  description: string;
  prompt: string;
  credits: number;
  category: string;
  popular: boolean;
  coverImage?: string;
  emoji?: string;
}

// Get all viral apps from database AND static templates merged
async function getViralAppsFromDb(): Promise<ViralApp[]> {
  const db = await getDb();
  if (!db) {
    // Fallback to static templates - spread to create mutable copy
    return [...VIRAL_APP_TEMPLATES];
  }

  try {
    const dbApps = await db
      .select()
      .from(viralAppsConfig)
      .where(eq(viralAppsConfig.isActive, true))
      .orderBy(asc(viralAppsConfig.sortOrder), asc(viralAppsConfig.name));

    // Map database apps to unified interface
    const dbAppsFormatted: ViralApp[] = dbApps.map(app => ({
      id: app.appKey,
      title: app.name,
      description: app.description || "",
      prompt: app.promptTemplate || "",
      credits: app.credits,
      category: app.category || "general",
      popular: app.isPopular,
      coverImage: app.coverImage || `/apps/${app.appKey}.png`,
      emoji: app.emoji || undefined,
    }));

    // Get IDs of database apps
    const dbAppIds = new Set(dbAppsFormatted.map(app => app.id));

    // Filter static templates that are not in database
    const staticAppsNotInDb = VIRAL_APP_TEMPLATES.filter(
      app => !dbAppIds.has(app.id)
    );

    // Merge: database apps first, then static templates
    return [...dbAppsFormatted, ...staticAppsNotInDb];
  } catch (error) {
    console.error("[ViralApps] Error fetching from database:", error);
    return [...VIRAL_APP_TEMPLATES];
  }
}

// Get a specific viral app by ID
async function getViralAppById(appId: string): Promise<ViralApp | null> {
  const db = await getDb();
  if (!db) {
    const staticApp = VIRAL_APP_TEMPLATES.find(a => a.id === appId);
    return staticApp || null;
  }

  try {
    const [dbApp] = await db
      .select()
      .from(viralAppsConfig)
      .where(eq(viralAppsConfig.appKey, appId))
      .limit(1);

    if (dbApp) {
      return {
        id: dbApp.appKey,
        title: dbApp.name,
        description: dbApp.description || "",
        prompt: dbApp.promptTemplate || "",
        credits: dbApp.credits,
        category: dbApp.category || "general",
        popular: dbApp.isPopular,
        coverImage: dbApp.coverImage || `/apps/${dbApp.appKey}.png`,
        emoji: dbApp.emoji || undefined,
      };
    }

    // Fallback to static template
    const staticApp = VIRAL_APP_TEMPLATES.find(a => a.id === appId);
    return staticApp || null;
  } catch (error) {
    console.error("[ViralApps] Error fetching app from database:", error);
    const staticApp = VIRAL_APP_TEMPLATES.find(a => a.id === appId);
    return staticApp || null;
  }
}

export const viralAppsRouter = router({
  // List all available viral apps
  list: protectedProcedure.query(async () => {
    const apps = await getViralAppsFromDb();
    return apps.map(app => ({
      ...app,
      coverImage: app.coverImage || `/apps/${app.id}.png`,
    }));
  }),

  // Get a specific app by ID
  getById: protectedProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ input }) => {
      const app = await getViralAppById(input.appId);
      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Uygulama bulunamadı",
        });
      }
      return {
        ...app,
        coverImage: app.coverImage || `/apps/${app.id}.png`,
      };
    }),

  // Generate video using a viral app template
  generate: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { appId, imageUrl } = input;
      const userId = ctx.user.id;

      // Find the app from database
      const app = await getViralAppById(appId);
      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Uygulama bulunamadı",
        });
      }

      // Check user credits
      const creditCost = app.credits;
      if (ctx.user.credits < creditCost) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Yetersiz kredi. Bu uygulama ${creditCost} kredi gerektiriyor.`,
        });
      }

      try {
        // Create video generation record
        const videoRecordId = await createVideoGeneration({
          userId,
          model: "veo3_fast",
          prompt: app.prompt,
          mode: "image-to-video",
          referenceImageUrl: imageUrl,
          duration: 5, // Default 5 seconds
          creditsCost: creditCost,
        });

        if (!videoRecordId) {
          throw new Error("Video kaydı oluşturulamadı");
        }

        // Start video generation with Veo 3.1
        const result = await generateVeo31Video({
          prompt: app.prompt,
          imageUrls: [imageUrl],
          aspectRatio: "9:16", // Portrait for social media
          model: "veo3_fast",
          generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
        });

        const taskId = result.data?.taskId;
        if (!taskId) {
          throw new Error("Task ID alınamadı");
        }

        // Update record status to processing and save taskId
        await updateVideoGenerationStatus(videoRecordId, "processing", {
          taskId,
        });

        return {
          success: true,
          videoId: videoRecordId,
          taskId,
          creditCost,
          message: "Video oluşturma başlatıldı",
        };
      } catch (error: any) {
        console.error("Viral app generation error:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Video oluşturma başlatılamadı: " +
            (error.message || "Bilinmeyen hata"),
        });
      }
    }),

  // Check video generation status
  checkStatus: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .query(async ({ ctx, input }) => {
      const video = await getVideoGenerationById(input.videoId);

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video bulunamadı" });
      }

      if (video.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu videoya erişim izniniz yok",
        });
      }

      // If already completed or failed, return current status
      if (video.status === "completed" || video.status === "failed") {
        return {
          status: video.status,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
        };
      }

      // Check status from Veo API
      if (video.taskId) {
        try {
          const statusResult = await getVeo31Status(video.taskId);
          console.log(
            "[ViralApps] Status check result:",
            JSON.stringify(statusResult)
          );

          // VeoStatusResponse: successFlag 0=processing, 1=success, 2/3=failed
          if (statusResult.data?.successFlag === 1) {
            let videoUrl: string | undefined;

            // Yeni format: response.resultUrls (array)
            if (
              statusResult.data?.response?.resultUrls &&
              Array.isArray(statusResult.data.response.resultUrls)
            ) {
              videoUrl = statusResult.data.response.resultUrls[0];
            }
            // Eski format: data.resultUrls (string veya JSON string)
            else if (statusResult.data?.resultUrls) {
              const resultUrls = statusResult.data.resultUrls;
              try {
                const urls = JSON.parse(resultUrls);
                videoUrl = Array.isArray(urls) ? urls[0] : urls;
              } catch {
                videoUrl = resultUrls;
              }
            }

            if (videoUrl) {
              console.log("[ViralApps] Video completed, URL:", videoUrl);
              await updateVideoGenerationStatus(video.id, "completed", {
                videoUrl,
              });

              return {
                status: "completed",
                videoUrl,
                thumbnailUrl: video.thumbnailUrl,
              };
            }
          } else if (
            statusResult.data?.successFlag === 2 ||
            statusResult.data?.successFlag === 3
          ) {
            const errorMsg =
              statusResult.data?.errorMessage ||
              statusResult.msg ||
              "Video oluşturma başarısız";
            console.log("[ViralApps] Video failed:", errorMsg);
            await updateVideoGenerationStatus(video.id, "failed", {
              errorMessage: errorMsg,
            });

            return {
              status: "failed",
              error: errorMsg,
            };
          }
        } catch (error: any) {
          console.error("[ViralApps] Status check error:", error);
        }
      }

      return {
        status: video.status,
        videoUrl: null,
        thumbnailUrl: null,
      };
    }),

  // Get user's viral app video history
  history: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const videos = await getUserVideoGenerations(
        ctx.user.id,
        input.limit,
        input.offset
      );
      return {
        videos: videos.filter(
          (v: any) => v.model === "veo3.1-fast" || v.model === "veo3_fast"
        ), // Only viral app videos
        total: videos.length,
      };
    }),
});
