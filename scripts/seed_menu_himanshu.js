/**
 * MENU SEEDER - The Green Cafe
 * Target Restaurant ID: cmp9wbytq0001cadsw5bu0gez
 *
 * Run from project root:
 *   node scripts/seed_menu_himanshu.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TARGET_RESTAURANT_ID = "cmp9wbytq0001cadsw5bu0gez"; // The Green Cafe
const YO_RESTAURANT_ID = "cmnkicobb00019kpidj84x5wg";     // cleanup partial seed

const MENU = [
  {
    category: "Starters",
    items: [
      { name: "Salted Fries", price: 80, type: "veg" },
      { name: "Peri Peri Fries with Dip", price: 120, type: "veg" },
      { name: "Paneer Pakoda", price: 130, type: "veg" },
      { name: "Masala French Fries", price: 100, type: "veg" },
      { name: "Mix Veg Pakoda", price: 110, type: "veg" },
      { name: "Cheese Burst Fries", price: 150, type: "veg" },
      { name: "Paneer Corn Chaat", price: 150, type: "veg" },
      { name: "Peanut Chaat", price: 100, type: "veg" },
    ],
  },
  {
    category: "Add Dip",
    items: [
      { name: "Jalapeno Cheese Dip", price: 35, type: "veg" },
      { name: "Cheese Dip", price: 25, type: "veg" },
      { name: "Tandoori Dip", price: 25, type: "veg" },
      { name: "Garlic Dip", price: 25, type: "veg" },
    ],
  },
  {
    category: "Wraps",
    items: [
      { name: "Aloo Tikki Wrap", price: 120, type: "veg" },
      { name: "Paneer Wrap", price: 140, type: "veg" },
      { name: "Chinese Wrap", price: 150, type: "veg" },
      { name: "Mexican Wrap", price: 150, type: "veg" },
    ],
  },
  {
    category: "Bun / Pav",
    items: [
      { name: "Maska Bun", price: 40, type: "veg" },
      { name: "Masala Bun", price: 60, type: "veg" },
      { name: "Cheese Bun", price: 80, type: "veg" },
    ],
  },
  {
    category: "Pasta",
    items: [
      { name: "Arrabiata Pasta (Red)", price: 160, type: "veg" },
      { name: "Cheese Baked Pasta (Red)", price: 200, type: "veg" },
      { name: "Alfredo Pasta (White)", price: 180, type: "veg" },
      { name: "Cheese Baked White Pasta", price: 200, type: "veg" },
      { name: "Pink Sauce Pasta", price: 200, type: "veg" },
    ],
  },
  {
    category: "Nachos",
    items: [
      { name: "Salsa Nachos", price: 90, type: "veg" },
      { name: "Cheese Baked Nachos", price: 120, type: "veg" },
      { name: "Cheese Loaded Nachos", price: 140, type: "veg" },
    ],
  },
  {
    category: "Sandwich",
    items: [
      { name: "Cold Sandwich", price: 80, type: "veg" },
      { name: "Veg Cheese Sandwich", price: 120, type: "veg" },
      { name: "Tandoori Paneer Sandwich", price: 120, type: "veg" },
      { name: "Paneer Tikka Sandwich", price: 150, type: "veg" },
      { name: "Sweet Corn Sandwich", price: 140, type: "veg" },
      { name: "Night Watch SPL Sandwich", price: 150, type: "veg" },
    ],
  },
  {
    category: "Pizza (6 inch / 8 inch)",
    items: [
      { name: "Margherita Pizza", price: 150, type: "veg" },
      { name: "Corn Cheese Pizza", price: 180, type: "veg" },
      { name: "OTC (Veg) Pizza", price: 190, type: "veg" },
      { name: "Italian Pizza", price: 230, type: "veg" },
      { name: "Paneer Tikka Pizza", price: 250, type: "veg" },
      { name: "Night Watch SPL Pizza", price: 280, type: "veg" },
    ],
  },
  {
    category: "Chinese / Veg Noodles",
    items: [
      { name: "Veg Chowmein", price: 120, type: "veg" },
      { name: "Hakka Noodles", price: 140, type: "veg" },
      { name: "Chilli Garlic Noodles", price: 140, type: "veg" },
      { name: "Singapore (Paneer) Noodles", price: 150, type: "veg" },
      { name: "Spring Roll", price: 110, type: "veg" },
      { name: "Veg Fried Rice", price: 110, type: "veg" },
      { name: "Punjabi Chatpati Chowmein", price: 130, type: "veg" },
      { name: "Chilli Potato", price: 160, type: "veg" },
      { name: "Honey Chilli Potato", price: 140, type: "veg" },
      { name: "Peri Peri Fried Rice", price: 150, type: "veg" },
      { name: "Dry Chilly Paneer", price: 190, type: "veg" },
      { name: "Schezwan Fried Rice", price: 130, type: "veg" },
      { name: "Paneer Fried Rice", price: 150, type: "veg" },
      { name: "Sweet Corn Fried Rice", price: 150, type: "veg" },
      { name: "Night Watch SPL Fried Rice", price: 180, type: "veg" },
      { name: "Night Watch SPL Chowmein", price: 180, type: "veg" },
      { name: "Hara Chilly Paneer", price: 210, type: "veg" },
    ],
  },
  {
    category: "Momos (5 pcs)",
    items: [
      { name: "Veg Momos - Steam", price: 90, type: "veg" },
      { name: "Veg Momos - Fried", price: 110, type: "veg" },
      { name: "Veg Momos - Tandoori / Kurkure", price: 140, type: "veg" },
      { name: "Paneer Momos - Steam", price: 120, type: "veg" },
      { name: "Paneer Momos - Fried", price: 140, type: "veg" },
      { name: "Paneer Momos - Tandoori / Kurkure", price: 160, type: "veg" },
      { name: "Cheese Corn Momos - Steam", price: 120, type: "veg" },
      { name: "Cheese Corn Momos - Fried", price: 140, type: "veg" },
      { name: "Cheese Corn Momos - Tandoori / Kurkure", price: 160, type: "veg" },
    ],
  },
  {
    category: "Garlic Bread",
    items: [
      { name: "Cheese Garlic Bread", price: 120, type: "veg" },
      { name: "Mexican Garlic Bread", price: 120, type: "veg" },
      { name: "Tandoori Paneer Garlic Bread", price: 150, type: "veg" },
      { name: "Night Watch SPL Garlic Bread", price: 210, type: "veg" },
    ],
  },
  {
    category: "Burger",
    items: [
      { name: "Aloo Tikki Burger", price: 70, type: "veg" },
      { name: "Veg Burger", price: 90, type: "veg" },
      { name: "Cheese Burger", price: 100, type: "veg" },
      { name: "Tandoori Burger", price: 110, type: "veg" },
      { name: "Paneer Burger", price: 120, type: "veg" },
      { name: "Mexican Burger", price: 120, type: "veg" },
    ],
  },
  {
    category: "Maggi",
    items: [
      { name: "Simple Masala Maggi", price: 80, type: "veg" },
      { name: "Veg Masala Maggi", price: 100, type: "veg" },
      { name: "Paneer Chatpati Maggi", price: 140, type: "veg" },
      { name: "Sweet Corn Maggi", price: 120, type: "veg" },
      { name: "Cheese Burst Baked Maggi", price: 150, type: "veg" },
    ],
  },
  {
    category: "Beverages - Tea",
    items: [
      { name: "Normal Tea", price: 25, type: "veg" },
      { name: "Kulhad Chai", price: 30, type: "veg" },
      { name: "Masala Chai", price: 35, type: "veg" },
      { name: "Ginger Tea", price: 35, type: "veg" },
      { name: "Ginger Honey Tea", price: 49, type: "veg" },
      { name: "Lemon & Honey Tea", price: 50, type: "veg" },
      { name: "Green Tea", price: 50, type: "veg" },
      { name: "Green Tea with Honey", price: 60, type: "veg" },
      { name: "SPL Night Watch + Biscuit", price: 70, type: "veg" },
    ],
  },
  {
    category: "Iced Tea",
    items: [
      { name: "Lemon Mint Iced Tea", price: 90, type: "veg" },
      { name: "Peach Iced Tea", price: 99, type: "veg" },
      { name: "Orange Iced Tea", price: 99, type: "veg" },
      { name: "Litchi Iced Tea", price: 99, type: "veg" },
    ],
  },
  {
    category: "Hot Coffee",
    items: [
      { name: "Classic Hot Coffee", price: 50, type: "veg" },
      { name: "Butterscotch Hot Coffee SPL", price: 60, type: "veg" },
      { name: "Vanilla Hot Coffee SPL", price: 60, type: "veg" },
      { name: "Hazelnut Hot Coffee SPL", price: 60, type: "veg" },
      { name: "Black Coffee", price: 50, type: "veg" },
      { name: "Americano Hot Coffee", price: 60, type: "veg" },
      { name: "Americano Cold Coffee", price: 70, type: "veg" },
      { name: "Night Watch SPL Hot Coffee", price: 70, type: "veg" },
    ],
  },
  {
    category: "Frappe & Cold Coffee",
    items: [
      { name: "Cold Coffee", price: 80, type: "veg" },
      { name: "Cold Coffee with Ice Cream", price: 100, type: "veg" },
      { name: "Butterscotch Cold Coffee SPL", price: 90, type: "veg" },
      { name: "Vanilla Cold Coffee SPL", price: 90, type: "veg" },
      { name: "Hazelnut Cold Coffee SPL", price: 90, type: "veg" },
      { name: "Night Watch SPL Cold Coffee", price: 120, type: "veg" },
      { name: "Brownie Cold Coffee", price: 120, type: "veg" },
    ],
  },
  {
    category: "Mojito",
    items: [
      { name: "Fresh Lemon Soda", price: 80, type: "veg" },
      { name: "Fresh Lemon Pani", price: 70, type: "veg" },
      { name: "Virgin Mojito Green", price: 100, type: "veg" },
      { name: "Apple Mojito", price: 100, type: "veg" },
      { name: "Watermelon Mojito", price: 100, type: "veg" },
      { name: "Strawberry Mojito", price: 100, type: "veg" },
      { name: "Blue Lagoon Mojito", price: 100, type: "veg" },
    ],
  },
  {
    category: "Shakes",
    items: [
      { name: "Oreo Shake", price: 120, type: "veg" },
      { name: "KitKat Shake", price: 120, type: "veg" },
      { name: "Brownie Shake", price: 150, type: "veg" },
      { name: "Dark Chocolate Shake", price: 120, type: "veg" },
      { name: "Butterscotch Shake", price: 100, type: "veg" },
    ],
  },
  {
    category: "Soup",
    items: [
      { name: "Tomato Soup", price: 90, type: "veg" },
      { name: "Manchow Soup", price: 99, type: "veg" },
      { name: "Hot and Sour Soup", price: 99, type: "veg" },
    ],
  },
];

async function main() {
  // ── Step 1: Clean up accidental partial seed from "yo" ──────────
  console.log("🧹  Cleaning up accidental items from 'yo' restaurant...");
  const partialCats = await prisma.category.findMany({
    where: {
      restaurantId: YO_RESTAURANT_ID,
      name: { in: ["Starters", "Add Dip"] },
    },
    select: { id: true, name: true },
  });

  for (const cat of partialCats) {
    await prisma.menuItem.deleteMany({ where: { categoryId: cat.id } });
    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`  🗑️   Removed accidental category: ${cat.name}`);
  }

  if (partialCats.length === 0) {
    console.log("  ✅  Nothing to clean up.\n");
  } else {
    console.log("  ✅  Cleanup done.\n");
  }

  // ── Step 2: Seed The Green Cafe ─────────────────────────────────
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: TARGET_RESTAURANT_ID },
    select: { id: true, name: true },
  });

  if (!restaurant) {
    console.error("❌  Target restaurant not found!");
    return;
  }

  console.log(`🍽️   Seeding menu for: ${restaurant.name} (${restaurant.id})`);
  console.log(`📋   Categories: ${MENU.length}  |  Items: ${MENU.reduce((a, c) => a + c.items.length, 0)}\n`);

  let totalItems = 0;

  for (const section of MENU) {
    const category = await prisma.category.create({
      data: { name: section.category, restaurantId: restaurant.id },
    });

    for (const item of section.items) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          type: item.type,
          isAvailable: true,
          categoryId: category.id,
        },
      });
      totalItems++;
    }

    console.log(`  ✅  ${section.category} — ${section.items.length} items`);
  }

  console.log(`\n🎉  Done! ${totalItems} items across ${MENU.length} categories added to "${restaurant.name}".`);
}

main()
  .catch((e) => console.error("❌ Error:", e.message))
  .finally(() => prisma.$disconnect());
