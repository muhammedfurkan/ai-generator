/**
 * Admin Homepage Layout - Ana Sayfa Düzeni ve Bölüm Yönetimi
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  Image,
  Video,
  Star,
} from "lucide-react";

interface Section {
  id: number;
  sectionKey: string;
  title: string;
  isVisible: boolean;
  order: number;
  config: string | null;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  hero: Sparkles,
  features: Zap,
  howItWorks: Settings,
  pricing: CreditCard,
  testimonials: MessageSquare,
  gallery: Image,
  faq: HelpCircle,
  cta: Star,
  partners: Users,
  stats: Star,
  videoShowcase: Video,
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
  const [sections, setSections] = useState<Section[]>([]);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const utils = trpc.useUtils();

  // Get sections from database
  const sectionsQuery = trpc.adminPanel.getHomepageSections.useQuery(undefined, {
    retry: false,
    onError: () => {
      // If no sections exist, use defaults
      const defaultSections = DEFAULT_SECTIONS.map((s, i) => ({
        id: i + 1,
        sectionKey: s.sectionKey,
        title: s.title,
        isVisible: true,
        order: s.order,
        config: null,
      }));
      setSections(defaultSections);
    },
  });

  const updateOrderMutation = trpc.adminPanel.updateHomepageSectionOrder.useMutation({
    onSuccess: () => {
      toast.success("Sıralama kaydedildi");
      setHasChanges(false);
      utils.adminPanel.getHomepageSections.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateSectionMutation = trpc.adminPanel.updateHomepageSection.useMutation({
    onSuccess: () => {
      toast.success("Bölüm güncellendi");
      utils.adminPanel.getHomepageSections.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const initSectionsMutation = trpc.adminPanel.initializeHomepageSections.useMutation({
    onSuccess: () => {
      toast.success("Varsayılan bölümler oluşturuldu");
      utils.adminPanel.getHomepageSections.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (sectionsQuery.data && sectionsQuery.data.length > 0) {
      setSections(sectionsQuery.data as Section[]);
    }
  }, [sectionsQuery.data]);

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
        sections: sections.map((s) => ({ id: s.id, order: s.order })),
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
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleInitializeSections = () => {
    initSectionsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layout className="h-5 w-5 text-purple-400" />
            Ana Sayfa Düzeni
          </h2>
          <p className="text-sm text-zinc-500">
            Ana sayfa bölümlerinin sıralamasını ve görünürlüğünü yönetin
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              onClick={handleSaveOrder}
              disabled={isSaving}
              className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Sıralamayı Kaydet
            </Button>
          )}
          <Button variant="outline" onClick={handleInitializeSections}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Varsayılanları Yükle
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Home className="h-5 w-5 text-purple-400 mt-0.5" />
          <div>
            <p className="text-sm text-purple-300">
              Bölümleri sürükleyip bırakarak sıralayın. Göz ikonuna tıklayarak görünürlüğü değiştirin.
            </p>
            <p className="text-xs text-purple-400 mt-1">
              Değişiklikler kaydedildikten sonra ana sayfada yansıyacaktır.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sections List */}
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
          <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="divide-y divide-white/5">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.sectionKey] || Settings;
              return (
                <Reorder.Item
                  key={section.id}
                  value={section}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5 text-zinc-600" />
                  <div className={`p-2 rounded-lg ${section.isVisible ? "bg-lime-500/20" : "bg-zinc-800"}`}>
                    <Icon className={`h-5 w-5 ${section.isVisible ? "text-lime-400" : "text-zinc-500"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${section.isVisible ? "" : "text-zinc-500"}`}>
                      {section.title}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">{section.sectionKey}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${section.isVisible
                        ? "bg-green-500/20 text-green-400"
                        : "bg-zinc-700 text-zinc-400"
                      }`}>
                      {section.isVisible ? "Görünür" : "Gizli"}
                    </span>
                    <span className="text-xs text-zinc-500 w-8 text-center">#{section.order}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleVisibility(section)}
                      className={section.isVisible ? "text-lime-400" : "text-zinc-500"}
                    >
                      {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </motion.div>

      {/* Preview Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-semibold mb-4">Bölüm Açıklamaları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {DEFAULT_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.sectionKey] || Settings;
            return (
              <div key={section.sectionKey} className="p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-lime-400" />
                  <span className="font-medium">{section.title}</span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">{section.sectionKey}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
