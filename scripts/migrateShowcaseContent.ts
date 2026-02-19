/**
 * Migration script to populate showcase images and videos
 * Run with: npx tsx scripts/migrateShowcaseContent.ts
 */
import { getDb } from "../server/db";
import { showcaseImages, showcaseVideos } from "../drizzle/schema";

const SHOWCASE_IMAGES = [
  { imageUrl: "/gallery/showcase-1.jpg", aspectRatio: "square" as const, order: 1 },
  { imageUrl: "/gallery/showcase-2.jpg", aspectRatio: "portrait" as const, order: 2 },
  { imageUrl: "/gallery/showcase-3.jpg", aspectRatio: "square" as const, order: 3 },
  { imageUrl: "/gallery/showcase-4.jpg", aspectRatio: "portrait" as const, order: 4 },
  { imageUrl: "/gallery/sample-1.jpg", aspectRatio: "landscape" as const, order: 5 },
  { imageUrl: "/gallery/sample-2.jpg", aspectRatio: "square" as const, order: 6 },
  { imageUrl: "/gallery/sample-3.jpg", aspectRatio: "portrait" as const, order: 7 },
  { imageUrl: "/gallery/sample-4.jpg", aspectRatio: "landscape" as const, order: 8 },
  { imageUrl: "/gallery/sample-5.jpg", aspectRatio: "square" as const, order: 9 },
  { imageUrl: "/gallery/sample-6.jpg", aspectRatio: "portrait" as const, order: 10 },
  { imageUrl: "/gallery/sample-7.jpg", aspectRatio: "landscape" as const, order: 11 },
  { imageUrl: "/gallery/sample-8.jpg", aspectRatio: "square" as const, order: 12 },
];

const SHOWCASE_VIDEOS = [
  { 
    videoUrl: "/gallery/video-1.mp4", 
    posterUrl: "/gallery/showcase-2.jpg",
    title: "AI Video #1",
    order: 1 
  },
  { 
    videoUrl: "/gallery/video-2.mp4", 
    posterUrl: "/gallery/showcase-3.jpg",
    title: "AI Video #2",
    order: 2 
  },
  { 
    videoUrl: "/gallery/video-3.mp4", 
    posterUrl: "/gallery/showcase-4.jpg",
    title: "AI Video #3",
    order: 3 
  },
];

async function migrateShowcaseContent() {
  const database = await getDb();
  
  if (!database) {
    console.error("Database connection failed");
    process.exit(1);
  }

  try {
    console.log("Starting showcase content migration...");

    // Check if data already exists
    const existingImages = await database.select().from(showcaseImages).limit(1);
    const existingVideos = await database.select().from(showcaseVideos).limit(1);

    // Insert images
    if (existingImages.length === 0) {
      console.log(`Inserting ${SHOWCASE_IMAGES.length} showcase images...`);
      for (const image of SHOWCASE_IMAGES) {
        await database.insert(showcaseImages).values({
          imageUrl: image.imageUrl,
          thumbnailUrl: image.imageUrl,
          title: `AI Generated Image #${image.order}`,
          aspectRatio: image.aspectRatio,
          order: image.order,
          isActive: 1,
        });
      }
      console.log("✓ Showcase images inserted successfully");
    } else {
      console.log("Showcase images already exist, skipping...");
    }

    // Insert videos
    if (existingVideos.length === 0) {
      console.log(`Inserting ${SHOWCASE_VIDEOS.length} showcase videos...`);
      for (const video of SHOWCASE_VIDEOS) {
        await database.insert(showcaseVideos).values({
          videoUrl: video.videoUrl,
          posterUrl: video.posterUrl,
          title: video.title,
          order: video.order,
          isActive: 1,
        });
      }
      console.log("✓ Showcase videos inserted successfully");
    } else {
      console.log("Showcase videos already exist, skipping...");
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

migrateShowcaseContent();
