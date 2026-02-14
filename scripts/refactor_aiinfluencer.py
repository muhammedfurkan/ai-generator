#!/usr/bin/env python3
"""
Refactor AiInfluencer.tsx to use i18n translation keys
"""

def refactor_aiinfluencer():
    file_path = "client/src/pages/AiInfluencer.tsx"
    
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
    
    # Error messages
    replacements = [
        ('"Kredi bilgisi alınamadı, lütfen sayfayı yenileyin."', 't("aiInfluencer.errors.creditsNotLoaded")'),
        ('"Karakterler yüklenemedi, lütfen sayfayı yenileyin."', 't("aiInfluencer.errors.charactersNotLoaded")'),
        ('"Oturumunuz sona ermiş. Lütfen sayfayı yenileyin veya tekrar giriş yapın."', 't("aiInfluencer.errors.sessionExpired")'),
        ('"Prompt üretilemedi"', 't("aiInfluencer.errors.promptFailed")'),
        ('"Paylaşım durumu değiştirilemedi"', 't("aiInfluencer.errors.shareStatusFailed")'),
        ('"Lütfen bir görsel dosyası seçin"', 't("aiInfluencer.errors.selectImageFile")'),
        ('"Dosya boyutu 20MB\'dan küçük olmalıdır. Lütfen görseli sıkıştırın."', 't("aiInfluencer.errors.fileSizeLimit")'),
        ('"Lütfen bir prompt girin"', 't("aiInfluencer.errors.promptRequired")'),
        ('"Lütfen bir karakter görseli ekleyin veya kayıtlı bir karakter seçin"', 't("aiInfluencer.errors.characterRequired")'),
        ('"Karakter görseli yüklenemedi"', 't("aiInfluencer.errors.characterUploadFailed")'),
        ('"Karakter seçilmedi"', 't("aiInfluencer.errors.characterNotSelected")'),
        ('"Görsel oluşturulamadı"', 't("aiInfluencer.errors.generationFailed")'),
        ('"Görsel üretimi zaman aşımına uğradı. API yoğunluğu nedeniyle işlem tamamlanamadı, lütfen tekrar deneyin."', 't("aiInfluencer.errors.timeout")'),
        ('"Görsel üretim servisi geçici olarak yanıt vermiyor, lütfen birkaç dakika sonra tekrar deneyin."', 't("aiInfluencer.errors.apiError")'),
        ('"Karakter silinemedi"', 't("aiInfluencer.errors.characterDeleteFailed")'),
        
        # Success messages
        ('"Karakter silindi"', 't("aiInfluencer.success.characterDeleted")'),
        ('`Prompt üretildi: ${data.location}`', 't("aiInfluencer.success.promptGenerated", { location: data.location })'),
        ('data.isPublic ? "Karakter herkese açık yapıldı" : "Karakter gizli yapıldı"', 'data.isPublic ? t("aiInfluencer.success.characterPublic") : t("aiInfluencer.success.characterPrivate")'),
        ('"✅ Görsel oluşturma başlatıldı! Galeri sayfasından takip edebilirsiniz."', 't("aiInfluencer.success.generationStarted")'),
        ('"Görsel başarıyla oluşturuldu!"', 't("aiInfluencer.success.imageGenerated")'),
        ('"Karakter kaydedildi! Görsel oluşturuluyor..."', 't("aiInfluencer.success.characterSavedGenerating")'),
        ('"Karakter kaydedildi! Şimdi görsel oluşturabilirsiniz."', 't("aiInfluencer.success.characterSaved")'),
        ('"Görsel oluşturuluyor..."', 't("aiInfluencer.success.generating")'),
        
        # UI text
        ('"Yükleniyor..."', 't("aiInfluencer.loading")'),
        ('<h1 className="text-3xl font-bold">AI Influencer Oluştur</h1>', '<h1 className="text-3xl font-bold">{t("aiInfluencer.title")}</h1>'),
        ('Karakterinizi yükleyin ve yeni görseller oluşturun', '{t("aiInfluencer.subtitle")}'),
        ('Karakter Görseli', '{t("aiInfluencer.characterImage")}'),
        ('Kayıtlı Karakterler ({charactersQuery.data.length})', '{t("aiInfluencer.savedCharacters", { count: charactersQuery.data.length.toString() })}'),
        ('{character.usageCount} kullanım', '{t("aiInfluencer.usageCount", { count: character.usageCount.toString() })}'),
        ('title={character.isPublic ? "Gizli yap" : "Herkese açık yap"}', 'title={character.isPublic ? t("aiInfluencer.makePrivate") : t("aiInfluencer.makePublic")}'),
        ('AI karakterinizin görselini yükleyin', '{t("aiInfluencer.uploadCharacterImage")}'),
        ('JPG, PNG, WebP • Maks. 20MB', '{t("aiInfluencer.fileFormat")}'),
        ('Yükleniyor... {characterUploadProgress}%', '{t("aiInfluencer.uploading", { progress: characterUploadProgress.toString() })}'),
        ('Değiştir', '{t("aiInfluencer.change")}'),
        ('Kaldır', '{t("aiInfluencer.remove")}'),
        ('Referans Poz Görseli', '{t("aiInfluencer.referencePose")}'),
        ('(Opsiyonel)', '{t("aiInfluencer.optional")}'),
        ('İstediğiniz pozu gösteren bir görsel ekleyin', '{t("aiInfluencer.addReferencePose")}'),
        ('Yükleniyor... {referenceUploadProgress}%', '{t("aiInfluencer.uploading", { progress: referenceUploadProgress.toString() })}'),
        ('Prompt', '{t("aiInfluencer.prompt")}'),
        ('"Karakterinizi nasıl görmek istiyorsunuz? Örn: \'Sahilde gün batımında yürürken, casual kıyafetler\'"', 't("aiInfluencer.promptPlaceholder")'),
        ('Detaylı açıklama daha iyi sonuçlar verir.', '{t("aiInfluencer.detailedPromptBetter")}'),
        ('Üretiliyor...', '{t("aiInfluencer.generatingPrompt")}'),
        ('AI ile Prompt Üret', '{t("aiInfluencer.generatePromptAI")}'),
        ('Görsel Ayarları', '{t("aiInfluencer.imageSettings")}'),
        ('Görüntü Oranı', '{t("aiInfluencer.aspectRatio")}'),
        ('Kalite', '{t("aiInfluencer.quality")}'),
        ('"Karakter yükleniyor..."', 't("aiInfluencer.characterUploading")'),
        ('"Referans yükleniyor..."', 't("aiInfluencer.referenceUploading")'),
        ('"Oluşturuluyor..."', 't("aiInfluencer.generatingImage")'),
        ('Görsel Oluştur ({creditCost} Kredi)', '{t("aiInfluencer.generateImage", { cost: creditCost.toString() })}'),
        ('Mevcut krediniz: <span className="font-semibold text-blue-400">{credits}</span>', '{t("aiInfluencer.currentCredits", { credits: credits.toString() })}'),
        ('Önizleme', '{t("aiInfluencer.preview")}'),
        ('Büyüt', '{t("aiInfluencer.zoom")}'),
        ('İndir', '{t("aiInfluencer.download")}'),
        ('"Bu karakteri silmek istediğinizden emin misiniz?"', 't("aiInfluencer.confirmDelete")'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Special case: multi-line preview empty state
    content = content.replace(
        '''<p className="text-center text-sm px-6">
                    Karakter görseli ve prompt ekleyerek
                    <br />
                    yeni görseller oluşturun
                  </p>''',
        '''<p className="text-center text-sm px-6 whitespace-pre-line">
                    {t("aiInfluencer.previewEmpty")}
                  </p>'''
    )
    
    # Fix credits display - needs special handling
    content = content.replace(
        '''<p className="text-center text-sm text-muted-foreground mt-3">
                {t("aiInfluencer.currentCredits", { credits: credits.toString() })}
              </p>''',
        '''<p className="text-center text-sm text-muted-foreground mt-3">
                Mevcut krediniz: <span className="font-semibold text-blue-400">{credits}</span>
              </p>'''
    )
    
    # Actually, let's use a simpler approach for credits
    content = content.replace(
        'Mevcut krediniz: <span className="font-semibold text-blue-400">{credits}</span>',
        '{t("aiInfluencer.currentCredits", { credits: "" })} <span className="font-semibold text-blue-400">{credits}</span>'
    )
    
    # Actually for credits, let's do it properly
    content = content.replace(
        '{t("aiInfluencer.currentCredits", { credits: "" })} <span className="font-semibold text-blue-400">{credits}</span>',
        'Mevcut krediniz: <span className="font-semibold text-blue-400">{credits}</span>'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("AiInfluencer.tsx refactored successfully!")

if __name__ == "__main__":
    refactor_aiinfluencer()
