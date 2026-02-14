/**
 * Admin Discounts - İndirim Kodları Yönetimi
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
  Tag,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Percent,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminDiscounts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed" | "credits",
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    maxUsesPerUser: 1,
    isActive: true,
  });

  const discountsQuery = trpc.adminPanel.getDiscountCodes.useQuery();

  const createMutation = trpc.adminPanel.createDiscountCode.useMutation({
    onSuccess: () => {
      toast.success("İndirim kodu oluşturuldu");
      discountsQuery.refetch();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateDiscountCode.useMutation({
    onSuccess: () => {
      toast.success("İndirim kodu güncellendi");
      discountsQuery.refetch();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const deleteMutation = trpc.adminPanel.deleteDiscountCode.useMutation({
    onSuccess: () => {
      toast.success("İndirim kodu silindi");
      discountsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDiscount(null);
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxUses: "",
      maxUsesPerUser: 1,
      isActive: true,
    });
  };

  const openEdit = (discount: any) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description || "",
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minPurchase: discount.minPurchase || "",
      maxUses: discount.maxUses?.toString() || "",
      maxUsesPerUser: discount.maxUsesPerUser,
      isActive: discount.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.discountValue) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    const data = {
      ...formData,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
    };

    if (editingDiscount) {
      updateMutation.mutate({
        id: editingDiscount.id,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase || undefined,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isActive: data.isActive,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Kod kopyalandı");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed":
        return <DollarSign className="h-4 w-4" />;
      case "credits":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string, value: string) => {
    switch (type) {
      case "percentage":
        return `%${value} indirim`;
      case "fixed":
        return `${value} ₺ indirim`;
      case "credits":
        return `${value} kredi hediye`;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">İndirim Kodları</h2>
          <p className="text-sm text-zinc-500">
            Kupon ve indirim kodlarını yönetin
          </p>
        </div>
        <Button
          className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Kod
        </Button>
      </div>

      {/* Discounts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-800/50">
              <th className="px-4 py-3 text-left font-semibold">Kod</th>
              <th className="px-4 py-3 text-left font-semibold">Tip</th>
              <th className="px-4 py-3 text-left font-semibold">Değer</th>
              <th className="px-4 py-3 text-left font-semibold">Kullanım</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
              <th className="px-4 py-3 text-left font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {discountsQuery.data?.map(discount => (
              <tr
                key={discount.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="bg-zinc-800 px-2 py-1 rounded font-mono">
                      {discount.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyCode(discount.id, discount.code)}
                    >
                      {copiedId === discount.id ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(discount.discountType)}
                    <span className="capitalize">{discount.discountType}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#00F5FF] font-medium">
                    {getTypeLabel(
                      discount.discountType,
                      discount.discountValue
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-zinc-400">
                    {discount.usedCount} / {discount.maxUses || "∞"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      discount.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {discount.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => {
                        if (confirm("Bu kodu silmek istiyor musunuz?")) {
                          deleteMutation.mutate({ id: discount.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {discountsQuery.data?.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz indirim kodu yok</p>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? "Kodu Düzenle" : "Yeni İndirim Kodu"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kod *</label>
                <Input
                  value={formData.code}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="YILBASI2024"
                  className="bg-zinc-800 border-white/10 uppercase"
                  disabled={!!editingDiscount}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tip *</label>
                <select
                  value={formData.discountType}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      discountType: e.target
                        .value as typeof formData.discountType,
                    })
                  }
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2"
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit (₺)</option>
                  <option value="credits">Kredi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Açıklama</label>
              <Textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Yılbaşı kampanyası..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Değer *{" "}
                  {formData.discountType === "percentage"
                    ? "(%)"
                    : "(₺ veya Kredi)"}
                </label>
                <Input
                  value={formData.discountValue}
                  onChange={e =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={
                    formData.discountType === "percentage" ? "10" : "50"
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Min. Alışveriş (₺)
                </label>
                <Input
                  value={formData.minPurchase}
                  onChange={e =>
                    setFormData({ ...formData, minPurchase: e.target.value })
                  }
                  placeholder="100"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Maks. Kullanım (toplam)
                </label>
                <Input
                  value={formData.maxUses}
                  onChange={e =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  placeholder="Sınırsız için boş bırakın"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kullanıcı Başına
                </label>
                <Input
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      maxUsesPerUser: parseInt(e.target.value) || 1,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={checked =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <span className="text-sm">Aktif</span>
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
                {editingDiscount ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
