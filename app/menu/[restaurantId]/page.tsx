"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info, Loader2, ShoppingBag, ChevronRight, Star, Clock, MapPin, X, Plus, Minus, Check, Copy, Smartphone, Download, XCircle, Pencil, Bell, RotateCcw, History, ChefHat, CheckCircle2, UtensilsCrossed, Moon, Sun, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Client ───
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MenuItem {
  id: string;
  name: string;
  price: number;
  type: string; // "veg" or "non-veg"
  isAvailable: boolean;
  description?: string;
  prepTimeMinutes?: number | null;
  imageUrl?: string | null;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  upiId: string;
  themeColor: string;
  categories: Category[];
}

interface QuickReorderItem {
  id: string;
  name: string;
  price: number;
  type: string;
  isAvailable: boolean;
  quantity: number;
}

interface QuickReorderHistory {
  id: string;
  createdAt: string;
  items: QuickReorderItem[];
}

interface LiveOrderItem {
  name: string;
  price: number;
  type: string;
  quantity: number;
}

interface LiveOrder {
  id: string;
  status: string;
  tableNumber: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: LiveOrderItem[];
}

// ─── Live Order Steps ───
const ORDER_STEPS = ["pending", "preparing", "ready", "completed"];
const STEP_LABELS = ["Accepted", "Cooking", "Ready!", "Served"];
const STEP_ICONS = [Check, ChefHat, Bell, CheckCircle2];

function LiveOrderCard({
  order,
  onDismiss,
}: {
  order: LiveOrder;
  onDismiss: (id: string) => void;
}) {
  const stepIndex = ORDER_STEPS.indexOf(order.status);
  const isPaymentPending = order.status === "payment_pending";

  const statusConfig: Record<string, { border: string; dot: string; label: string; pulse?: boolean }> = {
    payment_pending: { border: "border-t-amber-400", dot: "bg-amber-400", label: "Verifying Payment..." },
    pending:         { border: "border-t-blue-500",  dot: "bg-blue-500",  label: "Order Accepted ✓" },
    preparing:       { border: "border-t-emerald-600", dot: "bg-emerald-600", label: "Kitchen is Cooking 🍳" },
    ready:           { border: "border-t-green-500",  dot: "bg-green-500",  label: "Food is Ready! 🔔", pulse: true },
    completed:       { border: "border-t-green-500",  dot: "bg-green-500",  label: "Served! Enjoy 😊" },
  };
  const cfg = statusConfig[order.status] ?? statusConfig.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 border-t-4 ${cfg.border} shadow-sm overflow-hidden`}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
          <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider truncate">
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Table {order.tableNumber}
          </span>
          {order.status === "completed" && (
            <button
              onClick={() => onDismiss(order.id)}
              className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      {!isPaymentPending && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1">
            {ORDER_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                        done || active
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                      )}
                    >
                      <Icon size={11} strokeWidth={2.5} />
                    </div>
                    <span
                      className={cn(
                        "text-[8px] font-black uppercase tracking-wide leading-none",
                        active ? "text-zinc-900 dark:text-zinc-100" : done ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-300 dark:text-zinc-600"
                      )}
                    >
                      {STEP_LABELS[i]}
                    </span>
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-[2px] flex-1 mx-1 rounded-full mb-3.5",
                        done ? "bg-emerald-600" : "bg-zinc-100 dark:bg-zinc-800"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment pending spinner */}
      {isPaymentPending && (
        <div className="px-4 py-2 flex items-center gap-2">
          <Loader2 size={13} className="text-amber-500 animate-spin shrink-0" />
          <span className="text-[10px] font-bold text-amber-600">
            Waiting for manager to verify payment...
          </span>
        </div>
      )}

      {/* Items summary */}
      <div className="px-4 pb-3.5 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {order.items.map((item, i) => (
            <span
              key={i}
              className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg px-2 py-1 flex items-center gap-1"
            >
              <span
                className={cn(
                  "w-1 h-1 rounded-full shrink-0",
                  item.type === "veg" ? "bg-green-500" : "bg-red-500"
                )}
              />
              {item.quantity}× {item.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {order.paymentMethod === "CASH" ? "Cash" : "Online"} · ₹{order.totalAmount}
          </span>
          <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-600">
            {timeAgoShort(order.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function timeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.restaurantId as string;
  const tableNumber = searchParams.get("table") || "1";

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [cartNotes, setCartNotes] = useState<{ [key: string]: string }>({});
  const [isBagOpen, setIsBagOpen] = useState(false);

  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isOrderRejected, setIsOrderRejected] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  // ─── Dark Mode ───
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("apneorder-dark-mode");
    if (stored !== null) {
      setIsDark(stored === "true");
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("apneorder-dark-mode", String(isDark));
  }, [isDark]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [isOrdering, setIsOrdering] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [showDirectOptions, setShowDirectOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");

  // Waiter call state
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterCallCooldownUntil, setWaiterCallCooldownUntil] = useState<number | null>(null);
  const [waiterCallFeedback, setWaiterCallFeedback] = useState<"sent" | "cooldown" | null>(null);

  // Track when customer returns from UPI app
  const [returnedFromUPI, setReturnedFromUPI] = useState(false);

  // ─── Live Order Tracking state ───
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<Set<string>>(new Set());
  const liveChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const liveChannelActiveRef = useRef(false);

  // ─── Quick Reorder state ───
  const [quickPhone, setQuickPhone] = useState("");
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<QuickReorderHistory | null>(null);
  const [historyChecked, setHistoryChecked] = useState(false);
  const [quickReorderDismissed, setQuickReorderDismissed] = useState(false);

  // ─── Search ───
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isRestricted = /PhonePe|GPay|GSA|FBAN|FBAV|Instagram|WhatsApp|LinkedIn/i.test(ua);
    setIsInAppBrowser(isRestricted);
    if (!isRestricted) setShowDirectOptions(true);
  }, []);

  useEffect(() => {
    if (!placedOrderId || isOrderSuccess) return;

    const channel = supabase
      .channel(`order-status-${placedOrderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Order",
          filter: `id=eq.${placedOrderId}`
        },
        (payload) => {
          if (payload.new.status === "cancelled") {
            setIsOrderRejected(true);
            setPlacedOrderId(null);
          } else if (payload.new.status !== "payment_pending") {
            setIsOrderSuccess(true);
            setPlacedOrderId(null);
          }
        }
      )
      .subscribe();

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${placedOrderId}/status`);
        const data = await res.json();
        if (data.success) {
          if (data.order.status === "cancelled") {
            setIsOrderRejected(true);
            setPlacedOrderId(null);
            clearInterval(pollInterval);
          } else if (data.order.status !== "payment_pending") {
            setIsOrderSuccess(true);
            setPlacedOrderId(null);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [placedOrderId, isOrderSuccess]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`/api/menu/${restaurantId}`);
        const data = await res.json();
        if (data.success) {
          setRestaurant(data.restaurant);
          if (data.restaurant.categories.length > 0) {
            setActiveCategory(data.restaurant.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch Menu Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -70% 0px" }
    );

    const categoryElements = document.querySelectorAll("[data-category-id]");
    categoryElements.forEach((el) => observer.observe(el));

    return () => categoryElements.forEach((el) => observer.unobserve(el));
  }, [restaurant]);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveCategory(id);
    }
  };

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  const getTotalItems = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const getTotalPrice = () => {
    if (!restaurant) return 0;
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = restaurant.categories.flatMap(c => c.menuItems).find(i => i.id === id);
      return total + (item?.price || 0) * qty;
    }, 0);
  };

  const handleDownloadQR = async (url: string) => {
    try {
      setIsDownloading(true);

      // Proxy through our API route to avoid CORS issues with external QR service
      const proxyUrl = `/api/download-qr?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Apneorder_QR_${restaurant?.name?.replace(/\s+/g, '_') ?? 'restaurant'}_₹${getTotalPrice()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalPrice = getTotalPrice();

  const estimatedPrepMins = (() => {
    if (!restaurant) return null;
    const allItems = restaurant.categories.flatMap(c => c.menuItems);
    const times = Object.keys(cart)
      .map(id => allItems.find(i => i.id === id)?.prepTimeMinutes)
      .filter((t): t is number => typeof t === "number" && t > 0);
    return times.length > 0 ? Math.max(...times) : null;
  })();

  const amParam = totalPrice % 1 === 0 ? totalPrice.toFixed(0) : totalPrice.toFixed(2);

  const upiUrl = restaurant ? `upi://pay?pa=${restaurant.upiId.trim()}&pn=${encodeURIComponent(restaurant.name)}&am=${amParam}&cu=INR&tn=${encodeURIComponent(`Order from ${restaurant.name}`)}` : "";

  // ─── Shared order creation ───
  const createOrder = async (method: "ONLINE" | "CASH"): Promise<string> => {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        tableNumber,
        items: Object.entries(cart).map(([id, quantity]) => ({
          id,
          quantity,
          notes: cartNotes[id]?.trim() || null,
        })),
        transactionId: null,
        paymentMethod: method,
        customerPhone: customerPhone.trim() || null,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create order");
    return data.orderId as string;
  };

  // ─── CASH: create order immediately ───
  const handleConfirmPaymentSent = async () => {
    setIsOrdering(true);
    try {
      const orderId = await createOrder("CASH");
      setPlacedOrderId(orderId);
    } catch (err) {
      console.error("Cash Order Error:", err);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  // ─── ONLINE: create order first, then open UPI ───
  // Called from inside the payment drawer when customer taps "Pay Now"
  const handleInitiateOnlinePayment = async () => {
    if (isOrdering || placedOrderId) return;
    setIsOrdering(true);
    try {
      const orderId = await createOrder("ONLINE");
      setPlacedOrderId(orderId);
      // Open UPI app — page stays loaded in memory, visibilitychange fires on return
      const isSafeToRedirect = totalPrice <= 2000 || !isInAppBrowser;
      if (upiUrl && isSafeToRedirect) {
        window.location.href = upiUrl;
      }
    } catch (err) {
      console.error("Online Payment Error:", err);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  // ─── For ONLINE: just open the payment drawer ───
  const handlePlaceOrder = async () => {
    if (getTotalItems() === 0) return;
    if (paymentMethod === "CASH") {
      handleConfirmPaymentSent();
      return;
    }
    setShowPayment(true);
    setIsBagOpen(false);
  };

  // ─── Detect customer returning from UPI app ───
  // When placedOrderId is set for an ONLINE order, the UPI app has opened.
  // visibilitychange fires when the customer switches back to the browser —
  // order is already in the system, no manual button needed.
  useEffect(() => {
    if (!placedOrderId || paymentMethod !== "ONLINE" || isOrderSuccess) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setReturnedFromUPI(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [placedOrderId, paymentMethod, isOrderSuccess]);

  // One channel per session — mirrors the dashboard approach (restaurantId filter)
  useEffect(() => {
    if (liveOrders.length === 0 || liveChannelActiveRef.current) return;
    liveChannelActiveRef.current = true;

    const ch = supabase
      .channel(`customer-live-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Order",
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          const updatedId = payload.new.id as string;
          const newStatus = payload.new.status as string;
          setLiveOrders((prev) =>
            prev.map((o) => (o.id === updatedId ? { ...o, status: newStatus } : o))
          );
        }
      )
      .subscribe();

    liveChannelRef.current = ch;

    return () => {
      supabase.removeChannel(ch);
      liveChannelRef.current = null;
      liveChannelActiveRef.current = false;
    };
  }, [liveOrders.length, restaurantId]);

  const fetchLiveOrders = useCallback(async (phone: string) => {
    try {
      const res = await fetch(
        `/api/orders/live?phone=${phone}&restaurantId=${restaurantId}`
      );
      const data = await res.json();
      if (data.success && data.orders.length > 0) {
        setLiveOrders(data.orders);
      }
    } catch {
      // silent — not critical
    }
  }, [restaurantId]);

  const dismissLiveOrder = useCallback((orderId: string) => {
    setDismissedOrderIds((prev) => new Set([...prev, orderId]));
  }, []);

  // Poll every 5s as Realtime fallback
  useEffect(() => {
    if (!quickPhone || quickPhone.length !== 10 || liveOrders.length === 0) return;
    const interval = setInterval(() => fetchLiveOrders(quickPhone), 5_000);
    return () => clearInterval(interval);
  }, [quickPhone, liveOrders.length, fetchLiveOrders]);

  const checkOrderHistory = async (phone: string) => {
    if (phone.length !== 10 || isCheckingHistory) return;
    setIsCheckingHistory(true);
    try {
      const [historyRes] = await Promise.all([
        fetch(`/api/orders/history?phone=${phone}&restaurantId=${restaurantId}`),
        fetchLiveOrders(phone),
      ]);
      const data = await historyRes.json();
      setHistoryChecked(true);
      if (data.success && data.hasHistory) {
        setOrderHistory(data.lastOrder);
      } else {
        setOrderHistory(null);
        setTimeout(() => setQuickReorderDismissed(true), 1800);
      }
    } catch {
      setHistoryChecked(false);
    } finally {
      setIsCheckingHistory(false);
    }
  };

  const handleReorder = () => {
    if (!orderHistory) return;
    const newCart: { [key: string]: number } = {};
    for (const item of orderHistory.items) {
      if (item.isAvailable) newCart[item.id] = item.quantity;
    }
    setCart((prev) => ({ ...prev, ...newCart }));
    setCustomerPhone(quickPhone);
    setQuickReorderDismissed(true);
    setIsBagOpen(true);
  };

  const handleCallWaiter = async () => {
    if (waiterCallCooldownUntil && Date.now() < waiterCallCooldownUntil) {
      setWaiterCallFeedback("cooldown");
      setTimeout(() => setWaiterCallFeedback(null), 2000);
      return;
    }
    if (isCallingWaiter) return;

    setIsCallingWaiter(true);
    try {
      const res = await fetch("/api/waiter-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setWaiterCallFeedback("sent");
        setWaiterCallCooldownUntil(Date.now() + 2 * 60 * 1000);
        setTimeout(() => setWaiterCallFeedback(null), 3000);
      } else if (res.status === 429) {
        setWaiterCallFeedback("cooldown");
        setWaiterCallCooldownUntil(Date.now() + (data.cooldownSeconds || 120) * 1000);
        setTimeout(() => setWaiterCallFeedback(null), 2500);
      }
    } catch (err) {
      console.error("Call waiter error:", err);
    } finally {
      setIsCallingWaiter(false);
    }
  };

  // ─── Filtered categories for search ───
  const filteredCategories = useMemo(() => {
    if (!restaurant) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return restaurant.categories;
    return restaurant.categories
      .map(cat => ({
        ...cat,
        menuItems: cat.menuItems.filter(item =>
          item.name.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.menuItems.length > 0);
  }, [restaurant, searchQuery]);

  const totalFilteredItems = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.menuItems.length, 0),
    [filteredCategories]
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-100 dark:border-zinc-800 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-black dark:text-white font-black uppercase text-[10px] tracking-widest animate-pulse">Initializing Menu</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center bg-white dark:bg-zinc-950 font-sans">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto">
          <Info size={32} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <div>
           <h1 className="text-3xl font-black tracking-tight uppercase dark:text-white">Menu Not Found</h1>
           <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">The QR code might be invalid or outdated.</p>
        </div>
        <Button
            className="bg-black dark:bg-white dark:text-zinc-900 text-white h-12 px-10 rounded-xl font-bold"
            onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F1F5F1] dark:bg-zinc-950 font-sans"
    >
      {/* ─── Hero Header ─── */}
      <div className="relative bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden">

        {/* Decorative blobs using themeColor as accent */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-[0.12] dark:opacity-[0.08] blur-2xl pointer-events-none"
          style={{ backgroundColor: restaurant.themeColor }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-[0.08] dark:opacity-[0.05] blur-xl pointer-events-none"
          style={{ backgroundColor: restaurant.themeColor }}
        />

        <div className="relative z-10 px-5 pt-4 pb-5 sm:px-8 sm:pt-6 sm:pb-6">

          {/* Top row: dark mode + table */}
          <div className="flex items-center justify-end gap-2 mb-5 sm:mb-6">
            <button
              onClick={() => setIsDark((d) => !d)}
              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-zinc-500" />}
            </button>
            <div
              className="h-9 px-4 rounded-xl flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-md"
              style={{ backgroundColor: restaurant.themeColor }}
            >
              Table {tableNumber}
            </div>
          </div>

          {/* Restaurant identity */}
          <div className="flex items-center gap-4">
            {/* Initial avatar */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shrink-0 shadow-lg"
              style={{ backgroundColor: restaurant.themeColor }}
            >
              {restaurant.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-0.5">Welcome to</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-none tracking-tighter uppercase dark:text-white truncate">
                {restaurant.name}
              </h1>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-[10px] font-black uppercase tracking-wider">
              <MapPin size={11} className="shrink-0" />
              {restaurant.address.split(',')[0]}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Star size={11} strokeWidth={3} className="shrink-0" />
              4.9
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
              <Clock size={11} className="shrink-0" />
              15–20m
            </span>
          </div>

        </div>
      </div>

      {/* ─── Content wrapper ─── */}
      <div className="lg:flex lg:items-start">

        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <div className="sticky top-0 h-screen flex flex-col bg-white dark:bg-zinc-900 border-r border-emerald-100/60 dark:border-zinc-800 overflow-hidden">
            {/* Restaurant info */}
            <div className="px-5 py-4 border-b border-emerald-100/40 dark:border-zinc-800">
              <h2 className="font-black text-base text-zinc-900 dark:text-white truncate uppercase tracking-tight">{restaurant.name}</h2>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Table {tableNumber}</p>
            </div>

            {/* Search (desktop sidebar) */}
            <div className="px-4 py-3 border-b border-emerald-100/40 dark:border-zinc-800">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-zinc-400 pointer-events-none shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search dishes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 bg-[#F1F5F1] dark:bg-zinc-800 border border-emerald-100/60 dark:border-zinc-700 rounded-xl pl-8 pr-8 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-300 dark:focus:border-emerald-700 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Category list */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {restaurant.categories.map((cat) => {
                const isActive = activeCategory === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSearchQuery(""); scrollToCategory(cat.id); }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all",
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-[#F1F5F1] dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
                    )}
                  >
                    <span className="text-sm font-bold truncate">{cat.name}</span>
                    <span className={cn("text-[10px] font-black ml-2 shrink-0", isActive ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600")}>
                      {cat.menuItems.filter(i => i.isAvailable).length}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Waiter call at bottom of sidebar */}
            <div className="p-4 border-t border-emerald-100/40 dark:border-zinc-800">
              <button
                onClick={handleCallWaiter}
                disabled={isCallingWaiter || (waiterCallCooldownUntil != null && Date.now() < waiterCallCooldownUntil)}
                className={cn(
                  "w-full h-10 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                  waiterCallFeedback === "sent"
                    ? "bg-green-500 text-white"
                    : waiterCallFeedback === "cooldown"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    : "bg-[#F1F5F1] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 border border-emerald-100/60 dark:border-zinc-700"
                )}
              >
                {waiterCallFeedback === "sent" ? <Check size={14} strokeWidth={3} /> : <Bell size={14} />}
                {waiterCallFeedback === "sent" ? "Notified!" : waiterCallFeedback === "cooldown" ? "Please Wait..." : "Call Waiter"}
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <div className="flex-1 min-w-0 pb-36 sm:pb-32">

          {/* Mobile-only sticky header (search + pills) */}
          <div className="lg:hidden sticky top-0 z-40 bg-[#F1F5F1]/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-emerald-100/60 dark:border-zinc-800">
            {/* Search input */}
            <div className="max-w-2xl mx-auto px-4 pt-3 pb-2">
              <div className="relative flex items-center">
                <Search
                  size={15}
                  className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none shrink-0"
                />
                <input
                  type="text"
                  placeholder="Search dishes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-9 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                    className="absolute right-3 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category pills — hidden when searching */}
            {!searchQuery && (
              <div className="max-w-2xl mx-auto px-4 pb-3 overflow-x-auto scrollbar-hide scroll-smooth flex gap-2 sm:gap-3">
                {restaurant.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={cn(
                      "whitespace-nowrap px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all border shrink-0",
                      activeCategory === cat.id
                        ? "text-white border-transparent shadow-lg"
                        : "bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-100 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    )}
                    style={activeCategory === cat.id
                      ? { backgroundColor: restaurant.themeColor, borderColor: restaurant.themeColor }
                      : undefined
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Search result summary */}
            {searchQuery && (
              <div className="max-w-2xl mx-auto px-4 pb-2.5 flex items-center gap-2">
                <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500">
                  {totalFilteredItems === 0
                    ? "No dishes found"
                    : `${totalFilteredItems} dish${totalFilteredItems !== 1 ? "es" : ""} found`}
                </span>
              </div>
            )}
          </div>

          {/* ─── Live Order Tracking Section ─── */}
          {liveOrders.filter((o) => !dismissedOrderIds.has(o.id)).length > 0 && (
            <div className="max-w-3xl mx-auto px-4 lg:px-8 xl:px-10 pt-5 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <UtensilsCrossed size={12} className="text-zinc-400 dark:text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Your Active Orders
                </span>
              </div>
              <AnimatePresence mode="popLayout">
                {liveOrders
                  .filter((o) => !dismissedOrderIds.has(o.id))
                  .map((order) => (
                    <LiveOrderCard
                      key={order.id}
                      order={order}
                      onDismiss={dismissLiveOrder}
                    />
                  ))}
              </AnimatePresence>
            </div>
          )}

          {/* ─── Quick Reorder Section ─── */}
          <AnimatePresence>
            {!quickReorderDismissed && !isOrderSuccess && !isOrderRejected && !placedOrderId && (
              <motion.div
                key="quick-reorder"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="max-w-3xl mx-auto px-4 lg:px-8 xl:px-10 pt-5"
              >
                {/* Phone input card */}
                {!historyChecked && (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-100">
                        <History size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider leading-none">
                          Ordered here before?
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
                          Enter your number to reorder in one tap
                        </p>
                      </div>
                      <button
                        onClick={() => setQuickReorderDismissed(true)}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[11px] font-black text-zinc-400 dark:text-zinc-500 pointer-events-none select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="10-digit mobile number"
                          value={quickPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setQuickPhone(val);
                            if (val.length === 10) checkOrderHistory(val);
                          }}
                          className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-10 text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none"
                        />
                        {isCheckingHistory && (
                          <Loader2 size={15} className="absolute right-3.5 text-zinc-400 dark:text-zinc-500 animate-spin" />
                        )}
                        {quickPhone.length === 10 && !isCheckingHistory && (
                          <Check size={15} strokeWidth={3} className="absolute right-3.5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Welcome back card */}
                {historyChecked && orderHistory && (() => {
                  const availableItems = orderHistory.items.filter((i) => i.isAvailable);
                  const unavailableItems = orderHistory.items.filter((i) => !i.isAvailable);
                  const reorderTotal = availableItems.reduce(
                    (sum, i) => sum + i.price * i.quantity, 0
                  );
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden"
                    >
                      {/* Header */}
                      <div className="bg-emerald-600 px-4 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                            <RotateCcw size={13} className="text-white" />
                          </div>
                          <div>
                            <p className="text-white font-black text-sm leading-none">
                              Welcome back! 👋
                            </p>
                            <p className="text-zinc-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">
                              Last order · {timeAgoShort(orderHistory.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setQuickReorderDismissed(true)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Item list */}
                      <div className="px-4 py-3 space-y-2.5">
                        {orderHistory.items.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center justify-between gap-3",
                              !item.isAvailable && "opacity-40"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  item.type === "veg" ? "bg-green-500" : "bg-red-500"
                                )}
                              />
                              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                {item.quantity}× {item.name}
                              </span>
                              {!item.isAvailable && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded-md shrink-0">
                                  Sold Out
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 italic shrink-0">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Unavailable warning */}
                      {unavailableItems.length > 0 && availableItems.length > 0 && (
                        <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
                          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            {unavailableItems.length} item{unavailableItems.length > 1 ? "s" : ""} currently
                            sold out — only available items will be added.
                          </p>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="px-4 pb-4">
                        {availableItems.length > 0 ? (
                          <button
                            onClick={handleReorder}
                            className="w-full h-12 bg-white text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200"
                          >
                            <RotateCcw size={14} />
                            Reorder {availableItems.length} item{availableItems.length > 1 ? "s" : ""}
                            <span className="text-zinc-400 dark:text-zinc-500 font-bold normal-case tracking-normal">
                              · ₹{reorderTotal}
                            </span>
                          </button>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                              All your previous items are currently sold out.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Menu Items ─── */}
          <div className="px-4 lg:px-8 xl:px-10 pt-6 lg:pt-8">

            {/* Search empty state */}
            {searchQuery && totalFilteredItems === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <Search size={24} className="text-zinc-300 dark:text-zinc-600" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-black text-sm uppercase tracking-wider">
                  No dishes found
                </p>
                <p className="text-zinc-300 dark:text-zinc-600 text-xs font-medium mt-1">
                  Try a different name
                </p>
                <button
                  onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                  className="mt-5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-emerald-100"
                >
                  Clear Search
                </button>
              </motion.div>
            )}

            {/* Category sections */}
            <div className="space-y-0">
              {filteredCategories.map((cat) => (
                <div key={cat.id} id={cat.id} data-category-id={cat.id} className="scroll-mt-[110px] lg:scroll-mt-8 mb-12">
                  {/* Category header */}
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-base lg:text-lg font-black uppercase tracking-[0.2em] whitespace-nowrap dark:text-white">{cat.name}</h2>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest shrink-0">{cat.menuItems.length} dishes</span>
                  </div>

                  {/* Items grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                    {cat.menuItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "bg-[#F7FAF7] dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group",
                          !item.isAvailable && "opacity-70"
                        )}
                      >
                        {/* Mobile: horizontal layout — content left, image right */}
                        {/* sm+: vertical layout — image top, content below */}
                        <div className="flex sm:flex-col">

                          {/* Card body — left on mobile, bottom on sm+ */}
                          <div className="flex-1 min-w-0 p-3 sm:p-3.5 order-first sm:order-last flex flex-col justify-between gap-2">
                            <div>
                              {/* Veg/non-veg + name */}
                              <div className="flex items-start gap-1.5 mb-1">
                                <div className={cn(
                                  "w-4 h-4 sm:w-5 sm:h-5 rounded border-2 bg-white flex items-center justify-center shrink-0 mt-0.5",
                                  item.type === "veg" ? "border-green-600" : "border-red-600"
                                )}>
                                  <div className={cn(
                                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                                    item.type === "veg" ? "bg-green-600" : "bg-red-600"
                                  )} />
                                </div>
                                <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">
                                  <HighlightText text={item.name} query={searchQuery} />
                                </h3>
                              </div>
                              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium line-clamp-2 sm:line-clamp-2 leading-relaxed">
                                {item.description || "Crafted with the finest ingredients and authentic family recipes."}
                              </p>
                              {/* Prep time on mobile */}
                              {item.prepTimeMinutes && item.prepTimeMinutes > 0 && (
                                <div className="flex items-center gap-1 mt-1 sm:hidden">
                                  <Clock size={9} className="text-zinc-400" />
                                  <span className="text-[9px] font-bold text-zinc-400">~{item.prepTimeMinutes}m</span>
                                </div>
                              )}
                            </div>

                            {/* Price + cart controls */}
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tighter">₹{item.price}</span>

                              {!item.isAvailable ? (
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Sold Out</span>
                              ) : cart[item.id] ? (
                                <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl px-1.5 sm:px-2 py-1.5 shadow-lg">
                                  <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors">
                                    <Minus size={11} />
                                  </button>
                                  <span className="font-black text-xs sm:text-sm w-4 sm:w-5 text-center">{cart[item.id]}</span>
                                  <button onClick={() => addToCart(item.id)} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors">
                                    <Plus size={11} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item.id)}
                                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-100 active:scale-95 transition-all duration-200"
                                >
                                  <Plus size={11} />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Image — right on mobile (fixed width), top on sm+ (square-ish aspect ratio) */}
                          <div className="relative w-36 shrink-0 sm:w-full sm:aspect-[4/3] lg:aspect-square min-h-[120px] sm:min-h-0 order-last sm:order-first overflow-hidden bg-emerald-50 dark:bg-zinc-800">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-100 dark:text-zinc-700" />
                              </div>
                            )}
                            {/* Sold out overlay */}
                            {!item.isAvailable && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <span className="bg-black/70 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Sold Out</span>
                              </div>
                            )}
                            {/* Prep time badge — only on sm+ (mobile shows inline) */}
                            {item.prepTimeMinutes && item.prepTimeMinutes > 0 && (
                              <div className="hidden sm:flex absolute bottom-2 right-2 items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-full">
                                <Clock size={9} />
                                ~{item.prepTimeMinutes}m
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Floating Bag Bar ─── */}
      <AnimatePresence>
        {getTotalItems() > 0 && !isBagOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-4 right-4 z-50 max-w-lg mx-auto"
          >
            <button
              onClick={() => setIsBagOpen(true)}
              className="w-full h-20 bg-black text-white rounded-[28px] flex items-center justify-between px-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)] active:scale-95 transition-all overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                   <ShoppingBag size={20} />
                   <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-black">
                     {getTotalItems()}
                   </span>
                </div>
                <div className="text-left">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Ready to Order</p>
                   <p className="font-black text-xl italic tracking-tighter uppercase leading-none">View Bag</p>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <span className="text-2xl font-black italic tracking-tighter">₹{getTotalPrice()}</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <ChevronRight size={18} />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Call Waiter Button — mobile only (lg:hidden) */}
      <AnimatePresence>
        {!isBagOpen && !showPayment && !isOrderSuccess && !isOrderRejected && (
          <motion.div
            key="call-waiter-btn"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "fixed right-4 z-50 transition-all duration-300 lg:hidden",
              getTotalItems() > 0 ? "bottom-36" : "bottom-8"
            )}
          >
            <button
              onClick={handleCallWaiter}
              disabled={isCallingWaiter || (waiterCallCooldownUntil != null && Date.now() < waiterCallCooldownUntil)}
              className={cn(
                "flex items-center gap-2 h-12 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-2xl active:scale-90 transition-all duration-200 border select-none",
                waiterCallFeedback === "sent"
                  ? "bg-green-500 text-white border-green-400 shadow-green-200"
                  : waiterCallFeedback === "cooldown"
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-100 dark:border-zinc-700 shadow-zinc-200 dark:shadow-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              )}
            >
              {isCallingWaiter ? (
                <Loader2 size={16} className="animate-spin shrink-0" />
              ) : waiterCallFeedback === "sent" ? (
                <Check size={16} strokeWidth={3} className="shrink-0" />
              ) : (
                <Bell
                  size={16}
                  className={cn(
                    "shrink-0",
                    waiterCallFeedback === "cooldown" ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"
                  )}
                />
              )}
              <span>
                {waiterCallFeedback === "sent"
                  ? "Waiter Notified!"
                  : waiterCallFeedback === "cooldown"
                  ? "Please Wait..."
                  : "Call Waiter"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Summary Drawer (Bag) */}
      <AnimatePresence>
        {isBagOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBagOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[40px] z-[70] max-h-[90vh] flex flex-col"
            >
              <div className="px-8 pt-10 pb-6 flex items-center justify-between z-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black uppercase tracking-tight leading-none italic dark:text-white">Bag Summary</h2>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs font-black uppercase tracking-widest">Table {tableNumber} • {getTotalItems()} Items</p>
                </div>
                <button
                  onClick={() => setIsBagOpen(false)}
                  className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all hover:scale-110 active:scale-90 dark:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 scrollbar-hide">
                <div className="space-y-6">
                    {Object.entries(cart).map(([id, qty]) => {
                    const item = restaurant.categories.flatMap(c => c.menuItems).find(i => i.id === id);
                    if (!item) return null;
                    const note = cartNotes[id] || "";
                    return (
                        <div key={id} className="space-y-2.5">
                            {/* Item row */}
                            <div className="flex items-center justify-between gap-6 group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} />
                                    <p className="font-black text-lg tracking-tight uppercase italic leading-none truncate dark:text-white">{item.name}</p>
                                    </div>
                                    <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase italic tracking-wider">₹{item.price} x {qty}</p>
                                </div>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-1 gap-4 shrink-0">
                                    <button onClick={() => removeFromCart(id)} className="w-9 h-9 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-all dark:text-white"><Minus size={14} /></button>
                                    <span className="font-black text-sm w-4 text-center dark:text-white">{qty}</span>
                                    <button onClick={() => addToCart(id)} className="w-9 h-9 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-all dark:text-white"><Plus size={14} /></button>
                                </div>
                                <p className="text-right font-black text-lg italic tracking-tighter w-20 shrink-0 dark:text-white">₹{item.price * qty}</p>
                            </div>

                            {/* Special instructions input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Pencil size={11} className={cn("transition-colors", note ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-300 dark:text-zinc-600")} />
                                </div>
                                <input
                                    type="text"
                                    maxLength={80}
                                    placeholder="Add note… e.g. extra spicy, no onions"
                                    value={note}
                                    onChange={(e) =>
                                        setCartNotes(prev => ({
                                            ...prev,
                                            [id]: e.target.value.slice(0, 80),
                                        }))
                                    }
                                    className={cn(
                                        "w-full h-9 rounded-xl pl-8 pr-12 text-xs font-medium placeholder:text-zinc-300 dark:placeholder:text-zinc-600 transition-all outline-none border",
                                        note
                                            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-zinc-800 dark:text-zinc-200 focus:border-amber-400"
                                            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:border-zinc-300 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-zinc-800"
                                    )}
                                />
                                {note && (
                                    <span className="absolute inset-y-0 right-3 flex items-center text-[9px] font-black text-zinc-300 dark:text-zinc-600 pointer-events-none tabular-nums">
                                        {note.length}/80
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                    })}
                </div>

                <div className="space-y-4 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <span>Menu Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <span>Taxes & Charges</span>
                    <span className="text-green-500">Included</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">Grand Total</span>
                    <span className="text-4xl font-black italic tracking-tighter text-black dark:text-white leading-none">₹{getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 pb-12 bg-white dark:bg-zinc-900 border-t border-zinc-50 dark:border-zinc-800 space-y-6">
                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                        paymentMethod === "ONLINE"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-[1.02]"
                          : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-600"
                      )}
                    >
                      <Smartphone size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Online (UPI)</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                        paymentMethod === "CASH"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-[1.02]"
                          : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-600"
                      )}
                    >
                      <ShoppingBag size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Pay in Cash</span>
                    </button>
                  </div>
                 </div>

                 {/* WhatsApp Opt-in */}
                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">WhatsApp Receipt (Optional)</p>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                       <span className="text-zinc-400 dark:text-zinc-500 font-black text-xs">+91</span>
                     </div>
                     <input
                       type="tel"
                       placeholder="Enter Mobile Number"
                       value={customerPhone}
                       onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                       className="w-full h-16 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl pl-14 pr-6 text-sm font-black tracking-tight dark:text-white focus:border-zinc-900 dark:focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none"
                     />
                     <div className="absolute inset-y-0 right-5 flex items-center">
                        <Smartphone size={18} className="text-zinc-300 dark:text-zinc-600" />
                     </div>
                   </div>
                   <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em] ml-1">
                     Receive your digital bill and order updates instantly on WhatsApp.
                   </p>
                 </div>

                 <Button
                   onClick={handlePlaceOrder}
                   disabled={isOrdering}
                   className="w-full h-16 text-lg font-black rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest italic"
                >
                  {isOrdering ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : paymentMethod === "CASH" ? (
                    <>Place Cash Order <ChevronRight size={24} className="ml-2" strokeWidth={3} /></>
                  ) : (
                    <>Pay & Place Order <ChevronRight size={24} className="ml-2" strokeWidth={3} /></>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center font-black uppercase tracking-[0.2em]">
                        Safe & Secure Kitchen Sync
                    </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* UPI Payment Drawer */}
      <AnimatePresence>
        {showPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[80]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[40px] z-[90] p-6 pb-10 space-y-6 flex flex-col items-center max-h-[92vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-2" />

               <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Complete Payment</p>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase dark:text-white">Scan or Choose App</h2>
                <div className="flex items-center justify-center gap-2 py-2">
                   <span className="text-4xl font-black italic tracking-tighter dark:text-white">₹{getTotalPrice()}</span>
                </div>
              </div>

              {isInAppBrowser && !showDirectOptions && (
                <div className="w-full space-y-6 flex flex-col items-center py-4">
                  <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center animate-pulse">
                     <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                        <Smartphone size={32} className="text-amber-600 dark:text-amber-400" />
                     </div>
                  </div>
                  <div className="text-center space-y-2 px-4">
                     <h3 className="text-xl font-black tracking-tight uppercase dark:text-white">Browser Restricted</h3>
                     <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
                        For higher limits and a smoother payment of <strong>₹{getTotalPrice()}</strong>, please open this menu in <strong>Chrome</strong> or <strong>Safari</strong>.
                     </p>
                  </div>
                  <div className="w-full space-y-3">
                    <button
                      onClick={() => setShowDirectOptions(true)}
                      className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
                    >
                      Continue Anyway
                    </button>
                    <p className="text-[8px] text-center font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                       Tip: Tap the <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded italic">...</code> to open in browser
                    </p>
                  </div>
                </div>
              )}

              {(showDirectOptions || !isInAppBrowser) && (
                <>

               {/* Step 1: Scan / Download */}
               <div className="w-full space-y-4 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-6 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Scan or Save to Pay</span>
                  </div>

                  {/* Dynamic QR Code */}
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-zinc-100 dark:from-zinc-800 to-zinc-50 dark:to-zinc-900 rounded-[40px] -z-10" />
                    <div className="w-56 h-56 bg-white dark:bg-zinc-800 p-4 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                       <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`}
                        alt="UPI QR Code"
                        className="w-full h-full cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleDownloadQR(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(upiUrl)}`)}
                       />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                       Pay ₹{getTotalPrice()}
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleDownloadQR(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(upiUrl)}`)}
                      className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center gap-2"
                    >
                      <Download size={14} />
                      {isDownloading ? "Downloading..." : "Download QR Code"}
                    </button>
                    <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-center px-8 leading-relaxed">
                       Save & scan using PhonePe/GPay &quot;Gallery&quot; to pay from your phone instantly.
                    </p>
                  </div>
               </div>

              {!placedOrderId && (
                <div className="w-full space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700 flex items-center justify-between group active:scale-[0.98] transition-all" onClick={() => copyToClipboard(restaurant.upiId)}>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Merchant UPI ID</p>
                      <p className="text-sm font-black tracking-tight dark:text-white">{restaurant.upiId}</p>
                    </div>
                    <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-600 flex items-center justify-center text-zinc-400 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {copySuccess ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                    <Info size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed italic">
                      Scan the QR above or <strong>Download</strong> it to pay via Gallery. This method is the most reliable way to pay any amount without limits.
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full space-y-6">

                {/* ── STATE 1: Order not yet created — show Pay Now button ── */}
                {!placedOrderId && (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-700 text-center">
                      <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        Scan the QR above from any UPI app, or tap below to pay on this device.
                      </p>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Pay on This Device</span>
                      </div>
                      <Button
                        onClick={handleInitiateOnlinePayment}
                        disabled={isOrdering}
                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 active:scale-95 transition-all outline-none"
                      >
                        {isOrdering ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span>Open UPI & Place Order</span>
                            <ChevronRight size={18} />
                          </div>
                        )}
                      </Button>
                      <p className="text-center text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        Order is placed the moment you tap — no extra step needed
                      </p>
                    </div>
                  </>
                )}

                {/* ── STATE 2: Order placed, UPI opened, customer hasn't returned yet ── */}
                {placedOrderId && !returnedFromUPI && (
                  <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-700 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-emerald-600" size={16} />
                        <span className="text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                          Order Placed — Complete Payment in UPI App
                        </span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold leading-relaxed px-2">
                        Your order is confirmed with the restaurant. Finish the payment in your UPI app and come back here.
                      </p>
                    </div>
                    {/* Fallback for scan-from-other-device case */}
                    <button
                      onClick={() => setReturnedFromUPI(true)}
                      className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors py-2 outline-none"
                    >
                      I&apos;ve Already Paid ↑
                    </button>
                  </div>
                )}

                {/* ── STATE 3: Customer returned from UPI — no action needed ── */}
                {placedOrderId && returnedFromUPI && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                      <Check size={22} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest text-[11px]">
                        Payment Received!
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold leading-relaxed px-2">
                        Your order is with the restaurant. They&apos;re verifying your payment and will start cooking shortly.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Waiting for kitchen confirmation...
                      </span>
                    </div>
                  </div>
                )}

                {/* Go back — only when order not yet placed */}
                {!placedOrderId && !isOrdering && (
                  <button
                    onClick={() => setShowPayment(false)}
                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors py-2 outline-none"
                  >
                    Go Back to Menu
                  </button>
                )}
              </div>
              </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success & Rejection Overlays */}
      <AnimatePresence>
        {isOrderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[120] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-100 dark:shadow-green-900"
            >
              <Check size={48} className="text-white" strokeWidth={4} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white">
                Order Placed!
              </h2>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {paymentMethod === "CASH" ? "Please pay after your meal" : "Payment Verified Successfully"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 w-full max-w-xs space-y-3"
            >
              {/* Kitchen notified card */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 justify-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Kitchen is notified</span>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-relaxed text-center">
                  Your food is being prepared. Enjoy your meal!
                </p>
              </div>

              {/* Estimated prep time card */}
              {estimatedPrepMins && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 20 }}
                  className="p-5 bg-zinc-900 dark:bg-zinc-800 rounded-3xl flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Estimated Ready In</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter leading-none">
                      ~{estimatedPrepMins} <span className="text-sm font-bold text-zinc-400">mins</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={() => {
                setIsOrderSuccess(false);
                setCart({});
                setCartNotes({});
                setIsBagOpen(false);
                setShowPayment(false);
                setReturnedFromUPI(false);
              }}
              className="mt-12 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 active:scale-95 transition-all"
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrderRejected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[120] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mb-6"
            >
              <XCircle size={48} strokeWidth={2} />
            </motion.div>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white">Payment Rejected</h2>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-2">The manager could not verify your payment</p>

            <motion.button
              onClick={() => {
                setIsOrderRejected(false);
                setShowPayment(true);
              }}
              className="mt-12 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 active:scale-95 transition-all"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
