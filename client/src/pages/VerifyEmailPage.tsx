import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function VerifyEmailPage() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");

  // Get email from URL params if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setStep("code");
    }
  }, []);

  const handleCheckVerification = async () => {
    if (!email) {
      toast.error("Email adresi gereklidir");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/check-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.verified) {
        setIsVerified(true);
        toast.success(t("verifyEmail.success.emailVerified"));
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setStep("code");
        toast.info(t("verifyEmail.info.enterCode"));
      }
    } catch (error) {
      toast.error(t("verifyEmail.errors.verificationCheckFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 6) {
      toast.error(t("verifyEmail.errors.enterSixDigitCode"));
      return;
    }

    setIsVerifying(true);
    try {
      // Verify code on backend
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
        toast.success(t("verifyEmail.success.emailVerified"));
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.error || t("verifyEmail.errors.invalidCode"));
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(t("verifyEmail.errors.verificationFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email adresi gereklidir");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("verifyEmail.success.codeResent"));
      } else {
        toast.error(data.error || t("verifyEmail.errors.codeNotSent"));
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(t("verifyEmail.errors.codeSendRetry"));
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-green-950 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Email Doğrulandı!</h2>
          <p className="text-gray-300">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Giriş Yap
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Doğrulama</h2>
              <p className="text-gray-300">
                {step === "email"
                  ? t("verifyEmail.enterEmailCheck")
                  : t("verifyEmail.enterSixDigitCode")}
              </p>
            </div>

            {step === "email" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                      disabled={isVerifying}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCheckVerification}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kontrol ediliyor...
                    </>
                  ) : (
                    t("verifyEmail.checkStatus")
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-display" className="text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email-display"
                    type="email"
                    value={email}
                    className="bg-white/5 border-white/10 text-gray-400 h-12"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-200">
                    Doğrulama Kodu
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-center text-2xl tracking-widest"
                    disabled={isVerifying}
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleVerifyCode}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12"
                  disabled={isVerifying || code.length < 6}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Doğrulanıyor...
                    </>
                  ) : (
                    t("verifyEmail.verifyCode")
                  )}
                </Button>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep("email")}
                    className="text-sm text-gray-400 hover:text-gray-300"
                  >
                    Email'i değiştir
                  </button>
                  <button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {isResending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Kodu Yeniden Gönder
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Spam klasörünüzü kontrol etmeyi unutmayın
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
