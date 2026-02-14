#!/usr/bin/env python3
"""
Refactor Apps.tsx to use i18n translation keys
"""

def refactor_apps():
    file_path = "client/src/pages/Apps.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add import
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState, useRef, useEffect } from "react";',
            'import { useState, useRef, useEffect } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    # Add hook after const declarations
    if 'const { t } = useLanguage();' not in content:
        content = content.replace(
            '  const { user } = useAuth();',
            '  const { user } = useAuth();\n  const { t } = useLanguage();'
        )
    
    # Replacements
    replacements = [
        # Error messages
        ('"Görsel yüklenemedi"', 't("apps.errors.imageUploadFailed")'),
        ('"Video oluşturma hatası"', 't("apps.errors.videoGenerationFailed")'),
        
        # UI text
        ('Yükleniyor...', '{t("apps.loading")}'),
        ('Viral Video Uygulamaları', '{t("apps.title")}'),
        ('"Popüler"', 't("apps.popular")'),
        ('Fotoğraf Yükle', '{t("apps.uploadPhoto")}'),
        ('Fotoğraf yüklemek için tıklayın', '{t("apps.clickToUpload")}'),
        ('PNG, JPG, WEBP (max 10MB)', '{t("apps.fileFormat")}'),
        ('Kredi Maliyeti:', '{t("apps.creditCost")}'),
        ('Video Oluştur', '{t("apps.generateVideo")}'),
        ('Yeni Video Oluştur', '{t("apps.newVideo")}'),
        ('İndir', '{t("apps.download")}'),
        ('Giriş Yap', '{t("apps.login")}'),
        
        # Status messages
        ('"Video oluşturuluyor..."', 't("apps.status.generating")'),
        ('"Bu işlem 1-3 dakika sürebilir"', 't("apps.status.generatingSubtext")'),
        ('"Video işleniyor..."', 't("apps.status.processing")'),
        ('"Lütfen bekleyin, video hazırlanıyor"', 't("apps.status.processingSubtext")'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Special cases with complex replacements
    
    # Subtitle with line break
    content = content.replace(
        '''<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tek bir fotoğrafla sosyal medyada viral olabilecek videolar oluşturun.
            Sadece fotoğraf yükleyin, gerisini yapay zeka halleder!
          </p>''',
        '''<p className="text-muted-foreground text-lg max-w-2xl mx-auto whitespace-pre-line">
            {t("apps.subtitle")}
          </p>'''
    )
    
    # Credit display with dynamic value
    content = content.replace(
        '<span className="font-semibold text-primary">{selectedApp.credits} Kredi</span>',
        '<span className="font-semibold text-primary">{t("apps.credits", { count: selectedApp.credits.toString() })}</span>'
    )
    
    # Current credits display
    content = content.replace(
        'Mevcut krediniz: <span className="font-semibold">{user.credits}</span>',
        '{t("apps.currentCredits", { credits: "" })} <span className="font-semibold">{user.credits}</span>'
    )
    
    # Actually, let's keep the credits display simple
    content = content.replace(
        '{t("apps.currentCredits", { credits: "" })} <span className="font-semibold">{user.credits}</span>',
        'Mevcut krediniz: <span className="font-semibold">{user.credits}</span>'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Apps.tsx refactored successfully!")

if __name__ == "__main__":
    refactor_apps()
