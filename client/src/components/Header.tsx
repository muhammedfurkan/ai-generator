import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  CreditCard,
  ChevronDown,
  Sparkles,
  Zap,
  Image,
  Video,
  BookOpen,
  Crown,
  Mic,
  Music,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import { Sun, Moon } from "lucide-react";
import { useWebUiConfig } from "@/hooks/useWebUiConfig";
import { orderByIds } from "@/lib/webUiConfig";

export default function Header() {
  const { user, logout } = useAuth();
  const { isAuthenticated } = useIsAuthenticated();
  const [location, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme, switchable } = useTheme();
  const { getSetting, webUiConfig, featureFlags } = useWebUiConfig();

  const creditsQuery = trpc.generation.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const logoUrl = getSetting("site_logo_url", "/Logo-01.png");
  const siteName = getSetting("site_name", "Lumiohan");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setIsAppsOpen(false);
      }
    };

    if (isProfileOpen || isAppsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen, isAppsOpen]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  const mainNavPresets = [
    {
      id: "upscale",
      label: t("nav.upscale"),
      path: "/upscale",
      icon: Zap,
      featureKey: "upscale_enabled",
    },
    {
      id: "video-generate",
      label: t("nav.videoCreate"),
      path: "/video-generate",
      icon: Video,
      featureKey: "video_generation_enabled",
    },
    {
      id: "motion-control",
      label: t("nav.motionControl"),
      path: "/motion-control",
      icon: Video,
      badge: t("nav.new"),
      featureKey: "video_generation_enabled",
    },
    {
      id: "ai-influencer",
      label: t("nav.aiCharacter"),
      path: "/ai-influencer",
      icon: Sparkles,
      featureKey: "ai_influencer_enabled",
    },
    {
      id: "audio-generate",
      label: t("nav.audioGenerate"),
      path: "/audio-generate",
      icon: Mic,
      featureKey: "audio_generation_enabled",
    },
    {
      id: "music-generate",
      label: t("nav.musicGenerate"),
      path: "/music-generate",
      icon: Music,
      featureKey: "music_generation_enabled",
    },
    {
      id: "gallery",
      label: t("nav.gallery"),
      path: "/gallery",
      icon: Image,
      featureKey: "gallery_enabled",
    },
    {
      id: "blog",
      label: t("nav.blog"),
      path: "/blog",
      icon: BookOpen,
      featureKey: "blog_enabled",
    },
  ];

  const enabledMainNavPresets = mainNavPresets.filter(
    item =>
      !item.featureKey ||
      featureFlags[item.featureKey as keyof typeof featureFlags]
  );

  const mainNavItems = orderByIds(
    enabledMainNavPresets,
    webUiConfig.navigation.headerMainNavOrder
  );

  const defaultCreatePath = featureFlags.image_generation_enabled
    ? "/generate"
    : featureFlags.video_generation_enabled
      ? "/video-generate"
      : featureFlags.ai_influencer_enabled
        ? "/ai-influencer"
        : featureFlags.upscale_enabled
          ? "/upscale"
          : "/packages";

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 border-b border-white/10 backdrop-blur-xl shadow-lg"
          : "bg-background/60 backdrop-blur-md"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex items-center justify-between py-2.5">
        {/* Logo */}
        <motion.button
          onClick={() => navigate("/")}
          className="flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img src={logoUrl} alt={siteName} className="h-12 w-auto" />
        </motion.button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {/* Main Navigation Links */}
              <nav className="flex items-center gap-0.5 mr-2">
                {mainNavItems.map(item => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`text-sm px-3 py-2 h-9 rounded-lg transition-all ${
                      location === item.path
                        ? "bg-white/10 text-[#F9FAFB]"
                        : "text-gray-300 hover:text-[#F9FAFB] hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.label}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neon-brand text-black rounded">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Button>
                ))}
              </nav>

              {/* Divider */}
              <div className="h-6 w-px bg-white/10 mx-2" />

              {/* Credits Display - Clickable */}
              <motion.button
                onClick={() => navigate("/packages")}
                className="ai-credit-pill flex items-center gap-2 px-3 py-1.5 rounded-full hover:border-[#7C3AED]/55 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="ai-credit-dot w-2 h-2 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-[#F9FAFB]">
                  {creditsQuery.data?.credits ?? 0}
                </span>
                <span className="text-xs text-gray-400">
                  {t("nav.creditsSuffix")}
                </span>
              </motion.button>

              {/* Notifications */}
              <NotificationBell />

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Switcher */}
              {switchable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full hover:bg-white/10 h-9 w-9"
                  title={
                    theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Create Button - CTA */}
              <Button
                onClick={() => navigate(defaultCreatePath)}
                className="bg-neon-brand hover:bg-neon-brand/90 text-black font-semibold rounded-full px-5 h-9 ml-1 shadow-lg shadow-neon-brand/20"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {t("nav.generate")}
              </Button>

              {/* Profile Dropdown */}
              <div className="relative ml-1" ref={profileRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors h-9"
                >
                  <div className="ai-avatar-grad w-7 h-7 rounded-full flex items-center justify-center text-[#F9FAFB] font-semibold text-xs">
                    {user?.name?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </Button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
                    >
                      {/* User Info Section */}
                      <div className="p-3 bg-sky-500/10 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="ai-avatar-grad w-10 h-10 rounded-full flex items-center justify-center text-[#F9FAFB] font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase() ||
                              user?.email?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F9FAFB] font-semibold text-sm truncate">
                              {user?.name || t("common.user")}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {user?.email || ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-white/5 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span className="text-sm">{t("nav.profile")}</span>
                        </button>

                        <button
                          onClick={() => {
                            navigate("/packages");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-white/5 transition-colors"
                        >
                          <Crown className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{t("nav.buyCredits")}</span>
                        </button>

                        <button
                          onClick={() => {
                            navigate("/gallery");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-white/5 transition-colors"
                        >
                          <Image className="h-4 w-4" />
                          <span className="text-sm">
                            {t("nav.myGalleries")}
                          </span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {t("nav.logout")}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              {/* Not authenticated - show login */}
              <LanguageSwitcher />
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-neon-brand hover:bg-neon-brand/90 text-black font-semibold rounded-full px-6 ml-2"
              >
                {t("common.login")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* Credits - Mobile */}
                  <button
                    onClick={() => {
                      navigate("/packages");
                      setIsMobileMenuOpen(false);
                    }}
                    className="ai-credit-pill w-full flex items-center justify-between px-4 py-3 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="ai-credit-dot w-2.5 h-2.5 rounded-full animate-pulse" />
                      <span className="text-lg font-bold text-[#F9FAFB]">
                        {creditsQuery.data?.credits ?? 0}{" "}
                        {t("nav.creditsSuffix")}
                      </span>
                    </div>
                    <span className="text-xs text-[#7C3AED] font-medium">
                      {t("nav.topUp")} →
                    </span>
                  </button>

                  {/* Create Button - Mobile */}
                  <Button
                    onClick={() => {
                      navigate("/generate");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-neon-brand hover:bg-neon-brand/90 text-black font-semibold rounded-xl py-3 h-auto"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("home.generateImage")}
                  </Button>

                  {/* Navigation Links - Mobile */}
                  <div className="space-y-1 pt-2">
                    {mainNavItems.map(item => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full justify-start py-3 h-auto ${
                          location === item.path ? "bg-white/10" : ""
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3 text-gray-400" />
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-neon-brand text-black rounded">
                            {item.badge}
                          </span>
                        )}
                      </Button>
                    ))}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start py-3 h-auto ${
                        location === "/profile" ? "bg-white/10" : ""
                      }`}
                    >
                      <User className="h-5 w-5 mr-3 text-gray-400" />
                      {t("nav.profile")}
                    </Button>
                  </div>

                  {/* Language and Theme Switcher - Mobile */}
                  <div className="border-t border-white/10 pt-3 mt-2 space-y-2">
                    {/* Language Switcher */}
                    <div className="px-2">
                      <p className="text-xs text-gray-400 mb-2 px-2">
                        {t("nav.language") || "Dil / Language"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setLanguage("tr")}
                          className={`w-full justify-start py-3 h-auto ${
                            language === "tr"
                              ? "ai-lang-active"
                              : "border border-white/10"
                          }`}
                        >
                          <span className="text-lg mr-2">🇹🇷</span>
                          Türkçe
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setLanguage("en")}
                          className={`w-full justify-start py-3 h-auto ${
                            language === "en"
                              ? "ai-lang-active"
                              : "border border-white/10"
                          }`}
                        >
                          <span className="text-lg mr-2">🇬🇧</span>
                          English
                        </Button>
                      </div>
                    </div>

                    {/* Theme Switcher */}
                    {switchable && (
                      <div className="px-2">
                        <p className="text-xs text-gray-400 mb-2 px-2">
                          {t("nav.theme") || "Tema / Theme"}
                        </p>
                        <Button
                          variant="ghost"
                          onClick={toggleTheme}
                          className="w-full justify-between py-3 h-auto border border-white/10 hover:bg-white/10"
                        >
                          <div className="flex items-center gap-3">
                            {theme === "dark" ? (
                              <Sun className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Moon className="h-5 w-5 text-gray-400" />
                            )}
                            <span>
                              {theme === "dark"
                                ? t("nav.lightMode")
                                : t("nav.darkMode")}
                            </span>
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Language Switcher for non-authenticated users */}
                  <div className="px-2 mb-3">
                    <p className="text-xs text-gray-400 mb-2 px-2">
                      {t("nav.language") || "Dil / Language"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setLanguage("tr")}
                        className={`w-full justify-start py-3 h-auto ${
                          language === "tr"
                            ? "ai-lang-active"
                            : "border border-white/10"
                        }`}
                      >
                        <span className="text-lg mr-2">🇹🇷</span>
                        Türkçe
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setLanguage("en")}
                        className={`w-full justify-start py-3 h-auto ${
                          language === "en"
                            ? "ai-lang-active"
                            : "border border-white/10"
                        }`}
                      >
                        <span className="text-lg mr-2">🇬🇧</span>
                        English
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      window.location.href = getLoginUrl();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-neon-brand hover:bg-neon-brand/90 text-black font-semibold rounded-xl py-3 h-auto"
                  >
                    {t("common.login")}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
