#!/usr/bin/env python3
"""
Refactor Home.tsx to use i18n translation keys
"""

def refactor_home():
    file_path = "client/src/pages/Home.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # AI_TOOLS array refactoring
    content = content.replace(
        'title: { tr: "AI GÖRSEL OLUŞTUR", en: "AI IMAGE GENERATOR" },',
        'title: t("home.tools.imageGen"),'
    )
    content = content.replace(
        'tr: "Nano Banana Pro ile profesyonel görseller",\n      en: "Professional images with Nano Banana Pro",\n    },',
        't("home.tools.imageGenDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "AI VİDEO OLUŞTUR", en: "AI VIDEO GENERATOR" },',
        'title: t("home.tools.videoGen"),'
    )
    content = content.replace(
        'tr: "Veo 3.1, Sora 2, Kling ile video",\n      en: "Videos with Veo 3.1, Sora 2, Kling",\n    },',
        't("home.tools.videoGenDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "MOTION CONTROL", en: "MOTION CONTROL" },',
        'title: t("home.tools.motionControl"),'
    )
    content = content.replace(
        'tr: "Gerçek hareket transferi ile video",\n      en: "Video with real motion transfer",\n    },',
        't("home.tools.motionControlDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "AI INFLUENCER", en: "AI INFLUENCER" },',
        'title: t("home.tools.aiInfluencer"),'
    )
    content = content.replace(
        'tr: "Kendi AI karakterinizi oluşturun",\n      en: "Create your own AI character",\n    },',
        't("home.tools.aiInfluencerDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "GÖRSEL UPSCALE", en: "IMAGE UPSCALE" },',
        'title: t("home.tools.upscale"),'
    )
    content = content.replace(
        'tr: "Düşük çözünürlüğü 8K\'ya yükselt",\n      en: "Upscale to 8K resolution",\n    },',
        't("home.tools.upscaleDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "ÇOKLU AÇI FOTOĞRAF", en: "MULTI-ANGLE PHOTO" },',
        'title: t("home.tools.multiAngle"),'
    )
    content = content.replace(
        'tr: "Tek fotoğraftan 4-8 farklı açı",\n      en: "4-8 angles from one photo",\n    },',
        't("home.tools.multiAngleDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "ÜRÜN TANITIM VİDEOSU", en: "PRODUCT PROMO VIDEO" },',
        'title: t("home.tools.productPromo"),'
    )
    content = content.replace(
        'tr: "E-ticaret için profesyonel promo",\n      en: "Professional promo for e-commerce",\n    },',
        't("home.tools.productPromoDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "LOGO OLUŞTURUCU", en: "LOGO GENERATOR" },',
        'title: t("home.tools.logoGenerator"),'
    )
    content = content.replace(
        'tr: "Profesyonel marka logosu tasarla",\n      en: "Design professional brand logos",\n    },',
        't("home.tools.logoGeneratorDesc"),\n    },'
    )
    
    content = content.replace(
        'title: { tr: "PROMPT USTASI", en: "PROMPT MASTER" },',
        'title: t("home.tools.promptMaster"),'
    )
    content = content.replace(
        'tr: "Türkçe yaz, profesyonel prompt al",\n      en: "Write Turkish, get pro prompts",\n    },',
        't("home.tools.promptMasterDesc"),\n    },'
    )
    
    # Badges
    content = content.replace('badge: "ÖNE ÇIKAN",', 'badge: t("home.badge.featured"),')
    content = content.replace('badge: "POPÜLER",', 'badge: t("home.badge.popular"),')
    content = content.replace('badge: "YENİ",', 'badge: t("home.badge.new"),')
    
    # VIRAL_APPS array refactoring
    content = content.replace(
        'title: { tr: "Sarılma", en: "Hug" },',
        'title: t("home.viralApps.hug"),'
    )
    content = content.replace(
        'title: { tr: "Öpücük", en: "Kiss" },',
        'title: t("home.viralApps.kiss"),'
    )
    content = content.replace(
        'title: { tr: "Dans", en: "Dance" },',
        'title: t("home.viralApps.dance"),'
    )
    content = content.replace(
        'title: { tr: "Konuşan Foto", en: "Talking Photo" },',
        'title: t("home.viralApps.talkingPhoto"),'
    )
    content = content.replace(
        'title: { tr: "Yaş Dönüşümü", en: "Age Transform" },',
        'title: t("home.viralApps.ageTransform"),'
    )
    content = content.replace(
        'title: { tr: "Sanat Stili", en: "Art Style" },',
        'title: t("home.viralApps.artStyle"),'
    )
    content = content.replace(
        'title: { tr: "Saç Uçuşması", en: "Hair Blow" },',
        'title: t("home.viralApps.hairBlow"),'
    )
    content = content.replace(
        'title: { tr: "Gülümseme", en: "Smile" },',
        'title: t("home.viralApps.smile"),'
    )
    content = content.replace(
        'title: { tr: "Göz Kırpma", en: "Wink" },',
        'title: t("home.viralApps.wink"),'
    )
    content = content.replace(
        'title: { tr: "Dramatik Zoom", en: "Dramatic Zoom" },',
        'title: t("home.viralApps.dramaticZoom"),'
    )
    
    # Other text replacements
    content = content.replace(
        '{language === "tr" ? "Araçları Keşfet" : "Explore Tools"}',
        '{t("home.exploreTools")}'
    )
    content = content.replace(
        '{language === "tr" ? "VİRAL VİDEO UYGULAMALARI" : "VIRAL VIDEO APPS"}',
        '{t("home.viralApps.title")}'
    )
    content = content.replace(
        '{language === "tr" ? "Tümünü Gör" : "View All"}',
        '{t("home.viewAll")}'
    )
    content = content.replace(
        'title="Telegram Duyuru Kanalı"',
        'title={t("home.telegramChannel")}'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Home.tsx refactored successfully!")

if __name__ == "__main__":
    refactor_home()
