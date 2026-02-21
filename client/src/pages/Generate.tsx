// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Loader2,
  X,
  Sparkles,
  Settings2,
  Image as ImageIcon,
  Check,
  Wand2,
  ChevronDown,
  Zap,
  Upload,
} from "lucide-react";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import Header from "@/components/Header";
import GenerationLoadingCard from "@/components/GenerationLoadingCard";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
  { value: "3:2", label: "3:2" },
  { value: "2:3", label: "2:3" },
  { value: "21:9", label: "21:9" },
];

const RESOLUTIONS = [
  { value: "1K", label: "1K" },
  { value: "2K", label: "2K" },
  { value: "4K", label: "4K" },
];

const SEEDREAM_QUALITIES = [
  { value: "basic", label: "Basic" },
  { value: "high", label: "High" },
];

const MODEL_DISPLAY_INFO: Record<string, { icon: string }> = {
  "nano-banana-pro": { icon: "🍌" },
  seedream: { icon: "🌱" },
  qwen: { icon: "🎨" },
  "qwen/text-to-image": { icon: "🎨" },
  "qwen-image": { icon: "🎨" },
  "qwen-image-edit": { icon: "✏️" },
  "qwen-image-to-image": { icon: "🖼️" },
  "qwen/image-edit": { icon: "✏️" },
  "qwen/image-to-image": { icon: "🖼️" },
  "flux-2-pro": { icon: "⚡" },
  "google-imagen4": { icon: "🎭" },
  "ideogram-character": { icon: "👤" },
  "grok-imagine": { icon: "🤖" },
};

const QWEN_EDIT_MODEL_KEYS = new Set([
  "qwen-image-edit",
  "qwen/image-edit",
  "qwen-image-to-image",
  "qwen/image-to-image",
]);

const QWEN_TEXT_MODEL_KEYS = new Set([
  "qwen",
  "qwen-image",
  "qwen/text-to-image",
]);

const isQwenTextModelKey = (modelKey: string) =>
  QWEN_TEXT_MODEL_KEYS.has(modelKey);
const isQwenEditModelKey = (modelKey: string) =>
  QWEN_EDIT_MODEL_KEYS.has(modelKey);

export default function Generate() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<
    | "1:1"
    | "16:9"
    | "9:16"
    | "4:3"
    | "3:4"
    | "3:2"
    | "2:3"
    | "21:9"
    | "4:5"
    | "5:4"
  >("1:1");
  const [resolution, setResolution] = useState<"1K" | "2K" | "4K">("2K");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiModel, setAiModel] = useState<string>("nano-banana-pro");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // For SeeDream 4.5 and QWEN Edit Mode

  const creditsQuery = trpc.generation.getCredits.useQuery();
  const creditCostsQuery = trpc.generation.getCreditCosts.useQuery();
  const historyQuery = trpc.generation.getHistory.useQuery({ limit: 8 });
  const { data: publicModels } = trpc.settings.getPublicModels.useQuery();
  const utils = trpc.useUtils();

  const activeImageModels = publicModels?.imageModels || [];
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  // Handle auth redirect - must be before any conditional returns
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

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

  // Update aspect ratio and resolution when model changes
  useEffect(() => {
    const selectedModelData = activeImageModels.find(
      m => m.modelKey === aiModel
    );
    if (selectedModelData) {
      const supportedRatios = selectedModelData.supportedAspectRatios || [
        "1:1",
        "16:9",
        "9:16",
      ];
      if (!supportedRatios.includes(aspectRatio)) {
        setAspectRatio(
          selectedModelData.defaultAspectRatio || supportedRatios[0] || "1:1"
        );
      }

      const supportedResolutions = selectedModelData.supportedResolutions || [
        "1K",
        "2K",
      ];
      if (!supportedResolutions.includes(resolution)) {
        setResolution(
          selectedModelData.defaultResolution || supportedResolutions[0] || "1K"
        );
      }

      // Clear reference images if exceeding the new model's limit
      const maxImages =
        aiModel === "nano-banana-pro"
          ? 8
          : isQwenEditModelKey(aiModel) ||
              (isQwenTextModelKey(aiModel) && isEditMode)
            ? 1
            : 3;
      if (referenceImages.length > maxImages) {
        setReferenceImages([]);
        toast.info(t("generate.modelChangedRefCleared", { limit: maxImages }));
      }

      // Reset edit mode when switching away from models that support edit toggle
      if (aiModel !== "seedream" && !isQwenTextModelKey(aiModel)) {
        setIsEditMode(false);
      }
    }
  }, [aiModel, activeImageModels, isEditMode, t]);

  // Clear reference images when edit mode is toggled off for SeeDream
  useEffect(() => {
    if (
      (aiModel === "seedream" || isQwenTextModelKey(aiModel)) &&
      !isEditMode &&
      referenceImages.length > 0
    ) {
      setReferenceImages([]);
    }
  }, [isEditMode, aiModel]);

  const calculateCreditsNeeded = (
    modelId: string,
    res: string,
    editModeEnabled: boolean
  ) => {
    if (modelId === "seedream") {
      const quality = res === "4K" ? "high" : "basic";
      return creditCostsQuery.data?.seedream?.[quality] || 8;
    }
    if (isQwenTextModelKey(modelId) && editModeEnabled) {
      return creditCostsQuery.data?.allModels?.["qwen/image-edit"] || 10;
    }
    if (modelId === "nano-banana-pro") {
      return creditCostsQuery.data?.["nano-banana-pro"]?.[res] || 12;
    }
    if (isQwenTextModelKey(modelId)) {
      return creditCostsQuery.data?.qwen?.[res] || 10;
    }

    if (creditCostsQuery.data?.allModels?.[modelId]) {
      return creditCostsQuery.data.allModels[modelId];
    }

    return 10;
  };

  const generateMutation = trpc.generation.generateImage.useMutation();
  const enhancePromptMutation = trpc.promptEnhancer.enhance.useMutation({
    onSuccess: data => {
      setPrompt(data.enhanced);
      toast.success(t("generate.promptEnhanced"));
    },
  });

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!prompt.trim()) {
      toast.error(t("generate.promptRequiredMsg"));
      return;
    }

    // Validate edit mode for SeeDream
    if (aiModel === "seedream" && isEditMode && referenceImages.length === 0) {
      toast.error(t("generate.editModeRefRequired"));
      return;
    }

    // Validate required images for Qwen edit flow
    if (
      (isQwenEditModelKey(aiModel) ||
        (isQwenTextModelKey(aiModel) && isEditMode)) &&
      referenceImages.length === 0
    ) {
      toast.error(
        "Qwen Image Edit için en az 1 referans görsel yüklemelisiniz."
      );
      return;
    }

    const creditsNeeded = calculateCreditsNeeded(
      aiModel,
      resolution,
      isEditMode
    );
    if (!creditsQuery.data || creditsQuery.data.credits < creditsNeeded) {
      setShowInsufficientCreditsDialog(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl("");

    try {
      let uploadedImageUrls: string[] = [];
      if (referenceImages.length > 0) {
        setIsUploading(true);
        for (let i = 0; i < referenceImages.length; i++) {
          const formData = new FormData();
          formData.append("file", referenceImages[i]);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error(t("generate.uploadFailed"));
          const data = await response.json();
          uploadedImageUrls.push(data.url);
        }
        setIsUploading(false);
      }

      const resolvedModelForRequest =
        isQwenTextModelKey(aiModel) && isEditMode ? "qwen/image-edit" : aiModel;

      const result = await generateMutation.mutateAsync({
        prompt: prompt,
        aspectRatio,
        resolution,
        referenceImageUrls:
          uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        aiModel: resolvedModelForRequest as any,
        isEditMode:
          (aiModel === "seedream" ||
            (isQwenTextModelKey(aiModel) && isEditMode)) &&
          isEditMode
            ? true
            : undefined,
      });

      if (result.success) {
        toast.success(t("generate.generationStarted"));
        creditsQuery.refetch();
        utils.generation.getHistory.invalidate();
        setIsGenerating(false);
      }
    } catch (error: any) {
      setIsGenerating(false);
      toast.error(error.message || t("generate.errorOccurred"));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check max file count
    // 8 for nano-banana-pro, 1 for qwen-image-edit, 3 for others
    const maxImages =
      aiModel === "nano-banana-pro"
        ? 8
        : isQwenEditModelKey(aiModel) ||
            (isQwenTextModelKey(aiModel) && isEditMode)
          ? 1
          : 3;

    if (files.length + referenceImages.length > maxImages) {
      toast.error(t("generate.maxImagesError", { max: maxImages }));
      return;
    }

    // Check individual file size (max 20MB each)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    const invalidFiles = files.filter(file => file.size > MAX_FILE_SIZE);

    if (invalidFiles.length > 0) {
      toast.error(t("generate.fileSizeError", { count: invalidFiles.length }));
      return;
    }

    setReferenceImages([...referenceImages, ...files]);
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-neon-brand" />
      </div>
    );

  if (!isAuthenticated) {
    return null;
  }

  const selectedModel = activeImageModels.find(m => m.modelKey === aiModel) ||
    activeImageModels[0] || {
      modelKey: aiModel,
      modelName: "Unknown",
      provider: "Unknown",
      supportedAspectRatios: ["1:1"],
      supportedResolutions: ["1K"],
    };
  const creditsNeeded = calculateCreditsNeeded(aiModel, resolution, isEditMode);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB]">
      <Header />

      {/* Main Container */}
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section with Credits */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                {t("generate.title")}
              </h1>
              <p className="text-white/40 text-sm">{t("generate.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <Zap className="w-4 h-4 text-neon-brand" />
              <span className="text-lg font-bold text-neon-brand">
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
                  <div className="w-10 h-10 rounded-lg bg-neon-brand/10 flex items-center justify-center text-xl">
                    {MODEL_DISPLAY_INFO[selectedModel.modelKey]?.icon || "✨"}
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{selectedModel.modelName}</div>
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
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="mt-2 p-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl max-h-64 overflow-y-auto custom-scrollbar"
                  >
                    <div className="space-y-1">
                      {activeImageModels.map(model => {
                        const displayInfo = MODEL_DISPLAY_INFO[
                          model.modelKey
                        ] || { icon: "✨" };
                        const isInMaintenance = model.isMaintenanceMode;
                        const isDisabled = isInMaintenance;

                        return (
                          <button
                            key={model.modelKey}
                            onClick={() =>
                              !isDisabled &&
                              (setAiModel(model.modelKey),
                              setShowModelSelector(false))
                            }
                            disabled={isDisabled}
                            className={cn(
                              "w-full text-left p-3 rounded-xl transition-all",
                              isDisabled && "opacity-50 cursor-not-allowed",
                              !isDisabled && "hover:bg-white/5",
                              !isDisabled &&
                                aiModel === model.modelKey &&
                                "bg-white/10"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{displayInfo.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "text-sm font-bold",
                                      !isDisabled && aiModel === model.modelKey
                                        ? "text-neon-brand"
                                        : "text-[#F9FAFB]"
                                    )}
                                  >
                                    {model.modelName}
                                  </div>
                                  {isInMaintenance && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/20 text-orange-400 rounded uppercase">
                                      {t("generate.maintenance")}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/40">
                                  {model.provider}
                                </div>
                              </div>
                              {!isDisabled && aiModel === model.modelKey && (
                                <Check className="w-4 h-4 text-neon-brand" />
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

            {/* Prompt Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  {t("generate.promptLabel")}
                </label>
                <button
                  onClick={() =>
                    enhancePromptMutation.mutate({ prompt, model: "general" })
                  }
                  disabled={enhancePromptMutation.isPending || !prompt.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {enhancePromptMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  {t("generate.enhance")}
                </button>
              </div>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={t("generate.promptPlaceholder")}
                className="bg-white/5 border-white/10 focus:border-neon-brand/50 resize-none text-base min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Edit Mode Toggle for SeeDream and Qwen text models */}
            {(aiModel === "seedream" || isQwenTextModelKey(aiModel)) && (
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="font-bold text-sm mb-1">
                      {t("generate.editMode")}
                    </div>
                    <div className="text-xs text-white/40">
                      {t("generate.editModeDesc")}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-all",
                      isEditMode ? "bg-neon-brand" : "bg-white/20"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                        isEditMode && "translate-x-6"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Reference Images Upload for SeeDream Edit Mode */}
            {aiModel === "seedream" && isEditMode && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("generate.referenceRequired")}
                </label>
                <p className="text-xs text-white/40 mb-3">
                  {t("generate.seeDreamRefHint", {
                    model: "SeeDream",
                  })}
                </p>

                {/* Upload Button */}
                {referenceImages.length < 3 && (
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all mb-3">
                    <Upload className="w-5 h-5 text-white/40" />
                    <span className="text-sm text-white/60">
                      {t("generate.uploadImage")} ({referenceImages.length}/3)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Uploaded Images Grid */}
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {referenceImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reference Images Upload for Qwen Edit Models */}
            {(isQwenEditModelKey(aiModel) ||
              (isQwenTextModelKey(aiModel) && isEditMode)) && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("generate.referenceRequired")}
                </label>
                <p className="text-xs text-white/40 mb-3">
                  Qwen Image Edit için 1 adet referans görsel yükleyin.
                </p>

                {/* Upload Button */}
                {referenceImages.length < 1 && (
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all mb-3">
                    <Upload className="w-5 h-5 text-white/40" />
                    <span className="text-sm text-white/60">
                      {t("generate.uploadImage")} ({referenceImages.length}/1)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Uploaded Images Grid */}
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {referenceImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reference Images Upload for Nano Banana Pro */}
            {aiModel === "nano-banana-pro" && (
              <div className="mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("generate.referenceOptional")}
                </label>
                <p className="text-xs text-white/40 mb-3">
                  {t("generate.uploadRefHint", { max: 8 })}
                </p>

                {/* Upload Button */}
                {referenceImages.length < 8 && (
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all mb-3">
                    <Upload className="w-5 h-5 text-white/40" />
                    <span className="text-sm text-white/60">
                      {t("generate.uploadImage")} ({referenceImages.length}/8)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Uploaded Images Grid */}
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {referenceImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reference Images Display (for other models that have uploaded images) */}
            {![
              "nano-banana-pro",
              "seedream-edit",
              "seedream",
              "qwen-image-edit",
              "qwen-image-to-image",
              "qwen/text-to-image",
              "qwen-image",
              "qwen",
              "bytedance/seedream-v4-edit",
              "bytedance/seedream-4.5-edit",
              "qwen/image-edit",
              "qwen/image-to-image",
            ].includes(aiModel) &&
              referenceImages.length > 0 && (
                <div className="mb-6">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                    {t("generate.referenceImages")}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {referenceImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Quick Settings */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Aspect Ratio */}
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("generate.aspectRatio")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ASPECT_RATIOS.filter(ratio =>
                    (selectedModel.supportedAspectRatios || ["1:1"]).includes(
                      ratio.value
                    )
                  )
                    .slice(0, 4)
                    .map(ratio => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-bold transition-all border",
                          aspectRatio === ratio.value
                            ? "bg-neon-brand/20 border-neon-brand text-neon-brand"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        )}
                      >
                        {ratio.value}
                      </button>
                    ))}
                </div>
              </div>

              {/* Resolution / Quality */}
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                  {t("generate.quality")}
                </label>
                <div
                  className={cn(
                    "grid gap-2",
                    aiModel === "seedream" ? "grid-cols-2" : "grid-cols-3"
                  )}
                >
                  {aiModel === "seedream"
                    ? // SeeDream specific qualities
                      SEEDREAM_QUALITIES.map(quality => (
                        <button
                          key={quality.value}
                          onClick={() =>
                            setResolution(
                              quality.value === "high" ? "4K" : "2K"
                            )
                          }
                          className={cn(
                            "py-2 px-3 rounded-lg text-xs font-bold transition-all border",
                            (quality.value === "high" && resolution === "4K") ||
                              (quality.value === "basic" && resolution !== "4K")
                              ? "bg-neon-brand/20 border-neon-brand text-neon-brand"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          )}
                        >
                          {quality.label}
                        </button>
                      ))
                    : // Standard resolutions for other models
                      RESOLUTIONS.filter(res =>
                        (selectedModel.supportedResolutions || ["1K"]).includes(
                          res.value
                        )
                      ).map(res => (
                        <button
                          key={res.value}
                          onClick={() => setResolution(res.value)}
                          className={cn(
                            "py-2 px-3 rounded-lg text-xs font-bold transition-all border",
                            resolution === res.value
                              ? "bg-neon-brand/20 border-neon-brand text-neon-brand"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          )}
                        >
                          {res.value}
                        </button>
                      ))}
                </div>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/60 transition-colors mb-4"
            >
              <Settings2 className="w-3 h-3" />
              {t("generate.advancedSettings")}
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  showAdvancedSettings && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showAdvancedSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  {/* Full Aspect Ratio Grid */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                      {t("generate.allAspectRatios")}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                      {ASPECT_RATIOS.filter(ratio =>
                        (
                          selectedModel.supportedAspectRatios || ["1:1"]
                        ).includes(ratio.value)
                      ).map(ratio => (
                        <button
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value)}
                          className={cn(
                            "py-2 rounded-lg text-xs font-bold transition-all border",
                            aspectRatio === ratio.value
                              ? "bg-neon-brand/20 border-neon-brand text-neon-brand"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          )}
                        >
                          {ratio.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Reference Images - Only for models without dedicated upload sections */}
                  {![
                    "nano-banana-pro",
                    "seedream-edit",
                    "seedream",
                    "qwen",
                    "qwen-image",
                    "qwen/text-to-image",
                    "qwen-image-edit",
                    "qwen-image-to-image",
                    "bytedance/seedream-v4-edit",
                    "bytedance/seedream-4.5-edit",
                    "qwen/image-edit",
                    "qwen/image-to-image",
                  ].includes(aiModel) && (
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">
                        {t("generate.referenceOptional")}
                      </label>
                      <p className="text-xs text-white/40 mb-3">
                        {t("generate.uploadRefHint", { max: 3 })}
                      </p>
                      <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 cursor-pointer transition-all">
                        <Upload className="w-5 h-5 text-white/40" />
                        <span className="text-sm text-white/60">
                          {t("generate.uploadImage")} ({referenceImages.length}
                          /3)
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || isUploading || !prompt.trim()}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                isGenerating || isUploading || !prompt.trim()
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-neon-brand to-[#FF2E97] text-[#F9FAFB] shadow-lg shadow-neon-brand/50 hover:shadow-xl hover:shadow-neon-brand/60"
              )}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating || isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>
                    {isUploading
                      ? t("generate.uploading")
                      : t("generate.generating")}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{t("generate.title")}</span>
                  <span className="text-sm font-normal opacity-80">
                    • {creditsNeeded} {t("nav.creditsSuffix")}
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* Recent Generations */}
          {historyQuery.data?.images && historyQuery.data.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">
                {t("generate.recentGenerations")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {historyQuery.data.images.slice(0, 4).map((img: any) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    {img.status === "completed" && img.generatedImageUrl ? (
                      <img
                        src={img.generatedImageUrl}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    ) : img.status === "processing" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/20" />
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
      {showInsufficientCreditsDialog && (
        <InsufficientCreditsDialog
          isOpen={showInsufficientCreditsDialog}
          onClose={() => setShowInsufficientCreditsDialog(false)}
        />
      )}
    </div>
  );
}
