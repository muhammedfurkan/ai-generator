/**
 * Admin Payments - Ödeme & Finans Paneli
 * Ödeme geçmişi, satış raporları, fraud tespiti
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Package,
  User,
  Calendar,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Ban,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [searchQuery, setSearchQuery] = useState("");

  const paymentsQuery = trpc.adminPanel.getPaymentRecords.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    method: methodFilter === "all" ? undefined : methodFilter,
    days: dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365,
    limit: 100,
    offset: 0,
  });

  const statsQuery = trpc.adminPanel.getPaymentStats.useQuery({
    days: dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365,
  });

  const fraudAlertsQuery = trpc.adminPanel.getFraudAlerts.useQuery();
  const utils = trpc.useUtils();

  const refundMutation = trpc.adminPanel.refundPayment.useMutation({
    onSuccess: () => {
      toast.success("İade işlemi başlatıldı");
      utils.adminPanel.getPaymentRecords.invalidate();
      utils.adminPanel.getPaymentStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      pending: { color: "bg-yellow-500/20 text-yellow-400", label: "Bekliyor", icon: <Clock className="h-3 w-3" /> },
      completed: { color: "bg-green-500/20 text-green-400", label: "Tamamlandı", icon: <CheckCircle className="h-3 w-3" /> },
      failed: { color: "bg-red-500/20 text-red-400", label: "Başarısız", icon: <XCircle className="h-3 w-3" /> },
      refunded: { color: "bg-purple-500/20 text-purple-400", label: "İade", icon: <TrendingDown className="h-3 w-3" /> },
      cancelled: { color: "bg-zinc-500/20 text-zinc-400", label: "İptal", icon: <XCircle className="h-3 w-3" /> },
      disputed: { color: "bg-orange-500/20 text-orange-400", label: "İtiraz", icon: <AlertTriangle className="h-3 w-3" /> },
    };
    const c = config[status] || { color: "bg-zinc-500/20 text-zinc-400", label: status, icon: null };
    return (
      <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: "Kredi Kartı",
      debit_card: "Banka Kartı",
      crypto: "Kripto",
      bank_transfer: "Havale",
      paypal: "PayPal",
      other: "Diğer",
    };
    return labels[method] || method;
  };

  const payments = paymentsQuery.data?.payments || [];
  const stats = statsQuery.data;
  const fraudAlerts = fraudAlertsQuery.data || [];

  // Filter by search
  const filteredPayments = payments.filter((p: any) =>
    p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.externalTransactionId?.includes(searchQuery) ||
    String(p.id).includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Gelir</p>
              <p className="text-2xl font-bold">₺{Number(stats?.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-green-400">${Number(stats?.totalRevenueUsd || 0).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl border border-blue-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Başarılı İşlem</p>
              <p className="text-2xl font-bold">{stats?.successfulCount || 0}</p>
              <p className="text-xs text-blue-400">%{(Number(stats?.successRate || 0) * 100).toFixed(1)} başarı</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/20">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl border border-purple-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">İade</p>
              <p className="text-2xl font-bold">₺{Number(stats?.refundedAmount || 0).toLocaleString()}</p>
              <p className="text-xs text-purple-400">{stats?.refundedCount || 0} işlem</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <TrendingDown className="h-6 w-6 text-purple-400" />
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
              <p className="text-sm text-zinc-400">Fraud Uyarıları</p>
              <p className="text-2xl font-bold">{fraudAlerts.length}</p>
              <p className="text-xs text-red-400">Son 30 gün</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/20">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
            <CreditCard className="h-4 w-4 mr-2" />
            İşlemler
          </TabsTrigger>
          <TabsTrigger value="packages" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
            <Package className="h-4 w-4 mr-2" />
            Paket Raporu
          </TabsTrigger>
          <TabsTrigger value="methods" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
            <PieChart className="h-4 w-4 mr-2" />
            Yöntem Raporu
          </TabsTrigger>
          <TabsTrigger value="fraud" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
            <Shield className="h-4 w-4 mr-2" />
            Fraud ({fraudAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-zinc-800 border-white/10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-zinc-800 border-white/10">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                  <SelectItem value="refunded">İade</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-40 bg-zinc-800 border-white/10">
                  <SelectValue placeholder="Yöntem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="debit_card">Banka Kartı</SelectItem>
                  <SelectItem value="crypto">Kripto</SelectItem>
                  <SelectItem value="bank_transfer">Havale</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32 bg-zinc-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Gün</SelectItem>
                  <SelectItem value="30d">30 Gün</SelectItem>
                  <SelectItem value="90d">90 Gün</SelectItem>
                  <SelectItem value="365d">1 Yıl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  paymentsQuery.refetch();
                  statsQuery.refetch();
                }}
              >
                <RefreshCw className={`h-4 w-4 ${paymentsQuery.isFetching ? "animate-spin" : ""}`} />
                Yenile
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Dışa Aktar
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Kullanıcı</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Paket</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tutar</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Yöntem</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Durum</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tarih</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono">#{payment.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          <div>
                            <p className="text-sm">{payment.userName || `User #${payment.userId}`}</p>
                            <p className="text-xs text-zinc-500">{payment.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm">{payment.packageName || "-"}</p>
                          <p className="text-xs text-lime-400">{payment.credits} kredi</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">₺{Number(payment.amount || 0).toLocaleString()}</p>
                        {payment.discountAmount && (
                          <p className="text-xs text-green-400">-₺{Number(payment.discountAmount || 0).toFixed(2)} indirim</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-sm">
                          {getMethodIcon(payment.paymentMethod)}
                          {getMethodLabel(payment.paymentMethod)}
                        </span>
                        {payment.cardLastFour && (
                          <p className="text-xs text-zinc-500">****{payment.cardLastFour}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {format(new Date(payment.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {payment.status === "completed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            onClick={() => {
                              if (confirm("Bu ödemeyi iade etmek istediğinizden emin misiniz?")) {
                                refundMutation.mutate({ id: payment.id });
                              }
                            }}
                          >
                            İade
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Ödeme kaydı bulunamadı</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Package Report Tab */}
        <TabsContent value="packages" className="mt-6">
          <div className="grid gap-4">
            {stats?.packageBreakdown?.map((pkg: any) => (
              <motion.div
                key={pkg.packageId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-lime-500/20">
                      <Package className="h-5 w-5 text-lime-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{pkg.packageName}</h4>
                      <p className="text-sm text-zinc-500">{pkg.credits} kredi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₺{Number(pkg.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-sm text-zinc-400">{pkg.saleCount} satış</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-500"
                    style={{ width: `${((pkg.saleCount / (stats?.totalSales || 1)) * 100)}%` }}
                  />
                </div>
              </motion.div>
            ))}

            {(!stats?.packageBreakdown || stats.packageBreakdown.length === 0) && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">Paket satış verisi bulunamadı</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Payment Methods Report Tab */}
        <TabsContent value="methods" className="mt-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {stats?.methodBreakdown?.map((method: any) => (
              <motion.div
                key={method.method}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      {getMethodIcon(method.method)}
                    </div>
                    <span className="font-medium">{getMethodLabel(method.method)}</span>
                  </div>
                  <span className="text-lg font-bold">₺{Number(method.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-zinc-800/50 rounded-lg py-2">
                    <p className="text-xs text-zinc-500">İşlem</p>
                    <p className="font-medium">{method.count}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg py-2">
                    <p className="text-xs text-zinc-500">Başarı</p>
                    <p className="font-medium text-green-400">%{(Number(method.successRate || 0) * 100).toFixed(0)}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg py-2">
                    <p className="text-xs text-zinc-500">Ort.</p>
                    <p className="font-medium">₺{Number(method.avgAmount || 0).toFixed(0)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Fraud Alerts Tab */}
        <TabsContent value="fraud" className="mt-6">
          <div className="space-y-4">
            {fraudAlerts.map((alert: any) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 rounded-xl border border-red-500/30 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20 mt-0.5">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-red-400">{alert.alertType}</h4>
                      <p className="text-sm text-zinc-400 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {alert.userName || `User #${alert.userId}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(alert.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                        </span>
                        {alert.cardLastFour && (
                          <span>Kart: ****{alert.cardLastFour}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Kullanıcıyı Banla
                  </Button>
                </div>
              </motion.div>
            ))}

            {fraudAlerts.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                <p className="text-zinc-500">Fraud uyarısı bulunmuyor</p>
                <p className="text-xs text-zinc-600 mt-1">Sistemin güvenli görünüyor 🎉</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
