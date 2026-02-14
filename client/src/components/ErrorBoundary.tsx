import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, LogIn } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Oturumla ilgili hata mesajlarını kontrol eden yardımcı fonksiyon
function isSessionError(error: Error | null): boolean {
  if (!error) return false;
  const errorMessage = (error.message || "").toLowerCase();
  const errorStack = (error.stack || "").toLowerCase();
  const combined = errorMessage + errorStack;

  const sessionErrorPatterns = [
    "jwt",
    "expired",
    "unauthorized",
    "unauthenticated",
    "session",
    "authentication",
    "login",
    "10001", // UNAUTHED_ERR_MSG contains this
    "please login",
    "missing session",
    "forbidden",
    "401",
    "403",
  ];

  return sessionErrorPatterns.some(pattern => combined.includes(pattern));
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    // Eğer oturum hatası tespit edilirse otomatik olarak login'e yönlendir
    if (this.state.hasError && !prevState.hasError) {
      if (isSessionError(this.state.error)) {
        // 2 saniye bekle ki kullanıcı mesajı görsün, sonra yönlendir
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  }

  handleLogin = () => {
    window.location.href = "/login";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isSession = isSessionError(this.state.error);

      return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900">
          <div className="flex flex-col items-center w-full max-w-lg p-6 md:p-8 glass-card rounded-2xl border border-white/10">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-6",
                isSession
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-xl md:text-2xl font-semibold mb-2 text-center text-[#F9FAFB]">
              {isSession
                ? "Oturumunuz Sona Erdi"
                : "Beklenmedik Bir Hata Oluştu"}
            </h2>

            <p className="text-muted-foreground text-center mb-6 text-sm md:text-base">
              {isSession
                ? "Güvenliğiniz için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın."
                : "Bir şeyler yanlış gitti. Sayfayı yenileyerek tekrar deneyebilirsiniz."}
            </p>

            {/* Sadece development modunda hata detaylarını göster */}
            {import.meta.env.DEV && this.state.error?.stack && (
              <div className="p-4 w-full rounded-lg bg-black/30 overflow-auto mb-6 max-h-48">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {isSession ? (
                <>
                  <button
                    onClick={this.handleLogin}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3 rounded-full",
                      "bg-gradient-to-r from-[#00F5FF] to-[#FF2E97] text-[#F9FAFB] font-medium",
                      "hover:from-[#00F5FF] hover:to-[#FF2E97] transition-all duration-300",
                      "shadow-lg shadow-[#00F5FF]/25"
                    )}
                  >
                    <LogIn size={18} />
                    Giriş Yap
                  </button>
                  <button
                    onClick={this.handleReload}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3 rounded-full",
                      "border border-white/20 text-white/80",
                      "hover:bg-white/5 transition-all duration-300"
                    )}
                  >
                    <RotateCcw size={18} />
                    Sayfayı Yenile
                  </button>
                </>
              ) : (
                <button
                  onClick={this.handleReload}
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 py-3 rounded-full",
                    "bg-gradient-to-r from-[#00F5FF] to-[#FF2E97] text-[#F9FAFB] font-medium",
                    "hover:from-[#00F5FF] hover:to-[#FF2E97] transition-all duration-300",
                    "shadow-lg shadow-[#00F5FF]/25"
                  )}
                >
                  <RotateCcw size={18} />
                  Sayfayı Yenile
                </button>
              )}
            </div>

            {isSession && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Otomatik olarak giriş sayfasına yönlendiriliyorsunuz...
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
