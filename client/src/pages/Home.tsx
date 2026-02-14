import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import WelcomePopup from "@/components/WelcomePopup";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Play,
  Image,
  Video,
  Wand2,
  Users,
  Zap,
  Camera,
  Film,
  Star,
  Palette,
  Send,
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Suspense, lazy, useRef, useState } from "react";
import MobileHome from "@/components/MobileHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useHomeReveal } from "@/hooks/useHomeReveal";

const HeroThreeBackground = lazy(
  () => import("@/components/home/HeroThreeBackground")
);

// Showcase görselleri - masonry grid için
const SHOWCASE_IMAGES = [
  { src: "/gallery/showcase-1.jpg", aspect: "square" },
  { src: "/gallery/showcase-2.jpg", aspect: "portrait" },
  { src: "/gallery/showcase-3.jpg", aspect: "square" },
  { src: "/gallery/showcase-4.jpg", aspect: "portrait" },
  { src: "/gallery/sample-1.jpg", aspect: "landscape" },
  { src: "/gallery/sample-2.jpg", aspect: "square" },
  { src: "/gallery/sample-3.jpg", aspect: "portrait" },
  { src: "/gallery/sample-4.jpg", aspect: "landscape" },
  { src: "/gallery/sample-5.jpg", aspect: "square" },
  { src: "/gallery/sample-6.jpg", aspect: "portrait" },
  { src: "/gallery/sample-7.jpg", aspect: "landscape" },
  { src: "/gallery/sample-8.jpg", aspect: "square" },
];

// Video showcase
const SHOWCASE_VIDEOS = [
  { src: "/gallery/video-1.mp4", poster: "/gallery/showcase-2.jpg" },
  { src: "/gallery/video-2.mp4", poster: "/gallery/showcase-3.jpg" },
  { src: "/gallery/video-3.mp4", poster: "/gallery/showcase-4.jpg" },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const homeRef = useRef<HTMLDivElement>(null);

  // AI Araçları kategorileri
  const AI_TOOLS = [
    {
      id: "image-gen",
      title: t("home.tools.imageGen"),
      description: t("home.tools.imageGenDesc"),
      icon: Image,
      href: "/generate",
      color: "from-[#7C3AED] to-[#FF2E97]",
      badge: t("home.badge.featured"),
    },
    {
      id: "video-gen",
      title: t("home.tools.videoGen"),
      description: t("home.tools.videoGenDesc"),
      icon: Video,
      href: "/video-generate",
      color: "from-sky-500 to-[#FF2E97]",
      badge: t("home.badge.popular"),
    },
    {
      id: "motion-control",
      title: t("home.tools.motionControl"),
      description: t("home.tools.motionControlDesc"),
      icon: Video,
      href: "/motion-control",
      color: "from-[#00F5FF] to-[#FF2E97]",
      badge: t("home.badge.new"),
    },
    {
      id: "ai-influencer",
      title: t("home.tools.aiInfluencer"),
      description: t("home.tools.aiInfluencerDesc"),
      icon: Users,
      href: "/ai-influencer",
      color: "from-[#00F5FF] to-[#7C3AED]",
      badge: t("home.badge.new"),
    },
    {
      id: "upscale",
      title: t("home.tools.upscale"),
      description: t("home.tools.upscaleDesc"),
      icon: Zap,
      href: "/upscale",
      color: "from-slate-500 to-sky-500",
    },
    {
      id: "multi-angle",
      title: t("home.tools.multiAngle"),
      description: t("home.tools.multiAngleDesc"),
      icon: Camera,
      href: "/multi-angle",
      color: "from-[#7C3AED] to-sky-500",
      badge: t("home.badge.new"),
    },
    {
      id: "product-promo",
      title: t("home.tools.productPromo"),
      description: t("home.tools.productPromoDesc"),
      icon: Film,
      href: "/product-promo",
      color: "from-[#00F5FF] to-[#7C3AED]",
      badge: t("home.badge.new"),
    },
    {
      id: "logo-generator",
      title: t("home.tools.logoGenerator"),
      description: t("home.tools.logoGeneratorDesc"),
      icon: Palette,
      href: "/logo-generator",
      color: "from-sky-500 to-[#7C3AED]",
      badge: t("home.badge.new"),
    },
    {
      id: "prompt-compiler",
      title: t("home.tools.promptMaster"),
      description: t("home.tools.promptMasterDesc"),
      icon: Wand2,
      href: "/prompt-compiler",
      color: "from-[#00F5FF] to-[#7C3AED]",
      badge: t("home.badge.new"),
    },
  ];

  // Topluluk AI karakterlerini getir
  const { data: popularCharacters } = trpc.aiCharacters.getPopular.useQuery(
    { limit: 12 },
    { staleTime: 1000 * 60 * 5 }
  );

  // AI Modelleri getir
  const { data: publicModels } = trpc.settings.getPublicModels.useQuery(
    undefined,
    { staleTime: 1000 * 60 * 10 } // 10 dakika cache
  );

  const handleToolClick = (href: string) => {
    if (isAuthenticated) {
      navigate(href);
    } else {
      window.location.href = getLoginUrl();
    }
  };

  // Yeni kullanıcı kontrolü - createdAt son 5 dakika içindeyse yeni kullanıcıdır
  const isNewUser = user?.createdAt
    ? new Date().getTime() - new Date(user.createdAt).getTime() < 5 * 60 * 1000
    : false;

  useHomeReveal(homeRef, [language]);

  return (
    <>
      <div className="md:hidden">
        <MobileHome />
      </div>

      <div
        ref={homeRef}
        className="ai-page-bg hidden md:block min-h-screen text-slate-100"
      >
        <Header />

        {/* Hoş Geldin Popup - Yeni kullanıcılar için */}
        {isAuthenticated && <WelcomePopup isNewUser={isNewUser} />}

        <main className="pt-20">
          {/* Hero Section */}
          <section className="ai-hero-aurora relative isolate overflow-hidden border-b">
            <Suspense fallback={null}>
              <HeroThreeBackground />
            </Suspense>
            <div className="container relative z-10 py-16 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <div
                    data-reveal
                    className="ai-chip inline-flex items-center gap-2 rounded-full px-4 py-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {t("home.hero.badge")}
                    </span>
                  </div>
                  <h1
                    data-reveal
                    className="max-w-2xl text-5xl font-black leading-tight text-[#F9FAFB] lg:text-6xl"
                  >
                    {t("home.hero.title.prefix")}
                    <span className="ai-headline-gradient">
                      {" "}
                      {t("home.hero.title.suffix")}
                    </span>
                  </h1>
                  <p
                    data-reveal
                    className="max-w-xl text-lg leading-relaxed text-slate-300"
                  >
                    {t("home.heroSubtitle")}
                  </p>
                  <div data-reveal className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="h-12 rounded-full bg-neon-brand px-7 font-bold text-slate-950 hover:bg-neon-brand/90"
                      onClick={() => handleToolClick("/generate")}
                    >
                      {t("home.getStarted")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-full border-slate-300/30 bg-slate-900/30 px-7 text-slate-100 hover:bg-slate-800/40"
                      onClick={() => handleToolClick("/video-generate")}
                    >
                      {t("home.createVideo")}
                    </Button>
                  </div>
                  <div data-reveal className="flex flex-wrap gap-3 pt-2">
                    {[
                      { label: "20+", value: "AI Models" },
                      { label: "4K", value: "Output Quality" },
                      { label: "24/7", value: "Generation" },
                    ].map(item => (
                      <div
                        key={item.value}
                        className="rounded-2xl border border-slate-600/40 bg-slate-900/45 px-4 py-3 backdrop-blur"
                      >
                        <p className="text-xl font-extrabold text-[#F9FAFB]">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-300">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div
                  data-reveal
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-500/25 to-[#FF2E97]/25 blur-3xl" />
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/15 bg-slate-950/50 p-4 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.45)] backdrop-blur-xl">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="aspect-[16/10] w-full rounded-2xl object-cover"
                    >
                      <source src="/gallery/video-3.mp4" type="video/mp4" />
                    </video>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 px-3 py-2 text-xs text-slate-200">
                        {t("home.generateImage")}
                      </div>
                      <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 px-3 py-2 text-xs text-slate-200">
                        {t("home.generateVideo")}
                      </div>
                      <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 px-3 py-2 text-xs text-slate-200">
                        {t("home.tools.promptMaster")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* AI Tools Grid Section */}
          <section className="ai-page-bg py-16">
            <div className="container">
              <div
                data-reveal
                className="mb-8 flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-3xl font-black text-[#F9FAFB]">
                    {t("home.aiTools")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Image, video ve prompt pipeline tek panelde.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="ai-link"
                  onClick={() => navigate("/apps")}
                >
                  {t("home.viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {AI_TOOLS.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    data-reveal
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.45 }}
                    whileHover={{ y: -7, scale: 1.015 }}
                    className="group cursor-pointer"
                    onClick={() => handleToolClick(tool.href)}
                  >
                    <div className="relative h-48 overflow-hidden rounded-2xl border border-slate-200/10 bg-slate-900/45 p-4 backdrop-blur-sm transition-all duration-300 group-hover:border-sky-300/45">
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.color}`}
                      />
                      {tool.badge && (
                        <span className="absolute right-3 top-3 rounded-full bg-neon-brand px-2 py-1 text-[10px] font-bold text-black">
                          {tool.badge}
                        </span>
                      )}
                      <tool.icon className="h-9 w-9 text-sky-300" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="mb-1 text-sm font-bold text-[#F9FAFB]">
                          {tool.title}
                        </h3>
                        <p className="line-clamp-2 text-xs text-slate-300">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* AI Models Section - Image & Video Models */}
          {publicModels &&
            (publicModels.imageModels.length > 0 ||
              publicModels.videoModels.length > 0) && (
              <section className="ai-section-muted py-16">
                <div className="container">
                  {/* Image Generation Models */}
                  {publicModels.imageModels.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-neon-brand">
                          {t("home.imageGenModels")}
                        </h2>
                        <Button
                          variant="ghost"
                          className="text-[#F9FAFB] hover:text-neon-brand"
                          onClick={() => navigate("/generate")}
                        >
                          {t("home.generateImage")}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publicModels.imageModels.map((model, index) => (
                          <motion.div
                            key={model.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group cursor-pointer"
                            onClick={() =>
                              handleToolClick(
                                `/generate?model=${model.modelKey}`
                              )
                            }
                          >
                            <div className="ai-model-surface-image relative h-64 rounded-2xl overflow-hidden border border-white/10">
                              {model.coverImageDesktop && (
                                <img
                                  src={model.coverImageDesktop}
                                  alt={model.modelName}
                                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-5 h-5 text-neon-brand" />
                                  <h3 className="text-xl font-bold text-[#F9FAFB]">
                                    {model.modelName}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-300 mb-2">
                                  {model.provider}
                                </p>
                                {model.coverDescription && (
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {model.coverDescription}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Generation Models */}
                  {publicModels.videoModels.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-neon-brand">
                          {t("home.videoGenModels")}
                        </h2>
                        <Button
                          variant="ghost"
                          className="text-[#F9FAFB] hover:text-neon-brand"
                          onClick={() => navigate("/video-generate")}
                        >
                          {t("home.generateVideo")}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publicModels.videoModels.map((model, index) => (
                          <motion.div
                            key={model.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group cursor-pointer"
                            onClick={() =>
                              handleToolClick(
                                `/video-generate?model=${model.modelKey}`
                              )
                            }
                          >
                            <div className="ai-model-surface-video relative h-64 rounded-2xl overflow-hidden border border-white/10">
                              {model.coverImageDesktop && (
                                <img
                                  src={model.coverImageDesktop}
                                  alt={model.modelName}
                                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <Play className="w-5 h-5 text-neon-brand" />
                                  <h3 className="text-xl font-bold text-[#F9FAFB]">
                                    {model.modelName}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-300 mb-2">
                                  {model.provider}
                                </p>
                                {model.coverDescription && (
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {model.coverDescription}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Showcase Gallery - Masonry Grid */}
          <section className="ai-section-soft py-16">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-neon-brand">
                  {t("home.createdWithAi")}
                </h2>
                <Button
                  variant="ghost"
                  className="text-[#F9FAFB] hover:text-neon-brand"
                  onClick={() => navigate("/gallery")}
                >
                  {t("home.gallery")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Masonry Grid */}
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {SHOWCASE_IMAGES.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="break-inside-avoid group cursor-pointer"
                    onClick={() => handleToolClick("/generate")}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-white/5">
                      <img
                        src={img.src}
                        alt={`AI Generated ${index + 1}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[#F9FAFB] text-xs font-medium">
                            AI Generated
                          </span>
                          <Wand2 className="w-4 h-4 text-neon-brand" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Video Showcase Section */}
          <section className="ai-section-soft py-16">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-neon-brand">
                  {t("home.aiVideoGallery")}
                </h2>
                <Button
                  variant="ghost"
                  className="text-[#F9FAFB] hover:text-neon-brand"
                  onClick={() => navigate("/video-generate")}
                >
                  {t("home.createVideo")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SHOWCASE_VIDEOS.map((video, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() =>
                      setPlayingVideo(playingVideo === index ? null : index)
                    }
                  >
                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5">
                      <video
                        src={video.src}
                        poster={video.poster}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay={playingVideo === index}
                      />
                      {playingVideo !== index && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-neon-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-black ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="text-[#F9FAFB] text-sm font-medium">
                          {t("home.aiVideoItem")} #{index + 1}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Viral Apps Section */}
          {/* <section className="py-16 bg-neon-brand">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-black">
                {t("home.viralAppsTitle")}
              </h2>
              <Button
                variant="ghost"
                className="text-black hover:bg-black/10"
                onClick={() => navigate("/apps")}
              >
                {t("home.viewAll")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {VIRAL_APPS.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                  onClick={() => handleToolClick(`/apps?app=${app.id}`)}
                >
                  <div className="relative bg-[#0B0F19] rounded-xl p-4 text-center hover:bg-black/80 transition-colors">
                    {app.hot && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-[#F9FAFB]">
                        HOT
                      </span>
                    )}
                    <span className="text-3xl mb-2 block">{app.icon}</span>
                    <span className="text-[#F9FAFB] text-xs font-medium">{app.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

          {/* Community Characters Section */}
          <section className="ai-section-soft py-16">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-neon-brand mb-2 flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    {t("home.communityGallery")}
                  </h2>
                  <p className="text-gray-400">{t("home.communityDesc")}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-neon-brand text-neon-brand hover:bg-neon-brand hover:text-black"
                  onClick={() => navigate("/community-characters")}
                >
                  {t("home.viewAll")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="columns-2 md:columns-4 lg:columns-6 gap-4 space-y-4">
                {popularCharacters && popularCharacters.length > 0
                  ? popularCharacters.map((character, index) => (
                      <motion.div
                        key={character.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="break-inside-avoid group cursor-pointer"
                        onClick={() => navigate("/community-characters")}
                      >
                        <div className="relative rounded-xl overflow-hidden bg-white/5">
                          <img
                            src={character.characterImageUrl}
                            alt={character.name}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-[#F9FAFB] font-semibold text-sm truncate">
                                {character.name}
                              </p>
                              {character.userName && (
                                <p className="text-gray-300 text-xs truncate">
                                  @{character.userName}
                                </p>
                              )}
                              {character.usageCount > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 text-neon-brand" />
                                  <span className="text-neon-brand text-xs">
                                    {character.usageCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  : Array.from({ length: 12 }).map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="break-inside-avoid group cursor-pointer"
                        onClick={() => navigate("/ai-influencer")}
                      >
                        <div className="ai-model-surface-image relative rounded-xl overflow-hidden aspect-[3/4]">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Sparkles className="w-8 h-8 text-white/20" />
                            <span className="text-white/30 text-xs text-center px-2">
                              {t("home.beTheFirst")}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="py-20 bg-neon-brand">
            <div className="container text-center">
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                {t("home.cta.title")}
              </h2>
              <p className="text-lg text-black/70 mb-8 max-w-2xl mx-auto">
                {t("home.cta.desc")}
              </p>
              <Button
                size="lg"
                className="h-16 px-12 text-xl font-black rounded-full bg-[#0B0F19] text-neon-brand hover:bg-black/90"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/generate")
                    : (window.location.href = getLoginUrl())
                }
              >
                {t("home.cta.button")}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-[#0B0F19] border-t border-white/10 py-12">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Logo & Description */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src="/Logo-02.png"
                      alt="Amonify"
                      className="h-8 w-auto"
                    />
                    <span className="text-xl font-bold">Amonify</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t("footer.description")}
                  </p>
                  {/* Social Links */}
                  <div className="flex gap-3">
                    <a
                      href="https://t.me/nanoinfluencer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00F5FF] transition-colors"
                      title={t("footer.telegram")}
                    >
                      <Send className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold mb-4">
                    {t("footer.quickLinks")}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <a
                        href="/generate"
                        className="hover:text-neon-brand transition-colors"
                      >
                        {t("home.generateImage")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/video-generate"
                        className="hover:text-neon-brand transition-colors"
                      >
                        {t("home.generateVideo")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/ai-influencer"
                        className="hover:text-neon-brand transition-colors"
                      >
                        AI Influencer
                      </a>
                    </li>
                    <li>
                      <a
                        href="/gallery"
                        className="hover:text-neon-brand transition-colors"
                      >
                        {t("home.gallery")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/packages"
                        className="hover:text-neon-brand transition-colors"
                      >
                        {t("nav.packages")}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact & Telegram */}
                <div>
                  <h4 className="font-semibold mb-4">{t("footer.contact")}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <a
                        href="/blog"
                        className="hover:text-neon-brand transition-colors"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://t.me/nanoinfluencer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-neon-brand transition-colors flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {t("footer.telegram")}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Amonify. {t("footer.rights")}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <a
                    href="#"
                    className="hover:text-neon-brand transition-colors"
                  >
                    {t("footer.privacy")}
                  </a>
                  <a
                    href="#"
                    className="hover:text-neon-brand transition-colors"
                  >
                    {t("footer.terms")}
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
