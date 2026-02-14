import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Video,
  Download,
  Sparkles,
  MessageSquare,
  Package,
  Lightbulb,
  Eye,
  Heart,
  User,
  Globe,
  Mic,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Senaryo ikonları
const scenarioIcons: Record<string, React.ReactNode> = {
  testimonial: <MessageSquare className="w-5 h-5" />,
  unboxing: <Package className="w-5 h-5" />,
  problem_solution: <Lightbulb className="w-5 h-5" />,
  first_impression: <Eye className="w-5 h-5" />,
  lifestyle: <Heart className="w-5 h-5" />,
};

// Ton ikonları
const toneIcons: Record<string, React.ReactNode> = {
  casual: <User className="w-4 h-4" />,
  excited: <Zap className="w-4 h-4" />,
  calm: <Heart className="w-4 h-4" />,
  persuasive: <Mic className="w-4 h-4" />,
};

export default function UgcAd() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("veo31");
  const [selectedScenario, setSelectedScenario] =
    useState<string>("testimonial");
  const [selectedGender, setSelectedGender] = useState<string>("female");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("tr");
  const [selectedTone, setSelectedTone] = useState<string>("casual");
  const [productName, setProductName] = useState("");
  const [keyBenefit, setKeyBenefit] = useState("");

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoId, setGeneratedVideoId] = useState<number | null>(null);

  // API hooks
  const { data: options } = trpc.ugcAd.getOptions.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: videoStatus, refetch: refetchStatus } =
    trpc.ugcAd.getStatus.useQuery(
      { id: generatedVideoId! },
      {
        enabled: !!generatedVideoId,
        refetchInterval: query => {
          if (query.state.data?.status === "processing") return 3000;
          return false;
        },
      }
    );

  const createMutation = trpc.ugcAd.create.useMutation({
    onSuccess: data => {
      setGeneratedVideoId(data.id);
      setIsGenerating(false);
      toast.success(t("ugcAd.success.generationStarted"));
    },
    onError: error => {
      setIsGenerating(false);
      toast.error(error.message);
    },
  });

  // File upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("ugcAd.errors.selectImageFile"));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("ugcAd.errors.fileSizeLimit"));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setProductImage(data.url);
      toast.success(t("ugcAd.success.imageUploaded"));
    } catch {
      toast.error(t("ugcAd.errors.imageUploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  // Generate video
  const handleGenerate = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    const selectedModelData = options?.models.find(m => m.id === selectedModel);
    if (selectedModelData && user.credits < selectedModelData.credits) {
      toast.error(
        `Yetersiz kredi. Bu işlem ${selectedModelData.credits} kredi gerektiriyor.`
      );
      return;
    }

    setIsGenerating(true);
    createMutation.mutate({
      productImageUrl: productImage || undefined,
      videoModel: "veo31",
      ugcScenario: selectedScenario as
        | "testimonial"
        | "unboxing"
        | "problem_solution"
        | "first_impression"
        | "lifestyle",
      characterGender: selectedGender as "male" | "female",
      language: selectedLanguage,
      tone: selectedTone as "casual" | "excited" | "calm" | "persuasive",
      productName: productName || undefined,
      keyBenefit: keyBenefit || undefined,
    });
  };

  // Reset form
  const handleReset = () => {
    setGeneratedVideoId(null);
    setProductImage(null);
    setProductName("");
    setKeyBenefit("");
  };

  // Loading state - removed since useAuth doesn't have isLoading

  const selectedModelData = options?.models.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB]">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Video Result View */}
        {generatedVideoId && videoStatus ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {videoStatus.status === "processing" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-neon-brand" />
                      Video Oluşturuluyor...
                    </>
                  ) : videoStatus.status === "completed" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Video Hazır!
                    </>
                  ) : (
                    <>
                      <span className="text-red-500">Hata Oluştu</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {videoStatus.status === "processing"
                    ? t("ugcAd.status.processing")
                    : videoStatus.status === "completed"
                      ? t("ugcAd.status.completed")
                      : videoStatus.errorMessage || t("ugcAd.status.error")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videoStatus.status === "processing" && (
                  <div className="aspect-[9/16] max-w-sm mx-auto bg-zinc-800 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-neon-brand mx-auto mb-4" />
                      <p className="text-zinc-400">
                        UGC video oluşturuluyor...
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Tahmini süre: 2-4 dakika
                      </p>
                    </div>
                  </div>
                )}

                {videoStatus.status === "completed" &&
                  videoStatus.generatedVideoUrl && (
                    <div className="space-y-4">
                      <div className="aspect-[9/16] max-w-sm mx-auto bg-zinc-800 rounded-xl overflow-hidden">
                        <video
                          src={videoStatus.generatedVideoUrl}
                          controls
                          className="w-full h-full object-contain"
                          autoPlay
                          loop
                        />
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button
                          asChild
                          className="bg-neon-brand text-black hover:bg-[#00F5FF]"
                        >
                          <a href={videoStatus.generatedVideoUrl} download>
                            <Download className="w-4 h-4 mr-2" />
                            İndir
                          </a>
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                          Yeni Video Oluştur
                        </Button>
                      </div>
                    </div>
                  )}

                {videoStatus.status === "failed" && (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-4">
                      {videoStatus.errorMessage}
                    </p>
                    <Button onClick={handleReset}>Tekrar Dene</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Form View */
          <div className="space-y-6">
            {/* Step 1: Product Image (Optional) */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-neon-brand text-black rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Ürün Görseli (Opsiyonel)
                </CardTitle>
                <CardDescription>
                  Videoda gösterilecek ürün görselini yükleyin
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
                    className="w-full h-48 border-2 border-dashed border-zinc-700 rounded-xl hover:border-neon-brand/50 transition-colors flex flex-col items-center justify-center gap-4"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-neon-brand" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-zinc-500" />
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
                      alt={t("ugcAd.productImageAlt")}
                      className="w-full max-h-64 object-contain rounded-xl bg-zinc-800"
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

            {/* Step 2: UGC Scenario */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-neon-brand text-black rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  UGC Senaryosu Seç
                </CardTitle>
                <CardDescription>
                  Videonun içerik türünü belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {options?.scenarios.map(scenario => (
                    <motion.button
                      key={scenario.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedScenario(scenario.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedScenario === scenario.id
                          ? "border-neon-brand bg-neon-brand/10"
                          : "border-zinc-700 hover:border-zinc-600 active:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedScenario === scenario.id
                              ? "bg-neon-brand/20"
                              : "bg-zinc-800"
                          }`}
                        >
                          {scenarioIcons[scenario.id]}
                        </div>
                        <div>
                          <span className="font-bold">{scenario.nameTr}</span>
                          <p className="text-sm text-zinc-400">
                            {scenario.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Character Settings */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-neon-brand text-black rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Karakter Ayarları
                </CardTitle>
                <CardDescription>
                  Videodaki kişinin özelliklerini belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gender */}
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">
                    Cinsiyet
                  </Label>
                  <div className="flex gap-3">
                    {options?.genders.map(gender => (
                      <button
                        key={gender.id}
                        onClick={() => setSelectedGender(gender.id)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          selectedGender === gender.id
                            ? "border-neon-brand bg-neon-brand/10"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <User className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">{gender.nameTr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">
                    Dil
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {options?.languages.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                          selectedLanguage === lang.id
                            ? "border-neon-brand bg-neon-brand/10 text-neon-brand"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">
                    Konuşma Tonu
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {options?.tones.map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(tone.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedTone === tone.id
                            ? "border-neon-brand bg-neon-brand/10"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {toneIcons[tone.id]}
                          <span className="font-medium">{tone.nameTr}</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {tone.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Optional Info */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-zinc-700 text-[#F9FAFB] rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  Ek Bilgiler (Opsiyonel)
                </CardTitle>
                <CardDescription>
                  Videoda bahsedilecek ürün bilgilerini girin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Ürün Adı</Label>
                  <Input
                    id="productName"
                    placeholder={t("ugcAd.productNamePlaceholder")}
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="keyBenefit">Ana Fayda</Label>
                  <Input
                    id="keyBenefit"
                    placeholder={t("ugcAd.keyBenefitPlaceholder")}
                    value={keyBenefit}
                    onChange={e => setKeyBenefit(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="sticky bottom-4 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !user}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-[#F9FAFB] font-bold text-lg rounded-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    UGC Video Oluştur ({selectedModelData?.credits || 45} Kredi)
                  </>
                )}
              </Button>
              {!user && (
                <p className="text-center text-sm text-zinc-500 mt-2">
                  Video oluşturmak için{" "}
                  <a
                    href={getLoginUrl()}
                    className="text-neon-brand hover:underline"
                  >
                    giriş yapın
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
