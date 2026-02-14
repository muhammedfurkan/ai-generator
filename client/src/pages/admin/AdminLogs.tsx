/**
 * Admin Logs - Aktivite Logları
 */
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Activity,
  User,
  Settings,
  CreditCard,
  Package,
  Tag,
  Megaphone,
  FileText,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminLogs() {
  const logsQuery = trpc.adminPanel.getActivityLogs.useQuery({ limit: 100, offset: 0 });

  const getActionIcon = (action: string) => {
    if (action.includes("user")) return <User className="h-4 w-4" />;
    if (action.includes("credit") || action.includes("package")) return <CreditCard className="h-4 w-4" />;
    if (action.includes("setting")) return <Settings className="h-4 w-4" />;
    if (action.includes("discount")) return <Tag className="h-4 w-4" />;
    if (action.includes("announcement")) return <Megaphone className="h-4 w-4" />;
    if (action.includes("faq") || action.includes("blog")) return <FileText className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-500/20 text-green-400";
    if (action.includes("update")) return "bg-blue-500/20 text-blue-400";
    if (action.includes("delete")) return "bg-red-500/20 text-red-400";
    return "bg-zinc-500/20 text-zinc-400";
  };

  const formatAction = (action: string) => {
    const parts = action.split(".");
    const entity = parts[0];
    const verb = parts[1];

    const entities: Record<string, string> = {
      user: "Kullanıcı",
      setting: "Ayar",
      package: "Paket",
      discount: "İndirim",
      pricing: "Fiyat",
      announcement: "Duyuru",
      faq: "SSS",
      feedback: "Feedback",
      character: "Karakter",
      viralApp: "Viral App",
    };

    const verbs: Record<string, string> = {
      create: "oluşturuldu",
      update: "güncellendi",
      delete: "silindi",
      moderate: "moderasyon yapıldı",
    };

    return `${entities[entity] || entity} ${verbs[verb] || verb}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Aktivite Logları</h2>
          <p className="text-sm text-zinc-500">Admin işlem geçmişi</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => logsQuery.refetch()}
        >
          <RefreshCw className={`h-4 w-4 ${logsQuery.isFetching ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10"
      >
        <div className="divide-y divide-white/5">
          {logsQuery.data?.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4">
              <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{formatAction(log.action)}</span>
                  {log.entityId && (
                    <span className="text-xs text-zinc-500 font-mono">
                      #{log.entityId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                  <User className="h-3 w-3" />
                  <span>{log.userName || `Kullanıcı #${log.userId}`}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(log.action)}`}>
                {log.action.split(".")[1]}
              </span>
            </div>
          ))}
        </div>

        {logsQuery.data?.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Henüz aktivite kaydı yok</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
