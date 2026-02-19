import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import MobileBottomNav from "./components/MobileBottomNav";
import { SeoHead } from "./components/SeoHead";
import AnnouncementBanner from "./components/AnnouncementBanner";
import { Loader2 } from "lucide-react";

import MaintenancePage from "@/pages/MaintenancePage";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// Eager load - critical pages
import Home from "@/pages/Home";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import NotFound from "@/pages/NotFound";

// Lazy load - feature pages
const Generate = lazy(() => import("@/pages/Generate"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Profile = lazy(() => import("@/pages/Profile"));
const Packages = lazy(() => import("@/pages/Packages"));
const AiInfluencer = lazy(() => import("@/pages/AiInfluencer"));
const CommunityCharacters = lazy(() => import("@/pages/CommunityCharacters"));
const VideoGenerate = lazy(() => import("@/pages/VideoGenerate"));
const Upscale = lazy(() => import("@/pages/Upscale"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const MultiAngle = lazy(() => import("@/pages/MultiAngle"));
const ProductPromo = lazy(() => import("@/pages/ProductPromo"));
const UgcAd = lazy(() => import("@/pages/UgcAd"));
const SkinEnhancement = lazy(() => import("@/pages/SkinEnhancement"));
const LogoGenerator = lazy(() => import("@/pages/LogoGenerator"));
const PromptCompiler = lazy(() => import("@/pages/PromptCompiler"));
const MotionControl = lazy(() => import("@/pages/MotionControl"));
const Apps = lazy(() => import("@/pages/Apps"));
const AudioGenerate = lazy(() => import("@/pages/AudioGenerate"));
const MusicGenerate = lazy(() => import("@/pages/MusicGenerate"));
const UserProfilePage = lazy(() =>
  import("@/pages/UserProfilePage").then(m => ({ default: m.UserProfilePage }))
);
const VerifyEmailPage = lazy(() =>
  import("@/pages/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage }))
);

// Lazy load - admin pages (rarely used)
const AdminLayout = lazy(() => import("@/pages/admin/index"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-[#7C3AED]" />
    </div>
  );
}

function Router() {
  const { user, loading: authLoading } = useAuth();

  // Check maintenance mode
  const maintenanceQuery = trpc.settings.getPublicSettings.useQuery(undefined, {
    staleTime: 30000,
    retry: false,
  });

  const settings = maintenanceQuery.data || [];
  const isMaintenanceMode =
    settings.find(s => s.key === "maintenance_mode_enabled")?.value === "true";
  const maintenanceMessage = settings.find(
    s => s.key === "maintenance_message"
  )?.value;
  const isAdmin = user?.role === "admin";

  // Show maintenance page for non-admin users when maintenance mode is enabled
  if (isMaintenanceMode && !isAdmin && !authLoading) {
    // Allow access to login page
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/register"
    ) {
      // Continue to login/register
    } else {
      return <MaintenancePage message={maintenanceMessage || undefined} />;
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/login"} component={LoginPage} />
        <Route path={"/register"} component={RegisterPage} />
        <Route path={"/verify-email"} component={VerifyEmailPage} />
        <Route path={"/user-profile"} component={UserProfilePage} />
        <Route path={"/"} component={Home} />
        <Route path={"/generate"} component={Generate} />
        <Route path={"/gallery"} component={Gallery} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/packages"} component={Packages} />
        <Route path={"/ai-influencer"} component={AiInfluencer} />
        <Route path={"/community-characters"} component={CommunityCharacters} />
        <Route path={"/video-generate"} component={VideoGenerate} />
        <Route path={"/motion-control"} component={MotionControl} />
        <Route path={"/apps"} component={Apps} />
        <Route path={"/audio-generate"} component={AudioGenerate} />
        <Route path={"/music-generate"} component={MusicGenerate} />
        <Route path={"/upscale"} component={Upscale} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:slug"} component={BlogDetail} />
        <Route path={"/multi-angle"} component={MultiAngle} />
        <Route path={"/product-promo"} component={ProductPromo} />
        <Route path={"/ugc-ad"} component={UgcAd} />
        <Route path={"/skin-enhancement"} component={SkinEnhancement} />
        <Route path={"/logo-generator"} component={LogoGenerator} />
        <Route path={"/prompt-compiler"} component={PromptCompiler} />
        {/* Admin Panel */}
        <Route path={"/admin/:rest*"} component={AdminLayout} />
        <Route path={"/admin"} component={AdminLayout} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <SeoHead />
          <AnnouncementBanner />
          <Router />
          <MobileBottomNav />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
