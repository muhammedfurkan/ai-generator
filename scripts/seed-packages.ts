import { getDb } from "../server/db";
import { creditPackages } from "../drizzle/schema";

const DEFAULT_PACKAGES = [
  {
    name: "Başlangıç",
    description: "AI görsel dünyasına ilk adımınız",
    credits: 300,
    price: "150.00",
    originalPrice: null,
    badge: null,
    features: JSON.stringify([
      "300 kredi",
      "1K kalitede 30 görsel",
      "Temel destek",
    ]),
    usage1k: 30,
    usage2k: 20,
    usage4k: 15,
    bonus: 0,
    sortOrder: 1,
    isActive: true,
    isHighlighted: false,
    shopierUrl: null,
  },
  {
    name: "Standart",
    description: "Düzenli kullanıcılar için ideal paket",
    credits: 750,
    price: "375.00",
    originalPrice: null,
    badge: null,
    features: JSON.stringify([
      "750 kredi",
      "1K kalitede 75 görsel",
      "Öncelikli destek",
    ]),
    usage1k: 75,
    usage2k: 50,
    usage4k: 37,
    bonus: 0,
    sortOrder: 2,
    isActive: true,
    isHighlighted: false,
    shopierUrl: null,
  },
  {
    name: "Profesyonel",
    description: "İçerik üreticileri için en popüler seçim",
    credits: 2200,
    price: "1100.00",
    originalPrice: null,
    badge: "En Popüler",
    features: JSON.stringify([
      "2200 kredi",
      "Tüm kalitelerde görsel",
      "7/24 destek",
    ]),
    usage1k: 220,
    usage2k: 146,
    usage4k: 110,
    bonus: 10, // %10 bonus
    sortOrder: 3,
    isActive: true,
    isHighlighted: true,
    shopierUrl: null,
  },
  {
    name: "Kurumsal",
    description: "Ajanslar ve büyük ekipler için",
    credits: 4000,
    price: "2000.00",
    originalPrice: null,
    badge: null,
    features: JSON.stringify(["4000 kredi", "VIP destek", "Özel temsilci"]),
    usage1k: 400,
    usage2k: 266,
    usage4k: 200,
    bonus: 15, // %15 bonus
    sortOrder: 4,
    isActive: true,
    isHighlighted: false,
    shopierUrl: null,
  },
];

async function seedPackages() {
  console.log("🌱 Seeding credit packages...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    // Check if packages already exist
    const existingPackages = await db.select().from(creditPackages);

    if (existingPackages.length > 0) {
      console.log(
        `⚠️  Database already has ${existingPackages.length} package(s).`
      );
      console.log("Choose an action:");
      console.log(
        "  - To clear and reseed, delete packages first via admin panel"
      );
      console.log("  - To add more, this script will insert new packages\n");

      console.log("Current packages:");
      console.table(
        existingPackages.map(pkg => ({
          ID: pkg.id,
          Name: pkg.name,
          Credits: pkg.credits,
          Price: pkg.price,
          Active: pkg.isActive ? "✓" : "✗",
        }))
      );
    }

    // Insert packages
    console.log("\n📦 Inserting default packages...\n");

    for (const pkg of DEFAULT_PACKAGES) {
      const [inserted] = await db
        .insert(creditPackages)
        .values(pkg)
        .$returningId();

      console.log(`✅ Inserted: ${pkg.name} (ID: ${inserted.id})`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log("🔗 Visit /packages to see the packages");
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      console.error("❌ Duplicate entry error. Packages may already exist.");
    } else {
      console.error("❌ Error:", error);
    }
    process.exit(1);
  }

  process.exit(0);
}

seedPackages();
