#!/usr/bin/env python3
"""
Refactor MotionControl.tsx to use i18n translations
"""

def main():
    filepath = "client/src/pages/MotionControl.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Step 1: Add import
    content = content.replace(
        'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\n',
        'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\nimport { useLanguage } from "@/contexts/LanguageContext";\n'
    )
    
    # Step 2: Add hook
    content = content.replace(
        '  const [, navigate] = useLocation();',
        '  const [, navigate] = useLocation();\n  const { t } = useLanguage();'
    )
    
    # Step 3: Replace toast messages
    content = content.replace(
        'toast.success("Video oluşturma başlatıldı! Galeriye yönlendiriliyorsunuz...");',
        'toast.success(t("motion.toast.generationStarted"));'
    )
    content = content.replace(
        'toast.error(error.message || "Video oluşturulamadı");',
        'toast.error(error.message || t("motion.toast.generationFailed"));'
    )
    content = content.replace(
        'toast.error("Lütfen geçerli bir görsel dosyası seçin");',
        'toast.error(t("motion.errors.invalidImage"));'
    )
    content = content.replace(
        'toast.error("Dosya boyutu 10MB\'dan küçük olmalıdır");',
        'toast.error(t("motion.errors.imageTooLarge"));'
    )
    content = content.replace(
        'toast.error("Lütfen geçerli bir video dosyası seçin");',
        'toast.error(t("motion.errors.invalidVideo"));'
    )
    content = content.replace(
        'toast.error("Dosya boyutu 100MB\'dan küçük olmalıdır");',
        'toast.error(t("motion.errors.videoTooLarge"));'
    )
    content = content.replace(
        'toast.error("Video süresi en az 3 saniye olmalıdır.");',
        'toast.error(t("motion.errors.videoTooShort"));'
    )
    content = content.replace(
        'toast.warning("Video süresi 30 saniyeden uzun. İlk 30 saniyesi kullanılacak.");',
        'toast.warning(t("motion.errors.videoTooLong"));'
    )
    content = content.replace(
        'toast.error(`Video çözünürlüğü çok düşük! En az 720x720 olmalıdır. Mevcut: ${width}x${height}`);',
        'toast.error(t("motion.errors.videoResolutionLow", { width: width.toString(), height: height.toString() }));'
    )
    content = content.replace(
        'toast.success(`Video yüklendi: ${width}x${height}, ${duration}s`);',
        'toast.success(t("motion.toast.videoUploaded", { width: width.toString(), height: height.toString(), duration: duration.toString() }));'
    )
    content = content.replace(
        'toast.error("Lütfen en az bir görsel veya video yükleyin");',
        'toast.error(t("motion.toast.noFileUploaded"));'
    )
    content = content.replace(
        'toast.error("Lütfen sahne açıklaması girin");',
        'toast.error(t("motion.toast.noPrompt"));'
    )
    content = content.replace(
        'toast.error(`Yetersiz kredi. Bu işlem için maksimum ${creditCost} kredi gerekiyor.`);',
        'toast.error(t("motion.toast.insufficientCredits", { credits: creditCost.toString() }));'
    )
    content = content.replace(
        'toast.info("Görsel yükleniyor...");',
        'toast.info(t("motion.toast.uploadingImage"));'
    )
    content = content.replace(
        'if (!result) throw new Error("Görsel yüklenemedi");',
        'if (!result) throw new Error(t("motion.toast.imageUploadFailed"));'
    )
    content = content.replace(
        'toast.info("Video yükleniyor...");',
        'toast.info(t("motion.toast.uploadingVideo"));'
    )
    content = content.replace(
        'if (!result) throw new Error("Video yüklenemedi");',
        'if (!result) throw new Error(t("motion.toast.videoUploadFailed"));'
    )
    content = content.replace(
        'toast.info("Video oluşturma işlemi başlatılıyor...");',
        'toast.info(t("motion.toast.startingGeneration"));'
    )
    content = content.replace(
        'toast.error("Bir hata oluştu");',
        'toast.error(t("motion.toast.error"));'
    )
    
    # Step 4: Replace UI text
    content = content.replace(
        '            Nasıl çalışır?',
        '            {t("motion.howItWorks")}'
    )
    content = content.replace(
        '              <span className="text-yellow-400 font-semibold tracking-wider text-xs sm:text-sm">YENİ ÖZELLİK</span>',
        '              <span className="text-yellow-400 font-semibold tracking-wider text-xs sm:text-sm">{t("motion.badge")}</span>'
    )
    content = content.replace(
        '              MOTION CONTROL\n            </h1>',
        '              {t("motion.title")}\n            </h1>'
    )
    content = content.replace(
        '              Videolarınızla hareketleri kontrol edin veya görsellerinizi canlandırın.',
        '              {t("motion.subtitle")}'
    )
    content = content.replace(
        '            <Label className="text-sm font-medium text-gray-300">Referans Video (Opsiyonel)</Label>',
        '            <Label className="text-sm font-medium text-gray-300">{t("motion.referenceVideo")}</Label>'
    )
    content = content.replace(
        '                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Referans Video Yükle</h3>',
        '                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{t("motion.uploadReferenceVideo")}</h3>'
    )
    content = content.replace(
        '                  <p className="text-sm text-gray-400">Hareket kontrolü için referans video</p>',
        '                  <p className="text-sm text-gray-400">{t("motion.referenceVideoDesc")}</p>'
    )
    content = content.replace(
        '                  <p className="text-xs text-gray-500 mt-2">Min 720x720, Max 100MB, 3-30 saniye</p>',
        '                  <p className="text-xs text-gray-500 mt-2">{t("motion.referenceVideoSpec")}</p>'
    )
    content = content.replace(
        '                    <Video className="w-3.5 h-3.5" /> Referans Video',
        '                    <Video className="w-3.5 h-3.5" /> {t("motion.referenceVideoLabel")}'
    )
    content = content.replace(
        '            <Label className="text-sm font-medium text-gray-300">Karakter Görseli</Label>',
        '            <Label className="text-sm font-medium text-gray-300">{t("motion.characterImage")}</Label>'
    )
    content = content.replace(
        '                    <ImageIcon className="w-3.5 h-3.5" /> Karakter Görseli',
        '                    <ImageIcon className="w-3.5 h-3.5" /> {t("motion.characterImageLabel")}'
    )
    content = content.replace(
        '                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Karakter Görseli Ekle</h3>',
        '                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{t("motion.addCharacterImage")}</h3>'
    )
    content = content.replace(
        '                  <p className="text-sm text-gray-400">Canlandırılacak görsel</p>',
        '                  <p className="text-sm text-gray-400">{t("motion.imageToAnimate")}</p>'
    )
    content = content.replace(
        '                  <p className="text-xs text-gray-500 mt-2">Max 10MB (JPEG/PNG/WEBP)</p>',
        '                  <p className="text-xs text-gray-500 mt-2">{t("motion.imageSpec")}</p>'
    )
    content = content.replace(
        '                      <p className="text-sm text-white font-medium">Yükleniyor... {uploadProgress}%</p>',
        '                      <p className="text-sm text-white font-medium">{t("motion.uploading")} {uploadProgress}%</p>'
    )
    content = content.replace(
        '              <Label className="text-sm font-medium text-gray-300">Sahne Açıklaması</Label>',
        '              <Label className="text-sm font-medium text-gray-300">{t("motion.sceneDescription")}</Label>'
    )
    content = content.replace(
        "              placeholder='Arkaplan ve sahne detaylarını açıklayın - örn. \"Kar yağışında koşan köpek\" veya \"Karlı park ortamı\". Hareket referans videonuz tarafından kontrol edilir.'",
        '              placeholder={t("motion.sceneDescriptionPlaceholder")}'
    )
    content = content.replace(
        '              <span className="text-xs text-gray-500 mb-1.5">Model</span>',
        '              <span className="text-xs text-gray-500 mb-1.5">{t("motion.model")}</span>'
    )
    content = content.replace(
        '                <span className="font-semibold text-white text-sm sm:text-base">Kling Motion Control</span>',
        '                <span className="font-semibold text-white text-sm sm:text-base">{t("motion.modelName")}</span>'
    )
    content = content.replace(
        '              <Label className="text-xs text-gray-400 mb-3 block">Karakter Yönelimi</Label>',
        '              <Label className="text-xs text-gray-400 mb-3 block">{t("motion.characterOrientation")}</Label>'
    )
    content = content.replace(
        '                  <SelectValue placeholder="Yönelim seçin" />',
        '                  <SelectValue placeholder={t("motion.selectOrientation")} />'
    )
    content = content.replace(
        '                  <SelectItem value="image">Görsel Yönelimi (max 10s)</SelectItem>',
        '                  <SelectItem value="image">{t("motion.imageOrientation")}</SelectItem>'
    )
    content = content.replace(
        '                  <SelectItem value="video">Video Yönelimi (max 30s)</SelectItem>',
        '                  <SelectItem value="video">{t("motion.videoOrientation")}</SelectItem>'
    )
    content = content.replace(
        '                <strong>Görsel:</strong> Görseldeki konum korunur.\n                <strong className="ml-2">Video:</strong> Videodaki konum takip edilir.',
        '{t("motion.orientationHint")}'
    )
    content = content.replace(
        '              <Label className="text-xs text-gray-400 mb-3 block">Kalite Modu & Fiyatlandırma</Label>',
        '              <Label className="text-xs text-gray-400 mb-3 block">{t("motion.qualityMode")}</Label>'
    )
    content = content.replace(
        '                  <SelectValue placeholder="Mod seçin" />',
        '                  <SelectValue placeholder={t("motion.selectMode")} />'
    )
    content = content.replace(
        '                  <SelectItem value="standard">Standard (720p) - 5 kredi/saniye</SelectItem>',
        '                  <SelectItem value="standard">{t("motion.standardMode")}</SelectItem>'
    )
    content = content.replace(
        '                  <SelectItem value="pro">Pro (1080p) - 8 kredi/saniye</SelectItem>',
        '                  <SelectItem value="pro">{t("motion.proMode")}</SelectItem>'
    )
    content = content.replace(
        '                  <span className="text-gray-400">Referans Video:</span>',
        '                  <span className="text-gray-400">{t("motion.referenceVideoLabel2")}</span>'
    )
    content = content.replace(
        '                  <span className="text-white font-semibold">{estimatedDuration} saniye</span>',
        '                  <span className="text-white font-semibold">{estimatedDuration} {t("motion.seconds")}</span>'
    )
    content = content.replace(
        '                  <span className="text-gray-400">Saniye Başı Ücret:</span>',
        '                  <span className="text-gray-400">{t("motion.costPerSecond")}</span>'
    )
    content = content.replace(
        '                  <span className="text-[#DFFF00] font-semibold">{mode === "pro" ? "8" : "5"} kredi</span>',
        '                  <span className="text-[#DFFF00] font-semibold">{mode === "pro" ? "8" : "5"} {t("motion.credits")}</span>'
    )
    content = content.replace(
        '                  <span className="text-gray-300 font-medium">Maksimum Maliyet:</span>',
        '                  <span className="text-gray-300 font-medium">{t("motion.maxCost")}</span>'
    )
    content = content.replace(
        '                  <span className="text-[#DFFF00] font-bold text-lg">\n                    {(mode === "pro" ? 8 : 5) * estimatedDuration} kredi',
        '                  <span className="text-[#DFFF00] font-bold text-lg">\n                    {(mode === "pro" ? 8 : 5) * estimatedDuration} {t("motion.credits")}'
    )
    
    # Features section
    content = content.replace(
        '            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Kling Motion Control Özellikleri</h2>',
        '            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("motion.featuresTitle")}</h2>'
    )
    content = content.replace(
        '              Gerçek insan hareketlerini karakterlerinize aktarın, profesyonel videolar oluşturun',
        '              {t("motion.featuresSubtitle")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-2">Tam Vücut Hareket Senkronizasyonu</h3>',
        '              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature1")}</h3>'
    )
    content = content.replace(
        '                Referans videodaki tüm vücut hareketlerini karakterinize aktarın. Duruş, ritim ve koordinasyon mükemmel şekilde korunur.',
        '                {t("motion.feature1Desc")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-2">Karmaşık Hareketler</h3>',
        '              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature2")}</h3>'
    )
    content = content.replace(
        '                Birden fazla vücut parçasını içeren karmaşık hareketler bile doğal akışlarıyla yeniden üretilir.',
        '                {t("motion.feature2Desc")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-2">Hassas El Performansları</h3>',
        '              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature3")}</h3>'
    )
    content = content.replace(
        '                İşaret etme, tutma gibi ince el ve parmak hareketleri yüksek doğrulukla aktarılır. Sunum ve demo videolar için ideal.',
        '                {t("motion.feature3Desc")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-2">30 Saniyelik Sürekli Aksiyon</h3>',
        '              <h3 className="text-xl font-bold text-white mb-2">{t("motion.feature4")}</h3>'
    )
    content = content.replace(
        '                Tek seferde 30 saniyeye kadar kesintisiz performans. Uzun anlatım sahneleri ve gösterimler için mükemmel.',
        '                {t("motion.feature4Desc")}'
    )
    
    # Best practices
    content = content.replace(
        '          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">En İyi Sonuçlar İçin İpuçları</h2>',
        '          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t("motion.bestPracticesTitle")}</h2>'
    )
    content = content.replace(
        '                <h3 className="text-lg font-semibold text-white mb-2">Çerçeveleme Uyumunu Sağlayın</h3>',
        '                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip1Title")}</h3>'
    )
    content = content.replace(
        '                  Yarım vücut görseli için yarım vücut video, tam vücut görseli için tam vücut video kullanın.\n                  Uyumsuz çerçeveleme kararsız hareketlere yol açabilir.',
        '                  {t("motion.tip1Desc")}'
    )
    content = content.replace(
        '                <h3 className="text-lg font-semibold text-white mb-2">Açık ve Doğal Hareketler Seçin</h3>',
        '                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip2Title")}</h3>'
    )
    content = content.replace(
        '                  Orta hızda, net insan hareketleri içeren videolar kullanın. Çok hızlı veya ani değişimlerden kaçının.',
        '                  {t("motion.tip2Desc")}'
    )
    content = content.replace(
        '                <h3 className="text-lg font-semibold text-white mb-2">Büyük Hareketler İçin Yeterli Alan Bırakın</h3>',
        '                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip3Title")}</h3>'
    )
    content = content.replace(
        '                  Geniş jestler veya tam vücut aksiyonları için karakterin hareket edebileceği görsel alan sağlayın.',
        '                  {t("motion.tip3Desc")}'
    )
    content = content.replace(
        '                <h3 className="text-lg font-semibold text-white mb-2">Karakter Görselini Optimize Edin</h3>',
        '                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip4Title")}</h3>'
    )
    content = content.replace(
        '                  Karakterin tüm vücudu ve başı net görünür olmalı. Kısmi kapatmalardan kaçının.\n                  Gerçekçi ve stilize karakterler desteklenir.',
        '                  {t("motion.tip4Desc")}'
    )
    content = content.replace(
        '                <h3 className="text-lg font-semibold text-white mb-2">Referans Video İçin En İyi Pratikler</h3>',
        '                <h3 className="text-lg font-semibold text-white mb-2">{t("motion.tip5Title")}</h3>'
    )
    
    # Use cases
    content = content.replace(
        '          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Kullanım Senaryoları</h2>',
        '          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">{t("motion.useCasesTitle")}</h2>'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-3">Pazarlama & Marka Sözcüsü Videoları</h3>',
        '              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase1Title")}</h3>'
    )
    content = content.replace(
        '                Tek performansı farklı karakterlere aktararak tutarlı, markaya uygun kampanya videoları oluşturun.',
        '                {t("motion.useCase1Desc")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-3">Ürün Demo ve Açıklayıcı Videolar</h3>',
        '              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase2Title")}</h3>'
    )
    content = content.replace(
        '                Sunucu jestleri, el hareketleri ve temposu korunurken karakter ve arkaplan özelleştirilebilir.',
        '                {t("motion.useCase2Desc")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-3">AI İnfluencer ve Sanal İçerik Üreticiler</h3>',
        '              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase3Title")}</h3>'
    )
    content = content.replace(
        '                Gerçek performansları sanal karakterlere aktararak doğal içerik ölçeklendirin.',
        '                {t("motion.useCase3Desc")}'
    )
    content = content.replace(
        '              <h3 className="text-xl font-bold text-white mb-3">Eğitim ve İç İletişim</h3>',
        '              <h3 className="text-xl font-bold text-white mb-3">{t("motion.useCase4Title")}</h3>'
    )
    content = content.replace(
        '                Eğitmen performanslarını farklı sahneler veya dillerde yeniden kullanarak tutarlı eğitim içeriği oluşturun.',
        '                {t("motion.useCase4Desc")}'
    )
    
    # FAQ
    content = content.replace(
        '          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Sık Sorulan Sorular</h2>',
        '          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">{t("motion.faqTitle")}</h2>'
    )
    content = content.replace(
        '                <span>Kling Motion Control ne için kullanılır?</span>',
        '                <span>{t("motion.faq1Q")}</span>'
    )
    content = content.replace(
        '                Kling Motion Control, referans videodaki gerçek insan hareketlerini, jestlerini ve ifadelerini\n                karakter görsellerine aktararak profesyonel videolar oluşturmanızı sağlar.',
        '                {t("motion.faq1A")}'
    )
    content = content.replace(
        '                <span>Görsel ve Video Yönelimi arasındaki fark nedir?</span>',
        '                <span>{t("motion.faq2Q")}</span>'
    )
    content = content.replace(
        '                <span>Hangi dosya formatları desteklenir?</span>',
        '                <span>{t("motion.faq3Q")}</span>'
    )
    content = content.replace(
        '                <span>Kredi maliyeti nasıl hesaplanır?</span>',
        '                <span>{t("motion.faq4Q")}</span>'
    )
    content = content.replace(
        '                <span>En iyi sonuçlar için nelere dikkat etmeliyim?</span>',
        '                <span>{t("motion.faq5Q")}</span>'
    )
    
    # Bottom bar
    content = content.replace(
        '              Mevcut Krediniz: <span className="font-semibold text-white">{user.credits}</span> kredi',
        '{t("motion.currentCredits")} <span className="font-semibold text-white">{user.credits}</span> {t("motion.credits")}'
    )
    content = content.replace(
        '                <span>Oluşturuluyor...</span>',
        '                <span>{t("motion.generating")}</span>'
    )
    content = content.replace(
        '                <span>Video Oluştur</span>',
        '                <span>{t("motion.generateVideo")}</span>'
    )
    content = content.replace(
        '                <span className="font-extrabold">{creditCost} Kredi</span>',
        '                <span className="font-extrabold">{creditCost} {t("motion.credits")}</span>'
    )
    
    # Write the modified content back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("MotionControl.tsx refactored successfully!")

if __name__ == "__main__":
    main()
