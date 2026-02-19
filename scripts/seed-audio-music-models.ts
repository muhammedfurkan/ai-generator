// Load environment variables from .env
import "dotenv/config";

import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

const audioMusicModels = [
  {
    modelKey: "minimax-tts",
    modelName: "Minimax TTS",
    modelType: "audio" as const,
    provider: "Minimax",
    isActive: true,
    isMaintenanceMode: false,
    freeUserDailyLimit: 10,
    premiumUserDailyLimit: 100,
    priority: 1,
    description:
      "Minimax metinden sese dönüştürme. Speech-02 HD ve Turbo modelleri destekli.",
    costPerRequest: "0.005",
  },
  {
    modelKey: "elevenlabs-tts",
    modelName: "ElevenLabs TTS",
    modelType: "audio" as const,
    provider: "ElevenLabs",
    isActive: true,
    isMaintenanceMode: false,
    freeUserDailyLimit: 5,
    premiumUserDailyLimit: 50,
    priority: 2,
    description:
      "ElevenLabs metinden sese dönüştürme. Multilingual v2 ve diğer modeller.",
    costPerRequest: "0.01",
  },
  {
    modelKey: "minimax-music",
    modelName: "Minimax Music 2.5",
    modelType: "music" as const,
    provider: "Minimax",
    isActive: true,
    isMaintenanceMode: false,
    freeUserDailyLimit: 5,
    premiumUserDailyLimit: 30,
    priority: 1,
    description:
      "Minimax Music 2.5 - Sözlerden ve stil açıklamasından müzik üretimi.",
    costPerRequest: "0.05",
  },
];

async function seedAudioMusicModels() {
  console.log("Seeding audio & music models...");

  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;

  for (const model of audioMusicModels) {
    try {
      const existing = await db
        .select()
        .from(aiModelConfig)
        .where(eq(aiModelConfig.modelKey, model.modelKey))
        .limit(1);

      if (existing.length === 0) {
        await db.execute(sql`
          INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, isMaintenanceMode, freeUserDailyLimit, premiumUserDailyLimit, priority, description, costPerRequest)
          VALUES (${model.modelKey}, ${model.modelName}, ${model.modelType}, ${model.provider}, 1, 0, ${model.freeUserDailyLimit}, ${model.premiumUserDailyLimit}, ${model.priority}, ${model.description}, ${model.costPerRequest})
        `);
        console.log(`  + Inserted: ${model.modelKey}`);
        inserted++;
      } else {
        await db
          .update(aiModelConfig)
          .set({
            modelName: model.modelName,
            provider: model.provider,
            description: model.description,
            costPerRequest: model.costPerRequest,
          })
          .where(eq(aiModelConfig.modelKey, model.modelKey));
        console.log(`  ~ Updated:  ${model.modelKey}`);
        updated++;
      }
    } catch (e) {
      console.error(`  ! Error processing ${model.modelKey}:`, e);
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated.`);
  process.exit(0);
}

seedAudioMusicModels();
