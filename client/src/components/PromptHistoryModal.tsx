import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Clock, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, aspectRatio: string, resolution: string) => void;
}

export default function PromptHistoryModal({
  isOpen,
  onClose,
  onSelectPrompt,
}: PromptHistoryModalProps) {
  const utils = trpc.useUtils();
  
  const historyQuery = trpc.promptHistory.list.useQuery(
    { limit: 50 },
    { enabled: isOpen }
  );

  const deleteMutation = trpc.promptHistory.delete.useMutation({
    onSuccess: () => {
      utils.promptHistory.list.invalidate();
      toast.success("Prompt geçmişten silindi");
    },
    onError: () => {
      toast.error("Prompt silinemedi");
    },
  });

  const clearAllMutation = trpc.promptHistory.clearAll.useMutation({
    onSuccess: () => {
      utils.promptHistory.list.invalidate();
      toast.success("Tüm geçmiş temizlendi");
    },
    onError: () => {
      toast.error("Geçmiş temizlenemedi");
    },
  });

  const handleSelectPrompt = (prompt: string, aspectRatio: string, resolution: string) => {
    onSelectPrompt(prompt, aspectRatio, resolution);
    onClose();
    toast.success("Prompt uygulandı");
  };

  const handleDelete = (historyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate({ historyId });
  };

  const handleClearAll = () => {
    if (window.confirm("Tüm prompt geçmişini silmek istediğinize emin misiniz?")) {
      clearAllMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Prompt Geçmişi
            </DialogTitle>
            {historyQuery.data && historyQuery.data.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Tümünü Temizle
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {historyQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : historyQuery.data && historyQuery.data.length > 0 ? (
            <AnimatePresence>
              {historyQuery.data.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-all group relative"
                  onClick={() => handleSelectPrompt(item.prompt, item.aspectRatio, item.resolution)}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deleteMutation.isPending}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  {/* Prompt Text */}
                  <p className="text-foreground font-medium mb-2 pr-10 line-clamp-2">
                    {item.prompt}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {item.usageCount}x kullanıldı
                    </span>
                    <span>{item.aspectRatio}</span>
                    <span>{item.resolution}</span>
                    <span className="ml-auto">
                      {new Date(item.lastUsedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Henüz prompt geçmişi yok</p>
              <p className="text-sm text-muted-foreground mt-2">
                Görsel oluşturduğunuzda promptlarınız otomatik olarak burada görünecek
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
