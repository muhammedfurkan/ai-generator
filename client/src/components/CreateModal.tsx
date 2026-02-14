import {
  X,
  Image,
  Video,
  Wand2,
  ZoomIn,
  Sparkles,
  Users,
  Camera,
  Move,
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = "all" | "new" | "images" | "videos";

const filterTabs: { id: FilterTab; labelKey: string }[] = [
  { id: "all", labelKey: "category.all" },
  { id: "new", labelKey: "category.new" },
  { id: "images", labelKey: "category.images" },
  { id: "videos", labelKey: "category.videos" },
];

const badgeColors: Record<string, string> = {
  CORE: "bg-[#00F5FF]",
  NEW: "bg-green-500",
  HOT: "bg-red-500",
  PRO: "bg-[#7C3AED]",
  UNLIMITED: "bg-red-500",
};

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const { t } = useLanguage();

  // Fetch modal cards from database
  const { data: cards, isLoading } = trpc.modalCards.getAll.useQuery(
    undefined,
    {
      enabled: isOpen, // Only fetch when modal is open
    }
  );

  // Detect if mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Get featured card (hero card)
  const featuredCard = useMemo(() => {
    return cards?.find(card => card.isFeatured);
  }, [cards]);

  // Get regular cards (not featured)
  const regularCards = useMemo(() => {
    return cards?.filter(card => !card.isFeatured) || [];
  }, [cards]);

  const handleToolClick = (path: string | null) => {
    onClose();
    if (path) {
      navigate(path);
    }
  };

  const filteredCards = regularCards.filter(card => {
    if (activeFilter === "all") return true;
    if (activeFilter === "new")
      return card.badge === "NEW" || card.badge === "HOT";
    if (activeFilter === "images") return card.category === "images";
    if (activeFilter === "videos") return card.category === "videos";
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0B0F19]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-2xl font-bold text-[#F9FAFB]">
              {t("nav.create")}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-[#F9FAFB]" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeFilter === tab.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-[#F9FAFB]"
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Hero Card - Featured */}
              {featuredCard && (
                <div className="px-4 mb-4">
                  <div
                    onClick={() => handleToolClick(featuredCard.path)}
                    className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={
                        isMobile && featuredCard.imageMobile
                          ? featuredCard.imageMobile
                          : featuredCard.imageDesktop ||
                            featuredCard.imageMobile ||
                            "/covers/nano-banana-pro.jpg"
                      }
                      alt={featuredCard.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {featuredCard.badge && (
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2 py-1 text-[#F9FAFB] text-xs font-bold rounded"
                          style={{
                            backgroundColor:
                              featuredCard.badgeColor ||
                              badgeColors[featuredCard.badge] ||
                              "#FF2E97",
                          }}
                        >
                          {featuredCard.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-[#F9FAFB]">
                        {featuredCard.title}
                      </h3>
                      {featuredCard.description && (
                        <p className="text-sm text-gray-300">
                          {featuredCard.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tools Grid */}
              <div
                className="px-4 pb-24 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 320px)" }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {filteredCards.map(card => {
                    const imageUrl =
                      isMobile && card.imageMobile
                        ? card.imageMobile
                        : card.imageDesktop || card.imageMobile;

                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleToolClick(card.path)}
                        className="relative rounded-2xl overflow-hidden bg-white/5 cursor-pointer active:scale-95 transition-transform"
                      >
                        {/* Card Image */}
                        <div className="aspect-[4/3] relative">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={card.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <Image className="w-12 h-12 text-gray-600" />
                            </div>
                          )}
                          {/* Badge */}
                          {card.badge && (
                            <div className="absolute top-2 left-2">
                              <span
                                className="px-2 py-0.5 text-[10px] font-bold text-[#F9FAFB] rounded"
                                style={{
                                  backgroundColor:
                                    card.badgeColor ||
                                    badgeColors[card.badge] ||
                                    "#00F5FF",
                                }}
                              >
                                {card.badge}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Card Info */}
                        <div className="p-3">
                          <h4 className="text-sm font-bold text-[#F9FAFB]">
                            {card.title}
                          </h4>
                          {card.description && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {card.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredCards.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {t("modal.noCards") || "Bu kategoride kart bulunamadı"}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
