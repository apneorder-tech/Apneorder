import { z } from "zod";

// --- Base Schemas ---
export const IdSchema = z.string().uuid().or(z.string().cuid());

// --- Restaurant & Onboarding ---
export const UpdateUpiSchema = z.object({
  restaurantId: z.string(),
  upiId: z.string().email("Invalid UPI ID format (must contain @)").min(3),
});

export const OnboardingSaveSchema = z.object({
  managerId: z.string(),
  phone: z.string().optional(),
  restaurantName: z.string().min(2, "Name too short"),
  ownerName: z.string().min(2, "Owner name too short"),
  city: z.string().min(2),
  address: z.string().min(5),
  upiId: z.string().optional(),
  themeColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  menuCategories: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({
      name: z.string(),
      price: z.number().or(z.string().transform(v => parseFloat(v))),
      type: z.enum(["veg", "non-veg"]),
    }))
  })),
  tableCount: z.string().or(z.number().transform(v => v.toString())),
});

// --- Menu Management ---
export const MenuCategoryCreateSchema = z.object({
    restaurantId: z.string(),
    name: z.string().min(1, "Category name required"),
});

export const MenuItemCreateSchema = z.object({
    name: z.string().min(1),
    price: z.number().nonnegative(),
    type: z.enum(["veg", "non-veg"]),
    description: z.string().optional(),
});

export const MenuItemUpdateSchema = z.object({
    name: z.string().optional(),
    price: z.number().nonnegative().optional(),
    isAvailable: z.boolean().optional(),
});

// --- Orders ---
export const OrderItemSchema = z.object({
    id: z.string(),
    quantity: z.number().int().positive(),
});

export const OrderCreateSchema = z.object({
    restaurantId: z.string(),
    tableNumber: z.string().or(z.number().transform(v => v.toString())),
    items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
    transactionId: z.string().optional().nullable(),
    paymentMethod: z.enum(["CASH", "ONLINE"]).optional().default("ONLINE"),
});

// --- Tables ---
export const AddTableSchema = z.object({
    restaurantId: z.string(),
    tableNumber: z.string().min(1),
});
