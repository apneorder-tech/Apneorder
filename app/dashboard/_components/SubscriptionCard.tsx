import React, { useState, useEffect, useRef } from "react";
import { Check, Sparkles, CreditCard, Loader2, Zap, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function SubscriptionCard({ 
  status, 
  expiryDate,
  isLoading
}: { 
  status?: string; 
  expiryDate?: string;
  isLoading?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activationDone, setActivationDone] = useState(false);
  const [syncAttempts, setSyncAttempts] = useState(0);
  const [syncTimedOut, setSyncTimedOut] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_ATTEMPTS = 15; // poll for ~30s (every 2s)

  // Auto-sync with polling when returning from payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") !== "success") return;

    setIsSyncing(true);
    let attempts = 0;

    const poll = async () => {
      attempts++;
      setSyncAttempts(attempts);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const idToken = session?.access_token;
        if (!idToken) return;

        const res = await fetch("/api/subscriptions/sync", {
          method: "POST",
          headers: { "Authorization": `Bearer ${idToken}` },
        });
        const data = await res.json();

        if (data.success && data.status === "ACTIVE") {
          if (pollRef.current) clearInterval(pollRef.current);
          setActivationDone(true);
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
          return;
        }
      } catch (e) {
        console.error("Sync poll error:", e);
      }

      if (attempts >= MAX_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setIsSyncing(false);
        setSyncTimedOut(true);
      }
    };

    poll(); // first attempt immediately
    pollRef.current = setInterval(poll, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSubscribe = async () => {
    if (loading || isSyncing) return;
    if (status === "ACTIVE") {
      toast.info("You already have an active subscription!");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const idToken = session.access_token;
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          customerName: session.user.user_metadata?.full_name || "Restaurant Manager",
          customerEmail: session.user.email || `user_${session.user.id}@apneorder.com`,
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
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = session?.access_token;
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
  const isPastDue = status === "PAST_DUE";

  // ── Full-page activation overlay (shown after returning from payment) ──
  if (isSyncing || activationDone) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#F1F5F1] dark:bg-zinc-950 flex flex-col overflow-hidden">
        {/* Fake top bar skeleton */}
        <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex items-center px-6 gap-4 shrink-0">
          <div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse ml-2" />
          <div className="ml-auto h-5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Fake sidebar skeleton */}
          <div className="hidden md:flex w-60 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 flex-col gap-3 p-4 shrink-0">
            <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-10 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mt-2" />
            <div className="h-10 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="mt-auto h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>

          {/* Fake content skeleton */}
          <div className="flex-1 p-6 space-y-4 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse border border-zinc-100 dark:border-zinc-800" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse border border-zinc-100 dark:border-zinc-800" />
              ))}
            </div>
            <div className="h-48 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse border border-zinc-100 dark:border-zinc-800" />
          </div>
        </div>

        {/* Activation status card — centred over the skeleton */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-zinc-200/60 dark:shadow-zinc-950 border border-zinc-100 dark:border-zinc-800 p-8 w-full max-w-sm text-center">
            {activationDone ? (
              <>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-emerald-100">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-1">You&apos;re all set!</h2>
                <p className="text-sm text-zinc-400 font-medium">Subscription activated. Loading your dashboard…</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-emerald-100">
                  <Sparkles size={28} className="text-emerald-600 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-1">Activating your plan</h2>
                <p className="text-sm text-zinc-400 font-medium mb-6">
                  Verifying your payment and unlocking premium features…
                </p>

                {/* Animated dots */}
                <div className="flex items-center justify-center gap-1.5 mb-6">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full bg-emerald-400 transition-all duration-300 ${
                        i < Math.min(syncAttempts, 5) ? "w-6 opacity-100" : "w-1.5 opacity-30"
                      }`}
                    />
                  ))}
                </div>

                {syncTimedOut ? (
                  <div className="space-y-3">
                    <p className="text-xs text-amber-600 font-bold">Taking longer than expected.</p>
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw size={14} />
                      Check Again
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
                    This usually takes under 30 seconds
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !status) {
    return (
      <Card className="border-zinc-200/50 shadow-2xl rounded-3xl p-8 animate-pulse">
        <div className="h-8 bg-zinc-100 rounded-lg w-1/3 mb-4" />
        <div className="h-12 bg-zinc-100 rounded-xl w-1/2 mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-zinc-100 rounded w-full" />
          <div className="h-4 bg-zinc-100 rounded w-full" />
          <div className="h-14 bg-zinc-100 rounded-2xl w-full mt-6" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-zinc-200/50 shadow-2xl shadow-zinc-200/50 rounded-3xl p-8 group">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
      
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
              {isPastDue && (
                <Badge className="bg-red-100 text-red-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border-none">
                  Action Required
                </Badge>
              )}
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Premium Monthly</h3>
          </div>
          <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
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
               <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                 <Check size={12} className="text-emerald-600" strokeWidth={3} />
               </div>
               <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">{feature}</span>
             </div>
           ))}
        </div>

        <div className="pt-4 space-y-4">
          {isActive ? (
             <div className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-start">
                   <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-zinc-400" />
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Next Billing</p>
                         <p className="text-sm font-black tracking-tight italic">
                           {expiryDate
                             ? new Date(expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                             : "N/A"}
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          ) : (
            <div className="space-y-4">
              {isPastDue ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Payment Overdue</span>
                  </div>
                  <Button 
                    onClick={handleSubscribe}
                    disabled={loading || isSyncing}
                    className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-red-200 active:scale-95 transition-all text-xs flex items-center gap-3"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        <Zap size={18} fill="currentColor" />
                        Re-Activate Plan
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                    onClick={handleSubscribe}
                    disabled={loading || isSyncing}
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-emerald-200 active:scale-95 transition-all text-xs flex items-center gap-3"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      <Zap size={18} fill="currentColor" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
              )}
              
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
