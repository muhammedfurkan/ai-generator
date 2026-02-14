/**
 * Admin SEO Manager - SEO Yönetimi (Tam Entegrasyon)
 * Sayfa bazlı ve global SEO ayarları
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Search,
  Globe,
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  BarChart3,
  Eye,
  Code,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";

export default function AdminSeoManager() {
  const [activeTab, setActiveTab] = useState<"pages" | "global" | "analytics" | "robots">("pages");
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const pagesQuery = trpc.seo.getAllPages.useQuery();
  const globalConfigQuery = trpc.seo.getGlobalConfig.useQuery();
  const statsQuery = trpc.seo.getStats.useQuery();

  // Mutations
  const initPagesMutation = trpc.seo.initializeDefaultPages.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.seo.getAllPages.invalidate();
      utils.seo.getStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePageMutation = trpc.seo.updatePage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa SEO ayarları güncellendi");
      utils.seo.getAllPages.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const createPageMutation = trpc.seo.createPage.useMutation({
    onSuccess: () => {
      toast.success("Yeni sayfa eklendi");
      utils.seo.getAllPages.invalidate();
      utils.seo.getStats.invalidate();
      setIsAddingPage(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePageMutation = trpc.seo.deletePage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa silindi");
      utils.seo.getAllPages.invalidate();
      utils.seo.getStats.invalidate();
      setSelectedPage(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateGlobalMutation = trpc.seo.updateGlobalConfig.useMutation({
    onSuccess: () => {
      toast.success("Global SEO ayarları güncellendi");
      utils.seo.getGlobalConfig.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const stats = statsQuery.data;
  const pages = pagesQuery.data || [];
  const globalConfig = globalConfigQuery.data;
  const selectedPageData = selectedPage ? pages.find((p) => p.id === selectedPage) : null;

  const tabs = [
    { id: "pages", label: "Sayfa SEO", icon: FileText },
    { id: "global", label: "Global Ayarlar", icon: Globe },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "robots", label: "Robots & Sitemap", icon: Code },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">SEO Yönetimi</h2>
          <p className="text-sm text-zinc-500">Sayfa bazlı ve global SEO ayarları</p>
        </div>
        <Button
          variant="outline"
          onClick={() => initPagesMutation.mutate()}
          disabled={initPagesMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${initPagesMutation.isPending ? "animate-spin" : ""}`} />
          Varsayılan Sayfaları Oluştur
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPages}</p>
                <p className="text-xs text-zinc-500">Toplam Sayfa</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.pagesWithMeta}</p>
                <p className="text-xs text-zinc-500">Meta Tam</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Globe className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.pagesWithOg}</p>
                <p className="text-xs text-zinc-500">OG Tam</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Eye className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-400">{stats.pagesIndexed}</p>
                <p className="text-xs text-zinc-500">İndekslenen</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.id
                ? "bg-lime-500/20 text-lime-400 border border-lime-500/30"
                : "bg-zinc-900 text-zinc-400 border border-white/10 hover:border-white/20"
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Pages Tab */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Page List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold">Sayfalar</h3>
              <Button size="sm" onClick={() => setIsAddingPage(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
              {pages.map((page: any) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${selectedPage === page.id ? "bg-lime-500/10" : ""
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{page.pageName}</p>
                      <p className="text-xs text-zinc-500">/{page.pageSlug}</p>
                    </div>
                    {page.metaTitle && page.metaDescription ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                        <AlertCircle className="h-3 w-3" />
                        Eksik
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Page Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-zinc-900/50 rounded-2xl border border-white/10"
          >
            {selectedPageData ? (
              <PageEditor
                page={selectedPageData}
                onSave={(data) => updatePageMutation.mutate({ id: selectedPageData.id, ...data })}
                onDelete={() => deletePageMutation.mutate({ id: selectedPageData.id })}
                isPending={updatePageMutation.isPending}
                isDeleting={deletePageMutation.isPending}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <FileText className="h-12 w-12 text-zinc-600 mb-4" />
                <p className="text-zinc-500">Düzenlemek için bir sayfa seçin</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Global Tab */}
      {activeTab === "global" && globalConfig && (
        <GlobalConfigEditor config={globalConfig} onSave={(data: any) => updateGlobalMutation.mutate(data)} isPending={updateGlobalMutation.isPending} />
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && globalConfig && (
        <AnalyticsEditor config={globalConfig} onSave={(data: any) => updateGlobalMutation.mutate(data)} isPending={updateGlobalMutation.isPending} />
      )}

      {/* Robots Tab */}
      {activeTab === "robots" && globalConfig && (
        <RobotsEditor config={globalConfig} onSave={(data: any) => updateGlobalMutation.mutate(data)} isPending={updateGlobalMutation.isPending} />
      )}

      {/* Add Page Dialog */}
      <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Yeni Sayfa Ekle</DialogTitle>
          </DialogHeader>
          <AddPageForm onSubmit={(data) => createPageMutation.mutate(data)} isPending={createPageMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Page Editor Component
function PageEditor({ page, onSave, onDelete, isPending, isDeleting }: any) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setFormData({
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      canonicalUrl: page.canonicalUrl || "",
      ogTitle: page.ogTitle || "",
      ogDescription: page.ogDescription || "",
      ogImage: page.ogImage || "",
      twitterTitle: page.twitterTitle || "",
      twitterDescription: page.twitterDescription || "",
      twitterImage: page.twitterImage || "",
      robotsIndex: page.robotsIndex ?? true,
      robotsFollow: page.robotsFollow ?? true,
      structuredData: page.structuredData || "",
      isActive: page.isActive ?? true,
    });
  }, [page]);

  return (
    <div>
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{page.pageName}</h3>
          <p className="text-xs text-zinc-500">/{page.pageSlug}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => onSave(formData)} disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
        {/* Basic Meta */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Search className="h-4 w-4" /> Temel Meta Etiketleri
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Meta Title ({formData.metaTitle?.length || 0}/70)</label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                maxLength={70}
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Meta Description ({formData.metaDescription?.length || 0}/160)</label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                maxLength={160}
                rows={2}
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Keywords</label>
              <Input
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Canonical URL</label>
              <Input
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                className="bg-zinc-800 border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" /> Open Graph
          </h4>
          <div className="space-y-3">
            <Input
              placeholder="OG Title"
              value={formData.ogTitle}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              className="bg-zinc-800 border-white/10"
            />
            <Textarea
              placeholder="OG Description"
              value={formData.ogDescription}
              onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
              rows={2}
              className="bg-zinc-800 border-white/10"
            />
            <Input
              placeholder="OG Image URL"
              value={formData.ogImage}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              className="bg-zinc-800 border-white/10"
            />
          </div>
        </div>

        {/* Robots */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Code className="h-4 w-4" /> Robots Ayarları
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">İndeksle</span>
              <Switch
                checked={formData.robotsIndex}
                onCheckedChange={(checked) => setFormData({ ...formData, robotsIndex: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">Takip Et</span>
              <Switch
                checked={formData.robotsFollow}
                onCheckedChange={(checked) => setFormData({ ...formData, robotsFollow: checked })}
              />
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
          <div>
            <p className="font-medium">Sayfa Aktif</p>
            <p className="text-xs text-zinc-500">SEO ayarları uygulanacak mı?</p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </div>
    </div>
  );
}

// Add Page Form
function AddPageForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [formData, setFormData] = useState({
    pageSlug: "",
    pageName: "",
    metaTitle: "",
    metaDescription: "",
  });

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Sayfa Slug</label>
        <Input
          value={formData.pageSlug}
          onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })}
          placeholder="sayfa-adi"
          className="bg-zinc-800 border-white/10"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Sayfa Adı</label>
        <Input
          value={formData.pageName}
          onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
          placeholder="Sayfa Adı"
          className="bg-zinc-800 border-white/10"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Meta Title</label>
        <Input
          value={formData.metaTitle}
          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          placeholder="Sayfa Başlığı | Amonify"
          className="bg-zinc-800 border-white/10"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Meta Description</label>
        <Textarea
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          placeholder="Sayfa açıklaması..."
          rows={2}
          className="bg-zinc-800 border-white/10"
        />
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(formData)} disabled={isPending} className="bg-lime-500 hover:bg-lime-600 text-black">
          {isPending ? "Ekleniyor..." : "Ekle"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// Global Config Editor
function GlobalConfigEditor({ config, onSave, isPending }: any) {
  const [formData, setFormData] = useState({
    siteName: config?.siteName || "Amonify",
    siteTagline: config?.siteTagline || "",
    defaultLanguage: config?.defaultLanguage || "tr",
    defaultMetaTitle: config?.defaultMetaTitle || "",
    defaultMetaDescription: config?.defaultMetaDescription || "",
    defaultMetaKeywords: config?.defaultMetaKeywords || "",
    defaultOgImage: config?.defaultOgImage || "",
    organizationName: config?.organizationName || "",
    organizationLogo: config?.organizationLogo || "",
    organizationUrl: config?.organizationUrl || "",
    contactEmail: config?.contactEmail || "",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Global SEO Ayarları</h3>
        <Button onClick={() => onSave(formData)} disabled={isPending} className="bg-lime-500 hover:bg-lime-600 text-black">
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Site Bilgileri</h4>
          <Input placeholder="Site Adı" value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} className="bg-zinc-800 border-white/10" />
          <Input placeholder="Site Sloganı" value={formData.siteTagline} onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })} className="bg-zinc-800 border-white/10" />
          <Select value={formData.defaultLanguage} onValueChange={(v) => setFormData({ ...formData, defaultLanguage: v })}>
            <SelectTrigger className="bg-zinc-800 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <h4 className="font-medium">Varsayılan Meta</h4>
          <Input placeholder="Varsayılan Title" value={formData.defaultMetaTitle} onChange={(e) => setFormData({ ...formData, defaultMetaTitle: e.target.value })} className="bg-zinc-800 border-white/10" />
          <Textarea placeholder="Varsayılan Description" value={formData.defaultMetaDescription} onChange={(e) => setFormData({ ...formData, defaultMetaDescription: e.target.value })} rows={2} className="bg-zinc-800 border-white/10" />
          <Input placeholder="Varsayılan OG Image" value={formData.defaultOgImage} onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })} className="bg-zinc-800 border-white/10" />
        </div>
        <div className="space-y-4 md:col-span-2">
          <h4 className="font-medium">Organizasyon Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Organizasyon Adı" value={formData.organizationName} onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })} className="bg-zinc-800 border-white/10" />
            <Input placeholder="Organizasyon URL" value={formData.organizationUrl} onChange={(e) => setFormData({ ...formData, organizationUrl: e.target.value })} className="bg-zinc-800 border-white/10" />
            <Input placeholder="Logo URL" value={formData.organizationLogo} onChange={(e) => setFormData({ ...formData, organizationLogo: e.target.value })} className="bg-zinc-800 border-white/10" />
            <Input placeholder="İletişim Email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="bg-zinc-800 border-white/10" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Analytics Editor  
function AnalyticsEditor({ config, onSave, isPending }: any) {
  const [formData, setFormData] = useState({
    googleAnalyticsId: config?.googleAnalyticsId || "",
    googleTagManagerId: config?.googleTagManagerId || "",
    facebookPixelId: config?.facebookPixelId || "",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Analytics Entegrasyonları</h3>
        <Button onClick={() => onSave(formData)} disabled={isPending} className="bg-lime-500 hover:bg-lime-600 text-black">
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Google Analytics ID</label>
          <Input
            placeholder="G-XXXXXXXXXX"
            value={formData.googleAnalyticsId}
            onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
            className="bg-zinc-800 border-white/10"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Google Tag Manager ID</label>
          <Input
            placeholder="GTM-XXXXXXX"
            value={formData.googleTagManagerId}
            onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
            className="bg-zinc-800 border-white/10"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Facebook Pixel ID</label>
          <Input
            placeholder="XXXXXXXXXXXXXXXX"
            value={formData.facebookPixelId}
            onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
            className="bg-zinc-800 border-white/10"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Robots Editor
function RobotsEditor({ config, onSave, isPending }: any) {
  const [formData, setFormData] = useState({
    robotsTxt: config?.robotsTxt || `User-agent: *
Allow: /

Sitemap: https://amonify.com/sitemap.xml`,
    sitemapUrl: config?.sitemapUrl || "https://amonify.com/sitemap.xml",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Robots.txt & Sitemap</h3>
        <Button onClick={() => onSave(formData)} disabled={isPending} className="bg-lime-500 hover:bg-lime-600 text-black">
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Sitemap URL</label>
          <Input
            value={formData.sitemapUrl}
            onChange={(e) => setFormData({ ...formData, sitemapUrl: e.target.value })}
            className="bg-zinc-800 border-white/10"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Robots.txt İçeriği</label>
          <Textarea
            value={formData.robotsTxt}
            onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
            rows={10}
            className="bg-zinc-800 border-white/10 font-mono text-sm"
          />
        </div>
      </div>
    </motion.div>
  );
}
