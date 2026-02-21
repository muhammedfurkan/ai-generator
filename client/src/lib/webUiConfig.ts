export interface WebUiStat {
  label: string;
  value: string;
}

export interface WebUiFooterLink {
  label: string;
  path: string;
}

export const HOME_SECTION_IDS = [
  "ai-tools",
  "models",
  "images",
  "videos",
  "community",
  "cta",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const SEO_PAGE_KEYS = ["home", "blog", "gallery"] as const;

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number];

export interface WebUiSeoPageOverride {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface WebUiConfig {
  hero: {
    badge: string;
    titlePrefix: string;
    titleSuffix: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaPath: string;
    secondaryCtaLabel: string;
    secondaryCtaPath: string;
    stats: WebUiStat[];
  };
  navigation: {
    headerMainNavOrder: string[];
    mobileBottomNavOrder: string[];
    mobileMenuNavOrder: string[];
  };
  home: {
    desktopToolOrder: string[];
    mobileToolOrder: string[];
    mobileBannerOrder: string[];
    mobileViralAppOrder: string[];
    sectionOrder: HomeSectionId[];
    sectionVisibility: Record<HomeSectionId, boolean>;
  };
  footer: {
    description: string;
    telegramUrl: string;
    supportEmail: string;
    quickLinks: WebUiFooterLink[];
  };
  seo: {
    pageOverrides: Record<SeoPageKey, WebUiSeoPageOverride>;
  };
}

export const DEFAULT_WEB_UI_CONFIG: WebUiConfig = {
  hero: {
    badge: "Yeni Nesil AI İçerik Stüdyosu",
    titlePrefix: "Saniyeler İçinde",
    titleSuffix: "AI İçerik Üret",
    subtitle:
      "Görsel, video, motion ve influencer üretim akışlarını tek panelden yönet.",
    primaryCtaLabel: "Hemen Başla",
    primaryCtaPath: "/generate",
    secondaryCtaLabel: "Video Oluştur",
    secondaryCtaPath: "/video-generate",
    stats: [
      { value: "20+", label: "AI Models" },
      { value: "4K", label: "Output Quality" },
      { value: "24/7", label: "Generation" },
    ],
  },
  navigation: {
    headerMainNavOrder: [
      "upscale",
      "video-generate",
      "motion-control",
      "ai-influencer",
      "audio-generate",
      "music-generate",
      "gallery",
      "blog",
    ],
    mobileBottomNavOrder: [
      "home",
      "community-characters",
      "create",
      "gallery",
      "profile",
    ],
    mobileMenuNavOrder: [
      "upscale",
      "video-generate",
      "motion-control",
      "ai-influencer",
      "gallery",
      "blog",
      "profile",
    ],
  },
  home: {
    desktopToolOrder: [
      "image-gen",
      "video-gen",
      "motion-control",
      "ai-influencer",
      "upscale",
      "multi-angle",
      "product-promo",
      "logo-generator",
      "prompt-compiler",
    ],
    mobileToolOrder: [
      "generate",
      "video",
      "motion-control",
      "influencer",
      "upscale",
      "multi-angle",
      "product-promo",
      "logo-generator",
      "skin-enhancement",
    ],
    mobileBannerOrder: [
      "ai-influencer",
      "motion-control",
      "ugc-ad",
      "product-promo",
      "upscale",
      "prompt-compiler",
      "skin-enhancement",
    ],
    mobileViralAppOrder: [
      "hug",
      "kiss",
      "dance",
      "talk",
      "age",
      "style",
      "hair",
      "smile",
    ],
    sectionOrder: [...HOME_SECTION_IDS],
    sectionVisibility: {
      "ai-tools": true,
      models: true,
      images: true,
      videos: true,
      community: true,
      cta: true,
    },
  },
  footer: {
    description:
      "AI destekli görsel ve video üretimini tek platformda birleştiren üretim stüdyosu.",
    telegramUrl: "https://t.me/nanoinfluencer",
    supportEmail: "support@lumiohan.com",
    quickLinks: [
      { label: "AI Görsel", path: "/generate" },
      { label: "AI Video", path: "/video-generate" },
      { label: "AI Influencer", path: "/ai-influencer" },
      { label: "Galeri", path: "/gallery" },
      { label: "Paketler", path: "/packages" },
    ],
  },
  seo: {
    pageOverrides: {
      home: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      },
      blog: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      },
      gallery: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      },
    },
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

const normalizeStringArray = (value: unknown, fallback: string[]) => {
  if (!isStringArray(value)) return fallback;

  const deduped = Array.from(
    new Set(value.map(item => item.trim()).filter(Boolean))
  );

  return deduped.length > 0 ? deduped : fallback;
};

const normalizeHomeSectionOrder = (
  value: unknown,
  fallback: HomeSectionId[]
): HomeSectionId[] => {
  if (!isStringArray(value)) return fallback;

  const deduped = Array.from(
    new Set(
      value
        .map(item => item.trim())
        .filter((item): item is HomeSectionId =>
          HOME_SECTION_IDS.includes(item as HomeSectionId)
        )
    )
  );

  return deduped.length > 0 ? deduped : fallback;
};

const normalizeSectionVisibility = (
  value: unknown,
  fallback: Record<HomeSectionId, boolean>
): Record<HomeSectionId, boolean> => {
  if (!isRecord(value)) return fallback;

  const next = { ...fallback };
  for (const sectionId of HOME_SECTION_IDS) {
    if (typeof value[sectionId] === "boolean") {
      next[sectionId] = value[sectionId] as boolean;
    }
  }

  return next;
};

const normalizeStats = (value: unknown, fallback: WebUiStat[]) => {
  if (!Array.isArray(value)) return fallback;

  const stats = value
    .filter(isRecord)
    .map(item => ({
      label: typeof item.label === "string" ? item.label.trim() : "",
      value: typeof item.value === "string" ? item.value.trim() : "",
    }))
    .filter(item => item.label && item.value);

  return stats.length > 0 ? stats : fallback;
};

const normalizeFooterLinks = (value: unknown, fallback: WebUiFooterLink[]) => {
  if (!Array.isArray(value)) return fallback;

  const links = value
    .filter(isRecord)
    .map(item => ({
      label: typeof item.label === "string" ? item.label.trim() : "",
      path: typeof item.path === "string" ? item.path.trim() : "",
    }))
    .filter(item => item.label && item.path);

  return links.length > 0 ? links : fallback;
};

const normalizeSeoOverrides = (
  value: unknown,
  fallback: Record<SeoPageKey, WebUiSeoPageOverride>
): Record<SeoPageKey, WebUiSeoPageOverride> => {
  if (!isRecord(value)) return fallback;

  const next = { ...fallback };

  for (const pageKey of SEO_PAGE_KEYS) {
    const pageValue = value[pageKey];
    if (!isRecord(pageValue)) continue;

    next[pageKey] = {
      metaTitle:
        typeof pageValue.metaTitle === "string"
          ? pageValue.metaTitle
          : fallback[pageKey].metaTitle,
      metaDescription:
        typeof pageValue.metaDescription === "string"
          ? pageValue.metaDescription
          : fallback[pageKey].metaDescription,
      ogImage:
        typeof pageValue.ogImage === "string"
          ? pageValue.ogImage
          : fallback[pageKey].ogImage,
    };
  }

  return next;
};

export const parseWebUiConfig = (
  rawValue: string | null | undefined
): WebUiConfig => {
  if (!rawValue) return DEFAULT_WEB_UI_CONFIG;

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!isRecord(parsed)) {
      return DEFAULT_WEB_UI_CONFIG;
    }

    const hero = isRecord(parsed.hero) ? parsed.hero : {};
    const navigation = isRecord(parsed.navigation) ? parsed.navigation : {};
    const home = isRecord(parsed.home) ? parsed.home : {};
    const footer = isRecord(parsed.footer) ? parsed.footer : {};
    const seo = isRecord(parsed.seo) ? parsed.seo : {};

    return {
      hero: {
        badge:
          typeof hero.badge === "string"
            ? hero.badge
            : DEFAULT_WEB_UI_CONFIG.hero.badge,
        titlePrefix:
          typeof hero.titlePrefix === "string"
            ? hero.titlePrefix
            : DEFAULT_WEB_UI_CONFIG.hero.titlePrefix,
        titleSuffix:
          typeof hero.titleSuffix === "string"
            ? hero.titleSuffix
            : DEFAULT_WEB_UI_CONFIG.hero.titleSuffix,
        subtitle:
          typeof hero.subtitle === "string"
            ? hero.subtitle
            : DEFAULT_WEB_UI_CONFIG.hero.subtitle,
        primaryCtaLabel:
          typeof hero.primaryCtaLabel === "string"
            ? hero.primaryCtaLabel
            : DEFAULT_WEB_UI_CONFIG.hero.primaryCtaLabel,
        primaryCtaPath:
          typeof hero.primaryCtaPath === "string"
            ? hero.primaryCtaPath
            : DEFAULT_WEB_UI_CONFIG.hero.primaryCtaPath,
        secondaryCtaLabel:
          typeof hero.secondaryCtaLabel === "string"
            ? hero.secondaryCtaLabel
            : DEFAULT_WEB_UI_CONFIG.hero.secondaryCtaLabel,
        secondaryCtaPath:
          typeof hero.secondaryCtaPath === "string"
            ? hero.secondaryCtaPath
            : DEFAULT_WEB_UI_CONFIG.hero.secondaryCtaPath,
        stats: normalizeStats(hero.stats, DEFAULT_WEB_UI_CONFIG.hero.stats),
      },
      navigation: {
        headerMainNavOrder: normalizeStringArray(
          navigation.headerMainNavOrder,
          DEFAULT_WEB_UI_CONFIG.navigation.headerMainNavOrder
        ),
        mobileBottomNavOrder: normalizeStringArray(
          navigation.mobileBottomNavOrder,
          DEFAULT_WEB_UI_CONFIG.navigation.mobileBottomNavOrder
        ),
        mobileMenuNavOrder: normalizeStringArray(
          navigation.mobileMenuNavOrder,
          DEFAULT_WEB_UI_CONFIG.navigation.mobileMenuNavOrder
        ),
      },
      home: {
        desktopToolOrder: normalizeStringArray(
          home.desktopToolOrder,
          DEFAULT_WEB_UI_CONFIG.home.desktopToolOrder
        ),
        mobileToolOrder: normalizeStringArray(
          home.mobileToolOrder,
          DEFAULT_WEB_UI_CONFIG.home.mobileToolOrder
        ),
        mobileBannerOrder: normalizeStringArray(
          home.mobileBannerOrder,
          DEFAULT_WEB_UI_CONFIG.home.mobileBannerOrder
        ),
        mobileViralAppOrder: normalizeStringArray(
          home.mobileViralAppOrder,
          DEFAULT_WEB_UI_CONFIG.home.mobileViralAppOrder
        ),
        sectionOrder: normalizeHomeSectionOrder(
          home.sectionOrder,
          DEFAULT_WEB_UI_CONFIG.home.sectionOrder
        ),
        sectionVisibility: normalizeSectionVisibility(
          home.sectionVisibility,
          DEFAULT_WEB_UI_CONFIG.home.sectionVisibility
        ),
      },
      footer: {
        description:
          typeof footer.description === "string"
            ? footer.description
            : DEFAULT_WEB_UI_CONFIG.footer.description,
        telegramUrl:
          typeof footer.telegramUrl === "string"
            ? footer.telegramUrl
            : DEFAULT_WEB_UI_CONFIG.footer.telegramUrl,
        supportEmail:
          typeof footer.supportEmail === "string"
            ? footer.supportEmail
            : DEFAULT_WEB_UI_CONFIG.footer.supportEmail,
        quickLinks: normalizeFooterLinks(
          footer.quickLinks,
          DEFAULT_WEB_UI_CONFIG.footer.quickLinks
        ),
      },
      seo: {
        pageOverrides: normalizeSeoOverrides(
          seo.pageOverrides,
          DEFAULT_WEB_UI_CONFIG.seo.pageOverrides
        ),
      },
    };
  } catch {
    return DEFAULT_WEB_UI_CONFIG;
  }
};

export const orderByIds = <T extends { id: string }>(
  items: T[],
  orderedIds: string[]
): T[] => {
  if (orderedIds.length === 0) return items;

  const itemMap = new Map(items.map(item => [item.id, item]));
  const ordered = orderedIds
    .map(id => itemMap.get(id))
    .filter((item): item is T => Boolean(item));

  const leftovers = items.filter(item => !orderedIds.includes(item.id));

  return [...ordered, ...leftovers];
};

export const getOrderMap = (orderedIds: string[]) => {
  const map = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    map.set(id, index);
  });

  return map;
};

export const getSeoOverrideForSlug = (
  config: WebUiConfig,
  slug: string
): WebUiSeoPageOverride | null => {
  const normalized = slug.replace(/^\/+/, "");
  const firstSegment = normalized.split("/")[0] || "home";

  if (!SEO_PAGE_KEYS.includes(firstSegment as SeoPageKey)) {
    return null;
  }

  return config.seo.pageOverrides[firstSegment as SeoPageKey] ?? null;
};
