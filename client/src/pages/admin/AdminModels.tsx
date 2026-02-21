// @ts-nocheck
/**
 * Admin Models - AI Model Yönetimi
 * Model aç/kapa, limitler, fallback, hata oranları, maliyet takibi
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Cpu,
  Image,
  Video,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  RefreshCw,
  BarChart3,
  ArrowRightLeft,
  Shield,
  Mic,
  Music,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ModelForm {
  modelKey: string;
  modelName: string;
  modelType: "image" | "video" | "upscale" | "audio" | "music";
  provider: string;
  isActive: boolean;
  isMaintenanceMode: boolean;
  maxResolutionWidth: number;
  maxResolutionHeight: number;
  maxVideoDurationSeconds: number | null;
  freeUserDailyLimit: number;
  premiumUserDailyLimit: number;
  creditCostOverride: number | null;
  fallbackModelId: number | null;
  costPerRequest: string;
  priority: number;
  description: string;
  coverImageDesktop: string;
  coverImageMobile: string;
  coverDescription: string;
}

const defaultForm: ModelForm = {
  modelKey: "",
  modelName: "",
  modelType: "image",
  provider: "",
  isActive: true,
  isMaintenanceMode: false,
  maxResolutionWidth: 4096,
  maxResolutionHeight: 4096,
  maxVideoDurationSeconds: null,
  freeUserDailyLimit: 5,
  premiumUserDailyLimit: 50,
  creditCostOverride: null,
  fallbackModelId: null,
  costPerRequest: "0",
  priority: 0,
  description: "",
  coverImageDesktop: "",
  coverImageMobile: "",
  coverDescription: "",
};

export default function AdminModels() {
  const [activeTab, setActiveTab] = useState("image");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ModelForm>(defaultForm);

  const modelsQuery = trpc.adminPanel.getAiModels.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.adminPanel.createAiModel.useMutation({
    onSuccess: () => {
      toast.success("Model başarıyla oluşturuldu");
      utils.adminPanel.getAiModels.invalidate();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateAiModel.useMutation({
    onSuccess: () => {
      toast.success("Model güncellendi");
      utils.adminPanel.getAiModels.invalidate();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const toggleMutation = trpc.adminPanel.toggleAiModel.useMutation({
    onSuccess: () => {
      toast.success("Model durumu güncellendi");
      utils.adminPanel.getAiModels.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const initializeMutation = trpc.adminPanel.initializeAiModels.useMutation({
    onSuccess: data => {
      toast.success(
        `Modeller yüklendi! ${data.inserted} eklendi, ${data.updated} güncellendi`
      );
      utils.adminPanel.getAiModels.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const openEdit = (model: any) => {
    setForm({
      modelKey: model.modelKey,
      modelName: model.modelName,
      modelType: model.modelType,
      provider: model.provider,
      isActive: model.isActive,
      isMaintenanceMode: model.isMaintenanceMode,
      maxResolutionWidth: model.maxResolutionWidth || 4096,
      maxResolutionHeight: model.maxResolutionHeight || 4096,
      maxVideoDurationSeconds: model.maxVideoDurationSeconds,
      freeUserDailyLimit: model.freeUserDailyLimit || 5,
      premiumUserDailyLimit: model.premiumUserDailyLimit || 50,
      creditCostOverride: model.creditCostOverride,
      fallbackModelId: model.fallbackModelId,
      costPerRequest: model.costPerRequest || "0",
      priority: model.priority || 0,
      description: model.description || "",
      coverImageDesktop: model.coverImageDesktop || "",
      coverImageMobile: model.coverImageMobile || "",
      coverDescription: model.coverDescription || "",
    });
    setEditingId(model.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.modelKey || !form.modelName || !form.provider) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    const data = {
      ...form,
      costPerRequest: form.costPerRequest,
    };

    if (isEditing && editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "upscale":
        return <Zap className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "music":
        return <Music className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-[#7C3AED]/20 text-[#7C3AED] border-[#7C3AED]/30";
      case "video":
        return "bg-[#00F5FF]/20 text-[#00F5FF] border-[#00F5FF]/30";
      case "upscale":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "audio":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "music":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusBadge = (model: any) => {
    if (!model.isActive) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Kapalı
        </span>
      );
    }
    if (model.isMaintenanceMode) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Bakım
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" /> Aktif
      </span>
    );
  };

  const calculateErrorRate = (model: any) => {
    const total = model.totalRequests || 0;
    const failed = model.failedRequests || 0;
    if (total === 0) return 0;
    return ((failed / total) * 100).toFixed(1);
  };

  const models = modelsQuery.data || [];
  const imageModels = models.filter((m: any) => m.modelType === "image");
  const videoModels = models.filter((m: any) => m.modelType === "video");
  const audioModels = models.filter((m: any) => m.modelType === "audio");
  const musicModels = models.filter((m: any) => m.modelType === "music");

  // Summary stats
  const totalModels = models.length;
  const activeModels = models.filter(
    (m: any) => m.isActive && !m.isMaintenanceMode
  ).length;
  const totalRequests = models.reduce(
    (sum: number, m: any) => sum + (m.totalRequests || 0),
    0
  );
  const totalCost = models.reduce(
    (sum: number, m: any) => sum + parseFloat(m.totalCostUsd || "0"),
    0
  );

  const renderModelCard = (model: any) => (
    <motion.div
      key={model.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 rounded-2xl border border-white/10 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left - Model Info */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl border ${getTypeColor(model.modelType)}`}
          >
            {getTypeIcon(model.modelType)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{model.modelName}</h3>
              {getStatusBadge(model)}
            </div>
            <p className="text-sm text-zinc-500 mb-2">
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs">
                {model.modelKey}
              </code>
              <span className="mx-2">•</span>
              Provider: {model.provider}
            </p>
            {model.description && (
              <p className="text-sm text-zinc-400">{model.description}</p>
            )}
          </div>
        </div>

        {/* Right - Toggle & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Aktif</span>
            <Switch
              checked={model.isActive}
              onCheckedChange={checked =>
                toggleMutation.mutate({ id: model.id, isActive: checked })
              }
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => openEdit(model)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Toplam İstek</p>
          <p className="font-medium">
            {(model.totalRequests || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Başarılı</p>
          <p className="font-medium text-green-400">
            {(model.successfulRequests || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Hata Oranı</p>
          <p
            className={`font-medium ${parseFloat(calculateErrorRate(model)) > 10 ? "text-red-400" : "text-zinc-400"}`}
          >
            %{calculateErrorRate(model)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Ort. Süre</p>
          <p className="font-medium">
            {model.avgRenderTimeMs
              ? `${(model.avgRenderTimeMs / 1000).toFixed(1)}s`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Maliyet</p>
          <p className="font-medium text-orange-400">
            ${parseFloat(model.totalCostUsd || "0").toFixed(2)}
          </p>
        </div>
      </div>

      {/* Limits Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Free Günlük Limit</p>
          <p className="text-sm">{model.freeUserDailyLimit || 5}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Premium Günlük Limit</p>
          <p className="text-sm">{model.premiumUserDailyLimit || 50}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Maks Çözünürlük</p>
          <p className="text-sm">
            {model.maxResolutionWidth}x{model.maxResolutionHeight}
          </p>
        </div>
        {model.modelType === "video" && (
          <div>
            <p className="text-xs text-zinc-500 mb-1">Maks Süre</p>
            <p className="text-sm">{model.maxVideoDurationSeconds || "-"}s</p>
          </div>
        )}
        {model.fallbackModelId && (
          <div className="flex items-center gap-1 text-orange-400">
            <ArrowRightLeft className="h-3 w-3" />
            <span className="text-xs">Fallback aktif</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Model</p>
              <p className="text-2xl font-bold">{totalModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#7C3AED]/20">
              <Cpu className="h-5 w-5 text-[#7C3AED]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Aktif Model</p>
              <p className="text-2xl font-bold">{activeModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/10 rounded-2xl border border-[#00F5FF]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam İstek</p>
              <p className="text-2xl font-bold">
                {totalRequests.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#00F5FF]/20">
              <TrendingUp className="h-5 w-5 text-[#00F5FF]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl border border-orange-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Maliyet</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/20">
              <DollarSign className="h-5 w-5 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Modeller</h2>
          <p className="text-sm text-zinc-500">
            Model aç/kapa, limit ve fallback ayarları
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => modelsQuery.refetch()}
          >
            <RefreshCw
              className={`h-4 w-4 ${modelsQuery.isFetching ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>
          {models.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#00F5FF]/30 text-[#00F5FF] hover:bg-[#00F5FF]/10"
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
            >
              {initializeMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cpu className="h-4 w-4" />
              )}
              Varsayılan Modelleri Yükle
            </Button>
          )}
          <Button
            className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Model Ekle
          </Button>
        </div>
      </div>

      {/* Tabs for Image and Video Models */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger
            value="image"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Image className="h-4 w-4 mr-2" />
            Görsel Modelleri ({imageModels.length})
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Video className="h-4 w-4 mr-2" />
            Video Modelleri ({videoModels.length})
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Mic className="h-4 w-4 mr-2" />
            Ses Modelleri ({audioModels.length})
          </TabsTrigger>
          <TabsTrigger
            value="music"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Music className="h-4 w-4 mr-2" />
            Müzik Modelleri ({musicModels.length})
          </TabsTrigger>
        </TabsList>

        {/* Image Models Tab */}
        <TabsContent value="image" className="mt-6">
          <div className="grid gap-4">
            {imageModels.map((model: any) => renderModelCard(model))}

            {imageModels.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
                <Image className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Henüz görsel modeli eklenmemiş</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Video Models Tab */}
        <TabsContent value="video" className="mt-6">
          <div className="grid gap-4">
            {videoModels.map((model: any) => renderModelCard(model))}

            {videoModels.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
                <Video className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Henüz video modeli eklenmemiş</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Audio Models Tab */}
        <TabsContent value="audio" className="mt-6">
          <div className="grid gap-4">
            {audioModels.map((model: any) => renderModelCard(model))}

            {audioModels.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
                <Mic className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Henüz ses modeli eklenmemiş</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Music Models Tab */}
        <TabsContent value="music" className="mt-6">
          <div className="grid gap-4">
            {musicModels.map((model: any) => renderModelCard(model))}

            {musicModels.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
                <Music className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Henüz müzik modeli eklenmemiş</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {models.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
          <Cpu className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-500 mb-4">Henüz model eklenmemiş</p>
          <Button
            className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending}
          >
            {initializeMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Cpu className="h-4 w-4" />
            )}
            Varsayılan Modelleri Yükle
          </Button>
          <p className="text-xs text-zinc-600 mt-3">
            Nano Banana Pro, Qwen, SeeDream, Veo 3.1, Sora 2, Kling ve Grok
            modelleri yüklenecek
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Model Düzenle" : "Yeni Model Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Model Key *
                </label>
                <Input
                  value={form.modelKey}
                  onChange={e => setForm({ ...form, modelKey: e.target.value })}
                  placeholder="nano_banana"
                  className="bg-zinc-800 border-white/10"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Model Adı *
                </label>
                <Input
                  value={form.modelName}
                  onChange={e =>
                    setForm({ ...form, modelName: e.target.value })
                  }
                  placeholder="Nano Banana Pro"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Model Tipi *
                </label>
                <Select
                  value={form.modelType}
                  onValueChange={(value: any) =>
                    setForm({ ...form, modelType: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Görsel</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="upscale">Upscale</SelectItem>
                    <SelectItem value="audio">Ses (TTS)</SelectItem>
                    <SelectItem value="music">Müzik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Provider *
                </label>
                <Input
                  value={form.provider}
                  onChange={e => setForm({ ...form, provider: e.target.value })}
                  placeholder="kie_ai"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={checked =>
                    setForm({ ...form, isActive: checked })
                  }
                />
                <label className="text-sm">Aktif</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isMaintenanceMode}
                  onCheckedChange={checked =>
                    setForm({ ...form, isMaintenanceMode: checked })
                  }
                />
                <label className="text-sm">Bakım Modu</label>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium mb-3">Limitler</h4>
              {!["audio", "music"].includes(form.modelType) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Maks Genişlik (px)
                    </label>
                    <Input
                      type="number"
                      value={form.maxResolutionWidth}
                      onChange={e =>
                        setForm({
                          ...form,
                          maxResolutionWidth: parseInt(e.target.value) || 4096,
                        })
                      }
                      className="bg-zinc-800 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Maks Yükseklik (px)
                    </label>
                    <Input
                      type="number"
                      value={form.maxResolutionHeight}
                      onChange={e =>
                        setForm({
                          ...form,
                          maxResolutionHeight: parseInt(e.target.value) || 4096,
                        })
                      }
                      className="bg-zinc-800 border-white/10"
                    />
                  </div>
                </div>
              )}
            </div>

            {form.modelType === "video" && (
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Maks Video Süresi (saniye)
                </label>
                <Input
                  type="number"
                  value={form.maxVideoDurationSeconds || ""}
                  onChange={e =>
                    setForm({
                      ...form,
                      maxVideoDurationSeconds: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Free Kullanıcı Günlük Limit
                </label>
                <Input
                  type="number"
                  value={form.freeUserDailyLimit}
                  onChange={e =>
                    setForm({
                      ...form,
                      freeUserDailyLimit: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Premium Kullanıcı Günlük Limit
                </label>
                <Input
                  type="number"
                  value={form.premiumUserDailyLimit}
                  onChange={e =>
                    setForm({
                      ...form,
                      premiumUserDailyLimit: parseInt(e.target.value) || 50,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Kredi Maliyeti (override)
                </label>
                <Input
                  type="number"
                  value={form.creditCostOverride || ""}
                  onChange={e =>
                    setForm({
                      ...form,
                      creditCostOverride: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Varsayılan kullan"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  API Maliyeti (USD)
                </label>
                <Input
                  value={form.costPerRequest}
                  onChange={e =>
                    setForm({ ...form, costPerRequest: e.target.value })
                  }
                  placeholder="0.001"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Öncelik (Queue)
                </label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={e =>
                    setForm({
                      ...form,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Fallback Model ID
                </label>
                <Input
                  type="number"
                  value={form.fallbackModelId || ""}
                  onChange={e =>
                    setForm({
                      ...form,
                      fallbackModelId: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Yok"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Açıklama
              </label>
              <Textarea
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Model hakkında açıklama..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium mb-3">Kapak Resimleri</h4>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">
                    Masaüstü Kapak Resmi URL
                  </label>
                  <Input
                    value={form.coverImageDesktop}
                    onChange={e =>
                      setForm({ ...form, coverImageDesktop: e.target.value })
                    }
                    placeholder="https://example.com/desktop-cover.jpg"
                    className="bg-zinc-800 border-white/10"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Masaüstü görünümde gösterilecek kapak resmi
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">
                    Mobil Kapak Resmi URL
                  </label>
                  <Input
                    value={form.coverImageMobile}
                    onChange={e =>
                      setForm({ ...form, coverImageMobile: e.target.value })
                    }
                    placeholder="https://example.com/mobile-cover.jpg"
                    className="bg-zinc-800 border-white/10"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Mobil görünümde gösterilecek kapak resmi
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">
                    Kapak Açıklaması
                  </label>
                  <Textarea
                    value={form.coverDescription}
                    onChange={e =>
                      setForm({ ...form, coverDescription: e.target.value })
                    }
                    placeholder="Model için gösterilecek açıklama/slogan..."
                    className="bg-zinc-800 border-white/10"
                    rows={2}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Model sayfasında gösterilecek açıklama metni
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDialog}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-[#00F5FF] hover:bg-[#00F5FF] text-black"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Kaydediliyor..."
                  : isEditing
                    ? "Güncelle"
                    : "Ekle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
