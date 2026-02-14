import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Users, User, Sparkles, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function CommunityCharacters() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = trpc.aiCharacters.getPublic.useQuery(
    { limit, offset: page * limit },
    { staleTime: 1000 * 60 * 5 }
  );

  const characters = data?.characters || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Filter by search query (client-side)
  const filteredCharacters = searchQuery
    ? characters.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.style?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : characters;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <motion.div
        className="container py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-[#7C3AED]" />
              Topluluk Karakterleri
            </h1>
            <p className="text-muted-foreground">
              Topluluğumuz tarafından paylaşılan AI Influencer karakterleri
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("communityCharacters.searchPlaceholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-white/5 border-white/10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 flex items-center gap-4">
          <div className="glass-card px-4 py-2 rounded-full">
            <span className="text-sm text-muted-foreground">
              Toplam{" "}
              <span className="font-semibold text-foreground">{total}</span>{" "}
              karakter
            </span>
          </div>
        </div>

        {/* Characters Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Karakter Bulunamadı</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? t("communityCharacters.noResultsFound")
                : t("communityCharacters.noCharactersYet")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCharacters.map((character, i) => (
              <motion.div
                key={character.id}
                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-[#7C3AED]/30 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-full"
            >
              Önceki
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = page < 3 ? i : page - 2 + i;
                if (pageNum >= totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 rounded-full p-0"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-full"
            >
              Sonraki
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
