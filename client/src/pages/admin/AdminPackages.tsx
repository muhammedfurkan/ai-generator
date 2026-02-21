// @ts-nocheck
/**
 * Admin Packages - Kredi Paketleri Yönetimi
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
  Package,
  Plus,
  Edit,
  Trash2,
  Star,
  GripVertical,
  Check,
  X,
} from "lucide-react";

export default function AdminPackages() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    credits: 0,
    price: "",
    originalPrice: "",
    badge: "",
    features: "",
    usage1k: 0,
    usage2k: 0,
    usage4k: 0,
    bonus: 0,
    shopierUrl: "",
    sortOrder: 0,
    isActive: true,
    isHighlighted: false,
  });

  const packagesQuery = trpc.adminPanel.getCreditPackages.useQuery();

  const createMutation = trpc.adminPanel.createCreditPackage.useMutation({
    onSuccess: () => {
      toast.success("Paket oluşturuldu");
      packagesQuery.refetch();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateCreditPackage.useMutation({
    onSuccess: () => {
      toast.success("Paket güncellendi");
      packagesQuery.refetch();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const deleteMutation = trpc.adminPanel.deleteCreditPackage.useMutation({
    onSuccess: () => {
      toast.success("Paket silindi");
      packagesQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPackage(null);
    setFormData({
      name: "",
      description: "",
      credits: 0,
      price: "",
      originalPrice: "",
      badge: "",
      features: "",
      usage1k: 0,
      usage2k: 0,
      usage4k: 0,
      bonus: 0,
      shopierUrl: "",
      sortOrder: 0,
      isActive: true,
      isHighlighted: false,
    });
  };

  const openEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      credits: pkg.credits,
      price: pkg.price,
      originalPrice: pkg.originalPrice || "",
      badge: pkg.badge || "",
      features: pkg.features || "",
      usage1k: pkg.usage1k || 0,
      usage2k: pkg.usage2k || 0,
      usage4k: pkg.usage4k || 0,
      bonus: pkg.bonus || 0,
      shopierUrl: pkg.shopierUrl || "",
      sortOrder: pkg.sortOrder,
      isActive: pkg.isActive,
      isHighlighted: pkg.isHighlighted,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.credits || !formData.price) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (editingPackage) {
      updateMutation.mutate({
        id: editingPackage.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Kredi Paketleri</h2>
          <p className="text-sm text-zinc-500">
            Satışa sunulan kredi paketlerini yönetin
          </p>
        </div>
        <Button
          className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Paket
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-4">
        {packagesQuery.data?.map(pkg => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              bg-zinc-900/50 rounded-2xl border p-6
              ${pkg.isHighlighted ? "border-[#00F5FF]/50 ring-1 ring-[#00F5FF]/20" : "border-white/10"}
            `}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#00F5FF]/20">
                <Package className="h-6 w-6 text-[#00F5FF]" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  {pkg.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                      {pkg.badge}
                    </span>
                  )}
                  {pkg.isHighlighted && (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-zinc-500">{pkg.description}</p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold">{pkg.credits}</p>
                <p className="text-xs text-zinc-500">kredi</p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#00F5FF]">
                  {pkg.price} ₺
                </p>
                {pkg.originalPrice && (
                  <p className="text-xs text-zinc-500 line-through">
                    {pkg.originalPrice} ₺
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {pkg.shopierUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-[#00F5FF]/50 text-[#00F5FF] hover:bg-[#00F5FF]/10"
                    onClick={() => window.open(pkg.shopierUrl, "_blank")}
                  >
                    Shopier Linki
                  </Button>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    pkg.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {pkg.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(pkg)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => {
                    if (confirm("Bu paketi silmek istiyor musunuz?")) {
                      deleteMutation.mutate({ id: pkg.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {packagesQuery.data?.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
            <Package className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz paket eklenmemiş</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Paketi Düzenle" : "Yeni Paket"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Paket Adı *
                </label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Başlangıç Paketi"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rozet</label>
                <Input
                  value={formData.badge}
                  onChange={e =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  placeholder="En Popüler"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Açıklama</label>
              <Textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Paket açıklaması..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kredi *
                </label>
                <Input
                  type="number"
                  value={formData.credits}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      credits: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Bonus %
                </label>
                <Input
                  type="number"
                  value={formData.bonus}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      bonus: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fiyat (₺) *
                </label>
                <Input
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="99.00"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Eski Fiyat
                </label>
                <Input
                  value={formData.originalPrice}
                  onChange={e =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  placeholder="149.00"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Özellikler (JSON)
              </label>
              <Textarea
                value={formData.features}
                onChange={e =>
                  setFormData({ ...formData, features: e.target.value })
                }
                placeholder='["500 görsel üretimi", "HD kalite"]'
                className="bg-zinc-800 border-white/10 font-mono text-sm"
              />
            </div>

            {/* Shopier Ödeme Linki */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Shopier Ödeme Linki
              </label>
              <Input
                value={formData.shopierUrl}
                onChange={e =>
                  setFormData({ ...formData, shopierUrl: e.target.value })
                }
                placeholder="https://www.shopier.com/ShowProductNew/products.php?id=..."
                className="bg-zinc-800 border-white/10"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Kullanıcılar bu linke tıklayarak ödeme yapabilirler
              </p>
            </div>

            {/* Kredi Kullanım Örneği */}
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/10">
              <label className="text-sm font-medium mb-3 block text-[#00F5FF]">
                Kredi Kullanım Örneği (Görsel Sayısı)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    1K Kalite
                  </label>
                  <Input
                    type="number"
                    value={formData.usage1k}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        usage1k: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="30"
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    2K Kalite
                  </label>
                  <Input
                    type="number"
                    value={formData.usage2k}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        usage2k: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="20"
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    4K Kalite
                  </label>
                  <Input
                    type="number"
                    value={formData.usage4k}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        usage4k: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="15"
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Bu değerler paket sayfasında "Kredi Kullanım Örneği" kutusunda
                gösterilir
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <span className="text-sm">Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isHighlighted}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, isHighlighted: checked })
                  }
                />
                <span className="text-sm">Öne Çıkar</span>
              </div>
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
                {editingPackage ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
