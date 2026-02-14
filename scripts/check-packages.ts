import { getDb } from "../server/db";
import { creditPackages } from "../drizzle/schema";

async function checkPackages() {
  console.log("🔍 Checking credit packages in database...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    // Get all packages
    const allPackages = await db.select().from(creditPackages);
    console.log(`📦 Total packages: ${allPackages.length}\n`);

    if (allPackages.length === 0) {
      console.log("⚠️  No packages found in database!");
      console.log("💡 You may need to add packages via admin panel or seed script\n");
    } else {
      console.log("Packages:");
      console.table(
        allPackages.map((pkg) => ({
          ID: pkg.id,
          Name: pkg.name,
          Credits: pkg.credits,
          Price: pkg.price,
          Bonus: pkg.bonus || 0,
          Active: pkg.isActive ? "✓" : "✗",
          Highlighted: pkg.isHighlighted ? "⭐" : "",
          SortOrder: pkg.sortOrder,
        }))
      );

      const activePackages = allPackages.filter((p) => p.isActive);
      console.log(`\n✅ Active packages: ${activePackages.length}`);
      console.log(`❌ Inactive packages: ${allPackages.length - activePackages.length}`);

      if (activePackages.length === 0) {
        console.log("\n⚠️  WARNING: No active packages! Users cannot purchase credits.");
        console.log("💡 Activate at least one package in admin panel\n");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

checkPackages();
