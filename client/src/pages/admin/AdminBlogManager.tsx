/**
 * Admin Blog Manager - Blog Yönetimi (Tam Entegrasyon)
 */
import { useState, useRef } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  BarChart3,
  Loader2,
  ImagePlus,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const CATEGORIES = ["Video", "Rehber", "Trend", "İpuçları", "Sosyal Medya", "Marka", "Teknoloji", "Diğer"];

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string | null;
  category: string;
  author: string;
  readTime: string;
  status: "draft" | "published" | "archived";
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export default function AdminBlogManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    coverImage: "",
    category: "Rehber",
    author: "Amonify",
    readTime: "5 dk",
    status: "draft" as "draft" | "published",
  });

  const utils = trpc.useUtils();

  const { data: postsData, isLoading: postsLoading } = trpc.blog.adminList.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter,
  });

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog yazısı oluşturuldu");
      setIsCreateOpen(false);
      resetForm();
      utils.blog.adminList.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog yazısı güncellendi");
      setIsEditOpen(false);
      setSelectedPost(null);
      utils.blog.adminList.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog yazısı silindi");
      setIsDeleteOpen(false);
      setSelectedPost(null);
      utils.blog.adminList.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      coverImage: "",
      category: "Rehber",
      author: "Amonify",
      readTime: "5 dk",
      status: "draft",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen geçerli bir resim dosyası seçin");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Resim yüklenemedi");

      const data = await response.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
        toast.success("Resim başarıyla yüklendi");
      }
    } catch (error) {
      toast.error("Resim yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category,
      author: post.author,
      readTime: post.readTime,
      status: post.status === "archived" ? "draft" : post.status,
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Yayında</span>;
      case "draft":
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">Taslak</span>;
      case "archived":
        return <span className="px-2 py-1 rounded-full text-xs bg-zinc-500/20 text-zinc-400">Arşiv</span>;
      default:
        return null;
    }
  };

  const posts = postsData?.posts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Blog Yönetimi</h2>
          <p className="text-sm text-zinc-500">Blog yazılarını ekleyin, düzenleyin ve yönetin</p>
        </div>
        <Button
          className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Yeni Yazı
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{postsData?.total || 0}</p>
              <p className="text-xs text-zinc-500">Toplam Yazı</p>
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
              <Eye className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {posts.filter((p: BlogPost) => p.status === "published").length}
              </p>
              <p className="text-xs text-zinc-500">Yayında</p>
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
              <Edit className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {posts.filter((p: BlogPost) => p.status === "draft").length}
              </p>
              <p className="text-xs text-zinc-500">Taslak</p>
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
            <div className="p-2 rounded-lg bg-purple-500/20">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {posts.reduce((acc: number, p: BlogPost) => acc + p.viewCount, 0)}
              </p>
              <p className="text-xs text-zinc-500">Toplam Görüntülenme</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-40 bg-zinc-900 border-white/10">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="archived">Arşiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10"
      >
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-zinc-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz blog yazısı yok</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {posts.map((post: BlogPost) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.createdAt), "d MMM yyyy", { locale: tr })}
                      </span>
                      <span>{post.category}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(post.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400"
                    onClick={() => {
                      setSelectedPost(post);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Başlık *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Blog yazısı başlığı"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Kısa Açıklama *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kart görünümünde gösterilecek kısa açıklama"
                className="bg-zinc-800 border-white/10"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">İçerik (Markdown) *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Blog yazısının tam içeriği..."
                className="bg-zinc-800 border-white/10 font-mono"
                rows={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kapak Görseli</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="cover-image-upload"
                />
                {formData.coverImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-white/10">
                    <img src={formData.coverImage} alt="Kapak" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: "" })}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="cover-image-upload"
                    className={`flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-white/20 hover:border-lime-500/50 bg-zinc-800 cursor-pointer ${isUploading ? "opacity-50" : ""}`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-zinc-400 mb-2" />
                        <span className="text-sm text-zinc-400">Resim Yükle</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Yazar</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Okuma Süresi</label>
                <Input
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="5 dk"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Durum</label>
                <Select value={formData.status} onValueChange={(v: "draft" | "published") => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="published">Yayınla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>
              İptal
            </Button>
            <Button
              className="bg-lime-500 hover:bg-lime-600 text-black"
              onClick={() => {
                if (isEditOpen && selectedPost) {
                  updateMutation.mutate({ id: selectedPost.id, ...formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.title || !formData.description || !formData.content}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditOpen ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Blog Yazısını Sil</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            "{selectedPost?.title}" başlıklı yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPost && deleteMutation.mutate({ id: selectedPost.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
