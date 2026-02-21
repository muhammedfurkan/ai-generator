/**
 * Admin Features - Özellik Yönetimi
 * Referans sistemi, kayıt özellikleri ve diğer sistem özelliklerinin açıp kapatılması
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Settings,
  Save,
  RefreshCw,
  Users,
  Gift,
  UserPlus,
  Lock,
  Zap,
  Image,
  Video,
  CreditCard,
  Bell,
  Mail,
  Shield,
  Star,
  AlertTriangle,
  Wrench,
} from "lucide-react";

interface FeatureConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  category:
    | "system"
    | "referral"
    | "registration"
    | "generation"
    | "notification";
  extraSettings?: {
    key: string;
    label: string;
    type: "number" | "text";
    value: string;
  }[];
}

const DEFAULT_FEATURES: FeatureConfig[] = [
  // System Features
  {
    key: "maintenance_mode_enabled",
    label: "Bakım Modu",
    description:
      "Site bakım modundayken kullanıcılar işlem yapamaz, sadece bilgilendirme sayfası görünür",
    icon: Wrench,
    enabled: false,
    category: "system",
    extraSettings: [
      {
        key: "maintenance_message",
        label: "Bakım Mesajı",
        type: "text",
        value:
          "Sitemiz şu anda bakım çalışması nedeniyle geçici olarak kullanılamıyor. Kısa süre içinde tekrar hizmetinizde olacağız.",
      },
    ],
  },
  // Referral Features
  {
    key: "referral_system_enabled",
    label: "Referans Sistemi",
    description:
      "Kullanıcıların arkadaşlarını davet ederek kredi kazanmasını sağlar",
    icon: Users,
    enabled: true,
    category: "referral",
    extraSettings: [
      {
        key: "referral_bonus_referrer",
        label: "Davet Eden Bonus",
        type: "number",
        value: "50",
      },
      {
        key: "referral_bonus_referred",
        label: "Davet Edilen Bonus",
        type: "number",
        value: "25",
      },
    ],
  },
  {
    key: "referral_show_on_dashboard",
    label: "Dashboard'da Referans Göster",
    description: "Kullanıcı panelinde referans kodunu ve istatistikleri göster",
    icon: Gift,
    enabled: true,
    category: "referral",
  },
  // Registration Features
  {
    key: "registration_enabled",
    label: "Yeni Kayıt",
    description: "Yeni kullanıcı kayıtlarına izin ver",
    icon: UserPlus,
    enabled: true,
    category: "registration",
  },
  {
    key: "email_verification_required",
    label: "E-posta Doğrulama Zorunlu",
    description: "Kayıt sonrası e-posta doğrulaması gerektirir",
    icon: Mail,
    enabled: true,
    category: "registration",
  },
  {
    key: "google_login_enabled",
    label: "Google ile Giriş",
    description: "Google OAuth ile giriş yapılmasına izin ver",
    icon: Shield,
    enabled: true,
    category: "registration",
  },
  // Generation Features
  {
    key: "image_generation_enabled",
    label: "Görsel Üretimi",
    description: "AI görsel üretim özelliğini aktif et",
    icon: Image,
    enabled: true,
    category: "generation",
  },
  {
    key: "video_generation_enabled",
    label: "Video Üretimi",
    description: "AI video üretim özelliğini aktif et",
    icon: Video,
    enabled: true,
    category: "generation",
  },
  {
    key: "ai_influencer_enabled",
    label: "AI Influencer",
    description: "AI influencer araçlarının web'de görünmesini sağlar",
    icon: Users,
    enabled: true,
    category: "generation",
  },
  {
    key: "upscale_enabled",
    label: "Upscale",
    description: "Upscale aracını web menü ve sayfalarda aktif eder",
    icon: Zap,
    enabled: true,
    category: "generation",
  },
  {
    key: "audio_generation_enabled",
    label: "Audio Generate",
    description: "Audio üretim ekranını web menüsünde aktif eder",
    icon: Bell,
    enabled: true,
    category: "generation",
  },
  {
    key: "music_generation_enabled",
    label: "Music Generate",
    description: "Music üretim ekranını web menüsünde aktif eder",
    icon: Bell,
    enabled: true,
    category: "generation",
  },
  {
    key: "gallery_enabled",
    label: "Galeri",
    description: "Galeri menüsü ve sayfasını kullanıcıya gösterir",
    icon: Image,
    enabled: true,
    category: "generation",
  },
  {
    key: "blog_enabled",
    label: "Blog",
    description: "Blog menüsü ve blog sayfalarını kullanıcıya açar",
    icon: Mail,
    enabled: true,
    category: "generation",
  },
  {
    key: "community_enabled",
    label: "Topluluk",
    description: "Topluluk karakter ekranı ve ilgili home bloklarını açar",
    icon: Users,
    enabled: true,
    category: "generation",
  },
  {
    key: "free_credits_on_signup",
    label: "Kayıtta Ücretsiz Kredi",
    description: "Yeni kullanıcılara ücretsiz başlangıç kredisi ver",
    icon: CreditCard,
    enabled: true,
    category: "generation",
    extraSettings: [
      {
        key: "signup_bonus_credits",
        label: "Başlangıç Kredisi",
        type: "number",
        value: "100",
      },
    ],
  },
  // Notification Features
  {
    key: "email_notifications_enabled",
    label: "E-posta Bildirimleri",
    description: "Sistem e-posta bildirimlerini aktif et",
    icon: Mail,
    enabled: true,
    category: "notification",
  },
  {
    key: "push_notifications_enabled",
    label: "Anlık Bildirimler",
    description: "Tarayıcı push bildirimlerini aktif et",
    icon: Bell,
    enabled: false,
    category: "notification",
  },
  // Package Page Features
  {
    key: "packages_bonus_message",
    label: "Paket Bonus Mesajı",
    description:
      "Paketler sayfasında gösterilecek bonus mesajı (boş bırakılırsa gösterilmez)",
    icon: Gift,
    enabled: true,
    category: "generation",
    extraSettings: [
      {
        key: "packages_bonus_text",
        label: "Bonus Mesajı",
        type: "text",
        value: "Büyük paketlerde %35'e varan bonus!",
      },
    ],
  },
  {
    key: "packages_validity_message",
    label: "Paket Geçerlilik Mesajı",
    description:
      "Paketler sayfasında gösterilecek geçerlilik mesajı (boş bırakılırsa gösterilmez)",
    icon: Star,
    enabled: true,
    category: "generation",
    extraSettings: [
      {
        key: "packages_validity_text",
        label: "Geçerlilik Mesajı",
        type: "text",
        value: "Sınırsız geçerlilik süresi",
      },
    ],
  },
];

export default function AdminFeatures() {
  const [features, setFeatures] = useState<FeatureConfig[]>(DEFAULT_FEATURES);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({});
  const utils = trpc.useUtils();

  const updateMutation = trpc.adminPanel.updateSiteSetting.useMutation();
  const createMutation = trpc.adminPanel.createSiteSetting.useMutation();

  // Load settings from database
  useEffect(() => {
    if (settingsQuery.data && settingsQuery.data.length > 0) {
      const updatedFeatures = DEFAULT_FEATURES.map(feature => {
        // Load enabled state
        const setting = settingsQuery.data.find(s => s.key === feature.key);
        const enabled = setting ? setting.value === "true" : feature.enabled;

        // Load extra settings
        let extraSettings = feature.extraSettings;
        if (feature.extraSettings) {
          extraSettings = feature.extraSettings.map(extra => {
            const extraSetting = settingsQuery.data.find(
              s => s.key === extra.key
            );
            if (extraSetting) {
              return { ...extra, value: extraSetting.value || extra.value };
            }
            return extra;
          });
        }

        return { ...feature, enabled, extraSettings };
      });
      setFeatures(updatedFeatures);
      setHasChanges(false);
    }
  }, [settingsQuery.data]);

  const handleToggle = (key: string) => {
    setFeatures(prev =>
      prev.map(f => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
    setHasChanges(true);
  };

  const handleExtraSettingChange = (
    featureKey: string,
    settingKey: string,
    value: string
  ) => {
    setFeatures(prev =>
      prev.map(f => {
        if (f.key === featureKey && f.extraSettings) {
          return {
            ...f,
            extraSettings: f.extraSettings.map(s =>
              s.key === settingKey ? { ...s, value } : s
            ),
          };
        }
        return f;
      })
    );
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const feature of features) {
        const existingSetting = settingsQuery.data?.find(
          s => s.key === feature.key
        );
        if (existingSetting) {
          await updateMutation.mutateAsync({
            key: feature.key,
            value: feature.enabled.toString(),
          });
        } else {
          await createMutation.mutateAsync({
            key: feature.key,
            value: feature.enabled.toString(),
            category: "general",
            label: feature.label,
            description: feature.description,
            inputType: "boolean",
            isPublic: true,
          });
        }

        // Save extra settings
        if (feature.extraSettings) {
          for (const extra of feature.extraSettings) {
            const existingExtra = settingsQuery.data?.find(
              s => s.key === extra.key
            );
            if (existingExtra) {
              await updateMutation.mutateAsync({
                key: extra.key,
                value: extra.value,
              });
            } else {
              await createMutation.mutateAsync({
                key: extra.key,
                value: extra.value,
                category: "general",
                label: extra.label,
                inputType: extra.type === "number" ? "number" : "text",
                isPublic: true,
              });
            }
          }
        }
      }

      toast.success("Tüm özellikler kaydedildi");
      setHasChanges(false);
      await Promise.all([
        utils.adminPanel.getSiteSettings.invalidate(),
        utils.settings.getPublicSettings.invalidate(),
      ]);
    } catch (error) {
      toast.error("Kaydetme hatası oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const categoryLabels = {
    system: { label: "Sistem Ayarları", icon: Wrench },
    referral: { label: "Referans Sistemi", icon: Users },
    registration: { label: "Kayıt & Giriş", icon: UserPlus },
    generation: { label: "İçerik Üretimi", icon: Zap },
    notification: { label: "Bildirimler", icon: Bell },
  };

  const groupedFeatures = features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, FeatureConfig[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Özellik Yönetimi
          </h2>
          <p className="text-sm text-zinc-500">
            Sistem özelliklerini açıp kapatın
          </p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Değişiklikleri Kaydet
          </Button>
        )}
      </div>

      {/* Quick Maintenance Mode Toggle */}
      {(() => {
        const maintenanceFeature = features.find(
          f => f.key === "maintenance_mode_enabled"
        );
        if (!maintenanceFeature) return null;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 ${
              maintenanceFeature.enabled
                ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50"
                : "bg-zinc-900/50 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${maintenanceFeature.enabled ? "bg-orange-500/30" : "bg-zinc-800"}`}
                >
                  <Wrench
                    className={`h-6 w-6 ${maintenanceFeature.enabled ? "text-orange-400" : "text-zinc-500"}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Bakım Modu
                    {maintenanceFeature.enabled && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/30 text-orange-400 animate-pulse">
                        AKTİF
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {maintenanceFeature.enabled
                      ? "Site şu anda bakım modunda. Kullanıcılar işlem yapamıyor."
                      : "Bakım modunu açarak kullanıcıların işlem yapmasını engelleyebilirsiniz."}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleToggle("maintenance_mode_enabled")}
                variant={maintenanceFeature.enabled ? "destructive" : "default"}
                className={`gap-2 ${!maintenanceFeature.enabled ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}`}
              >
                {maintenanceFeature.enabled ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Bakım Modunu Kapat
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4" />
                    Bakım Modunu Aç
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );
      })()}

      {/* Feature Categories */}
      {Object.entries(groupedFeatures).map(
        ([category, categoryFeatures], categoryIndex) => {
          const categoryInfo =
            categoryLabels[category as keyof typeof categoryLabels];
          const CategoryIcon = categoryInfo.icon;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="bg-zinc-900/50 rounded-2xl border border-white/10"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00F5FF]/20">
                  <CategoryIcon className="h-5 w-5 text-[#00F5FF]" />
                </div>
                <h3 className="font-semibold">{categoryInfo.label}</h3>
              </div>

              <div className="divide-y divide-white/5">
                {categoryFeatures.map(feature => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={feature.key} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-lg ${feature.enabled ? "bg-green-500/20" : "bg-zinc-800"}`}
                          >
                            <FeatureIcon
                              className={`h-5 w-5 ${feature.enabled ? "text-green-400" : "text-zinc-500"}`}
                            />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${!feature.enabled ? "text-zinc-500" : ""}`}
                            >
                              {feature.label}
                            </p>
                            <p className="text-sm text-zinc-500 mt-0.5">
                              {feature.description}
                            </p>

                            {/* Extra Settings */}
                            {feature.enabled && feature.extraSettings && (
                              <div className="mt-4 flex flex-wrap gap-4">
                                {feature.extraSettings.map(extra => (
                                  <div
                                    key={extra.key}
                                    className="flex items-center gap-2"
                                  >
                                    <label className="text-xs text-zinc-400">
                                      {extra.label}:
                                    </label>
                                    <Input
                                      type={extra.type}
                                      value={extra.value}
                                      onChange={e =>
                                        handleExtraSettingChange(
                                          feature.key,
                                          extra.key,
                                          e.target.value
                                        )
                                      }
                                      className="w-24 h-8 text-sm bg-zinc-800 border-white/10"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={() => handleToggle(feature.key)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        }
      )}

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#00F5FF]/10 border border-[#00F5FF]/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-[#00F5FF] mt-0.5" />
          <div>
            <p className="text-sm text-[#00F5FF]">
              Özellik değişiklikleri anında uygulanır. Ancak bazı değişiklikler
              (örn. kayıt ayarları) mevcut oturumları etkilemez.
            </p>
            <p className="text-xs text-[#00F5FF] mt-1">
              Kritik özellikleri kapatmadan önce dikkatli olun.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
