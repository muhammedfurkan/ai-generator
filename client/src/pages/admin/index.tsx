/**
 * Admin Panel - Ana Giriş
 * Tüm admin işlevlerini tek bir yerden yönetmek için kapsamlı panel
 */
import { useState, Suspense, lazy } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  Tag,
  DollarSign,
  Megaphone,
  HelpCircle,
  Zap,
  MessageSquare,
  Image,
  Video,
  Activity,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  FileText,
  Globe,
  Server,
  Mail,
  Shield,
  CreditCard,
  BarChart3,
  RefreshCw,
  Home,
  Bot,
  Layout,
  Ban,
  Cpu,
  Flag,
  Clock,
  Lock,
  Loader2,
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

// Loading fallback for admin pages
function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#00F5FF]" />
    </div>
  );
}

// Navigation items
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const BASE_PATH = "/admin";

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Genel",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: `${BASE_PATH}`,
      },
      {
        id: "users",
        label: "Kullanıcılar",
        icon: Users,
        path: `${BASE_PATH}/users`,
      },
      {
        id: "images",
        label: "Görseller",
        icon: Image,
        path: `${BASE_PATH}/images`,
      },
      {
        id: "videos",
        label: "Videolar",
        icon: Video,
        path: `${BASE_PATH}/videos`,
      },
      {
        id: "jobqueue",
        label: "İş Kuyruğu",
        icon: Clock,
        path: `${BASE_PATH}/job-queue`,
      },
    ],
  },
  {
    title: "Finans",
    items: [
      {
        id: "credits",
        label: "Kredi İşlemleri",
        icon: CreditCard,
        path: `${BASE_PATH}/credits`,
      },
      {
        id: "payments",
        label: "Ödemeler",
        icon: DollarSign,
        path: `${BASE_PATH}/payments`,
      },
      {
        id: "packages",
        label: "Paketler",
        icon: Package,
        path: `${BASE_PATH}/packages`,
      },
      {
        id: "discounts",
        label: "İndirim Kodları",
        icon: Tag,
        path: `${BASE_PATH}/discounts`,
      },
      {
        id: "pricing",
        label: "Fiyatlandırma",
        icon: TrendingUp,
        path: `${BASE_PATH}/pricing`,
      },
    ],
  },
  {
    title: "AI Yönetimi",
    items: [
      {
        id: "aiInfluencer",
        label: "AI Influencer",
        icon: Image,
        path: `${BASE_PATH}/ai-influencer`,
      },
      {
        id: "models",
        label: "AI Modeller",
        icon: Cpu,
        path: `${BASE_PATH}/models`,
      },
      {
        id: "promptcontrol",
        label: "Prompt Kontrol",
        icon: Flag,
        path: `${BASE_PATH}/prompt-control`,
      },
    ],
  },
  {
    title: "İçerik",
    items: [
      {
        id: "announcements",
        label: "Duyurular",
        icon: Megaphone,
        path: `${BASE_PATH}/announcements`,
      },
      { id: "faq", label: "SSS", icon: HelpCircle, path: `${BASE_PATH}/faq` },
      { id: "blog", label: "Blog", icon: FileText, path: `${BASE_PATH}/blog` },
      // { id: "viralApps", label: "Viral Apps", icon: Zap, path: `${BASE_PATH}/viral-apps` },
    ],
  },
  {
    title: "Moderasyon",
    items: [
      {
        id: "characters",
        label: "AI Karakterler",
        icon: Image,
        path: `${BASE_PATH}/characters`,
      },
      {
        id: "feedback",
        label: "Geri Bildirimler",
        icon: MessageSquare,
        path: `${BASE_PATH}/feedback`,
      },
    ],
  },
  {
    title: "Sistem",
    items: [
      {
        id: "settings",
        label: "Site Ayarları",
        icon: Settings,
        path: `${BASE_PATH}/settings`,
      },
      {
        id: "seo",
        label: "SEO Yönetimi",
        icon: Globe,
        path: `${BASE_PATH}/seo`,
      },
      {
        id: "homepage",
        label: "Ana Sayfa Düzeni",
        icon: Layout,
        path: `${BASE_PATH}/homepage`,
      },
      {
        id: "features",
        label: "Özellikler",
        icon: Zap,
        path: `${BASE_PATH}/features`,
      },
      {
        id: "telegram",
        label: "Telegram",
        icon: Bot,
        path: `${BASE_PATH}/telegram`,
      },
      {
        id: "modalcards",
        label: "Modal Kartları",
        icon: Layout,
        path: `${BASE_PATH}/modal-cards`,
      },
      {
        id: "api",
        label: "API Durumu",
        icon: Server,
        path: `${BASE_PATH}/api`,
      },
      {
        id: "emails",
        label: "E-posta",
        icon: Mail,
        path: `${BASE_PATH}/emails`,
      },
    ],
  },
  {
    title: "Güvenlik",
    items: [
      {
        id: "security",
        label: "Güvenlik Ayarları",
        icon: Lock,
        path: `${BASE_PATH}/security`,
      },
      {
        id: "bans",
        label: "Yasaklamalar",
        icon: Ban,
        path: `${BASE_PATH}/bans`,
      },
    ],
  },
  {
    title: "Analiz",
    items: [
      {
        id: "reports",
        label: "Raporlar",
        icon: BarChart3,
        path: `${BASE_PATH}/reports`,
      },
      {
        id: "logs",
        label: "Aktivite Logları",
        icon: Activity,
        path: `${BASE_PATH}/logs`,
      },
    ],
  },
];

export default function AdminLayout() {
  // ❗ CRITICAL: All hooks MUST be called before any conditional returns
  // This prevents "Rendered more hooks" error during auth state changes
  const { user, logout } = useAuth();
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get dashboard stats for notifications
  const dashboardQuery = trpc.adminPanel.getDashboardOverview.useQuery(
    undefined,
    {
      refetchInterval: 60000, // Her dakika güncelle
      enabled: isAuthenticated && user?.role === "admin",
    }
  );

  // ✅ NOW we can do conditional returns - all hooks are already called above

  // Show loading state while checking authentication
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Show access denied for non-admin users
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

  // Get current page title
  const getCurrentPageTitle = () => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (
          location === item.path ||
          (item.path !== BASE_PATH && location.startsWith(item.path))
        ) {
          return item.label;
        }
      }
    }
    return "Dashboard";
  };

  // Render current page based on location
  const renderCurrentPage = () => {
    const path = location;

    if (path === BASE_PATH || path === `${BASE_PATH}/`) {
      return <AdminDashboard />;
    }
    if (path.startsWith(`${BASE_PATH}/users`)) {
      return <AdminUsers />;
    }
    if (path.startsWith(`${BASE_PATH}/images`)) {
      return <AdminImages />;
    }
    if (path.startsWith(`${BASE_PATH}/videos`)) {
      return <AdminVideos />;
    }
    if (path.startsWith(`${BASE_PATH}/credits`)) {
      return <AdminCredits />;
    }
    if (path.startsWith(`${BASE_PATH}/packages`)) {
      return <AdminPackages />;
    }
    if (path.startsWith(`${BASE_PATH}/discounts`)) {
      return <AdminDiscounts />;
    }
    if (path.startsWith(`${BASE_PATH}/pricing`)) {
      return <AdminPricing />;
    }
    if (path.startsWith(`${BASE_PATH}/announcements`)) {
      return <AdminAnnouncements />;
    }
    if (path.startsWith(`${BASE_PATH}/faq`)) {
      return <AdminFaq />;
    }
    if (path.startsWith(`${BASE_PATH}/blog`)) {
      return <AdminBlogManager />;
    }
    if (path.startsWith(`${BASE_PATH}/viral-apps`)) {
      return <AdminViralApps />;
    }
    if (path.startsWith(`${BASE_PATH}/characters`)) {
      return <AdminCharacters />;
    }
    if (path.startsWith(`${BASE_PATH}/feedback`)) {
      return <AdminFeedback />;
    }
    if (path.startsWith(`${BASE_PATH}/settings`)) {
      return <AdminSettings />;
    }
    if (path.startsWith(`${BASE_PATH}/seo`)) {
      return <AdminSeoManager />;
    }
    if (path.startsWith(`${BASE_PATH}/api`)) {
      return <AdminApi />;
    }
    if (path.startsWith(`${BASE_PATH}/emails`)) {
      return <AdminEmails />;
    }
    if (path.startsWith(`${BASE_PATH}/reports`)) {
      return <AdminReports />;
    }
    if (path.startsWith(`${BASE_PATH}/logs`)) {
      return <AdminLogs />;
    }
    if (path.startsWith(`${BASE_PATH}/telegram`)) {
      return <AdminTelegram />;
    }
    if (path.startsWith(`${BASE_PATH}/homepage`)) {
      return <AdminHomepage />;
    }
    if (path.startsWith(`${BASE_PATH}/bans`)) {
      return <AdminBans />;
    }
    if (path.startsWith(`${BASE_PATH}/features`)) {
      return <AdminFeatures />;
    }
    if (path.startsWith(`${BASE_PATH}/models`)) {
      return <AdminModels />;
    }
    if (path.startsWith(`${BASE_PATH}/prompt-control`)) {
      return <AdminPromptControl />;
    }
    if (path.startsWith(`${BASE_PATH}/job-queue`)) {
      return <AdminJobQueue />;
    }
    if (path.startsWith(`${BASE_PATH}/payments`)) {
      return <AdminPayments />;
    }
    if (path.startsWith(`${BASE_PATH}/security`)) {
      return <AdminSecurity />;
    }
    if (path.startsWith(`${BASE_PATH}/ai-influencer`)) {
      return <AdminAiInfluencer />;
    }
    if (path.startsWith(`${BASE_PATH}/modal-cards`)) {
      return <AdminModalCards />;
    }

    // Default to dashboard
    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-[#F9FAFB] flex">
      {/* Mobile Menu Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          ${sidebarOpen ? "w-64" : "w-20"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-zinc-900/95 backdrop-blur-xl border-r border-white/10
          flex flex-col transition-all duration-300
        `}
      >
        {/* Logo */}
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
              <span className="font-bold text-lg">Admin Panel</span>
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="mb-4">
              {sidebarOpen && (
                <p className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    location === item.path ||
                    (item.path !== BASE_PATH && location.startsWith(item.path));

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                            : "text-zinc-400 hover:text-[#F9FAFB] hover:bg-white/5"
                        }
                      `}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-[#00F5FF]" : ""}`}
                      />
                      {sidebarOpen && (
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
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
        </nav>

        {/* User Info */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
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
                <h1 className="text-xl font-bold">{getCurrentPageTitle()}</h1>
                <p className="text-xs text-zinc-500">
                  Sistem yönetimi ve kontrol
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-zinc-900 border-white/10 focus:border-[#00F5FF]/50"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {(dashboardQuery.data?.pendingFeedbacks || 0) > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>

              {/* Refresh */}
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

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Suspense fallback={<AdminPageLoader />}>
            {renderCurrentPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
