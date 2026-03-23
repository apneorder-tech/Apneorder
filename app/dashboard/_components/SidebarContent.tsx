import React from "react";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./constants";

export function SidebarContent({
  activeView,
  setActiveView,
  restaurantName,
}: {
  activeView: string;
  setActiveView: (
    v: "orders" | "menu" | "tables" | "analytics" | "settings"
  ) => void;
  restaurantName: string;
}) {
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
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeView === item.id
                ? "bg-zinc-900 text-white shadow-lg"
                : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Store info */}
      <div className="mt-auto p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <div className="flex items-center min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{restaurantName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
