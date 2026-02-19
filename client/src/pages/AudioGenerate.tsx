import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Mic,
  Play,
  Pause,
  Download,
  Trash2,
  Volume2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

type Provider = "minimax" | "elevenlabs";

const PROVIDER_INFO: Record<
  Provider,
  { name: string; icon: string; color: string }
> = {
  minimax: {
    name: "Minimax",
    icon: "🔊",
    color: "from-violet-600 to-purple-700",
  },
  elevenlabs: {
    name: "ElevenLabs",
    icon: "🎙️",
    color: "from-yellow-500 to-orange-600",
  },
};

function AudioPlayer({ url, label }: { url: string; label: string }) {
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
        className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center hover:bg-[#6D28D9] transition-colors shrink-0"
      >
        {playing ? (
          <Pause className="h-4 w-4 text-white" />
        ) : (
          <Play className="h-4 w-4 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 truncate">{label}</p>
        <div className="h-1.5 bg-white/10 rounded-full mt-1">
          <div className="h-full bg-[#7C3AED] rounded-full w-0 animate-pulse" />
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

export default function AudioGenerate() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const [provider, setProvider] = useState<Provider>("minimax");
  const [text, setText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState("Turkish");
  const [showHistory, setShowHistory] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);

  // tRPC queries
  const voicesQuery = trpc.audioGeneration.getVoices.useQuery({ provider });
  const modelsQuery = trpc.audioGeneration.getModels.useQuery({ provider });
  const pricingQuery = trpc.audioGeneration.getPricing.useQuery();
  const historyQuery = trpc.audioGeneration.list.useQuery(
    { limit: 20, offset: 0 },
    { enabled: showHistory && isAuthenticated }
  );

  // Set default voice when voices load
  const voices = voicesQuery.data?.voices ?? [];
  const models = modelsQuery.data?.models ?? [];

  if (voices.length > 0 && !selectedVoiceId) {
    setSelectedVoiceId(voices[0].voice_id);
  }
  if (models.length > 0 && !selectedModel) {
    setSelectedModel(models[0].id);
  }

  const creditCost =
    provider === "minimax"
      ? (pricingQuery.data?.minimax ?? 10)
      : (pricingQuery.data?.elevenlabs ?? 10);

  // Generate mutation
  const generateMutation = trpc.audioGeneration.generate.useMutation({
    onSuccess: () => {
      toast.success("Ses başarıyla üretildi!");
      historyQuery.refetch();
    },
    onError: err => {
      toast.error(err.message || "Ses üretimi başarısız oldu.");
    },
  });

  // Delete mutation
  const deleteMutation = trpc.audioGeneration.delete.useMutation({
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
    if (!text.trim()) {
      toast.error("Lütfen metin girin.");
      return;
    }
    if (!selectedVoiceId) {
      toast.error("Lütfen bir ses seçin.");
      return;
    }

    generateMutation.mutate({
      provider,
      text: text.trim(),
      voiceId: selectedVoiceId,
      model: selectedModel || undefined,
      language,
      speed,
    });
  };

  const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8 pt-20">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-6 w-6 text-[#7C3AED]" />
            <h1 className="text-2xl font-bold">Ses Üretimi (TTS)</h1>
          </div>
          <p className="text-white/50 text-sm">
            Metni sese dönüştür — Minimax veya ElevenLabs ile
          </p>
        </div>

        {/* Provider Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(PROVIDER_INFO) as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => {
                setProvider(p);
                setSelectedVoiceId("");
                setSelectedModel("");
              }}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                provider === p
                  ? "border-[#7C3AED] bg-[#7C3AED]/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              <span className="text-xl">{PROVIDER_INFO[p].icon}</span>
              <div className="text-left">
                <p className="text-sm font-semibold">{PROVIDER_INFO[p].name}</p>
                <p className="text-xs text-white/40">
                  {p === "minimax" ? "Türkçe destekli" : "Çok dilli"}
                </p>
              </div>
              {provider === p && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>

        {/* Voice Selector */}
        <div className="mb-4">
          <label className="text-xs text-white/50 mb-2 block">Ses Seç</label>
          <div className="relative">
            <button
              onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-sm">
                  {selectedVoice
                    ? `${selectedVoice.name} (${selectedVoice.gender}, ${selectedVoice.lang})`
                    : voicesQuery.isLoading
                      ? "Yükleniyor..."
                      : "Ses seçin"}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-white/40 transition-transform",
                  showVoiceDropdown && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showVoiceDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-1 left-0 right-0 z-20 bg-[#1A1F2E] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto"
                >
                  {voices.map(v => (
                    <button
                      key={v.voice_id}
                      onClick={() => {
                        setSelectedVoiceId(v.voice_id);
                        setShowVoiceDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors text-left",
                        selectedVoiceId === v.voice_id && "bg-[#7C3AED]/10"
                      )}
                    >
                      <span className="font-medium">{v.name}</span>
                      <span className="text-white/40 text-xs">
                        {v.gender} · {v.lang}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Model Selector */}
        {models.length > 1 && (
          <div className="mb-4">
            <label className="text-xs text-white/50 mb-2 block">Model</label>
            <div className="flex gap-2 flex-wrap">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border transition-all",
                    selectedModel === m.id
                      ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                  title={m.description}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Speed + Language */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Hız: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#7C3AED]"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Dil</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
            >
              <option value="Turkish">Türkçe</option>
              <option value="English">İngilizce</option>
              <option value="German">Almanca</option>
              <option value="French">Fransızca</option>
              <option value="Spanish">İspanyolca</option>
              <option value="Arabic">Arapça</option>
              <option value="auto">Otomatik</option>
            </select>
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <label className="text-xs text-white/50 mb-2 block">
            Metin ({text.length}/3000)
          </label>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Sese dönüştürmek istediğiniz metni buraya girin..."
            maxLength={3000}
            rows={5}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#7C3AED] resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !text.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9D4EDD] font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Üretiliyor...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Ses Üret ({creditCost} Kredi)
            </>
          )}
        </button>

        {/* Latest result */}
        {generateMutation.data?.audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-xs text-white/40 mb-2">Son üretilen ses:</p>
            <AudioPlayer
              url={generateMutation.data.audioUrl}
              label={text.slice(0, 60) + (text.length > 60 ? "..." : "")}
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
          {showHistory ? "Geçmişi Gizle" : "Ses Geçmişi"}
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
                  Henüz ses üretmediniz.
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
                          {item.provider}
                        </span>
                        <span className="text-xs text-white/30">
                          {item.model}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          deleteMutation.mutate({ audioId: item.id })
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mb-2 line-clamp-2">
                      {item.text}
                    </p>
                    {item.status === "completed" && item.audioUrl ? (
                      <AudioPlayer
                        url={item.audioUrl}
                        label={item.text.slice(0, 50)}
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
