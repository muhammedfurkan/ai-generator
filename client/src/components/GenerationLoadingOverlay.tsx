import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Message pools for different generation types
const MESSAGE_POOLS = {
  default: [
    "🤖 Yapay zekâ düşünüyor…",
    "🧠 Prompt'lar toparlanıyor, panik yok",
    "✨ Piksel piksel sanat işleniyor",
    "🪄 Sihirli kelimeler render ediliyor",
    "🎨 AI sanatçı ilham alıyor",
    "⚙️ Model ayarlanıyor, dokunmayın",
    "🚀 Lumiohan motorları ısınıyor",
    "👀 Birazdan efsane geliyor",
    "🧩 Eksik prompt parçaları tamamlanıyor",
    "😌 İngilizce bilmemen sorun değil",
  ],
  image: [
    "🤖 Yapay zekâ düşünüyor…",
    "🧠 Prompt'lar toparlanıyor, panik yok",
    "✨ Piksel piksel sanat işleniyor",
    "🪄 Sihirli kelimeler render ediliyor",
    "🎨 AI sanatçı ilham alıyor",
    "⚙️ Model ayarlanıyor, dokunmayın",
    "🚀 Lumiohan motorları ısınıyor",
    "👀 Birazdan efsane geliyor",
    "🧩 Eksik prompt parçaları tamamlanıyor",
    "😌 İngilizce bilmemen sorun değil",
    "🖼️ Görsel şekilleniyor...",
    "🌈 Renkler harmanlaniyor",
  ],
  video: [
    "🤖 Yapay zekâ düşünüyor…",
    "🧠 Prompt'lar toparlanıyor, panik yok",
    "🎬 Kareler işleniyor, sabırlı ol",
    "🪄 Sihirli kelimeler render ediliyor",
    "🎥 Video sahneleri oluşturuluyor",
    "⚙️ Model ayarlanıyor, dokunmayın",
    "🚀 Lumiohan motorları ısınıyor",
    "👀 Birazdan efsane geliyor",
    "🎞️ Kare kare işleniyor...",
    "😌 İngilizce bilmemen sorun değil",
    "🎭 Sahne hazırlanıyor...",
    "⏱️ Video render ediliyor, bu biraz zaman alabilir",
  ],
  logo: [
    "🤖 Yapay zekâ düşünüyor…",
    "✨ Logo tasarımı şekilleniyor",
    "🎨 Marka kimliği oluşturuluyor",
    "🪄 Sihirli kelimeler render ediliyor",
    "⚙️ Vektörler hesaplanıyor",
    "🚀 Lumiohan motorları ısınıyor",
    "👀 Birazdan efsane logo geliyor",
    "🧩 Tasarım detayları işleniyor",
    "😌 Profesyonel logo yolda",
  ],
};

// Stage-based messages (V2 ready)
const STAGE_MESSAGES = {
  analyzing: ["🔍 Prompt analiz ediliyor...", "🧠 İstek anlaşılıyor..."],
  generating: ["✨ İçerik oluşturuluyor...", "🎨 AI çalışıyor..."],
  refining: ["💎 Son rötuşlar yapılıyor...", "✅ Neredeyse hazır..."],
};

interface GenerationLoadingOverlayProps {
  isVisible: boolean;
  type?: "default" | "image" | "video" | "logo";
  stage?: "analyzing" | "generating" | "refining";
  progress?: number; // 0-100, optional progress indicator
  onCancel?: () => void;
  className?: string;
}

export default function GenerationLoadingOverlay({
  isVisible,
  type = "default",
  stage,
  progress,
  onCancel,
  className = "",
}: GenerationLoadingOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const lastMessageRef = useRef<string>("");
  const messageCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get appropriate message pool
  const getMessagePool = useCallback(() => {
    if (stage && STAGE_MESSAGES[stage]) {
      return [...STAGE_MESSAGES[stage], ...MESSAGE_POOLS[type].slice(0, 3)];
    }
    return MESSAGE_POOLS[type] || MESSAGE_POOLS.default;
  }, [type, stage]);

  // Get next random message (not same as last)
  const getNextMessage = useCallback(() => {
    const pool = getMessagePool();
    let newMessage = pool[Math.floor(Math.random() * pool.length)];

    // Ensure we don't repeat the same message
    let attempts = 0;
    while (newMessage === lastMessageRef.current && attempts < 10) {
      newMessage = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    }

    lastMessageRef.current = newMessage;
    messageCountRef.current++;
    return newMessage;
  }, [getMessagePool]);

  // Start/stop message rotation
  useEffect(() => {
    if (isVisible) {
      // Set initial message immediately
      setCurrentMessage(getNextMessage());
      messageCountRef.current = 1;

      // Start rotation interval (2.5-3 seconds)
      intervalRef.current = setInterval(
        () => {
          setCurrentMessage(getNextMessage());
          setMessageIndex(prev => prev + 1);
        },
        2500 + Math.random() * 500
      );

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Reset when hidden
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      messageCountRef.current = 0;
      lastMessageRef.current = "";
    }
  }, [isVisible, getNextMessage]);

  // Ensure minimum 1 message shown for fast generations
  useEffect(() => {
    if (!isVisible && messageCountRef.current === 0) {
      // Generation was too fast, show at least one message briefly
      setCurrentMessage(getNextMessage());
    }
  }, [isVisible, getNextMessage]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${className}`}
        >
          <div className="w-full max-w-md mx-4 text-center">
            {/* Loading Animation */}
            <div className="relative mb-8">
              {/* Outer ring */}
              <div className="w-24 h-24 mx-auto relative">
                <motion.div
                  className="ai-loader-ring absolute inset-0 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="ai-loader-ring-top absolute inset-0 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Inner pulsing circle */}
                <motion.div
                  className="ai-loader-core absolute inset-4 rounded-full"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Center icon based on type */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {type === "video" ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg
                        className="ai-loader-icon w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.div>
                  ) : type === "logo" ? (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg
                        className="ai-loader-icon w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg
                        className="ai-loader-icon w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Progress bar (optional) */}
              {progress !== undefined && (
                <div className="mt-4 w-48 mx-auto">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neon-brand"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs text-white/50 mt-1">{progress}%</div>
                </div>
              )}
            </div>

            {/* Dynamic Message */}
            <div className="h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg md:text-xl text-[#F9FAFB] font-medium px-4"
                >
                  {currentMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Subtle dots indicator */}
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full ai-loader-icon"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Cancel button (optional) */}
            {onCancel && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                onClick={onCancel}
                className="mt-8 px-4 py-2 text-sm text-white/60 hover:text-[#F9FAFB] transition-colors"
              >
                İptal Et
              </motion.button>
            )}

            {/* Brand message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-xs text-white/40"
            >
              Lumiohan • Prompt bilmiyorsan, biz düşünüyoruz
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export a hook for easy usage
export function useGenerationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<
    "default" | "image" | "video" | "logo"
  >("default");
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const startLoading = useCallback(
    (type: "default" | "image" | "video" | "logo" = "default") => {
      setLoadingType(type);
      setIsLoading(true);
      setProgress(undefined);
    },
    []
  );

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(undefined);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  return {
    isLoading,
    loadingType,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
}
