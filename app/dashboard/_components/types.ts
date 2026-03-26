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
  }[];
}

export interface ManageMenuItem {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  type: "veg" | "non-veg";
  description?: string;
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
}
