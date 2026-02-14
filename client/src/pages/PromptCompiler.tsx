import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { getLoginUrl } from "@/const";
import { useLocation as useWouterLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Copy,
  Sparkles,
  RefreshCw,
  Minus,
  Plus,
  Zap,
  Image,
  Video,
  Film,
  Globe,
  ArrowLeft,
  Check,
  Loader2,
  Settings,
  FileText,
  ListChecks,
  Coins,
} from "lucide-react";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import { useLocation } from "wouter";

// Types
type Mode = "image" | "t2v" | "i2v" | "universal";
type AspectRatio = "1:1" | "9:16" | "16:9" | "4:5";
type Style =
  | "realistic"
  | "cinematic"
  | "anime"
  | "3d"
  | "illustration"
  | "product"
  | "ugc_ad";
type Quality = "draft" | "high" | "ultra";

interface CompilerResult {
  master_prompt_en: string;
  negative_prompt_en: string;
  settings: {
    mode: string;
    aspect_ratio: string;
    style: string;
    quality: string;
    camera: string;
    lighting: string;
    environment: string;
    subject: string;
    actions: string;
    constraints: string[];
  };
  tr_summary: string[];
  variants_en: string[];
}

// Aspect ratio options (no translation needed)
const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1", description: "Kare" },
  { value: "9:16", label: "9:16", description: "Dikey (Reels)" },
  { value: "16:9", label: "16:9", description: "Yatay (YouTube)" },
  { value: "4:5", label: "4:5", description: "Instagram" },
];

// Style options (no translation needed)
const STYLES = [
  { value: "realistic", label: "Realistic", emoji: "📷" },
  { value: "cinematic", label: "Cinematic", emoji: "🎬" },
  { value: "anime", label: "Anime", emoji: "🎌" },
  { value: "3d", label: "3D Render", emoji: "🎮" },
  { value: "illustration", label: "Illustration", emoji: "🎨" },
  { value: "product", label: "Product", emoji: "🛍️" },
  { value: "ugc_ad", label: "UGC Ad", emoji: "📱" },
];

export default function PromptCompiler() {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useWouterLocation();
  const { t } = useLanguage();

  // Mode options (needs translation)
  const MODES = [
    {
      value: "image",
      label: t("promptCompiler.model.image"),
      icon: Image,
      description: t("promptCompiler.model.imageDesc"),
    },
    {
      value: "t2v",
      label: "Text-to-Video",
      icon: Video,
      description: "Sora / Veo / Kling",
    },
    {
      value: "i2v",
      label: "Image-to-Video",
      icon: Film,
      description: "Referans koruyarak",
    },
    {
      value: "universal",
      label: t("promptCompiler.model.universal"),
      icon: Globe,
      description: t("promptCompiler.model.universalDesc"),
    },
  ];

  // Quality options (needs translation)
  const QUALITIES = [
    {
      value: "draft",
      label: t("promptCompiler.quality.draft"),
      description: t("promptCompiler.quality.draftDesc"),
    },
    {
      value: "high",
      label: t("promptCompiler.quality.high"),
      description: t("promptCompiler.quality.highDesc"),
    },
    { value: "ultra", label: "Ultra", description: "Maksimum" },
  ];

  // Form state
  const [inputTr, setInputTr] = useState("");
  const [mode, setMode] = useState<Mode>("image");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [style, setStyle] = useState<Style>("realistic");
  const [quality, setQuality] = useState<Quality>("high");
  const [noIdentity, setNoIdentity] = useState(true);

  // Result state
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [activeTab, setActiveTab] = useState("master");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Kredi maliyeti
  const CREDIT_COST = 1;

  // Yetersiz kredi dialog state
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);

  // API mutations
  const compileMutation = trpc.promptCompiler.compile.useMutation({
    onSuccess: data => {
      if (data.success && data.data) {
        setResult(data.data);
        toast.success(t("promptCompiler.toast.success"));
      } else {
        toast.error(data.error || t("promptCompiler.toast.error"));
      }
    },
    onError: error => {
      if (error.message === "INSUFFICIENT_CREDITS") {
        setShowInsufficientCredits(true);
      } else if (
        error.message?.includes("UNAUTHORIZED") ||
        error.message?.includes("10001") ||
        error.message?.includes("login")
      ) {
        toast.error(t("promptCompiler.toast.sessionExpired"));
      } else {
        toast.error(t("promptCompiler.toast.generationError"));
      }
    },
  });

  // Get demos
  const { data: demos } = trpc.promptCompiler.getDemos.useQuery();

  // Handlers
  const handleCompile = () => {
    if (!inputTr.trim()) {
      toast.error(t("promptCompiler.toast.enterDescription"));
      return;
    }
    compileMutation.mutate({
      input_tr: inputTr,
      mode,
      aspect_ratio: aspectRatio,
      style,
      quality,
      no_identity: noIdentity,
      action: "compile",
    });
  };

  const handleShorter = () => {
    if (!result) return;
    compileMutation.mutate({
      input_tr: inputTr,
      mode,
      aspect_ratio: aspectRatio,
      style,
      quality,
      no_identity: noIdentity,
      action: "shorter",
      previous_prompt: JSON.stringify(result),
    });
  };

  const handleDetailed = () => {
    if (!result) return;
    compileMutation.mutate({
      input_tr: inputTr,
      mode,
      aspect_ratio: aspectRatio,
      style,
      quality,
      no_identity: noIdentity,
      action: "detailed",
      previous_prompt: JSON.stringify(result),
    });
  };

  const handleHook = () => {
    if (!result || mode === "image") return;
    compileMutation.mutate({
      input_tr: inputTr,
      mode,
      aspect_ratio: aspectRatio,
      style,
      quality,
      no_identity: noIdentity,
      action: "hook",
      previous_prompt: JSON.stringify(result),
    });
  };

  const handleVariant = (variant: string) => {
    setResult(prev => (prev ? { ...prev, master_prompt_en: variant } : null));
    toast.success(t("promptCompiler.toast.variationSelected"));
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("promptCompiler.toast.copied"));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDemo = (
    demo: typeof demos extends (infer T)[] | undefined ? T : never
  ) => {
    if (!demo) return;
    setInputTr(demo.input_tr);
    setMode(demo.mode);
    setAspectRatio(demo.aspect_ratio);
    setStyle(demo.style);
    setQuality(demo.quality);
  };

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

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-[#F9FAFB]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-brand to-green-500 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#F9FAFB]">
                  Prompt Ustası
                </h1>
                <p className="text-xs text-zinc-500">TR → Master Prompt (EN)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 pb-24 md:pb-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input & Settings */}
          <div className="space-y-6">
            {/* Input Block */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#F9FAFB] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon-brand" />
                  Ne Üretmek İstiyorsun?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputTr}
                  onChange={e => setInputTr(e.target.value)}
                  placeholder={t("promptCompiler.example")}
                  className="min-h-[120px] bg-zinc-800 border-zinc-700 text-[#F9FAFB] placeholder:text-zinc-500 resize-none"
                />

                {/* Demo buttons */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-zinc-500">Demo:</span>
                  {demos?.map(demo => (
                    <Button
                      key={demo.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemo(demo)}
                      className="text-xs border-zinc-700 hover:bg-zinc-800 hover:border-neon-brand/50"
                    >
                      {demo.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settings Block */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#F9FAFB] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neon-brand" />
                  Hızlı Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Çıktı Tipi</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MODES.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMode(m.value as Mode)}
                        className={`p-3 rounded-xl border transition-all ${
                          mode === m.value
                            ? "bg-neon-brand/10 border-neon-brand text-neon-brand"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <m.icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{m.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Oran</Label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map(ar => (
                      <button
                        key={ar.value}
                        onClick={() => setAspectRatio(ar.value as AspectRatio)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          aspectRatio === ar.value
                            ? "bg-neon-brand/10 border-neon-brand text-neon-brand"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <span className="font-medium">{ar.label}</span>
                        <span className="text-xs ml-1 opacity-60">
                          ({ar.description})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Stil</Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value as Style)}
                        className={`px-3 py-2 rounded-lg border transition-all ${
                          style === s.value
                            ? "bg-neon-brand/10 border-neon-brand text-neon-brand"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <span className="mr-1">{s.emoji}</span>
                        <span className="text-sm">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Kalite</Label>
                  <div className="flex gap-2">
                    {QUALITIES.map(q => (
                      <button
                        key={q.value}
                        onClick={() => setQuality(q.value as Quality)}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                          quality === q.value
                            ? "bg-neon-brand/10 border-neon-brand text-neon-brand"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <div className="font-medium">{q.label}</div>
                        <div className="text-xs opacity-60">
                          {q.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* No Identity Toggle */}
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-[#F9FAFB]">
                      Kimlik Koruma
                    </div>
                    <div className="text-xs text-zinc-500">
                      Gerçek kişilere benzetme yapma
                    </div>
                  </div>
                  <button
                    onClick={() => setNoIdentity(!noIdentity)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      noIdentity ? "bg-neon-brand" : "bg-zinc-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        noIdentity ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleCompile}
                  disabled={compileMutation.isPending || !inputTr.trim()}
                  className="w-full h-12 bg-neon-brand hover:bg-[#00F5FF] text-black font-bold text-base"
                >
                  {compileMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Prompt Oluştur
                      <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {CREDIT_COST}
                      </span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#F9FAFB] flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-neon-brand" />
                  Çıktı Paneli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full bg-zinc-800 p-1">
                          <TabsTrigger
                            value="master"
                            className="flex-1 text-xs"
                          >
                            Master Prompt
                          </TabsTrigger>
                          <TabsTrigger
                            value="negative"
                            className="flex-1 text-xs"
                          >
                            Negative
                          </TabsTrigger>
                          <TabsTrigger
                            value="settings"
                            className="flex-1 text-xs"
                          >
                            Settings
                          </TabsTrigger>
                          <TabsTrigger
                            value="summary"
                            className="flex-1 text-xs"
                          >
                            TR Özet
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="master" className="mt-4">
                          <div className="relative">
                            <div className="p-4 bg-zinc-800 rounded-xl text-[#F9FAFB] text-sm leading-relaxed min-h-[200px]">
                              {result.master_prompt_en}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(result.master_prompt_en, "master")
                              }
                              className="absolute top-2 right-2"
                            >
                              {copiedField === "master" ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {/* Variants */}
                          {result.variants_en.length > 0 && (
                            <div className="mt-4">
                              <Label className="text-zinc-400 text-sm mb-2 block">
                                Varyasyonlar
                              </Label>
                              <div className="space-y-2">
                                {result.variants_en.map((variant, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleVariant(variant)}
                                    className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left text-sm text-zinc-300 transition-colors"
                                  >
                                    <span className="text-neon-brand font-medium mr-2">
                                      #{i + 1}
                                    </span>
                                    {variant.slice(0, 100)}...
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="negative" className="mt-4">
                          <div className="relative">
                            <div className="p-4 bg-zinc-800 rounded-xl text-[#F9FAFB] text-sm leading-relaxed min-h-[200px]">
                              {result.negative_prompt_en}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(
                                  result.negative_prompt_en,
                                  "negative"
                                )
                              }
                              className="absolute top-2 right-2"
                            >
                              {copiedField === "negative" ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="settings" className="mt-4">
                          <div className="relative">
                            <pre className="p-4 bg-zinc-800 rounded-xl text-green-400 text-xs overflow-auto min-h-[200px]">
                              {JSON.stringify(result.settings, null, 2)}
                            </pre>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(result.settings, null, 2),
                                  "settings"
                                )
                              }
                              className="absolute top-2 right-2"
                            >
                              {copiedField === "settings" ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="summary" className="mt-4">
                          <div className="p-4 bg-zinc-800 rounded-xl min-h-[200px]">
                            <ul className="space-y-3">
                              {result.tr_summary.map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 text-[#F9FAFB] text-sm"
                                >
                                  <span className="w-6 h-6 rounded-full bg-neon-brand/20 text-neon-brand flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShorter}
                          disabled={compileMutation.isPending}
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          Daha Kısa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDetailed}
                          disabled={compileMutation.isPending}
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Daha Detaylı
                        </Button>
                        {mode !== "image" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleHook}
                            disabled={compileMutation.isPending}
                            className="border-zinc-700 hover:bg-zinc-800"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Hook Ekle
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCompile}
                          disabled={compileMutation.isPending}
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Yeniden Üret
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                        <Wand2 className="w-10 h-10 text-zinc-600" />
                      </div>
                      <h3 className="text-lg font-medium text-zinc-400 mb-2">
                        Prompt Bekliyor
                      </h3>
                      <p className="text-sm text-zinc-600 max-w-xs">
                        {t("promptCompiler.instructions")}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-neon-brand/10 to-transparent border-neon-brand/20">
              <CardContent className="pt-6">
                <h3 className="text-neon-brand font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  İpuçları
                </h3>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li>• Detaylı yazmana gerek yok, AI eksikleri tamamlar</li>
                  <li>
                    • "TikTok viral" yazarsan otomatik 9:16 ve hook önerir
                  </li>
                  <li>
                    • Gerçek kişi benzetmesi güvenlik nedeniyle engellenir
                  </li>
                  <li>
                    • Varyasyonlardan birini seçerek farklı versiyonlar dene
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Yetersiz Kredi Dialog */}
      <InsufficientCreditsDialog
        isOpen={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
        creditsNeeded={CREDIT_COST}
        currentCredits={user?.credits || 0}
        userId={user?.id || 0}
      />
    </div>
  );
}
