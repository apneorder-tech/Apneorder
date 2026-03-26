import React from "react";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubscriptionLock({ 
  onGoToSettings 
}: { 
  onGoToSettings: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-zinc-100 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-zinc-200 rotation-12">
           <Lock size={32} className="text-zinc-900" />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12">
           <Sparkles size={18} />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
          Premium Only
        </h2>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed">
          This section is part of the <span className="text-zinc-900 font-bold uppercase tracking-widest text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full">Premium Monthly</span> plan. 
          Unlock it to start managing your restaurant like a pro.
        </p>
      </div>

      <div className="mt-10 grid gap-4 w-full max-w-xs">
         <Button 
           onClick={onGoToSettings}
           className="h-14 bg-zinc-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
         >
           Upgrade Now
           <ArrowRight size={16} />
         </Button>
         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
           Just ₹1,499 / Month • Cancel Anytime
         </p>
      </div>
    </div>
  );
}
