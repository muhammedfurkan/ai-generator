import { memo, useCallback } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  BookOpen,
  Zap,
  Video,
  Image,
  LogOut,
  Sparkles,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Memoized menu item to prevent re-renders
const MenuItem = memo(function MenuItem({
  icon: Icon,
  label,
  badge,
  onClick,
  isLogout,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  onClick: () => void;
  isLogout?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
        isLogout
          ? "text-red-400 active:bg-red-500/10"
          : "text-[#F9FAFB] active:bg-white/10"
      }`}
    >
      <Icon className={`h-5 w-5 ${isLogout ? "" : "text-gray-400"}`} />
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neon-brand text-black rounded">
            {badge}
          </span>
        )}
      </span>
    </button>
  );
});

// Memoized language button
const LanguageButton = memo(function LanguageButton({
  flag,
  label,
  isActive,
  onClick,
}: {
  flag: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl ${
        isActive ? "ai-lang-active" : "border border-white/10 text-[#F9FAFB]"
      }`}
    >
      <span className="text-lg">{flag}</span>
      {label}
    </button>
  );
});

function MobileMenuContent({ isOpen, onClose }: MobileMenuProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  // Memoized navigation handler
  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    onClose();
  }, [logout, onClose]);

  // Memoized login handler
  const handleLogin = useCallback(() => {
    window.location.href = getLoginUrl();
    onClose();
  }, [onClose]);

  // Memoized language handlers
  const setTurkish = useCallback(() => setLanguage("tr"), [setLanguage]);
  const setEnglish = useCallback(() => setLanguage("en"), [setLanguage]);

  if (!isOpen) return null;

  return (
    <div className="border-t border-white/10 bg-[#0B0F19]">
      <div className="px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {isAuthenticated ? (
          <>
            <MenuItem
              icon={Zap}
              label={t("nav.upscale")}
              onClick={() => handleNavigate("/upscale")}
            />
            <MenuItem
              icon={Video}
              label={t("nav.videoCreate")}
              onClick={() => handleNavigate("/video-generate")}
            />
            <MenuItem
              icon={Video}
              label={t("nav.motionControl")}
              badge={t("nav.new")}
              onClick={() => handleNavigate("/motion-control")}
            />
            <MenuItem
              icon={Sparkles}
              label={t("nav.aiCharacter")}
              onClick={() => handleNavigate("/ai-influencer")}
            />
            <MenuItem
              icon={Image}
              label={t("nav.gallery")}
              onClick={() => handleNavigate("/gallery")}
            />
            <MenuItem
              icon={BookOpen}
              label={t("nav.blog")}
              onClick={() => handleNavigate("/blog")}
            />
            <MenuItem
              icon={User}
              label={t("nav.profile")}
              onClick={() => handleNavigate("/profile")}
            />

            {/* Language Switcher */}
            <div className="border-t border-white/10 pt-3 mt-2">
              <p className="text-xs text-gray-400 mb-2 px-2">
                {t("nav.language") || "Dil / Language"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <LanguageButton
                  flag="🇹🇷"
                  label="Türkçe"
                  isActive={language === "tr"}
                  onClick={setTurkish}
                />
                <LanguageButton
                  flag="🇬🇧"
                  label="English"
                  isActive={language === "en"}
                  onClick={setEnglish}
                />
              </div>
            </div>

            {/* Logout */}
            <MenuItem
              icon={LogOut}
              label={t("nav.logout")}
              onClick={handleLogout}
              isLogout
            />
          </>
        ) : (
          <>
            {/* Language Switcher for non-authenticated */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2 px-2">
                {t("nav.language") || "Dil / Language"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <LanguageButton
                  flag="🇹🇷"
                  label="Türkçe"
                  isActive={language === "tr"}
                  onClick={setTurkish}
                />
                <LanguageButton
                  flag="🇬🇧"
                  label="English"
                  isActive={language === "en"}
                  onClick={setEnglish}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-neon-brand active:bg-neon-brand/90 text-black font-semibold rounded-xl py-3"
            >
              {t("common.login")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Export memoized component
export const MobileMenu = memo(MobileMenuContent);
