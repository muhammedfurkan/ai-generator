#!/usr/bin/env python3
"""
Refactor LogoGenerator.tsx to use i18n translations
"""

def main():
    filepath = "client/src/pages/LogoGenerator.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Industry labels
    industries = {
        "Teknoloji": "logo.industry.technology",
        "Yiyecek & İçecek": "logo.industry.food",
        "Moda & Giyim": "logo.industry.fashion",
        "Sağlık & Wellness": "logo.industry.health",
        "Finans & Bankacılık": "logo.industry.finance",
        "Eğitim": "logo.industry.education",
        "Eğlence & Medya": "logo.industry.entertainment",
        "Spor & Fitness": "logo.industry.sports",
        "Güzellik & Kozmetik": "logo.industry.beauty",
        "Otomotiv": "logo.industry.automotive",
        "Emlak": "logo.industry.realestate",
        "Seyahat & Turizm": "logo.industry.travel",
        "Oyun": "logo.industry.gaming",
        "Müzik": "logo.industry.music",
        "Sanat & Tasarım": "logo.industry.art",
        "Çevre & Sürdürülebilirlik": "logo.industry.eco",
        "Evcil Hayvan": "logo.industry.pet",
        "Hukuk": "logo.industry.legal",
        "İnşaat": "logo.industry.construction",
        "Diğer": "logo.industry.other",
    }
    
    for tr_text, key in industries.items():
        content = content.replace(f'label: "{tr_text}"', f'label: t("{key}")')
    
    # Style labels and descriptions
    styles = [
        ("Minimal", "logo.style.minimal", "Sade ve temiz tasarım", "logo.style.minimal.desc"),
        ("Modern", "logo.style.modern", "Çağdaş ve yenilikçi", "logo.style.modern.desc"),
        ("Vintage", "logo.style.vintage", "Klasik ve nostaljik", "logo.style.vintage.desc"),
        ("Lüks", "logo.style.luxury", "Premium ve prestijli", "logo.style.luxury.desc"),
        ("Eğlenceli", "logo.style.playful", "Renkli ve dinamik", "logo.style.playful.desc"),
        ("Kurumsal", "logo.style.corporate", "Profesyonel ve güvenilir", "logo.style.corporate.desc"),
        ("El Çizimi", "logo.style.handdrawn", "Organik ve samimi", "logo.style.handdrawn.desc"),
        ("Geometrik", "logo.style.geometric", "Şekil bazlı tasarım", "logo.style.geometric.desc"),
        ("3D", "logo.style.3d", "Üç boyutlu efekt", "logo.style.3d.desc"),
        ("Gradient", "logo.style.gradient", "Renk geçişli", "logo.style.gradient.desc"),
        ("Maskot", "logo.style.mascot", "Karakter bazlı", "logo.style.mascot.desc"),
        ("Harf Logo", "logo.style.lettermark", "Baş harflerden oluşan", "logo.style.lettermark.desc"),
    ]
    
    for label, label_key, desc, desc_key in styles:
        content = content.replace(f'label: "{label}", description: "{desc}"', f'label: t("{label_key}"), description: t("{desc_key}")')
    
    # Color palette labels and moods
    colors = [
        ("Mavi Tonları", "logo.colors.blue", "Güven, Profesyonellik", "logo.colors.blue.mood"),
        ("Kırmızı Tonları", "logo.colors.red", "Enerji, Tutku", "logo.colors.red.mood"),
        ("Yeşil Tonları", "logo.colors.green", "Doğa, Büyüme", "logo.colors.green.mood"),
        ("Mor Tonları", "logo.colors.purple", "Yaratıcılık, Lüks", "logo.colors.purple.mood"),
        ("Turuncu Tonları", "logo.colors.orange", "Enerji, Sıcaklık", "logo.colors.orange.mood"),
        ("Altın & Siyah", "logo.colors.gold", "Premium, Prestij", "logo.colors.gold.mood"),
        ("Pastel Tonlar", "logo.colors.pastel", "Yumuşak, Samimi", "logo.colors.pastel.mood"),
        ("Neon Renkler", "logo.colors.neon", "Modern, Dikkat Çekici", "logo.colors.neon.mood"),
        ("Toprak Tonları", "logo.colors.earth", "Doğal, Organik", "logo.colors.earth.mood"),
        ("Siyah & Beyaz", "logo.colors.monochrome", "Klasik, Zamansız", "logo.colors.monochrome.mood"),
        ("Turkuaz Tonları", "logo.colors.teal", "Ferah, Güvenilir", "logo.colors.teal.mood"),
        ("Özel Renk", "logo.colors.custom", "Kişiselleştirilmiş", "logo.colors.custom.mood"),
    ]
    
    for label, label_key, mood, mood_key in colors:
        content = content.replace(f'label: "{label}"', f'label: t("{label_key}")')
        content = content.replace(f'mood: "{mood}"', f'mood: t("{mood_key}")')
    
    # Icon type labels and descriptions
    icon_types = [
        ("Soyut Şekil", "logo.iconType.abstract", "Geometrik veya organik soyut form", "logo.iconType.abstract.desc"),
        ("Sembol", "logo.iconType.symbol", "Anlamlı bir ikon veya sembol", "logo.iconType.symbol.desc"),
        ("Baş Harf", "logo.iconType.initial", "Marka adının baş harfi", "logo.iconType.initial.desc"),
        ("Sadece Yazı", "logo.iconType.wordmark", "İkonsuz, tipografi odaklı", "logo.iconType.wordmark.desc"),
        ("Kombinasyon", "logo.iconType.combination", "İkon + yazı birlikte", "logo.iconType.combination.desc"),
        ("Amblem", "logo.iconType.emblem", "Çerçeve içinde logo", "logo.iconType.emblem.desc"),
    ]
    
    for label, label_key, desc, desc_key in icon_types:
        content = content.replace(f'label: "{label}", description: "{desc}"', f'label: t("{label_key}"), description: t("{desc_key}")')
    
    # Steps
    content = content.replace('{ step: 2, label: "Sektör & Stil", icon: Building2 }', '{ step: 2, label: t("logo.steps.industry"), icon: Building2 }')
    content = content.replace('{ step: 3, label: "Renk & İkon", icon: Palette }', '{ step: 3, label: t("logo.steps.colors"), icon: Palette }')
    content = content.replace('{ step: 4, label: "Oluştur", icon: Sparkles }', '{ step: 4, label: t("logo.steps.generate"), icon: Sparkles }')
    
    # Placeholders
    content = content.replace('placeholder="Örn: TechVision, Lezzet Durağı"', 'placeholder={t("logo.placeholder.companyName")}')
    content = content.replace('placeholder="Örn: Geleceği Şekillendiriyoruz"', 'placeholder={t("logo.placeholder.slogan")}')
    content = content.replace('placeholder="Logoda olmasını istediğiniz özel detaylar..."', 'placeholder={t("logo.placeholder.details")}')
    
    # Error messages
    content = content.replace('const errorMessage = error instanceof Error ? error.message : "Logo oluşturma başarısız";', 'const errorMessage = error instanceof Error ? error.message : t("logo.error.generationFailed");')
    content = content.replace('toast.error("İndirme başarısız");', 'toast.error(t("logo.error.downloadFailed"));')
    
    # Instructions
    content = content.replace('Tüm adımları tamamlayıp "Logo Oluştur" butonuna tıklayın', '{t("logo.instructions")}')
    
    # Write the modified content back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("LogoGenerator.tsx refactored successfully!")

if __name__ == "__main__":
    main()
