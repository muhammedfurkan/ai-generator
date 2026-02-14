import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X } from "lucide-react";
import { Button } from "./ui/button";
import { useLocation } from "wouter";

interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded: number;
  currentCredits: number;
  userId: number;
}

export default function InsufficientCreditsDialog({
  isOpen,
  onClose,
  creditsNeeded,
  currentCredits,
  userId,
}: InsufficientCreditsDialogProps) {
  const creditShortage = creditsNeeded - currentCredits;
  const [, setLocation] = useLocation();

  const handleBuyCreditsClick = () => {
    setLocation("/packages");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card rounded-3xl border border-white/20 p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Yetersiz Kredi
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Görsel oluşturmak için daha fazla kredi gerekli
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Credit Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">
                    Gerekli Kredi:
                  </span>
                  <span className="text-lg font-semibold text-[#00F5FF]">
                    {creditsNeeded}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-sm text-muted-foreground">
                    Mevcut Kredi:
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {currentCredits}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">
                    Eksik Kredi:
                  </span>
                  <span className="text-lg font-semibold text-red-400">
                    {creditShortage}
                  </span>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground text-center">
                Kredi satın almak için paketler sayfasına yönlendirileceksiniz.
                Size en uygun paketi seçebilirsiniz.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  İptal
                </Button>
                <Button
                  onClick={handleBuyCreditsClick}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#FF2E97] hover:from-[#00F5FF] hover:to-[#FF2E97] text-[#F9FAFB] gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Kredi Satın Al
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
