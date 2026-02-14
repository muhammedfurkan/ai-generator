import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SaveCharacterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterImage: File;
  onSaved: (characterId: number) => void;
  onSkipAndGenerate: (characterImageUrl: string) => void;
}

export default function SaveCharacterModal({
  open,
  onOpenChange,
  characterImage,
  onSaved,
  onSkipAndGenerate,
}: SaveCharacterModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [style, setStyle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const createCharacterMutation = trpc.aiCharacters.create.useMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Lütfen karakter adı girin");
      return;
    }

    setIsUploading(true);

    try {
      // Upload image to S3
      const formData = new FormData();
      formData.append("file", characterImage);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Görsel yüklenemedi");
      }

      const uploadData = await uploadResponse.json();
      const characterImageUrl = uploadData.url;

      setIsUploading(false);
      setIsSaving(true);

      // Create character
      const result = await createCharacterMutation.mutateAsync({
        name: name.trim(),
        characterImageUrl,
        description: description.trim() || undefined,
        gender: gender || undefined,
        style: style.trim() || undefined,
      });

      if (result.success && result.id) {
        toast.success("Karakter başarıyla kaydedildi!");
        onSaved(result.id);
      }
    } catch (error: any) {
      console.error("Save character error:", error);
      toast.error(error.message || "Karakter kaydedilemedi");
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  const handleSkipAndGenerate = async () => {
    setIsSkipping(true);

    try {
      // Upload image to S3 first
      const formData = new FormData();
      formData.append("file", characterImage);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Görsel yüklenemedi");
      }

      const uploadData = await uploadResponse.json();
      const characterImageUrl = uploadData.url;

      // Close modal and trigger generation with the uploaded URL
      onOpenChange(false);
      onSkipAndGenerate(characterImageUrl);
    } catch (error: any) {
      console.error("Skip and generate error:", error);
      toast.error(error.message || "Görsel yüklenemedi");
    } finally {
      setIsSkipping(false);
    }
  };

  const previewUrl = characterImage ? URL.createObjectURL(characterImage) : "";
  const isLoading = isUploading || isSaving || isSkipping;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onOpenChange(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-card rounded-3xl border border-white/20 p-6 space-y-6 m-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Karakteri Kaydet
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Kaydedin veya direkt görsel oluşturun
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isLoading && onOpenChange(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Character preview"
                    className="w-32 h-32 object-cover rounded-2xl border border-white/20"
                  />
                </div>
              )}

              {/* Skip and Generate Button - Prominent */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-500/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Karakteri kaydetmeden hemen görsel oluşturmak ister misiniz?
                </p>
                <Button
                  onClick={handleSkipAndGenerate}
                  className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={isLoading}
                >
                  {isSkipping ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Hazırlanıyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Kaydetmeden Görsel Oluştur
                    </>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground">veya kaydedin</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Karakter Adı <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Maya, Alex, Luna..."
                    className="glass-card border-0 bg-white/8"
                    maxLength={100}
                    disabled={isLoading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Açıklama <span className="text-muted-foreground">(Opsiyonel)</span>
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Karakterinizi tanımlayın..."
                    className="glass-card border-0 bg-white/8 min-h-[80px] resize-none"
                    maxLength={500}
                    disabled={isLoading}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Cinsiyet <span className="text-muted-foreground">(Opsiyonel)</span>
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "female", label: "Kadın" },
                      { value: "male", label: "Erkek" },
                      { value: "other", label: "Diğer" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={gender === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGender(option.value as any)}
                        className="flex-1 rounded-full"
                        disabled={isLoading}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Stil <span className="text-muted-foreground">(Opsiyonel)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Gerçekçi", "Anime", "Çizgi Film", "3D", "Sanatsal"].map((s) => (
                      <Button
                        key={s}
                        variant={style === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStyle(style === s ? "" : s)}
                        className="rounded-full"
                        disabled={isLoading}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={isLoading}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-full gradient-button"
                  disabled={!name.trim() || isLoading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet ve Oluştur
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
