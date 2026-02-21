import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Camera,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Home,
  Image as ImageIcon,
  Layout,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import {
  DEFAULT_WEB_UI_CONFIG,
  HOME_SECTION_IDS,
  parseWebUiConfig,
  type HomeSectionId,
  type WebUiConfig,
} from "@/lib/webUiConfig";

const WEB_UI_SETTING_KEY = "web_ui_config";

const WEB_UI_SETTING_META = {
  key: WEB_UI_SETTING_KEY,
  category: "general" as const,
  label: "Web UI Konfigürasyonu",
  description: "Web ana sayfa görünürlük/sıra ayarları",
  inputType: "json" as const,
  isPublic: true,
};

const SECTION_LABELS: Record<HomeSectionId, string> = {
  "ai-tools": "AI Araçları",
  models: "Model Kartları",
  images: "Görsel Galeri",
  videos: "Video Galeri",
  community: "Topluluk",
  cta: "Alt CTA",
};

type ActiveFilter = "all" | "active" | "inactive";
type AspectRatio = "square" | "portrait" | "landscape";

interface ShowcaseImageItem {
  id: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  aspectRatio: AspectRatio;
  order: number;
  isActive: number | boolean;
}

interface ShowcaseVideoItem {
  id: number;
  videoUrl: string;
  posterUrl: string | null;
  title: string | null;
  order: number;
  isActive: number | boolean;
}

interface ImageFormState {
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  aspectRatio: AspectRatio;
  order: number;
  isActive: boolean;
}

interface VideoFormState {
  videoUrl: string;
  posterUrl: string;
  title: string;
  order: number;
  isActive: boolean;
}

const emptyImageForm: ImageFormState = {
  imageUrl: "",
  thumbnailUrl: "",
  title: "",
  aspectRatio: "square",
  order: 0,
  isActive: true,
};

const emptyVideoForm: VideoFormState = {
  videoUrl: "",
  posterUrl: "",
  title: "",
  order: 0,
  isActive: true,
};

const asBool = (value: number | boolean) => value === true || value === 1;

export default function AdminHomepage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({});
  const createSettingMutation = trpc.adminPanel.createSiteSetting.useMutation();
  const updateSettingMutation = trpc.adminPanel.updateSiteSetting.useMutation();

  const imagesQuery = trpc.adminPanel.getShowcaseImages.useQuery();
  const videosQuery = trpc.adminPanel.getShowcaseVideos.useQuery();

  const createImageMutation = trpc.adminPanel.createShowcaseImage.useMutation();
  const updateImageMutation = trpc.adminPanel.updateShowcaseImage.useMutation();
  const deleteImageMutation = trpc.adminPanel.deleteShowcaseImage.useMutation();

  const createVideoMutation = trpc.adminPanel.createShowcaseVideo.useMutation();
  const updateVideoMutation = trpc.adminPanel.updateShowcaseVideo.useMutation();
  const deleteVideoMutation = trpc.adminPanel.deleteShowcaseVideo.useMutation();

  const settingRow = useMemo(
    () => settingsQuery.data?.find(item => item.key === WEB_UI_SETTING_KEY),
    [settingsQuery.data]
  );

  const parsedConfig = useMemo(
    () => parseWebUiConfig(settingRow?.value),
    [settingRow?.value]
  );

  const [activeTab, setActiveTab] = useState("layout");
  const [draftConfig, setDraftConfig] = useState<WebUiConfig>(parsedConfig);

  const [imageSearch, setImageSearch] = useState("");
  const [imageFilter, setImageFilter] = useState<ActiveFilter>("all");
  const [videoSearch, setVideoSearch] = useState("");
  const [videoFilter, setVideoFilter] = useState<ActiveFilter>("all");

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [imageForm, setImageForm] = useState<ImageFormState>(emptyImageForm);

  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [videoForm, setVideoForm] = useState<VideoFormState>(emptyVideoForm);

  useEffect(() => {
    setDraftConfig(parsedConfig);
  }, [parsedConfig]);

  const layoutDirty = useMemo(
    () =>
      JSON.stringify({
        sectionOrder: draftConfig.home.sectionOrder,
        sectionVisibility: draftConfig.home.sectionVisibility,
      }) !==
      JSON.stringify({
        sectionOrder: parsedConfig.home.sectionOrder,
        sectionVisibility: parsedConfig.home.sectionVisibility,
      }),
    [
      draftConfig.home.sectionOrder,
      draftConfig.home.sectionVisibility,
      parsedConfig,
    ]
  );

  const images = (imagesQuery.data ?? []) as ShowcaseImageItem[];
  const videos = (videosQuery.data ?? []) as ShowcaseVideoItem[];

  const filteredImages = useMemo(() => {
    const q = imageSearch.trim().toLocaleLowerCase("tr-TR");
    return images.filter(item => {
      const active = asBool(item.isActive);
      if (imageFilter === "active" && !active) return false;
      if (imageFilter === "inactive" && active) return false;
      if (!q) return true;
      const haystack = `${item.title ?? ""} ${item.imageUrl}`.toLocaleLowerCase(
        "tr-TR"
      );
      return haystack.includes(q);
    });
  }, [imageFilter, imageSearch, images]);

  const filteredVideos = useMemo(() => {
    const q = videoSearch.trim().toLocaleLowerCase("tr-TR");
    return videos.filter(item => {
      const active = asBool(item.isActive);
      if (videoFilter === "active" && !active) return false;
      if (videoFilter === "inactive" && active) return false;
      if (!q) return true;
      const haystack = `${item.title ?? ""} ${item.videoUrl}`.toLocaleLowerCase(
        "tr-TR"
      );
      return haystack.includes(q);
    });
  }, [videoFilter, videoSearch, videos]);

  const saveLayout = async () => {
    const payload = JSON.stringify(draftConfig, null, 2);

    try {
      if (settingRow) {
        await updateSettingMutation.mutateAsync({
          key: WEB_UI_SETTING_KEY,
          value: payload,
        });
      } else {
        await createSettingMutation.mutateAsync({
          ...WEB_UI_SETTING_META,
          value: payload,
        });
      }

      await Promise.all([
        utils.adminPanel.getSiteSettings.invalidate(),
        utils.settings.getPublicSettings.invalidate(),
      ]);
      toast.success("Ana sayfa düzeni kaydedildi. Web tarafına yansıdı.");
    } catch (error: any) {
      toast.error(error?.message || "Ana sayfa düzeni kaydedilemedi.");
    }
  };

  const resetLayout = () => {
    setDraftConfig(prev => ({
      ...prev,
      home: {
        ...prev.home,
        sectionOrder: [...DEFAULT_WEB_UI_CONFIG.home.sectionOrder],
        sectionVisibility: { ...DEFAULT_WEB_UI_CONFIG.home.sectionVisibility },
      },
    }));
  };

  const reorderSections = (newOrder: HomeSectionId[]) => {
    setDraftConfig(prev => ({
      ...prev,
      home: {
        ...prev.home,
        sectionOrder: newOrder,
      },
    }));
  };

  const toggleSection = (sectionId: HomeSectionId, checked: boolean) => {
    setDraftConfig(prev => ({
      ...prev,
      home: {
        ...prev.home,
        sectionVisibility: {
          ...prev.home.sectionVisibility,
          [sectionId]: checked,
        },
      },
    }));
  };

  const startCreateImage = () => {
    setEditingImageId(null);
    setImageForm(emptyImageForm);
    setIsImageDialogOpen(true);
  };

  const startEditImage = (item: ShowcaseImageItem) => {
    setEditingImageId(item.id);
    setImageForm({
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl ?? "",
      title: item.title ?? "",
      aspectRatio: item.aspectRatio,
      order: item.order,
      isActive: asBool(item.isActive),
    });
    setIsImageDialogOpen(true);
  };

  const submitImage = async () => {
    if (!imageForm.imageUrl.trim()) {
      toast.error("Görsel URL zorunlu.");
      return;
    }

    const payload = {
      imageUrl: imageForm.imageUrl.trim(),
      thumbnailUrl: imageForm.thumbnailUrl.trim() || undefined,
      title: imageForm.title.trim() || undefined,
      aspectRatio: imageForm.aspectRatio,
      order: Number(imageForm.order) || 0,
      isActive: imageForm.isActive,
    };

    try {
      if (editingImageId) {
        await updateImageMutation.mutateAsync({
          id: editingImageId,
          ...payload,
        });
      } else {
        await createImageMutation.mutateAsync(payload);
      }
      await utils.adminPanel.getShowcaseImages.invalidate();
      toast.success("Görsel kaydedildi.");
      setIsImageDialogOpen(false);
      setImageForm(emptyImageForm);
      setEditingImageId(null);
    } catch (error: any) {
      toast.error(error?.message || "Görsel kaydedilemedi.");
    }
  };

  const toggleImageActive = async (item: ShowcaseImageItem) => {
    await updateImageMutation.mutateAsync({
      id: item.id,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl ?? undefined,
      title: item.title ?? undefined,
      aspectRatio: item.aspectRatio,
      order: item.order,
      isActive: !asBool(item.isActive),
    });
    await utils.adminPanel.getShowcaseImages.invalidate();
  };

  const removeImage = async (id: number) => {
    if (!confirm("Bu görseli silmek istiyor musun?")) return;
    await deleteImageMutation.mutateAsync({ id });
    await utils.adminPanel.getShowcaseImages.invalidate();
    toast.success("Görsel silindi.");
  };

  const startCreateVideo = () => {
    setEditingVideoId(null);
    setVideoForm(emptyVideoForm);
    setIsVideoDialogOpen(true);
  };

  const startEditVideo = (item: ShowcaseVideoItem) => {
    setEditingVideoId(item.id);
    setVideoForm({
      videoUrl: item.videoUrl,
      posterUrl: item.posterUrl ?? "",
      title: item.title ?? "",
      order: item.order,
      isActive: asBool(item.isActive),
    });
    setIsVideoDialogOpen(true);
  };

  const submitVideo = async () => {
    if (!videoForm.videoUrl.trim()) {
      toast.error("Video URL zorunlu.");
      return;
    }

    const payload = {
      videoUrl: videoForm.videoUrl.trim(),
      posterUrl: videoForm.posterUrl.trim() || undefined,
      title: videoForm.title.trim() || undefined,
      order: Number(videoForm.order) || 0,
      isActive: videoForm.isActive,
    };

    try {
      if (editingVideoId) {
        await updateVideoMutation.mutateAsync({
          id: editingVideoId,
          ...payload,
        });
      } else {
        await createVideoMutation.mutateAsync(payload);
      }
      await utils.adminPanel.getShowcaseVideos.invalidate();
      toast.success("Video kaydedildi.");
      setIsVideoDialogOpen(false);
      setVideoForm(emptyVideoForm);
      setEditingVideoId(null);
    } catch (error: any) {
      toast.error(error?.message || "Video kaydedilemedi.");
    }
  };

  const toggleVideoActive = async (item: ShowcaseVideoItem) => {
    await updateVideoMutation.mutateAsync({
      id: item.id,
      videoUrl: item.videoUrl,
      posterUrl: item.posterUrl ?? undefined,
      title: item.title ?? undefined,
      order: item.order,
      isActive: !asBool(item.isActive),
    });
    await utils.adminPanel.getShowcaseVideos.invalidate();
  };

  const removeVideo = async (id: number) => {
    if (!confirm("Bu videoyu silmek istiyor musun?")) return;
    await deleteVideoMutation.mutateAsync({ id });
    await utils.adminPanel.getShowcaseVideos.invalidate();
    toast.success("Video silindi.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Home className="h-5 w-5 text-[#00F5FF]" />
            Ana Sayfa Yönetimi
          </h2>
          <p className="text-sm text-zinc-500">
            Bölüm sırası/görünürlüğü ve showcase içeriklerini tek panelden yönet
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/20"
            onClick={() => navigate("/admin/web-control")}
          >
            Web Kontrol Merkezi
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50">
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Düzen
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="h-4 w-4 mr-2" />
            Görseller
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videolar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-4">
          <div className="rounded-xl border border-[#00F5FF]/25 bg-[#00F5FF]/5 p-4 text-sm text-[#A7FAFF]">
            Bu bölümde yaptığın değişiklikler `web_ui_config` üzerinden web ana
            sayfasına anında yansır.
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <div className="text-sm text-zinc-400">
              Bölümleri sürükleyip bırak, görünürlüklerini anında ayarla.
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/20"
                onClick={resetLayout}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Varsayılan Düzen
              </Button>
              <Button
                type="button"
                onClick={saveLayout}
                disabled={
                  !layoutDirty ||
                  updateSettingMutation.isPending ||
                  createSettingMutation.isPending
                }
                className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
              >
                {updateSettingMutation.isPending ||
                createSettingMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Düzeni Kaydet
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/50"
          >
            <Reorder.Group
              axis="y"
              values={draftConfig.home.sectionOrder}
              onReorder={reorderSections}
              className="divide-y divide-white/5"
            >
              {draftConfig.home.sectionOrder.map(sectionId => {
                const visible = draftConfig.home.sectionVisibility[sectionId];

                return (
                  <Reorder.Item
                    key={sectionId}
                    value={sectionId}
                    className="flex items-center gap-4 p-4 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-5 w-5 text-zinc-600" />
                    <div className="flex-1">
                      <p
                        className={`font-medium ${visible ? "" : "text-zinc-500"}`}
                      >
                        {SECTION_LABELS[sectionId]}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono">
                        {sectionId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          visible
                            ? "bg-green-500/15 text-green-400"
                            : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {visible ? "Görünür" : "Gizli"}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleSection(sectionId, !visible)}
                        className={visible ? "text-[#00F5FF]" : "text-zinc-500"}
                      >
                        {visible ? (
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
          </motion.div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative w-[320px] max-w-full">
                <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={imageSearch}
                  onChange={e => setImageSearch(e.target.value)}
                  placeholder="Görsel ara..."
                  className="pl-9 bg-zinc-800 border-white/10"
                />
              </div>
              <Select
                value={imageFilter}
                onValueChange={value => setImageFilter(value as ActiveFilter)}
              >
                <SelectTrigger className="w-[140px] bg-zinc-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={startCreateImage}
              className="bg-[#7C3AED] hover:bg-[#6A2FD2]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Görsel Ekle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredImages.map(item => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-zinc-900/50 p-3 space-y-3"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-950/50">
                  <img
                    src={item.thumbnailUrl || item.imageUrl}
                    alt={item.title || "showcase image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium truncate">
                    {item.title || "Başlıksız"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    #{item.order} - {item.aspectRatio}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Switch
                    checked={asBool(item.isActive)}
                    onCheckedChange={() => void toggleImageActive(item)}
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/20"
                      onClick={() => startEditImage(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-500/30 text-red-300"
                      onClick={() => void removeImage(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-8 text-center text-zinc-500">
              Filtreye uygun görsel yok.
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative w-[320px] max-w-full">
                <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={videoSearch}
                  onChange={e => setVideoSearch(e.target.value)}
                  placeholder="Video ara..."
                  className="pl-9 bg-zinc-800 border-white/10"
                />
              </div>
              <Select
                value={videoFilter}
                onValueChange={value => setVideoFilter(value as ActiveFilter)}
              >
                <SelectTrigger className="w-[140px] bg-zinc-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={startCreateVideo}
              className="bg-[#7C3AED] hover:bg-[#6A2FD2]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Video Ekle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVideos.map(item => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-zinc-900/50 p-3 space-y-3"
              >
                <div className="aspect-[9/16] rounded-lg overflow-hidden bg-zinc-950/50">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title || "video"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <Camera className="h-8 w-8 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium truncate">
                    {item.title || "Başlıksız"}
                  </p>
                  <p className="text-[11px] text-zinc-500">#{item.order}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Switch
                    checked={asBool(item.isActive)}
                    onCheckedChange={() => void toggleVideoActive(item)}
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/20"
                      onClick={() => startEditVideo(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-500/30 text-red-300"
                      onClick={() => void removeVideo(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-8 text-center text-zinc-500">
              Filtreye uygun video yok.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingImageId ? "Görseli Düzenle" : "Görsel Ekle"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Görsel URL *</Label>
              <Input
                value={imageForm.imageUrl}
                onChange={e =>
                  setImageForm(prev => ({ ...prev, imageUrl: e.target.value }))
                }
                className="bg-zinc-800 border-white/10"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                value={imageForm.thumbnailUrl}
                onChange={e =>
                  setImageForm(prev => ({
                    ...prev,
                    thumbnailUrl: e.target.value,
                  }))
                }
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input
                  value={imageForm.title}
                  onChange={e =>
                    setImageForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select
                  value={imageForm.aspectRatio}
                  onValueChange={value =>
                    setImageForm(prev => ({
                      ...prev,
                      aspectRatio: value as AspectRatio,
                    }))
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">square</SelectItem>
                    <SelectItem value="portrait">portrait</SelectItem>
                    <SelectItem value="landscape">landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={imageForm.order}
                  onChange={e =>
                    setImageForm(prev => ({
                      ...prev,
                      order: Number(e.target.value) || 0,
                    }))
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 flex items-center justify-between mt-7 md:mt-0">
                <span className="text-sm text-zinc-300">Aktif</span>
                <Switch
                  checked={imageForm.isActive}
                  onCheckedChange={checked =>
                    setImageForm(prev => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-white/20"
              onClick={() => setIsImageDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={submitImage}
              className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingVideoId ? "Videoyu Düzenle" : "Video Ekle"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Video URL *</Label>
              <Input
                value={videoForm.videoUrl}
                onChange={e =>
                  setVideoForm(prev => ({ ...prev, videoUrl: e.target.value }))
                }
                className="bg-zinc-800 border-white/10"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Poster URL</Label>
              <Input
                value={videoForm.posterUrl}
                onChange={e =>
                  setVideoForm(prev => ({ ...prev, posterUrl: e.target.value }))
                }
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input
                  value={videoForm.title}
                  onChange={e =>
                    setVideoForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={videoForm.order}
                  onChange={e =>
                    setVideoForm(prev => ({
                      ...prev,
                      order: Number(e.target.value) || 0,
                    }))
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-zinc-300">Aktif</span>
              <Switch
                checked={videoForm.isActive}
                onCheckedChange={checked =>
                  setVideoForm(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-white/20"
              onClick={() => setIsVideoDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={submitVideo}
              className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
