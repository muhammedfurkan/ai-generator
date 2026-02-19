/**
 * Seed script: site_logo_url and site_favicon_url settings
 * Run with: npx tsx scripts/seed-logo-favicon.ts
 */
import { getDb } from "../server/db";
import { siteSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const LOGO_FAVICON_SETTINGS = [
  {
    key: "site_logo_url",
    value: "/Logo-01.png",
    category: "general" as const,
    label: "Site Logosu",
    description: "Header'da gösterilen ana logo. PNG, SVG veya WebP önerilir.",
    inputType: "image" as const,
    isPublic: 1,
  },
  {
    key: "site_favicon_url",
    value: "/Logo-02.png",
    category: "general" as const,
    label: "Favicon",
    description:
      "Tarayıcı sekmesinde gösterilen ikon. ICO, PNG veya SVG (32x32px önerilir).",
    inputType: "image" as const,
    isPublic: 1,
  },
];

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  for (const setting of LOGO_FAVICON_SETTINGS) {
    const [existing] = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.key, setting.key));

    if (existing) {
      console.log(`[skip] ${setting.key} already exists (id=${existing.id})`);
    } else {
      await db.insert(siteSettings).values(setting);
      console.log(`[created] ${setting.key}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
