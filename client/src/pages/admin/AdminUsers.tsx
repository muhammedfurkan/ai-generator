/**
 * Admin Users - Kullanıcı Yönetimi
 * Kullanıcı listesi, detay görünümü, kredi/rol yönetimi
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Shield,
  ShieldCheck,
  Trash2,
  Eye,
  CreditCard,
  Image,
  Video,
  Calendar,
  Mail,
  User,
  MoreHorizontal,
  Download,
  Filter,
  X,
  Ban,
  AlertTriangle,
  Globe,
  RefreshCw,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminUsers() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditAction, setCreditAction] = useState<"add" | "deduct">("add");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banIp, setBanIp] = useState(true);
  const [banEmail, setBanEmail] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    credits: 100,
    role: "user" as "user" | "admin",
  });
  const itemsPerPage = 25;

  // Queries
  const usersQuery = trpc.admin.getAllUsers.useQuery(
    { limit: 100, offset: 0 },
    { staleTime: 30000 }
  );

  const userDetailsQuery = trpc.adminPanel.getUserDetails.useQuery(
    { userId: selectedUser || 0 },
    { enabled: !!selectedUser }
  );

  // Mutations
  const addCreditsMutation = trpc.admin.addCreditsToUser.useMutation({
    onSuccess: () => {
      toast.success("Kredi başarıyla eklendi");
      usersQuery.refetch();
      userDetailsQuery.refetch();
      setCreditDialogOpen(false);
      setCreditAmount("");
      setCreditReason("");
    },
    onError: error => toast.error(error.message),
  });

  const deductCreditsMutation = trpc.admin.deductCreditsFromUser.useMutation({
    onSuccess: () => {
      toast.success("Kredi başarıyla düşüldü");
      usersQuery.refetch();
      userDetailsQuery.refetch();
      setCreditDialogOpen(false);
      setCreditAmount("");
      setCreditReason("");
    },
    onError: error => toast.error(error.message),
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı rolü güncellendi");
      usersQuery.refetch();
      userDetailsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı silindi");
      usersQuery.refetch();
      setSelectedUser(null);
    },
    onError: error => toast.error(error.message),
  });

  const banUserMutation = trpc.adminPanel.banUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı yasaklandı");
      usersQuery.refetch();
      userDetailsQuery.refetch();
      setBanDialogOpen(false);
      setBanReason("");
    },
    onError: error => toast.error(error.message),
  });

  const unbanUserMutation = trpc.adminPanel.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı yasağı kaldırıldı");
      usersQuery.refetch();
      userDetailsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const createUserMutation = trpc.adminPanel.createUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı başarıyla oluşturuldu");
      usersQuery.refetch();
      setCreateDialogOpen(false);
      setNewUserForm({
        name: "",
        email: "",
        password: "",
        credits: 100,
        role: "user",
      });
    },
    onError: error => toast.error(error.message),
  });

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    if (!usersQuery.data?.users) return [];
    return usersQuery.data.users.filter(u => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toString().includes(searchQuery);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersQuery.data?.users, searchQuery, roleFilter]);

  const paginatedUsers = filteredUsers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleCreditAction = () => {
    if (!selectedUser || !creditAmount) return;
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Geçerli bir miktar girin");
      return;
    }

    if (creditAction === "add") {
      addCreditsMutation.mutate({
        userId: selectedUser,
        amount,
        reason: creditReason || "Admin tarafından eklendi",
      });
    } else {
      deductCreditsMutation.mutate({
        userId: selectedUser,
        amount,
        reason: creditReason || "Admin tarafından düşüldü",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <Input
            placeholder="Kullanıcı ara (ad, email, ID)..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-12 bg-zinc-900 border-white/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="user">Kullanıcı</option>
          </select>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Dışa Aktar
        </Button>
        <Button
          className="bg-[#00F5FF] hover:bg-[#00F5FF] text-black gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Kullanıcı Ekle
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-800/50">
                    <th className="px-4 py-3 text-left font-semibold">
                      Kullanıcı
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Kredi</th>
                    <th className="px-4 py-3 text-left font-semibold">Rol</th>
                    <th className="px-4 py-3 text-left font-semibold">Kayıt</th>
                    <th className="px-4 py-3 text-left font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(user => (
                    <tr
                      key={user.id}
                      className={`
                        border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer
                        ${selectedUser === user.id ? "bg-[#00F5FF]/10" : ""}
                      `}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              (user as any).isBanned
                                ? "bg-red-500/30 text-red-300 border border-red-500/50"
                                : "bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] text-black"
                            }`}
                          >
                            {(user as any).isBanned ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              user.name?.[0] || "?"
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-medium ${(user as any).isBanned ? "text-red-300" : ""}`}
                              >
                                {user.name || "İsimsiz"}
                              </p>
                              {(user as any).isBanned && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/30 text-red-300">
                                  Yasaklı
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-[#00F5FF]/20 text-[#00F5FF] px-2 py-1 rounded-full text-xs font-semibold">
                          {user.credits.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-zinc-500/20 text-zinc-400"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "Kullanıcı"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {format(new Date(user.createdAt), "d MMM yyyy", {
                          locale: tr,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedUser(user.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <p className="text-sm text-zinc-500">
                  {filteredUsers.length} kullanıcıdan{" "}
                  {currentPage * itemsPerPage + 1}-
                  {Math.min(
                    (currentPage + 1) * itemsPerPage,
                    filteredUsers.length
                  )}{" "}
                  gösteriliyor
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(p => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* User Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedUser && userDetailsQuery.data ? (
              <motion.div
                key={selectedUser}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6 sticky top-24"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Kullanıcı Detayları</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center text-black text-2xl font-bold">
                    {userDetailsQuery.data.user.name?.[0] || "?"}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      {userDetailsQuery.data.user.name || "İsimsiz"}
                    </h4>
                    <p className="text-sm text-zinc-500">
                      {userDetailsQuery.data.user.email}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        userDetailsQuery.data.user.role === "admin"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {userDetailsQuery.data.user.role === "admin"
                        ? "Admin"
                        : "Kullanıcı"}
                    </span>
                    {(userDetailsQuery.data.user as any).isBanned && (
                      <span className="inline-block mt-1 ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/30 text-red-300">
                        <Ban className="inline h-3 w-3 mr-1" />
                        Yasaklı
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <CreditCard className="h-5 w-5 mx-auto mb-1 text-[#00F5FF]" />
                    <p className="text-lg font-bold">
                      {userDetailsQuery.data.user.credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">Kredi</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <Image className="h-5 w-5 mx-auto mb-1 text-[#7C3AED]" />
                    <p className="text-lg font-bold">
                      {userDetailsQuery.data.stats.totalImages}
                    </p>
                    <p className="text-xs text-zinc-500">Görsel</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <Video className="h-5 w-5 mx-auto mb-1 text-[#FF2E97]" />
                    <p className="text-lg font-bold">
                      {userDetailsQuery.data.stats.totalVideos}
                    </p>
                    <p className="text-xs text-zinc-500">Video</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-green-400" />
                    <p className="text-lg font-bold">
                      {format(
                        new Date(userDetailsQuery.data.user.createdAt),
                        "d MMM",
                        {
                          locale: tr,
                        }
                      )}
                    </p>
                    <p className="text-xs text-zinc-500">Kayıt</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start gap-2 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    onClick={() => {
                      setCreditAction("add");
                      setCreditDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Kredi Ekle
                  </Button>
                  <Button
                    className="w-full justify-start gap-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    onClick={() => {
                      setCreditAction("deduct");
                      setCreditDialogOpen(true);
                    }}
                  >
                    <Minus className="h-4 w-4" />
                    Kredi Düş
                  </Button>
                  <Button
                    className="w-full justify-start gap-2 bg-[#00F5FF]/20 text-[#00F5FF] hover:bg-[#00F5FF]/30"
                    onClick={() => {
                      const newRole =
                        userDetailsQuery.data!.user.role === "admin"
                          ? "user"
                          : "admin";
                      if (
                        confirm(
                          `Kullanıcıyı ${newRole === "admin" ? "admin" : "normal kullanıcı"} yapmak istiyor musunuz?`
                        )
                      ) {
                        updateRoleMutation.mutate({
                          userId: selectedUser,
                          role: newRole,
                        });
                      }
                    }}
                  >
                    {userDetailsQuery.data.user.role === "admin" ? (
                      <>
                        <Shield className="h-4 w-4" />
                        Admin Yetkisini Kaldır
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Admin Yap
                      </>
                    )}
                  </Button>
                  <Button
                    className="w-full justify-start gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    onClick={() => {
                      if (
                        confirm(
                          "Bu kullanıcıyı silmek istediğinize emin misiniz?"
                        )
                      ) {
                        deleteUserMutation.mutate({ userId: selectedUser });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Kullanıcıyı Sil
                  </Button>

                  {/* Ban/Unban Button */}
                  {(userDetailsQuery.data.user as any).isBanned ? (
                    <Button
                      className="w-full justify-start gap-2 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      onClick={() => {
                        if (
                          confirm(
                            "Bu kullanıcının yasağını kaldırmak istiyor musunuz?"
                          )
                        ) {
                          unbanUserMutation.mutate({ userId: selectedUser });
                        }
                      }}
                      disabled={unbanUserMutation.isPending}
                    >
                      {unbanUserMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      Yasağı Kaldır
                    </Button>
                  ) : (
                    <Button
                      className="w-full justify-start gap-2 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30"
                      onClick={() => setBanDialogOpen(true)}
                    >
                      <Ban className="h-4 w-4" />
                      Kullanıcıyı Yasakla
                    </Button>
                  )}
                </div>

                {/* Recent Transactions */}
                {userDetailsQuery.data.transactions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Son İşlemler</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetailsQuery.data.transactions
                        .slice(0, 5)
                        .map(tx => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between text-sm bg-zinc-800/50 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  tx.type === "add"
                                    ? "bg-green-400"
                                    : tx.type === "deduct"
                                      ? "bg-red-400"
                                      : "bg-[#00F5FF]"
                                }`}
                              />
                              <span className="text-zinc-400 text-xs truncate max-w-[120px]">
                                {tx.reason}
                              </span>
                            </div>
                            <span
                              className={`font-semibold ${
                                tx.type === "add"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {tx.type === "add" ? "+" : "-"}
                              {tx.amount}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6 text-center"
              >
                <User className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Kullanıcı seçin</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Detayları görüntülemek için listeden bir kullanıcı seçin
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Credit Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>
              {creditAction === "add" ? "Kredi Ekle" : "Kredi Düş"}
            </DialogTitle>
            <DialogDescription>
              {creditAction === "add"
                ? "Kullanıcıya manuel olarak kredi ekleyin"
                : "Kullanıcının kredisinden düşüm yapın"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Miktar</label>
              <Input
                type="number"
                placeholder="Kredi miktarı..."
                value={creditAmount}
                onChange={e => setCreditAmount(e.target.value)}
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sebep (Opsiyonel)
              </label>
              <Input
                placeholder="İşlem sebebi..."
                value={creditReason}
                onChange={e => setCreditReason(e.target.value)}
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCreditDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                className={`flex-1 ${
                  creditAction === "add"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                onClick={handleCreditAction}
                disabled={
                  addCreditsMutation.isPending ||
                  deductCreditsMutation.isPending
                }
              >
                {creditAction === "add" ? "Ekle" : "Düş"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Kullanıcıyı Yasakla
            </DialogTitle>
            <DialogDescription>
              Bu kullanıcı sisteme giriş yapamayacak ve yeni hesap
              oluşturamayacak.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedUser && userDetailsQuery.data && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="font-medium">
                  {userDetailsQuery.data.user.name || "İsimsiz"}
                </p>
                <p className="text-sm text-zinc-500">
                  {userDetailsQuery.data.user.email}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Yasaklama Sebebi
              </label>
              <Textarea
                placeholder="Yasaklama sebebini yazın..."
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                className="bg-zinc-800 border-white/10"
                rows={2}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="font-medium text-sm">
                      IP Adresini de Yasakla
                    </p>
                    <p className="text-xs text-zinc-500">
                      Aynı IP'den kayıt engellenecek
                    </p>
                  </div>
                </div>
                <Switch checked={banIp} onCheckedChange={setBanIp} />
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="font-medium text-sm">
                      Email Adresini de Yasakla
                    </p>
                    <p className="text-xs text-zinc-500">
                      Aynı email ile kayıt engellenecek
                    </p>
                  </div>
                </div>
                <Switch checked={banEmail} onCheckedChange={setBanEmail} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setBanDialogOpen(false);
                  setBanReason("");
                }}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  if (selectedUser) {
                    banUserMutation.mutate({
                      userId: selectedUser,
                      reason: banReason || undefined,
                      banIp,
                      banEmail,
                    });
                  }
                }}
                disabled={banUserMutation.isPending}
              >
                {banUserMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Yasakla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            <DialogDescription>
              Manuel olarak yeni bir kullanıcı hesabı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ad Soyad *
              </label>
              <Input
                placeholder="Kullanıcı adı..."
                value={newUserForm.name}
                onChange={e =>
                  setNewUserForm({ ...newUserForm, name: e.target.value })
                }
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                E-posta *
              </label>
              <Input
                type="email"
                placeholder="kullanici@example.com"
                value={newUserForm.email}
                onChange={e =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Şifre *</label>
              <Input
                type="password"
                placeholder="Şifre (en az 6 karakter)"
                value={newUserForm.password}
                onChange={e =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Başlangıç Kredisi
                </label>
                <Input
                  type="number"
                  value={newUserForm.credits}
                  onChange={e =>
                    setNewUserForm({
                      ...newUserForm,
                      credits: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-800 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rol</label>
                <select
                  value={newUserForm.role}
                  onChange={e =>
                    setNewUserForm({
                      ...newUserForm,
                      role: e.target.value as "user" | "admin",
                    })
                  }
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewUserForm({
                    name: "",
                    email: "",
                    password: "",
                    credits: 100,
                    role: "user",
                  });
                }}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-[#00F5FF] hover:bg-[#00F5FF] text-black"
                onClick={() => {
                  if (
                    !newUserForm.name ||
                    !newUserForm.email ||
                    !newUserForm.password
                  ) {
                    toast.error("Lütfen zorunlu alanları doldurun");
                    return;
                  }
                  if (newUserForm.password.length < 6) {
                    toast.error("Şifre en az 6 karakter olmalıdır");
                    return;
                  }
                  createUserMutation.mutate(newUserForm);
                }}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Oluştur
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
