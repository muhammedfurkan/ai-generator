import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  deductCredits,
  refundCredits,
  saveGeneratedImage,
  getUserGeneratedImages,
  getUserGeneratedImagesCount,
  getUserById,
  getGeneratedImageById,
  updateGeneratedImageStatus,
  getPendingImages,
  updateAiModelStats
} from "../db";
import { createGenerationTask, pollTaskCompletionWithError } from "../nanoBananaApi";
import { translateApiError } from "../utils/errorTranslations";
import {
  generateSeedreamImage,
  generateSeedreamEditImage,
  getSeedreamImageStatus,
  SeedreamAspectRatio,
  SeedreamQuality,
  generateFlux2ProImage,
  generate4oImage,
  generateFluxKontextImage,
  generateImagen4Image,
  generateIdeogramV3Image,
  generateIdeogramCharacterImage,
  generateQwenImage,
  generateZImage,
  generateGrokImagineImage,
  generateGPTImage,
  // New model functions
  generateFlux11ProImage,
  generateFlux11UltraImage,
  generateRecraftV3Image,
  generateRecraft20BImage,
  generateQwenImageEdit,
  generateQwenImageToImage,
  generateNanoBananaEdit,
  generateIdeogramCharacterEdit,
  generateIdeogramCharacterRemix,
  getGenericImageStatus,
  calculateImageModelCreditCost
} from "../kieAiApi";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { notifyCreditSpending, notifyGenerationFailure, sendGeneratedImageToTelegram } from "../telegramBot";
import { createNotification } from "./notification";

// AI Model types
export type AIModel =
  | "qwen"
  | "seedream"
  | "nano-banana-pro"
  | "flux-2-pro"
  | "4o-image"
  | "flux-kontext-pro"
  | "google-imagen4"
  | "ideogram-v3"
  | "ideogram-character"
  | "qwen-image"
  | "z-image"
  | "grok-imagine"
  | "gpt-image-1.5"
  | "seedream-edit"
  // New models
  | "flux-1.1-pro"
  | "flux-1.1-pro-ultra"
  | "recraft-v3"
  | "recraft-20b"
  | "qwen-image-edit"
  | "qwen-image-to-image"
  | "nano-banana-edit"
  | "ideogram-character-edit"
  | "ideogram-character-remix"
  // Aliases used by aiModelConfig records
  | "qwen/text-to-image"
  | "qwen/image-edit"
  | "qwen/image-to-image";

const AI_MODEL_ALIASES: Partial<Record<AIModel, AIModel>> = {
  "qwen/text-to-image": "qwen",
  "qwen/image-edit": "qwen-image-edit",
  "qwen/image-to-image": "qwen-image-to-image",
};

function normalizeAiModel(aiModel: AIModel): AIModel {
  return AI_MODEL_ALIASES[aiModel] || aiModel;
}

// Default kredi maliyetleri (veritabanında yoksa kullanılır)
const DEFAULT_QWEN_CREDIT_COSTS: Record<string, number> = {
  "1K": 10,
  "2K": 15,
  "4K": 20,
};

const DEFAULT_NANO_BANANA_PRO_CREDIT_COSTS: Record<string, number> = {
  "1K": 12,
  "2K": 18,
  "4K": 25,
};

const DEFAULT_SEEDREAM_CREDIT_COSTS: Record<string, number> = {
  "basic": 8,  // 2K output
  "high": 15,  // 4K output
};

// Veritabanından fiyatları çek - öncelik: siteSettings (AI Influencer Admin) > defaults
async function getAiInfluencerPricing(): Promise<{
  nanoBanana: Record<string, number>;
  qwen: Record<string, number>;
  seedream: Record<string, number>;
}> {
  try {
    const { getDb } = await import("../db");
    const { siteSettings } = await import("../../drizzle/schema");
    const { like } = await import("drizzle-orm");

    const db = await getDb();
    if (!db) {
      console.log("[Generation] DB not available, using defaults");
      return {
        nanoBanana: DEFAULT_NANO_BANANA_PRO_CREDIT_COSTS,
        qwen: DEFAULT_QWEN_CREDIT_COSTS,
        seedream: DEFAULT_SEEDREAM_CREDIT_COSTS,
      };
    }

    // siteSettings tablosundan oku (AI Influencer admin sayfası)
    const settingsRows = await db.select()
      .from(siteSettings)
      .where(like(siteSettings.key, "ai_influencer_%"));

    // Parse settings
    let nanoBananaPricing = DEFAULT_NANO_BANANA_PRO_CREDIT_COSTS;

    for (const row of settingsRows) {
      if (row.key === "ai_influencer_nano_banana_pricing" && row.value) {
        try {
          nanoBananaPricing = JSON.parse(row.value);
        } catch (e) {
          console.error("[Generation] Error parsing nano banana pricing:", e);
        }
      }
    }

    return {
      nanoBanana: nanoBananaPricing,
      qwen: DEFAULT_QWEN_CREDIT_COSTS,
      seedream: DEFAULT_SEEDREAM_CREDIT_COSTS,
    };
  } catch (error) {
    console.error("[Generation] Error fetching pricing from database:", error);
    return {
      nanoBanana: DEFAULT_NANO_BANANA_PRO_CREDIT_COSTS,
      qwen: DEFAULT_QWEN_CREDIT_COSTS,
      seedream: DEFAULT_SEEDREAM_CREDIT_COSTS,
    };
  }
}

async function getCreditsForResolution(resolution: string, aiModel: AIModel = "nano-banana-pro"): Promise<number> {
  const pricing = await getAiInfluencerPricing();

  if (aiModel === "seedream" || aiModel === "seedream-edit") {
    // Seedream için resolution'u quality'ye çevir
    const quality = resolution === "4K" ? "high" : "basic";
    return pricing.seedream[quality] || 8;
  }
  if (aiModel === "nano-banana-pro") {
    return pricing.nanoBanana[resolution] || 12;
  }
  if (aiModel === "qwen") {
    return pricing.qwen[resolution] || 10;
  }

  // New Kie.ai models
  const kieAiModelMap: Record<string, string> = {
    "flux-2-pro": "flux-2/pro-image-to-image",
    "4o-image": "4o-image",
    "flux-kontext-pro": "flux-kontext-pro",
    "google-imagen4": "google/imagen4-fast",
    "ideogram-v3": "ideogram/v3-reframe",
    "ideogram-character": "ideogram/character",
    "qwen-image": "qwen/text-to-image",
    "z-image": "z-image",
    "grok-imagine": "grok-imagine/text-to-image",
    "gpt-image-1.5": "gpt-image/1.5-text-to-image",
    // New models
    "flux-1.1-pro": "flux-1.1-pro",
    "flux-1.1-pro-ultra": "flux-1.1-pro-ultra",
    "recraft-v3": "recraft-v3",
    "recraft-20b": "recraft-20b",
    "qwen-image-edit": "qwen/image-edit",
    "qwen-image-to-image": "qwen/image-to-image",
    "nano-banana-edit": "google/nano-banana-edit",
    "ideogram-character-edit": "ideogram/character-edit",
    "ideogram-character-remix": "ideogram/character-remix",
  };

  const modelKey = kieAiModelMap[aiModel];
  if (modelKey) {
    return calculateImageModelCreditCost(modelKey);
  }

  return 10;
}

// Seedream için resolution'u quality'ye çevir
function resolutionToSeedreamQuality(resolution: string): SeedreamQuality {
  return resolution === "4K" ? "high" : "basic";
}

// Arka planda görsel işleme fonksiyonu
async function processImageInBackground(
  imageId: number,
  taskId: string,
  userId: number,
  userName: string | null,
  userEmail: string | null,
  prompt: string,
  resolution: string,
  aspectRatio: string,
  creditsNeeded: number,
  aiModel: AIModel = "nano-banana-pro"
) {
  const startTime = Date.now();
  try {
    console.log(`[Background] Processing image ${imageId}, task ${taskId}, model: ${aiModel}`);

    // Update status to processing
    await updateGeneratedImageStatus(imageId, "processing");

    // Poll for completion based on AI model
    let imageUrl: string | null = null;
    let errorDetails: string | null = null;

    if (aiModel === "seedream" || aiModel === "seedream-edit") {
      // Seedream polling
      const maxAttempts = 60; // 5 dakika
      for (let i = 0; i < maxAttempts; i++) {
        const status = await getSeedreamImageStatus(taskId);
        if (status.status === "completed" && status.imageUrl) {
          imageUrl = status.imageUrl;
          break;
        } else if (status.status === "failed") {
          errorDetails = status.error || "Bilinmeyen hata";
          console.error(`[Background] Seedream failed: ${errorDetails}`);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle
      }
    } else if ([
      "flux-2-pro", "4o-image", "flux-kontext-pro", "google-imagen4",
      "ideogram-v3", "ideogram-character", "qwen-image", "z-image",
      "grok-imagine", "gpt-image-1.5", "qwen",
      // New models
      "flux-1.1-pro", "flux-1.1-pro-ultra", "recraft-v3", "recraft-20b",
      "qwen-image-edit", "qwen-image-to-image", "nano-banana-edit",
      "ideogram-character-edit", "ideogram-character-remix"
    ].includes(aiModel)) {
      // New Kie.ai models polling
      const maxAttempts = 60;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const status = await getGenericImageStatus(taskId);
          if (status.status === "completed" && status.imageUrl) {
            imageUrl = status.imageUrl;
            break;
          } else if (status.status === "failed") {
            errorDetails = status.error || "Bilinmeyen hata";
            console.error(`[Background] ${aiModel} failed: ${errorDetails}`);
            break;
          }
        } catch (pollError) {
          console.warn(`[Background] Polling error for ${taskId}:`, pollError);
          // Don't break loop immediately, retry
          if (i === maxAttempts - 1) {
            errorDetails = pollError instanceof Error ? pollError.message : "Durum kontrol hatası";
          }
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } else {
      // Nano Banana Pro veya Qwen polling (ikisi de aynı API'yi kullanıyor)
      const pollResult = await pollTaskCompletionWithError(taskId);
      imageUrl = pollResult.imageUrl;
      errorDetails = pollResult.error;
    }

    if (!imageUrl) {
      // Determine error message - use API error if available, otherwise timeout
      const errorMessage = errorDetails || "TIMEOUT - Görsel üretimi zaman aşımına uğradı";

      console.error(`[Background] No image URL for task ${taskId}. Error: ${errorMessage}`);
      await updateGeneratedImageStatus(imageId, "failed", {
        errorMessage: errorMessage
      });
      await refundCredits(userId, creditsNeeded, `Görsel oluşturma başarısız - ${resolution}`);

      // Create user-friendly notification message
      let notificationMessage = "Görsel üretimi başarısız oldu. Krediniz iade edildi.";
      if (errorDetails) {
        if (errorDetails.includes("CONTENT_POLICY")) {
          notificationMessage = "İçerik politikası ihlali nedeniyle görsel oluşturulamadı. Krediniz iade edildi.";
        } else if (errorDetails.includes("NSFW")) {
          notificationMessage = "NSFW (Uygunsuz İçerik) tespit edildi. Lütfen promptunuzu değiştirin. Krediniz iade edildi.";
        } else if (errorDetails.includes("TIMEOUT")) {
          notificationMessage = "Görsel üretimi zaman aşımına uğradı. Lütfen tekrar deneyin. Krediniz iade edildi.";
        } else if (errorDetails.includes("API_LIMIT")) {
          notificationMessage = "API limiti aşıldı. Lütfen daha sonra tekrar deneyin. Krediniz iade edildi.";
        } else if (errorDetails.includes("recordInfo is null")) {
          notificationMessage = "Servis sağlayıcı hatası (Durum Bilgisi Alınamadı). Krediniz iade edildi.";
          // Clean up technical error for user display but keep in logs
          errorDetails = "Servis sağlayıcı hatası (API Yanıt Sorunu)";
        }
      }

      await createNotification({
        userId,
        title: "Görsel Oluşturma Başarısız",
        message: notificationMessage,
        type: "system",
      });

      notifyGenerationFailure({
        generationType: "image",
        errorMessage: errorMessage,
        userId,
        userEmail: userEmail || undefined,
        prompt,
        creditsRefunded: creditsNeeded,
      });
      return;
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`[Background] Failed to download image: ${imageResponse.status}`);
      await updateGeneratedImageStatus(imageId, "failed", {
        errorMessage: "Görsel indirilemedi"
      });
      await refundCredits(userId, creditsNeeded, `Görsel indirme başarısız - ${resolution}`);

      await createNotification({
        userId,
        title: "Görsel Oluşturma Başarısız",
        message: "Görsel indirilemedi. Krediniz iade edildi.",
        type: "system",
      });

      // Update stats
      await updateAiModelStats(aiModel, false, Date.now() - startTime);
      return;
    }

    // Upload to S3
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileName = `generated-${nanoid()}.png`;
    const s3Key = `${userId}/images/${fileName}`;
    const { url: s3Url } = await storagePut(s3Key, Buffer.from(imageBuffer), "image/png");

    // Update database with completed status
    await updateGeneratedImageStatus(imageId, "completed", {
      generatedImageUrl: s3Url
    });

    // Update stats
    await updateAiModelStats(aiModel, true, Date.now() - startTime);

    // Notify user
    await createNotification({
      userId,
      title: "Görsel Hazır! 🎨",
      message: "Görseliniz başarıyla oluşturuldu. Galeri'den görüntüleyebilirsiniz.",
      type: "generation_complete",
      actionUrl: "/gallery",
    });

    // Get updated user credits for notification
    const updatedUser = await getUserById(userId);

    // Notify admin
    notifyCreditSpending({
      userName,
      userEmail,
      creditsSpent: creditsNeeded,
      creditsRemaining: updatedUser?.credits ?? 0,
      action: `Görsel oluşturma (${aiModel}, ${resolution}, ${aspectRatio})`,
    }).catch(console.error);

    // Send generated image to Telegram channels
    sendGeneratedImageToTelegram({
      imageUrl: s3Url,
      userName,
      userEmail,
      prompt,
      resolution,
      aspectRatio,
      aiModel,
    }).catch(console.error);

    console.log(`[Background] Image ${imageId} completed successfully`);
  } catch (error) {
    console.error(`[Background] Error processing image ${imageId}:`, error);
    await updateGeneratedImageStatus(imageId, "failed", {
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata"
    });
    await refundCredits(userId, creditsNeeded, `Görsel oluşturma başarısız - ${resolution}`);

    await createNotification({
      userId,
      title: "Görsel Oluşturma Başarısız",
      message: "Beklenmeyen bir hata oluştu. Krediniz iade edildi.",
      type: "system",
    });

    notifyGenerationFailure({
      generationType: "image",
      errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
      userId,
      prompt,
      creditsRefunded: creditsNeeded,
    });

    // Update stats
    await updateAiModelStats(aiModel, false, Date.now() - startTime);
  }
}

export const generationRouter = router({
  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt gereklidir"),
        aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9", "4:5", "5:4"]),
        resolution: z.enum(["1K", "2K", "4K"]),
        referenceImageUrl: z.string().optional(), // Geriye uyumluluk için
        referenceImageUrls: z.array(z.string()).max(8).optional(), // Çoklu görsel desteği (max 8)
        aiModel: z.enum([
          "qwen", "seedream", "nano-banana-pro",
          "flux-2-pro", "4o-image", "flux-kontext-pro", "google-imagen4",
          "ideogram-v3", "ideogram-character", "qwen-image", "z-image",
          "grok-imagine", "gpt-image-1.5", "seedream-edit",
          // New models
          "flux-1.1-pro", "flux-1.1-pro-ultra", "recraft-v3", "recraft-20b",
          "qwen-image-edit", "qwen-image-to-image", "nano-banana-edit",
          "ideogram-character-edit", "ideogram-character-remix",
          // Aliases from DB model keys
          "qwen/text-to-image", "qwen/image-edit", "qwen/image-to-image",
        ]).default("nano-banana-pro"),
        isEditMode: z.boolean().optional(), // SeeDream ve QWEN Edit mode için
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const normalizedModel = normalizeAiModel(input.aiModel as AIModel);
      const aiModel = (
        (normalizedModel === "qwen" || normalizedModel === "qwen-image") &&
        input.isEditMode
          ? "qwen-image-edit"
          : normalizedModel
      ) as AIModel;

      // Check if user has enough credits
      const user = await getUserById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Edit mode validation (SeeDream and QWEN)
      const referenceImageCount =
        input.referenceImageUrls?.length || (input.referenceImageUrl ? 1 : 0);
      const hasReferenceImages = referenceImageCount > 0;
      const isEditMode = input.isEditMode || aiModel === "seedream-edit";

      if ((aiModel === "seedream" || aiModel === "seedream-edit") && isEditMode && !hasReferenceImages) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "SeeDream Edit modu için referans görsel gereklidir.",
        });
      }

      // Seedream text-to-image mode doesn't support reference images
      if (aiModel === "seedream" && !isEditMode && hasReferenceImages) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "SeeDream 4.5 text-to-image modeli referans görsel desteklemiyor. Edit modu için 'Edit' seçeneğini aktif edin veya Nano Banana Pro / Qwen modelini kullanın.",
        });
      }

      // QWEN-image-edit validation
      if (
        (aiModel === "qwen-image-edit" || aiModel === "qwen-image-to-image") &&
        !hasReferenceImages
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Qwen image-edit/image-to-image modelleri için referans görsel gereklidir.",
        });
      }

      // QWEN text-to-image mode doesn't support reference images
      if ((aiModel === "qwen" || aiModel === "qwen-image") && hasReferenceImages) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Qwen text-to-image modeli referans görsel desteklemiyor. Image edit için 'Qwen Image Edit' modelini seçin.",
        });
      }

      // Get credits needed for this resolution and model
      const creditsNeeded = await getCreditsForResolution(input.resolution, aiModel);

      if (user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `INSUFFICIENT_CREDITS|Yetersiz kredi! Görsel oluşturmak için ${creditsNeeded} krediye ihtiyacınız var, ancak sadece ${user.credits} krediniz mevcut. Lütfen kredi paketlerine göz atın.`,
        });
      }

      // Deduct credits
      const creditDeducted = await deductCredits(userId, creditsNeeded);
      if (!creditDeducted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi düşürülemedi",
        });
      }

      try {
        let taskId: string;

        if (aiModel === "seedream" || aiModel === "seedream-edit") {
          console.log(`[Generation] Creating Seedream task (${isEditMode ? 'Edit' : 'Text-to-Image'}) with prompt:`, input.prompt);

          if (isEditMode) {
            // Seedream Edit API (image-to-image)
            const imageUrls = input.referenceImageUrls || (input.referenceImageUrl ? [input.referenceImageUrl] : []);
            const seedreamResponse = await generateSeedreamEditImage({
              prompt: input.prompt,
              imageUrls: imageUrls,
              aspectRatio: input.aspectRatio as SeedreamAspectRatio,
              quality: resolutionToSeedreamQuality(input.resolution),
            });
            taskId = seedreamResponse.taskId;
          } else {
            // Seedream Text-to-Image API
            const seedreamResponse = await generateSeedreamImage({
              prompt: input.prompt,
              aspectRatio: input.aspectRatio as SeedreamAspectRatio,
              quality: resolutionToSeedreamQuality(input.resolution),
            });
            taskId = seedreamResponse.taskId;
          }
        } else if ([
          "flux-2-pro", "4o-image", "flux-kontext-pro", "google-imagen4",
          "ideogram-v3", "ideogram-character", "qwen-image", "z-image",
          "grok-imagine", "gpt-image-1.5",
          // New models
          "flux-1.1-pro", "flux-1.1-pro-ultra", "recraft-v3", "recraft-20b",
          "qwen-image-edit", "qwen-image-to-image", "nano-banana-edit",
          "ideogram-character-edit", "ideogram-character-remix"
        ].includes(aiModel)) {
          console.log(`[Generation] Creating ${aiModel} task with prompt:`, input.prompt);

          let res: { taskId: string };
          const imageUrls = input.referenceImageUrls || (input.referenceImageUrl ? [input.referenceImageUrl] : []);

          // Validate required input images for image-to-image models
          const imageToImageModels = [
            "flux-2-pro", "qwen-image-edit", "qwen-image-to-image", "nano-banana-edit",
            "ideogram-character-edit", "ideogram-character-remix"
          ];
          if (imageToImageModels.includes(aiModel) && (!imageUrls || imageUrls.length === 0)) {
            throw new Error(`${aiModel} modeli için en az bir referans görsel gereklidir. Lütfen bir görsel yükleyin.`);
          }

          switch (aiModel) {
            case "flux-2-pro":
              res = await generateFlux2ProImage({ prompt: input.prompt, imageUrl: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            case "4o-image":
              res = await generate4oImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "flux-kontext-pro":
              res = await generateFluxKontextImage({ prompt: input.prompt, imageUrls, aspectRatio: input.aspectRatio as any });
              break;
            case "google-imagen4":
              res = await generateImagen4Image({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "ideogram-v3":
              res = await generateIdeogramV3Image({ prompt: input.prompt, imageUrl: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            case "ideogram-character":
              res = await generateIdeogramCharacterImage({ prompt: input.prompt, characterImage: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            case "qwen-image":
              res = await generateQwenImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "z-image":
              res = await generateZImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "grok-imagine":
              res = await generateGrokImagineImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "gpt-image-1.5":
              res = await generateGPTImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            // New models
            case "flux-1.1-pro":
              res = await generateFlux11ProImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "flux-1.1-pro-ultra":
              res = await generateFlux11UltraImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "recraft-v3":
              res = await generateRecraftV3Image({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "recraft-20b":
              res = await generateRecraft20BImage({ prompt: input.prompt, aspectRatio: input.aspectRatio as any });
              break;
            case "qwen-image-edit":
              res = await generateQwenImageEdit({ prompt: input.prompt, imageUrl: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            case "qwen-image-to-image":
              res = await generateQwenImageToImage({ prompt: input.prompt, imageUrl: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            case "nano-banana-edit":
              res = await generateNanoBananaEdit({ prompt: input.prompt, imageUrls, aspectRatio: input.aspectRatio as any });
              break;
            case "ideogram-character-edit":
              res = await generateIdeogramCharacterEdit({ prompt: input.prompt, characterImage: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            case "ideogram-character-remix":
              res = await generateIdeogramCharacterRemix({ prompt: input.prompt, characterImage: imageUrls[0], aspectRatio: input.aspectRatio as any });
              break;
            default:
              throw new Error("Unsupported model");
          }
          taskId = res.taskId;
        } else if (aiModel === "qwen") {
          // QWEN Text-to-Image API (Kie.ai üzerinden)
          console.log(`[Generation] Creating QWEN Text-to-Image task with prompt:`, input.prompt);
          const qwenResponse = await generateQwenImage({
            prompt: input.prompt,
            aspectRatio: input.aspectRatio as any,
          });
          taskId = qwenResponse.taskId;
        } else {
          // Nano Banana Pro veya Qwen API (ikisi de aynı API'yi kullanıyor)
          const modelName = aiModel === "nano-banana-pro" ? "Nano Banana Pro" : "Qwen";
          const imageCount = input.referenceImageUrls?.length || (input.referenceImageUrl ? 1 : 0);
          console.log(`[Generation] Creating ${modelName} task with ${imageCount} reference image(s)`);

          const taskResponse = await createGenerationTask({
            prompt: input.prompt,
            aspectRatio: input.aspectRatio,
            resolution: input.resolution,
            referenceImageUrls: input.referenceImageUrls,
            referenceImageUrl: input.referenceImageUrl, // Geriye uyumluluk
            model: aiModel === "nano-banana-pro" ? "nano-banana-pro" : "qwen",
          });

          if (!taskResponse.success) {
            console.error("[Generation] Task creation failed:", taskResponse.error);
            await refundCredits(userId, creditsNeeded, `Görsel oluşturma başarısız - ${input.resolution}`);

            // Hata mesajını Türkçe'ye çevir
            const translatedError = translateApiError(taskResponse.error || 'API hatası oluştu');
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `API_ERROR|${translatedError}`,
            });
          }
          taskId = taskResponse.taskId;
        }

        // Save to database with pending status
        const imageId = await saveGeneratedImage({
          userId,
          prompt: input.prompt,
          referenceImageUrl: input.referenceImageUrl,
          generatedImageUrl: "", // Will be updated when completed
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          creditsCost: creditsNeeded,
          taskId,
          status: "pending",
        });

        if (!imageId) {
          await refundCredits(userId, creditsNeeded, `Veritabanı hatası - ${input.resolution}`);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Veritabanına kayıt yapılamadı",
          });
        }

        // Start background processing (don't await)
        processImageInBackground(
          imageId,
          taskId,
          userId,
          user.name,
          user.email,
          input.prompt,
          input.resolution,
          input.aspectRatio,
          creditsNeeded,
          aiModel
        ).catch(console.error);

        // Return immediately
        return {
          success: true,
          imageId,
          taskId,
          status: "pending",
          message: "Görsel oluşturma başlatıldı. Sayfadan ayrılabilirsiniz, tamamlandığında bildirim alacaksınız.",
          creditsRemaining: user.credits - creditsNeeded,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("[Generation] Unexpected error:", error);
        await refundCredits(userId, creditsNeeded, `Görsel oluşturma başarısız - ${input.resolution}`);

        notifyGenerationFailure({
          generationType: "image",
          errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
          userId,
          userEmail: user?.email || undefined,
          prompt: input.prompt,
          creditsRefunded: creditsNeeded,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Görsel üretimi sırasında hata oluştu",
        });
      }
    }),

  // Check status of a specific image
  checkStatus: protectedProcedure
    .input(z.object({ imageId: z.number() }))
    .query(async ({ ctx, input }) => {
      const image = await getGeneratedImageById(input.imageId);

      if (!image || image.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Görsel bulunamadı",
        });
      }

      return {
        id: image.id,
        status: image.status,
        generatedImageUrl: image.generatedImageUrl,
        errorMessage: image.errorMessage,
      };
    }),

  // Get user's generated images history
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const images = await getUserGeneratedImages(userId, input.limit);
      const total = await getUserGeneratedImagesCount(userId);

      return {
        images,
        total,
        hasMore: images.length < total,
      };
    }),

  // Get pending images for polling
  getPendingImages: protectedProcedure
    .query(async ({ ctx }) => {
      const images = await getPendingImages(ctx.user.id);
      return images;
    }),

  // Get credit costs for display
  getCreditCosts: protectedProcedure
    .query(async () => {
      const pricing = await getAiInfluencerPricing();
      const { IMAGE_MODEL_PRICING } = await import("../kieAiApi");

      return {
        qwen: pricing.qwen,
        seedream: pricing.seedream,
        "nano-banana-pro": pricing.nanoBanana,
        // All Kie.ai model pricing
        allModels: IMAGE_MODEL_PRICING,
      };
    }),

  // Get user credits and credit costs (Nano Banana Pro fiyatları)
  getCredits: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      const pricing = await getAiInfluencerPricing();
      return {
        credits: user?.credits ?? 0,
        creditCosts: pricing.nanoBanana, // Nano Banana fiyatlarını döndür
      };
    }),

  // Delete a generated image
  delete: protectedProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const image = await getGeneratedImageById(input.imageId);

      if (!image || image.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Görsel bulunamadı",
        });
      }

      const { getDb } = await import("../db");
      const { generatedImages } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      await db.delete(generatedImages).where(eq(generatedImages.id, input.imageId));

      return { success: true };
    }),

  // Toplu silme endpoint'i
  deleteMultiple: protectedProcedure
    .input(z.object({ imageIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      if (input.imageIds.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      const { getDb } = await import("../db");
      const { generatedImages } = await import("../../drizzle/schema");
      const { eq, and, inArray } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı kurulamadı",
        });
      }

      // Sadece kullanıcının kendi görsellerini sil
      await db.delete(generatedImages).where(
        and(
          inArray(generatedImages.id, input.imageIds),
          eq(generatedImages.userId, ctx.user.id)
        )
      );

      return { success: true, deletedCount: input.imageIds.length };
    }),
});
