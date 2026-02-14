/**
 * Admin Emails - E-posta Yönetimi
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

export default function AdminEmails() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    recipients: "all",
  });

  // Placeholder email history
  const emailHistory = [
    {
      id: 1,
      subject: "Yeni Özellik: Video Üretimi",
      recipients: "Tüm Kullanıcılar",
      sentAt: "2024-01-15T10:30:00",
      status: "sent",
      opened: 1234,
      clicked: 456,
    },
    {
      id: 2,
      subject: "Kredi Kampanyası",
      recipients: "Premium Kullanıcılar",
      sentAt: "2024-01-10T14:00:00",
      status: "sent",
      opened: 567,
      clicked: 123,
    },
  ];

  const handleSend = () => {
    if (!formData.subject || !formData.content) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    toast.success("E-posta gönderildi (simülasyon)");
    setComposeOpen(false);
    setFormData({ subject: "", content: "", recipients: "all" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">E-posta Yönetimi</h2>
          <p className="text-sm text-zinc-500">
            Toplu e-posta gönderimi ve geçmiş
          </p>
        </div>
        <Button
          className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
          onClick={() => setComposeOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni E-posta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <Mail className="h-5 w-5 text-[#00F5FF] mb-2" />
          <p className="text-2xl font-bold">2</p>
          <p className="text-xs text-zinc-500">Gönderilen</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <Users className="h-5 w-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold">1,801</p>
          <p className="text-xs text-zinc-500">Açılma</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <CheckCircle className="h-5 w-5 text-[#7C3AED] mb-2" />
          <p className="text-2xl font-bold">579</p>
          <p className="text-xs text-zinc-500">Tıklama</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <AlertCircle className="h-5 w-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold">32.1%</p>
          <p className="text-xs text-zinc-500">Açılma Oranı</p>
        </motion.div>
      </div>

      {/* Email History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10"
      >
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-semibold">Gönderim Geçmişi</h3>
        </div>

        <div className="divide-y divide-white/5">
          {emailHistory.map(email => (
            <div key={email.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{email.subject}</h4>
                  <p className="text-sm text-zinc-500 mt-1">
                    {email.recipients}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(email.sentAt).toLocaleDateString("tr-TR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email.opened} açılma
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {email.clicked} tıklama
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                  Gönderildi
                </span>
              </div>
            </div>
          ))}
        </div>

        {emailHistory.length === 0 && (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz e-posta gönderilmemiş</p>
          </div>
        )}
      </motion.div>

      {/* Note */}
      <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4 text-sm text-zinc-500">
        <p>
          💡 E-posta gönderim özelliği için SMTP/Email servis entegrasyonu
          gereklidir. Bu sayfada örnek arayüz gösterilmektedir.
        </p>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni E-posta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Alıcılar</label>
              <select
                value={formData.recipients}
                onChange={e =>
                  setFormData({ ...formData, recipients: e.target.value })
                }
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2"
              >
                <option value="all">Tüm Kullanıcılar</option>
                <option value="active">Aktif Kullanıcılar (son 30 gün)</option>
                <option value="premium">Premium Kullanıcılar</option>
                <option value="new">Yeni Kullanıcılar (son 7 gün)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Konu</label>
              <Input
                value={formData.subject}
                onChange={e =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="E-posta konusu..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">İçerik</label>
              <Textarea
                value={formData.content}
                onChange={e =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="E-posta içeriği..."
                className="bg-zinc-800 border-white/10 min-h-[200px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setComposeOpen(false)}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
                Gönder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
