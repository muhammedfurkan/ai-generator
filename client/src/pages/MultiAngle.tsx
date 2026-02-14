import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ImageIcon,
  Sparkles,
  ArrowLeft,
  Package,
  Archive,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";

interface AngleSet {
  id: string;
  name: string;
  nameTr: string;
  credits: number;
  angleCount: number;
  angles: { en: string; tr: string }[];
}

interface MultiAngleImage {
  id: number;
  angleName: string;
  status: string;
  generatedImageUrl: string | null;
  errorMessage: string | null;
}

interface JobStatus {
  job: {
    id: number;
    status: string;
    totalImages: number;
    completedImages: number;
    errorMessage: string | null;
    createdAt: Date;
    completedAt: Date | null;
  };
  images: MultiAngleImage[];
  progress: number;
}

export default function MultiAngle() {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedAngleSet, setSelectedAngleSet] = useState<string>("temel_4");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: angleSets } = trpc.multiAngle.getAngleSets.useQuery();
  const { data: jobStatus, refetch: refetchStatus } =
    trpc.multiAngle.getStatus.useQuery(
      { jobId: currentJobId! },
      { enabled: !!currentJobId, refetchInterval: currentJobId ? 3000 : false }
    );
  const creditsQuery = trpc.generation.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const userCredits = creditsQuery.data?.credits ?? 0;

  // Mutations
  const createJobMutation = trpc.multiAngle.create.useMutation({
    onSuccess: data => {
      setCurrentJobId(data.jobId);
      setIsGenerating(true);
      toast.success(
        t("multiAngle.toast.generating", {
          count: data.totalImages.toString(),
        }),
        {
          description: t("multiAngle.toast.creditsUsed", {
            credits: data.creditsUsed.toString(),
          }),
        }
      );
    },
    onError: error => {
      toast.error(t("multiAngle.toast.error"), { description: error.message });
      setIsGenerating(false);
    },
  });

  // Sync pending tasks mutation
  const syncMutation = trpc.multiAngle.syncPendingTasks.useMutation({
    onSuccess: data => {
      if (data.synced > 0) {
        toast.success(data.message);
        refetchStatus();
      }
    },
    onError: error => {
      console.error("Sync error:", error);
    },
  });

  // Stop polling when job is complete
  useEffect(() => {
    if (
      jobStatus?.job.status === "completed" ||
      jobStatus?.job.status === "partial" ||
      jobStatus?.job.status === "failed"
    ) {
      setIsGenerating(false);
    }
  }, [jobStatus?.job.status]);

  // Auto-sync if job is stuck in processing for too long
  useEffect(() => {
    if (
      currentJobId &&
      jobStatus?.job.status === "processing" &&
      isGenerating
    ) {
      // Check if any images are stuck (processing for more than 2 minutes)
      const processingImages = jobStatus.images.filter(
        img => img.status === "processing"
      );
      if (processingImages.length > 0 && jobStatus.job.completedImages === 0) {
        // Try to sync after 30 seconds of no progress
        const syncTimer = setTimeout(() => {
          console.log("[MultiAngle] Attempting auto-sync for stuck job");
          syncMutation.mutate({ jobId: currentJobId });
        }, 30000);
        return () => clearTimeout(syncTimer);
      }
    }
  }, [currentJobId, jobStatus, isGenerating, syncMutation]);

  // Handle file upload
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("multiAngle.errors.invalidFileType"), {
          description: t("multiAngle.errors.invalidFileTypeDesc"),
        });
        return;
      }

      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error(t("multiAngle.errors.fileTooLarge"), {
          description: t("multiAngle.errors.fileTooLargeDesc"),
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", event => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.url) {
                  resolve(response.url);
                } else {
                  reject(new Error(t("multiAngle.errors.uploadFailed")));
                }
              } catch {
                reject(new Error(t("multiAngle.errors.invalidServerResponse")));
              }
            } else {
              reject(new Error(`Yükleme hatası: ${xhr.status}`));
            }
          };
          xhr.onerror = () =>
            reject(new Error(t("multiAngle.errors.networkError")));
          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        const url = await uploadPromise;
        setReferenceImage(url);
        toast.success(t("multiAngle.toast.imageUploaded"));
      } catch (error: any) {
        toast.error(t("multiAngle.errors.uploadError"), {
          description: error.message,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    []
  );

  // Handle generate
  const handleGenerate = useCallback(() => {
    if (!referenceImage) {
      toast.error(t("multiAngle.errors.noReferenceImage"));
      return;
    }

    const selectedSet = angleSets?.find(s => s.id === selectedAngleSet);
    if (!selectedSet) return;

    if ((userCredits ?? 0) < selectedSet.credits) {
      toast.error("Yetersiz kredi", {
        description: `Bu işlem için ${selectedSet.credits} kredi gerekli`,
        action: {
          label: t("multiAngle.buyCredits"),
          onClick: () => (window.location.href = "/packages"),
        },
      });
      return;
    }

    createJobMutation.mutate({
      referenceImageUrl: referenceImage,
      angleSet: selectedAngleSet as "temel_4" | "standart_6" | "profesyonel_8",
    });
  }, [
    referenceImage,
    selectedAngleSet,
    angleSets,
    userCredits,
    createJobMutation,
  ]);

  // Download single image
  const handleDownload = useCallback(async (url: string, angleName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `multi-angle-${angleName.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      toast.error(t("multiAngle.errors.downloadError"));
    }
  }, []);

  // Download all images as ZIP
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = useCallback(async () => {
    if (!jobStatus?.images) return;

    const completedImages = jobStatus.images.filter(
      img => img.status === "completed" && img.generatedImageUrl
    );

    if (completedImages.length === 0) {
      toast.error(t("multiAngle.errors.noImagesToDownload"));
      return;
    }

    setIsDownloading(true);
    toast.info(`${completedImages.length} görsel ZIP dosyasına ekleniyor...`);

    try {
      const zip = new JSZip();
      const folder = zip.folder("multi-angle-photos");

      // Tüm görselleri paralel olarak indir
      const downloadPromises = completedImages.map(async (img, index) => {
        try {
          const response = await fetch(img.generatedImageUrl!);
          const blob = await response.blob();
          const fileName = `${String(index + 1).padStart(2, "0")}-${img.angleName.replace(/\s+/g, "-")}.png`;
          folder?.file(fileName, blob);
        } catch (error) {
          console.error(`İndirme hatası (${img.angleName}):`, error);
        }
      });

      await Promise.all(downloadPromises);

      // ZIP dosyasını oluştur ve indir
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(zipBlob, `multi-angle-${timestamp}.zip`);

      toast.success(
        t("multiAngle.download.zipDownloaded", {
          count: completedImages.length.toString(),
        })
      );
    } catch (error) {
      console.error("ZIP creation error:", error);
      toast.error(t("multiAngle.errors.zipCreationFailed"));
    } finally {
      setIsDownloading(false);
    }
  }, [jobStatus?.images]);

  // Reset for new job
  const handleReset = useCallback(() => {
    setCurrentJobId(null);
    setReferenceImage(null);
    setIsGenerating(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-300 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const selectedSet = angleSets?.find(s => s.id === selectedAngleSet);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {!currentJobId ? (
          // Setup View
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Upload Section */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">
                  1. Referans Görsel Yükle
                </CardTitle>
                <CardDescription>
                  Farklı açılardan oluşturulacak kişinin net bir fotoğrafını
                  yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!referenceImage ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-64 border-2 border-dashed border-zinc-700 rounded-xl hover:border-[#CCFF00]/50 transition-colors flex flex-col items-center justify-center gap-4 text-zinc-400 hover:text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-12 h-12 animate-spin text-[#CCFF00]" />
                        <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#CCFF00] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span>Yükleniyor... %{uploadProgress}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12" />
                        <span>Görsel yüklemek için tıklayın</span>
                        <span className="text-sm text-zinc-500">
                          JPG, PNG, WebP • Maks. 20MB
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-full max-h-96 object-contain rounded-xl"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReferenceImage(null)}
                      className="absolute top-2 right-2 bg-black/50 border-zinc-700"
                    >
                      Değiştir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Angle Set Selection */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">2. Açı Seti Seç</CardTitle>
                <CardDescription>
                  İhtiyacınıza uygun açı setini seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {angleSets?.map(set => (
                    <button
                      key={set.id}
                      onClick={() => setSelectedAngleSet(set.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedAngleSet === set.id
                          ? "border-[#CCFF00] bg-[#CCFF00]/10"
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{set.nameTr}</span>
                        <span
                          className={`text-sm font-bold ${
                            selectedAngleSet === set.id
                              ? "text-[#CCFF00]"
                              : "text-zinc-400"
                          }`}
                        >
                          {set.credits} Kredi
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        {set.angleCount} farklı açı
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {set.angles.slice(0, 4).map((angle, i) => (
                          <span
                            key={i}
                            className="text-xs bg-zinc-800 px-2 py-1 rounded"
                          >
                            {angle.tr}
                          </span>
                        ))}
                        {set.angles.length > 4 && (
                          <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                            +{set.angles.length - 4}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={!referenceImage || createJobMutation.isPending}
                className="bg-[#CCFF00] text-black hover:bg-[#b8e600] px-8 py-6 text-lg font-bold"
              >
                {createJobMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Başlatılıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {selectedSet?.angleCount} Fotoğraf Oluştur (
                    {selectedSet?.credits} Kredi)
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Progress/Results View
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Progress Header */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {jobStatus?.job.status === "completed"
                        ? t("multiAngle.status.completed")
                        : jobStatus?.job.status === "partial"
                          ? t("multiAngle.status.partial")
                          : jobStatus?.job.status === "failed"
                            ? t("multiAngle.status.failed")
                            : t("multiAngle.status.generating")}
                    </h2>
                    <p className="text-zinc-400">
                      {jobStatus?.job.completedImages ?? 0} /{" "}
                      {jobStatus?.job.totalImages ?? 0} fotoğraf
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {jobStatus?.job.status === "processing" && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          currentJobId &&
                          syncMutation.mutate({ jobId: currentJobId })
                        }
                        disabled={syncMutation.isPending}
                        className="text-[#CCFF00] border-[#CCFF00]/50 hover:bg-[#CCFF00]/10"
                      >
                        {syncMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 mr-2" />
                        )}
                        Senkronize Et
                      </Button>
                    )}
                    {jobStatus?.job.status === "completed" && (
                      <Button
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        className="bg-[#CCFF00] text-black hover:bg-[#b8e600] disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Archive className="w-4 h-4 mr-2" />
                        )}
                        {isDownloading
                          ? t("multiAngle.download.preparingZip")
                          : t("multiAngle.download.downloadZip")}
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleReset}>
                      Yeni Oluştur
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#CCFF00]"
                    initial={{ width: 0 }}
                    animate={{ width: `${jobStatus?.progress ?? 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {jobStatus?.images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
                  >
                    {image.status === "completed" && image.generatedImageUrl ? (
                      <>
                        <img
                          src={image.generatedImageUrl}
                          alt={image.angleName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-sm font-medium mb-2">
                              {image.angleName}
                            </p>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleDownload(
                                  image.generatedImageUrl!,
                                  image.angleName
                                )
                              }
                              className="w-full bg-[#CCFF00] text-black hover:bg-[#b8e600]"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              İndir
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                      </>
                    ) : image.status === "failed" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-red-500 p-4">
                        <XCircle className="w-8 h-8 mb-2" />
                        <p className="text-xs text-center">{image.angleName}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {image.errorMessage || t("multiAngle.status.failed")}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-4">
                        {image.status === "processing" ? (
                          <>
                            <Loader2 className="w-8 h-8 mb-2 animate-spin text-[#CCFF00]" />
                            <p className="text-xs text-center">
                              {image.angleName}
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">
                              İşleniyor...
                            </p>
                          </>
                        ) : (
                          <>
                            <Clock className="w-8 h-8 mb-2" />
                            <p className="text-xs text-center">
                              {image.angleName}
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">
                              Sırada...
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Reference Image Preview */}
            {referenceImage && (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm">Referans Görsel</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
