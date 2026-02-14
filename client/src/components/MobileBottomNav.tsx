import { useLocation } from "wouter";
import { Home, Users, Sparkles, FolderOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import CreateModal from "./CreateModal";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  isCreate?: boolean;
  requiresAuth?: boolean;
}

export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Listen for openCreateModal event from MobileHome
  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener("openCreateModal", handleOpenModal);
    return () => window.removeEventListener("openCreateModal", handleOpenModal);
  }, []);

  const navItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: t("nav.home"), path: "/" },
    {
      icon: <Users className="h-5 w-5" />,
      label: t("home.communityShort"),
      path: "/community-characters",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      label: t("nav.create"),
      path: "/create",
      isCreate: true,
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: t("nav.gallery"),
      path: "/gallery",
      requiresAuth: true,
    },
    {
      icon: <User className="h-5 w-5" />,
      label: t("nav.profile"),
      path: "/profile",
      requiresAuth: true,
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.isCreate) {
      setIsCreateModalOpen(true);
    } else if (item.requiresAuth && !isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = getLoginUrl();
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-2 transition-all",
                item.isCreate
                  ? "relative -mt-6"
                  : isActive(item.path)
                    ? "text-[#F9FAFB]"
                    : "text-gray-500"
              )}
            >
              {item.isCreate ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-neon-brand flex items-center justify-center shadow-lg shadow-neon-brand/30">
                    <Sparkles className="h-7 w-7 text-black" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "transition-colors",
                      isActive(item.path) ? "text-[#F9FAFB]" : "text-gray-500"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive(item.path) ? "text-[#F9FAFB]" : "text-gray-500"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Safe area spacer for content */}
      <div className="h-16 md:hidden" />

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
