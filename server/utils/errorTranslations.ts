/**
 * Kie.ai API'sinden gelen hata mesajlarını Türkçe'ye çeviren yardımcı fonksiyonlar
 */

interface ErrorTranslation {
  pattern: RegExp;
  translate: (match: RegExpMatchArray | null) => string;
}

const errorTranslations: ErrorTranslation[] = [
  // Kie.ai Specific Errors
  {
    pattern: /recordInfo is null|record.*not.*found|task.*not.*found/i,
    translate: () => "API görev bilgisi alınamadı. Bu teknik bir hatadır, lütfen tekrar deneyin."
  },
  {
    pattern: /model.*not.*available|model.*maintenance|model.*disabled/i,
    translate: () => "Seçili model şu anda bakımda. Lütfen farklı bir model seçin."
  },
  {
    pattern: /aspect.*ratio.*not.*support|invalid.*aspect.*ratio/i,
    translate: () => "Seçili en-boy oranı bu model için desteklenmiyor. Lütfen farklı bir oran seçin."
  },
  {
    pattern: /resolution.*not.*support|invalid.*resolution/i,
    translate: () => "Seçili çözünürlük bu model için desteklenmiyor. Lütfen farklı bir kalite seçin."
  },
  {
    pattern: /duration.*not.*support|invalid.*duration/i,
    translate: () => "Seçili video süresi desteklenmiyor. Lütfen farklı bir süre seçin."
  },
  {
    pattern: /quality.*not.*support|invalid.*quality/i,
    translate: () => "Seçili kalite seviyesi desteklenmiyor. Lütfen farklı bir kalite seçin."
  },
  {
    pattern: /image.*required|reference.*image.*required/i,
    translate: () => "Bu mod için referans görsel yüklemeniz gerekiyor."
  },
  {
    pattern: /model.*busy|queue.*full|too.*many.*request/i,
    translate: () => "Model şu anda yoğun. Lütfen birkaç dakika bekleyip tekrar deneyin."
  },

  // NSFW & Content Policy Errors
  {
    pattern: /nsfw|sexual|nude|explicit content|adult content/i,
    translate: () => "⛔ İçerik Politikası İhlali: NSFW (Uygunsuz İçerik) tespit edildi. Lütfen promptunuzu değiştirin."
  },
  {
    pattern: /violence|violent|blood|gore/i,
    translate: () => "⛔ İçerik Politikası İhlali: Şiddet içeriği tespit edildi. Lütfen promptunuzu değiştirin."
  },
  {
    pattern: /content policy|policy violation|inappropriate|banned.*word/i,
    translate: () => "⛔ İçerik Politikası İhlali: Bu içerik topluluk kurallarına aykırı. Lütfen farklı bir prompt deneyin."
  },
  {
    pattern: /prompt.*unsafe|unsafe.*content|sensitive.*content/i,
    translate: () => "⚠️ Promptunuz güvenli olmayan içerik tespit edildi. Lütfen daha uygun bir açıklama kullanın."
  },

  // Timeout Errors
  {
    pattern: /timeout|timed out|time.*out|took too long|exceeded.*time/i,
    translate: () => "⏱️ İşlem zaman aşımına uğradı. Servis yoğun olabilir, lütfen tekrar deneyin."
  },
  {
    pattern: /generation.*timeout|processing.*timeout/i,
    translate: () => "⏱️ Üretim süreci çok uzun sürdü. Lütfen daha basit bir prompt ile tekrar deneyin."
  },

  // Rate Limit & Quota Errors
  {
    pattern: /rate limit|quota.*exceed|limit.*exceed|too many requests/i,
    translate: () => "🚫 API limiti aşıldı. Lütfen 2-3 dakika bekleyip tekrar deneyin."
  },
  {
    pattern: /daily.*limit|hourly.*limit|minute.*limit/i,
    translate: () => "📊 Günlük kullanım limitinize ulaştınız. Yarın tekrar deneyin veya premium'a geçin."
  },

  // File Size & Format Errors
  {
    pattern: /file.*too large|size.*exceed|file.*big|maximum.*size|20MB|30MB|50MB/i,
    translate: (match) => {
      const size = match?.[0].match(/(\d+)MB/)?.[1] || "20";
      return `📦 Dosya boyutu çok büyük! Maksimum ${size}MB olmalıdır.`;
    }
  },
  {
    pattern: /invalid.*format|unsupported.*format|format.*not.*support/i,
    translate: () => "📄 Desteklenmeyen dosya formatı! Lütfen JPEG, PNG, WebP (görsel) veya MP4, MOV (video) kullanın."
  },
  {
    pattern: /image.*unavailable|media.*unavailable|cannot.*access.*image|url.*invalid/i,
    translate: () => "🖼️ Görsele erişilemiyor. URL geçersiz olabilir veya görsel silinmiş olabilir."
  },
  {
    pattern: /corrupted.*file|damaged.*file|cannot.*read.*file/i,
    translate: () => "💔 Dosya bozuk veya okunamıyor. Lütfen farklı bir dosya yükleyin."
  },

  // Resolution & Quality Errors
  {
    pattern: /resolution.*too.*low|image.*too.*small|minimum.*resolution/i,
    translate: () => "📐 Görsel çözünürlüğü çok düşük! Minimum 512x512 piksel gereklidir."
  },
  {
    pattern: /resolution.*too.*high|image.*too.*large|maximum.*resolution/i,
    translate: () => "📏 Görsel çözünürlüğü çok yüksek! Lütfen daha küçük bir görsel kullanın."
  },

  // API Key & Auth Errors
  {
    pattern: /api.*key.*invalid|api.*key.*expired|unauthorized|authentication.*fail/i,
    translate: () => "🔑 API kimlik doğrulama hatası! Bu bir sistem sorunudur, lütfen yöneticiye bildirin."
  },
  {
    pattern: /permission.*denied|access.*denied|forbidden/i,
    translate: () => "🚷 Erişim reddedildi. Bu özelliği kullanma yetkiniz olmayabilir."
  },

  // Server & Network Errors
  {
    pattern: /server.*error|internal.*error|500|502|503|504/i,
    translate: (match) => {
      const code = match?.[0].match(/50[0-9]/)?.[0];
      return `🔧 Sunucu hatası${code ? ` (${code})` : ''}! Lütfen birkaç dakika bekleyip tekrar deneyin.`;
    }
  },
  {
    pattern: /service.*unavailable|maintenance.*mode|temporarily.*unavailable/i,
    translate: () => "⚙️ Servis geçici olarak kullanılamıyor (bakım modu). Lütfen daha sonra tekrar deneyin."
  },
  {
    pattern: /network.*error|connection.*fail|cannot.*connect|ECONNREFUSED|ETIMEDOUT/i,
    translate: () => "🌐 Ağ bağlantı hatası! İnternet bağlantınızı kontrol edin."
  },

  // Task Creation & Processing Errors
  {
    pattern: /task.*creation.*fail|cannot.*create.*task|failed.*to.*start/i,
    translate: () => "❌ İşlem başlatılamadı! Lütfen ayarlarınızı kontrol edip tekrar deneyin."
  },
  {
    pattern: /task.*fail|generation.*fail|processing.*fail/i,
    translate: () => "⚠️ İşlem başarısız oldu! Lütfen farklı ayarlarla veya farklı bir prompt ile tekrar deneyin."
  },
  {
    pattern: /task.*cancelled|generation.*cancelled/i,
    translate: () => "🚫 İşlem iptal edildi veya zaman aşımına uğradı."
  },

  // Prompt Errors
  {
    pattern: /prompt.*too.*long|text.*too.*long|maximum.*character|exceed.*5000/i,
    translate: (match) => {
      const limit = match?.[0].match(/(\d+)/)?.[1] || "2000";
      return `📝 Prompt çok uzun! Maksimum ${limit} karakter olmalıdır.`;
    }
  },
  {
    pattern: /prompt.*empty|prompt.*required|missing.*prompt/i,
    translate: () => "✍️ Prompt boş olamaz! Lütfen ne istediğinizi açıklayın."
  },
  {
    pattern: /prompt.*invalid|malformed.*prompt/i,
    translate: () => "❓ Geçersiz prompt formatı! Lütfen düzgün bir açıklama girin."
  },

  // Video Specific Errors
  {
    pattern: /video.*too.*long|duration.*exceed|maximum.*duration/i,
    translate: (match) => {
      const duration = match?.[0].match(/(\d+)\s*(?:second|saniye|s)/)?.[1] || "30";
      return `⏰ Video süresi çok uzun! Maksimum ${duration} saniye olmalıdır.`;
    }
  },
  {
    pattern: /video.*resolution.*low|video.*quality.*low/i,
    translate: () => "📹 Video çözünürlüğü çok düşük! Minimum 720x720 piksel gereklidir."
  },
  {
    pattern: /codec.*not.*support|video.*format.*not.*support/i,
    translate: () => "🎬 Video formatı desteklenmiyor! Lütfen MP4, MOV veya WebM kullanın."
  },
  {
    pattern: /audio.*not.*support|audio.*codec.*fail/i,
    translate: () => "🔊 Ses formatı desteklenmiyor veya ses işlenemedi."
  },
  {
    pattern: /frame.*rate.*invalid|fps.*invalid/i,
    translate: () => "🎞️ Geçersiz kare hızı! Video 24-60 FPS arasında olmalıdır."
  },

  // Credit & Payment Errors
  {
    pattern: /insufficient.*credit|not.*enough.*credit|balance.*low/i,
    translate: () => "💳 Yetersiz kredi! Lütfen kredi paketlerine göz atın."
  },
  {
    pattern: /payment.*required|subscription.*required/i,
    translate: () => "💰 Bu özellik için ödeme gereklidir. Lütfen premium'a geçin."
  },

  // Model-Specific Errors
  {
    pattern: /flux.*not.*available|flux.*error/i,
    translate: () => "⚡ Flux modeli şu anda kullanılamıyor. Lütfen farklı bir model seçin."
  },
  {
    pattern: /seedream.*not.*available|seedream.*error/i,
    translate: () => "🌱 Seedream modeli şu anda kullanılamıyor. Lütfen farklı bir model seçin."
  },
  {
    pattern: /kling.*not.*available|kling.*error/i,
    translate: () => "🎥 Kling modeli şu anda kullanılamıyor. Lütfen farklı bir model seçin."
  },
  {
    pattern: /veo.*not.*available|veo.*error/i,
    translate: () => "🎬 Veo modeli şu anda kullanılamıyor. Lütfen farklı bir model seçin."
  },

  // Generic Fallback
  {
    pattern: /.*/,
    translate: (match) => {
      // Eğer orijinal mesaj kısaysa ve anlamlıysa, başına emoji ekle
      const msg = match?.[0] || "";
      if (msg.length < 100 && !msg.includes("error") && !msg.includes("fail")) {
        return `⚠️ ${msg}`;
      }
      return "❌ Bir hata oluştu. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.";
    }
  }
];

/**
 * API'den gelen hata mesajını Türkçe'ye çevirir
 * @param errorMessage API'den gelen orijinal hata mesajı
 * @param errorType Hata tipi (opsiyonel: API_ERROR, TIMEOUT, CONTENT_POLICY vb.)
 * @returns Türkçe hata mesajı
 */
export function translateApiError(errorMessage: string, errorType?: string): string {
  if (!errorMessage) {
    return "Bilinmeyen bir hata oluştu.";
  }

  // Eğer error type prefix varsa, temizle
  const cleanMessage = errorMessage.replace(/^(API_ERROR|TIMEOUT|CONTENT_POLICY|NETWORK_ERROR|API_LIMIT)\s*[-:]\s*/i, '');

  // En uygun çeviriyi bul
  for (const translation of errorTranslations) {
    const match = cleanMessage.match(translation.pattern);
    if (match) {
      return translation.translate(match);
    }
  }

  // Fallback
  return cleanMessage || "Bir hata oluştu. Lütfen tekrar deneyin.";
}

/**
 * Error type'ı algıla ve Türkçe kategori döndür
 */
export function categorizeError(errorMessage: string): {
  type: "CONTENT_POLICY" | "TIMEOUT" | "API_LIMIT" | "FILE_ERROR" | "AUTH_ERROR" | "SERVER_ERROR" | "NETWORK_ERROR" | "CREDIT_ERROR" | "UNKNOWN";
  userFriendlyType: string;
} {
  const message = errorMessage.toLowerCase();

  if (message.includes("nsfw") || message.includes("violence") || message.includes("content policy")) {
    return { type: "CONTENT_POLICY", userFriendlyType: "İçerik Politikası İhlali" };
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return { type: "TIMEOUT", userFriendlyType: "Zaman Aşımı" };
  }
  if (message.includes("rate limit") || message.includes("quota") || message.includes("too many")) {
    return { type: "API_LIMIT", userFriendlyType: "API Limiti" };
  }
  if (message.includes("file") || message.includes("size") || message.includes("format") || message.includes("unavailable")) {
    return { type: "FILE_ERROR", userFriendlyType: "Dosya Hatası" };
  }
  if (message.includes("api key") || message.includes("unauthorized") || message.includes("authentication")) {
    return { type: "AUTH_ERROR", userFriendlyType: "Kimlik Doğrulama Hatası" };
  }
  if (message.includes("server error") || message.includes("internal error") || /50[0-9]/.test(message)) {
    return { type: "SERVER_ERROR", userFriendlyType: "Sunucu Hatası" };
  }
  if (message.includes("network") || message.includes("connection")) {
    return { type: "NETWORK_ERROR", userFriendlyType: "Ağ Hatası" };
  }
  if (message.includes("credit") || message.includes("balance")) {
    return { type: "CREDIT_ERROR", userFriendlyType: "Kredi Hatası" };
  }

  return { type: "UNKNOWN", userFriendlyType: "Bilinmeyen Hata" };
}

/**
 * Hata mesajını kullanıcı dostu formata çevirir (UI için)
 */
export function formatErrorForUser(errorMessage: string): {
  title: string;
  message: string;
  actionButton?: string;
  actionUrl?: string;
} {
  const category = categorizeError(errorMessage);
  const translatedMessage = translateApiError(errorMessage);

  switch (category.type) {
    case "CONTENT_POLICY":
      return {
        title: "İçerik Politikası İhlali",
        message: translatedMessage,
        actionButton: "Topluluk Kurallarını Görüntüle",
        actionUrl: "/terms"
      };

    case "TIMEOUT":
      return {
        title: "İşlem Zaman Aşımına Uğradı",
        message: translatedMessage,
        actionButton: "Tekrar Dene"
      };

    case "API_LIMIT":
      return {
        title: "API Limiti Aşıldı",
        message: translatedMessage + " Birkaç dakika sonra tekrar deneyin."
      };

    case "CREDIT_ERROR":
      return {
        title: "Yetersiz Kredi",
        message: translatedMessage,
        actionButton: "Kredi Satın Al",
        actionUrl: "/packages"
      };

    case "FILE_ERROR":
      return {
        title: "Dosya Hatası",
        message: translatedMessage
      };

    case "AUTH_ERROR":
      return {
        title: "Kimlik Doğrulama Hatası",
        message: "Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar giriş yapın.",
        actionButton: "Giriş Yap"
      };

    case "SERVER_ERROR":
      return {
        title: "Sunucu Hatası",
        message: translatedMessage + " Sorun devam ederse lütfen destek ekibiyle iletişime geçin."
      };

    case "NETWORK_ERROR":
      return {
        title: "Bağlantı Hatası",
        message: translatedMessage
      };

    default:
      return {
        title: "Bir Hata Oluştu",
        message: translatedMessage
      };
  }
}
