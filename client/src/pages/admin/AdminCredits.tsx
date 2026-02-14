/**
 * Admin Credits - Kredi İşlemleri
 * Kredi hareketleri, toplu işlemler
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  Download,
  Search,
  Filter,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminCredits() {
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const dashboardQuery = trpc.adminPanel.getDashboardOverview.useQuery();

  const bulkAddMutation = trpc.admin.bulkAddCredits.useMutation({
    onSuccess: (data) => {
      const successCount = data.results.filter((r) => r.success).length;
      const failCount = data.results.filter((r) => !r.success).length;
      toast.success(`${successCount} işlem başarılı, ${failCount} başarısız`);
      setBulkDialogOpen(false);
      setBulkData("");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleBulkAdd = () => {
    try {
      const lines = bulkData.trim().split("\n");
      const data = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          userId: parseInt(parts[0]),
          amount: parseInt(parts[1]),
          reason: parts[2] || "Toplu kredi ekleme",
        };
      });

      if (data.some((d) => isNaN(d.userId) || isNaN(d.amount))) {
        toast.error("Geçersiz format. Her satır: userId,miktar,sebep");
        return;
      }

      bulkAddMutation.mutate({ data });
    } catch {
      toast.error("Veri işlenirken hata oluştu");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl border border-blue-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Dolaşımdaki Toplam Kredi</p>
              <p className="text-3xl font-bold mt-1">
                {(dashboardQuery.data?.totalCreditsInCirculation || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/20">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Bugün Satılan Kredi</p>
              <p className="text-3xl font-bold mt-1">
                {(dashboardQuery.data?.todayRevenue || 0).toLocaleString()} ₺
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <ArrowUpRight className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl border border-purple-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold mt-1">
                {(dashboardQuery.data?.totalUsers || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          className="bg-green-500 hover:bg-green-600 text-black gap-2"
          onClick={() => setBulkDialogOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Toplu Kredi Ekle
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          İşlemleri Dışa Aktar
        </Button>
      </div>

      {/* Transaction Logs Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Son Kredi İşlemleri</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-zinc-800 border-white/10"
            />
          </div>
        </div>

        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-500">
            Kredi işlem geçmişi için tüm işlemleri görmek üzere
            detaylı endpoint eklenecek.
          </p>
        </div>
      </motion.div>

      {/* Bulk Add Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>Toplu Kredi Ekleme</DialogTitle>
            <DialogDescription>
              CSV formatında kullanıcı ID, miktar ve sebep girin (her satıra bir kayıt)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-400">
              Format: userId,miktar,sebep
              <br />
              Örnek:
              <br />
              1,100,Kampanya bonusu
              <br />
              2,50,Hata telafisi
            </div>
            <Textarea
              placeholder="1,100,Kampanya bonusu&#10;2,50,Hata telafisi"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="bg-zinc-800 border-white/10 min-h-[150px] font-mono"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setBulkDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-black"
                onClick={handleBulkAdd}
                disabled={bulkAddMutation.isPending || !bulkData.trim()}
              >
                {bulkAddMutation.isPending ? "İşleniyor..." : "Uygula"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
