import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginPage() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailPasswordAuthEnabled, setEmailPasswordAuthEnabled] =
    useState(false);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  // Handle Google Sign In - Direct OAuth2 (without Clerk)
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Get Google OAuth URL from backend
      const response = await fetch("/api/auth/google");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.login.errors.googleInitFailed"));
        setIsGoogleLoading(false);
        return;
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error(t("auth.login.errors.googleFailed"));
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("auth.login.errors.fillAllFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if user needs email verification
        if (data.requiresVerification) {
          toast.error(t("auth.login.errors.emailNotVerified"));
          setTimeout(() => {
            window.location.href = `/register?verify=${encodeURIComponent(data.email || email)}`;
          }, 1500);
          return;
        }
        toast.error(data.error || t("auth.login.errors.loginFailed"));
        return;
      }

      toast.success(t("auth.login.success"));
      window.location.href = "/";
    } catch (error) {
      toast.error(t("auth.login.errors.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#7C3AED]/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-[#FF2E97]/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        <div className="absolute w-[300px] h-[300px] bg-[#00F5FF]/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-[#F9FAFB] hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.login.home")}
        </Button>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block text-[#F9FAFB]"
          >
            <div className="flex items-center gap-3 mb-6">
              <img src="/Logo-01.png" alt="Amonify" className="h-16 w-auto" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#7C3AED] via-[#FF2E97] to-[#7C3AED] bg-clip-text text-transparent">
              {t("auth.login.branding.title")}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t("auth.login.branding.subtitle")}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {t("auth.login.branding.feature1")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("auth.login.branding.feature1Desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF2E97]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FF2E97]" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {t("auth.login.branding.feature2")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("auth.login.branding.feature2Desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00F5FF]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#00F5FF]" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {t("auth.login.branding.feature3")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("auth.login.branding.feature3Desc")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
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
                  alt="Amonify"
                  className="h-12 w-auto mx-auto mb-4 lg:hidden"
                />
                <h2 className="text-3xl font-bold text-[#F9FAFB] mb-2">
                  {t("auth.login.welcome")}
                </h2>
                <p className="text-gray-300">{t("auth.login.subtitle")}</p>
              </div>

              {/* Email/Password Login Form */}
              {emailPasswordAuthEnabled && (
                <>
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200">
                        {t("auth.login.email")}
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
                      <Label htmlFor="password" className="text-gray-200">
                        {t("auth.login.password")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-[#F9FAFB] placeholder:text-gray-400 h-12"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#7C3AED] text-[#F9FAFB] h-12 text-base font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("auth.login.loggingIn")}
                        </>
                      ) : (
                        t("auth.login.submit")
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
                          {t("auth.login.or")}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Google Sign In */}
              {googleAuthEnabled && (
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
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
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {isGoogleLoading
                    ? t("auth.login.googleRedirecting")
                    : t("auth.login.google")}
                </Button>
              )}

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  {t("auth.login.noAccount")}{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-[#7C3AED] hover:text-[#7C3AED] font-medium"
                  >
                    {t("auth.login.signUp")}
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
