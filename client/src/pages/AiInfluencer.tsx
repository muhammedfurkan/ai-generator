// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsAuthenticated } from "@/_core/hooks/useIsAuthenticated";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Download,
  Loader2,
  ArrowLeft,
  X,
  Sparkles,
  ZoomIn,
  Plus,
  User,
  Image as ImageIcon,
  Wand2,
  Trash2,
  Edit,
  ChevronDown,
  Globe,
  Lock,
} from "lucide-react";
import Header from "@/components/Header";
import InsufficientCreditsDialog from "@/components/InsufficientCreditsDialog";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { ASPECT_RATIOS, RESOLUTIONS } from "@shared/const";
import ImageSkeleton from "@/components/ImageSkeleton";
import SaveCharacterModal from "@/components/SaveCharacterModal";
import GenerationLoadingCard from "@/components/GenerationLoadingCard";

type AiCharacter = {
  id: number;
  name: string;
  characterImageUrl: string;
  description: string | null;
  gender: string | null;
  style: string | null;
  usageCount: number;
  isPublic?: boolean;
};

export default function AiInfluencer() {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const characterImageInputRef = useRef<HTMLInputElement>(null);
  const referenceImageInputRef = useRef<HTMLInputElement>(null);

  // Character state
  const [selectedCharacter, setSelectedCharacter] =
    useState<AiCharacter | null>(null);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreviewUrl, setCharacterImagePreviewUrl] =
    useState<string>("");
  const [showSaveCharacterModal, setShowSaveCharacterModal] = useState(false);
  const [showCharacterDropdown, setShowCharacterDropdown] = useState(false);

  // Reference pose state
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreviewUrl, setReferenceImagePreviewUrl] =
    useState<string>("");

  // Generation state
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<
    "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3"
  >("1:1");
  const [resolution, setResolution] = useState<"1K" | "2K" | "4K">("1K");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingCharacter, setIsUploadingCharacter] = useState(false);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const [characterUploadProgress, setCharacterUploadProgress] = useState(0);
  const [referenceUploadProgress, setReferenceUploadProgress] = useState(0);

  // UI state
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Utils for cache invalidation
  const utils = trpc.useUtils();

  // Queries - hata durumunda sayfa çökmemeli
  const creditsQuery = trpc.generation.getCredits.useQuery(undefined, {
    // Sayfa açıldığında hemen fetch et
    refetchOnMount: true,
  });
  const charactersQuery = trpc.aiCharacters.list.useQuery(undefined, {
    refetchOnMount: true,
  });

  // Query hatalarını logla ve toast göster
  useEffect(() => {
    if (creditsQuery.error) {
      console.error("[AiInfluencer] Credits query error:", creditsQuery.error);
      toast.error(t("aiInfluencer.errors.creditsNotLoaded"));
    }
  }, [creditsQuery.error, t]);

  useEffect(() => {
    if (charactersQuery.error) {
      console.error(
        "[AiInfluencer] Characters query error:",
        charactersQuery.error
      );
      toast.error(t("aiInfluencer.errors.charactersNotLoaded"));
    }
  }, [charactersQuery.error, t]);

  // Mutations
  const generateMutation =
    trpc.aiCharacters.generateWithCharacter.useMutation();
  const deleteCharacterMutation = trpc.aiCharacters.delete.useMutation({
    onSuccess: () => {
      toast.success(t("aiInfluencer.success.characterDeleted"));
      charactersQuery.refetch();
      if (selectedCharacter) {
        setSelectedCharacter(null);
        setCharacterImagePreviewUrl("");
      }
    },
    onError: error => {
      toast.error(
        error.message || t("aiInfluencer.errors.characterDeleteFailed")
      );
    },
  });

  const generatePromptMutation = trpc.aiCharacters.generatePrompt.useMutation({
    onSuccess: data => {
      setPrompt(data.prompt);
      toast.success(
        t("aiInfluencer.success.promptGenerated", { location: data.location })
      );
    },
    onError: error => {
      // Handle authentication/session errors more gracefully
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("UNAUTHORIZED") ||
        errorMessage.includes("10001") ||
        errorMessage.includes("login")
      ) {
        toast.error(t("aiInfluencer.errors.sessionExpired"));
      } else {
        toast.error(error.message || t("aiInfluencer.errors.promptFailed"));
      }
    },
  });

  const togglePublicMutation = trpc.aiCharacters.togglePublic.useMutation({
    onSuccess: data => {
      toast.success(
        data.isPublic
          ? t("aiInfluencer.success.characterPublic")
          : t("aiInfluencer.success.characterPrivate")
      );
      charactersQuery.refetch();
      if (selectedCharacter) {
        setSelectedCharacter({ ...selectedCharacter, isPublic: data.isPublic });
      }
    },
    onError: error => {
      toast.error(error.message || t("aiInfluencer.errors.shareStatusFailed"));
    },
  });

  // Generate with temporary image mutation (hooks must be before early returns)
  const generateWithTempMutation =
    trpc.aiCharacters.generateWithTemporaryImage.useMutation();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Pending görselleri kontrol et (sadece bilgilendirme amaçlı)
  const pendingImagesQuery = trpc.generation.getPendingImages.useQuery(
    undefined,
    {
      refetchOnMount: true,
      // Sadece bir kez kontrol et, sürekli refetch yapma
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 dakika
    }
  );

  // Pending görsel sayısı
  const pendingCount = pendingImagesQuery.data?.length ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#7C3AED] to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#00F5FF]" />
          <p className="text-gray-300 text-lg">{t("aiInfluencer.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Handle character image selection
  const handleCharacterImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("aiInfluencer.errors.selectImageFile"));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("aiInfluencer.errors.fileSizeLimit"));
      return;
    }

    setCharacterImage(file);
    const previewUrl = URL.createObjectURL(file);
    setCharacterImagePreviewUrl(previewUrl);
    setSelectedCharacter(null); // Clear selected character when uploading new
  };

  // Handle reference image selection
  const handleReferenceImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("aiInfluencer.errors.selectImageFile"));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("aiInfluencer.errors.fileSizeLimit"));
      return;
    }

    setReferenceImage(file);
    const previewUrl = URL.createObjectURL(file);
    setReferenceImagePreviewUrl(previewUrl);
  };

  // Upload image to S3 with progress tracking
  const uploadImageToS3 = async (
    file: File,
    setProgress: (progress: number) => void,
    setUploading: (uploading: boolean) => void
  ): Promise<string | null> => {
    return new Promise(resolve => {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", event => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });

      xhr.addEventListener("error", () => {
        setUploading(false);
        resolve(null);
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  // Select existing character
  const handleSelectCharacter = (character: AiCharacter) => {
    setSelectedCharacter(character);
    setCharacterImagePreviewUrl(character.characterImageUrl);
    setCharacterImage(null);
    setShowCharacterDropdown(false);
  };

  // Clear character
  const handleClearCharacter = () => {
    setSelectedCharacter(null);
    setCharacterImage(null);
    setCharacterImagePreviewUrl("");
    if (characterImageInputRef.current) {
      characterImageInputRef.current.value = "";
    }
  };

  // Clear reference
  const handleClearReference = () => {
    setReferenceImage(null);
    setReferenceImagePreviewUrl("");
    if (referenceImageInputRef.current) {
      referenceImageInputRef.current.value = "";
    }
  };

  // Handle generation
  const handleGenerate = async () => {
    // Çoklu tıklama önleme
    if (isGenerating) {
      return;
    }

    if (!prompt.trim()) {
      toast.error(t("aiInfluencer.errors.promptRequired"));
      return;
    }

    // Need either selected character or uploaded character image
    if (!selectedCharacter && !characterImage) {
      toast.error(t("aiInfluencer.errors.characterRequired"));
      return;
    }

    setIsGenerating(true);

    try {
      let characterId = selectedCharacter?.id;

      // If new character image uploaded, we need to save it first
      if (characterImage && !selectedCharacter) {
        const uploadedUrl = await uploadImageToS3(
          characterImage,
          setCharacterUploadProgress,
          setIsUploadingCharacter
        );
        if (!uploadedUrl) {
          toast.error(t("aiInfluencer.errors.characterUploadFailed"));
          setIsGenerating(false);
          setIsUploadingCharacter(false);
          return;
        }
        setIsUploadingCharacter(false);

        // Show save character modal
        setShowSaveCharacterModal(true);
        setIsGenerating(false);
        return;
      }

      if (!characterId) {
        toast.error(t("aiInfluencer.errors.characterNotSelected"));
        setIsGenerating(false);
        return;
      }

      // Upload reference image if exists
      let referenceUrl: string | undefined;
      if (referenceImage) {
        const uploadedRef = await uploadImageToS3(
          referenceImage,
          setReferenceUploadProgress,
          setIsUploadingReference
        );
        if (uploadedRef) {
          referenceUrl = uploadedRef;
        }
        setIsUploadingReference(false);
      }

      // Generate image
      const result = await generateMutation.mutateAsync({
        characterId,
        prompt,
        referenceImageUrl: referenceUrl,
        aspectRatio,
        resolution,
      });

      if (result.success) {
        // Arka plan işleme başlatıldı - pending status
        if (result.status === "pending") {
          toast.success(
            "✅ Görsel oluşturma başlatıldı! Galeri sayfasından takip edebilirsiniz.",
            {
              duration: 6000,
            }
          );
          creditsQuery.refetch();
          charactersQuery.refetch(); // Refresh to update usage count
          // Galeri'yi güncelle - yeni işlem görünsün
          utils.generation.getHistory.invalidate();
          // Galeriye yönlendir
          setTimeout(() => {
            navigate("/gallery");
          }, 1500);
        } else if (result?.imageUrl) {
          // Eski format uyumluluğu - anında tamamlanan durumlar için
          setGeneratedImageUrl(result.imageUrl);
          toast.success(t("aiInfluencer.success.imageGenerated"));
          creditsQuery.refetch();
          charactersQuery.refetch();
          utils.generation.getHistory.invalidate();
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || t("aiInfluencer.errors.generationFailed");

      if (errorMessage.includes("INSUFFICIENT_CREDITS")) {
        setShowInsufficientCreditsDialog(true);
      } else if (errorMessage.includes("TIMEOUT")) {
        toast.error(t("aiInfluencer.errors.timeout"), { duration: 7000 });
      } else if (errorMessage.includes("API_ERROR")) {
        toast.error(t("aiInfluencer.errors.apiError"), { duration: 7000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle character saved - then automatically generate image
  const handleCharacterSaved = async (characterId: number) => {
    setShowSaveCharacterModal(false);

    // Refresh characters list
    await charactersQuery.refetch();

    // Get the newly created character
    const refreshedData = await charactersQuery.refetch();
    const newCharacter = refreshedData.data?.find(c => c.id === characterId);

    if (newCharacter) {
      setSelectedCharacter(newCharacter);
      setCharacterImage(null); // Clear the file since it's now saved as a character

      // Now automatically generate the image with the saved character
      toast.success(t("aiInfluencer.success.characterSavedGenerating"));

      // Generate image with the new character
      setIsGenerating(true);
      try {
        // Upload reference image if exists
        let referenceUrl: string | undefined;
        if (referenceImage) {
          const uploadedRef = await uploadImageToS3(
            referenceImage,
            setReferenceUploadProgress,
            setIsUploadingReference
          );
          if (uploadedRef) {
            referenceUrl = uploadedRef;
          }
        }

        // Generate image
        const result = await generateMutation.mutateAsync({
          characterId,
          prompt,
          referenceImageUrl: referenceUrl,
          aspectRatio,
          resolution,
        });

        if (result.success) {
          // Arka plan işleme başlatıldı - pending status
          if (result.status === "pending") {
            toast.success(t("aiInfluencer.success.generationStarted"), {
              duration: 6000,
            });
            creditsQuery.refetch();
            charactersQuery.refetch();
            utils.generation.getHistory.invalidate();
            // Galeriye yönlendir
            setTimeout(() => {
              navigate("/gallery");
            }, 1500);
          } else if (result.imageUrl) {
            // Eski format uyumluluğu
            setGeneratedImageUrl(result.imageUrl);
            toast.success(t("aiInfluencer.success.imageGenerated"));
            creditsQuery.refetch();
            charactersQuery.refetch();
            utils.generation.getHistory.invalidate();
          }
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || t("aiInfluencer.errors.generationFailed");

        if (errorMessage.includes("INSUFFICIENT_CREDITS")) {
          setShowInsufficientCreditsDialog(true);
        } else if (errorMessage.includes("TIMEOUT")) {
          toast.error(t("aiInfluencer.errors.timeout"), { duration: 7000 });
        } else if (errorMessage.includes("API_ERROR")) {
          toast.error(t("aiInfluencer.errors.apiError"), { duration: 7000 });
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      toast.success(t("aiInfluencer.success.characterSaved"));
    }
  };

  // Handle skip save and generate with temporary image

  const handleSkipAndGenerate = async (characterImageUrl: string) => {
    setShowSaveCharacterModal(false);
    setCharacterImage(null);

    toast.success(t("aiInfluencer.success.generating"));
    setIsGenerating(true);

    try {
      // Upload reference image if exists
      let referenceUrl: string | undefined;
      if (referenceImage) {
        const uploadedRef = await uploadImageToS3(
          referenceImage,
          setReferenceUploadProgress,
          setIsUploadingReference
        );
        if (uploadedRef) {
          referenceUrl = uploadedRef;
        }
        setIsUploadingReference(false);
      }

      // Generate image with temporary character image
      const result = await generateWithTempMutation.mutateAsync({
        characterImageUrl,
        prompt,
        referenceImageUrl: referenceUrl,
        aspectRatio,
        resolution,
      });

      if (result.success) {
        // Arka plan işleme başlatıldı - pending status
        if (result.status === "pending") {
          toast.success(t("aiInfluencer.success.generationStarted"), {
            duration: 6000,
          });
          // Galeri'yi güncelle - yeni işlem görünsün
          pendingImagesQuery.refetch();
          // Galeriye yönlendir
          navigate("/gallery");
          return;
        } else {
          // Eski format uyumluluğu - anında tamamlanan durumlar için
          setGeneratedImageUrl(result.imageUrl);
          toast.success(t("aiInfluencer.success.imageGenerated"));
          creditsQuery.refetch();
          utils.generation.getHistory.invalidate();
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || t("aiInfluencer.errors.generationFailed");

      if (errorMessage.includes("INSUFFICIENT_CREDITS")) {
        setShowInsufficientCreditsDialog(true);
      } else if (errorMessage.includes("TIMEOUT")) {
        toast.error(t("aiInfluencer.errors.timeout"), { duration: 7000 });
      } else if (errorMessage.includes("API_ERROR")) {
        toast.error(t("aiInfluencer.errors.apiError"), { duration: 7000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete character
  const handleDeleteCharacter = (characterId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("aiInfluencer.confirmDelete"))) {
      deleteCharacterMutation.mutate({ characterId });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isMobile ? 0.3 : 0.5 },
    },
  };

  const credits = creditsQuery.data?.credits ?? 0;
  const creditCost = creditsQuery.data?.creditCosts?.[resolution] ?? 10;

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
            <h1 className="text-3xl font-bold">AI Influencer Oluştur</h1>
            <p className="text-muted-foreground">
              Karakterinizi yükleyin ve yeni görseller oluşturun
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Inputs */}
          <motion.div
            className="lg:col-span-3 space-y-4"
            variants={containerVariants}
          >
            {/* Character Image Section */}
            <motion.div
              className="glass-card rounded-2xl border border-white/20 p-4 lg:p-5"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-[#00F5FF]" />
                  Karakter Görseli
                </h2>
                {charactersQuery.data && charactersQuery.data.length > 0 && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowCharacterDropdown(!showCharacterDropdown)
                      }
                      className="rounded-full"
                    >
                      Kayıtlı Karakterler ({charactersQuery.data.length})
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                    {showCharacterDropdown && (
                      <div
                        className="absolute right-0 top-full mt-2 w-64 max-h-[60vh] bg-background/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50 overflow-y-auto overscroll-contain touch-pan-y"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        {charactersQuery.data.map(character => (
                          <div
                            key={character.id}
                            className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => handleSelectCharacter(character)}
                          >
                            <img
                              src={character.characterImageUrl}
                              alt={character.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate flex items-center gap-1">
                                {character.name}
                                {character.isPublic && (
                                  <Globe className="h-3 w-3 text-green-400" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {character.usageCount} kullanım
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                character.isPublic
                                  ? "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                              }`}
                              onClick={e => {
                                e.stopPropagation();
                                togglePublicMutation.mutate({
                                  characterId: character.id,
                                });
                              }}
                              disabled={togglePublicMutation.isPending}
                              title={
                                character.isPublic
                                  ? "Gizli yap"
                                  : "Herkese açık yap"
                              }
                            >
                              {character.isPublic ? (
                                <Globe className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={e =>
                                handleDeleteCharacter(character.id, e)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={characterImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCharacterImageSelect}
                className="hidden"
              />

              {characterImagePreviewUrl ? (
                <div className="relative group">
                  <img
                    src={characterImagePreviewUrl}
                    alt="Karakter"
                    className="w-full max-h-[280px] lg:max-h-[320px] object-cover rounded-xl"
                  />
                  {isUploadingCharacter && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-2xl">
                      <div className="w-3/4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00F5FF] to-[#FF2E97] transition-all duration-300"
                          style={{ width: `${characterUploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#F9FAFB] mt-2">
                        Yükleniyor... {characterUploadProgress}%
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => characterImageInputRef.current?.click()}
                      className="rounded-full"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Değiştir
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearCharacter}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Kaldır
                    </Button>
                  </div>
                  {selectedCharacter && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">
                        {selectedCharacter.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => characterImageInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-[#00F5FF]/50 hover:bg-[#00F5FF]/5 transition-all"
                >
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    AI karakterinizin görselini yükleyin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP • Maks. 20MB
                  </p>
                </div>
              )}
            </motion.div>

            {/* Reference Pose Section */}
            <motion.div
              className="glass-card rounded-2xl border border-white/20 p-4 lg:p-5"
              variants={itemVariants}
            >
              <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-[#7C3AED]" />
                Referans Poz Görseli
                <span className="text-xs text-muted-foreground font-normal">
                  (Opsiyonel)
                </span>
              </h2>

              <input
                ref={referenceImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleReferenceImageSelect}
                className="hidden"
              />

              {referenceImagePreviewUrl ? (
                <div className="relative group">
                  <img
                    src={referenceImagePreviewUrl}
                    alt="Referans"
                    className="w-full max-h-[180px] object-cover rounded-xl"
                  />
                  {isUploadingReference && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-2xl">
                      <div className="w-3/4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] transition-all duration-300"
                          style={{ width: `${referenceUploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#F9FAFB] mt-2">
                        Yükleniyor... {referenceUploadProgress}%
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => referenceImageInputRef.current?.click()}
                      className="rounded-full"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Değiştir
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearReference}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Kaldır
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => referenceImageInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/5 transition-all"
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    İstediğiniz pozu gösteren bir görsel ekleyin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP • Maks. 20MB
                  </p>
                </div>
              )}
            </motion.div>

            {/* Prompt Section */}
            <motion.div
              className="glass-card rounded-2xl border border-white/20 p-4 lg:p-5"
              variants={itemVariants}
            >
              <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
                <Wand2 className="h-4 w-4 text-green-400" />
                Prompt
              </h2>

              <Textarea
                placeholder="Karakterinizi nasıl görmek istiyorsunuz? Örn: 'Sahilde gün batımında yürürken, casual kıyafetler'"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="min-h-[100px] lg:min-h-[80px] glass-card border-0 bg-white/8 text-foreground placeholder:text-muted-foreground focus:bg-white/12 resize-none text-sm"
              />

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground">
                  Detaylı açıklama daha iyi sonuçlar verir.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    generatePromptMutation.mutate({
                      characterName: selectedCharacter?.name,
                      gender:
                        (selectedCharacter?.gender as
                          | "male"
                          | "female"
                          | "other") || undefined,
                      style: selectedCharacter?.style || undefined,
                    });
                  }}
                  disabled={generatePromptMutation.isPending}
                  className="bg-gradient-to-r from-[#7C3AED]/20 to-[#7C3AED]/20 border-[#7C3AED]/30 hover:from-[#7C3AED]/30 hover:to-[#7C3AED]/30 text-[#7C3AED] hover:text-[#7C3AED]"
                >
                  {generatePromptMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Üretiliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI ile Prompt Üret
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Settings Section */}
            <motion.div
              className="glass-card rounded-2xl border border-white/20 p-4 lg:p-5"
              variants={itemVariants}
            >
              <h2 className="text-base font-semibold mb-3">Görsel Ayarları</h2>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  Görüntü Oranı
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_RATIOS.map(ratio => (
                    <Button
                      key={ratio.value}
                      variant={
                        aspectRatio === ratio.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className="rounded-full text-xs px-3"
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="text-sm font-medium mb-3 block">Kalite</label>
                <div className="flex flex-wrap gap-2">
                  {RESOLUTIONS.map(res => (
                    <Button
                      key={res.value}
                      variant={resolution === res.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setResolution(res.value as any)}
                      className="rounded-full px-4"
                    >
                      {res.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !prompt.trim() ||
                  (!selectedCharacter && !characterImage)
                }
                className="w-full gradient-button rounded-full py-5 text-base font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isUploadingCharacter
                      ? "Karakter yükleniyor..."
                      : isUploadingReference
                        ? "Referans yükleniyor..."
                        : "Oluşturuluyor..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Görsel Oluştur ({creditCost} Kredi)
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-3">
                Mevcut krediniz:{" "}
                <span className="font-semibold text-[#00F5FF]">{credits}</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Preview */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="glass-card rounded-2xl border border-white/20 p-4 lg:p-5 sticky top-24">
              <h2 className="text-base font-semibold mb-3">Önizleme</h2>

              {isGenerating ? (
                <GenerationLoadingCard
                  isVisible={true}
                  type="image"
                  className="border-0 shadow-none bg-transparent"
                />
              ) : generatedImageUrl ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={generatedImageUrl}
                      alt="Generated"
                      className="w-full max-h-[500px] object-contain rounded-xl"
                      loading="lazy"
                    />
                    {/* Desktop hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl hidden md:flex items-center justify-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowImagePreview(true)}
                        className="rounded-full"
                      >
                        <ZoomIn className="h-4 w-4 mr-1" />
                        Büyüt
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = generatedImageUrl;
                          link.download = `ai-influencer-${Date.now()}.png`;
                          link.click();
                        }}
                        className="rounded-full"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        İndir
                      </Button>
                    </div>
                  </div>
                  {/* Mobile always-visible buttons */}
                  <div className="flex gap-3 md:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImagePreview(true)}
                      className="flex-1 rounded-full"
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Büyüt
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = generatedImageUrl;
                        link.download = `ai-influencer-${Date.now()}.png`;
                        link.click();
                      }}
                      className="flex-1 rounded-full bg-[#00F5FF] hover:bg-[#00F5FF] text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      İndir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-white/5 rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-center text-sm px-6">
                    Karakter görseli ve prompt ekleyerek
                    <br />
                    yeni görseller oluşturun
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <InsufficientCreditsDialog
        isOpen={showInsufficientCreditsDialog}
        onClose={() => setShowInsufficientCreditsDialog(false)}
        creditsNeeded={creditCost}
        currentCredits={credits}
        userId={user?.id || 0}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={generatedImageUrl}
        prompt={prompt}
      />

      {showSaveCharacterModal && characterImage && (
        <SaveCharacterModal
          open={showSaveCharacterModal}
          onOpenChange={setShowSaveCharacterModal}
          characterImage={characterImage}
          onSaved={handleCharacterSaved}
          onSkipAndGenerate={handleSkipAndGenerate}
        />
      )}
    </div>
  );
}
