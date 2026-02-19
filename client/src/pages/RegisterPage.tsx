import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Gift,
  Zap,
  Users,
  Mail,
  Lock,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

import { trpc } from "@/lib/trpc";

export function RegisterPage() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailPasswordAuthEnabled, setEmailPasswordAuthEnabled] =
    useState(false);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Email verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  // Fetch settings for bonus credits
  const settingsQuery = trpc.settings.getPublicSettings.useQuery();
  const bonusCredits =
    settingsQuery.data?.find(s => s.key === "signup_bonus_credits")?.value ||
    "25";

  // Fetch auth config on mount
  useEffect(() => {
    fetch("/api/auth/config")
      .then(res => res.json())
      .then(data => {
        setEmailPasswordAuthEnabled(data.emailPasswordAuthEnabled || false);
        setGoogleAuthEnabled(data.googleAuthEnabled !== false); // Default true
      })
      .catch(console.error);
  }, []);

  // Handle Google Sign Up - Direct OAuth2 (without Clerk)
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      // Get Google OAuth URL from backend
      const response = await fetch("/api/auth/google");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.register.errors.googleInitFailed"));
        setIsGoogleLoading(false);
        return;
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Google sign up error:", error);
      toast.error(t("auth.register.errors.googleFailed"));
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error(t("auth.register.errors.fillAllFields"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("auth.register.errors.passwordLength"));
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error(t("auth.register.errors.passwordUppercase"));
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error(t("auth.register.errors.passwordLowercase"));
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error(t("auth.register.errors.passwordNumber"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.register.errors.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.register.errors.registerFailed"));
        return;
      }

      if (data.requiresVerification) {
        // Show verification code input
        setPendingEmail(data.email || email);
        setShowVerification(true);
        toast.success(t("auth.register.verificationSent"));
      } else {
        toast.success(t("auth.register.success"));
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(t("auth.register.errors.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length < 6) {
      toast.error(t("auth.verify.errors.codeLength"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.verify.errors.verificationFailed"));
        return;
      }

      toast.success(t("auth.verify.success"));
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error(t("auth.verify.errors.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.verify.errors.resendFailed"));
        return;
      }

      toast.success(t("auth.verify.resendSuccess"));
    } catch (error) {
      toast.error(t("auth.verify.errors.resendGenericError"));
    }
  };

  // Verification Code UI
  if (showVerification) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] bg-[#00F5FF]/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-[500px] h-[500px] bg-[#00F5FF]/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Button
            variant="ghost"
            onClick={() => {
              setShowVerification(false);
            }}
            className="text-[#F9FAFB] hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("auth.verify.back")}
          </Button>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#F9FAFB]" />
                </div>
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                  {t("auth.verify.title")}
                </h2>
                <p className="text-gray-300">
                  <span className="font-medium text-[#F9FAFB]">
                    {pendingEmail}
                  </span>{" "}
                  {t("auth.verify.emailSentTo")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-200">
                    {t("auth.verify.code")}
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={e =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className="bg-white/10 border-white/20 text-[#F9FAFB] placeholder:text-gray-400 h-14 text-center text-2xl tracking-widest"
                    disabled={isSubmitting}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleVerifyCode}
                  className="w-full bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] hover:from-[#00F5FF] hover:to-[#7C3AED] text-[#F9FAFB] h-12 text-base font-medium"
                  disabled={isSubmitting || verificationCode.length < 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("auth.verify.verifying")}
                    </>
                  ) : (
                    t("auth.verify.verifyAndSignup")
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    onClick={handleResendCode}
                    className="text-sm text-[#00F5FF] hover:text-[#00F5FF]"
                  >
                    {t("auth.verify.notReceived")}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  {t("auth.verify.checkSpam")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#00F5FF]/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-[#00F5FF]/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        <div className="absolute w-[300px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-[#F9FAFB] hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.register.home")}
        </Button>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block text-[#F9FAFB]"
          >
            <div className="flex items-center gap-3 mb-6">
              <img src="/Logo-01.png" alt="Lumiohan" className="h-16 w-auto" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#00F5FF] via-[#7C3AED] to-[#FF2E97] bg-clip-text text-transparent">
              {t("auth.register.branding.title")}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t("auth.register.branding.subtitle")}
            </p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-[#F9FAFB]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    25 Ücretsiz Kredi
                  </h3>
                  <p className="text-sm text-gray-400">
                    Kayıt olun ve hemen görsel oluşturmaya başlayın
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-[#F9FAFB]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {t("auth.register.branding.feature3")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("auth.register.branding.feature3Desc")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#F9FAFB]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {t("auth.register.branding.feature3")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("auth.register.branding.feature3Desc")}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-[#00F5FF]/10 to-[#FF2E97]/10 rounded-xl border border-[#00F5FF]/20">
              <p className="text-sm text-gray-300">
                <Sparkles className="inline w-4 h-4 mr-1" />
                <strong>10,000+</strong>{" "}
                {t("auth.register.branding.usersJoined")}
              </p>
            </div>
          </motion.div>

          {/* Right Side - Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
              {/* Header */}
              <div className="mb-8 text-center">
                <img
                  src="/Logo-02.png"
                  alt="Lumiohan"
                  className="h-12 w-auto mx-auto mb-4 lg:hidden"
                />
                <h2 className="text-3xl font-bold text-[#F9FAFB] mb-2">
                  Hesap Oluştur
                </h2>
                <p className="text-gray-300">
                  Ücretsiz başlayın - {bonusCredits} kredi hediye!
                </p>
              </div>

              {/* Email Register Form */}
              {emailPasswordAuthEnabled && (
                <>
                  <form onSubmit={handleEmailRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-200">
                        {t("auth.register.name")}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder={t("auth.register.namePlaceholder")}
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-[#F9FAFB] placeholder:text-gray-400 h-12"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200">
                        {t("auth.register.email")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="ornek@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-[#F9FAFB] placeholder:text-gray-400 h-12"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-200"
                      >
                        {t("auth.register.confirmPassword")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="En az 8 karakter"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-[#F9FAFB] placeholder:text-gray-400 h-12"
                          disabled={isSubmitting}
                          required
                          minLength={8}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        Büyük harf, küçük harf ve rakam içermelidir
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-200"
                      >
                        Şifre Tekrar
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder={t(
                            "auth.register.confirmPasswordPlaceholder"
                          )}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-[#F9FAFB] placeholder:text-gray-400 h-12"
                          disabled={isSubmitting}
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] hover:from-[#00F5FF] hover:to-[#7C3AED] text-[#F9FAFB] h-12 text-base font-medium mt-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("auth.register.creating")}
                        </>
                      ) : (
                        t("auth.register.createAccount")
                      )}
                    </Button>
                  </form>

                  {/* Separator if both methods enabled */}
                  {googleAuthEnabled && (
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-transparent text-gray-400">
                          {t("auth.register.or")}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Google Sign Up */}
              {googleAuthEnabled && (
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 h-12 text-base font-medium flex items-center justify-center gap-3 transition-all"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="##EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {isGoogleLoading
                    ? t("auth.register.googleRedirecting")
                    : t("auth.register.google")}
                </Button>
              )}

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  {t("auth.register.haveAccount")}{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[#00F5FF] hover:text-[#00F5FF] font-medium"
                  >
                    {t("auth.register.signIn")}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
