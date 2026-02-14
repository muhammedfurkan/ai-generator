/**
 * Admin Announcements - Duyuru Yönetimi
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Bell,
  AlertTriangle,
  Info,
  MessageSquare,
  Eye,
  MousePointer,
} from "lucide-react";

export default function AdminAnnouncements() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "banner" as "popup" | "banner" | "notification" | "maintenance",
    targetAudience: "all" as "all" | "logged_in" | "logged_out" | "new_users",
    buttonText: "",
    buttonUrl: "",
    isActive: true,
    dismissible: true,
    priority: 0,
  });

  const announcementsQuery = trpc.adminPanel.getAnnouncements.useQuery();

  const createMutation = trpc.adminPanel.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Duyuru oluşturuldu");
      announcementsQuery.refetch();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Duyuru güncellendi");
      announcementsQuery.refetch();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.adminPanel.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Duyuru silindi");
      announcementsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      title: "",
      content: "",
      type: "banner",
      targetAudience: "all",
      buttonText: "",
      buttonUrl: "",
      isActive: true,
      dismissible: true,
      priority: 0,
    });
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      targetAudience: item.targetAudience,
      buttonText: item.buttonText || "",
      buttonUrl: item.buttonUrl || "",
      isActive: item.isActive,
      dismissible: item.dismissible,
      priority: item.priority,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "popup":
        return <MessageSquare className="h-4 w-4" />;
      case "banner":
        return <Megaphone className="h-4 w-4" />;
      case "notification":
        return <Bell className="h-4 w-4" />;
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "popup":
        return "bg-purple-500/20 text-purple-400";
      case "banner":
        return "bg-blue-500/20 text-blue-400";
      case "notification":
        return "bg-green-500/20 text-green-400";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Duyurular</h2>
          <p className="text-sm text-zinc-500">Popup, banner ve bildirim yönetimi</p>
        </div>
        <Button
          className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Duyuru
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcementsQuery.data?.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.viewCount} görüntülenme
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {item.clickCount} tıklama
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                >
                  {item.isActive ? "Aktif" : "Pasif"}
                </span>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400"
                  onClick={() => {
                    if (confirm("Bu duyuruyu silmek istiyor musunuz?")) {
                      deleteMutation.mutate({ id: item.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {announcementsQuery.data?.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz duyuru yok</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Duyuruyu Düzenle" : "Yeni Duyuru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Başlık *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Duyuru başlığı..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">İçerik *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Duyuru içeriği..."
                className="bg-zinc-800 border-white/10 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tip</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2"
                >
                  <option value="banner">Banner</option>
                  <option value="popup">Popup</option>
                  <option value="notification">Bildirim</option>
                  <option value="maintenance">Bakım</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Hedef Kitle</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value as typeof formData.targetAudience })
                  }
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2"
                >
                  <option value="all">Herkes</option>
                  <option value="logged_in">Giriş Yapmış</option>
                  <option value="logged_out">Giriş Yapmamış</option>
                  <option value="new_users">Yeni Kullanıcılar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buton Metni</label>
                <Input
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="İncele"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Buton URL</label>
                <Input
                  value={formData.buttonUrl}
                  onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                  placeholder="/packages"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <span className="text-sm">Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.dismissible}
                  onCheckedChange={(checked) => setFormData({ ...formData, dismissible: checked })}
                />
                <span className="text-sm">Kapatılabilir</span>
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
                {editingItem ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
