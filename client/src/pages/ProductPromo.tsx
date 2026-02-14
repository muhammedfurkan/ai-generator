import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import GenerationLoadingOverlay from "@/components/GenerationLoadingOverlay";
import {
  Upload,
  Video,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  Play,
  RefreshCw,
  ShoppingBag,
  Zap,
  Crown,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface StylePreset {
  id: string;
  name: string;
  nameTr: string;
  description: string;
  credits: number;
}

export default function ProductPromo() {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("minimal_clean");
  const [productName, setProductName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: stylePresets } = trpc.productPromo.getStylePresets.useQuery();
  const { data: videoStatus, refetch: refetchStatus } =
    trpc.productPromo.getStatus.useQuery(
      { videoId: currentVideoId! },
      {
        enabled: !!currentVideoId,
        refetchInterval: currentVideoId ? 5000 : false,
      }
    );
  const creditsQuery = trpc.generation.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const userCredits = creditsQuery.data?.credits ?? 0;

  // Mutations
  const createVideoMutation = trpc.productPromo.create.useMutation({
    onSuccess: data => {
      setCurrentVideoId(data.videoId);
      setIsGenerating(true);
      toast.success(`Video oluşturuluyor...`, {
        description: `${data.creditsUsed} kredi kullanıldı • ${data.style}`,
      });
    },
    onError: error => {
      toast.error("Hata", { description: error.message });
      setIsGenerating(false);
    },
  });

  const retryMutation = trpc.productPromo.retry.useMutation({
    onSuccess: () => {
      toast.success(t("productPromo.toast.regenerating"));
      refetchStatus();
    },
    onError: error => {
      toast.error("Hata", { description: error.message });
    },
  });

  // Selected style info
  const selectedStyleInfo = stylePresets?.find(s => s.id === selectedStyle);

  // Handle file upload
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error(t("productPromo.errors.invalidFormat"), {
          description: t("productPromo.errors.invalidFormatDesc"),
        });
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error(t("productPromo.errors.fileTooLarge"), {
          description: t("productPromo.errors.fileTooLargeDesc"),
        });
        return;
      }

      setIsUploading(true);

      try {
        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = async event => {
          const base64 = event.target?.result as string;

          // Upload to S3 via API
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Upload failed");

          const { url } = await response.json();
          setProductImage(url);
          toast.success(t("productPromo.toast.imageUploaded"));
        };
        reader.readAsDataURL(file);
      } catch {
        toast.error(t("productPromo.errors.uploadError"));
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  // Handle generate
  const handleGenerate = useCallback(() => {
    if (!productImage || !selectedStyleInfo) return;

    if (userCredits < selectedStyleInfo.credits) {
      toast.error("Yetersiz kredi", {
        description: `Bu işlem için ${selectedStyleInfo.credits} kredi gerekli`,
        action: {
          label: t("productPromo.buyCredits"),
          onClick: () => (window.location.href = "/packages"),
        },
      });
      return;
    }

    createVideoMutation.mutate({
      productImageUrl: productImage,
      stylePreset: selectedStyle as
        | "minimal_clean"
        | "premium_luxury"
        | "tech_futuristic"
        | "social_viral",
      productName: productName || undefined,
      slogan: slogan || undefined,
    });
  }, [
    productImage,
    selectedStyle,
    selectedStyleInfo,
    productName,
    slogan,
    userCredits,
    createVideoMutation,
  ]);

  // Handle download
  const handleDownload = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `product-promo-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Video indirildi");
    } catch {
      toast.error(t("productPromo.errors.downloadError"));
    }
  }, []);

  // Reset to create new video
  const handleNewVideo = useCallback(() => {
    setCurrentVideoId(null);
    setIsGenerating(false);
    setProductImage(null);
    setProductName("");
    setSlogan("");
  }, []);

  // Check if video completed or failed
  const isVideoCompleted = videoStatus?.status === "completed";
  const isVideoFailed = videoStatus?.status === "failed";
  const isVideoProcessing =
    videoStatus?.status === "processing" || videoStatus?.status === "pending";

  // Stop polling when completed
  if (isVideoCompleted || isVideoFailed) {
    if (isGenerating) setIsGenerating(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#00F5FF]" />
          <p className="text-gray-300 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Style icons
  const styleIcons: Record<string, JSX.Element> = {
    minimal_clean: <ShoppingBag className="w-5 h-5" />,
    dynamic_energy: <Rocket className="w-5 h-5" />,
    premium_luxury: <Crown className="w-5 h-5" />,
    tech_futuristic: <Zap className="w-5 h-5" />,
    social_viral: <TrendingUp className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB]">
      <Header />

      {/* Global Loading Overlay */}
      <GenerationLoadingOverlay isVisible={isGenerating} type="video" />

      <div className="container mx-auto px-4 py-8">
        {!currentVideoId ? (
          // Creation Flow
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1: Upload Product Image */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-neon-brand text-black rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Ürün Görseli Yükle
                </CardTitle>
                <CardDescription>
                  Tanıtım videosu oluşturmak istediğiniz ürünün net bir
                  fotoğrafını yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!productImage ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-64 border-2 border-dashed border-zinc-700 rounded-xl hover:border-neon-brand/50 transition-colors flex flex-col items-center justify-center gap-4"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-neon-brand" />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-zinc-500" />
                        <div className="text-center">
                          <p className="text-zinc-300 font-medium">
                            Görsel yüklemek için tıklayın
                          </p>
                          <p className="text-sm text-zinc-500 mt-1">
                            JPG, PNG, WebP • Maks. 20MB
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={productImage}
                      alt={t("productPromo.productAlt")}
                      className="w-full max-h-80 object-contain rounded-xl bg-zinc-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2"
                    >
                      Değiştir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Select Style */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-neon-brand text-black rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Video Stili Seç
                </CardTitle>
                <CardDescription>
                  Ürününüze en uygun video stilini seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {stylePresets?.map(style => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 md:p-5 rounded-xl border-2 text-left transition-all min-h-[80px] ${
                        selectedStyle === style.id
                          ? "border-neon-brand bg-neon-brand/10"
                          : "border-zinc-700 hover:border-zinc-600 active:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-lg ${
                              selectedStyle === style.id
                                ? "bg-neon-brand/20"
                                : "bg-zinc-800"
                            }`}
                          >
                            {styleIcons[style.id]}
                          </div>
                          <span className="font-bold text-base">
                            {style.nameTr}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded-md ${
                            selectedStyle === style.id
                              ? "text-neon-brand bg-neon-brand/10"
                              : "text-zinc-400 bg-zinc-800"
                          }`}
                        >
                          {style.credits} Kredi
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 pl-12">
                        {style.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Optional Text */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-zinc-700 text-[#F9FAFB] rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Metin Ekle (Opsiyonel)
                </CardTitle>
                <CardDescription>
                  Videoda gösterilecek ürün adı ve slogan ekleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Ürün Adı</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder={t("productPromo.placeholder.productName")}
                    maxLength={200}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slogan">Slogan / Tagline</Label>
                  <Input
                    id="slogan"
                    value={slogan}
                    onChange={e => setSlogan(e.target.value)}
                    placeholder={t("productPromo.placeholder.description")}
                    maxLength={300}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={!productImage || createVideoMutation.isPending}
                className="bg-neon-brand text-black hover:bg-[#00F5FF] px-8 py-6 text-lg font-bold"
              >
                {createVideoMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Başlatılıyor...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Video Oluştur ({selectedStyleInfo?.credits} Kredi)
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Progress/Results View
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Status Card */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  {isVideoProcessing && (
                    <>
                      <div className="w-20 h-20 mx-auto bg-neon-brand/10 rounded-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-neon-brand animate-spin" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          Video Oluşturuluyor
                        </h2>
                        <p className="text-zinc-400 mt-1">
                          Bu işlem 1-3 dakika sürebilir
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <Clock className="w-4 h-4" />
                        <span>Lütfen bekleyin...</span>
                      </div>
                    </>
                  )}

                  {isVideoCompleted && (
                    <>
                      <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Video Hazır!</h2>
                        <p className="text-zinc-400 mt-1">
                          Videonuz başarıyla oluşturuldu
                        </p>
                      </div>
                    </>
                  )}

                  {isVideoFailed && (
                    <>
                      <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Bir Hata Oluştu</h2>
                        <p className="text-zinc-400 mt-1">
                          {videoStatus?.errorMessage ||
                            t("productPromo.errors.videoCreationFailed")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Preview */}
            {isVideoCompleted && videoStatus?.generatedVideoUrl && (
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <CardContent className="p-0">
                  <video
                    src={videoStatus.generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full aspect-[9/16] max-h-[600px] object-contain bg-[#0B0F19]"
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isVideoCompleted && videoStatus?.generatedVideoUrl && (
                <Button
                  onClick={() => handleDownload(videoStatus.generatedVideoUrl!)}
                  className="bg-neon-brand text-black hover:bg-[#00F5FF]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Videoyu İndir
                </Button>
              )}

              {isVideoFailed && (
                <Button
                  onClick={() =>
                    retryMutation.mutate({ videoId: currentVideoId! })
                  }
                  disabled={retryMutation.isPending}
                  variant="outline"
                  className="border-neon-brand text-neon-brand hover:bg-neon-brand/10"
                >
                  {retryMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-2" />
                  )}
                  Tekrar Dene
                </Button>
              )}

              <Button
                onClick={handleNewVideo}
                variant="outline"
                className="border-zinc-700"
              >
                <Video className="w-5 h-5 mr-2" />
                Yeni Video Oluştur
              </Button>
            </div>

            {/* Original Product Image */}
            {videoStatus?.productImageUrl && (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm text-zinc-400">
                    Orijinal Ürün Görseli
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={videoStatus.productImageUrl}
                    alt={t("productPromo.productAlt")}
                    className="w-32 h-32 object-contain rounded-lg bg-zinc-800"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
