import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  aspectRatio: string;
  resolution: string;
}

const TEMPLATE_CATEGORIES = [
  "Sosyal Medya",
  "E-ticaret",
  "Kişisel",
  "İş/Kurumsal",
  "Sanat",
  "Web Tasarım",
  "Moda",
  "Pazarlama",
  "Diğer",
];

export default function SaveTemplateDialog({
  isOpen,
  onClose,
  prompt,
  aspectRatio,
  resolution,
}: SaveTemplateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");

  const utils = trpc.useUtils();
  const createTemplateMutation = trpc.userTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Şablon başarıyla kaydedildi!");
      utils.userTemplates.list.invalidate();
      handleClose();
    },
    onError: error => {
      toast.error(error.message || "Şablon kaydedilemedi");
    },
  });

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Lütfen bir başlık girin");
      return;
    }

    createTemplateMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      prompt,
      category: category || undefined,
      aspectRatio: aspectRatio as any,
      resolution: resolution as any,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Save className="h-6 w-6 text-[#00F5FF]" />
            Şablon Olarak Kaydet
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Bu promptu şablon olarak kaydedin ve daha sonra tekrar kullanın
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Başlık *
            </Label>
            <Input
              id="title"
              placeholder="Örn: Profesyonel Profil Fotoğrafı"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="glass-card border-white/10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Açıklama (Opsiyonel)
            </Label>
            <Textarea
              id="description"
              placeholder="Bu şablonun ne için kullanıldığını açıklayın..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="glass-card border-white/10 min-h-20 resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold">
              Kategori (Opsiyonel)
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="glass-card border-white/10">
                <SelectValue placeholder="Kategori seçin..." />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Prompt Önizleme</Label>
            <div className="glass-card bg-black/20 p-3 rounded text-sm text-muted-foreground max-h-32 overflow-y-auto">
              {prompt}
            </div>
          </div>

          {/* Settings Preview */}
          <div className="flex gap-4 text-sm">
            <div className="glass-card bg-[#00F5FF]/10 px-3 py-2 rounded">
              <span className="text-muted-foreground">Aspect Ratio:</span>{" "}
              <span className="font-semibold text-[#00F5FF]">
                {aspectRatio}
              </span>
            </div>
            <div className="glass-card bg-[#7C3AED]/10 px-3 py-2 rounded">
              <span className="text-muted-foreground">Resolution:</span>{" "}
              <span className="font-semibold text-[#7C3AED]">{resolution}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="glass-button"
            disabled={createTemplateMutation.isPending}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            className="gradient-button"
            disabled={createTemplateMutation.isPending}
          >
            {createTemplateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
