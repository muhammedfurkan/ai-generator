/**
 * Settings Router - Public site settings
 * Allows fetching public settings like maintenance mode
 */
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings, viralAppsConfig, aiModelConfig, creditPackages } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { VIRAL_APP_TEMPLATES } from "../../shared/const";

// Type definitions for public package response
export interface PublicPackage {
  id: number;
  name: string;
  description: string | null;
  credits: number;
  price: string;
  originalPrice: string | null;
  badge: string | null;
  features: string[];
  usage1k: number | null;
  usage2k: number | null;
  usage4k: number | null;
  shopierUrl: string | null;
  isHighlighted: boolean | null;
  sortOrder: number;
  bonus: number | null;
}

export const settingsRouter = router({
  // Get public settings (accessible without authentication)
  getPublicSettings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      // Fetch all settings that might be needed publicly
      const publicKeys = [
        "maintenance_mode_enabled",
        "maintenance_message",
        "credit_cost_1k",
        "credit_cost_2k",
        "credit_cost_4k",
        "signup_bonus_credits",
      ];

      const settings = await db
        .select({ key: siteSettings.key, value: siteSettings.value })
        .from(siteSettings);

      // Return only public settings
      return settings.filter(s => publicKeys.includes(s.key));
    } catch (error) {
      console.error("[Settings] Error fetching public settings:", error);
      return [];
    }
  }),

  // Get popular viral apps for homepage (public endpoint)
  getPopularViralApps: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      // Fallback to static templates
      return VIRAL_APP_TEMPLATES.filter(app => app.popular).slice(0, 4).map(app => ({
        id: app.id,
        title: app.title,
        description: app.description,
        credits: app.credits,
        coverImage: `/apps/${app.id}.png`,
        popular: app.popular,
      }));
    }

    try {
      const dbApps = await db.select().from(viralAppsConfig)
        .where(eq(viralAppsConfig.isActive, true))
        .orderBy(asc(viralAppsConfig.sortOrder), asc(viralAppsConfig.name));

      // Map database apps
      const dbAppsFormatted = dbApps.map(app => ({
        id: app.appKey,
        title: app.name,
        description: app.description || "",
        credits: app.credits,
        coverImage: app.coverImage || `/apps/${app.appKey}.png`,
        popular: app.isPopular,
      }));

      // Get IDs of database apps
      const dbAppIds = new Set(dbAppsFormatted.map(app => app.id));

      // Filter static templates that are not in database
      const staticAppsNotInDb = VIRAL_APP_TEMPLATES
        .filter(app => !dbAppIds.has(app.id))
        .map(app => ({
          id: app.id,
          title: app.title,
          description: app.description,
          credits: app.credits,
          coverImage: `/apps/${app.id}.png`,
          popular: app.popular,
        }));

      // Merge all apps
      const allApps = [...dbAppsFormatted, ...staticAppsNotInDb];

      // Get popular apps first, then fill with other apps if needed
      const popularApps = allApps.filter(app => app.popular);
      const otherApps = allApps.filter(app => !app.popular);
      const appsToShow = [...popularApps, ...otherApps].slice(0, 4);

      return appsToShow;
    } catch (error) {
      console.error("[Settings] Error fetching viral apps:", error);
      return VIRAL_APP_TEMPLATES.filter(app => app.popular).slice(0, 4).map(app => ({
        id: app.id,
        title: app.title,
        description: app.description,
        credits: app.credits,
        coverImage: `/apps/${app.id}.png`,
        popular: app.popular,
      }));
    }
  }),

  // Get public credit packages for /packages page
  getPublicPackages: publicProcedure.query(async (): Promise<PublicPackage[]> => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const packages = await db.select()
        .from(creditPackages)
        .where(eq(creditPackages.isActive, true))
        .orderBy(asc(creditPackages.sortOrder));

      console.log(`[Settings] Fetched ${packages.length} active package(s)`);

      const mappedPackages: PublicPackage[] = packages.map(pkg => {
        // Parse features safely
        let features: string[] = [];
        try {
          features = pkg.features ? JSON.parse(pkg.features) : [];
        } catch (e) {
          console.error(`[Settings] Failed to parse features for package ${pkg.id}:`, e);
        }

        const mapped: PublicPackage = {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          credits: pkg.credits,
          price: pkg.price?.toString() ?? "0",
          originalPrice: pkg.originalPrice?.toString() ?? null,
          badge: pkg.badge,
          features,
          usage1k: pkg.usage1k,
          usage2k: pkg.usage2k,
          usage4k: pkg.usage4k,
          shopierUrl: pkg.shopierUrl,
          isHighlighted: pkg.isHighlighted ? true : false,
          sortOrder: pkg.sortOrder,
          bonus: pkg.bonus,
        };

        // Debug: Ensure ID is present
        if (!mapped.id) {
          console.error(`[Settings] ⚠️  Package missing ID! Raw data:`, pkg);
        }

        return mapped;
      });

      return mappedPackages;
    } catch (error) {
      console.error("[Settings] Error fetching packages:", error);
      return [];
    }
  }),

  // Get active announcements for frontend display
  getPublicAnnouncements: publicProcedure.query(async () => {
    const { announcements } = await import("../../drizzle/schema");
    const { eq, and, or, lte, gte, isNull, desc } = await import("drizzle-orm");

    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const now = new Date();

      // Get active announcements that are within date range
      const activeAnnouncements = await db.select()
        .from(announcements)
        .where(
          and(
            eq(announcements.isActive, true),
            // Either no start date or start date is in the past
            or(
              isNull(announcements.startDate),
              lte(announcements.startDate, now)
            ),
            // Either no end date or end date is in the future
            or(
              isNull(announcements.endDate),
              gte(announcements.endDate, now)
            )
          )
        )
        .orderBy(desc(announcements.priority), desc(announcements.createdAt));

      return activeAnnouncements.map(ann => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        type: ann.type,
        targetAudience: ann.targetAudience,
        buttonText: ann.buttonText,
        buttonUrl: ann.buttonUrl,
        imageUrl: ann.imageUrl,
        backgroundColor: ann.backgroundColor,
        textColor: ann.textColor,
        dismissible: ann.dismissible,
        showOnce: ann.showOnce,
        priority: ann.priority,
      }));
    } catch (error) {
      console.error("[Settings] Error fetching announcements:", error);
      return [];
    }
  }),

  // Get active FAQs for frontend display
  getPublicFaqs: publicProcedure.query(async () => {
    const { faqs } = await import("../../drizzle/schema");
    const { eq, asc } = await import("drizzle-orm");

    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const activeFaqs = await db.select()
        .from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(asc(faqs.sortOrder), asc(faqs.id));

      return activeFaqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sortOrder: faq.sortOrder,
      }));
    } catch (error) {
      console.error("[Settings] Error fetching FAQs:", error);
      return [];
    }
  }),

  // Get package page messages (bonus and validity messages)
  getPackageMessages: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { bonusMessage: null, validityMessage: null };
    }

    try {
      const settings = await db.select()
        .from(siteSettings);

      const packageSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      // Only return messages if enabled and text is not empty
      const bonusEnabled = packageSettings["packages_bonus_message"] === "true";
      const bonusText = packageSettings["packages_bonus_text"] || "";
      const validityEnabled = packageSettings["packages_validity_message"] === "true";
      const validityText = packageSettings["packages_validity_text"] || "";

      return {
        bonusMessage: bonusEnabled && bonusText.trim() ? bonusText : null,
        validityMessage: validityEnabled && validityText.trim() ? validityText : null,
      };
    } catch (error) {
      console.error("[Settings] Error fetching package messages:", error);
      return { bonusMessage: null, validityMessage: null };
    }
  }),

  // Get active AI models with cover images for frontend display
  getPublicModels: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { imageModels: [], videoModels: [] };
    }

    try {
      const activeModels = await db.select({
        id: aiModelConfig.id,
        modelKey: aiModelConfig.modelKey,
        modelName: aiModelConfig.modelName,
        modelType: aiModelConfig.modelType,
        provider: aiModelConfig.provider,
        description: aiModelConfig.description,
        coverImageDesktop: aiModelConfig.coverImageDesktop,
        coverImageMobile: aiModelConfig.coverImageMobile,
        coverDescription: aiModelConfig.coverDescription,
        priority: aiModelConfig.priority,
        isMaintenanceMode: aiModelConfig.isMaintenanceMode,
        configJson: aiModelConfig.configJson,
      })
        .from(aiModelConfig)
        .where(eq(aiModelConfig.isActive, true))
        .orderBy(asc(aiModelConfig.priority), asc(aiModelConfig.modelName));

      // Helper to parse config JSON
      const parseModelConfig = (configJson: string | null) => {
        if (!configJson) return {};
        try {
          return JSON.parse(configJson);
        } catch (e) {
          console.error('[Settings] Failed to parse model configJson:', e);
          return {};
        }
      };

      // Group by type
      const imageModels = activeModels.filter(m => m.modelType === "image");
      const videoModels = activeModels.filter(m => m.modelType === "video");

      return {
        imageModels: imageModels.map(m => {
          const config = parseModelConfig(m.configJson);
          return {
            id: m.id,
            modelKey: m.modelKey,
            modelName: m.modelName,
            provider: m.provider,
            description: m.description,
            coverImageDesktop: m.coverImageDesktop,
            coverImageMobile: m.coverImageMobile,
            coverDescription: m.coverDescription,
            isMaintenanceMode: m.isMaintenanceMode || false,
            // Model-specific configuration
            supportedAspectRatios: config.supportedAspectRatios || ["1:1", "16:9", "9:16"],
            supportedResolutions: config.supportedResolutions || ["1K", "2K"],
            defaultAspectRatio: config.defaultAspectRatio || "1:1",
            defaultResolution: config.defaultResolution || "1K",
            supportsReferenceImage: config.supportsReferenceImage !== false,
            maxReferenceImages: config.maxReferenceImages || 1,
          };
        }),
        videoModels: videoModels.map(m => {
          const config = parseModelConfig(m.configJson);
          const isSora2 = m.modelKey === "sora2";
          return {
            id: m.id,
            modelKey: m.modelKey,
            modelName: m.modelName,
            provider: m.provider,
            description: m.description,
            coverImageDesktop: m.coverImageDesktop,
            coverImageMobile: m.coverImageMobile,
            coverDescription: m.coverDescription,
            isMaintenanceMode: m.isMaintenanceMode,
            // Model-specific configuration
            supportedAspectRatios:
              isSora2
                ? ["16:9", "9:16", "1:1"]
                : config.supportedAspectRatios,
            supportedDurations:
              isSora2 ? ["10", "15"] : config.supportedDurations,
            supportedQualities:
              isSora2 ? ["standard", "pro"] : config.supportedQualities,
            supportedResolutions: config.supportedResolutions,
            defaultAspectRatio: isSora2 ? "16:9" : config.defaultAspectRatio,
            defaultDuration: isSora2 ? "10" : config.defaultDuration,
            defaultQuality: isSora2 ? "standard" : config.defaultQuality,
            defaultResolution: config.defaultResolution,
            // Generation mode support
            supportsTextToVideo: config.supportsTextToVideo !== false,
            supportsImageToVideo: config.supportsImageToVideo !== false,
            supportsVideoToVideo: config.supportsVideoToVideo || false,
            supportsReferenceVideo: config.supportsReferenceVideo || false,
            // Additional features
            hasAudioSupport: isSora2 ? false : config.hasAudioSupport || false,
            hasMultiShotSupport: config.hasMultiShotSupport || false,
            specialFeatures: config.specialFeatures || [], // ✨ Sora 2 special features
          };
        }),
      };
    } catch (error) {
      console.error("[Settings] Error fetching public models:", error);
      return { imageModels: [], videoModels: [] };
    }
  }),
});

export type SettingsRouter = typeof settingsRouter;
