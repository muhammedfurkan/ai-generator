/**
 * Admin AI Influencer - Görsel Üretim Ayarları
 * AI Influencer sayfası için Nano Banana Pro fiyatlandırması
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Image,
  Sparkles,
  Save,
  RefreshCw,
  DollarSign,
  Settings,
} from "lucide-react";

interface ModelPricing {
  "1K": number;
  "2K": number;
  "4K": number;
}

interface AiInfluencerSettings {
  nanoBananaPricing: ModelPricing;
  qwenPricing: ModelPricing;
  seedreamPricing: { basic: number; high: number };
  defaultModel: string;
  isNanoBananaEnabled: boolean;
  isQwenEnabled: boolean;
  isSeedreamEnabled: boolean;
}

const defaultSettings: AiInfluencerSettings = {
  nanoBananaPricing: { "1K": 12, "2K": 18, "4K": 25 },
  qwenPricing: { "1K": 10, "2K": 15, "4K": 20 },
  seedreamPricing: { basic: 8, high: 15 },
  defaultModel: "nano-banana-pro",
  isNanoBananaEnabled: true,
  isQwenEnabled: true,
  isSeedreamEnabled: true,
};

export default function AdminAiInfluencer() {
  const [settings, setSettings] = useState<AiInfluencerSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const utils = trpc.useUtils();

  // Get AI Influencer settings
  const settingsQuery = trpc.adminPanel.getAiInfluencerSettings.useQuery();

  // Update settings mutation
  const updateMutation = trpc.adminPanel.updateAiInfluencerSettings.useMutation({
    onSuccess: () => {
      toast.success("Ayarlar kaydedildi");
      setHasChanges(false);
      utils.adminPanel.getAiInfluencerSettings.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data as AiInfluencerSettings);
    }
  }, [settingsQuery.data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePricing = (
    resolution: "1K" | "2K" | "4K",
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      nanoBananaPricing: {
        ...prev.nanoBananaPricing,
        [resolution]: value,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Image className="h-5 w-5 text-purple-400" />
            AI Influencer Ayarları
          </h2>
          <p className="text-sm text-zinc-500">
            Nano Banana Pro görsel üretim fiyatlandırması
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => settingsQuery.refetch()}
            disabled={settingsQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${settingsQuery.isFetching ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kaydet
            </Button>
          )}
        </div>
      </div>

      {/* Nano Banana Pro Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl"
      >
        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Nano Banana Pro</CardTitle>
                <CardDescription>AI Influencer görsel üretim modeli</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {(["1K", "2K", "4K"] as const).map((resolution) => (
                <div key={resolution} className="space-y-2">
                  <label className="text-sm text-zinc-400 block font-medium">
                    {resolution} Çözünürlük
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={settings.nanoBananaPricing[resolution]}
                      onChange={(e) =>
                        updatePricing(resolution, parseInt(e.target.value) || 0)
                      }
                      className="bg-zinc-800 border-white/10 pr-14 text-lg font-semibold"
                      min={0}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                      kredi
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              Yüksek kaliteli görsel üretimi için varsayılan model. Çözünürlük arttıkça daha detaylı görseller üretilir.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 max-w-xl"
      >
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-purple-400 mt-0.5" />
          <div>
            <p className="text-sm text-purple-300">
              Bu sayfa <strong>/ai-influencer</strong> sayfasındaki görsel üretim fiyatlarını kontrol eder.
            </p>
            <p className="text-xs text-purple-400 mt-1">
              Değişiklikler kaydet butonuna bastıktan sonra aktif olur ve kullanıcılara yansır.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 max-w-xl"
      >
        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">1K Fiyat</p>
                <p className="text-2xl font-bold text-green-400">
                  {settings.nanoBananaPricing["1K"]}
                </p>
                <p className="text-xs text-zinc-500">kredi</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">2K Fiyat</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {settings.nanoBananaPricing["2K"]}
                </p>
                <p className="text-xs text-zinc-500">kredi</p>
              </div>
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">4K Fiyat</p>
                <p className="text-2xl font-bold text-orange-400">
                  {settings.nanoBananaPricing["4K"]}
                </p>
                <p className="text-xs text-zinc-500">kredi</p>
              </div>
              <DollarSign className="h-6 w-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
