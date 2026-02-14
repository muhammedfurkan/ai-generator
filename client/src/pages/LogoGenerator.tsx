import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Download,
  Loader2,
  ArrowLeft,
  Sparkles,
  Palette,
  Building2,
  Brush,
  Type,
  Layers,
  RefreshCw,
  Check,
  Info,
} from "lucide-react";
import Header from "@/components/Header";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import ImageSkeleton from "@/components/ImageSkeleton";
import GenerationLoadingOverlay from "@/components/GenerationLoadingOverlay";

// Sektör seçenekleri
const INDUSTRIES = [
  {
    value: "technology",
    label: "Teknoloji",
    icon: "💻",
    keywords: "modern, dijital, yenilikçi",
  },
  {
    value: "food",
    label: "Yiyecek & İçecek",
    icon: "🍽️",
    keywords: "lezzetli, taze, sıcak",
  },
  {
    value: "fashion",
    label: "Moda & Giyim",
    icon: "👗",
    keywords: "şık, trend, elegant",
  },
  {
    value: "health",
    label: "Sağlık & Wellness",
    icon: "💚",
    keywords: "güvenilir, temiz, profesyonel",
  },
  {
    value: "finance",
    label: "Finans & Bankacılık",
    icon: "💰",
    keywords: "güvenli, kurumsal, prestijli",
  },
  {
    value: "education",
    label: "Eğitim",
    icon: "📚",
    keywords: "bilgi, gelişim, akademik",
  },
  {
    value: "entertainment",
    label: "Eğlence & Medya",
    icon: "🎬",
    keywords: "eğlenceli, dinamik, renkli",
  },
  {
    value: "sports",
    label: "Spor & Fitness",
    icon: "⚽",
    keywords: "enerjik, güçlü, aktif",
  },
  {
    value: "beauty",
    label: "Güzellik & Kozmetik",
    icon: "💄",
    keywords: "zarif, feminen, lüks",
  },
  {
    value: "automotive",
    label: "Otomotiv",
    icon: "🚗",
    keywords: "hız, güç, teknoloji",
  },
  {
    value: "realestate",
    label: "Emlak",
    icon: "🏠",
    keywords: "güvenilir, ev, yatırım",
  },
  {
    value: "travel",
    label: "Seyahat & Turizm",
    icon: "✈️",
    keywords: "macera, keşif, özgürlük",
  },
  {
    value: "gaming",
    label: "Oyun",
    icon: "🎮",
    keywords: "eğlenceli, dinamik, genç",
  },
  { value: "music", label: "Müzik", icon: "🎵", keywords: "ritim, ses, sanat" },
  {
    value: "art",
    label: "Sanat & Tasarım",
    icon: "🎨",
    keywords: "yaratıcı, özgün, estetik",
  },
  {
    value: "eco",
    label: "Çevre & Sürdürülebilirlik",
    icon: "🌿",
    keywords: "yeşil, doğal, organik",
  },
  {
    value: "pet",
    label: "Evcil Hayvan",
    icon: "🐾",
    keywords: "sevimli, sadık, dostça",
  },
  {
    value: "legal",
    label: "Hukuk",
    icon: "⚖️",
    keywords: "adalet, güven, profesyonel",
  },
  {
    value: "construction",
    label: "İnşaat",
    icon: "🏗️",
    keywords: "sağlam, güçlü, kaliteli",
  },
  { value: "other", label: "Diğer", icon: "✨", keywords: "özel, benzersiz" },
];

// Logo stilleri
const LOGO_STYLES = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Sade ve temiz tasarım",
    preview: "○",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Çağdaş ve yenilikçi",
    preview: "◆",
  },
  {
    value: "vintage",
    label: "Vintage",
    description: "Retro ve nostaljik",
    preview: "❋",
  },
  {
    value: "luxury",
    label: "Lüks",
    description: "Premium ve prestijli",
    preview: "♛",
  },
  {
    value: "playful",
    label: "Eğlenceli",
    description: "Renkli ve dinamik",
    preview: "★",
  },
  {
    value: "corporate",
    label: "Kurumsal",
    description: "Profesyonel ve ciddi",
    preview: "■",
  },
  {
    value: "handdrawn",
    label: "El Çizimi",
    description: "Organik ve samimi",
    preview: "✎",
  },
  {
    value: "geometric",
    label: "Geometrik",
    description: "Şekil bazlı tasarım",
    preview: "△",
  },
  { value: "3d", label: "3D", description: "Üç boyutlu efekt", preview: "◈" },
  {
    value: "gradient",
    label: "Gradient",
    description: "Renk geçişli",
    preview: "◐",
  },
  {
    value: "mascot",
    label: "Maskot",
    description: "Karakter bazlı",
    preview: "☺",
  },
  {
    value: "lettermark",
    label: "Harf Logo",
    description: "Baş harflerden oluşan",
    preview: "A",
  },
];

// Renk paletleri
const COLOR_PALETTES = [
  {
    value: "blue",
    label: "Mavi Tonları",
    colors: ["#0066FF", "#0099FF", "#00CCFF", "#003366"],
    mood: "Güven, Profesyonellik",
  },
  {
    value: "red",
    label: "Kırmızı Tonları",
    colors: ["#FF0000", "#CC0000", "#FF3333", "#990000"],
    mood: "Enerji, Tutku",
  },
  {
    value: "green",
    label: "Yeşil Tonları",
    colors: ["#00CC66", "#009933", "#33FF99", "#006633"],
    mood: "Doğa, Büyüme",
  },
  {
    value: "purple",
    label: "Mor Tonları",
    colors: ["#9933FF", "#6600CC", "#CC66FF", "#660099"],
    mood: "Yaratıcılık, Lüks",
  },
  {
    value: "orange",
    label: "Turuncu Tonları",
    colors: ["#FF6600", "#FF9933", "#CC5500", "#FF8000"],
    mood: "Enerji, Sıcaklık",
  },
  {
    value: "gold",
    label: "Altın & Siyah",
    colors: ["#FFD700", "#C9A227", "#000000", "#333333"],
    mood: "Premium, Prestij",
  },
  {
    value: "pastel",
    label: "Pastel Tonlar",
    colors: ["#FFB6C1", "#87CEEB", "#98FB98", "#DDA0DD"],
    mood: "Yumuşak, Samimi",
  },
  {
    value: "neon",
    label: "Neon Renkler",
    colors: ["#FF00FF", "#00FFFF", "#FFFF00", "#FF0080"],
    mood: "Modern, Dikkat Çekici",
  },
  {
    value: "earth",
    label: "Toprak Tonları",
    colors: ["#8B4513", "#D2691E", "#DEB887", "#F5DEB3"],
    mood: "Doğal, Organik",
  },
  {
    value: "monochrome",
    label: "Siyah & Beyaz",
    colors: ["#000000", "#333333", "#666666", "#FFFFFF"],
    mood: "Klasik, Zamansız",
  },
  {
    value: "teal",
    label: "Turkuaz Tonları",
    colors: ["#008080", "#20B2AA", "#40E0D0", "#00CED1"],
    mood: "Ferah, Güvenilir",
  },
  {
    value: "custom",
    label: "Özel Renk",
    colors: ["#CCFF00", "#FF00CC", "#00FFCC", "#CCCCCC"],
    mood: "Kişiselleştirilmiş",
  },
];

// İkon tipleri
const ICON_TYPES = [
  {
    value: "abstract",
    label: "Soyut Şekil",
    description: "Geometrik veya organik soyut form",
  },
  {
    value: "symbol",
    label: "Sembol",
    description: "Anlamlı bir ikon veya sembol",
  },
  {
    value: "initial",
    label: "Baş Harf",
    description: "Marka adının baş harfi",
  },
  {
    value: "wordmark",
    label: "Sadece Yazı",
    description: "İkonsuz, tipografi odaklı",
  },
  {
    value: "combination",
    label: "Kombinasyon",
    description: "İkon + yazı birlikte",
  },
  { value: "emblem", label: "Amblem", description: "Çerçeve içinde logo" },
];

// Çözünürlük seçenekleri
const RESOLUTIONS = [
  { value: "1K", label: "1K", credits: 15, description: "512x512 px" },
  { value: "2K", label: "2K", credits: 22, description: "1024x1024 px" },
  { value: "4K", label: "4K", credits: 30, description: "2048x2048 px" },
];

export default function LogoGenerator() {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  // Form state
  const [brandName, setBrandName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [industry, setIndustry] = useState("");
  const [logoStyle, setLogoStyle] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [customColor, setCustomColor] = useState("#CCFF00");
  const [iconType, setIconType] = useState("combination");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [resolution, setResolution] = useState<"1K" | "2K" | "4K">("2K");
  const [variationCount, setVariationCount] = useState(1);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [activeStep, setActiveStep] = useState(1);

  const creditsQuery = trpc.generation.getCredits.useQuery();
  const generateMutation = trpc.logo.generate.useMutation();

  // Kredi hesaplama
  const selectedResolution = RESOLUTIONS.find(r => r.value === resolution);
  const creditsNeeded = (selectedResolution?.credits || 22) * variationCount;
  const hasEnoughCredits = (creditsQuery.data?.credits || 0) >= creditsNeeded;

  // Adım kontrolü
  const canProceedToStep2 = brandName.trim().length >= 2;
  const canProceedToStep3 = canProceedToStep2 && industry && logoStyle;
  const canProceedToStep4 = canProceedToStep3 && colorPalette && iconType;
  const canGenerate = canProceedToStep4 && hasEnoughCredits;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-300 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const buildPrompt = () => {
    const selectedIndustry = INDUSTRIES.find(i => i.value === industry);
    const selectedStyle = LOGO_STYLES.find(s => s.value === logoStyle);
    const selectedPalette = COLOR_PALETTES.find(p => p.value === colorPalette);
    const selectedIcon = ICON_TYPES.find(i => i.value === iconType);

    let prompt = `Professional logo design for "${brandName}"`;

    if (slogan) {
      prompt += ` with slogan "${slogan}"`;
    }

    prompt += `. ${selectedIndustry?.label} industry (${selectedIndustry?.keywords}).`;
    prompt += ` ${selectedStyle?.label} style - ${selectedStyle?.description}.`;

    if (colorPalette === "custom") {
      prompt += ` Primary color: ${customColor}.`;
    } else {
      prompt += ` Color palette: ${selectedPalette?.label} (${selectedPalette?.mood}).`;
    }

    prompt += ` Logo type: ${selectedIcon?.label} - ${selectedIcon?.description}.`;

    if (additionalNotes) {
      prompt += ` Additional requirements: ${additionalNotes}.`;
    }

    prompt +=
      " High quality, vector-style, clean background, professional branding, suitable for business cards and large format printing.";

    return prompt;
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      if (!hasEnoughCredits) {
        setShowInsufficientCreditsDialog(true);
      }
      return;
    }

    setIsGenerating(true);
    setGeneratedLogos([]);

    try {
      const prompt = buildPrompt();

      const results: string[] = [];

      for (let i = 0; i < variationCount; i++) {
        const result = await generateMutation.mutateAsync({
          prompt:
            i === 0
              ? prompt
              : `${prompt} Variation ${i + 1}, unique interpretation.`,
          resolution,
          brandName,
          industry,
          logoStyle,
          colorPalette: colorPalette === "custom" ? customColor : colorPalette,
          iconType,
        });

        if (result.success && result.imageUrl) {
          results.push(result.imageUrl);
          setGeneratedLogos([...results]);
        }
      }

      if (results.length > 0) {
        toast.success(`${results.length} logo başarıyla oluşturuldu!`);
        creditsQuery.refetch();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Logo oluşturma başarısız";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brandName.replace(/\s+/g, "-").toLowerCase()}-logo-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Logo indirildi!");
    } catch {
      toast.error("İndirme başarısız");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Global Loading Overlay */}
      <GenerationLoadingOverlay isVisible={isGenerating} type="logo" />

      <motion.div
        className="container py-6 lg:py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          variants={itemVariants}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/apps")}
            className="glass-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#CCFF00]" />
              Logo Oluşturucu
            </h1>
            <p className="text-muted-foreground text-sm">
              Kredi: {creditsQuery.data?.credits ?? 0} • Gerekli:{" "}
              {creditsNeeded} kredi
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { step: 1, label: "Marka Bilgisi", icon: Type },
              { step: 2, label: "Sektör & Stil", icon: Building2 },
              { step: 3, label: "Renk & İkon", icon: Palette },
              { step: 4, label: "Oluştur", icon: Sparkles },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center">
                <button
                  onClick={() => {
                    if (
                      step === 1 ||
                      (step === 2 && canProceedToStep2) ||
                      (step === 3 && canProceedToStep3) ||
                      (step === 4 && canProceedToStep4)
                    ) {
                      setActiveStep(step);
                    }
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    activeStep === step
                      ? "bg-[#CCFF00] text-black"
                      : activeStep > step
                        ? "bg-green-500 text-white"
                        : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {activeStep > step ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={`text-xs mt-2 ${activeStep >= step ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Sol Panel - Form */}
          <motion.div className="space-y-6" variants={containerVariants}>
            {/* Step 1: Marka Bilgisi */}
            {activeStep === 1 && (
              <motion.div
                className="glass-card p-6 space-y-4"
                variants={itemVariants}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Type className="h-5 w-5 text-[#CCFF00]" />
                  Marka Bilgileri
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Marka Adı *</label>
                  <Input
                    placeholder="Örn: TechVision, Lezzet Durağı"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="glass-card border-0 bg-white/8"
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground">
                    {brandName.length}/30 karakter
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Slogan (Opsiyonel)
                  </label>
                  <Input
                    placeholder="Örn: Geleceği Şekillendiriyoruz"
                    value={slogan}
                    onChange={e => setSlogan(e.target.value)}
                    className="glass-card border-0 bg-white/8"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {slogan.length}/50 karakter
                  </p>
                </div>

                <Button
                  onClick={() => setActiveStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full gradient-button"
                >
                  Devam Et
                </Button>
              </motion.div>
            )}

            {/* Step 2: Sektör & Stil */}
            {activeStep === 2 && (
              <motion.div
                className="glass-card p-6 space-y-4"
                variants={itemVariants}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#CCFF00]" />
                  Sektör & Logo Stili
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Sektör *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind.value}
                        onClick={() => setIndustry(ind.value)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          industry === ind.value
                            ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-lg">{ind.icon}</span>
                        <p className="text-xs font-medium mt-1">{ind.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Logo Stili *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                    {LOGO_STYLES.map(style => (
                      <button
                        key={style.value}
                        onClick={() => setLogoStyle(style.value)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          logoStyle === style.value
                            ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-2xl">{style.preview}</span>
                        <p className="text-xs font-medium mt-1">
                          {style.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {style.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                  <Button
                    onClick={() => setActiveStep(3)}
                    disabled={!canProceedToStep3}
                    className="flex-1 gradient-button"
                  >
                    Devam Et
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Renk & İkon */}
            {activeStep === 3 && (
              <motion.div
                className="glass-card p-6 space-y-4"
                variants={itemVariants}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[#CCFF00]" />
                  Renk Paleti & İkon Tipi
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Renk Paleti *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                    {COLOR_PALETTES.map(palette => (
                      <button
                        key={palette.value}
                        onClick={() => setColorPalette(palette.value)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          colorPalette === palette.value
                            ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex gap-1 mb-2">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-medium">{palette.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {palette.mood}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {colorPalette === "custom" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Özel Renk Seçin
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="glass-card border-0 bg-white/8 w-32"
                        placeholder="#CCFF00"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-medium">İkon Tipi *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ICON_TYPES.map(icon => (
                      <button
                        key={icon.value}
                        onClick={() => setIconType(icon.value)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          iconType === icon.value
                            ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-sm font-medium">{icon.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {icon.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(2)}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                  <Button
                    onClick={() => setActiveStep(4)}
                    disabled={!canProceedToStep4}
                    className="flex-1 gradient-button"
                  >
                    Devam Et
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Son Ayarlar & Oluştur */}
            {activeStep === 4 && (
              <motion.div
                className="glass-card p-6 space-y-4"
                variants={itemVariants}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#CCFF00]" />
                  Son Ayarlar
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Ek Notlar (Opsiyonel)
                  </label>
                  <Textarea
                    placeholder="Logoda olmasını istediğiniz özel detaylar..."
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    className="glass-card border-0 bg-white/8 min-h-20"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Çözünürlük</label>
                  <div className="flex gap-2">
                    {RESOLUTIONS.map(res => (
                      <button
                        key={res.value}
                        onClick={() =>
                          setResolution(res.value as "1K" | "2K" | "4K")
                        }
                        className={`flex-1 p-3 rounded-lg text-center transition-all ${
                          resolution === res.value
                            ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="font-semibold">{res.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {res.description}
                        </p>
                        <p className="text-xs text-[#CCFF00]">
                          {res.credits} kredi
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Varyasyon Sayısı
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 4].map(count => (
                      <button
                        key={count}
                        onClick={() => setVariationCount(count)}
                        className={`flex-1 p-3 rounded-lg text-center transition-all ${
                          variationCount === count
                            ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="font-semibold">{count}</p>
                        <p className="text-xs text-muted-foreground">
                          {count === 1 ? "Tek logo" : `${count} varyasyon`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Özet */}
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Özet
                  </h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      <strong>Marka:</strong> {brandName}{" "}
                      {slogan && `- "${slogan}"`}
                    </p>
                    <p>
                      <strong>Sektör:</strong>{" "}
                      {INDUSTRIES.find(i => i.value === industry)?.label}
                    </p>
                    <p>
                      <strong>Stil:</strong>{" "}
                      {LOGO_STYLES.find(s => s.value === logoStyle)?.label}
                    </p>
                    <p>
                      <strong>Renk:</strong>{" "}
                      {
                        COLOR_PALETTES.find(p => p.value === colorPalette)
                          ?.label
                      }
                    </p>
                    <p>
                      <strong>Tip:</strong>{" "}
                      {ICON_TYPES.find(i => i.value === iconType)?.label}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(3)}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !canGenerate}
                    className="flex-1 gradient-button"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Logo Oluştur ({creditsNeeded} kredi)
                      </>
                    )}
                  </Button>
                </div>

                {!hasEnoughCredits && (
                  <p className="text-xs text-destructive text-center">
                    Yetersiz kredi. {creditsNeeded} kredi gerekli.
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Sağ Panel - Önizleme */}
          <motion.div className="glass-card p-6" variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#CCFF00]" />
              Önizleme
            </h2>

            {isGenerating ? (
              <div className="space-y-4">
                <ImageSkeleton />
                <p className="text-center text-muted-foreground">
                  Logo oluşturuluyor... Bu işlem 30-60 saniye sürebilir.
                </p>
              </div>
            ) : generatedLogos.length > 0 ? (
              <div className="space-y-4">
                <div
                  className={`grid gap-4 ${generatedLogos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {generatedLogos.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Logo ${index + 1}`}
                        className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setPreviewImageUrl(url);
                          setShowImagePreview(true);
                        }}
                      />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(url, index)}
                          className="glass-button"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yeni Varyasyonlar Oluştur
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Brush className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Logonuz burada görünecek
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tüm adımları tamamlayıp "Logo Oluştur" butonuna tıklayın
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <InsufficientCreditsDialog
        isOpen={showInsufficientCreditsDialog}
        onClose={() => setShowInsufficientCreditsDialog(false)}
        creditsNeeded={creditsNeeded}
        currentCredits={creditsQuery.data?.credits || 0}
        userId={user?.id || 0}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={previewImageUrl}
      />
    </div>
  );
}
