import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Image,
  Video,
  Users,
  Zap,
  Gift,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const ONBOARDING_KEY = "nanoinf_onboarding_completed";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
  position: "center" | "top" | "bottom" | "left" | "right";
  action?: {
    label: string;
    href?: string;
  };
}

const getTourSteps = (signupBonusCredits: string): TourStep[] => [
  {
    id: "welcome",
    title: "Amonify'a Hoş Geldin! 🎉",
    description:
      "Yapay zeka ile görsel ve video oluşturmanın en kolay yolu. Seni adım adım tanıştıralım.",
    icon: <Sparkles className="w-8 h-8" />,
    position: "center",
  },
  {
    id: "credits",
    title: "Kredi Sistemi",
    description: `Her işlem belirli miktarda kredi harcar. Başlangıç olarak sana ${signupBonusCredits} ücretsiz kredi hediye ettik!`,
    icon: <Gift className="w-8 h-8" />,
    position: "center",
  },
  {
    id: "image-gen",
    title: "AI Görsel Oluştur",
    description:
      "Nano Banana Pro, SeeDream ve Qwen modelleri ile profesyonel görseller oluştur. Sadece hayal et, AI üretsin!",
    icon: <Image className="w-8 h-8" />,
    position: "center",
    action: {
      label: "Görsel Oluştur",
      href: "/generate",
    },
  },
  {
    id: "video-gen",
    title: "AI Video Oluştur",
    description:
      "Veo 3.1, Sora 2, Kling ve daha fazlası ile metinden veya görsellerden video oluştur.",
    icon: <Video className="w-8 h-8" />,
    position: "center",
    action: {
      label: "Video Oluştur",
      href: "/video-generate",
    },
  },
  {
    id: "ai-influencer",
    title: "AI Influencer",
    description:
      "Kendi AI karakterini oluştur ve onunla sınırsız içerik üret. Sosyal medya için mükemmel!",
    icon: <Users className="w-8 h-8" />,
    position: "center",
    action: {
      label: "Karakter Oluştur",
      href: "/ai-influencer",
    },
  },
  // {
  //   id: "viral-apps",
  //   title: "Viral Uygulamalar",
  //   description: "Sarılma, öpücük, dans videoları ve daha fazlası! Tek tıkla viral içerikler oluştur.",
  //   icon: <Zap className="w-8 h-8" />,
  //   position: "center",
  //   action: {
  //     label: "Uygulamaları Keşfet",
  //     href: "/apps",
  //   },
  // },
  {
    id: "complete",
    title: "Hazırsın! 🚀",
    description:
      "Artık Amonify'ın tüm özelliklerini kullanabilirsin. Hemen ilk görselini oluşturmaya başla!",
    icon: <Check className="w-8 h-8" />,
    position: "center",
    action: {
      label: "Hemen Başla",
      href: "/generate",
    },
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  signupBonusCredits?: string;
}

export function OnboardingTour({
  isOpen,
  onClose,
  signupBonusCredits = "25",
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const TOUR_STEPS = getTourSteps(signupBonusCredits);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onClose();
    if (step.action?.href) {
      setLocation(step.action.href);
    }
  }, [onClose, setLocation, step]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onClose();
  }, [onClose]);

  const handleAction = useCallback(() => {
    if (step.action?.href) {
      localStorage.setItem(ONBOARDING_KEY, "true");
      onClose();
      setLocation(step.action.href);
    }
  }, [step, onClose, setLocation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const iconColors = [
    "from-yellow-400 to-orange-500",
    "from-green-400 to-[#7C3AED]",
    "from-[#7C3AED] to-[#7C3AED]",
    "from-[#00F5FF] to-[#7C3AED]",
    "from-[#FF2E97] to-[#7C3AED]",
    "from-orange-400 to-red-500",
    "from-neon-brand to-green-400",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
          />

          {/* Main container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-neon-brand/20"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                  }}
                  animate={{
                    y: [null, Math.random() * -200],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Tour card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg"
            >
              {/* Progress bar */}
              <div className="absolute -top-8 left-0 right-0 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-brand to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Step indicators */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-2">
                {TOUR_STEPS.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentStep ? 1 : -1);
                      setCurrentStep(index);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentStep
                        ? "bg-neon-brand scale-125"
                        : index < currentStep
                          ? "bg-neon-brand/50"
                          : "bg-zinc-600"
                    }`}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              {/* Card */}
              <div className="relative bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Skip button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>

                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-neon-brand/10 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative p-8 pt-12">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="flex flex-col items-center text-center"
                    >
                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${iconColors[currentStep]} flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <div className="text-[#F9FAFB]">{step.icon}</div>
                      </motion.div>

                      {/* Title */}
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-2xl font-bold text-[#F9FAFB] mb-3"
                      >
                        {step.title}
                      </motion.h2>

                      {/* Description */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-base leading-relaxed max-w-sm mb-8"
                      >
                        {step.description}
                      </motion.p>

                      {/* Feature preview for specific steps */}
                      {(step.id === "image-gen" ||
                        step.id === "video-gen" ||
                        step.id === "ai-influencer") && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 }}
                          className="w-full grid grid-cols-3 gap-2 mb-6"
                        >
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              className="aspect-square rounded-xl bg-zinc-800/50 border border-zinc-700/50 overflow-hidden"
                            >
                              <img
                                src={`/gallery/showcase-${i}.jpg`}
                                alt=""
                                className="w-full h-full object-cover opacity-60"
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {/* Action button for specific steps */}
                      {step.action && !isLastStep && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            onClick={handleAction}
                            variant="outline"
                            className="rounded-full border-neon-brand/30 text-neon-brand hover:bg-neon-brand/10 mb-4"
                          >
                            {step.action.label}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
                    <Button
                      onClick={handlePrev}
                      variant="ghost"
                      disabled={isFirstStep}
                      className={`rounded-full ${isFirstStep ? "opacity-0" : ""}`}
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Geri
                    </Button>

                    <span className="text-sm text-zinc-500">
                      {currentStep + 1} / {TOUR_STEPS.length}
                    </span>

                    <Button
                      onClick={handleNext}
                      className={`rounded-full ${
                        isLastStep
                          ? "bg-neon-brand hover:bg-[#00F5FF] text-black"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {isLastStep ? "Başla" : "İleri"}
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Keyboard hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-zinc-600"
              >
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                    ←
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                    →
                  </kbd>
                  gezin
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                    ESC
                  </kbd>
                  atla
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useOnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);

  const startTour = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const shouldShowTour = useCallback(() => {
    return !localStorage.getItem(ONBOARDING_KEY);
  }, []);

  return {
    isOpen,
    startTour,
    closeTour,
    shouldShowTour,
  };
}

export default OnboardingTour;
