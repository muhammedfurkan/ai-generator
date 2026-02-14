/**
 * Admin Credits - Kredi İşlemleri
 * Kredi hareketleri, toplu işlemler
 */
import { useDeferredValue, useMemo, useState } from "react";
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
  ArrowUpRight,
  Upload,
  Download,
  Search,
  Users,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TransactionFilterType = "all" | "add" | "deduct" | "purchase";

function formatCsvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function AdminCredits() {
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] =
    useState<TransactionFilterType>("all");
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(searchQuery);
  const queryInput = useMemo(
    () => ({
      page,
      pageSize: 20,
      search: deferredSearch.trim() || undefined,
      type: transactionType === "all" ? undefined : transactionType,
    }),
    [deferredSearch, page, transactionType]
  );

  const dashboardQuery = trpc.adminPanel.getDashboardOverview.useQuery();
  const transactionsQuery =
    trpc.adminPanel.getCreditTransactions.useQuery(queryInput);

  const bulkAddMutation = trpc.adminPanel.bulkAddCredits.useMutation();

  const handleBulkAdd = async () => {
    try {
      const lines = bulkData
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        toast.error("En az bir satır girin");
        return;
      }

      const grouped = new Map<
        string,
        { userIds: number[]; amount: number; reason?: string }
      >();

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const [userIdRaw, amountRaw, reasonRaw] = line
          .split(",")
          .map(part => part.trim());

        const userId = Number.parseInt(userIdRaw, 10);
        const amount = Number.parseInt(amountRaw, 10);

        if (
          !Number.isFinite(userId) ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          toast.error(`Satır ${i + 1} geçersiz. Format: userId,miktar,sebep`);
          return;
        }

        const reason = reasonRaw || "Toplu kredi ekleme";
        const key = `${amount}::${reason}`;
        const existing = grouped.get(key);

        if (existing) {
          existing.userIds.push(userId);
        } else {
          grouped.set(key, { userIds: [userId], amount, reason });
        }
      }

      const groupedPayloads = Array.from(grouped.values());
      const responses = [];
      for (const payload of groupedPayloads) {
        responses.push(await bulkAddMutation.mutateAsync(payload));
      }

      const mergedResults = responses.flatMap(r => r.results);
      const successCount = mergedResults.filter(item => item.success).length;
      const failCount = mergedResults.length - successCount;

      toast.success(`${successCount} işlem başarılı, ${failCount} başarısız`);
      setBulkDialogOpen(false);
      setBulkData("");
      await Promise.all([
        dashboardQuery.refetch(),
        transactionsQuery.refetch(),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "İşlem başarısız";
      toast.error(message);
    }
  };

  const exportTransactions = () => {
    const items = transactionsQuery.data?.transactions || [];
    if (items.length === 0) {
      toast.error("Dışa aktarılacak kayıt bulunamadı");
      return;
    }

    const header = [
      "ID",
      "Kullanici ID",
      "Kullanici",
      "E-posta",
      "Tur",
      "Miktar",
      "Bakiye Once",
      "Bakiye Sonra",
      "Sebep",
      "Tarih",
    ];

    const rows = items.map(item => [
      item.id,
      item.userId,
      item.userName || "-",
      item.userEmail || "-",
      item.type,
      item.amount,
      item.balanceBefore,
      item.balanceAfter,
      item.reason || "-",
      item.createdAt,
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(formatCsvCell).join(","))
      .join("\n");

    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credit-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const transactions = transactionsQuery.data?.transactions || [];
  const totalPages = transactionsQuery.data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/10 rounded-2xl border border-[#00F5FF]/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Dolaşımdaki Toplam Kredi</p>
              <p className="text-3xl font-bold mt-1">
                {(
                  dashboardQuery.data?.totalCreditsInCirculation || 0
                ).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#00F5FF]/20">
              <CreditCard className="h-6 w-6 text-[#00F5FF]" />
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
              <p className="text-sm text-zinc-400">Bugün Gelir</p>
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
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold mt-1">
                {(dashboardQuery.data?.totalUsers || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#7C3AED]/20">
              <Users className="h-6 w-6 text-[#7C3AED]" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button
          className="bg-green-500 hover:bg-green-600 text-black gap-2"
          onClick={() => setBulkDialogOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Toplu Kredi Ekle
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={exportTransactions}
        >
          <Download className="h-4 w-4" />
          İşlemleri Dışa Aktar
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#111827]/60 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold">Son Kredi İşlemleri</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Kullanıcı / e-posta / ID"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-full sm:w-72 bg-[#0B0F19] border-white/10"
              />
            </div>

            <select
              value={transactionType}
              onChange={e => {
                setTransactionType(e.target.value as TransactionFilterType);
                setPage(1);
              }}
              className="bg-[#0B0F19] border border-white/10 rounded-md px-3 text-sm"
            >
              <option value="all">Tüm Tipler</option>
              <option value="add">Ekleme</option>
              <option value="deduct">Düşme</option>
              <option value="purchase">Satın Alma</option>
            </select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => transactionsQuery.refetch()}
              disabled={transactionsQuery.isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${transactionsQuery.isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[#0B0F19]/90 text-zinc-300">
              <tr>
                <th className="text-left px-4 py-3">Kullanıcı</th>
                <th className="text-left px-4 py-3">Tip</th>
                <th className="text-right px-4 py-3">Miktar</th>
                <th className="text-right px-4 py-3">Önce</th>
                <th className="text-right px-4 py-3">Sonra</th>
                <th className="text-left px-4 py-3">Sebep</th>
                <th className="text-left px-4 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(item => {
                const badgeClass =
                  item.type === "add"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                    : item.type === "deduct"
                      ? "bg-rose-500/15 text-rose-300 border-rose-400/30"
                      : "bg-[#00F5FF]/15 text-[#00F5FF] border-[#00F5FF]/40";

                return (
                  <tr
                    key={item.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">
                        {item.userName || "Bilinmiyor"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {item.userEmail || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs ${badgeClass}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {item.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {item.balanceBefore.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {item.balanceAfter.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[260px] truncate">
                      {item.reason || "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                        locale: tr,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && !transactionsQuery.isFetching && (
          <div className="text-center py-10 text-zinc-500">
            Kayıt bulunamadı
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-zinc-400">
            Toplam kayıt:{" "}
            {(transactionsQuery.data?.total || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page <= 1 || transactionsQuery.isFetching}
            >
              Önceki
            </Button>
            <span className="text-xs text-zinc-400 px-2">
              Sayfa {page} / {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage(prev => Math.min(prev + 1, Math.max(totalPages, 1)))
              }
              disabled={page >= totalPages || transactionsQuery.isFetching}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>Toplu Kredi Ekleme</DialogTitle>
            <DialogDescription>
              Her satıra bir kayıt girin. Aynı miktar/sebep olan satırlar
              backendde tek batch istekte birleştirilir.
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
              onChange={e => setBulkData(e.target.value)}
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
                onClick={() => {
                  void handleBulkAdd();
                }}
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
