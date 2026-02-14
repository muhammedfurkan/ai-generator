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
import { useState, useEffect, useRef } from "react";
import MobileHome from "@/components/MobileHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

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

  // AI Araçları kategorileri
  const AI_TOOLS = [
    {
      id: "image-gen",
      title: t("home.tools.imageGen"),
      description: t("home.tools.imageGenDesc"),
      icon: Image,
      href: "/generate",
      color: "from-purple-500 to-pink-500",
      badge: t("home.badge.featured"),
    },
    {
      id: "video-gen",
      title: t("home.tools.videoGen"),
      description: t("home.tools.videoGenDesc"),
      icon: Video,
      href: "/video-generate",
      color: "from-blue-500 to-cyan-500",
      badge: t("home.badge.popular"),
    },
    {
      id: "motion-control",
      title: t("home.tools.motionControl"),
      description: t("home.tools.motionControlDesc"),
      icon: Video,
      href: "/motion-control",
      color: "from-purple-600 to-pink-600",
      badge: t("home.badge.new"),
    },
    {
      id: "ai-influencer",
      title: t("home.tools.aiInfluencer"),
      description: t("home.tools.aiInfluencerDesc"),
      icon: Users,
      href: "/ai-influencer",
      color: "from-rose-500 to-orange-500",
      badge: t("home.badge.new"),
    },
    {
      id: "upscale",
      title: t("home.tools.upscale"),
      description: t("home.tools.upscaleDesc"),
      icon: Zap,
      href: "/upscale",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "multi-angle",
      title: t("home.tools.multiAngle"),
      description: t("home.tools.multiAngleDesc"),
      icon: Camera,
      href: "/multi-angle",
      color: "from-amber-500 to-yellow-500",
      badge: t("home.badge.new"),
    },
    {
      id: "product-promo",
      title: t("home.tools.productPromo"),
      description: t("home.tools.productPromoDesc"),
      icon: Film,
      href: "/product-promo",
      color: "from-fuchsia-500 to-pink-500",
      badge: t("home.badge.new"),
    },
    {
      id: "logo-generator",
      title: t("home.tools.logoGenerator"),
      description: t("home.tools.logoGeneratorDesc"),
      icon: Palette,
      href: "/logo-generator",
      color: "from-yellow-500 to-lime-500",
      badge: t("home.badge.new"),
    },
    {
      id: "prompt-compiler",
      title: t("home.tools.promptMaster"),
      description: t("home.tools.promptMasterDesc"),
      icon: Wand2,
      href: "/prompt-compiler",
      color: "from-[#CCFF00] to-green-500",
      badge: t("home.badge.new"),
    },
  ];

  // Viral uygulamalar
  const VIRAL_APPS = [
    { id: "hug-video", title: t("home.viralApps.hug"), icon: "🤗", hot: true },
    {
      id: "kiss-video",
      title: t("home.viralApps.kiss"),
      icon: "💋",
      hot: true,
    },
    {
      id: "dance-video",
      title: t("home.viralApps.dance"),
      icon: "💃",
      hot: true,
    },
    {
      id: "talking-photo",
      title: t("home.viralApps.talkingPhoto"),
      icon: "🗣️",
    },
    {
      id: "age-transform",
      title: t("home.viralApps.ageTransform"),
      icon: "⏳",
      hot: true,
    },
    { id: "style-transfer", title: t("home.viralApps.artStyle"), icon: "🎨" },
    {
      id: "hair-blow",
      title: t("home.viralApps.hairBlow"),
      icon: "💨",
      hot: true,
    },
    {
      id: "smile-video",
      title: t("home.viralApps.smile"),
      icon: "😊",
      hot: true,
    },
    { id: "wink-video", title: t("home.viralApps.wink"), icon: "😉" },
    { id: "zoom-effect", title: t("home.viralApps.dramaticZoom"), icon: "🔍" },
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

  return (
    <>
      <div className="md:hidden">
        <MobileHome />
      </div>

      <div className="hidden md:block min-h-screen bg-[#0A0A0A]">
        <Header />

        {/* Hoş Geldin Popup - Yeni kullanıcılar için */}
        {isAuthenticated && <WelcomePopup isNewUser={isNewUser} />}

        <main className="pt-20">
          {/* Hero Section - Video Banner */}
          <section className="relative h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10" />
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src="/gallery/video-3.mp4" type="video/mp4" />
            </video>
            <div className="relative z-20 container h-full flex items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/30 mb-6">
                  <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                  <span className="text-[#CCFF00] text-sm font-medium">
                    {t("home.hero.badge")}
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                  {t("home.hero.title.prefix")}
                  <span className="text-[#CCFF00]">
                    {t("home.hero.title.suffix")}
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  {t("home.heroSubtitle")}
                </p>
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg font-bold rounded-full bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90"
                    onClick={() => handleToolClick("/generate")}
                  >
                    {t("home.getStarted")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  {/* <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold rounded-full border-white/30 text-white hover:bg-white/10"
                  onClick={() => navigate("/apps")}
                >
                  {t("home.exploreTools")}
                </Button> */}
                </div>
              </div>
            </div>
          </section>

          {/* AI Tools Grid Section */}
          <section className="py-16 bg-[#0A0A0A]">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#CCFF00]">
                  {t("home.aiTools")}
                </h2>
                <Button
                  variant="ghost"
                  className="text-white hover:text-[#CCFF00]"
                  onClick={() => navigate("/apps")}
                >
                  {t("home.viewAll")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {AI_TOOLS.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => handleToolClick(tool.href)}
                  >
                    <div
                      className={`relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br ${tool.color} p-4 flex flex-col justify-between`}
                    >
                      {tool.badge && (
                        <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold rounded-full bg-[#CCFF00] text-black">
                          {tool.badge}
                        </span>
                      )}
                      <tool.icon className="w-10 h-10 text-white/80" />
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-white/70 line-clamp-2">
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
              <section className="py-16 bg-[#0F0F0F]">
                <div className="container">
                  {/* Image Generation Models */}
                  {publicModels.imageModels.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-[#CCFF00]">
                          {t("home.imageGenModels")}
                        </h2>
                        <Button
                          variant="ghost"
                          className="text-white hover:text-[#CCFF00]"
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
                            <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-white/10">
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
                                  <Sparkles className="w-5 h-5 text-[#CCFF00]" />
                                  <h3 className="text-xl font-bold text-white">
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
                        <h2 className="text-3xl font-black text-[#CCFF00]">
                          {t("home.videoGenModels")}
                        </h2>
                        <Button
                          variant="ghost"
                          className="text-white hover:text-[#CCFF00]"
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
                            <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-white/10">
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
                                  <Play className="w-5 h-5 text-[#CCFF00]" />
                                  <h3 className="text-xl font-bold text-white">
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
          <section className="py-16 bg-[#111]">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#CCFF00]">
                  {t("home.createdWithAi")}
                </h2>
                <Button
                  variant="ghost"
                  className="text-white hover:text-[#CCFF00]"
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
                          <span className="text-white text-xs font-medium">
                            AI Generated
                          </span>
                          <Wand2 className="w-4 h-4 text-[#CCFF00]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Video Showcase Section */}
          <section className="py-16 bg-[#0A0A0A]">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#CCFF00]">
                  {t("home.aiVideoGallery")}
                </h2>
                <Button
                  variant="ghost"
                  className="text-white hover:text-[#CCFF00]"
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
                          <div className="w-16 h-16 rounded-full bg-[#CCFF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-black ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="text-white text-sm font-medium">
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
          {/* <section className="py-16 bg-[#CCFF00]">
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
                  <div className="relative bg-black rounded-xl p-4 text-center hover:bg-black/80 transition-colors">
                    {app.hot && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                        HOT
                      </span>
                    )}
                    <span className="text-3xl mb-2 block">{app.icon}</span>
                    <span className="text-white text-xs font-medium">{app.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

          {/* Community Characters Section */}
          <section className="py-16 bg-[#111]">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-[#CCFF00] mb-2 flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    {t("home.communityGallery")}
                  </h2>
                  <p className="text-gray-400">{t("home.communityDesc")}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black"
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
                              <p className="text-white font-semibold text-sm truncate">
                                {character.name}
                              </p>
                              {character.userName && (
                                <p className="text-gray-300 text-xs truncate">
                                  @{character.userName}
                                </p>
                              )}
                              {character.usageCount > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 text-[#CCFF00]" />
                                  <span className="text-[#CCFF00] text-xs">
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
                        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 aspect-[3/4]">
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
          <section className="py-20 bg-[#CCFF00]">
            <div className="container text-center">
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                {t("home.cta.title")}
              </h2>
              <p className="text-lg text-black/70 mb-8 max-w-2xl mx-auto">
                {t("home.cta.desc")}
              </p>
              <Button
                size="lg"
                className="h-16 px-12 text-xl font-black rounded-full bg-black text-[#CCFF00] hover:bg-black/90"
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
          <footer className="bg-black border-t border-white/10 py-12">
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
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0088cc] transition-colors"
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
                        className="hover:text-[#CCFF00] transition-colors"
                      >
                        {t("home.generateImage")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/video-generate"
                        className="hover:text-[#CCFF00] transition-colors"
                      >
                        {t("home.generateVideo")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/ai-influencer"
                        className="hover:text-[#CCFF00] transition-colors"
                      >
                        AI Influencer
                      </a>
                    </li>
                    <li>
                      <a
                        href="/gallery"
                        className="hover:text-[#CCFF00] transition-colors"
                      >
                        {t("home.gallery")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/packages"
                        className="hover:text-[#CCFF00] transition-colors"
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
                        className="hover:text-[#CCFF00] transition-colors"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://t.me/nanoinfluencer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#CCFF00] transition-colors flex items-center gap-2"
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
                    className="hover:text-[#CCFF00] transition-colors"
                  >
                    {t("footer.privacy")}
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#CCFF00] transition-colors"
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
