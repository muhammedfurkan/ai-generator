import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Play, Download, Loader2, Sparkles, X } from "lucide-react";
import { useSearch, useLocation } from "wouter";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import { getLoginUrl } from "@/const";
import LottieLoading from "@/components/LottieLoading";
import Header from "@/components/Header";

interface ViralApp {
  id: string;
  title: string;
  description: string;
  prompt: string;
  credits: number;
  category: string;
  coverImage: string;
  icon?: string;
  popular?: boolean;
}

export default function Apps() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [selectedApp, setSelectedApp] = useState<ViralApp | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<{
    videoId: number;
    taskId: string;
  } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: apps, isLoading: appsLoading } = trpc.viralApps.list.useQuery();
  const generateMutation = trpc.viralApps.generate.useMutation();
  const { data: statusData } = trpc.viralApps.checkStatus.useQuery(
    { videoId: videoResult?.videoId || 0 },
    {
      enabled: !!videoResult,
      refetchInterval: videoResult && !videoUrl ? 5000 : false,
    }
  );

  // Update video URL after render to avoid state updates in render path.
  useEffect(() => {
    if (
      statusData?.status === "completed" &&
      statusData.videoUrl &&
      !videoUrl
    ) {
      setVideoUrl(statusData.videoUrl);
    }
  }, [statusData, videoUrl]);

  // URL parametresinden app seçimi
  useEffect(() => {
    if (apps && searchString) {
      const params = new URLSearchParams(searchString);
      const appId = params.get("app");
      if (appId) {
        const app = apps.find(a => a.id === appId);
        if (app) {
          setSelectedApp(app);
        }
      }
    }
  }, [apps, searchString]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = e => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setUploadedFile(file);
  };

  const handleGenerate = async () => {
    if (!selectedApp || !uploadedFile || !user) return;

    // Check credits
    if (user.credits < selectedApp.credits) {
      setShowCreditsDialog(true);
      return;
    }

    setIsGenerating(true);
    setVideoResult(null);
    setVideoUrl(null);

    try {
      // Upload image first
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(t("apps.errors.imageUploadFailed"));
      }

      const uploadData = (await uploadResponse.json()) as { url: string };

      // Generate video
      const result = await generateMutation.mutateAsync({
        appId: selectedApp.id,
        imageUrl: uploadData.url,
      });

      setVideoResult({ videoId: result.videoId, taskId: result.taskId });
    } catch (error: any) {
      console.error("Generation error:", error);
      alert(error.message || t("apps.errors.videoGenerationFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const resetState = () => {
    setSelectedApp(null);
    setUploadedImage(null);
    setUploadedFile(null);
    setVideoResult(null);
    setVideoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (authLoading || appsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#00F5FF]" />
          <p className="text-gray-300 text-lg">{t("apps.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] bg-clip-text text-transparent">
            {t("apps.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto whitespace-pre-line">
            {t("apps.subtitle")}
          </p>
        </div>

        {/* App Grid - All apps in a single grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {apps?.map(app => (
            <div
              key={app.id}
              className="cursor-pointer group"
              onClick={() => setSelectedApp(app)}
            >
              <div className="aspect-square relative overflow-hidden rounded-2xl">
                <img
                  src={app.coverImage}
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-[#F9FAFB] text-sm md:text-base line-clamp-1">
                    {app.title}
                  </h3>
                  <p className="text-white/60 text-xs line-clamp-1 mt-0.5">
                    {app.description}
                  </p>
                </div>
                <div className="absolute top-2 right-2 bg-[#00F5FF] text-black px-2 py-0.5 rounded-full text-xs font-bold">
                  {app.credits}
                </div>
                {app.popular && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] text-[#F9FAFB] px-2 py-0.5 rounded-full text-xs font-medium">
                    Popüler
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* App Detail Modal */}
        <Dialog
          open={!!selectedApp}
          onOpenChange={open => !open && resetState()}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedApp && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {selectedApp.title}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedApp.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Upload Section */}
                  {!videoResult && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium">
                        {t("apps.uploadPhoto")}
                      </label>
                      <div
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadedImage ? (
                          <div className="relative">
                            <img
                              src={uploadedImage}
                              alt="Uploaded"
                              className="max-h-64 mx-auto rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={e => {
                                e.stopPropagation();
                                setUploadedImage(null);
                                setUploadedFile(null);
                                if (fileInputRef.current)
                                  fileInputRef.current.value = "";
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {t("apps.clickToUpload")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("apps.fileFormat")}
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  )}

                  {/* Generating State */}
                  {isGenerating && (
                    <LottieLoading
                      message={t("apps.status.generating")}
                      subMessage={t("apps.status.generatingSubtext")}
                    />
                  )}

                  {/* Processing State */}
                  {videoResult && !videoUrl && !isGenerating && (
                    <LottieLoading
                      message={t("apps.status.processing")}
                      subMessage={t("apps.status.processingSubtext")}
                    />
                  )}

                  {/* Video Result */}
                  {videoUrl && (
                    <div className="space-y-4">
                      <div className="aspect-[9/16] max-h-[400px] mx-auto bg-[#0B0F19] rounded-xl overflow-hidden">
                        <video
                          src={videoUrl}
                          poster={uploadedImage || undefined}
                          controls
                          autoPlay
                          loop
                          className="w-full h-full object-contain"
                          preload="metadata"
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button asChild>
                          <a
                            href={videoUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t("apps.download")}
                          </a>
                        </Button>
                        <Button variant="outline" onClick={resetState}>
                          Yeni {t("apps.generateVideo")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  {!videoResult && !isGenerating && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("apps.creditCost")}
                        </span>
                        <span className="font-semibold text-primary">
                          {t("apps.credits", {
                            count: selectedApp.credits.toString(),
                          })}
                        </span>
                      </div>
                      {user ? (
                        <Button
                          className="w-full"
                          size="lg"
                          disabled={!uploadedFile || isGenerating}
                          onClick={handleGenerate}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t("apps.generateVideo")}
                        </Button>
                      ) : (
                        <Button className="w-full" size="lg" asChild>
                          <a href={getLoginUrl()}>{t("apps.login")}</a>
                        </Button>
                      )}
                      {user && (
                        <p className="text-center text-sm text-muted-foreground">
                          Mevcut krediniz:{" "}
                          <span className="font-semibold">{user.credits}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Insufficient Credits Dialog */}
        <InsufficientCreditsDialog
          isOpen={showCreditsDialog}
          onClose={() => setShowCreditsDialog(false)}
          creditsNeeded={selectedApp?.credits || 0}
          currentCredits={user?.credits || 0}
          userId={user?.id || 0}
        />
      </div>
    </div>
  );
}
