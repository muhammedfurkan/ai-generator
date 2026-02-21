import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Kie.ai Market'ten eksik olan modelleri ekleyen script
 * Kaynak: https://kie.ai/market
 */

const newModels = [
  // WAN 2.5 Series
  {
    modelKey: "wan/2-5-text-to-video",
    modelName: "Wan 2.5 Text to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 85,
    description: "Wan 2.5 text-to-video generation model",
    configJson: JSON.stringify({
      supportsTextToVideo: true,
      supportsImageToVideo: false,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: true,
    }),
  },
  {
    modelKey: "wan/2-5-image-to-video",
    modelName: "Wan 2.5 Image to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 85,
    description: "Wan 2.5 image-to-video generation model",
    configJson: JSON.stringify({
      supportsTextToVideo: false,
      supportsImageToVideo: true,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: true,
    }),
  },

  // KLING 2.5 Turbo Series
  {
    modelKey: "kling/2-5-turbo-text-to-video",
    modelName: "Kling 2.5 Turbo Text to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 88,
    description: "Kling 2.5 Turbo fast text-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: true,
      supportsImageToVideo: false,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: true,
      isTurbo: true,
    }),
  },
  {
    modelKey: "kling/2-5-turbo-image-to-video",
    modelName: "Kling 2.5 Turbo Image to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 88,
    description: "Kling 2.5 Turbo fast image-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: false,
      supportsImageToVideo: true,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: true,
      isTurbo: true,
    }),
  },

  // SEEDANCE 1.5 Pro Text to Video
  {
    modelKey: "bytedance/seedance-1.5-pro-text-to-video",
    modelName: "Seedance 1.5 Pro Text to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 82,
    description: "Seedance 1.5 Pro text-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: true,
      supportsImageToVideo: false,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: false,
    }),
  },

  // HAILUO 2.3 Text to Video
  {
    modelKey: "hailuo/2-3-text-to-video-pro",
    modelName: "Hailuo 2.3 Text to Video Pro",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 75,
    description: "Hailuo 2.3 professional text-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: true,
      supportsImageToVideo: false,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: false,
    }),
  },
  {
    modelKey: "hailuo/2-3-text-to-video-standard",
    modelName: "Hailuo 2.3 Text to Video Standard",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 73,
    description: "Hailuo 2.3 standard text-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: true,
      supportsImageToVideo: false,
      supportsVideoToVideo: false,
      supportedDurations: [5],
      supportedResolutions: ["720p"],
      hasAudioSupport: false,
    }),
  },

  // VEO 3 Series (separate from 3.1)
  {
    modelKey: "veo/3-text-to-video",
    modelName: "Veo 3 Text to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 92,
    description: "Google Veo 3 text-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: true,
      supportsImageToVideo: false,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: true,
    }),
  },
  {
    modelKey: "veo/3-image-to-video",
    modelName: "Veo 3 Image to Video",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 92,
    description: "Google Veo 3 image-to-video generation",
    configJson: JSON.stringify({
      supportsTextToVideo: false,
      supportsImageToVideo: true,
      supportsVideoToVideo: false,
      supportedDurations: [5, 10],
      supportedResolutions: ["720p", "1080p"],
      hasAudioSupport: true,
    }),
  },

  // TOPAZ Video Upscaler
  {
    modelKey: "topaz/video-upscale",
    modelName: "Topaz Video Upscaler",
    modelType: "video" as const,
    provider: "kie.ai",
    isActive: 1,
    priority: 70,
    description: "Topaz AI-powered video upscaling",
    configJson: JSON.stringify({
      supportsTextToVideo: false,
      supportsImageToVideo: false,
      supportsVideoToVideo: true,
      supportedResolutions: ["1080p", "4k"],
      isUpscaler: true,
    }),
  },
];

async function addMissingModels() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  try {
    console.log("🚀 Eksik Kie.ai modellerini ekleme başlatılıyor...\n");

    for (const model of newModels) {
      try {
        // Model zaten var mı kontrol et
        const existing = await db
          .select()
          .from(aiModelConfig)
          .where(eq(aiModelConfig.modelKey, model.modelKey))
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`⏭️  Atlanıyor: ${model.modelName} (zaten mevcut)`);
          continue;
        }

        // Yeni modeli ekle
        await db.insert(aiModelConfig).values(model);
        console.log(`✅ Eklendi: ${model.modelName} (${model.modelKey})`);
      } catch (error) {
        console.error(`❌ Hata (${model.modelKey}):`, error);
      }
    }

    console.log("\n✨ İşlem tamamlandı!");
    console.log(`📊 Toplam eklenen model sayısı: ${newModels.length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Error:", error);
    process.exit(1);
  }
}

// Script'i çalıştır
addMissingModels();
