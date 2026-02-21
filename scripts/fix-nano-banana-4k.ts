import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function updateNanoBananaPro() {
  console.log("🔧 Updating Nano Banana Pro configuration...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  const config = {
    supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2"],
    supportedResolutions: ["1K", "2K"], // Removed 4K
    defaultAspectRatio: "16:9",
    defaultResolution: "2K",
    supportsReferenceImage: true,
    maxReferenceImages: 8,
  };

  await db
    .update(aiModelConfig)
    .set({ configJson: JSON.stringify(config) })
    .where(eq(aiModelConfig.modelKey, "google/pro-image-to-image"));

  console.log("✅ Nano Banana Pro configuration updated successfully!");
  console.log("   - Removed 4K support");
  console.log("   - Supported resolutions: 1K, 2K");

  process.exit(0);
}

updateNanoBananaPro().catch(error => {
  console.error("❌ Error updating configuration:", error);
  process.exit(1);
});
