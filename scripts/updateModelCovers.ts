
// Load environment variables from .env
import 'dotenv/config';

import { getDb } from "../server/db";
import { aiModelConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Model Cover Configuration
// Using high-quality Unsplash images that match the model's aesthetic
const MODEL_COVERS: Record<string, {
  desktop: string;
  mobile: string;
  description: string;
}> = {
  // === IMAGE MODELS ===
  "nano-banana-pro": {
    "desktop": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "mobile": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "description": "Nano Banana'nın en güçlü görüntü modeli. Işık hızında üretim ve ultra gerçekçi detaylar."
  },

  "flux-2-pro": {
    "desktop": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "mobile": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "description": "Black Forest Labs'in amiral gemisi. Olağanüstü kompozisyon ve sanatsal derinlik."
  },

  "flux-kontext-pro": {
    "desktop": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    "mobile": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    "description": "Bağlamı anlayan akıllı model. Karmaşık sahnelerde üstün tutarlılık sağlar."
  },

  "google-imagen4": {
    "desktop": "https://images.unsplash.com/photo-1542751110-97427bbecf20",
    "mobile": "https://images.unsplash.com/photo-1542751110-97427bbecf20",
    "description": "Google'ın en gelişmiş görüntü modeli. Fotogerçekçilikte yeni bir standart."
  },

  "4o-image": {
    "desktop": "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    "mobile": "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    "description": "GPT-4o Vision tabanlı görüntü üretimi. Doğal dil anlayışı ile hassas sonuçlar."
  },

  "ideogram-v3": {
    "desktop": "https://images.unsplash.com/photo-1550745165-9010d618953d",
    "mobile": "https://images.unsplash.com/photo-1550745165-9010d618953d",
    "description": "Metin ve tipografide lider. Posterler, logolar ve sanatsal tasarımlar için ideal."
  },

  "ideogram-character": {
    "desktop": "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
    "mobile": "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
    "description": "Karakter tasarımında uzmanlaşmış Ideogram modeli. Tutarlı ve detaylı portreler."
  },

  "seedream": {
    "desktop": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    "mobile": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    "description": "Rüya gibi sahneler ve hayal gücünün sınırlarını zorlayan kompozisyonlar."
  },

  "seedream-edit": {
    "desktop": "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
    "mobile": "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
    "description": "Mevcut görselleri düzenleyin, dönüştürün ve yeniden hayal edin."
  },

  "grok-imagine": {
    "desktop": "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    "mobile": "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    "description": "xAI tarafından geliştirilen cesur ve minimalist görüntü modeli."
  },

  "qwen": {
    "desktop": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
    "mobile": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
    "description": "Alibaba Cloud'un güçlü Qwen modeli. Çok dilli ve yüksek performanslı üretim."
  },

  "qwen-image": {
    "desktop": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    "mobile": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    "description": "Qwen vizyon yetenekleriyle görseller üzerinde hassas düzenlemeler yapın."
  },

  "z-image": {
    "desktop": "https://images.unsplash.com/photo-1518770660439-4636190af475",
    "mobile": "https://images.unsplash.com/photo-1518770660439-4636190af475",
    "description": "Hızlı, verimli ve keskin görüntü üretimi için optimize edilmiş Z serisi."
  },

  "gpt-image-1.5": {
    "desktop": "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    "mobile": "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    "description": "Gelişmiş GPT mimarisi ile 1.5 sürüm görüntü oluşturma yetenekleri."
  },

  "wan-25": {
    "desktop": "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5",
    "mobile": "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5",
    "description": "Wan 2.5 ile sanatsal manzaralar ve soyut kompozisyonlar."
  },

  "wan-22": {
    "desktop": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "mobile": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "description": "Wan serisinin klasik modeli. Dengeli ve estetik sonuçlar."
  },

  "wan-26": {
    "desktop": "https://images.unsplash.com/photo-1534447677768-be436bb09401",
    "mobile": "https://images.unsplash.com/photo-1534447677768-be436bb09401",
    "description": "Wan 2.6. Fantastik dünyalar ve epik sahneler için ideal."
  },

  "seedance-pro": {
    "desktop": "https://images.unsplash.com/photo-1508615039623-a25605d2b022",
    "mobile": "https://images.unsplash.com/photo-1508615039623-a25605d2b022",
    "description": "Karakter hareketi ve dans animasyonları için özel model."
  },

  "seedance-15-pro": {
    "desktop": "https://images.unsplash.com/photo-1547036967-23d11aacaee0",
    "mobile": "https://images.unsplash.com/photo-1547036967-23d11aacaee0",
    "description": "SeeDance 1.5 Pro ile daha akıcı ve gerçekçi hareketler."
  },

  // === VIDEO MODELS ===
  "veo3": {
    "desktop": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
    "mobile": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
    "description": "Google Veo 3.1. Sinematik kalitede, yüksek çözünürlüklü video üretimi."
  },

  "sora2": {
    "desktop": "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
    "mobile": "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
    "description": "OpenAI Sora 2. Gerçek dünyayı simüle eden, fizik kurallarına sadık videolar."
  },

  "sora2-pro": {
    "desktop": "https://images.unsplash.com/photo-1517602302552-471fe67acf66",
    "mobile": "https://images.unsplash.com/photo-1517602302552-471fe67acf66",
    "description": "Sora 2 Pro. Profesyonel projeleriniz için uzun süreli ve yüksek detaylı videolar."
  },

  "sora2-pro-storyboard": {
    "desktop": "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0",
    "mobile": "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0",
    "description": "Hikaye anlatımı için storyboard modunda Sora 2 Pro."
  },

  "kling": {
    "desktop": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
    "mobile": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
    "description": "Kling 2.0 ile hızlı ve etkileyici video klipler oluşturun."
  },

  "kling-25": {
    "desktop": "https://images.unsplash.com/photo-1485846234645-a62644f84728",
    "mobile": "https://images.unsplash.com/photo-1485846234645-a62644f84728",
    "description": "Kling 2.5: Geliştirilmiş hareket algoritmaları ve görsel kalite."
  },

  "kling-motion": {
    "desktop": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "mobile": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "description": "Harekete hayat verin. Durağan görsellerden dinamik videolar."
  },

  "hailuo": {
    "desktop": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    "mobile": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    "description": "Hailuo 2.3. Hızlı, verimli ve yaratıcı video sahneleri oluşturur."
  },

  "grok": {
    "desktop": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
    "mobile": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
    "description": "Grok Video. xAI'ın video üretimindeki son teknoloji modeli."
  }
}


async function main() {
  console.log("🚀 Starting comprehensive model cover images update...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  let updatedCount = 0;

  for (const [modelKey, data] of Object.entries(MODEL_COVERS)) {
    try {
      const result = await db.update(aiModelConfig)
        .set({
          coverImageDesktop: data.desktop,
          coverImageMobile: data.mobile,
          coverDescription: data.description,
        })
        .where(eq(aiModelConfig.modelKey, modelKey));

      if (result[0].affectedRows > 0) {
        console.log(`✅ Updated covers for model: ${modelKey}`);
        updatedCount++;
      } else {
        // Silent for clean output, or warn if you want to know missing DB entries
        // console.log(`⚠️ Model not found in DB: ${modelKey}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${modelKey}:`, error);
    }
  }

  console.log(`\n✨ Update complete! Updated ${updatedCount} models.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
