import { motion } from "framer-motion";
import { Users, ArrowRight, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function CommunityCharacters() {
  const [, navigate] = useLocation();

  const { data: characters, isLoading } = trpc.aiCharacters.getPopular.useQuery(
    { limit: 8 },
    { staleTime: 1000 * 60 * 5 } // Cache for 5 minutes
  );

  // Don't render if no public characters
  if (!isLoading && (!characters || characters.length === 0)) {
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
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 mb-6">
            <Users className="h-4 w-4 text-[#7C3AED]" />
            <span className="text-sm font-medium text-[#7C3AED]">Topluluk</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4">
            AI Influencer'lar
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Topluluğumuz tarafından oluşturulan popüler AI karakterleri keşfedin
          </p>
        </motion.div>

        {/* Characters Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {characters?.map((character, i) => (
              <motion.div
                key={character.id}
                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-[#7C3AED]/30 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Character Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={character.characterImageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Character Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-[#F9FAFB] truncate">
                      {character.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <User className="h-3 w-3" />
                        <span className="truncate">{character.userName}</span>
                      </div>
                    </div>
                    {character.usageCount > 0 && (
                      <div className="flex items-center gap-1 text-[#7C3AED] text-xs mt-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{character.usageCount} görsel</span>
                      </div>
                    )}
                  </div>

                  {/* Style Badge */}
                  {character.style && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-white/10 backdrop-blur-md rounded-full text-white/80">
                        {character.style}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-white/20 hover:bg-white/10 hover:border-[#7C3AED]/30 group"
            onClick={() => navigate("/community-characters")}
          >
            Tümünü Gör
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
