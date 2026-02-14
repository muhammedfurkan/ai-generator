import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Loader2,
  X,
  Video,
  Sparkles,
  ChevronDown,
  Zap,
  Upload,
  Check,
  Wand2,
  Settings2,
  Play,
} from "lucide-react";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import Header from "@/components/Header";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const MODEL_DISPLAY_INFO: Record<string, { icon: string }> = {
  veo3: { icon: "🎬" },
  sora2: { icon: "🎥" },
  kling: { icon: "⚡" },
  "wan-26": { icon: "🐉" },
  grok: { icon: "🤖" },
  hailuo: { icon: "🎭" },
  "seedance-lite": { icon: "🌱" },
  "seedance-pro": { icon: "💎" },
  "seedance-15-pro": { icon: "🚀" },
};

const QUALITY_LABELS: Record<string, string> = {
  standard: "Standard",
  high: "High",
  ultra: "Ultra",
  hd: "HD",
  "4k": "4K",
};

export default function VideoGenerate() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedModel, setSelectedModel] = useState<string>("veo3");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // ✨ NEW: Multi-image support
  const [generationType, setGenerationType] = useState<
    "text-to-video" | "image-to-video" | "video-to-video" | "reference-to-video"
  >("text-to-video"); // Extended type for UI
  // ✨ NEW: Video upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // ✨ NEW: Additional settings states
  const [enableAudio, setEnableAudio] = useState<boolean>(true);
  const [resolution, setResolution] = useState<string>("720p");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [duration, setDuration] = useState<string>("5");
  const [quality, setQuality] = useState<string>("standard");
  const [soraFeature, setSoraFeature] = useState<
    "default" | "characters" | "watermark-remover" | "storyboard"
  >("default"); // ✨ Sora 2 features
  const [prompt, setPrompt] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Single image preview for image-to-video
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // ✨ NEW: Multi-image previews
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const { data: pricing } = trpc.videoGeneration.getPricing.useQuery();
  const estimatedCreditQuery = trpc.videoGeneration.estimateCreditCost.useQuery(
    {
      modelType: selectedModel,
      duration,
      hasAudio: selectedModel === "sora2" ? false : enableAudio,
      feature: selectedModel === "sora2" ? soraFeature : undefined,
      quality: quality as any,
      resolution,
    },
    {
      enabled: !!selectedModel,
    }
  );
  const { data: publicModels } = trpc.settings.getPublicModels.useQuery();
  const videoHistoryQuery = trpc.videoGeneration.list.useQuery({ limit: 8 });
  const utils = trpc.useUtils();

  const activeVideoModels = publicModels?.videoModels || [];

  const generateMutation = trpc.videoGeneration.generate.useMutation({
    onSuccess: data => {
      setCurrentVideoId(data.videoId);
      utils.videoGeneration.list.invalidate();
      toast.success(t("video.toast.generationStarted"));
    },
    onError: error => {
      if (error.message.includes("Yetersiz kredi")) {
        setShowCreditsDialog(true);
      } else {
        toast.error(error.message);
      }
    },
  });

  const { data: statusData } = trpc.videoGeneration.checkStatus.useQuery(
    { videoId: currentVideoId! },
    {
      enabled: !!currentVideoId,
      refetchInterval: query => {
        const data = query.state.data;
        if (data?.status === "completed" || data?.status === "failed") {
          return false;
        }
        return 5000;
      },
    }
  );

  // Handle auth redirect - must be before any conditional returns
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modelSelectorRef.current &&
        !modelSelectorRef.current.contains(event.target as Node)
      ) {
        setShowModelSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update settings when model changes
  useEffect(() => {
    const selectedModelData = activeVideoModels.find(
      m => m.modelKey === selectedModel
    );
    if (selectedModelData) {
      const supportedRatios = selectedModelData.supportedAspectRatios || [
        "16:9",
      ];
      if (!supportedRatios.includes(aspectRatio)) {
        setAspectRatio(
          selectedModelData.defaultAspectRatio || supportedRatios[0] || "16:9"
        );
      }

      const supportedDurations = selectedModelData.supportedDurations || ["5"];
      if (!supportedDurations.includes(duration)) {
        setDuration(
          selectedModelData.defaultDuration || supportedDurations[0] || "5"
        );
      }

      const supportedQualities = selectedModelData.supportedQualities || [
        "standard",
      ];
      if (!supportedQualities.includes(quality)) {
        setQuality(
          selectedModelData.defaultQuality ||
            supportedQualities[0] ||
            "standard"
        );
      }

      // ✨ NEW: Set resolution default
      const supportedResolutions =
        (selectedModelData as any).supportedResolutions || [];
      if (
        supportedResolutions.length > 0 &&
        !supportedResolutions.includes(resolution)
      ) {
        setResolution(
          (selectedModelData as any).defaultResolution ||
            supportedResolutions[0] ||
            "720p"
        );
      }

      // ✨ NEW: Audio support detection
      const hasAudioSupport =
        (selectedModelData as any).hasAudioSupport || false;

      // Sora 2'de ses modu yok
      if (selectedModel === "sora2") {
        setEnableAudio(false);
      }
      // Kling 2.6 için ses varsayılan olarak açık
      else if (selectedModel === "kling") {
        setEnableAudio(true);
      } else if (!hasAudioSupport) {
        setEnableAudio(false);
      }

      // Sora 2'de 10s/15s ve standard/pro dışındaki değerleri normalize et
      if (selectedModel === "sora2") {
        if (!["10", "15", "10s", "15s"].includes(duration)) {
          setDuration("10");
        }
        if (!["standard", "pro"].includes(quality)) {
          setQuality("standard");
        }
      }
    }
  }, [selectedModel, activeVideoModels, duration, quality]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMulti: boolean = false
  ) => {
    if (isMulti) {
      // Multi-image upload for Veo 3.1 Reference Mode
      const files = Array.from(e.target.files || []);
      if (files.length + imageFiles.length > 3) {
        toast.error(t("video.errors.maxReferenceImages"));
        return;
      }

      const newFiles = [...imageFiles, ...files].slice(0, 3);
      setImageFiles(newFiles);

      // Generate previews
      const newPreviews: string[] = [...imagePreviews];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImagePreviews(prev =>
              [...prev, reader.result as string].slice(0, 3)
            );
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      // Single image upload
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast.error(t("video.errors.videoSizeLimit"));
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImageAtIndex = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (generateMutation.isPending || isUploading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    if (!prompt.trim()) {
      toast.error(t("video.errors.promptRequired"));
      return;
    }

    // Upload images
    let imageUrl: string | undefined;
    let imageUrls: string[] = [];

    setIsUploading(true);
    try {
      if (generationType === "image-to-video" && imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        imageUrl = data.url;
      } else if (
        generationType === "reference-to-video" &&
        imageFiles.length > 0
      ) {
        // Upload multiple files
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          imageUrls.push(data.url);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("video.errors.imageUploadFailed"));
      setIsUploading(false);
      return;
    }
    setIsUploading(false);

    if (generationType === "image-to-video" && !imageUrl) {
      toast.error(t("video.errors.imageRequired"));
      return;
    }
    if (generationType === "reference-to-video" && imageUrls.length === 0) {
      toast.error(t("video.errors.referenceImageRequired"));
      return;
    }

    // Upload video if needed
    let videoUrl: string | undefined;
    if (generationType === "video-to-video" && videoFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", videoFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Video upload failed");
        const data = await res.json();
        videoUrl = data.url;
        setIsUploading(false);
      } catch (error) {
        console.error("Video Upload error:", error);
        toast.error(t("video.errors.videoUploadFailed"));
        setIsUploading(false);
        return;
      }
    }

    if (generationType === "video-to-video" && !videoUrl) {
      toast.error(t("video.errors.videoRequired"));
      return;
    }

    generateMutation.mutate({
      modelType: selectedModel as any,
      generationType:
        generationType === "reference-to-video"
          ? "image-to-video"
          : (generationType as any),
      prompt: prompt,
      imageUrl,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      videoUrl, // ✨ NEW: Pass video URL
      aspectRatio,
      duration,
      hasAudio: selectedModel === "sora2" ? false : enableAudio,
      quality: quality as any,
      resolution, // ✨ NEW: Pass resolution
      feature: selectedModel === "sora2" ? soraFeature : undefined, // ✨ NEW: Pass Sora 2 feature
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const selectedModelData =
    activeVideoModels.find(m => m.modelKey === selectedModel) ||
    activeVideoModels[0];
  const currentModelInfo = pricing?.[selectedModel as keyof typeof pricing];
  const currentOption =
    currentModelInfo?.options?.find(
      (o: any) =>
        o.value === quality ||
        o.quality === quality ||
        o.value === duration ||
        o.duration === duration ||
        o.duration === `${duration}s`
    ) || currentModelInfo?.options?.[0];
  const creditCost =
    estimatedCreditQuery.data?.credits || currentOption?.credits || 50;
  const displayCreditCost = Number.isFinite(Number(creditCost))
    ? Math.max(1, Math.round(Number(creditCost)))
    : 50;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB]">
      <Header />

      <div className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                {t("video.title")}
              </h1>
              <p className="text-white/40 text-sm">{t("video.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <Zap className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-lg font-bold text-[#7C3AED]">
                {user?.credits ?? 0}
              </span>
            </div>
          </div>

          {/* Main Generation Card */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
            {/* Model Selector */}
            <div className="mb-6" ref={modelSelectorRef}>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                {t("generate.modelLabel")}
              </label>
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-xl">
                    {MODEL_DISPLAY_INFO[
                      selectedModelData?.modelKey || selectedModel
                    ]?.icon || "🎬"}
                  </div>
                  <div className="text-left">
                    <div className="font-bold">
                      {selectedModelData?.modelName || t("video.selectModel")}
                    </div>
                    <div className="text-xs text-white/40">
                      {selectedModelData?.provider || ""}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-white/40 transition-transform",
                    showModelSelector && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {showModelSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl max-h-64 overflow-y-auto"
                  >
                    <div className="space-y-1">
                      {activeVideoModels
                        .filter(model => !model.isMaintenanceMode) // Bakımda olanları listeden çıkar
                        .map(model => {
                          const displayInfo = MODEL_DISPLAY_INFO[
                            model.modelKey
                          ] || { icon: "🎬" };

                          return (
                            <button
                              key={model.modelKey}
                              onClick={() => (
                                setSelectedModel(model.modelKey),
                                setShowModelSelector(false)
                              )}
                              className={cn(
                                "w-full text-left p-3 rounded-xl transition-all hover:bg-white/5",
                                selectedModel === model.modelKey &&
                                  "bg-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                  {displayInfo.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "text-sm font-bold",
                                        selectedModel === model.modelKey
                                          ? "text-[#7C3AED]"
                                          : "text-[#F9FAFB]"
                                      )}
                                    >
                                      {model.modelName}
                                    </div>
                                  </div>
                                  <div className="text-xs text-white/40">
                                    {model.provider}
                                  </div>
                                </div>
                                {selectedModel === model.modelKey && (
                                  <Check className="w-4 h-4 text-[#7C3AED]" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mode Toggle - Hide for Sora 2 special features */}
            {!(selectedModel === "sora2" && soraFeature !== "default") && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("video.modeLabel")}
                </label>
                <div
                  className={cn(
                    "inline-flex rounded-xl bg-white/5 p-1 w-full",
                    // Dinamik grid: Kaç mod destekleniyorsa o kadar sütun
                    (() => {
                      let modeCount = 0;
                      if (
                        (selectedModelData as any)?.supportsTextToVideo !==
                        false
                      )
                        modeCount++;
                      if (
                        (selectedModelData as any)?.supportsImageToVideo !==
                        false
                      )
                        modeCount++;
                      if ((selectedModelData as any)?.supportsVideoToVideo)
                        modeCount++;
                      if ((selectedModelData as any)?.supportsReferenceVideo)
                        modeCount++;
                      return modeCount === 1
                        ? "grid grid-cols-1"
                        : modeCount === 2
                          ? "grid grid-cols-2 gap-1"
                          : modeCount === 3
                            ? "grid grid-cols-2 sm:grid-cols-3 gap-1"
                            : "grid grid-cols-2 sm:grid-cols-4 gap-1";
                    })()
                  )}
                >
                  {/* Text to Video - Varsayılan olarak hep aktif (false değilse) */}
                  {(selectedModelData as any)?.supportsTextToVideo !==
                    false && (
                    <button
                      onClick={() => setGenerationType("text-to-video")}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                        generationType === "text-to-video"
                          ? "bg-[#7C3AED] text-[#F9FAFB]"
                          : "text-white/60 hover:text-[#F9FAFB]"
                      )}
                    >
                      {t("video.textToVideo")}
                    </button>
                  )}

                  {/* Image to Video */}
                  {(selectedModelData as any)?.supportsImageToVideo !==
                    false && (
                    <button
                      onClick={() => setGenerationType("image-to-video")}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                        generationType === "image-to-video"
                          ? "bg-[#7C3AED] text-[#F9FAFB]"
                          : "text-white/60 hover:text-[#F9FAFB]"
                      )}
                    >
                      {t("video.imageToVideo")}
                    </button>
                  )}

                  {/* Reference to Video (Veo 3.1) */}
                  {/* Reference to Video (Veo 3.1) */}
                  {(selectedModelData as any)?.supportsReferenceVideo && (
                    <button
                      onClick={() => setGenerationType("reference-to-video")}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                        generationType === "reference-to-video"
                          ? "bg-[#7C3AED] text-[#F9FAFB]"
                          : "text-white/60 hover:text-[#F9FAFB]"
                      )}
                    >
                      {t("video.refToVideo")}
                    </button>
                  )}

                  {/* Video to Video (Wan 2.6) */}
                  {(selectedModelData as any)?.supportsVideoToVideo && (
                    <button
                      onClick={() => setGenerationType("video-to-video")}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                        generationType === "video-to-video"
                          ? "bg-[#7C3AED] text-[#F9FAFB]"
                          : "text-white/60 hover:text-[#F9FAFB]"
                      )}
                    >
                      {t("video.videoToVideo")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Image Upload for Image-to-Video (Single) */}
            {generationType === "image-to-video" && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("video.sourceImage")}
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Upload"
                      className="w-full h-48 object-contain rounded-xl"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-white/40" />
                    <span className="text-sm text-white/60">
                      {t("common.upload")}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Reference Image Upload (Multi) - Veo 3.1 */}
            {generationType === "reference-to-video" && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("generate.referenceImages")} (Max 3)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Previews */}
                  {imagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group"
                    >
                      <img
                        src={preview}
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImageAtIndex(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  {imageFiles.length < 3 && (
                    <label className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all bg-white/5 hover:bg-white/10">
                      <Upload className="w-6 h-6 text-white/40" />
                      <span className="text-xs text-white/60 text-center">
                        Referans
                        <br />
                        Ekle
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-2">
                  * 3 görsele kadar yükleyebilirsiniz. İlk görsel başlangıç,
                  diğerleri stil/akış referansı olur.
                </p>
              </div>
            )}

            {/* Video Upload for Video-to-Video */}
            {generationType === "video-to-video" && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("video.sourceVideo")} (Max 50MB)
                </label>
                {videoPreview ? (
                  <div className="relative group">
                    <video
                      src={videoPreview}
                      className="w-full h-48 object-contain rounded-xl bg-black/50"
                      controls
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all bg-white/5 hover:bg-white/10">
                    <Video className="w-8 h-8 text-white/40" />
                    <span className="text-sm text-white/60">Video Seç</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Prompt Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Video Açıklaması
                </label>
              </div>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={
                  generationType === "text-to-video"
                    ? t("video.placeholders.textToVideo")
                    : t("video.placeholders.imageToVideo")
                }
                className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 resize-none text-base min-h-[120px]"
                rows={5}
                maxLength={5000}
              />
            </div>

            {/* Sora 2 Characters - Character Prompt & Safety Instruction */}
            {selectedModel === "sora2" && soraFeature === "characters" && (
              <>
                <div className="mb-6">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                    {t("video.sora.characterDescription")}
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={t("video.placeholders.characterDesc")}
                    className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 resize-none text-base min-h-[100px]"
                    rows={4}
                    maxLength={5000}
                  />
                </div>
                <div className="mb-6">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                    {t("video.sora.safetyInstructions")}
                  </label>
                  <Textarea
                    value={(window as any).__sora_safety_instruction || ""}
                    onChange={e =>
                      ((window as any).__sora_safety_instruction =
                        e.target.value)
                    }
                    placeholder={t("video.placeholders.safetyInstructions")}
                    className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 resize-none text-base min-h-[80px]"
                    rows={3}
                    maxLength={5000}
                  />
                </div>
              </>
            )}

            {/* Sora 2 Watermark - Video URL Input */}
            {selectedModel === "sora2" &&
              soraFeature === "watermark-remover" && (
                <div className="mb-6">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                    {t("video.sora.videoURL")}
                  </label>
                  <input
                    type="url"
                    value={(window as any).__sora_video_url || ""}
                    onChange={e =>
                      ((window as any).__sora_video_url = e.target.value)
                    }
                    placeholder="https://sora.chatgpt.com/p/s_..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#7C3AED]/50 focus:outline-none text-[#F9FAFB]"
                    maxLength={500}
                  />
                  <p className="text-xs text-white/40 mt-2">
                    {t("video.sora.watermarkHint")}
                  </p>
                </div>
              )}

            {/* Sora 2 Storyboard - Multi-Image Upload */}
            {selectedModel === "sora2" && soraFeature === "storyboard" && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("video.sora.storyboardImages")}
                </label>
                <p className="text-xs text-white/40 mb-3">
                  {t("video.sora.storyboardHint")}
                </p>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={preview}
                          alt={`Frame ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setImageFiles(prev =>
                              prev.filter((_, i) => i !== idx)
                            );
                            setImagePreviews(prev =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-white/40" />
                  <span className="text-sm text-white/60">
                    Görsel Yükle ({imageFiles.length})
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Sora 2 Special Features */}
            {selectedModel === "sora2" &&
              (selectedModelData as any)?.specialFeatures?.length > 0 && (
                <div className="mb-6">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                    Özellik
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => setSoraFeature("default")}
                      className={cn(
                        "py-3 px-4 rounded-lg text-sm font-bold transition-all border",
                        soraFeature === "default"
                          ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                    >
                      🎬 Standart Video
                    </button>
                    <button
                      onClick={() => setSoraFeature("characters")}
                      className={cn(
                        "py-3 px-4 rounded-lg text-sm font-bold transition-all border",
                        soraFeature === "characters"
                          ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                    >
                      👤 Karakter
                    </button>
                    <button
                      onClick={() => setSoraFeature("storyboard")}
                      className={cn(
                        "py-3 px-4 rounded-lg text-sm font-bold transition-all border",
                        soraFeature === "storyboard"
                          ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                    >
                      📋 Storyboard
                    </button>
                    <button
                      onClick={() => setSoraFeature("watermark-remover")}
                      className={cn(
                        "py-3 px-4 rounded-lg text-sm font-bold transition-all border",
                        soraFeature === "watermark-remover"
                          ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                    >
                      🔧 Watermark
                    </button>
                  </div>
                </div>
              )}

            {/* Quick Settings - Hide for Sora 2 watermark feature */}
            {!(
              selectedModel === "sora2" && soraFeature === "watermark-remover"
            ) && (
              <div
                className={cn(
                  "grid gap-4 mb-6",
                  // Dinamik grid: Kaç ayar görünüyorsa o kadar kolon
                  (() => {
                    let settingsCount = 0;
                    if (selectedModelData?.supportedAspectRatios)
                      settingsCount++;
                    // Storyboard için duration yerine n_frames kullanımı olacağı için gizlenecek
                    if (
                      selectedModelData?.supportedDurations &&
                      !(
                        selectedModel === "sora2" &&
                        soraFeature === "storyboard"
                      )
                    )
                      settingsCount++;
                    if (
                      selectedModelData?.supportedQualities &&
                      selectedModelData.supportedQualities.length > 0
                    )
                      settingsCount++;
                    if (
                      (selectedModelData as any)?.supportedResolutions &&
                      (selectedModelData as any).supportedResolutions.length > 0
                    )
                      settingsCount++; // Added resolution to count
                    return settingsCount === 1
                      ? "grid-cols-1"
                      : settingsCount === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 md:grid-cols-4"; // Optimized grid
                  })()
                )}
              >
                {/* Aspect Ratio */}
                {selectedModelData?.supportedAspectRatios && (
                  <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                      Oran
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedModelData.supportedAspectRatios
                        .slice(0, 4)
                        .map((ratio: string) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={cn(
                              "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border min-w-[60px]", // More flex button
                              aspectRatio === ratio
                                ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            )}
                          >
                            {ratio}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Duration - Hide if only 'auto' is supported (for Veo 3.1) */}
                {selectedModelData?.supportedDurations &&
                  !(
                    selectedModelData.supportedDurations.length === 1 &&
                    selectedModelData.supportedDurations[0] === "auto"
                  ) && (
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                        Süre
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedModelData.supportedDurations.slice(0, 4).map(
                          (
                            dur: string // Increased slice to 4
                          ) => (
                            <button
                              key={dur}
                              onClick={() => setDuration(dur)}
                              className={cn(
                                "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border min-w-[60px]",
                                duration === dur
                                  ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              )}
                            >
                              {dur === "auto" ? "Oto" : dur + "s"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Quality */}
                {selectedModelData?.supportedQualities &&
                  selectedModelData.supportedQualities.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                        Kalite
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedModelData.supportedQualities
                          .slice(0, 4)
                          .map((qual: string) => (
                            <button
                              key={qual}
                              onClick={() => setQuality(qual)}
                              className={cn(
                                "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border min-w-[80px]",
                                quality === qual
                                  ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              )}
                            >
                              {QUALITY_LABELS[qual] || qual}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Resolution (NEW) */}
                {(selectedModelData as any)?.supportedResolutions &&
                  (selectedModelData as any).supportedResolutions.length >
                    0 && (
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                        Çözünürlük
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(selectedModelData as any).supportedResolutions
                          .slice(0, 3)
                          .map((res: string) => (
                            <button
                              key={res}
                              onClick={() => setResolution(res)}
                              className={cn(
                                "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border min-w-[70px]",
                                resolution === res
                                  ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              )}
                            >
                              {res}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Audio Toggle */}
            {selectedModel !== "sora2" &&
              (selectedModelData as any)?.hasAudioSupport && (
                <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        enableAudio
                          ? "bg-[#7C3AED]/20 text-[#7C3AED]"
                          : "bg-white/10 text-white/40"
                      )}
                    >
                      {enableAudio ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm">Ses Üretimi</div>
                      <div className="text-xs text-white/40">
                        Videoya uygun ses efekti oluştur
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnableAudio(!enableAudio)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      enableAudio ? "bg-[#7C3AED]" : "bg-white/20"
                    )}
                  >
                    <motion.div
                      animate={{ x: enableAudio ? 24 : 0 }}
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              )}

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={
                generateMutation.isPending ||
                isUploading ||
                !prompt.trim() ||
                (generationType === "image-to-video" && !imageFile) ||
                (generationType === "reference-to-video" &&
                  imageFiles.length === 0) ||
                !!(
                  currentVideoId &&
                  statusData?.status !== "completed" &&
                  statusData?.status !== "failed"
                )
              }
              className={cn(
                "w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3",
                generateMutation.isPending ||
                  isUploading ||
                  !prompt.trim() ||
                  (generationType === "image-to-video" && !imageFile) ||
                  (generationType === "reference-to-video" &&
                    imageFiles.length === 0)
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#7C3AED] to-[#FF2E97] text-[#F9FAFB] shadow-lg shadow-[#7C3AED]/50 hover:shadow-xl hover:shadow-[#7C3AED]/60"
              )}
              whileTap={{ scale: 0.98 }}
            >
              {generateMutation.isPending
                ? t("video.generating")
                : isUploading
                  ? t("video.uploading")
                  : `${t("video.generate")} (${displayCreditCost} kredi)`}
            </motion.button>
          </div>

          {/* Recent Generations */}
          {videoHistoryQuery.data?.videos &&
            videoHistoryQuery.data.videos.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Son Oluşturulanlar</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {videoHistoryQuery.data.videos.slice(0, 4).map((vid: any) => (
                    <div
                      key={vid.id}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      {vid.status === "completed" && vid.videoUrl ? (
                        <video
                          src={vid.videoUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : vid.status === "processing" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Dialogs */}
      {showCreditsDialog && (
        <InsufficientCreditsDialog
          isOpen={showCreditsDialog}
          onClose={() => setShowCreditsDialog(false)}
          creditsNeeded={creditCost || 50}
          currentCredits={user?.credits || 0}
          userId={user?.id || ""}
        />
      )}
    </div>
  );
}
