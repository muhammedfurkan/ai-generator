/**
 * Initialize Modal Cards
 * Bu script database'deki modalCards tablosuna ilk verileri ekler
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { modalCards } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function initializeModalCards() {
  console.log("🚀 Initializing modal cards...");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const cards = [
    {
      cardKey: "nano_banana_pro",
      title: "NANO BANANA PRO",
      description: "En iyi 4K görsel modeli",
      imageDesktop: "/covers/nano-banana-pro.jpg",
      imageMobile: "/covers/nano-banana-pro.jpg",
      badge: "UNLIMITED",
      badgeColor: "#ef4444",
      path: "/generate",
      category: "images" as const,
      isFeatured: true,
      sortOrder: 0,
      isActive: true,
    },
    {
      cardKey: "generate",
      title: "GÖRSEL OLUŞTUR",
      description: "AI ile görsel oluştur",
      imageDesktop: "/covers/create-image.jpg",
      imageMobile: "/covers/create-image.jpg",
      badge: "CORE",
      badgeColor: "#3b82f6",
      path: "/generate",
      category: "images" as const,
      isFeatured: false,
      sortOrder: 1,
      isActive: true,
    },
    {
      cardKey: "video",
      title: "VİDEO OLUŞTUR",
      description: "AI ile video oluştur",
      imageDesktop: "/covers/create-video.jpg",
      imageMobile: "/covers/create-video.jpg",
      badge: "CORE",
      badgeColor: "#3b82f6",
      path: "/video-generate",
      category: "videos" as const,
      isFeatured: false,
      sortOrder: 2,
      isActive: true,
    },
    {
      cardKey: "motion_control",
      title: "MOTION CONTROL",
      description: "Hareket kontrolü ile video",
      imageDesktop: "/covers/motion-control.jpg",
      imageMobile: "/covers/motion-control.jpg",
      badge: "NEW",
      badgeColor: "#22c55e",
      path: "/motion-control",
      category: "videos" as const,
      isFeatured: false,
      sortOrder: 3,
      isActive: true,
    },
    {
      cardKey: "ai_influencer",
      title: "AI INFLUENCER",
      description: "Kendi AI karakterini oluştur",
      imageDesktop: "/covers/ai-influencer.jpg",
      imageMobile: "/covers/ai-influencer.jpg",
      badge: "NEW",
      badgeColor: "#22c55e",
      path: "/ai-influencer",
      category: "images" as const,
      isFeatured: false,
      sortOrder: 4,
      isActive: true,
    },
    {
      cardKey: "upscale",
      title: "UPSCALE",
      description: "Görselleri 8K'ya yükselt",
      imageDesktop: "/covers/upscale.jpg",
      imageMobile: "/covers/upscale.jpg",
      badge: "NEW",
      badgeColor: "#22c55e",
      path: "/upscale",
      category: "tools" as const,
      isFeatured: false,
      sortOrder: 5,
      isActive: true,
    },
    {
      cardKey: "multi_angle",
      title: "ÇOKLU AÇI FOTOĞRAF",
      description: "Tek fotoğraftan 9-12 farklı açı",
      imageDesktop: "/covers/multi-angle.jpg",
      imageMobile: "/covers/multi-angle.jpg",
      badge: "NEW",
      badgeColor: "#22c55e",
      path: "/multi-angle",
      category: "images" as const,
      isFeatured: false,
      sortOrder: 6,
      isActive: true,
    },
  ];

  try {
    for (const card of cards) {
      // Check if card already exists
      const existing = await db
        .select()
        .from(modalCards)
        .where(eq(modalCards.cardKey, card.cardKey))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${card.title} (already exists)`);
        continue;
      }

      await db.insert(modalCards).values(card);
      console.log(`✅ Added: ${card.title}`);
    }

    console.log("🎉 Modal cards initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing modal cards:", error);
    throw error;
  }
}

// Run the script
initializeModalCards()
  .then(() => {
    console.log("✨ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });

