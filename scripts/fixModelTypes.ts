// Load environment variables from .env
import "dotenv/config";

import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

const MODELS_TO_UPDATE_TO_VIDEO = [
  "wan-26",
  "seedance-15-pro",
  "seedance-pro",
  "hailuo",
];

async function updateModelTypes() {
  console.log("🚀 Starting model type update...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    const result = await db
      .update(aiModelConfig)
      .set({ modelType: "video" })
      .where(inArray(aiModelConfig.modelKey, MODELS_TO_UPDATE_TO_VIDEO));

    console.log(
      `✨ Updated model types to 'video' for: ${MODELS_TO_UPDATE_TO_VIDEO.join(", ")}`
    );
    console.log(`Changed rows: ${result[0].affectedRows}`);
  } catch (error) {
    console.error("❌ Error updating model types:", error);
  }

  process.exit(0);
}

updateModelTypes();
