import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
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
import {
  MODULE_SHORTCUTS,
  SITE_SETTING_TEMPLATES,
  type SiteInputType,
  type SiteSettingCategory,
} from "@/lib/siteSettingTemplates";
import {
  AlertCircle,
  Bell,
  ExternalLink,
  Globe,
  ImageIcon,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Sparkles,
  Upload,
  Users,
  Wrench,
  X,
} from "lucide-react";

interface SiteSettingRow {
  id: number;
  key: string;
  value: string | null;
  category: SiteSettingCategory;
  label: string;
  description: string | null;
  inputType: SiteInputType;
  isPublic: number | boolean;
}

type CategoryFilter = "all" | SiteSettingCategory;

const inputTone = (inputType: SiteInputType) => {
  if (inputType === "boolean") return "bg-[#7C3AED]/20 text-[#7C3AED]";
  if (inputType === "textarea" || inputType === "json") {
    return "bg-[#00F5FF]/20 text-[#00F5FF]";
  }
  if (inputType === "number") return "bg-orange-500/20 text-orange-400";
  return "bg-zinc-500/20 text-zinc-400";
};

const priorityTone: Record<"critical" | "high" | "normal", string> = {
  critical: "bg-red-500/20 text-red-300",
  high: "bg-amber-500/20 text-amber-300",
  normal: "bg-zinc-600/30 text-zinc-300",
};

const priorityLabel: Record<"critical" | "high" | "normal", string> = {
  critical: "Kritik",
  high: "Yüksek",
  normal: "Normal",
};

const parseBool = (value: string | null | undefined) =>
  String(value ?? "")
    .toLowerCase()
    .trim() === "true";

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditedOnly, setShowEditedOnly] = useState(false);
  const [editedValues, setEditedValues] = useState<
    Record<string, string | null>
  >({});
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<"template" | "advanced">("template");

  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({});
  const utils = trpc.useUtils();

  const updateMutation = trpc.adminPanel.updateSiteSetting.useMutation();
  const createMutation = trpc.adminPanel.createSiteSetting.useMutation();

  const categories: Array<{
    id: CategoryFilter;
    label: string;
    icon: typeof Settings;
    description: string;
  }> = [
    {
      id: "all",
      label: "Tümü",
      icon: Settings,
      description: "Tüm ayarları tek listede yönet",
    },
    {
      id: "general",
      label: "Genel",
      icon: Settings,
      description: "Site adı, logo ve temel ayarlar",
    },
    { id: "seo", label: "SEO", icon: Globe, description: "SEO ayarları" },
    {
      id: "contact",
      label: "İletişim",
      icon: Mail,
      description: "İletişim bilgileri",
    },
    {
      id: "social",
      label: "Sosyal Medya",
      icon: Users,
      description: "Sosyal medya linkleri",
    },
    {
      id: "email",
      label: "E-posta",
      icon: Mail,
      description: "SMTP ve e-posta ayarları",
    },
    {
      id: "notification",
      label: "Bildirimler",
      icon: Bell,
      description: "Bildirim tercihleri",
    },
    {
      id: "security",
      label: "Güvenlik",
      icon: Shield,
      description: "Kayıt ve güvenlik kontrolleri",
    },
    {
      id: "maintenance",
      label: "Bakım",
      icon: Wrench,
      description: "Bakım modu ve mesajları",
    },
  ];

  const templateMap = useMemo(
    () =>
      new Map(SITE_SETTING_TEMPLATES.map(template => [template.key, template])),
    []
  );

  const existingKeys = useMemo(
    () => new Set((settingsQuery.data ?? []).map(setting => setting.key)),
    [settingsQuery.data]
  );

  const missingTemplates = useMemo(
    () =>
      SITE_SETTING_TEMPLATES.filter(
        template => !existingKeys.has(template.key)
      ),
    [existingKeys]
  );

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const [templateValue, setTemplateValue] = useState<string>("");

  useEffect(() => {
    if (!isAddingOpen) return;

    const firstTemplate = missingTemplates[0];
    if (firstTemplate) {
      setSelectedTemplateKey(firstTemplate.key);
      setTemplateValue(firstTemplate.defaultValue);
    } else {
      setSelectedTemplateKey("");
      setTemplateValue("");
    }
  }, [isAddingOpen, missingTemplates]);

  const selectedTemplate = useMemo(
    () =>
      missingTemplates.find(item => item.key === selectedTemplateKey) ?? null,
    [missingTemplates, selectedTemplateKey]
  );

  const refreshSettings = async () => {
    await Promise.all([
      utils.adminPanel.getSiteSettings.invalidate(),
      utils.settings.getPublicSettings.invalidate(),
    ]);
  };

  const handleSave = async (key: string) => {
    if (editedValues[key] === undefined) return;

    try {
      await updateMutation.mutateAsync({ key, value: editedValues[key] });
      setEditedValues(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await refreshSettings();
      toast.success("Ayar güncellendi");
    } catch (error: any) {
      toast.error(error?.message || "Ayar güncellenemedi");
    }
  };

  const handleSaveAll = async () => {
    const keys = Object.keys(editedValues);
    if (keys.length === 0) return;

    try {
      for (const key of keys) {
        await updateMutation.mutateAsync({ key, value: editedValues[key] });
      }
      setEditedValues({});
      await refreshSettings();
      toast.success(`${keys.length} ayar kaydedildi`);
    } catch (error: any) {
      toast.error(error?.message || "Toplu kayıt başarısız");
    }
  };

  const handleDiscard = (key: string) => {
    setEditedValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleDiscardAll = () => {
    setEditedValues({});
  };

  const handleTemplateCreate = async () => {
    if (!selectedTemplate) return;

    try {
      await createMutation.mutateAsync({
        key: selectedTemplate.key,
        value: templateValue,
        category: selectedTemplate.category,
        label: selectedTemplate.label,
        description: selectedTemplate.description,
        inputType: selectedTemplate.inputType,
        isPublic: selectedTemplate.isPublic,
      });
      await refreshSettings();
      setIsAddingOpen(false);
      toast.success("Şablon ayarı eklendi");
    } catch (error: any) {
      toast.error(error?.message || "Ayar eklenemedi");
    }
  };

  const renderInput = (setting: SiteSettingRow) => {
    const value =
      editedValues[setting.key] !== undefined
        ? editedValues[setting.key]
        : setting.value;
    const hasChanges = editedValues[setting.key] !== undefined;

    const setValue = (nextValue: string) =>
      setEditedValues(prev => ({ ...prev, [setting.key]: nextValue }));

    switch (setting.inputType) {
      case "image":
        return (
          <ImageUploadInput
            value={value}
            isUploading={uploadingKey === setting.key}
            hasChanges={hasChanges}
            onUploadStart={() => setUploadingKey(setting.key)}
            onUploadEnd={() => setUploadingKey(null)}
            onChange={setValue}
            onSave={() => void handleSave(setting.key)}
          />
        );
      case "boolean":
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={parseBool(value)}
              onCheckedChange={checked => setValue(checked ? "true" : "false")}
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => void handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                Kaydet
              </Button>
            )}
          </div>
        );
      case "textarea":
      case "json":
        return (
          <div className="space-y-2">
            <Textarea
              value={value ?? ""}
              onChange={e => setValue(e.target.value)}
              className="bg-zinc-800 border-white/10 font-mono text-sm"
              rows={4}
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => void handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
            )}
          </div>
        );
      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value ?? ""}
              onChange={e => setValue(e.target.value)}
              className="bg-zinc-800 border-white/10 max-w-xs"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => void handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                Kaydet
              </Button>
            )}
          </div>
        );
      case "url":
      case "email":
      case "text":
      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              type={setting.inputType === "email" ? "email" : "text"}
              value={value ?? ""}
              onChange={e => setValue(e.target.value)}
              className="bg-zinc-800 border-white/10"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => void handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                Kaydet
              </Button>
            )}
          </div>
        );
    }
  };

  const currentCategory = categories.find(c => c.id === activeCategory);

  const filteredSettings = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase("tr-TR");

    return ((settingsQuery.data ?? []) as SiteSettingRow[]).filter(setting => {
      if (activeCategory !== "all" && setting.category !== activeCategory) {
        return false;
      }

      if (showEditedOnly && editedValues[setting.key] === undefined) {
        return false;
      }

      if (!normalizedSearch) return true;

      const template = templateMap.get(setting.key);
      const impactText = template?.affectedAreas.join(" ") ?? "";
      const pageText = template?.affectedPages.join(" ") ?? "";
      const verifyText = template?.verification.join(" ") ?? "";
      const moduleText = template?.module.label ?? "";

      const haystack = [
        setting.key,
        setting.label,
        setting.description ?? "",
        setting.category,
        impactText,
        pageText,
        verifyText,
        moduleText,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(normalizedSearch);
    });
  }, [
    activeCategory,
    editedValues,
    searchQuery,
    settingsQuery.data,
    showEditedOnly,
    templateMap,
  ]);

  const renderTemplateValueInput = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate.inputType) {
      case "boolean":
        return (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-800 px-3 py-2">
            <span className="text-sm text-zinc-300">Varsayılan Değer</span>
            <Switch
              checked={parseBool(templateValue)}
              onCheckedChange={checked =>
                setTemplateValue(checked ? "true" : "false")
              }
            />
          </div>
        );
      case "textarea":
      case "json":
        return (
          <Textarea
            value={templateValue}
            onChange={e => setTemplateValue(e.target.value)}
            rows={4}
            className="bg-zinc-800 border-white/10"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={templateValue}
            onChange={e => setTemplateValue(e.target.value)}
            className="bg-zinc-800 border-white/10"
          />
        );
      case "image":
      case "url":
      case "email":
      case "text":
      default:
        return (
          <Input
            value={templateValue}
            onChange={e => setTemplateValue(e.target.value)}
            className="bg-zinc-800 border-white/10"
          />
        );
    }
  };

  const isSavingAny = updateMutation.isPending || createMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <p className="text-sm text-yellow-200">
          Site Ayarları artık rehberli çalışır: yeni ayar eklerken şablon seçip
          ayarın hangi modülü etkilediğini görürsün. Serbest key ekleme sadece
          gelişmiş modda tutulur.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Site Ayarları</h2>
          <p className="text-sm text-zinc-500">
            Etki alanı görünür, rehberli ayar ekleme ve toplu kayıt
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(editedValues).length > 0 && (
            <Button
              onClick={() => void handleSaveAll()}
              className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
              disabled={isSavingAny}
            >
              <Save className="h-4 w-4" />
              Tümünü Kaydet ({Object.keys(editedValues).length})
            </Button>
          )}
          {Object.keys(editedValues).length > 0 && (
            <Button
              variant="outline"
              className="border-white/20"
              onClick={handleDiscardAll}
            >
              Değişiklikleri Geri Al
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setIsAddingOpen(true)}
            className="border-[#00F5FF]/40 text-[#00F5FF]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Şablondan Ayar Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {MODULE_SHORTCUTS.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="rounded-xl border border-white/10 bg-zinc-900/50 p-3 text-left hover:border-[#00F5FF]/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm">{item.label}</p>
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeCategory === cat.id
                  ? "bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/30"
                  : "bg-zinc-900 text-zinc-400 border border-white/10 hover:border-white/20"
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {currentCategory && (
        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/10">
          {(() => {
            const Icon = currentCategory.icon;
            return <Icon className="h-5 w-5 text-[#00F5FF]" />;
          })()}
          <div>
            <p className="font-medium">{currentCategory.label}</p>
            <p className="text-sm text-zinc-500">
              {currentCategory.description}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Ayar anahtarı, etki alanı veya açıklama ile ara..."
            className="pl-9 bg-zinc-900 border-white/10"
          />
        </div>
        <Button
          type="button"
          variant={showEditedOnly ? "default" : "outline"}
          className={
            showEditedOnly
              ? "bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              : "border-white/20"
          }
          onClick={() => setShowEditedOnly(prev => !prev)}
        >
          Sadece Değişenler
        </Button>
      </div>

      <motion.div
        key={`${activeCategory}-${showEditedOnly}-${searchQuery}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10"
      >
        {settingsQuery.isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-zinc-600 animate-spin" />
            <p className="text-zinc-500">Yükleniyor...</p>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500 mb-4">Filtreye uygun ayar bulunamadı</p>
            <Button variant="outline" onClick={() => setIsAddingOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Şablondan Ayar Ekle
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredSettings.map(setting => {
              const template = templateMap.get(setting.key);

              return (
                <div
                  key={setting.id}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="lg:w-[38%]">
                      <p className="font-medium">{setting.label}</p>
                      {setting.description && (
                        <p className="text-xs text-zinc-500 mt-1">
                          {setting.description}
                        </p>
                      )}
                      <p className="text-xs text-zinc-600 font-mono mt-1">
                        {setting.key}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${inputTone(setting.inputType)}`}
                        >
                          {setting.inputType}
                        </span>
                        {setting.isPublic && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                            Public
                          </span>
                        )}
                        {editedValues[setting.key] !== undefined && (
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                            Değişti
                          </span>
                        )}
                      </div>

                      {template ? (
                        <>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {template.affectedAreas.map(impact => (
                              <span
                                key={`${setting.key}-${impact}`}
                                className="text-[11px] px-2 py-1 rounded bg-[#00F5FF]/10 text-[#9AF7FF]"
                              >
                                {impact}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span
                              className={`text-[11px] px-2 py-1 rounded ${priorityTone[template.priority]}`}
                            >
                              Öncelik: {priorityLabel[template.priority]}
                            </span>
                            {template.affectedPages.slice(0, 2).map(page => (
                              <span
                                key={`${setting.key}-${page}`}
                                className="text-[11px] px-2 py-1 rounded bg-zinc-700/50 text-zinc-200"
                              >
                                {page}
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-[11px] text-zinc-400">
                            Kontrol: {template.verification[0]}
                          </p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            Rollback: {template.rollback}
                          </p>
                          <button
                            onClick={() => navigate(template.module.path)}
                            className="mt-3 text-xs text-[#00F5FF] hover:text-[#9AF7FF] inline-flex items-center gap-1"
                          >
                            {template.module.label}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <p className="text-[11px] text-zinc-500 mt-3">
                          Bu ayar özel/legacy olabilir. Etki alanı tanımı yok.
                        </p>
                      )}
                    </div>

                    <div className="lg:flex-1 space-y-2">
                      {renderInput(setting)}
                      {editedValues[setting.key] !== undefined && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-zinc-200"
                          onClick={() => handleDiscard(setting.key)}
                        >
                          Bu Alanı Geri Al
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <Dialog
        open={isAddingOpen}
        onOpenChange={open => {
          setIsAddingOpen(open);
          if (!open) {
            setAddMode("template");
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Yeni Ayar Ekle</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant={addMode === "template" ? "default" : "outline"}
              className={
                addMode === "template"
                  ? "bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
                  : "border-white/20"
              }
              onClick={() => setAddMode("template")}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Şablonlu Ekle (Önerilen)
            </Button>
            <Button
              type="button"
              variant={addMode === "advanced" ? "default" : "outline"}
              className={
                addMode === "advanced"
                  ? "bg-amber-500 text-black"
                  : "border-white/20"
              }
              onClick={() => setAddMode("advanced")}
            >
              Gelişmiş (Özel Key)
            </Button>
          </div>

          {addMode === "template" ? (
            <div className="space-y-4 mt-4">
              {missingTemplates.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-zinc-800/50 p-4 text-sm text-zinc-400">
                  Tüm önerilen ayar şablonları zaten mevcut.
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Ayar Şablonu
                    </label>
                    <Select
                      value={selectedTemplateKey}
                      onValueChange={value => {
                        setSelectedTemplateKey(value);
                        const template = missingTemplates.find(
                          item => item.key === value
                        );
                        setTemplateValue(template?.defaultValue ?? "");
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 border-white/10">
                        <SelectValue placeholder="Şablon seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {missingTemplates.map(template => (
                          <SelectItem key={template.key} value={template.key}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <>
                      <div className="rounded-lg border border-white/10 bg-zinc-800/50 p-3 space-y-1.5">
                        <p className="text-sm font-medium">
                          {selectedTemplate.label}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {selectedTemplate.description}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                          {selectedTemplate.key}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedTemplate.affectedAreas.map(impact => (
                            <span
                              key={`${selectedTemplate.key}-${impact}`}
                              className="text-[11px] px-2 py-0.5 rounded bg-[#00F5FF]/15 text-[#9AF7FF]"
                            >
                              {impact}
                            </span>
                          ))}
                        </div>
                        <div
                          className={`text-[11px] px-2 py-1 rounded inline-flex w-fit ${priorityTone[selectedTemplate.priority]}`}
                        >
                          Öncelik: {priorityLabel[selectedTemplate.priority]}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Etkilenen Sayfalar:{" "}
                          {selectedTemplate.affectedPages.join(", ")}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Doğrulama: {selectedTemplate.verification.join(" / ")}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Rollback: {selectedTemplate.rollback}
                        </div>
                        <button
                          onClick={() => navigate(selectedTemplate.module.path)}
                          className="text-xs text-[#00F5FF] inline-flex items-center gap-1 pt-1"
                        >
                          {selectedTemplate.module.label}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">
                          Değer
                        </label>
                        {renderTemplateValueInput()}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 mt-4">
                Bu mod, etki alanı tanımlanmamış özel ayarlar içindir. Önce
                şablonlu eklemeyi tercih et.
              </div>
              <AddAdvancedSettingForm
                category={activeCategory === "all" ? "general" : activeCategory}
                onSubmit={async data => {
                  await createMutation.mutateAsync(data);
                  await refreshSettings();
                  setIsAddingOpen(false);
                  toast.success("Özel ayar oluşturuldu");
                }}
                isPending={createMutation.isPending}
              />
            </>
          )}

          {addMode === "template" && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-white/20"
                onClick={() => setIsAddingOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={() => void handleTemplateCreate()}
                disabled={!selectedTemplate || createMutation.isPending}
                className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
              >
                {createMutation.isPending ? "Ekleniyor..." : "Şablondan Ekle"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ImageUploadInput({
  value,
  isUploading,
  hasChanges,
  onUploadStart,
  onUploadEnd,
  onChange,
  onSave,
}: {
  value: string | null;
  isUploading: boolean;
  hasChanges: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onChange: (url: string) => void;
  onSave: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/x-icon",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Geçersiz dosya türü. PNG, JPG, GIF, WebP, SVG veya ICO yükleyin."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dosya boyutu 2MB'ı geçemez.");
      return;
    }

    onUploadStart();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Yükleme başarısız");
      }

      const data = (await response.json()) as { url: string };
      onChange(data.url);
      toast.success("Görsel yüklendi, kaydetmeyi unutmayın.");
    } catch (error: any) {
      toast.error(error?.message || "Görsel yüklenirken hata oluştu.");
    } finally {
      onUploadEnd();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-flex items-center gap-3 p-3 bg-zinc-800 rounded-xl border border-white/10">
          <img
            src={value}
            alt="Önizleme"
            className="h-12 w-auto max-w-[200px] object-contain rounded"
            onError={e => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-zinc-400 font-mono truncate max-w-[180px]">
              {value}
            </p>
            <button
              onClick={() => onChange("")}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              Temizle
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-xl border border-white/10 border-dashed">
          <ImageIcon className="h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">Henüz görsel seçilmedi</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/x-icon"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="border-white/20 hover:border-white/40 gap-2"
        >
          {isUploading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Yükleniyor..." : "Dosya Yükle"}
        </Button>

        <Input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="bg-zinc-800 border-white/10 text-sm max-w-xs"
          placeholder="veya URL girin (https://...)"
        />

        {hasChanges && (
          <Button
            size="sm"
            onClick={onSave}
            className="bg-[#00F5FF] text-black hover:bg-[#00F5FF] gap-1"
          >
            <Save className="h-4 w-4" />
            Kaydet
          </Button>
        )}
      </div>
    </div>
  );
}

function AddAdvancedSettingForm({
  category,
  onSubmit,
  isPending,
}: {
  category: SiteSettingCategory;
  onSubmit: (data: {
    key: string;
    value: string;
    category: SiteSettingCategory;
    label: string;
    description: string;
    inputType: SiteInputType;
    isPublic: boolean;
  }) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    category: category || "general",
    label: "",
    description: "",
    inputType: "text" as SiteInputType,
    isPublic: false,
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">
            Ayar Anahtarı *
          </label>
          <Input
            value={formData.key}
            onChange={e => setFormData({ ...formData, key: e.target.value })}
            placeholder="custom_setting_key"
            className="bg-zinc-800 border-white/10 font-mono"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Etiket *</label>
          <Input
            value={formData.label}
            onChange={e => setFormData({ ...formData, label: e.target.value })}
            placeholder="Custom Setting"
            className="bg-zinc-800 border-white/10"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Açıklama</label>
        <Input
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Bu ayarın etkilediği alanları yazın"
          className="bg-zinc-800 border-white/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Giriş Tipi</label>
          <Select
            value={formData.inputType}
            onValueChange={value =>
              setFormData({ ...formData, inputType: value as SiteInputType })
            }
          >
            <SelectTrigger className="bg-zinc-800 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Metin</SelectItem>
              <SelectItem value="textarea">Uzun Metin</SelectItem>
              <SelectItem value="number">Sayı</SelectItem>
              <SelectItem value="boolean">Açık/Kapalı</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="email">E-posta</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="image">Görsel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Kategori</label>
          <Select
            value={formData.category}
            onValueChange={value =>
              setFormData({
                ...formData,
                category: value as SiteSettingCategory,
              })
            }
          >
            <SelectTrigger className="bg-zinc-800 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Genel</SelectItem>
              <SelectItem value="seo">SEO</SelectItem>
              <SelectItem value="contact">İletişim</SelectItem>
              <SelectItem value="social">Sosyal Medya</SelectItem>
              <SelectItem value="email">E-posta</SelectItem>
              <SelectItem value="notification">Bildirimler</SelectItem>
              <SelectItem value="security">Güvenlik</SelectItem>
              <SelectItem value="maintenance">Bakım</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">
          Varsayılan Değer
        </label>
        <Input
          value={formData.value}
          onChange={e => setFormData({ ...formData, value: e.target.value })}
          className="bg-zinc-800 border-white/10"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
        <div>
          <p className="font-medium text-sm">Herkese Açık</p>
          <p className="text-xs text-zinc-500">
            Frontend tarafında da okunabilir
          </p>
        </div>
        <Switch
          checked={formData.isPublic}
          onCheckedChange={checked =>
            setFormData({ ...formData, isPublic: checked })
          }
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={() => onSubmit(formData)}
          disabled={isPending || !formData.key.trim() || !formData.label.trim()}
          className="bg-amber-500 hover:bg-amber-500 text-black"
        >
          {isPending ? "Ekleniyor..." : "Özel Ayar Ekle"}
        </Button>
      </DialogFooter>
    </div>
  );
}
