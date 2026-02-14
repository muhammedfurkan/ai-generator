#!/usr/bin/env python3
"""
Properly refactor LogoGenerator.tsx to use translation keys
This script will:
1. Add useLanguage import
2. Add t hook in component
3. Move all constant arrays inside component (after hook declarations)
4. Replace all Turkish strings with t() calls
"""

import re

def fix_logogenerator():
    with open("client/src/pages/LogoGenerator.tsx", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Step 1: Add useLanguage import after other imports
    if 'useLanguage' not in content:
        content = content.replace(
            'import { trpc } from "@/lib/trpc";',
            'import { trpc } from "@/lib/trpc";\nimport { useLanguage } from "@/contexts/LanguageContext";'
        )
    
    # Step 2: Find where component starts
    component_start = content.find("export default function LogoGenerator() {")
    component_end = len(content)
    
    # Extract before component and after component
    before_component = content[:component_start]
    component_body = content[component_start:component_end]
    
    # Step 3: Add t hook after other hooks in component
    # Find the line with useLocation hook
    component_body = component_body.replace(
        '  const [, navigate] = useLocation();',
        '  const [, navigate] = useLocation();\n  const { t } = useLanguage();'
    )
    
    # Step 4: Move INDUSTRIES array definition to inside component (after hooks)
    # Find where state declarations start
    state_start = component_body.find('  // Form state')
    
    # Insert arrays before form state
    arrays_code = '''
  // Sektör seçenekleri
  const INDUSTRIES = [
    { value: "technology", label: t("logo.industry.technology"), icon: "💻", keywords: "modern, dijital, yenilikçi" },
    { value: "food", label: t("logo.industry.food"), icon: "🍽️", keywords: "lezzetli, taze, sıcak" },
    { value: "fashion", label: t("logo.industry.fashion"), icon: "👗", keywords: "şık, trend, elegant" },
    { value: "health", label: t("logo.industry.health"), icon: "💚", keywords: "güvenilir, temiz, profesyonel" },
    { value: "finance", label: t("logo.industry.finance"), icon: "💰", keywords: "güvenli, kurumsal, prestijli" },
    { value: "education", label: t("logo.industry.education"), icon: "📚", keywords: "bilgi, gelişim, akademik" },
    { value: "entertainment", label: t("logo.industry.entertainment"), icon: "🎬", keywords: "eğlenceli, dinamik, renkli" },
    { value: "sports", label: t("logo.industry.sports"), icon: "⚽", keywords: "enerjik, güçlü, aktif" },
    { value: "beauty", label: t("logo.industry.beauty"), icon: "💄", keywords: "zarif, feminen, lüks" },
    { value: "automotive", label: t("logo.industry.automotive"), icon: "🚗", keywords: "hız, güç, teknoloji" },
    { value: "realestate", label: t("logo.industry.realestate"), icon: "🏠", keywords: "güvenilir, ev, yatırım" },
    { value: "travel", label: t("logo.industry.travel"), icon: "✈️", keywords: "macera, keşif, özgürlük" },
    { value: "gaming", label: t("logo.industry.gaming"), icon: "🎮", keywords: "eğlenceli, dinamik, genç" },
    { value: "music", label: t("logo.industry.music"), icon: "🎵", keywords: "ritim, ses, sanat" },
    { value: "art", label: t("logo.industry.art"), icon: "🎨", keywords: "yaratıcı, özgün, estetik" },
    { value: "eco", label: t("logo.industry.eco"), icon: "🌿", keywords: "yeşil, doğal, organik" },
    { value: "pet", label: t("logo.industry.pet"), icon: "🐾", keywords: "sevimli, sadık, dostça" },
    { value: "legal", label: t("logo.industry.legal"), icon: "⚖️", keywords: "adalet, güven, profesyonel" },
    { value: "construction", label: t("logo.industry.construction"), icon: "🏗️", keywords: "sağlam, güçlü, kaliteli" },
    { value: "other", label: t("logo.industry.other"), icon: "✨", keywords: "özel, benzersiz" },
  ];

  // Logo stilleri  
  const LOGO_STYLES = [
    { value: "minimal", label: t("logo.style.minimal"), description: t("logo.style.minimal.desc"), preview: "○" },
    { value: "modern", label: t("logo.style.modern"), description: t("logo.style.modern.desc"), preview: "◆" },
    { value: "vintage", label: t("logo.style.vintage"), description: t("logo.style.vintage.desc"), preview: "❋" },
    { value: "luxury", label: t("logo.style.luxury"), description: t("logo.style.luxury.desc"), preview: "♛" },
    { value: "playful", label: t("logo.style.playful"), description: t("logo.style.playful.desc"), preview: "★" },
    { value: "corporate", label: t("logo.style.corporate"), description: t("logo.style.corporate.desc"), preview: "■" },
    { value: "handdrawn", label: t("logo.style.handdrawn"), description: t("logo.style.handdrawn.desc"), preview: "✎" },
    { value: "geometric", label: t("logo.style.geometric"), description: t("logo.style.geometric.desc"), preview: "△" },
    { value: "3d", label: t("logo.style.3d"), description: t("logo.style.3d.desc"), preview: "◈" },
    { value: "gradient", label: t("logo.style.gradient"), description: t("logo.style.gradient.desc"), preview: "◐" },
    { value: "mascot", label: t("logo.style.mascot"), description: t("logo.style.mascot.desc"), preview: "☺" },
    { value: "lettermark", label: t("logo.style.lettermark"), description: t("logo.style.lettermark.desc"), preview: "A" },
  ];

  // Renk paletleri
  const COLOR_PALETTES = [
    { value: "blue", label: t("logo.colors.blue"), colors: ["#0066FF", "#0099FF", "#00CCFF", "#003366"], mood: t("logo.colors.blue.mood") },
    { value: "red", label: t("logo.colors.red"), colors: ["#FF0000", "#CC0000", "#FF3333", "#990000"], mood: t("logo.colors.red.mood") },
    { value: "green", label: t("logo.colors.green"), colors: ["#00CC66", "#009933", "#33FF99", "#006633"], mood: t("logo.colors.green.mood") },
    { value: "purple", label: t("logo.colors.purple"), colors: ["#9933FF", "#6600CC", "#CC66FF", "#660099"], mood: t("logo.colors.purple.mood") },
    { value: "orange", label: t("logo.colors.orange"), colors: ["#FF6600", "#FF9933", "#CC5500", "#FF8000"], mood: t("logo.colors.orange.mood") },
    { value: "gold", label: t("logo.colors.gold"), colors: ["#FFD700", "#C9A227", "#000000", "#333333"], mood: t("logo.colors.gold.mood") },
    { value: "pastel", label: t("logo.colors.pastel"), colors: ["#FFB6C1", "#87CEEB", "#98FB98", "#DDA0DD"], mood: t("logo.colors.pastel.mood") },
    { value: "neon", label: t("logo.colors.neon"), colors: ["#FF00FF", "#00FFFF", "#FFFF00", "#FF0080"], mood: t("logo.colors.neon.mood") },
    { value: "earth", label: t("logo.colors.earth"), colors: ["#8B4513", "#D2691E", "#DEB887", "#F5DEB3"], mood: t("logo.colors.earth.mood") },
    { value: "monochrome", label: t("logo.colors.monochrome"), colors: ["#000000", "#333333", "#666666", "#FFFFFF"], mood: t("logo.colors.monochrome.mood") },
    { value: "teal", label: t("logo.colors.teal"), colors: ["#008080", "#20B2AA", "#40E0D0", "#00CED1"], mood: t("logo.colors.teal.mood") },
    { value: "custom", label: t("logo.colors.custom"), colors: ["#CCFF00", "#FF00CC", "#00FFCC", "#CCCCCC"], mood: t("logo.colors.custom.mood") },
  ];

  // İkon tipleri
  const ICON_TYPES = [
    { value: "abstract", label: t("logo.iconType.abstract"), description: t("logo.iconType.abstract.desc") },
    { value: "symbol", label: t("logo.iconType.symbol"), description: t("logo.iconType.symbol.desc") },
    { value: "initial", label: t("logo.iconType.initial"), description: t("logo.iconType.initial.desc") },
    { value: "wordmark", label: t("logo.iconType.wordmark"), description: t("logo.iconType.wordmark.desc") },
    { value: "combination", label: t("logo.iconType.combination"), description: t("logo.iconType.combination.desc") },
    { value: "emblem", label: t("logo.iconType.emblem"), description: t("logo.iconType.emblem.desc") },
  ];

  // Çözünürlük seçenekleri
  const RESOLUTIONS = [
    { value: "1K", label: "1K", credits: 15, description: "512x512 px" },
    { value: "2K", label: "2K", credits: 22, description: "1024x1024 px" },
    { value: "4K", label: "4K", credits: 30, description: "2048x2048 px" },
  ];

'''
    
    # Insert arrays before form state
    if state_start != -1:
        component_body = component_body[:state_start] + arrays_code + component_body[state_start:]
    
    # Step 5: Remove old array definitions from before component
    # Find and remove INDUSTRIES definition
    industries_start = before_component.find("// Sektör seçenekleri\nconst INDUSTRIES")
    if industries_start != -1:
        # Find the end of INDUSTRIES array
        industries_end = before_component.find("];", industries_start) + 2
        # Find LOGO_STYLES start
        logo_styles_start = before_component.find("\n// Logo stilleri", industries_end)
        # Remove everything from INDUSTRIES to LOGO_STYLES
        if logo_styles_start != -1:
            before_component = before_component[:industries_start] + before_component[logo_styles_start+1:]
    
    # Remove LOGO_STYLES
    logo_styles_start = before_component.find("// Logo stilleri\nconst LOGO_STYLES")
    if logo_styles_start != -1:
        color_start = before_component.find("\n// Renk paletleri", logo_styles_start)
        if color_start != -1:
            before_component = before_component[:logo_styles_start] + before_component[color_start+1:]
    
    # Remove COLOR_PALETTES
    color_start = before_component.find("// Renk paletleri\nconst COLOR_PALETTES")
    if color_start != -1:
        icon_start = before_component.find("\n// İkon tipleri", color_start)
        if icon_start != -1:
            before_component = before_component[:color_start] + before_component[icon_start+1:]
    
    # Remove ICON_TYPES
    icon_start = before_component.find("// İkon tipleri\nconst ICON_TYPES")
    if icon_start != -1:
        res_start = before_component.find("\n// Çözünürlük seçenekleri", icon_start)
        if res_start != -1:
            before_component = before_component[:icon_start] + before_component[res_start+1:]
    
    # Remove RESOLUTIONS
    res_start = before_component.find("// Çözünürlük seçenekleri\nconst RESOLUTIONS")
    if res_start != -1:
        export_start = before_component.find("\nexport default function", res_start)
        if export_start != -1:
            before_component = before_component[:res_start] + before_component[export_start+1:]
    
    # Combine everything
    new_content = before_component.rstrip() + "\n\n" + component_body
    
    # Step 6: Replace Turkish UI strings with t() calls
    replacements = [
        ('Logo Oluşturucu', 't("logo.title")'),
        ('Profesyonel marka logosu tasarlayın', 't("logo.subtitle")'),
        ('Yükleniyor...', 't("logo.loading")'),
        ('"Marka Adı *"', 't("logo.companyName") + " *"'),
        ('"Sektör *"', 't("logo.industry") + " *"'),
        ('"Logo Stili *"', 't("logo.style") + " *"'),
        ('"Renk Paleti *"', 't("logo.colors") + " *"'),
        ('"İkon Tipi *"', 't("logo.iconType.title") + " *"'),
        ('logo başarıyla oluşturuldu!', 't("logo.success.generated", { count: results.length.toString() })'),
        ('"Logo indirildi!"', 't("logo.success.downloaded")'),
    ]
    
    for old, new in replacements:
        new_content = new_content.replace(old, new)
    
    with open("client/src/pages/LogoGenerator.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("✅ LogoGenerator.tsx refactored successfully!")

if __name__ == "__main__":
    fix_logogenerator()
