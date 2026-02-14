/**
 * Admin Bans - Kullanıcı Yasaklama Sistemi
 * IP ve Email bazlı yasaklama
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Shield,
  Ban,
  User,
  Mail,
  Globe,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BannedUser {
  id: number;
  name: string | null;
  email: string | null;
  isBanned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  lastKnownIp: string | null;
  createdAt: Date;
}

interface BannedIp {
  id: number;
  ipAddress: string;
  reason: string | null;
  bannedUserId: number | null;
  createdAt: Date;
}

interface BannedEmail {
  id: number;
  email: string;
  isPattern: boolean;
  reason: string | null;
  bannedUserId: number | null;
  createdAt: Date;
}

export default function AdminBans() {
  const [activeTab, setActiveTab] = useState<"users" | "ips" | "emails">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isAddIpOpen, setIsAddIpOpen] = useState(false);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BannedUser | null>(null);

  const [banForm, setBanForm] = useState({
    reason: "",
    banIp: true,
    banEmail: true,
  });

  const [ipForm, setIpForm] = useState({ ipAddress: "", reason: "" });
  const [emailForm, setEmailForm] = useState({ email: "", isPattern: false, reason: "" });

  const utils = trpc.useUtils();

  // Queries
  const usersQuery = trpc.adminPanel.getBannedUsers.useQuery();
  const ipsQuery = trpc.adminPanel.getBannedIps.useQuery();
  const emailsQuery = trpc.adminPanel.getBannedEmails.useQuery();

  // Mutations
  const banUserMutation = trpc.adminPanel.banUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı yasaklandı");
      setIsBanDialogOpen(false);
      setSelectedUser(null);
      setBanForm({ reason: "", banIp: true, banEmail: true });
      utils.adminPanel.getBannedUsers.invalidate();
      utils.adminPanel.getBannedIps.invalidate();
      utils.adminPanel.getBannedEmails.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const unbanUserMutation = trpc.adminPanel.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı yasağı kaldırıldı");
      utils.adminPanel.getBannedUsers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const addBannedIpMutation = trpc.adminPanel.addBannedIp.useMutation({
    onSuccess: () => {
      toast.success("IP adresi yasaklandı");
      setIsAddIpOpen(false);
      setIpForm({ ipAddress: "", reason: "" });
      utils.adminPanel.getBannedIps.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const removeBannedIpMutation = trpc.adminPanel.removeBannedIp.useMutation({
    onSuccess: () => {
      toast.success("IP yasağı kaldırıldı");
      utils.adminPanel.getBannedIps.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const addBannedEmailMutation = trpc.adminPanel.addBannedEmail.useMutation({
    onSuccess: () => {
      toast.success("Email yasaklandı");
      setIsAddEmailOpen(false);
      setEmailForm({ email: "", isPattern: false, reason: "" });
      utils.adminPanel.getBannedEmails.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const removeBannedEmailMutation = trpc.adminPanel.removeBannedEmail.useMutation({
    onSuccess: () => {
      toast.success("Email yasağı kaldırıldı");
      utils.adminPanel.getBannedEmails.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const bannedUsers = usersQuery.data?.filter((u) => u.isBanned) || [];
  const bannedIps = ipsQuery.data || [];
  const bannedEmails = emailsQuery.data || [];

  const filteredUsers = bannedUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openBanDialog = (user: BannedUser) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const handleBanUser = () => {
    if (!selectedUser) return;
    banUserMutation.mutate({
      userId: selectedUser.id,
      reason: banForm.reason,
      banIp: banForm.banIp,
      banEmail: banForm.banEmail,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            Kullanıcı Yasaklama
          </h2>
          <p className="text-sm text-zinc-500">IP ve email bazlı yasaklama sistemi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Ban className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{bannedUsers.length}</p>
              <p className="text-xs text-zinc-500">Yasaklı Kullanıcı</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Globe className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{bannedIps.length}</p>
              <p className="text-xs text-zinc-500">Yasaklı IP</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Mail className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{bannedEmails.length}</p>
              <p className="text-xs text-zinc-500">Yasaklı Email</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-zinc-900">
            <TabsTrigger value="users" className="gap-2">
              <User className="h-4 w-4" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="ips" className="gap-2">
              <Globe className="h-4 w-4" />
              IP Adresleri
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Adresleri
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {activeTab === "ips" && (
              <Button onClick={() => setIsAddIpOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                IP Ekle
              </Button>
            )}
            {activeTab === "emails" && (
              <Button onClick={() => setIsAddEmailOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Email Ekle
              </Button>
            )}
          </div>
        </div>

        {/* Users Tab */}
        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10"
          >
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kullanıcı ara..."
                  className="pl-10 bg-zinc-800 border-white/10"
                />
              </div>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-zinc-500">Yasaklı kullanıcı bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <Ban className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "İsimsiz"}</p>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                        {user.banReason && (
                          <p className="text-xs text-red-400 mt-1">Sebep: {user.banReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-zinc-500">
                        {user.bannedAt && (
                          <p>{format(new Date(user.bannedAt), "d MMM yyyy HH:mm", { locale: tr })}</p>
                        )}
                        {user.lastKnownIp && <p className="font-mono">IP: {user.lastKnownIp}</p>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unbanUserMutation.mutate({ userId: user.id })}
                        disabled={unbanUserMutation.isPending}
                      >
                        Yasağı Kaldır
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* IPs Tab */}
        <TabsContent value="ips">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10"
          >
            {bannedIps.length === 0 ? (
              <div className="p-12 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Yasaklı IP adresi bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {bannedIps.map((ip) => (
                  <div key={ip.id} className="flex items-center justify-between p-4 hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Globe className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-mono font-medium">{ip.ipAddress}</p>
                        {ip.reason && <p className="text-xs text-zinc-500">{ip.reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-zinc-500">
                        {format(new Date(ip.createdAt), "d MMM yyyy", { locale: tr })}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400"
                        onClick={() => removeBannedIpMutation.mutate({ id: ip.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10"
          >
            {bannedEmails.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Yasaklı email adresi bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {bannedEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-4 hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Mail className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-mono font-medium">{email.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {email.isPattern && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                              Pattern
                            </span>
                          )}
                          {email.reason && <p className="text-xs text-zinc-500">{email.reason}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-zinc-500">
                        {format(new Date(email.createdAt), "d MMM yyyy", { locale: tr })}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400"
                        onClick={() => removeBannedEmailMutation.mutate({ id: email.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Add IP Dialog */}
      <Dialog open={isAddIpOpen} onOpenChange={setIsAddIpOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>IP Adresi Yasakla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">IP Adresi *</label>
              <Input
                value={ipForm.ipAddress}
                onChange={(e) => setIpForm({ ...ipForm, ipAddress: e.target.value })}
                placeholder="192.168.1.1"
                className="bg-zinc-800 border-white/10 font-mono"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Sebep</label>
              <Textarea
                value={ipForm.reason}
                onChange={(e) => setIpForm({ ...ipForm, reason: e.target.value })}
                placeholder="Yasaklama sebebi..."
                className="bg-zinc-800 border-white/10"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => addBannedIpMutation.mutate(ipForm)}
              disabled={addBannedIpMutation.isPending || !ipForm.ipAddress}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {addBannedIpMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Yasakla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Email Dialog */}
      <Dialog open={isAddEmailOpen} onOpenChange={setIsAddEmailOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Email Adresi Yasakla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Email Adresi *</label>
              <Input
                value={emailForm.email}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                placeholder="user@example.com veya *@domain.com"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <p className="font-medium text-sm">Pattern Olarak Kullan</p>
                <p className="text-xs text-zinc-500">*@domain.com gibi kalıplar için</p>
              </div>
              <Switch
                checked={emailForm.isPattern}
                onCheckedChange={(checked) => setEmailForm({ ...emailForm, isPattern: checked })}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Sebep</label>
              <Textarea
                value={emailForm.reason}
                onChange={(e) => setEmailForm({ ...emailForm, reason: e.target.value })}
                placeholder="Yasaklama sebebi..."
                className="bg-zinc-800 border-white/10"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => addBannedEmailMutation.mutate(emailForm)}
              disabled={addBannedEmailMutation.isPending || !emailForm.email}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {addBannedEmailMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Yasakla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Kullanıcıyı Yasakla
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="font-medium">{selectedUser.name || "İsimsiz"}</p>
                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Yasaklama Sebebi</label>
                <Textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  placeholder="Yasaklama sebebini yazın..."
                  className="bg-zinc-800 border-white/10"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">IP Adresini de Yasakla</p>
                    <p className="text-xs text-zinc-500">Aynı IP'den kayıt engellenecek</p>
                  </div>
                  <Switch
                    checked={banForm.banIp}
                    onCheckedChange={(checked) => setBanForm({ ...banForm, banIp: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Email Adresini de Yasakla</p>
                    <p className="text-xs text-zinc-500">Aynı email ile kayıt engellenecek</p>
                  </div>
                  <Switch
                    checked={banForm.banEmail}
                    onCheckedChange={(checked) => setBanForm({ ...banForm, banEmail: checked })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleBanUser}
              disabled={banUserMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {banUserMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Yasakla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
