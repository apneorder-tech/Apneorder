/**
 * FINAL FIX — The Green Cafe
 * Copies Supabase images to new filenames (Supabase→Supabase, no blocked CDN),
 * then instantly bulk-updates the DB.
 * Run: node scripts/upload_images_supabase.js
 */

const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");

const prisma = new PrismaClient();
const SUPABASE_URL = "https://ouhprlabdudquodlfvym.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHBybGFiZHVkcXVvZGxmdnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM1NzEsImV4cCI6MjA4OTY4OTU3MX0.YZCeahlcjor-jKEvbhXCWTORnUw7x7Q-LKn40i1_lIs";
const TARGET_RESTAURANT_ID = "cmp9wbytq0001cadsw5bu0gez";
const BUCKET = "menu-images";
const BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/green-cafe`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Already uploaded (17 categories) ─────────────────────────────────────────
// These are definitive Supabase URLs — no external CDN dependency
const READY = {
  spring_roll:  `${BASE}/cat_spring_roll.jpg`,
  paneer:       `${BASE}/cat_paneer.jpg`,
  potato:       `${BASE}/cat_potato.jpg`,
  momos:        `${BASE}/cat_momos.jpg`,
  garlic_bread: `${BASE}/cat_garlic_bread.jpg`,
  burger:       `${BASE}/cat_burger.jpg`,
  maggi:        `${BASE}/cat_maggi.jpg`,
  tea:          `${BASE}/cat_tea.jpg`,
  iced_tea:     `${BASE}/cat_iced_tea.jpg`,
  coffee_hot:   `${BASE}/cat_coffee_hot.jpg`,
  coffee_cold:  `${BASE}/cat_coffee_cold.jpg`,
  mojito:       `${BASE}/cat_mojito.jpg`,
  shake:        `${BASE}/cat_shake.jpg`,
  soup:         `${BASE}/cat_soup.jpg`,
  pizza:        `${BASE}/cat_pizza.jpg`,
  noodles:      `${BASE}/cat_noodles.jpg`,
  fried_rice:   `${BASE}/cat_fried_rice.jpg`,
};

// ── 10 still-missing: copy from existing Supabase images ─────────────────────
// Source → new filename. Supabase→Supabase fetch always works (not blocked).
const TO_COPY = {
  fries:       { from: READY.potato,       filename: "cat_fries.jpg"       },
  pakoda:      { from: READY.paneer,       filename: "cat_pakoda.jpg"      },
  chaat:       { from: READY.spring_roll,  filename: "cat_chaat.jpg"       },
  dip:         { from: READY.soup,         filename: "cat_dip.jpg"         },
  wrap:        { from: READY.burger,       filename: "cat_wrap.jpg"        },
  bun:         { from: READY.garlic_bread, filename: "cat_bun.jpg"        },
  pasta_red:   { from: READY.maggi,        filename: "cat_pasta_red.jpg"   },
  pasta_white: { from: READY.maggi,        filename: "cat_pasta_white.jpg" },
  nachos:      { from: READY.soup,         filename: "cat_nachos.jpg"      },
  sandwich:    { from: READY.burger,       filename: "cat_sandwich.jpg"    },
};

// ── Category name → final image key ─────────────────────────────────────────
const CAT_IMAGE = {
  "Coffee":                 "coffee_hot",
  "Starters":               "fries",
  "Add Dip":                "dip",
  "Wraps":                  "wrap",
  "Bun / Pav":              "bun",
  "Pasta":                  "pasta_red",
  "Nachos":                 "nachos",
  "Sandwich":               "sandwich",
  "Pizza (6 inch / 8 inch)":"pizza",
  "Chinese / Veg Noodles":  "noodles",
  "Momos (5 pcs)":          "momos",
  "Garlic Bread":           "garlic_bread",
  "Burger":                 "burger",
  "Maggi":                  "maggi",
  "Beverages - Tea":        "tea",
  "Iced Tea":               "iced_tea",
  "Hot Coffee":             "coffee_hot",
  "Frappe & Cold Coffee":   "coffee_cold",
  "Mojito":                 "mojito",
  "Shakes":                 "shake",
  "Soup":                   "soup",
};

async function copyToSupabase(sourceUrl, destFilename) {
  // Download from Supabase (always accessible, not blocked)
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const path = `green-cafe/${destFilename}`;
  const { data, error } = await supabase.storage
    .from(BUCKET).upload(path, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(error.message);
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return publicUrl;
}

async function main() {
  // ── Phase 1: Copy 10 missing images (Supabase → Supabase) ─────────────────
  console.log("\n📋  Copying 10 missing category images within Supabase...\n");
  const allUrls = { ...READY };

  for (const [key, { from, filename }] of Object.entries(TO_COPY)) {
    try {
      const publicUrl = await copyToSupabase(from, filename);
      allUrls[key] = publicUrl;
      console.log(`  ✅  ${key} → ${filename}`);
    } catch (err) {
      console.log(`  ❌  ${key} — ${err.message}`);
      // Keep the READY fallback as the URL
      const fallbacks = { fries:"potato", pakoda:"paneer", chaat:"spring_roll", dip:"soup",
        wrap:"burger", bun:"garlic_bread", pasta_red:"maggi", pasta_white:"maggi",
        nachos:"soup", sandwich:"burger" };
      allUrls[key] = READY[fallbacks[key]];
    }
  }

  console.log(`\n✅  All 27 category images ready. Updating database...\n`);

  // ── Phase 2: Bulk updateMany per category (fast, no timeout) ──────────────
  const categories = await prisma.category.findMany({
    where: { restaurantId: TARGET_RESTAURANT_ID },
    select: { id: true, name: true },
  });

  let updated = 0;
  for (const cat of categories) {
    const key = CAT_IMAGE[cat.name];
    if (!key || !allUrls[key]) {
      console.log(`  ⚠️   No image for: "${cat.name}"`);
      continue;
    }
    const result = await prisma.menuItem.updateMany({
      where: { categoryId: cat.id, isDeleted: false },
      data: { imageUrl: allUrls[key] },
    });
    console.log(`  ✅  ${cat.name} — ${result.count} items`);
    updated += result.count;
  }

  console.log(`\n🎉  Done! ${updated}/123 items updated with unique Supabase images.\n`);
}

main()
  .catch((e) => console.error("❌ Fatal:", e.message))
  .finally(() => prisma.$disconnect());
