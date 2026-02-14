#!/usr/bin/env python3
"""
Refactor UgcAd.tsx to use i18n translation keys
"""

def refactor_ugc_ad():
    file_path = "client/src/pages/UgcAd.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add import
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState, useRef } from "react";',
            'import { useState, useRef } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    # Add hook - find a good location after state declarations
    if 'const { t } = useLanguage();' not in content:
        content = content.replace(
            '  const [, navigate] = useLocation();',
            '  const [, navigate] = useLocation();\n  const { t } = useLanguage();'
        )
    
    # Replacements
    replacements = [
        # Toast messages
        ('"Video oluşturma başlatıldı!"', 't("ugcAd.success.generationStarted")'),
        ('"Lütfen bir görsel dosyası seçin"', 't("ugcAd.errors.selectImageFile")'),
        ('"Dosya boyutu 20MB\'dan küçük olmalı"', 't("ugcAd.errors.fileSizeLimit")'),
        ('"Görsel yüklendi!"', 't("ugcAd.success.imageUploaded")'),
        ('"Görsel yüklenirken hata oluştu"', 't("ugcAd.errors.imageUploadFailed")'),
        
        # Status messages
        ('"Video oluşturuluyor, bu işlem birkaç dakika sürebilir..."', 't("ugcAd.status.processing")'),
        ('"Videonuz başarıyla oluşturuldu!"', 't("ugcAd.status.completed")'),
        ('"Bir hata oluştu"', 't("ugcAd.status.error")'),
        
        # UI text
        ('alt="Ürün"', 'alt={t("ugcAd.productImageAlt")}'),
        ('placeholder="Örn: Premium Kablosuz Kulaklık"', 'placeholder={t("ugcAd.productNamePlaceholder")}'),
        ('placeholder="Örn: 30 saat pil ömrü ile kesintisiz müzik"', 'placeholder={t("ugcAd.keyBenefitPlaceholder")}'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("UgcAd.tsx refactored successfully!")

if __name__ == "__main__":
    refactor_ugc_ad()
