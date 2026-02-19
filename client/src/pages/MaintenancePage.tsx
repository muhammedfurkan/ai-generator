/**
 * Maintenance Page - Bakım Sayfası
 * Site bakım modundayken kullanıcılara gösterilir
 */
import { motion } from "framer-motion";
import { Wrench, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface MaintenancePageProps {
  message?: string;
}

export default function MaintenancePage({ message }: MaintenancePageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        {/* Animated Wrench Icon */}
        <motion.div
          animate={{
            rotate: [0, -20, 20, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-8"
        >
          <Wrench className="h-12 w-12 text-yellow-400" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          {t("maintenance.pageTitle")}
        </h1>

        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
          {message || t("maintenance.defaultMessage")}
        </p>

        {/* Progress Animation */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-full px-4 py-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="h-4 w-4 text-yellow-400" />
            </motion.div>
            <span className="text-sm text-zinc-400">
              {t("maintenance.working")}
            </span>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 rounded-full bg-yellow-400"
            />
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-zinc-800/30 rounded-2xl border border-white/10 p-6 mb-6">
          <h3 className="font-semibold mb-2 text-zinc-300">
            {t("maintenance.whenReady")}
          </h3>
          <p className="text-sm text-zinc-500">{t("maintenance.thanks")}</p>
        </div>

        {/* Social/Contact */}
        <p className="text-xs text-zinc-600">
          {t("maintenance.questions")}{" "}
          <a
            href="mailto:destek@Lumiohan.com"
            className="text-[#00F5FF] hover:underline"
          >
            destek@Lumiohan.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
