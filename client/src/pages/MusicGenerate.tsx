import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Music,
  Play,
  Pause,
  Download,
  Trash2,
  Sparkles,
  ChevronDown,
  MicVocal,
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { useLocation } from "wouter";

const EXAMPLE_LYRICS = `[Verse 1]
İstanbul sokaklarında yürürüm gece yarısı
Boğaz'ın sesi gelir, rüzgar saçlarımı tarıyor
Her köşede bir hikaye, her yüzde bir dünya
Bu şehir hiç uyumaz, ben de uyuyamam

[Chorus]
Seni arıyorum bu gece
Kalbim sana koşuyor
Şehrin ışıkları yanıyor
Sadece sen yoksun burada`;

const STYLE_EXAMPLES = [
  { label: "Pop", value: "upbeat Turkish pop song, modern production" },
  { label: "Akustik", value: "acoustic guitar, emotional, calm Turkish folk" },
  { label: "Elektronik", value: "electronic dance, energetic, synth-heavy" },
  { label: "R&B", value: "soulful R&B, smooth vocals, chill beats" },
  { label: "Rock", value: "rock band, electric guitars, powerful drums" },
];

function MusicPlayer({ url, label }: { url: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
      >
        {playing ? (
          <Pause className="h-4 w-4 text-white" />
        ) : (
          <Play className="h-4 w-4 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 truncate">{label}</p>
        <div className="flex gap-0.5 mt-1.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-1 rounded-full",
                playing ? "bg-[#7C3AED] animate-pulse" : "bg-white/20"
              )}
              style={playing ? { animationDelay: `${i * 50}ms` } : undefined}
            />
          ))}
        </div>
      </div>
      <a
        href={url}
        download
        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <Download className="h-4 w-4 text-white/70" />
      </a>
    </div>
  );
}

export default function MusicGenerate() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [lyrics, setLyrics] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // tRPC
  const pricingQuery = trpc.musicGeneration.getPricing.useQuery();
  const historyQuery = trpc.musicGeneration.list.useQuery(
    { limit: 20, offset: 0 },
    { enabled: showHistory && isAuthenticated }
  );

  const creditCost = pricingQuery.data?.credits ?? 20;

  const generateMutation = trpc.musicGeneration.generate.useMutation({
    onSuccess: () => {
      toast.success("Müzik başarıyla üretildi!");
      historyQuery.refetch();
    },
    onError: err => {
      toast.error(err.message || "Müzik üretimi başarısız oldu.");
    },
  });

  const deleteMutation = trpc.musicGeneration.delete.useMutation({
    onSuccess: () => {
      toast.success("Kayıt silindi.");
      historyQuery.refetch();
    },
  });

  const handleGenerate = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!lyrics.trim()) {
      toast.error("Lütfen şarkı sözü girin.");
      return;
    }

    generateMutation.mutate({
      lyrics: lyrics.trim(),
      prompt: stylePrompt.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8 pt-20">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-6 w-6 text-[#7C3AED]" />
            <h1 className="text-2xl font-bold">Müzik Üretimi</h1>
          </div>
          <p className="text-white/50 text-sm">
            Şarkı sözlerinden orijinal müzik üret — Minimax Music 2.5
          </p>
        </div>

        {/* Model Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 mb-6">
          <span className="text-sm">🎵</span>
          <span className="text-xs font-medium text-[#9D6EFF]">
            Minimax Music 2.5
          </span>
        </div>

        {/* Style Prompt */}
        <div className="mb-4">
          <label className="text-xs text-white/50 mb-2 block">
            Stil (opsiyonel)
          </label>
          <input
            type="text"
            value={stylePrompt}
            onChange={e => setStylePrompt(e.target.value)}
            placeholder="Örn: upbeat Turkish pop, acoustic guitar, energetic..."
            maxLength={500}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
          {/* Quick style chips */}
          <div className="flex gap-2 flex-wrap mt-2">
            {STYLE_EXAMPLES.map(s => (
              <button
                key={s.label}
                onClick={() => setStylePrompt(s.value)}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:text-white/80 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lyrics Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-white/50 flex items-center gap-1.5">
              <MicVocal className="h-3.5 w-3.5" />
              Şarkı Sözleri ({lyrics.length}/3500)
            </label>
            <button
              onClick={() => setLyrics(EXAMPLE_LYRICS)}
              className="text-xs text-[#7C3AED] hover:text-[#9D6EFF] transition-colors"
            >
              Örnek kullan
            </button>
          </div>
          <Textarea
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            placeholder="[Verse 1]&#10;Şarkı sözlerinizi buraya girin...&#10;&#10;[Chorus]&#10;Nakarat..."
            maxLength={3500}
            rows={10}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#7C3AED] resize-none font-mono text-sm"
          />
          <p className="text-xs text-white/30 mt-1.5">
            İpucu: [Verse 1], [Chorus], [Bridge] gibi etiketler
            kullanabilirsiniz.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !lyrics.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9D4EDD] font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Müzik Üretiliyor...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Müzik Üret ({creditCost} Kredi)
            </>
          )}
        </button>

        {generateMutation.isPending && (
          <p className="text-center text-xs text-white/30 mb-4">
            Müzik üretimi 30–60 saniye sürebilir, lütfen bekleyin...
          </p>
        )}

        {/* Latest result */}
        {generateMutation.data?.audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-xs text-white/40 mb-2">Son üretilen müzik:</p>
            <MusicPlayer
              url={generateMutation.data.audioUrl}
              label={lyrics.slice(0, 60) + "..."}
            />
          </motion.div>
        )}

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showHistory && "rotate-180"
            )}
          />
          {showHistory ? "Geçmişi Gizle" : "Müzik Geçmişi"}
        </button>

        {/* History List */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {historyQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
                </div>
              ) : historyQuery.data?.items.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-8">
                  Henüz müzik üretmediniz.
                </p>
              ) : (
                historyQuery.data?.items.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#9D6EFF]">
                          {item.model}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          deleteMutation.mutate({ musicId: item.id })
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.prompt && (
                      <p className="text-xs text-[#9D6EFF]/70 mb-1.5">
                        🎨 {item.prompt}
                      </p>
                    )}
                    <p className="text-xs text-white/50 mb-2 line-clamp-2 font-mono">
                      {item.lyrics}
                    </p>
                    {item.status === "completed" && item.audioUrl ? (
                      <MusicPlayer
                        url={item.audioUrl}
                        label={item.lyrics.slice(0, 50)}
                      />
                    ) : item.status === "failed" ? (
                      <p className="text-xs text-red-400">
                        {item.errorMessage}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-white/30">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        İşleniyor...
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
