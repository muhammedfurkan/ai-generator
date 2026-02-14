/**
 * Admin Images - Görsel Yönetimi
 * Tüm üretilen görsellerin listesi ve yönetimi
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
  Image as ImageIcon,
  Calendar,
  User,
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminImages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const itemsPerPage = 24;

  // Fetch images from backend
  const imagesQuery = trpc.adminPanel.getImages.useQuery({
    limit: 100,
    offset: 0,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const images = imagesQuery.data?.images || [];
  const stats = imagesQuery.data?.stats || {
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  };

  // Filter by search
  const filteredImages = images.filter(
    img =>
      img.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.id.toString().includes(searchQuery)
  );

  const paginatedImages = filteredImages.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

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
          onClick={() => imagesQuery.refetch()}
        >
          <RefreshCw
            className={`h-4 w-4 ${imagesQuery.isFetching ? "animate-spin" : ""}`}
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
            <div className="p-2 rounded-lg bg-[#7C3AED]/20">
              <ImageIcon className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-zinc-500">Toplam Görsel</p>
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

      {/* Images Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        {imagesQuery.isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-zinc-600 animate-spin" />
            <p className="text-zinc-500">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedImages.map(image => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-800 cursor-pointer hover:ring-2 hover:ring-[#00F5FF]/50 transition-all"
                onClick={() => setSelectedImage(image)}
              >
                {/* Image */}
                {image.generatedImageUrl ? (
                  <img
                    src={image.generatedImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <ImageIcon className="h-8 w-8 text-zinc-600" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-[#F9FAFB] truncate">
                      {image.prompt?.slice(0, 40)}...
                    </p>
                    <p className="text-xs text-zinc-400">
                      {image.userName || `#${image.userId}`}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(image.status)}
                </div>

                {/* Quick View */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-black/50 hover:bg-black/70"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedImage(image);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && !imagesQuery.isLoading && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz görsel yok</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <p className="text-sm text-zinc-500">
              {filteredImages.length} görselden {currentPage * itemsPerPage + 1}
              -
              {Math.min(
                (currentPage + 1) * itemsPerPage,
                filteredImages.length
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

      {/* Image Detail Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Görsel Detayları</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="aspect-square max-h-96 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                {selectedImage.generatedImageUrl ? (
                  <img
                    src={selectedImage.generatedImageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-zinc-600" />
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Görsel ID</p>
                  <p className="font-mono text-sm">{selectedImage.id}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Kullanıcı</p>
                  <p className="text-sm">
                    {selectedImage.userName || `#${selectedImage.userId}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Durum</p>
                  {getStatusBadge(selectedImage.status)}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Kredi</p>
                  <p className="text-sm text-[#00F5FF] font-medium">
                    {selectedImage.creditsCost}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Oluşturulma</p>
                  <p className="text-sm">
                    {format(
                      new Date(selectedImage.createdAt),
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
                  <p className="text-sm">{selectedImage.prompt}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImage.prompt);
                      toast.success("Prompt kopyalandı");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedImage.generatedImageUrl && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() =>
                        window.open(selectedImage.generatedImageUrl, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Görseli Aç
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = selectedImage.generatedImageUrl;
                        link.download = `image-${selectedImage.id}.png`;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                      İndir
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
