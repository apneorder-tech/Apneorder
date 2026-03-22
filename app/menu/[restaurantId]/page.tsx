"use client"

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info, Loader2, ShoppingBag, ChevronRight, Star, Clock, MapPin, X, Plus, Minus, Check, Smartphone, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  type: string; // "veg" or "non-veg"
  isAvailable: boolean;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[]; // From schema.prisma
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  upiId: string;
  themeColor: string;
  categories: Category[];
}

export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.restaurantId as string;
  const tableNumber = searchParams.get("table") || "1";

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isBagOpen, setIsBagOpen] = useState(false);

  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  const [showPayment, setShowPayment] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!placedOrderId || isOrderSuccess) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${placedOrderId}/status`);
        const data = await res.json();
        // If status is no longer payment_pending, it means manager approved or it's moving
        if (data.success && data.order.status !== "payment_pending") {
          setIsOrderSuccess(true);
          setPlacedOrderId(null);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
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

  // Handle intersection observer for active category
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

  const handlePlaceOrder = async () => {
    if (getTotalItems() === 0) return;
    setIsOrdering(true);
    
    // Trigger UPI App deep link immediately on user click to avoid browser blockage
    if (upiUrl) {
      window.location.href = upiUrl;
    }

    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const item = restaurant!.categories.flatMap(c => c.menuItems).find(i => i.id === id);
        return {
          id,
          quantity: qty,
          price: item?.price || 0,
        };
      });

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
          items: orderItems,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlacedOrderId(data.orderId);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Place Order Error:", err);
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-black rounded-full animate-spin" />
        <p className="text-black font-black uppercase text-[10px] tracking-widest animate-pulse">Initializing Menu</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center bg-white font-sans">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto">
          <Info size={32} className="text-zinc-400" />
        </div>
        <div>
           <h1 className="text-3xl font-black tracking-tight uppercase">Menu Not Found</h1>
           <p className="text-zinc-500 font-medium mt-2">The QR code might be invalid or outdated.</p>
        </div>
        <Button 
            className="bg-black text-white h-12 px-10 rounded-xl font-bold"
            onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const totalPrice = getTotalPrice();
  // Format amount: drop .00 for whole numbers to be more compatible with some UPI apps
  const amParam = totalPrice % 1 === 0 ? totalPrice.toFixed(0) : totalPrice.toFixed(2);
  
  const upiUrl = restaurant ? `upi://pay?pa=${restaurant.upiId.trim()}&pn=${encodeURIComponent(restaurant.name)}&am=${amParam}&cu=INR&tn=${encodeURIComponent(`Order from ${restaurant.name}`)}` : "";
  const upiIdOnlyUrl = restaurant ? `upi://pay?pa=${restaurant.upiId.trim()}&pn=${encodeURIComponent(restaurant.name)}` : "";

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-zinc-50 font-sans pb-32"
    >
      {/* ─── Success Overlay ─── */}
      <AnimatePresence>
        {isOrderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none">Order Sent!</h2>
                <p className="text-zinc-500 font-medium italic">Your meal is being prepared with love.</p>
              </div>
              <Button 
                onClick={() => setIsOrderSuccess(false)}
                className="w-full h-14 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Continue Browsing
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative">
        <div 
            className="h-72 relative flex items-end p-8"
            style={{ backgroundColor: restaurant.themeColor }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative text-white z-10 w-full">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Welcome to</p>
                    <h1 className="text-4xl font-black leading-none tracking-tighter uppercase italic">{restaurant.name}</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                Table {tableNumber}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full"><MapPin size={12} /> {restaurant.address.split(',')[0]}</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-black rounded-full"><Star size={12} strokeWidth={3} /> 4.9</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 rounded-full"><Clock size={12} /> 15-20m</span>
            </div>
            </div>
        </div>
      </div>

      {/* Categories Bar - Sticky */}
      <div className="sticky top-0 z-40 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-100 py-4">
        <div className="max-w-2xl mx-auto px-4 overflow-x-auto no-scrollbar scroll-smooth flex gap-3">
            {restaurant.categories.map((cat) => (
                <button 
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={cn(
                        "whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all border shrink-0",
                        activeCategory === cat.id
                            ? "bg-black text-white border-black shadow-lg"
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                    )}
                >
                    {cat.name}
                </button>
            ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="space-y-16">
          {restaurant.categories.map((cat) => (
            <div key={cat.id} id={cat.id} data-category-id={cat.id} className="space-y-8 scroll-mt-24">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-black uppercase tracking-[0.25em] whitespace-nowrap">{cat.name}</h2>
                <div className="h-[1px] w-full bg-zinc-200" />
              </div>

              <div className="grid gap-8">
                {cat.menuItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="flex justify-between items-start gap-6">
                      <div className={cn("flex-1 space-y-2", !item.isAvailable && "opacity-40")}>
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-2 h-2 rounded-full ring-4 ring-zinc-50 shadow-sm", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} />
                          <h3 className="font-black text-xl tracking-tight leading-none uppercase italic">{item.name}</h3>
                        </div>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">{item.description || "Crafted with the finest ingredients and authentic family recipes."}</p>
                        <p className="text-2xl font-black tracking-tighter">₹{item.price}</p>
                      </div>
                      
                      <div className="shrink-0 pt-1">
                        {!item.isAvailable ? (
                           <div className="px-4 py-2 bg-zinc-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200">
                             Sold Out
                           </div>
                        ) : cart[item.id] ? (
                          <div className="flex flex-col items-center bg-zinc-950 text-white rounded-3xl p-1 gap-1 shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
                            <button 
                              onClick={() => addToCart(item.id)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-2xl mb-1"
                            >
                              <Plus size={16} />
                            </button>
                            <span className="font-black text-lg h-6 flex items-center justify-center">{cart[item.id]}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-2xl mt-1"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => addToCart(item.id)}
                            className="bg-zinc-900 hover:bg-black text-white rounded-2xl flex flex-col items-center justify-center w-12 h-16 shadow-xl hover:scale-110 active:scale-90 transition-all duration-300 group"
                          >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-[9px] font-black uppercase mt-1">Add</span>
                          </button>
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

      {/* Floating Bag Bar */}
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
              {/* Shine effect */}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[70] max-h-[90vh] flex flex-col"
            >
              <div className="px-8 pt-10 pb-6 flex items-center justify-between z-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black uppercase tracking-tight leading-none italic">Bag Summary</h2>
                  <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">Table {tableNumber} • {getTotalItems()} Items</p>
                </div>
                <button 
                  onClick={() => setIsBagOpen(false)}
                  className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all hover:scale-110 active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 no-scrollbar">
                <div className="space-y-6">
                    {Object.entries(cart).map(([id, qty]) => {
                    const item = restaurant.categories.flatMap(c => c.menuItems).find(i => i.id === id);
                    if (!item) return null;
                    return (
                        <div key={id} className="flex items-center justify-between gap-6 group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                <div className={cn("w-2 h-2 rounded-full", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} />
                                <p className="font-black text-lg tracking-tight uppercase italic leading-none truncate">{item.name}</p>
                                </div>
                                <p className="text-zinc-400 text-xs font-bold uppercase italic tracking-wider">₹{item.price} x {qty}</p>
                            </div>
                            <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-1 gap-4">
                                <button onClick={() => removeFromCart(id)} className="w-9 h-9 flex items-center justify-center hover:bg-zinc-200 rounded-xl transition-all"><Minus size={14} /></button>
                                <span className="font-black text-sm w-4 text-center">{qty}</span>
                                <button onClick={() => addToCart(id)} className="w-9 h-9 flex items-center justify-center hover:bg-zinc-200 rounded-xl transition-all"><Plus size={14} /></button>
                            </div>
                            <p className="text-right font-black text-lg italic tracking-tighter w-20">₹{item.price * qty}</p>
                        </div>
                    );
                    })}
                </div>

                <div className="space-y-4 pt-8 border-t border-zinc-100">
                  <div className="flex justify-between text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Menu Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Taxes & Charges</span>
                    <span className="text-green-500">Included</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Grand Total</span>
                    <span className="text-4xl font-black italic tracking-tighter text-black leading-none">₹{getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 pb-12 bg-white border-t border-zinc-50">
                <Button 
                   onClick={() => setShowPayment(true)}
                   className="w-full h-16 text-lg font-black rounded-3xl bg-black text-white shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest italic"
                >
                  Pay & Place Order <ChevronRight size={24} className="ml-2" strokeWidth={3} />
                </Button>
                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-zinc-400 text-center font-black uppercase tracking-[0.2em]">
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[90] p-8 space-y-8 flex flex-col items-center"
            >
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mb-2" />
              
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Complete Payment</p>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Choose Payment App</h2>
                <div className="flex items-center justify-center gap-2 py-2">
                   <span className="text-4xl font-black italic tracking-tighter">₹{getTotalPrice()}</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                {[
                  { name: "Google Pay", id: "gpay", color: "bg-white", icon: "https://www.gstatic.com/images/branding/product/1x/gpay_64dp.png" },
                  { name: "PhonePe", id: "phonepe", color: "bg-white", icon: "https://freelogopng.com/images/all_img/1664035860phonepe-logo-png.png" },
                  { name: "Paytm", id: "paytm", color: "bg-white", icon: "https://static.vecteezy.com/system/resources/previews/021/515/009/non_2x/paytm-logo-vector-paytm-icon-free-vector.jpg" },
                  { name: "Any App", id: "any", color: "bg-zinc-100", icon: null }
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => !placedOrderId && handlePlaceOrder()}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-3xl border border-zinc-100 space-y-3 transition-all active:scale-95",
                      placedOrderId ? "opacity-50 grayscale cursor-not-allowed" : "hover:bg-zinc-50 hover:border-zinc-200"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden", app.color)}>
                      {app.icon ? (
                        <img src={app.icon} alt={app.name} className="w-full h-full object-cover p-2" />
                      ) : (
                        <Smartphone size={24} className="text-zinc-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{app.name}</span>
                  </button>
                ))}
              </div>

              {!placedOrderId && (
                <div className="w-full space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300 bg-white px-4">
                      Or Pay Manually
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex items-center justify-between group active:scale-[0.98] transition-all" onClick={() => copyToClipboard(restaurant.upiId)}>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Merchant UPI ID</p>
                      <p className="text-sm font-black tracking-tight">{restaurant.upiId}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
                      {copySuccess ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                        window.location.href = upiIdOnlyUrl;
                        if (!placedOrderId) handlePlaceOrder();
                    }}
                    className="w-full py-3 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    Open Manual Pay App
                  </button>

                  <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <Info size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">
                      If you see a &quot;₹2,000 limit&quot; warning, it may be because you scanned the table QR with a payment app. For higher limits, please open this menu in <strong>Chrome</strong> or <strong>Safari</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full space-y-6">
                <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 text-center">
                  {placedOrderId ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-zinc-900" size={16} />
                        <span className="text-zinc-900 font-black uppercase tracking-widest text-[10px]">Verifying Payment...</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] font-bold leading-relaxed px-4">
                        We&apos;re waiting for the restaurant to confirm your payment. Please stay on this screen.
                      </p>
                      <button 
                        onClick={() => upiUrl && (window.location.href = upiUrl)}
                        className="flex items-center gap-1.5 mx-auto px-4 py-2 bg-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-900 active:scale-95 transition-all mt-4 border border-zinc-200"
                      >
                        <Smartphone size={10} />
                        Retry Opening Payment App
                      </button>
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-xs font-bold leading-relaxed">
                      Choose your preferred app to pay. Your order will be placed automatically!
                    </p>
                  )}
                </div>

                {!placedOrderId ? (
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={isOrdering}
                    className="w-full h-16 bg-zinc-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 active:scale-95 transition-all outline-none"
                  >
                    {isOrdering ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <span>Place Order & Pay</span>
                        <ChevronRight size={18} />
                      </div>
                    )}
                  </Button>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 animate-pulse">
                      Do not close this window
                    </p>
                  </div>
                )}

                {!isOrdering && (
                  <button 
                    onClick={() => {
                      if (placedOrderId) {
                        if (confirm("Are you sure you want to go back? Your order is currently being verified.")) {
                          setShowPayment(false);
                        }
                      } else {
                        setShowPayment(false);
                      }
                    }}
                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors py-2 outline-none"
                  >
                    {placedOrderId ? "Cancel & Go Back" : "Go Back to Menu"}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
