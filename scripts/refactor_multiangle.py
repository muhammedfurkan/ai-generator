#!/usr/bin/env python3
"""
Refactor MultiAngle.tsx to use i18n translations
"""

def main():
    filepath = "client/src/pages/MultiAngle.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace toast messages
    content = content.replace(
        'toast.error("Geçersiz dosya türü", { description: "Lütfen bir görsel dosyası seçin" });',
        'toast.error(t("multiAngle.errors.invalidFileType"), { description: t("multiAngle.errors.invalidFileTypeDesc") });'
    )
    content = content.replace(
        'toast.error("Dosya çok büyük", { description: "Maksimum dosya boyutu 20MB" });',
        'toast.error(t("multiAngle.errors.fileTooLarge"), { description: t("multiAngle.errors.fileTooLargeDesc") });'
    )
    content = content.replace(
        'reject(new Error("Yükleme başarısız"));',
        'reject(new Error(t("multiAngle.errors.uploadFailed")));'
    )
    content = content.replace(
        'reject(new Error("Geçersiz sunucu yanıtı"));',
        'reject(new Error(t("multiAngle.errors.invalidServerResponse")));'
    )
    content = content.replace(
        'xhr.onerror = () => reject(new Error("Ağ hatası"));',
        'xhr.onerror = () => reject(new Error(t("multiAngle.errors.networkError")));'
    )
    content = content.replace(
        'toast.success("Görsel yüklendi");',
        'toast.success(t("multiAngle.toast.imageUploaded"));'
    )
    content = content.replace(
        'toast.error("Yükleme hatası", { description: error.message });',
        'toast.error(t("multiAngle.errors.uploadError"), { description: error.message });'
    )
    content = content.replace(
        'toast.error("Lütfen bir referans görsel yükleyin");',
        'toast.error(t("multiAngle.errors.noReferenceImage"));'
    )
    content = content.replace(
        'toast.success(`${data.totalImages} fotoğraf oluşturuluyor...`, {\n        description: `${data.creditsUsed} kredi kullanıldı`,',
        'toast.success(t("multiAngle.toast.generating", { count: data.totalImages.toString() }), {\n        description: t("multiAngle.toast.creditsUsed", { credits: data.creditsUsed.toString() }),'
    )
    content = content.replace(
        'toast.error("Hata", { description: error.message });',
        'toast.error(t("multiAngle.toast.error"), { description: error.message });'
    )
    content = content.replace(
        '          label: "Kredi Satın Al",',
        '          label: t("multiAngle.buyCredits"),'
    )
    content = content.replace(
        'toast.error("İndirme hatası");',
        'toast.error(t("multiAngle.errors.downloadError"));'
    )
    content = content.replace(
        'toast.error("İndirilecek görsel bulunamadı");',
        'toast.error(t("multiAngle.errors.noImagesToDownload"));'
    )
    content = content.replace(
        'toast.error("ZIP dosyası oluşturulamadı");',
        'toast.error(t("multiAngle.errors.zipCreationFailed"));'
    )
    
    # Replace status text
    content = content.replace(
        '{jobStatus?.job.status === "completed" ? "Tamamlandı!" :\n                        jobStatus?.job.status === "partial" ? "Kısmen Tamamlandı" :\n                          jobStatus?.job.status === "failed" ? "Başarısız" : "Oluşturuluyor..."}',
        '{jobStatus?.job.status === "completed" ? t("multiAngle.status.completed") :\n                        jobStatus?.job.status === "partial" ? t("multiAngle.status.partial") :\n                          jobStatus?.job.status === "failed" ? t("multiAngle.status.failed") : t("multiAngle.status.generating")}'
    )
    content = content.replace(
        '{isDownloading ? "ZIP Hazırlanıyor..." : "ZIP İndir"}',
        '{isDownloading ? t("multiAngle.download.preparingZip") : t("multiAngle.download.downloadZip")}'
    )
    content = content.replace(
        '<p className="text-xs text-zinc-500 mt-1">{image.errorMessage || "Başarısız"}</p>',
        '<p className="text-xs text-zinc-500 mt-1">{image.errorMessage || t("multiAngle.status.failed")}</p>'
    )
    
    # Write the modified content back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("MultiAngle.tsx refactored successfully!")

if __name__ == "__main__":
    main()
