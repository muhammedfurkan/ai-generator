/**
 * Admin Security - Sistem & Güvenlik Paneli
 * Admin yetki seviyeleri, 2FA, IP whitelist, rate limits, login geçmişi
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Key,
  Users,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Lock,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  User,
  MapPin,
  Activity,
  Settings,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface RoleForm {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

const defaultRoleForm: RoleForm = {
  name: "",
  displayName: "",
  description: "",
  permissions: [],
};

// Available permissions
const PERMISSIONS = [
  { key: "dashboard.view", label: "Dashboard Görüntüleme", category: "Genel" },
  { key: "users.view", label: "Kullanıcı Listesi", category: "Kullanıcılar" },
  { key: "users.edit", label: "Kullanıcı Düzenleme", category: "Kullanıcılar" },
  { key: "users.ban", label: "Kullanıcı Banlama", category: "Kullanıcılar" },
  { key: "credits.view", label: "Kredi Görüntüleme", category: "Krediler" },
  { key: "credits.add", label: "Kredi Ekleme", category: "Krediler" },
  { key: "credits.remove", label: "Kredi Silme", category: "Krediler" },
  { key: "packages.manage", label: "Paket Yönetimi", category: "Paketler" },
  {
    key: "discounts.manage",
    label: "İndirim Yönetimi",
    category: "Kampanyalar",
  },
  { key: "content.manage", label: "İçerik Yönetimi", category: "İçerik" },
  { key: "blog.manage", label: "Blog Yönetimi", category: "İçerik" },
  { key: "seo.manage", label: "SEO Yönetimi", category: "İçerik" },
  { key: "settings.view", label: "Ayarları Görüntüleme", category: "Sistem" },
  { key: "settings.edit", label: "Ayarları Düzenleme", category: "Sistem" },
  { key: "models.manage", label: "Model Yönetimi", category: "Sistem" },
  { key: "security.manage", label: "Güvenlik Yönetimi", category: "Sistem" },
  { key: "payments.view", label: "Ödeme Görüntüleme", category: "Finans" },
  { key: "payments.refund", label: "Ödeme İadesi", category: "Finans" },
];

export default function AdminSecurity() {
  const [activeTab, setActiveTab] = useState("roles");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleForm>(defaultRoleForm);

  const rolesQuery = trpc.adminPanel.getAdminRoles.useQuery();
  const adminUsersQuery = trpc.adminPanel.getAdminUsers.useQuery();
  const rateLimitsQuery = trpc.adminPanel.getRateLimits.useQuery();
  const loginHistoryQuery = trpc.adminPanel.getLoginHistory.useQuery({
    limit: 100,
  });
  const utils = trpc.useUtils();

  const createRoleMutation = trpc.adminPanel.createAdminRole.useMutation({
    onSuccess: () => {
      toast.success("Rol oluşturuldu");
      utils.adminPanel.getAdminRoles.invalidate();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const updateRoleMutation = trpc.adminPanel.updateAdminRole.useMutation({
    onSuccess: () => {
      toast.success("Rol güncellendi");
      utils.adminPanel.getAdminRoles.invalidate();
      closeDialog();
    },
    onError: error => toast.error(error.message),
  });

  const deleteRoleMutation = trpc.adminPanel.deleteAdminRole.useMutation({
    onSuccess: () => {
      toast.success("Rol silindi");
      utils.adminPanel.getAdminRoles.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const updateRateLimitMutation = trpc.adminPanel.updateRateLimit.useMutation({
    onSuccess: () => {
      toast.success("Rate limit güncellendi");
      utils.adminPanel.getRateLimits.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultRoleForm);
  };

  const openEdit = (role: any) => {
    setForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      permissions: JSON.parse(role.permissions || "[]"),
    });
    setEditingId(role.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.displayName) {
      toast.error("Rol adı ve görünen ad zorunludur");
      return;
    }

    const data = {
      ...form,
      permissions: JSON.stringify(form.permissions),
    };

    if (isEditing && editingId) {
      updateRoleMutation.mutate({ id: editingId, ...data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const togglePermission = (permKey: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const roles = rolesQuery.data || [];
  const adminUsers = adminUsersQuery.data || [];
  const rateLimits = rateLimitsQuery.data || [];
  const loginHistory = loginHistoryQuery.data || [];

  // Group permissions by category
  const groupedPermissions = PERMISSIONS.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, typeof PERMISSIONS>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Admin Rolleri</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
            <Shield className="h-6 w-6 text-[#7C3AED]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/10 rounded-2xl border border-[#00F5FF]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Admin Kullanıcılar</p>
              <p className="text-2xl font-bold">{adminUsers.length}</p>
            </div>
            <Users className="h-6 w-6 text-[#00F5FF]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">2FA Aktif</p>
              <p className="text-2xl font-bold">
                {adminUsers.filter((u: any) => u.twoFactorEnabled).length}
              </p>
            </div>
            <Key className="h-6 w-6 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl border border-orange-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Rate Limit Kuralları</p>
              <p className="text-2xl font-bold">{rateLimits.length}</p>
            </div>
            <Activity className="h-6 w-6 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Shield className="h-4 w-4 mr-2" />
            Roller
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Users className="h-4 w-4 mr-2" />
            Admin Kullanıcılar
          </TabsTrigger>
          <TabsTrigger
            value="ratelimits"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Activity className="h-4 w-4 mr-2" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger
            value="logins"
            className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
          >
            <Globe className="h-4 w-4 mr-2" />
            Giriş Geçmişi
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Admin Yetki Rolleri</h3>
            <Button
              className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Rol Ekle
            </Button>
          </div>

          <div className="grid gap-4">
            {roles.map((role: any) => {
              const perms = JSON.parse(role.permissions || "[]");
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{role.displayName}</h4>
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
                          {role.name}
                        </code>
                        {role.isActive ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                            Pasif
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-sm text-zinc-400 mb-2">
                          {role.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {perms.slice(0, 5).map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400"
                          >
                            {perm}
                          </span>
                        ))}
                        {perms.length > 5 && (
                          <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">
                            +{perms.length - 5} daha
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => {
                          if (
                            confirm(
                              "Bu rolü silmek istediğinizden emin misiniz?"
                            )
                          ) {
                            deleteRoleMutation.mutate({ id: role.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {roles.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Henüz rol tanımlanmamış</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Admin Users Tab */}
        <TabsContent value="admins" className="mt-6">
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Kullanıcı
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Rol
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      2FA
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      IP Whitelist
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Son Giriş
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {adminUsers.map((admin: any) => (
                    <tr key={admin.id} className="hover:bg-zinc-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#00F5FF] flex items-center justify-center text-black font-bold text-sm">
                            {admin.userName?.[0] || "A"}
                          </div>
                          <div>
                            <p className="font-medium">{admin.userName}</p>
                            <p className="text-xs text-zinc-500">
                              {admin.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-[#7C3AED]/20 text-[#7C3AED]">
                          {admin.roleName || "Super Admin"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {admin.twoFactorEnabled ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle className="h-4 w-4" /> Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 text-sm">
                            <XCircle className="h-4 w-4" /> Pasif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {admin.ipWhitelist ? (
                          <span className="text-sm text-green-400">
                            Tanımlı
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {admin.lastLoginAt
                          ? formatDistanceToNow(new Date(admin.lastLoginAt), {
                              locale: tr,
                              addSuffix: true,
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="ratelimits" className="mt-6">
          <div className="grid gap-4">
            {rateLimits.map((limit: any) => (
              <motion.div
                key={limit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{limit.limitName}</h4>
                      <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
                        {limit.limitKey}
                      </code>
                      {limit.isActive ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                          Pasif
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-zinc-500">İstek/Pencere</p>
                        <p className="text-sm font-medium">
                          {limit.requestsPerWindow}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Pencere Süresi</p>
                        <p className="text-sm font-medium">
                          {limit.windowSizeSeconds}s
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Free Çarpan</p>
                        <p className="text-sm font-medium">
                          x{limit.freeUserMultiplier}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Premium Çarpan</p>
                        <p className="text-sm font-medium text-[#00F5FF]">
                          x{limit.premiumUserMultiplier}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={limit.isActive}
                    onCheckedChange={checked =>
                      updateRateLimitMutation.mutate({
                        id: limit.id,
                        isActive: checked,
                      })
                    }
                  />
                </div>
              </motion.div>
            ))}

            {rateLimits.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Rate limit kuralı tanımlanmamış</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Login History Tab */}
        <TabsContent value="logins" className="mt-6">
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Kullanıcı
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      IP
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Konum
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Cihaz
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Durum
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loginHistory.map((login: any) => (
                    <tr key={login.id} className="hover:bg-zinc-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm">
                            {login.userName || `User #${login.userId}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
                          {login.ipAddress}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                          <MapPin className="h-3 w-3" />
                          {login.city
                            ? `${login.city}, ${login.country}`
                            : login.country || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          {getDeviceIcon(login.deviceType)}
                          <span className="text-zinc-400">
                            {login.browser || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {login.isSuccessful ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle className="h-3 w-3" /> Başarılı
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 text-xs">
                            <XCircle className="h-3 w-3" /> Başarısız
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {format(new Date(login.createdAt), "d MMM yyyy HH:mm", {
                          locale: tr,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loginHistory.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Giriş geçmişi bulunamadı</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Rol Düzenle" : "Yeni Rol Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Rol Adı (key) *
                </label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="content_manager"
                  className="bg-zinc-800 border-white/10"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Görünen Ad *
                </label>
                <Input
                  value={form.displayName}
                  onChange={e =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  placeholder="İçerik Yöneticisi"
                  className="bg-zinc-800 border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Açıklama
              </label>
              <Textarea
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Bu rol hakkında açıklama..."
                className="bg-zinc-800 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Yetkiler
              </label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h5 className="text-xs font-medium text-zinc-500 mb-2">
                      {category}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {perms.map(perm => (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => togglePermission(perm.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            form.permissions.includes(perm.key)
                              ? "bg-[#00F5FF] text-black"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          {perm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDialog}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-[#00F5FF] hover:bg-[#00F5FF] text-black"
                onClick={handleSubmit}
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
              >
                {createRoleMutation.isPending || updateRoleMutation.isPending
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
