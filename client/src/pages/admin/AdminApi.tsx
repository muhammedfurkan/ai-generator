/**
 * Admin API - API Durumu ve İstatistikleri
 */
import { motion } from "framer-motion";
import {
  Server,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Zap,
  Image,
  Video,
} from "lucide-react";

export default function AdminApi() {
  // Placeholder API status data
  const apis = [
    {
      name: "Nano Banana API",
      status: "online",
      latency: 245,
      requests: 1234,
      errors: 12,
      description: "Görsel üretimi için ana API",
    },
    {
      name: "Kie AI API",
      status: "online",
      latency: 890,
      requests: 567,
      errors: 3,
      description: "Video üretimi (Veo, Kling)",
    },
    {
      name: "LLM API",
      status: "online",
      latency: 120,
      requests: 2345,
      errors: 0,
      description: "Prompt geliştirme",
    },
    {
      name: "Storage (R2/S3)",
      status: "online",
      latency: 45,
      requests: 8901,
      errors: 2,
      description: "Dosya depolama",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-400";
      case "degraded":
        return "text-yellow-400";
      case "offline":
        return "text-red-400";
      default:
        return "text-zinc-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "degraded":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "offline":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">API Durumu</h2>
        <p className="text-sm text-zinc-500">
          Harici servis bağlantıları ve istatistikler
        </p>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 rounded-2xl border border-green-500/30 p-5"
        >
          <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-green-400">4/4</p>
          <p className="text-xs text-zinc-500">Aktif Servis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#00F5FF]/10 rounded-2xl border border-[#00F5FF]/30 p-5"
        >
          <Zap className="h-6 w-6 text-[#00F5FF] mb-2" />
          <p className="text-2xl font-bold text-[#00F5FF]">325ms</p>
          <p className="text-xs text-zinc-500">Ort. Latency</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#7C3AED]/10 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <Image className="h-6 w-6 text-[#7C3AED] mb-2" />
          <p className="text-2xl font-bold text-[#7C3AED]">13K</p>
          <p className="text-xs text-zinc-500">Bugün İstek</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 rounded-2xl border border-red-500/30 p-5"
        >
          <XCircle className="h-6 w-6 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-red-400">17</p>
          <p className="text-xs text-zinc-500">Hata</p>
        </motion.div>
      </div>

      {/* API List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {apis.map((api, index) => (
          <div
            key={api.name}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-zinc-800">
                  <Server className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{api.name}</h3>
                    {getStatusIcon(api.status)}
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {api.description}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-lg font-bold ${getStatusColor(api.status)}`}
                >
                  {api.status === "online" ? "Çalışıyor" : api.status}
                </p>
                <p className="text-xs text-zinc-500">{api.latency}ms latency</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">
                  {api.requests.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">İstek</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">
                  {(((api.requests - api.errors) / api.requests) * 100).toFixed(
                    1
                  )}
                  %
                </p>
                <p className="text-xs text-zinc-500">Başarı</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{api.errors}</p>
                <p className="text-xs text-zinc-500">Hata</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Note */}
      <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4 text-sm text-zinc-500">
        <p>
          💡 Gerçek API istatistikleri için apiUsageStats tablosuna veri
          kaydedilmeli. Bu sayfada örnek veriler gösterilmektedir.
        </p>
      </div>
    </div>
  );
}
