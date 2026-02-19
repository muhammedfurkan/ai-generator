import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { OnboardingTour } from "./OnboardingTour";
import { trpc } from "@/lib/trpc";

const WELCOME_POPUP_KEY = "nanoinf_welcome_shown";

interface WelcomePopupProps {
  isNewUser?: boolean;
}

export function WelcomePopup({ isNewUser = false }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch signup bonus credits from database
  const settingsQuery = trpc.settings.getPublicSettings.useQuery(undefined, {
    staleTime: 60000,
  });

  // Get the signup bonus credits value (default to 25 if not found)
  const signupBonusCredits =
    settingsQuery.data?.find(s => s.key === "signup_bonus_credits")?.value ||
    "25";

  useEffect(() => {
    // Sadece yeni kullanıcılara göster ve daha önce gösterilmemişse
    if (isNewUser) {
      const hasSeenWelcome = localStorage.getItem(WELCOME_POPUP_KEY);
      if (!hasSeenWelcome) {
        // Kısa bir gecikme ile popup'ı göster
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isNewUser]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(WELCOME_POPUP_KEY, "true");
  };

  const handleStartCreating = () => {
    handleClose();
    setLocation("/generate");
  };

  const handleStartTour = () => {
    setIsOpen(false);
    localStorage.setItem(WELCOME_POPUP_KEY, "true");
    setShowTour(true);
  };

  const handleCloseTour = () => {
    setShowTour(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 shadow-2xl">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-neon-brand/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-neon-brand/10 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative p-8 pt-6">
                  {/* Logo and confetti area */}
                  <div className="flex flex-col items-center mb-6">
                    {/* Animated sparkles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute top-8 left-1/2 -translate-x-1/2"
                    >
                      <Sparkles className="w-6 h-6 text-neon-brand/30" />
                    </motion.div>

                    {/* Logo */}
                    <motion.div
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-xl">
                        <img
                          src="/Logo-02.png"
                          alt="Lumiohan Logo"
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      {/* Gift badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-neon-brand flex items-center justify-center shadow-lg"
                      >
                        <Gift className="w-5 h-5 text-black" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Welcome text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                      Lumiohan'a Hoş Geldin! 🎉
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      Yapay zeka ile görsel ve video oluşturmanın en kolay yolu
                    </p>
                  </motion.div>

                  {/* Credit gift box */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative mb-6"
                  >
                    <div className="bg-gradient-to-r from-neon-brand/10 via-neon-brand/5 to-neon-brand/10 border border-neon-brand/30 rounded-2xl p-5">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex-shrink-0">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                            }}
                            className="w-16 h-16 rounded-xl bg-neon-brand flex items-center justify-center"
                          >
                            <span className="text-3xl font-black text-black">
                              {signupBonusCredits}
                            </span>
                          </motion.div>
                        </div>
                        <div className="text-left">
                          <p className="text-neon-brand font-bold text-lg">
                            Ücretsiz Kredi Hediye!
                          </p>
                          <p className="text-zinc-400 text-sm">
                            Hemen kullanmaya başla, kredi kartı gerekmez
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Features list */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-3 mb-6"
                  >
                    {[
                      { icon: "🎨", label: "AI Görsel" },
                      { icon: "🎬", label: "AI Video" },
                      { icon: "👤", label: "AI Influencer" },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="bg-zinc-800/50 rounded-xl p-3 text-center border border-zinc-700/50"
                      >
                        <span className="text-2xl mb-1 block">
                          {feature.icon}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <Button
                      onClick={handleStartTour}
                      className="w-full h-12 bg-neon-brand hover:bg-[#00F5FF] text-black font-bold rounded-xl text-base gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      Platformu Tanı
                    </Button>
                    <Button
                      onClick={handleStartCreating}
                      variant="outline"
                      className="w-full h-12 border-zinc-700 hover:bg-zinc-800 text-[#F9FAFB] font-medium rounded-xl text-base gap-2"
                    >
                      Hemen Başla
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>

                  {/* Skip link */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={handleClose}
                    className="w-full mt-3 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                  >
                    Daha sonra keşfet
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showTour}
        onClose={handleCloseTour}
        signupBonusCredits={signupBonusCredits}
      />
    </>
  );
}

export default WelcomePopup;
