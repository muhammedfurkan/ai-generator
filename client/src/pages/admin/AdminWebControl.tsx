import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Globe,
  GripVertical,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  X,
} from "lucide-react";
import {
  DEFAULT_WEB_UI_CONFIG,
  HOME_SECTION_IDS,
  SEO_PAGE_KEYS,
  parseWebUiConfig,
  type HomeSectionId,
  type SeoPageKey,
  type WebUiConfig,
} from "@/lib/webUiConfig";

const WEB_UI_SETTING_KEY = "web_ui_config";

const WEB_UI_SETTING_META = {
  key: WEB_UI_SETTING_KEY,
  category: "general" as const,
  label: "Web UI Konfigürasyonu",
  description:
    "Header, home, mobil ve footer içerik/sıralama ayarlarını tek JSON ile yönetir.",
  inputType: "json" as const,
  isPublic: true,
};

const ORDER_OPTIONS = {
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
} as const;

const ITEM_LABELS: Record<string, string> = {
  upscale: "Upscale",
  "video-generate": "Video Generate",
  "motion-control": "Motion Control",
  "ai-influencer": "AI Influencer",
  "audio-generate": "Audio Generate",
  "music-generate": "Music Generate",
  gallery: "Galeri",
  blog: "Blog",
  home: "Ana Sayfa",
  "community-characters": "Community Characters",
  create: "Create",
  profile: "Profil",
  "image-gen": "Image Generator",
  "video-gen": "Video Generator",
  "multi-angle": "Multi Angle",
  "product-promo": "Product Promo",
  "logo-generator": "Logo Generator",
  "prompt-compiler": "Prompt Compiler",
  generate: "Generate",
  video: "Video",
  influencer: "Influencer",
  "skin-enhancement": "Skin Enhancement",
  "ugc-ad": "UGC Ad",
  hug: "Hug",
  kiss: "Kiss",
  dance: "Dance",
  talk: "Talk",
  age: "Age",
  style: "Style",
  hair: "Hair",
  smile: "Smile",
};

const SECTION_LABELS: Record<HomeSectionId, string> = {
  "ai-tools": "AI Araçları",
  models: "Model Kartları",
  images: "Görsel Galeri",
  videos: "Video Galeri",
  community: "Topluluk",
  cta: "Alt CTA",
};

const SEO_PAGE_LABELS: Record<SeoPageKey, string> = {
  home: "Ana Sayfa",
  blog: "Blog",
  gallery: "Galeri",
};

const sanitizeOrderList = (value: string[], fallback: string[]) => {
  const ids = Array.from(new Set(value.map(id => id.trim()).filter(Boolean)));

  return ids.length > 0 ? ids : fallback;
};

const statsToLines = (config: WebUiConfig) =>
  config.hero.stats.map(item => `${item.label} | ${item.value}`).join("\n");

const statsFromLines = (value: string) =>
  value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, ...rest] = line.split("|");
      return {
        label: label?.trim() || "",
        value: rest.join("|").trim(),
      };
    })
    .filter(item => item.label && item.value);

const linksToLines = (config: WebUiConfig) =>
  config.footer.quickLinks
    .map(item => `${item.label} | ${item.path}`)
    .join("\n");

const linksFromLines = (value: string) =>
  value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, ...rest] = line.split("|");
      return {
        label: label?.trim() || "",
        path: rest.join("|").trim(),
      };
    })
    .filter(item => item.label && item.path);

const sanitizeSectionOrder = (value: string[]) => {
  const ids = Array.from(
    new Set(
      value.filter((id): id is HomeSectionId =>
        HOME_SECTION_IDS.includes(id as HomeSectionId)
      )
    )
  );

  return ids.length > 0 ? ids : DEFAULT_WEB_UI_CONFIG.home.sectionOrder;
};

export default function AdminWebControl() {
  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({});
  const updateMutation = trpc.adminPanel.updateSiteSetting.useMutation();
  const createMutation = trpc.adminPanel.createSiteSetting.useMutation();
  const utils = trpc.useUtils();

  const settingRow = useMemo(
    () => settingsQuery.data?.find(row => row.key === WEB_UI_SETTING_KEY),
    [settingsQuery.data]
  );

  const parsedConfig = useMemo(
    () => parseWebUiConfig(settingRow?.value),
    [settingRow?.value]
  );

  const [draftConfig, setDraftConfig] = useState<WebUiConfig>(parsedConfig);
  const [statsLines, setStatsLines] = useState(statsToLines(parsedConfig));
  const [quickLinksLines, setQuickLinksLines] = useState(
    linksToLines(parsedConfig)
  );

  const [headerMainNavOrder, setHeaderMainNavOrder] = useState<string[]>(
    parsedConfig.navigation.headerMainNavOrder
  );
  const [mobileBottomNavOrder, setMobileBottomNavOrder] = useState<string[]>(
    parsedConfig.navigation.mobileBottomNavOrder
  );
  const [mobileMenuNavOrder, setMobileMenuNavOrder] = useState<string[]>(
    parsedConfig.navigation.mobileMenuNavOrder
  );

  const [desktopToolOrder, setDesktopToolOrder] = useState<string[]>(
    parsedConfig.home.desktopToolOrder
  );
  const [mobileToolOrder, setMobileToolOrder] = useState<string[]>(
    parsedConfig.home.mobileToolOrder
  );
  const [mobileBannerOrder, setMobileBannerOrder] = useState<string[]>(
    parsedConfig.home.mobileBannerOrder
  );
  const [mobileViralAppOrder, setMobileViralAppOrder] = useState<string[]>(
    parsedConfig.home.mobileViralAppOrder
  );
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    parsedConfig.home.sectionOrder
  );

  useEffect(() => {
    setDraftConfig(parsedConfig);
    setStatsLines(statsToLines(parsedConfig));
    setQuickLinksLines(linksToLines(parsedConfig));

    setHeaderMainNavOrder([...parsedConfig.navigation.headerMainNavOrder]);
    setMobileBottomNavOrder([...parsedConfig.navigation.mobileBottomNavOrder]);
    setMobileMenuNavOrder([...parsedConfig.navigation.mobileMenuNavOrder]);

    setDesktopToolOrder([...parsedConfig.home.desktopToolOrder]);
    setMobileToolOrder([...parsedConfig.home.mobileToolOrder]);
    setMobileBannerOrder([...parsedConfig.home.mobileBannerOrder]);
    setMobileViralAppOrder([...parsedConfig.home.mobileViralAppOrder]);
    setSectionOrder([...parsedConfig.home.sectionOrder]);
  }, [parsedConfig]);

  const buildFinalConfig = (): WebUiConfig => {
    const parsedStats = statsFromLines(statsLines);
    const parsedLinks = linksFromLines(quickLinksLines);
    const finalHeaderMainNavOrder = sanitizeOrderList(
      headerMainNavOrder,
      DEFAULT_WEB_UI_CONFIG.navigation.headerMainNavOrder
    );
    const finalMobileBottomNavOrder = sanitizeOrderList(
      mobileBottomNavOrder,
      DEFAULT_WEB_UI_CONFIG.navigation.mobileBottomNavOrder
    );
    const finalMobileMenuNavOrder = sanitizeOrderList(
      mobileMenuNavOrder,
      DEFAULT_WEB_UI_CONFIG.navigation.mobileMenuNavOrder
    );
    const finalDesktopToolOrder = sanitizeOrderList(
      desktopToolOrder,
      DEFAULT_WEB_UI_CONFIG.home.desktopToolOrder
    );
    const finalMobileToolOrder = sanitizeOrderList(
      mobileToolOrder,
      DEFAULT_WEB_UI_CONFIG.home.mobileToolOrder
    );
    const finalMobileBannerOrder = sanitizeOrderList(
      mobileBannerOrder,
      DEFAULT_WEB_UI_CONFIG.home.mobileBannerOrder
    );
    const finalMobileViralAppOrder = sanitizeOrderList(
      mobileViralAppOrder,
      DEFAULT_WEB_UI_CONFIG.home.mobileViralAppOrder
    );

    return {
      ...draftConfig,
      hero: {
        ...draftConfig.hero,
        stats:
          parsedStats.length > 0
            ? parsedStats
            : DEFAULT_WEB_UI_CONFIG.hero.stats,
      },
      navigation: {
        headerMainNavOrder: finalHeaderMainNavOrder,
        mobileBottomNavOrder: finalMobileBottomNavOrder,
        mobileMenuNavOrder: finalMobileMenuNavOrder,
      },
      home: {
        ...draftConfig.home,
        desktopToolOrder: finalDesktopToolOrder,
        mobileToolOrder: finalMobileToolOrder,
        mobileBannerOrder: finalMobileBannerOrder,
        mobileViralAppOrder: finalMobileViralAppOrder,
        sectionOrder: sanitizeSectionOrder(sectionOrder),
      },
      footer: {
        ...draftConfig.footer,
        quickLinks:
          parsedLinks.length > 0
            ? parsedLinks
            : DEFAULT_WEB_UI_CONFIG.footer.quickLinks,
      },
    };
  };

  const isSaving = updateMutation.isPending || createMutation.isPending;

  const isDirty = useMemo(() => {
    const finalConfig = buildFinalConfig();
    return JSON.stringify(finalConfig) !== JSON.stringify(parsedConfig);
  }, [
    draftConfig,
    statsLines,
    quickLinksLines,
    headerMainNavOrder,
    mobileBottomNavOrder,
    mobileMenuNavOrder,
    desktopToolOrder,
    mobileToolOrder,
    mobileBannerOrder,
    mobileViralAppOrder,
    sectionOrder,
    parsedConfig,
  ]);

  const saveConfig = async () => {
    const finalConfig = buildFinalConfig();
    const value = JSON.stringify(finalConfig, null, 2);

    try {
      if (settingRow) {
        await updateMutation.mutateAsync({ key: WEB_UI_SETTING_KEY, value });
      } else {
        await createMutation.mutateAsync({
          ...WEB_UI_SETTING_META,
          value,
        });
      }

      await Promise.all([
        utils.adminPanel.getSiteSettings.invalidate(),
        utils.settings.getPublicSettings.invalidate(),
      ]);

      toast.success("Web kontrol ayarları kaydedildi.");
    } catch (error: any) {
      toast.error(error?.message || "Web kontrol ayarları kaydedilemedi.");
    }
  };

  const resetToDefaults = () => {
    setDraftConfig(DEFAULT_WEB_UI_CONFIG);
    setStatsLines(statsToLines(DEFAULT_WEB_UI_CONFIG));
    setQuickLinksLines(linksToLines(DEFAULT_WEB_UI_CONFIG));

    setHeaderMainNavOrder([
      ...DEFAULT_WEB_UI_CONFIG.navigation.headerMainNavOrder,
    ]);
    setMobileBottomNavOrder([
      ...DEFAULT_WEB_UI_CONFIG.navigation.mobileBottomNavOrder,
    ]);
    setMobileMenuNavOrder([
      ...DEFAULT_WEB_UI_CONFIG.navigation.mobileMenuNavOrder,
    ]);

    setDesktopToolOrder([...DEFAULT_WEB_UI_CONFIG.home.desktopToolOrder]);
    setMobileToolOrder([...DEFAULT_WEB_UI_CONFIG.home.mobileToolOrder]);
    setMobileBannerOrder([...DEFAULT_WEB_UI_CONFIG.home.mobileBannerOrder]);
    setMobileViralAppOrder([...DEFAULT_WEB_UI_CONFIG.home.mobileViralAppOrder]);
    setSectionOrder([...DEFAULT_WEB_UI_CONFIG.home.sectionOrder]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[#00F5FF]" />
            Web Kontrol Merkezi
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Header, home, mobil akışlar, SEO ve footer alanlarını tek yerden
            yönetin.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/20"
            onClick={resetToDefaults}
            disabled={isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Varsayılanlara Dön
          </Button>
          <Button
            type="button"
            onClick={saveConfig}
            disabled={!isDirty || isSaving}
            className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Kaydet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
          <h3 className="font-semibold">Hero Alanı</h3>

          <Input
            value={draftConfig.hero.badge}
            onChange={e =>
              setDraftConfig(prev => ({
                ...prev,
                hero: { ...prev.hero, badge: e.target.value },
              }))
            }
            placeholder="Hero badge metni"
            className="bg-zinc-800 border-white/10"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={draftConfig.hero.titlePrefix}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, titlePrefix: e.target.value },
                }))
              }
              placeholder="Başlık ön metni"
              className="bg-zinc-800 border-white/10"
            />
            <Input
              value={draftConfig.hero.titleSuffix}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, titleSuffix: e.target.value },
                }))
              }
              placeholder="Başlık vurgu metni"
              className="bg-zinc-800 border-white/10"
            />
          </div>

          <Textarea
            value={draftConfig.hero.subtitle}
            onChange={e =>
              setDraftConfig(prev => ({
                ...prev,
                hero: { ...prev.hero, subtitle: e.target.value },
              }))
            }
            placeholder="Hero alt metin"
            className="bg-zinc-800 border-white/10 min-h-[88px]"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={draftConfig.hero.primaryCtaLabel}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, primaryCtaLabel: e.target.value },
                }))
              }
              placeholder="Birinci CTA etiket"
              className="bg-zinc-800 border-white/10"
            />
            <Input
              value={draftConfig.hero.primaryCtaPath}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, primaryCtaPath: e.target.value },
                }))
              }
              placeholder="/generate"
              className="bg-zinc-800 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={draftConfig.hero.secondaryCtaLabel}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, secondaryCtaLabel: e.target.value },
                }))
              }
              placeholder="İkinci CTA etiket"
              className="bg-zinc-800 border-white/10"
            />
            <Input
              value={draftConfig.hero.secondaryCtaPath}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, secondaryCtaPath: e.target.value },
                }))
              }
              placeholder="/video-generate"
              className="bg-zinc-800 border-white/10"
            />
          </div>

          <div>
            <p className="text-xs text-zinc-400 mb-2">
              Hero metrikleri (Her satır: Başlık | Değer)
            </p>
            <Textarea
              value={statsLines}
              onChange={e => setStatsLines(e.target.value)}
              className="bg-zinc-800 border-white/10 min-h-[110px] font-mono text-xs"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
          <h3 className="font-semibold">Footer Alanı</h3>

          <Textarea
            value={draftConfig.footer.description}
            onChange={e =>
              setDraftConfig(prev => ({
                ...prev,
                footer: { ...prev.footer, description: e.target.value },
              }))
            }
            placeholder="Footer açıklama metni"
            className="bg-zinc-800 border-white/10 min-h-[88px]"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={draftConfig.footer.telegramUrl}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  footer: { ...prev.footer, telegramUrl: e.target.value },
                }))
              }
              placeholder="https://t.me/..."
              className="bg-zinc-800 border-white/10"
            />
            <Input
              value={draftConfig.footer.supportEmail}
              onChange={e =>
                setDraftConfig(prev => ({
                  ...prev,
                  footer: { ...prev.footer, supportEmail: e.target.value },
                }))
              }
              placeholder="support@domain.com"
              className="bg-zinc-800 border-white/10"
            />
          </div>

          <div>
            <p className="text-xs text-zinc-400 mb-2">
              Footer hızlı linkleri (Her satır: Etiket | Yol)
            </p>
            <Textarea
              value={quickLinksLines}
              onChange={e => setQuickLinksLines(e.target.value)}
              className="bg-zinc-800 border-white/10 min-h-[140px] font-mono text-xs"
            />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
        <h3 className="font-semibold">Navigasyon Sıraları</h3>
        <p className="text-xs text-zinc-500">
          Sürükle-bırak veya yukarı/aşağı ile sırala. İstersen listeden hızlıca
          eleman ekleyebilirsin.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <OrderManagerCard
            title="Header menü sırası"
            value={headerMainNavOrder}
            onChange={setHeaderMainNavOrder}
            availableItems={ORDER_OPTIONS.headerMainNavOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.navigation.headerMainNavOrder}
          />

          <OrderManagerCard
            title="Mobil alt menü sırası"
            value={mobileBottomNavOrder}
            onChange={setMobileBottomNavOrder}
            availableItems={ORDER_OPTIONS.mobileBottomNavOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.navigation.mobileBottomNavOrder}
          />

          <OrderManagerCard
            title="Mobil açılır menü sırası"
            value={mobileMenuNavOrder}
            onChange={setMobileMenuNavOrder}
            availableItems={ORDER_OPTIONS.mobileMenuNavOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.navigation.mobileMenuNavOrder}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
        <h3 className="font-semibold">Araç ve Banner Sıraları</h3>
        <p className="text-xs text-zinc-500">
          Kartları sürükleyerek veya yukarı/aşağı butonlarıyla yeniden diz.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OrderManagerCard
            title="Desktop araç kartları"
            value={desktopToolOrder}
            onChange={setDesktopToolOrder}
            availableItems={ORDER_OPTIONS.desktopToolOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.home.desktopToolOrder}
          />

          <OrderManagerCard
            title="Mobil araç kartları"
            value={mobileToolOrder}
            onChange={setMobileToolOrder}
            availableItems={ORDER_OPTIONS.mobileToolOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.home.mobileToolOrder}
          />

          <OrderManagerCard
            title="Mobil banner sırası"
            value={mobileBannerOrder}
            onChange={setMobileBannerOrder}
            availableItems={ORDER_OPTIONS.mobileBannerOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.home.mobileBannerOrder}
          />

          <OrderManagerCard
            title="Mobil viral kart sırası"
            value={mobileViralAppOrder}
            onChange={setMobileViralAppOrder}
            availableItems={ORDER_OPTIONS.mobileViralAppOrder}
            defaultItems={DEFAULT_WEB_UI_CONFIG.home.mobileViralAppOrder}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
        <h3 className="font-semibold">Home Bölüm Yönetimi</h3>

        <OrderManagerCard
          title="Bölüm sırası"
          value={sectionOrder}
          onChange={next =>
            setSectionOrder(
              Array.from(
                new Set(
                  next.filter((id): id is HomeSectionId =>
                    HOME_SECTION_IDS.includes(id as HomeSectionId)
                  )
                )
              )
            )
          }
          availableItems={HOME_SECTION_IDS}
          defaultItems={DEFAULT_WEB_UI_CONFIG.home.sectionOrder}
          itemLabels={SECTION_LABELS as Record<string, string>}
          allowCustomAdd={false}
          allowRemove={false}
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {HOME_SECTION_IDS.map(sectionId => (
            <div
              key={sectionId}
              className="rounded-xl border border-white/10 bg-zinc-950/40 p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {SECTION_LABELS[sectionId]}
                </p>
                <p className="text-xs text-zinc-500">{sectionId}</p>
              </div>
              <Switch
                checked={draftConfig.home.sectionVisibility[sectionId]}
                onCheckedChange={checked =>
                  setDraftConfig(prev => ({
                    ...prev,
                    home: {
                      ...prev.home,
                      sectionVisibility: {
                        ...prev.home.sectionVisibility,
                        [sectionId]: checked,
                      },
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
        <h3 className="font-semibold">Hızlı SEO Yönetimi</h3>
        <p className="text-xs text-zinc-500">
          Bu alanlar ilgili sayfa için hızlı override olarak çalışır. Boş
          bırakırsan mevcut SEO ayarları kullanılır.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {SEO_PAGE_KEYS.map(pageKey => (
            <div
              key={pageKey}
              className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 space-y-3"
            >
              <h4 className="font-medium">{SEO_PAGE_LABELS[pageKey]}</h4>
              <Input
                value={draftConfig.seo.pageOverrides[pageKey].metaTitle}
                onChange={e =>
                  setDraftConfig(prev => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      pageOverrides: {
                        ...prev.seo.pageOverrides,
                        [pageKey]: {
                          ...prev.seo.pageOverrides[pageKey],
                          metaTitle: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder="Meta başlık"
                className="bg-zinc-800 border-white/10"
              />
              <Textarea
                value={draftConfig.seo.pageOverrides[pageKey].metaDescription}
                onChange={e =>
                  setDraftConfig(prev => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      pageOverrides: {
                        ...prev.seo.pageOverrides,
                        [pageKey]: {
                          ...prev.seo.pageOverrides[pageKey],
                          metaDescription: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder="Meta açıklama"
                className="bg-zinc-800 border-white/10 min-h-[96px]"
              />
              <Input
                value={draftConfig.seo.pageOverrides[pageKey].ogImage}
                onChange={e =>
                  setDraftConfig(prev => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      pageOverrides: {
                        ...prev.seo.pageOverrides,
                        [pageKey]: {
                          ...prev.seo.pageOverrides[pageKey],
                          ogImage: e.target.value,
                        },
                      },
                    },
                  }))
                }
                placeholder="OG image URL"
                className="bg-zinc-800 border-white/10"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#00F5FF]" />
          Yayın Notu
        </h3>
        <p className="text-sm text-zinc-400">
          Bu panelden yapılan değişiklikler `web_ui_config` üzerinden hem
          desktop hem mobil web arayüzüne uygulanır.
        </p>
      </section>
    </div>
  );
}

const moveOrderItem = (items: string[], fromIndex: number, toIndex: number) => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

function OrderManagerCard({
  title,
  value,
  onChange,
  availableItems,
  defaultItems,
  itemLabels,
  allowCustomAdd = true,
  allowRemove = true,
}: {
  title: string;
  value: string[];
  onChange: (next: string[]) => void;
  availableItems: readonly string[];
  defaultItems: readonly string[];
  itemLabels?: Record<string, string>;
  allowCustomAdd?: boolean;
  allowRemove?: boolean;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [customItem, setCustomItem] = useState("");

  const availableToAdd = useMemo(
    () => availableItems.filter(item => !value.includes(item)),
    [availableItems, value]
  );

  const moveUp = (index: number) => {
    if (index <= 0) return;
    onChange(moveOrderItem(value, index, index - 1));
  };

  const moveDown = (index: number) => {
    if (index >= value.length - 1) return;
    onChange(moveOrderItem(value, index, index + 1));
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const addItem = (item: string) => {
    const nextItem = item.trim();
    if (!nextItem || value.includes(nextItem)) return;
    onChange([...value, nextItem]);
  };

  const addCustomItem = () => {
    addItem(customItem);
    setCustomItem("");
  };

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-300">{title}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-zinc-300 hover:text-white"
          onClick={() => onChange([...defaultItems])}
        >
          Varsayılan
        </Button>
      </div>

      <div className="space-y-2">
        {value.length === 0 ? (
          <p className="text-xs text-zinc-500 border border-dashed border-white/10 rounded-md px-2 py-3">
            Liste boş. Alttaki seçeneklerden eleman ekleyin.
          </p>
        ) : (
          value.map((item, index) => (
            <div
              key={`${item}-${index}`}
              draggable
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={event => event.preventDefault()}
              onDrop={() => {
                if (draggingIndex === null || draggingIndex === index) return;
                onChange(moveOrderItem(value, draggingIndex, index));
                setDraggingIndex(null);
              }}
              onDragEnd={() => setDraggingIndex(null)}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-zinc-500 cursor-grab" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-100 truncate">
                  {itemLabels?.[item] ?? ITEM_LABELS[item] ?? item}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">{item}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-zinc-400 hover:text-white"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-zinc-400 hover:text-white"
                  onClick={() => moveDown(index)}
                  disabled={index === value.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                {allowRemove && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-zinc-400 hover:text-red-300"
                    onClick={() => removeAt(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        {availableToAdd.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableToAdd.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => addItem(item)}
                className="inline-flex items-center gap-1 rounded-md border border-[#00F5FF]/25 bg-[#00F5FF]/10 px-2 py-1 text-[11px] text-[#9AF7FF] hover:bg-[#00F5FF]/20"
              >
                <Plus className="h-3 w-3" />
                {itemLabels?.[item] ?? ITEM_LABELS[item] ?? item}
              </button>
            ))}
          </div>
        )}

        {allowCustomAdd && (
          <div className="flex items-center gap-2">
            <Input
              value={customItem}
              onChange={event => setCustomItem(event.target.value)}
              placeholder="Özel ID ekle"
              className="h-8 bg-zinc-900 border-white/10 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 border-white/20"
              onClick={addCustomItem}
              disabled={!customItem.trim()}
            >
              Ekle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
