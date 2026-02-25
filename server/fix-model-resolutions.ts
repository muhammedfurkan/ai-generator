// @ts-nocheck
/**
 * Fix Model Resolutions - Wan, Sora ve diğer modellerin 720p ve 1080p ayarlarını düzelt
 *
 * Kullanım: npm exec tsx server/fix-model-resolutions.ts
 */

import "dotenv/config";
import { getDb } from "./db.js";
import { aiModelConfig } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

// Model resolution configurations
const MODEL_CONFIGS: Record<string, any> = {
  "wan-2.2": {
    supportedResolutions: ["720p"],
    supportedDurations: ["5", "10"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "720p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    hasAudioSupport: false,
  },
  "wan-2.5": {
    supportedResolutions: ["720p", "1080p"],
    supportedDurations: ["5", "10"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "720p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    hasAudioSupport: false,
  },
  "wan-2.6": {
    supportedResolutions: ["720p", "1080p"],
    supportedDurations: ["5", "10", "15"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "720p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    hasAudioSupport: true,
  },
  "wan-26": {
    supportedResolutions: ["720p", "1080p"],
    supportedDurations: ["5", "10", "15"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "720p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    hasAudioSupport: true,
  },
  "sora2": {
    supportedResolutions: ["1080p"],
    supportedDurations: ["10", "15"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    supportedQualities: ["standard", "pro"],
    defaultResolution: "1080p",
    defaultDuration: "10",
    defaultAspectRatio: "16:9",
    defaultQuality: "standard",
    hasAudioSupport: false,
    specialFeatures: ["default", "characters", "watermark-remover", "storyboard"],
  },
  "sora-2-pro": {
    supportedResolutions: ["1080p"],
    supportedDurations: ["10", "15", "20"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    supportedQualities: ["standard", "high"],
    defaultResolution: "1080p",
    defaultDuration: "10",
    defaultAspectRatio: "16:9",
    defaultQuality: "high",
    hasAudioSupport: false,
  },
  "sora-2-pro-storyboard": {
    supportedResolutions: ["1080p"],
    supportedDurations: ["10", "15", "20"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "1080p",
    defaultDuration: "10",
    defaultAspectRatio: "16:9",
    hasAudioSupport: false,
  },
  "kling": {
    supportedResolutions: ["1080p"],
    supportedDurations: ["5", "10"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "1080p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    hasAudioSupport: true,
  },
  "kling-2.5": {
    supportedResolutions: ["1080p"],
    supportedDurations: ["5", "10"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "1080p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    hasAudioSupport: true,
  },
  "kling-30": {
    supportedResolutions: ["720p", "1080p"],
    supportedDurations: ["3", "5", "10", "15"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    supportedQualities: ["std", "pro"],
    defaultResolution: "720p",
    defaultDuration: "5",
    defaultAspectRatio: "16:9",
    defaultQuality: "std",
    hasAudioSupport: true,
    hasMultiShotSupport: true,
  },
  "hailuo-2.3": {
    supportedResolutions: ["768p", "1080p"],
    supportedDurations: ["6", "10"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    supportedQualities: ["standard", "pro"],
    defaultResolution: "768p",
    defaultDuration: "6",
    defaultAspectRatio: "16:9",
    defaultQuality: "standard",
    hasAudioSupport: false,
  },
  "seedance/1.5-pro": {
    supportedResolutions: ["480p", "720p"],
    supportedDurations: ["4", "8", "12"],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    defaultResolution: "720p",
    defaultDuration: "8",
    defaultAspectRatio: "16:9",
    hasAudioSupport: true,
  },
  "veo3": {
    supportedResolutions: ["720p", "1080p", "4K"],
    supportedDurations: ["auto"],
    supportedAspectRatios: ["16:9", "9:16", "auto"],
    supportedQualities: ["fast", "quality"],
    defaultResolution: "720p",
    defaultDuration: "auto",
    defaultAspectRatio: "16:9",
    defaultQuality: "fast",
    hasAudioSupport: false,
    supportsReferenceVideo: true,
  },
  "grok": {
    supportedResolutions: ["480p", "720p"],
    supportedDurations: ["6", "10"],
    supportedAspectRatios: ["16:9", "9:16", "1:1", "2:3", "3:2"],
    defaultResolution: "720p",
    defaultDuration: "6",
    defaultAspectRatio: "16:9",
    hasAudioSupport: false,
  },
};

async function fixModelResolutions() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🔧 Model çözünürlük ayarları düzeltiliyor...\n");

  let updated = 0;
  let skipped = 0;

  for (const [modelKey, config] of Object.entries(MODEL_CONFIGS)) {
    try {
      // Check if model exists
      const existing = await db
        .select()
        .from(aiModelConfig)
        .where(eq(aiModelConfig.modelKey, modelKey))
        .limit(1);

      if (existing.length === 0) {
        console.log(`⚠️  Atlandı: ${modelKey} (model bulunamadı)`);
        skipped++;
        continue;
      }

      // Update configJson
      const configJson = JSON.stringify(config);
      await db
        .update(aiModelConfig)
        .set({ configJson })
        .where(eq(aiModelConfig.modelKey, modelKey));

      console.log(`✅ Güncellendi: ${modelKey}`);
      console.log(`   Çözünürlükler: ${config.supportedResolutions.join(", ")}`);
      console.log(`   Süreler: ${config.supportedDurations.join(", ")}`);
      updated++;
    } catch (error) {
      console.error(`❌ Hata (${modelKey}):`, error);
      skipped++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`  ✅ Güncellenen: ${updated}`);
  console.log(`  ⚠️  Atlanan: ${skipped}`);
  console.log(`  📦 Toplam: ${Object.keys(MODEL_CONFIGS).length}`);
  console.log(`\n✨ İşlem tamamlandı!`);

  process.exit(0);
}

// Run the script
fixModelResolutions().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
