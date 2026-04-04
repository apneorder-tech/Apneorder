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

import dynamic from "next/dynamic";

// Extracted Components
import { SidebarContent } from "./_components/SidebarContent";
import { DashboardHeader } from "./_components/DashboardHeader";
import { SubscriptionLock } from "./_components/SubscriptionLock";
import { SubscriptionCard } from "./_components/SubscriptionCard";
import { StatCard } from "./_components/StatCard";
import { OrderTabSelector } from "./_components/OrderTabSelector";
import { OrdersEmptyState } from "./_components/OrdersEmptyState";
import { OrdersGrid } from "./_components/OrdersGrid";
import { MobileBottomNav } from "./_components/MobileBottomNav";
import { StatCardSkeleton } from "./_components/DashboardSkeleton";

// Dynamic Sub-Views (Loaded only when active)
const MenuView = dynamic(() => import("./_components/MenuView").then(m => m.MenuView), { ssr: false });
const TablesView = dynamic(() => import("./_components/TablesView").then(m => m.TablesView), { ssr: false });
const AnalyticsView = dynamic(() => import("./_components/AnalyticsView").then(m => m.AnalyticsView), { ssr: false });
const SettingsView = dynamic(() => import("./_components/SettingsView").then(m => m.SettingsView), { ssr: false });

// Dynamic Dialogs & Modals
const PreviewModal = dynamic(() => import("./_components/PreviewModal").then(m => m.PreviewModal), { ssr: false });
const AddCategoryDialog = dynamic(() => import("./_components/MenuDialogs").then(m => m.AddCategoryDialog), { ssr: false });
const AddItemDialog = dynamic(() => import("./_components/MenuDialogs").then(m => m.AddItemDialog), { ssr: false });
const RenameCategoryDialog = dynamic(() => import("./_components/MenuDialogs").then(m => m.RenameCategoryDialog), { ssr: false });
const DeleteCategoryAlert = dynamic(() => import("./_components/MenuDialogs").then(m => m.DeleteCategoryAlert), { ssr: false });
const AddTableDialog = dynamic(() => import("./_components/TableDialogs").then(m => m.AddTableDialog), { ssr: false });
const DeleteTableAlert = dynamic(() => import("./_components/TableDialogs").then(m => m.DeleteTableAlert), { ssr: false });

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
  const [activeView, setActiveView] = useState<"orders" | "menu" | "tables" | "analytics" | "settings" | "plans">("orders");
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
  const [subscription, setSubscription] = useState<{ status: string; currentPeriodEnd: string } | null>(null);

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
  const verifyingOrders = useMemo(() => (orders || []).filter((o) => o.status === "payment_pending"), [orders]);
  const activeOrders = useMemo(() => (orders || []).filter((o) => o.status !== "completed" && o.status !== "cancelled" && o.status !== "payment_pending"), [orders]);
  const displayedOrders = activeTab === "verifying" ? verifyingOrders : activeTab === "active" ? activeOrders : completedOrders;

  const [isMenuLoaded, setIsMenuLoaded] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isEssentialsLoaded, setIsEssentialsLoaded] = useState(false);

  // ─── Data Fetching ───
  const fetchDashboardData = useCallback(async (uid: string, essentialsOnly = false, subscriptionOnly = false) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/dashboard/data?managerId=${uid}&essentials=${essentialsOnly}&subscriptionOnly=${subscriptionOnly}`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      const data = await res.json();
      
      if (!data.success) { 
        // If essential fetch fails, we just wait for sync.
        // Only redirect to onboarding if FULL fetch fails AND we are reasonably sure sync is done.
        // We'll handle the redirect in the onAuthStateChanged sync callback instead.
        return; 
      }
      
      if (data.tables) setTables(data.tables);
      if (data.orders) setOrders(data.orders);
      if (data.completedOrders) setCompletedOrders(data.completedOrders);
      if (data.hasMoreCompleted !== undefined) setHasMoreCompleted(data.hasMoreCompleted);
      if (data.totalCompleted !== undefined) setTotalCompleted(data.totalCompleted);
      if (data.restaurantName) setRestaurantName(data.restaurantName);
      if (data.stats) setDashboardStats((prev) => ({ ...prev, ...data.stats }));
      
      if (data.restaurantId) {
        setRestaurantId(data.restaurantId);
        setUpiId(data.upiId || "");
        setTempUpiId(data.upiId || "");
        if (data.subscription) setSubscription(data.subscription);
      }

      if (subscriptionOnly) {
        // If it's subscription-only check, only proceed to essentials IF active
        if (data.subscription?.status === "ACTIVE") {
          fetchDashboardData(uid, true, false);
        } else {
          // Done loading for now (locked)
          setLoading(false);
          setIsEssentialsLoaded(true);
        }
        return;
      }

      if (essentialsOnly) {
        setIsEssentialsLoaded(true);
        fetchDashboardData(uid, false, false);
      }
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      if (!essentialsOnly) setLoading(false);
    }
  }, []);

  const fetchMenuData = useCallback(async (rid: string) => {
    if (isMenuLoaded || isLoadingMenu) return;
    setIsLoadingMenu(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/menu/data?restaurantId=${rid}`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setMenuCategories(data.menuCategories);
        setIsMenuLoaded(true);
      }
    } catch (err) {
      console.error("Menu Fetch Error:", err);
      toast.error("Failed to load menu data");
    } finally {
      setIsLoadingMenu(false);
    }
  }, [isMenuLoaded, isLoadingMenu]);

  useEffect(() => {
    if (activeView === "menu" && restaurantId) fetchMenuData(restaurantId);
  }, [activeView, restaurantId, fetchMenuData]);

  const loadMoreCompleted = useCallback(async () => {
    if (!managerId || isLoadingMore || !hasMoreCompleted) return;
    setIsLoadingMore(true);
    try {
      const nextPage = completedPage + 1;
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/dashboard/data?managerId=${managerId}&page=${nextPage}`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setCompletedOrders((prev) => [...prev, ...data.completedOrders]);
        setHasMoreCompleted(data.hasMoreCompleted);
        setCompletedPage(nextPage);
      }
    } catch (err) { console.error("Load More Error:", err); toast.error("Failed to load more orders"); } finally { setIsLoadingMore(false); }
  }, [managerId, completedPage, isLoadingMore, hasMoreCompleted]);

  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Use the new progressive fetch on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        let idToUse = user.uid;
        
        // 1. Try to get cached managerId from localStorage first (VERY FAST)
        if (typeof window !== "undefined") {
          const cachedId = localStorage.getItem(`managerId_${user.uid}`);
          if (cachedId) idToUse = cachedId;
          
          // Impersonation logic for ADMIN
          if (user.uid === "ADMIN_UID") {
            const impId = localStorage.getItem("IMPERSONATE_USER_ID");
            if (impId) idToUse = impId;
          }
        }

        setManagerId(idToUse);
        fetchDashboardData(idToUse, false, true); // Start with SUBSCRIPTION ONLY!

        // Run sync in the background to ensure DB is up to date
        try {
          const idToken = await user.getIdToken();
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          }).then(res => res.json()).then(syncData => {
            if (syncData.success) {
              if (typeof window !== "undefined") {
                localStorage.setItem(`managerId_${user.uid}`, syncData.managerId);
              }
              
              if (syncData.managerId !== idToUse) {
                setManagerId(syncData.managerId);
                fetchDashboardData(syncData.managerId, true);
              }
              if (!syncData.hasRestaurant) {
                window.location.href = "/onboarding";
              }
            }
          });
        } catch (e) { 
          console.error("Background sync error:", e); 
        }
      } else { 
        window.location.href = "/login"; 
      }
    });
    return () => unsubscribe();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!restaurantId || !managerId) return;
    console.log("Supabase: Initializing channel for restaurant:", restaurantId);
    
    const channel = supabase.channel(`dashboard-${restaurantId}`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "Order", 
        filter: `restaurantId=eq.${restaurantId}` 
      }, async (payload: any) => {
        console.log("Supabase: Realtime event received!", payload.eventType, payload.new?.id);
        const idToken = await auth.currentUser?.getIdToken();
        
        // Refresh orders and essentials data
        fetch(`/api/dashboard/data?managerId=${managerId}&essentials=true`, {
          headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success) {
              setOrders(data.orders);
              if (payload.eventType === "INSERT") {
                console.log("Supabase: New order play sound effect");
                new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(e => console.error("Audio error:", e));
                toast.success("New Order Received!", { icon: <Bell className="text-purple-500 animate-bounce" /> });
              }
            }
          })
          .catch(err => console.error("Realtime fetch error:", err));
      })
      .subscribe((status: string, err?: Error) => {
        console.log("Supabase: Channel status change:", status, err || "");
        setRealtimeStatus(status);
        if (status === "CHANNEL_ERROR") {
          toast.error("Realtime connection issue. Trying to reconnect...");
        }
      });

    return () => { 
      console.log("Supabase: Cleaning up channel:", restaurantId);
      supabase.removeChannel(channel); 
    };
  }, [restaurantId, managerId, fetchDashboardData]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order["status"]) => {
    const prev = orders.find((o) => o.id === orderId);
    setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok && prev) setOrders((p) => p.map((o) => (o.id === orderId ? prev : o)));
    } catch { if (prev) setOrders((p) => p.map((o) => (o.id === orderId ? prev : o))); }
  }, [orders]);

  const handleUpdateUpi = async () => {
    if (!restaurantId || !tempUpiId.trim() || !tempUpiId.includes("@")) return;
    setIsUpdatingUpi(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/restaurant/update-upi", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
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
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/tables/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
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

  const handleSendTestOrder = async () => {
    if (!restaurantId) return;
    toast.promise(
      fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          tableNumber: "1",
          items: [{ id: menuCategories[0]?.menuItems[0]?.id || "test", quantity: 1 }],
          paymentMethod: "CASH"
        }),
      }).then(r => r.json()),
      {
        loading: "Sending test order...",
        success: "Test order sent! Check your dashboard.",
        error: "Failed to send test order."
      }
    );
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tables/${tableId}`, { 
        method: "DELETE",
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
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
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/menu/categories`, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        }, 
        body: JSON.stringify({ restaurantId, name: newCategoryName }) 
      });
      const data = await res.json();
      if (data.success) {
        const finalCategory = { ...data.category, menuItems: [] };
        if (initialDishName.trim() && initialDishPrice.trim()) {
           const itemRes = await fetch(`/api/menu/categories/${data.category.id}/items`, { 
             method: "POST", 
             headers: { 
               "Content-Type": "application/json",
               ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
             }, 
             body: JSON.stringify({ name: initialDishName, price: parseFloat(initialDishPrice), type: "veg", description: "" }) 
           });
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
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/menu/categories/${categoryId}/items`, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        }, 
        body: JSON.stringify({ name: newItemName, price: parseFloat(newItemPrice), type: newItemType, description: newItemDescription }) 
      });
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
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/menu/categories/${deletingCategory.id}`, { 
        method: "DELETE",
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      if (res.ok) {
        setMenuCategories(menuCategories.filter(c => c.id !== deletingCategory.id));
        setDeletingCategory(null);
        toast.success("Category deleted");
      }
    } catch { toast.error("Failed to delete category"); }
  };


  if (!hasMounted) return null;

  // Standard dashboard layout
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[280px] flex-col sticky top-0 h-screen border-r border-zinc-100 bg-white/50 backdrop-blur-xl z-50">
          <SidebarContent 
            activeView={activeView} 
            setActiveView={setActiveView} 
            restaurantName={restaurantName} 
            subscriptionStatus={subscription?.status}
            loading={loading}
          />
        </aside>

        {/* Mobile Header (Sheet Trigger only, layout consistent with Sidebar) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 border-none">
            <SheetHeader className="sr-only"><SheetTitle>Navigation Menu</SheetTitle><SheetDescription>Access dashboard sections</SheetDescription></SheetHeader>
            <SidebarContent 
              activeView={activeView} 
              setActiveView={(v) => { setActiveView(v); setMobileMenuOpen(false); }} 
              restaurantName={restaurantName} 
              subscriptionStatus={subscription?.status}
              onLogout={() => auth.signOut()}
              subscription={subscription}
              onSendTestOrder={handleSendTestOrder}
              loading={loading}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 min-w-0 relative">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 sm:space-y-10 lg:space-y-12">
            
            <DashboardHeader 
              activeView={activeView} 
              realtimeStatus={realtimeStatus} 
              loading={!isEssentialsLoaded} 
              onRefresh={() => managerId && fetchDashboardData(managerId, true)} 
              onDownloadAllQRs={downloadAllQRs} 
              onShowPreview={() => setIsShowingPreview(true)} 
              onAddCategory={() => setIsAddingCategory(true)} 
              activeOrdersCount={activeOrders.length}
              setMobileMenuOpen={setMobileMenuOpen}
              subscriptionStatus={subscription?.status}
            />

            {activeView === "orders" && (
              (subscription?.status === "ACTIVE" || loading) ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {loading ? ( // Still loading stats
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
                    
                    {isEssentialsLoaded && displayedOrders.length === 0 ? <OrdersEmptyState activeTab={activeTab} /> : (
                      <div className="space-y-6 sm:space-y-8">
                        <OrdersGrid 
                          orders={displayedOrders} 
                          onStatusUpdate={updateOrderStatus} 
                          loading={!isEssentialsLoaded} 
                        />
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
              ) : <SubscriptionLock onGoToSettings={() => setActiveView("plans")} />
            )}

            {activeView === "menu" && (
              (subscription?.status === "ACTIVE" || loading) ? (
                <MenuView 
                  menuCategories={menuCategories} 
                  isUpdating={isUpdating} 
                  onAddCategory={() => setIsAddingCategory(true)} 
                  onAddItem={(id, name) => { setIsAddingItem(id); setAddingToCategoryName(name); }} 
                  onRenameCategory={(cat) => { setRenamingCategory(cat); setRenameCategoryValue(cat.name); }} 
                  onDeleteCategory={setDeletingCategory} 
                  onUpdateItemName={async (id, name) => {
                    try {
                      const idToken = await auth.currentUser?.getIdToken();
                      const res = await fetch(`/api/menu/items/${id}`, { 
                        method: "PATCH", 
                        headers: { 
                          "Content-Type": "application/json",
                          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
                        }, 
                        body: JSON.stringify({ name }) 
                      });
                      if (res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, name } : i) })));
                    } catch { toast.error("Failed to update name"); }
                  }} 
                  onUpdatePrice={async (id, price) => {
                    setIsUpdating(id);
                    try {
                      const idToken = await auth.currentUser?.getIdToken();
                      const res = await fetch(`/api/menu/items/${id}`, { 
                        method: "PATCH", 
                        headers: { 
                          "Content-Type": "application/json",
                          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
                        }, 
                        body: JSON.stringify({ price }) 
                      });
                      if (res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, price } : i) })));
                    } catch { toast.error("Failed to update price"); } finally { setIsUpdating(null); }
                  }} 
                  onToggleAvailability={async (id, current) => {
                    setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, isAvailable: !current } : i) })));
                    try {
                      const idToken = await auth.currentUser?.getIdToken();
                      const res = await fetch(`/api/menu/items/${id}`, { 
                        method: "PATCH", 
                        headers: { 
                          "Content-Type": "application/json",
                          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
                        }, 
                        body: JSON.stringify({ isAvailable: !current }) 
                      });
                      if (!res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.map(i => i.id === id ? { ...i, isAvailable: current } : i) })));
                    } catch { toast.error("Network error"); }
                  }} 
                  onDeleteItem={async (id) => {
                    try {
                      const idToken = await auth.currentUser?.getIdToken();
                      const res = await fetch(`/api/menu/items/${id}`, { 
                        method: "DELETE",
                        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
                      });
                      if (res.ok) setMenuCategories(menuCategories.map(cat => ({ ...cat, menuItems: cat.menuItems.filter(i => i.id !== id) })));
                    } catch { toast.error("Failed to delete item"); }
                  }} 
                  loading={loading || isLoadingMenu}
                />
              ) : <SubscriptionLock onGoToSettings={() => setActiveView("plans")} />
            )}

            {activeView === "tables" && (
              (subscription?.status === "ACTIVE" || loading) ? (
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
              ) : <SubscriptionLock onGoToSettings={() => setActiveView("plans")} />
            )}

            {activeView === "analytics" && (
              (subscription?.status === "ACTIVE" || loading) ? (
                <AnalyticsView stats={dashboardStats} loading={loading} />
              ) : <SubscriptionLock onGoToSettings={() => setActiveView("plans")} />
            )}

            {activeView === "plans" && (
              <div className="max-w-xl mx-auto pt-8">
                <SubscriptionCard 
                  status={subscription?.status} 
                  expiryDate={subscription?.currentPeriodEnd}
                  isLoading={loading}
                />
              </div>
            )}
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
            const idToken = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/menu/categories/${renamingCategory.id}`, { 
              method: "PATCH", 
              headers: { 
                "Content-Type": "application/json",
                ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
              }, 
              body: JSON.stringify({ name: renameCategoryValue }) 
            });
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