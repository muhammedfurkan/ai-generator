/**
 * Yeni Kie.ai Görsel Modellerini Veritabanına Ekleyen Script
 * 
 * Kullanım:
 * 1. `pnpm tsx server/add-new-image-models.ts` komutu ile çalıştırın
 */

import "dotenv/config";
import { getDb } from "./db.js";
import { aiModelConfig } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const NEW_IMAGE_MODELS = [
  {
    modelKey: "flux-2-pro",
    modelName: "Flux 2 Pro",
    modelType: "image" as const,
    provider: "Black Forest Labs",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 5,
    premiumUserDailyLimit: 50,
    creditCostOverride: 12,
    priority: 3,
    description: "Higgsfield-style Flux 2 Pro image-to-image transformation.",
    costPerRequest: "0.08",
  },
  {
    modelKey: "4o-image",
    modelName: "GPT-4o Vision Image",
    modelType: "image" as const,
    provider: "OpenAI",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 8,
    premiumUserDailyLimit: 80,
    creditCostOverride: 10,
    priority: 5,
    description: "OpenAI GPT-4o Vision based image generation.",
    costPerRequest: "0.06",
  },
  {
    modelKey: "flux-kontext-pro",
    modelName: "Flux.1 Kontext Pro",
    modelType: "image" as const,
    provider: "Black Forest Labs",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 4096,
    maxResolutionHeight: 4096,
    freeUserDailyLimit: 5,
    premiumUserDailyLimit: 50,
    creditCostOverride: 15,
    priority: 2,
    description: "Contextual image generation and editing.",
    costPerRequest: "0.10",
  },
  {
    modelKey: "google-imagen4",
    modelName: "Imagen 4",
    modelType: "image" as const,
    provider: "Google",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 6,
    premiumUserDailyLimit: 60,
    creditCostOverride: 12,
    priority: 3,
    description: "Google's latest Imagen 4 Fast model.",
    costPerRequest: "0.08",
  },
  {
    modelKey: "ideogram-v3",
    modelName: "Ideogram V3",
    modelType: "image" as const,
    provider: "Ideogram",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 7,
    premiumUserDailyLimit: 70,
    creditCostOverride: 10,
    priority: 4,
    description: "Ideogram V3 Reframe and creation.",
    costPerRequest: "0.07",
  },
  {
    modelKey: "ideogram-character",
    modelName: "Ideogram Character",
    modelType: "image" as const,
    provider: "Ideogram",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 6,
    premiumUserDailyLimit: 60,
    creditCostOverride: 12,
    priority: 3,
    description: "Character-focused generation from Ideogram.",
    costPerRequest: "0.08",
  },
  {
    modelKey: "qwen-image",
    modelName: "Qwen Image Edit",
    modelType: "image" as const,
    provider: "Alibaba",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 8,
    premiumUserDailyLimit: 80,
    creditCostOverride: 8,
    priority: 6,
    description: "Alibaba Qwen powered image editing.",
    costPerRequest: "0.05",
  },
  {
    modelKey: "z-image",
    modelName: "Z-Image",
    modelType: "image" as const,
    provider: "Kie AI",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 7,
    premiumUserDailyLimit: 70,
    creditCostOverride: 10,
    priority: 4,
    description: "Unified Z-Image generation.",
    costPerRequest: "0.07",
  },
  {
    modelKey: "grok-imagine",
    modelName: "Grok Imagine",
    modelType: "image" as const,
    provider: "xAI",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 5,
    premiumUserDailyLimit: 50,
    creditCostOverride: 12,
    priority: 3,
    description: "xAI Grok Imagine image generation.",
    costPerRequest: "0.08",
  },
  {
    modelKey: "gpt-image-1.5",
    modelName: "GPT Image 1.5",
    modelType: "image" as const,
    provider: "Kie AI",
    isActive: true,
    isMaintenanceMode: false,
    maxResolutionWidth: 2048,
    maxResolutionHeight: 2048,
    freeUserDailyLimit: 7,
    premiumUserDailyLimit: 70,
    creditCostOverride: 10,
    priority: 4,
    description: "GPT base Image model version 1.5.",
    costPerRequest: "0.07",
  },
];

async function addNewImageModels() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🎨 Yeni Kie.ai görsel modelleri ekleniyor...");

  for (const model of NEW_IMAGE_MODELS) {
    try {
      const existing = await db
        .select()
        .from(aiModelConfig)
        .where(eq(aiModelConfig.modelKey, model.modelKey))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(aiModelConfig).values(model);
        console.log(`✅ Eklendi: ${model.modelName}`);
      } else {
        await db
          .update(aiModelConfig)
          .set(model)
          .where(eq(aiModelConfig.modelKey, model.modelKey));
        console.log(`🔄 Güncellendi: ${model.modelName}`);
      }
    } catch (error) {
      console.error(`❌ Hata (${model.modelKey}):`, error);
    }
  }

  process.exit(0);
}

addNewImageModels();
