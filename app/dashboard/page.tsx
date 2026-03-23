"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  Clock, 
  ChefHat, 
  Check, 
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { User } from "firebase/auth";
import jsPDF from "jspdf";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Extracted Components
import { SidebarContent } from "./_components/SidebarContent";
import { DashboardHeader } from "./_components/DashboardHeader";
import { StatCard } from "./_components/StatCard";
import { OrderTabSelector } from "./_components/OrderTabSelector";
import { OrdersEmptyState } from "./_components/OrdersEmptyState";
import { OrdersGrid } from "./_components/OrdersGrid";
import { MenuView } from "./_components/MenuView";
import { TablesView } from "./_components/TablesView";
import { AnalyticsView } from "./_components/AnalyticsView";
import { SettingsView } from "./_components/SettingsView";
import { MobileBottomNav } from "./_components/MobileBottomNav";
import { PreviewModal } from "./_components/PreviewModal";
import { AddCategoryDialog, AddItemDialog, RenameCategoryDialog, DeleteCategoryAlert } from "./_components/MenuDialogs";
import { AddTableDialog, DeleteTableAlert } from "./_components/TableDialogs";
import { StatCardSkeleton } from "./_components/DashboardSkeleton";

// Utils & Constants & Types
import { formatCurrency } from "./_components/utils";
import { Order, ManageCategory, ManageTable, DashboardStats } from "./_components/types";

export default function DashboardPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [completedPage, setCompletedPage] = useState(1);
  const [hasMoreCompleted, setHasMoreCompleted] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"verifying" | "active" | "completed">("active");
  const [restaurantName, setRestaurantName] = useState("Your Restaurant");
  const [managerId, setManagerId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSaleToday: 0,
    salesWeekly: 0,
    salesMonthly: 0,
    salesAnnual: 0,
    preparedTodayCount: 0,
    tablesFilled: "0/0",
    activeOrdersCount: 0,
    topItems: [],
    chartData: [],
    timeframes: {
      week: { chartData: [], topItems: [] },
      month: { chartData: [], topItems: [] },
      year: { chartData: [], topItems: [] },
    },
  });
  const [activeView, setActiveView] = useState<"orders" | "menu" | "tables" | "analytics" | "settings">("orders");
  const [menuCategories, setMenuCategories] = useState<ManageCategory[]>([]);
  const [tables, setTables] = useState<ManageTable[]>([]);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [tempUpiId, setTempUpiId] = useState("");
  const [isUpdatingUpi, setIsUpdatingUpi] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>("DISCONNECTED");

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

  const [renamingCategory, setRenamingCategory] = useState<{ id: string; name: string } | null>(null);
  const [renameCategoryValue, setRenameCategoryValue] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deletingTable, setDeletingTable] = useState<ManageTable | null>(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isShowingPreview, setIsShowingPreview] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Derived state
  const verifyingOrders = useMemo(() => orders.filter((o) => o.status === "payment_pending"), [orders]);
  const activeOrders = useMemo(() => orders.filter((o) => o.status !== "completed" && o.status !== "cancelled" && o.status !== "payment_pending"), [orders]);
  const displayedOrders = activeTab === "verifying" ? verifyingOrders : activeTab === "active" ? activeOrders : completedOrders;

  // ─── Data Fetching ───
  const fetchDashboardData = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/dashboard/data?managerId=${uid}`);
      const data = await res.json();
      if (!data.success) { window.location.href = "/onboarding"; return; }
      if (!data.menuCategories || data.menuCategories.length === 0) { window.location.href = "/onboarding"; return; }
      if (data.tables) setTables(data.tables);
      setOrders(data.orders);
      setCompletedOrders(data.completedOrders || []);
      setHasMoreCompleted(data.hasMoreCompleted || false);
      setTotalCompleted(data.totalCompleted || 0);
      setCompletedPage(1);
      setRestaurantName(data.restaurantName);
      if (data.stats) setDashboardStats((prev) => ({ ...prev, ...data.stats }));
      if (data.restaurantId) {
        setRestaurantId(data.restaurantId);
        setUpiId(data.upiId || "");
        setTempUpiId(data.upiId || "");
        if (data.menuCategories) setMenuCategories(data.menuCategories);
      }
    } catch (err) { console.error("Fetch Error:", err); window.location.href = "/onboarding"; } finally { setLoading(false); }
  }, []);

  const loadMoreCompleted = useCallback(async () => {
    if (!managerId || isLoadingMore || !hasMoreCompleted) return;
    setIsLoadingMore(true);
    try {
      const nextPage = completedPage + 1;
      const res = await fetch(`/api/dashboard/data?managerId=${managerId}&page=${nextPage}`);
      const data = await res.json();
      if (data.success) {
        setCompletedOrders((prev) => [...prev, ...data.completedOrders]);
        setHasMoreCompleted(data.hasMoreCompleted);
        setCompletedPage(nextPage);
      }
    } catch (err) { console.error("Load More Error:", err); toast.error("Failed to load more orders"); } finally { setIsLoadingMore(false); }
  }, [managerId, completedPage, isLoadingMore, hasMoreCompleted]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        let idToUse = user.uid;
        if (user.uid === "ADMIN_UID" && localStorage.getItem("IMPERSONATE_USER_ID")) {
          idToUse = localStorage.getItem("IMPERSONATE_USER_ID")!;
        }
        try {
          const idToken = await user.getIdToken();
          const syncRes = await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          const syncData = await syncRes.json();
          if (syncData.success) idToUse = syncData.managerId;
        } catch (e) { console.error("Sync error:", e); }
        setManagerId(idToUse);
        fetchDashboardData(idToUse);
      } else { window.location.href = "/"; }
    });
    return () => unsubscribe();
  }, [fetchDashboardData]);

  // ─── Realtime ───
  useEffect(() => {
    if (!restaurantId || !managerId) return;
    const channel = supabase.channel(`dashboard-${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "Order", filter: `restaurantId=eq.${restaurantId}` }, (payload: any) => {
        fetch(`/api/dashboard/data?managerId=${managerId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success) {
              setOrders(data.orders);
              if (data.stats) setDashboardStats((prev) => ({ ...prev, ...data.stats }));
              if (data.menuCategories) setMenuCategories(data.menuCategories);
              if (payload.eventType === "INSERT") {
                new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => {});
                toast.success("New Order Received!", { icon: <Bell className="text-purple-500 animate-bounce" /> });
              }
            }
          });
      }).subscribe((status: string) => setRealtimeStatus(status));
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, managerId]);

  // ─── Actions ───
  const updateOrderStatus = useCallback(async (orderId: string, status: Order["status"]) => {
    const prev = orders.find((o) => o.id === orderId);
    setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok && prev) setOrders((p) => p.map((o) => (o.id === orderId ? prev : o)));
    } catch { if (prev) setOrders((p) => p.map((o) => (o.id === orderId ? prev : o))); }
  }, [orders]);

  const handleUpdateUpi = async () => {
    if (!restaurantId || !tempUpiId.trim() || !tempUpiId.includes("@")) return;
    setIsUpdatingUpi(true);
    try {
      const res = await fetch("/api/restaurant/update-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, upiId: tempUpiId.trim() }),
      });
      const data = await res.json();
      if (data.success) { setUpiId(data.upiId); toast.success("UPI ID updated!"); }
    } catch { toast.error("Failed to update UPI"); } finally { setIsUpdatingUpi(false); }
  };

  const handleAddTable = async (num: string) => {
    const tableNum = parseInt(num);
    if (!restaurantId || isAddingTable || isNaN(tableNum) || tableNum <= 0) return;
    setIsAddingTable(true);
    try {
      const res = await fetch("/api/tables/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableNumber: num.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTables([...tables, data.table].sort((a,b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true })));
        setIsAddTableDialogOpen(false);
        setNewTableNumber("");
        toast.success("Table added!");
      }
    } finally { setIsAddingTable(false); }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTables(tables.filter((t) => t.id !== tableId));
        setDeletingTable(null);
        toast.success("Table deleted");
      }
    } catch { toast.error("Failed to delete table"); }
  };

  const downloadQR = (table: ManageTable) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(28);
    doc.text(restaurantName.toUpperCase(), 105, 40, { align: "center" });
    doc.setFontSize(16); doc.setTextColor(100); doc.text("SCAN TO ORDER", 105, 55, { align: "center" });
    const dynamicUrl = `${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(dynamicUrl, { margin: 1, width: 1000 }).then((url) => {
        doc.addImage(url, "PNG", 55, 70, 100, 100);
        doc.setFontSize(24); doc.setTextColor(0); doc.text(`TABLE ${table.tableNumber}`, 105, 185, { align: "center" });
        doc.setFontSize(10); doc.setTextColor(150); doc.text("Powered by Apneorder", 105, 280, { align: "center" });
        doc.save(`${restaurantName.replace(/\s+/g, "_")}_Table_${table.tableNumber}.pdf`);
      });
    });
  };

  const downloadAllQRs = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const QRCode = await import("qrcode");
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i]; if (i > 0) doc.addPage();
      const dynamicUrl = `${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`;
      doc.setFont("helvetica", "bold"); doc.setFontSize(28);
      doc.text(restaurantName.toUpperCase(), 105, 40, { align: "center" });
      doc.setFontSize(16); doc.setTextColor(100); doc.text("SCAN TO ORDER", 105, 55, { align: "center" });
      const url = await QRCode.toDataURL(dynamicUrl, { margin: 1, width: 1000 });
      doc.addImage(url, "PNG", 55, 70, 100, 100);
      doc.setFontSize(24); doc.setTextColor(0); doc.text(`TABLE ${table.tableNumber}`, 105, 185, { align: "center" });
      doc.setFontSize(10); doc.setTextColor(150); doc.text("Powered by Apneorder", 105, 280, { align: "center" });
    }
    doc.save(`${restaurantName.replace(/\s+/g, "_")}_All_Tables.pdf`);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !restaurantId) return;
    setIsUpdating("new-category");
    try {
      const res = await fetch(`/api/menu/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurantId, name: newCategoryName }) });
      const data = await res.json();
      if (data.success) {
        const finalCategory = { ...data.category, menuItems: [] };
        if (initialDishName.trim() && initialDishPrice.trim()) {
           const itemRes = await fetch(`/api/menu/categories/${data.category.id}/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: initialDishName, price: parseFloat(initialDishPrice), type: "veg", description: "" }) });
           const itemData = await itemRes.json();
           if (itemData.success) finalCategory.menuItems = [itemData.item];
        }
        setMenuCategories([...menuCategories, finalCategory]);
        setIsAddingCategory(false); setNewCategoryName(""); setInitialDishName(""); setInitialDishPrice("");
        toast.success("Category created!");
      }
    } finally { setIsUpdating(null); }
  };

  const handleAddItem = async (categoryId: string) => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    setIsUpdating(categoryId);
    try {
      const res = await fetch(`/api/menu/categories/${categoryId}/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newItemName, price: parseFloat(newItemPrice), type: newItemType, description: newItemDescription }) });
      const data = await res.json();
      if (data.success) {
        setMenuCategories(menuCategories.map(cat => cat.id === categoryId ? { ...cat, menuItems: [...cat.menuItems, data.item] } : cat));
        setIsAddingItem(null); setNewItemName(""); setNewItemPrice(""); setNewItemDescription(""); setNewItemType("veg");
        toast.success("Dish added!");
      }
    } finally { setIsUpdating(null); }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      const res = await fetch(`/api/menu/categories/${deletingCategory.id}`, { method: "DELETE" });
      if (res.ok) {
        setMenuCategories(menuCategories.filter(c => c.id !== deletingCategory.id));
        setDeletingCategory(null);
        toast.success("Category deleted");
      }
    } catch { toast.error("Failed to delete category"); }
  };


  // Standard dashboard layout
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[280px] flex-col sticky top-0 h-screen border-r border-zinc-100 bg-white/50 backdrop-blur-xl z-50">
          <SidebarContent activeView={activeView} setActiveView={setActiveView} restaurantName={restaurantName} />
        </aside>

        {/* Mobile Header (Sheet Trigger only, layout consistent with Sidebar) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 border-none">
            <SheetHeader className="sr-only"><SheetTitle>Navigation Menu</SheetTitle><SheetDescription>Access dashboard sections</SheetDescription></SheetHeader>
            <SidebarContent activeView={activeView} setActiveView={(v) => { setActiveView(v); setMobileMenuOpen(false); }} restaurantName={restaurantName} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 min-w-0 relative">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 sm:space-y-10 lg:space-y-12">
            
            <DashboardHeader 
              activeView={activeView} 
              realtimeStatus={realtimeStatus} 
              loading={loading} 
              onRefresh={() => managerId && fetchDashboardData(managerId)} 
              onDownloadAllQRs={downloadAllQRs} 
              onShowPreview={() => setIsShowingPreview(true)} 
              onAddCategory={() => setIsAddingCategory(true)} 
              activeOrdersCount={activeOrders.length}
              setMobileMenuOpen={setMobileMenuOpen}
            />

            {activeView === "orders" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {loading ? (
                    <>
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                    </>
                  ) : (
                    <>
                      <StatCard label="Live Orders" value={activeOrders.length.toString()} icon={ChefHat} color="text-orange-600" />
                      <StatCard label="Ready/Served" value={dashboardStats.preparedTodayCount.toString()} icon={Check} color="text-green-600" />
                      <StatCard label="Table Occupancy" value={dashboardStats.tablesFilled} icon={Bell} color="text-blue-600" />
                      <StatCard label="Today's Sale" value={formatCurrency(dashboardStats.totalSaleToday)} icon={Clock} color="text-purple-600" />
                    </>
                  )}
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <OrderTabSelector 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    verifyingCount={verifyingOrders.length} 
                    activeCount={activeOrders.length} 
                    completedCount={completedOrders.length}
                  />
                  
                  {!loading && displayedOrders.length === 0 ? <OrdersEmptyState activeTab={activeTab} /> : (
                    <div className="space-y-6 sm:space-y-8">
                      <OrdersGrid orders={displayedOrders} onStatusUpdate={updateOrderStatus} loading={loading} />
                      {activeTab === "completed" && hasMoreCompleted && (
                        <div className="flex justify-center pt-2 sm:pt-4 pb-8 sm:pb-12">
                          <Button variant="outline" size="lg" className="bg-white hover:bg-zinc-50 font-bold rounded-xl shadow-sm gap-2" onClick={loadMoreCompleted} disabled={isLoadingMore}>
                            {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : "Load More Orders"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeView === "menu" && (
              <MenuView 
                menuCategories={menuCategories} 
                isUpdating={isUpdating} 
                onAddCategory={() => setIsAddingCategory(true)} 
                onAddItem={(id, name) => { setIsAddingItem(id); setAddingToCategoryName(name); }} 
                onRenameCategory={(cat) => { setRenamingCategory(cat); setRenameCategoryValue(cat.name); }} 
                onDeleteCategory={setDeletingCategory} 
                onUpdateItemName={async (id, name) => {
                  try {
                    const res = await fetch(`/api/menu/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
                    if (res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, name } : i) })));
                  } catch { toast.error("Failed to update name"); }
                }} 
                onUpdatePrice={async (id, price) => {
                  setIsUpdating(id);
                  try {
                    const res = await fetch(`/api/menu/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price }) });
                    if (res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, price } : i) })));
                  } catch { toast.error("Failed to update price"); } finally { setIsUpdating(null); }
                }} 
                onToggleAvailability={async (id, current) => {
                  setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, isAvailable: !current } : i) })));
                  try {
                    const res = await fetch(`/api/menu/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !current }) });
                    if (!res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, isAvailable: current } : i) })));
                  } catch { toast.error("Network error"); }
                }} 
                onDeleteItem={async (id) => {
                  try {
                    const res = await fetch(`/api/menu/items/${id}`, { method: "DELETE" });
                    if (res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.filter(i => i.id !== id) })));
                  } catch { toast.error("Failed to delete item"); }
                }} 
                loading={loading}
              />
            )}

            {activeView === "tables" && (
              <TablesView 
                tables={tables} 
                restaurantId={restaurantId} 
                upiId={upiId} 
                onAddTable={() => setIsAddTableDialogOpen(true)} 
                onDeleteTable={setDeletingTable} 
                onDownloadQR={downloadQR} 
                onDownloadAllQRs={downloadAllQRs} 
                loading={loading}
              />
            )}

            {activeView === "analytics" && <AnalyticsView stats={dashboardStats} loading={loading} />}

            {activeView === "settings" && (
              <SettingsView 
                restaurantName={restaurantName} 
                upiId={upiId} 
                tempUpiId={tempUpiId} 
                setTempUpiId={setTempUpiId} 
                isUpdatingUpi={isUpdatingUpi} 
                onUpdateUpi={handleUpdateUpi} 
                menuCategories={menuCategories} 
                tables={tables} 
              />
            )}
          </div>
        </main>

        <MobileBottomNav activeView={activeView} setActiveView={setActiveView} />

        {/* Dialogs */}
        <AddCategoryDialog open={isAddingCategory} onOpenChange={setIsAddingCategory} onAdd={handleAddCategory} isUpdating={isUpdating === "new-category"} newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName} initialDishName={initialDishName} setInitialDishName={setInitialDishName} initialDishPrice={initialDishPrice} setInitialDishPrice={setInitialDishPrice} />
        <AddItemDialog open={!!isAddingItem} onOpenChange={(open) => !open && setIsAddingItem(null)} onAdd={() => isAddingItem && handleAddItem(isAddingItem)} isUpdating={isUpdating === isAddingItem} categoryName={addingToCategoryName} newItemName={newItemName} setNewItemName={setNewItemName} newItemPrice={newItemPrice} setNewItemPrice={setNewItemPrice} newItemType={newItemType} setNewItemType={setNewItemType} newItemDescription={newItemDescription} setNewItemDescription={setNewItemDescription} />
        <RenameCategoryDialog open={!!renamingCategory} onOpenChange={(open) => !open && setRenamingCategory(null)} onRename={async () => {
          if (!renamingCategory) return;
          try {
            const res = await fetch(`/api/menu/categories/${renamingCategory.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: renameCategoryValue }) });
            if (res.ok) { setMenuCategories(menuCategories.map(c => c.id === renamingCategory.id ? { ...c, name: renameCategoryValue } : c)); toast.success("Renamed!"); }
          } finally { setRenamingCategory(null); setRenameCategoryValue(""); }
        }} value={renameCategoryValue} setValue={setRenameCategoryValue} />
        <DeleteCategoryAlert open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)} onDelete={handleDeleteCategory} categoryName={deletingCategory?.name || ""} />
        <DeleteTableAlert open={!!deletingTable} onOpenChange={(open) => !open && setDeletingTable(null)} onConfirm={() => deletingTable && handleDeleteTable(deletingTable.id)} tableNumber={deletingTable?.tableNumber || ""} />
        <AddTableDialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen} onAdd={handleAddTable} isAddingTable={isAddingTable} newTableNumber={newTableNumber} setNewTableNumber={setNewTableNumber} existingTables={tables} />
        <PreviewModal isOpen={isShowingPreview} onClose={() => setIsShowingPreview(false)} restaurantName={restaurantName} menuCategories={menuCategories} />
      </div>
    </TooltipProvider>
  );
}