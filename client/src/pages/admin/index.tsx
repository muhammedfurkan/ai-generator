/**
 * Admin Panel - Ana Giriş
 * Tüm admin işlevlerini tek bir yerden yönetmek için kapsamlı panel
 */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Ban,
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  DollarSign,
  FileText,
  Flag,
  Globe,
  HelpCircle,
  Home,
  Image,
  Layout,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Palette,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Tag,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";

// Lazy load all admin sub-pages
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminUsers = lazy(() => import("./AdminUsers"));
const AdminImages = lazy(() => import("./AdminImages"));
const AdminVideos = lazy(() => import("./AdminVideos"));
const AdminCredits = lazy(() => import("./AdminCredits"));
const AdminPackages = lazy(() => import("./AdminPackages"));
const AdminDiscounts = lazy(() => import("./AdminDiscounts"));
const AdminPricing = lazy(() => import("./AdminPricing"));
const AdminAnnouncements = lazy(() => import("./AdminAnnouncements"));
const AdminFaq = lazy(() => import("./AdminFaq"));
const AdminViralApps = lazy(() => import("./AdminViralApps"));
const AdminFeedback = lazy(() => import("./AdminFeedback"));
const AdminCharacters = lazy(() => import("./AdminCharacters"));
const AdminBlogManager = lazy(() => import("./AdminBlogManager"));
const AdminSeoManager = lazy(() => import("./AdminSeoManager"));
const AdminSettings = lazy(() => import("./AdminSettings"));
const AdminReports = lazy(() => import("./AdminReports"));
const AdminLogs = lazy(() => import("./AdminLogs"));
const AdminApi = lazy(() => import("./AdminApi"));
const AdminEmails = lazy(() => import("./AdminEmails"));
const AdminTelegram = lazy(() => import("./AdminTelegram"));
const AdminHomepage = lazy(() => import("./AdminHomepage"));
const AdminBans = lazy(() => import("./AdminBans"));
const AdminFeatures = lazy(() => import("./AdminFeatures"));
const AdminModels = lazy(() => import("./AdminModels"));
const AdminPromptControl = lazy(() => import("./AdminPromptControl"));
const AdminJobQueue = lazy(() => import("./AdminJobQueue"));
const AdminPayments = lazy(() => import("./AdminPayments"));
const AdminSecurity = lazy(() => import("./AdminSecurity"));
const AdminAiInfluencer = lazy(() => import("./AdminAiInfluencer"));
const AdminModalCards = lazy(() => import("./AdminModalCards"));
const AdminBranding = lazy(() => import("./AdminBranding"));
const AdminWebControl = lazy(() => import("./AdminWebControl"));

// Loading fallback for admin pages
function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#00F5FF]" />
    </div>
  );
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  group: string;
  description: string;
  keywords?: string[];
  badge?: number;
  component: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const BASE_PATH = "/admin";

const NAV_GROUP_ORDER = [
  "Yönetim",
  "Site ve İçerik",
  "AI ve Üretim",
  "Finans",
  "Entegrasyon",
  "Güvenlik",
];

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: `${BASE_PATH}`,
    group: "Yönetim",
    description: "Sistem özeti ve hızlı aksiyonlar",
    keywords: ["genel", "istatistik"],
    component: AdminDashboard,
  },
  {
    id: "users",
    label: "Kullanıcılar",
    icon: Users,
    path: `${BASE_PATH}/users`,
    group: "Yönetim",
    description: "Hesapları görüntüle ve yönet",
    keywords: ["uyeler", "hesap"],
    component: AdminUsers,
  },
  {
    id: "reports",
    label: "Raporlar",
    icon: BarChart3,
    path: `${BASE_PATH}/reports`,
    group: "Yönetim",
    description: "İş metrikleri ve analitik raporlar",
    keywords: ["analiz", "grafik"],
    component: AdminReports,
  },
  {
    id: "logs",
    label: "Aktivite Logları",
    icon: Activity,
    path: `${BASE_PATH}/logs`,
    group: "Yönetim",
    description: "Sistem ve işlem kayıtları",
    keywords: ["log", "gecmis"],
    component: AdminLogs,
  },
  {
    id: "branding",
    label: "Marka ve Kimlik",
    icon: Palette,
    path: `${BASE_PATH}/branding`,
    group: "Site ve İçerik",
    description: "Logo, favicon ve marka metinleri",
    keywords: ["logo", "favicon", "brand"],
    component: AdminBranding,
  },
  {
    id: "webcontrol",
    label: "Web Kontrol Merkezi",
    icon: Settings,
    path: `${BASE_PATH}/web-control`,
    group: "Site ve İçerik",
    description: "Hero, menüler ve footer yönetimi",
    keywords: ["web", "ui", "home", "header", "footer"],
    component: AdminWebControl,
  },
  {
    id: "homepage",
    label: "Ana Sayfa Düzeni",
    icon: Layout,
    path: `${BASE_PATH}/homepage`,
    group: "Site ve İçerik",
    description: "Vitrin içeriklerini düzenle",
    keywords: ["home", "landing"],
    component: AdminHomepage,
  },
  {
    id: "announcements",
    label: "Duyurular",
    icon: Megaphone,
    path: `${BASE_PATH}/announcements`,
    group: "Site ve İçerik",
    description: "Banner ve popup duyuru yönetimi",
    keywords: ["banner", "popup"],
    component: AdminAnnouncements,
  },
  {
    id: "blog",
    label: "Blog",
    icon: FileText,
    path: `${BASE_PATH}/blog`,
    group: "Site ve İçerik",
    description: "Blog içeriklerini yönet",
    keywords: ["yazi", "makale"],
    component: AdminBlogManager,
  },
  {
    id: "faq",
    label: "SSS",
    icon: HelpCircle,
    path: `${BASE_PATH}/faq`,
    group: "Site ve İçerik",
    description: "Sık sorulan sorular",
    keywords: ["yardim"],
    component: AdminFaq,
  },
  {
    id: "seo",
    label: "SEO Yönetimi",
    icon: Globe,
    path: `${BASE_PATH}/seo`,
    group: "Site ve İçerik",
    description: "Sayfa bazlı SEO ayarları",
    keywords: ["meta", "index"],
    component: AdminSeoManager,
  },
  {
    id: "settings",
    label: "Site Ayarları",
    icon: Settings,
    path: `${BASE_PATH}/settings`,
    group: "Site ve İçerik",
    description: "Tüm sistem ayarları",
    keywords: ["config", "ayar"],
    component: AdminSettings,
  },
  {
    id: "features",
    label: "Özellikler",
    icon: Zap,
    path: `${BASE_PATH}/features`,
    group: "Site ve İçerik",
    description: "Özellik görünürlüğü ve fiyatları",
    keywords: ["feature", "pricing"],
    component: AdminFeatures,
  },
  {
    id: "modalcards",
    label: "Modal Kartları",
    icon: Layout,
    path: `${BASE_PATH}/modal-cards`,
    group: "Site ve İçerik",
    description: "Kampanya/uyarı modal içerikleri",
    keywords: ["modal"],
    component: AdminModalCards,
  },
  {
    id: "images",
    label: "Görseller",
    icon: Image,
    path: `${BASE_PATH}/images`,
    group: "AI ve Üretim",
    description: "Üretilen görselleri yönet",
    keywords: ["generation", "image"],
    component: AdminImages,
  },
  {
    id: "videos",
    label: "Videolar",
    icon: Video,
    path: `${BASE_PATH}/videos`,
    group: "AI ve Üretim",
    description: "Üretilen videoları yönet",
    keywords: ["video", "render"],
    component: AdminVideos,
  },
  {
    id: "jobqueue",
    label: "İş Kuyruğu",
    icon: Clock,
    path: `${BASE_PATH}/job-queue`,
    group: "AI ve Üretim",
    description: "Bekleyen ve çalışan işler",
    keywords: ["queue", "kuyruk"],
    component: AdminJobQueue,
  },
  {
    id: "models",
    label: "AI Modeller",
    icon: Cpu,
    path: `${BASE_PATH}/models`,
    group: "AI ve Üretim",
    description: "Model aktiflik ve limit yönetimi",
    keywords: ["model", "provider"],
    component: AdminModels,
  },
  {
    id: "promptcontrol",
    label: "Prompt Kontrol",
    icon: Flag,
    path: `${BASE_PATH}/prompt-control`,
    group: "AI ve Üretim",
    description: "Prompt kuralları ve filtreler",
    keywords: ["prompt", "moderation"],
    component: AdminPromptControl,
  },
  {
    id: "aiInfluencer",
    label: "AI Influencer",
    icon: Image,
    path: `${BASE_PATH}/ai-influencer`,
    group: "AI ve Üretim",
    description: "AI influencer model/fiyat ayarları",
    keywords: ["influencer"],
    component: AdminAiInfluencer,
  },
  {
    id: "characters",
    label: "AI Karakterler",
    icon: Image,
    path: `${BASE_PATH}/characters`,
    group: "AI ve Üretim",
    description: "Karakter içerik moderasyonu",
    keywords: ["character"],
    component: AdminCharacters,
  },
  {
    id: "feedback",
    label: "Geri Bildirimler",
    icon: MessageSquare,
    path: `${BASE_PATH}/feedback`,
    group: "AI ve Üretim",
    description: "Kullanıcı geri bildirim yönetimi",
    keywords: ["feedback", "yorum"],
    component: AdminFeedback,
  },
  {
    id: "viralapps",
    label: "Viral Apps",
    icon: Zap,
    path: `${BASE_PATH}/viral-apps`,
    group: "AI ve Üretim",
    description: "Viral araç koleksiyonu yönetimi",
    keywords: ["apps", "viral"],
    component: AdminViralApps,
  },
  {
    id: "payments",
    label: "Ödemeler",
    icon: DollarSign,
    path: `${BASE_PATH}/payments`,
    group: "Finans",
    description: "Ödeme akışları ve işlem takibi",
    keywords: ["payment", "checkout"],
    component: AdminPayments,
  },
  {
    id: "credits",
    label: "Kredi İşlemleri",
    icon: CreditCard,
    path: `${BASE_PATH}/credits`,
    group: "Finans",
    description: "Kredi tanımlama ve geçmiş",
    keywords: ["credit"],
    component: AdminCredits,
  },
  {
    id: "packages",
    label: "Paketler",
    icon: Package,
    path: `${BASE_PATH}/packages`,
    group: "Finans",
    description: "Paket tanımları ve sıralama",
    keywords: ["plan"],
    component: AdminPackages,
  },
  {
    id: "discounts",
    label: "İndirim Kodları",
    icon: Tag,
    path: `${BASE_PATH}/discounts`,
    group: "Finans",
    description: "Kupon ve kampanya yönetimi",
    keywords: ["kupon", "coupon"],
    component: AdminDiscounts,
  },
  {
    id: "pricing",
    label: "Fiyatlandırma",
    icon: TrendingUp,
    path: `${BASE_PATH}/pricing`,
    group: "Finans",
    description: "Fiyat ve marj yapılandırması",
    keywords: ["fiyat"],
    component: AdminPricing,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: Bot,
    path: `${BASE_PATH}/telegram`,
    group: "Entegrasyon",
    description: "Telegram bot ve bildirim ayarları",
    keywords: ["bot"],
    component: AdminTelegram,
  },
  {
    id: "emails",
    label: "E-posta",
    icon: Mail,
    path: `${BASE_PATH}/emails`,
    group: "Entegrasyon",
    description: "E-posta şablon ve kanal ayarları",
    keywords: ["smtp", "mail"],
    component: AdminEmails,
  },
  {
    id: "api",
    label: "API Durumu",
    icon: Server,
    path: `${BASE_PATH}/api`,
    group: "Entegrasyon",
    description: "Servis sağlık ve endpoint kontrolleri",
    keywords: ["status", "health"],
    component: AdminApi,
  },
  {
    id: "security",
    label: "Güvenlik Ayarları",
    icon: Lock,
    path: `${BASE_PATH}/security`,
    group: "Güvenlik",
    description: "Yetki, erişim ve güvenlik politikaları",
    keywords: ["auth", "permission"],
    component: AdminSecurity,
  },
  {
    id: "bans",
    label: "Yasaklamalar",
    icon: Ban,
    path: `${BASE_PATH}/bans`,
    group: "Güvenlik",
    description: "Engelli kullanıcı ve e-posta listeleri",
    keywords: ["ban", "blacklist"],
    component: AdminBans,
  },
];

const QUICK_ACCESS_IDS = [
  "dashboard",
  "webcontrol",
  "branding",
  "users",
  "jobqueue",
  "payments",
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dashboardQuery = trpc.adminPanel.getDashboardOverview.useQuery(
    undefined,
    {
      refetchInterval: 60000,
      enabled: isAuthenticated && user?.role === "admin",
    }
  );

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("tr-TR");

  const activeNavItem = useMemo(() => {
    if (location === BASE_PATH || location === `${BASE_PATH}/`) {
      return NAV_ITEMS.find(item => item.id === "dashboard") ?? NAV_ITEMS[0];
    }

    return (
      [...NAV_ITEMS]
        .sort((a, b) => b.path.length - a.path.length)
        .find(
          item => item.path !== BASE_PATH && location.startsWith(item.path)
        ) ?? NAV_ITEMS[0]
    );
  }, [location]);

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return NAV_ITEMS;

    return NAV_ITEMS.filter(item => {
      const haystack = [
        item.label,
        item.group,
        item.description,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  const navGroups = useMemo<NavGroup[]>(() => {
    return NAV_GROUP_ORDER.map(title => ({
      title,
      items: filteredItems.filter(item => item.group === title),
    })).filter(group => group.items.length > 0);
  }, [filteredItems]);

  const quickAccessItems = useMemo(() => {
    const lookup = new Map(filteredItems.map(item => [item.id, item]));
    return QUICK_ACCESS_IDS.map(id => lookup.get(id)).filter(
      (item): item is NavItem => Boolean(item)
    );
  }, [filteredItems]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-12 w-12 animate-spin text-[#00F5FF]" />
          <p className="text-zinc-400 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-red-400 mb-2">
            Erişim Reddedildi
          </h1>
          <p className="text-zinc-400 mb-6">
            Bu sayfaya erişmek için admin yetkisi gereklidir.
          </p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="rounded-full"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const ActivePage = activeNavItem.component;

  const handleNavigate = (item: NavItem) => {
    navigate(item.path);
    setMobileMenuOpen(false);
    setSearchQuery("");
  };

  const firstSearchResult = normalizedSearch ? filteredItems[0] : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-[#F9FAFB] flex">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          ${sidebarOpen ? "w-72" : "w-20"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-zinc-900/95 backdrop-blur-xl border-r border-white/10
          flex flex-col transition-all duration-300
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="font-bold text-sm leading-none">Admin Panel</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Yönetim Merkezi
                </p>
              </div>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full hidden lg:flex"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-full lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {sidebarOpen ? (
          <div className="px-3 py-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Menüde ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && firstSearchResult) {
                    handleNavigate(firstSearchResult);
                  }
                }}
                className="w-full pl-9 bg-zinc-900 border-white/10 focus:border-[#00F5FF]/50"
              />
            </div>
            {normalizedSearch && (
              <p className="text-xs text-zinc-500 mt-2">
                {filteredItems.length} sonuç bulundu
              </p>
            )}
          </div>
        ) : (
          <div className="py-3 px-2 border-b border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => setSidebarOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {sidebarOpen && quickAccessItems.length > 0 && (
            <div className="mb-4">
              <p className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Hızlı Erişim
              </p>
              <div className="space-y-1">
                {quickAccessItems.map(item => {
                  const Icon = item.icon;
                  const isActive = item.id === activeNavItem.id;

                  return (
                    <button
                      key={`quick-${item.id}`}
                      onClick={() => handleNavigate(item)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-[#00F5FF]" : ""}`}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {navGroups.map(group => (
            <div key={group.title} className="mb-4">
              {sidebarOpen && (
                <p className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = item.id === activeNavItem.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                            : "text-zinc-400 hover:text-[#F9FAFB] hover:bg-white/5"
                        }
                      `}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-[#00F5FF]" : ""}`}
                      />
                      {sidebarOpen && (
                        <div className="min-w-0 text-left">
                          <p className="text-sm font-medium truncate">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                      {item.badge && item.badge > 0 && sidebarOpen && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#00F5FF] rounded-r-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="px-3 py-4 rounded-lg bg-zinc-800/50 border border-white/10">
              <p className="text-sm text-zinc-300">Menü sonucu bulunamadı</p>
              <p className="text-xs text-zinc-500 mt-1">
                Farklı bir kelime deneyin.
              </p>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div
            className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center text-black font-bold">
              {user?.name?.[0] || "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex-1 justify-start gap-2"
              >
                <Home className="h-4 w-4" />
                Siteye Dön
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{activeNavItem.label}</h1>
                <p className="text-xs text-zinc-500">
                  {activeNavItem.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Menüde ara ve Enter ile git..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && firstSearchResult) {
                      handleNavigate(firstSearchResult);
                    }
                  }}
                  className="w-72 pl-9 bg-zinc-900 border-white/10 focus:border-[#00F5FF]/50"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {(dashboardQuery.data?.pendingFeedbacks || 0) > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => dashboardQuery.refetch()}
              >
                <RefreshCw
                  className={`h-5 w-5 ${dashboardQuery.isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Suspense fallback={<AdminPageLoader />}>
            <ActivePage />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
