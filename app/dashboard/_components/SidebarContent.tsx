import { UtensilsCrossed, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "./constants";

export function SidebarContent({
  activeView,
  setActiveView,
  restaurantName,
  subscriptionStatus,
  loading,
  onSendTestOrder,
  onLogout,
  subscription,
}: {
  activeView: string;
  setActiveView: (
    v: "orders" | "menu" | "tables" | "analytics" | "settings" | "plans"
  ) => void;
  restaurantName: string;
  subscriptionStatus?: string;
  loading?: boolean;
  onSendTestOrder?: () => void;
  onLogout?: () => void;
  subscription?: any;
}) {
  const isActive = subscriptionStatus === "ACTIVE";
  return (
    <div className="flex flex-col h-full p-5 xl:p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 lg:mb-12">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <UtensilsCrossed size={20} />
        </div>
        <span className="text-lg font-black tracking-tight text-zinc-900">
          APNE ORDER
        </span>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isPremium = ["orders", "menu", "tables", "analytics"].includes(item.id);
          const isLocked = isPremium && !isActive && !loading;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                activeView === item.id
                  ? "bg-zinc-900 text-white shadow-lg"
                  : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {isLocked && (
                <Lock size={12} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Store info */}
      <div className="mt-auto space-y-2">
        {onSendTestOrder && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-dashed border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 text-[10px] font-black uppercase tracking-widest text-zinc-500"
            onClick={onSendTestOrder}
          >
            Send Test Order
          </Button>
        )}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 italic">
          <div className="flex items-center min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] font-bold truncate text-zinc-400">Store: {restaurantName}</p>
            </div>
          </div>
        </div>
        {onLogout && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-zinc-400 hover:text-red-500 font-bold text-xs"
            onClick={onLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
