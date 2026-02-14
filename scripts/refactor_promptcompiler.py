#!/usr/bin/env python3
"""
Refactor PromptCompiler.tsx to use i18n translations
"""

def main():
    filepath = "client/src/pages/PromptCompiler.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace model options
    content = content.replace(
        '{ value: "image", label: "Görsel", icon: Image, description: "SD / Nano Banana Pro" },',
        '{ value: "image", label: t("promptCompiler.model.image"), icon: Image, description: t("promptCompiler.model.imageDesc") },'
    )
    content = content.replace(
        '{ value: "universal", label: "Universal", icon: Globe, description: "Her yerde çalışır" },',
        '{ value: "universal", label: t("promptCompiler.model.universal"), icon: Globe, description: t("promptCompiler.model.universalDesc") },'
    )
    
    # Replace quality options
    content = content.replace(
        '{ value: "draft", label: "Draft", description: "Hızlı" },',
        '{ value: "draft", label: t("promptCompiler.quality.draft"), description: t("promptCompiler.quality.draftDesc") },'
    )
    content = content.replace(
        '{ value: "high", label: "High", description: "Detaylı" },',
        '{ value: "high", label: t("promptCompiler.quality.high"), description: t("promptCompiler.quality.highDesc") },'
    )
    
    # Replace toast messages
    content = content.replace(
        'toast.success("Prompt başarıyla oluşturuldu!");',
        'toast.success(t("promptCompiler.toast.success"));'
    )
    content = content.replace(
        'toast.error(data.error || "Bir hata oluştu");',
        'toast.error(data.error || t("promptCompiler.toast.error"));'
    )
    content = content.replace(
        'toast.error("Oturumunuz sona ermiş. Lütfen sayfayı yenileyin veya tekrar giriş yapın.");',
        'toast.error(t("promptCompiler.toast.sessionExpired"));'
    )
    content = content.replace(
        'toast.error("Prompt oluşturulurken bir hata oluştu");',
        'toast.error(t("promptCompiler.toast.generationError"));'
    )
    content = content.replace(
        'toast.error("Lütfen bir açıklama girin");',
        'toast.error(t("promptCompiler.toast.enterDescription"));'
    )
    content = content.replace(
        'toast.success("Varyasyon seçildi");',
        'toast.success(t("promptCompiler.toast.variationSelected"));'
    )
    content = content.replace(
        'toast.success("Kopyalandı!");',
        'toast.success(t("promptCompiler.toast.copied"));'
    )
    
    # Replace placeholder
    content = content.replace(
        'placeholder="Kapadokya\'da gün batımında, sokakta yürüyen şık bir kadın, sinematik..."',
        'placeholder={t("promptCompiler.example")}'
    )
    
    # Replace instructions text
    content = content.replace(
        'Türkçe açıklamanı yaz ve "Prompt Oluştur" butonuna tıkla',
        '{t("promptCompiler.instructions")}'
    )
    
    # Write the modified content back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("PromptCompiler.tsx refactored successfully!")

if __name__ == "__main__":
    main()
