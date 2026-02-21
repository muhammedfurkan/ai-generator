/**
 * Admin Dashboard - Genel Bakış
 * Ana istatistikler, son aktiviteler ve hızlı işlemler
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Users,
  Image,
  Video,
  CreditCard,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Clock,
  UserPlus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Cpu,
  AlertTriangle,
  Zap,
  BarChart3,
  Palette,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  color:
    | "blue"
    | "green"
    | "purple"
    | "pink"
    | "orange"
    | "red"
    | "yellow"
    | "lime"
    | "cyan";
  suffix?: string;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  suffix,
  subtitle,
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "from-[#00F5FF]/20 to-[#7C3AED]/10 border-[#00F5FF]/30 text-[#00F5FF]",
    green:
      "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    purple:
      "from-[#7C3AED]/20 to-[#FF2E97]/10 border-[#7C3AED]/30 text-[#7C3AED]",
    pink: "from-[#FF2E97]/20 to-[#7C3AED]/10 border-[#FF2E97]/30 text-[#FF2E97]",
    orange:
      "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
    red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    yellow:
      "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400",
    lime: "from-[#00F5FF]/20 to-[#7C3AED]/10 border-[#00F5FF]/30 text-[#00F5FF]",
    cyan: "from-[#00F5FF]/20 to-[#7C3AED]/10 border-[#00F5FF]/30 text-[#00F5FF]",
  };

  const iconBgClasses: Record<string, string> = {
    blue: "bg-[#00F5FF]/20 text-[#00F5FF]",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-[#7C3AED]/20 text-[#7C3AED]",
    pink: "bg-[#FF2E97]/20 text-[#FF2E97]",
    orange: "bg-orange-500/20 text-orange-400",
    red: "bg-red-500/20 text-red-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    lime: "bg-[#00F5FF]/20 text-[#00F5FF]",
    cyan: "bg-[#00F5FF]/20 text-[#00F5FF]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-2xl border p-5
        bg-gradient-to-br ${colorClasses[color]}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#F9FAFB]">
            {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
          {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(trend)}% bu hafta</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
}

function QuickAction({
  label,
  description,
  icon: Icon,
  onClick,
  color,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-white/10 hover:border-[#00F5FF]/30 hover:bg-zinc-800/50 transition-all group text-left w-full"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium group-hover:text-[#00F5FF] transition-colors">
          {label}
        </p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-[#00F5FF] transition-colors" />
    </button>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const overviewQuery = trpc.adminPanel.getDashboardOverview.useQuery();
  const advancedStatsQuery = trpc.adminPanel.getAdvancedDashboardStats.useQuery(
    { period }
  );
  const recentActivityQuery = trpc.adminPanel.getRecentActivity.useQuery();

  const stats = overviewQuery.data;
  const advancedStats = advancedStatsQuery.data;
  const recentActivity = recentActivityQuery.data;

  const periodLabels: Record<string, string> = {
    daily: "Bugün",
    weekly: "Bu Hafta",
    monthly: "Bu Ay",
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-zinc-500">
            Genel sistem durumu ve istatistikler
          </p>
        </div>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger className="w-32 bg-zinc-800 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Bugün</SelectItem>
            <SelectItem value="weekly">Bu Hafta</SelectItem>
            <SelectItem value="monthly">Bu Ay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Bugün Yeni Kullanıcı"
          value={stats?.todayNewUsers || 0}
          icon={UserPlus}
          color="green"
        />
        <StatCard
          title="Toplam Görsel"
          value={stats?.totalImages || 0}
          icon={Image}
          color="purple"
        />
        <StatCard
          title="Toplam Video"
          value={stats?.totalVideos || 0}
          icon={Video}
          color="pink"
        />
        <StatCard
          title="Bugün Üretilen Görsel"
          value={stats?.todayImages || 0}
          icon={Sparkles}
          color="orange"
        />
        <StatCard
          title="Bekleyen Feedback"
          value={stats?.pendingFeedbacks || 0}
          icon={MessageSquare}
          color="red"
        />
        <StatCard
          title="Dolaşımdaki Kredi"
          value={stats?.totalCreditsInCirculation || 0}
          icon={CreditCard}
          color="yellow"
        />
        <StatCard
          title="Bugün Gelir"
          value={stats?.todayRevenue || 0}
          icon={DollarSign}
          suffix="₺"
          color="lime"
        />
      </div>

      {/* Advanced Stats - Period Based */}
      {advancedStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={`${periodLabels[period]} Üretilen Görsel`}
            value={advancedStats.periodStats.images}
            icon={Image}
            color="purple"
            subtitle={`${advancedStats.periodStats.activeUsers} aktif kullanıcı`}
          />
          <StatCard
            title={`${periodLabels[period]} Üretilen Video`}
            value={advancedStats.periodStats.videos}
            icon={Video}
            color="pink"
          />
          <StatCard
            title="API Maliyeti"
            value={`$${advancedStats.totalApiCostUsd}`}
            icon={DollarSign}
            color="orange"
            subtitle="Toplam API kullanım maliyeti"
          />
          <StatCard
            title="Kuyruk Durumu"
            value={
              advancedStats.queueStatus.pending +
              advancedStats.queueStatus.processing
            }
            icon={Clock}
            color="cyan"
            subtitle={`${advancedStats.queueStatus.processing} işleniyor, ${advancedStats.queueStatus.pending} bekliyor`}
          />
          <StatCard
            title="Harcanan Kredi"
            value={advancedStats.creditStats.spent}
            icon={Zap}
            color="red"
            subtitle={`${periodLabels[period]}`}
          />
          <StatCard
            title="Satın Alınan Kredi"
            value={advancedStats.creditStats.purchased}
            icon={CreditCard}
            color="green"
            subtitle={`${periodLabels[period]}`}
          />
          <StatCard
            title={`${periodLabels[period]} Gelir`}
            value={advancedStats.periodRevenue.total}
            icon={TrendingUp}
            suffix="₺"
            color="lime"
            subtitle={`${advancedStats.periodRevenue.transactions} işlem`}
          />
          <StatCard
            title="Aktif Model"
            value={
              advancedStats.modelStats.filter((m: any) => m.isActive).length
            }
            icon={Cpu}
            color="blue"
            subtitle={`${advancedStats.modelStats.length} toplam model`}
          />
        </div>
      )}

      {/* Model Performance */}
      {advancedStats && advancedStats.mostUsedModels.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#00F5FF]" />
              En Çok Kullanılan Modeller
            </h3>
            <div className="space-y-3">
              {advancedStats.mostUsedModels.map((model: any, idx: number) => (
                <div key={model.modelKey} className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500 w-4">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {model.modelName}
                      </span>
                      <span className="text-sm text-zinc-400">
                        {model.totalRequests.toLocaleString()} istek
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00F5FF] to-[#7C3AED]"
                        style={{
                          width: `${(model.totalRequests / (advancedStats.mostUsedModels[0]?.totalRequests || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Hata Oranları
            </h3>
            <div className="space-y-3">
              {advancedStats.mostFailingModels.filter(
                (m: any) => parseFloat(m.errorRate) > 0
              ).length > 0 ? (
                advancedStats.mostFailingModels
                  .filter((m: any) => parseFloat(m.errorRate) > 0)
                  .slice(0, 5)
                  .map((model: any) => (
                    <div
                      key={model.modelKey}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {model.modelName}
                        </span>
                        <p className="text-xs text-zinc-500">
                          {model.failedRequests} hata / {model.totalRequests}{" "}
                          istek
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${parseFloat(model.errorRate) > 10 ? "text-red-400" : "text-yellow-400"}`}
                      >
                        %{model.errorRate}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 text-zinc-500">
                  <span className="text-green-400">✓</span> Tüm modeller
                  sağlıklı
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#00F5FF]" />
            Hızlı İşlemler
          </h3>
          <div className="space-y-3">
            <QuickAction
              label="Kullanıcı Yönetimi"
              description="Kullanıcıları görüntüle ve düzenle"
              icon={Users}
              onClick={() => navigate("/admin/users")}
              color="bg-[#00F5FF]/20 text-[#00F5FF]"
            />
            <QuickAction
              label="Yeni Duyuru"
              description="Popup veya banner oluştur"
              icon={MessageSquare}
              onClick={() => navigate("/admin/announcements")}
              color="bg-[#7C3AED]/20 text-[#7C3AED]"
            />
            <QuickAction
              label="Marka & Kimlik"
              description="Logo ve favicon ayarlarını güncelle"
              icon={Palette}
              onClick={() => navigate("/admin/branding")}
              color="bg-cyan-500/20 text-cyan-400"
            />
            <QuickAction
              label="Web Kontrol Merkezi"
              description="Hero, menü ve footer yönetimi"
              icon={Settings}
              onClick={() => navigate("/admin/web-control")}
              color="bg-violet-500/20 text-violet-400"
            />
            <QuickAction
              label="Kredi Ekle"
              description="Kullanıcıya manuel kredi ekle"
              icon={CreditCard}
              onClick={() => navigate("/admin/credits")}
              color="bg-green-500/20 text-green-400"
            />
            <QuickAction
              label="Raporlar"
              description="Detaylı analiz ve raporlar"
              icon={TrendingUp}
              onClick={() => navigate("/admin/reports")}
              color="bg-orange-500/20 text-orange-400"
            />
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#00F5FF]" />
            Son Kaydolanlar
          </h3>
          <div className="space-y-3">
            {recentActivity?.recentUsers.slice(0, 5).map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/users")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center text-black font-bold">
                    {user.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-medium">{user.name || "İsimsiz"}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {format(new Date(user.createdAt), "d MMM", { locale: tr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4 text-[#00F5FF] hover:text-[#00F5FF]"
            onClick={() => navigate("/admin/users")}
          >
            Tümünü Gör
          </Button>
        </motion.div>
      </div>

      {/* Recent Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="h-5 w-5 text-[#00F5FF]" />
            Son Üretilen Görseller
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00F5FF] hover:text-[#00F5FF]"
            onClick={() => navigate("/admin/images")}
          >
            Tümünü Gör
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {recentActivity?.recentImages.slice(0, 6).map(image => (
            <div
              key={image.id}
              className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square bg-zinc-800"
              onClick={() => navigate("/admin/images")}
            >
              {image.status === "completed" && image.generatedImageUrl ? (
                <img
                  src={image.generatedImageUrl}
                  alt={image.prompt?.slice(0, 30) || "Generated Image"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${
                      image.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : image.status === "failed"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }
                  `}
                  >
                    {image.status === "completed"
                      ? "Tamamlandı"
                      : image.status === "failed"
                        ? "Başarısız"
                        : "İşleniyor"}
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-[#F9FAFB] truncate">
                  {image.prompt?.slice(0, 30)}...
                </p>
              </div>
              {/* Status badge for completed images */}
              {image.status === "completed" && image.generatedImageUrl && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/80 text-[#F9FAFB]">
                    ✓
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
