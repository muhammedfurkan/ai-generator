/**
 * Admin Homepage Layout - Ana Sayfa Düzeni, Bölüm Yönetimi ve Showcase Yönetimi
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Layout,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  RefreshCw,
  Trash2,
  Settings,
  Home,
  Sparkles,
  Users,
  MessageSquare,
  CreditCard,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
  Edit,
  Upload,
} from "lucide-react";

interface Section {
  id: number;
  sectionKey: string;
  title: string;
  isVisible: number | boolean;
  order: number;
  config: string | null;
}

interface ShowcaseImage {
  id: number;
  imageUrl: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  aspectRatio: "square" | "portrait" | "landscape";
  order: number;
  isActive: number | boolean;
}

interface ShowcaseVideo {
  id: number;
  videoUrl: string;
  posterUrl?: string | null;
  title?: string | null;
  order: number;
  isActive: number | boolean;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  hero: Sparkles,
  features: Zap,
  howItWorks: Settings,
  pricing: CreditCard,
  testimonials: MessageSquare,
  gallery: ImageIcon,
  faq: HelpCircle,
  cta: Star,
  partners: Users,
  stats: Star,
  videoShowcase: VideoIcon,
};

const DEFAULT_SECTIONS = [
  { sectionKey: "hero", title: "Hero Bölümü", order: 1 },
  { sectionKey: "features", title: "Özellikler", order: 2 },
  { sectionKey: "howItWorks", title: "Nasıl Çalışır", order: 3 },
  { sectionKey: "gallery", title: "Galeri", order: 4 },
  { sectionKey: "testimonials", title: "Kullanıcı Yorumları", order: 5 },
  { sectionKey: "pricing", title: "Fiyatlandırma", order: 6 },
  { sectionKey: "faq", title: "Sıkça Sorulan Sorular", order: 7 },
  { sectionKey: "cta", title: "Aksiyon Çağrısı", order: 8 },
];

export default function AdminHomepage() {
  const [activeTab, setActiveTab] = useState("layout");
  const [sections, setSections] = useState<Section[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Image states
  const [imageDialog, setImageDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<ShowcaseImage | null>(null);
  const [imageForm, setImageForm] = useState({
    imageUrl: "",
    thumbnailUrl: "",
    title: "",
    aspectRatio: "square" as "square" | "portrait" | "landscape",
    order: 0,
    isActive: true,
  });

  // Video states
  const [videoDialog, setVideoDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ShowcaseVideo | null>(null);
  const [videoForm, setVideoForm] = useState({
    videoUrl: "",
    posterUrl: "",
    title: "",
    order: 0,
    isActive: true,
  });

  const utils = trpc.useUtils();

  // Layout Queries
  const sectionsQuery = trpc.adminPanel.getHomepageSections.useQuery(
    undefined,
    {
      retry: false,
    }
  );

  useEffect(() => {
    if (sectionsQuery.error) {
      const defaultSections = DEFAULT_SECTIONS.map((s, i) => ({
        id: i + 1,
        sectionKey: s.sectionKey,
        title: s.title,
        isVisible: true,
        order: s.order,
        config: null,
      }));
      setSections(defaultSections);
    }
  }, [sectionsQuery.error]);

  // Showcase Queries
  const imagesQuery = trpc.adminPanel.getShowcaseImages.useQuery();
  const videosQuery = trpc.adminPanel.getShowcaseVideos.useQuery();

  // Layout Mutations
  const updateOrderMutation =
    trpc.adminPanel.updateHomepageSectionOrder.useMutation({
      onSuccess: () => {
        toast.success("Sıralama kaydedildi");
        setHasChanges(false);
        utils.adminPanel.getHomepageSections.invalidate();
      },
      onError: error => toast.error(error.message),
    });

  const updateSectionMutation =
    trpc.adminPanel.updateHomepageSection.useMutation({
      onSuccess: () => {
        toast.success("Bölüm güncellendi");
        utils.adminPanel.getHomepageSections.invalidate();
      },
      onError: error => toast.error(error.message),
    });

  const initSectionsMutation =
    trpc.adminPanel.initializeHomepageSections.useMutation({
      onSuccess: () => {
        toast.success("Varsayılan bölümler oluşturuldu");
        utils.adminPanel.getHomepageSections.invalidate();
      },
      onError: error => toast.error(error.message),
    });

  // Showcase Image Mutations
  const createImageMutation = trpc.adminPanel.createShowcaseImage.useMutation({
    onSuccess: async () => {
      toast.success("Görsel eklendi");
      await utils.adminPanel.getShowcaseImages.invalidate();
      resetImageForm();
      setImageDialog(false);
    },
    onError: error => toast.error(error.message),
  });

  const updateImageMutation = trpc.adminPanel.updateShowcaseImage.useMutation({
    onSuccess: async () => {
      toast.success("Görsel güncellendi");
      await utils.adminPanel.getShowcaseImages.invalidate();
      resetImageForm();
      setImageDialog(false);
    },
    onError: error => toast.error(error.message),
  });

  const deleteImageMutation = trpc.adminPanel.deleteShowcaseImage.useMutation({
    onSuccess: async () => {
      toast.success("Görsel silindi");
      await utils.adminPanel.getShowcaseImages.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  // Showcase Video Mutations
  const createVideoMutation = trpc.adminPanel.createShowcaseVideo.useMutation({
    onSuccess: async () => {
      toast.success("Video eklendi");
      await utils.adminPanel.getShowcaseVideos.invalidate();
      resetVideoForm();
      setVideoDialog(false);
    },
    onError: error => toast.error(error.message),
  });

  const updateVideoMutation = trpc.adminPanel.updateShowcaseVideo.useMutation({
    onSuccess: async () => {
      toast.success("Video güncellendi");
      await utils.adminPanel.getShowcaseVideos.invalidate();
      resetVideoForm();
      setVideoDialog(false);
    },
    onError: error => toast.error(error.message),
  });

  const deleteVideoMutation = trpc.adminPanel.deleteShowcaseVideo.useMutation({
    onSuccess: async () => {
      toast.success("Video silindi");
      await utils.adminPanel.getShowcaseVideos.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (sectionsQuery.data && sectionsQuery.data.length > 0) {
      setSections(sectionsQuery.data as Section[]);
    }
  }, [sectionsQuery.data]);

  // Layout Handlers
  const handleReorder = (newOrder: Section[]) => {
    const updatedSections = newOrder.map((section, index) => ({
      ...section,
      order: index + 1,
    }));
    setSections(updatedSections);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      await updateOrderMutation.mutateAsync({
        sections: sections.map(s => ({ id: s.id, order: s.order })),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (section: Section) => {
    await updateSectionMutation.mutateAsync({
      id: section.id,
      isVisible: !section.isVisible,
    });
    setSections(prev =>
      prev.map(s =>
        s.id === section.id ? { ...s, isVisible: !s.isVisible } : s
      )
    );
  };

  const handleInitializeSections = () => {
    initSectionsMutation.mutate();
  };

  // Image Handlers
  const resetImageForm = () => {
    setImageForm({
      imageUrl: "",
      thumbnailUrl: "",
      title: "",
      aspectRatio: "square",
      order: 0,
      isActive: true,
    });
    setEditingImage(null);
  };

  const handleAddImage = () => {
    resetImageForm();
    setImageDialog(true);
  };

  const handleEditImage = (image: ShowcaseImage) => {
    setEditingImage(image);
    setImageForm({
      imageUrl: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl || "",
      title: image.title || "",
      aspectRatio: image.aspectRatio,
      order: image.order,
      isActive: !!image.isActive,
    });
    setImageDialog(true);
  };

  const handleSaveImage = () => {
    if (!imageForm.imageUrl) {
      toast.error("Görsel URL'si gerekli");
      return;
    }

    if (editingImage) {
      updateImageMutation.mutate({
        id: editingImage.id,
        ...imageForm,
      });
    } else {
      createImageMutation.mutate(imageForm);
    }
  };

  const handleDeleteImage = (id: number) => {
    if (confirm("Bu görseli silmek istediğinizden emin misiniz?")) {
      deleteImageMutation.mutate({ id });
    }
  };

  // Video Handlers
  const resetVideoForm = () => {
    setVideoForm({
      videoUrl: "",
      posterUrl: "",
      title: "",
      order: 0,
      isActive: true,
    });
    setEditingVideo(null);
  };

  const handleAddVideo = () => {
    resetVideoForm();
    setVideoDialog(true);
  };

  const handleEditVideo = (video: ShowcaseVideo) => {
    setEditingVideo(video);
    setVideoForm({
      videoUrl: video.videoUrl,
      posterUrl: video.posterUrl || "",
      title: video.title || "",
      order: video.order,
      isActive: !!video.isActive,
    });
    setVideoDialog(true);
  };

  const handleSaveVideo = () => {
    if (!videoForm.videoUrl) {
      toast.error("Video URL'si gerekli");
      return;
    }

    if (editingVideo) {
      updateVideoMutation.mutate({
        id: editingVideo.id,
        ...videoForm,
      });
    } else {
      createVideoMutation.mutate(videoForm);
    }
  };

  const handleDeleteVideo = (id: number) => {
    if (confirm("Bu videoyu silmek istediğinizden emin misiniz?")) {
      deleteVideoMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layout className="h-5 w-5 text-[#7C3AED]" />
            Ana Sayfa Yönetimi
          </h2>
          <p className="text-sm text-zinc-500">
            Ana sayfa düzeni ve showcase içeriklerini yönetin
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50">
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Düzen
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="h-4 w-4 mr-2" />
            AI İle Oluşturuldu
          </TabsTrigger>
          <TabsTrigger value="videos">
            <VideoIcon className="h-4 w-4 mr-2" />
            AI Video Galerisi
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-500">
              Ana sayfa bölümlerinin sıralamasını ve görünürlüğünü yönetin
            </p>
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  onClick={handleSaveOrder}
                  disabled={isSaving}
                  className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Kaydet
                </Button>
              )}
              <Button variant="outline" onClick={handleInitializeSections}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Varsayılanları Yükle
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10"
          >
            {sections.length === 0 ? (
              <div className="p-12 text-center">
                <Layout className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500 mb-4">Henüz bölüm bulunamadı</p>
                <Button onClick={handleInitializeSections}>
                  <Plus className="h-4 w-4 mr-2" />
                  Varsayılan Bölümleri Oluştur
                </Button>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={handleReorder}
                className="divide-y divide-white/5"
              >
                {sections.map(section => {
                  const Icon = SECTION_ICONS[section.sectionKey] || Settings;
                  return (
                    <Reorder.Item
                      key={section.id}
                      value={section}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-5 w-5 text-zinc-600" />
                      <div
                        className={`p-2 rounded-lg ${section.isVisible ? "bg-[#00F5FF]/20" : "bg-zinc-800"}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${section.isVisible ? "text-[#00F5FF]" : "text-zinc-500"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${section.isVisible ? "" : "text-zinc-500"}`}
                        >
                          {section.title}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                          {section.sectionKey}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            section.isVisible
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {section.isVisible ? "Görünür" : "Gizli"}
                        </span>
                        <span className="text-xs text-zinc-500 w-8 text-center">
                          #{section.order}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleVisibility(section)}
                          className={
                            section.isVisible
                              ? "text-[#00F5FF]"
                              : "text-zinc-500"
                          }
                        >
                          {section.isVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            )}
          </motion.div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-500">
              "AI İle Oluşturuldu" bölümü için kapak görselleri
            </p>
            <Button
              onClick={handleAddImage}
              className="bg-[#7C3AED] hover:bg-[#7C3AED]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Görsel Ekle
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
          >
            {imagesQuery.isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-zinc-600" />
              </div>
            ) : !imagesQuery.data || imagesQuery.data.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500 mb-4">Henüz görsel eklenmedi</p>
                <Button onClick={handleAddImage}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Görseli Ekle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagesQuery.data.map((image: ShowcaseImage) => (
                  <div
                    key={image.id}
                    className="bg-zinc-800 rounded-lg p-4 space-y-3"
                  >
                    <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden">
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt={image.title || "Showcase"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {image.title || "Başlıksız"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            image.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {image.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="bg-zinc-900 px-2 py-1 rounded">
                          {image.aspectRatio}
                        </span>
                        <span>Sıra: {image.order}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditImage(image)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-500">
              "AI Video Galerisi" bölümü için videolar
            </p>
            <Button
              onClick={handleAddVideo}
              className="bg-[#7C3AED] hover:bg-[#7C3AED]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Video Ekle
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
          >
            {videosQuery.isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-zinc-600" />
              </div>
            ) : !videosQuery.data || videosQuery.data.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500 mb-4">Henüz video eklenmedi</p>
                <Button onClick={handleAddVideo}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Videoyu Ekle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videosQuery.data.map((video: ShowcaseVideo) => (
                  <div
                    key={video.id}
                    className="bg-zinc-800 rounded-lg p-4 space-y-3"
                  >
                    <div className="aspect-[9/16] bg-zinc-900 rounded-lg overflow-hidden">
                      {video.posterUrl ? (
                        <img
                          src={video.posterUrl}
                          alt={video.title || "Video"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <VideoIcon className="h-12 w-12 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {video.title || "Başlıksız"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            video.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {video.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        Sıra: {video.order}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVideo(video)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Image Dialog */}
      <Dialog open={imageDialog} onOpenChange={setImageDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? "Görseli Düzenle" : "Yeni Görsel Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Görsel URL *</Label>
              <Input
                value={imageForm.imageUrl}
                onChange={e =>
                  setImageForm({ ...imageForm, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL (Opsiyonel)</Label>
              <Input
                value={imageForm.thumbnailUrl}
                onChange={e =>
                  setImageForm({ ...imageForm, thumbnailUrl: e.target.value })
                }
                placeholder="https://example.com/thumb.jpg"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Başlık (Opsiyonel)</Label>
              <Input
                value={imageForm.title}
                onChange={e =>
                  setImageForm({ ...imageForm, title: e.target.value })
                }
                placeholder="Görsel başlığı"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={imageForm.aspectRatio}
                onValueChange={(value: "square" | "portrait" | "landscape") =>
                  setImageForm({ ...imageForm, aspectRatio: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                  <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={imageForm.order}
                  onChange={e =>
                    setImageForm({
                      ...imageForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={imageForm.isActive}
                    onCheckedChange={checked =>
                      setImageForm({ ...imageForm, isActive: checked })
                    }
                  />
                  <Label>{imageForm.isActive ? "Aktif" : "Pasif"}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSaveImage}
              className="bg-[#7C3AED] hover:bg-[#7C3AED]"
              disabled={
                createImageMutation.isPending || updateImageMutation.isPending
              }
            >
              {createImageMutation.isPending ||
              updateImageMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialog} onOpenChange={setVideoDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? "Videoyu Düzenle" : "Yeni Video Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Video URL *</Label>
              <Input
                value={videoForm.videoUrl}
                onChange={e =>
                  setVideoForm({ ...videoForm, videoUrl: e.target.value })
                }
                placeholder="https://example.com/video.mp4"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Poster/Thumbnail URL (Opsiyonel)</Label>
              <Input
                value={videoForm.posterUrl}
                onChange={e =>
                  setVideoForm({ ...videoForm, posterUrl: e.target.value })
                }
                placeholder="https://example.com/poster.jpg"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Başlık (Opsiyonel)</Label>
              <Input
                value={videoForm.title}
                onChange={e =>
                  setVideoForm({ ...videoForm, title: e.target.value })
                }
                placeholder="Video başlığı"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={videoForm.order}
                  onChange={e =>
                    setVideoForm({
                      ...videoForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={videoForm.isActive}
                    onCheckedChange={checked =>
                      setVideoForm({ ...videoForm, isActive: checked })
                    }
                  />
                  <Label>{videoForm.isActive ? "Aktif" : "Pasif"}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSaveVideo}
              className="bg-[#7C3AED] hover:bg-[#7C3AED]"
              disabled={
                createVideoMutation.isPending || updateVideoMutation.isPending
              }
            >
              {createVideoMutation.isPending ||
              updateVideoMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
