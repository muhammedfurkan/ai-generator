#!/usr/bin/env python3
"""
Refactor remaining pages to use i18n translation keys
"""

def refactor_verify_email():
    file_path = "client/src/pages/VerifyEmailPage.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add import if not present
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState, useEffect } from "react";',
            'import { useState, useEffect } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    # Add hook
    if 'const { t } = useLanguage();' not in content:
        # Find first useState or const declaration
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if '  const [' in line and 'VerifyEmailPage' not in lines[i-5:i]:
                lines.insert(i, '  const { t } = useLanguage();')
                content = '\n'.join(lines)
                break
    
    replacements = [
        ('"Email doğrulandı! Giriş sayfasına yönlendiriliyorsunuz..."', 't("verifyEmail.success.emailVerified")'),
        ('"Lütfen email adresinize gönderilen doğrulama kodunu girin"', 't("verifyEmail.info.enterCode")'),
        ('"Doğrulama kontrolü başarısız"', 't("verifyEmail.errors.verificationCheckFailed")'),
        ('"Lütfen 6 haneli doğrulama kodunu girin"', 't("verifyEmail.errors.enterSixDigitCode")'),
        ('"Doğrulama kodu hatalı"', 't("verifyEmail.errors.invalidCode")'),
        ('"Doğrulama başarısız. Lütfen tekrar deneyin."', 't("verifyEmail.errors.verificationFailed")'),
        ('"Doğrulama kodu yeniden gönderildi!"', 't("verifyEmail.success.codeResent")'),
        ('"Kod gönderilemedi"', 't("verifyEmail.errors.codeNotSent")'),
        ('"Kod gönderilemedi. Lütfen daha sonra tekrar deneyin."', 't("verifyEmail.errors.codeSendRetry")'),
        ('"Email adresinizi girin ve doğrulama durumunu kontrol edin"', 't("verifyEmail.enterEmailCheck")'),
        ('"Email adresinize gönderilen 6 haneli kodu girin"', 't("verifyEmail.enterSixDigitCode")'),
        ('"Doğrulama Durumunu Kontrol Et"', 't("verifyEmail.checkStatus")'),
        ('"Kodu Doğrula"', 't("verifyEmail.verifyCode")'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("VerifyEmailPage.tsx refactored successfully!")

def refactor_skin_enhancement():
    file_path = "client/src/pages/SkinEnhancement.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState, useRef } from "react";',
            'import { useState, useRef } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    if 'const { t } = useLanguage();' not in content:
        content = content.replace(
            '  const { user, isAuthenticated } = useAuth();',
            '  const { user, isAuthenticated } = useAuth();\n  const { t } = useLanguage();'
        )
    
    replacements = [
        ('"Cilt iyileştirme tamamlandı!"', 't("skinEnhancement.success.completed")'),
        ('"Geçmişten silindi"', 't("skinEnhancement.success.deletedFromHistory")'),
        ('"Lütfen bir görsel dosyası seçin"', 't("skinEnhancement.errors.selectImageFile")'),
        ('"Dosya boyutu 10MB\'dan küçük olmalıdır"', 't("skinEnhancement.errors.fileSizeLimit")'),
        ('"Lütfen giriş yapın"', 't("skinEnhancement.errors.pleaseLogin")'),
        ('"Görsel yüklenemedi"', 't("skinEnhancement.errors.imageUploadFailed")'),
        ('"Görsel yüklenirken bir hata oluştu"', 't("skinEnhancement.errors.uploadError")'),
        ('"Görsel indirildi"', 't("skinEnhancement.success.imageDownloaded")'),
        ('"İndirme başarısız"', 't("skinEnhancement.errors.downloadFailed")'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("SkinEnhancement.tsx refactored successfully!")

def refactor_community_characters():
    file_path = "client/src/pages/CommunityCharacters.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState } from "react";',
            'import { useState } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    if 'const { t } = useLanguage();' not in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if '  const [searchQuery' in line:
                lines.insert(i, '  const { t } = useLanguage();')
                content = '\n'.join(lines)
                break
    
    replacements = [
        ('placeholder="Karakter veya kullanıcı ara..."', 'placeholder={t("communityCharacters.searchPlaceholder")}'),
        ('"Aramanızla eşleşen karakter bulunamadı."', 't("communityCharacters.noResultsFound")'),
        ('"Henüz paylaşılan karakter yok."', 't("communityCharacters.noCharactersYet")'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("CommunityCharacters.tsx refactored successfully!")

def refactor_blog():
    file_path = "client/src/pages/Blog.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState } from "react";',
            'import { useState } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    if 'const { t } = useLanguage();' not in content:
        content = content.replace(
            '  const [searchQuery, setSearchQuery] = useState("");',
            '  const { t } = useLanguage();\n  const [searchQuery, setSearchQuery] = useState("");'
        )
    
    replacements = [
        ('const [selectedCategory, setSelectedCategory] = useState("Tümü");', 'const [selectedCategory, setSelectedCategory] = useState(t("blog.allCategories"));'),
        ('category: selectedCategory === "Tümü"', 'category: selectedCategory === t("blog.allCategories")'),
        ('const categoryList = categories || ["Tümü"];', 'const categoryList = categories || [t("blog.allCategories")];'),
        ('placeholder="Blog yazısı ara..."', 'placeholder={t("blog.searchPlaceholder")}'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Blog.tsx refactored successfully!")

if __name__ == "__main__":
    refactor_verify_email()
    refactor_skin_enhancement()
    refactor_community_characters()
    refactor_blog()
    print("\n✅ All remaining pages refactored successfully!")
