/**
 * KIE.AI Pricing Sync Service
 * KIE.AI API'sinden fiyatları çekip featurePricing tablosuna senkronize eder.
 * Admin panelden "KIE.AI'den Fiyatları Çek" butonu ile tetiklenir.
 */

interface KieAiPricingRecord {
  modelDescription: string;
  interfaceType: string;
  provider: string;
  creditPrice: string;
  creditUnit: string;
  usdPrice: string;
  falPrice: string;
  discountRate: number;
  anchor: string;
  discountPrice: boolean;
}

interface KieAiPricingResponse {
  code: number;
  msg: string;
  data: {
    records: KieAiPricingRecord[];
    total: number;
    pages: number;
    current: number;
    size: number;
  };
}

const KIE_AI_PRICING_URL =
  "https://api.kie.ai/client/v1/model-pricing/page";

/**
 * KIE.AI API'sinden tüm fiyatlandırma verilerini çeker (tüm sayfalar)
 */
export async function fetchAllKieAiPricing(): Promise<KieAiPricingRecord[]> {
  const allRecords: KieAiPricingRecord[] = [];
  let pageNum = 1;
  let totalPages = 1;

  while (pageNum <= totalPages) {
    const response = await fetch(KIE_AI_PRICING_URL, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        origin: "https://kie.ai",
        referer: "https://kie.ai/",
      },
      body: JSON.stringify({
        pageNum,
        pageSize: 100,
        modelDescription: "",
        interfaceType: "",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `KIE.AI API error: ${response.status} ${response.statusText}`
      );
    }

    const data: KieAiPricingResponse = await response.json();

    if (data.code !== 200) {
      throw new Error(`KIE.AI API returned code ${data.code}: ${data.msg}`);
    }

    allRecords.push(...data.data.records);
    totalPages = data.data.pages;
    pageNum++;
  }

  console.log(
    `[KieAiSync] Fetched ${allRecords.length} pricing records from KIE.AI`
  );
  return allRecords;
}

/**
 * KIE.AI fiyatlarını featurePricing tablosuna senkronize eder (upsert)
 */
export async function syncKieAiPricingToDb(): Promise<{
  inserted: number;
  updated: number;
  total: number;
}> {
  const { getDb } = await import("./db");
  const { featurePricing } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) throw new Error("Database connection not available");

  const records = await fetchAllKieAiPricing();
  let inserted = 0;
  let updated = 0;

  for (const record of records) {
    const featureKey = generateFeatureKey(record);
    const category = mapInterfaceTypeToCategory(record.interfaceType);
    const credits = parseCredits(record.creditPrice);

    const existing = await db
      .select()
      .from(featurePricing)
      .where(eq(featurePricing.featureKey, featureKey))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(featurePricing).values({
        featureKey,
        featureName: record.modelDescription,
        category: category as any,
        credits,
        description: `${record.provider} - ${record.creditUnit} | USD: $${record.usdPrice || "N/A"}`,
        isActive: 1,
        kieModelDescription: record.modelDescription,
        kieInterfaceType: record.interfaceType,
        kieProvider: record.provider,
        kieCreditPrice: record.creditPrice,
        kieCreditUnit: record.creditUnit,
        kieUsdPrice: record.usdPrice || "",
        lastSyncedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
      inserted++;
    } else {
      await db
        .update(featurePricing)
        .set({
          credits,
          featureName: record.modelDescription,
          description: `${record.provider} - ${record.creditUnit} | USD: $${record.usdPrice || "N/A"}`,
          kieModelDescription: record.modelDescription,
          kieInterfaceType: record.interfaceType,
          kieProvider: record.provider,
          kieCreditPrice: record.creditPrice,
          kieCreditUnit: record.creditUnit,
          kieUsdPrice: record.usdPrice || "",
          lastSyncedAt: new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        })
        .where(eq(featurePricing.featureKey, featureKey));
      updated++;
    }
  }

  // Invalidate pricing cache and refresh in-memory maps
  invalidatePricingCache();
  await refreshPricingMapsFromDb();

  console.log(
    `[KieAiSync] Sync complete: ${inserted} inserted, ${updated} updated, ${records.length} total`
  );

  return { inserted, updated, total: records.length };
}

/**
 * Generate a stable feature key from KIE.AI record
 */
function generateFeatureKey(record: KieAiPricingRecord): string {
  return record.modelDescription
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);
}

/**
 * Map KIE.AI interfaceType to our category enum
 */
function mapInterfaceTypeToCategory(interfaceType: string): string {
  const map: Record<string, string> = {
    video: "video",
    image: "image",
    music: "music",
    chat: "chat",
  };
  return map[interfaceType] || "image";
}

/**
 * Parse credit price string to integer (round up for fractional)
 */
function parseCredits(creditPrice: string): number {
  const val = parseFloat(creditPrice);
  if (isNaN(val) || val <= 0) return 1;
  return Math.round(val);
}

// ─── In-memory pricing cache (loaded from DB) ────────────────────────────────

let pricingCacheMap: Map<string, number> | null = null;
let pricingCacheExpiry = 0;
const PRICING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Invalidate the in-memory pricing cache (called after sync)
 */
export function invalidatePricingCache(): void {
  pricingCacheMap = null;
  pricingCacheExpiry = 0;
  console.log("[KieAiSync] Pricing cache invalidated");
}

/**
 * Load all featurePricing from DB into a Map<featureKey, credits>
 */
async function loadPricingCache(): Promise<Map<string, number>> {
  if (pricingCacheMap && Date.now() < pricingCacheExpiry) {
    return pricingCacheMap;
  }

  try {
    const { getDb } = await import("./db");
    const { featurePricing } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const db = await getDb();
    if (!db) return new Map();

    const rows = await db
      .select({
        featureKey: featurePricing.featureKey,
        credits: featurePricing.credits,
        isActive: featurePricing.isActive,
      })
      .from(featurePricing)
      .where(eq(featurePricing.isActive, 1));

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.featureKey, row.credits);
    }

    pricingCacheMap = map;
    pricingCacheExpiry = Date.now() + PRICING_CACHE_TTL;
    console.log(
      `[KieAiSync] Pricing cache loaded: ${map.size} active entries`
    );
    return map;
  } catch (error) {
    console.error("[KieAiSync] Failed to load pricing cache:", error);
    return new Map();
  }
}

/**
 * Get credit price for a KIE.AI model description from DB cache.
 * Falls back to hardcoded value if not found in DB.
 */
export async function getKieAiPrice(
  modelDescription: string,
  fallback: number
): Promise<number> {
  const cache = await loadPricingCache();
  const key = modelDescription
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);

  return cache.get(key) ?? fallback;
}

/**
 * Get all pricing from DB as a map (for bulk lookups)
 */
export async function getAllKieAiPrices(): Promise<Map<string, number>> {
  return loadPricingCache();
}

// ─── KIE.AI Model Description → Internal Pricing Key Mapping ─────────────────
// Bu mapping, KIE.AI'den gelen model description'ları bizim internal key'lere eşler.
// Admin panelden sync yapıldığında, bu mapping üzerinden VIDEO_MODEL_PRICING ve
// IMAGE_MODEL_PRICING otomatik güncellenir.

const KIE_TO_VIDEO_KEY_MAP: Record<string, string> = {
  // Veo 3.1
  "google veo 3.1, text-to-video, fast": "veo3.1-fast",
  "google veo 3.1, image-to-video, fast": "veo3.1-fast",
  "google veo 3.1, text-to-video, quality": "veo3.1-quality",
  "google veo 3.1, image-to-video, quality": "veo3.1-quality",
  "google veo 3.1, get 4k video": "veo3.1-4k-upgrade",

  // Grok Imagine Video
  "grok-imagine, text-to-video, 6s 720p": "grok-imagine/text-to-video",
  "grok-imagine, image-to-video, 6s 720p": "grok-imagine/image-to-video",
  "grok-imagine, text-to-video, 6.0s 720p": "grok-imagine/text-to-video",
  "grok-imagine, image-to-video, 6.0s 720p": "grok-imagine/image-to-video",
  "grok-imagine, text-to-video, 10.0s 720p": "grok-imagine/text-to-video-10s",
  "grok-imagine, image-to-video, 10.0s 720p": "grok-imagine/image-to-video-10s",

  // Sora 2
  "open ai sora 2, text-to-video, stable-10.0s": "sora-2-text-to-video-10s",
  "open ai sora 2, image-to-video, stable-10.0s": "sora-2-image-to-video-10s",
  "open ai sora 2, text-to-video, stable-15.0s": "sora-2-text-to-video-15s",
  "open ai sora 2, image-to-video, stable-15.0s": "sora-2-image-to-video-15s",

  // Sora 2 Pro
  "open ai sora 2 pro, text-to-video, pro standard-10.0s":
    "sora-2-pro-standard-10s",
  "open ai sora 2 pro, text-to-video, pro standard-15.0s":
    "sora-2-pro-standard-15s",
  "open ai sora 2 pro, text-to-video, pro high-10.0s": "sora-2-pro-high-10s",
  "open ai sora 2 pro, text-to-video, pro high-15.0s": "sora-2-pro-high-15s",
  "open ai sora 2 pro, image-to-video, pro standard-10.0s":
    "sora-2-pro-standard-10s",
  "open ai sora 2 pro, image-to-video, pro standard-15.0s":
    "sora-2-pro-standard-15s",
  "open ai sora 2 pro, image-to-video, pro high-10.0s": "sora-2-pro-high-10s",
  "open ai sora 2 pro, image-to-video, pro high-15.0s": "sora-2-pro-high-15s",
  "open ai sora 2 pro, storyboard, pro-10.0s": "sora-2-pro-storyboard-10s",
  "open ai sora 2 pro, storyboard, pro-15-25s": "sora-2-pro-storyboard-15s",
  "open ai sora 2-watermark-remover": "sora-watermark-remover",

  // Kling 2.1
  "kling 2.1, video-generation, standard-5.0s": "kling-2.1/text-to-video-5s",
  "kling 2.1, video-generation, standard-10.0s": "kling-2.1/text-to-video-10s",

  // Kling 2.5
  "kling 2.5 turbo , text-to-video, turbo pro-5.0s":
    "kling-2.5/text-to-video-5s",
  "kling 2.5 turbo , text-to-video, turbo pro-10.0s":
    "kling-2.5/text-to-video-10s",
  "kling 2.5 turbo , image-to-video, turbo pro-5.0s":
    "kling-2.5/image-to-video-5s",
  "kling 2.5 turbo , image-to-video, turbo pro-10.0s":
    "kling-2.5/image-to-video-10s",

  // Kling 2.6
  "kling 2.6, text-to-video, without audio-5.0s": "kling-2.6-5s",
  "kling 2.6, text-to-video, with audio-5.0s": "kling-2.6-5s-audio",
  "kling 2.6, text-to-video, without audio-10.0s": "kling-2.6-10s",
  "kling 2.6, text-to-video, with audio-10.0s": "kling-2.6-10s-audio",
  "kling 2.6, image-to-video, without audio-5.0s": "kling-2.6-5s",
  "kling 2.6, image-to-video, with audio-5.0s": "kling-2.6-5s-audio",
  "kling 2.6, image-to-video, without audio-10.0s": "kling-2.6-10s",
  "kling 2.6, image-to-video, with audio-10.0s": "kling-2.6-10s-audio",
  "kling 2.6 motion control, video-to-video, 720p":
    "kling-2.6-motion-720p-per-sec",
  "kling 2.6 motion control, video to video, 1080p":
    "kling-2.6-motion-1080p-per-sec",

  // Kling 3.0 (per second → we store per-second rate, calculate in code)
  "kling 3.0, video, without audio-720p": "kling-3.0-per-sec-720p",
  "kling 3.0, video, with audio-720p": "kling-3.0-per-sec-720p-audio",
  "kling 3.0, video, without audio-1080p": "kling-3.0-per-sec-1080p",
  "kling 3.0, video, with audio-1080p": "kling-3.0-per-sec-1080p-audio",

  // Hailuo 2.3
  "hailuo 2.3, image-to-video, standard-6.0s-768p":
    "hailuo-2.3/image-to-video-6s",
  "hailuo 2.3, image-to-video, standard-10.0s-768p":
    "hailuo-2.3/image-to-video-10s",
  "hailuo 2.3, image-to-video, standard-6.0s-1080p":
    "hailuo-2.3/image-to-video-6s-1080p",
  "hailuo 2.3, image-to-video, pro-6.0s-768p":
    "hailuo-2.3/image-to-video-pro-6s",
  "hailuo 2.3, image-to-video, pro-6.0s-1080p":
    "hailuo-2.3/image-to-video-pro-6s-1080p",
  "hailuo 2.3, image-to-video, pro-10.0s-768p":
    "hailuo-2.3/image-to-video-pro-10s",

  // Hailuo 02
  "hailuo 02, text-to-video, standard-6.0s-768p":
    "hailuo-02/text-to-video-6s",
  "hailuo 02, text-to-video, standard-10.0s-768p":
    "hailuo-02/text-to-video-10s",
  "hailuo 02, image-to-video, standard-6.0s-512p":
    "hailuo-02/image-to-video-6s-512p",
  "hailuo 02, image-to-video, standard-10.0s-512p":
    "hailuo-02/image-to-video-10s-512p",
  "hailuo 02, image-to-video, standard-10.0s-768p":
    "hailuo-02/image-to-video-10s",
  "hailuo 02, text-to-video, pro-6.0s-1080p":
    "hailuo-02/text-to-video-pro-6s-1080p",
  "hailuo 02, image-to-video, pro-6.0s-1080p":
    "hailuo-02/image-to-video-pro-6s-1080p",

  // Wan 2.6
  "wan 2.6, text to video, 5.0s-720p": "wan-2.6-720p-5s",
  "wan 2.6, text to video, 10.0s-720p": "wan-2.6-720p-10s",
  "wan 2.6, text to video, 15.0s-720p": "wan-2.6-720p-15s",
  "wan 2.6, text to video, 5.0s-1080p": "wan-2.6-1080p-5s",
  "wan 2.6, text to video, 10.0s-1080p": "wan-2.6-1080p-10s",
  "wan 2.6, text to video, 15.0s-1080p": "wan-2.6-1080p-15s",
  "wan 2.6, image-to-video, 5.0s-720p": "wan-2.6-720p-5s",
  "wan 2.6, image-to-video, 10.0s-720p": "wan-2.6-720p-10s",
  "wan 2.6, image-to-video, 15.0s-720p": "wan-2.6-720p-15s",
  "wan 2.6, image-to-video, 5.0s-1080p": "wan-2.6-1080p-5s",
  "wan 2.6, image-to-video, 10.0s-1080p": "wan-2.6-1080p-10s",
  "wan 2.6, image-to-video, 15.0s-1080p": "wan-2.6-1080p-15s",

  // Wan 2.6 video-to-video (same pricing as image-to-video)
  "wan 2.6, video-to-video, 5.0s-720p": "wan-2.6-720p-5s",
  "wan 2.6, video-to-video, 10.0s-720p": "wan-2.6-720p-10s",
  "wan 2.6, video-to-video, 15.0s-720p": "wan-2.6-720p-15s",
  "wan 2.6, video-to-video, 5.0s-1080p": "wan-2.6-1080p-5s",
  "wan 2.6, video-to-video, 10.0s-1080p": "wan-2.6-1080p-10s",
  "wan 2.6, video-to-video, 15.0s-1080p": "wan-2.6-1080p-15s",

  // Wan 2.2
  "wan 2.2, image-to-video, 5.0s-480p": "wan-2.2-5s",
  "wan 2.2,  text-to-video, 5.0s-480p": "wan-2.2-5s",
  "wan 2.2, image-to-video, 5.0s-720p": "wan-2.2-10s",
  "wan 2.2,  text-to-video, 5.0s-720p": "wan-2.2-10s",

  // Wan 2.5
  "wan 2.5, text-to-video, default-5.0s-720p": "wan2.5-t2v-preview-5s",
  "wan 2.5, text-to-video, default-10.0s-720p": "wan2.5-t2v-preview-10s",
  "wan 2.5, image-to-video, default-5.0s-720p": "wan2.5-i2v-preview-5s",
  "wan 2.5, image-to-video, default-10.0s-720p": "wan2.5-i2v-preview-10s",
  "wan 2.5, text-to-video, default-5.0s-1080p": "wan2.5-t2v-preview-5s-1080p",
  "wan 2.5, text-to-video, default-10.0s-1080p": "wan2.5-t2v-preview-10s-1080p",
  "wan 2.5, image-to-video, default-5.0s-1080p": "wan2.5-i2v-preview-5s-1080p",
  "wan 2.5, image-to-video, default-10.0s-1080p": "wan2.5-i2v-preview-10s-1080p",

  // Runway
  "runway, text-to-video, 5.0s-720p": "runway-gen3-alpha",
  "runway, text-to-video, 10.0s-720p": "runway-gen3-alpha-10s",
  "runway, image-to-video, 5.0s-720p": "runway-gen3-alpha",
  "runway, image-to-video, 10.0s-720p": "runway-gen3-alpha-10s",
  "runway, text-to-video, 5.0s-1080p": "runway-gen3-alpha-1080p",
  "runway, image-to-video, 5.0s-1080p": "runway-gen3-alpha-1080p",
  "runway aleph": "runway-aleph",

  // Kling 2.1 Pro & Master
  "kling 2.1, video-generation, pro-5.0s": "kling-2.1/pro-5s",
  "kling 2.1, video-generation, pro-10.0s": "kling-2.1/pro-10s",
  "kling 2.1, text-to-video, master-5.0s": "kling-2.1/master-5s",
  "kling 2.1, text-to-video, master-10.0s": "kling-2.1/master-10s",
  "kling 2.1, image-to-video, master-5.0s": "kling-2.1/master-5s",
  "kling 2.1, image-to-video, master-10.0s": "kling-2.1/master-10s",

  // Kling 2.6 Motion Control (case variations - 720p already mapped above)

  // Google Veo 3.1 additional variants
  "google veo 3.1, extend, quality": "veo3.1-quality",
  "google veo 3.1, extend, fast": "veo3.1-fast",
  "google veo 3.1, reference-to-video, fast": "veo3.1-fast",
  "google veo 3.1, get 1080p video": "veo3.1-1080p-upgrade",

  // Sora 2 Standard quality variants (different casing from KIE)
  "open ai sora 2, image-to-video, standard-15.0s": "sora-2-image-to-video-15s",
  "open ai sora 2, text-to-video, standard-15.0s": "sora-2-text-to-video-15s",
  "open ai sora 2, image-to-video, standard-10.0s": "sora-2-image-to-video-10s",
  "open ai sora 2, text-to-video, standard-10.0s": "sora-2-text-to-video-10s",
};

const KIE_TO_IMAGE_KEY_MAP: Record<string, string> = {
  // Flux 2 Pro
  "black forest labs flux-2 pro, text-to-image, 1.0s-1k":
    "flux-2/pro-text-to-image",
  "black forest labs flux-2 pro, image to image, 1.0s-1k":
    "flux-2/pro-image-to-image",
  "black forest labs flux-2 pro, text-to-image, 1.0s-2k":
    "flux-2/pro-text-to-image-2k",
  "black forest labs flux-2 pro, image to image, 1.0s-2k":
    "flux-2/pro-image-to-image-2k",

  // Flux 2 Flex
  "black forest labs flux 2 flex, text-to-image, 1.0s-1k":
    "flux-2/flex-text-to-image",
  "black forest labs flux 2 flex, image to image, 1.0s-1k":
    "flux-2/flex-image-to-image",
  "black forest labs flux 2 flex, text-to-image, 1.0s-2k":
    "flux-2/flex-text-to-image-2k",
  "black forest labs flux 2 flex, image to image, 1.0s-2k":
    "flux-2/flex-image-to-image-2k",

  // Flux Kontext
  "black forest labs flux1-kontext, text-to-image, pro": "flux-kontext-pro",
  "black forest labs flux1-kontext, text-to-image, max": "flux-kontext-max",

  // Imagen 4
  "google imagen4, text-to-image, fast": "google/imagen4-fast",
  "google imagen4, text-to-image, ultra": "google/imagen4-ultra",
  "google imagen4, text-to-image, default": "google/imagen4",

  // Nano Banana
  "google nano banana, text-to-image": "google/nano-banana",
  "google nano banana edit, image-to-image": "google/nano-banana-edit",
  "google nano banana pro, 1/2k": "nano-banana-pro",
  "google nano banana pro, 4k": "nano-banana-pro-4k",

  // GPT Image
  "openai 4o image, text-to-image": "4o-image",
  "gpt image 1.5, text-to-image, medium": "gpt-image/1.5-text-to-image",
  "gpt image 1.5, text-to-image, high": "gpt-image/1.5-text-to-image-high",
  "gpt image 1.5, image-to-image, medium": "gpt-image/1.5-image-to-image",
  "gpt image 1.5, image-to-image, high": "gpt-image/1.5-image-to-image-high",

  // Grok Imagine Image
  "grok-imagine, text-to-image": "grok-imagine/text-to-image",
  "grok-imagine, image-to-image": "grok-imagine/image-to-image",

  // Ideogram V3
  "ideogram v3,  text-to-image, turbo": "ideogram/v3-turbo",
  "ideogram v3,  text-to-image, balanced": "ideogram/v3-balanced",
  "ideogram v3,  text-to-image, quality": "ideogram/v3-quality",
  "ideogram v3-remix, image-to-image, turbo": "ideogram/v3-remix-turbo",
  "ideogram v3-remix, image-to-image, balanced": "ideogram/v3-remix-balanced",
  "ideogram v3-remix, image-to-image, quality": "ideogram/v3-remix-quality",
  "ideogram v3-edit, image-to-image, turbo": "ideogram/v3-edit-turbo",
  "ideogram v3-edit, image-to-image, balanced": "ideogram/v3-edit-balanced",
  "ideogram v3-edit, image-to-image, quality": "ideogram/v3-edit-quality",
  "ideogram v3 reframe, image to image, turbo": "ideogram/v3-reframe-turbo",
  "ideogram v3 reframe, image to image, balanced":
    "ideogram/v3-reframe-balanced",
  "ideogram v3 reframe, image to image, quality": "ideogram/v3-reframe-quality",

  // Ideogram Character
  "ideogram character, image-to-image, turbo": "ideogram/character-turbo",
  "ideogram character, image-to-image, balanced": "ideogram/character-balanced",
  "ideogram character, image-to-image, quality": "ideogram/character-quality",
  "ideogram character-edit, image-to-image, turbo":
    "ideogram/character-edit-turbo",
  "ideogram character-edit, image-to-image, balanced":
    "ideogram/character-edit-balanced",
  "ideogram character-edit, image-to-image, quality":
    "ideogram/character-edit-quality",
  "ideogram character-remix, image-to-image, turbo":
    "ideogram/character-remix-turbo",
  "ideogram character-remix, image-to-image, balanced":
    "ideogram/character-remix-balanced",
  "ideogram character-remix, image-to-image, quality":
    "ideogram/character-remix-quality",

  // Qwen
  "qwen image , text-to-image": "qwen/text-to-image",
  "qwen image, image-to-image": "qwen/image-to-image",
  "qwen image-edit, image-to-image": "qwen/image-edit",

  // Z-Image
  "qwen z-image, text-to-image, 1.0s": "z-image",

  // Recraft
  "recraft remove background , image to image": "recraft/remove-background",
  "recraft crisp upscale, image to image": "recraft/crisp-upscale",

  // Topaz Upscale
  "topaz image upscaler, image-upscale, 2k": "topaz-upscale-2k",
  "topaz image upscaler, image-upscale, 4k": "topaz-upscale-4k",
  "topaz image upscaler, image-upscale, 8k": "topaz-upscale-8k",

  // Midjourney
  "midjourney,  text-to-image, fast": "midjourney/text-to-image-fast",
  "midjourney,  text-to-image, turbo": "midjourney/text-to-image-turbo",
  "midjourney,  text-to-image, relaxed": "midjourney/text-to-image-relaxed",
  "midjourney, image-to-image, fast": "midjourney/image-to-image-fast",
  "midjourney, image-to-image, turbo": "midjourney/image-to-image-turbo",
  "midjourney, image-to-image, relaxed": "midjourney/image-to-image-relaxed",
};

/**
 * Sync sonrası VIDEO_MODEL_PRICING ve IMAGE_MODEL_PRICING'i DB'den günceller.
 * Bu fonksiyon kieAiApi.ts'deki hardcoded map'leri override eder.
 */
export async function refreshPricingMapsFromDb(): Promise<{
  videoUpdated: number;
  imageUpdated: number;
}> {
  const { getDb } = await import("./db");
  const { featurePricing } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const {
    VIDEO_MODEL_PRICING,
    IMAGE_MODEL_PRICING,
    UPSCALE_PRICING,
  } = await import("./kieAiApi");

  const db = await getDb();
  if (!db) return { videoUpdated: 0, imageUpdated: 0 };

  const rows = await db
    .select({
      featureKey: featurePricing.featureKey,
      credits: featurePricing.credits,
      isActive: featurePricing.isActive,
      kieModelDescription: featurePricing.kieModelDescription,
    })
    .from(featurePricing)
    .where(eq(featurePricing.isActive, 1));

  let videoUpdated = 0;
  let imageUpdated = 0;

  for (const row of rows) {
    if (!row.kieModelDescription) continue;
    const descLower = row.kieModelDescription.toLowerCase();

    // Check video mapping
    const videoKey = KIE_TO_VIDEO_KEY_MAP[descLower];
    if (videoKey) {
      VIDEO_MODEL_PRICING[videoKey] = row.credits;
      videoUpdated++;
      continue;
    }

    // Check image mapping
    const imageKey = KIE_TO_IMAGE_KEY_MAP[descLower];
    if (imageKey) {
      // Topaz upscale special handling
      if (imageKey === "topaz-upscale-2k") {
        UPSCALE_PRICING["1"] = row.credits;
        UPSCALE_PRICING["2"] = row.credits;
        imageUpdated++;
        continue;
      } else if (imageKey === "topaz-upscale-4k") {
        UPSCALE_PRICING["4"] = row.credits;
        imageUpdated++;
        continue;
      } else if (imageKey === "topaz-upscale-8k") {
        UPSCALE_PRICING["8"] = row.credits;
        imageUpdated++;
        continue;
      }

      // Regular image model
      IMAGE_MODEL_PRICING[imageKey] = row.credits;
      imageUpdated++;
      continue;
    }
  }

  console.log(
    `[KieAiSync] Pricing maps refreshed from DB: ${videoUpdated} video, ${imageUpdated} image`
  );

  // Recalculate Kling 3.0 pre-calculated duration keys from per-second rates
  const perSec720 = VIDEO_MODEL_PRICING["kling-3.0-per-sec-720p"] || 20;
  const perSec720Audio =
    VIDEO_MODEL_PRICING["kling-3.0-per-sec-720p-audio"] || 30;
  const perSec1080 = VIDEO_MODEL_PRICING["kling-3.0-per-sec-1080p"] || 27;
  const perSec1080Audio =
    VIDEO_MODEL_PRICING["kling-3.0-per-sec-1080p-audio"] || 40;

  VIDEO_MODEL_PRICING["kling-3.0-std-5s"] = 5 * perSec720;
  VIDEO_MODEL_PRICING["kling-3.0-std-5s-audio"] = 5 * perSec720Audio;
  VIDEO_MODEL_PRICING["kling-3.0-std-10s"] = 10 * perSec720;
  VIDEO_MODEL_PRICING["kling-3.0-std-10s-audio"] = 10 * perSec720Audio;
  VIDEO_MODEL_PRICING["kling-3.0-pro-5s"] = 5 * perSec1080;
  VIDEO_MODEL_PRICING["kling-3.0-pro-5s-audio"] = 5 * perSec1080Audio;
  VIDEO_MODEL_PRICING["kling-3.0-pro-10s"] = 10 * perSec1080;
  VIDEO_MODEL_PRICING["kling-3.0-pro-10s-audio"] = 10 * perSec1080Audio;

  console.log(
    `[KieAiSync] Kling 3.0 recalculated: std-5s=${VIDEO_MODEL_PRICING["kling-3.0-std-5s"]}, pro-10s=${VIDEO_MODEL_PRICING["kling-3.0-pro-10s"]}`
  );

  return { videoUpdated, imageUpdated };
}
