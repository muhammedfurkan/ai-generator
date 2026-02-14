/**
 * Admin Telegram Settings - Telegram Bot Ayarları
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Send,
  Bot,
  Users,
  Bell,
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  MessageSquare,
  Image,
  Video,
  CreditCard,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

interface TelegramSettings {
  botToken: string;
  adminChatIds: string;
  sendChatIds: string;
  notifyNewUser: boolean;
  notifyCreditSpending: boolean;
  notifyPackagePurchase: boolean;
  notifyVideoComplete: boolean;
  notifyErrors: boolean;
  notifyGeneratedImages: boolean;
}

export default function AdminTelegram() {
  const [settings, setSettings] = useState<TelegramSettings>({
    botToken: "",
    adminChatIds: "",
    sendChatIds: "",
    notifyNewUser: true,
    notifyCreditSpending: true,
    notifyPackagePurchase: true,
    notifyVideoComplete: true,
    notifyErrors: true,
    notifyGeneratedImages: false,
  });
  const [testMessage, setTestMessage] = useState("Test mesajı - Admin Panel");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Get settings from site settings
  const settingsQuery = trpc.adminPanel.getSiteSettings.useQuery({ category: "notification" });

  const updateMutation = trpc.adminPanel.updateSiteSetting.useMutation({
    onSuccess: () => {
      toast.success("Ayar güncellendi");
    },
    onError: (error) => toast.error(error.message),
  });

  const createMutation = trpc.adminPanel.createSiteSetting.useMutation({
    onSuccess: () => {
      toast.success("Ayar oluşturuldu");
    },
    onError: (error) => toast.error(error.message),
  });

  // Parse settings from query
  useEffect(() => {
    if (settingsQuery.data) {
      const parsed: Partial<TelegramSettings> = {};
      settingsQuery.data.forEach((setting) => {
        if (setting.key === "telegram_bot_token") parsed.botToken = setting.value || "";
        if (setting.key === "telegram_admin_chat_ids") parsed.adminChatIds = setting.value || "";
        if (setting.key === "telegram_send_chat_ids") parsed.sendChatIds = setting.value || "";
        if (setting.key === "telegram_notify_new_user") parsed.notifyNewUser = setting.value === "true";
        if (setting.key === "telegram_notify_credit_spending") parsed.notifyCreditSpending = setting.value === "true";
        if (setting.key === "telegram_notify_package_purchase") parsed.notifyPackagePurchase = setting.value === "true";
        if (setting.key === "telegram_notify_video_complete") parsed.notifyVideoComplete = setting.value === "true";
        if (setting.key === "telegram_notify_errors") parsed.notifyErrors = setting.value === "true";
        if (setting.key === "telegram_notify_generated_images") parsed.notifyGeneratedImages = setting.value === "true";
      });
      setSettings((prev) => ({ ...prev, ...parsed }));
    }
  }, [settingsQuery.data]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: "telegram_bot_token", value: settings.botToken, label: "Telegram Bot Token", inputType: "text" as const },
        { key: "telegram_admin_chat_ids", value: settings.adminChatIds, label: "Admin Chat IDs", inputType: "text" as const },
        { key: "telegram_send_chat_ids", value: settings.sendChatIds, label: "Görsel Gönderim Chat IDs", inputType: "text" as const },
        { key: "telegram_notify_new_user", value: settings.notifyNewUser.toString(), label: "Yeni Kullanıcı Bildirimi", inputType: "boolean" as const },
        { key: "telegram_notify_credit_spending", value: settings.notifyCreditSpending.toString(), label: "Kredi Harcama Bildirimi", inputType: "boolean" as const },
        { key: "telegram_notify_package_purchase", value: settings.notifyPackagePurchase.toString(), label: "Paket Satın Alma Bildirimi", inputType: "boolean" as const },
        { key: "telegram_notify_video_complete", value: settings.notifyVideoComplete.toString(), label: "Video Tamamlama Bildirimi", inputType: "boolean" as const },
        { key: "telegram_notify_errors", value: settings.notifyErrors.toString(), label: "Hata Bildirimi", inputType: "boolean" as const },
        { key: "telegram_notify_generated_images", value: settings.notifyGeneratedImages.toString(), label: "Üretilen Görsel Bildirimi", inputType: "boolean" as const },
      ];

      for (const setting of settingsToSave) {
        const existing = settingsQuery.data?.find((s) => s.key === setting.key);
        if (existing) {
          await updateMutation.mutateAsync({ key: setting.key, value: setting.value });
        } else {
          await createMutation.mutateAsync({
            key: setting.key,
            value: setting.value,
            category: "notification",
            label: setting.label,
            inputType: setting.inputType,
            isPublic: false,
          });
        }
      }

      toast.success("Tüm ayarlar kaydedildi");
      settingsQuery.refetch();
    } catch (error) {
      toast.error("Ayarlar kaydedilirken hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMessage = async () => {
    setIsTesting(true);
    try {
      // Call a test endpoint
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage }),
      });

      if (response.ok) {
        toast.success("Test mesajı gönderildi");
      } else {
        toast.error("Test mesajı gönderilemedi");
      }
    } catch (error) {
      toast.error("Bağlantı hatası");
    } finally {
      setIsTesting(false);
    }
  };

  const notificationOptions = [
    { key: "notifyNewUser", label: "Yeni Kullanıcı Kaydı", icon: UserPlus, description: "Yeni kullanıcı kaydolduğunda bildirim" },
    { key: "notifyCreditSpending", label: "Kredi Harcaması", icon: CreditCard, description: "Kullanıcı kredi harcadığında bildirim" },
    { key: "notifyPackagePurchase", label: "Paket Satın Alma", icon: CreditCard, description: "Paket satın alındığında bildirim" },
    { key: "notifyVideoComplete", label: "Video Tamamlama", icon: Video, description: "Video üretimi tamamlandığında bildirim" },
    { key: "notifyErrors", label: "Sistem Hataları", icon: AlertTriangle, description: "Kritik hatalar oluştuğunda bildirim" },
    { key: "notifyGeneratedImages", label: "Üretilen Görseller", icon: Image, description: "Görsel üretildiğinde görseli gönder" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            Telegram Bot Ayarları
          </h2>
          <p className="text-sm text-zinc-500">Telegram bot entegrasyonu ve bildirim ayarları</p>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
        >
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </Button>
      </div>

      {/* Bot Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4" /> Bot Yapılandırması
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Bot Token</label>
            <Input
              type="password"
              value={settings.botToken}
              onChange={(e) => setSettings({ ...settings, botToken: e.target.value })}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="bg-zinc-800 border-white/10 font-mono"
            />
            <p className="text-xs text-zinc-500 mt-1">@BotFather'dan aldığınız token</p>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Admin Chat ID'leri</label>
            <Input
              value={settings.adminChatIds}
              onChange={(e) => setSettings({ ...settings, adminChatIds: e.target.value })}
              placeholder="123456789, 987654321"
              className="bg-zinc-800 border-white/10"
            />
            <p className="text-xs text-zinc-500 mt-1">Birden fazla ID için virgülle ayırın</p>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Görsel Gönderim Chat ID'leri</label>
            <Input
              value={settings.sendChatIds}
              onChange={(e) => setSettings({ ...settings, sendChatIds: e.target.value })}
              placeholder="123456789, -100123456789"
              className="bg-zinc-800 border-white/10"
            />
            <p className="text-xs text-zinc-500 mt-1">Üretilen görsellerin gönderileceği chat/grup ID'leri</p>
          </div>
        </div>
      </motion.div>

      {/* Test Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Send className="h-4 w-4" /> Test Mesajı Gönder
        </h3>
        <div className="flex gap-3">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Test mesajı..."
            className="bg-zinc-800 border-white/10 flex-1"
          />
          <Button
            onClick={handleTestMessage}
            disabled={isTesting || !settings.adminChatIds}
            variant="outline"
          >
            {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Bildirim Ayarları
        </h3>
        <div className="space-y-4">
          {notificationOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = settings[option.key as keyof TelegramSettings] as boolean;
            return (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-lime-500/20" : "bg-zinc-700"}`}>
                    <Icon className={`h-4 w-4 ${isEnabled ? "text-lime-400" : "text-zinc-500"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-zinc-500">{option.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, [option.key]: checked })
                  }
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Status Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Bot Komutları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <code className="text-lime-400">/addcredit &lt;email&gt; &lt;amount&gt;</code>
            <p className="text-zinc-500 text-xs mt-1">Kullanıcıya kredi ekle</p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg">
            <code className="text-lime-400">/deductcredit &lt;email&gt; &lt;amount&gt;</code>
            <p className="text-zinc-500 text-xs mt-1">Kullanıcıdan kredi düş</p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg">
            <code className="text-lime-400">/userinfo &lt;email&gt;</code>
            <p className="text-zinc-500 text-xs mt-1">Kullanıcı bilgisi</p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg">
            <code className="text-lime-400">/broadcast &lt;mesaj&gt;</code>
            <p className="text-zinc-500 text-xs mt-1">Tüm kullanıcılara bildirim</p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg">
            <code className="text-lime-400">/notify &lt;email&gt; &lt;mesaj&gt;</code>
            <p className="text-zinc-500 text-xs mt-1">Tek kullanıcıya bildirim</p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg">
            <code className="text-lime-400">/stats</code>
            <p className="text-zinc-500 text-xs mt-1">Günlük istatistikler</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
