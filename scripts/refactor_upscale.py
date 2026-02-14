#!/usr/bin/env python3
"""Script to refactor Upscale.tsx with translation keys"""

import re

# Read the file
with open('client/src/pages/Upscale.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define replacements
replacements = [
    # Imports - add useLanguage import after other imports
    (
        'import { cn } from "@/lib/utils";\nimport { getLoginUrl } from "@/const";\nimport Header from "@/components/Header";\nimport GenerationLoadingCard from "@/components/GenerationLoadingCard";',
        'import { cn } from "@/lib/utils";\nimport { getLoginUrl } from "@/const";\nimport Header from "@/components/Header";\nimport GenerationLoadingCard from "@/components/GenerationLoadingCard";\nimport { useLanguage } from "@/contexts/LanguageContext";'
    ),
    
    # Add hook
    (
        'export default function Upscale() {\n  const { user, loading: authLoading } = useAuth();',
        'export default function Upscale() {\n  const { t } = useLanguage();\n  const { user, loading: authLoading } = useAuth();'
    ),
    
    # Error messages in onError
    (
        '"Yetersiz kredi. Lütfen kredi satın alın."',
        't("upscale.errors.insufficientCredits")'
    ),
    
    # Timeout errors
    (
        '"İşlem zaman aşımına uğradı"',
        't("upscale.errors.timeout")'
    ),
    (
        '"İşlem zaman aşımına uğradı. Lütfen tekrar deneyin."',
        't("upscale.errors.timeoutRetry")'
    ),
    
    # Success and error toasts
    (
        '"Görsel başarıyla yükseltildi!"',
        't("upscale.toast.success")'
    ),
    (
        '"İşlem başarısız oldu"',
        't("upscale.errors.failed")'
    ),
    
    # File validation errors
    (
        '"Lütfen geçerli bir görsel dosyası seçin"',
        't("upscale.errors.invalidImage")'
    ),
    (
        '"Dosya boyutu 20MB\'dan küçük olmalıdır. Lütfen görseli sıkıştırın."',
        't("upscale.errors.fileTooLarge")'
    ),
    
    # Upload errors
    (
        'new Error("Görsel yüklenemedi")',
        'new Error(t("upscale.errors.uploadFailed"))'
    ),
    
    # Generic error
    (
        '"Bir hata oluştu"',
        't("upscale.errors.processingFailed")'
    ),
    
    # Download messages
    (
        '"Görsel indirildi!"',
        't("upscale.toast.downloaded")'
    ),
    (
        '"İndirme başarısız oldu"',
        't("upscale.toast.downloadFailed")'
    ),
    
    # UI text
    (
        '<span className="text-sm font-medium">Topaz AI ile Güçlendirildi</span>',
        '<span className="text-sm font-medium">{t("upscale.badge")}</span>'
    ),
    (
        'Görsel <span className="text-primary">Upscale</span>',
        '{t("upscale.title")}'
    ),
    (
        'Düşük çözünürlüklü görsellerinizi yapay zeka ile 8K\'ya kadar yükseltin.\n            Detayları koruyarak profesyonel kalitede sonuçlar elde edin.',
        '{t("upscale.subtitle")}'
    ),
    (
        '<h3 className="text-lg font-semibold mb-2">Görsel Yükle</h3>',
        '<h3 className="text-lg font-semibold mb-2">{t("upscale.uploadTitle")}</h3>'
    ),
    (
        'Sürükle bırak veya tıklayarak seç',
        '{t("upscale.uploadDesc")}'
    ),
    (
        'JPG, PNG, WebP • Maks. 20MB',
        '{t("upscale.uploadFormats")}'
    ),
    (
        'alt="Seçilen görsel"',
        'alt={t("upscale.selectedImageAlt")}'
    ),
    (
        '<p className="text-xs text-white mt-2">Yükleniyor... {uploadProgress}%</p>',
        '<p className="text-xs text-white mt-2">{t("upscale.uploading")} {uploadProgress}%</p>'
    ),
    (
        '<CardTitle className="text-lg">Büyütme Oranı</CardTitle>',
        '<CardTitle className="text-lg">{t("upscale.scaleTitle")}</CardTitle>'
    ),
    (
        'Görselinizi ne kadar büyütmek istediğinizi seçin',
        '{t("upscale.scaleDesc")}'
    ),
    (
        '{pricing?.[factor]?.credits || 0} Kredi',
        '{pricing?.[factor]?.credits || 0} {t("upscale.credits")}'
    ),
    (
        'Giriş Yap',
        '{t("upscale.login")}'
    ),
    (
        '{isUploading ? "Yükleniyor..." : "İşleniyor..."}',
        '{isUploading ? t("upscale.uploading") : t("upscale.processing")}'
    ),
    (
        'Upscale Yap ({getCreditCost()} Kredi)',
        '{t("upscale.upscaleButton", { credits: getCreditCost() })}'
    ),
    (
        '<span className="text-sm text-muted-foreground">İşleniyor...</span>',
        '<span className="text-sm text-muted-foreground">{t("upscale.processingStatus")}</span>'
    ),
    (
        'Topaz AI görseli işliyor. Bu işlem 1-3 dakika sürebilir.',
        '{t("upscale.processingInfo")}'
    ),
    (
        '<CardTitle className="text-lg flex items-center gap-2">\n                  <ImageIcon className="h-5 w-5" />\n                  Sonuç\n                </CardTitle>',
        '<CardTitle className="text-lg flex items-center gap-2">\n                  <ImageIcon className="h-5 w-5" />\n                  {t("upscale.resultTitle")}\n                </CardTitle>'
    ),
    (
        'Yükseltilmiş görseliniz burada görünecek',
        '{t("upscale.resultDesc")}'
    ),
    (
        'alt="Upscaled görsel"',
        'alt={t("upscale.upscaledImageAlt")}'
    ),
    (
        'İndir',
        '{t("upscale.download")}'
    ),
    (
        'Yeni Görsel',
        '{t("upscale.newImage")}'
    ),
    (
        '<h3 className="text-lg font-semibold mb-2">İşlem Başarısız</h3>',
        '<h3 className="text-lg font-semibold mb-2">{t("upscale.failedTitle")}</h3>'
    ),
    (
        '{currentResult.error || "Bir hata oluştu. Lütfen tekrar deneyin."}',
        '{currentResult.error || t("upscale.failedDesc")}'
    ),
    (
        'Tekrar Dene',
        '{t("upscale.retry")}'
    ),
    (
        '<h3 className="text-lg font-semibold mb-2">Sonuç Bekleniyor</h3>',
        '<h3 className="text-lg font-semibold mb-2">{t("upscale.waitingTitle")}</h3>'
    ),
    (
        'Bir görsel yükleyin ve upscale işlemini başlatın',
        '{t("upscale.waitingDesc")}'
    ),
    (
        '<div className="text-xs text-muted-foreground">Maksimum Çözünürlük</div>',
        '<div className="text-xs text-muted-foreground">{t("upscale.maxResolution")}</div>'
    ),
    (
        '<div className="text-xs text-muted-foreground">Topaz Teknolojisi</div>',
        '<div className="text-xs text-muted-foreground">{t("upscale.technology")}</div>'
    ),
]

# Apply all replacements
for old, new in replacements:
    content = content.replace(old, new)

# Write the updated content
with open('client/src/pages/Upscale.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Upscale.tsx refactored successfully!")
