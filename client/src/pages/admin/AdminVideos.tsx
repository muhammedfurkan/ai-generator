// @ts-nocheck
/**
 * Admin Videos - Video Yönetimi
 * Tüm üretilen videoların listesi ve yönetimi
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Eye,
  Filter,
  Video,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  ExternalLink,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminVideos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const itemsPerPage = 24;

  // Fetch videos from backend
  const videosQuery = trpc.adminPanel.getVideos.useQuery({
    limit: 100,
    offset: 0,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const videos = videosQuery.data?.videos || [];
  const stats = videosQuery.data?.stats || {
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  };

  // Filter by search
  const filteredVideos = videos.filter(
    v =>
      v.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toString().includes(searchQuery)
  );

  const paginatedVideos = filteredVideos.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
            <CheckCircle className="h-3 w-3" />
            Tamamlandı
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
            <XCircle className="h-3 w-3" />
            Başarısız
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
            <Clock className="h-3 w-3" />
            İşleniyor
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-500/20 text-zinc-400">
            <Clock className="h-3 w-3" />
            Bekliyor
          </span>
        );
    }
  };

  const getModelBadge = (model: string) => {
    const colors: Record<string, string> = {
      "veo-3.1": "bg-[#7C3AED]/20 text-[#7C3AED]",
      "kling-2.6": "bg-[#00F5FF]/20 text-[#00F5FF]",
      kling: "bg-[#00F5FF]/20 text-[#00F5FF]",
      grok: "bg-orange-500/20 text-orange-400",
      sora2: "bg-green-500/20 text-green-400",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs ${colors[model] || "bg-zinc-500/20 text-zinc-400"}`}
      >
        {model}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <Input
            placeholder="Prompt veya kullanıcı ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-12 bg-zinc-900 border-white/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="processing">İşleniyor</option>
            <option value="failed">Başarısız</option>
          </select>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => videosQuery.refetch()}
        >
          <RefreshCw
            className={`h-4 w-4 ${videosQuery.isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00F5FF]/20">
              <Video className="h-5 w-5 text-[#00F5FF]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-zinc-500">Toplam Video</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {stats.completed}
              </p>
              <p className="text-xs text-zinc-500">Tamamlanan</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.processing}
              </p>
              <p className="text-xs text-zinc-500">İşleniyor</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              <p className="text-xs text-zinc-500">Başarısız</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Videos Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-800/50">
                <th className="px-4 py-3 text-left font-semibold">Video</th>
                <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
                <th className="px-4 py-3 text-left font-semibold">Model</th>
                <th className="px-4 py-3 text-left font-semibold">Süre</th>
                <th className="px-4 py-3 text-left font-semibold">Kredi</th>
                <th className="px-4 py-3 text-left font-semibold">Durum</th>
                <th className="px-4 py-3 text-left font-semibold">Tarih</th>
                <th className="px-4 py-3 text-left font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVideos.map(video => (
                <tr
                  key={video.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg bg-zinc-800 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-4 w-4 text-zinc-600" />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-4 w-4 text-[#F9FAFB]" />
                        </div>
                      </div>
                      <div className="max-w-[200px]">
                        <p className="truncate text-xs text-zinc-400">
                          {video.prompt?.slice(0, 50)}...
                        </p>
                        <p className="text-xs text-zinc-600">ID: {video.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-zinc-500" />
                      <span className="text-xs">
                        {video.userName || `#${video.userId}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getModelBadge(video.model)}</td>
                  <td className="px-4 py-3">
                    <span className="text-zinc-400">{video.duration}s</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#00F5FF] font-medium">
                      {video.creditsCost}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(video.status)}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {format(new Date(video.createdAt), "d MMM HH:mm", {
                      locale: tr,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedVideo(video)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {video.videoUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(video.videoUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {videos.length === 0 && !videosQuery.isLoading && (
          <div className="text-center py-12">
            <Video className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz video yok</p>
          </div>
        )}

        {/* Loading */}
        {videosQuery.isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-zinc-600 animate-spin" />
            <p className="text-zinc-500">Yükleniyor...</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-sm text-zinc-500">
              {filteredVideos.length} videodan {currentPage * itemsPerPage + 1}-
              {Math.min(
                (currentPage + 1) * itemsPerPage,
                filteredVideos.length
              )}{" "}
              gösteriliyor
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(p => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Video Detail Dialog */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Video Detayları</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="aspect-video rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                {selectedVideo.videoUrl ? (
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : selectedVideo.thumbnailUrl ? (
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="h-16 w-16 text-zinc-600" />
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Video ID</p>
                  <p className="font-mono text-sm">{selectedVideo.id}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Kullanıcı</p>
                  <p className="text-sm">
                    {selectedVideo.userName || `#${selectedVideo.userId}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Model</p>
                  {getModelBadge(selectedVideo.model)}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Mod</p>
                  <p className="text-sm capitalize">
                    {selectedVideo.mode?.replace("-", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Süre</p>
                  <p className="text-sm">{selectedVideo.duration} saniye</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Durum</p>
                  {getStatusBadge(selectedVideo.status)}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Kredi</p>
                  <p className="text-sm text-[#00F5FF] font-medium">
                    {selectedVideo.creditsCost}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Oluşturulma</p>
                  <p className="text-sm">
                    {format(
                      new Date(selectedVideo.createdAt),
                      "d MMMM yyyy HH:mm",
                      {
                        locale: tr,
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <p className="text-xs text-zinc-500 mb-1">Prompt</p>
                <div className="bg-zinc-800 rounded-lg p-3 relative group">
                  <p className="text-sm">{selectedVideo.prompt}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedVideo.prompt);
                      toast.success("Prompt kopyalandı");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedVideo.videoUrl && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() =>
                      window.open(selectedVideo.videoUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    Videoyu Aç
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
