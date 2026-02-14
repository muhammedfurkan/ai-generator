/**
 * Admin Reports - Raporlar ve Analizler
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminReports() {
  const [days, setDays] = useState(30);

  const userGrowthQuery = trpc.adminPanel.getUserGrowthReport.useQuery({ days });
  const revenueQuery = trpc.adminPanel.getRevenueReport.useQuery({ days });

  const maxUserCount = Math.max(...(userGrowthQuery.data?.map((d) => d.count) || [1]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Raporlar & Analiz</h2>
          <p className="text-sm text-zinc-500">Kullanıcı ve gelir istatistikleri</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Son 7 gün</option>
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
            <option value={365}>Son 1 yıl</option>
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* User Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="h-5 w-5 text-blue-400" />
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
          >
            <RefreshCw className={`h-4 w-4 ${userGrowthQuery.isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Simple Bar Chart */}
        <div className="h-48 flex items-end gap-1">
          {userGrowthQuery.data?.map((day, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group"
            >
              <div
                className="w-full bg-blue-500/50 hover:bg-blue-500 rounded-t transition-all cursor-pointer relative"
                style={{ height: `${(day.count / maxUserCount) * 100}%`, minHeight: "4px" }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day.count} kullanıcı
                </div>
              </div>
              {index % Math.ceil(userGrowthQuery.data.length / 7) === 0 && (
                <p className="text-[10px] text-zinc-500 mt-2 truncate max-w-full">
                  {format(new Date(day.date), "d MMM", { locale: tr })}
                </p>
              )}
            </div>
          ))}
        </div>

        {userGrowthQuery.data?.length === 0 && (
          <div className="h-48 flex items-center justify-center text-zinc-500">
            Veri bulunamadı
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {userGrowthQuery.data?.reduce((sum, d) => sum + d.count, 0) || 0}
            </p>
            <p className="text-xs text-zinc-500">Toplam yeni kullanıcı</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {Math.round(
                (userGrowthQuery.data?.reduce((sum, d) => sum + d.count, 0) || 0) / days
              )}
            </p>
            <p className="text-xs text-zinc-500">Günlük ortalama</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">
              {Math.max(...(userGrowthQuery.data?.map((d) => d.count) || [0]))}
            </p>
            <p className="text-xs text-zinc-500">En yüksek gün</p>
          </div>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
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
          >
            <RefreshCw className={`h-4 w-4 ${revenueQuery.isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Revenue Data */}
        {revenueQuery.data && revenueQuery.data.length > 0 ? (
          <>
            <div className="h-48 flex items-end gap-1">
              {revenueQuery.data.map((day, index) => {
                const maxRevenue = Math.max(...revenueQuery.data.map((d) => Number(d.total) || 0), 1);
                const revenue = Number(day.total) || 0;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div
                      className="w-full bg-green-500/50 hover:bg-green-500 rounded-t transition-all cursor-pointer relative"
                      style={{ height: `${(revenue / maxRevenue) * 100}%`, minHeight: "4px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {revenue} ₺
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Summary */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {revenueQuery.data.reduce((sum, d) => sum + (Number(d.total) || 0), 0).toLocaleString()} ₺
                </p>
                <p className="text-xs text-zinc-500">Toplam gelir</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(
                    revenueQuery.data.reduce((sum, d) => sum + (Number(d.total) || 0), 0) / days
                  ).toLocaleString()} ₺
                </p>
                <p className="text-xs text-zinc-500">Günlük ortalama</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.max(...revenueQuery.data.map((d) => Number(d.total) || 0)).toLocaleString()} ₺
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
    </div>
  );
}
