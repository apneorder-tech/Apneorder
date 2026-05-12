export interface Order {
  id: string;
  tableNumber: string;
  totalAmount: number;
  status: "payment_pending" | "pending" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: string;
  paymentMethod?: string;
  transactionId?: string;
  customerPhone?: string | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string | null;  // Special instructions e.g. "Extra spicy, no onions"
  }[];
}

export interface ManageMenuItem {
  id: string;
  name: string;
  price: number;
  costPrice?: number | null;
  isAvailable: boolean;
  type: "veg" | "non-veg";
  description?: string;
  prepTimeMinutes?: number | null;
}

export interface ItemProfitData {
  id: string;
  name: string;
  type: string;
  price: number;
  costPrice: number;
  margin: number;           // 0–100 %
  quantitySold: number;
  profitContribution: number; // (price - costPrice) × quantitySold
}

export interface ManageCategory {
  id: string;
  name: string;
  menuItems: ManageMenuItem[];
}

export interface ManageTable {
  id: string;
  tableNumber: string;
  restaurantId: string;
}

export interface WaiterCall {
  id: string;
  restaurantId: string;
  tableNumber: string;
  isAcknowledged: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalSaleToday: number;
  salesWeekly: number;
  salesMonthly: number;
  salesAnnual: number;
  preparedTodayCount: number;
  tablesFilled: string;
  activeOrdersCount: number;
  topItems: { name: string; count: number; type: string }[];
  chartData: { date: string; sales: number }[];
  timeframes: {
    week: { chartData: { date: string; sales: number }[]; topItems: { name: string; count: number; type: string }[] };
    month: { chartData: { date: string; sales: number }[]; topItems: { name: string; count: number; type: string }[] };
    year: { chartData: { date: string; sales: number }[]; topItems: { name: string; count: number; type: string }[] };
  };
  profitData: {
    items: ItemProfitData[];
    totalProfitWeek: number;
    topProfitItem: ItemProfitData | null;
    lossLeaders: ItemProfitData[];
    itemsWithoutCost: number;
  } | null;
}
