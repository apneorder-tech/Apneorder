"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  Bell,
  Search,
  MoreVertical,
  Clock,
  XCircle,
  ChefHat,
  Loader2,
  QrCode,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// ─── Supabase Client ───
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ───
interface OrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string; type: string };
}

interface Order {
  id: string;
  table: { tableNumber: string };
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: string;
  orderItems: OrderItem[];
}

interface ManageMenuItem {
  id: string;
  name: string;
  price: number;
  type: string;
  isAvailable: boolean;
}

interface ManageCategory {
  id: string;
  name: string;
  menuItems: ManageMenuItem[];
}

// ─── Constants ───
const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  preparing: {
    label: "Preparing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  ready: {
    label: "Ready",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-zinc-50",
    text: "text-zinc-600",
    border: "border-zinc-200",
    dot: "bg-zinc-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
  },
} as const;

const NAV_ITEMS = [
  { id: "orders" as const, icon: LayoutDashboard, label: "Orders" },
  { id: "menu" as const, icon: UtensilsCrossed, label: "Menu" },
  { id: "analytics" as const, icon: BarChart3, label: "Analytics" },
  { id: "settings" as const, icon: Settings, label: "Settings" },
];

// ─── Helpers ───
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Subcomponents ───

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              "p-2 sm:p-2.5 rounded-xl bg-zinc-50 shrink-0",
              color
            )}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">
              {label}
            </p>
            <p className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight truncate">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderCard({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: Order["status"]) => void;
}) {
  return (
    <Card className="border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900 font-black text-sm shrink-0">
            T{order.table.tableNumber}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              #{order.id.slice(-4).toUpperCase()}
            </p>
            <p className="text-[10px] text-zinc-400 font-medium">
              {timeAgo(order.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="p-4 space-y-2">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                item.menuItem.type === "veg" ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-sm text-zinc-700 truncate">
              {item.menuItem.name}
            </span>
            <span className="text-xs text-zinc-400 shrink-0">
              ×{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-zinc-50/80 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total
          </span>
          <span className="text-base sm:text-lg font-black text-zinc-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        <div className="flex gap-2">
          {order.status === "pending" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "preparing")}
              className="flex-1 h-9 text-xs font-bold rounded-lg bg-zinc-900 hover:bg-zinc-800"
              size="sm"
            >
              <ChefHat size={14} className="mr-1.5" />
              Start Cooking
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "ready")}
              className="flex-1 h-9 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Check size={14} className="mr-1.5" />
              Mark Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "completed")}
              className="flex-1 h-9 text-xs font-bold rounded-lg bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Check size={14} className="mr-1.5" />
              Complete
            </Button>
          )}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              className="w-9 h-9 p-0 shrink-0 text-zinc-400 hover:text-red-500 hover:border-red-200"
              onClick={() => onStatusUpdate(order.id, "cancelled")}
            >
              <XCircle size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function MenuItemRow({
  item,
  isUpdating,
  onUpdateName,
  onUpdatePrice,
  onToggleAvailability,
  onDelete,
}: {
  item: ManageMenuItem;
  isUpdating: boolean;
  onUpdateName: (id: string, name: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-50/50 rounded-2xl border border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-lg transition-all duration-300">
        {/* Left: Item info */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-[3px] shrink-0 mt-1 sm:mt-0",
              item.type === "veg"
                ? "bg-green-500 border-green-200"
                : "bg-red-500 border-red-200"
            )}
          />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <input
              defaultValue={item.name}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && val !== item.name) onUpdateName(item.id, val);
              }}
              className="font-bold text-base sm:text-lg text-zinc-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full truncate"
              placeholder="Dish Name"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-zinc-100 shadow-sm">
                <span className="text-xs font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  defaultValue={item.price}
                  onBlur={(e) => {
                    const p = parseFloat(e.target.value);
                    if (!isNaN(p) && p !== item.price) onUpdatePrice(item.id, p);
                  }}
                  className="w-16 bg-transparent border-none p-0 text-sm font-bold text-zinc-800 focus:outline-none focus:ring-0"
                />
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                {item.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                item.isAvailable ? "text-green-600" : "text-zinc-400"
              )}
            >
              {item.isAvailable ? "Live" : "Sold Out"}
            </span>
            <button
              disabled={isUpdating}
              onClick={() => onToggleAvailability(item.id, item.isAvailable)}
              className={cn(
                "w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner",
                item.isAvailable
                  ? "bg-green-500 shadow-green-200"
                  : "bg-zinc-200 shadow-zinc-100"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md",
                  item.isAvailable ? "left-[22px]" : "left-0.5"
                )}
              />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 text-zinc-300 hover:text-red-500 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Delete &quot;{item.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this dish from your menu. Customers
              will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(item.id)}
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SidebarContent({
  activeView,
  setActiveView,
  restaurantName,
}: {
  activeView: string;
  setActiveView: (v: "orders" | "menu") => void;
  restaurantName: string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 lg:mb-12">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
          <UtensilsCrossed size={20} />
        </div>
        <span className="text-lg font-black tracking-tight text-zinc-900">
          APNE ORDER
        </span>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              (item.id === "orders" || item.id === "menu") &&
              setActiveView(item.id)
            }
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeView === item.id
                ? "bg-zinc-900 text-white shadow-lg"
                : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Store info */}
      <div className="mt-auto p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-200 rounded-full shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{restaurantName}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function DashboardPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [restaurantName, setRestaurantName] = useState("Your Restaurant");
  const [managerId, setManagerId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSaleToday: 0,
    preparedTodayCount: 0,
    tablesFilled: "0/0",
    activeOrdersCount: 0,
  });
  const [activeView, setActiveView] = useState<"orders" | "menu">("orders");
  const [menuCategories, setMenuCategories] = useState<ManageCategory[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dialog states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [initialDishName, setInitialDishName] = useState("");
  const [initialDishPrice, setInitialDishPrice] = useState("");

  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);
  const [addingToCategoryName, setAddingToCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemType, setNewItemType] = useState<"veg" | "non-veg">("veg");
  const [newItemDescription, setNewItemDescription] = useState("");

  const [renamingCategory, setRenamingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameCategoryValue, setRenameCategoryValue] = useState("");

  const [deletingCategory, setDeletingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isShowingPreview, setIsShowingPreview] = useState(false);

  // Derived state
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "completed" && o.status !== "cancelled"),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "completed"),
    [orders]
  );
  const displayedOrders = activeTab === "active" ? activeOrders : completedOrders;

  // ─── Auth & Data ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let idToUse = user.uid;
        try {
          const idToken = await user.getIdToken();
          const syncRes = await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          const syncData = await syncRes.json();
          if (syncData.success) idToUse = syncData.managerId;
        } catch (e) {
          console.error("Sync error:", e);
        }
        setManagerId(idToUse);
        fetchDashboardData(idToUse);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/dashboard/data?managerId=${uid}`);
      const data = await res.json();

      if (data.success) {
        const statusRes = await fetch(`/api/onboarding/status?managerId=${uid}`);
        const statusData = await statusRes.json();

        if (
          !statusData.exists ||
          !statusData.restaurant ||
          statusData.restaurant.categories.length === 0
        ) {
          window.location.href = "/onboarding";
          return;
        }

        setOrders(data.orders);
        setRestaurantName(data.restaurantName);
        if (data.stats) setDashboardStats(data.stats);

        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
          setupRealtimeListener(data.restaurantId);

          const menuRes = await fetch(`/api/menu/${data.restaurantId}`);
          const menuData = await menuRes.json();
          if (menuData.success)
            setMenuCategories(menuData.restaurant.categories);
        }
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      window.location.href = "/onboarding";
    } finally {
      setLoading(false);
    }
  }, []);

  const setupRealtimeListener = useCallback(
    (restId: string) => {
      const channel = supabase
        .channel("dashboard-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, () => {
          if (auth.currentUser) fetchDashboardData(auth.currentUser.uid);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "Category" }, () => {
          if (auth.currentUser) fetchDashboardData(auth.currentUser.uid);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "MenuItem" }, () => {
          if (auth.currentUser) fetchDashboardData(auth.currentUser.uid);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
    [fetchDashboardData]
  );

  // ─── Order Actions ───
  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]) => {
      const prev = orders.find((o) => o.id === orderId);
      setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, status } : o)));
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          toast.success(`Order updated to ${status}`);
        } else {
          if (prev) setOrders((p) => p.map((o) => (o.id === orderId ? prev : o)));
          toast.error("Failed to update order");
        }
      } catch {
        if (prev) setOrders((p) => p.map((o) => (o.id === orderId ? prev : o)));
        toast.error("Network error");
      }
    },
    [orders]
  );

  // ─── Menu Actions ───
  const updateItemName = useCallback(async (itemId: string, newName: string) => {
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menuItems: cat.menuItems.map((i) =>
              i.id === itemId ? { ...i, name: newName } : i
            ),
          }))
        );
        toast.success("Name updated");
      }
    } catch {
      toast.error("Failed to update name");
    }
  }, []);

  const updatePrice = useCallback(async (itemId: string, newPrice: number) => {
    try {
      setIsUpdating(itemId);
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menuItems: cat.menuItems.map((i) =>
              i.id === itemId ? { ...i, price: newPrice } : i
            ),
          }))
        );
        toast.success("Price updated");
      }
    } catch {
      toast.error("Failed to update price");
    } finally {
      setIsUpdating(null);
    }
  }, []);

  const toggleAvailability = useCallback(
    async (itemId: string, current: boolean) => {
      setMenuCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          menuItems: cat.menuItems.map((item) =>
            item.id === itemId ? { ...item, isAvailable: !current } : item
          ),
        }))
      );
      try {
        setIsUpdating(itemId);
        const res = await fetch(`/api/menu/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !current }),
        });
        if (!res.ok) {
          setMenuCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              menuItems: cat.menuItems.map((item) =>
                item.id === itemId ? { ...item, isAvailable: current } : item
              ),
            }))
          );
          toast.error("Failed to toggle availability");
        } else {
          toast.success(!current ? "Item is now live" : "Item marked as sold out");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menuItems: cat.menuItems.filter((item) => item.id !== itemId),
          }))
        );
        toast.success("Item deleted");
      }
    } catch {
      toast.error("Failed to delete item");
    }
  }, []);

  const handleAddItem = useCallback(
    async (categoryId: string) => {
      if (!newItemName.trim() || !newItemPrice.trim()) {
        toast.error("Please fill in name and price");
        return;
      }
      try {
        setIsUpdating(categoryId);
        const res = await fetch(`/api/menu/categories/${categoryId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newItemName,
            price: parseFloat(newItemPrice),
            type: newItemType,
            description: newItemDescription,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMenuCategories((prev) =>
            prev.map((cat) =>
              cat.id === categoryId
                ? { ...cat, menuItems: [...cat.menuItems, data.item] }
                : cat
            )
          );
          setIsAddingItem(null);
          setNewItemName("");
          setNewItemPrice("");
          setNewItemDescription("");
          setNewItemType("veg");
          toast.success("Dish added to menu!");
        }
      } catch {
        toast.error("Failed to add dish");
      } finally {
        setIsUpdating(null);
      }
    },
    [newItemName, newItemPrice, newItemType, newItemDescription]
  );

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim() || !restaurantId) {
      toast.error("Please enter a category name");
      return;
    }
    try {
      setIsUpdating("new-category");
      const res = await fetch(`/api/menu/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, name: newCategoryName }),
      });
      const data = await res.json();
      if (data.success) {
        let finalCategory = { ...data.category, menuItems: [] };
        if (initialDishName.trim() && initialDishPrice.trim()) {
          try {
            const itemRes = await fetch(
              `/api/menu/categories/${data.category.id}/items`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: initialDishName,
                  price: parseFloat(initialDishPrice),
                  type: "veg",
                  description: "",
                }),
              }
            );
            const itemData = await itemRes.json();
            if (itemData.success) finalCategory.menuItems = [itemData.item];
          } catch {}
        }
        setMenuCategories((prev) => [...prev, finalCategory]);
        setNewCategoryName("");
        setInitialDishName("");
        setInitialDishPrice("");
        setIsAddingCategory(false);
        toast.success("Category created!");
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsUpdating(null);
    }
  }, [newCategoryName, restaurantId, initialDishName, initialDishPrice]);

  const handleRenameCategory = useCallback(async () => {
    if (!renamingCategory || !renameCategoryValue.trim()) return;
    try {
      const res = await fetch(`/api/menu/categories/${renamingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameCategoryValue }),
      });
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((c) =>
            c.id === renamingCategory.id
              ? { ...c, name: renameCategoryValue }
              : c
          )
        );
        toast.success("Category renamed");
      }
    } catch {
      toast.error("Failed to rename");
    } finally {
      setRenamingCategory(null);
      setRenameCategoryValue("");
    }
  }, [renamingCategory, renameCategoryValue]);

  const handleDeleteCategory = useCallback(async () => {
    if (!deletingCategory) return;
    try {
      const res = await fetch(`/api/menu/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.filter((c) => c.id !== deletingCategory.id)
        );
        toast.success("Category deleted");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingCategory(null);
    }
  }, [deletingCategory]);

  // ─── Loading ───
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
          <p className="text-zinc-500 font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    );

  // ─── Render ───
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-zinc-100 flex-col p-5 xl:p-6 sticky top-0 h-screen">
        <SidebarContent
          activeView={activeView}
          setActiveView={setActiveView}
          restaurantName={restaurantName}
        />
      </aside>

      {/* ─── Mobile Sidebar Sheet ─── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-6">
          <SidebarContent
            activeView={activeView}
            setActiveView={(v) => {
              setActiveView(v);
              setMobileMenuOpen(false);
            }}
            restaurantName={restaurantName}
          />
        </SheetContent>
      </Sheet>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-30 bg-[#f8f9fa]/80 backdrop-blur-xl border-b border-zinc-100 lg:border-none px-4 sm:px-6 lg:px-10 py-4 lg:py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-9 h-9 p-0 shrink-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight truncate">
                  {activeView === "orders" ? "Orders" : "Menu"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium hidden sm:block">
                  {activeView === "orders"
                    ? "Manage orders in real-time"
                    : "Update your digital menu"}
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {activeView === "menu" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 text-xs font-bold rounded-lg hidden sm:flex"
                    onClick={() => setIsShowingPreview(true)}
                  >
                    <Eye size={14} className="mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 sm:h-10 text-xs font-bold rounded-lg bg-zinc-900"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    <Plus size={14} className="mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">New Category</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 p-0 text-zinc-400 relative"
                  >
                    <Bell size={18} />
                    {activeOrders.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-10 space-y-6 lg:space-y-8">
          {/* ─── ORDERS VIEW ─── */}
          {activeView === "orders" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  label="Active Orders"
                  value={dashboardStats.activeOrdersCount}
                  icon={Clock}
                  color="text-blue-600"
                />
                <StatCard
                  label="Prepared Today"
                  value={dashboardStats.preparedTodayCount}
                  icon={ChefHat}
                  color="text-green-600"
                />
                <StatCard
                  label="Tables"
                  value={dashboardStats.tablesFilled}
                  icon={LayoutDashboard}
                  color="text-amber-600"
                />
                <StatCard
                  label="Today's Sale"
                  value={formatCurrency(dashboardStats.totalSaleToday)}
                  icon={BarChart3}
                  color="text-purple-600"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg w-fit">
                {(["active", "completed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-bold transition-all",
                      activeTab === tab
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    {tab === "active" ? "Active" : "Completed"}
                    {tab === "active" && activeOrders.length > 0 && (
                      <span className="ml-1.5 bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {activeOrders.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Order Grid */}
              {displayedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                    <UtensilsCrossed size={24} className="text-zinc-300" />
                  </div>
                  <p className="text-zinc-400 font-bold text-sm">
                    {activeTab === "active"
                      ? "No active orders right now"
                      : "No completed orders today"}
                  </p>
                  <p className="text-zinc-300 text-xs mt-1">
                    Orders will appear here in real-time
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {displayedOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <OrderCard
                          order={order}
                          onStatusUpdate={updateOrderStatus}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* ─── MENU VIEW ─── */}
          {activeView === "menu" && (
            <div className="space-y-6 lg:space-y-8 pb-10">
              {menuCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                    <UtensilsCrossed size={24} className="text-zinc-300" />
                  </div>
                  <p className="text-zinc-400 font-bold text-sm">
                    No menu categories yet
                  </p>
                  <p className="text-zinc-300 text-xs mt-1 mb-4">
                    Create your first category to start adding dishes
                  </p>
                  <Button
                    size="sm"
                    className="bg-zinc-900"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    <Plus size={14} className="mr-1.5" />
                    Create Category
                  </Button>
                </div>
              )}

              {menuCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-zinc-100 shadow-sm"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white shrink-0">
                        <UtensilsCrossed size={18} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 truncate">
                          {cat.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-0.5">
                          <button
                            onClick={() => {
                              setRenamingCategory({
                                id: cat.id,
                                name: cat.name,
                              });
                              setRenameCategoryValue(cat.name);
                            }}
                            className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors flex items-center gap-1"
                          >
                            <Pencil size={10} /> Rename
                          </button>
                          <button
                            onClick={() =>
                              setDeletingCategory({
                                id: cat.id,
                                name: cat.name,
                              })
                            }
                            className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-red-500 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-zinc-900 h-9 text-xs font-bold rounded-lg shrink-0 w-full sm:w-auto"
                      onClick={() => {
                        setIsAddingItem(cat.id);
                        setAddingToCategoryName(cat.name);
                        setNewItemName("");
                        setNewItemPrice("");
                        setNewItemDescription("");
                        setNewItemType("veg");
                      }}
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add Dish
                    </Button>
                  </div>

                  {/* Menu Items */}
                  {cat.menuItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-zinc-300 text-sm font-medium">
                        No dishes in this category yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cat.menuItems.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          isUpdating={isUpdating === item.id}
                          onUpdateName={updateItemName}
                          onUpdatePrice={updatePrice}
                          onToggleAvailability={toggleAvailability}
                          onDelete={deleteItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-2 pb-safe z-40">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() =>
                (item.id === "orders" || item.id === "menu") &&
                setActiveView(item.id)
              }
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px]",
                activeView === item.id
                  ? "text-zinc-900"
                  : "text-zinc-400"
              )}
            >
              <item.icon
                size={20}
                strokeWidth={activeView === item.id ? 2.5 : 2}
              />
              <span className="text-[10px] font-bold">{item.label}</span>
              {activeView === item.id && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute bottom-0 w-8 h-0.5 bg-zinc-900 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── DIALOGS ─── */}

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new section to your menu like Starters, Desserts, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Category Name</Label>
              <Input
                id="catName"
                placeholder="e.g. Signature Pizzas"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>
            <Separator />
            <p className="text-xs text-zinc-400 font-medium">
              Optional: Add your first dish
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstDish">Dish Name</Label>
                <Input
                  id="firstDish"
                  placeholder="e.g. Margherita"
                  value={initialDishName}
                  onChange={(e) => setInitialDishName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstPrice">Price (₹)</Label>
                <Input
                  id="firstPrice"
                  type="number"
                  placeholder="199"
                  value={initialDishPrice}
                  onChange={(e) => setInitialDishPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddCategory}
              disabled={isUpdating === "new-category" || !newCategoryName.trim()}
              className="bg-zinc-900"
            >
              {isUpdating === "new-category" ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog
        open={!!isAddingItem}
        onOpenChange={(open) => {
          if (!open) setIsAddingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
            <DialogDescription>
              Adding to <span className="font-bold">{addingToCategoryName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dish Name</Label>
                <Input
                  placeholder="e.g. Butter Chicken"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="299"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="A short description of the dish..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newItemType === "veg" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1",
                    newItemType === "veg" && "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={() => setNewItemType("veg")}
                >
                  <span className="w-2 h-2 rounded-full bg-green-300 mr-2" />
                  Veg
                </Button>
                <Button
                  type="button"
                  variant={newItemType === "non-veg" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1",
                    newItemType === "non-veg" && "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={() => setNewItemType("non-veg")}
                >
                  <span className="w-2 h-2 rounded-full bg-red-300 mr-2" />
                  Non-Veg
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => isAddingItem && handleAddItem(isAddingItem)}
              disabled={
                isUpdating === isAddingItem ||
                !newItemName.trim() ||
                !newItemPrice.trim()
              }
              className="bg-zinc-900"
            >
              {isUpdating === isAddingItem ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Add to Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Category Dialog */}
      <Dialog
        open={!!renamingCategory}
        onOpenChange={(open) => {
          if (!open) setRenamingCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameCategoryValue}
              onChange={(e) => setRenameCategoryValue(e.target.value)}
              placeholder="Category name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameCategory();
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleRenameCategory}
              disabled={!renameCategoryValue.trim()}
              className="bg-zinc-900"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirm */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Delete &quot;{deletingCategory?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category and ALL its menu items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCategory}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Preview Modal ─── */}
      <Dialog open={isShowingPreview} onOpenChange={setIsShowingPreview}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Info Panel */}
            <div className="lg:w-2/5 bg-zinc-900 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-zinc-900">
                  <QrCode size={24} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Live Preview
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    This is exactly what your customers see when they scan your
                    QR code. Changes reflect instantly.
                  </p>
                </div>
              </div>
              <div className="space-y-4 mt-6 lg:mt-0">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-bold text-sm">Live & Syncing</span>
                </div>
                <DialogClose asChild>
                  <Button className="w-full h-11 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-100">
                    Close Preview
                  </Button>
                </DialogClose>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex-1 flex items-center justify-center bg-zinc-100 p-6 sm:p-10 overflow-auto">
              <div className="w-full max-w-[340px] bg-black rounded-[40px] p-2.5 shadow-2xl">
                <div className="w-full bg-white rounded-[32px] overflow-auto max-h-[600px]">
                  {/* Status Bar */}
                  <div className="sticky top-0 bg-white z-10 h-8 flex justify-between items-center px-6">
                    <span className="text-[10px] font-bold">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full border border-black/20" />
                      <div className="w-2.5 h-2.5 rounded-full border border-black/20" />
                    </div>
                  </div>

                  {/* Menu Content */}
                  <div className="p-5 space-y-6">
                    <div>
                      <h3 className="text-xl font-black tracking-tight">
                        Menu
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        {restaurantName}
                      </p>
                    </div>

                    {menuCategories.map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {cat.name}
                        </h4>
                        <div className="space-y-2">
                          {cat.menuItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-zinc-50 rounded-xl flex justify-between items-center border border-zinc-100"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full shrink-0",
                                      item.type === "veg"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    )}
                                  />
                                  <p
                                    className={cn(
                                      "text-xs font-bold truncate",
                                      !item.isAvailable &&
                                        "text-zinc-400 line-through"
                                    )}
                                  >
                                    {item.name}
                                  </p>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-400">
                                  ₹{item.price}
                                </p>
                              </div>
                              {!item.isAvailable ? (
                                <span className="px-2 py-0.5 bg-zinc-200 rounded text-[8px] font-bold text-zinc-500 uppercase shrink-0">
                                  Sold Out
                                </span>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm shrink-0">
                                  <Plus size={12} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}