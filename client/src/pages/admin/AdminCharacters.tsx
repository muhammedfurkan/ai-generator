/**
 * Admin Characters - AI Karakter Moderasyonu
 */
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image, Eye, EyeOff, User, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminCharacters() {
  const charactersQuery = trpc.adminPanel.getPendingCharacters.useQuery();

  const toggleMutation = trpc.adminPanel.toggleCharacterPublic.useMutation({
    onSuccess: () => {
      toast.success("Karakter durumu güncellendi");
      charactersQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">AI Karakter Moderasyonu</h2>
        <p className="text-sm text-zinc-500">
          Topluluk tarafından paylaşılan karakterleri yönetin
        </p>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {charactersQuery.data?.map(character => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden group"
          >
            {/* Character Image */}
            <div className="aspect-square relative bg-zinc-800">
              {character.characterImageUrl ? (
                <img
                  src={character.characterImageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-12 w-12 text-zinc-600" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-3 w-full">
                  <Button
                    size="sm"
                    className={`w-full gap-1 ${
                      character.isPublic
                        ? "bg-red-500/80 hover:bg-red-600"
                        : "bg-green-500/80 hover:bg-green-600"
                    }`}
                    onClick={() =>
                      toggleMutation.mutate({
                        id: character.id,
                        isPublic: !character.isPublic,
                      })
                    }
                  >
                    {character.isPublic ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Gizle
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        Yayınla
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-medium truncate">{character.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                <User className="h-3 w-3" />
                <span className="truncate">{character.userName}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <TrendingUp className="h-3 w-3" />
                  {character.usageCount} kullanım
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    character.isPublic
                      ? "bg-green-500/20 text-green-400"
                      : "bg-zinc-500/20 text-zinc-400"
                  }`}
                >
                  {character.isPublic ? "Yayında" : "Gizli"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {charactersQuery.data?.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
          <Image className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-500">Paylaşılan karakter bulunamadı</p>
        </div>
      )}
    </div>
  );
}
