// Load environment variables from .env
import "dotenv/config";

import { getDb } from "../server/db";

async function migrateModelTypeEnum() {
  console.log("Starting modelType enum migration...");

  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  try {
    await db.execute(
      "ALTER TABLE `aiModelConfig` MODIFY `modelType` enum('image','video','upscale','audio','music') NOT NULL"
    );
    console.log(
      "Successfully updated modelType enum to include 'audio' and 'music'"
    );
  } catch (error: any) {
    if (error?.message?.includes("Duplicate")) {
      console.log("Enum already includes audio/music, skipping.");
    } else {
      console.error("Error running migration:", error);
      process.exit(1);
    }
  }

  process.exit(0);
}

migrateModelTypeEnum();
