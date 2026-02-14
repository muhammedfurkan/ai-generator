import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb, saveGeneratedImage } from "../db";
import { multiAngleJobs, multiAngleImages, users } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { pollTaskCompletion, createGenerationTask } from "../nanoBananaApi";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";
import { storagePut } from "../storage";
import { createNotification } from "./notification";

// Camera angle configurations - Türkçe isimler ve açı başına 20 kredi
const ANGLE_SETS = {
  temel_4: {
    name: "Temel Set",
    nameTr: "Temel Set (4 Açı)",
    credits: 80, // 4 x 20 kredi
    angles: [
      { en: "front facing portrait", tr: "Önden Portre" },
      { en: "three quarter angle", tr: "Yarım Profil (3/4 Açı)" },
      { en: "side profile", tr: "Yan Profil" },
      { en: "over the shoulder looking back", tr: "Omuz Üstünden Bakış" }
    ]
  },
  standart_6: {
    name: "Standart Set",
    nameTr: "Standart Set (6 Açı)",
    credits: 120, // 6 x 20 kredi
    angles: [
      { en: "front facing portrait", tr: "Önden Portre" },
      { en: "front close-up portrait", tr: "Yakın Çekim Yüz" },
      { en: "three quarter angle left", tr: "Yarım Profil Sol" },
      { en: "three quarter angle right", tr: "Yarım Profil Sağ" },
      { en: "side profile", tr: "Yan Profil" },
      { en: "over the shoulder looking back", tr: "Omuz Üstünden Bakış" }
    ]
  },
  profesyonel_8: {
    name: "Profesyonel Set",
    nameTr: "Profesyonel Set (8 Açı)",
    credits: 160, // 8 x 20 kredi
    angles: [
      { en: "front facing portrait", tr: "Önden Portre" },
      { en: "front close-up portrait", tr: "Yakın Çekim Yüz" },
      { en: "three quarter angle left", tr: "Yarım Profil Sol" },
      { en: "three quarter angle right", tr: "Yarım Profil Sağ" },
      { en: "side profile", tr: "Yan Profil" },
      { en: "over the shoulder looking back", tr: "Omuz Üstünden Bakış" },
      { en: "looking down angle from above", tr: "Yukarıdan Bakış" },
      { en: "full body front view", tr: "Tam Boy Önden" }
    ]
  }
};

// Dynamic prompt generator
function generatePrompt(angleName: string): string {
  return `Recreate the same person from the reference image.
Keep identical face, hairstyle, skin tone, and body proportions.
Preserve the exact outfit, fabric texture, and fit.
Maintain the same environment, lighting, shadows, and color tones.

Camera & framing:
– ${angleName}
– realistic smartphone photo
– natural body posture
– photorealistic, no stylization

IMPORTANT:
Do not change identity.
Do not change outfit.
Do not change environment.
Do not add accessories.
Do not beautify or stylize.`;
}

// Process single image in background
async function processAngleImage(
  imageId: number,
  referenceImageUrl: string,
  prompt: string,
  jobId: number,
  userId: number,
  userEmail: string
) {
  console.log(`[Multi-Angle] Starting processAngleImage for imageId=${imageId}, jobId=${jobId}`);
  
  const db = await getDb();
  if (!db) {
    console.error("[Multi-Angle] Database connection failed in processAngleImage");
    return;
  }
  
  try {
    // Update status to processing
    await db.update(multiAngleImages)
      .set({ status: "processing" })
      .where(eq(multiAngleImages.id, imageId));

    // Submit to Nano Banana Pro
    console.log(`[Multi-Angle] Creating task for imageId=${imageId}`);
    const taskResult = await createGenerationTask({
      prompt,
      aspectRatio: "3:4",
      resolution: "1K",
      referenceImageUrl
    });
    
    if (!taskResult.success || !taskResult.taskId) {
      console.error(`[Multi-Angle] Task creation failed for imageId=${imageId}:`, taskResult.error);
      throw new Error(taskResult.error || "Failed to create task");
    }
    
    const taskId = taskResult.taskId;
    console.log(`[Multi-Angle] Task created for imageId=${imageId}, taskId=${taskId}`);
    
    // Update task ID
    await db.update(multiAngleImages)
      .set({ taskId })
      .where(eq(multiAngleImages.id, imageId));

    // Poll for completion - returns image URL string or null
    console.log(`[Multi-Angle] Starting poll for imageId=${imageId}, taskId=${taskId}`);
    const imageUrl = await pollTaskCompletion(taskId);
    console.log(`[Multi-Angle] Poll completed for imageId=${imageId}, imageUrl=${imageUrl ? 'found' : 'null'}`);
    
    if (imageUrl) {
      console.log(`[Multi-Angle] Downloading image for imageId=${imageId}`);
      // Download and save to S3
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const fileName = `multi-angle/${userId}/${jobId}/${imageId}-${Date.now()}.png`;
      const { url: s3Url } = await storagePut(fileName, imageBuffer, "image/png");

      // Update as completed
      console.log(`[Multi-Angle] Updating imageId=${imageId} as completed, s3Url=${s3Url}`);
      await db.update(multiAngleImages)
        .set({ 
          status: "completed",
          generatedImageUrl: s3Url,
          completedAt: new Date()
        })
        .where(eq(multiAngleImages.id, imageId));
      console.log(`[Multi-Angle] imageId=${imageId} marked as completed`);

      // Save to generatedImages table so it appears in main gallery
      await saveGeneratedImage({
        userId,
        prompt: `Multi-Angle: ${prompt}`,
        referenceImageUrl,
        generatedImageUrl: s3Url,
        aspectRatio: "3:4",
        resolution: "1K",
        creditsCost: 0, // Credits already deducted from job
        status: "completed",
      });
      console.log(`[Multi-Angle] imageId=${imageId} saved to gallery`);

      // Update job completed count
      await db.execute(`
        UPDATE multiAngleJobs 
        SET completedImages = completedImages + 1 
        WHERE id = ${jobId}
      `);

      // Check if job is complete
      const [job] = await db.select().from(multiAngleJobs).where(eq(multiAngleJobs.id, jobId));
      if (job && job.completedImages >= job.totalImages) {
        await db.update(multiAngleJobs)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(multiAngleJobs.id, jobId));
        
        // Send notification
        await createNotification({
          userId,
          type: "generation_complete",
          title: "Çoklu Açı Fotoğraflarınız Hazır!",
          message: `${job.totalImages} fotoğraflık setiniz başarıyla oluşturuldu. Galeri'den indirin.`,
          actionUrl: `/multi-angle/${jobId}`
        });
      }
    } else {
      throw new Error("Generation failed - no image URL returned");
    }
  } catch (error: any) {
    console.error(`Multi-angle image ${imageId} failed:`, error);
    
    await db.update(multiAngleImages)
      .set({ 
        status: "failed",
        errorMessage: error.message || "Unknown error"
      })
      .where(eq(multiAngleImages.id, imageId));

    // Check if all images failed
    const failedImages = await db.select()
      .from(multiAngleImages)
      .where(and(
        eq(multiAngleImages.jobId, jobId),
        eq(multiAngleImages.status, "failed")
      ));
    
    const [job] = await db.select().from(multiAngleJobs).where(eq(multiAngleJobs.id, jobId));
    if (job && failedImages.length === job.totalImages) {
      await db.update(multiAngleJobs)
        .set({ status: "failed", errorMessage: "All images failed to generate" })
        .where(eq(multiAngleJobs.id, jobId));
    } else if (job && (job.completedImages + failedImages.length) >= job.totalImages) {
      await db.update(multiAngleJobs)
        .set({ status: "partial", completedAt: new Date() })
        .where(eq(multiAngleJobs.id, jobId));
    }

    await notifyGenerationFailure({
      generationType: "image",
      errorMessage: error.message || "Multi-angle generation failed",
      userId,
      userEmail,
      prompt: `Multi-angle job ${jobId}`,
      creditsRefunded: 0
    });
  }
}

export const multiAngleRouter = router({
  // Get available angle sets
  getAngleSets: protectedProcedure.query(() => {
    return Object.entries(ANGLE_SETS).map(([key, value]) => ({
      id: key,
      name: value.name,
      nameTr: value.nameTr,
      credits: value.credits,
      angleCount: value.angles.length,
      angles: value.angles.map(a => ({ en: a.en, tr: a.tr }))
    }));
  }),

  // Create new multi-angle job
  create: protectedProcedure
    .input(z.object({
      referenceImageUrl: z.string().url(),
      angleSet: z.enum(["temel_4", "standart_6", "profesyonel_8"])
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const userId = ctx.user.id;
      const userEmail = ctx.user.email || "";
      
      const angleConfig = ANGLE_SETS[input.angleSet];
      const creditsNeeded = angleConfig.credits;

      // Check credits
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. ${creditsNeeded} kredi gerekli, mevcut: ${user?.credits || 0}`
        });
      }

      // Deduct credits
      await db.update(users)
        .set({ credits: user.credits - creditsNeeded })
        .where(eq(users.id, userId));

      // Create job
      const [jobResult] = await db.insert(multiAngleJobs).values({
        userId,
        referenceImageUrl: input.referenceImageUrl,
        angleSet: input.angleSet,
        totalImages: angleConfig.angles.length,
        completedImages: 0,
        creditsCost: creditsNeeded,
        status: "processing"
      });

      const jobId = jobResult.insertId;

      // Create image records for each angle
      const imageRecords = angleConfig.angles.map((angle, index) => ({
        jobId,
        angleIndex: index,
        angleName: angle.tr, // Türkçe isim kaydet
        prompt: generatePrompt(angle.en), // İngilizce prompt kullan
        status: "pending" as const
      }));

      await db.insert(multiAngleImages).values(imageRecords);

      // Get created images
      const images = await db.select()
        .from(multiAngleImages)
        .where(eq(multiAngleImages.jobId, jobId));

      // Start processing each image in background (with staggered delay)
      images.forEach((img, index) => {
        setTimeout(() => {
          processAngleImage(
            img.id,
            input.referenceImageUrl,
            img.prompt,
            jobId,
            userId,
            userEmail
          );
        }, index * 2000); // 2 second delay between each to avoid rate limits
      });

      // Notify credit spending
      await notifyCreditSpending({
        userName: user.name,
        userEmail: user.email,
        creditsSpent: creditsNeeded,
        creditsRemaining: user.credits - creditsNeeded,
        action: `Multi-Angle Photo (${angleConfig.name})`
      });

      return {
        jobId,
        totalImages: angleConfig.angles.length,
        creditsUsed: creditsNeeded,
        message: "Fotoğraf seti oluşturuluyor..."
      };
    }),

  // Get job status
  getStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      const [job] = await db.select()
        .from(multiAngleJobs)
        .where(and(
          eq(multiAngleJobs.id, input.jobId),
          eq(multiAngleJobs.userId, ctx.user.id)
        ));

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const images = await db.select()
        .from(multiAngleImages)
        .where(eq(multiAngleImages.jobId, input.jobId))
        .orderBy(multiAngleImages.angleIndex);

      return {
        job,
        images,
        progress: Math.round((job.completedImages / job.totalImages) * 100)
      };
    }),

  // Get user's job history
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      const jobs = await db.select()
        .from(multiAngleJobs)
        .where(eq(multiAngleJobs.userId, ctx.user.id))
        .orderBy(desc(multiAngleJobs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return jobs;
    }),

  // Get completed images for download
  getDownloadUrls: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      const [job] = await db.select()
        .from(multiAngleJobs)
        .where(and(
          eq(multiAngleJobs.id, input.jobId),
          eq(multiAngleJobs.userId, ctx.user.id)
        ));

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const images = await db.select()
        .from(multiAngleImages)
        .where(and(
          eq(multiAngleImages.jobId, input.jobId),
          eq(multiAngleImages.status, "completed")
        ))
        .orderBy(multiAngleImages.angleIndex);

      return {
        job,
        images: images.map(img => ({
          id: img.id,
          angleName: img.angleName,
          url: img.generatedImageUrl
        }))
      };
    }),

  // Sync pending tasks from Kie API
  syncPendingTasks: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Get job and verify ownership
      const [job] = await db.select()
        .from(multiAngleJobs)
        .where(and(
          eq(multiAngleJobs.id, input.jobId),
          eq(multiAngleJobs.userId, ctx.user.id)
        ));

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      // Get all processing images with taskIds
      const processingImages = await db.select()
        .from(multiAngleImages)
        .where(and(
          eq(multiAngleImages.jobId, input.jobId),
          eq(multiAngleImages.status, "processing")
        ));

      if (processingImages.length === 0) {
        return { synced: 0, message: "No pending tasks to sync" };
      }

      let syncedCount = 0;
      let failedCount = 0;

      for (const img of processingImages) {
        if (!img.taskId) continue;

        try {
          // Check task status from Kie API
          const { getTaskStatus } = await import("../nanoBananaApi");
          const status = await getTaskStatus(img.taskId);

          if (status?.code === 200 && status.data?.state === "success" && status.data.resultJson) {
            // Parse resultJson
            let result: Record<string, unknown>;
            if (typeof status.data.resultJson === "string") {
              result = JSON.parse(status.data.resultJson);
            } else {
              result = status.data.resultJson as Record<string, unknown>;
            }

            const imageUrls = (result.resultUrls || result.images) as string[];
            if (imageUrls && imageUrls.length > 0) {
              const imageUrl = imageUrls[0];

              // Download and save to S3
              const imageResponse = await fetch(imageUrl);
              const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
              const fileName = `multi-angle/${ctx.user.id}/${input.jobId}/${img.id}-${Date.now()}.png`;
              const { url: s3Url } = await storagePut(fileName, imageBuffer, "image/png");

              // Update database
              await db.update(multiAngleImages)
                .set({ 
                  status: "completed",
                  generatedImageUrl: s3Url,
                  completedAt: new Date()
                })
                .where(eq(multiAngleImages.id, img.id));

              // Update job completed count
              await db.execute(`
                UPDATE multiAngleJobs 
                SET completedImages = completedImages + 1 
                WHERE id = ${input.jobId}
              `);

              syncedCount++;
              console.log(`[Multi-Angle Sync] Synced imageId=${img.id}, taskId=${img.taskId}`);
            }
          } else if (status?.data?.state === "fail") {
            await db.update(multiAngleImages)
              .set({ 
                status: "failed",
                errorMessage: status.data.failMsg || "Task failed"
              })
              .where(eq(multiAngleImages.id, img.id));
            failedCount++;
          }
        } catch (error: any) {
          console.error(`[Multi-Angle Sync] Error syncing imageId=${img.id}:`, error.message);
        }
      }

      // Check if job is now complete
      const [updatedJob] = await db.select().from(multiAngleJobs).where(eq(multiAngleJobs.id, input.jobId));
      if (updatedJob && updatedJob.completedImages >= updatedJob.totalImages) {
        await db.update(multiAngleJobs)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(multiAngleJobs.id, input.jobId));
      } else if (updatedJob && (updatedJob.completedImages + failedCount) >= updatedJob.totalImages) {
        await db.update(multiAngleJobs)
          .set({ status: "partial", completedAt: new Date() })
          .where(eq(multiAngleJobs.id, input.jobId));
      }

      return { 
        synced: syncedCount, 
        failed: failedCount,
        message: `${syncedCount} görsel senkronize edildi${failedCount > 0 ? `, ${failedCount} başarısız` : ''}` 
      };
    })
});
