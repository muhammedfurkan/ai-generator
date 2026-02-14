#!/usr/bin/env python3
"""
Refactor Packages.tsx and Gallery.tsx to use i18n translation keys
"""

def refactor_packages():
    file_path = "client/src/pages/Packages.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Packages already has useLanguage imported, just need to add t() in DEFAULT_PACKAGES and DEFAULT_FAQS
    
    # Replace package names and descriptions
    replacements = [
        # Starter package
        ('name: "Başlangıç",', 'name: t("packages.default.starter.name"),'),
        ('description: "AI görsel dünyasına ilk adımınız",', 'description: t("packages.default.starter.description"),'),
        ('features: ["300 kredi", "1K kalitede 30 görsel", "Temel destek"],', 
         'features: [t("packages.default.starter.feature1"), t("packages.default.starter.feature2"), t("packages.default.starter.feature3")],'),
        
        # Standard package
        ('name: "Standart",', 'name: t("packages.default.standard.name"),'),
        ('description: "Düzenli kullanıcılar için ideal paket",', 'description: t("packages.default.standard.description"),'),
        ('features: ["750 kredi", "1K kalitede 75 görsel", "Öncelikli destek"],',
         'features: [t("packages.default.standard.feature1"), t("packages.default.standard.feature2"), t("packages.default.standard.feature3")],'),
        
        # Professional package
        ('name: "Profesyonel",', 'name: t("packages.default.professional.name"),'),
        ('description: "İçerik üreticileri için en popüler seçim",', 'description: t("packages.default.professional.description"),'),
        ('features: ["2200 kredi", "Tüm kalitelerde görsel", "7/24 destek"],',
         'features: [t("packages.default.professional.feature1"), t("packages.default.professional.feature2"), t("packages.default.professional.feature3")],'),
        ('badge: "En Popüler",', 'badge: t("packages.default.professional.badge"),'),
        
        # Enterprise package
        ('name: "Kurumsal",', 'name: t("packages.default.enterprise.name"),'),
        ('description: "Ajanslar ve büyük ekipler için",', 'description: t("packages.default.enterprise.description"),'),
        ('features: ["4000 kredi", "VIP destek", "Özel temsilci"],',
         'features: [t("packages.default.enterprise.feature1"), t("packages.default.enterprise.feature2"), t("packages.default.enterprise.feature3")],'),
        
        # FAQs
        ('question: "Kredi ne kadar süre geçerli?",', 'question: t("packages.faq.question1"),'),
        ('"Satın aldığınız krediler hesabınızda kalıcı olarak depolanır. Süresi sınırsızdır.",',
         't("packages.faq.answer1"),'),
        
        ('question: "Ödeme nasıl yapılır?",', 'question: t("packages.faq.question2"),'),
        ('"\\"Kredi Yükle\\" butonuna tıkladıktan sonra WhatsApp üzerinden ödeme detaylarını paylaşacağız.",',
         't("packages.faq.answer2"),'),
        
        ('question: "Ödeme sonrası kredi ne zaman yüklenir?",', 'question: t("packages.faq.question3"),'),
        ('"Ödeme onaylandıktan sonra kredi 5 dakika içinde hesabınıza yüklenir.",',
         't("packages.faq.answer3"),'),
        
        ('question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",', 'question: t("packages.faq.question4"),'),
        ('"Havale/EFT, kredi kartı ve mobil ödeme yöntemlerini kabul ediyoruz.",',
         't("packages.faq.answer4"),'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Need to ensure t is available in DEFAULT_PACKAGES scope - move them inside component or use a function
    # Actually, we need to convert DEFAULT_PACKAGES to a function that takes t
    
    # Let's add a comment noting that DEFAULT_PACKAGES now uses t()
    # The arrays will need t() available when they're defined, so we need to refactor differently
    
    # Better approach: Replace the entire DEFAULT_PACKAGES and DEFAULT_FAQS with functions
    # But that's more complex. Let's just replace the strings in place and ensure t is imported at module level
    # Actually, t() can't be used at module level. We need to convert to functions.
    
    # Simpler: Just wrap in a function getDefaultPackages(t)
    content = content.replace(
        'const DEFAULT_PACKAGES = [',
        'const getDefaultPackages = (t: (key: string) => string) => ['
    )
    content = content.replace(
        '  },\n];',
        '  },\n];\n\nconst DEFAULT_PACKAGES = getDefaultPackages((key) => key);',
        1  # Only first occurrence
    )
    
    content = content.replace(
        'const DEFAULT_FAQS = [',
        'const getDefaultFaqs = (t: (key: string) => string) => ['
    )
    # Find the closing of DEFAULT_FAQS
    content = content.replace(
        '  },\n];\n\nconst ICONS',
        '  },\n];\n\nconst DEFAULT_FAQS = getDefaultFaqs((key) => key);\n\nconst ICONS'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Packages.tsx refactored successfully!")

def refactor_gallery():
    file_path = "client/src/pages/Gallery.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Gallery already has useLanguage imported
    # Just replace the model name mappings
    
    replacements = [
        ('product_promo: "Ürün Tanıtım",', 'product_promo: t("gallery.model.productPromo"),'),
        ('ugc_ad: "UGC Reklam",', 'ugc_ad: t("gallery.model.ugcAd"),'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Gallery.tsx refactored successfully!")

if __name__ == "__main__":
    refactor_packages()
    refactor_gallery()
    print("\n✅ Packages and Gallery refactored successfully!")
