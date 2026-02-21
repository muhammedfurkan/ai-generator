import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Globe,
  Image as ImageIcon,
  Loader2,
  Palette,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

type SiteSettingCategory =
  | "general"
  | "seo"
  | "contact"
  | "social"
  | "email"
  | "notification"
  | "security"
  | "maintenance";

type SiteSettingInputType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "url"
  | "email"
  | "json"
  | "image";

interface BrandingSetting {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  inputType: SiteSettingInputType;
  category: SiteSettingCategory;
  isPublic: boolean;
  defaultValue: string;
  accept?: string;
}

const BRANDING_SETTINGS: BrandingSetting[] = [
  {
    key: "site_logo_url",
    label: "Site Logosu",
    description: "Header'da görünen ana logo.",
    placeholder: "https://... veya /uploads/...",
    inputType: "image",
    category: "general",
    isPublic: true,
    defaultValue: "/Logo-01.png",
    accept: "image/png,image/jpeg,image/webp,image/svg+xml",
  },
  {
    key: "site_favicon_url",
    label: "Favicon",
    description: "Tarayıcı sekmesindeki ikon.",
    placeholder: "https://... veya /uploads/...",
    inputType: "image",
    category: "general",
    isPublic: true,
    defaultValue: "/Logo-02.png",
    accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon",
  },
  {
    key: "site_name",
    label: "Site Adı",
    description: "Başlık ve marka metinlerinde kullanılacak isim.",
    placeholder: "Lumiohan",
    inputType: "text",
    category: "general",
    isPublic: true,
    defaultValue: "Lumiohan",
  },
  {
    key: "site_tagline",
    label: "Site Sloganı",
    description: "Kısa marka açıklaması.",
    placeholder: "AI üretim stüdyosu",
    inputType: "text",
    category: "general",
    isPublic: true,
    defaultValue: "",
  },
  {
    key: "site_description",
    label: "Site Açıklaması",
    description: "SEO ve tanıtım metinleri için uzun açıklama.",
    placeholder: "Platform hakkında kısa açıklama",
    inputType: "textarea",
    category: "seo",
    isPublic: true,
    defaultValue: "",
  },
];

const IMAGE_KEYS = new Set(["site_logo_url", "site_favicon_url"]);

export default function AdminBranding() {
  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({});
  const updateMutation = trpc.adminPanel.updateSiteSetting.useMutation();
  const createMutation = trpc.adminPanel.createSiteSetting.useMutation();
  const utils = trpc.useUtils();

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  type SiteSettingRow = NonNullable<typeof settingsQuery.data>[number];

  const fileInputRefs = {
    site_logo_url: useRef<HTMLInputElement>(null),
    site_favicon_url: useRef<HTMLInputElement>(null),
  };

  const settingsMap = useMemo(() => {
    const map = new Map<string, SiteSettingRow>();
    for (const row of settingsQuery.data ?? []) {
      map.set(row.key, row);
    }
    return map;
  }, [settingsQuery.data]);

  const getBaseValue = (setting: BrandingSetting) => {
    const value = settingsMap.get(setting.key)?.value;
    if (typeof value === "string") return value;
    return setting.defaultValue;
  };

  const getCurrentValue = (setting: BrandingSetting) =>
    drafts[setting.key] ?? getBaseValue(setting);

  const isChanged = (setting: BrandingSetting) =>
    drafts[setting.key] !== undefined &&
    drafts[setting.key] !== getBaseValue(setting);

  const changedSettings = BRANDING_SETTINGS.filter(isChanged);

  const refreshAllSettings = async () => {
    await Promise.all([
      utils.adminPanel.getSiteSettings.invalidate(),
      utils.settings.getPublicSettings.invalidate(),
    ]);
  };

  const upsertSetting = async (setting: BrandingSetting, value: string) => {
    const existing = settingsMap.get(setting.key);

    if (existing) {
      await updateMutation.mutateAsync({ key: setting.key, value });
      return;
    }

    await createMutation.mutateAsync({
      key: setting.key,
      value,
      category: setting.category,
      label: setting.label,
      description: setting.description,
      inputType: setting.inputType,
      isPublic: setting.isPublic,
    });
  };

  const handleSave = async (setting: BrandingSetting) => {
    try {
      await upsertSetting(setting, getCurrentValue(setting));
      setDrafts(prev => {
        const next = { ...prev };
        delete next[setting.key];
        return next;
      });
      await refreshAllSettings();
      toast.success(`${setting.label} kaydedildi.`);
    } catch (error: any) {
      toast.error(error?.message || `${setting.label} kaydedilemedi.`);
    }
  };

  const handleSaveAll = async () => {
    if (changedSettings.length === 0) {
      toast.info("Kaydedilecek değişiklik yok.");
      return;
    }

    try {
      for (const setting of changedSettings) {
        await upsertSetting(setting, getCurrentValue(setting));
      }
      setDrafts({});
      await refreshAllSettings();
      toast.success(`${changedSettings.length} ayar kaydedildi.`);
    } catch (error: any) {
      toast.error(error?.message || "Ayarlar kaydedilirken hata oluştu.");
    }
  };

  const handleImageUpload = async (
    setting: BrandingSetting,
    file: File | undefined
  ) => {
    if (!file) return;

    const maxSizeMb = setting.key === "site_logo_url" ? 4 : 2;

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Dosya boyutu ${maxSizeMb}MB sınırını geçemez.`);
      return;
    }

    setUploadingKey(setting.key);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Yükleme başarısız");
      }

      const data = (await response.json()) as { url: string };
      setDrafts(prev => ({ ...prev, [setting.key]: data.url }));
      toast.success(`${setting.label} yüklendi. Kaydetmeyi unutmayın.`);
    } catch (error: any) {
      toast.error(error?.message || `${setting.label} yüklenemedi.`);
    } finally {
      setUploadingKey(null);
      if (
        setting.key === "site_logo_url" &&
        fileInputRefs.site_logo_url.current
      ) {
        fileInputRefs.site_logo_url.current.value = "";
      }
      if (
        setting.key === "site_favicon_url" &&
        fileInputRefs.site_favicon_url.current
      ) {
        fileInputRefs.site_favicon_url.current.value = "";
      }
    }
  };

  const logoSetting = BRANDING_SETTINGS.find(s => s.key === "site_logo_url")!;
  const faviconSetting = BRANDING_SETTINGS.find(
    s => s.key === "site_favicon_url"
  )!;

  const currentLogo = getCurrentValue(logoSetting) || logoSetting.defaultValue;
  const currentFavicon =
    getCurrentValue(faviconSetting) || faviconSetting.defaultValue;
  const currentSiteName =
    getCurrentValue(BRANDING_SETTINGS.find(s => s.key === "site_name")!) ||
    "Lumiohan";
  const currentTagline = getCurrentValue(
    BRANDING_SETTINGS.find(s => s.key === "site_tagline")!
  );

  const isSaving =
    updateMutation.isPending || createMutation.isPending || !!uploadingKey;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#00F5FF]" />
            Marka ve Kimlik Yönetimi
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Logo, favicon ve marka metinlerini tek ekrandan yönetin.
          </p>
        </div>
        <Button
          onClick={handleSaveAll}
          className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
          disabled={isSaving || changedSettings.length === 0}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Tüm Değişiklikleri Kaydet ({changedSettings.length})
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
        <p className="text-sm text-zinc-400 mb-3">Canlı Önizleme</p>
        <div className="rounded-xl border border-white/10 bg-zinc-950/70 overflow-hidden">
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentLogo}
                alt="Site Logo"
                className="h-8 w-auto max-w-[140px] object-contain"
              />
              <div>
                <p className="text-sm font-semibold">{currentSiteName}</p>
                <p className="text-xs text-zinc-500">{currentTagline || " "}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Globe className="h-4 w-4" />
              lumiohan.com
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3 text-sm text-zinc-400">
            <div className="h-7 w-7 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center">
              <img
                src={currentFavicon}
                alt="Favicon"
                className="h-4 w-4 object-contain"
              />
            </div>
            <span>Tarayıcı sekmesi önizlemesi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {BRANDING_SETTINGS.filter(s => IMAGE_KEYS.has(s.key)).map(setting => {
          const value = getCurrentValue(setting);
          const key = setting.key as keyof typeof fileInputRefs;

          return (
            <div
              key={setting.key}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 space-y-4"
            >
              <div>
                <h3 className="font-semibold">{setting.label}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {setting.description}
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-white/15 bg-zinc-950/60 p-4 min-h-[130px] flex items-center justify-center">
                {value ? (
                  <img
                    src={value}
                    alt={setting.label}
                    className={`object-contain ${setting.key === "site_favicon_url" ? "h-12 w-12" : "h-14 w-auto max-w-[240px]"}`}
                  />
                ) : (
                  <div className="text-zinc-500 text-sm flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Görsel seçilmedi
                  </div>
                )}
              </div>

              <input
                ref={fileInputRefs[key]}
                type="file"
                accept={setting.accept}
                className="hidden"
                onChange={e => handleImageUpload(setting, e.target.files?.[0])}
                disabled={isSaving}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 hover:border-white/40"
                  disabled={isSaving}
                  onClick={() => fileInputRefs[key].current?.click()}
                >
                  {uploadingKey === setting.key ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Dosya Yükle
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-zinc-300 hover:text-white"
                  onClick={() =>
                    setDrafts(prev => ({ ...prev, [setting.key]: "" }))
                  }
                >
                  Temizle
                </Button>
              </div>

              <Input
                value={value}
                onChange={e =>
                  setDrafts(prev => ({
                    ...prev,
                    [setting.key]: e.target.value,
                  }))
                }
                placeholder={setting.placeholder}
                className="bg-zinc-800 border-white/10"
                disabled={isSaving}
              />

              <Button
                type="button"
                onClick={() => handleSave(setting)}
                disabled={isSaving || !isChanged(setting)}
                className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
              >
                <Save className="h-4 w-4 mr-2" />
                {setting.label} Kaydet
              </Button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00F5FF]" />
          Marka Metinleri
        </h3>
        <p className="text-xs text-zinc-500 mt-1 mb-4">
          Metin alanları SEO ve üst navigasyonlarda kullanılabilir.
        </p>

        <div className="space-y-4">
          {BRANDING_SETTINGS.filter(s => !IMAGE_KEYS.has(s.key)).map(
            setting => {
              const value = getCurrentValue(setting);

              return (
                <div
                  key={setting.key}
                  className="rounded-xl border border-white/10 bg-zinc-950/40 p-4"
                >
                  <div className="mb-2">
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-xs text-zinc-500">
                      {setting.description}
                    </p>
                  </div>

                  {setting.inputType === "textarea" ? (
                    <Textarea
                      value={value}
                      onChange={e =>
                        setDrafts(prev => ({
                          ...prev,
                          [setting.key]: e.target.value,
                        }))
                      }
                      placeholder={setting.placeholder}
                      className="bg-zinc-800 border-white/10 min-h-[96px]"
                      disabled={isSaving}
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={e =>
                        setDrafts(prev => ({
                          ...prev,
                          [setting.key]: e.target.value,
                        }))
                      }
                      placeholder={setting.placeholder}
                      className="bg-zinc-800 border-white/10"
                      disabled={isSaving}
                    />
                  )}

                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => handleSave(setting)}
                      disabled={isSaving || !isChanged(setting)}
                      className="bg-[#00F5FF] text-black hover:bg-[#00D9E5]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {settingsQuery.isLoading && (
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center gap-2 text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Ayarlar yükleniyor...
        </div>
      )}
    </div>
  );
}
