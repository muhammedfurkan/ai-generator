/**
 * Admin FAQ - Sıkça Sorulan Sorular Yönetimi
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
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminFaq() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    sortOrder: 0,
    isActive: true,
  });

  const faqsQuery = trpc.adminPanel.getFaqs.useQuery();

  const createMutation = trpc.adminPanel.createFaq.useMutation({
    onSuccess: () => {
      toast.success("SSS oluşturuldu");
      faqsQuery.refetch();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const updateMutation = trpc.adminPanel.updateFaq.useMutation({
    onSuccess: () => {
      toast.success("SSS güncellendi");
      faqsQuery.refetch();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const deleteMutation = trpc.adminPanel.deleteFaq.useMutation({
    onSuccess: () => {
      toast.success("SSS silindi");
      faqsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      question: "",
      answer: "",
      category: "",
      sortOrder: 0,
      isActive: true,
    });
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.question || !formData.answer) {
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

  // Group by category
  const groupedFaqs = faqsQuery.data?.reduce(
    (acc, item) => {
      const cat = item.category || "Genel";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof faqsQuery.data>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sıkça Sorulan Sorular</h2>
          <p className="text-sm text-zinc-500">SSS içeriklerini yönetin</p>
        </div>
        <Button
          className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Soru
        </Button>
      </div>

      {/* FAQ List by Category */}
      {groupedFaqs &&
        Object.entries(groupedFaqs).map(([category, items]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 bg-zinc-800/50">
              <h3 className="font-semibold">{category}</h3>
              <p className="text-xs text-zinc-500">{items?.length} soru</p>
            </div>

            <div className="divide-y divide-white/5">
              {items?.map(item => (
                <div key={item.id} className="p-4">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-[#00F5FF] flex-shrink-0" />
                        <p className="font-medium">{item.question}</p>
                      </div>
                      {expandedId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 ml-6 text-sm text-zinc-400"
                        >
                          {item.answer}
                        </motion.div>
                      )}
                      <div className="flex items-center gap-4 mt-2 ml-6 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.viewCount}
                        </span>
                        <span className="flex items-center gap-1 text-green-400">
                          <ThumbsUp className="h-3 w-3" />
                          {item.helpfulCount}
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <ThumbsDown className="h-3 w-3" />
                          {item.notHelpfulCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Pasif"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => {
                          e.stopPropagation();
                          openEdit(item);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400"
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm("Bu soruyu silmek istiyor musunuz?")) {
                            deleteMutation.mutate({ id: item.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedId === item.id ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

      {!faqsQuery.data?.length && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-500">Henüz SSS eklenmemiş</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Soruyu Düzenle" : "Yeni Soru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Soru *</label>
              <Textarea
                value={formData.question}
                onChange={e =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Nasıl kullanırım?"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cevap *</label>
              <Textarea
                value={formData.answer}
                onChange={e =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Detaylı açıklama..."
                className="bg-zinc-800 border-white/10 min-h-[150px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kategori
                </label>
                <Input
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Genel"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sıralama
                </label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
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
                {editingItem ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
