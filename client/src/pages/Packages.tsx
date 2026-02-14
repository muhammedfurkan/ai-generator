import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Zap,
  Crown,
  Sparkles,
  Star,
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

// Default packages as fallback
const getDefaultPackages = (t: (key: string) => string) => [
  {
    id: 1,
    name: t("packages.default.starter.name"),
    price: "150",
    credits: 300,
    description: t("packages.default.starter.description"),
    features: [
      t("packages.default.starter.feature1"),
      t("packages.default.starter.feature2"),
      t("packages.default.starter.feature3"),
    ],
    isHighlighted: false,
    badge: null,
    shopierUrl: null,
    originalPrice: null,
    usage1k: 30,
    usage2k: 20,
    usage4k: 15,
    bonus: 0,
  },
  {
    id: 2,
    name: t("packages.default.standard.name"),
    price: "375",
    credits: 750,
    description: t("packages.default.standard.description"),
    features: [
      t("packages.default.standard.feature1"),
      t("packages.default.standard.feature2"),
      t("packages.default.standard.feature3"),
    ],
    isHighlighted: false,
    badge: null,
    shopierUrl: null,
    originalPrice: null,
    usage1k: 75,
    usage2k: 50,
    usage4k: 37,
    bonus: 0,
  },
  {
    id: 3,
    name: t("packages.default.professional.name"),
    price: "1100",
    credits: 2200,
    description: t("packages.default.professional.description"),
    features: [
      t("packages.default.professional.feature1"),
      t("packages.default.professional.feature2"),
      t("packages.default.professional.feature3"),
    ],
    isHighlighted: true,
    badge: t("packages.default.professional.badge"),
    shopierUrl: null,
    originalPrice: null,
    usage1k: 220,
    usage2k: 146,
    usage4k: 110,
    bonus: 10,
  },
  {
    id: 4,
    name: t("packages.default.enterprise.name"),
    price: "2000",
    credits: 4000,
    description: t("packages.default.enterprise.description"),
    features: [
      t("packages.default.enterprise.feature1"),
      t("packages.default.enterprise.feature2"),
      t("packages.default.enterprise.feature3"),
    ],
    isHighlighted: false,
    badge: null,
    shopierUrl: null,
    originalPrice: null,
    usage1k: 400,
    usage2k: 266,
    usage4k: 200,
    bonus: 15,
  },
];

const DEFAULT_PACKAGES = getDefaultPackages(key => key);

// Default FAQs as fallback
const getDefaultFaqs = (t: (key: string) => string) => [
  {
    id: 1,
    question: t("packages.faq.question1"),
    answer: t("packages.faq.answer1"),
  },
  {
    id: 2,
    question: t("packages.faq.question2"),
    answer: t("packages.faq.answer2"),
  },
  {
    id: 3,
    question: t("packages.faq.question3"),
    answer: t("packages.faq.answer3"),
  },
  {
    id: 4,
    question: t("packages.faq.question4"),
    answer: t("packages.faq.answer4"),
  },
];

const DEFAULT_FAQS = getDefaultFaqs(key => key);

const ICONS = [
  <Star className="h-5 w-5" />,
  <Sparkles className="h-5 w-5" />,
  <Zap className="h-5 w-5" />,
  <Crown className="h-5 w-5" />,
];

const GRADIENTS = [
  "from-gray-400 to-gray-600",
  "from-[#00F5FF] to-[#7C3AED]",
  "from-[#7C3AED] to-[#7C3AED]",
  "from-amber-400 to-orange-500",
];

export default function Packages() {
  // ❗ CRITICAL: All hooks MUST be called before any conditional returns
  // This prevents "Rendered more hooks" error during auth state changes
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  // Fetch packages from database
  const packagesQuery = trpc.settings.getPublicPackages.useQuery(undefined, {
    staleTime: 60000, // 1 minute
    retry: false,
  });

  // Fetch FAQs from database
  const faqsQuery = trpc.settings.getPublicFaqs.useQuery(undefined, {
    staleTime: 60000, // 1 minute
    retry: false,
  });

  // Fetch package messages (bonus and validity messages)
  const packageMessagesQuery = trpc.settings.getPackageMessages.useQuery(
    undefined,
    {
      staleTime: 60000, // 1 minute
      retry: false,
    }
  );

  // Shopier payment mutation (for shopierUrl packages)
  const initiatePayment = trpc.shopier.initiatePayment.useMutation({
    onSuccess: data => {
      if (data.html) {
        // Render the payment form and auto-submit
        const div = document.createElement("div");
        div.innerHTML = data.html;
        document.body.appendChild(div);
        // The script inside the HTML might not execute if injected this way in React.
        // Better to find the form and submit it.
        const form = div.querySelector("form");
        if (form) {
          form.submit();
        } else {
          // Fallback if script execution is needed or form is missing
          // Write to document
          document.open();
          document.write(data.html);
          document.close();
        }
      }
    },
    onError: error => {
      console.error("Payment init error:", error);
      toast.error(t("packages.errors.paymentFailed") + ": " + error.message);
    },
  });

  // Stripe checkout session mutation
  const createStripeCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: data => {
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error(t("packages.errors.checkoutFailed"));
      }
    },
    onError: error => {
      console.error("Stripe checkout error:", error);
      toast.error(t("packages.errors.paymentFailed") + ": " + error.message);
    },
  });

  // Use database packages or fallback to defaults
  const packages = packagesQuery.data?.length
    ? packagesQuery.data
    : DEFAULT_PACKAGES;

  // Use database FAQs or fallback to defaults
  const faqs = faqsQuery.data?.length ? faqsQuery.data : DEFAULT_FAQS;

  // Debug logging
  if (packagesQuery.isSuccess) {
    console.log("[Packages] Loaded packages:", {
      fromDatabase: packagesQuery.data?.length > 0,
      count: packages.length,
      packages: packages.map(p => ({ id: p.id, name: p.name, bonus: p.bonus })),
    });

    // Check for packages without IDs
    const missingIds = packages.filter(p => !p.id);
    if (missingIds.length > 0) {
      console.error(
        "[Packages] ⚠️  Some packages are missing IDs:",
        missingIds
      );
    }
  }

  // ✅ NOW we can do conditional returns - all hooks are already called above

  // No auth loading spinner here - let users see packages immediately

  const handleBuyPackage = (pkg: (typeof packages)[0]) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      toast.info(t("packages.errors.loginRequired"));
      navigate(`/login?redirect=/packages`);
      return;
    }

    // Validate package ID
    if (!pkg?.id) {
      toast.error(t("packages.errors.packageIdMissing"));
      console.error("Package missing ID:", pkg);
      return;
    }

    // Use Stripe Checkout for all packages
    createStripeCheckout.mutate({ packageId: pkg.id });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { y: -10, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <motion.div
        className="container py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="mb-12 flex items-center gap-4"
          variants={itemVariants}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00F5FF] to-[#FF2E97] bg-clip-text text-transparent">
              {t("packages.header.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("packages.header.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Adaptive Pricing Info Banner */}
        <motion.div
          className="mb-8 glass-card rounded-2xl border border-[#00F5FF]/30 bg-[#00F5FF]/10 p-4"
          variants={itemVariants}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-[#00F5FF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#00F5FF] mb-1">
                💳 {t("packages.currency.title")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("packages.currency.autoDetected")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Info - Only show if there are messages to display */}
        {(packageMessagesQuery.data?.bonusMessage ||
          packageMessagesQuery.data?.validityMessage) && (
          <motion.div
            className="mb-12 glass-card rounded-3xl border border-white/20 p-6 text-center"
            variants={itemVariants}
          >
            <p className="text-lg text-muted-foreground">
              {packageMessagesQuery.data.bonusMessage && (
                <span className="text-[#7C3AED] font-semibold">
                  {packageMessagesQuery.data.bonusMessage}
                </span>
              )}
              {packageMessagesQuery.data.bonusMessage &&
                packageMessagesQuery.data.validityMessage && <>{" • "}</>}
              {packageMessagesQuery.data.validityMessage && (
                <span className="text-[#FF2E97] font-semibold">
                  {packageMessagesQuery.data.validityMessage}
                </span>
              )}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {packagesQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
          </div>
        )}

        {/* Packages Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
        >
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              className="relative"
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Popular Badge */}
              {pkg.isHighlighted && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] text-[#F9FAFB] px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {t("packages.card.mostPopular")}
                  </div>
                </motion.div>
              )}

              {/* Card */}
              <div
                className={`glass-card rounded-3xl border p-6 h-full flex flex-col transition-all ${
                  pkg.isHighlighted
                    ? "border-[#7C3AED]/50 bg-[#7C3AED]/10 shadow-lg shadow-[#7C3AED]/20"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {/* Icon & Package Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-r ${GRADIENTS[index % 4]} text-[#F9FAFB]`}
                  >
                    {ICONS[index % 4]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {pkg.name}
                    </h2>
                    {pkg?.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {pkg.price}
                    </span>
                    <span className="text-muted-foreground">TL</span>
                  </div>
                  {pkg?.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      {pkg.originalPrice} TL
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {pkg?.bonus && pkg.bonus > 0 ? (
                      <>
                        <span className="line-through opacity-60">
                          {pkg.credits}
                        </span>
                        <span className="text-green-400 font-semibold ml-2">
                          +%{pkg.bonus} {t("packages.card.bonusText")}
                        </span>
                        <span className="text-foreground font-bold ml-2">
                          = {Math.floor(pkg.credits * (1 + pkg.bonus / 100))}{" "}
                          {t("packages.card.credits")}
                        </span>
                      </>
                    ) : (
                      <>
                        {pkg.credits} {t("packages.card.credits")}
                      </>
                    )}
                  </p>
                </div>

                {/* Credit Breakdown */}
                <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    {t("packages.usage.exampleTitle")}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("packages.usage.1k")} {t("packages.usage.quality")}:
                      </span>
                      <span className="text-[#00F5FF] font-semibold">
                        {pkg?.usage1k && pkg.usage1k > 0
                          ? pkg.usage1k
                          : Math.floor(pkg.credits / 10)}{" "}
                        {t("packages.usage.images")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("packages.usage.2k")} {t("packages.usage.quality")}:
                      </span>
                      <span className="text-[#7C3AED] font-semibold">
                        {pkg?.usage2k && pkg.usage2k > 0
                          ? pkg.usage2k
                          : Math.floor(pkg.credits / 15)}{" "}
                        {t("packages.usage.images")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("packages.usage.4k")} {t("packages.usage.quality")}:
                      </span>
                      <span className="text-[#FF2E97] font-semibold">
                        {pkg?.usage4k && pkg.usage4k > 0
                          ? pkg.usage4k
                          : Math.floor(pkg.credits / 20)}{" "}
                        {t("packages.usage.images")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6 flex-1">
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    {t("packages.card.packageContent")}
                  </p>
                  <ul className="space-y-1.5">
                    {(pkg.features || []).map(
                      (feature: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs"
                        >
                          <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Buy Button */}
                <motion.button
                  onClick={() => handleBuyPackage(pkg)}
                  className={`w-full rounded-full py-3 font-semibold transition-all ${
                    pkg.isHighlighted
                      ? "gradient-button text-[#F9FAFB] hover:shadow-lg hover:shadow-[#7C3AED]/30"
                      : "glass-card border border-white/20 text-foreground hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("packages.card.buyNow")}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!packagesQuery.isLoading && packages.length === 0 && (
          <div className="text-center py-12 glass-card rounded-3xl border border-white/20">
            <Package className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
            <p className="text-muted-foreground">{t("packages.emptyState")}</p>
          </div>
        )}

        {/* FAQ Section */}
        <motion.div
          className="glass-card rounded-3xl border border-white/20 p-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-6">{t("packages.faq.title")}</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <h3 className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
