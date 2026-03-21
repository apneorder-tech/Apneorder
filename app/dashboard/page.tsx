"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, LayoutDashboard, UtensilsCrossed, 
  Settings, Bell, Search, MoreVertical, 
  Clock, XCircle, ChevronRight, 
  ChefHat, Loader2, QrCode
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client for Realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    type: string;
  };
}

interface Order {
  id: string;
  table: {
    tableNumber: string;
  };
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
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

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [restaurantName, setRestaurantName] = useState("Your Restaurant");
  const [managerId, setManagerId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSaleToday: 0,
    preparedTodayCount: 0,
    tablesFilled: "0/0",
    activeOrdersCount: 0
  });

  const [activeView, setActiveView] = useState<'orders' | 'menu'>('orders');
  const [menuCategories, setMenuCategories] = useState<ManageCategory[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemType, setNewItemType] = useState<"veg" | "non-veg">("veg");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [initialDishName, setInitialDishName] = useState("");
  const [initialDishPrice, setInitialDishPrice] = useState("");
  const [isShowingPreview, setIsShowingPreview] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let idToUse = user.uid;
        try {
          const idToken = await user.getIdToken();
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          const syncData = await syncRes.json();
          if (syncData.success) {
            idToUse = syncData.managerId;
          }
        } catch (e) {
          console.error("Dashboard sync error:", e);
        }
        setManagerId(idToUse);
        fetchDashboardData(idToUse);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (uid: string) => {
    try {
      const res = await fetch(`/api/dashboard/data?managerId=${uid}`);
      const data = await res.json();
      
      if (data.success) {
        const statusRes = await fetch(`/api/onboarding/status?managerId=${uid}`);
        const statusData = await statusRes.json();
        
        if (!statusData.exists || !statusData.restaurant || statusData.restaurant.categories.length === 0) {
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
             if (menuData.success) {
                 setMenuCategories(menuData.restaurant.categories);
             }
        }
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      window.location.href = "/onboarding";
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = (restaurantId: string) => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order' }, () => {
          if (auth.currentUser) fetchDashboardData(auth.currentUser.uid);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Category' }, () => {
          if (auth.currentUser) fetchDashboardData(auth.currentUser.uid);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'MenuItem' }, () => {
          if (auth.currentUser) fetchDashboardData(auth.currentUser.uid);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  const updatePrice = async (itemId: string, newPrice: number) => {
    try {
      setIsUpdating(itemId);
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) {
        setMenuCategories(prev => prev.map(cat => ({
          ...cat,
          menuItems: cat.menuItems.map(i => i.id === itemId ? { ...i, price: newPrice } : i)
        })));
      }
    } catch (err) {
      console.error("Price Update Error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuCategories(prev => prev.map(cat => ({
          ...cat,
          menuItems: cat.menuItems.filter(item => item.id !== itemId)
        })));
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const toggleAvailability = async (itemId: string, current: boolean) => {
    try {
      setIsUpdating(itemId);
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !current }),
      });
      if (res.ok) {
        setMenuCategories(prev => prev.map(cat => ({
          ...cat,
          menuItems: cat.menuItems.map(item => 
            item.id === itemId ? { ...item, isAvailable: !current } : item
          )
        })));
      }
    } catch (err) {
      console.error("Toggle Error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAddItem = async (categoryId: string) => {
    if (!newItemName || !newItemPrice) return;
    try {
      setIsUpdating(categoryId);
      const res = await fetch(`/api/menu/categories/${categoryId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newItemName, 
          price: parseFloat(newItemPrice), 
          type: newItemType,
          description: newItemDescription
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMenuCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, menuItems: [...cat.menuItems, data.item] }
            : cat
        ));
        setIsAddingItem(null);
        setNewItemName("");
        setNewItemPrice("");
        setNewItemDescription("");
      }
    } catch (err) {
      console.error("Add Item Error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName || !restaurantId) return;
    try {
      setIsUpdating("new-category");
      const res = await fetch(`/api/menu/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, name: newCategoryName }),
      });
      const data = await res.json();
      if (data.success) {
        let finalCategory = { ...data.category, menuItems: [] };
        
        // If an initial dish was provided, add it instantly
        if (initialDishName && initialDishPrice) {
            try {
                const itemRes = await fetch(`/api/menu/categories/${data.category.id}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      name: initialDishName, 
                      price: parseFloat(initialDishPrice), 
                      type: 'veg',
                      description: 'First specialty' 
                    }),
                });
                const itemData = await itemRes.json();
                if (itemData.success) {
                    finalCategory.menuItems = [itemData.item];
                }
            } catch (e) { console.error("Initial Dish Error:", e); }
        }

        setMenuCategories(prev => [...prev, finalCategory]);
        setNewCategoryName("");
        setInitialDishName("");
        setInitialDishPrice("");
        setIsAddingCategory(false);
      }
    } catch (err) {
      console.error("Add Category Error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const renameCategory = async (categoryId: string, currentName: string) => {
    const newName = prompt("Rename Category", currentName);
    if (!newName || newName === currentName) return;
    try {
      const res = await fetch(`/api/menu/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setMenuCategories(prev => prev.map(c => c.id === categoryId ? { ...c, name: newName } : c));
      }
    } catch (err) {
      console.error("Rename Category Error:", err);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Delete this category and ALL its items?")) return;
    try {
      const res = await fetch(`/api/menu/categories/${categoryId}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuCategories(prev => prev.filter(c => c.id !== categoryId));
      }
    } catch (err) {
      console.error("Delete Category Error:", err);
    }
  };

  const updateItemName = async (itemId: string, newName: string) => {
    try {
        const res = await fetch(`/api/menu/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName }),
        });
        if (res.ok) {
            setMenuCategories(prev => prev.map(cat => ({
                ...cat,
                menuItems: cat.menuItems.map(i => i.id === itemId ? { ...i, name: newName } : i)
            })));
        }
    } catch (err) {
        console.error("Update Name Error:", err);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-zinc-900 animate-spin" />
        <p className="text-zinc-500 font-medium tracking-wide">Syncing Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-zinc-100 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
            <UtensilsCrossed size={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900">APNE ORDER</span>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'orders', icon: LayoutDashboard, label: "Live Orders" },
            { id: 'menu', icon: UtensilsCrossed, label: "Manage Menu" },
            { id: 'analytics', icon: BarChart3, label: "Analytics" },
            { icon: Settings, label: "Settings" },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => item.id && setActiveView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all",
                activeView === item.id ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-200 rounded-full" />
             <div className="overflow-hidden">
               <p className="text-sm font-bold truncate">{restaurantName}</p>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Active Store</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                {activeView === 'orders' ? "Orders Dashboard" : "Manage Menu"}
            </h1>
            <p className="text-zinc-400 font-medium">
                {activeView === 'orders' ? "Manage your restaurant in real-time" : "Update your digital menu instantly"}
            </p>
          </div>
          <div className="flex gap-4">
             {activeView === 'menu' ? (
                <div className="flex gap-4">
                  <Button 
                      onClick={() => setIsShowingPreview(true)} 
                      variant="outline"
                      className="h-14 px-8 rounded-[20px] border-zinc-200 text-zinc-600 font-black shadow-sm hover:bg-zinc-50 transition-all text-xs uppercase tracking-[0.2em]"
                  >
                      Live Preview 👁️
                  </Button>
                  <Button 
                      onClick={() => setIsAddingCategory(true)} 
                      className="h-14 px-10 rounded-[20px] bg-zinc-900 text-white font-black shadow-2xl shadow-zinc-300 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                  >
                      + Create New Category
                  </Button>
                </div>
             ) : (
                <>
                    <button className="w-12 h-12 bg-white border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm transition-all hover:border-zinc-300 hover:text-zinc-900"><Search size={20} /></button>
                    <button className="w-12 h-12 bg-white border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm relative transition-all hover:border-zinc-300 hover:text-zinc-900">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                    <Button className="h-12 px-8 rounded-xl bg-zinc-900 font-bold shadow-lg hover:shadow-xl transition-all">New Order +</Button>
                </>
             )}
          </div>
        </header>

        {activeView === 'orders' && (
            <div className="grid grid-cols-4 gap-6 mb-10">
            {[
                { label: "Active Orders", value: dashboardStats.activeOrdersCount, icon: Clock, color: "text-blue-600" },
                { label: "Prepared Today", value: dashboardStats.preparedTodayCount, icon: ChefHat, color: "text-green-600" },
                { label: "Tables Occupied", value: dashboardStats.tablesFilled, icon: LayoutDashboard, color: "text-amber-600" },
                { label: "Total Sale", value: `₹${dashboardStats.totalSaleToday.toLocaleString()}`, icon: BarChart3, color: "text-purple-600" },
            ].map((stat, idx) => (
                <Card key={idx} className="border-none shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 bg-zinc-50 rounded-lg", stat.color)}><stat.icon size={20} /></div>
                    <MoreVertical size={16} className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-zinc-900 tracking-tight">{stat.value}</p>
                </CardContent>
                </Card>
            ))}
            </div>
        )}

        {activeView === 'orders' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-6 border-b border-zinc-100 pb-2">
              <button 
                onClick={() => setActiveTab('active')}
                className={cn("pb-4 px-2 font-bold text-sm transition-all relative", activeTab === 'active' ? "text-zinc-900" : "text-zinc-400")}
              >
                Active Orders
                {activeTab === 'active' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-zinc-900" />}
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={cn("pb-4 px-2 font-bold text-sm transition-all relative", activeTab === 'completed' ? "text-zinc-900" : "text-zinc-400")}
              >
                Completed
                {activeTab === 'completed' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-zinc-900" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <AnimatePresence>
                {orders
                  .filter(o => activeTab === 'active' ? o.status !== 'completed' : o.status === 'completed')
                  .map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-5 border-b border-zinc-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900 font-black">
                             T{order.table.tableNumber}
                           </div>
                           <div>
                              <p className="text-sm font-bold">Order #{order.id.slice(-4).toUpperCase()}</p>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                      <CardContent className="p-0">
                        <div className="p-5 space-y-3">
                          {order.orderItems.map((item, i) => (
                             <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className={cn("w-2 h-2 rounded-full", item.menuItem.type === "veg" ? "bg-green-500" : "bg-red-500")} />
                                  <span className="text-sm font-medium">{item.menuItem.name} <span className="text-zinc-400">x{item.quantity}</span></span>
                                </div>
                             </div>
                          ))}
                        </div>
                        <div className="p-5 bg-zinc-50 flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Grand Total</span>
                             <span className="text-lg font-black text-zinc-900">₹{order.totalAmount}</span>
                          </div>
                          <div className="flex gap-2">
                             {order.status === 'pending' && (
                               <Button 
                                 onClick={() => updateOrderStatus(order.id, 'preparing')}
                                 className="flex-1 bg-zinc-900 h-10 text-xs font-bold rounded-lg shadow-sm"
                               >
                                 Start Cooking
                               </Button>
                             )}
                             {order.status === 'preparing' && (
                               <Button 
                                 onClick={() => updateOrderStatus(order.id, 'ready')}
                                 className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-xs font-bold rounded-lg shadow-sm"
                               >
                                 Mark Ready
                               </Button>
                             )}
                             {order.status === 'ready' && (
                               <Button 
                                 onClick={() => updateOrderStatus(order.id, 'completed')}
                                 className="flex-1 bg-green-600 hover:bg-green-700 h-10 text-xs font-bold rounded-lg shadow-sm"
                               >
                                 Settle Order
                               </Button>
                             )}
                             <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"><XCircle size={18} /></button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {/* Unified Category Creation Draft */}
            {isAddingCategory && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-[40px] p-12 shadow-2xl shadow-zinc-400 relative overflow-hidden"
              >
                <div className="flex justify-between items-end gap-12">
                   <div className="flex-1 space-y-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Phase 1: Architecture</span>
                        <h3 className="text-3xl font-black text-white tracking-tight">Define New Menu Department</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-3">
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Category Identity</label>
                           <input 
                              autoFocus
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-3xl h-20 px-10 text-xl font-black text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-white/20 transition-all outline-none"
                              placeholder="e.g. Signature Pizzas"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 italic">Optional: First Dish</label>
                           <input 
                              value={initialDishName}
                              onChange={(e) => setInitialDishName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-3xl h-20 px-10 text-xl font-black text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-white/20 transition-all outline-none border-dashed"
                              placeholder="Dish Name"
                           />
                        </div>
                      </div>
                      {initialDishName && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
                           <div className="flex-1 h-[2px] bg-white/5" />
                           <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-full border border-white/10">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Entry Price</span>
                              <input 
                                value={initialDishPrice}
                                onChange={(e) => setInitialDishPrice(e.target.value)}
                                className="bg-transparent border-none p-0 w-20 text-white font-black text-xl outline-none"
                                placeholder="₹ 199"
                              />
                           </div>
                        </motion.div>
                      )}
                   </div>
                   <div className="flex gap-6 items-center">
                      <button 
                        onClick={() => setIsAddingCategory(false)}
                        className="text-sm font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                      <Button 
                        disabled={isUpdating === "new-category" || !newCategoryName}
                        onClick={handleAddCategory}
                        className="h-20 px-12 rounded-[28px] bg-white text-zinc-900 font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                      >
                        {isUpdating === "new-category" ? <Loader2 className="animate-spin" /> : "Establish Category"}
                      </Button>
                   </div>
                </div>
              </motion.div>
            )}

            {menuCategories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                        <UtensilsCrossed size={24} />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black tracking-tight text-zinc-900">{cat.name}</h2>
                        <div className="flex gap-4 mt-1">
                            <button onClick={() => renameCategory(cat.id, cat.name)} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors flex items-center gap-1">
                                <Settings size={12} /> Rename Group
                            </button>
                            <button onClick={() => deleteCategory(cat.id)} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1">
                                <XCircle size={12} /> Delete Group
                            </button>
                        </div>
                     </div>
                  </div>
                  <Button 
                    onClick={() => setIsAddingItem(cat.id)}
                    className="bg-zinc-900 text-xs font-black px-8 h-12 rounded-2xl shadow-xl shadow-zinc-200 hover:scale-105 active:scale-95 transition-all"
                  >
                    + Add New Dish
                  </Button>
                </div>

                <div className="grid gap-6">
                  {cat.menuItems.map((item) => (
                    <motion.div 
                        key={item.id} 
                        layout
                        className="group relative flex items-center justify-between p-8 bg-zinc-50/50 rounded-[32px] border border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500"
                    >
                      <div className="flex items-center gap-8">
                        <div className={cn(
                            "w-5 h-5 rounded-full border-4 shadow-sm transition-all duration-500", 
                            item.type === 'veg' ? 'bg-green-500 border-green-100' : 'bg-red-500 border-red-100'
                        )} />
                        <div className="flex flex-col gap-2">
                            <input 
                                defaultValue={item.name}
                                onBlur={(e) => updateItemName(item.id, e.target.value)}
                                className="font-black text-2xl text-zinc-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-text placeholder-zinc-300 w-full"
                                placeholder="Dish Name"
                            />
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-zinc-100 shadow-sm">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">₹</span>
                                    <input 
                                        type="number"
                                        defaultValue={item.price}
                                        onBlur={async (e) => {
                                            const newPrice = parseFloat(e.target.value);
                                            if (newPrice !== item.price) updatePrice(item.id, newPrice);
                                        }}
                                        className="w-20 bg-transparent border-none p-0 text-lg font-black text-zinc-800 focus:text-zinc-900 focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <span className="px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-200">{item.type}</span>
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="flex flex-col items-end gap-2">
                           <span className={cn(
                               "text-[10px] font-black uppercase tracking-widest transition-colors", 
                               item.isAvailable ? "text-green-600" : "text-zinc-400 font-bold"
                           )}>
                             {item.isAvailable ? "Live on Menu" : "Temporarily Sold Out"}
                           </span>
                           <button 
                             disabled={isUpdating === item.id}
                             onClick={() => toggleAvailability(item.id, item.isAvailable)}
                             className={cn(
                               "w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner",
                               item.isAvailable ? "bg-green-500 shadow-green-200" : "bg-zinc-200 shadow-zinc-100"
                             )}
                           >
                              <div className={cn(
                                "absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-xl",
                                item.isAvailable ? "left-8" : "left-1"
                              )} />
                           </button>
                        </div>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="w-12 h-12 flex items-center justify-center text-zinc-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl border border-transparent hover:border-red-100 active:scale-95"
                        >
                          <XCircle size={24} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isAddingItem === cat.id && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-2 border-zinc-900 p-10 rounded-[40px] space-y-8 shadow-2xl shadow-zinc-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                             <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 px-4 py-2 rounded-full uppercase tracking-widest border border-zinc-100">Drafting New Dish</span>
                        </div>

                        <div className="space-y-2">
                           <h4 className="text-2xl font-black text-zinc-900 tracking-tight">Create Exceptional Offering</h4>
                           <p className="text-zinc-400 text-sm font-medium">Define the details for the new dish in {cat.name}.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] ml-2">Dish Identity</label>
                                <input 
                                    className="w-full h-16 bg-zinc-50 border border-zinc-200 rounded-3xl px-8 text-lg font-bold shadow-sm focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 transition-all placeholder:text-zinc-300"
                                    placeholder="e.g. Royal Saffron Kheer"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] ml-2">Premium Price</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                    <input 
                                        type="number"
                                        className="w-full h-16 bg-zinc-50 border border-zinc-200 rounded-3xl pl-12 pr-8 text-lg font-bold shadow-sm focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 transition-all placeholder:text-zinc-300"
                                        placeholder="199"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] ml-2">Sensory Description</label>
                            <input 
                                className="w-full h-16 bg-zinc-50 border border-zinc-200 rounded-3xl px-8 text-lg font-bold shadow-sm focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 transition-all placeholder:text-zinc-300"
                                placeholder="e.g. A velvet smooth concoction of reduced milk, flavored with high-grade Kashmiri saffron..."
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                            <div className="flex gap-4 p-2 bg-zinc-100 rounded-[28px] border border-zinc-200 shadow-inner">
                                <button 
                                    onClick={() => setNewItemType('veg')}
                                    className={cn(
                                        "px-8 h-12 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-300", 
                                        newItemType === 'veg' ? "bg-white text-green-600 shadow-xl shadow-green-100 scale-105" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >Pure Veg</button>
                                <button 
                                    onClick={() => setNewItemType('non-veg')}
                                    className={cn(
                                        "px-8 h-12 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-300", 
                                        newItemType === 'non-veg' ? "bg-white text-red-600 shadow-xl shadow-red-100 scale-105" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >Non-Veg</button>
                            </div>
                            <div className="flex gap-6 items-center">
                                <button onClick={() => setIsAddingItem(null)} className="text-sm font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Discard Draft</button>
                                <Button 
                                    disabled={isUpdating === cat.id}
                                    onClick={() => handleAddItem(cat.id)} 
                                    className="bg-zinc-900 text-white font-black h-16 px-12 rounded-3xl shadow-2xl shadow-zinc-400 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                                >
                                    {isUpdating === cat.id ? <Loader2 className="animate-spin w-6 h-6" /> : "Publish to Menu"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Real-time Menu Preview Modal */}
      <AnimatePresence>
        {isShowingPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-900/90 backdrop-blur-xl flex items-center justify-center p-10"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-full bg-zinc-50 rounded-[48px] overflow-hidden shadow-2xl flex border-8 border-white/10"
            >
               {/* Left Context Panel */}
               <div className="w-1/3 bg-zinc-900 p-12 flex flex-col justify-between text-white">
                  <div className="space-y-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-xl">
                      <QrCode size={32} />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black tracking-tight leading-tight">Live Customer Experience</h2>
                      <p className="text-zinc-400 font-medium text-lg leading-relaxed">This is exactly what your guests see when they scan your QR code. Every price change or availability toggle here is reflected instantly.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-2">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Store Status</p>
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           <span className="font-bold">Operational & Syncing</span>
                        </div>
                     </div>
                     <Button 
                       onClick={() => setIsShowingPreview(false)}
                       className="w-full h-16 rounded-2xl bg-white text-zinc-900 font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                     >
                        Close Preview
                     </Button>
                  </div>
               </div>

               {/* Right: The Phone Mockup */}
               <div className="flex-1 flex items-center justify-center bg-zinc-100/50 relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-zinc-200 rounded-full blur-[120px] opacity-50" />
                  
                  <div className="w-[360px] h-[720px] bg-black rounded-[60px] p-3 shadow-[0_0_100px_rgba(0,0,0,0.2)] relative z-10 border-4 border-zinc-200">
                     <div className="w-full h-full bg-white rounded-[50px] overflow-auto hide-scrollbar relative">
                        {/* Mock Phone Status Bar */}
                        <div className="h-10 bg-white sticky top-0 z-50 flex justify-between items-center px-8">
                           <span className="text-[10px] font-bold">9:41</span>
                           <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full border border-black/20" />
                              <div className="w-3 h-3 rounded-full border border-black/20" />
                           </div>
                        </div>

                        {/* Menu Content Mockup */}
                        <div className="p-6 space-y-8">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-black tracking-tight">Menu</h3>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{restaurantName}</p>
                           </div>

                           {menuCategories.map(cat => (
                             <div key={cat.id} className="space-y-4">
                               <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest pl-2">{cat.name}</h4>
                               <div className="space-y-3">
                                 {cat.menuItems.map(item => (
                                   <div key={item.id} className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center border border-zinc-100">
                                      <div className="space-y-1">
                                         <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} />
                                            <p className={cn("text-xs font-bold", !item.isAvailable && "text-zinc-400 line-through")}>{item.name}</p>
                                         </div>
                                         <p className="text-[10px] font-black text-zinc-400 tracking-tight">₹{item.price}</p>
                                      </div>
                                      {!item.isAvailable ? (
                                        <span className="px-2 py-1 bg-zinc-200 rounded-md text-[8px] font-black text-zinc-500 uppercase tracking-tighter italic">Sold Out</span>
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                                           <span className="text-xs font-black">+</span>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
