#!/usr/bin/env python3
"""
Refactor ProductPromo.tsx to use i18n translations
"""

def main():
    filepath = "client/src/pages/ProductPromo.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace toast messages
    content = content.replace(
        'toast.success("Video yeniden oluşturuluyor...");',
        'toast.success(t("productPromo.toast.regenerating"));'
    )
    content = content.replace(
        'toast.error("Geçersiz dosya formatı", { description: "JPG, PNG veya WebP yükleyin" });',
        'toast.error(t("productPromo.errors.invalidFormat"), { description: t("productPromo.errors.invalidFormatDesc") });'
    )
    content = content.replace(
        'toast.error("Dosya çok büyük", { description: "Maksimum 20MB" });',
        'toast.error(t("productPromo.errors.fileTooLarge"), { description: t("productPromo.errors.fileTooLargeDesc") });'
    )
    content = content.replace(
        'toast.success("Ürün görseli yüklendi");',
        'toast.success(t("productPromo.toast.imageUploaded"));'
    )
    content = content.replace(
        'toast.error("Yükleme hatası");',
        'toast.error(t("productPromo.errors.uploadError"));'
    )
    content = content.replace(
        '          label: "Kredi Satın Al",',
        '          label: t("productPromo.buyCredits"),'
    )
    content = content.replace(
        'toast.error("İndirme hatası");',
        'toast.error(t("productPromo.errors.downloadError"));'
    )
    content = content.replace(
        '                      alt="Ürün"',
        '                      alt={t("productPromo.productAlt")}'
    )
    content = content.replace(
        '                    placeholder="Örn: Premium Kablosuz Kulaklık"',
        '                    placeholder={t("productPromo.placeholder.productName")}'
    )
    content = content.replace(
        '                    placeholder="Örn: Müziğin Yeni Boyutu"',
        '                    placeholder={t("productPromo.placeholder.description")}'
    )
    content = content.replace(
        '<p className="text-zinc-400 mt-1">{videoStatus?.errorMessage || "Video oluşturulamadı"}</p>',
        '<p className="text-zinc-400 mt-1">{videoStatus?.errorMessage || t("productPromo.errors.videoCreationFailed")}</p>'
    )
    content = content.replace(
        '                    alt="Ürün"',
        '                    alt={t("productPromo.productAlt")}'
    )
    
    # Write the modified content back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("ProductPromo.tsx refactored successfully!")

if __name__ == "__main__":
    main()
