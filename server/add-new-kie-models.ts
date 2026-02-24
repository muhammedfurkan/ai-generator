// @ts-nocheck
/**
 * Yeni Kie.ai Modellerini Veritabanına Ekleyen Script
 *
 * Kullanım:
 * 1. Bu dosyayı server dizinine kopyalayın
 * 2. `npm exec tsx server/add-new-kie-models.ts` komutu ile çalıştırın
 * 3. Veya Admin Panel'den `/admin/models` sayfasına gidip manuel olarak ekleyin
 */

import "dotenv/config";
import { getDb } from "./db.js";
import { aiModelConfig } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const NEW_KIE_MODELS = [
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
    modelKey: "kling-30",
    modelName: "Kling 3.0",
    modelType: "video" as const,
    provider: "Kie AI (Kuaishou)",
    isActive: true,
    isMaintenanceMode: false,
    maxVideoDurationSeconds: 15,
    freeUserDailyLimit: 3,
    premiumUserDailyLimit: 30,
    priority: 1,
    description:
      "Kuaishou Kling 3.0 - Std/Pro mod, multi-shot, element referansları ve gelişmiş ses desteği. 3-15 saniye, 16:9/9:16/1:1.",
    costPerRequest: "0.50",
  },
  {
    modelKey: "seedance/1.0-lite",
    modelName: "Seedonce 1.0 Lite",
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
    description: "Alibaba Wan 2.6 - 1080p çoklu çekim, senkronize ses desteği.",
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

async function addNewModels() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🚀 Yeni Kie.ai modellerini ekleniyor...");

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const model of NEW_KIE_MODELS) {
    try {
      // Check if model already exists
      const existing = await db
        .select()
        .from(aiModelConfig)
        .where(eq(aiModelConfig.modelKey, model.modelKey))
        .limit(1);

      if (existing.length === 0) {
        // Insert new model
        await db.insert(aiModelConfig).values(model);
        console.log(`✅ Eklendi: ${model.modelName} (${model.modelKey})`);
        inserted++;
      } else {
        // Update existing model
        await db
          .update(aiModelConfig)
          .set({
            modelName: model.modelName,
            provider: model.provider,
            description: model.description,
            costPerRequest: model.costPerRequest,
            maxVideoDurationSeconds: model.maxVideoDurationSeconds,
            freeUserDailyLimit: model.freeUserDailyLimit,
            premiumUserDailyLimit: model.premiumUserDailyLimit,
            priority: model.priority,
          })
          .where(eq(aiModelConfig.modelKey, model.modelKey));
        console.log(`🔄 Güncellendi: ${model.modelName} (${model.modelKey})`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Hata (${model.modelKey}):`, error);
      skipped++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`  ✅ Yeni eklenen: ${inserted}`);
  console.log(`  🔄 Güncellenen: ${updated}`);
  console.log(`  ❌ Atlanan: ${skipped}`);
  console.log(`  📦 Toplam: ${NEW_KIE_MODELS.length}`);
  console.log(`\n✨ İşlem tamamlandı!`);

  process.exit(0);
}

// Run the script
addNewModels().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
