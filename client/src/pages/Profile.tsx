import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LogOut,
  Loader2,
  MessageCircle,
  Bug,
  Send,
  X,
  Upload,
  Image as ImageIcon,
  Gift,
  Copy,
  Share2,
  Users,
  Check,
  History,
  Plus,
  Minus,
  CreditCard,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const { theme, toggleTheme, switchable } = useTheme();
  const { t } = useLanguage();

  const profileQuery = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "bug" | "suggestion" | "complaint" | "other"
  >("bug");
  const [feedbackDescription, setFeedbackDescription] = useState("");
  const [feedbackScreenshot, setFeedbackScreenshot] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referral state
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Referral queries
  const referralCodeQuery = trpc.referral.getMyReferralCode.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );
  const referralStatsQuery = trpc.referral.getMyStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const bonusInfoQuery = trpc.referral.getBonusInfo.useQuery();

  // Payment history query
  const paymentHistoryQuery = trpc.user.getPaymentHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const applyReferralMutation = trpc.referral.applyReferralCode.useMutation({
    onSuccess: data => {
      toast.success(data.message || t("profile.codeApplied"));
      setReferralCodeInput("");
      profileQuery.refetch();
    },
    onError: error => {
      toast.error(error.message || t("profile.codeError"));
    },
  });

  // Handle payment success notification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast.success(t("success.paymentCompleted"));
      // Clear the query parameter without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
      profileQuery.refetch();
    }
  }, []);

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success(t("profile.feedbackModal.success"));
      setFeedbackOpen(false);
      setFeedbackDescription("");
      setFeedbackScreenshot(null);
    },
    onError: error => {
      toast.error(error.message || t("profile.feedbackModal.error"));
    },
  });

  const handleSubmitFeedback = async () => {
    if (feedbackDescription.length < 10) {
      toast.error(t("profile.descMinLength"));
      return;
    }
    setIsSubmitting(true);
    try {
      await submitFeedback.mutateAsync({
        type: feedbackType,
        description: feedbackDescription,
        screenshotUrl: feedbackScreenshot || undefined,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.fileSizeError"));
      return;
    }
    // Convert to base64 for simple storage
    const reader = new FileReader();
    reader.onload = () => {
      setFeedbackScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const WHATSAPP_NUMBER = "905519287034";
  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=Merhaba, Nano Influencer hakkında bir sorum var.`,
      "_blank"
    );
  };

  const copyReferralCode = () => {
    if (referralCodeQuery.data?.referralCode) {
      navigator.clipboard.writeText(referralCodeQuery.data.referralCode);
      setCopied(true);
      toast.success(t("profile.referralCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (referralCodeQuery.data?.referralCode) {
      const link = `${window.location.origin}?ref=${referralCodeQuery.data.referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success(t("profile.linkCopied"));
    }
  };

  const shareOnWhatsApp = () => {
    if (referralCodeQuery.data?.referralCode) {
      const link = `${window.location.origin}?ref=${referralCodeQuery.data.referralCode}`;
      const text = `Nano Influencer'da AI ile harika görseller ve videolar oluştur! Ücretsiz ${bonusInfoQuery.data?.referredBonus || 20} kredi kazanmak için bu linki kullan: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      toast.error(t("profile.enterRefCode"));
      return;
    }
    setIsApplyingCode(true);
    try {
      await applyReferralMutation.mutateAsync({
        code: referralCodeInput.trim(),
      });
    } finally {
      setIsApplyingCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#00F5FF]" />
          <p className="text-gray-300 text-lg">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    // logout() already redirects to login page via useAuth hook
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

  const profile = profileQuery.data;

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
          className="mb-8 flex items-center gap-4"
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
            <h1 className="text-3xl font-bold">{t("profile.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("profile.pageSubtitle")}</p>
          </div>
        </motion.div>

        {profileQuery.isLoading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            variants={itemVariants}
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#00F5FF]" />
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-8 lg:grid-cols-2 max-w-6xl"
            variants={containerVariants}
          >
            {/* Left Column - User Info & Credits & Referral */}
            <div className="space-y-8">
              {/* User Info Card */}
              <motion.div
                className="liquid-glass rounded-3xl p-8"
                variants={itemVariants}
              >
                <h2 className="mb-6 text-xl font-semibold">
                  {t("profile.userInfo")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.name")}
                    </p>
                    <p className="text-lg font-medium">
                      {profile?.name || user?.name || t("profile.notSpecified")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.email")}
                    </p>
                    <p className="text-lg font-medium">
                      {profile?.email ||
                        user?.email ||
                        t("profile.notSpecified")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.loginMethod")}
                    </p>
                    <p className="text-lg font-medium">
                      {(() => {
                        const method =
                          profile?.loginMethod || user?.loginMethod;
                        if (method === "google") return t("profile.google");
                        if (method === "email") return t("profile.password");
                        return method || t("profile.unknown");
                      })()}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Credits Card */}
              <motion.div
                className="liquid-glass rounded-3xl p-8"
                variants={itemVariants}
              >
                <h2 className="mb-6 text-xl font-semibold">
                  {t("profile.creditInfo")}
                </h2>
                <div className="space-y-4">
                  <div className="glass-card p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("profile.remainingCredits")}
                    </p>
                    <p className="text-4xl font-bold gradient-text">
                      {profile?.credits ?? 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("profile.generatedCount")}
                      </p>
                      <p className="text-2xl font-bold mt-2">
                        {profile?.generatedCount ?? 0}
                      </p>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("profile.spentCredits")}
                      </p>
                      <p className="text-2xl font-bold mt-2">
                        {(profile?.generatedCount ?? 0) * 10}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Referral Program Card */}
              <motion.div
                className="liquid-glass rounded-3xl p-8"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#7C3AED]">
                    <Gift className="h-5 w-5 text-[#F9FAFB]" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {t("profile.referralTitle")}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Bonus Info */}
                  <div className="glass-card p-4 bg-gradient-to-r from-[#7C3AED]/10 to-[#7C3AED]/10 border-[#7C3AED]/20">
                    <p className="text-sm text-center">
                      {t("profile.referralPart1")}{" "}
                      <span className="font-bold text-[#7C3AED]">
                        {bonusInfoQuery.data?.referrerBonus || 50}
                      </span>{" "}
                      {t("profile.referralPart2")}
                      <br />
                      <span className="text-muted-foreground">
                        {t("profile.referralFriendDesc", {
                          referredBonus:
                            bonusInfoQuery.data?.referredBonus || 20,
                        })}
                      </span>
                    </p>
                  </div>

                  {/* My Referral Code */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {t("profile.yourReferralCode")}
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 glass-card px-4 py-3 font-mono text-lg tracking-wider text-center">
                        {referralCodeQuery.isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                          referralCodeQuery.data?.referralCode || "---"
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyReferralCode}
                        className="glass-card"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 glass-card gap-2"
                      onClick={copyReferralLink}
                    >
                      <Copy className="h-4 w-4" />
                      {t("profile.copyLink")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 glass-card gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                      onClick={shareOnWhatsApp}
                    >
                      <Share2 className="h-4 w-4 text-green-500" />
                      {t("profile.shareWhatsapp")}
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 text-center">
                      <Users className="h-5 w-5 mx-auto mb-2 text-[#7C3AED]" />
                      <p className="text-2xl font-bold">
                        {referralStatsQuery.data?.totalReferrals || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("profile.totalReferrals")}
                      </p>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <Gift className="h-5 w-5 mx-auto mb-2 text-[#FF2E97]" />
                      <p className="text-2xl font-bold">
                        {referralStatsQuery.data?.totalBonusEarned || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("profile.totalBonus")}
                      </p>
                    </div>
                  </div>

                  {/* Apply Referral Code (if user hasn't used one yet) */}
                  {!profile?.referredBy && (
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <Label className="text-sm text-muted-foreground">
                        {t("profile.haveReferralCode")}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("profile.enterCode")}
                          value={referralCodeInput}
                          onChange={e =>
                            setReferralCodeInput(e.target.value.toUpperCase())
                          }
                          className="glass-card font-mono tracking-wider"
                          maxLength={8}
                        />
                        <Button
                          onClick={handleApplyReferralCode}
                          disabled={isApplyingCode || !referralCodeInput.trim()}
                          className="gradient-button text-[#F9FAFB]"
                        >
                          {isApplyingCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t("profile.apply")
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Payment History, Support & Actions */}
            <div className="space-y-8">
              {/* Payment History Card */}
              <motion.div
                className="liquid-glass rounded-3xl p-8"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#7C3AED]">
                    <History className="h-5 w-5 text-[#F9FAFB]" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {t("profile.paymentHistory")}
                  </h2>
                </div>

                <div className="space-y-3">
                  {paymentHistoryQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#00F5FF]" />
                    </div>
                  ) : paymentHistoryQuery.data &&
                    paymentHistoryQuery.data.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {paymentHistoryQuery.data.map(transaction => (
                        <div
                          key={transaction.id}
                          className="glass-card p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "add" ||
                                transaction.type === "purchase"
                                  ? "bg-green-500/20"
                                  : "bg-red-500/20"
                              }`}
                            >
                              {transaction.type === "add" ||
                              transaction.type === "purchase" ? (
                                <Plus
                                  className={`h-4 w-4 ${
                                    transaction.type === "purchase"
                                      ? "text-[#00F5FF]"
                                      : "text-green-400"
                                  }`}
                                />
                              ) : (
                                <Minus className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {transaction.reason ||
                                  (transaction.type === "add"
                                    ? t("profile.creditLoad")
                                    : transaction.type === "purchase"
                                      ? t("profile.packagePurchase")
                                      : t("profile.creditUsage"))}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${
                                transaction.type === "add" ||
                                transaction.type === "purchase"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.type === "add" ||
                              transaction.type === "purchase"
                                ? "+"
                                : "-"}
                              {transaction.amount} {t("nav.creditsSuffix")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("profile.balance")}: {transaction.balanceAfter}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {t("profile.noTransactions")}
                      </p>
                      <Button
                        onClick={() => navigate("/packages")}
                        className="mt-4 gradient-button text-[#F9FAFB]"
                      >
                        {t("profile.buyCredits")}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Support & Contact */}
              <motion.div
                className="liquid-glass rounded-3xl p-8"
                variants={itemVariants}
              >
                <h2 className="mb-6 text-xl font-semibold">
                  {t("profile.supportTitle")}
                </h2>
                <div className="space-y-3">
                  <Button
                    onClick={() => setFeedbackOpen(true)}
                    variant="outline"
                    className="glass-card w-full rounded-full py-3 gap-2 justify-start"
                  >
                    <Bug className="h-4 w-4 text-red-400" />
                    {t("profile.feedback")}
                  </Button>
                  <Button
                    onClick={openWhatsApp}
                    variant="outline"
                    className="glass-card w-full rounded-full py-3 gap-2 justify-start bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    {t("profile.contactWhatsapp")}
                  </Button>
                  <a
                    href="https://t.me/nanoinfluencer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-start gap-2 w-full rounded-full py-3 px-4 text-sm font-medium border border-[#00F5FF]/30 bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 transition-colors"
                  >
                    <Send className="h-4 w-4 text-[#00F5FF]" />
                    {t("profile.telegramChannel")}
                  </a>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div className="space-y-3" variants={containerVariants}>
                {/* Admin Panel Button - Only for admins */}
                {user?.role === "admin" && (
                  <Button
                    onClick={() => navigate("/admin")}
                    className="w-full rounded-full py-3 gap-2 bg-gradient-to-r from-[#7C3AED] to-[#FF2E97] hover:from-[#7C3AED] hover:to-[#FF2E97] text-[#F9FAFB]"
                  >
                    <Shield className="h-4 w-4" />
                    {t("profile.adminPanel")}
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/generate")}
                  className="gradient-button w-full rounded-full py-3 text-[#F9FAFB]"
                >
                  {t("profile.generateImage")}
                </Button>
                {switchable && (
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    className="glass-card w-full rounded-full py-3 gap-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4" />
                        {t("nav.lightMode")}
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        {t("nav.darkMode")}
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="glass-card w-full rounded-full py-3 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.feedbackModal.title")}</DialogTitle>
            <DialogDescription>
              {t("profile.feedbackModal.desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("profile.feedbackModal.type")}</Label>
              <Select
                value={feedbackType}
                onValueChange={v => setFeedbackType(v as typeof feedbackType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">
                    {t("profile.feedbackModal.types.bug")}
                  </SelectItem>
                  <SelectItem value="suggestion">
                    {t("profile.feedbackModal.types.suggestion")}
                  </SelectItem>
                  <SelectItem value="complaint">
                    {t("profile.feedbackModal.types.complaint")}
                  </SelectItem>
                  <SelectItem value="other">
                    {t("profile.feedbackModal.types.other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("profile.feedbackModal.description")}</Label>
              <Textarea
                placeholder={t("profile.feedbackModal.placeholder")}
                value={feedbackDescription}
                onChange={e => setFeedbackDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {feedbackDescription.length}/2000
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("profile.feedbackModal.screenshot")}</Label>
              {feedbackScreenshot ? (
                <div className="relative">
                  <img
                    src={feedbackScreenshot}
                    alt="Screenshot"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setFeedbackScreenshot(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    {t("profile.feedbackModal.upload")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setFeedbackOpen(false)}
            >
              {t("profile.feedbackModal.cancel")}
            </Button>
            <Button
              className="flex-1 gradient-button text-[#F9FAFB]"
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || feedbackDescription.length < 10}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t("profile.feedbackModal.send")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
