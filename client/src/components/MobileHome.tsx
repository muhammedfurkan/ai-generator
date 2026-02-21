import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import WelcomePopup from "@/components/WelcomePopup";
import {
  ArrowRight,
  ChevronRight,
  Play,
  Users,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import OptimizedImage from "@/components/OptimizedImage";
import { MobileMenu } from "@/components/MobileMenu";
import { useWebUiConfig } from "@/hooks/useWebUiConfig";
import { getOrderMap, orderByIds } from "@/lib/webUiConfig";

// Banner slides for horizontal scroll
const BANNERS = [
  {
    id: "ai-influencer",
    title: "YENİ ÖZELLİK",
    subtitle: "AI Influencer",
    description: "Kendi AI karakterinizi oluşturun",
    image: "/covers/ai-influencer.jpg",
    badge: "NEW",
    badgeColor: "bg-green-500",
    path: "/ai-influencer",
    featureKey: "ai_influencer_enabled",
  },
  {
    id: "motion-control",
    title: "MOTION CONTROL",
    subtitle: "Hareket Transferi",
    description: "Gerçek insan hareketlerini karakterlere aktar",
    image: "/covers/motion-control.jpg",
    badge: "NEW",
    badgeColor: "bg-yellow-500",
    path: "/motion-control",
    featureKey: "video_generation_enabled",
  },
  {
    id: "ugc-ad",
    title: "UGC REKLAM",
    subtitle: "AI Video",
    description: "TikTok/Instagram için gerçekçi reklamlar",
    image: "/covers/ugc-ad.jpg",
    badge: "NEW",
    badgeColor: "bg-orange-500",
    path: "/ugc-ad",
    featureKey: "video_generation_enabled",
  },
  {
    id: "product-promo",
    title: "ÜRÜN TANITIM",
    subtitle: "Promo Video",
    description: "E-ticaret için profesyonel videolar",
    image: "/covers/product-promo.jpg",
    badge: "NEW",
    badgeColor: "bg-[#7C3AED]",
    path: "/product-promo",
    featureKey: "video_generation_enabled",
  },
  // {
  //   id: 5,
  //   title: "VİRAL VİDEOLAR",
  //   subtitle: "Tek Tıkla",
  //   description: "Sarılma, öpücük, dans videoları",
  //   image: "/covers/viral-apps.jpg",
  //   badge: "HOT",
  //   badgeColor: "bg-red-500",
  //   path: "/apps",
  // },
  {
    id: "upscale",
    title: "GÖRSEL UPSCALE",
    subtitle: "8K Kalite",
    description: "Topaz AI ile görsel yükseltme",
    image: "/covers/upscale.jpg",
    badge: "NEW",
    badgeColor: "bg-green-500",
    path: "/upscale",
    featureKey: "upscale_enabled",
  },
  {
    id: "prompt-compiler",
    title: "PROMPT USTASI",
    subtitle: "TR → EN",
    description: "Türkçe yaz, profesyonel prompt al",
    image: "/covers/prompt-compiler.jpg",
    badge: "YENİ",
    badgeColor: "bg-neon-brand",
    path: "/prompt-compiler",
    featureKey: "image_generation_enabled",
  },
  {
    id: "skin-enhancement",
    title: "CİLT İYİLEŞTİRME",
    subtitle: "Doğal Görünüm",
    description: "Profesyonel cilt düzeltme",
    image: "/covers/skin-enhancement.jpg",
    badge: "YENİ",
    badgeColor: "bg-[#FF2E97]",
    path: "/skin-enhancement",
    featureKey: "image_generation_enabled",
  },
];

// AI Tools with colors matching desktop
const AI_TOOLS = [
  {
    id: "generate",
    title: "AI GÖRSEL",
    description: "Nano Banana Pro",
    icon: "🎨",
    badge: "ÖNE ÇIKAN",
    badgeColor: "bg-green-500",
    bgColor: "bg-gradient-to-br from-[#7C3AED] to-[#FF2E97]",
    path: "/generate",
    featureKey: "image_generation_enabled",
  },
  {
    id: "video",
    title: "AI VİDEO",
    description: "Veo 3.1, Sora 2, Kling",
    icon: "🎬",
    badge: "POPÜLER",
    badgeColor: "bg-sky-500",
    bgColor: "bg-gradient-to-br from-sky-500 to-[#FF2E97]",
    path: "/video-generate",
    featureKey: "video_generation_enabled",
  },
  {
    id: "motion-control",
    title: "MOTION CONTROL",
    description: "Hareket transferi",
    icon: "🎭",
    badge: "YENİ",
    badgeColor: "bg-yellow-500",
    bgColor: "bg-gradient-to-br from-[#00F5FF] to-[#FF2E97]",
    path: "/motion-control",
    featureKey: "video_generation_enabled",
  },
  {
    id: "influencer",
    title: "AI INFLUENCER",
    description: "Kendi karakterinizi oluşturun",
    icon: "👤",
    badge: "YENİ",
    badgeColor: "bg-green-500",
    bgColor: "bg-gradient-to-br from-[#00F5FF] to-[#7C3AED]",
    path: "/ai-influencer",
    featureKey: "ai_influencer_enabled",
  },
  {
    id: "upscale",
    title: "UPSCALE",
    description: "8K'ya yükselt",
    icon: "⚡",
    bgColor: "bg-gradient-to-br from-slate-500 to-sky-500",
    path: "/upscale",
    featureKey: "upscale_enabled",
  },
  {
    id: "multi-angle",
    title: "ÇOKLU AÇI",
    description: "4-8 farklı açı",
    icon: "📸",
    badge: "YENİ",
    badgeColor: "bg-green-500",
    bgColor: "bg-gradient-to-br from-[#7C3AED] to-sky-500",
    path: "/multi-angle",
  },
  {
    id: "product-promo",
    title: "ÜRÜN TANITIM",
    description: "E-ticaret promo",
    icon: "🛍️",
    badge: "YENİ",
    badgeColor: "bg-green-500",
    bgColor: "bg-gradient-to-br from-[#00F5FF] to-[#7C3AED]",
    path: "/product-promo",
  },
  {
    id: "logo-generator",
    title: "LOGO YAPICI",
    description: "Profesyonel logolar",
    icon: "✨",
    badge: "YENİ",
    badgeColor: "bg-yellow-500",
    bgColor: "bg-gradient-to-br from-sky-500 to-[#7C3AED]",
    path: "/logo-generator",
  },
  {
    id: "skin-enhancement",
    title: "CİLT İYİLEŞTİRME",
    description: "Doğal cilt düzeltme",
    icon: "💆",
    badge: "YENİ",
    badgeColor: "bg-[#FF2E97]",
    bgColor: "bg-gradient-to-br from-[#00F5FF] to-[#7C3AED]",
    path: "/skin-enhancement",
  },
];

// Viral Apps
const VIRAL_APPS = [
  { id: "hug", emoji: "🤗", name: "Sarılma", hot: true },
  { id: "kiss", emoji: "💋", name: "Öpücük", hot: true },
  { id: "dance", emoji: "💃", name: "Dans", hot: true },
  { id: "talk", emoji: "🗣️", name: "Konuşan Foto", hot: false },
  { id: "age", emoji: "⏳", name: "Yaş Dönüşümü", hot: true },
  { id: "style", emoji: "🎨", name: "Sanat Stili", hot: false },
  { id: "hair", emoji: "💨", name: "Saç Uçuşması", hot: true },
  { id: "smile", emoji: "😊", name: "Gülümseme", hot: true },
];

export default function MobileHome() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { webUiConfig, getSetting, featureFlags } = useWebUiConfig();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Yeni kullanıcı kontrolü - createdAt son 5 dakika içindeyse yeni kullanıcıdır
  const isNewUser = user?.createdAt
    ? new Date().getTime() - new Date(user.createdAt).getTime() < 5 * 60 * 1000
    : false;
  const [, navigate] = useLocation();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Fetch showcase images and videos
  const { data: showcaseImages = [] } =
    trpc.settings.getShowcaseImages.useQuery();
  const { data: showcaseVideos = [] } =
    trpc.settings.getShowcaseVideos.useQuery();

  // Fetch community characters
  const { data: communityCharacters } = trpc.aiCharacters.getPopular.useQuery(
    { limit: 8 },
    { enabled: true }
  );

  // Fetch AI models with cover images
  const { data: publicModels } = trpc.settings.getPublicModels.useQuery(
    undefined,
    { staleTime: 1000 * 60 * 10 }
  );

  const orderedBanners = useMemo(
    () =>
      orderByIds(
        BANNERS.filter(
          banner =>
            !banner.featureKey ||
            featureFlags[banner.featureKey as keyof typeof featureFlags]
        ),
        webUiConfig.home.mobileBannerOrder
      ),
    [featureFlags, webUiConfig.home.mobileBannerOrder]
  );
  const orderedTools = useMemo(
    () =>
      orderByIds(
        AI_TOOLS.filter(
          tool =>
            !tool.featureKey ||
            featureFlags[tool.featureKey as keyof typeof featureFlags]
        ),
        webUiConfig.home.mobileToolOrder
      ),
    [featureFlags, webUiConfig.home.mobileToolOrder]
  );
  const sectionOrderMap = useMemo(
    () => getOrderMap(webUiConfig.home.sectionOrder),
    [webUiConfig.home.sectionOrder]
  );
  const sectionVisibility = webUiConfig.home.sectionVisibility;

  const mobileLogoUrl = getSetting("site_logo_url", "/Logo-02.png");
  const siteName = getSetting("site_name", "Lumiohan");

  const fallbackGeneratePath = featureFlags.image_generation_enabled
    ? "/generate"
    : featureFlags.video_generation_enabled
      ? "/video-generate"
      : featureFlags.ai_influencer_enabled
        ? "/ai-influencer"
        : featureFlags.upscale_enabled
          ? "/upscale"
          : "/packages";

  const isPathEnabled = useCallback(
    (path: string) => {
      if (path.startsWith("/generate"))
        return featureFlags.image_generation_enabled;
      if (path.startsWith("/video-generate"))
        return featureFlags.video_generation_enabled;
      if (path.startsWith("/motion-control"))
        return featureFlags.video_generation_enabled;
      if (path.startsWith("/ai-influencer"))
        return featureFlags.ai_influencer_enabled;
      if (path.startsWith("/upscale")) return featureFlags.upscale_enabled;
      if (path.startsWith("/gallery")) return featureFlags.gallery_enabled;
      if (path.startsWith("/blog")) return featureFlags.blog_enabled;
      if (path.startsWith("/community-characters"))
        return featureFlags.community_enabled;
      return true;
    },
    [featureFlags]
  );

  // Auto-scroll banners - pause when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) return; // Don't run interval when menu is open
    if (orderedBanners.length === 0) return;

    const interval = setInterval(() => {
      if (bannerRef.current) {
        setActiveSlide(prev => {
          const nextSlide = (prev + 1) % orderedBanners.length;
          bannerRef.current?.scrollTo({
            left: nextSlide * (bannerRef.current.offsetWidth - 40),
            behavior: "smooth",
          });
          return nextSlide;
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isMobileMenuOpen, orderedBanners.length]);

  // Memoized handlers
  const handleNavigation = useCallback(
    (path: string) => {
      const nextPath = isPathEnabled(path) ? path : fallbackGeneratePath;
      if (isAuthenticated) {
        navigate(nextPath);
      } else {
        window.location.href = getLoginUrl();
      }
    },
    [fallbackGeneratePath, isAuthenticated, isPathEnabled, navigate]
  );

  const toggleMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="ai-page-bg min-h-screen pb-24">
      {/* Hoş Geldin Popup - Yeni kullanıcılar için */}
      {isAuthenticated && <WelcomePopup isNewUser={isNewUser} />}
      {/* Mobile Header */}
      <div className="ai-page-bg sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <img src={mobileLogoUrl} alt={siteName} className="h-10" />
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                isAuthenticated
                  ? navigate("/packages")
                  : (window.location.href = getLoginUrl())
              }
              className="px-3 py-1.5 bg-neon-brand text-black text-sm font-bold rounded-full"
            >
              {t("common.buyCredits")}
            </button>
            {isAuthenticated && <NotificationBell />}
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg active:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#F9FAFB]" />
              ) : (
                <Menu className="w-6 h-6 text-[#F9FAFB]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Extracted component */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMenu} />
      </div>

      {/* Hero Banner Slider - Mobil görünümde gizlendi */}
      <div className="pt-4 px-4">
        <div
          ref={bannerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {orderedBanners.map(banner => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-[85%] snap-center"
              onClick={() => handleNavigation(banner.path)}
            >
              <div className="relative h-44 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full"
                  placeholderColor="#111827"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 ${banner.badgeColor} text-[#F9FAFB] text-[10px] font-bold rounded`}
                  >
                    {banner.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">
                    {banner.title}
                  </div>
                  <div className="text-lg font-bold text-[#F9FAFB]">
                    {banner.subtitle}
                  </div>
                  <div className="text-xs text-white/70">
                    {banner.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {orderedBanners.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === activeSlide ? "w-4 bg-neon-brand" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {/* AI Tools Section */}
        {sectionVisibility["ai-tools"] && (
          <div
            className="pt-4 px-4"
            style={{ order: sectionOrderMap.get("ai-tools") ?? 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-neon-brand">
                {t("home.aiTools")}
              </h2>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openCreateModal"))
                }
                className="flex items-center gap-1 text-xs text-white/60"
              >
                {t("common.viewAll")} <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {orderedTools.map(tool => (
                <div
                  key={tool.id}
                  onClick={() => handleNavigation(tool.path)}
                  className={`relative rounded-xl p-3 ${tool.bgColor} active:opacity-80`}
                >
                  {tool.badge && (
                    <span
                      className={`absolute top-1 right-1 px-1.5 py-0.5 ${tool.badgeColor} text-[#F9FAFB] text-[8px] font-bold rounded`}
                    >
                      {tool.badge}
                    </span>
                  )}
                  <div className="text-2xl mb-1">{tool.icon}</div>
                  <div className="text-[10px] font-bold text-[#F9FAFB] leading-tight">
                    {tool.title}
                  </div>
                  <div className="text-[8px] text-white/70 truncate">
                    {tool.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Models Section - Image & Video Models */}
        {sectionVisibility.models &&
          publicModels &&
          (publicModels.imageModels.length > 0 ||
            publicModels.videoModels.length > 0) && (
            <div
              className="mt-8 px-4"
              style={{ order: sectionOrderMap.get("models") ?? 1 }}
            >
              {/* Image Generation Models */}
              {publicModels.imageModels.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-neon-brand">
                      {t("home.imageGenModels")}
                    </h2>
                    <button
                      onClick={() => handleNavigation("/generate")}
                      className="flex items-center gap-1 text-xs text-white/60"
                    >
                      {t("common.generate")}{" "}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {publicModels.imageModels.map(model => (
                      <div
                        key={model.id}
                        onClick={() => handleNavigation("/generate")}
                        className="flex-shrink-0 w-40 rounded-xl overflow-hidden relative active:opacity-80"
                      >
                        <div className="ai-model-surface-image aspect-[3/4] relative">
                          {model.coverImageMobile || model.coverImageDesktop ? (
                            <img
                              src={
                                model.coverImageMobile ||
                                model.coverImageDesktop ||
                                ""
                              }
                              alt={model.modelName}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Sparkles className="h-3 w-3 text-neon-brand" />
                              <div className="text-xs font-bold text-[#F9FAFB] truncate">
                                {model.modelName}
                              </div>
                            </div>
                            <div className="text-[9px] text-white/60 truncate">
                              {model.provider}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Generation Models */}
              {publicModels.videoModels.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-neon-brand">
                      {t("home.videoGenModels")}
                    </h2>
                    <button
                      onClick={() => handleNavigation("/video-generate")}
                      className="flex items-center gap-1 text-xs text-white/60"
                    >
                      {t("common.generate")}{" "}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {publicModels.videoModels.map(model => (
                      <div
                        key={model.id}
                        onClick={() => handleNavigation("/video-generate")}
                        className="flex-shrink-0 w-40 rounded-xl overflow-hidden relative active:opacity-80"
                      >
                        <div className="ai-model-surface-video aspect-[3/4] relative">
                          {model.coverImageMobile || model.coverImageDesktop ? (
                            <img
                              src={
                                model.coverImageMobile ||
                                model.coverImageDesktop ||
                                ""
                              }
                              alt={model.modelName}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Play className="h-3 w-3 text-neon-brand" />
                              <div className="text-xs font-bold text-[#F9FAFB] truncate">
                                {model.modelName}
                              </div>
                            </div>
                            <div className="text-[9px] text-white/60 truncate">
                              {model.provider}
                            </div>
                            {model.coverDescription && (
                              <div className="text-[9px] text-white/50 line-clamp-2 mt-0.5">
                                {model.coverDescription}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* AI Gallery Section - Masonry */}
        {sectionVisibility.images && featureFlags.gallery_enabled && (
          <div
            className="mt-8 px-4"
            style={{ order: sectionOrderMap.get("images") ?? 2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-neon-brand">
                {t("home.createdWithAi")}
              </h2>
              <button
                onClick={() => navigate("/gallery")}
                className="flex items-center gap-1 text-xs text-white/60"
              >
                {t("nav.gallery")} <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Masonry Grid - 2 columns */}
            <div className="columns-2 gap-2 space-y-2">
              {showcaseImages.length > 0 ? (
                showcaseImages.slice(0, 8).map((img, i) => (
                  <div
                    key={img.id}
                    className={`break-inside-avoid rounded-xl overflow-hidden ${
                      i % 3 === 0
                        ? "aspect-[3/4]"
                        : i % 3 === 1
                          ? "aspect-square"
                          : "aspect-[4/5]"
                    }`}
                  >
                    <OptimizedImage
                      src={img.thumbnailUrl || img.imageUrl}
                      alt={img.title || `AI Generated ${i + 1}`}
                      className="w-full h-full"
                      placeholderColor="#111827"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-white/50 py-8">
                  {t("home.noImages")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Gallery Section */}
        {sectionVisibility.videos && featureFlags.video_generation_enabled && (
          <div
            className="mt-8 px-4"
            style={{ order: sectionOrderMap.get("videos") ?? 3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-neon-brand">
                {t("home.aiVideoGallery")}
              </h2>
              <button
                onClick={() => navigate("/video-generate")}
                className="flex items-center gap-1 text-xs text-white/60"
              >
                {t("home.createVideo")} <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {showcaseVideos.length > 0 ? (
                showcaseVideos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => handleNavigation("/video-generate")}
                    className="flex-shrink-0 w-32 rounded-xl overflow-hidden relative active:opacity-80"
                  >
                    <div className="aspect-[9/16] relative">
                      <OptimizedImage
                        src={video.posterUrl || "/gallery/placeholder.jpg"}
                        alt={video.title || "AI Video"}
                        className="w-full h-full"
                        placeholderColor="#111827"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-neon-brand rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-[10px] font-medium text-[#F9FAFB]">
                          {video.title || "AI Video"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-white/50 py-8">
                  {t("home.noVideos")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Viral Apps Section - Lime Green */}
        {/* <div className="mt-8 bg-neon-brand py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">VİRAL VİDEO UYGULAMALARI</h2>
          <button
            onClick={() => navigate("/apps")}
            className="flex items-center gap-1 text-xs text-black/60"
          >
            Tümünü Gör <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {VIRAL_APPS.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate("/apps")}
              className="flex-shrink-0 w-20 bg-[#0B0F19] rounded-xl p-3 text-center active:scale-95 transition-transform"
            >
              {app.hot && (
                <span className="text-[8px] font-bold text-red-500 block mb-1">HOT</span>
              )}
              <div className="text-2xl mb-1">{app.emoji}</div>
              <div className="text-[10px] font-medium text-[#F9FAFB]">{app.name}</div>
            </div>
          ))}
        </div>
      </div> */}

        {/* Community Gallery Section */}
        {sectionVisibility.community && featureFlags.community_enabled && (
          <div
            className="mt-8 px-4"
            style={{ order: sectionOrderMap.get("community") ?? 4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-neon-brand" />
                <h2 className="text-lg font-bold text-neon-brand">
                  {t("home.communityGallery")}
                </h2>
              </div>
              <button
                onClick={() => navigate("/community-characters")}
                className="flex items-center gap-1 text-xs text-white/60"
              >
                {t("common.viewAll")} <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Community Characters - Masonry */}
            <div className="columns-2 gap-2 space-y-2">
              {communityCharacters?.slice(0, 6).map(
                (
                  char: {
                    id: number;
                    name: string;
                    characterImageUrl: string;
                    userName: string | null;
                  },
                  i: number
                ) => (
                  <div
                    key={char.id}
                    onClick={() => navigate("/community-characters")}
                    className={`break-inside-avoid rounded-xl overflow-hidden relative group ${
                      i % 2 === 0 ? "aspect-[3/4]" : "aspect-square"
                    }`}
                  >
                    <OptimizedImage
                      src={char.characterImageUrl}
                      alt={char.name}
                      className="w-full h-full"
                      placeholderColor="#111827"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-xs font-bold text-[#F9FAFB] truncate">
                        {char.name}
                      </div>
                      <div className="text-[10px] text-white/60">
                        @{char.userName}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* CTA Section - Lime Green */}
        {sectionVisibility.cta && (
          <div
            className="mt-8 bg-neon-brand py-8 px-4 text-center"
            style={{ order: sectionOrderMap.get("cta") ?? 5 }}
          >
            <h2 className="text-2xl font-black text-black mb-2">
              {t("home.cta.title")}
            </h2>
            <p className="text-sm text-black/70 mb-4">{t("home.cta.desc")}</p>
            <button
              onClick={() =>
                isAuthenticated
                  ? navigate("/generate")
                  : (window.location.href = getLoginUrl())
              }
              className="px-8 py-3 bg-[#0B0F19] text-neon-brand font-bold rounded-xl flex items-center justify-center gap-2 mx-auto active:opacity-80"
            >
              {t("home.cta.button")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
