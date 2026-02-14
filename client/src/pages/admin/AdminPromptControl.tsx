/**
 * Admin Prompt Control - Prompt & Abuse Kontrol Paneli
 * Yasaklı kelimeler, NSFW/spam filtresi, flagged prompt yönetimi
 */
import { useState } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Shield,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  Ban,
  Search,
  RefreshCw,
  FileText,
  AlertCircle,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BlacklistForm {
  pattern: string;
  patternType: "exact" | "contains" | "regex" | "starts_with" | "ends_with";
  category: "nsfw" | "spam" | "abuse" | "illegal" | "copyright" | "other";
  severity: "low" | "medium" | "high" | "critical";
  actionType: "block" | "warn" | "flag_for_review" | "auto_ban";
  warningMessage: string;
  isActive: boolean;
}

const defaultBlacklistForm: BlacklistForm = {
  pattern: "",
  patternType: "contains",
  category: "nsfw",
  severity: "medium",
  actionType: "block",
  warningMessage: "",
  isActive: true,
};

export default function AdminPromptControl() {
  const [activeTab, setActiveTab] = useState("blacklist");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BlacklistForm>(defaultBlacklistForm);
  const [searchQuery, setSearchQuery] = useState("");

  const blacklistQuery = trpc.adminPanel.getPromptBlacklist.useQuery();
  const flaggedQuery = trpc.adminPanel.getFlaggedPrompts.useQuery({ limit: 100, offset: 0 });
  const utils = trpc.useUtils();

  const createBlacklistMutation = trpc.adminPanel.createPromptBlacklist.useMutation({
    onSuccess: () => {
      toast.success("Blacklist kuralı eklendi");
      utils.adminPanel.getPromptBlacklist.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateBlacklistMutation = trpc.adminPanel.updatePromptBlacklist.useMutation({
    onSuccess: () => {
      toast.success("Blacklist kuralı güncellendi");
      utils.adminPanel.getPromptBlacklist.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteBlacklistMutation = trpc.adminPanel.deletePromptBlacklist.useMutation({
    onSuccess: () => {
      toast.success("Blacklist kuralı silindi");
      utils.adminPanel.getPromptBlacklist.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const reviewPromptMutation = trpc.adminPanel.reviewFlaggedPrompt.useMutation({
    onSuccess: () => {
      toast.success("İşlem tamamlandı");
      utils.adminPanel.getFlaggedPrompts.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultBlacklistForm);
  };

  const openEdit = (item: any) => {
    setForm({
      pattern: item.pattern,
      patternType: item.patternType,
      category: item.category,
      severity: item.severity,
      actionType: item.actionType,
      warningMessage: item.warningMessage || "",
      isActive: item.isActive,
    });
    setEditingId(item.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.pattern) {
      toast.error("Pattern alanı zorunludur");
      return;
    }

    if (isEditing && editingId) {
      updateBlacklistMutation.mutate({ id: editingId, ...form });
    } else {
      createBlacklistMutation.mutate(form);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      nsfw: "bg-red-500/20 text-red-400",
      spam: "bg-yellow-500/20 text-yellow-400",
      abuse: "bg-orange-500/20 text-orange-400",
      illegal: "bg-purple-500/20 text-purple-400",
      copyright: "bg-blue-500/20 text-blue-400",
      other: "bg-zinc-500/20 text-zinc-400",
    };
    const labels: Record<string, string> = {
      nsfw: "NSFW",
      spam: "Spam",
      abuse: "Abuse",
      illegal: "Yasadışı",
      copyright: "Telif",
      other: "Diğer",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[category] || colors.other}`}>
        {labels[category] || category}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      high: "bg-orange-500/20 text-orange-400",
      critical: "bg-red-500/20 text-red-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[severity] || "bg-zinc-500/20 text-zinc-400"}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getActionBadge = (action: string) => {
    const config: Record<string, { color: string; label: string }> = {
      block: { color: "bg-red-500/20 text-red-400", label: "Engelle" },
      warn: { color: "bg-yellow-500/20 text-yellow-400", label: "Uyar" },
      flag_for_review: { color: "bg-blue-500/20 text-blue-400", label: "İncele" },
      auto_ban: { color: "bg-purple-500/20 text-purple-400", label: "Banla" },
    };
    const c = config[action] || { color: "bg-zinc-500/20 text-zinc-400", label: action };
    return <span className={`px-2 py-0.5 rounded text-xs ${c.color}`}>{c.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      pending: { color: "bg-yellow-500/20 text-yellow-400", label: "Bekliyor", icon: <AlertCircle className="h-3 w-3" /> },
      approved: { color: "bg-green-500/20 text-green-400", label: "Onaylandı", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { color: "bg-red-500/20 text-red-400", label: "Reddedildi", icon: <XCircle className="h-3 w-3" /> },
      banned: { color: "bg-purple-500/20 text-purple-400", label: "Banlandı", icon: <Ban className="h-3 w-3" /> },
    };
    const c = config[status] || { color: "bg-zinc-500/20 text-zinc-400", label: status, icon: null };
    return (
      <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const blacklistItems = blacklistQuery.data || [];
  const flaggedPrompts = flaggedQuery.data || [];

  // Filter
  const filteredBlacklist = blacklistItems.filter((item: any) =>
    item.pattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalRules = blacklistItems.length;
  const activeRules = blacklistItems.filter((i: any) => i.isActive).length;
  const pendingReviews = flaggedPrompts.filter((p: any) => p.status === "pending").length;
  const totalHits = blacklistItems.reduce((sum: number, i: any) => sum + (i.hitCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl border border-purple-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Kural</p>
              <p className="text-2xl font-bold">{totalRules}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Aktif Kural</p>
              <p className="text-2xl font-bold">{activeRules}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-2xl border border-yellow-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">İnceleme Bekleyen</p>
              <p className="text-2xl font-bold">{pendingReviews}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/20">
              <Flag className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-red-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Engelleme</p>
              <p className="text-2xl font-bold">{totalHits.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/20">
              <Ban className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger value="blacklist" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
            <Shield className="h-4 w-4 mr-2" />
            Blacklist Kuralları
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
            <Flag className="h-4 w-4 mr-2" />
            Flagged Promptlar ({pendingReviews})
          </TabsTrigger>
        </TabsList>

        {/* Blacklist Tab */}
        <TabsContent value="blacklist" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Kural ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-zinc-800 border-white/10"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => blacklistQuery.refetch()}
              >
                <RefreshCw className={`h-4 w-4 ${blacklistQuery.isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button
                className="bg-lime-500 hover:bg-lime-600 text-black gap-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Kural Ekle
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredBlacklist.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <code className="px-2 py-1 bg-zinc-800 rounded text-sm font-mono">
                        {item.pattern}
                      </code>
                      <span className="text-xs text-zinc-500">({item.patternType})</span>
                      {getCategoryBadge(item.category)}
                      {getSeverityBadge(item.severity)}
                      {getActionBadge(item.actionType)}
                    </div>
                    {item.warningMessage && (
                      <p className="text-sm text-zinc-400 mb-2">{item.warningMessage}</p>
                    )}
                    <p className="text-xs text-zinc-500">
                      Engelleme sayısı: <span className="text-red-400">{item.hitCount || 0}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) =>
                        updateBlacklistMutation.mutate({ id: item.id, isActive: checked })
                      }
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => {
                        if (confirm("Bu kuralı silmek istediğinizden emin misiniz?")) {
                          deleteBlacklistMutation.mutate({ id: item.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredBlacklist.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Henüz blacklist kuralı yok</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Flagged Prompts Tab */}
        <TabsContent value="flagged" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">İnceleme Bekleyen Promptlar</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => flaggedQuery.refetch()}
            >
              <RefreshCw className={`h-4 w-4 ${flaggedQuery.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="space-y-3">
            {flaggedPrompts.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(item.status)}
                      {getCategoryBadge(item.flagReason)}
                      <span className="text-xs text-zinc-500">
                        {format(new Date(item.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </span>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3 mb-2">
                      <p className="text-sm font-mono break-all">{item.prompt}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="h-3 w-3" />
                      <span>Kullanıcı #{item.userId}</span>
                      {item.userName && <span>({item.userName})</span>}
                    </div>
                  </div>

                  {item.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-black gap-1"
                        onClick={() => reviewPromptMutation.mutate({ id: item.id, status: "approved" })}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1"
                        onClick={() => reviewPromptMutation.mutate({ id: item.id, status: "rejected" })}
                      >
                        <XCircle className="h-3 w-3" />
                        Reddet
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 gap-1"
                        onClick={() => reviewPromptMutation.mutate({ id: item.id, status: "banned", banUser: true })}
                      >
                        <Ban className="h-3 w-3" />
                        Banla
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {flaggedPrompts.length === 0 && (
              <div className="text-center py-12">
                <Flag className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">İnceleme bekleyen prompt yok</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Kuralı Düzenle" : "Yeni Blacklist Kuralı"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Pattern *</label>
              <Input
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                placeholder="yasaklı kelime veya regex"
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Pattern Tipi</label>
                <Select
                  value={form.patternType}
                  onValueChange={(value: any) => setForm({ ...form, patternType: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Tam Eşleşme</SelectItem>
                    <SelectItem value="contains">İçerir</SelectItem>
                    <SelectItem value="starts_with">Başlar</SelectItem>
                    <SelectItem value="ends_with">Biter</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Kategori</label>
                <Select
                  value={form.category}
                  onValueChange={(value: any) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nsfw">NSFW</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="abuse">Abuse</SelectItem>
                    <SelectItem value="illegal">Yasadışı</SelectItem>
                    <SelectItem value="copyright">Telif</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Şiddet</label>
                <Select
                  value={form.severity}
                  onValueChange={(value: any) => setForm({ ...form, severity: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Aksiyon</label>
                <Select
                  value={form.actionType}
                  onValueChange={(value: any) => setForm({ ...form, actionType: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Engelle</SelectItem>
                    <SelectItem value="warn">Uyar</SelectItem>
                    <SelectItem value="flag_for_review">İncelemeye Al</SelectItem>
                    <SelectItem value="auto_ban">Otomatik Banla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Uyarı Mesajı</label>
              <Textarea
                value={form.warningMessage}
                onChange={(e) => setForm({ ...form, warningMessage: e.target.value })}
                placeholder="Kullanıcıya gösterilecek mesaj..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <label className="text-sm">Aktif</label>
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" className="flex-1" onClick={closeDialog}>
                İptal
              </Button>
              <Button
                className="flex-1 bg-lime-500 hover:bg-lime-600 text-black"
                onClick={handleSubmit}
                disabled={createBlacklistMutation.isPending || updateBlacklistMutation.isPending}
              >
                {createBlacklistMutation.isPending || updateBlacklistMutation.isPending
                  ? "Kaydediliyor..."
                  : isEditing
                    ? "Güncelle"
                    : "Ekle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
