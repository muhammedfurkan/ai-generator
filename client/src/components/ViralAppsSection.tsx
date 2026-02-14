import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ViralAppsSection() {
  // Fetch popular apps from database
  const { data: popularApps, isLoading } = trpc.settings.getPopularViralApps.useQuery();

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
        </div>
      </section>
    );
  }

  if (!popularApps || popularApps.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="container py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6">
            <Play className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-300">Viral Video Uygulamaları</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tek Fotoğrafla Viral Videolar
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Fotoğrafınızı yükleyin, uygulama seçin, saniyeler içinde viral video oluşturun
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {popularApps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/apps">
                <div className="group cursor-pointer">
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                    <img
                      src={app.coverImage}
                      alt={app.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-lg">{app.title}</h3>
                      <p className="text-white/70 text-sm line-clamp-1">{app.description}</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {app.credits} Kredi
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/apps">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-white/20 hover:bg-white/10 group"
            >
              <Sparkles className="w-5 h-5 mr-2 text-pink-400" />
              Tüm Uygulamaları Gör
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

