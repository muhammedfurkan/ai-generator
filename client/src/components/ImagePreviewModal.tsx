import { Button } from "@/components/ui/button";
import { Download, X, Heart, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef, useCallback } from "react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
  imageId?: number;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  imageId,
}: ImagePreviewModalProps) {
  const utils = trpc.useUtils();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  // Zoom state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDistanceRef = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when modal opens or image changes
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsPromptExpanded(false);
    }
  }, [imageUrl]);

  // Reset zoom when modal closes
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsPromptExpanded(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open - improved for mobile
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Calculate pinch distance
  const getPinchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastPinchDistanceRef.current = getPinchDistance(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setIsDragging(true);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistanceRef.current !== null) {
      e.preventDefault();
      const currentDistance = getPinchDistance(e.touches);
      const delta = currentDistance / lastPinchDistanceRef.current;

      setScale((prevScale) => {
        const newScale = prevScale * delta;
        return Math.min(Math.max(newScale, 1), 5);
      });

      lastPinchDistanceRef.current = currentDistance;
    } else if (e.touches.length === 1 && isDragging && lastTouchRef.current && scale > 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastTouchRef.current.x;
      const deltaY = e.touches[0].clientY - lastTouchRef.current.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, [isDragging, scale]);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistanceRef.current = null;
    lastTouchRef.current = null;
    setIsDragging(false);
  }, []);

  // Button handlers for zoom
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const favoriteIdsQuery = trpc.favorites.getFavoriteIds.useQuery(undefined, {
    enabled: isOpen && !!imageId,
  });

  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onMutate: async ({ imageId }) => {
      await utils.favorites.getFavoriteIds.cancel();
      const previousData = utils.favorites.getFavoriteIds.getData();

      const currentIds = previousData?.imageIds || [];
      const isFavorited = currentIds.includes(imageId);

      utils.favorites.getFavoriteIds.setData(undefined, {
        imageIds: isFavorited
          ? currentIds.filter(id => id !== imageId)
          : [...currentIds, imageId],
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.favorites.getFavoriteIds.setData(undefined, context.previousData);
      }
      toast.error("Favori durumu değiştirilemedi");
    },
    onSuccess: (data) => {
      toast.success(data.isFavorited ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
      utils.favorites.list.invalidate();
    },
  });

  const handleDownload = async () => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `nano-influencer-${Date.now()}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Görsel indiriliyor...");
    } catch (error) {
      console.error("[Download] Error:", error);
      toast.error("Görsel indirilemedi");
    }
  };

  const handleToggleFavorite = () => {
    if (imageId) {
      toggleFavoriteMutation.mutate({ imageId });
    }
  };

  // Handle backdrop click - don't close when zoomed in
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.stopPropagation();
      return;
    }
    onClose();
  };

  const favoriteIds = favoriteIdsQuery.data?.imageIds || [];
  const isFavorited = imageId ? favoriteIds.includes(imageId) : false;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center touch-none"
      onClick={handleBackdropClick}
      style={{ touchAction: "none" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-[95vw] max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Zoom Controls - Mobile friendly */}
        {!imageLoading && !imageError && imageUrl && (
          <div className="absolute top-4 left-4 z-20 flex gap-1">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
              title="Yakınlaştır"
            >
              <ZoomIn className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
              title="Uzaklaştır"
              disabled={scale <= 1}
            >
              <ZoomOut className={`h-5 w-5 ${scale <= 1 ? 'text-gray-500' : 'text-white'}`} />
            </button>
            {scale > 1 && (
              <button
                onClick={handleReset}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
                title="Sıfırla"
              >
                <RotateCcw className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        )}

        {/* Zoom indicator */}
        {scale > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
            {Math.round(scale * 100)}%
          </div>
        )}

        {/* Image Container */}
        <div
          ref={imageContainerRef}
          className="flex items-center justify-center p-4 md:p-8 min-h-[300px] max-h-[70vh] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: scale > 1 ? "none" : "pan-y" }}
        >
          {imageUrl ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {imageError ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <p>Görsel yüklenemedi</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageError(false);
                      setImageLoading(true);
                    }}
                  >
                    Tekrar Dene
                  </Button>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={prompt || "Generated image"}
                  className={`max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl transition-all duration-200 select-none ${imageLoading ? 'opacity-0' : 'opacity-100'} ${scale > 1 ? 'cursor-move' : ''}`}
                  style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    transformOrigin: "center center",
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    console.error("Image load error:", imageUrl);
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  draggable={false}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground">
              <p>Görsel seçilmedi</p>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-background/80 p-4 flex flex-col gap-4">
          {/* Prompt Section */}
          {prompt && (
            <div className="text-sm text-muted-foreground">
              {prompt.length > 150 ? (
                <>
                  <div className={isPromptExpanded ? "max-h-40 overflow-y-auto" : ""}>
                    <p className={isPromptExpanded ? "whitespace-pre-wrap break-words" : "line-clamp-2"}>
                      {prompt}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                    className="text-primary hover:underline mt-2 text-xs font-medium"
                  >
                    {isPromptExpanded ? "Daha az göster" : "Daha fazlasını oku"}
                  </button>
                </>
              ) : (
                <p className="whitespace-pre-wrap break-words">{prompt}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {imageId && (
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className="gap-2"
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart
                  className={`h-4 w-4 transition-all ${isFavorited ? "fill-red-500 text-red-500" : ""
                    }`}
                />
                <span className="hidden sm:inline">
                  {isFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                </span>
              </Button>
            )}
            <Button
              onClick={handleDownload}
              className="gradient-button"
            >
              <Download className="h-4 w-4 mr-2" />
              İndir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
