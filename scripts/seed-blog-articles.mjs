import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const articles = JSON.parse(readFileSync(join(__dirname, '..', 'blog-articles.json'), 'utf-8'));

// Cover image mapping
const coverImages = {
  'ai-gorsel-olusturma-rehberi-2024': '/blog-covers/yapay-zeka-fotograf.jpg',
  'e-ticarette-urun-fotografciligi-ai-cozumleri': '/blog-covers/e-ticaret-urun-fotografi.jpg',
  'sosyal-medya-icerik-stratejisi-ai-araclari': '/blog-covers/sosyal-medya-icerik.jpg',
  'ai-influencer-nedir-sanal-influencer': '/blog-covers/ai-influencer-nedir.jpg',
  'gorsel-kalite-artirma-upscale-teknolojisi': '/blog-covers/gorsel-optimizasyon.jpg',
  'ai-video-icerik-uretimi-sora-veo-kling': '/blog-covers/gelecek-trendleri.jpg',
  'marka-kimligi-gorsel-tutarlilik-ai': '/blog-covers/marka-kimligi.jpg',
  'ai-prompt-yazma-teknikleri': '/blog-covers/dijital-pazarlama.jpg',
  'ai-fotografciligin-gelecegi-2025': '/blog-covers/gelecek-trendleri.jpg',
  'coklu-aci-fotograf-teknolojisi': '/blog-covers/fotograf-teknikleri.jpg'
};

// Calculate read time based on content length
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} dk`;
}

async function seedBlogArticles() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('🚀 Blog makaleleri ekleniyor...\n');
  
  for (const article of articles) {
    try {
      // Check if article with same slug exists
      const [existing] = await connection.execute(
        'SELECT id FROM blogPosts WHERE slug = ?',
        [article.slug]
      );
      
      if (existing.length > 0) {
        console.log(`⏭️  "${article.title}" zaten mevcut, atlanıyor...`);
        continue;
      }
      
      const coverImage = coverImages[article.slug] || '/blog-covers/ai-influencer-nedir.jpg';
      const readTime = calculateReadTime(article.content);
      const category = article.category || 'Genel';
      
      // Insert article - matching actual table structure
      await connection.execute(
        `INSERT INTO blogPosts (title, slug, description, content, coverImage, category, author, readTime, status, viewCount, createdAt, updatedAt, publishedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [
          article.title,
          article.slug,
          article.excerpt, // description field
          article.content,
          coverImage,
          category,
          'NanoInfluencer',
          readTime,
          'published',
          0
        ]
      );
      
      console.log(`✅ "${article.title}" eklendi (${readTime} okuma)`);
    } catch (error) {
      console.error(`❌ "${article.title}" eklenirken hata:`, error.message);
    }
  }
  
  await connection.end();
  console.log('\n🎉 Tüm makaleler işlendi!');
}

seedBlogArticles().catch(console.error);
