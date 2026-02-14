/**
 * Admin Viral Apps - Viral Uygulama Yönetimi
 * Ekleme, düzenleme, silme ve varsayılan uygulamaları yükleme
 */
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
import { toast } from "sonner";
import { useState } from "react";
import {
  Zap,
  Edit,
  Star,
  TrendingUp,
  CreditCard,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";

interface ViralAppForm {
  appKey: string;
  name: string;
  description: string;
  emoji: string;
  credits: number;
  sortOrder: number;
  isActive: boolean;
  isPopular: boolean;
  promptTemplate: string;
}

const defaultForm: ViralAppForm = {
  appKey: "",
  name: "",
  description: "",
  emoji: "🚀",
  credits: 20,
  sortOrder: 0,
  isActive: true,
  isPopular: false,
  promptTemplate: "",
};

export default function AdminViralApps() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ViralAppForm>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const viralAppsQuery = trpc.adminPanel.getViralAppsConfig.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.adminPanel.createViralAppConfig.useMutation({
    onSuccess: () => {
      toast.success("Uygulama oluşturuldu");
      utils.adminPanel.getViralAppsConfig.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateViralAppConfig.useMutation({
    onSuccess: () => {
      toast.success("Uygulama güncellendi");
      utils.adminPanel.getViralAppsConfig.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.adminPanel.deleteViralAppConfig.useMutation({
    onSuccess: () => {
      toast.success("Uygulama silindi");
      utils.adminPanel.getViralAppsConfig.invalidate();
      setDeleteConfirm(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const initializeMutation = trpc.adminPanel.initializeViralApps.useMutation({
    onSuccess: (data) => {
      toast.success(`Uygulamalar yüklendi! ${data.inserted} eklendi`);
      utils.adminPanel.getViralAppsConfig.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const openCreate = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (app: any) => {
    setForm({
      appKey: app.appKey,
      name: app.name,
      description: app.description || "",
      emoji: app.emoji || "🚀",
      credits: app.credits,
      sortOrder: app.sortOrder || 0,
      isActive: app.isActive,
      isPopular: app.isPopular || false,
      promptTemplate: app.promptTemplate || "",
    });
    setEditingId(app.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.appKey || !form.name) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        name: form.name,
        description: form.description,
        emoji: form.emoji,
        credits: form.credits,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        isPopular: form.isPopular,
        promptTemplate: form.promptTemplate,
      });
    } else {
      createMutation.mutate(form);
    }
  };

  const apps = viralAppsQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Viral Uygulamalar</h2>
          <p className="text-sm text-zinc-500">Viral uygulama konfigürasyonlarını yönetin</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => viralAppsQuery.refetch()}
          >
            <RefreshCw className={`h-4 w-4 ${viralAppsQuery.isFetching ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          {apps.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-lime-500/30 text-lime-400 hover:bg-lime-500/10"
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
            >
              {initializeMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Varsayılan Uygulamaları Yükle
            </Button>
          )}
          <Button
            className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Uygulama Ekle
          </Button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app: any) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              bg-zinc-900/50 rounded-2xl border p-5
              ${app.isPopular ? "border-yellow-500/50" : "border-white/10"}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{app.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{app.name}</h3>
                    {app.isPopular && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                  </div>
                  <p className="text-xs text-zinc-500">{app.appKey}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(app)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => setDeleteConfirm(app.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{app.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-lime-400">
                  <CreditCard className="h-4 w-4" />
                  {app.credits}
                </span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <TrendingUp className="h-4 w-4" />
                  {app.usageCount || 0}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${app.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
              >
                {app.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
          <Zap className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-500 mb-4">Henüz viral uygulama tanımlanmamış</p>
          <Button
            className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending}
          >
            {initializeMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Varsayılan Uygulamaları Yükle
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Uygulamayı Düzenle" : "Yeni Uygulama Ekle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Emoji</label>
                <Input
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="bg-zinc-800 border-white/10 text-center text-2xl"
                />
              </div>
              <div className="col-span-3">
                <label className="text-sm font-medium mb-2 block">App Key *</label>
                <Input
                  value={form.appKey}
                  onChange={(e) => setForm({ ...form, appKey: e.target.value })}
                  placeholder="story_generator"
                  className="bg-zinc-800 border-white/10"
                  disabled={isEditing}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">İsim *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Hikaye Oluşturucu"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Açıklama</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Bu uygulama hakkında kısa açıklama..."
                className="bg-zinc-800 border-white/10"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prompt Şablonu (Kullanılmayacaksa boş bırakın)</label>
              <Textarea
                value={form.promptTemplate}
                onChange={(e) => setForm({ ...form, promptTemplate: e.target.value })}
                placeholder="Video oluşturulurken kullanılacak prompt..."
                className="bg-zinc-800 border-white/10"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kredi</label>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sıralama</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <span className="text-sm">Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPopular}
                  onCheckedChange={(checked) => setForm({ ...form, isPopular: checked })}
                />
                <span className="text-sm">Popüler</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={closeDialog}>
                İptal
              </Button>
              <Button
                className="flex-1 bg-lime-500 hover:bg-lime-600 text-black"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Silmek istediğinizden emin misiniz?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Bu uygulama kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              İptal
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => deleteConfirm && deleteMutation.mutate({ id: deleteConfirm })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
