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
import { useAuth } from "@/_core/hooks/useAuth";
import { useWebUiConfig } from "@/hooks/useWebUiConfig";

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
  const { getSetting, featureFlags } = useWebUiConfig();

  const isMaintenanceMode = featureFlags.maintenance_mode_enabled;
  const maintenanceMessage = getSetting("maintenance_message", "");
  const isAdmin = user?.role === "admin";

  const RegisterRoute = featureFlags.registration_enabled
    ? RegisterPage
    : NotFound;
  const GenerateRoute = featureFlags.image_generation_enabled
    ? Generate
    : NotFound;
  const VideoGenerateRoute = featureFlags.video_generation_enabled
    ? VideoGenerate
    : NotFound;
  const MotionControlRoute = featureFlags.video_generation_enabled
    ? MotionControl
    : NotFound;
  const AiInfluencerRoute = featureFlags.ai_influencer_enabled
    ? AiInfluencer
    : NotFound;
  const UpscaleRoute = featureFlags.upscale_enabled ? Upscale : NotFound;
  const AudioGenerateRoute = featureFlags.audio_generation_enabled
    ? AudioGenerate
    : NotFound;
  const MusicGenerateRoute = featureFlags.music_generation_enabled
    ? MusicGenerate
    : NotFound;
  const GalleryRoute = featureFlags.gallery_enabled ? Gallery : NotFound;
  const BlogRoute = featureFlags.blog_enabled ? Blog : NotFound;
  const BlogDetailRoute = featureFlags.blog_enabled ? BlogDetail : NotFound;
  const CommunityRoute = featureFlags.community_enabled
    ? CommunityCharacters
    : NotFound;

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
        <Route path={"/register"} component={RegisterRoute} />
        <Route path={"/verify-email"} component={VerifyEmailPage} />
        <Route path={"/user-profile"} component={UserProfilePage} />
        <Route path={"/"} component={Home} />
        <Route path={"/generate"} component={GenerateRoute} />
        <Route path={"/gallery"} component={GalleryRoute} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/packages"} component={Packages} />
        <Route path={"/ai-influencer"} component={AiInfluencerRoute} />
        <Route path={"/community-characters"} component={CommunityRoute} />
        <Route path={"/video-generate"} component={VideoGenerateRoute} />
        <Route path={"/motion-control"} component={MotionControlRoute} />
        <Route path={"/apps"} component={Apps} />
        <Route path={"/audio-generate"} component={AudioGenerateRoute} />
        <Route path={"/music-generate"} component={MusicGenerateRoute} />
        <Route path={"/upscale"} component={UpscaleRoute} />
        <Route path={"/blog"} component={BlogRoute} />
        <Route path={"/blog/:slug"} component={BlogDetailRoute} />
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
