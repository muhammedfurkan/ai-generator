/**
 * Admin Job Queue - Render / İş Kuyruğu Yönetimi
 * Bekleyen işler, iş detayları, iptal, yeniden başlatma
 * + Kie AI API'deki bekleyen işlemler
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Clock,
  Play,
  Pause,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  User,
  Image,
  Video,
  Zap,
  Search,
  RotateCcw,
  Trash2,
  Activity,
  Timer,
  Layers,
  Cloud,
  Wifi,
  WifiOff,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminJobQueue() {
  const [activeTab, setActiveTab] = useState("internal");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkLiveStatus, setCheckLiveStatus] = useState(false);

  // Internal job queue
  const jobsQuery = trpc.adminPanel.getJobQueue.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    jobType: typeFilter === "all" ? undefined : typeFilter,
    limit: 100,
    offset: 0,
  });

  const queueStatsQuery = trpc.adminPanel.getQueueStats.useQuery();

  // Kie AI Tasks
  const kieTasksQuery = trpc.adminPanel.getKieApiTasks.useQuery(
    {
      checkLiveStatus,
      limit: 50,
    },
    {
      enabled: activeTab === "kie-api",
      staleTime: 10000,
    }
  );

  const utils = trpc.useUtils();

  const cancelJobMutation = trpc.adminPanel.cancelJob.useMutation({
    onSuccess: () => {
      toast.success("İş iptal edildi");
      utils.adminPanel.getJobQueue.invalidate();
      utils.adminPanel.getQueueStats.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const retryJobMutation = trpc.adminPanel.retryJob.useMutation({
    onSuccess: () => {
      toast.success("İş yeniden başlatıldı");
      utils.adminPanel.getJobQueue.invalidate();
      utils.adminPanel.getQueueStats.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const clearCompletedMutation = trpc.adminPanel.clearCompletedJobs.useMutation(
    {
      onSuccess: data => {
        toast.success(`${data.deletedCount} tamamlanmış iş temizlendi`);
        utils.adminPanel.getJobQueue.invalidate();
        utils.adminPanel.getQueueStats.invalidate();
      },
      onError: error => toast.error(error.message),
    }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "processing":
        return <Play className="h-4 w-4 text-[#00F5FF] animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "cancelled":
        return <Pause className="h-4 w-4 text-zinc-400" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      queued: { color: "bg-yellow-500/20 text-yellow-400", label: "Kuyrukta" },
      pending: { color: "bg-yellow-500/20 text-yellow-400", label: "Bekliyor" },
      processing: {
        color: "bg-[#00F5FF]/20 text-[#00F5FF]",
        label: "İşleniyor",
      },
      completed: {
        color: "bg-green-500/20 text-green-400",
        label: "Tamamlandı",
      },
      failed: { color: "bg-red-500/20 text-red-400", label: "Başarısız" },
      cancelled: { color: "bg-zinc-500/20 text-zinc-400", label: "İptal" },
    };
    const c = config[status] || {
      color: "bg-zinc-500/20 text-zinc-400",
      label: status,
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${c.color}`}
      >
        {getStatusIcon(status)} {c.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4 text-[#7C3AED]" />;
      case "video":
        return <Video className="h-4 w-4 text-[#00F5FF]" />;
      case "upscale":
        return <Zap className="h-4 w-4 text-green-400" />;
      case "multi_angle":
        return <Layers className="h-4 w-4 text-orange-400" />;
      case "skin_enhancement":
        return <Zap className="h-4 w-4 text-[#FF2E97]" />;
      case "product_promo":
        return <Video className="h-4 w-4 text-[#00F5FF]" />;
      case "ugc_ad":
        return <Video className="h-4 w-4 text-[#00F5FF]" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      image: "Görsel",
      video: "Video",
      upscale: "Upscale",
      multi_angle: "Multi Angle",
      skin_enhancement: "Cilt",
      product_promo: "Promo",
      ugc_ad: "UGC",
    };
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-300 flex items-center gap-1">
        {getTypeIcon(type)} {labels[type] || type}
      </span>
    );
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const jobs = jobsQuery.data?.jobs || [];
  const stats = queueStatsQuery.data;
  const kieTasks = kieTasksQuery.data;

  // Filter by search
  const filteredJobs = jobs.filter(
    (job: any) =>
      job.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(job.id).includes(searchQuery) ||
      String(job.userId).includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-2xl border border-yellow-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Kuyrukta</p>
              <p className="text-2xl font-bold">{stats?.queued || 0}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/10 rounded-2xl border border-[#00F5FF]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">İşleniyor</p>
              <p className="text-2xl font-bold">{stats?.processing || 0}</p>
            </div>
            <Play className="h-6 w-6 text-[#00F5FF]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Tamamlandı</p>
              <p className="text-2xl font-bold">{stats?.completed || 0}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-red-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Başarısız</p>
              <p className="text-2xl font-bold">{stats?.failed || 0}</p>
            </div>
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Ort. Süre</p>
              <p className="text-2xl font-bold">
                {formatDuration(stats?.avgDurationMs)}
              </p>
            </div>
            <Timer className="h-6 w-6 text-[#7C3AED]" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger
            value="internal"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Activity className="h-4 w-4 mr-2" />
            Internal Kuyruk
          </TabsTrigger>
          <TabsTrigger
            value="kie-api"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Kie AI Tasks ({kieTasks?.stats?.totalPending || 0})
          </TabsTrigger>
        </TabsList>

        {/* Internal Queue Tab */}
        <TabsContent value="internal" className="mt-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Ara (ID, kullanıcı)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-zinc-800 border-white/10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-zinc-800 border-white/10">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="queued">Kuyrukta</SelectItem>
                  <SelectItem value="processing">İşleniyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-zinc-800 border-white/10">
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="image">Görsel</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="upscale">Upscale</SelectItem>
                  <SelectItem value="multi_angle">Multi Angle</SelectItem>
                  <SelectItem value="skin_enhancement">Cilt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  jobsQuery.refetch();
                  queueStatsQuery.refetch();
                }}
              >
                <RefreshCw
                  className={`h-4 w-4 ${jobsQuery.isFetching ? "animate-spin" : ""}`}
                />
                Yenile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10"
                onClick={() => {
                  if (
                    confirm(
                      "Tamamlanmış tüm işleri temizlemek istediğinizden emin misiniz?"
                    )
                  ) {
                    clearCompletedMutation.mutate();
                  }
                }}
                disabled={clearCompletedMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Tamamlananları Temizle
              </Button>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Tip
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Kullanıcı
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Durum
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Model
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Deneme
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Süre
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Tarih
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredJobs.map((job: any) => (
                    <tr
                      key={job.id}
                      className="hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono">#{job.id}</td>
                      <td className="py-3 px-4">{getTypeBadge(job.jobType)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          <div>
                            <p className="text-sm">
                              {job.userName || `User #${job.userId}`}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {job.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
                          {job.modelKey || "-"}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {job.attempts}/{job.maxAttempts}
                        {job.attempts >= job.maxAttempts && (
                          <AlertTriangle className="h-3 w-3 text-red-400 inline ml-1" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {job.actualDurationMs
                          ? formatDuration(job.actualDurationMs)
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {formatDistanceToNow(new Date(job.queuedAt), {
                          locale: tr,
                          addSuffix: true,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(job.status === "queued" ||
                            job.status === "processing") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() =>
                                cancelJobMutation.mutate({ id: job.id })
                              }
                              disabled={cancelJobMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {(job.status === "failed" ||
                            job.status === "cancelled") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#00F5FF] hover:text-[#00F5FF] hover:bg-[#00F5FF]/10"
                              onClick={() =>
                                retryJobMutation.mutate({ id: job.id })
                              }
                              disabled={retryJobMutation.isPending}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Kuyrukta iş bulunamadı</p>
              </div>
            )}
          </div>

          {/* Error details */}
          {filteredJobs.some((j: any) => j.lastError) && (
            <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
              <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Son Hatalar
              </h4>
              <div className="space-y-2">
                {filteredJobs
                  .filter((j: any) => j.lastError)
                  .slice(0, 5)
                  .map((job: any) => (
                    <div key={job.id} className="bg-zinc-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-500">#{job.id}</span>
                        {getTypeBadge(job.jobType)}
                      </div>
                      <p className="text-sm text-red-300 font-mono">
                        {job.lastError}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Kie AI Tasks Tab */}
        <TabsContent value="kie-api" className="mt-6">
          {/* Kie API Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/10 rounded-2xl border border-[#00F5FF]/30 p-4"
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-[#00F5FF]" />
                <div>
                  <p className="text-lg font-bold">
                    {kieTasks?.stats?.processingVideos || 0}
                  </p>
                  <p className="text-xs text-zinc-400">Video İşleniyor</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-2xl border border-yellow-500/30 p-4"
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-lg font-bold">
                    {kieTasks?.stats?.pendingVideos || 0}
                  </p>
                  <p className="text-xs text-zinc-400">Video Bekliyor</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-4"
            >
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-[#7C3AED]" />
                <div>
                  <p className="text-lg font-bold">
                    {kieTasks?.stats?.processingImages || 0}
                  </p>
                  <p className="text-xs text-zinc-400">Görsel İşleniyor</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl border border-orange-500/30 p-4"
            >
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-lg font-bold">
                    {kieTasks?.stats?.pendingImages || 0}
                  </p>
                  <p className="text-xs text-zinc-400">Görsel Bekliyor</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                <Switch
                  checked={checkLiveStatus}
                  onCheckedChange={setCheckLiveStatus}
                />
                <span className="text-sm">
                  {checkLiveStatus ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Wifi className="h-4 w-4" /> Canlı Durum
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <WifiOff className="h-4 w-4" /> Canlı Durum
                    </span>
                  )}
                </span>
              </div>
              {checkLiveStatus && (
                <p className="text-xs text-zinc-500">
                  Kie AI API'den canlı durumlar alınıyor (ilk 10)
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => kieTasksQuery.refetch()}
            >
              <RefreshCw
                className={`h-4 w-4 ${kieTasksQuery.isFetching ? "animate-spin" : ""}`}
              />
              Yenile
            </Button>
          </div>

          {/* Videos */}
          {kieTasks?.videos && kieTasks.videos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Video className="h-4 w-4 text-[#00F5FF]" />
                Video İşlemleri ({kieTasks.videos.length})
              </h3>
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50 border-b border-white/10">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Kullanıcı
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Model
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Prompt
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          DB Durumu
                        </th>
                        {checkLiveStatus && (
                          <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                            API Durumu
                          </th>
                        )}
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Task ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Tarih
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {kieTasks.videos.map((video: any) => (
                        <tr
                          key={video.id}
                          className="hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-mono">
                            #{video.id}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">
                                {video.userName || `User #${video.userId}`}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {video.userEmail}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-xs bg-[#00F5FF]/20 text-[#00F5FF] px-2 py-0.5 rounded">
                              {video.model}
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <p
                              className="text-sm text-zinc-400 truncate max-w-[200px]"
                              title={video.prompt}
                            >
                              {video.prompt}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(video.status)}
                          </td>
                          {checkLiveStatus && (
                            <td className="py-3 px-4">
                              {video.liveStatus ? (
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(video.liveStatus)}
                                  {video.liveError && (
                                    <span
                                      className="text-xs text-red-400"
                                      title={video.liveError}
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-500">-</span>
                              )}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <code className="text-xs text-zinc-500 font-mono">
                              {video.taskId?.substring(0, 12)}...
                            </code>
                          </td>
                          <td className="py-3 px-4 text-sm text-zinc-400">
                            {formatDistanceToNow(new Date(video.createdAt), {
                              locale: tr,
                              addSuffix: true,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {kieTasks?.images && kieTasks.images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Image className="h-4 w-4 text-[#7C3AED]" />
                Görsel İşlemleri ({kieTasks.images.length})
              </h3>
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50 border-b border-white/10">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Kullanıcı
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Model
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Prompt
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          DB Durumu
                        </th>
                        {checkLiveStatus && (
                          <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                            API Durumu
                          </th>
                        )}
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Task ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Tarih
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {kieTasks.images.map((image: any) => (
                        <tr
                          key={image.id}
                          className="hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-mono">
                            #{image.id}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">
                                {image.userName || `User #${image.userId}`}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {image.userEmail}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-xs bg-[#7C3AED]/20 text-[#7C3AED] px-2 py-0.5 rounded">
                              {image.model}
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <p
                              className="text-sm text-zinc-400 truncate max-w-[200px]"
                              title={image.prompt}
                            >
                              {image.prompt}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(image.status)}
                          </td>
                          {checkLiveStatus && (
                            <td className="py-3 px-4">
                              {image.liveStatus ? (
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(image.liveStatus)}
                                  {image.liveError && (
                                    <span
                                      className="text-xs text-red-400"
                                      title={image.liveError}
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-500">-</span>
                              )}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <code className="text-xs text-zinc-500 font-mono">
                              {image.taskId?.substring(0, 12)}...
                            </code>
                          </td>
                          <td className="py-3 px-4 text-sm text-zinc-400">
                            {formatDistanceToNow(new Date(image.createdAt), {
                              locale: tr,
                              addSuffix: true,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!kieTasks?.videos?.length && !kieTasks?.images?.length && (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
              <Cloud className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-500">
                Kie AI'da bekleyen işlem bulunamadı
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Video ve görsel üretimleri tamamlandığında burada görünmez
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
