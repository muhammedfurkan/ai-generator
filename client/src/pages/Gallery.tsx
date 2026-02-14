import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Download,
  ArrowLeft,
  Loader2,
  ZoomIn,
  Heart,
  Image,
  Video,
  Play,
  Clock,
  Sparkles,
  Trash2,
  CheckSquare,
  Square,
  X,
  ZoomInIcon,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import ImageSkeleton from "@/components/ImageSkeleton";
import OptimizedImage from "@/components/OptimizedImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Gallery() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "upscale">(
    "images"
  );
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    prompt: string;
    id: number;
  } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    id: number;
    videoUrl: string;
    prompt: string;
    model: string;
    referenceImageUrl?: string | null;
    thumbnailUrl?: string | null;
  } | null>(null);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Toplu seçim state'leri
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "multiple";
    id?: number;
  } | null>(null);

  // Image queries - 30 saniyede bir otomatik yenileme
  const historyQuery = trpc.generation.getHistory.useQuery(
    { limit: 100 },
    {
      enabled: isAuthenticated && activeTab === "images",
      refetchInterval: 30000, // 30 saniye
      refetchIntervalInBackground: false,
    }
  );

  const favoriteIdsQuery = trpc.favorites.getFavoriteIds.useQuery(undefined, {
    enabled: isAuthenticated && activeTab === "images",
  });

  const favoritesQuery = trpc.favorites.list.useQuery(
    { limit: 100 },
    {
      enabled: isAuthenticated && filterFavorites && activeTab === "images",
    }
  );

  // Video query - 30 saniyede bir otomatik yenileme
  const videosQuery = trpc.videoGeneration.list.useQuery(undefined, {
    enabled: isAuthenticated && activeTab === "videos",
    refetchInterval: 30000, // 30 saniye
    refetchIntervalInBackground: false,
  });

  // Upscale history query - 30 saniyede bir otomatik yenileme
  const upscaleQuery = trpc.upscale.list.useQuery(
    { limit: 50, offset: 0 },
    {
      enabled: isAuthenticated && activeTab === "upscale",
      refetchInterval: 30000, // 30 saniye
      refetchIntervalInBackground: false,
    }
  );

  // Product Promo videos query - 30 saniyede bir otomatik yenileme
  const promoVideosQuery = trpc.productPromo.list.useQuery(
    { limit: 50, offset: 0 },
    {
      enabled: isAuthenticated && activeTab === "videos",
      refetchInterval: 30000, // 30 saniye
      refetchIntervalInBackground: false,
    }
  );

  // UGC Ad videos query - 30 saniyede bir otomatik yenileme
  const ugcVideosQuery = trpc.ugcAd.list.useQuery(undefined, {
    enabled: isAuthenticated && activeTab === "videos",
    refetchInterval: 30000, // 30 saniye
    refetchIntervalInBackground: false,
  });

  // Video favorites query
  const videoFavoriteIdsQuery = trpc.favorites.getFavoriteVideoIds.useQuery(
    undefined,
    {
      enabled: isAuthenticated && activeTab === "videos",
    }
  );

  const utils = trpc.useUtils();
  // Delete image mutation
  const deleteImageMutation = trpc.generation.delete.useMutation({
    onSuccess: () => {
      toast.success(t("gallery.toast.deleted"));
      utils.generation.getHistory.invalidate();
      utils.favorites.list.invalidate();
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    },
    onError: error => {
      toast.error(error.message || t("gallery.toast.deleteFailed"));
    },
  });

  // Toplu silme mutation
  const deleteMultipleMutation = trpc.generation.deleteMultiple.useMutation({
    onSuccess: data => {
      toast.success(
        t("gallery.toast.deletedMultiple", { count: data.deletedCount })
      );
      utils.generation.getHistory.invalidate();
      utils.favorites.list.invalidate();
      setSelectedImageIds([]);
      setIsSelectionMode(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    },
    onError: error => {
      toast.error(error.message || t("gallery.toast.deleteFailed"));
    },
  });

  // Delete video mutation
  const deleteVideoMutation = trpc.videoGeneration.delete.useMutation({
    onSuccess: () => {
      toast.success(t("gallery.toast.videoDeleted"));
      utils.videoGeneration.list.invalidate();
    },
    onError: error => {
      toast.error(error.message || t("gallery.toast.deleteFailed"));
    },
  });

  // Delete promo video mutation
  const deletePromoVideoMutation = trpc.productPromo.delete.useMutation({
    onSuccess: () => {
      toast.success(t("gallery.toast.videoDeleted"));
      utils.productPromo.list.invalidate();
    },
    onError: error => {
      toast.error(error.message || t("gallery.toast.deleteFailed"));
    },
  });

  // Delete UGC video mutation
  const deleteUgcVideoMutation = trpc.ugcAd.delete.useMutation({
    onSuccess: () => {
      toast.success(t("gallery.toast.videoDeleted"));
      utils.ugcAd.list.invalidate();
    },
    onError: error => {
      toast.error(error.message || t("gallery.toast.deleteFailed"));
    },
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
      toast.error(t("gallery.toast.deleteFailed"));
    },
    onSuccess: data => {
      toast.success(
        data.isFavorited
          ? t("gallery.toast.favoriteAdded")
          : t("gallery.toast.favoriteRemoved")
      );
      utils.favorites.list.invalidate();
    },
  });

  // Video favorites mutation
  const toggleVideoFavoriteMutation = trpc.favorites.toggleVideo.useMutation({
    onMutate: async ({ videoId }) => {
      await utils.favorites.getFavoriteVideoIds.cancel();
      const previousData = utils.favorites.getFavoriteVideoIds.getData();

      const currentIds = previousData?.videoIds || [];
      const isFavorited = currentIds.includes(videoId);

      utils.favorites.getFavoriteVideoIds.setData(undefined, {
        videoIds: isFavorited
          ? currentIds.filter(id => id !== videoId)
          : [...currentIds, videoId],
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.favorites.getFavoriteVideoIds.setData(
          undefined,
          context.previousData
        );
      }
      toast.error(t("gallery.toast.deleteFailed"));
    },
    onSuccess: data => {
      toast.success(
        data.isFavorited
          ? t("gallery.toast.favoriteAdded")
          : t("gallery.toast.favoriteRemoved")
      );
      utils.favorites.listVideos.invalidate();
    },
  });

  // Loading durumunda bekle, hemen redirect etme
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-300 text-lg">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleDownload = async (
    url: string,
    index: number,
    type: "image" | "video"
  ) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `nano-influencer-${type}-${index}-${Date.now()}.${type === "image" ? "png" : "mp4"}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t("common.download"));
    } catch (error) {
      console.error("[Download] Error:", error);
      toast.error(t("errors.networkError"));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleToggleFavorite = (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate({ imageId });
  };

  const handleToggleVideoFavorite = (videoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVideoFavoriteMutation.mutate({ videoId });
  };

  const favoriteIds = favoriteIdsQuery.data?.imageIds || [];
  const videoFavoriteIds = videoFavoriteIdsQuery.data?.videoIds || [];
  const images = filterFavorites
    ? favoritesQuery.data || []
    : historyQuery.data?.images || [];

  // Combine regular videos, promo videos and UGC videos
  const regularVideos = (videosQuery.data?.videos || []).map(v => ({
    ...v,
    type: "regular" as const,
    videoUrl: v.videoUrl,
  }));

  const promoVideos = (promoVideosQuery.data || []).map(v => ({
    id: v.id,
    prompt: v.productName || v.stylePreset,
    model: "product_promo",
    status: v.status,
    videoUrl: v.generatedVideoUrl,
    thumbnailUrl: v.thumbnailUrl || v.productImageUrl,
    referenceImageUrl: v.productImageUrl,
    createdAt: v.createdAt,
    type: "promo" as const,
    stylePreset: v.stylePreset,
  }));

  const ugcVideos = (ugcVideosQuery.data || []).map(v => ({
    id: v.id,
    prompt: v.productName || v.ugcScenario,
    model: "ugc_ad",
    status: v.status,
    videoUrl: v.generatedVideoUrl,
    thumbnailUrl: v.thumbnailUrl || v.productImageUrl,
    referenceImageUrl: v.productImageUrl,
    createdAt: v.createdAt,
    type: "ugc" as const,
    ugcScenario: v.ugcScenario,
  }));

  // Merge and sort by createdAt
  const videos = [...regularVideos, ...promoVideos, ...ugcVideos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {t("gallery.status.completed")}
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {t("gallery.status.processing")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {t("gallery.status.pending")}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            {t("gallery.status.failed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModelName = (model: string) => {
    const modelNames: Record<string, string> = {
      veo3: "Veo 3.1",
      grok: "Grok Imagine",
      kling: "Kling 2.6",
      sora2: "Sora 2",
      product_promo: t("gallery.model.productPromo"),
      ugc_ad: t("gallery.model.ugcAd"),
    };
    return modelNames[model] || model;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        prompt={selectedImage?.prompt}
        imageId={selectedImage?.id}
      />

      {/* Video Preview Modal */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => {
          setSelectedVideo(null);
          setIsPromptExpanded(false);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {getModelName(selectedVideo?.model || "")}{" "}
              {t("gallery.model.label")}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <video
                src={selectedVideo.videoUrl}
                poster={
                  selectedVideo.referenceImageUrl ||
                  selectedVideo.thumbnailUrl ||
                  undefined
                }
                controls
                autoPlay
                className="w-full rounded-lg"
                preload="metadata"
              />
              <div className="text-sm text-muted-foreground">
                {selectedVideo.prompt.length > 150 ? (
                  <>
                    <p>
                      {isPromptExpanded
                        ? selectedVideo.prompt
                        : `${selectedVideo.prompt.slice(0, 150)}...`}
                    </p>
                    <button
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                      className="text-primary hover:underline mt-1 text-xs font-medium"
                    >
                      {isPromptExpanded
                        ? t("gallery.prompt.collapse")
                        : t("gallery.prompt.expand")}
                    </button>
                  </>
                ) : (
                  <p>{selectedVideo.prompt}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button asChild>
                  <a
                    href={selectedVideo.videoUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("common.download")}
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div
        className="container py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="mb-8 flex items-center gap-4"
          variants={itemVariants}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{t("gallery.title")}</h1>
            <p className="text-muted-foreground">
              {activeTab === "images"
                ? `${images.length} ${t("gallery.tabs.images").toLowerCase()}`
                : activeTab === "videos"
                  ? `${videos.length} ${t("gallery.tabs.videos").toLowerCase()}`
                  : `${upscaleQuery.data?.length || 0} ${t("gallery.tabs.upscale").toLowerCase()}`}
            </p>
          </div>
          {activeTab === "images" && (
            <div className="flex gap-2">
              {isSelectionMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedImageIds.length === images.length) {
                        setSelectedImageIds([]);
                      } else {
                        setSelectedImageIds(images.map((img: any) => img.id));
                      }
                    }}
                    className="gap-2"
                  >
                    {selectedImageIds.length === images.length ? (
                      <>
                        <Square className="h-4 w-4" />{" "}
                        {t("gallery.selection.cancel")}
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />{" "}
                        {t("gallery.selection.selectAll")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedImageIds.length > 0) {
                        setDeleteTarget({ type: "multiple" });
                        setShowDeleteConfirm(true);
                      }
                    }}
                    disabled={selectedImageIds.length === 0}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("gallery.selection.deleteSelected", {
                      count: selectedImageIds.length,
                    })}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsSelectionMode(false);
                      setSelectedImageIds([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsSelectionMode(true)}
                    className="gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {t("gallery.selection.select")}
                  </Button>
                  <Button
                    variant={filterFavorites ? "default" : "outline"}
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className="gap-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${filterFavorites ? "fill-current" : ""}`}
                    />
                    {filterFavorites
                      ? t("gallery.filter.all")
                      : t("gallery.filter.favorites")}
                  </Button>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={v =>
            setActiveTab(v as "images" | "videos" | "upscale")
          }
          className="mb-6"
        >
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              {t("gallery.tabs.images")}
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              {t("gallery.tabs.videos")}
            </TabsTrigger>
            <TabsTrigger value="upscale" className="gap-2">
              <ZoomIn className="h-4 w-4" />
              {t("gallery.tabs.upscale")}
            </TabsTrigger>
          </TabsList>

          {/* Images Tab */}
          <TabsContent value="images" className="mt-6">
            {/* Loading State */}
            {historyQuery.isLoading && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ImageSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!historyQuery.isLoading && images.length === 0 && (
              <motion.div
                className="liquid-glass rounded-3xl p-12 text-center"
                variants={itemVariants}
              >
                <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  {filterFavorites
                    ? t("gallery.emptyStates.noFavorites")
                    : t("gallery.emptyStates.noImages")}
                </p>
                <Button
                  onClick={() => navigate("/generate")}
                  className="gradient-button text-white rounded-full px-6"
                >
                  {t("gallery.emptyStates.createNow")}
                </Button>
              </motion.div>
            )}

            {/* Gallery Grid */}
            {!historyQuery.isLoading && images.length > 0 && (
              <motion.div
                className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={containerVariants}
              >
                {images.map((image: any, index: number) => (
                  <motion.div
                    key={image.id}
                    className="group relative overflow-hidden rounded-2xl"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <div className="glass-card p-3 bg-gradient-to-br from-white/5 to-white/10">
                      <div className="relative overflow-hidden rounded-lg bg-black/20 aspect-square">
                        {/* Pending veya Processing durumundaki görseller için özel görünüm */}
                        {image.status === "pending" ||
                        image.status === "processing" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                              <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
                            </div>
                            <p className="text-sm text-blue-300 mt-4 font-medium">
                              {image.status === "pending"
                                ? t("gallery.status.queued")
                                : t("gallery.status.processing")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 px-4 text-center line-clamp-2">
                              {image.prompt}
                            </p>
                            <div className="flex items-center gap-1 mt-3">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {t("gallery.estimatedTime")}
                              </span>
                            </div>
                            {/* Silme butonu - takılı kalan işlemler için */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  type: "single",
                                  id: image.id,
                                });
                                setShowDeleteConfirm(true);
                              }}
                              className="mt-3 px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              {t("gallery.actions.deleteProcess")}
                            </button>
                          </div>
                        ) : image.status === "failed" ? (
                          /* Başarısız görsel için özel görünüm */
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-900/30 to-orange-900/30">
                            <X className="w-12 h-12 text-red-400" />
                            <p className="text-sm text-red-300 mt-4 font-medium">
                              {t("gallery.status.failed")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 px-4 text-center line-clamp-2">
                              {image.errorMessage ||
                                t("gallery.errors.imageCreateFailed")}
                            </p>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  type: "single",
                                  id: image.id,
                                });
                                setShowDeleteConfirm(true);
                              }}
                              className="mt-3 px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition-colors"
                            >
                              {t("gallery.actions.remove")}
                            </button>
                          </div>
                        ) : (
                          /* Normal tamamlanmış görsel */
                          <>
                            {/* Seçim checkbox'u */}
                            {isSelectionMode && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedImageIds(prev =>
                                    prev.includes(image.id)
                                      ? prev.filter(id => id !== image.id)
                                      : [...prev, image.id]
                                  );
                                }}
                                className={`absolute top-2 left-2 z-20 p-1.5 rounded-lg transition-all ${
                                  selectedImageIds.includes(image.id)
                                    ? "bg-[#CCFF00] text-black"
                                    : "bg-black/50 text-white hover:bg-black/70"
                                }`}
                              >
                                {selectedImageIds.includes(image.id) ? (
                                  <CheckSquare className="h-5 w-5" />
                                ) : (
                                  <Square className="h-5 w-5" />
                                )}
                              </button>
                            )}

                            <OptimizedImage
                              src={image.generatedImageUrl}
                              alt={image.prompt}
                              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer ${
                                isSelectionMode &&
                                selectedImageIds.includes(image.id)
                                  ? "ring-2 ring-[#CCFF00] ring-offset-2 ring-offset-black"
                                  : ""
                              }`}
                              onClick={() => {
                                if (isSelectionMode) {
                                  setSelectedImageIds(prev =>
                                    prev.includes(image.id)
                                      ? prev.filter(id => id !== image.id)
                                      : [...prev, image.id]
                                  );
                                } else {
                                  setSelectedImage({
                                    url: image.generatedImageUrl,
                                    prompt: image.prompt,
                                    id: image.id,
                                  });
                                }
                              }}
                            />

                            {/* Quick action buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 z-10">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDownload(
                                    image.generatedImageUrl,
                                    index,
                                    "image"
                                  );
                                }}
                                className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-[#CCFF00] hover:text-black transition-all"
                                title={t("gallery.actions.quickDownload")}
                              >
                                <Download className="h-5 w-5 text-white hover:text-black" />
                              </button>
                              <button
                                onClick={e => handleToggleFavorite(image.id, e)}
                                className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
                              >
                                <Heart
                                  className={`h-5 w-5 transition-all ${
                                    favoriteIds.includes(image.id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-white"
                                  }`}
                                />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeleteTarget({
                                    type: "single",
                                    id: image.id,
                                  });
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-red-500 transition-all"
                                title={t("gallery.actions.delete")}
                              >
                                <Trash2 className="h-5 w-5 text-white" />
                              </button>
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm">
                              <Button
                                size="sm"
                                onClick={() =>
                                  setSelectedImage({
                                    url: image.generatedImageUrl,
                                    prompt: image.prompt,
                                    id: image.id,
                                  })
                                }
                                className="glass-button gap-2"
                              >
                                <ZoomIn className="h-4 w-4" />
                                {t("gallery.actions.fullSize")}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleDownload(
                                    image.generatedImageUrl,
                                    index,
                                    "image"
                                  )
                                }
                                className="glass-button gap-2"
                              >
                                <Download className="h-4 w-4" />
                                {t("gallery.actions.download")}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="glass-card absolute bottom-0 left-0 right-0 border-0 rounded-none bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="line-clamp-2 text-xs text-white">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {image.aspectRatio} • {image.resolution}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-6">
            {/* Loading State */}
            {(videosQuery.isLoading ||
              promoVideosQuery.isLoading ||
              ugcVideosQuery.isLoading) && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!videosQuery.isLoading &&
              !promoVideosQuery.isLoading &&
              !ugcVideosQuery.isLoading &&
              videos.length === 0 && (
                <motion.div
                  className="liquid-glass rounded-3xl p-12 text-center"
                  variants={itemVariants}
                >
                  <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    {t("gallery.emptyStates.noVideos")}
                  </p>
                  <Button
                    onClick={() => navigate("/video-generate")}
                    className="gradient-button text-white rounded-full px-6"
                  >
                    {t("gallery.emptyStates.createVideo")}
                  </Button>
                </motion.div>
              )}

            {/* Videos Grid */}
            {!videosQuery.isLoading &&
              !promoVideosQuery.isLoading &&
              !ugcVideosQuery.isLoading &&
              videos.length > 0 && (
                <motion.div
                  className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                >
                  {videos.map(video => (
                    <motion.div
                      key={`${video.type}-${video.id}`}
                      className="group relative overflow-hidden rounded-2xl"
                      variants={itemVariants}
                    >
                      <div className="glass-card p-3 bg-gradient-to-br from-white/5 to-white/10">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          {video.status === "completed" && video.videoUrl ? (
                            <>
                              {/* Video thumbnail - videodan otomatik çekilir */}
                              <video
                                src={video.videoUrl + "#t=0.5"}
                                poster={
                                  video.thumbnailUrl ||
                                  video.referenceImageUrl ||
                                  undefined
                                }
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedData={e => {
                                  // Video yüklenince ilk kareyi poster olarak kullan
                                  const videoEl = e.currentTarget;
                                  if (!videoEl.poster) {
                                    videoEl.currentTime = 0.5;
                                  }
                                }}
                                onMouseEnter={e => e.currentTarget.play()}
                                onMouseLeave={e => {
                                  e.currentTarget.pause();
                                  e.currentTarget.currentTime = 0.5;
                                }}
                              />
                              <div
                                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() =>
                                  setSelectedVideo({
                                    id: video.id,
                                    videoUrl: video.videoUrl!,
                                    prompt: video.prompt,
                                    model: video.model,
                                    referenceImageUrl: video.referenceImageUrl,
                                    thumbnailUrl: video.thumbnailUrl,
                                  })
                                }
                              >
                                <Play className="w-12 h-12 text-white" />
                              </div>
                            </>
                          ) : video.status === "processing" ||
                            video.status === "pending" ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">
                                  {t("gallery.status.processing")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(video.status)}
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <p className="text-sm line-clamp-2">{video.prompt}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {getModelName(video.model)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(video.createdAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </div>
                          {video.status === "completed" && video.videoUrl && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  setSelectedVideo({
                                    id: video.id,
                                    videoUrl: video.videoUrl!,
                                    prompt: video.prompt,
                                    model: video.model,
                                    referenceImageUrl: video.referenceImageUrl,
                                    thumbnailUrl: video.thumbnailUrl,
                                  })
                                }
                              >
                                <Play className="w-3 h-3 mr-1" />
                                {t("gallery.actions.watch")}
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={video.videoUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </Button>
                              {video.type === "regular" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={
                                    videoFavoriteIds.includes(video.id)
                                      ? "bg-red-500/20 border-red-500/50"
                                      : ""
                                  }
                                  onClick={e =>
                                    handleToggleVideoFavorite(video.id, e)
                                  }
                                >
                                  <Heart
                                    className={`w-3 h-3 ${videoFavoriteIds.includes(video.id) ? "fill-red-500 text-red-500" : ""}`}
                                  />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-red-500 hover:text-white hover:border-red-500"
                                onClick={() => {
                                  if (
                                    confirm(
                                      t("gallery.deleteConfirm.videoMessage")
                                    )
                                  ) {
                                    if (video.type === "promo") {
                                      deletePromoVideoMutation.mutate({
                                        videoId: video.id,
                                      });
                                    } else if (video.type === "ugc") {
                                      deleteUgcVideoMutation.mutate({
                                        id: video.id,
                                      });
                                    } else {
                                      deleteVideoMutation.mutate({
                                        videoId: video.id,
                                      });
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          {/* Silme butonu - işleniyor, bekliyor veya başarısız durumlar için */}
                          {(video.status === "processing" ||
                            video.status === "pending" ||
                            video.status === "failed") && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 hover:bg-red-500 hover:text-white hover:border-red-500"
                                onClick={() => {
                                  if (
                                    confirm(
                                      t("gallery.deleteConfirm.videoMessage")
                                    )
                                  ) {
                                    if (video.type === "promo") {
                                      deletePromoVideoMutation.mutate({
                                        videoId: video.id,
                                      });
                                    } else if (video.type === "ugc") {
                                      deleteUgcVideoMutation.mutate({
                                        id: video.id,
                                      });
                                    } else {
                                      deleteVideoMutation.mutate({
                                        videoId: video.id,
                                      });
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {t("gallery.actions.delete")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
          </TabsContent>

          {/* Upscale Tab */}
          <TabsContent value="upscale" className="mt-6">
            {/* Loading State */}
            {upscaleQuery.isLoading && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ImageSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!upscaleQuery.isLoading &&
              (!upscaleQuery.data || upscaleQuery.data.length === 0) && (
                <motion.div
                  className="liquid-glass rounded-3xl p-12 text-center"
                  variants={itemVariants}
                >
                  <ZoomIn className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    {t("gallery.emptyStates.noUpscale")}
                  </p>
                  <Button
                    onClick={() => navigate("/upscale")}
                    className="gradient-button text-white rounded-full px-6"
                  >
                    {t("gallery.emptyStates.doUpscale")}
                  </Button>
                </motion.div>
              )}

            {/* Upscale Grid */}
            {!upscaleQuery.isLoading &&
              upscaleQuery.data &&
              upscaleQuery.data.length > 0 && (
                <motion.div
                  className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  variants={containerVariants}
                >
                  {upscaleQuery.data.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      className="group relative overflow-hidden rounded-2xl"
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                    >
                      <div className="glass-card p-3 bg-gradient-to-br from-white/5 to-white/10">
                        <div className="relative overflow-hidden rounded-lg bg-black/20 aspect-square">
                          {item.status === "completed" &&
                          item.upscaledImageUrl ? (
                            <>
                              <img
                                src={item.upscaledImageUrl}
                                alt={`Upscaled ${item.upscaleFactor}x`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                onClick={() =>
                                  setSelectedImage({
                                    url: item.upscaledImageUrl,
                                    prompt: `${item.upscaleFactor}x Upscale`,
                                    id: item.id,
                                  })
                                }
                              >
                                <ZoomIn className="w-8 h-8 text-white" />
                              </div>
                            </>
                          ) : item.status === "processing" ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#CCFF00]" />
                                <p className="text-sm text-muted-foreground">
                                  {t("gallery.status.processing")}
                                </p>
                              </div>
                            </div>
                          ) : item.status === "failed" ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <X className="w-8 h-8 mx-auto mb-2 text-destructive" />
                                <p className="text-sm text-destructive">
                                  {t("gallery.status.failed")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.originalImageUrl}
                              alt="Original"
                              className="w-full h-full object-cover opacity-50"
                              loading="lazy"
                            />
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === "completed"
                                  ? "bg-green-500/80 text-white"
                                  : item.status === "processing"
                                    ? "bg-yellow-500/80 text-black"
                                    : "bg-red-500/80 text-white"
                              }`}
                            >
                              {item.status === "completed"
                                ? t("gallery.status.completed")
                                : item.status === "processing"
                                  ? t("gallery.status.processing")
                                  : t("gallery.status.failed")}
                            </span>
                          </div>

                          {/* Upscale Factor Badge */}
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#CCFF00] text-black">
                              {item.upscaleFactor}x
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ZoomIn className="w-3 h-3" />
                              {item.upscaleFactor}x Upscale
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </div>

                          {/* Actions */}
                          {item.status === "completed" &&
                            item.upscaledImageUrl && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() =>
                                    handleDownload(
                                      item.upscaledImageUrl,
                                      index,
                                      "image"
                                    )
                                  }
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  {t("gallery.actions.download")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setSelectedImage({
                                      url: item.upscaledImageUrl,
                                      prompt: `${item.upscaleFactor}x Upscale`,
                                      id: item.id,
                                    })
                                  }
                                >
                                  <ZoomIn className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Silme Onay Dialog'u */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-5 w-5" />
              {deleteTarget?.type === "multiple"
                ? t("gallery.deleteConfirm.titleMultiple", {
                    count: selectedImageIds.length,
                  })
                : t("gallery.deleteConfirm.titleSingle")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {deleteTarget?.type === "multiple"
                ? t("gallery.deleteConfirm.messageMultiple", {
                    count: selectedImageIds.length,
                  })
                : t("gallery.deleteConfirm.messageSingle")}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
              }}
            >
              {t("gallery.deleteConfirm.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget?.type === "multiple") {
                  deleteMultipleMutation.mutate({ imageIds: selectedImageIds });
                } else if (deleteTarget?.id) {
                  deleteImageMutation.mutate({ imageId: deleteTarget.id });
                }
              }}
              disabled={
                deleteImageMutation.isPending ||
                deleteMultipleMutation.isPending
              }
            >
              {deleteImageMutation.isPending ||
              deleteMultipleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                  {t("gallery.deleteConfirm.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />{" "}
                  {t("gallery.deleteConfirm.confirmDelete")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
