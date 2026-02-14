/**
 * Admin Reports - Raporlar ve Analizler
 */
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Download,
  RefreshCw,
  Image,
  Video,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

function toNumber(value: unknown): number {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCsvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function AdminReports() {
  const [days, setDays] = useState(30);

  const userGrowthQuery = trpc.adminPanel.getUserGrowthReport.useQuery({
    days,
  });
  const revenueQuery = trpc.adminPanel.getRevenueReport.useQuery({ days });
  const featureUsageQuery = trpc.adminPanel.getFeatureUsageReport.useQuery();

  const maxUserCount = Math.max(
    ...(userGrowthQuery.data?.map(d => toNumber(d.count)) || [1])
  );

  const featureStats = useMemo(() => {
    const images = featureUsageQuery.data?.images;
    const videos = featureUsageQuery.data?.videos;

    return {
      images: {
        total: toNumber(images?.total),
        completed: toNumber(images?.completed),
        failed: toNumber(images?.failed),
      },
      videos: {
        total: toNumber(videos?.total),
        completed: toNumber(videos?.completed),
        failed: toNumber(videos?.failed),
      },
    };
  }, [featureUsageQuery.data]);

  const exportReport = () => {
    const growthRows = userGrowthQuery.data || [];
    const revenueRows = revenueQuery.data || [];

    const lines: string[] = [];
    lines.push(
      ["Bölüm", "Tarih", "Metrik", "Değer"].map(formatCsvCell).join(",")
    );

    growthRows.forEach(row => {
      lines.push(
        ["Kullanıcı", row.date, "Yeni Kullanıcı", toNumber(row.count)]
          .map(formatCsvCell)
          .join(",")
      );
    });

    revenueRows.forEach(row => {
      lines.push(
        ["Gelir", row.date, "Günlük Gelir", toNumber(row.total)]
          .map(formatCsvCell)
          .join(",")
      );
    });

    lines.push(
      ["Özellik", "Toplam", "Tamamlanan", "Başarısız"]
        .map(formatCsvCell)
        .join(",")
    );
    lines.push(
      [
        "Images",
        featureStats.images.total,
        featureStats.images.completed,
        featureStats.images.failed,
      ]
        .map(formatCsvCell)
        .join(",")
    );
    lines.push(
      [
        "Videos",
        featureStats.videos.total,
        featureStats.videos.completed,
        featureStats.videos.failed,
      ]
        .map(formatCsvCell)
        .join(",")
    );

    const blob = new Blob([`\ufeff${lines.join("\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Raporlar & Analiz</h2>
          <p className="text-sm text-zinc-500">
            Kullanıcı, gelir ve üretim istatistikleri
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(Number.parseInt(e.target.value, 10))}
            className="bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Son 7 gün</option>
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
            <option value={365}>Son 1 yıl</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={exportReport}
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827]/60 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00F5FF]/20">
              <Users className="h-5 w-5 text-[#00F5FF]" />
            </div>
            <div>
              <h3 className="font-semibold">Kullanıcı Büyümesi</h3>
              <p className="text-xs text-zinc-500">Günlük yeni kayıt sayısı</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => userGrowthQuery.refetch()}
            disabled={userGrowthQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${userGrowthQuery.isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="h-48 flex items-end gap-1">
          {userGrowthQuery.data?.map((day, index) => {
            const value = toNumber(day.count);
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className="w-full bg-[#00F5FF]/50 hover:bg-[#00F5FF] rounded-t transition-all cursor-pointer relative"
                  style={{
                    height: `${(value / maxUserCount) * 100}%`,
                    minHeight: "4px",
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value} kullanıcı
                  </div>
                </div>
                {index % Math.ceil((userGrowthQuery.data.length || 1) / 7) ===
                  0 && (
                  <p className="text-[10px] text-zinc-500 mt-2 truncate max-w-full">
                    {format(new Date(day.date), "d MMM", { locale: tr })}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {userGrowthQuery.data?.length === 0 && (
          <div className="h-48 flex items-center justify-center text-zinc-500">
            Veri bulunamadı
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-[#00F5FF]">
              {userGrowthQuery.data?.reduce(
                (sum, d) => sum + toNumber(d.count),
                0
              ) || 0}
            </p>
            <p className="text-xs text-zinc-500">Toplam yeni kullanıcı</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {Math.round(
                (userGrowthQuery.data?.reduce(
                  (sum, d) => sum + toNumber(d.count),
                  0
                ) || 0) / days
              )}
            </p>
            <p className="text-xs text-zinc-500">Günlük ortalama</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#7C3AED]">
              {Math.max(
                ...(userGrowthQuery.data?.map(d => toNumber(d.count)) || [0])
              )}
            </p>
            <p className="text-xs text-zinc-500">En yüksek gün</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111827]/60 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Gelir Raporu</h3>
              <p className="text-xs text-zinc-500">Günlük gelir (₺)</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => revenueQuery.refetch()}
            disabled={revenueQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${revenueQuery.isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {revenueQuery.data && revenueQuery.data.length > 0 ? (
          <>
            <div className="h-48 flex items-end gap-1">
              {revenueQuery.data.map((day, index) => {
                const maxRevenue = Math.max(
                  ...revenueQuery.data.map(d => toNumber(d.total)),
                  1
                );
                const revenue = toNumber(day.total);
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div
                      className="w-full bg-green-500/50 hover:bg-green-500 rounded-t transition-all cursor-pointer relative"
                      style={{
                        height: `${(revenue / maxRevenue) * 100}%`,
                        minHeight: "4px",
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {revenue.toLocaleString()} ₺
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {revenueQuery.data
                    .reduce((sum, d) => sum + toNumber(d.total), 0)
                    .toLocaleString()}{" "}
                  ₺
                </p>
                <p className="text-xs text-zinc-500">Toplam gelir</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#00F5FF]">
                  {Math.round(
                    revenueQuery.data.reduce(
                      (sum, d) => sum + toNumber(d.total),
                      0
                    ) / days
                  ).toLocaleString()}{" "}
                  ₺
                </p>
                <p className="text-xs text-zinc-500">Günlük ortalama</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#7C3AED]">
                  {Math.max(
                    ...revenueQuery.data.map(d => toNumber(d.total))
                  ).toLocaleString()}{" "}
                  ₺
                </p>
                <p className="text-xs text-zinc-500">En yüksek gün</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-zinc-500">
            Gelir verisi bulunamadı
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="rounded-2xl border border-white/10 bg-[#111827]/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Image className="h-4 w-4 text-[#00F5FF]" />
            <h4 className="font-medium">Görsel Üretim</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-[#0B0F19] border border-white/10 p-3">
              <p className="text-lg font-semibold">
                {featureStats.images.total}
              </p>
              <p className="text-xs text-zinc-500">Toplam</p>
            </div>
            <div className="rounded-lg bg-[#0B0F19] border border-emerald-500/20 p-3">
              <p className="text-lg font-semibold text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {featureStats.images.completed}
              </p>
              <p className="text-xs text-zinc-500">Tamamlanan</p>
            </div>
            <div className="rounded-lg bg-[#0B0F19] border border-rose-500/20 p-3">
              <p className="text-lg font-semibold text-rose-300 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" />
                {featureStats.images.failed}
              </p>
              <p className="text-xs text-zinc-500">Başarısız</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827]/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-4 w-4 text-[#7C3AED]" />
            <h4 className="font-medium">Video Üretim</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-[#0B0F19] border border-white/10 p-3">
              <p className="text-lg font-semibold">
                {featureStats.videos.total}
              </p>
              <p className="text-xs text-zinc-500">Toplam</p>
            </div>
            <div className="rounded-lg bg-[#0B0F19] border border-emerald-500/20 p-3">
              <p className="text-lg font-semibold text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {featureStats.videos.completed}
              </p>
              <p className="text-xs text-zinc-500">Tamamlanan</p>
            </div>
            <div className="rounded-lg bg-[#0B0F19] border border-rose-500/20 p-3">
              <p className="text-lg font-semibold text-rose-300 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" />
                {featureStats.videos.failed}
              </p>
              <p className="text-xs text-zinc-500">Başarısız</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
