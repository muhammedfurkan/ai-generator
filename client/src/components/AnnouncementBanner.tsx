/**
 * AnnouncementBanner - Displays active announcements from admin panel
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertTriangle, Info, Megaphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Storage key for dismissed announcements
const DISMISSED_ANNOUNCEMENTS_KEY = "dismissed_announcements";

function getDismissedAnnouncements(): number[] {
  try {
    const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function dismissAnnouncement(id: number): void {
  try {
    const dismissed = getDismissedAnnouncements();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // Ignore storage errors
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "popup":
      return <Megaphone className="h-5 w-5" />;
    case "banner":
      return <Bell className="h-5 w-5" />;
    case "notification":
      return <Info className="h-5 w-5" />;
    case "maintenance":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "popup":
      return "from-purple-500 to-pink-500";
    case "banner":
      return "from-blue-500 to-cyan-500";
    case "notification":
      return "from-green-500 to-emerald-500";
    case "maintenance":
      return "from-orange-500 to-red-500";
    default:
      return "from-blue-500 to-cyan-500";
  }
}

export default function AnnouncementBanner() {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [popupAnnouncement, setPopupAnnouncement] = useState<any>(null);

  // Fetch announcements
  const announcementsQuery = trpc.settings.getPublicAnnouncements.useQuery(undefined, {
    staleTime: 60000, // 1 minute
    retry: false,
  });

  // Load dismissed announcements on mount
  useEffect(() => {
    setDismissedIds(getDismissedAnnouncements());
  }, []);

  // Filter announcements
  const announcements = announcementsQuery.data || [];

  // Get banner announcements (not popup type, and not dismissed)
  const bannerAnnouncements = announcements.filter(
    (ann) => {
      // Skip popups
      if (ann.type === "popup") return false;
      // If dismissed, don't show
      if (dismissedIds.includes(ann.id)) return false;
      return true;
    }
  );

  // Get popup announcement (first one not dismissed)
  const popupAnnouncements = announcements.filter(
    (ann) => {
      // Only popups
      if (ann.type !== "popup") return false;
      // If dismissed, don't show
      if (dismissedIds.includes(ann.id)) return false;
      return true;
    }
  );

  // Show first popup on mount
  useEffect(() => {
    if (popupAnnouncements.length > 0 && !popupAnnouncement) {
      setPopupAnnouncement(popupAnnouncements[0]);
    }
  }, [popupAnnouncements, popupAnnouncement]);

  const handleDismissBanner = (id: number) => {
    dismissAnnouncement(id);
    setDismissedIds([...dismissedIds, id]);
  };

  const handleDismissPopup = () => {
    if (popupAnnouncement) {
      dismissAnnouncement(popupAnnouncement.id);
      setDismissedIds([...dismissedIds, popupAnnouncement.id]);
      setPopupAnnouncement(null);
    }
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <>
      {/* Banner Announcements */}
      <AnimatePresence>
        {bannerAnnouncements.slice(0, 1).map((ann) => (
          <motion.div
            key={ann.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`relative overflow-hidden bg-gradient-to-r ${getTypeColor(ann.type)}`}
            style={{
              backgroundColor: ann.backgroundColor || undefined,
            }}
          >
            <div className="container py-2 px-4 flex items-center justify-center gap-3">
              <div className="text-white/90">
                {getTypeIcon(ann.type)}
              </div>
              <p
                className="text-sm font-medium text-white flex-1 text-center"
                style={{ color: ann.textColor || undefined }}
              >
                {ann.title}
                {ann.content && (
                  <span className="hidden sm:inline text-white/80 ml-2">
                    — {ann.content.substring(0, 100)}
                    {ann.content.length > 100 ? "..." : ""}
                  </span>
                )}
              </p>
              {ann.buttonText && ann.buttonUrl && (
                <a
                  href={ann.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-medium transition-colors"
                >
                  {ann.buttonText}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {ann.dismissible && (
                <button
                  onClick={() => handleDismissBanner(ann.id)}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Popup Announcements */}
      <Dialog open={!!popupAnnouncement} onOpenChange={(open) => !open && handleDismissPopup()}>
        <DialogContent className="sm:max-w-lg">
          {popupAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${getTypeColor(popupAnnouncement.type)} text-white`}>
                    {getTypeIcon(popupAnnouncement.type)}
                  </div>
                  <DialogTitle>{popupAnnouncement.title}</DialogTitle>
                </div>
              </DialogHeader>

              {popupAnnouncement.imageUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img
                    src={popupAnnouncement.imageUrl}
                    alt={popupAnnouncement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <DialogDescription className="text-base">
                {popupAnnouncement.content}
              </DialogDescription>

              <div className="flex gap-3 mt-4">
                {popupAnnouncement.buttonText && popupAnnouncement.buttonUrl && (
                  <Button
                    className="flex-1 gradient-button text-white"
                    asChild
                  >
                    <a
                      href={popupAnnouncement.buttonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {popupAnnouncement.buttonText}
                    </a>
                  </Button>
                )}
                {popupAnnouncement.dismissible && (
                  <Button
                    variant="outline"
                    onClick={handleDismissPopup}
                    className={popupAnnouncement.buttonText ? "" : "w-full"}
                  >
                    Kapat
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
