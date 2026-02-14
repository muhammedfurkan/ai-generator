import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

type ModalCardForm = {
  cardKey: string;
  title: string;
  description: string;
  imageDesktop: string;
  imageMobile: string;
  badge: string;
  badgeColor: string;
  path: string;
  category: "images" | "videos" | "tools";
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
};

const defaultForm: ModalCardForm = {
  cardKey: "",
  title: "",
  description: "",
  imageDesktop: "",
  imageMobile: "",
  badge: "",
  badgeColor: "",
  path: "",
  category: "images",
  isFeatured: false,
  sortOrder: 0,
  isActive: true,
};

export default function AdminModalCards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ModalCardForm>(defaultForm);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const { data: cards, isLoading } = trpc.modalCards.getAllAdmin.useQuery();

  // Mutations
  const createMutation = trpc.modalCards.create.useMutation({
    onSuccess: () => {
      toast.success("Kart başarıyla oluşturuldu");
      utils.modalCards.getAllAdmin.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const updateMutation = trpc.modalCards.update.useMutation({
    onSuccess: () => {
      toast.success("Kart başarıyla güncellendi");
      utils.modalCards.getAllAdmin.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const deleteMutation = trpc.modalCards.delete.useMutation({
    onSuccess: () => {
      toast.success("Kart başarıyla silindi");
      utils.modalCards.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleOpenDialog = (card?: any) => {
    if (card) {
      setEditingId(card.id);
      setForm({
        cardKey: card.cardKey || "",
        title: card.title || "",
        description: card.description || "",
        imageDesktop: card.imageDesktop || "",
        imageMobile: card.imageMobile || "",
        badge: card.badge || "",
        badgeColor: card.badgeColor || "",
        path: card.path || "",
        category: card.category || "images",
        isFeatured: card.isFeatured || false,
        sortOrder: card.sortOrder || 0,
        isActive: card.isActive !== false,
      });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.cardKey || !form.title || !form.category) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu kartı silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleImageUpload = async (
    file: File,
    type: "desktop" | "mobile"
  ) => {
    try {
      const setUploading = type === "desktop" ? setUploadingDesktop : setUploadingMobile;
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (type === "desktop") {
        setForm({ ...form, imageDesktop: data.url });
        toast.success("Desktop görseli yüklendi");
      } else {
        setForm({ ...form, imageMobile: data.url });
        toast.success("Mobil görseli yüklendi");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Görsel yüklenirken hata oluştu");
    } finally {
      const setUploading = type === "desktop" ? setUploadingDesktop : setUploadingMobile;
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Modal Kartları Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Oluştur modalında gösterilen kartları düzenleyin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni Kart Ekle
        </Button>
      </div>

      <div className="grid gap-4">
        {cards?.map((card) => (
          <Card key={card.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  {card.badge && (
                    <span
                      className="px-2 py-1 text-xs font-bold rounded text-white"
                      style={{ backgroundColor: card.badgeColor || "#3b82f6" }}
                    >
                      {card.badge}
                    </span>
                  )}
                  {card.isFeatured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                      HERO
                    </span>
                  )}
                  {!card.isActive && (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded">
                      PASIF
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(card)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(card.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Key:</strong> {card.cardKey}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Açıklama:</strong> {card.description || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Path:</strong> {card.path || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Kategori:</strong> {card.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Sıralama:</strong> {card.sortOrder}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2">
                    <p className="text-xs font-bold mb-2">Desktop Görsel</p>
                    {card.imageDesktop ? (
                      <img
                        src={card.imageDesktop}
                        alt="Desktop"
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="border rounded p-2">
                    <p className="text-xs font-bold mb-2">Mobil Görsel</p>
                    {card.imageMobile ? (
                      <img
                        src={card.imageMobile}
                        alt="Mobile"
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cards?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Henüz kart eklenmemiş. Yeni kart eklemek için yukarıdaki butonu
              kullanın.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Kartı Düzenle" : "Yeni Kart Ekle"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardKey">Card Key *</Label>
                <Input
                  id="cardKey"
                  value={form.cardKey}
                  onChange={(e) =>
                    setForm({ ...form, cardKey: e.target.value })
                  }
                  placeholder="nano_banana_pro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="NANO BANANA PRO"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="En iyi 4K görsel modeli"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageDesktop">Desktop Görsel</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="imageDesktop"
                      value={form.imageDesktop}
                      onChange={(e) =>
                        setForm({ ...form, imageDesktop: e.target.value })
                      }
                      placeholder="/covers/nano-banana-pro.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingDesktop}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            handleImageUpload(file, "desktop");
                          }
                        };
                        input.click();
                      }}
                    >
                      {uploadingDesktop ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {form.imageDesktop && (
                    <div className="border rounded p-2">
                      <img
                        src={form.imageDesktop}
                        alt="Desktop Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="imageMobile">Mobil Görsel</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="imageMobile"
                      value={form.imageMobile}
                      onChange={(e) =>
                        setForm({ ...form, imageMobile: e.target.value })
                      }
                      placeholder="/covers/nano-banana-pro.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingMobile}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            handleImageUpload(file, "mobile");
                          }
                        };
                        input.click();
                      }}
                    >
                      {uploadingMobile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {form.imageMobile && (
                    <div className="border rounded p-2">
                      <img
                        src={form.imageMobile}
                        alt="Mobile Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="UNLIMITED, CORE, NEW, HOT, PRO"
                />
              </div>
              <div>
                <Label htmlFor="badgeColor">Badge Rengi</Label>
                <Input
                  id="badgeColor"
                  type="color"
                  value={form.badgeColor || "#3b82f6"}
                  onChange={(e) =>
                    setForm({ ...form, badgeColor: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="path">Sayfa Yolu</Label>
                <Input
                  id="path"
                  value={form.path}
                  onChange={(e) => setForm({ ...form, path: e.target.value })}
                  placeholder="/generate"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value: "images" | "videos" | "tools") =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="images">Görseller</SelectItem>
                    <SelectItem value="videos">Videolar</SelectItem>
                    <SelectItem value="tools">Araçlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sıralama</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={form.isFeatured}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, isFeatured: checked })
                    }
                  />
                  <Label htmlFor="isFeatured">Hero Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Aktif</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
