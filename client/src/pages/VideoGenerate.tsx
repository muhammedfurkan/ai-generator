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
  ChevronRight,
  Zap,
  Upload,
  Check,
  Wand2,
  Settings2,
  Play,
  Search,
  Plus,
  Trash2,
  Film,
  Users,
  Volume2,
  Diamond,
  Clock,
  Star,
} from "lucide-react";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import Header from "@/components/Header";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const MODEL_DISPLAY_INFO: Record<
  string,
  { icon: string; color: string; isNew?: boolean; isFeatured?: boolean }
> = {
  veo3: { icon: "🎬", color: "#4285F4", isFeatured: true },
  sora2: { icon: "🎥", color: "#10A37F", isFeatured: true },
  "sora-2-pro": { icon: "🎥", color: "#10A37F", isFeatured: true },
  "sora-2-pro-storyboard": { icon: "📖", color: "#10A37F" },
  "sora-watermark-remover": { icon: "✨", color: "#10A37F" },
  kling: { icon: "⚡", color: "#F59E0B" },
  "kling-2.5": { icon: "⚡", color: "#F59E0B" },
  "kling-30": { icon: "🔥", color: "#FF6B00", isNew: true },
  "wan-2.2": { icon: "🐉", color: "#EF4444" },
  "wan-2.5": { icon: "🐉", color: "#EF4444" },
  "wan-2.6": { icon: "🐉", color: "#EF4444", isNew: true },
  "wan-26": { icon: "🐉", color: "#EF4444" },
  grok: { icon: "🤖", color: "#8B5CF6" },
  hailuo: { icon: "🎭", color: "#EC4899" },
  "hailuo-2.3": { icon: "🎭", color: "#EC4899" },
  "seedance-lite": { icon: "🌱", color: "#22C55E", isNew: true },
  "seedance-pro": { icon: "💎", color: "#06B6D4", isNew: true },
  "seedance-15-pro": { icon: "🚀", color: "#7C3AED", isNew: true },
  "seedance/1.5-pro": { icon: "🚀", color: "#7C3AED", isNew: true },
};

// Company grouping for "Other models" section
const COMPANY_GROUP_INFO: Record<
  string,
  { label: string; description: string; icon: string; color: string; order: number }
> = {
  Google: { label: "Google Veo", description: "Precision video with sound control", icon: "🎬", color: "#4285F4", order: 1 },
  OpenAI: { label: "OpenAI Sora 2", description: "Multi-shot video with sound generation", icon: "🎥", color: "#10A37F", order: 2 },
  Kuaishou: { label: "Kling", description: "Perfect motion with advanced video control", icon: "⚡", color: "#F59E0B", order: 3 },
  Alibaba: { label: "Wan", description: "Camera-controlled video with sound, more freedom", icon: "🐉", color: "#EF4444", order: 4 },
  ByteDance: { label: "Seedance", description: "Cinematic, multi-shot video creation", icon: "🌱", color: "#06B6D4", order: 5 },
  MiniMax: { label: "Minimax Hailuo", description: "High-dynamic, VFX-ready, fastest and most affordable", icon: "🎭", color: "#EC4899", order: 6 },
  Other: { label: "Diğer Araçlar", description: "Ek video araçları ve yardımcılar", icon: "🔧", color: "#6B7280", order: 99 },
};

/** Featured models threshold - priority <= this value shown in Featured section */
const FEATURED_PRIORITY_THRESHOLD = 2;

/** Extract company name from provider string like "Kie AI (Google)" → "Google" */
function extractCompany(provider: string): string {
  const match = provider.match(/\(([^)]+)\)/);
  return match ? match[1] : "Other";
}

/** Format duration range from supported durations array */
function formatDurationRange(durations?: string[]): string | null {
  if (!durations || durations.length === 0) return null;
  const nums = durations.map(d => parseInt(d.replace('s', ''))).filter(n => !isNaN(n)).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  if (nums.length === 1) return `${nums[0]}s`;
  return `${nums[0]}s-${nums[nums.length - 1]}s`;
}

/** Get best resolution from supported resolutions */
function getResolutionLabel(resolutions?: string[]): string | null {
  if (!resolutions || resolutions.length === 0) return null;
  // Prefer showing the highest
  const order = ['4K', '2K', '1080p', '720p', '480p'];
  for (const r of order) {
    if (resolutions.includes(r)) return r;
  }
  return resolutions[0];
}

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
  const [modelSearch, setModelSearch] = useState("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Kling 3.0 Multi-shot state
  const [multiShotEnabled, setMultiShotEnabled] = useState(false);
  const [multiPrompts, setMultiPrompts] = useState<
    { prompt: string; duration: number }[]
  >([{ prompt: "", duration: 3 }]);

  // Kling 3.0 Element references state
  const [klingElements, setKlingElements] = useState<
    {
      name: string;
      description: string;
      imageUrls: string[];
      videoUrls: string[];
    }[]
  >([]);

  // Expanded company groups in "Other models" section
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

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
        setModelSearch("");
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
      // Kling 2.6 ve 3.0 için ses varsayılan olarak açık
      else if (selectedModel === "kling" || selectedModel === "kling-30") {
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

      // Reset Kling 3.0 multi-shot/element state when switching away
      if (selectedModel !== "kling-30") {
        setMultiShotEnabled(false);
        setMultiPrompts([{ prompt: "", duration: 3 }]);
        setKlingElements([]);
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
      generationType: generationType as any,
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
      // Kling 3.0 multi-shot & element references
      ...(selectedModel === "kling-30" && multiShotEnabled
        ? {
            multiShots: true,
            multiPrompt: multiPrompts.filter(s => s.prompt.trim().length > 0),
          }
        : {}),
      ...(selectedModel === "kling-30" && klingElements.length > 0
        ? {
            klingElements: klingElements
              .filter(el => el.name.trim() && el.description.trim())
              .map(el => ({
                name: el.name,
                description: el.description,
                ...(el.imageUrls.length > 0
                  ? { element_input_urls: el.imageUrls }
                  : {}),
                ...(el.videoUrls.length > 0
                  ? { element_input_video_urls: el.videoUrls }
                  : {}),
              })),
          }
        : {}),
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
    <div className="min-h-screen bg-[#080808] text-[#F9FAFB] overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
          style={{
            background: MODEL_DISPLAY_INFO[selectedModel]?.color || "#7C3AED",
          }}
        />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px] bg-[#FF2E97]" />
      </div>

      <Header />

      <div className="pt-16 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#FF2E97] flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">{t("video.title")}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="text-sm font-bold text-white">
              {user?.credits ?? 0}
            </span>
            <span className="text-xs text-white/30">kredi</span>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col lg:flex-row flex-1 gap-0">
          {/* ── LEFT PANEL ── */}
          <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 border-r border-white/[0.06] flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Model Selector */}
              <div className="mb-6 relative" ref={modelSelectorRef}>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                  {t("generate.modelLabel")}
                </label>
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/15 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{
                        background: `${MODEL_DISPLAY_INFO[selectedModelData?.modelKey || selectedModel]?.color || "#7C3AED"}20`,
                      }}
                    >
                      {MODEL_DISPLAY_INFO[
                        selectedModelData?.modelKey || selectedModel
                      ]?.icon || "🎬"}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm leading-tight">
                        {selectedModelData?.modelName || t("video.selectModel")}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-white/30 transition-transform group-hover:text-white/50",
                      showModelSelector && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {showModelSelector && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                          setShowModelSelector(false);
                          setModelSearch("");
                        }}
                      />
                      {/* Modal */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-0 right-0 z-50 mt-2 p-4 bg-[#0D0D0D]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl min-w-[340px] lg:min-w-[420px]"
                      >
                        {/* Search */}
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={modelSearch}
                            onChange={e => setModelSearch(e.target.value)}
                            placeholder="Ara..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                          />
                          {modelSearch && (
                            <button
                              onClick={() => setModelSearch("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 hover:text-white/60 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Higgsfield-style vertical model list */}
                        <div className="max-h-[65vh] overflow-y-auto -mx-1 px-1">
                          {(() => {
                            const filteredModels = activeVideoModels
                              .filter(model => !model.isMaintenanceMode)
                              .filter(model => {
                                if (!modelSearch.trim()) return true;
                                const q = modelSearch.toLowerCase();
                                return (
                                  model.modelName.toLowerCase().includes(q) ||
                                  model.provider.toLowerCase().includes(q) ||
                                  model.modelKey.toLowerCase().includes(q)
                                );
                              });

                            if (filteredModels.length === 0 && modelSearch.trim()) {
                              return (
                                <div className="py-8 text-center text-white/30 text-sm">
                                  "<span className="text-white/50">{modelSearch}</span>" için sonuç bulunamadı
                                </div>
                              );
                            }

                            // Split into featured and other
                            const featuredModels = filteredModels.filter(
                              (m: any) => (m.priority ?? 99) <= FEATURED_PRIORITY_THRESHOLD
                            );

                            // Group ALL models by company for "Other models" section
                            const allGroups = new Map<string, typeof filteredModels>();
                            filteredModels.forEach((model: any) => {
                              const company = extractCompany(model.provider);
                              if (!allGroups.has(company)) {
                                allGroups.set(company, []);
                              }
                              allGroups.get(company)!.push(model);
                            });
                            const sortedOtherGroups = Array.from(allGroups.entries()).sort(
                              ([a], [b]) => (COMPANY_GROUP_INFO[a]?.order ?? 99) - (COMPANY_GROUP_INFO[b]?.order ?? 99)
                            );

                            // Render a single model row (used in both sections)
                            const renderModelRow = (model: any) => {
                              const displayInfo = MODEL_DISPLAY_INFO[model.modelKey] || { icon: "🎬", color: "#7C3AED" };
                              const isSelected = selectedModel === model.modelKey;
                              const hasAudio = (model as any).hasAudioSupport;
                              const durationRange = formatDurationRange((model as any).supportedDurations);
                              const resLabel = getResolutionLabel((model as any).supportedResolutions);

                              return (
                                <button
                                  key={model.modelKey}
                                  onClick={() => {
                                    setSelectedModel(model.modelKey);
                                    setShowModelSelector(false);
                                    setModelSearch("");
                                    setExpandedCompanies(new Set());
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                                    isSelected
                                      ? "bg-white/[0.08]"
                                      : "hover:bg-white/[0.04]"
                                  )}
                                >
                                  {/* Icon */}
                                  <div
                                    className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg border"
                                    style={{
                                      background: `${displayInfo.color}12`,
                                      borderColor: isSelected ? `${displayInfo.color}50` : `${displayInfo.color}20`,
                                    }}
                                  >
                                    {displayInfo.icon}
                                  </div>

                                  {/* Name + specs */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className={cn(
                                        "text-sm font-semibold truncate",
                                        isSelected ? "text-white" : "text-white/80 group-hover:text-white"
                                      )}>
                                        {model.modelName}
                                      </span>
                                      {hasAudio && (
                                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                      )}
                                      {displayInfo.isFeatured && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 flex-shrink-0 leading-none">
                                          EXCLUSIVE
                                        </span>
                                      )}
                                      {displayInfo.isNew && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C8FF00]/20 text-[#C8FF00] flex-shrink-0 leading-none">
                                          NEW
                                        </span>
                                      )}
                                      {!displayInfo.isNew && !displayInfo.isFeatured && (model as any).priority >= 3 && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 flex-shrink-0 leading-none">
                                          PREMIUM
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {resLabel && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-white/35 font-medium">
                                          <Diamond className="w-2.5 h-2.5" />
                                          {resLabel}
                                        </span>
                                      )}
                                      {durationRange && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-white/35 font-medium">
                                          <Clock className="w-2.5 h-2.5" />
                                          {durationRange}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Checkmark */}
                                  {isSelected && (
                                    <div
                                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                      style={{ background: displayInfo.color }}
                                    >
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </button>
                              );
                            };

                            return (
                              <>
                                {/* ── Featured models ── */}
                                {featuredModels.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 px-3 py-2">
                                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                                        Öne Çıkan Modeller
                                      </span>
                                    </div>
                                    <div className="space-y-0.5">
                                      {featuredModels.map(renderModelRow)}
                                    </div>
                                  </div>
                                )}

                                {/* ── Other models (grouped by company) ── */}
                                {sortedOtherGroups.length > 0 && (
                                  <div>
                                    {!modelSearch.trim() && (
                                      <div className="flex items-center gap-2 px-3 py-2 mt-1">
                                        <Film className="w-3.5 h-3.5 text-white/30" />
                                        <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                                          Diğer Modeller
                                        </span>
                                      </div>
                                    )}
                                    <div className="space-y-1">
                                      {sortedOtherGroups.map(([company, models]) => {
                                        const info = COMPANY_GROUP_INFO[company] || COMPANY_GROUP_INFO.Other;
                                        const isExpanded = expandedCompanies.has(company) || !!modelSearch.trim();

                                        return (
                                          <div key={company}>
                                            {/* Company header - clickable to expand */}
                                            <button
                                              onClick={() => {
                                                setExpandedCompanies(prev => {
                                                  const next = new Set(prev);
                                                  if (next.has(company)) next.delete(company);
                                                  else next.add(company);
                                                  return next;
                                                });
                                              }}
                                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
                                            >
                                              <div
                                                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg border"
                                                style={{
                                                  background: `${info.color}10`,
                                                  borderColor: `${info.color}20`,
                                                }}
                                              >
                                                {info.icon}
                                              </div>
                                              <div className="flex-1 min-w-0 text-left">
                                                <div className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                                                  {info.label}
                                                </div>
                                                <div className="text-[11px] text-white/30 truncate">
                                                  {info.description}
                                                </div>
                                              </div>
                                              <ChevronRight
                                                className={cn(
                                                  "w-4 h-4 text-white/20 transition-transform flex-shrink-0",
                                                  isExpanded && "rotate-90"
                                                )}
                                              />
                                            </button>

                                            {/* Expanded model list */}
                                            <AnimatePresence>
                                              {isExpanded && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: "auto", opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className="pl-4 space-y-0.5 pb-1">
                                                    {models.map(renderModelRow)}
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode Toggle - Hide for Sora 2 special features */}
              {!(selectedModel === "sora2" && soraFeature !== "default") && (
                <div className="">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                    {t("video.modeLabel")}
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(selectedModelData as any)?.supportsTextToVideo !==
                      false && (
                      <button
                        onClick={() => setGenerationType("text-to-video")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                          generationType === "text-to-video"
                            ? "bg-white/10 border-white/20 text-white"
                            : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                        )}
                      >
                        <Sparkles className="w-3 h-3" />
                        {t("video.textToVideo")}
                      </button>
                    )}
                    {(selectedModelData as any)?.supportsImageToVideo !==
                      false && (
                      <button
                        onClick={() => setGenerationType("image-to-video")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                          generationType === "image-to-video"
                            ? "bg-white/10 border-white/20 text-white"
                            : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                        )}
                      >
                        <Upload className="w-3 h-3" />
                        {t("video.imageToVideo")}
                      </button>
                    )}
                    {(selectedModelData as any)?.supportsReferenceVideo && (
                      <button
                        onClick={() => setGenerationType("reference-to-video")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                          generationType === "reference-to-video"
                            ? "bg-white/10 border-white/20 text-white"
                            : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                        )}
                      >
                        <Play className="w-3 h-3" />
                        {t("video.refToVideo")}
                      </button>
                    )}
                    {(selectedModelData as any)?.supportsVideoToVideo && (
                      <button
                        onClick={() => setGenerationType("video-to-video")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                          generationType === "video-to-video"
                            ? "bg-white/10 border-white/20 text-white"
                            : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                        )}
                      >
                        <Video className="w-3 h-3" />
                        {t("video.videoToVideo")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Image Upload for Image-to-Video (Single) */}
              {generationType === "image-to-video" && (
                <div className="">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                    {t("video.sourceImage")}
                  </label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden bg-black/30 border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Upload"
                        className="w-full h-40 object-contain"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.02] cursor-pointer transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white/30" />
                      </div>
                      <span className="text-xs text-white/40">
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
                <div className="">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                    {t("generate.referenceImages")} (Max 3)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
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
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {imageFiles.length < 3 && (
                      <label className="aspect-square flex flex-col items-center justify-center gap-1 border border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04]">
                        <Upload className="w-4 h-4 text-white/30" />
                        <span className="text-[10px] text-white/40">Ekle</span>
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
                </div>
              )}

              {/* Video Upload for Video-to-Video */}
              {generationType === "video-to-video" && (
                <div className="">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                    {t("video.sourceVideo")} (Max 50MB)
                  </label>
                  {videoPreview ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10">
                      <video
                        src={videoPreview}
                        className="w-full h-40 object-contain bg-black/50"
                        controls
                      />
                      <button
                        onClick={removeVideo}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.02] cursor-pointer transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Video className="w-5 h-5 text-white/30" />
                      </div>
                      <span className="text-xs text-white/40">Video Seç</span>
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
              <div className="">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                  Video Açıklaması
                </label>
                <div className="relative rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-white/20 transition-colors">
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={
                      generationType === "text-to-video"
                        ? t("video.placeholders.textToVideo")
                        : t("video.placeholders.imageToVideo")
                    }
                    className="bg-transparent border-0 focus-visible:ring-0 resize-none text-sm min-h-[140px] placeholder:text-white/20 p-4 pb-2"
                    rows={6}
                    maxLength={5000}
                  />
                  <div className="flex items-center justify-between px-4 pb-3 pt-1">
                    <span className="text-[11px] text-white/20">
                      {prompt.length}/5000
                    </span>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/40 hover:text-white/70 transition-all">
                      <Wand2 className="w-3 h-3" />
                      Geliştir
                    </button>
                  </div>
                </div>
              </div>

              {/* Sora 2 Characters - Character Prompt & Safety Instruction */}
              {selectedModel === "sora2" && soraFeature === "characters" && (
                <>
                  <div className="">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                      {t("video.sora.characterDescription")}
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder={t("video.placeholders.characterDesc")}
                      className="bg-white/[0.04] border-white/[0.08] focus:border-white/20 resize-none text-sm min-h-[90px]"
                      rows={4}
                      maxLength={5000}
                    />
                  </div>
                  <div className="">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                      {t("video.sora.safetyInstructions")}
                    </label>
                    <Textarea
                      value={(window as any).__sora_safety_instruction || ""}
                      onChange={e =>
                        ((window as any).__sora_safety_instruction =
                          e.target.value)
                      }
                      placeholder={t("video.placeholders.safetyInstructions")}
                      className="bg-white/[0.04] border-white/[0.08] focus:border-white/20 resize-none text-sm min-h-[70px]"
                      rows={3}
                      maxLength={5000}
                    />
                  </div>
                </>
              )}

              {/* Sora 2 Watermark - Video URL Input */}
              {selectedModel === "sora2" &&
                soraFeature === "watermark-remover" && (
                  <div className="">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                      {t("video.sora.videoURL")}
                    </label>
                    <input
                      type="url"
                      value={(window as any).__sora_video_url || ""}
                      onChange={e =>
                        ((window as any).__sora_video_url = e.target.value)
                      }
                      placeholder="https://sora.chatgpt.com/p/s_..."
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:border-white/20 focus:outline-none text-sm text-white placeholder:text-white/20"
                      maxLength={500}
                    />
                    <p className="text-[11px] text-white/25 mt-1.5">
                      {t("video.sora.watermarkHint")}
                    </p>
                  </div>
                )}

              {/* Sora 2 Storyboard - Multi-Image Upload */}
              {selectedModel === "sora2" && soraFeature === "storyboard" && (
                <div className="">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                    {t("video.sora.storyboardImages")}
                  </label>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
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
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all hover:bg-white/[0.02]">
                    <Upload className="w-4 h-4 text-white/30" />
                    <span className="text-xs text-white/40">
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
                  <div className="">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                      Özellik
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "default", label: "🎬 Standart" },
                        { key: "characters", label: "👤 Karakter" },
                        { key: "storyboard", label: "📋 Storyboard" },
                        { key: "watermark-remover", label: "🔧 Watermark" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setSoraFeature(key as any)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                            soraFeature === key
                              ? "bg-white/10 border-white/25 text-white"
                              : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quick Settings - Hide for Sora 2 watermark feature */}
              {!(
                selectedModel === "sora2" && soraFeature === "watermark-remover"
              ) && (
                <div className="space-y-3">
                  {/* Aspect Ratio */}
                  {selectedModelData?.supportedAspectRatios && (
                    <div>
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                        Oran
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedModelData.supportedAspectRatios
                          .slice(0, 5)
                          .map((ratio: string) => (
                            <button
                              key={ratio}
                              onClick={() => setAspectRatio(ratio)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border min-w-[50px]",
                                aspectRatio === ratio
                                  ? "bg-white/10 border-white/25 text-white"
                                  : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                              )}
                            >
                              {ratio}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {selectedModelData?.supportedDurations &&
                    !(
                      selectedModelData.supportedDurations.length === 1 &&
                      selectedModelData.supportedDurations[0] === "auto"
                    ) &&
                    !(
                      selectedModel === "sora2" && soraFeature === "storyboard"
                    ) && (
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                          Süre
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedModelData.supportedDurations
                            .slice(0, 5)
                            .map((dur: string) => (
                              <button
                                key={dur}
                                onClick={() => setDuration(dur)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border min-w-[50px]",
                                  duration === dur
                                    ? "bg-white/10 border-white/25 text-white"
                                    : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                                )}
                              >
                                {dur === "auto" ? "Oto" : dur + "s"}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Quality */}
                  {selectedModelData?.supportedQualities &&
                    selectedModelData.supportedQualities.length > 0 && (
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                          Kalite
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedModelData.supportedQualities
                            .slice(0, 4)
                            .map((qual: string) => (
                              <button
                                key={qual}
                                onClick={() => setQuality(qual)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                  quality === qual
                                    ? "bg-white/10 border-white/25 text-white"
                                    : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
                                )}
                              >
                                {QUALITY_LABELS[qual] || qual}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Resolution */}
                  {(selectedModelData as any)?.supportedResolutions &&
                    (selectedModelData as any).supportedResolutions.length >
                      0 && (
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">
                          Çözünürlük
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedModelData as any).supportedResolutions
                            .slice(0, 4)
                            .map((res: string) => (
                              <button
                                key={res}
                                onClick={() => setResolution(res)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                  resolution === res
                                    ? "bg-white/10 border-white/25 text-white"
                                    : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10"
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
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-base",
                          enableAudio
                            ? "bg-[#22C55E]/15 text-[#22C55E]"
                            : "bg-white/5 text-white/30"
                        )}
                      >
                        🔊
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-tight">
                          Ses Üretimi
                        </div>
                        <div className="text-[11px] text-white/30">
                          Videoya uygun ses efekti
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEnableAudio(!enableAudio)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        enableAudio ? "bg-[#22C55E]" : "bg-white/15"
                      )}
                    >
                      <motion.div
                        animate={{ x: enableAudio ? 20 : 1 }}
                        className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                )}

              {/* ── Kling 3.0 Multi-Shot Mode ── */}
              {selectedModel === "kling-30" && (
                <div className="space-y-3">
                  {/* Multi-shot Toggle */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-base",
                          multiShotEnabled
                            ? "bg-[#FF6B00]/15 text-[#FF6B00]"
                            : "bg-white/5 text-white/30"
                        )}
                      >
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-tight">
                          Multi-Shot
                        </div>
                        <div className="text-[11px] text-white/30">
                          Birden fazla sahne ile video
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setMultiShotEnabled(!multiShotEnabled)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        multiShotEnabled ? "bg-[#FF6B00]" : "bg-white/15"
                      )}
                    >
                      <motion.div
                        animate={{ x: multiShotEnabled ? 20 : 1 }}
                        className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  {/* Multi-shot Editor */}
                  <AnimatePresence>
                    {multiShotEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                          Sahneler ({multiPrompts.length})
                        </label>
                        {multiPrompts.map((shot, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-white/40">
                                Sahne {idx + 1}
                              </span>
                              {multiPrompts.length > 1 && (
                                <button
                                  onClick={() =>
                                    setMultiPrompts(prev =>
                                      prev.filter((_, i) => i !== idx)
                                    )
                                  }
                                  className="w-5 h-5 rounded-md bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
                                </button>
                              )}
                            </div>
                            <Textarea
                              value={shot.prompt}
                              onChange={e => {
                                const val = e.target.value;
                                setMultiPrompts(prev =>
                                  prev.map((s, i) =>
                                    i === idx ? { ...s, prompt: val } : s
                                  )
                                );
                              }}
                              placeholder={`Sahne ${idx + 1} açıklaması (max 500 karakter)`}
                              className="bg-transparent border-white/[0.06] focus-visible:ring-0 resize-none text-xs min-h-[60px] placeholder:text-white/15"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/30 whitespace-nowrap">
                                Süre:
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={12}
                                value={shot.duration}
                                onChange={e => {
                                  const val = parseInt(e.target.value);
                                  setMultiPrompts(prev =>
                                    prev.map((s, i) =>
                                      i === idx ? { ...s, duration: val } : s
                                    )
                                  );
                                }}
                                className="flex-1 h-1 accent-[#FF6B00]"
                              />
                              <span className="text-[11px] font-bold text-white/50 min-w-[28px] text-right">
                                {shot.duration}s
                              </span>
                            </div>
                          </div>
                        ))}
                        {multiPrompts.length < 10 && (
                          <button
                            onClick={() =>
                              setMultiPrompts(prev => [
                                ...prev,
                                { prompt: "", duration: 3 },
                              ])
                            }
                            className="w-full py-2 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-xs text-white/30 hover:text-white/60 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3 h-3" />
                            Sahne Ekle
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Kling 3.0 Element References ── */}
              {selectedModel === "kling-30" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Element Referansları
                    </label>
                    {klingElements.length < 5 && (
                      <button
                        onClick={() =>
                          setKlingElements(prev => [
                            ...prev,
                            {
                              name: "",
                              description: "",
                              imageUrls: [],
                              videoUrls: [],
                            },
                          ])
                        }
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-white/40 hover:text-white/70 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Ekle
                      </button>
                    )}
                  </div>
                  {klingElements.length === 0 && (
                    <div className="text-[11px] text-white/20 px-1">
                      Karakter/obje ekleyerek prompt'ta @isim ile referans
                      verebilirsiniz.
                    </div>
                  )}
                  <AnimatePresence>
                    {klingElements.map((element, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#FF6B00]/60" />
                            <span className="text-[11px] font-bold text-white/40">
                              Element {idx + 1}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setKlingElements(prev =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="w-5 h-5 rounded-md bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-white/30" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={element.name}
                          onChange={e => {
                            const val = e.target.value;
                            setKlingElements(prev =>
                              prev.map((el, i) =>
                                i === idx ? { ...el, name: val } : el
                              )
                            );
                          }}
                          placeholder="Element adı (ör: kedi)"
                          className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-white/15 outline-none focus:border-white/15 transition-colors"
                          maxLength={50}
                        />
                        <input
                          type="text"
                          value={element.description}
                          onChange={e => {
                            const val = e.target.value;
                            setKlingElements(prev =>
                              prev.map((el, i) =>
                                i === idx ? { ...el, description: val } : el
                              )
                            );
                          }}
                          placeholder="Açıklama (ör: turuncu kedi)"
                          className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-white/15 outline-none focus:border-white/15 transition-colors"
                          maxLength={200}
                        />
                        <div className="text-[10px] text-white/20">
                          Prompt'ta{" "}
                          <span className="text-[#FF6B00]/80 font-mono">
                            @{element.name || "isim"}
                          </span>{" "}
                          ile referans verin. 2-4 resim veya 1 video yükleyin.
                        </div>
                        {/* Element image upload */}
                        <div className="flex flex-wrap gap-1.5">
                          {element.imageUrls.map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 group"
                            >
                              <img
                                src={url}
                                alt={`Element ${idx + 1} ref ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  setKlingElements(prev =>
                                    prev.map((el, i) =>
                                      i === idx
                                        ? {
                                            ...el,
                                            imageUrls: el.imageUrls.filter(
                                              (_, j) => j !== imgIdx
                                            ),
                                          }
                                        : el
                                    )
                                  )
                                }
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                          {element.imageUrls.length < 4 &&
                            element.videoUrls.length === 0 && (
                              <label className="w-12 h-12 rounded-lg border border-dashed border-white/10 hover:border-white/20 flex items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
                                <Upload className="w-3.5 h-3.5 text-white/25" />
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  className="hidden"
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      const res = await fetch("/api/upload", {
                                        method: "POST",
                                        body: formData,
                                      });
                                      if (!res.ok)
                                        throw new Error("Upload failed");
                                      const data = await res.json();
                                      setKlingElements(prev =>
                                        prev.map((el, i) =>
                                          i === idx
                                            ? {
                                                ...el,
                                                imageUrls: [
                                                  ...el.imageUrls,
                                                  data.url,
                                                ],
                                              }
                                            : el
                                        )
                                      );
                                    } catch {
                                      toast.error("Resim yüklenemedi");
                                    }
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
            {/* end space-y-5 (scrollable content) */}

            {/* Generate Button - sticky at bottom of left panel */}
            <div className="p-5 border-t border-white/[0.06]">
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
                  "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  generateMutation.isPending ||
                    isUploading ||
                    !prompt.trim() ||
                    (generationType === "image-to-video" && !imageFile) ||
                    (generationType === "reference-to-video" &&
                      imageFiles.length === 0)
                    ? "bg-white/[0.06] text-white/25 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#7C3AED] to-[#FF2E97] text-white shadow-lg shadow-[#7C3AED]/30 hover:shadow-[#7C3AED]/50 hover:scale-[1.01]"
                )}
                whileTap={{ scale: 0.98 }}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("video.generating")}
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("video.uploading")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t("video.generate")} · {displayCreditCost} kredi
                  </>
                )}
              </motion.button>
            </div>
          </div>
          {/* end left panel */}

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 overflow-y-auto p-5">
            {videoHistoryQuery.data?.videos &&
            videoHistoryQuery.data.videos.length > 0 ? (
              <>
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">
                  Son Oluşturulanlar
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {videoHistoryQuery.data.videos.map((vid: any) => (
                    <div
                      key={vid.id}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-all"
                    >
                      {vid.status === "completed" && vid.videoUrl ? (
                        <>
                          <video
                            src={vid.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseEnter={e =>
                              (e.target as HTMLVideoElement).play()
                            }
                            onMouseLeave={e => {
                              const v = e.target as HTMLVideoElement;
                              v.pause();
                              v.currentTime = 0;
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : vid.status === "processing" ||
                        vid.status === "pending" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                          <span className="text-[10px] text-white/25">
                            İşleniyor
                          </span>
                        </div>
                      ) : vid.status === "failed" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[11px] text-red-400/60">
                            Başarısız
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-white/10" />
                        </div>
                      )}
                      {/* Model badge */}
                      {vid.modelType && (
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                          <span className="text-[9px] text-white/50 font-medium">
                            {vid.modelType}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Video className="w-7 h-7 text-white/15" />
                </div>
                <p className="text-white/20 text-sm font-medium">
                  Henüz video oluşturulmadı
                </p>
                <p className="text-white/10 text-xs mt-1">
                  Soldaki panelden başlayabilirsiniz
                </p>
              </div>
            )}
          </div>
          {/* end right panel */}
        </div>
        {/* end two-column */}
      </div>
      {/* end flex flex-col */}

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
