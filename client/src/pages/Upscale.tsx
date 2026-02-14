import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Sparkles, Download, ArrowRight, ZoomIn, Image as ImageIcon, Loader2, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import GenerationLoadingCard from "@/components/GenerationLoadingCard";
import { useLanguage } from "@/contexts/LanguageContext";

type UpscaleFactor = "2" | "4" | "8";

interface UpscaleResult {
  id: number | null;
  taskId: string;
  status: "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}

export default function Upscale() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>("2");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<UpscaleResult | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: pricing } = trpc.upscale.getPricing.useQuery();
  const utils = trpc.useUtils();
  
  const createUpscaleMutation = trpc.upscale.create.useMutation({
    onSuccess: (data) => {
      setCurrentResult({
        id: data.id,
        taskId: data.taskId,
        status: "processing",
      });
      setPollCount(0);
      // Galeri'yi hemen güncelle - yeni işlem görünsün
      utils.upscale.list.invalidate();
      pollStatus(data.taskId);
    },
    onError: (error) => {
      setIsProcessing(false);
      const message = error.message.includes("INSUFFICIENT_CREDITS")
        ? t("upscale.errors.insufficientCredits")
        : error.message;
      toast.error(message);
    },
  });

  const checkStatusQuery = trpc.upscale.checkStatus.useQuery(
    { taskId: currentResult?.taskId || "" },
    { enabled: false }
  );

  const pollStatus = useCallback(async (taskId: string) => {
    const maxPolls = 60; // 5 minutes max (5s intervals)
    let polls = 0;

    const poll = async () => {
      if (polls >= maxPolls) {
        setIsProcessing(false);
        setCurrentResult((prev) => prev ? { ...prev, status: "failed", error: t("upscale.errors.timeout") } : null);
        toast.error(t("upscale.errors.timeoutRetry"));
        return;
      }

      try {
        const result = await checkStatusQuery.refetch();
        polls++;
        setPollCount(polls);

        if (result.data?.status === "completed" && result.data?.imageUrl) {
          setIsProcessing(false);
          const imageUrl = result.data.imageUrl;
          setCurrentResult((prev) => prev ? { ...prev, status: "completed", imageUrl } : null);
          toast.success(t("upscale.toast.success"));
        } else if (result.data?.status === "failed") {
          setIsProcessing(false);
          const errorMsg = result.data?.error || undefined;
          setCurrentResult((prev) => prev ? { ...prev, status: "failed", error: errorMsg } : null);
          toast.error(result.data?.error || t("upscale.errors.failed"));
        } else {
          // Still processing, poll again
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error("Poll error:", error);
        setTimeout(poll, 5000);
      }
    };

    poll();
  }, [checkStatusQuery]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("upscale.errors.invalidImage"));
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("upscale.errors.fileTooLarge"));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setCurrentResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleUpscale = async () => {
    // Çoklu tıklama önleme
    if (isProcessing) {
      return;
    }

    if (!selectedFile || !user) return;

    setIsProcessing(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload image to S3 first with progress tracking
      const formData = new FormData();
      formData.append("file", selectedFile);

      const imageUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.url);
            } catch {
              reject(new Error(t("upscale.errors.uploadFailed")));
            }
          } else {
            reject(new Error(t("upscale.errors.uploadFailed")));
          }
        });
        
        xhr.addEventListener("error", () => {
          reject(new Error(t("upscale.errors.uploadFailed")));
        });
        
        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
      
      setIsUploading(false);

      // Create upscale task
      await createUpscaleMutation.mutateAsync({
        imageUrl,
        upscaleFactor,
      });
    } catch (error) {
      setIsProcessing(false);
      setIsUploading(false);
      toast.error(error instanceof Error ? error.message : t("upscale.errors.processingFailed"));
    }
  };

  const handleDownload = async () => {
    if (!currentResult?.imageUrl) return;

    try {
      const response = await fetch(currentResult.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upscaled-${upscaleFactor}x-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t("upscale.toast.downloaded"));
    } catch (error) {
      toast.error(t("upscale.toast.downloadFailed"));
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setCurrentResult(null);
    setPollCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCreditCost = () => {
    if (!pricing) return 0;
    return pricing[upscaleFactor]?.credits || 0;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <Header />
      

      
      {/* Page Content */}
      <div className="container py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <ZoomIn className="h-4 w-4" />
            <span className="text-sm font-medium">{t("upscale.badge")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {t("upscale.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("upscale.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Area */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!selectedImage ? (
                  <div
                    className="flex flex-col items-center justify-center py-12 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t("upscale.uploadTitle")}</h3>
                    <p className="text-muted-foreground text-sm text-center mb-4">
                      {t("upscale.uploadDesc")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("upscale.uploadFormats")}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt={t("upscale.selectedImageAlt")}
                      className="w-full h-auto rounded-lg max-h-[400px] object-contain"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                        <div className="w-3/4 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-white mt-2">{t("upscale.uploading")} {uploadProgress}%</p>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upscale Factor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("upscale.scaleTitle")}</CardTitle>
                <CardDescription>
                  {t("upscale.scaleDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={upscaleFactor}
                  onValueChange={(v) => setUpscaleFactor(v as UpscaleFactor)}
                  className="grid grid-cols-3 gap-4"
                  disabled={isProcessing}
                >
                  {(["2", "4", "8"] as UpscaleFactor[]).map((factor) => (
                    <div key={factor}>
                      <RadioGroupItem
                        value={factor}
                        id={`factor-${factor}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`factor-${factor}`}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        )}
                      >
                        <span className="text-2xl font-bold">{factor}x</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {pricing?.[factor]?.description || ""}
                        </span>
                        <span className="text-sm font-medium text-primary mt-2">
                          {pricing?.[factor]?.credits || 0} {t("upscale.credits")}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Action Button */}
            {!user ? (
              <Button className="w-full h-12 text-lg" asChild>
                <a href={getLoginUrl()}>
                  {t("upscale.login")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <Button
                className="w-full h-12 text-lg"
                onClick={handleUpscale}
                disabled={!selectedImage || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isUploading ? t("upscale.uploading") : t("upscale.processing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t("upscale.upscaleButton", { credits: getCreditCost() })}
                  </>
                )}
              </Button>
            )}

            {/* Processing Progress */}
            {isProcessing && !isUploading && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t("upscale.processingStatus")}</span>
                    <span className="text-sm text-muted-foreground">{Math.min(pollCount * 5, 100)}%</span>
                  </div>
                  <Progress value={Math.min(pollCount * 5, 95)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("upscale.processingInfo")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Result */}
          <div className="space-y-6">
            <Card className="h-full min-h-[500px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {t("upscale.resultTitle")}
                </CardTitle>
                <CardDescription>
                  {t("upscale.resultDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {isProcessing ? (
                  <GenerationLoadingCard
                    isVisible={true}
                    type="image"
                    className="border-0 shadow-none bg-transparent h-[400px]"
                  />
                ) : currentResult?.status === "completed" && currentResult.imageUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={currentResult.imageUrl}
                        alt={t("upscale.upscaledImageAlt")}
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleDownload} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        {t("upscale.download")}
                      </Button>
                      <Button variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("upscale.newImage")}
                      </Button>
                    </div>
                  </div>
                ) : currentResult?.status === "failed" ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t("upscale.failedTitle")}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {currentResult.error || t("upscale.failedDesc")}
                    </p>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("upscale.retry")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ZoomIn className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t("upscale.waitingTitle")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("upscale.waitingDesc")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">8K</div>
                  <div className="text-xs text-muted-foreground">{t("upscale.maxResolution")}</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">AI</div>
                  <div className="text-xs text-muted-foreground">{t("upscale.technology")}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
