/**
 * Admin Settings - Site Ayarları (Tam Entegrasyon)
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  Save,
  Globe,
  Mail,
  Bell,
  Shield,
  Wrench,
  Users,
  Palette,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function AdminSettings() {
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [editedValues, setEditedValues] = useState<
    Record<string, string | null>
  >({});
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({
    category: activeCategory,
  });
  const utils = trpc.useUtils();

  const updateMutation = trpc.adminPanel.updateSiteSetting.useMutation({
    onSuccess: () => {
      toast.success("Ayar güncellendi");
      settingsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const createMutation = trpc.adminPanel.createSiteSetting.useMutation({
    onSuccess: () => {
      toast.success("Yeni ayar oluşturuldu");
      setIsAddingOpen(false);
      settingsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const categories = [
    {
      id: "general",
      label: "Genel",
      icon: Settings,
      description: "Site adı, logo ve temel ayarlar",
    },
    {
      id: "seo",
      label: "SEO",
      icon: Globe,
      description: "Arama motoru optimizasyonu",
    },
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
      description: "E-posta ayarları ve SMTP",
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
      description: "Güvenlik ayarları",
    },
    {
      id: "maintenance",
      label: "Bakım",
      icon: Wrench,
      description: "Bakım modu ve uyarılar",
    },
  ];

  const handleSave = (key: string) => {
    if (editedValues[key] === undefined) return;
    updateMutation.mutate({
      key,
      value: editedValues[key],
    });
    setEditedValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  };

  const handleSaveAll = () => {
    Object.keys(editedValues).forEach(key => {
      updateMutation.mutate({ key, value: editedValues[key] });
    });
    setEditedValues({});
  };

  const renderInput = (setting: any) => {
    const value =
      editedValues[setting.key] !== undefined
        ? editedValues[setting.key]
        : setting.value;
    const hasChanges = editedValues[setting.key] !== undefined;

    switch (setting.inputType) {
      case "boolean":
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={value === "true" || value === true}
              onCheckedChange={checked =>
                setEditedValues({
                  ...editedValues,
                  [setting.key]: checked ? "true" : "false",
                })
              }
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
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
              value={value || ""}
              onChange={e =>
                setEditedValues({
                  ...editedValues,
                  [setting.key]: e.target.value,
                })
              }
              className="bg-zinc-800 border-white/10 font-mono text-sm"
              rows={4}
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
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
              value={value || ""}
              onChange={e =>
                setEditedValues({
                  ...editedValues,
                  [setting.key]: e.target.value,
                })
              }
              className="bg-zinc-800 border-white/10 max-w-xs"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                Kaydet
              </Button>
            )}
          </div>
        );
      case "url":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="url"
              value={value || ""}
              onChange={e =>
                setEditedValues({
                  ...editedValues,
                  [setting.key]: e.target.value,
                })
              }
              className="bg-zinc-800 border-white/10"
              placeholder="https://"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                Kaydet
              </Button>
            )}
          </div>
        );
      case "email":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={value || ""}
              onChange={e =>
                setEditedValues({
                  ...editedValues,
                  [setting.key]: e.target.value,
                })
              }
              className="bg-zinc-800 border-white/10"
              placeholder="ornek@domain.com"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
                className="bg-[#00F5FF] text-black hover:bg-[#00F5FF]"
              >
                Kaydet
              </Button>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              value={value || ""}
              onChange={e =>
                setEditedValues({
                  ...editedValues,
                  [setting.key]: e.target.value,
                })
              }
              className="bg-zinc-800 border-white/10"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Site Ayarları</h2>
          <p className="text-sm text-zinc-500">Tüm site ayarlarını yönetin</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(editedValues).length > 0 && (
            <Button
              onClick={handleSaveAll}
              className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
            >
              <Save className="h-4 w-4" />
              Tümünü Kaydet ({Object.keys(editedValues).length})
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsAddingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ayar
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
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

      {/* Category Description */}
      {currentCategory && (
        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/10">
          <currentCategory.icon className="h-5 w-5 text-[#00F5FF]" />
          <div>
            <p className="font-medium">{currentCategory.label}</p>
            <p className="text-sm text-zinc-500">
              {currentCategory.description}
            </p>
          </div>
        </div>
      )}

      {/* Settings List */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10"
      >
        {settingsQuery.isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-zinc-600 animate-spin" />
            <p className="text-zinc-500">Yükleniyor...</p>
          </div>
        ) : settingsQuery.data?.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500 mb-4">Bu kategoride ayar bulunamadı</p>
            <Button variant="outline" onClick={() => setIsAddingOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ayar Ekle
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {settingsQuery.data?.map(setting => (
              <div
                key={setting.id}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="lg:w-1/3">
                    <p className="font-medium">{setting.label}</p>
                    {setting.description && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {setting.description}
                      </p>
                    )}
                    <p className="text-xs text-zinc-600 font-mono mt-1">
                      {setting.key}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          setting.inputType === "boolean"
                            ? "bg-[#7C3AED]/20 text-[#7C3AED]"
                            : setting.inputType === "textarea"
                              ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                              : setting.inputType === "number"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-zinc-500/20 text-zinc-400"
                        }`}
                      >
                        {setting.inputType}
                      </span>
                      {setting.isPublic && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="lg:flex-1">{renderInput(setting)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Setting Dialog */}
      <Dialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Yeni Ayar Ekle</DialogTitle>
          </DialogHeader>
          <AddSettingForm
            category={activeCategory}
            onSubmit={data => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add Setting Form
function AddSettingForm({
  category,
  onSubmit,
  isPending,
}: {
  category: string;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    category: category as any,
    label: "",
    description: "",
    inputType: "text" as any,
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
            placeholder="site_name"
            className="bg-zinc-800 border-white/10 font-mono"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Etiket *</label>
          <Input
            value={formData.label}
            onChange={e => setFormData({ ...formData, label: e.target.value })}
            placeholder="Site Adı"
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
          placeholder="Bu ayarın ne işe yaradığını açıklayın"
          className="bg-zinc-800 border-white/10"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Giriş Tipi</label>
          <Select
            value={formData.inputType}
            onValueChange={(v: any) =>
              setFormData({ ...formData, inputType: v })
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
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Kategori</label>
          <Select
            value={formData.category}
            onValueChange={(v: any) =>
              setFormData({ ...formData, category: v })
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
          placeholder="Değer girilmezse boş kalır"
          className="bg-zinc-800 border-white/10"
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
        <div>
          <p className="font-medium text-sm">Herkese Açık</p>
          <p className="text-xs text-zinc-500">Frontend'den erişilebilir</p>
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
          onClick={() => onSubmit(formData)}
          disabled={isPending || !formData.key || !formData.label}
          className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black"
        >
          {isPending ? "Ekleniyor..." : "Ayar Ekle"}
        </Button>
      </DialogFooter>
    </div>
  );
}
