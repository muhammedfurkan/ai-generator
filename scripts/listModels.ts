
import 'dotenv/config';
import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";

async function listAllModels() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  const models = await db.select({
    key: aiModelConfig.modelKey,
    name: aiModelConfig.modelName,
    type: aiModelConfig.modelType
  }).from(aiModelConfig);

  console.log("Existing models:");
  models.forEach(m => {
    console.log(`- ${m.key} (${m.name}) [${m.type}]`);
  });

  process.exit(0);
}

listAllModels();
