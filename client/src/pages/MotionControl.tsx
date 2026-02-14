import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  X,
  Sparkles,
  Zap,
  Video,
  Image as ImageIcon,
  Settings2,
  ChevronRight,
  Info,
  Play
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MotionControl() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  // State
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [mode, setMode] = useState<"standard" | "pro">("standard");
  const [characterOrientation, setCharacterOrientation] = useState<"image" | "video">("video");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(5); // Video süresini otomatik tespit edeceğiz
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const generateMutation = trpc.videoGeneration.generate.useMutation({
    onSuccess: (data) => {
      toast.success(t("motion.toast.generationStarted"));
      setTimeout(() => {
        navigate("/gallery");
      }, 1500);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error(error.message || t("motion.toast.generationFailed"));
    }
  });

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("motion.errors.invalidImage"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("motion.errors.imageTooLarge"));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error(t("motion.errors.invalidVideo"));
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit for reference video
        toast.error(t("motion.errors.videoTooLarge"));
        return;
      }

      // Video süresini ve çözünürlüğü otomatik tespit et
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.ceil(video.duration); // Yukarı yuvarla
        const width = video.videoWidth;
        const height = video.videoHeight;

        // Video çözünürlük kontrolü (minimum 720x720)
        if (width < 720 || height < 720) {
          toast.error(t("motion.errors.videoResolutionLow", { width: width.toString(), height: height.toString() }));
          setVideoFile(null);
          setVideoPreview(null);
          if (videoInputRef.current) videoInputRef.current.value = "";
          return;
        }

        // Video süresi kontrolü
        if (duration < 3) {
          toast.error(t("motion.errors.videoTooShort"));
          setVideoFile(null);
          setVideoPreview(null);
          if (videoInputRef.current) videoInputRef.current.value = "";
          return;
        }

        if (duration > 30) {
          toast.warning(t("motion.errors.videoTooLong"));
          setEstimatedDuration(30);
          setCharacterOrientation("video");
        } else {
          setEstimatedDuration(duration);
          // 10 saniyeden uzun videolar için "video" yönelimi öner
          if (duration > 10) {
            setCharacterOrientation("video");
          }
        }

        // Başarılı yükleme mesajı
        toast.success(t("motion.toast.videoUploaded", { width: width.toString(), height: height.toString(), duration: duration.toString() }));
      }
      video.src = URL.createObjectURL(file);

      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setEstimatedDuration(5);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Upload file to server
  const uploadFileToServer = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });

      xhr.addEventListener("error", () => {
        setIsUploading(false);
        resolve(null);
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  const handleGenerate = async () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!imageFile && !videoFile) {
      toast.error(t("motion.toast.noFileUploaded"));
      return;
    }

    if (!prompt.trim()) {
      toast.error(t("motion.toast.noPrompt"));
      return;
    }

    // Kredi hesaplama: Standard = 5 kredi/sn, Pro = 8 kredi/sn
    // UYARI: Motion Control API otomatik video süresi belirler - tahminiden farklı olabilir
    const baseRate = mode === "pro" ? 8 : 5;
    const creditCost = baseRate * estimatedDuration;

    if (user.credits < creditCost) {
      toast.error(t("motion.toast.insufficientCredits", { credits: creditCost.toString() }));
      return;
    }

    setIsGenerating(true);

    try {
      let imageUrl = undefined;
      let videoUrl = undefined;

      // 1. Upload inputs
      if (imageFile) {
        toast.info(t("motion.toast.uploadingImage"));
        const result = await uploadFileToServer(imageFile);
        if (!result) throw new Error(t("motion.toast.imageUploadFailed"));
        imageUrl = result;
      }

      if (videoFile) {
        toast.info(t("motion.toast.uploadingVideo"));
        const result = await uploadFileToServer(videoFile);
        if (!result) throw new Error(t("motion.toast.videoUploadFailed"));
        videoUrl = result;
      }

      // 2. Generate video
      toast.info(t("motion.toast.startingGeneration"));

      // Motion Control: API otomatik video süresini belirler
      // Referans video süresini gönderiyoruz ama API kendi algoritmasına göre karar verir
      generateMutation.mutate({
        modelType: "kling-motion" as any,
        generationType: videoFile ? "video-to-video" : "image-to-video",
        prompt: prompt,
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        duration: estimatedDuration.toString(),
        aspectRatio: "16:9",
        quality: mode === "pro" ? "high" : "standard",
        characterOrientation: characterOrientation
      });

    } catch (error) {
      console.error("Generation error:", error);
      toast.error(t("motion.toast.error"));
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Credit calculation: Standard = 5 credits/sec, Pro = 8 credits/sec
  // UYARI: Motion Control API otomatik video süresi belirler
  const baseRate = mode === "pro" ? 8 : 5;
  const creditCost = baseRate * estimatedDuration;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8 pb-44 sm:pb-40 max-w-4xl">
        {/* Hero Section */}
        <div className="relative mb-6 sm:mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 p-5 sm:p-8">
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 flex items-center gap-2">
            <Info className="w-3 h-3" />
            {t("motion.howItWorks")}
          </div>
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider text-xs sm:text-sm">{t("motion.badge")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              {t("motion.title")}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              {t("motion.subtitle")}
            </p>
          </div>
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Video Box */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">{t("motion.referenceVideo")}</Label>
            <div
              onClick={() => !videoFile && !isUploading && !isGenerating && videoInputRef.current?.click()}
              className={cn(
                "group relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer active:scale-[0.98]",
                videoPreview
                  ? "border-white/20 bg-transparent aspect-video"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 min-h-[160px] sm:min-h-[200px] flex items-center justify-center",
                (isUploading || isGenerating) && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={isUploading || isGenerating}
              />

              {videoPreview ? (
                <div className="relative w-full h-full">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-cover rounded-xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeVideo(); }}
                    disabled={isUploading || isGenerating}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full backdrop-blur-sm transition-all active:scale-95 touch-manipulation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
                    <Video className="w-3.5 h-3.5" /> {t("motion.referenceVideoLabel")}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{t("motion.uploadReferenceVideo")}</h3>
                  <p className="text-sm text-gray-400">{t("motion.referenceVideoDesc")}</p>
                  <p className="text-xs text-gray-500 mt-2">{t("motion.referenceVideoSpec")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Box */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">{t("motion.characterImage")}</Label>
            <div
              onClick={() => !imageFile && !isUploading && !isGenerating && imageInputRef.current?.click()}
              className={cn(
                "group relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer active:scale-[0.98]",
                imagePreview
                  ? "border-white/20 bg-transparent aspect-video"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 min-h-[160px] sm:min-h-[200px] flex items-center justify-center",
                (isUploading || isGenerating) && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading || isGenerating}
              />

              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    disabled={isUploading || isGenerating}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full backdrop-blur-sm transition-all active:scale-95 touch-manipulation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
                    <ImageIcon className="w-3.5 h-3.5" /> {t("motion.characterImageLabel")}
                  </div>

                  {/* Upload Progress Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl z-10 backdrop-blur-sm">
                      <div className="w-4/5 max-w-xs h-2.5 bg-white/20 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-[#DFFF00] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-white font-medium">{t("motion.uploading")} {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{t("motion.addCharacterImage")}</h3>
                  <p className="text-sm text-gray-400">{t("motion.imageToAnimate")}</p>
                  <p className="text-xs text-gray-500 mt-2">{t("motion.imageSpec")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Prompt */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-300">{t("motion.sceneDescription")}</Label>
              <span className="text-xs text-gray-500">{prompt.length}/2500</span>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={2500}
              placeholder={t("motion.sceneDescriptionPlaceholder")}
              className="bg-transparent border-0 p-0 text-white text-base placeholder:text-gray-600 focus-visible:ring-0 resize-none min-h-[100px] sm:min-h-[80px]"
              disabled={isUploading || isGenerating}
            />
          </div>

          {/* Model Info Row */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1.5">{t("motion.model")}</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm sm:text-base">{t("motion.modelName")}</span>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-0 text-[10px] px-2 py-0.5">BETA</Badge>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Character Orientation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
              <Label className="text-xs text-gray-400 mb-3 block">{t("motion.characterOrientation")}</Label>
              <Select
                value={characterOrientation}
                onValueChange={(v) => setCharacterOrientation(v as "image" | "video")}
                disabled={isUploading || isGenerating}
              >
                <SelectTrigger className="bg-transparent border-white/10 text-white h-10 sm:h-9 text-base sm:text-sm">
                  <SelectValue placeholder={t("motion.selectOrientation")} />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  <SelectItem value="image">{t("motion.imageOrientation")}</SelectItem>
                  <SelectItem value="video">{t("motion.videoOrientation")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
{t("motion.orientationHint")}
              </p>
            </div>

            {/* Mode & Pricing Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
              <Label className="text-xs text-gray-400 mb-3 block">{t("motion.qualityMode")}</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "standard" | "pro")} disabled={isUploading || isGenerating}>
                <SelectTrigger className="bg-transparent border-white/10 text-white h-10 sm:h-9 text-base sm:text-sm">
                  <SelectValue placeholder={t("motion.selectMode")} />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  <SelectItem value="standard">{t("motion.standardMode")}</SelectItem>
                  <SelectItem value="pro">{t("motion.proMode")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Pricing Calculation Display */}
              <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{t("motion.referenceVideoLabel2")}</span>
                  <span className="text-white font-semibold">{estimatedDuration} {t("motion.seconds")}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">{t("motion.costPerSecond")}</span>
                  <span className="text-[#DFFF00] font-semibold">{mode === "pro" ? "8" : "5"} {t("motion.credits")}</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{t("motion.maxCost")}</span>
                  <span className="text-[#DFFF00] font-bold text-lg">
                    {(mode === "pro" ? 8 : 5) * estimatedDuration} {t("motion.credits")}
                  </span>
                </div>
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-xs text-yellow-200/80 leading-relaxed">
                    ⚠️ <strong>Önemli:</strong> Motion Control API video süresini otomatik belirler.
                    Gerçek ücret üretilen videonun uzunluğuna göre değişebilir.
                    Kullanılmayan kredi otomatik iade edilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("motion.featuresTitle")}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t("motion.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#DFFF00]/20 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-[#DFFF00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature1")}</h3>
              <p className="text-gray-400">
                {t("motion.feature1Desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#DFFF00]/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#DFFF00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature2")}</h3>
              <p className="text-gray-400">
                {t("motion.feature2Desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#DFFF00]/20 flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-[#DFFF00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature3")}</h3>
              <p className="text-gray-400">
                {t("motion.feature3Desc")}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#DFFF00]/20 flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-[#DFFF00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature4")}</h3>
              <p className="text-gray-400">
                {t("motion.feature4Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices Section */}
        <div className="mt-16 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t("motion.bestPracticesTitle")}</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip1Title")}</h3>
                <p className="text-gray-400">
                  {t("motion.tip1Desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip2Title")}</h3>
                <p className="text-gray-400">
                  {t("motion.tip2Desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip3Title")}</h3>
                <p className="text-gray-400">
                  {t("motion.tip3Desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip4Title")}</h3>
                <p className="text-gray-400">
                  {t("motion.tip4Desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip5Title")}</h3>
                <p className="text-gray-400">
                  <strong>Minimum Çözünürlük:</strong> 720x720 piksel (HD kalite önerilir).<br />
                  Tek karakter içeren videolar tercih edin. Kamera kesitleri, hızlı kamera hareketi veya zoom'dan kaçının.
                  3-30 saniye arası, gerçek insan aksiyonları önerilir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">{t("motion.useCasesTitle")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase1Title")}</h3>
              <p className="text-gray-400">
                {t("motion.useCase1Desc")}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase2Title")}</h3>
              <p className="text-gray-400">
                {t("motion.useCase2Desc")}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase3Title")}</h3>
              <p className="text-gray-400">
                {t("motion.useCase3Desc")}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase4Title")}</h3>
              <p className="text-gray-400">
                {t("motion.useCase4Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">{t("motion.faqTitle")}</h2>

          <div className="space-y-4">
            <details className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>{t("motion.faq1Q")}</span>
                <ChevronRight className="w-5 h-5 transform group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 mt-4">
                {t("motion.faq1A")}
              </p>
            </details>

            <details className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>{t("motion.faq2Q")}</span>
                <ChevronRight className="w-5 h-5 transform group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 mt-4">
                <strong>Görsel Yönelimi:</strong> Karakterin görseldeki konumunu korur, maksimum 10 saniye video üretir.<br />
                <strong>Video Yönelimi:</strong> Referans videodaki karakter konumunu takip eder, maksimum 30 saniye destekler.
              </p>
            </details>

            <details className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>{t("motion.faq3Q")}</span>
                <ChevronRight className="w-5 h-5 transform group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 mt-4">
                <strong>Görsel:</strong> JPEG, PNG, WEBP (max 10MB)<br />
                <strong>Video:</strong> MP4, MOV, MKV (max 100MB, 3-30 saniye)
              </p>
            </details>

            <details className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>{t("motion.faq4Q")}</span>
                <ChevronRight className="w-5 h-5 transform group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 mt-4">
                <strong>Standard (720p):</strong> 5 kredi/saniye<br />
                <strong>Pro (1080p):</strong> 8 kredi/saniye<br />
                Örnek: 10 saniyelik Pro video = 80 kredi
              </p>
            </details>

            <details className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>{t("motion.faq5Q")}</span>
                <ChevronRight className="w-5 h-5 transform group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 mt-4">
                • Görsel ve video çerçevelemeleri eşleştirin (yarım vücut-yarım vücut, tam vücut-tam vücut)<br />
                • Net, orta hızda hareketler içeren referans videolar kullanın<br />
                • Karakterin tüm vücudunu ve başını net gösterin<br />
                • Tek karakterli, kamera kesintisi olmayan videolar tercih edin
              </p>
            </details>
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom)+60px)] sm:pb-6 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10 z-50">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Credit Info */}
          {user && (
            <div className="text-center text-sm text-gray-400">
{t("motion.currentCredits")} <span className="font-semibold text-white">{user.credits}</span> {t("motion.credits")}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!imageFile && !videoFile) || !prompt.trim() || (user ? user.credits < creditCost : false)}
            className={cn(
              "w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-xl relative overflow-hidden transition-all touch-manipulation active:scale-[0.98]",
              (isGenerating || (!imageFile && !videoFile) || !prompt.trim() || (user ? user.credits < creditCost : false))
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-[#DFFF00] hover:bg-[#cbe600] text-black"
            )}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("motion.generating")}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>{t("motion.generateVideo")}</span>
                <Zap className="w-5 h-5 fill-current" />
                <span className="font-extrabold">{creditCost} {t("motion.credits")}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
