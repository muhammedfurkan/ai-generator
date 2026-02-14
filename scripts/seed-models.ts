import { getDb } from "../server/db.js";
import { aiModelConfig } from "../drizzle/schema.js";

/**
 * Migration script to seed new AI models
 * Run: pnpm tsx scripts/seed-models.ts
 */

const imageModels = [
  // Seedream Models
  {
    modelKey: "bytedance/seedream",
    modelName: "Seedream 3.0",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Text to image generation by Seedream 3.0",
  },
  {
    modelKey: "bytedance/seedream-v4-text-to-image",
    modelName: "Seedream 4.0",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "High-quality photorealistic image generation",
  },
  {
    modelKey: "bytedance/seedream-v4-edit",
    modelName: "Seedream 4.0 Edit",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image editing by Seedream 4.0",
  },
  {
    modelKey: "bytedance/seedream-4.5-text-to-image",
    modelName: "Seedream 4.5",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "High-quality photorealistic image generation",
  },
  {
    modelKey: "bytedance/seedream-4.5-edit",
    modelName: "Seedream 4.5 Edit",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image editing by Seedream 4.5",
  },
  // Z-Image  
  {
    modelKey: "z-image",
    modelName: "Z-Image",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image generation by Z-Image",
  },
  // Google Imagen Models
  {
    modelKey: "google/imagen4-fast",
    modelName: "Imagen 4 Fast",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Fast image generation by Google Imagen 4",
  },
  {
    modelKey: "google/imagen4-ultra",
    modelName: "Imagen 4 Ultra",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Ultra quality image generation by Google Imagen 4",
  },
  {
    modelKey: "google/imagen4",
    modelName: "Imagen 4",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image generation by Google Imagen 4",
  },
  {
    modelKey: "google/nano-banana-edit",
    modelName: "Nano Banana Edit",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image editing using Google Nano Banana Edit",
  },
  {
    modelKey: "google/nano-banana",
    modelName: "Nano Banana",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image generation using Google Nano Banana",
  },
  {
    modelKey: "google/pro-image-to-image",
    modelName: "Nano Banana Pro",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro Image to Image generation",
  },
  // Flux 2 Models
  {
    modelKey: "flux-2/pro-image-to-image",
    modelName: "Flux-2 Pro I2I",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Image by Flux-2 Pro",
  },
  {
    modelKey: "flux-2/pro-text-to-image",
    modelName: "Flux-2 Pro",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "High-quality photorealistic image generation by Flux-2",
  },
  {
    modelKey: "flux-2/flex-image-to-image",
    modelName: "Flux-2 Flex I2I",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Image by Flux-2 Flex",
  },
  {
    modelKey: "flux-2/flex-text-to-image",
    modelName: "Flux-2 Flex",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image generation by Flux-2 Flex",
  },
  // Grok Imagine Models
  {
    modelKey: "grok-imagine/text-to-image",
    modelName: "Grok Imagine",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "High-quality photorealistic image generation by Grok",
  },
  {
    modelKey: "grok-imagine/image-to-image",
    modelName: "Grok Imagine I2I",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Image by Grok Imagine",
  },
  // GPT Image Models
  {
    modelKey: "gpt-image/1.5-text-to-image",
    modelName: "GPT Image 1.5",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Generate images using GPT Image 1.5",
  },
  {
    modelKey: "gpt-image/1.5-image-to-image",
    modelName: "GPT Image 1.5 I2I",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Image using GPT Image 1.5",
  },
  // Recraft Models
  {
    modelKey: "recraft/remove-background",
    modelName: "Recraft BG Remove",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Remove background by Recraft",
  },
  // Ideogram Models
  {
    modelKey: "ideogram/v3-reframe",
    modelName: "Ideogram V3 Reframe",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image reframing by Ideogram",
  },
  {
    modelKey: "ideogram/character-edit",
    modelName: "Ideogram Character Edit",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Character editing by Ideogram",
  },
  {
    modelKey: "ideogram/character-remix",
    modelName: "Ideogram Character Remix",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Character remixing by Ideogram",
  },
  {
    modelKey: "ideogram/character",
    modelName: "Ideogram Character",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Character generation by Ideogram",
  },
  // Qwen Models
  {
    modelKey: "qwen/text-to-image",
    modelName: "Qwen Text to Image",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "High-quality photorealistic image generation by Qwen",
  },
  {
    modelKey: "qwen/image-to-image",
    modelName: "Qwen Image to Image",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Image by Qwen",
  },
  {
    modelKey: "qwen/image-edit",
    modelName: "Qwen Image Edit",
    modelType: "image" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image editing by Qwen",
  },
];

const upscaleModels = [
  {
    modelKey: "grok-imagine/upscale",
    modelName: "Grok Upscale",
    modelType: "upscale" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Enhance image resolution using Grok",
  },
  {
    modelKey: "topaz/image-upscale",
    modelName: "Topaz Upscale",
    modelType: "upscale" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Enhance image resolution using Topaz AI",
  },
  {
    modelKey: "recraft/crisp-upscale",
    modelName: "Recraft Upscale",
    modelType: "upscale" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Enhance image resolution using Recraft",
  },
];

const videoModels = [
  // Grok Imagine Video
  {
    modelKey: "grok-imagine/text-to-video",
    modelName: "Grok Text to Video",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "High-quality video generation from text by Grok",
    maxVideoDurationSeconds: 6,
  },
  {
    modelKey: "grok-imagine/image-to-video",
    modelName: "Grok Image to Video",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Transform images into videos by Grok",
    maxVideoDurationSeconds: 6,
  },
  // Kling Models
  {
    modelKey: "kling/text-to-video",
    modelName: "Kling 2.6 Text to Video",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Generate videos from text with Kling 2.6",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/image-to-video",
    modelName: "Kling 2.6 Image to Video",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Convert images into videos with Kling 2.6",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/ai-avatar-standard",
    modelName: "Kling AI Avatar Standard",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "AI Avatar generation - Standard quality",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/ai-avatar-pro",
    modelName: "Kling AI Avatar Pro",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "AI Avatar generation - Pro quality",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/v2-1-master-image-to-video",
    modelName: "Kling V2.1 Master I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Master quality Image to Video by Kling V2.1",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/v2-1-master-text-to-video",
    modelName: "Kling V2.1 Master T2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Master quality Text to Video by Kling V2.1",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/v2-1-pro",
    modelName: "Kling V2.1 Pro",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro quality by Kling V2.1",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/v2-1-standard",
    modelName: "Kling V2.1 Standard",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Standard quality by Kling V2.1",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "kling/motion-control",
    modelName: "Kling Motion Control",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Advanced motion control for video generation",
    maxVideoDurationSeconds: 10,
  },
  // Bytedance (Seedance) Models
  {
    modelKey: "bytedance/seedance-1.5-pro",
    modelName: "Seedance 1.5 Pro",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Generate high-quality videos with Seedance 1.5 Pro",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "bytedance/v1-pro-fast-image-to-video",
    modelName: "Bytedance V1 Pro Fast I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Fast Image to Video by Bytedance V1 Pro",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "bytedance/v1-pro-image-to-video",
    modelName: "Bytedance V1 Pro I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Video by Bytedance V1 Pro",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "bytedance/v1-pro-text-to-video",
    modelName: "Bytedance V1 Pro T2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Text to Video by Bytedance V1 Pro",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "bytedance/v1-lite-image-to-video",
    modelName: "Bytedance V1 Lite I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Video by Bytedance V1 Lite",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "bytedance/v1-lite-text-to-video",
    modelName: "Bytedance V1 Lite T2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Text to Video by Bytedance V1 Lite",
    maxVideoDurationSeconds: 5,
  },
  // Hailuo Models
  {
    modelKey: "hailuo/2-3-image-to-video-pro",
    modelName: "Hailuo 2.3 I2V Pro",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro Image to Video by Hailuo 2.3",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "hailuo/2-3-image-to-video-standard",
    modelName: "Hailuo 2.3 I2V Standard",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Standard Image to Video by Hailuo 2.3",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "hailuo/02-text-to-video-pro",
    modelName: "Hailuo 02 T2V Pro",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro Text to Video by Hailuo 02",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "hailuo/02-text-to-video-standard",
    modelName: "Hailuo 02 T2V Standard",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Standard Text to Video by Hailuo 02",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "hailuo/02-image-to-video-pro",
    modelName: "Hailuo 02 I2V Pro",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro Image to Video by Hailuo 02",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "hailuo/02-image-to-video-standard",
    modelName: "Hailuo 02 I2V Standard",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Standard Image to Video by Hailuo 02",
    maxVideoDurationSeconds: 5,
  },
  // Sora2 Models
  {
    modelKey: "sora2/sora-2-image-to-video",
    modelName: "Sora 2 I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Video by Sora 2",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "sora2/sora-2-text-to-video",
    modelName: "Sora 2 T2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Text to Video by Sora 2",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "sora2/sora-2-pro-image-to-video",
    modelName: "Sora 2 Pro I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro Image to Video by Sora 2",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "sora2/sora-2-pro-text-to-video",
    modelName: "Sora 2 Pro T2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Pro Text to Video by Sora 2",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "sora2/sora-watermark-remover",
    modelName: "Sora Watermark Remove",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Remove watermarks from Sora videos",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "sora-2-pro-storyboard",
    modelName: "Sora 2 Pro Storyboard",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Storyboard generation by Sora 2 Pro",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "sora2/sora-2-characters",
    modelName: "Sora 2 Characters",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Character animation by Sora 2",
    maxVideoDurationSeconds: 10,
  },
  // Wan Models
  {
    modelKey: "wan/2-6-image-to-video",
    modelName: "Wan 2.6 I2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Image to Video by Wan 2.6",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "wan/2-6-text-to-video",
    modelName: "Wan 2.6 T2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Text to Video by Wan 2.6",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "wan/2-6-video-to-video",
    modelName: "Wan 2.6 V2V",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Video to Video by Wan 2.6",
    maxVideoDurationSeconds: 10,
  },
  {
    modelKey: "wan/2-2-a14b-image-to-video-turbo",
    modelName: "Wan 2.2 I2V Turbo",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Turbo Image to Video by Wan 2.2",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "wan/2-2-a14b-text-to-video-turbo",
    modelName: "Wan 2.2 T2V Turbo",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Turbo Text to Video by Wan 2.2",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "wan/2-2-animate-move",
    modelName: "Wan 2.2 Animate Move",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Animate with movement by Wan 2.2",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "wan/2-2-animate-replace",
    modelName: "Wan 2.2 Animate Replace",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Animate with replacement by Wan 2.2",
    maxVideoDurationSeconds: 5,
  },
  {
    modelKey: "wan/2-2-a14b-speech-to-video-turbo",
    modelName: "Wan 2.2 S2V Turbo",
    modelType: "video" as const,
    provider: "kie_ai",
    isActive: true,
    description: "Speech to Video by Wan 2.2 Turbo",
    maxVideoDurationSeconds: 5,
  },
];

async function seedModels() {
  console.log("🌱 Starting model seed...");

  // Initialize database connection
  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    // Insert image models
    console.log(`\n📸 Inserting ${imageModels.length} image models...`);
    for (const model of imageModels) {
      try {
        await db.insert(aiModelConfig).values(model);
        console.log(`✅ Added: ${model.modelName} (${model.modelKey})`);
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⏭️  Skipped (already exists): ${model.modelName}`);
        } else {
          console.error(`❌ Error adding ${model.modelName}:`, error.message);
        }
      }
    }

    // Insert upscale models
    console.log(`\n⬆️  Inserting ${upscaleModels.length} upscale models...`);
    for (const model of upscaleModels) {
      try {
        await db.insert(aiModelConfig).values(model);
        console.log(`✅ Added: ${model.modelName} (${model.modelKey})`);
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⏭️  Skipped (already exists): ${model.modelName}`);
        } else {
          console.error(`❌ Error adding ${model.modelName}:`, error.message);
        }
      }
    }

    // Insert video models
    console.log(`\n🎥 Inserting ${videoModels.length} video models...`);
    for (const model of videoModels) {
      try {
        await db.insert(aiModelConfig).values(model);
        console.log(`✅ Added: ${model.modelName} (${model.modelKey})`);
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⏭️  Skipped (already exists): ${model.modelName}`);
        } else {
          console.error(`❌ Error adding ${model.modelName}:`, error.message);
        }
      }
    }

    console.log("\n✅ Model seed completed successfully!");
    console.log(
      `\n📊 Summary:\n- Image Models: ${imageModels.length}\n- Upscale Models: ${upscaleModels.length}\n- Video Models: ${videoModels.length}\n- Total: ${imageModels.length + upscaleModels.length + videoModels.length}`
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedModels();

