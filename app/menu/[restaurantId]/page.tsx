"use client"

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, ChevronRight, Star, Clock, 
  MapPin, Phone, Info, X, Plus, Minus, Check 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`/api/menu/${restaurantId}`);
        const data = await res.json();
        if (data.success) {
          setRestaurant(data.restaurant);
        }
      } catch (err) {
        console.error("Fetch Menu Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [restaurantId]);

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
    setLoading(true);
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
        setCart({});
        setIsBagOpen(false);
        alert("Order placed successfully! Please wait while we prepare your meal.");
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Place Order Error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading Menu...</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center bg-white font-sans">
      <div>
        <h1 className="text-4xl font-bold mb-4">Restaurant Not Found</h1>
        <p className="text-zinc-500 mb-8">The menu you're looking for doesn't exist or has been moved.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-32">
      {/* Header */}
      <div 
        className="h-64 relative flex items-end p-6"
        style={{ backgroundColor: restaurant.themeColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative text-white z-10 w-full">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold leading-tight">{restaurant.name}</h1>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Table {tableNumber}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1"><MapPin size={14} /> {restaurant.address.split(',')[0]}</span>
            <span className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /> 4.8</span>
            <span className="flex items-center gap-1"><Clock size={14} /> 20-30m</span>
          </div>
        </div>
      </div>

      {/* Categories & Menu */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {restaurant.categories.map((cat) => (
              <button 
                key={cat.id}
                className="whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-zinc-100 active:scale-95"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {restaurant.categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <h2 className="text-2xl font-bold px-2">{cat.name}</h2>
              <div className="grid gap-4">
                {cat.menuItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className={cn("flex-1 space-y-1", !item.isAvailable && "opacity-50")}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} title={item.type === 'veg' ? 'Veg' : 'Non-Veg'} />
                          <h3 className="font-bold text-lg">{item.name}</h3>
                        </div>
                        <p className="text-zinc-500 text-sm line-clamp-2">{item.description || "A delicious must-try dish from our kitchen."}</p>
                        <p className="text-xl font-black pt-2">₹{item.price}</p>
                      </div>
                      
                      <div className="shrink-0">
                        {!item.isAvailable ? (
                           <div className="bg-zinc-100 text-zinc-400 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-zinc-200">
                             Sold Out
                           </div>
                        ) : cart[item.id] ? (
                          <div className="flex items-center bg-zinc-900 text-white rounded-full p-1 gap-4 shadow-lg">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold min-w-[1ch] text-center">{cart[item.id]}</span>
                            <button 
                              onClick={() => addToCart(item.id)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => addToCart(item.id)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 font-bold h-11"
                          >
                            ADD
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-4 right-4 z-50 max-w-lg mx-auto"
          >
            <button 
              onClick={() => setIsBagOpen(true)}
              className="w-full h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-between px-6 shadow-2xl active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center relative">
                   <ShoppingBag size={18} />
                   <span className="absolute -top-2 -right-2 bg-white text-zinc-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                     {getTotalItems()}
                   </span>
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Your Order Bag</p>
                   <p className="font-bold text-lg leading-none">View Cart</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black">₹{getTotalPrice()}</span>
                <ChevronRight size={20} />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-6 pt-8 pb-4 flex items-center justify-between border-b border-zinc-50 z-10">
                <div>
                  <h2 className="text-2xl font-black">Review Order</h2>
                  <p className="text-zinc-400 text-sm font-medium">Table {tableNumber} • {getTotalItems()} items</p>
                </div>
                <button 
                  onClick={() => setIsBagOpen(false)}
                  className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = restaurant.categories.flatMap(c => c.menuItems).find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <div className={cn("w-2 h-2 rounded-full", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} />
                           <p className="font-bold">{item.name}</p>
                        </div>
                        <p className="text-zinc-400 text-xs font-medium">₹{item.price} x {qty}</p>
                      </div>
                      <div className="flex items-center bg-zinc-100 rounded-full p-1 gap-4">
                        <button onClick={() => removeFromCart(id)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 rounded-full transition-colors leading-none"><Minus size={14} /></button>
                        <span className="font-bold text-sm">{qty}</span>
                        <button onClick={() => addToCart(id)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 rounded-full transition-colors leading-none"><Plus size={14} /></button>
                      </div>
                      <p className="text-right font-bold w-16">₹{item.price * qty}</p>
                    </div>
                  );
                })}

                <div className="space-y-3 pt-6 border-t border-zinc-100">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Restaurant Charges</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-2">
                    <span>Total Amount</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                </div>

                <Button 
                   onClick={handlePlaceOrder}
                   className="w-full h-16 text-lg font-black rounded-2xl bg-zinc-900 text-white shadow-xl mt-4"
                >
                  Place Order <Check size={20} className="ml-2" />
                </Button>
                <p className="text-[10px] text-zinc-400 text-center font-medium uppercase tracking-widest pb-4">
                  By placing order you agree to restaurant terms
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
