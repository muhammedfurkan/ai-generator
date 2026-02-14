export interface Translations {
  [key: string]: {
    tr: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.home": { tr: "Ana Sayfa", en: "Home" },
  "nav.apps": { tr: "Uygulamalar", en: "Apps" },
  "nav.upscale": { tr: "Upscale", en: "Upscale" },
  "nav.videoCreate": { tr: "Video Oluştur", en: "Create Video" },
  "nav.aiInfluencer": { tr: "AI Influencer", en: "AI Influencer" },
  "nav.gallery": { tr: "Galeri", en: "Gallery" },
  "nav.packages": { tr: "Paketler", en: "Packages" },
  "nav.blog": { tr: "Blog", en: "Blog" },
  "nav.profile": { tr: "Profil", en: "Profile" },
  "nav.create": { tr: "Oluştur", en: "Create" },
  "nav.credits": { tr: "kredi", en: "credits" },
  "nav.motionControl": { tr: "Motion Control", en: "Motion Control" },
  "nav.aiCharacter": { tr: "AI Karakter", en: "AI Character" },
  "nav.myGalleries": { tr: "Galerilerim", en: "My Galleries" },
  "nav.buyCredits": { tr: "Kredi Satın Al", en: "Buy Credits" },
  "nav.logout": { tr: "Çıkış Yap", en: "Logout" },
  "nav.darkMode": { tr: "Karanlık Tema", en: "Dark Mode" },
  "nav.lightMode": { tr: "Aydınlık Tema", en: "Light Mode" },
  "nav.new": { tr: "YENİ", en: "NEW" },
  "nav.generate": { tr: "Oluştur", en: "Create" },
  "nav.creditsSuffix": { tr: "kredi", en: "credits" },
  "nav.topUp": { tr: "Kredi Yükle", en: "Top Up" },
  "nav.menu": { tr: "Menü", en: "Menu" },

  // Home Page
  "home.hero.badge": { tr: "YENİ NESİL AI ARAÇLARI", en: "NEXT-GEN AI TOOLS" },
  "home.hero.title.prefix": { tr: "Hayal Et, ", en: "Imagine, " },
  "home.hero.title.suffix": { tr: "AI Üretsin", en: "AI Creates" },
  "home.hero.description": {
    tr: "Profesyonel görseller, videolar ve AI karakterler oluşturun. Saniyeler içinde.",
    en: "Create professional images, videos and AI characters. In seconds.",
  },
  "home.hero.start": { tr: "Hemen Başla", en: "Get Started" },
  "home.heroTitle": {
    tr: "Yapay Zeka ile Influencer Görselleri Üret",
    en: "Generate Influencer Images with AI",
  },
  "home.heroSubtitle": {
    tr: "Nano Banana Pro gücüyle ultra kaliteli görseller",
    en: "Ultra quality images powered by Nano Banana Pro",
  },
  "home.ctaButton": { tr: "Hemen Oluştur", en: "Create Now" },
  "home.features.textToImage": {
    tr: "Metinden Görüntüye",
    en: "Text to Image",
  },
  "home.features.textToImageDesc": {
    tr: "Prompt yazarak yüksek kaliteli görseller oluştur",
    en: "Create high quality images by writing prompts",
  },
  "home.features.imageToImage": {
    tr: "Görüntüden Görüntüye",
    en: "Image to Image",
  },
  "home.features.imageToImageDesc": {
    tr: "Referans görsel yükleyerek dönüştür",
    en: "Transform by uploading a reference image",
  },
  "home.features.quality": { tr: "Kalite Seçenekleri", en: "Quality Options" },
  "home.features.qualityDesc": {
    tr: "1K, 2K ve 4K çözünürlükte görseller",
    en: "Images in 1K, 2K and 4K resolution",
  },
  "home.exploreFeatures": {
    tr: "DAHA FAZLA AI ÖZELLİĞİ KEŞFET",
    en: "EXPLORE MORE AI FEATURES",
  },
  "home.aiTools": { tr: "AI ARAÇLARI", en: "AI TOOLS" },
  "home.viewAll": { tr: "Tümünü Gör", en: "View All" },
  "home.imageGenModels": {
    tr: "GÖRSEL OLUŞTURMA MODELLERİ",
    en: "IMAGE GENERATION MODELS",
  },
  "home.generateImage": { tr: "Görsel Oluştur", en: "Generate Image" },
  "home.videoGenModels": {
    tr: "VİDEO OLUŞTURMA MODELLERİ",
    en: "VIDEO GENERATION MODELS",
  },
  "home.generateVideo": { tr: "Video Oluştur", en: "Generate Video" },
  "home.createdWithAi": { tr: "AI İLE OLUŞTURULDU", en: "CREATED WITH AI" },
  "home.aiVideoGallery": { tr: "AI VİDEO GALERİSİ", en: "AI VIDEO GALLERY" },
  "home.createVideo": { tr: "Video Oluştur", en: "Create Video" },
  "home.aiVideoItem": { tr: "AI Video", en: "AI Video" },
  "home.communityGallery": { tr: "TOPLULUK GALERİSİ", en: "COMMUNITY GALLERY" },
  "home.communityShort": { tr: "Topluluk", en: "Community" },
  "home.communityDesc": {
    tr: "Kullanıcılarımızın oluşturduğu AI karakterler",
    en: "AI characters created by our users",
  },
  "home.beTheFirst": { tr: "İlk karakteri sen oluştur!", en: "Be the first!" },
  "home.cta.title": { tr: "HEMEN BAŞLA", en: "GET STARTED NOW" },
  "home.cta.desc": {
    tr: "Ücretsiz kredilerle AI araçlarını keşfet. Kredi kartı gerekmez.",
    en: "Explore AI tools with free credits. No credit card required.",
  },
  "home.cta.button": { tr: "ÜCRETSIZ DENE", en: "TRY FOR FREE" },
  "home.sampleWorks": { tr: "ÖRNEK ÇALIŞMALAR", en: "SAMPLE WORKS" },
  "home.getStarted": { tr: "Hemen Başla", en: "Get Started" },
  "home.getStartedDesc": {
    tr: "AI gücüyle profesyonel görseller ve videolar oluşturmaya başla",
    en: "Start creating professional images and videos with AI power",
  },

  // Home - AI Tools
  "home.tools.imageGen": { tr: "AI GÖRSEL OLUŞTUR", en: "AI IMAGE GENERATOR" },
  "home.tools.imageGenDesc": {
    tr: "Nano Banana Pro ile profesyonel görseller",
    en: "Professional images with Nano Banana Pro",
  },
  "home.tools.videoGen": { tr: "AI VİDEO OLUŞTUR", en: "AI VIDEO GENERATOR" },
  "home.tools.videoGenDesc": {
    tr: "Veo 3.1, Sora 2, Kling ile video",
    en: "Videos with Veo 3.1, Sora 2, Kling",
  },
  "home.tools.motionControl": { tr: "MOTION CONTROL", en: "MOTION CONTROL" },
  "home.tools.motionControlDesc": {
    tr: "Gerçek hareket transferi ile video",
    en: "Video with real motion transfer",
  },
  "home.tools.aiInfluencer": { tr: "AI INFLUENCER", en: "AI INFLUENCER" },
  "home.tools.aiInfluencerDesc": {
    tr: "Kendi AI karakterinizi oluşturun",
    en: "Create your own AI character",
  },
  "home.tools.upscale": { tr: "GÖRSEL UPSCALE", en: "IMAGE UPSCALE" },
  "home.tools.upscaleDesc": {
    tr: "Düşük çözünürlüğü 8K'ya yükselt",
    en: "Upscale to 8K resolution",
  },
  "home.tools.multiAngle": {
    tr: "ÇOKLU AÇI FOTOĞRAF",
    en: "MULTI-ANGLE PHOTO",
  },
  "home.tools.multiAngleDesc": {
    tr: "Tek fotoğraftan 4-8 farklı açı",
    en: "4-8 angles from one photo",
  },
  "home.tools.productPromo": {
    tr: "ÜRÜN TANITIM VİDEOSU",
    en: "PRODUCT PROMO VIDEO",
  },
  "home.tools.productPromoDesc": {
    tr: "E-ticaret için profesyonel promo",
    en: "Professional promo for e-commerce",
  },
  "home.tools.logoGenerator": { tr: "LOGO OLUŞTURUCU", en: "LOGO GENERATOR" },
  "home.tools.logoGeneratorDesc": {
    tr: "Profesyonel marka logosu tasarla",
    en: "Design professional brand logos",
  },
  "home.tools.promptMaster": { tr: "PROMPT USTASI", en: "PROMPT MASTER" },
  "home.tools.promptMasterDesc": {
    tr: "Türkçe yaz, profesyonel prompt al",
    en: "Write Turkish, get pro prompts",
  },

  // Home - Badges
  "home.badge.featured": { tr: "ÖNE ÇIKAN", en: "FEATURED" },
  "home.badge.popular": { tr: "POPÜLER", en: "POPULAR" },
  "home.badge.new": { tr: "YENİ", en: "NEW" },

  // Home - Viral Apps
  "home.viralApps.title": {
    tr: "VİRAL VİDEO UYGULAMALARI",
    en: "VIRAL VIDEO APPS",
  },
  "home.viralApps.hug": { tr: "Sarılma", en: "Hug" },
  "home.viralApps.kiss": { tr: "Öpücük", en: "Kiss" },
  "home.viralApps.dance": { tr: "Dans", en: "Dance" },
  "home.viralApps.talkingPhoto": { tr: "Konuşan Foto", en: "Talking Photo" },
  "home.viralApps.ageTransform": { tr: "Yaş Dönüşümü", en: "Age Transform" },
  "home.viralApps.artStyle": { tr: "Sanat Stili", en: "Art Style" },
  "home.viralApps.hairBlow": { tr: "Saç Uçuşması", en: "Hair Blow" },
  "home.viralApps.smile": { tr: "Gülümseme", en: "Smile" },
  "home.viralApps.wink": { tr: "Göz Kırpma", en: "Wink" },
  "home.viralApps.dramaticZoom": { tr: "Dramatik Zoom", en: "Dramatic Zoom" },

  // Home - Other
  "home.exploreTools": { tr: "Araçları Keşfet", en: "Explore Tools" },
  "home.telegramChannel": {
    tr: "Telegram Duyuru Kanalı",
    en: "Telegram Announcement Channel",
  },
  "home.freeTrial": { tr: "Ücretsiz Dene", en: "Try Free" },
  "home.gallery": { tr: "Galeri", en: "Gallery" },
  "home.viralAppsTitle": {
    tr: "VİRAL VİDEO UYGULAMALARI",
    en: "VIRAL VIDEO APPS",
  },

  // Footer
  "footer.description": {
    tr: "Tüm yapay zeka platformları tek panelde. Profesyonel görseller, videolar ve AI karakterler oluşturun.",
    en: "All AI platforms in one panel. Create professional images, videos and AI characters.",
  },
  "footer.rights": { tr: "Tüm hakları saklıdır.", en: "All rights reserved." },
  "footer.privacy": { tr: "Gizlilik Politikası", en: "Privacy Policy" },
  "footer.terms": { tr: "Kullanım Şartları", en: "Terms of Service" },
  "footer.quickLinks": { tr: "Hızlı Linkler", en: "Quick Links" },
  "footer.contact": { tr: "İletişim", en: "Contact" },
  "footer.telegram": {
    tr: "Telegram Duyuruları",
    en: "Telegram Announcements",
  },

  // Generate Image Page
  "generate.title": { tr: "Görsel Oluştur", en: "Generate Image" },
  "generate.subtitle": {
    tr: "Hayalinizdeki görseli detaylı şekilde açıklayın",
    en: "Describe the image you imagine in detail",
  },
  "generate.prompt": { tr: "Prompt", en: "Prompt" },
  "generate.promptLabel": { tr: "PROMPT", en: "PROMPT" },
  "generate.promptPlaceholder": {
    tr: "Örn: Gün batımında sakin bir dağ manzarası...",
    en: "Ex: A peaceful mountain landscape at sunset...",
  },
  "generate.promptRequired": {
    tr: "Prompt gereklidir",
    en: "Prompt is required",
  },
  "generate.enhance": { tr: "İyileştir", en: "Enhance" },
  "generate.modelLabel": { tr: "AI MODELİ", en: "AI MODEL" },
  "generate.model": { tr: "Model", en: "Model" },
  "generate.modelFixed": { tr: "Nano Banana Pro", en: "Nano Banana Pro" },
  "generate.aspectRatio": { tr: "EN-BOY ORANI", en: "ASPECT RATIO" },
  "generate.allAspectRatios": {
    tr: "TÜM EN-BOY ORANLARI",
    en: "ALL ASPECT RATIOS",
  },
  "generate.resolution": { tr: "Çözünürlük", en: "Resolution" },
  "generate.quality": { tr: "KALİTE", en: "QUALITY" },
  "generate.advancedSettings": {
    tr: "Gelişmiş Ayarlar",
    en: "Advanced Settings",
  },
  "generate.referenceImages": {
    tr: "REFERANS GÖRSELLER",
    en: "REFERENCE IMAGES",
  },
  "generate.referenceImage": {
    tr: "Referans Görsel (İsteğe Bağlı)",
    en: "Reference Image (Optional)",
  },
  "generate.referenceImageHint": {
    tr: "Image-to-Image için referans görsel yükleyin",
    en: "Upload reference image for Image-to-Image",
  },
  "generate.referenceOptional": {
    tr: "REFERANS GÖRSELLER (OPSİYONEL)",
    en: "REFERENCE IMAGES (OPTIONAL)",
  },
  "generate.referenceRequired": {
    tr: "REFERANS GÖRSELLER (GEREKLİ)",
    en: "REFERENCE IMAGES (REQUIRED)",
  },
  "generate.uploadImage": { tr: "Görsel Yükle", en: "Upload Image" },
  "generate.uploadVideo": { tr: "Video Yükle", en: "Upload Video" },
  "generate.uploadLimit": { tr: "Maksimum", en: "Maximum" },
  "generate.editMode": { tr: "Edit Modu", en: "Edit Mode" },
  "generate.editModeDesc": {
    tr: "Var olan bir görseli düzenle ve dönüştür",
    en: "Edit and transform an existing image",
  },
  "generate.generate": { tr: "Oluştur", en: "Generate" },
  "generate.generating": { tr: "Oluşturuluyor...", en: "Generating..." },
  "generate.uploading": { tr: "Yükleniyor...", en: "Uploading..." },
  "generate.processing": { tr: "İşleniyor...", en: "Processing..." },
  "generate.recentGenerations": {
    tr: "Son Oluşturulanlar",
    en: "Recent Generations",
  },
  "generate.maintenance": { tr: "Bakımda", en: "Maintenance" },
  "generate.estimatedCost": { tr: "Tahmini Maliyet", en: "Estimated Cost" },
  "generate.creditsPerImage": { tr: "kredi", en: "credits" },
  "generate.success": {
    tr: "Görsel başarıyla oluşturuldu!",
    en: "Image generated successfully!",
  },
  "generate.download": { tr: "İndir", en: "Download" },
  "generate.error": {
    tr: "Görsel oluşturma başarısız oldu",
    en: "Image generation failed",
  },
  "generate.insufficientCredits": {
    tr: "Yetersiz kredi",
    en: "Insufficient credits",
  },
  "generate.tryAgain": { tr: "Tekrar Dene", en: "Try Again" },
  "generate.promptEnhanced": {
    tr: "✨ Prompt iyileştirildi!",
    en: "✨ Prompt enhanced!",
  },
  "generate.modelChangedRefCleared": {
    tr: "Model değiştirildi. Referans görseller temizlendi (yeni limit: {limit})",
    en: "Model changed. Reference images cleared (new limit: {limit})",
  },
  "generate.promptRequiredMsg": {
    tr: "Lütfen bir prompt girin",
    en: "Please enter a prompt",
  },
  "generate.editModeRefRequired": {
    tr: "Edit modu için en az bir referans görsel yüklemelisiniz",
    en: "You must upload at least one reference image for Edit mode",
  },
  "generate.uploadFailed": { tr: "Yükleme başarısız", en: "Upload failed" },
  "generate.generationStarted": {
    tr: "Görsel oluşturma başlatıldı! Galeriyi kontrol edin.",
    en: "Image generation started! Check the gallery.",
  },
  "generate.errorOccurred": { tr: "Hata oluştu", en: "An error occurred" },
  "generate.maxImagesError": {
    tr: "Maksimum {max} görsel yükleyebilirsiniz",
    en: "You can upload a maximum of {max} images",
  },
  "generate.fileSizeError": {
    tr: "Her görsel maksimum 20 MB olabilir. {count} dosya çok büyük.",
    en: "Each image can be max 20 MB. {count} files are too large.",
  },
  "generate.uploadRefHint": {
    tr: "Maksimum {max} görsel • Her biri maks. 20 MB • JPG, PNG, WebP",
    en: "Max {max} images • Max 20 MB each • JPG, PNG, WebP",
  },
  "generate.qwenRefHint": {
    tr: "Qwen Edit modları için referans görsel zorunludur • Maksimum 3 görsel • Her biri maks. 20 MB • JPG, PNG, WebP",
    en: "Reference image is required for Qwen Edit modes • Max 3 images • Max 20 MB each • JPG, PNG, WebP",
  },
  "generate.seeDreamRefHint": {
    tr: "{model} Edit modu için referans görsel zorunludur • Maksimum 3 görsel • Her biri maks. 20 MB • JPG, PNG, WebP",
    en: "Reference image is required for {model} Edit mode • Max 3 images • Max 20 MB each • JPG, PNG, WebP",
  },

  // Video Generate Page
  "video.title": { tr: "AI Video Oluştur", en: "Create AI Video" },
  "video.selectModel": { tr: "Model Seç", en: "Select Model" },
  "video.prompt": { tr: "Video açıklaması", en: "Video description" },
  "video.subtitle": {
    tr: "Hayallerinizdeki videoları AI ile hayata geçirin",
    en: "Bring your dream videos to life with AI",
  },
  "video.promptPlaceholder": {
    tr: "Örn: Dağların üzerinde huzurlu bir gün doğumu...",
    en: "Ex: A peaceful sunrise over mountains...",
  },
  "video.promptPlaceholderImg": {
    tr: "Örn: Kamera yavaşça zoom yapıyor...",
    en: "Ex: Camera slowly zooming in...",
  },
  "video.modeLabel": { tr: "ÜRETİM MODU", en: "GENERATION MODE" },
  "video.textToVideo": { tr: "Metin → Video", en: "Text → Video" },
  "video.imageToVideo": { tr: "Görsel → Video", en: "Image → Video" },
  "video.videoToVideo": { tr: "Video → Video", en: "Video → Video" },
  "video.refToVideo": { tr: "Referans → Video", en: "Reference → Video" },
  "video.sourceImage": { tr: "KAYNAK GÖRSEL", en: "SOURCE IMAGE" },
  "video.sourceVideo": { tr: "KAYNAK VİDEO", en: "SOURCE VIDEO" },
  "video.selectVideo": { tr: "Video Seç", en: "Select Video" },
  "video.duration": { tr: "SÜRE", en: "DURATION" },
  "video.resolution": { tr: "ÇÖZÜNÜRLÜK", en: "RESOLUTION" },
  "video.audioLabel": { tr: "SES ÜRETİMİ", en: "AUDIO GENERATION" },
  "video.audioTitle": { tr: "Ses Üretimi", en: "Audio Generation" },
  "video.audioDesc": {
    tr: "Videoya uygun ses efekti oluştur",
    en: "Generate sound effects matching the video",
  },
  "video.soraFeature": { tr: "ÖZELLİK", en: "FEATURE" },
  "video.standardVideo": { tr: "🎬 Standart Video", en: "🎬 Standard Video" },
  "video.character": { tr: "👤 Karakter", en: "👤 Character" },
  "video.storyboard": { tr: "📋 Storyboard", en: "📋 Storyboard" },
  "video.watermark": { tr: "🔧 Watermark", en: "🔧 Watermark" },
  "video.charPrompt": {
    tr: "KARAKTER AÇIKLAMASI",
    en: "CHARACTER DESCRIPTION",
  },
  "video.safetyInst": {
    tr: "GÜVENLİK TALİMATLARI (OPSİYONEL)",
    en: "SAFETY INSTRUCTIONS (OPTIONAL)",
  },
  "video.soraUrl": { tr: "SORA VİDEO URL", en: "SORA VIDEO URL" },
  "video.storyboardImages": {
    tr: "STORYBOARD GÖRSELLERİ",
    en: "STORYBOARD IMAGES",
  },
  "video.uploading": { tr: "Yükleniyor...", en: "Uploading..." },
  "video.generating": { tr: "Oluşturuluyor...", en: "Generating..." },
  "video.generate": { tr: "Oluştur", en: "Generate" },

  // Video - Toast Messages
  "video.toast.generationStarted": {
    tr: "Video oluşturma başlatıldı! Galerinizi kontrol edin.",
    en: "Video generation started! Check your gallery.",
  },

  // Video - Errors
  "video.errors.maxReferenceImages": {
    tr: "En fazla 3 referans görsel yükleyebilirsiniz.",
    en: "You can upload a maximum of 3 reference images.",
  },
  "video.errors.videoSizeLimit": {
    tr: "Video boyutu 50MB'dan fazla olamaz",
    en: "Video size cannot exceed 50MB",
  },
  "video.errors.promptRequired": {
    tr: "Lütfen bir açıklama girin",
    en: "Please enter a description",
  },
  "video.errors.imageUploadFailed": {
    tr: "Görsel yükleme başarısız",
    en: "Image upload failed",
  },
  "video.errors.imageRequired": {
    tr: "Görsel yükleyin",
    en: "Please upload an image",
  },
  "video.errors.referenceImageRequired": {
    tr: "Lütfen en az bir referans görsel yükleyin",
    en: "Please upload at least one reference image",
  },
  "video.errors.videoUploadFailed": {
    tr: "Video yükleme başarısız",
    en: "Video upload failed",
  },
  "video.errors.videoRequired": {
    tr: "Lütfen bir video yükleyin",
    en: "Please upload a video",
  },

  // Video - Placeholders
  "video.placeholders.textToVideo": {
    tr: "Örn: Dağların üzerinde huzurlu bir gün doğumu timelapse'i, sinematik kamera hareketi...",
    en: "Ex: A peaceful sunrise timelapse over mountains, cinematic camera movement...",
  },
  "video.placeholders.imageToVideo": {
    tr: "Örn: Kamera yavaşça zoom yapıyor, yumuşak arka plan bulanıklığı, rüya gibi atmosfer...",
    en: "Ex: Camera slowly zooming in, soft background blur, dreamlike atmosphere...",
  },
  "video.placeholders.characterDesc": {
    tr: "Örn: Neşeli barista, yeşil önlük, sıcak gülümseme",
    en: "Ex: Happy barista, green apron, warm smile",
  },
  "video.placeholders.safetyInstructions": {
    tr: "Örn: Şiddet yok, politika yok, alkol yok; PG-13 maks",
    en: "Ex: No violence, no politics, no alcohol; PG-13 max",
  },

  // Video - Sora Features
  "video.sora.characterDescription": {
    tr: "Karakter Açıklaması",
    en: "Character Description",
  },
  "video.sora.safetyInstructions": {
    tr: "Güvenlik Talimatları (Opsiyonel)",
    en: "Safety Instructions (Optional)",
  },
  "video.sora.videoURL": {
    tr: "Sora Video URL",
    en: "Sora Video URL",
  },
  "video.sora.watermarkHint": {
    tr: "Watermark kaldırmak için Sora 2 video URL'sini girin (sora.chatgpt.com ile başlamalı)",
    en: "Enter Sora 2 video URL to remove watermark (must start with sora.chatgpt.com)",
  },
  "video.sora.storyboardImages": {
    tr: "Storyboard Görselleri",
    en: "Storyboard Images",
  },
  "video.sora.storyboardHint": {
    tr: "Storyboard frame'lerini yükleyin • Maks. 10MB/görsel • JPG, PNG, WebP",
    en: "Upload storyboard frames • Max 10MB/image • JPG, PNG, WebP",
  },

  // Categories
  "category.all": { tr: "Tümü", en: "All" },
  "category.new": { tr: "Yeni", en: "New" },
  "category.images": { tr: "Görseller", en: "Images" },
  "category.videos": { tr: "Videolar", en: "Videos" },
  "category.aiInfluencer": { tr: "AI Influencer", en: "AI Influencer" },
  "category.hug": { tr: "Sarılma", en: "Hug" },
  "category.kiss": { tr: "Öpücük", en: "Kiss" },
  "category.dance": { tr: "Dans", en: "Dance" },
  "category.ageTransform": { tr: "Yaş Dönüşümü", en: "Age Transform" },
  "category.artStyle": { tr: "Sanat Stili", en: "Art Style" },
  "category.talkingPhoto": { tr: "Konuşan Fotoğraf", en: "Talking Photo" },
  "category.hairBlow": { tr: "Saç Uçuşması", en: "Hair Blow" },
  "category.dramaticZoom": { tr: "Dramatik Zoom", en: "Dramatic Zoom" },
  "category.upscale": { tr: "Upscale", en: "Upscale" },
  "category.video": { tr: "Video", en: "Video" },

  // Feature Cards
  "feature.aiImageCreate": { tr: "AI Görsel Oluştur", en: "Create AI Image" },
  "feature.aiImageDesc": {
    tr: "Nano Banana Pro ile profesyonel görseller",
    en: "Professional images with Nano Banana Pro",
  },
  "feature.aiVideoCreate": { tr: "AI Video Oluştur", en: "Create AI Video" },
  "feature.aiVideoDesc": {
    tr: "Sora, Veo, Kling ile video üret",
    en: "Create videos with Sora, Veo, Kling",
  },
  "feature.aiInfluencer": { tr: "AI Influencer", en: "AI Influencer" },
  "feature.aiInfluencerDesc": {
    tr: "Kendi AI karakterinizi oluşturun",
    en: "Create your own AI character",
  },
  "feature.imageUpscale": { tr: "Görsel Upscale", en: "Image Upscale" },
  "feature.imageUpscaleDesc": {
    tr: "Düşük çözünürlüğü 8K'ya yükselt",
    en: "Upscale low resolution to 8K",
  },

  // Common
  "common.loading": { tr: "Yükleniyor...", en: "Loading..." },
  "common.error": { tr: "Hata", en: "Error" },
  "common.success": { tr: "Başarılı", en: "Success" },
  "common.cancel": { tr: "İptal", en: "Cancel" },
  "common.save": { tr: "Kaydet", en: "Save" },
  "common.delete": { tr: "Sil", en: "Delete" },
  "common.edit": { tr: "Düzenle", en: "Edit" },
  "common.download": { tr: "İndir", en: "Download" },
  "common.share": { tr: "Paylaş", en: "Share" },
  "common.generate": { tr: "Oluştur", en: "Generate" },
  "common.upload": { tr: "Yükle", en: "Upload" },
  "common.back": { tr: "Geri", en: "Back" },
  "common.next": { tr: "İleri", en: "Next" },
  "common.login": { tr: "Giriş Yap", en: "Login" },
  "common.buyCredits": { tr: "Kredi Yükle", en: "Buy Credits" },
  "common.viewAll": { tr: "Tümünü Gör", en: "View All" },
  "common.user": { tr: "Kullanıcı", en: "User" },
  "common.close": { tr: "Kapat", en: "Close" },
  "common.submit": { tr: "Gönder", en: "Submit" },
  "common.confirm": { tr: "Onayla", en: "Confirm" },
  "common.yes": { tr: "Evet", en: "Yes" },
  "common.no": { tr: "Hayır", en: "No" },
  "common.optional": { tr: "İsteğe Bağlı", en: "Optional" },

  // Blog
  "blog.title": { tr: "AI İçerik Blog", en: "AI Content Blog" },
  "blog.description": {
    tr: "AI görsel ve video oluşturma hakkında en güncel bilgiler, ipuçları ve rehberler",
    en: "Latest information, tips and guides about AI image and video creation",
  },
  "blog.search": { tr: "Blog yazısı ara...", en: "Search blog posts..." },
  "blog.noResults": {
    tr: "Aradığınız kriterlere uygun blog yazısı bulunamadı.",
    en: "No blog posts found matching your criteria.",
  },
  "blog.cta": {
    tr: "Hemen AI ile İçerik Oluşturmaya Başlayın",
    en: "Start Creating Content with AI Now",
  },
  "blog.ctaDesc": {
    tr: "Blog'da öğrendiklerinizi pratiğe dökün. Ücretsiz kredilerle AI araçlarını deneyin.",
    en: "Put what you learned in the blog into practice. Try our AI tools with free credits.",
  },

  // Packages
  "packages.title": { tr: "Kredi Paketleri", en: "Credit Packages" },
  "packages.buy": { tr: "Satın Al", en: "Buy Now" },
  "packages.header.title": { tr: "Kredi Paketleri", en: "Credit Packages" },
  "packages.header.subtitle": {
    tr: "İhtiyacınıza göre en uygun paketi seçin",
    en: "Choose the package that suits your needs",
  },
  "packages.currency.title": { tr: "Para Birimi", en: "Currency" },
  "packages.currency.selectCurrency": {
    tr: "Para birimi seçin",
    en: "Select currency",
  },
  "packages.currency.autoDetected": {
    tr: "Konumunuza göre otomatik seçildi",
    en: "Auto-selected based on your location",
  },
  "packages.card.mostPopular": { tr: "EN POPÜLER", en: "MOST POPULAR" },
  "packages.card.bonusText": { tr: "Bonus", en: "Bonus" },
  "packages.card.credits": { tr: "kredi", en: "credits" },
  "packages.card.packageContent": {
    tr: "Paket İçeriği",
    en: "Package Content",
  },
  "packages.card.buyNow": { tr: "Satın Al", en: "Buy Now" },
  "packages.usage.exampleTitle": {
    tr: "Örnek Kullanım",
    en: "Example Usage",
  },
  "packages.usage.1k": { tr: "1K", en: "1K" },
  "packages.usage.2k": { tr: "2K", en: "2K" },
  "packages.usage.4k": { tr: "4K", en: "4K" },
  "packages.usage.quality": { tr: "kalite", en: "quality" },
  "packages.usage.images": { tr: "görsel", en: "images" },
  "packages.emptyState": {
    tr: "Şu anda aktif paket bulunmamaktadır",
    en: "No active packages available at the moment",
  },
  "packages.errors.loginRequired": {
    tr: "Satın alma için giriş yapmalısınız",
    en: "You must login to make a purchase",
  },
  "packages.errors.packageIdMissing": {
    tr: "Paket ID bulunamadı",
    en: "Package ID not found",
  },
  "packages.errors.paymentFailed": {
    tr: "Ödeme başlatılamadı",
    en: "Failed to initiate payment",
  },
  "packages.errors.checkoutFailed": {
    tr: "Checkout oluşturulamadı",
    en: "Failed to create checkout",
  },
  "packages.faq.title": {
    tr: "Sıkça Sorulan Sorular",
    en: "Frequently Asked Questions",
  },
  "packages.faq.question1": {
    tr: "Krediler ne kadar süre geçerli?",
    en: "How long are credits valid?",
  },
  "packages.faq.answer1": {
    tr: "Satın aldığınız krediler süresiz geçerlidir ve hesabınızda sürekli kalır.",
    en: "Credits you purchase are valid indefinitely and remain in your account permanently.",
  },
  "packages.faq.question2": {
    tr: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    en: "What payment methods do you accept?",
  },
  "packages.faq.answer2": {
    tr: "Kredi kartı, banka kartı ve diğer güvenli ödeme yöntemlerini Stripe üzerinden kabul ediyoruz.",
    en: "We accept credit cards, debit cards, and other secure payment methods through Stripe.",
  },
  "packages.faq.question3": {
    tr: "Para birimi nasıl belirleniyor?",
    en: "How is currency determined?",
  },
  "packages.faq.answer3": {
    tr: "Konumunuza göre otomatik olarak yerel para birimi belirlenir. İsterseniz kendiniz de değiştirebilirsiniz.",
    en: "Your local currency is automatically determined based on your location. You can change it if you prefer.",
  },
  "packages.faq.question4": {
    tr: "İade politikanız nedir?",
    en: "What is your refund policy?",
  },
  "packages.faq.answer4": {
    tr: "Krediler kullanılmadan önce 14 gün içinde iade talep edebilirsiniz.",
    en: "You can request a refund within 14 days before credits are used.",
  },
  "packages.default.starter.name": { tr: "Başlangıç", en: "Starter" },
  "packages.default.starter.description": {
    tr: "Yeni başlayanlar için ideal",
    en: "Ideal for beginners",
  },
  "packages.default.starter.feature1": {
    tr: "Tüm AI modellere erişim",
    en: "Access to all AI models",
  },
  "packages.default.starter.feature2": {
    tr: "1K, 2K ve 4K çözünürlük",
    en: "1K, 2K and 4K resolution",
  },
  "packages.default.starter.feature3": {
    tr: "Öncelikli destek",
    en: "Priority support",
  },
  "packages.default.standard.name": { tr: "Standart", en: "Standard" },
  "packages.default.standard.description": {
    tr: "Düzenli kullanım için",
    en: "For regular usage",
  },
  "packages.default.standard.feature1": {
    tr: "Tüm AI modellere erişim",
    en: "Access to all AI models",
  },
  "packages.default.standard.feature2": {
    tr: "Hızlı işlem süresi",
    en: "Fast processing time",
  },
  "packages.default.standard.feature3": {
    tr: "Öncelikli destek",
    en: "Priority support",
  },
  "packages.default.professional.name": {
    tr: "Profesyonel",
    en: "Professional",
  },
  "packages.default.professional.description": {
    tr: "Profesyonel kullanım için",
    en: "For professional use",
  },
  "packages.default.professional.feature1": {
    tr: "+%10 bonus kredi",
    en: "+10% bonus credits",
  },
  "packages.default.professional.feature2": {
    tr: "En hızlı işlem süresi",
    en: "Fastest processing time",
  },
  "packages.default.professional.feature3": {
    tr: "VIP destek",
    en: "VIP support",
  },
  "packages.default.professional.badge": {
    tr: "EN POPÜLER",
    en: "MOST POPULAR",
  },
  "packages.default.enterprise.name": { tr: "Kurumsal", en: "Enterprise" },
  "packages.default.enterprise.description": {
    tr: "Yoğun kullanım için",
    en: "For heavy usage",
  },
  "packages.default.enterprise.feature1": {
    tr: "+%15 bonus kredi",
    en: "+15% bonus credits",
  },
  "packages.default.enterprise.feature2": {
    tr: "Özel model erişimi",
    en: "Exclusive model access",
  },
  "packages.default.enterprise.feature3": {
    tr: "7/24 özel destek",
    en: "24/7 dedicated support",
  },

  // Profile
  "profile.title": { tr: "Profilim", en: "My Profile" },
  "profile.pageTitle": { tr: "Profil", en: "Profile" },
  "profile.pageSubtitle": {
    tr: "Hesap ayarlarınız",
    en: "Your account settings",
  },
  "profile.credits": { tr: "Kredilerim", en: "My Credits" },
  "profile.userInfo": { tr: "Kullanıcı Bilgileri", en: "User Information" },
  "profile.name": { tr: "Ad", en: "Name" },
  "profile.email": { tr: "E-posta", en: "Email" },
  "profile.loginMethod": { tr: "Giriş Yöntemi", en: "Login Method" },
  "profile.google": { tr: "Google", en: "Google" },
  "profile.password": { tr: "E-posta / Şifre", en: "Email / Password" },
  "profile.unknown": { tr: "Bilinmiyor", en: "Unknown" },
  "profile.notSpecified": { tr: "Belirtilmemiş", en: "Not specified" },
  "profile.creditInfo": { tr: "Kredi Bilgisi", en: "Credit Information" },
  "profile.remainingCredits": { tr: "Kalan Kredi", en: "Remaining Credits" },
  "profile.generatedCount": {
    tr: "Oluşturulan Görsel Sayısı",
    en: "Generated Images Count",
  },
  "profile.spentCredits": { tr: "Harcanan Kredi", en: "Spent Credits" },
  "profile.referralTitle": {
    tr: "Arkadaşını Davet Et",
    en: "Invite Your Friend",
  },
  "profile.referralBonus": { tr: "kredi", en: "credits" },
  "profile.referralPart1": {
    tr: "Arkadaşını davet et, ",
    en: "Invite a friend, earn ",
  },
  "profile.referralPart2": { tr: " kredi kazan!", en: " credits!" },
  "profile.referralFriendDesc": {
    tr: "Arkadaşın da {referredBonus} kredi kazanır.",
    en: "Your friend also earns {referredBonus} credits.",
  },
  "profile.yourReferralCode": {
    tr: "Referans Kodun",
    en: "Your Referral Code",
  },
  "profile.copyLink": { tr: "Link Kopyala", en: "Copy Link" },
  "profile.shareWhatsapp": { tr: "WhatsApp", en: "WhatsApp" },
  "profile.totalReferrals": { tr: "Davet Edilen", en: "Total Referrals" },
  "profile.totalBonus": { tr: "Kazanılan Kredi", en: "Total Bonus Earned" },
  "profile.haveReferralCode": {
    tr: "Referans Kodun Var mı?",
    en: "Do you have a referral code?",
  },
  "profile.enterCode": { tr: "Kodu gir...", en: "Enter code..." },
  "profile.apply": { tr: "Uygula", en: "Apply" },
  "profile.paymentHistory": { tr: "Ödeme Geçmişi", en: "Payment History" },
  "profile.supportTitle": { tr: "Destek & İletişim", en: "Support & Contact" },
  "profile.feedback": {
    tr: "Hata Bildir / Öneri Gönder",
    en: "Report Bug / Send Suggestion",
  },
  "profile.contactWhatsapp": {
    tr: "WhatsApp ile İletişim",
    en: "Contact via WhatsApp",
  },
  "profile.telegramChannel": {
    tr: "Telegram Duyuru Kanalı",
    en: "Telegram Announcement Channel",
  },
  "profile.adminPanel": { tr: "Admin Paneli", en: "Admin Panel" },
  "profile.generateImage": { tr: "Görsel Oluştur", en: "Generate Image" },
  "profile.noTransactions": {
    tr: "Henüz işlem geçmişiniz bulunmuyor",
    en: "No transaction history yet",
  },
  "profile.buyCredits": { tr: "Kredi Satın Al", en: "Buy Credits" },
  "profile.creditLoad": { tr: "Kredi Yükleme", en: "Credit Top-up" },
  "profile.packagePurchase": { tr: "Paket Satın Alma", en: "Package Purchase" },
  "profile.creditUsage": { tr: "Kredi Kullanımı", en: "Credit Usage" },
  "profile.balance": { tr: "Bakiye", en: "Balance" },
  "profile.feedbackModal.title": {
    tr: "Geri Bildirim Gönder",
    en: "Send Feedback",
  },
  "profile.feedbackModal.desc": {
    tr: "Hata bildirimi, öneri veya şikayetinizi bize iletin.",
    en: "Send us your bug report, suggestion or complaint.",
  },
  "profile.feedbackModal.type": { tr: "Bildirim Türü", en: "Feedback Type" },
  "profile.feedbackModal.types.bug": {
    tr: "🐛 Hata Bildirimi",
    en: "🐛 Bug Report",
  },
  "profile.feedbackModal.types.suggestion": {
    tr: "💡 Öneri",
    en: "💡 Suggestion",
  },
  "profile.feedbackModal.types.complaint": {
    tr: "😤 Şikayet",
    en: "😤 Complaint",
  },
  "profile.feedbackModal.types.other": { tr: "📝 Diğer", en: "📝 Other" },
  "profile.feedbackModal.description": { tr: "Açıklama", en: "Description" },
  "profile.feedbackModal.placeholder": {
    tr: "Sorunu veya önerinizi detaylıca açıklayın...",
    en: "Describe the issue or suggestion in detail...",
  },
  "profile.feedbackModal.screenshot": {
    tr: "Ekran Görüntüsü (Opsiyonel)",
    en: "Screenshot (Optional)",
  },
  "profile.feedbackModal.upload": { tr: "Görsel Yükle", en: "Upload Image" },
  "profile.feedbackModal.cancel": { tr: "İptal", en: "Cancel" },
  "profile.feedbackModal.send": { tr: "Gönder", en: "Send" },
  "profile.feedbackModal.success": {
    tr: "Geri bildiriminiz başarıyla gönderildi!",
    en: "Your feedback has been sent successfully!",
  },
  "profile.feedbackModal.error": {
    tr: "Bir hata oluştu",
    en: "An error occurred",
  },
  "profile.referralCopied": {
    tr: "Referans kodu kopyalandı!",
    en: "Referral code copied!",
  },
  "profile.linkCopied": {
    tr: "Davet linki kopyalandı!",
    en: "Invite link copied!",
  },
  "profile.codeApplied": {
    tr: "Referans kodu uygulandı!",
    en: "Referral code applied!",
  },
  "profile.codeError": {
    tr: "Referans kodu uygulanamadı",
    en: "Failed to apply referral code",
  },
  "profile.enterRefCode": {
    tr: "Lütfen bir referans kodu girin",
    en: "Please enter a referral code",
  },
  "profile.descMinLength": {
    tr: "Açıklama en az 10 karakter olmalıdır",
    en: "Description must be at least 10 characters",
  },
  "profile.fileSizeError": {
    tr: "Dosya boyutu 5MB'dan küçük olmalıdır",
    en: "File size must be less than 5MB",
  },

  // Gallery
  "gallery.title": { tr: "Galerim", en: "My Gallery" },
  "gallery.empty": {
    tr: "Henüz görsel oluşturmadınız",
    en: "You haven't created any images yet",
  },
  "gallery.emptyHint": {
    tr: "Yeni bir görsel oluşturmak için 'Oluştur' sayfasına gidin",
    en: "Go to 'Create' page to generate a new image",
  },
  "gallery.delete": { tr: "Sil", en: "Delete" },
  "gallery.deleteConfirm": {
    tr: "Bu görseli silmek istediğinizden emin misiniz?",
    en: "Are you sure you want to delete this image?",
  },
  "gallery.createdAt": { tr: "Oluşturulma Tarihi", en: "Created At" },

  // AI Influencer
  "influencer.title": {
    tr: "AI Influencer Oluştur",
    en: "Create AI Influencer",
  },
  "influencer.createCharacter": {
    tr: "Karakter Oluştur",
    en: "Create Character",
  },

  // Upscale
  "upscale.title": { tr: "Görsel Upscale", en: "Image Upscale" },
  "upscale.badge": {
    tr: "Topaz AI ile Güçlendirildi",
    en: "Powered by Topaz AI",
  },
  "upscale.subtitle": {
    tr: "Düşük çözünürlüklü görsellerinizi yapay zeka ile 8K'ya kadar yükseltin. Detayları koruyarak profesyonel kalitede sonuçlar elde edin.",
    en: "Upscale your low resolution images up to 8K with AI. Get professional quality results while preserving details.",
  },
  "upscale.uploadTitle": { tr: "Görsel Yükle", en: "Upload Image" },
  "upscale.uploadDesc": {
    tr: "Sürükle bırak veya tıklayarak seç",
    en: "Drag and drop or click to select",
  },
  "upscale.uploadFormats": {
    tr: "JPG, PNG, WebP • Maks. 20MB",
    en: "JPG, PNG, WebP • Max. 20MB",
  },
  "upscale.selectedImageAlt": { tr: "Seçilen görsel", en: "Selected image" },
  "upscale.uploading": { tr: "Yükleniyor...", en: "Uploading..." },
  "upscale.scaleTitle": { tr: "Büyütme Oranı", en: "Upscale Factor" },
  "upscale.scaleDesc": {
    tr: "Görselinizi ne kadar büyütmek istediğinizi seçin",
    en: "Select how much you want to upscale your image",
  },
  "upscale.credits": { tr: "Kredi", en: "Credits" },
  "upscale.login": { tr: "Giriş Yap", en: "Login" },
  "upscale.processing": { tr: "İşleniyor...", en: "Processing..." },
  "upscale.upscaleButton": {
    tr: "Upscale Yap ({credits} Kredi)",
    en: "Upscale ({credits} Credits)",
  },
  "upscale.processingStatus": {
    tr: "İşleniyor...",
    en: "Processing...",
  },
  "upscale.processingInfo": {
    tr: "Topaz AI görseli işliyor. Bu işlem 1-3 dakika sürebilir.",
    en: "Topaz AI is processing the image. This may take 1-3 minutes.",
  },
  "upscale.resultTitle": { tr: "Sonuç", en: "Result" },
  "upscale.resultDesc": {
    tr: "Yükseltilmiş görseliniz burada görünecek",
    en: "Your upscaled image will appear here",
  },
  "upscale.upscaledImageAlt": {
    tr: "Upscaled görsel",
    en: "Upscaled image",
  },
  "upscale.download": { tr: "İndir", en: "Download" },
  "upscale.newImage": { tr: "Yeni Görsel", en: "New Image" },
  "upscale.failedTitle": { tr: "İşlem Başarısız", en: "Operation Failed" },
  "upscale.failedDesc": {
    tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
    en: "An error occurred. Please try again.",
  },
  "upscale.retry": { tr: "Tekrar Dene", en: "Retry" },
  "upscale.waitingTitle": { tr: "Sonuç Bekleniyor", en: "Waiting for Result" },
  "upscale.waitingDesc": {
    tr: "Bir görsel yükleyin ve upscale işlemini başlatın",
    en: "Upload an image and start the upscale process",
  },
  "upscale.maxResolution": {
    tr: "Maksimum Çözünürlük",
    en: "Maximum Resolution",
  },
  "upscale.technology": { tr: "Topaz Teknolojisi", en: "Topaz Technology" },
  "upscale.errors.invalidImage": {
    tr: "Lütfen geçerli bir görsel dosyası seçin",
    en: "Please select a valid image file",
  },
  "upscale.errors.fileTooLarge": {
    tr: "Dosya boyutu 20MB'dan küçük olmalıdır. Lütfen görseli sıkıştırın.",
    en: "File size must be smaller than 20MB. Please compress the image.",
  },
  "upscale.errors.uploadFailed": {
    tr: "Görsel yüklenemedi",
    en: "Failed to upload image",
  },
  "upscale.errors.processingFailed": {
    tr: "Bir hata oluştu",
    en: "An error occurred",
  },
  "upscale.errors.timeout": {
    tr: "İşlem zaman aşımına uğradı",
    en: "Operation timed out",
  },
  "upscale.errors.timeoutRetry": {
    tr: "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.",
    en: "Operation timed out. Please try again.",
  },
  "upscale.errors.insufficientCredits": {
    tr: "Yetersiz kredi. Lütfen kredi satın alın.",
    en: "Insufficient credits. Please purchase credits.",
  },
  "upscale.errors.failed": {
    tr: "İşlem başarısız oldu",
    en: "Operation failed",
  },
  "upscale.toast.success": {
    tr: "Görsel başarıyla yükseltildi!",
    en: "Image upscaled successfully!",
  },
  "upscale.toast.downloaded": {
    tr: "Görsel indirildi!",
    en: "Image downloaded!",
  },
  "upscale.toast.downloadFailed": {
    tr: "İndirme başarısız oldu",
    en: "Download failed",
  },

  // Errors
  "errors.insufficientCredits": {
    tr: "Yetersiz kredi. Lütfen daha sonra tekrar deneyin.",
    en: "Insufficient credits. Please try again later.",
  },
  "errors.generationFailed": {
    tr: "Görsel oluşturma başarısız oldu. Lütfen tekrar deneyin.",
    en: "Image generation failed. Please try again.",
  },
  "errors.networkError": {
    tr: "Ağ hatası. Lütfen bağlantınızı kontrol edin.",
    en: "Network error. Please check your connection.",
  },
  "errors.serverError": {
    tr: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
    en: "Server error. Please try again later.",
  },
  "errors.notFound": { tr: "Sayfa bulunamadı", en: "Page not found" },
  "errors.unauthorized": {
    tr: "Yetkilendirme gereklidir",
    en: "Authorization required",
  },

  // Success
  "success.imageCreated": {
    tr: "Görsel başarıyla oluşturuldu!",
    en: "Image created successfully!",
  },
  "success.imageDownloaded": { tr: "Görsel indirildi", en: "Image downloaded" },
  "success.loggedOut": {
    tr: "Başarıyla çıkış yaptınız",
    en: "Successfully logged out",
  },
  "success.paymentCompleted": {
    tr: "Ödemeniz başarıyla tamamlandı! Kredileriniz hesabınıza yüklendi.",
    en: "Payment completed successfully! Credits added to your account.",
  },

  // Create Modal
  "modal.noCards": {
    tr: "Bu kategoride kart bulunamadı",
    en: "No cards found in this category",
  },

  // Packages Page - Additional Features
  "packages.features.unlimited": {
    tr: "Sınırsız Kullanım",
    en: "Unlimited Usage",
  },
  "packages.features.unlimitedDesc": {
    tr: "Kredilerinizin süresi dolmaz",
    en: "Your credits never expire",
  },
  "packages.features.allModels": { tr: "Tüm Modeller", en: "All Models" },
  "packages.features.allModelsDesc": {
    tr: "Nano Banana Pro, Sora, Veo ve daha fazlası",
    en: "Nano Banana Pro, Sora, Veo and more",
  },
  "packages.features.support": { tr: "7/24 Destek", en: "24/7 Support" },
  "packages.features.supportDesc": {
    tr: "Telegram ve WhatsApp üzerinden anlık destek",
    en: "Instant support via Telegram and WhatsApp",
  },
  "packages.card.bonus": { tr: "% {bonus} Bonus", en: "{bonus}% Bonus" },
  "packages.card.loading": { tr: "Yükleniyor...", en: "Loading..." },
  "packages.cta.title": {
    tr: "Hemen Kredi Yükle, Yaratmaya Başla!",
    en: "Top Up Credits Now, Start Creating!",
  },
  "packages.cta.description": {
    tr: "AI ile sınırsız yaratıcılık dünyasına katıl",
    en: "Join the world of unlimited creativity with AI",
  },

  // Gallery Page
  "gallery.tabs.images": { tr: "Görseller", en: "Images" },
  "gallery.tabs.videos": { tr: "Videolar", en: "Videos" },
  "gallery.tabs.upscale": { tr: "Upscale", en: "Upscale" },
  "gallery.filter.all": { tr: "Tüm Görseller", en: "All Images" },
  "gallery.filter.favorites": { tr: "Favorilerim", en: "Favorites" },
  "gallery.selection.select": { tr: "Seç", en: "Select" },
  "gallery.selection.cancel": { tr: "İptal", en: "Cancel" },
  "gallery.selection.deleteSelected": {
    tr: "Sil ({count})",
    en: "Delete ({count})",
  },
  "gallery.selection.selectAll": { tr: "Tümünü Seç", en: "Select All" },

  // Gallery - Delete Confirmation
  "gallery.deleteConfirm.title": {
    tr: "Silme Onayı",
    en: "Delete Confirmation",
  },
  "gallery.deleteConfirm.titleSingle": {
    tr: "Görseli Sil",
    en: "Delete Image",
  },
  "gallery.deleteConfirm.titleMultiple": {
    tr: "{count} Görseli Sil",
    en: "Delete {count} Images",
  },
  "gallery.deleteConfirm.single": {
    tr: "Bu görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    en: "Are you sure you want to delete this image? This action cannot be undone.",
  },
  "gallery.deleteConfirm.messageSingle": {
    tr: "Bu görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    en: "Are you sure you want to delete this image? This action cannot be undone.",
  },
  "gallery.deleteConfirm.multiple": {
    tr: "Seçili {count} görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    en: "Are you sure you want to delete {count} images? This action cannot be undone.",
  },
  "gallery.deleteConfirm.messageMultiple": {
    tr: "Seçili {count} görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    en: "Are you sure you want to delete {count} images? This action cannot be undone.",
  },
  "gallery.deleteConfirm.video": {
    tr: "Bu videoyu silmek istediğinize emin misiniz?",
    en: "Are you sure you want to delete this video?",
  },
  "gallery.deleteConfirm.videoMessage": {
    tr: "Bu videoyu silmek istediğinize emin misiniz?",
    en: "Are you sure you want to delete this video?",
  },
  "gallery.deleteConfirm.yes": { tr: "Evet, Sil", en: "Yes, Delete" },
  "gallery.deleteConfirm.confirmDelete": { tr: "Evet, Sil", en: "Yes, Delete" },
  "gallery.deleteConfirm.cancel": { tr: "İptal", en: "Cancel" },
  "gallery.deleteConfirm.deleting": { tr: "Siliniyor...", en: "Deleting..." },
  "gallery.empty.title": {
    tr: "Henüz {type} oluşturmadınız",
    en: "You haven't created any {type} yet",
  },
  "gallery.empty.favoriteTitle": {
    tr: "Henüz favori {type} yok",
    en: "No favorite {type} yet",
  },
  "gallery.empty.images": { tr: "görsel", en: "images" },
  "gallery.empty.videos": { tr: "video", en: "videos" },
  "gallery.empty.upscale": { tr: "upscale görseli", en: "upscale images" },
  "gallery.empty.cta": { tr: "Şimdi Oluştur", en: "Create Now" },
  "gallery.empty.createVideo": { tr: "Video Oluştur", en: "Create Video" },
  "gallery.empty.createUpscale": { tr: "Upscale Yap", en: "Upscale Now" },

  // Gallery - Empty States
  "gallery.emptyStates.noFavorites": {
    tr: "Henüz favori görseliniz yok",
    en: "You don't have any favorite images yet",
  },
  "gallery.emptyStates.noImages": {
    tr: "Henüz görsel oluşturmadınız",
    en: "You haven't created any images yet",
  },
  "gallery.emptyStates.createNow": { tr: "Şimdi Oluştur", en: "Create Now" },
  "gallery.emptyStates.noVideos": {
    tr: "Henüz video oluşturmadınız",
    en: "You haven't created any videos yet",
  },
  "gallery.emptyStates.createVideo": {
    tr: "Video Oluştur",
    en: "Create Video",
  },
  "gallery.emptyStates.noUpscale": {
    tr: "Henüz upscale işlemi yapmadınız",
    en: "You haven't upscaled any images yet",
  },
  "gallery.emptyStates.doUpscale": { tr: "Upscale Yap", en: "Upscale Now" },

  // Gallery - Status and Time
  "gallery.status.processing": { tr: "İşleniyor...", en: "Processing..." },
  "gallery.status.queued": { tr: "Sırada Bekliyor...", en: "Queued..." },
  "gallery.status.failed": { tr: "Başarısız", en: "Failed" },
  "gallery.status.completed": { tr: "Tamamlandı", en: "Completed" },
  "gallery.status.pending": { tr: "Bekliyor", en: "Pending" },
  "gallery.estimatedTime": {
    tr: "Tahmini: 1-2 dakika",
    en: "Estimated: 1-2 minutes",
  },
  "gallery.status.estimatedTime": {
    tr: "Tahmini: 1-2 dakika",
    en: "Estimated: 1-2 minutes",
  },

  // Gallery - Actions
  // Gallery - Actions
  "gallery.actions.download": { tr: "İndir", en: "Download" },
  "gallery.actions.delete": { tr: "Sil", en: "Delete" },
  "gallery.actions.deleteProcess": { tr: "İşlemi Sil", en: "Delete Process" },
  "gallery.actions.remove": { tr: "Kaldır", en: "Remove" },
  "gallery.actions.favorite": { tr: "Favorilere Ekle", en: "Add to Favorites" },
  "gallery.actions.unfavorite": {
    tr: "Favorilerden Çıkar",
    en: "Remove from Favorites",
  },
  "gallery.actions.view": { tr: "Görüntüle", en: "View" },
  "gallery.actions.fullSize": { tr: "Tam Boyut", en: "Full Size" },
  "gallery.actions.quickDownload": { tr: "Hızlı İndir", en: "Quick Download" },
  "gallery.actions.watch": { tr: "İzle", en: "Watch" },

  // Gallery - Errors
  "gallery.errors.imageCreateFailed": {
    tr: "Görsel oluşturulamadı",
    en: "Image could not be created",
  },

  // Gallery - Toast Messages
  "gallery.toast.deleted": { tr: "Görsel silindi", en: "Image deleted" },
  "gallery.toast.deletedMultiple": {
    tr: "{count} görsel silindi",
    en: "{count} images deleted",
  },
  "gallery.toast.videoDeleted": { tr: "Video silindi", en: "Video deleted" },
  "gallery.toast.deleteFailed": { tr: "Silinemedi", en: "Failed to delete" },
  "gallery.toast.favoriteAdded": {
    tr: "Favorilere eklendi",
    en: "Added to favorites",
  },
  "gallery.toast.favoriteRemoved": {
    tr: "Favorilerden çıkarıldı",
    en: "Removed from favorites",
  },
  "gallery.model.label": { tr: "ile Oluşturuldu", en: "Generated with" },
  "gallery.model.productPromo": { tr: "Ürün Tanıtım", en: "Product Promo" },
  "gallery.model.ugcAd": { tr: "UGC Reklam", en: "UGC Ad" },
  "gallery.prompt.label": { tr: "Prompt", en: "Prompt" },
  "gallery.prompt.expand": { tr: "Daha fazlasını oku", en: "Read more" },
  "gallery.prompt.collapse": { tr: "Daha az göster", en: "Show less" },
  "gallery.video.reference": { tr: "Referans Görsel", en: "Reference Image" },

  // Motion Control Page
  "motion.title": { tr: "MOTION CONTROL", en: "MOTION CONTROL" },
  "motion.badge": { tr: "YENİ ÖZELLİK", en: "NEW FEATURE" },
  "motion.subtitle": {
    tr: "Videolarınızla hareketleri kontrol edin veya görsellerinizi canlandırın.",
    en: "Control motion with your videos or animate your images.",
  },
  "motion.howItWorks": { tr: "Nasıl çalışır?", en: "How it works?" },
  "motion.referenceVideo": {
    tr: "Referans Video (Opsiyonel)",
    en: "Reference Video (Optional)",
  },
  "motion.characterImage": { tr: "Karakter Görseli", en: "Character Image" },
  "motion.uploadReferenceVideo": {
    tr: "Referans Video Yükle",
    en: "Upload Reference Video",
  },
  "motion.referenceVideoDesc": {
    tr: "Hareket kontrolü için referans video",
    en: "Reference video for motion control",
  },
  "motion.referenceVideoSpec": {
    tr: "Min 720x720, Max 100MB, 3-30 saniye",
    en: "Min 720x720, Max 100MB, 3-30 seconds",
  },
  "motion.referenceVideoLabel": { tr: "Referans Video", en: "Reference Video" },
  "motion.characterImageLabel": {
    tr: "Karakter Görseli",
    en: "Character Image",
  },
  "motion.addCharacterImage": {
    tr: "Karakter Görseli Ekle",
    en: "Add Character Image",
  },
  "motion.imageToAnimate": {
    tr: "Canlandırılacak görsel",
    en: "Image to animate",
  },
  "motion.imageSpec": {
    tr: "Max 10MB (JPEG/PNG/WEBP)",
    en: "Max 10MB (JPEG/PNG/WEBP)",
  },
  "motion.uploading": { tr: "Yükleniyor...", en: "Uploading..." },
  "motion.sceneDescription": {
    tr: "Sahne Açıklaması",
    en: "Scene Description",
  },
  "motion.sceneDescriptionPlaceholder": {
    tr: 'Arkaplan ve sahne detaylarını açıklayın - örn. "Kar yağışında koşan köpek" veya "Karlı park ortamı". Hareket referans videonuz tarafından kontrol edilir.',
    en: 'Describe background and scene details - e.g. "Dog running in snow" or "Snowy park environment". Motion is controlled by your reference video.',
  },
  "motion.model": { tr: "Model", en: "Model" },
  "motion.modelName": {
    tr: "Kling Motion Control",
    en: "Kling Motion Control",
  },
  "motion.characterOrientation": {
    tr: "Karakter Yönelimi",
    en: "Character Orientation",
  },
  "motion.selectOrientation": { tr: "Yönelim seçin", en: "Select orientation" },
  "motion.imageOrientation": {
    tr: "Görsel Yönelimi (max 10s)",
    en: "Image Orientation (max 10s)",
  },
  "motion.videoOrientation": {
    tr: "Video Yönelimi (max 30s)",
    en: "Video Orientation (max 30s)",
  },
  "motion.orientationHint": {
    tr: '<strong>Görsel:</strong> Görseldeki konum korunur. <strong className="ml-2">Video:</strong> Videodaki konum takip edilir.',
    en: '<strong>Image:</strong> Position in image is preserved. <strong className="ml-2">Video:</strong> Position in video is tracked.',
  },
  "motion.qualityMode": {
    tr: "Kalite Modu & Fiyatlandırma",
    en: "Quality Mode & Pricing",
  },
  "motion.selectMode": { tr: "Mod seçin", en: "Select mode" },
  "motion.standardMode": {
    tr: "Standard (720p) - 5 kredi/saniye",
    en: "Standard (720p) - 5 credits/second",
  },
  "motion.proMode": {
    tr: "Pro (1080p) - 8 kredi/saniye",
    en: "Pro (1080p) - 8 credits/second",
  },
  "motion.referenceVideoLabel2": {
    tr: "Referans Video:",
    en: "Reference Video:",
  },
  "motion.seconds": { tr: "saniye", en: "seconds" },
  "motion.costPerSecond": {
    tr: "Saniye Başı Ücret:",
    en: "Cost Per Second:",
  },
  "motion.credits": { tr: "kredi", en: "credits" },
  "motion.maxCost": { tr: "Maksimum Maliyet:", en: "Maximum Cost:" },
  "motion.importantNotice": {
    tr: "⚠️ <strong>Önemli:</strong> Motion Control API video süresini otomatik belirler. Gerçek ücret üretilen videonun uzunluğuna göre değişebilir. Kullanılmayan kredi otomatik iade edilir.",
    en: "⚠️ <strong>Important:</strong> Motion Control API automatically determines video duration. Actual cost may vary based on the generated video length. Unused credits are automatically refunded.",
  },
  "motion.featuresTitle": {
    tr: "Kling Motion Control Özellikleri",
    en: "Kling Motion Control Features",
  },
  "motion.featuresSubtitle": {
    tr: "Gerçek insan hareketlerini karakterlerinize aktarın, profesyonel videolar oluşturun",
    en: "Transfer real human movements to your characters, create professional videos",
  },
  "motion.feature1": {
    tr: "Tam Vücut Hareket Senkronizasyonu",
    en: "Full Body Motion Synchronization",
  },
  "motion.feature1Desc": {
    tr: "Referans videodaki tüm vücut hareketlerini karakterinize aktarın. Duruş, ritim ve koordinasyon mükemmel şekilde korunur.",
    en: "Transfer all body movements from reference video to your character. Posture, rhythm and coordination are perfectly preserved.",
  },
  "motion.feature2": {
    tr: "Karmaşık Hareketler",
    en: "Complex Movements",
  },
  "motion.feature2Desc": {
    tr: "Birden fazla vücut parçasını içeren karmaşık hareketler bile doğal akışlarıyla yeniden üretilir.",
    en: "Even complex movements involving multiple body parts are reproduced with their natural flow.",
  },
  "motion.feature3": {
    tr: "Hassas El Performansları",
    en: "Precise Hand Performances",
  },
  "motion.feature3Desc": {
    tr: "İşaret etme, tutma gibi ince el ve parmak hareketleri yüksek doğrulukla aktarılır. Sunum ve demo videolar için ideal.",
    en: "Fine hand and finger movements like pointing and holding are transferred with high accuracy. Ideal for presentation and demo videos.",
  },
  "motion.feature4": {
    tr: "30 Saniyelik Sürekli Aksiyon",
    en: "30-Second Continuous Action",
  },
  "motion.feature4Desc": {
    tr: "Tek seferde 30 saniyeye kadar kesintisiz performans. Uzun anlatım sahneleri ve gösterimler için mükemmel.",
    en: "Up to 30 seconds of continuous performance in one take. Perfect for long narrative scenes and demonstrations.",
  },
  "motion.bestPracticesTitle": {
    tr: "En İyi Sonuçlar İçin İpuçları",
    en: "Tips for Best Results",
  },
  "motion.tip1Title": {
    tr: "Çerçeveleme Uyumunu Sağlayın",
    en: "Ensure Framing Compatibility",
  },
  "motion.tip1Desc": {
    tr: "Yarım vücut görseli için yarım vücut video, tam vücut görseli için tam vücut video kullanın. Uyumsuz çerçeveleme kararsız hareketlere yol açabilir.",
    en: "Use half-body video for half-body image, full-body video for full-body image. Mismatched framing can lead to unstable movements.",
  },
  "motion.tip2Title": {
    tr: "Açık ve Doğal Hareketler Seçin",
    en: "Choose Clear and Natural Movements",
  },
  "motion.tip2Desc": {
    tr: "Orta hızda, net insan hareketleri içeren videolar kullanın. Çok hızlı veya ani değişimlerden kaçının.",
    en: "Use videos with medium-paced, clear human movements. Avoid very fast or sudden changes.",
  },
  "motion.tip3Title": {
    tr: "Büyük Hareketler İçin Yeterli Alan Bırakın",
    en: "Leave Enough Space for Large Movements",
  },
  "motion.tip3Desc": {
    tr: "Geniş jestler veya tam vücut aksiyonları için karakterin hareket edebileceği görsel alan sağlayın.",
    en: "Provide visual space for the character to move for wide gestures or full-body actions.",
  },
  "motion.tip4Title": {
    tr: "Karakter Görselini Optimize Edin",
    en: "Optimize Character Image",
  },
  "motion.tip4Desc": {
    tr: "Karakterin tüm vücudu ve başı net görünür olmalı. Kısmi kapatmalardan kaçının. Gerçekçi ve stilize karakterler desteklenir.",
    en: "Character's full body and head should be clearly visible. Avoid partial occlusions. Both realistic and stylized characters are supported.",
  },
  "motion.tip5Title": {
    tr: "Referans Video İçin En İyi Pratikler",
    en: "Best Practices for Reference Video",
  },
  "motion.tip5Desc": {
    tr: "<strong>Minimum Çözünürlük:</strong> 720x720 piksel (HD kalite önerilir).<br />Tek karakter içeren videolar tercih edin. Kamera kesitleri, hızlı kamera hareketi veya zoom'dan kaçının. 3-30 saniye arası, gerçek insan aksiyonları önerilir.",
    en: "<strong>Minimum Resolution:</strong> 720x720 pixels (HD quality recommended).<br />Prefer videos with single character. Avoid camera cuts, fast camera movement or zoom. 3-30 seconds of real human actions recommended.",
  },
  "motion.useCasesTitle": { tr: "Kullanım Senaryoları", en: "Use Cases" },
  "motion.useCase1Title": {
    tr: "Pazarlama & Marka Sözcüsü Videoları",
    en: "Marketing & Brand Ambassador Videos",
  },
  "motion.useCase1Desc": {
    tr: "Tek performansı farklı karakterlere aktararak tutarlı, markaya uygun kampanya videoları oluşturun.",
    en: "Create consistent, brand-appropriate campaign videos by transferring single performance to different characters.",
  },
  "motion.useCase2Title": {
    tr: "Ürün Demo ve Açıklayıcı Videolar",
    en: "Product Demo and Explainer Videos",
  },
  "motion.useCase2Desc": {
    tr: "Sunucu jestleri, el hareketleri ve temposu korunurken karakter ve arkaplan özelleştirilebilir.",
    en: "Character and background can be customized while preserving presenter gestures, hand movements and pace.",
  },
  "motion.useCase3Title": {
    tr: "AI İnfluencer ve Sanal İçerik Üreticiler",
    en: "AI Influencer and Virtual Content Creators",
  },
  "motion.useCase3Desc": {
    tr: "Gerçek performansları sanal karakterlere aktararak doğal içerik ölçeklendirin.",
    en: "Scale natural content by transferring real performances to virtual characters.",
  },
  "motion.useCase4Title": {
    tr: "Eğitim ve İç İletişim",
    en: "Training and Internal Communication",
  },
  "motion.useCase4Desc": {
    tr: "Eğitmen performanslarını farklı sahneler veya dillerde yeniden kullanarak tutarlı eğitim içeriği oluşturun.",
    en: "Create consistent training content by reusing instructor performances in different scenes or languages.",
  },
  "motion.faqTitle": {
    tr: "Sık Sorulan Sorular",
    en: "Frequently Asked Questions",
  },
  "motion.faq1Q": {
    tr: "Kling Motion Control ne için kullanılır?",
    en: "What is Kling Motion Control used for?",
  },
  "motion.faq1A": {
    tr: "Kling Motion Control, referans videodaki gerçek insan hareketlerini, jestlerini ve ifadelerini karakter görsellerine aktararak profesyonel videolar oluşturmanızı sağlar.",
    en: "Kling Motion Control allows you to create professional videos by transferring real human movements, gestures and expressions from reference video to character images.",
  },
  "motion.faq2Q": {
    tr: "Görsel ve Video Yönelimi arasındaki fark nedir?",
    en: "What's the difference between Image and Video Orientation?",
  },
  "motion.faq2A": {
    tr: "<strong>Görsel Yönelimi:</strong> Karakterin görseldeki konumunu korur, maksimum 10 saniye video üretir.<br /><strong>Video Yönelimi:</strong> Referans videodaki karakter konumunu takip eder, maksimum 30 saniye destekler.",
    en: "<strong>Image Orientation:</strong> Preserves character's position in image, generates maximum 10 seconds video.<br /><strong>Video Orientation:</strong> Tracks character position in reference video, supports maximum 30 seconds.",
  },
  "motion.faq3Q": {
    tr: "Hangi dosya formatları desteklenir?",
    en: "What file formats are supported?",
  },
  "motion.faq3A": {
    tr: "<strong>Görsel:</strong> JPEG, PNG, WEBP (max 10MB)<br /><strong>Video:</strong> MP4, MOV, MKV (max 100MB, 3-30 saniye)",
    en: "<strong>Image:</strong> JPEG, PNG, WEBP (max 10MB)<br /><strong>Video:</strong> MP4, MOV, MKV (max 100MB, 3-30 seconds)",
  },
  "motion.faq4Q": {
    tr: "Kredi maliyeti nasıl hesaplanır?",
    en: "How is credit cost calculated?",
  },
  "motion.faq4A": {
    tr: "<strong>Standard (720p):</strong> 5 kredi/saniye<br /><strong>Pro (1080p):</strong> 8 kredi/saniye<br />Örnek: 10 saniyelik Pro video = 80 kredi",
    en: "<strong>Standard (720p):</strong> 5 credits/second<br /><strong>Pro (1080p):</strong> 8 credits/second<br />Example: 10-second Pro video = 80 credits",
  },
  "motion.faq5Q": {
    tr: "En iyi sonuçlar için nelere dikkat etmeliyim?",
    en: "What should I pay attention to for best results?",
  },
  "motion.faq5A": {
    tr: "• Görsel ve video çerçevelemeleri eşleştirin (yarım vücut-yarım vücut, tam vücut-tam vücut)<br />• Net, orta hızda hareketler içeren referans videolar kullanın<br />• Karakterin tüm vücudunu ve başını net gösterin<br />• Tek karakterli, kamera kesintisi olmayan videolar tercih edin",
    en: "• Match image and video framing (half-body to half-body, full-body to full-body)<br />• Use reference videos with clear, medium-paced movements<br />• Show character's full body and head clearly<br />• Prefer single-character videos without camera cuts",
  },
  "motion.currentCredits": {
    tr: "Mevcut Krediniz:",
    en: "Your Current Credits:",
  },
  "motion.generating": { tr: "Oluşturuluyor...", en: "Generating..." },
  "motion.generateVideo": { tr: "Video Oluştur", en: "Generate Video" },
  "motion.errors.invalidImage": {
    tr: "Lütfen geçerli bir görsel dosyası seçin",
    en: "Please select a valid image file",
  },
  "motion.errors.imageTooLarge": {
    tr: "Dosya boyutu 10MB'dan küçük olmalıdır",
    en: "File size must be smaller than 10MB",
  },
  "motion.errors.invalidVideo": {
    tr: "Lütfen geçerli bir video dosyası seçin",
    en: "Please select a valid video file",
  },
  "motion.errors.videoTooLarge": {
    tr: "Dosya boyutu 100MB'dan küçük olmalıdır",
    en: "File size must be smaller than 100MB",
  },
  "motion.errors.videoTooShort": {
    tr: "Video süresi en az 3 saniye olmalıdır.",
    en: "Video duration must be at least 3 seconds.",
  },
  "motion.errors.videoTooLong": {
    tr: "Video süresi 30 saniyeden uzun. İlk 30 saniyesi kullanılacak.",
    en: "Video duration exceeds 30 seconds. First 30 seconds will be used.",
  },
  "motion.errors.videoResolutionLow": {
    tr: "Video çözünürlüğü çok düşük! En az 720x720 olmalıdır. Mevcut: {width}x{height}",
    en: "Video resolution too low! Must be at least 720x720. Current: {width}x{height}",
  },
  "motion.toast.videoUploaded": {
    tr: "Video yüklendi: {width}x{height}, {duration}s",
    en: "Video uploaded: {width}x{height}, {duration}s",
  },
  "motion.toast.noFileUploaded": {
    tr: "Lütfen en az bir görsel veya video yükleyin",
    en: "Please upload at least one image or video",
  },
  "motion.toast.noPrompt": {
    tr: "Lütfen sahne açıklaması girin",
    en: "Please enter scene description",
  },
  "motion.toast.insufficientCredits": {
    tr: "Yetersiz kredi. Bu işlem için maksimum {credits} kredi gerekiyor.",
    en: "Insufficient credits. This operation requires maximum {credits} credits.",
  },
  "motion.toast.uploadingImage": {
    tr: "Görsel yükleniyor...",
    en: "Uploading image...",
  },
  "motion.toast.imageUploadFailed": {
    tr: "Görsel yüklenemedi",
    en: "Failed to upload image",
  },
  "motion.toast.uploadingVideo": {
    tr: "Video yükleniyor...",
    en: "Uploading video...",
  },
  "motion.toast.videoUploadFailed": {
    tr: "Video yüklenemedi",
    en: "Failed to upload video",
  },
  "motion.toast.startingGeneration": {
    tr: "Video oluşturma işlemi başlatılıyor...",
    en: "Starting video generation...",
  },
  "motion.toast.generationStarted": {
    tr: "Video oluşturma başlatıldı! Galeriye yönlendiriliyorsunuz...",
    en: "Video generation started! Redirecting to gallery...",
  },
  "motion.toast.generationFailed": {
    tr: "Video oluşturulamadı",
    en: "Failed to generate video",
  },
  "motion.toast.error": {
    tr: "Bir hata oluştu",
    en: "An error occurred",
  },

  // AI Influencer Page
  "aiInfluencer.title": {
    tr: "AI Influencer Oluştur",
    en: "Create AI Influencer",
  },
  "aiInfluencer.subtitle": {
    tr: "Karakterinizi yükleyin ve yeni görseller oluşturun",
    en: "Upload your character and create new images",
  },
  "aiInfluencer.createCharacter": {
    tr: "Yeni Karakter Oluştur",
    en: "Create New Character",
  },
  "aiInfluencer.myCharacters": { tr: "Karakterlerim", en: "My Characters" },
  "aiInfluencer.community": {
    tr: "Topluluk Karakterleri",
    en: "Community Characters",
  },
  "aiInfluencer.characterName": { tr: "Karakter Adı", en: "Character Name" },
  "aiInfluencer.description": { tr: "Açıklama", en: "Description" },
  "aiInfluencer.uploadPhotos": { tr: "Fotoğraf Yükle", en: "Upload Photos" },
  "aiInfluencer.minPhotos": {
    tr: "En az {count} fotoğraf yükleyin",
    en: "Upload at least {count} photos",
  },
  "aiInfluencer.training": { tr: "Eğitiliyor...", en: "Training..." },
  "aiInfluencer.ready": { tr: "Hazır", en: "Ready" },
  "aiInfluencer.generate": { tr: "Görsel Oluştur", en: "Generate Image" },

  // Error messages
  "aiInfluencer.errors.creditsNotLoaded": {
    tr: "Kredi bilgisi alınamadı, lütfen sayfayı yenileyin.",
    en: "Failed to load credits, please refresh the page.",
  },
  "aiInfluencer.errors.charactersNotLoaded": {
    tr: "Karakterler yüklenemedi, lütfen sayfayı yenileyin.",
    en: "Failed to load characters, please refresh the page.",
  },
  "aiInfluencer.errors.sessionExpired": {
    tr: "Oturumunuz sona ermiş. Lütfen sayfayı yenileyin veya tekrar giriş yapın.",
    en: "Your session has expired. Please refresh the page or log in again.",
  },
  "aiInfluencer.errors.promptFailed": {
    tr: "Prompt üretilemedi",
    en: "Failed to generate prompt",
  },
  "aiInfluencer.errors.shareStatusFailed": {
    tr: "Paylaşım durumu değiştirilemedi",
    en: "Failed to change share status",
  },
  "aiInfluencer.errors.selectImageFile": {
    tr: "Lütfen bir görsel dosyası seçin",
    en: "Please select an image file",
  },
  "aiInfluencer.errors.fileSizeLimit": {
    tr: "Dosya boyutu 20MB'dan küçük olmalıdır. Lütfen görseli sıkıştırın.",
    en: "File size must be less than 20MB. Please compress the image.",
  },
  "aiInfluencer.errors.promptRequired": {
    tr: "Lütfen bir prompt girin",
    en: "Please enter a prompt",
  },
  "aiInfluencer.errors.characterRequired": {
    tr: "Lütfen bir karakter görseli ekleyin veya kayıtlı bir karakter seçin",
    en: "Please add a character image or select a saved character",
  },
  "aiInfluencer.errors.characterUploadFailed": {
    tr: "Karakter görseli yüklenemedi",
    en: "Failed to upload character image",
  },
  "aiInfluencer.errors.characterNotSelected": {
    tr: "Karakter seçilmedi",
    en: "Character not selected",
  },
  "aiInfluencer.errors.generationFailed": {
    tr: "Görsel oluşturulamadı",
    en: "Failed to generate image",
  },
  "aiInfluencer.errors.timeout": {
    tr: "Görsel üretimi zaman aşımına uğradı. API yoğunluğu nedeniyle işlem tamamlanamadı, lütfen tekrar deneyin.",
    en: "Image generation timed out. The operation could not be completed due to API congestion, please try again.",
  },
  "aiInfluencer.errors.apiError": {
    tr: "Görsel üretim servisi geçici olarak yanıt vermiyor, lütfen birkaç dakika sonra tekrar deneyin.",
    en: "Image generation service is temporarily unavailable, please try again in a few minutes.",
  },
  "aiInfluencer.errors.characterDeleteFailed": {
    tr: "Karakter silinemedi",
    en: "Failed to delete character",
  },

  // Success messages
  "aiInfluencer.success.characterDeleted": {
    tr: "Karakter silindi",
    en: "Character deleted",
  },
  "aiInfluencer.success.promptGenerated": {
    tr: "Prompt üretildi: {location}",
    en: "Prompt generated: {location}",
  },
  "aiInfluencer.success.characterPublic": {
    tr: "Karakter herkese açık yapıldı",
    en: "Character made public",
  },
  "aiInfluencer.success.characterPrivate": {
    tr: "Karakter gizli yapıldı",
    en: "Character made private",
  },
  "aiInfluencer.success.generationStarted": {
    tr: "✅ Görsel oluşturma başlatıldı! Galeri sayfasından takip edebilirsiniz.",
    en: "✅ Image generation started! You can track it from the gallery page.",
  },
  "aiInfluencer.success.imageGenerated": {
    tr: "Görsel başarıyla oluşturuldu!",
    en: "Image generated successfully!",
  },
  "aiInfluencer.success.characterSavedGenerating": {
    tr: "Karakter kaydedildi! Görsel oluşturuluyor...",
    en: "Character saved! Generating image...",
  },
  "aiInfluencer.success.characterSaved": {
    tr: "Karakter kaydedildi! Şimdi görsel oluşturabilirsiniz.",
    en: "Character saved! You can now generate images.",
  },
  "aiInfluencer.success.generating": {
    tr: "Görsel oluşturuluyor...",
    en: "Generating image...",
  },

  // UI Elements
  "aiInfluencer.loading": {
    tr: "Yükleniyor...",
    en: "Loading...",
  },
  "aiInfluencer.characterImage": {
    tr: "Karakter Görseli",
    en: "Character Image",
  },
  "aiInfluencer.savedCharacters": {
    tr: "Kayıtlı Karakterler ({count})",
    en: "Saved Characters ({count})",
  },
  "aiInfluencer.usageCount": {
    tr: "{count} kullanım",
    en: "{count} uses",
  },
  "aiInfluencer.makePublic": {
    tr: "Herkese açık yap",
    en: "Make public",
  },
  "aiInfluencer.makePrivate": {
    tr: "Gizli yap",
    en: "Make private",
  },
  "aiInfluencer.uploadCharacterImage": {
    tr: "AI karakterinizin görselini yükleyin",
    en: "Upload your AI character's image",
  },
  "aiInfluencer.fileFormat": {
    tr: "JPG, PNG, WebP • Maks. 20MB",
    en: "JPG, PNG, WebP • Max. 20MB",
  },
  "aiInfluencer.uploading": {
    tr: "Yükleniyor... {progress}%",
    en: "Uploading... {progress}%",
  },
  "aiInfluencer.change": {
    tr: "Değiştir",
    en: "Change",
  },
  "aiInfluencer.remove": {
    tr: "Kaldır",
    en: "Remove",
  },
  "aiInfluencer.referencePose": {
    tr: "Referans Poz Görseli",
    en: "Reference Pose Image",
  },
  "aiInfluencer.optional": {
    tr: "(Opsiyonel)",
    en: "(Optional)",
  },
  "aiInfluencer.addReferencePose": {
    tr: "İstediğiniz pozu gösteren bir görsel ekleyin",
    en: "Add an image showing the desired pose",
  },
  "aiInfluencer.prompt": {
    tr: "Prompt",
    en: "Prompt",
  },
  "aiInfluencer.promptPlaceholder": {
    tr: "Karakterinizi nasıl görmek istiyorsunuz? Örn: 'Sahilde gün batımında yürürken, casual kıyafetler'",
    en: "How do you want to see your character? E.g: 'Walking on the beach at sunset, wearing casual clothes'",
  },
  "aiInfluencer.detailedPromptBetter": {
    tr: "Detaylı açıklama daha iyi sonuçlar verir.",
    en: "Detailed descriptions produce better results.",
  },
  "aiInfluencer.generatingPrompt": {
    tr: "Üretiliyor...",
    en: "Generating...",
  },
  "aiInfluencer.generatePromptAI": {
    tr: "AI ile Prompt Üret",
    en: "Generate Prompt with AI",
  },
  "aiInfluencer.imageSettings": {
    tr: "Görsel Ayarları",
    en: "Image Settings",
  },
  "aiInfluencer.aspectRatio": {
    tr: "Görüntü Oranı",
    en: "Aspect Ratio",
  },
  "aiInfluencer.quality": {
    tr: "Kalite",
    en: "Quality",
  },
  "aiInfluencer.characterUploading": {
    tr: "Karakter yükleniyor...",
    en: "Uploading character...",
  },
  "aiInfluencer.referenceUploading": {
    tr: "Referans yükleniyor...",
    en: "Uploading reference...",
  },
  "aiInfluencer.generatingImage": {
    tr: "Oluşturuluyor...",
    en: "Generating...",
  },
  "aiInfluencer.generateImage": {
    tr: "Görsel Oluştur ({cost} Kredi)",
    en: "Generate Image ({cost} Credits)",
  },
  "aiInfluencer.currentCredits": {
    tr: "Mevcut krediniz: {credits}",
    en: "Your current credits: {credits}",
  },
  "aiInfluencer.preview": {
    tr: "Önizleme",
    en: "Preview",
  },
  "aiInfluencer.zoom": {
    tr: "Büyüt",
    en: "Zoom",
  },
  "aiInfluencer.download": {
    tr: "İndir",
    en: "Download",
  },
  "aiInfluencer.previewEmpty": {
    tr: "Karakter görseli ve prompt ekleyerek\nyeni görseller oluşturun",
    en: "Add character image and prompt to\ncreate new images",
  },
  "aiInfluencer.confirmDelete": {
    tr: "Bu karakteri silmek istediğinizden emin misiniz?",
    en: "Are you sure you want to delete this character?",
  },

  // Apps Page
  "apps.title": {
    tr: "Viral Video Uygulamaları",
    en: "Viral Video Apps",
  },
  "apps.subtitle": {
    tr: "Tek bir fotoğrafla sosyal medyada viral olabilecek videolar oluşturun.\nSadece fotoğraf yükleyin, gerisini yapay zeka halleder!",
    en: "Create videos that can go viral on social media with just one photo.\nJust upload a photo, let AI handle the rest!",
  },
  "apps.loading": {
    tr: "Yükleniyor...",
    en: "Loading...",
  },
  "apps.popular": {
    tr: "Popüler",
    en: "Popular",
  },
  "apps.uploadPhoto": {
    tr: "Fotoğraf Yükle",
    en: "Upload Photo",
  },
  "apps.clickToUpload": {
    tr: "Fotoğraf yüklemek için tıklayın",
    en: "Click to upload photo",
  },
  "apps.fileFormat": {
    tr: "PNG, JPG, WEBP (max 10MB)",
    en: "PNG, JPG, WEBP (max 10MB)",
  },
  "apps.creditCost": {
    tr: "Kredi Maliyeti:",
    en: "Credit Cost:",
  },
  "apps.credits": {
    tr: "{count} Kredi",
    en: "{count} Credits",
  },
  "apps.currentCredits": {
    tr: "Mevcut krediniz: {credits}",
    en: "Your current credits: {credits}",
  },
  "apps.generateVideo": {
    tr: "Video Oluştur",
    en: "Generate Video",
  },
  "apps.newVideo": {
    tr: "Yeni Video Oluştur",
    en: "Create New Video",
  },
  "apps.download": {
    tr: "İndir",
    en: "Download",
  },
  "apps.login": {
    tr: "Giriş Yap",
    en: "Login",
  },

  // Apps errors
  "apps.errors.imageUploadFailed": {
    tr: "Görsel yüklenemedi",
    en: "Failed to upload image",
  },
  "apps.errors.videoGenerationFailed": {
    tr: "Video oluşturma hatası",
    en: "Video generation error",
  },

  // Apps generation status
  "apps.status.generating": {
    tr: "Video oluşturuluyor...",
    en: "Generating video...",
  },
  "apps.status.generatingSubtext": {
    tr: "Bu işlem 1-3 dakika sürebilir",
    en: "This may take 1-3 minutes",
  },
  "apps.status.processing": {
    tr: "Video işleniyor...",
    en: "Processing video...",
  },
  "apps.status.processingSubtext": {
    tr: "Lütfen bekleyin, video hazırlanıyor",
    en: "Please wait, video is being prepared",
  },

  // UGC Ad Creator Page
  "ugcAd.success.generationStarted": {
    tr: "Video oluşturma başlatıldı!",
    en: "Video generation started!",
  },
  "ugcAd.errors.selectImageFile": {
    tr: "Lütfen bir görsel dosyası seçin",
    en: "Please select an image file",
  },
  "ugcAd.errors.fileSizeLimit": {
    tr: "Dosya boyutu 20MB'dan küçük olmalı",
    en: "File size must be less than 20MB",
  },
  "ugcAd.success.imageUploaded": {
    tr: "Görsel yüklendi!",
    en: "Image uploaded!",
  },
  "ugcAd.errors.imageUploadFailed": {
    tr: "Görsel yüklenirken hata oluştu",
    en: "Error occurred while uploading image",
  },
  "ugcAd.status.processing": {
    tr: "Video oluşturuluyor, bu işlem birkaç dakika sürebilir...",
    en: "Video is being created, this may take a few minutes...",
  },
  "ugcAd.status.completed": {
    tr: "Videonuz başarıyla oluşturuldu!",
    en: "Your video has been created successfully!",
  },
  "ugcAd.status.error": {
    tr: "Bir hata oluştu",
    en: "An error occurred",
  },
  "ugcAd.productImageAlt": {
    tr: "Ürün",
    en: "Product",
  },
  "ugcAd.productNamePlaceholder": {
    tr: "Örn: Premium Kablosuz Kulaklık",
    en: "E.g: Premium Wireless Headphones",
  },
  "ugcAd.keyBenefitPlaceholder": {
    tr: "Örn: 30 saat pil ömrü ile kesintisiz müzik",
    en: "E.g: Uninterrupted music with 30 hours of battery life",
  },

  // Verify Email Page
  "verifyEmail.success.emailVerified": {
    tr: "Email doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...",
    en: "Email verified! Redirecting to login page...",
  },
  "verifyEmail.info.enterCode": {
    tr: "Lütfen email adresinize gönderilen doğrulama kodunu girin",
    en: "Please enter the verification code sent to your email",
  },
  "verifyEmail.errors.verificationCheckFailed": {
    tr: "Doğrulama kontrolü başarısız",
    en: "Verification check failed",
  },
  "verifyEmail.errors.enterSixDigitCode": {
    tr: "Lütfen 6 haneli doğrulama kodunu girin",
    en: "Please enter the 6-digit verification code",
  },
  "verifyEmail.errors.invalidCode": {
    tr: "Doğrulama kodu hatalı",
    en: "Invalid verification code",
  },
  "verifyEmail.errors.verificationFailed": {
    tr: "Doğrulama başarısız. Lütfen tekrar deneyin.",
    en: "Verification failed. Please try again.",
  },
  "verifyEmail.success.codeResent": {
    tr: "Doğrulama kodu yeniden gönderildi!",
    en: "Verification code has been resent!",
  },
  "verifyEmail.errors.codeNotSent": {
    tr: "Kod gönderilemedi",
    en: "Failed to send code",
  },
  "verifyEmail.errors.codeSendRetry": {
    tr: "Kod gönderilemedi. Lütfen daha sonra tekrar deneyin.",
    en: "Failed to send code. Please try again later.",
  },
  "verifyEmail.enterEmailCheck": {
    tr: "Email adresinizi girin ve doğrulama durumunu kontrol edin",
    en: "Enter your email and check verification status",
  },
  "verifyEmail.enterSixDigitCode": {
    tr: "Email adresinize gönderilen 6 haneli kodu girin",
    en: "Enter the 6-digit code sent to your email",
  },
  "verifyEmail.checkStatus": {
    tr: "Doğrulama Durumunu Kontrol Et",
    en: "Check Verification Status",
  },
  "verifyEmail.verifyCode": {
    tr: "Kodu Doğrula",
    en: "Verify Code",
  },

  // Skin Enhancement Page
  "skinEnhancement.success.completed": {
    tr: "Cilt iyileştirme tamamlandı!",
    en: "Skin enhancement completed!",
  },
  "skinEnhancement.success.deletedFromHistory": {
    tr: "Geçmişten silindi",
    en: "Deleted from history",
  },
  "skinEnhancement.errors.selectImageFile": {
    tr: "Lütfen bir görsel dosyası seçin",
    en: "Please select an image file",
  },
  "skinEnhancement.errors.fileSizeLimit": {
    tr: "Dosya boyutu 10MB'dan küçük olmalıdır",
    en: "File size must be less than 10MB",
  },
  "skinEnhancement.errors.pleaseLogin": {
    tr: "Lütfen giriş yapın",
    en: "Please log in",
  },
  "skinEnhancement.errors.imageUploadFailed": {
    tr: "Görsel yüklenemedi",
    en: "Failed to upload image",
  },
  "skinEnhancement.errors.uploadError": {
    tr: "Görsel yüklenirken bir hata oluştu",
    en: "An error occurred while uploading the image",
  },
  "skinEnhancement.success.imageDownloaded": {
    tr: "Görsel indirildi",
    en: "Image downloaded",
  },
  "skinEnhancement.errors.downloadFailed": {
    tr: "İndirme başarısız",
    en: "Download failed",
  },

  // Community Characters Page
  "communityCharacters.searchPlaceholder": {
    tr: "Karakter veya kullanıcı ara...",
    en: "Search character or user...",
  },
  "communityCharacters.noResultsFound": {
    tr: "Aramanızla eşleşen karakter bulunamadı.",
    en: "No characters found matching your search.",
  },
  "communityCharacters.noCharactersYet": {
    tr: "Henüz paylaşılan karakter yok.",
    en: "No shared characters yet.",
  },

  // Blog Page
  "blog.allCategories": {
    tr: "Tümü",
    en: "All",
  },
  "blog.searchPlaceholder": {
    tr: "Blog yazısı ara...",
    en: "Search blog posts...",
  },

  // Login/Register Pages
  "auth.login.title": { tr: "Giriş Yap", en: "Login" },
  "auth.login.subtitle": {
    tr: "Hesabınıza giriş yapın",
    en: "Sign in to your account",
  },
  "auth.login.email": { tr: "E-posta", en: "Email" },
  "auth.login.password": { tr: "Şifre", en: "Password" },
  "auth.login.forgotPassword": { tr: "Şifremi Unuttum", en: "Forgot Password" },
  "auth.login.submit": { tr: "Giriş Yap", en: "Login" },
  "auth.login.noAccount": {
    tr: "Hesabınız yok mu?",
    en: "Don't have an account?",
  },
  "auth.login.signUp": { tr: "Kayıt Ol", en: "Sign Up" },
  "auth.login.or": { tr: "veya", en: "or" },
  "auth.login.google": {
    tr: "Google ile Giriş Yap",
    en: "Sign in with Google",
  },
  "auth.login.googleRedirecting": {
    tr: "Yönlendiriliyor...",
    en: "Redirecting...",
  },
  "auth.login.loggingIn": {
    tr: "Giriş yapılıyor...",
    en: "Logging in...",
  },
  "auth.login.welcome": { tr: "Hoş Geldiniz", en: "Welcome Back" },
  "auth.login.home": { tr: "Ana Sayfa", en: "Home" },
  "auth.login.branding.title": {
    tr: "AI Yaratıcılığınızı Keşfedin",
    en: "Discover Your AI Creativity",
  },
  "auth.login.branding.subtitle": {
    tr: "Yapay zeka destekli araçlarla görseller, videolar ve daha fazlasını oluşturun. Hayal gücünüzün sınırlarını zorlayın.",
    en: "Create images, videos and more with AI-powered tools. Push the boundaries of your imagination.",
  },
  "auth.login.branding.feature1": {
    tr: "Profesyonel Görseller",
    en: "Professional Images",
  },
  "auth.login.branding.feature1Desc": {
    tr: "Nano Banana Pro ile yüksek kaliteli görseller",
    en: "High-quality images with Nano Banana Pro",
  },
  "auth.login.branding.feature2": {
    tr: "AI Video Oluşturma",
    en: "AI Video Generation",
  },
  "auth.login.branding.feature2Desc": {
    tr: "Görselleri canlı videolara dönüştürün",
    en: "Transform images into dynamic videos",
  },
  "auth.login.branding.feature3": {
    tr: "Sınırsız Yaratıcılık",
    en: "Unlimited Creativity",
  },
  "auth.login.branding.feature3Desc": {
    tr: "AI influencer, logo tasarımı ve daha fazlası",
    en: "AI influencer, logo design and more",
  },
  "auth.login.errors.googleInitFailed": {
    tr: "Google ile giriş başlatılamadı",
    en: "Could not initiate Google sign in",
  },
  "auth.login.errors.googleFailed": {
    tr: "Google ile giriş başarısız",
    en: "Google sign in failed",
  },
  "auth.login.errors.fillAllFields": {
    tr: "Lütfen tüm alanları doldurun",
    en: "Please fill in all fields",
  },
  "auth.login.errors.emailNotVerified": {
    tr: "Email adresinizi henüz doğrulamadınız",
    en: "You haven't verified your email yet",
  },
  "auth.login.errors.loginFailed": {
    tr: "Giriş başarısız",
    en: "Login failed",
  },
  "auth.login.errors.genericError": {
    tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
    en: "An error occurred. Please try again.",
  },
  "auth.login.success": {
    tr: "Giriş başarılı!",
    en: "Login successful!",
  },
  "auth.register.title": { tr: "Kayıt Ol", en: "Sign Up" },
  "auth.register.subtitle": {
    tr: "Yeni hesap oluşturun",
    en: "Create a new account",
  },
  "auth.register.name": { tr: "Ad Soyad", en: "Full Name" },
  "auth.register.email": { tr: "E-posta", en: "Email" },
  "auth.register.password": { tr: "Şifre", en: "Password" },
  "auth.register.confirmPassword": {
    tr: "Şifre Tekrar",
    en: "Confirm Password",
  },
  "auth.register.referralCode": {
    tr: "Referans Kodu (Opsiyonel)",
    en: "Referral Code (Optional)",
  },
  "auth.register.submit": { tr: "Kayıt Ol", en: "Sign Up" },
  "auth.register.haveAccount": {
    tr: "Zaten hesabınız var mı?",
    en: "Already have an account?",
  },
  "auth.register.signIn": { tr: "Giriş Yap", en: "Sign In" },
  "auth.register.createAccount": {
    tr: "Hesap Oluştur",
    en: "Create Account",
  },
  "auth.register.creating": {
    tr: "Hesap oluşturuluyor...",
    en: "Creating account...",
  },
  "auth.register.home": { tr: "Ana Sayfa", en: "Home" },
  "auth.register.google": {
    tr: "Google ile Kayıt Ol",
    en: "Sign up with Google",
  },
  "auth.register.googleRedirecting": {
    tr: "Yönlendiriliyor...",
    en: "Redirecting...",
  },
  "auth.register.or": { tr: "veya", en: "or" },
  "auth.register.namePlaceholder": {
    tr: "Adınız Soyadınız",
    en: "Your Full Name",
  },
  "auth.register.passwordPlaceholder": {
    tr: "En az 8 karakter",
    en: "At least 8 characters",
  },
  "auth.register.confirmPasswordPlaceholder": {
    tr: "Şifrenizi tekrar girin",
    en: "Re-enter your password",
  },
  "auth.register.passwordHint": {
    tr: "Büyük harf, küçük harf ve rakam içermelidir",
    en: "Must contain uppercase, lowercase and number",
  },
  "auth.register.bonusCredits": {
    tr: "Ücretsiz başlayın - {credits} kredi hediye!",
    en: "Start free - {credits} credits gift!",
  },
  "auth.register.branding.title": {
    tr: "Hemen Başlayın",
    en: "Get Started Now",
  },
  "auth.register.branding.subtitle": {
    tr: "Ücretsiz hesap oluşturun ve AI yaratıcılığınızı keşfetmeye başlayın. İlk kayıtta bonus krediler sizi bekliyor!",
    en: "Create a free account and start discovering your AI creativity. Bonus credits await you on first signup!",
  },
  "auth.register.branding.feature1": {
    tr: "25 Ücretsiz Kredi",
    en: "25 Free Credits",
  },
  "auth.register.branding.feature1Desc": {
    tr: "Kayıt olun ve hemen görsel oluşturmaya başlayın",
    en: "Sign up and start creating images immediately",
  },
  "auth.register.branding.feature2": {
    tr: "Güçlü AI Araçları",
    en: "Powerful AI Tools",
  },
  "auth.register.branding.feature2Desc": {
    tr: "Görsel, video, logo ve daha fazlası - hepsi bir arada",
    en: "Images, videos, logos and more - all in one place",
  },
  "auth.register.branding.feature3": {
    tr: "Topluluk",
    en: "Community",
  },
  "auth.register.branding.feature3Desc": {
    tr: "Diğer kullanıcıların çalışmalarından ilham alın",
    en: "Get inspired by other users' works",
  },
  "auth.register.branding.usersJoined": {
    tr: "kullanıcı zaten AI yaratıcılığını keşfetti!",
    en: "users already discovered AI creativity!",
  },
  "auth.register.errors.googleInitFailed": {
    tr: "Google ile kayıt başlatılamadı",
    en: "Could not initiate Google sign up",
  },
  "auth.register.errors.googleFailed": {
    tr: "Google ile kayıt başarısız",
    en: "Google sign up failed",
  },
  "auth.register.errors.fillAllFields": {
    tr: "Lütfen tüm alanları doldurun",
    en: "Please fill in all fields",
  },
  "auth.register.errors.passwordLength": {
    tr: "Şifre en az 8 karakter olmalıdır",
    en: "Password must be at least 8 characters",
  },
  "auth.register.errors.passwordUppercase": {
    tr: "Şifre en az bir büyük harf içermelidir",
    en: "Password must contain at least one uppercase letter",
  },
  "auth.register.errors.passwordLowercase": {
    tr: "Şifre en az bir küçük harf içermelidir",
    en: "Password must contain at least one lowercase letter",
  },
  "auth.register.errors.passwordNumber": {
    tr: "Şifre en az bir rakam içermelidir",
    en: "Password must contain at least one number",
  },
  "auth.register.errors.passwordMismatch": {
    tr: "Şifreler eşleşmiyor",
    en: "Passwords do not match",
  },
  "auth.register.errors.registerFailed": {
    tr: "Kayıt başarısız",
    en: "Registration failed",
  },
  "auth.register.errors.genericError": {
    tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
    en: "An error occurred. Please try again.",
  },
  "auth.register.success": {
    tr: "Kayıt başarılı!",
    en: "Registration successful!",
  },
  "auth.register.verificationSent": {
    tr: "Doğrulama kodu email adresinize gönderildi!",
    en: "Verification code sent to your email!",
  },
  "auth.verify.title": { tr: "E-posta Doğrulama", en: "Email Verification" },
  "auth.verify.subtitle": {
    tr: "E-postanıza gönderilen doğrulama kodunu girin",
    en: "Enter the verification code sent to your email",
  },
  "auth.verify.code": { tr: "Doğrulama Kodu", en: "Verification Code" },
  "auth.verify.submit": { tr: "Doğrula", en: "Verify" },
  "auth.verify.resend": { tr: "Kodu Tekrar Gönder", en: "Resend Code" },
  "auth.verify.back": { tr: "Geri Dön", en: "Go Back" },
  "auth.verify.emailSentTo": {
    tr: "adresine gönderilen 6 haneli kodu girin",
    en: "Enter the 6-digit code sent to",
  },
  "auth.verify.verifying": {
    tr: "Doğrulanıyor...",
    en: "Verifying...",
  },
  "auth.verify.verifyAndSignup": {
    tr: "Doğrula ve Kayıt Ol",
    en: "Verify and Sign Up",
  },
  "auth.verify.notReceived": {
    tr: "Kod gelmedi mi? Tekrar gönder",
    en: "Didn't receive code? Resend",
  },
  "auth.verify.checkSpam": {
    tr: "Spam klasörünüzü kontrol etmeyi unutmayın",
    en: "Don't forget to check your spam folder",
  },
  "auth.verify.errors.codeLength": {
    tr: "Lütfen 6 haneli kodu girin",
    en: "Please enter the 6-digit code",
  },
  "auth.verify.errors.verificationFailed": {
    tr: "Doğrulama başarısız",
    en: "Verification failed",
  },
  "auth.verify.errors.genericError": {
    tr: "Doğrulama başarısız. Lütfen tekrar deneyin.",
    en: "Verification failed. Please try again.",
  },
  "auth.verify.errors.resendFailed": {
    tr: "Kod gönderilemedi",
    en: "Could not send code",
  },
  "auth.verify.errors.resendGenericError": {
    tr: "Kod gönderilemedi. Lütfen daha sonra tekrar deneyin.",
    en: "Could not send code. Please try again later.",
  },
  "auth.verify.success": {
    tr: "Kayıt başarılı! Yönlendiriliyorsunuz...",
    en: "Registration successful! Redirecting...",
  },
  "auth.verify.resendSuccess": {
    tr: "Doğrulama kodu yeniden gönderildi!",
    en: "Verification code resent!",
  },

  // Multi-Angle Page
  "multiAngle.title": { tr: "Çoklu Açı Fotoğraf", en: "Multi-Angle Photo" },
  "multiAngle.subtitle": {
    tr: "Tek fotoğraftan 4-8 farklı açıdan görüntü oluşturun",
    en: "Create 4-8 different angle views from a single photo",
  },
  "multiAngle.upload": { tr: "Fotoğraf Yükle", en: "Upload Photo" },
  "multiAngle.angleCount": { tr: "Açı Sayısı", en: "Number of Angles" },
  "multiAngle.generate": { tr: "Oluştur", en: "Generate" },
  "multiAngle.errors.invalidFileType": {
    tr: "Geçersiz dosya türü",
    en: "Invalid file type",
  },
  "multiAngle.errors.invalidFileTypeDesc": {
    tr: "Lütfen bir görsel dosyası seçin",
    en: "Please select an image file",
  },
  "multiAngle.errors.fileTooLarge": {
    tr: "Dosya çok büyük",
    en: "File too large",
  },
  "multiAngle.errors.fileTooLargeDesc": {
    tr: "Maksimum dosya boyutu 20MB",
    en: "Maximum file size is 20MB",
  },
  "multiAngle.errors.uploadFailed": {
    tr: "Yükleme başarısız",
    en: "Upload failed",
  },
  "multiAngle.errors.invalidServerResponse": {
    tr: "Geçersiz sunucu yanıtı",
    en: "Invalid server response",
  },
  "multiAngle.errors.networkError": {
    tr: "Ağ hatası",
    en: "Network error",
  },
  "multiAngle.errors.uploadError": {
    tr: "Yükleme hatası",
    en: "Upload error",
  },
  "multiAngle.errors.noReferenceImage": {
    tr: "Lütfen bir referans görsel yükleyin",
    en: "Please upload a reference image",
  },
  "multiAngle.errors.downloadError": {
    tr: "İndirme hatası",
    en: "Download error",
  },
  "multiAngle.errors.noImagesToDownload": {
    tr: "İndirilecek görsel bulunamadı",
    en: "No images found to download",
  },
  "multiAngle.errors.zipCreationFailed": {
    tr: "ZIP dosyası oluşturulamadı",
    en: "Failed to create ZIP file",
  },
  "multiAngle.toast.imageUploaded": {
    tr: "Görsel yüklendi",
    en: "Image uploaded",
  },
  "multiAngle.toast.generating": {
    tr: "{count} fotoğraf oluşturuluyor...",
    en: "Generating {count} photos...",
  },
  "multiAngle.toast.creditsUsed": {
    tr: "{credits} kredi kullanıldı",
    en: "{credits} credits used",
  },
  "multiAngle.toast.error": { tr: "Hata", en: "Error" },
  "multiAngle.status.completed": { tr: "Tamamlandı!", en: "Completed!" },
  "multiAngle.status.partial": {
    tr: "Kısmen Tamamlandı",
    en: "Partially Completed",
  },
  "multiAngle.status.failed": { tr: "Başarısız", en: "Failed" },
  "multiAngle.status.generating": {
    tr: "Oluşturuluyor...",
    en: "Generating...",
  },
  "multiAngle.download.preparingZip": {
    tr: "ZIP Hazırlanıyor...",
    en: "Preparing ZIP...",
  },
  "multiAngle.download.downloadZip": { tr: "ZIP İndir", en: "Download ZIP" },
  "multiAngle.download.zipDownloaded": {
    tr: "{count} görsel ZIP olarak indirildi",
    en: "{count} images downloaded as ZIP",
  },
  "multiAngle.buyCredits": { tr: "Kredi Satın Al", en: "Buy Credits" },

  // Product Promo Page
  "productPromo.title": {
    tr: "Ürün Tanıtım Videosu",
    en: "Product Promo Video",
  },
  "productPromo.subtitle": {
    tr: "E-ticaret için profesyonel tanıtım videoları oluşturun",
    en: "Create professional promo videos for e-commerce",
  },
  "productPromo.uploadProduct": {
    tr: "Ürün Görseli Yükle",
    en: "Upload Product Image",
  },
  "productPromo.productName": { tr: "Ürün Adı", en: "Product Name" },
  "productPromo.description": {
    tr: "Ürün Açıklaması",
    en: "Product Description",
  },
  "productPromo.style": { tr: "Video Stili", en: "Video Style" },
  "productPromo.generate": { tr: "Video Oluştur", en: "Generate Video" },
  "productPromo.errors.invalidFormat": {
    tr: "Geçersiz dosya formatı",
    en: "Invalid file format",
  },
  "productPromo.errors.invalidFormatDesc": {
    tr: "JPG, PNG veya WebP yükleyin",
    en: "Upload JPG, PNG or WebP",
  },
  "productPromo.errors.fileTooLarge": {
    tr: "Dosya çok büyük",
    en: "File too large",
  },
  "productPromo.errors.fileTooLargeDesc": {
    tr: "Maksimum 20MB",
    en: "Maximum 20MB",
  },
  "productPromo.errors.uploadError": {
    tr: "Yükleme hatası",
    en: "Upload error",
  },
  "productPromo.errors.downloadError": {
    tr: "İndirme hatası",
    en: "Download error",
  },
  "productPromo.errors.videoCreationFailed": {
    tr: "Video oluşturulamadı",
    en: "Failed to create video",
  },
  "productPromo.toast.imageUploaded": {
    tr: "Ürün görseli yüklendi",
    en: "Product image uploaded",
  },
  "productPromo.toast.regenerating": {
    tr: "Video yeniden oluşturuluyor...",
    en: "Regenerating video...",
  },
  "productPromo.buyCredits": { tr: "Kredi Satın Al", en: "Buy Credits" },
  "productPromo.productAlt": { tr: "Ürün", en: "Product" },
  "productPromo.placeholder.productName": {
    tr: "Örn: Premium Kablosuz Kulaklık",
    en: "E.g: Premium Wireless Headphones",
  },
  "productPromo.placeholder.description": {
    tr: "Örn: Müziğin Yeni Boyutu",
    en: "E.g: The New Dimension of Music",
  },

  // Logo Generator Page
  "logo.title": { tr: "Logo Oluşturucu", en: "Logo Generator" },
  "logo.subtitle": {
    tr: "Profesyonel marka logosu tasarlayın",
    en: "Design professional brand logos",
  },
  "logo.companyName": { tr: "Şirket/Marka Adı", en: "Company/Brand Name" },
  "logo.industry": { tr: "Sektör", en: "Industry" },
  "logo.style": { tr: "Logo Stili", en: "Logo Style" },
  "logo.colors": { tr: "Renk Paleti", en: "Color Palette" },
  "logo.generate": { tr: "Logo Oluştur", en: "Generate Logo" },
  "logo.loading": { tr: "Yükleniyor...", en: "Loading..." },

  // Logo Industries
  "logo.industry.technology": { tr: "Teknoloji", en: "Technology" },
  "logo.industry.food": { tr: "Yiyecek & İçecek", en: "Food & Beverage" },
  "logo.industry.fashion": { tr: "Moda & Giyim", en: "Fashion & Apparel" },
  "logo.industry.health": { tr: "Sağlık & Wellness", en: "Health & Wellness" },
  "logo.industry.finance": {
    tr: "Finans & Bankacılık",
    en: "Finance & Banking",
  },
  "logo.industry.education": { tr: "Eğitim", en: "Education" },
  "logo.industry.entertainment": {
    tr: "Eğlence & Medya",
    en: "Entertainment & Media",
  },
  "logo.industry.sports": { tr: "Spor & Fitness", en: "Sports & Fitness" },
  "logo.industry.beauty": {
    tr: "Güzellik & Kozmetik",
    en: "Beauty & Cosmetics",
  },
  "logo.industry.automotive": { tr: "Otomotiv", en: "Automotive" },
  "logo.industry.realestate": { tr: "Emlak", en: "Real Estate" },
  "logo.industry.travel": { tr: "Seyahat & Turizm", en: "Travel & Tourism" },
  "logo.industry.gaming": { tr: "Oyun", en: "Gaming" },
  "logo.industry.music": { tr: "Müzik", en: "Music" },
  "logo.industry.art": { tr: "Sanat & Tasarım", en: "Art & Design" },
  "logo.industry.eco": {
    tr: "Çevre & Sürdürülebilirlik",
    en: "Eco & Sustainability",
  },
  "logo.industry.pet": { tr: "Evcil Hayvan", en: "Pet" },
  "logo.industry.legal": { tr: "Hukuk", en: "Legal" },
  "logo.industry.construction": { tr: "İnşaat", en: "Construction" },
  "logo.industry.other": { tr: "Diğer", en: "Other" },

  // Logo Styles
  "logo.style.minimal": { tr: "Minimal", en: "Minimal" },
  "logo.style.minimal.desc": {
    tr: "Sade ve temiz tasarım",
    en: "Clean and simple design",
  },
  "logo.style.modern": { tr: "Modern", en: "Modern" },
  "logo.style.modern.desc": {
    tr: "Çağdaş ve yenilikçi",
    en: "Contemporary and innovative",
  },
  "logo.style.vintage": { tr: "Vintage", en: "Vintage" },
  "logo.style.vintage.desc": {
    tr: "Klasik ve nostaljik",
    en: "Classic and nostalgic",
  },
  "logo.style.luxury": { tr: "Lüks", en: "Luxury" },
  "logo.style.luxury.desc": {
    tr: "Premium ve prestijli",
    en: "Premium and prestigious",
  },
  "logo.style.playful": { tr: "Eğlenceli", en: "Playful" },
  "logo.style.playful.desc": {
    tr: "Renkli ve dinamik",
    en: "Colorful and dynamic",
  },
  "logo.style.corporate": { tr: "Kurumsal", en: "Corporate" },
  "logo.style.corporate.desc": {
    tr: "Profesyonel ve güvenilir",
    en: "Professional and trustworthy",
  },
  "logo.style.handdrawn": { tr: "El Çizimi", en: "Hand-drawn" },
  "logo.style.handdrawn.desc": {
    tr: "Organik ve samimi",
    en: "Organic and friendly",
  },
  "logo.style.geometric": { tr: "Geometrik", en: "Geometric" },
  "logo.style.geometric.desc": {
    tr: "Şekil bazlı tasarım",
    en: "Shape-based design",
  },
  "logo.style.3d": { tr: "3D", en: "3D" },
  "logo.style.3d.desc": {
    tr: "Üç boyutlu efekt",
    en: "Three-dimensional effect",
  },
  "logo.style.gradient": { tr: "Gradient", en: "Gradient" },
  "logo.style.gradient.desc": { tr: "Renk geçişli", en: "Color gradient" },
  "logo.style.mascot": { tr: "Maskot", en: "Mascot" },
  "logo.style.mascot.desc": { tr: "Karakter bazlı", en: "Character-based" },
  "logo.style.lettermark": { tr: "Harf Logo", en: "Lettermark" },
  "logo.style.lettermark.desc": {
    tr: "Baş harflerden oluşan",
    en: "Initial-based",
  },

  // Logo Color Palettes
  "logo.colors.blue": { tr: "Mavi Tonları", en: "Blue Tones" },
  "logo.colors.blue.mood": {
    tr: "Güven, Profesyonellik",
    en: "Trust, Professionalism",
  },
  "logo.colors.red": { tr: "Kırmızı Tonları", en: "Red Tones" },
  "logo.colors.red.mood": { tr: "Enerji, Tutku", en: "Energy, Passion" },
  "logo.colors.green": { tr: "Yeşil Tonları", en: "Green Tones" },
  "logo.colors.green.mood": { tr: "Doğa, Büyüme", en: "Nature, Growth" },
  "logo.colors.purple": { tr: "Mor Tonları", en: "Purple Tones" },
  "logo.colors.purple.mood": {
    tr: "Yaratıcılık, Lüks",
    en: "Creativity, Luxury",
  },
  "logo.colors.orange": { tr: "Turuncu Tonları", en: "Orange Tones" },
  "logo.colors.orange.mood": { tr: "Enerji, Sıcaklık", en: "Energy, Warmth" },
  "logo.colors.gold": { tr: "Altın & Siyah", en: "Gold & Black" },
  "logo.colors.gold.mood": { tr: "Premium, Prestij", en: "Premium, Prestige" },
  "logo.colors.pastel": { tr: "Pastel Tonlar", en: "Pastel Tones" },
  "logo.colors.pastel.mood": { tr: "Yumuşak, Samimi", en: "Soft, Friendly" },
  "logo.colors.neon": { tr: "Neon Renkler", en: "Neon Colors" },
  "logo.colors.neon.mood": {
    tr: "Modern, Dikkat Çekici",
    en: "Modern, Eye-catching",
  },
  "logo.colors.earth": { tr: "Toprak Tonları", en: "Earth Tones" },
  "logo.colors.earth.mood": { tr: "Doğal, Organik", en: "Natural, Organic" },
  "logo.colors.monochrome": { tr: "Siyah & Beyaz", en: "Black & White" },
  "logo.colors.monochrome.mood": {
    tr: "Klasik, Zamansız",
    en: "Classic, Timeless",
  },
  "logo.colors.teal": { tr: "Turkuaz Tonları", en: "Teal Tones" },
  "logo.colors.teal.mood": { tr: "Ferah, Güvenilir", en: "Fresh, Reliable" },
  "logo.colors.custom": { tr: "Özel Renk", en: "Custom Color" },
  "logo.colors.custom.mood": { tr: "Kişiselleştirilmiş", en: "Personalized" },

  // Logo Icon Types
  "logo.iconType.abstract": { tr: "Soyut Şekil", en: "Abstract Shape" },
  "logo.iconType.abstract.desc": {
    tr: "Geometrik veya organik soyut form",
    en: "Geometric or organic abstract form",
  },
  "logo.iconType.symbol": { tr: "Sembol", en: "Symbol" },
  "logo.iconType.symbol.desc": {
    tr: "Anlamlı bir ikon veya sembol",
    en: "Meaningful icon or symbol",
  },
  "logo.iconType.initial": { tr: "Baş Harf", en: "Initial" },
  "logo.iconType.initial.desc": {
    tr: "Marka adının baş harfi",
    en: "Brand name initial",
  },
  "logo.iconType.wordmark": { tr: "Sadece Yazı", en: "Wordmark Only" },
  "logo.iconType.wordmark.desc": {
    tr: "İkonsuz, tipografi odaklı",
    en: "No icon, typography-focused",
  },
  "logo.iconType.combination": { tr: "Kombinasyon", en: "Combination" },
  "logo.iconType.combination.desc": {
    tr: "İkon + yazı birlikte",
    en: "Icon + text together",
  },
  "logo.iconType.emblem": { tr: "Amblem", en: "Emblem" },
  "logo.iconType.emblem.desc": {
    tr: "Çerçeve içinde logo",
    en: "Logo within frame",
  },

  // Logo Steps
  "logo.steps.info": { tr: "Bilgiler", en: "Information" },
  "logo.steps.industry": { tr: "Sektör & Stil", en: "Industry & Style" },
  "logo.steps.colors": { tr: "Renk & İkon", en: "Colors & Icon" },
  "logo.steps.generate": { tr: "Oluştur", en: "Generate" },

  // Logo Placeholders
  "logo.placeholder.companyName": {
    tr: "Örn: TechVision, Lezzet Durağı",
    en: "E.g: TechVision, Taste Station",
  },
  "logo.placeholder.slogan": {
    tr: "Örn: Geleceği Şekillendiriyoruz",
    en: "E.g: Shaping the Future",
  },
  "logo.placeholder.details": {
    tr: "Logoda olmasını istediğiniz özel detaylar...",
    en: "Special details you want in the logo...",
  },

  // Logo Errors & Messages
  "logo.error.generationFailed": {
    tr: "Logo oluşturma başarısız",
    en: "Logo generation failed",
  },
  "logo.error.downloadFailed": {
    tr: "İndirme başarısız",
    en: "Download failed",
  },
  "logo.instructions": {
    tr: 'Tüm adımları tamamlayıp "Logo Oluştur" butonuna tıklayın',
    en: 'Complete all steps and click "Generate Logo" button',
  },

  // Prompt Compiler Page
  "promptCompiler.title": { tr: "Prompt Ustası", en: "Prompt Master" },
  "promptCompiler.subtitle": {
    tr: "Türkçe yazın, profesyonel prompt alın",
    en: "Write in Turkish, get professional prompts",
  },
  "promptCompiler.input": { tr: "Türkçe Açıklama", en: "Turkish Description" },
  "promptCompiler.inputPlaceholder": {
    tr: "Oluşturmak istediğiniz görseli Türkçe olarak açıklayın...",
    en: "Describe the image you want to create in Turkish...",
  },
  "promptCompiler.compile": { tr: "Prompt Oluştur", en: "Compile Prompt" },
  "promptCompiler.result": { tr: "Oluşturulan Prompt", en: "Generated Prompt" },
  "promptCompiler.copy": { tr: "Kopyala", en: "Copy" },
  "promptCompiler.useInGenerate": {
    tr: "Görsel Oluşturmada Kullan",
    en: "Use in Image Generation",
  },
  "promptCompiler.model.image": { tr: "Görsel", en: "Image" },
  "promptCompiler.model.imageDesc": {
    tr: "SD / Nano Banana Pro",
    en: "SD / Nano Banana Pro",
  },
  "promptCompiler.model.universal": { tr: "Universal", en: "Universal" },
  "promptCompiler.model.universalDesc": {
    tr: "Her yerde çalışır",
    en: "Works everywhere",
  },
  "promptCompiler.quality.draft": { tr: "Draft", en: "Draft" },
  "promptCompiler.quality.draftDesc": { tr: "Hızlı", en: "Fast" },
  "promptCompiler.quality.high": { tr: "High", en: "High" },
  "promptCompiler.quality.highDesc": { tr: "Detaylı", en: "Detailed" },
  "promptCompiler.toast.success": {
    tr: "Prompt başarıyla oluşturuldu!",
    en: "Prompt successfully generated!",
  },
  "promptCompiler.toast.error": {
    tr: "Bir hata oluştu",
    en: "An error occurred",
  },
  "promptCompiler.toast.sessionExpired": {
    tr: "Oturumunuz sona ermiş. Lütfen sayfayı yenileyin veya tekrar giriş yapın.",
    en: "Your session has expired. Please refresh the page or log in again.",
  },
  "promptCompiler.toast.generationError": {
    tr: "Prompt oluşturulurken bir hata oluştu",
    en: "An error occurred while generating prompt",
  },
  "promptCompiler.toast.enterDescription": {
    tr: "Lütfen bir açıklama girin",
    en: "Please enter a description",
  },
  "promptCompiler.toast.variationSelected": {
    tr: "Varyasyon seçildi",
    en: "Variation selected",
  },
  "promptCompiler.toast.copied": { tr: "Kopyalandı!", en: "Copied!" },
  "promptCompiler.example": {
    tr: "Kapadokya'da gün batımında, sokakta yürüyen şık bir kadın, sinematik...",
    en: "A stylish woman walking on the street at sunset in Cappadocia, cinematic...",
  },
  "promptCompiler.instructions": {
    tr: 'Türkçe açıklamanı yaz ve "Prompt Oluştur" butonuna tıkla',
    en: 'Write your Turkish description and click "Compile Prompt" button',
  },

  // Blog Page
  "blog.readMore": { tr: "Devamını Oku", en: "Read More" },
  "blog.author": { tr: "Yazar", en: "Author" },
  "blog.date": { tr: "Tarih", en: "Date" },
  "blog.category": { tr: "Kategori", en: "Category" },
  "blog.tags": { tr: "Etiketler", en: "Tags" },
  "blog.relatedPosts": { tr: "İlgili Yazılar", en: "Related Posts" },
  "blog.backToBlog": { tr: "Blog'a Dön", en: "Back to Blog" },

  // Not Found Page
  "notFound.title": { tr: "Sayfa Bulunamadı", en: "Page Not Found" },
  "notFound.subtitle": {
    tr: "Aradığınız sayfa bulunamadı veya taşınmış olabilir",
    en: "The page you're looking for could not be found or may have been moved",
  },
  "notFound.goHome": { tr: "Ana Sayfaya Dön", en: "Go to Homepage" },

  // Maintenance Page
  "maintenance.title": { tr: "Bakım Modu", en: "Maintenance Mode" },
  "maintenance.subtitle": {
    tr: "Sistemimiz şu anda bakımdadır. Kısa süre içinde döneceğiz.",
    en: "Our system is currently under maintenance. We'll be back shortly.",
  },
  "maintenance.pageTitle": { tr: "Bakım Çalışması", en: "Under Maintenance" },
  "maintenance.defaultMessage": {
    tr: "Sitemiz şu anda bakım çalışması nedeniyle geçici olarak kullanılamıyor. Kısa süre içinde tekrar hizmetinizde olacağız.",
    en: "Our site is temporarily unavailable due to maintenance. We'll be back in service shortly.",
  },
  "maintenance.working": {
    tr: "Çalışmalar devam ediyor...",
    en: "Work in progress...",
  },
  "maintenance.whenReady": {
    tr: "Ne Zaman Bitecek?",
    en: "When Will It Be Ready?",
  },
  "maintenance.thanks": {
    tr: "Bakım çalışması en kısa sürede tamamlanacak. Anlayışınız için teşekkür ederiz.",
    en: "Maintenance will be completed as soon as possible. Thank you for your understanding.",
  },
  "maintenance.questions": { tr: "Sorularınız için:", en: "For questions:" },

  // Blog Detail Page
  "blogDetail.backButton": { tr: "Tüm Yazılar", en: "All Posts" },
  "blogDetail.views": { tr: "görüntülenme", en: "views" },
  "blogDetail.relatedPosts": { tr: "İlgili Yazılar", en: "Related Posts" },
  "blogDetail.notFound.title": {
    tr: "Blog Yazısı Bulunamadı",
    en: "Blog Post Not Found",
  },
  "blogDetail.notFound.description": {
    tr: "Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.",
    en: "The blog post you're looking for doesn't exist or may have been removed.",
  },
  "blogDetail.notFound.backButton": { tr: "Blog'a Dön", en: "Back to Blog" },
  "blogDetail.cta.title": {
    tr: "AI ile İçerik Oluşturmaya Başlayın",
    en: "Start Creating Content with AI",
  },
  "blogDetail.cta.description": {
    tr: "Blog'da öğrendiklerinizi pratiğe dökün. Ücretsiz kredilerle AI araçlarımızı deneyin.",
    en: "Put what you learned from the blog into practice. Try our AI tools with free credits.",
  },
  "blogDetail.cta.button": { tr: "Ücretsiz Dene", en: "Try for Free" },
};
