import Lottie from "lottie-react";
import { useEffect, useState } from "react";

interface LottieLoadingProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export default function LottieLoading({
  message = "Video işleniyor...",
  subMessage = "Bu işlem 1-3 dakika sürebilir",
  className = "",
}: LottieLoadingProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("/animations/loading.json")
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Lottie animation load error:", err));
  }, []);

  if (!animationData) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-8 ${className}`}
      >
        <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-2">{subMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center py-4 ${className}`}
    >
      <div className="w-48 h-48 md:w-64 md:h-64">
        <Lottie animationData={animationData} loop={true} autoplay={true} />
      </div>
      <p className="text-lg font-medium text-foreground mt-2">{message}</p>
      <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
    </div>
  );
}
