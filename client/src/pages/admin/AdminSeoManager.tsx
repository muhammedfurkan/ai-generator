// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  FileText,
  Globe,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";

type SeoPage = {
  id: number;
  pageSlug: string;
  pageName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string | null;
  ogLocale: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsNoArchive: boolean;
  robotsNoSnippet: boolean;
  structuredData: string | null;
  priority: string | null;
  changeFrequency: string | null;
  isActive: boolean;
};

type GlobalSeoConfig = {
  siteName: string | null;
  siteTagline: string | null;
  defaultLanguage: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  defaultMetaKeywords: string | null;
  defaultOgImage: string | null;
  facebookAppId: string | null;
  defaultTwitterSite: string | null;
  defaultTwitterCreator: string | null;
  googleVerification: string | null;
  bingVerification: string | null;
  yandexVerification: string | null;
  pinterestVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  facebookPixelId: string | null;
  robotsTxtContent: string | null;
  sitemapEnabled: boolean | null;
  organizationName: string | null;
  organizationLogo: string | null;
  organizationUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: string | null;
};

type StatusFilter = "all" | "complete" | "missing" | "inactive";

type PageFormState = {
  pageName: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: "website" | "article" | "product" | "profile";
  ogLocale: string;
  twitterCard: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  twitterCreator: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsNoArchive: boolean;
  robotsNoSnippet: boolean;
  structuredData: string;
  priority: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  isActive: boolean;
};

type GlobalFormState = {
  siteName: string;
  siteTagline: string;
  defaultLanguage: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultMetaKeywords: string;
  defaultOgImage: string;
  facebookAppId: string;
  defaultTwitterSite: string;
  defaultTwitterCreator: string;
  googleVerification: string;
  bingVerification: string;
  yandexVerification: string;
  pinterestVerification: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  robotsTxtContent: string;
  sitemapEnabled: boolean;
  organizationName: string;
  organizationLogo: string;
  organizationUrl: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: string;
};

const emptyPageForm: PageFormState = {
  pageName: "",
  pageSlug: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
  ogLocale: "tr_TR",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  twitterSite: "",
  twitterCreator: "",
  robotsIndex: true,
  robotsFollow: true,
  robotsNoArchive: false,
  robotsNoSnippet: false,
  structuredData: "",
  priority: "0.8",
  changeFrequency: "weekly",
  isActive: true,
};

const toNullable = (value: string) => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const createPageFormFromPage = (page: SeoPage): PageFormState => ({
  pageName: page.pageName ?? "",
  pageSlug: page.pageSlug ?? "",
  metaTitle: page.metaTitle ?? "",
  metaDescription: page.metaDescription ?? "",
  metaKeywords: page.metaKeywords ?? "",
  canonicalUrl: page.canonicalUrl ?? "",
  ogTitle: page.ogTitle ?? "",
  ogDescription: page.ogDescription ?? "",
  ogImage: page.ogImage ?? "",
  ogType: (page.ogType as PageFormState["ogType"]) || "website",
  ogLocale: page.ogLocale ?? "tr_TR",
  twitterCard:
    (page.twitterCard as PageFormState["twitterCard"]) || "summary_large_image",
  twitterTitle: page.twitterTitle ?? "",
  twitterDescription: page.twitterDescription ?? "",
  twitterImage: page.twitterImage ?? "",
  twitterSite: page.twitterSite ?? "",
  twitterCreator: page.twitterCreator ?? "",
  robotsIndex: Boolean(page.robotsIndex),
  robotsFollow: Boolean(page.robotsFollow),
  robotsNoArchive: Boolean(page.robotsNoArchive),
  robotsNoSnippet: Boolean(page.robotsNoSnippet),
  structuredData: page.structuredData ?? "",
  priority: page.priority ?? "0.8",
  changeFrequency:
    (page.changeFrequency as PageFormState["changeFrequency"]) || "weekly",
  isActive: Boolean(page.isActive),
});

const createGlobalFormFromConfig = (
  config: GlobalSeoConfig | null | undefined
): GlobalFormState => ({
  siteName: config?.siteName ?? "Lumiohan",
  siteTagline: config?.siteTagline ?? "",
  defaultLanguage: config?.defaultLanguage ?? "tr",
  defaultMetaTitle: config?.defaultMetaTitle ?? "",
  defaultMetaDescription: config?.defaultMetaDescription ?? "",
  defaultMetaKeywords: config?.defaultMetaKeywords ?? "",
  defaultOgImage: config?.defaultOgImage ?? "",
  facebookAppId: config?.facebookAppId ?? "",
  defaultTwitterSite: config?.defaultTwitterSite ?? "",
  defaultTwitterCreator: config?.defaultTwitterCreator ?? "",
  googleVerification: config?.googleVerification ?? "",
  bingVerification: config?.bingVerification ?? "",
  yandexVerification: config?.yandexVerification ?? "",
  pinterestVerification: config?.pinterestVerification ?? "",
  googleAnalyticsId: config?.googleAnalyticsId ?? "",
  googleTagManagerId: config?.googleTagManagerId ?? "",
  facebookPixelId: config?.facebookPixelId ?? "",
  robotsTxtContent: config?.robotsTxtContent ?? "",
  sitemapEnabled: config?.sitemapEnabled ?? true,
  organizationName: config?.organizationName ?? "",
  organizationLogo: config?.organizationLogo ?? "",
  organizationUrl: config?.organizationUrl ?? "",
  contactEmail: config?.contactEmail ?? "",
  contactPhone: config?.contactPhone ?? "",
  socialLinks: config?.socialLinks ?? "",
});

export default function AdminSeoManager() {
  const utils = trpc.useUtils();

  const pagesQuery = trpc.seo.getAllPages.useQuery();
  const statsQuery = trpc.seo.getStats.useQuery();
  const globalConfigQuery = trpc.seo.getGlobalConfig.useQuery();

  const initializePagesMutation = trpc.seo.initializeDefaultPages.useMutation({
    onSuccess: data => {
      toast.success(data.message || "Varsayılan sayfalar oluşturuldu.");
      void Promise.all([
        utils.seo.getAllPages.invalidate(),
        utils.seo.getStats.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const createPageMutation = trpc.seo.createPage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa eklendi.");
      setIsAddDialogOpen(false);
      void Promise.all([
        utils.seo.getAllPages.invalidate(),
        utils.seo.getStats.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const updatePageMutation = trpc.seo.updatePage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa SEO ayarları kaydedildi.");
      void Promise.all([
        utils.seo.getAllPages.invalidate(),
        utils.seo.getStats.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const deletePageMutation = trpc.seo.deletePage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa silindi.");
      setSelectedPageId(null);
      void Promise.all([
        utils.seo.getAllPages.invalidate(),
        utils.seo.getStats.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const updateGlobalMutation = trpc.seo.updateGlobalConfig.useMutation({
    onSuccess: () => {
      toast.success("Global SEO ayarları kaydedildi.");
      void Promise.all([
        utils.seo.getGlobalConfig.invalidate(),
        utils.seo.getStats.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const pages = (pagesQuery.data ?? []) as SeoPage[];
  const stats = statsQuery.data;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [pageForm, setPageForm] = useState<PageFormState>(emptyPageForm);
  const [basePageForm, setBasePageForm] =
    useState<PageFormState>(emptyPageForm);
  const [globalForm, setGlobalForm] = useState<GlobalFormState>(
    createGlobalFormFromConfig(null)
  );
  const [baseGlobalForm, setBaseGlobalForm] = useState<GlobalFormState>(
    createGlobalFormFromConfig(null)
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    pageSlug: "",
    pageName: "",
    metaTitle: "",
    metaDescription: "",
  });

  const selectedPage = useMemo(
    () => pages.find(page => page.id === selectedPageId) ?? null,
    [pages, selectedPageId]
  );

  useEffect(() => {
    if (!selectedPage && pages.length > 0 && selectedPageId === null) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPage, selectedPageId]);

  useEffect(() => {
    if (!selectedPage) return;
    const form = createPageFormFromPage(selectedPage);
    setPageForm(form);
    setBasePageForm(form);
  }, [selectedPage]);

  useEffect(() => {
    const form = createGlobalFormFromConfig(
      (globalConfigQuery.data as GlobalSeoConfig | null) ?? null
    );
    setGlobalForm(form);
    setBaseGlobalForm(form);
  }, [globalConfigQuery.data]);

  const filteredPages = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase("tr-TR");

    return pages.filter(page => {
      const isComplete = Boolean(page.metaTitle && page.metaDescription);
      const isInactive = !page.isActive;

      if (statusFilter === "complete" && !isComplete) return false;
      if (statusFilter === "missing" && isComplete) return false;
      if (statusFilter === "inactive" && !isInactive) return false;

      if (!normalizedSearch) return true;

      const haystack =
        `${page.pageName} ${page.pageSlug} ${page.metaTitle ?? ""}`.toLocaleLowerCase(
          "tr-TR"
        );

      return haystack.includes(normalizedSearch);
    });
  }, [pages, searchQuery, statusFilter]);

  const pageFormDirty = useMemo(
    () => JSON.stringify(pageForm) !== JSON.stringify(basePageForm),
    [pageForm, basePageForm]
  );

  const globalFormDirty = useMemo(
    () => JSON.stringify(globalForm) !== JSON.stringify(baseGlobalForm),
    [globalForm, baseGlobalForm]
  );

  const savePage = async () => {
    if (!selectedPageId) return;

    await updatePageMutation.mutateAsync({
      id: selectedPageId,
      pageName: pageForm.pageName,
      pageSlug: pageForm.pageSlug,
      metaTitle: toNullable(pageForm.metaTitle),
      metaDescription: toNullable(pageForm.metaDescription),
      metaKeywords: toNullable(pageForm.metaKeywords),
      canonicalUrl: toNullable(pageForm.canonicalUrl),
      ogTitle: toNullable(pageForm.ogTitle),
      ogDescription: toNullable(pageForm.ogDescription),
      ogImage: toNullable(pageForm.ogImage),
      ogType: pageForm.ogType,
      ogLocale: toNullable(pageForm.ogLocale),
      twitterCard: pageForm.twitterCard,
      twitterTitle: toNullable(pageForm.twitterTitle),
      twitterDescription: toNullable(pageForm.twitterDescription),
      twitterImage: toNullable(pageForm.twitterImage),
      twitterSite: toNullable(pageForm.twitterSite),
      twitterCreator: toNullable(pageForm.twitterCreator),
      robotsIndex: pageForm.robotsIndex,
      robotsFollow: pageForm.robotsFollow,
      robotsNoArchive: pageForm.robotsNoArchive,
      robotsNoSnippet: pageForm.robotsNoSnippet,
      structuredData: toNullable(pageForm.structuredData),
      priority: toNullable(pageForm.priority),
      changeFrequency: pageForm.changeFrequency,
      isActive: pageForm.isActive,
    });
    setBasePageForm(pageForm);
  };

  const saveGlobal = async () => {
    await updateGlobalMutation.mutateAsync({
      siteName: toNullable(globalForm.siteName) ?? "Lumiohan",
      siteTagline: toNullable(globalForm.siteTagline),
      defaultLanguage: toNullable(globalForm.defaultLanguage) ?? "tr",
      defaultMetaTitle: toNullable(globalForm.defaultMetaTitle),
      defaultMetaDescription: toNullable(globalForm.defaultMetaDescription),
      defaultMetaKeywords: toNullable(globalForm.defaultMetaKeywords),
      defaultOgImage: toNullable(globalForm.defaultOgImage),
      facebookAppId: toNullable(globalForm.facebookAppId),
      defaultTwitterSite: toNullable(globalForm.defaultTwitterSite),
      defaultTwitterCreator: toNullable(globalForm.defaultTwitterCreator),
      googleVerification: toNullable(globalForm.googleVerification),
      bingVerification: toNullable(globalForm.bingVerification),
      yandexVerification: toNullable(globalForm.yandexVerification),
      pinterestVerification: toNullable(globalForm.pinterestVerification),
      googleAnalyticsId: toNullable(globalForm.googleAnalyticsId),
      googleTagManagerId: toNullable(globalForm.googleTagManagerId),
      facebookPixelId: toNullable(globalForm.facebookPixelId),
      robotsTxtContent: toNullable(globalForm.robotsTxtContent),
      sitemapEnabled: globalForm.sitemapEnabled,
      organizationName: toNullable(globalForm.organizationName),
      organizationLogo: toNullable(globalForm.organizationLogo),
      organizationUrl: toNullable(globalForm.organizationUrl),
      contactEmail: toNullable(globalForm.contactEmail),
      contactPhone: toNullable(globalForm.contactPhone),
      socialLinks: toNullable(globalForm.socialLinks),
    });
    setBaseGlobalForm(globalForm);
  };

  const createPage = async () => {
    if (!newPage.pageSlug.trim() || !newPage.pageName.trim()) {
      toast.error("Sayfa slug ve adı zorunlu.");
      return;
    }

    await createPageMutation.mutateAsync({
      pageSlug: newPage.pageSlug.trim(),
      pageName: newPage.pageName.trim(),
      metaTitle: newPage.metaTitle.trim() || undefined,
      metaDescription: newPage.metaDescription.trim() || undefined,
    });

    setNewPage({
      pageSlug: "",
      pageName: "",
      metaTitle: "",
      metaDescription: "",
    });
  };

  const titlePreview =
    pageForm.metaTitle || globalForm.defaultMetaTitle || "Lumiohan";
  const descriptionPreview =
    pageForm.metaDescription ||
    globalForm.defaultMetaDescription ||
    "Sayfa açıklaması";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#00F5FF]" />
            SEO Yönetimi
          </h2>
          <p className="text-sm text-zinc-500">
            Sayfa bazlı SEO, global meta ayarları ve arama motoru doğrulamaları
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-white/20"
            onClick={() => initializePagesMutation.mutate()}
            disabled={initializePagesMutation.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${initializePagesMutation.isPending ? "animate-spin" : ""}`}
            />
            Varsayılan Sayfalar
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
          >
            <Plus className="h-4 w-4 mr-2" />
            SEO Sayfası Ekle
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard
            icon={FileText}
            label="Toplam"
            value={stats.totalPages}
            color="text-[#00F5FF]"
          />
          <StatCard
            icon={CheckCircle}
            label="Meta Tam"
            value={stats.pagesWithMeta}
            color="text-green-400"
          />
          <StatCard
            icon={Globe}
            label="OG Tam"
            value={stats.pagesWithOg}
            color="text-indigo-400"
          />
          <StatCard
            icon={BarChart3}
            label="Analytics"
            value={stats.hasAnalytics ? "Açık" : "Kapalı"}
            color={stats.hasAnalytics ? "text-green-400" : "text-zinc-400"}
          />
          <StatCard
            icon={AlertCircle}
            label="İndekslenen"
            value={stats.pagesIndexed}
            color="text-yellow-400"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/50">
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10"
                placeholder="Sayfa ara..."
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="bg-zinc-800 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sayfalar</SelectItem>
                <SelectItem value="complete">Meta Tam</SelectItem>
                <SelectItem value="missing">Meta Eksik</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[720px] overflow-y-auto divide-y divide-white/5">
            {filteredPages.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                Filtreye uygun sayfa yok.
              </div>
            ) : (
              filteredPages.map(page => {
                const complete = Boolean(
                  page.metaTitle && page.metaDescription
                );
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`w-full p-4 text-left transition-colors hover:bg-white/5 ${
                      selectedPageId === page.id ? "bg-[#00F5FF]/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{page.pageName}</p>
                        <p className="text-xs text-zinc-500 font-mono">
                          /{page.pageSlug}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            page.isActive
                              ? "bg-green-500/15 text-green-400"
                              : "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {page.isActive ? "Aktif" : "Pasif"}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            complete
                              ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {complete ? "Meta Tam" : "Eksik"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-base">Sayfa SEO Editörü</h3>
                <p className="text-xs text-zinc-500">
                  Meta, OG, Twitter ve robots ayarları
                </p>
              </div>
              <div className="flex gap-2">
                {selectedPage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                    onClick={() =>
                      deletePageMutation.mutate({ id: selectedPage.id })
                    }
                    disabled={deletePageMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Sil
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  onClick={() => setPageForm(basePageForm)}
                  disabled={!pageFormDirty}
                >
                  Geri Al
                </Button>
                <Button
                  size="sm"
                  onClick={savePage}
                  disabled={
                    !selectedPage ||
                    !pageFormDirty ||
                    updatePageMutation.isPending
                  }
                  className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
                >
                  {updatePageMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Kaydet
                </Button>
              </div>
            </div>

            {!selectedPage ? (
              <div className="h-52 grid place-items-center text-zinc-500">
                Düzenlemek için soldan bir sayfa seçin.
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Google Önizleme</p>
                  <p className="text-[#4EA4F6] text-lg leading-tight line-clamp-1">
                    {titlePreview}
                  </p>
                  <p className="text-[12px] text-green-500">
                    {pageForm.canonicalUrl ||
                      `https://lumiohan.com/${pageForm.pageSlug}`}
                  </p>
                  <p className="text-sm text-zinc-300 line-clamp-2 mt-1">
                    {descriptionPreview}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    value={pageForm.pageName}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        pageName: e.target.value,
                      }))
                    }
                    placeholder="Sayfa adı"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Input
                    value={pageForm.pageSlug}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        pageSlug: e.target.value,
                      }))
                    }
                    placeholder="Slug"
                    className="bg-zinc-800 border-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-zinc-400">
                    Meta Title ({pageForm.metaTitle.length}/70)
                  </label>
                  <Input
                    maxLength={70}
                    value={pageForm.metaTitle}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }))
                    }
                    className="bg-zinc-800 border-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-zinc-400">
                    Meta Description ({pageForm.metaDescription.length}/160)
                  </label>
                  <Textarea
                    maxLength={160}
                    value={pageForm.metaDescription}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        metaDescription: e.target.value,
                      }))
                    }
                    className="bg-zinc-800 border-white/10 min-h-[96px]"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    value={pageForm.metaKeywords}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        metaKeywords: e.target.value,
                      }))
                    }
                    placeholder="Keywords (virgülle)"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Input
                    value={pageForm.canonicalUrl}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        canonicalUrl: e.target.value,
                      }))
                    }
                    placeholder="Canonical URL"
                    className="bg-zinc-800 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Input
                    value={pageForm.ogTitle}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        ogTitle: e.target.value,
                      }))
                    }
                    placeholder="OG Title"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Input
                    value={pageForm.ogImage}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        ogImage: e.target.value,
                      }))
                    }
                    placeholder="OG Image URL"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Select
                    value={pageForm.ogType}
                    onValueChange={value =>
                      setPageForm(prev => ({
                        ...prev,
                        ogType: value as PageFormState["ogType"],
                      }))
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">website</SelectItem>
                      <SelectItem value="article">article</SelectItem>
                      <SelectItem value="product">product</SelectItem>
                      <SelectItem value="profile">profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  value={pageForm.ogDescription}
                  onChange={e =>
                    setPageForm(prev => ({
                      ...prev,
                      ogDescription: e.target.value,
                    }))
                  }
                  placeholder="OG Description"
                  className="bg-zinc-800 border-white/10 min-h-[90px]"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Input
                    value={pageForm.twitterTitle}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        twitterTitle: e.target.value,
                      }))
                    }
                    placeholder="Twitter Title"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Input
                    value={pageForm.twitterImage}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        twitterImage: e.target.value,
                      }))
                    }
                    placeholder="Twitter Image URL"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Select
                    value={pageForm.twitterCard}
                    onValueChange={value =>
                      setPageForm(prev => ({
                        ...prev,
                        twitterCard: value as PageFormState["twitterCard"],
                      }))
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">summary</SelectItem>
                      <SelectItem value="summary_large_image">
                        summary_large_image
                      </SelectItem>
                      <SelectItem value="app">app</SelectItem>
                      <SelectItem value="player">player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  value={pageForm.twitterDescription}
                  onChange={e =>
                    setPageForm(prev => ({
                      ...prev,
                      twitterDescription: e.target.value,
                    }))
                  }
                  placeholder="Twitter Description"
                  className="bg-zinc-800 border-white/10 min-h-[90px]"
                />

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <ToggleBox
                    label="Index"
                    checked={pageForm.robotsIndex}
                    onChange={checked =>
                      setPageForm(prev => ({ ...prev, robotsIndex: checked }))
                    }
                  />
                  <ToggleBox
                    label="Follow"
                    checked={pageForm.robotsFollow}
                    onChange={checked =>
                      setPageForm(prev => ({ ...prev, robotsFollow: checked }))
                    }
                  />
                  <ToggleBox
                    label="NoArchive"
                    checked={pageForm.robotsNoArchive}
                    onChange={checked =>
                      setPageForm(prev => ({
                        ...prev,
                        robotsNoArchive: checked,
                      }))
                    }
                  />
                  <ToggleBox
                    label="NoSnippet"
                    checked={pageForm.robotsNoSnippet}
                    onChange={checked =>
                      setPageForm(prev => ({
                        ...prev,
                        robotsNoSnippet: checked,
                      }))
                    }
                  />
                  <ToggleBox
                    label="Aktif"
                    checked={pageForm.isActive}
                    onChange={checked =>
                      setPageForm(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    value={pageForm.priority}
                    onChange={e =>
                      setPageForm(prev => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    placeholder="Sitemap priority (0.0 - 1.0)"
                    className="bg-zinc-800 border-white/10"
                  />
                  <Select
                    value={pageForm.changeFrequency}
                    onValueChange={value =>
                      setPageForm(prev => ({
                        ...prev,
                        changeFrequency:
                          value as PageFormState["changeFrequency"],
                      }))
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">always</SelectItem>
                      <SelectItem value="hourly">hourly</SelectItem>
                      <SelectItem value="daily">daily</SelectItem>
                      <SelectItem value="weekly">weekly</SelectItem>
                      <SelectItem value="monthly">monthly</SelectItem>
                      <SelectItem value="yearly">yearly</SelectItem>
                      <SelectItem value="never">never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  value={pageForm.structuredData}
                  onChange={e =>
                    setPageForm(prev => ({
                      ...prev,
                      structuredData: e.target.value,
                    }))
                  }
                  placeholder="JSON-LD structured data"
                  className="bg-zinc-800 border-white/10 min-h-[120px] font-mono text-xs"
                />
              </>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">Global SEO ve Analytics</h3>
                <p className="text-xs text-zinc-500">
                  Site genelinde varsayılan meta, doğrulama ve script ayarları
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  onClick={() => setGlobalForm(baseGlobalForm)}
                  disabled={!globalFormDirty}
                >
                  Geri Al
                </Button>
                <Button
                  size="sm"
                  onClick={saveGlobal}
                  disabled={!globalFormDirty || updateGlobalMutation.isPending}
                  className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
                >
                  {updateGlobalMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Kaydet
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Input
                value={globalForm.siteName}
                onChange={e =>
                  setGlobalForm(prev => ({ ...prev, siteName: e.target.value }))
                }
                placeholder="Site adı"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.siteTagline}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    siteTagline: e.target.value,
                  }))
                }
                placeholder="Site sloganı"
                className="bg-zinc-800 border-white/10"
              />
              <Select
                value={globalForm.defaultLanguage}
                onValueChange={value =>
                  setGlobalForm(prev => ({ ...prev, defaultLanguage: value }))
                }
              >
                <SelectTrigger className="bg-zinc-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">tr</SelectItem>
                  <SelectItem value="en">en</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              value={globalForm.defaultMetaTitle}
              onChange={e =>
                setGlobalForm(prev => ({
                  ...prev,
                  defaultMetaTitle: e.target.value,
                }))
              }
              placeholder="Varsayılan Meta Title"
              className="bg-zinc-800 border-white/10"
            />
            <Textarea
              value={globalForm.defaultMetaDescription}
              onChange={e =>
                setGlobalForm(prev => ({
                  ...prev,
                  defaultMetaDescription: e.target.value,
                }))
              }
              placeholder="Varsayılan Meta Description"
              className="bg-zinc-800 border-white/10 min-h-[96px]"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                value={globalForm.defaultOgImage}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    defaultOgImage: e.target.value,
                  }))
                }
                placeholder="Varsayılan OG Image"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.defaultMetaKeywords}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    defaultMetaKeywords: e.target.value,
                  }))
                }
                placeholder="Varsayılan Keywords"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Input
                value={globalForm.googleAnalyticsId}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    googleAnalyticsId: e.target.value,
                  }))
                }
                placeholder="GA4 ID (G-XXXX)"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.googleTagManagerId}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    googleTagManagerId: e.target.value,
                  }))
                }
                placeholder="GTM ID"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.facebookPixelId}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    facebookPixelId: e.target.value,
                  }))
                }
                placeholder="Facebook Pixel ID"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                value={globalForm.googleVerification}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    googleVerification: e.target.value,
                  }))
                }
                placeholder="Google verification"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.bingVerification}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    bingVerification: e.target.value,
                  }))
                }
                placeholder="Bing verification"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.yandexVerification}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    yandexVerification: e.target.value,
                  }))
                }
                placeholder="Yandex verification"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.pinterestVerification}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    pinterestVerification: e.target.value,
                  }))
                }
                placeholder="Pinterest verification"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                value={globalForm.organizationName}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    organizationName: e.target.value,
                  }))
                }
                placeholder="Organization Name"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.organizationUrl}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    organizationUrl: e.target.value,
                  }))
                }
                placeholder="Organization URL"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.organizationLogo}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    organizationLogo: e.target.value,
                  }))
                }
                placeholder="Organization Logo"
                className="bg-zinc-800 border-white/10"
              />
              <Input
                value={globalForm.contactEmail}
                onChange={e =>
                  setGlobalForm(prev => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                placeholder="Contact Email"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <Input
              value={globalForm.contactPhone}
              onChange={e =>
                setGlobalForm(prev => ({
                  ...prev,
                  contactPhone: e.target.value,
                }))
              }
              placeholder="Contact Phone"
              className="bg-zinc-800 border-white/10"
            />

            <Textarea
              value={globalForm.socialLinks}
              onChange={e =>
                setGlobalForm(prev => ({
                  ...prev,
                  socialLinks: e.target.value,
                }))
              }
              placeholder='Social links JSON örn: {"x":"https://x.com/..."}'
              className="bg-zinc-800 border-white/10 min-h-[96px] font-mono text-xs"
            />

            <Textarea
              value={globalForm.robotsTxtContent}
              onChange={e =>
                setGlobalForm(prev => ({
                  ...prev,
                  robotsTxtContent: e.target.value,
                }))
              }
              placeholder="robots.txt içeriği"
              className="bg-zinc-800 border-white/10 min-h-[120px] font-mono text-xs"
            />

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sitemap Aktif</p>
                <p className="text-xs text-zinc-500">
                  Sitemap üretimi aktif/pasif
                </p>
              </div>
              <Switch
                checked={globalForm.sitemapEnabled}
                onCheckedChange={checked =>
                  setGlobalForm(prev => ({ ...prev, sitemapEnabled: checked }))
                }
              />
            </div>
          </section>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Yeni SEO Sayfası</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              value={newPage.pageName}
              onChange={e =>
                setNewPage(prev => ({ ...prev, pageName: e.target.value }))
              }
              placeholder="Sayfa adı"
              className="bg-zinc-800 border-white/10"
            />
            <Input
              value={newPage.pageSlug}
              onChange={e =>
                setNewPage(prev => ({
                  ...prev,
                  pageSlug: e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-_]/g, ""),
                }))
              }
              placeholder="Slug (örn: faq-page)"
              className="bg-zinc-800 border-white/10"
            />
            <Input
              value={newPage.metaTitle}
              onChange={e =>
                setNewPage(prev => ({ ...prev, metaTitle: e.target.value }))
              }
              placeholder="Meta title"
              className="bg-zinc-800 border-white/10"
            />
            <Textarea
              value={newPage.metaDescription}
              onChange={e =>
                setNewPage(prev => ({
                  ...prev,
                  metaDescription: e.target.value,
                }))
              }
              placeholder="Meta description"
              className="bg-zinc-800 border-white/10 min-h-[96px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-white/20"
              onClick={() => setIsAddDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={createPage}
              disabled={createPageMutation.isPending}
              className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
            >
              {createPageMutation.isPending ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-zinc-900/50 p-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-zinc-800">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <p className={`text-base font-semibold ${color}`}>{value}</p>
          <p className="text-[11px] text-zinc-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ToggleBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 flex items-center justify-between">
      <span className="text-xs text-zinc-300">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
