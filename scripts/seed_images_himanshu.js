/**
 * IMAGE RE-SEEDER — The Green Cafe
 * Uses Pexels CDN — publicly accessible, no auth, no hotlink block.
 * Run: node scripts/seed_images_himanshu.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TARGET_RESTAURANT_ID = "cmp9wbytq0001cadsw5bu0gez";

// Pexels CDN URLs — these are permanently public and hotlink-friendly.
// Each photo ID is a real Pexels photo of that food type.
const IMAGE_MAP = {
  // ── Starters ──────────────────────────────────────────────────────────────
  "Salted Fries":                   "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Peri Peri Fries with Dip":       "https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Pakoda":                   "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Masala French Fries":             "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mix Veg Pakoda":                  "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Burst Fries":              "https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Corn Chaat":               "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Peanut Chaat":                    "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Dips ─────────────────────────────────────────────────────────────────
  "Jalapeno Cheese Dip":             "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Dip":                      "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tandoori Dip":                    "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Garlic Dip":                      "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Wraps ─────────────────────────────────────────────────────────────────
  "Aloo Tikki Wrap":                 "https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Wrap":                     "https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chinese Wrap":                    "https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mexican Wrap":                    "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Bun / Pav ─────────────────────────────────────────────────────────────
  "Maska Bun":                       "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Masala Bun":                      "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Bun":                      "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Pasta ─────────────────────────────────────────────────────────────────
  "Arrabiata Pasta (Red)":           "https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Baked Pasta (Red)":        "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Alfredo Pasta (White)":           "https://images.pexels.com/photos/3890122/pexels-photo-3890122.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Baked White Pasta":        "https://images.pexels.com/photos/3890122/pexels-photo-3890122.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Pink Sauce Pasta":                "https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Nachos ────────────────────────────────────────────────────────────────
  "Salsa Nachos":                    "https://images.pexels.com/photos/1108775/pexels-photo-1108775.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Baked Nachos":             "https://images.pexels.com/photos/1108775/pexels-photo-1108775.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Loaded Nachos":            "https://images.pexels.com/photos/1108775/pexels-photo-1108775.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Sandwich ──────────────────────────────────────────────────────────────
  "Cold Sandwich":                   "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Cheese Sandwich":             "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tandoori Paneer Sandwich":        "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Tikka Sandwich":           "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sweet Corn Sandwich":             "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Sandwich":        "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Pizza ─────────────────────────────────────────────────────────────────
  "Margherita Pizza":                "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Corn Cheese Pizza":               "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400",
  "OTC (Veg) Pizza":                 "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Italian Pizza":                   "https://images.pexels.com/photos/1219656/pexels-photo-1219656.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Tikka Pizza":              "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Pizza":           "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Chinese / Noodles ─────────────────────────────────────────────────────
  "Veg Chowmein":                    "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hakka Noodles":                   "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chilli Garlic Noodles":           "https://images.pexels.com/photos/3731217/pexels-photo-3731217.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Singapore (Paneer) Noodles":      "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Spring Roll":                     "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Fried Rice":                  "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Punjabi Chatpati Chowmein":       "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chilli Potato":                   "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Honey Chilli Potato":             "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Peri Peri Fried Rice":            "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Dry Chilly Paneer":               "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Schezwan Fried Rice":             "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Fried Rice":               "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sweet Corn Fried Rice":           "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Fried Rice":      "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Chowmein":        "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hara Chilly Paneer":              "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Momos ─────────────────────────────────────────────────────────────────
  "Veg Momos - Steam":               "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Momos - Fried":               "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Momos - Tandoori / Kurkure":  "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Momos - Steam":            "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Momos - Fried":            "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Momos - Tandoori / Kurkure": "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Corn Momos - Steam":       "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Corn Momos - Fried":       "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Corn Momos - Tandoori / Kurkure": "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Garlic Bread ──────────────────────────────────────────────────────────
  "Cheese Garlic Bread":             "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mexican Garlic Bread":            "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tandoori Paneer Garlic Bread":    "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Garlic Bread":    "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Burger ────────────────────────────────────────────────────────────────
  "Aloo Tikki Burger":               "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Burger":                      "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Burger":                   "https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tandoori Burger":                 "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Burger":                   "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mexican Burger":                  "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Maggi ─────────────────────────────────────────────────────────────────
  "Simple Masala Maggi":             "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Masala Maggi":                "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Chatpati Maggi":           "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sweet Corn Maggi":                "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheese Burst Baked Maggi":        "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Tea ───────────────────────────────────────────────────────────────────
  "Normal Tea":                      "https://images.pexels.com/photos/1490323/pexels-photo-1490323.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Kulhad Chai":                     "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Masala Chai":                     "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Ginger Tea":                      "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Ginger Honey Tea":                "https://images.pexels.com/photos/1490323/pexels-photo-1490323.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Lemon & Honey Tea":               "https://images.pexels.com/photos/1490323/pexels-photo-1490323.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Green Tea":                       "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Green Tea with Honey":            "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400",
  "SPL Night Watch + Biscuit":       "https://images.pexels.com/photos/1490323/pexels-photo-1490323.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Iced Tea ──────────────────────────────────────────────────────────────
  "Lemon Mint Iced Tea":             "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Peach Iced Tea":                  "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Orange Iced Tea":                 "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Litchi Iced Tea":                 "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Hot Coffee ────────────────────────────────────────────────────────────
  "Classic Hot Coffee":              "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Butterscotch Hot Coffee SPL":     "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Vanilla Hot Coffee SPL":          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hazelnut Hot Coffee SPL":         "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Black Coffee":                    "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Americano Hot Coffee":            "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Americano Cold Coffee":           "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Hot Coffee":      "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Frappe & Cold Coffee ──────────────────────────────────────────────────
  "Cold Coffee":                     "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cold Coffee with Ice Cream":      "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Butterscotch Cold Coffee SPL":    "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Vanilla Cold Coffee SPL":         "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hazelnut Cold Coffee SPL":        "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Night Watch SPL Cold Coffee":     "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Brownie Cold Coffee":             "https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Mojito ────────────────────────────────────────────────────────────────
  "Fresh Lemon Soda":                "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Fresh Lemon Pani":                "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Virgin Mojito Green":             "https://images.pexels.com/photos/4051380/pexels-photo-4051380.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Apple Mojito":                    "https://images.pexels.com/photos/4051380/pexels-photo-4051380.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Watermelon Mojito":               "https://images.pexels.com/photos/4051380/pexels-photo-4051380.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Strawberry Mojito":               "https://images.pexels.com/photos/4051380/pexels-photo-4051380.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Blue Lagoon Mojito":              "https://images.pexels.com/photos/4051380/pexels-photo-4051380.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Shakes ────────────────────────────────────────────────────────────────
  "Oreo Shake":                      "https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=400",
  "KitKat Shake":                    "https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Brownie Shake":                   "https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Dark Chocolate Shake":            "https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Butterscotch Shake":              "https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=400",

  // ── Soup ──────────────────────────────────────────────────────────────────
  "Tomato Soup":                     "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Manchow Soup":                    "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hot and Sour Soup":               "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400",
};

async function main() {
  const categories = await prisma.category.findMany({
    where: { restaurantId: TARGET_RESTAURANT_ID },
    include: { menuItems: { where: { isDeleted: false } } },
  });

  let updated = 0, skipped = 0;
  console.log(`\n🖼️   Re-assigning images (Pexels CDN) for The Green Cafe...\n`);

  for (const cat of categories) {
    console.log(`  📂  ${cat.name}`);
    for (const item of cat.menuItems) {
      const imageUrl = IMAGE_MAP[item.name];
      if (imageUrl) {
        await prisma.menuItem.update({ where: { id: item.id }, data: { imageUrl } });
        console.log(`      ✅  ${item.name}`);
        updated++;
      } else {
        console.log(`      ⚠️   No mapping: "${item.name}"`);
        skipped++;
      }
    }
  }
  console.log(`\n🎉  Done! ${updated} updated, ${skipped} skipped.\n`);
}

main()
  .catch((e) => console.error("❌ Error:", e.message))
  .finally(() => prisma.$disconnect());
