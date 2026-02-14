import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { seoSettings, globalSeoConfig } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Admin check middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin yetkisi gerekli" });
  }
  return next({ ctx });
});

export const seoRouter = router({
  // ==================== PAGE SEO SETTINGS ====================
  
  // Get all page SEO settings
  getAllPages: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
    
    const pages = await db.select().from(seoSettings).orderBy(desc(seoSettings.updatedAt));
    return pages;
  }),

  // Get single page SEO settings
  getPage: publicProcedure
    .input(z.object({ pageSlug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
      
      const [page] = await db.select().from(seoSettings).where(eq(seoSettings.pageSlug, input.pageSlug));
      return page || null;
    }),

  // Create page SEO settings
  createPage: adminProcedure
    .input(z.object({
      pageSlug: z.string().min(1).max(100),
      pageName: z.string().min(1).max(200),
      metaTitle: z.string().max(70).optional(),
      metaDescription: z.string().max(160).optional(),
      metaKeywords: z.string().optional(),
      canonicalUrl: z.string().max(500).optional(),
      ogTitle: z.string().max(95).optional(),
      ogDescription: z.string().max(200).optional(),
      ogImage: z.string().optional(),
      ogType: z.enum(["website", "article", "product", "profile"]).optional(),
      ogLocale: z.string().max(10).optional(),
      twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional(),
      twitterTitle: z.string().max(70).optional(),
      twitterDescription: z.string().max(200).optional(),
      twitterImage: z.string().optional(),
      twitterSite: z.string().max(50).optional(),
      twitterCreator: z.string().max(50).optional(),
      robotsIndex: z.boolean().optional(),
      robotsFollow: z.boolean().optional(),
      robotsNoArchive: z.boolean().optional(),
      robotsNoSnippet: z.boolean().optional(),
      structuredData: z.string().optional(),
      priority: z.string().optional(),
      changeFrequency: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
      
      // Check if page already exists
      const [existing] = await db.select().from(seoSettings).where(eq(seoSettings.pageSlug, input.pageSlug));
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu sayfa slug'ı zaten mevcut" });
      }
      
      const [result] = await db.insert(seoSettings).values({
        ...input,
        robotsIndex: input.robotsIndex ?? true,
        robotsFollow: input.robotsFollow ?? true,
        robotsNoArchive: input.robotsNoArchive ?? false,
        robotsNoSnippet: input.robotsNoSnippet ?? false,
        isActive: input.isActive ?? true,
      });
      
      return { success: true, id: result.insertId };
    }),

  // Update page SEO settings
  updatePage: adminProcedure
    .input(z.object({
      id: z.number(),
      pageSlug: z.string().min(1).max(100).optional(),
      pageName: z.string().min(1).max(200).optional(),
      metaTitle: z.string().max(70).nullable().optional(),
      metaDescription: z.string().max(160).nullable().optional(),
      metaKeywords: z.string().nullable().optional(),
      canonicalUrl: z.string().max(500).nullable().optional(),
      ogTitle: z.string().max(95).nullable().optional(),
      ogDescription: z.string().max(200).nullable().optional(),
      ogImage: z.string().nullable().optional(),
      ogType: z.enum(["website", "article", "product", "profile"]).nullable().optional(),
      ogLocale: z.string().max(10).nullable().optional(),
      twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).nullable().optional(),
      twitterTitle: z.string().max(70).nullable().optional(),
      twitterDescription: z.string().max(200).nullable().optional(),
      twitterImage: z.string().nullable().optional(),
      twitterSite: z.string().max(50).nullable().optional(),
      twitterCreator: z.string().max(50).nullable().optional(),
      robotsIndex: z.boolean().optional(),
      robotsFollow: z.boolean().optional(),
      robotsNoArchive: z.boolean().optional(),
      robotsNoSnippet: z.boolean().optional(),
      structuredData: z.string().nullable().optional(),
      priority: z.string().nullable().optional(),
      changeFrequency: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).nullable().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
      
      const { id, ...updateData } = input;
      
      await db.update(seoSettings).set(updateData).where(eq(seoSettings.id, id));
      
      return { success: true };
    }),

  // Delete page SEO settings
  deletePage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
      
      await db.delete(seoSettings).where(eq(seoSettings.id, input.id));
      
      return { success: true };
    }),

  // ==================== GLOBAL SEO CONFIG ====================
  
  // Get global SEO config
  getGlobalConfig: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
    
    const [config] = await db.select().from(globalSeoConfig).limit(1);
    return config || null;
  }),

  // Update global SEO config
  updateGlobalConfig: adminProcedure
    .input(z.object({
      siteName: z.string().max(100).optional(),
      siteTagline: z.string().max(200).nullable().optional(),
      defaultLanguage: z.string().max(10).optional(),
      defaultMetaTitle: z.string().max(70).nullable().optional(),
      defaultMetaDescription: z.string().max(160).nullable().optional(),
      defaultMetaKeywords: z.string().nullable().optional(),
      defaultOgImage: z.string().nullable().optional(),
      facebookAppId: z.string().max(50).nullable().optional(),
      defaultTwitterSite: z.string().max(50).nullable().optional(),
      defaultTwitterCreator: z.string().max(50).nullable().optional(),
      googleVerification: z.string().max(100).nullable().optional(),
      bingVerification: z.string().max(100).nullable().optional(),
      yandexVerification: z.string().max(100).nullable().optional(),
      pinterestVerification: z.string().max(100).nullable().optional(),
      googleAnalyticsId: z.string().max(50).nullable().optional(),
      googleTagManagerId: z.string().max(50).nullable().optional(),
      facebookPixelId: z.string().max(50).nullable().optional(),
      robotsTxtContent: z.string().nullable().optional(),
      sitemapEnabled: z.boolean().optional(),
      organizationName: z.string().max(200).nullable().optional(),
      organizationLogo: z.string().nullable().optional(),
      organizationUrl: z.string().max(500).nullable().optional(),
      contactEmail: z.string().max(200).nullable().optional(),
      contactPhone: z.string().max(50).nullable().optional(),
      socialLinks: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
      
      // Check if config exists
      const [existing] = await db.select().from(globalSeoConfig).limit(1);
      
      if (existing) {
        await db.update(globalSeoConfig).set(input).where(eq(globalSeoConfig.id, existing.id));
      } else {
        await db.insert(globalSeoConfig).values({
          ...input,
          sitemapEnabled: input.sitemapEnabled ?? true,
        });
      }
      
      return { success: true };
    }),

  // ==================== BULK OPERATIONS ====================
  
  // Initialize default pages
  initializeDefaultPages: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
    
    const defaultPages = [
      { pageSlug: "home", pageName: "Ana Sayfa", metaTitle: "NanoInf - AI Görsel ve Video Oluşturucu", metaDescription: "Profesyonel AI görseller, videolar ve karakterler oluşturun. Saniyeler içinde." },
      { pageSlug: "generate", pageName: "Görsel Oluştur", metaTitle: "AI Görsel Oluştur | NanoInf", metaDescription: "Yapay zeka ile profesyonel görseller oluşturun. Nano Banana Pro, Qwen ve SeeDream modelleri." },
      { pageSlug: "video", pageName: "Video Oluştur", metaTitle: "AI Video Oluştur | NanoInf", metaDescription: "Veo 3.1, Sora 2, Kling ile AI video oluşturun. Text-to-video ve image-to-video." },
      { pageSlug: "gallery", pageName: "Galeri", metaTitle: "AI Galeri | NanoInf", metaDescription: "Oluşturduğunuz AI görseller ve videolar." },
      { pageSlug: "ai-influencer", pageName: "AI Influencer", metaTitle: "AI Influencer Oluştur | NanoInf", metaDescription: "Kendi AI karakterinizi oluşturun ve yönetin." },
      { pageSlug: "upscale", pageName: "Görsel Upscale", metaTitle: "Görsel Upscale | NanoInf", metaDescription: "Düşük çözünürlüklü görselleri 8K'ya yükseltin." },
      { pageSlug: "packages", pageName: "Paketler", metaTitle: "Kredi Paketleri | NanoInf", metaDescription: "NanoInf kredi paketleri ve fiyatları." },
      { pageSlug: "blog", pageName: "Blog", metaTitle: "Blog | NanoInf", metaDescription: "AI ve görsel oluşturma hakkında en son haberler ve ipuçları." },
      { pageSlug: "profile", pageName: "Profil", metaTitle: "Profilim | NanoInf", metaDescription: "Hesap ayarları ve kredi bilgileri." },
      { pageSlug: "multi-angle", pageName: "Çoklu Açı", metaTitle: "Çoklu Açı Fotoğraf | NanoInf", metaDescription: "Tek fotoğraftan 4-8 farklı açı oluşturun." },
      { pageSlug: "product-promo", pageName: "Ürün Tanıtım", metaTitle: "Ürün Tanıtım Videosu | NanoInf", metaDescription: "E-ticaret için profesyonel ürün tanıtım videoları." },
      { pageSlug: "skin-enhancement", pageName: "Cilt İyileştirme", metaTitle: "AI Cilt İyileştirme | NanoInf", metaDescription: "Doğal ve profesyonel cilt iyileştirme." },
    ];
    
    let created = 0;
    for (const page of defaultPages) {
      const [existing] = await db.select().from(seoSettings).where(eq(seoSettings.pageSlug, page.pageSlug));
      if (!existing) {
        await db.insert(seoSettings).values({
          ...page,
          robotsIndex: true,
          robotsFollow: true,
          robotsNoArchive: false,
          robotsNoSnippet: false,
          isActive: true,
        });
        created++;
      }
    }
    
    return { success: true, created, message: `${created} sayfa oluşturuldu` };
  }),

  // Get SEO stats
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı kurulamadı" });
    
    const pages = await db.select().from(seoSettings);
    const [config] = await db.select().from(globalSeoConfig).limit(1);
    
    const stats = {
      totalPages: pages.length,
      activePages: pages.filter(p => p.isActive).length,
      pagesWithMeta: pages.filter(p => p.metaTitle && p.metaDescription).length,
      pagesWithOg: pages.filter(p => p.ogTitle && p.ogImage).length,
      pagesWithTwitter: pages.filter(p => p.twitterTitle && p.twitterImage).length,
      pagesIndexed: pages.filter(p => p.robotsIndex).length,
      hasGlobalConfig: !!config,
      hasAnalytics: !!(config?.googleAnalyticsId || config?.googleTagManagerId),
      hasVerification: !!(config?.googleVerification || config?.bingVerification),
    };
    
    return stats;
  }),
});
