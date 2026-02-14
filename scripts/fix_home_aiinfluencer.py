#!/usr/bin/env python3
"""
Fix Home.tsx and AiInfluencer.tsx properly
"""

def fix_home():
    with open("client/src/pages/Home.tsx", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace AI_TOOLS and VIRAL_APPS arrays to use functions
    # Find AI_TOOLS array and replace
    ai_tools_start = content.find("// AI Araçları kategorileri\nconst AI_TOOLS = [")
    ai_tools_end = content.find("];", ai_tools_start) + 2
    
    viral_apps_start = content.find("// Viral uygulamalar\nconst VIRAL_APPS = [")
    viral_apps_end = content.find("];", viral_apps_start) + 2
    
    # Get the export default function line
    export_line = content.find("export default function Home() {")
    
    # Extract the component part
    before_tools = content[:ai_tools_start]
    after_apps = content[viral_apps_end:]
    
    # Create new content with functions inside component
    new_content = before_tools + """export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  // AI Araçları kategorileri
  const AI_TOOLS = [
    {
      id: "image-gen",
      title: t("home.tools.imageGen"),
      description: t("home.tools.imageGenDesc"),
      icon: Image,
      href: "/generate",
      color: "from-purple-500 to-pink-500",
      badge: t("home.badge.featured"),
    },
    {
      id: "video-gen",
      title: t("home.tools.videoGen"),
      description: t("home.tools.videoGenDesc"),
      icon: Video,
      href: "/video-generate",
      color: "from-blue-500 to-cyan-500",
      badge: t("home.badge.popular"),
    },
    {
      id: "motion-control",
      title: t("home.tools.motionControl"),
      description: t("home.tools.motionControlDesc"),
      icon: Video,
      href: "/motion-control",
      color: "from-purple-600 to-pink-600",
      badge: t("home.badge.new"),
    },
    {
      id: "ai-influencer",
      title: t("home.tools.aiInfluencer"),
      description: t("home.tools.aiInfluencerDesc"),
      icon: Users,
      href: "/ai-influencer",
      color: "from-rose-500 to-orange-500",
      badge: t("home.badge.new"),
    },
    {
      id: "upscale",
      title: t("home.tools.upscale"),
      description: t("home.tools.upscaleDesc"),
      icon: Zap,
      href: "/upscale",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "multi-angle",
      title: t("home.tools.multiAngle"),
      description: t("home.tools.multiAngleDesc"),
      icon: Camera,
      href: "/multi-angle",
      color: "from-amber-500 to-yellow-500",
      badge: t("home.badge.new"),
    },
    {
      id: "product-promo",
      title: t("home.tools.productPromo"),
      description: t("home.tools.productPromoDesc"),
      icon: Film,
      href: "/product-promo",
      color: "from-fuchsia-500 to-pink-500",
      badge: t("home.badge.new"),
    },
    {
      id: "logo-generator",
      title: t("home.tools.logoGenerator"),
      description: t("home.tools.logoGeneratorDesc"),
      icon: Palette,
      href: "/logo-generator",
      color: "from-yellow-500 to-lime-500",
      badge: t("home.badge.new"),
    },
    {
      id: "prompt-compiler",
      title: t("home.tools.promptMaster"),
      description: t("home.tools.promptMasterDesc"),
      icon: Wand2,
      href: "/prompt-compiler",
      color: "from-[#CCFF00] to-green-500",
      badge: t("home.badge.new"),
    },
  ];

  // Viral uygulamalar
  const VIRAL_APPS = [
    { id: "hug-video", title: t("home.viralApps.hug"), icon: "🤗", hot: true },
    { id: "kiss-video", title: t("home.viralApps.kiss"), icon: "💋", hot: true },
    { id: "dance-video", title: t("home.viralApps.dance"), icon: "💃", hot: true },
    { id: "talking-photo", title: t("home.viralApps.talkingPhoto"), icon: "🗣️" },
    { id: "age-transform", title: t("home.viralApps.ageTransform"), icon: "⏳", hot: true },
    { id: "style-transfer", title: t("home.viralApps.artStyle"), icon: "🎨" },
    { id: "hair-blow", title: t("home.viralApps.hairBlow"), icon: "💨", hot: true },
    { id: "smile-video", title: t("home.viralApps.smile"), icon: "😊", hot: true },
    { id: "wink-video", title: t("home.viralApps.wink"), icon: "😉" },
    { id: "zoom-effect", title: t("home.viralApps.dramaticZoom"), icon: "🔍" },
  ];

"""
    
    # Find where the component code resumes (after VIRAL_APPS)
    # Skip the old export default line and continue from there
    component_start = after_apps.find("export default function Home() {")
    if component_start != -1:
        # Skip to after the opening brace and variable declarations
        rest_of_component = after_apps[component_start:]
        # Find where the actual component logic starts (after all the consts)
        # Look for the trpc query which comes after the basic state
        trpc_query_pos = rest_of_component.find("// Topluluk AI karakterlerini getir")
        if trpc_query_pos != -1:
            new_content += rest_of_component[trpc_query_pos:]
        else:
            print("Warning: Could not find TRPC query marker")
            new_content += rest_of_component
    
    # Now replace all language conditionals with t() calls
    replacements = [
        ('{language === "tr" ? "YENİ NESİL AI ARAÇLARI" : "NEXT-GEN AI TOOLS"}', 't("home.hero.badge")'),
        ('{language === "tr" ? (\n                    <>Hayal Et, <span className="text-[#CCFF00]">AI Üretsin</span></>\n                  ) : (\n                    <>Imagine, <span className="text-[#CCFF00]">AI Creates</span></>\n                  )}', 't("home.hero.title")'),
        ('{language === "tr"\n                    ? "Profesyonel görseller, videolar ve AI karakterler oluşturun. Saniyeler içinde."\n                    : "Create professional images, videos and AI characters. In seconds."}', 't("home.hero.subtitle")'),
    ]
    
    for old, new in replacements:
        new_content = new_content.replace(old, new)
    
    # Handle the hero title specially with JSX
    new_content = new_content.replace(
        't("home.hero.title")',
        'language === "tr" ? (\n                    <>Hayal Et, <span className="text-[#CCFF00]">AI Üretsin</span></>\n                  ) : (\n                    <>Imagine, <span className="text-[#CCFF00]">AI Creates</span></>\n                  )'
    )
    
    with open("client/src/pages/Home.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("Home.tsx fixed!")

def fix_aiinfluencer():
    # AiInfluencer is already reverted, we just need to add translations properly
    with open("client/src/pages/AiInfluencer.tsx", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Add import
    if 'import { useLanguage } from "@/contexts/LanguageContext";' not in content:
        content = content.replace(
            'import { useState, useRef, useEffect } from "react";',
            'import { useState, useRef, useEffect } from "react";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    # Add hook inside component
    content = content.replace(
        '  const { user } = useAuth();',
        '  const { user } = useAuth();\n  const { t } = useLanguage();'
    )
    
    # Replace Turkish strings with t() calls
    replacements = [
        ('"Kredi bilgisi alınamadı, lütfen sayfayı yenileyin."', 't("aiInfluencer.errors.creditsNotLoaded")'),
        ('"Karakterler yüklenemedi, lütfen sayfayı yenileyin."', 't("aiInfluencer.errors.charactersNotLoaded")'),
        ('"Karakter silindi"', 't("aiInfluencer.success.characterDeleted")'),
        ('"Karakter silinemedi"', 't("aiInfluencer.errors.characterDeleteFailed")'),
        ('`Prompt üretildi: ${data.location}`', 't("aiInfluencer.success.promptGenerated", { location: data.location })'),
        ('"Oturumunuz sona ermiş. Lütfen sayfayı yenileyin veya tekrar giriş yapın."', 't("aiInfluencer.errors.sessionExpired")'),
        ('"Prompt üretilemedi"', 't("aiInfluencer.errors.promptFailed")'),
        ('data.isPublic ? "Karakter herkese açık yapıldı" : "Karakter gizli yapıldı"', 'data.isPublic ? t("aiInfluencer.success.characterPublic") : t("aiInfluencer.success.characterPrivate")'),
        ('"Paylaşım durumu değiştirilemedi"', 't("aiInfluencer.errors.shareStatusFailed")'),
        ('"Lütfen bir görsel dosyası seçin"', 't("aiInfluencer.errors.selectImageFile")'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open("client/src/pages/AiInfluencer.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("AiInfluencer.tsx fixed!")

if __name__ == "__main__":
    fix_home()
    fix_aiinfluencer()
    print("\n✅ Both files fixed successfully!")
