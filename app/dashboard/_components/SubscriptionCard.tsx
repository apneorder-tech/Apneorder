import React, { useState } from "react";
import { Check, Sparkles, CreditCard, Loader2, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

export function SubscriptionCard({ 
  status, 
  expiryDate 
}: { 
  status?: string; 
  expiryDate?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync when returning from payment
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success") {
      const syncStatus = async () => {
        setIsSyncing(true);
        try {
          const idToken = await auth.currentUser?.getIdToken();
          if (!idToken) return;
          
          const res = await fetch("/api/subscriptions/sync", {
            method: "POST",
            headers: { "Authorization": `Bearer ${idToken}` }
          });
          const data = await res.json();
          if (data.success && data.status === "ACTIVE") {
            toast.success("Subscription Active! Refreshing your dashboard...");
            setTimeout(() => window.location.href = "/dashboard", 1500);
          } else {
            console.log("Sync result:", data);
          }
        } catch (e) {
          console.error("Auto-sync error:", e);
        } finally {
          setIsSyncing(false);
        }
      };
      syncStatus();
    }
  }, []);

  const handleSubscribe = async () => {
    if (loading || isSyncing) return;
    if (status === "ACTIVE") {
      toast.info("You already have an active subscription!");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          customerName: currentUser.displayName || "Restaurant Manager",
          customerEmail: currentUser.email || `user_${currentUser.uid}@apneorder.com`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.authLink) {
        toast.loading("Redirecting to secure payment...");
        window.location.href = data.authLink;
      } else {
        toast.error(data.error || "Failed to initiate subscription");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;
      
      const res = await fetch("/api/subscriptions/sync", {
        method: "POST",
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Plan Status: ${data.status}`);
        if (data.status === "ACTIVE") {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch (e) {
      toast.error("Failed to sync status");
    } finally {
      setIsSyncing(false);
    }
  };

  const isActive = status === "ACTIVE";

  return (
    <Card className="relative overflow-hidden border-zinc-100 shadow-2xl shadow-zinc-200/50 rounded-3xl p-8 bg-white group">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Plan</span>
              {isActive && (
                <Badge className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border-none">
                  Active
                </Badge>
              )}
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Premium Monthly</h3>
          </div>
          <div className="bg-zinc-900 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter">₹1,499</span>
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">/ Month</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium italic">
            Unlock the full potential of Apneorder with advanced analytics, unlimited tables, and priority support.
          </p>
        </div>

        <div className="grid gap-4">
           {[
             "Unlimited Orders per Month",
             "Up to 50 Digital Tables",
             "Real-time Dashboard Analytics",
             "Priority WhatsApp Support",
             "Zero Platform Fees on UPI"
           ].map((feature, i) => (
             <div key={i} className="flex items-center gap-3">
               <div className="w-5 h-5 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                 <Check size={12} className="text-zinc-900" strokeWidth={3} />
               </div>
               <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">{feature}</span>
             </div>
           ))}
        </div>

        <div className="pt-4 space-y-4">
          {isActive ? (
             <div className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-zinc-400" />
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Next Billing</p>
                         <p className="text-sm font-black tracking-tight italic">{expiryDate || "N/A"}</p>
                      </div>
                   </div>
                   <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-600">
                      Manage
                   </Button>
                </div>
             </div>
          ) : (
            <div className="space-y-4">
              <Button 
                  onClick={handleSubscribe}
                  disabled={loading || isSyncing}
                  className="w-full h-16 bg-zinc-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-zinc-200 active:scale-95 transition-all text-xs flex items-center gap-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
              
              <Button
                variant="link"
                className="w-full text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-600 gap-2"
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                Already Paid? Refresh Status
              </Button>
            </div>
          )}
        </div>
        
        {!isActive && (
          <p className="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            Secure checkout via Cashfree Payments
          </p>
        )}
      </div>
    </Card>
  );
}
