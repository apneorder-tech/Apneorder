/**
 * DB-ONLY UPDATE — The Green Cafe
 * Hardcodes all distinct Supabase URLs and immediately bulk-updates the DB.
 * No external network calls — connects to DB and updates instantly.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TARGET_RESTAURANT_ID = "cmp9wbytq0001cadsw5bu0gez";
const BASE = "https://ouhprlabdudquodlfvym.supabase.co/storage/v1/object/public/menu-images/green-cafe";

// Distinct category images now hosted on Supabase Storage
const CAT_IMAGE_URL = {
  "Starters":                `${BASE}/cat_potato.jpg`,
  "Add Dip":                 `${BASE}/cat_soup.jpg`,
  "Wraps":                   `${BASE}/cat_wrap.jpg`,
  "Bun / Pav":               `${BASE}/cat_bun.jpg`,
  "Pasta":                   `${BASE}/cat_pasta_red.jpg`,
  "Nachos":                  `${BASE}/cat_nachos.jpg`,
  "Sandwich":                `${BASE}/cat_sandwich.jpg`,
  "Pizza (6 inch / 8 inch)": `${BASE}/cat_pizza.jpg`,
  "Chinese / Veg Noodles":   `${BASE}/cat_noodles.jpg`,
  "Momos (5 pcs)":           `${BASE}/cat_momos.jpg`,
  "Garlic Bread":            `${BASE}/cat_garlic_bread.jpg`,
  "Burger":                  `${BASE}/cat_burger.jpg`,
  "Maggi":                   `${BASE}/cat_maggi.jpg`,
  "Beverages - Tea":         `${BASE}/cat_tea.jpg`,
  "Iced Tea":                `${BASE}/cat_iced_tea.jpg`,
  "Hot Coffee":              `${BASE}/cat_coffee_hot.jpg`,
  "Frappe & Cold Coffee":    `${BASE}/cat_coffee_cold.jpg`,
  "Mojito":                  `${BASE}/cat_mojito.jpg`,
  "Shakes":                  `${BASE}/cat_shake.jpg`,
  "Soup":                    `${BASE}/cat_soup.jpg`,
  "Coffee":                  `${BASE}/cat_coffee_hot.jpg`,
};

// Also specific item overrides where appropriate
const ITEM_OVERRIDES = {
  // Chinese item overrides
  "Veg Fried Rice":             `${BASE}/cat_fried_rice.jpg`,
  "Peri Peri Fried Rice":        `${BASE}/cat_fried_rice.jpg`,
  "Schezwan Fried Rice":         `${BASE}/cat_fried_rice.jpg`,
  "Paneer Fried Rice":           `${BASE}/cat_fried_rice.jpg`,
  "Sweet Corn Fried Rice":       `${BASE}/cat_fried_rice.jpg`,
  "Night Watch SPL Fried Rice":  `${BASE}/cat_fried_rice.jpg`,
  "Spring Roll":                 `${BASE}/cat_spring_roll.jpg`,
  "Dry Chilly Paneer":           `${BASE}/cat_paneer.jpg`,
  "Hara Chilly Paneer":          `${BASE}/cat_paneer.jpg`,
  "Chilli Potato":               `${BASE}/cat_potato.jpg`,
  "Honey Chilli Potato":         `${BASE}/cat_potato.jpg`,

  // Starters item overrides
  "Paneer Pakoda":               `${BASE}/cat_paneer.jpg`,
  "Mix Veg Pakoda":              `${BASE}/cat_paneer.jpg`,
  "Paneer Corn Chaat":           `${BASE}/cat_paneer.jpg`,
  "Peanut Chaat":                `${BASE}/cat_paneer.jpg`,
};

async function main() {
  console.log("\n🖼️  Updating all category images in DB...\n");

  const categories = await prisma.category.findMany({
    where: { restaurantId: TARGET_RESTAURANT_ID },
    include: { menuItems: { where: { isDeleted: false } } },
  });

  let categoryUpdates = 0;
  let itemOverrides = 0;

  for (const cat of categories) {
    const defaultUrl = CAT_IMAGE_URL[cat.name];
    if (defaultUrl) {
      const res = await prisma.menuItem.updateMany({
        where: { categoryId: cat.id, isDeleted: false },
        data: { imageUrl: defaultUrl },
      });
      console.log(`  ✅ Category: ${cat.name} (${res.count} items -> ${defaultUrl.split('/').pop()})`);
      categoryUpdates += res.count;
    }

    // Apply specific item overrides
    for (const item of cat.menuItems) {
      if (ITEM_OVERRIDES[item.name]) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { imageUrl: ITEM_OVERRIDES[item.name] },
        });
        itemOverrides++;
      }
    }
  }

  console.log(`\n🎉 Done! ${categoryUpdates} items updated by category, ${itemOverrides} item overrides applied.\n`);
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(() => prisma.$disconnect());
