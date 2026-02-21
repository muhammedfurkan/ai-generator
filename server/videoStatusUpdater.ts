// Video Status Updater - Background job to check and update video statuses
import { getDb } from "./db";
import { videoGenerations } from "../drizzle/schema";
import { eq, inArray, and, or } from "drizzle-orm";
import { getVideoStatus, type UnifiedVideoModelType } from "./kieAiApi";
import * as db from "./db";
import { createNotification } from "./routers/notification";
import { getVideoDuration } from "./_core/videoMetadata";

/**
 * Motion Control için kredi iadesi kontrolü
 * Video tamamlandığında gerçek süreyi tespit edip fazla kesilen krediyi iade eder
 */
async function checkAndRefundMotionControlCredits(
  videoId: number,
  userId: number,
  estimatedDuration: number,
  quality: string,
  totalCreditsCost: number,
  actualDuration?: number
): Promise<number> {
  try {
    const baseRate = quality === "high" ? 8 : 5;
    const estimatedCost = baseRate * estimatedDuration;

    // Eğer API'den gerçek süre bilgisi gelmişse, onu kullan
    if (actualDuration && actualDuration > 0) {
      // Gerçek süreyi yuvarla (API ondalık değer dönebilir)
      const roundedActualDuration = Math.ceil(actualDuration);
      const actualCost = baseRate * roundedActualDuration;
      const refundAmount = estimatedCost - actualCost;

      if (refundAmount > 0) {
        await db.refundCredits(
          userId,
          refundAmount,
          `Motion Control otomatik iade - Tahmin: ${estimatedDuration}s, Gerçek: ~${roundedActualDuration}s`
        );

        // Kullanıcıya bildirim gönder
        await createNotification({
          userId,
          type: "system",
          title: "Kredi İadesi ✅",
          message: `Motion Control videonuz için ${refundAmount} kredi iade edildi. Video gerçek süresi ${roundedActualDuration}s olarak tespit edildi.`,
          data: {
            videoId,
            refundAmount,
            estimatedDuration,
            actualDuration: roundedActualDuration,
          },
        });

        console.log(
          `[MotionControl] Refund: Video ${videoId} - Estimated: ${estimatedDuration}s (${estimatedCost} cr), Actual: ${roundedActualDuration}s (${actualCost} cr), Refunded: ${refundAmount} cr`
        );

        return refundAmount;
      } else {
        console.log(
          `[MotionControl] No refund needed for video ${videoId} - Estimated: ${estimatedDuration}s, Actual: ${roundedActualDuration}s`
        );
      }
    } else {
      // API'den süre bilgisi gelmemişse, log yaz ama işlem yapma
      console.warn(
        `[MotionControl] No actual duration received from API for video ${videoId}. Cannot calculate refund accurately.`
      );
    }

    return 0;
  } catch (error) {
    console.error(
      `[VideoStatusUpdater] Error in checkAndRefundMotionControlCredits:`,
      error
    );
    return 0;
  }
}

const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CONCURRENT_CHECKS = 5;

interface PendingVideo {
  id: number;
  taskId: string;
  model: string;
  userId: number;
  creditsCost: number;
  status: string;
  duration?: number;
  quality?: string;
}

async function getPendingVideos(): Promise<PendingVideo[]> {
  const dbConn = await getDb();
  if (!dbConn) return [];

  try {
    const videos = await dbConn
      .select({
        id: videoGenerations.id,
        taskId: videoGenerations.taskId,
        model: videoGenerations.model,
        userId: videoGenerations.userId,
        creditsCost: videoGenerations.creditsCost,
        status: videoGenerations.status,
        duration: videoGenerations.duration,
        quality: videoGenerations.quality,
      })
      .from(videoGenerations)
      .where(
        or(
          eq(videoGenerations.status, "pending"),
          eq(videoGenerations.status, "processing")
        )
      )
      .limit(MAX_CONCURRENT_CHECKS);

    return videos.filter(v => v.taskId) as PendingVideo[];
  } catch (error) {
    console.error("[VideoStatusUpdater] Error fetching pending videos:", error);
    return [];
  }
}

async function updateVideoStatus(video: PendingVideo): Promise<void> {
  try {
    const modelType = video.model as UnifiedVideoModelType;
    const status = await getVideoStatus(video.taskId, modelType);

    console.log(
      `[VideoStatusUpdater] Video ${video.id} (${video.model}): ${video.status} -> ${status.status}`
    );

    if (status.status !== video.status) {
      await db.updateVideoGenerationStatus(video.id, status.status, {
        videoUrl: status.videoUrl,
        errorMessage: status.error,
      });

      // Refund credits if video generation failed
      if (status.status === "failed" && video.creditsCost > 0) {
        console.log(
          `[VideoStatusUpdater] Video ${video.id} failed, refunding ${video.creditsCost} credits to user ${video.userId}`
        );
        await db.refundCredits(
          video.userId,
          video.creditsCost,
          `Video oluşturma başarısız - ${video.model}`
        );
      }

      if (status.status === "completed") {
        console.log(
          `[VideoStatusUpdater] Video ${video.id} completed! URL: ${status.videoUrl}`
        );

        // Motion Control için kredi iadesi kontrolü
        if (
          video.model === "kling-motion" &&
          status.videoUrl &&
          video.duration &&
          video.quality
        ) {
          try {
            let actualDuration = status.actualDuration;

            // Eğer API'den actualDuration gelmediyse, video URL'den tespit et
            if (!actualDuration && status.videoUrl) {
              console.log(
                `[VideoStatusUpdater] Motion Control: API didn't provide duration, fetching from video URL...`
              );
              const detectedDuration = await getVideoDuration(status.videoUrl);
              actualDuration = detectedDuration ?? undefined;

              if (actualDuration) {
                console.log(
                  `[VideoStatusUpdater] Motion Control: Duration detected from video: ${actualDuration}s`
                );
              } else {
                console.warn(
                  `[VideoStatusUpdater] Motion Control: Could not detect duration from video URL. Trying to infer from model name...`
                );

                // Fallback: Model isminden süreyi tahmin etmeye çalış (örn: kling-2.6-motion-5s -> 5)
                const durationMatch = video.model.match(/-(\d+)s$/);
                if (durationMatch) {
                  actualDuration = parseInt(durationMatch[1]);
                  console.log(
                    `[VideoStatusUpdater] Motion Control: Inferred duration from model name: ${actualDuration}s`
                  );
                }
              }
            }

            const refundAmount = await checkAndRefundMotionControlCredits(
              video.id,
              video.userId,
              video.duration,
              video.quality,
              video.creditsCost,
              actualDuration
            );

            if (refundAmount > 0) {
              console.log(
                `[VideoStatusUpdater] Motion Control: Refunded ${refundAmount} credits to user ${video.userId}`
              );
            }
          } catch (error) {
            console.error(
              `[VideoStatusUpdater] Error checking Motion Control credits:`,
              error
            );
          }
        }

        // Kullanıcıya bildirim gönder
        await createNotification({
          userId: video.userId,
          type: "generation_complete",
          title: "Videonuz Hazır! 🎬",
          message: `${video.model.toUpperCase()} ile oluşturduğunuz video tamamlandı. Galeriden izleyebilirsiniz.`,
          actionUrl: "/gallery",
          data: { videoId: video.id, model: video.model },
        });
      }

      if (status.status === "failed") {
        // Başarısız video için bildirim gönder
        await createNotification({
          userId: video.userId,
          type: "system",
          title: "Video Oluşturulamadı ❌",
          message: `${video.model.toUpperCase()} ile video oluşturma başarısız oldu. ${video.creditsCost} kredi iade edildi.`,
          actionUrl: "/video-generate",
          data: { videoId: video.id, model: video.model, error: status.error },
        });
      }
    }
  } catch (error) {
    console.error(
      `[VideoStatusUpdater] Error updating video ${video.id}:`,
      error
    );
  }
}

async function checkAllPendingVideos(): Promise<void> {
  const pendingVideos = await getPendingVideos();

  if (pendingVideos.length === 0) {
    return;
  }

  console.log(
    `[VideoStatusUpdater] Checking ${pendingVideos.length} pending videos...`
  );

  // Process videos in parallel (with limit)
  await Promise.all(pendingVideos.map(updateVideoStatus));
}

let intervalId: NodeJS.Timeout | null = null;

export function startVideoStatusUpdater(): void {
  if (intervalId) {
    console.log("[VideoStatusUpdater] Already running");
    return;
  }

  console.log(
    `[VideoStatusUpdater] Starting background job (interval: ${CHECK_INTERVAL / 1000}s)`
  );

  // Run immediately on start
  checkAllPendingVideos().catch(console.error);

  // Then run periodically
  intervalId = setInterval(() => {
    checkAllPendingVideos().catch(console.error);
  }, CHECK_INTERVAL);
}

export function stopVideoStatusUpdater(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[VideoStatusUpdater] Stopped");
  }
}
