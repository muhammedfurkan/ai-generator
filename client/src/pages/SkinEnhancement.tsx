import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Download,
  ArrowLeft,
  Loader2,
  Check,
  Info,
  Zap,
  Sun,
  Camera,
  Eye,
  ChevronRight,
  X,
  RefreshCw,
  History,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type EnhancementMode =
  | "natural_clean"
  | "soft_glow"
  | "studio_look"
  | "no_makeup_real";

const MODE_ICONS: Record<EnhancementMode, React.ReactNode> = {
  natural_clean: <Sparkles className="w-5 h-5" />,
  soft_glow: <Sun className="w-5 h-5" />,
  studio_look: <Camera className="w-5 h-5" />,
  no_makeup_real: <Eye className="w-5 h-5" />,
};

const MODE_COLORS: Record<EnhancementMode, string> = {
  natural_clean: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  soft_glow: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  studio_look: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  no_makeup_real: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
};

export default function SkinEnhancement() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<"upload" | "mode" | "processing" | "result">(
    "upload"
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMode, setSelectedMode] =
    useState<EnhancementMode>("natural_clean");
  const [proMode, setProMode] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // Queries
  const modesQuery = trpc.skinEnhancement.getModes.useQuery();
  const pricingQuery = trpc.skinEnhancement.getPricing.useQuery();
  const historyQuery = trpc.skinEnhancement.getHistory.useQuery({
    limit: 10,
    offset: 0,
  });

  // Mutations
  const enhanceMutation = trpc.skinEnhancement.enhance.useMutation({
    onSuccess: data => {
      setEnhancedImage(data.enhancedImageUrl);
      setStep("result");
      toast.success(t("skinEnhancement.success.completed"));
      historyQuery.refetch();
    },
    onError: error => {
      toast.error(error.message);
      setStep("mode");
    },
  });

  const deleteJobMutation = trpc.skinEnhancement.deleteJob.useMutation({
    onSuccess: () => {
      toast.success(t("skinEnhancement.success.deletedFromHistory"));
      historyQuery.refetch();
    },
  });

  // Calculate credit cost
  const creditCost =
    (modesQuery.data?.find(m => m.id === selectedMode)?.creditCost ?? 3) +
    (proMode ? 2 : 0);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("skinEnhancement.errors.selectImageFile"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("skinEnhancement.errors.fileSizeLimit"));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = e => {
      setSelectedImage(e.target?.result as string);
      setStep("mode");
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // Handle enhancement
  const handleEnhance = async () => {
    if (!selectedFile || !selectedImage) return;

    if (!user) {
      toast.error(t("skinEnhancement.errors.pleaseLogin"));
      return;
    }

    if ((user.credits ?? 0) < creditCost) {
      toast.error(
        `Yetersiz kredi. Bu işlem için ${creditCost} kredi gerekiyor.`
      );
      return;
    }

    setStep("processing");

    try {
      // Upload image to storage first
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(t("skinEnhancement.errors.imageUploadFailed"));
      }

      const uploadData = (await uploadResponse.json()) as { url: string };

      // Get image dimensions
      const img = new Image();
      img.src = selectedImage;
      await new Promise(resolve => {
        img.onload = resolve;
      });

      // Call enhancement API
      await enhanceMutation.mutateAsync({
        imageUrl: uploadData.url,
        mode: selectedMode,
        proMode,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      });
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error(t("skinEnhancement.errors.uploadError"));
      setStep("mode");
    }
  };

  // Handle comparison slider
  const handleComparisonMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!comparisonRef.current) return;

      const rect = comparisonRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setComparisonPosition(percentage);
    },
    []
  );

  // Reset state
  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setEnhancedImage(null);
    setStep("upload");
    setComparisonPosition(50);
  };

  // Download enhanced image
  const handleDownload = async () => {
    if (!enhancedImage) return;

    try {
      const response = await fetch(enhancedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skin-enhanced-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("skinEnhancement.success.imageDownloaded"));
    } catch {
      toast.error(t("skinEnhancement.errors.downloadFailed"));
    }
  };

  // Load from history
  const loadFromHistory = (job: any) => {
    setSelectedImage(job.originalImageUrl);
    setEnhancedImage(job.enhancedImageUrl);
    setSelectedMode(job.mode);
    setProMode(job.proMode);
    setStep("result");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <img src="/Logo-02.png" alt="Amonify" className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">
              {user?.credits ?? 0} kredi
            </span>
          </div>
        </div>
        <div className="px-4 pb-3">
          <h1 className="text-lg font-bold text-white">Cilt İyileştirme</h1>
          <p className="text-xs text-white/60">Doğal görünümlü cilt düzeltme</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main className="container py-4 md:py-8 px-4 md:px-6">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Upload */}
            {step === "upload" && (
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center min-h-[400px] rounded-xl transition-all cursor-pointer",
                      isDragging && "bg-primary/10 scale-[1.02]"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        e.target.files?.[0] &&
                        handleFileSelect(e.target.files[0])
                      }
                    />

                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>

                    <h3 className="text-xl font-semibold mb-2">Görsel Yükle</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Cilt iyileştirme için bir görsel sürükleyip bırakın veya
                      tıklayarak seçin.
                      <br />
                      <span className="text-xs">
                        Desteklenen formatlar: JPG, PNG, WebP (max 10MB)
                      </span>
                    </p>

                    <Button size="lg" className="gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Görsel Seç
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Mode Selection */}
            {step === "mode" && selectedImage && (
              <div className="space-y-6">
                {/* Preview */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Seçilen Görsel</CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleReset}>
                        <X className="w-4 h-4 mr-1" />
                        Değiştir
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-square max-h-[400px] rounded-xl overflow-hidden bg-muted">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Mode Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">İyileştirme Modu</CardTitle>
                    <CardDescription>
                      Cilt iyileştirme stilini seçin. Tüm modlar doğal görünümü
                      korur.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={selectedMode}
                      onValueChange={v => setSelectedMode(v as EnhancementMode)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {modesQuery.data?.map(mode => (
                        <Label
                          key={mode.id}
                          htmlFor={mode.id}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            "hover:bg-accent/50",
                            selectedMode === mode.id
                              ? `bg-gradient-to-br ${MODE_COLORS[mode.id as EnhancementMode]} border-primary`
                              : "border-border"
                          )}
                        >
                          <RadioGroupItem
                            value={mode.id}
                            id={mode.id}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {MODE_ICONS[mode.id as EnhancementMode]}
                              <span className="font-semibold">{mode.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {mode.description}
                            </p>
                            <p className="text-xs text-primary mt-1">
                              {mode.creditCost} kredi
                            </p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>

                    {/* Pro Mode Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <div>
                          <Label htmlFor="pro-mode" className="font-semibold">
                            Pro Mod
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Ekstra mikro-detay iyileştirme (+2 kredi)
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="pro-mode"
                        checked={proMode}
                        onCheckedChange={setProMode}
                      />
                    </div>

                    {/* Cost Summary */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <span className="text-muted-foreground">
                        Toplam Maliyet
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {creditCost} kredi
                      </span>
                    </div>

                    {/* Enhance Button */}
                    <Button
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleEnhance}
                      disabled={!user || (user.credits ?? 0) < creditCost}
                    >
                      <Sparkles className="w-5 h-5" />
                      Cildi İyileştir
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    {!user && (
                      <p className="text-center text-sm text-muted-foreground">
                        İyileştirme için{" "}
                        <Link
                          href="/login"
                          className="text-primary hover:underline"
                        >
                          giriş yapın
                        </Link>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Processing */}
            {step === "processing" && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center min-h-[500px] p-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  </div>

                  <h3 className="text-xl font-semibold mt-8 mb-2">
                    Cilt İyileştiriliyor
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    AI modelimiz cildinizi doğal bir şekilde iyileştiriyor.
                    <br />
                    Bu işlem birkaç saniye sürebilir...
                  </p>

                  <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Görsel analiz edildi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Cilt dokusu korunarak iyileştiriliyor...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Result */}
            {step === "result" && selectedImage && enhancedImage && (
              <div className="space-y-4 md:space-y-6">
                {/* Before/After Comparison */}
                <Card>
                  <CardHeader className="pb-2 md:pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <CardTitle className="text-base md:text-lg">
                        Karşılaştırma
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="flex-1 md:flex-none text-xs md:text-sm"
                        >
                          <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Yeni Görsel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleDownload}
                          className="flex-1 md:flex-none text-xs md:text-sm"
                        >
                          <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          İndir
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs md:text-sm">
                      Slider'ı sürükleyerek öncesi/sonrası karşılaştırın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6">
                    <div
                      ref={comparisonRef}
                      className="relative aspect-[3/4] md:aspect-square max-h-[400px] md:max-h-[500px] rounded-xl overflow-hidden cursor-ew-resize select-none touch-none"
                      onMouseMove={e =>
                        e.buttons === 1 && handleComparisonMove(e)
                      }
                      onMouseDown={handleComparisonMove}
                      onTouchMove={handleComparisonMove}
                    >
                      {/* Enhanced Image (Background) */}
                      <img
                        src={enhancedImage}
                        alt="Enhanced"
                        className="absolute inset-0 w-full h-full object-contain"
                        draggable={false}
                      />

                      {/* Original Image (Clipped) */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${comparisonPosition}%` }}
                      >
                        <img
                          src={selectedImage}
                          alt="Original"
                          className="absolute inset-0 w-full h-full object-contain"
                          style={{
                            width: `${100 / (comparisonPosition / 100)}%`,
                            maxWidth: "none",
                          }}
                          draggable={false}
                        />
                      </div>

                      {/* Slider Line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                        style={{
                          left: `${comparisonPosition}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <div className="flex gap-0.5">
                            <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                        Öncesi
                      </div>
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                        Sonrası
                      </div>
                    </div>

                    {/* Slider Control */}
                    <div className="mt-4">
                      <Slider
                        value={[comparisonPosition]}
                        onValueChange={([v]) => setComparisonPosition(v)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                  <CardContent className="flex items-start gap-4 p-4">
                    <Info className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-emerald-500 mb-1">
                        Doğal İyileştirme
                      </p>
                      <p className="text-muted-foreground">
                        Bu iyileştirme yüz şeklini, vücut oranlarını veya cilt
                        dokusunu değiştirmez. Gözenekler, çiller ve doğal
                        kusurlar korunur.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block space-y-6">
            {/* Pricing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Fiyatlandırma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Natural Clean</span>
                  <span className="font-semibold">20 kredi</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">
                    Soft Glow / No-Makeup
                  </span>
                  <span className="font-semibold">25 kredi</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Studio Look</span>
                  <span className="font-semibold">30 kredi</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">
                    Pro Mod Eklentisi
                  </span>
                  <span className="font-semibold">+5 kredi</span>
                </div>
              </CardContent>
            </Card>

            {/* Quality Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Kalite Garantisi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Yüz şekli değiştirilmez</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Vücut oranları korunur</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Doğal cilt dokusu korunur</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Gözenekler ve çiller görünür kalır</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Plastik veya yapay görünüm yok</span>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {user && historyQuery.data && historyQuery.data.jobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Son İyileştirmeler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {historyQuery.data.jobs.slice(0, 5).map(job => (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      {job.enhancedImageUrl ? (
                        <img
                          src={job.enhancedImageUrl}
                          alt="Enhanced"
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                          onClick={() => loadFromHistory(job)}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          {job.status === "processing" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {modesQuery.data?.find(m => m.id === job.mode)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          deleteJobMutation.mutate({ jobId: job.id })
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
