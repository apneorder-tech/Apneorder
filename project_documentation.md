# 🍽️ Apneorder: Comprehensive Project Documentation

## 🚀 1. Project Overview
Apneorder is a high-end, real-time restaurant management and digital ordering system. It bridges the gap between physical dining and digital convenience, allowing customers to order via QR codes and managers to track every aspect of their business from a premium, data-rich dashboard.

---

## 🔄 2. End-to-End User Flow

### 🛒 Customer Journey
1. **Entry**: Customer scans a table-specific **QR Code** (e.g., Table 2).
2. **Browsing**: Arrives at the digital menu, filtered by categories (e.g., Starters, Main Course).
3. **Selection**: Adds items to a persistent cart with real-time price calculation.
4. **Checkout**: chooses between **Online Payment** (Cashfree/UPI) or **Pay-with-Cash**.
5. **Placement**: Order is sent instantly to the kitchen via **Supabase Realtime**.
6. **Tracking**: Customer sees live status updates (Pending → Preparing → Ready).

### 👔 Manager/Admin Journey
1. **Dashboard**: Manager monitors live stats (Today's Sales, Active Orders, Table Fill Rate).
2. **Order Management**: 
   - **Verifying**: Approves cash payments or checks online status.
   - **Kitchen**: Moves orders through the cooking pipeline (Start Cooking → Ready).
   - **Completion**: Marks orders as completed, which updates the **Daily Analytics**.
3. **Menu Management**: Categorizes dishes, sets prices, and toggles "In-Stock" visibility.
4. **Layout Control**: Generates new tables and prints unique QR codes.
5. **Business Intelligence**: Reviews weekly/monthly/yearly sales trends with advanced Shadcn charts.

---

## ✅ 3. Implemented Features

### 💻 Core Infrastructure
- **Real-time Sync**: Full PostgreSQL change tracking via Supabase for zero-delay order updates.
- **Hybrid Payments**: Integrated Cashfree for UPI/Cards and a "Confirm-on-Receipt" system for Cash.
- **High-Fidelity UI**: Built with Next.js 15, Tailwind CSS, and Framer Motion for a fluid, mobile-first experience.

### 📊 Advanced Analytics
- **Multi-Timeframe Charts**: Dynamic switching between Weekly, Monthly, and Yearly data.
- **Calendar Alignment**: Yearly charts consistently start from January for standard reporting.
- **Interactive Tooltips**: Professional Shadcn-based 'Cursor-Follow' interactions for granular data inspection.
- **Top Dishes Breakdown**: Auto-calculates the most popular items based on real sales volume.

### 📋 Manager Tools
- **Table/QR Suite**: Numerical sorting for tables (1, 2, 10...) and high-quality QR generation.
- **Unified Grids**: Consistent, professional card layouts across all order and management views.
- **Search & Filter**: Instant search for menu items and table-filtered menu views.

---

## 🛠️ 4. Technical Optimizations Needed

1. **Asset Optimization**: 
   - Implement **Next/Image** more aggressively for restaurant banners to reduce LCP.
   - Use image compression for menu item thumbnails.
2. **Database Performance**:
   - Add indexing for `restaurantId` and `createdAt` on the `Orders` table as history grows.
   - Implement **Tanstack Query** (React Query) for client-side caching of menu data.
3. **Bundle Polishing**:
   - Optimize heavy dependencies like `framer-motion` and `lucide-react` via tree-shaking and dynamic imports.

---

## 🗓️ 5. The Future Roadmap (Pending Tasks)

1. **Staff Roles**: Separate "Waiter" and "Chef" views with restricted permissions.
2. **Inventory Stock Management**: Precise tracking of ingredient quantities with low-stock alerts.
3. **Customer Loyalty**: Accounts for customers to view order history and earn rewards.
4. **Multi-Restaurant SaaS**: Architectural support for managers owning multiple restaurants under one login.
5. **Printing API**: Direct integration with thermal kitchen printers for physical kOT generation.

---
*Documentation Version: 1.0.0*
