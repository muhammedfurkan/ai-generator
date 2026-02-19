import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  Globe,
  Twitter,
  Facebook,
  Settings,
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  BarChart3,
  Eye,
  EyeOff,
  Link,
  Image,
  Code,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function SeoSettings() {
  const [activeTab, setActiveTab] = useState("pages");
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const pagesQuery = trpc.seo.getAllPages.useQuery();
  const globalConfigQuery = trpc.seo.getGlobalConfig.useQuery();
  const statsQuery = trpc.seo.getStats.useQuery();

  // Mutations
  const initPagesMutation = trpc.seo.initializeDefaultPages.useMutation({
    onSuccess: data => {
      toast.success(data.message);
      utils.seo.getAllPages.invalidate();
      utils.seo.getStats.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const updatePageMutation = trpc.seo.updatePage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa SEO ayarları güncellendi");
      utils.seo.getAllPages.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const createPageMutation = trpc.seo.createPage.useMutation({
    onSuccess: () => {
      toast.success("Yeni sayfa eklendi");
      utils.seo.getAllPages.invalidate();
      utils.seo.getStats.invalidate();
      setIsAddingPage(false);
    },
    onError: error => toast.error(error.message),
  });

  const deletePageMutation = trpc.seo.deletePage.useMutation({
    onSuccess: () => {
      toast.success("Sayfa silindi");
      utils.seo.getAllPages.invalidate();
      utils.seo.getStats.invalidate();
      setSelectedPage(null);
    },
    onError: error => toast.error(error.message),
  });

  const updateGlobalMutation = trpc.seo.updateGlobalConfig.useMutation({
    onSuccess: () => {
      toast.success("Global SEO ayarları güncellendi");
      utils.seo.getGlobalConfig.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const stats = statsQuery.data;
  const pages = pagesQuery.data || [];
  const globalConfig = globalConfigQuery.data;

  const selectedPageData = selectedPage
    ? pages.find(p => p.id === selectedPage)
    : null;

  // Navigation items for mobile
  const navItems = [
    { id: "pages", label: "Sayfa SEO", icon: FileText },
    { id: "global", label: "Global Ayarlar", icon: Globe },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "robots", label: "Robots & Sitemap", icon: Code },
    { id: "social", label: "Sosyal Medya", icon: Twitter },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">SEO Ayarları</h1>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="py-4 space-y-2">
                {navItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              SEO Kontrol Paneli
            </h1>
            <p className="text-muted-foreground mt-1">
              Site geneli ve sayfa bazlı SEO ayarlarını yönetin
            </p>
          </div>
          <Button
            onClick={() => initPagesMutation.mutate()}
            disabled={initPagesMutation.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${initPagesMutation.isPending ? "animate-spin" : ""}`}
            />
            Varsayılan Sayfaları Oluştur
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <Card className="bg-gradient-to-br from-[#00F5FF]/10 to-[#7C3AED]/5">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-[#00F5FF]" />
                  <span className="text-xs lg:text-sm text-muted-foreground">
                    Toplam Sayfa
                  </span>
                </div>
                <p className="text-xl lg:text-2xl font-bold mt-1">
                  {stats.totalPages}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                  <span className="text-xs lg:text-sm text-muted-foreground">
                    Meta Tam
                  </span>
                </div>
                <p className="text-xl lg:text-2xl font-bold mt-1">
                  {stats.pagesWithMeta}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#7C3AED]/10 to-[#FF2E97]/5">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 lg:h-5 lg:w-5 text-[#7C3AED]" />
                  <span className="text-xs lg:text-sm text-muted-foreground">
                    OG Tam
                  </span>
                </div>
                <p className="text-xl lg:text-2xl font-bold mt-1">
                  {stats.pagesWithOg}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#00F5FF]/10 to-[#7C3AED]/5">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 lg:h-5 lg:w-5 text-[#00F5FF]" />
                  <span className="text-xs lg:text-sm text-muted-foreground">
                    İndekslenen
                  </span>
                </div>
                <p className="text-xl lg:text-2xl font-bold mt-1">
                  {stats.pagesIndexed}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Desktop Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="hidden lg:block"
        >
          <TabsList className="mb-4">
            {navItems.map(item => (
              <TabsTrigger key={item.id} value={item.id} className="gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <PagesTab
              pages={pages}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              selectedPageData={selectedPageData}
              isAddingPage={isAddingPage}
              setIsAddingPage={setIsAddingPage}
              updatePageMutation={updatePageMutation}
              createPageMutation={createPageMutation}
              deletePageMutation={deletePageMutation}
            />
          </TabsContent>

          {/* Global Tab */}
          <TabsContent value="global">
            <GlobalConfigTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
            />
          </TabsContent>

          {/* Robots Tab */}
          <TabsContent value="robots">
            <RobotsTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
            />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <SocialTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
            />
          </TabsContent>
        </Tabs>

        {/* Mobile Content */}
        <div className="lg:hidden">
          {activeTab === "pages" && (
            <PagesTab
              pages={pages}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              selectedPageData={selectedPageData}
              isAddingPage={isAddingPage}
              setIsAddingPage={setIsAddingPage}
              updatePageMutation={updatePageMutation}
              createPageMutation={createPageMutation}
              deletePageMutation={deletePageMutation}
              isMobile
            />
          )}
          {activeTab === "global" && (
            <GlobalConfigTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
              isMobile
            />
          )}
          {activeTab === "analytics" && (
            <AnalyticsTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
              isMobile
            />
          )}
          {activeTab === "robots" && (
            <RobotsTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
              isMobile
            />
          )}
          {activeTab === "social" && (
            <SocialTab
              globalConfig={globalConfig}
              updateGlobalMutation={updateGlobalMutation}
              isMobile
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Pages Tab Component
function PagesTab({
  pages,
  selectedPage,
  setSelectedPage,
  selectedPageData,
  isAddingPage,
  setIsAddingPage,
  updatePageMutation,
  createPageMutation,
  deletePageMutation,
  isMobile = false,
}: any) {
  const [formData, setFormData] = useState<any>({});

  const handlePageSelect = (page: any) => {
    setSelectedPage(page.id);
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
      robotsIndex: page.robotsIndex,
      robotsFollow: page.robotsFollow,
      structuredData: page.structuredData || "",
      isActive: page.isActive,
    });
  };

  const handleSave = () => {
    if (!selectedPage) return;
    updatePageMutation.mutate({ id: selectedPage, ...formData });
  };

  return (
    <div
      className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-3 gap-6"}`}
    >
      {/* Page List */}
      <Card className={isMobile ? "" : "col-span-1"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Sayfalar</CardTitle>
            <Button size="sm" onClick={() => setIsAddingPage(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={`divide-y max-h-[400px] overflow-y-auto`}>
            {pages.map((page: any) => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page)}
                className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                  selectedPage === page.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{page.pageName}</p>
                    <p className="text-xs text-muted-foreground">
                      /{page.pageSlug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.metaTitle && page.metaDescription ? (
                      <Badge
                        variant="outline"
                        className="text-green-500 border-green-500/30 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        OK
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-yellow-500 border-yellow-500/30 text-xs"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Eksik
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Editor */}
      {selectedPageData && (
        <Card className={isMobile ? "" : "col-span-2"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedPageData.pageName}</CardTitle>
                <CardDescription>/{selectedPageData.pageSlug}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    deletePageMutation.mutate({ id: selectedPage })
                  }
                  disabled={deletePageMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updatePageMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Meta */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" />
                Temel Meta Etiketleri
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>
                    Meta Title ({formData.metaTitle?.length || 0}/70)
                  </Label>
                  <Input
                    value={formData.metaTitle}
                    onChange={e =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    maxLength={70}
                    placeholder="Sayfa başlığı..."
                  />
                </div>
                <div>
                  <Label>
                    Meta Description ({formData.metaDescription?.length || 0}
                    /160)
                  </Label>
                  <Textarea
                    value={formData.metaDescription}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
                    maxLength={160}
                    placeholder="Sayfa açıklaması..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Keywords</Label>
                  <Input
                    value={formData.metaKeywords}
                    onChange={e =>
                      setFormData({ ...formData, metaKeywords: e.target.value })
                    }
                    placeholder="anahtar, kelimeler, virgülle, ayrılmış"
                  />
                </div>
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={formData.canonicalUrl}
                    onChange={e =>
                      setFormData({ ...formData, canonicalUrl: e.target.value })
                    }
                    placeholder="https://nanoinf.com/sayfa"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Open Graph (Facebook)
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>OG Title</Label>
                  <Input
                    value={formData.ogTitle}
                    onChange={e =>
                      setFormData({ ...formData, ogTitle: e.target.value })
                    }
                    placeholder="Facebook paylaşım başlığı..."
                  />
                </div>
                <div>
                  <Label>OG Description</Label>
                  <Textarea
                    value={formData.ogDescription}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        ogDescription: e.target.value,
                      })
                    }
                    placeholder="Facebook paylaşım açıklaması..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>OG Image URL</Label>
                  <Input
                    value={formData.ogImage}
                    onChange={e =>
                      setFormData({ ...formData, ogImage: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Twitter Card */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter Card
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Twitter Title</Label>
                  <Input
                    value={formData.twitterTitle}
                    onChange={e =>
                      setFormData({ ...formData, twitterTitle: e.target.value })
                    }
                    placeholder="Twitter paylaşım başlığı..."
                  />
                </div>
                <div>
                  <Label>Twitter Description</Label>
                  <Textarea
                    value={formData.twitterDescription}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        twitterDescription: e.target.value,
                      })
                    }
                    placeholder="Twitter paylaşım açıklaması..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Twitter Image URL</Label>
                  <Input
                    value={formData.twitterImage}
                    onChange={e =>
                      setFormData({ ...formData, twitterImage: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Robots */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Code className="h-4 w-4" />
                Robots Ayarları
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>İndeksle</Label>
                  <Switch
                    checked={formData.robotsIndex}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, robotsIndex: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Takip Et</Label>
                  <Switch
                    checked={formData.robotsFollow}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, robotsFollow: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Structured Data */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Code className="h-4 w-4" />
                Structured Data (JSON-LD)
              </h3>
              <Textarea
                value={formData.structuredData}
                onChange={e =>
                  setFormData({ ...formData, structuredData: e.target.value })
                }
                placeholder='{"@context": "https://schema.org", ...}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label>Sayfa Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  SEO ayarları uygulanacak mı?
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={checked =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedPageData && (
        <Card className={isMobile ? "" : "col-span-2"}>
          <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Düzenlemek için bir sayfa seçin
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Page Dialog */}
      <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Sayfa Ekle</DialogTitle>
          </DialogHeader>
          <AddPageForm
            onSubmit={(data: any) => createPageMutation.mutate(data)}
            isPending={createPageMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add Page Form
function AddPageForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    pageSlug: "",
    pageName: "",
    metaTitle: "",
    metaDescription: "",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Sayfa Slug</Label>
        <Input
          value={formData.pageSlug}
          onChange={e => setFormData({ ...formData, pageSlug: e.target.value })}
          placeholder="sayfa-adi"
        />
      </div>
      <div>
        <Label>Sayfa Adı</Label>
        <Input
          value={formData.pageName}
          onChange={e => setFormData({ ...formData, pageName: e.target.value })}
          placeholder="Sayfa Adı"
        />
      </div>
      <div>
        <Label>Meta Title</Label>
        <Input
          value={formData.metaTitle}
          onChange={e =>
            setFormData({ ...formData, metaTitle: e.target.value })
          }
          placeholder="Sayfa Başlığı | Lumiohan"
        />
      </div>
      <div>
        <Label>Meta Description</Label>
        <Textarea
          value={formData.metaDescription}
          onChange={e =>
            setFormData({ ...formData, metaDescription: e.target.value })
          }
          placeholder="Sayfa açıklaması..."
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(formData)} disabled={isPending}>
          {isPending ? "Ekleniyor..." : "Ekle"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// Global Config Tab
function GlobalConfigTab({
  globalConfig,
  updateGlobalMutation,
  isMobile = false,
}: any) {
  const [formData, setFormData] = useState({
    siteName: globalConfig?.siteName || "Lumiohan",
    siteTagline: globalConfig?.siteTagline || "",
    defaultLanguage: globalConfig?.defaultLanguage || "tr",
    defaultMetaTitle: globalConfig?.defaultMetaTitle || "",
    defaultMetaDescription: globalConfig?.defaultMetaDescription || "",
    defaultMetaKeywords: globalConfig?.defaultMetaKeywords || "",
    defaultOgImage: globalConfig?.defaultOgImage || "",
    organizationName: globalConfig?.organizationName || "",
    organizationLogo: globalConfig?.organizationLogo || "",
    organizationUrl: globalConfig?.organizationUrl || "",
    contactEmail: globalConfig?.contactEmail || "",
    contactPhone: globalConfig?.contactPhone || "",
  });

  const handleSave = () => {
    updateGlobalMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Global SEO Ayarları</CardTitle>
            <CardDescription>
              Site geneli varsayılan SEO ayarları
            </CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateGlobalMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Site Info */}
        <div className="space-y-4">
          <h3 className="font-semibold">Site Bilgileri</h3>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div>
              <Label>Site Adı</Label>
              <Input
                value={formData.siteName}
                onChange={e =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Site Sloganı</Label>
              <Input
                value={formData.siteTagline}
                onChange={e =>
                  setFormData({ ...formData, siteTagline: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Varsayılan Dil</Label>
              <Select
                value={formData.defaultLanguage}
                onValueChange={v =>
                  setFormData({ ...formData, defaultLanguage: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Default Meta */}
        <div className="space-y-4">
          <h3 className="font-semibold">Varsayılan Meta Etiketleri</h3>
          <div className="space-y-3">
            <div>
              <Label>Varsayılan Title</Label>
              <Input
                value={formData.defaultMetaTitle}
                onChange={e =>
                  setFormData({ ...formData, defaultMetaTitle: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Varsayılan Description</Label>
              <Textarea
                value={formData.defaultMetaDescription}
                onChange={e =>
                  setFormData({
                    ...formData,
                    defaultMetaDescription: e.target.value,
                  })
                }
                rows={2}
              />
            </div>
            <div>
              <Label>Varsayılan Keywords</Label>
              <Input
                value={formData.defaultMetaKeywords}
                onChange={e =>
                  setFormData({
                    ...formData,
                    defaultMetaKeywords: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Varsayılan OG Image</Label>
              <Input
                value={formData.defaultOgImage}
                onChange={e =>
                  setFormData({ ...formData, defaultOgImage: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-4">
          <h3 className="font-semibold">Organizasyon Bilgileri (Schema.org)</h3>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div>
              <Label>Organizasyon Adı</Label>
              <Input
                value={formData.organizationName}
                onChange={e =>
                  setFormData({ ...formData, organizationName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Organizasyon URL</Label>
              <Input
                value={formData.organizationUrl}
                onChange={e =>
                  setFormData({ ...formData, organizationUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={formData.organizationLogo}
                onChange={e =>
                  setFormData({ ...formData, organizationLogo: e.target.value })
                }
              />
            </div>
            <div>
              <Label>İletişim Email</Label>
              <Input
                value={formData.contactEmail}
                onChange={e =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
              />
            </div>
            <div>
              <Label>İletişim Telefon</Label>
              <Input
                value={formData.contactPhone}
                onChange={e =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics Tab
function AnalyticsTab({
  globalConfig,
  updateGlobalMutation,
  isMobile = false,
}: any) {
  const [formData, setFormData] = useState({
    googleAnalyticsId: globalConfig?.googleAnalyticsId || "",
    googleTagManagerId: globalConfig?.googleTagManagerId || "",
    facebookPixelId: globalConfig?.facebookPixelId || "",
    googleVerification: globalConfig?.googleVerification || "",
    bingVerification: globalConfig?.bingVerification || "",
    yandexVerification: globalConfig?.yandexVerification || "",
    pinterestVerification: globalConfig?.pinterestVerification || "",
    facebookAppId: globalConfig?.facebookAppId || "",
  });

  const handleSave = () => {
    updateGlobalMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analytics & Doğrulama</CardTitle>
            <CardDescription>
              Analitik araçları ve site doğrulama kodları
            </CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateGlobalMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analytics */}
        <div className="space-y-4">
          <h3 className="font-semibold">Analytics</h3>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div>
              <Label>Google Analytics ID</Label>
              <Input
                value={formData.googleAnalyticsId}
                onChange={e =>
                  setFormData({
                    ...formData,
                    googleAnalyticsId: e.target.value,
                  })
                }
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <Label>Google Tag Manager ID</Label>
              <Input
                value={formData.googleTagManagerId}
                onChange={e =>
                  setFormData({
                    ...formData,
                    googleTagManagerId: e.target.value,
                  })
                }
                placeholder="GTM-XXXXXXX"
              />
            </div>
            <div>
              <Label>Facebook Pixel ID</Label>
              <Input
                value={formData.facebookPixelId}
                onChange={e =>
                  setFormData({ ...formData, facebookPixelId: e.target.value })
                }
                placeholder="XXXXXXXXXXXXXXX"
              />
            </div>
            <div>
              <Label>Facebook App ID</Label>
              <Input
                value={formData.facebookAppId}
                onChange={e =>
                  setFormData({ ...formData, facebookAppId: e.target.value })
                }
                placeholder="XXXXXXXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="space-y-4">
          <h3 className="font-semibold">Site Doğrulama</h3>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div>
              <Label>Google Search Console</Label>
              <Input
                value={formData.googleVerification}
                onChange={e =>
                  setFormData({
                    ...formData,
                    googleVerification: e.target.value,
                  })
                }
                placeholder="Doğrulama kodu"
              />
            </div>
            <div>
              <Label>Bing Webmaster</Label>
              <Input
                value={formData.bingVerification}
                onChange={e =>
                  setFormData({ ...formData, bingVerification: e.target.value })
                }
                placeholder="Doğrulama kodu"
              />
            </div>
            <div>
              <Label>Yandex Webmaster</Label>
              <Input
                value={formData.yandexVerification}
                onChange={e =>
                  setFormData({
                    ...formData,
                    yandexVerification: e.target.value,
                  })
                }
                placeholder="Doğrulama kodu"
              />
            </div>
            <div>
              <Label>Pinterest</Label>
              <Input
                value={formData.pinterestVerification}
                onChange={e =>
                  setFormData({
                    ...formData,
                    pinterestVerification: e.target.value,
                  })
                }
                placeholder="Doğrulama kodu"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Robots Tab
function RobotsTab({
  globalConfig,
  updateGlobalMutation,
  isMobile = false,
}: any) {
  const [formData, setFormData] = useState({
    robotsTxtContent:
      globalConfig?.robotsTxtContent ||
      `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://nanoinf.com/sitemap.xml`,
    sitemapEnabled: globalConfig?.sitemapEnabled ?? true,
  });

  const handleSave = () => {
    updateGlobalMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Robots.txt & Sitemap</CardTitle>
            <CardDescription>Arama motoru tarayıcı ayarları</CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateGlobalMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Robots.txt */}
        <div className="space-y-4">
          <h3 className="font-semibold">Robots.txt İçeriği</h3>
          <Textarea
            value={formData.robotsTxtContent}
            onChange={e =>
              setFormData({ ...formData, robotsTxtContent: e.target.value })
            }
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        {/* Sitemap */}
        <div className="space-y-4">
          <h3 className="font-semibold">Sitemap Ayarları</h3>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Sitemap Aktif</Label>
              <p className="text-sm text-muted-foreground">
                Otomatik sitemap oluşturulsun mu?
              </p>
            </div>
            <Switch
              checked={formData.sitemapEnabled}
              onCheckedChange={checked =>
                setFormData({ ...formData, sitemapEnabled: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Social Tab
function SocialTab({
  globalConfig,
  updateGlobalMutation,
  isMobile = false,
}: any) {
  const [formData, setFormData] = useState({
    defaultTwitterSite: globalConfig?.defaultTwitterSite || "",
    defaultTwitterCreator: globalConfig?.defaultTwitterCreator || "",
    socialLinks: globalConfig?.socialLinks || "",
  });

  const handleSave = () => {
    updateGlobalMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sosyal Medya Ayarları</CardTitle>
            <CardDescription>
              Twitter ve sosyal medya bağlantıları
            </CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateGlobalMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Twitter */}
        <div className="space-y-4">
          <h3 className="font-semibold">Twitter Ayarları</h3>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div>
              <Label>Twitter Site (@username)</Label>
              <Input
                value={formData.defaultTwitterSite}
                onChange={e =>
                  setFormData({
                    ...formData,
                    defaultTwitterSite: e.target.value,
                  })
                }
                placeholder="@nanoinf"
              />
            </div>
            <div>
              <Label>Twitter Creator (@username)</Label>
              <Input
                value={formData.defaultTwitterCreator}
                onChange={e =>
                  setFormData({
                    ...formData,
                    defaultTwitterCreator: e.target.value,
                  })
                }
                placeholder="@nanoinf"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-semibold">Sosyal Medya Linkleri (JSON)</h3>
          <Textarea
            value={formData.socialLinks}
            onChange={e =>
              setFormData({ ...formData, socialLinks: e.target.value })
            }
            placeholder={`[
  {"platform": "twitter", "url": "https://twitter.com/nanoinf"},
  {"platform": "instagram", "url": "https://instagram.com/nanoinf"},
  {"platform": "youtube", "url": "https://youtube.com/@nanoinf"}
]`}
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
