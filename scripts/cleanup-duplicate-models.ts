/**
 * Cleanup Duplicate Video Models
 * 
 * This script hides duplicate video models from the database
 * and keeps only the unified models (wan-26, sora2, kling, etc.)
 */

import { config } from "dotenv";
config(); // Load environment variables

import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";
import { eq, inArray, and } from "drizzle-orm";

async function cleanupDuplicateModels() {
  console.log("🧹 Starting model cleanup...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  try {
    // 1. Hide duplicate Wan 2.6 models
    console.log("1️⃣ Hiding duplicate Wan 2.6 models...");
    const wanDuplicates = [
      "wan/2-6-image-to-video",
      "wan/2-6-text-to-video",
      "wan/2-6-video-to-video",
    ];

    const wanResult = await db
      .update(aiModelConfig)
      .set({ isMaintenanceMode: true })
      .where(inArray(aiModelConfig.modelKey, wanDuplicates));

    console.log(`   ✅ Hidden ${wanDuplicates.length} Wan models\n`);

    // 2. Ensure main wan-26 is active
    console.log("2️⃣ Activating main wan-26 model...");
    await db
      .update(aiModelConfig)
      .set({
        isMaintenanceMode: false,
        supportedDurations: JSON.stringify(["5", "10", "15"]),
        supportedResolutions: JSON.stringify(["720p", "1080p"]),
      })
      .where(eq(aiModelConfig.modelKey, "wan-26"));

    console.log("   ✅ wan-26 activated\n");

    // 3. Hide duplicate Sora 2 models
    console.log("3️⃣ Hiding duplicate Sora 2 models...");
    const soraDuplicates = [
      "sora2/sora-2-image-to-video",
      "sora2/sora-2-text-to-video",
      "sora2/sora-watermark-remover",
    ];

    await db
      .update(aiModelConfig)
      .set({ isMaintenanceMode: true })
      .where(inArray(aiModelConfig.modelKey, soraDuplicates));

    console.log(`   ✅ Hidden ${soraDuplicates.length} Sora models\n`);

    // 4. Hide duplicate Kling models
    console.log("4️⃣ Hiding duplicate Kling models...");
    const klingDuplicates = [
      "kling/text-to-video",
      "kling/image-to-video",
    ];

    await db
      .update(aiModelConfig)
      .set({ isMaintenanceMode: true })
      .where(inArray(aiModelConfig.modelKey, klingDuplicates));

    console.log(`   ✅ Hidden ${klingDuplicates.length} Kling models\n`);

    // 5. Hide duplicate Grok models
    console.log("5️⃣ Hiding duplicate Grok models...");
    const grokDuplicates = [
      "grok-imagine/text-to-video",
      "grok-imagine/image-to-video",
    ];

    await db
      .update(aiModelConfig)
      .set({ isMaintenanceMode: true })
      .where(inArray(aiModelConfig.modelKey, grokDuplicates));

    console.log(`   ✅ Hidden ${grokDuplicates.length} Grok models\n`);

    console.log(`\n✅ Cleanup completed successfully!`);
    console.log("\n🔄 Changes applied:");
    console.log("   - Hidden 3 Wan 2.6 duplicate models");
    console.log("   - Hidden 3 Sora 2 duplicate models");
    console.log("   - Hidden 2 Kling duplicate models");
    console.log("   - Hidden 2 Grok duplicate models");
    console.log("\n� Active unified models:");
    console.log("   - wan-26 (Wan 2.6)");
    console.log("   - sora2 (Sora 2)");
    console.log("   - kling (Kling 2.6)");
    console.log("   - grok (Grok Imagine)");
    console.log("   - veo3 (Veo 3.1)");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

// Run the cleanup
cleanupDuplicateModels()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
