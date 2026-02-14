/**
 * Admin Pricing - Özellik Fiyatlandırması
 * Tüm özellikler için kredi maliyetlerini yönetin
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  Edit,
  Image,
  Video,
  Zap,
  Wand2,
  Camera,
  Film,
  Box,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";

interface PricingForm {
  featureKey: string;
  featureName: string;
  category: string;
  credits: number;
  description: string;
  isActive: boolean;
}

const defaultForm: PricingForm = {
  featureKey: "",
  featureName: "",
  category: "image",
  credits: 10,
  description: "",
  isActive: true,
};

const categories = [
  { value: "image", label: "Görsel" },
  { value: "video", label: "Video" },
  { value: "upscale", label: "Upscale" },
  { value: "ai_character", label: "AI Karakter" },
  { value: "viral_app", label: "Viral App" },
  { value: "multi_angle", label: "Multi-Angle" },
  { value: "product_promo", label: "Ürün Promo" },
  { value: "ugc_ad", label: "UGC Reklam" },
];

export default function AdminPricing() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PricingForm>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const pricingQuery = trpc.adminPanel.getFeaturePricing.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.adminPanel.createFeaturePricing.useMutation({
    onSuccess: () => {
      toast.success("Fiyat eklendi");
      utils.adminPanel.getFeaturePricing.invalidate();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateFeaturePricing.useMutation({
    onSuccess: () => {
      toast.success("Fiyat güncellendi");
      utils.adminPanel.getFeaturePricing.invalidate();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const deleteMutation = trpc.adminPanel.deleteFeaturePricing.useMutation({
    onSuccess: () => {
      toast.success("Fiyat silindi");
      utils.adminPanel.getFeaturePricing.invalidate();
      setDeleteConfirm(null);
    },
    onError: error => toast.error(error.message),
  });

  const initializeMutation =
    trpc.adminPanel.initializeFeaturePricing.useMutation({
      onSuccess: data => {
        toast.success(
          `Fiyatlandırma yüklendi! ${data.inserted} eklendi, ${data.updated} güncellendi`
        );
        utils.adminPanel.getFeaturePricing.invalidate();
      },
      onError: error => toast.error(error.message),
    });

  const closeDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const openEdit = (item: any) => {
    setForm({
      featureKey: item.featureKey,
      featureName: item.featureName,
      category: item.category,
      credits: item.credits,
      description: item.description || "",
      isActive: item.isActive,
    });
    setEditingId(item.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.featureKey || !form.featureName) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        credits: form.credits,
        featureName: form.featureName,
        description: form.description,
        isActive: form.isActive,
      });
    } else {
      createMutation.mutate({
        featureKey: form.featureKey,
        featureName: form.featureName,
        category: form.category as any,
        credits: form.credits,
        description: form.description,
        isActive: form.isActive,
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "upscale":
        return <Wand2 className="h-5 w-5" />;
      case "ai_character":
        return <Camera className="h-5 w-5" />;
      case "viral_app":
        return <Zap className="h-5 w-5" />;
      case "multi_angle":
        return <Box className="h-5 w-5" />;
      case "product_promo":
      case "ugc_ad":
        return <Film className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "image":
        return "bg-[#7C3AED]/20 text-[#7C3AED] border-[#7C3AED]/30";
      case "video":
        return "bg-[#FF2E97]/20 text-[#FF2E97] border-[#FF2E97]/30";
      case "upscale":
        return "bg-[#00F5FF]/20 text-[#00F5FF] border-[#00F5FF]/30";
      case "ai_character":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "viral_app":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "multi_angle":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "product_promo":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "ugc_ad":
        return "bg-[#00F5FF]/20 text-[#00F5FF] border-[#00F5FF]/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  // Group by category
  const groupedPricing = pricingQuery.data?.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof pricingQuery.data>
  );

  // Calculate stats
  const totalFeatures = pricingQuery.data?.length || 0;
  const activeFeatures = pricingQuery.data?.filter(p => p.isActive).length || 0;
  const avgCredits = pricingQuery.data?.length
    ? Math.round(
        pricingQuery.data.reduce((sum, p) => sum + p.credits, 0) /
          pricingQuery.data.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Özellik</p>
              <p className="text-2xl font-bold">{totalFeatures}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#7C3AED]/20">
              <DollarSign className="h-5 w-5 text-[#7C3AED]" />
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
              <p className="text-sm text-zinc-400">Aktif Özellik</p>
              <p className="text-2xl font-bold">{activeFeatures}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <Zap className="h-5 w-5 text-green-400" />
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
              <p className="text-sm text-zinc-400">Ort. Kredi</p>
              <p className="text-2xl font-bold">{avgCredits}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#00F5FF]/20">
              <DollarSign className="h-5 w-5 text-[#00F5FF]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Özellik Fiyatlandırması</h2>
          <p className="text-sm text-zinc-500">
            Her özellik için kredi maliyetlerini ayarlayın
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => pricingQuery.refetch()}
          >
            <RefreshCw
              className={`h-4 w-4 ${pricingQuery.isFetching ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>
          {totalFeatures === 0 && (
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
                <Download className="h-4 w-4" />
              )}
              Varsayılan Fiyatları Yükle
            </Button>
          )}
          <Button
            className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Yeni Fiyat Ekle
          </Button>
        </div>
      </div>

      {/* Pricing by Category */}
      {groupedPricing && Object.keys(groupedPricing).length > 0 ? (
        Object.entries(groupedPricing).map(([category, items]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg border ${getCategoryColor(category)}`}
                >
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-semibold">{getCategoryLabel(category)}</h3>
                <span className="text-xs text-zinc-500">
                  ({items?.length} özellik)
                </span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {items?.map(item => (
                <div
                  key={item.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.featureName}</p>
                      {!item.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                          Pasif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      <code className="px-1 py-0.5 bg-zinc-800 rounded">
                        {item.featureKey}
                      </code>
                    </p>
                    {item.description && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="min-w-[80px] text-right">
                      <span className="text-xl font-bold text-[#00F5FF]">
                        {item.credits}
                      </span>
                      <span className="text-xs text-zinc-500 ml-1">kredi</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => setDeleteConfirm(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-500 mb-4">
            Henüz fiyatlandırma tanımlanmamış
          </p>
          <Button
            className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending}
          >
            {initializeMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Varsayılan Fiyatları Yükle
          </Button>
          <p className="text-xs text-zinc-600 mt-3">
            Görsel, Video, Upscale, AI Karakter ve Viral App fiyatları
            yüklenecek
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Fiyat Düzenle" : "Yeni Fiyat Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Feature Key *
              </label>
              <Input
                value={form.featureKey}
                onChange={e => setForm({ ...form, featureKey: e.target.value })}
                placeholder="video_veo3_fast"
                className="bg-zinc-800 border-white/10"
                disabled={isEditing}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Benzersiz tanımlayıcı (değiştirilemez)
              </p>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Özellik Adı *
              </label>
              <Input
                value={form.featureName}
                onChange={e =>
                  setForm({ ...form, featureName: e.target.value })
                }
                placeholder="Video üretim (Veo 3.1 Hızlı)"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Kategori *
                </label>
                <Select
                  value={form.category}
                  onValueChange={value => setForm({ ...form, category: value })}
                  disabled={isEditing}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Kredi Maliyeti *
                </label>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={e =>
                    setForm({ ...form, credits: parseInt(e.target.value) || 0 })
                  }
                  className="bg-zinc-800 border-white/10"
                  min={0}
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
                placeholder="Bu özellik hakkında kısa açıklama..."
                className="bg-zinc-800 border-white/10"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={checked =>
                  setForm({ ...form, isActive: checked })
                }
              />
              <label className="text-sm">Aktif</label>
            </div>

            <div className="flex gap-3 pt-4">
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="bg-zinc-900 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Silmek istediğinizden emin misiniz?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Bu fiyatlandırma kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              İptal
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-[#F9FAFB]"
              onClick={() =>
                deleteConfirm && deleteMutation.mutate({ id: deleteConfirm })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
