import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./constants";

export function MobileBottomNav({
  activeView,
  setActiveView,
}: {
  activeView: string;
  setActiveView: (v: any) => void;
}) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 px-1 sm:px-2 pb-safe z-40">
      <div className="flex items-center justify-around py-1.5 sm:py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all min-w-0 flex-1 relative",
              activeView === item.id ? "text-emerald-600" : "text-zinc-400"
            )}
          >
            <item.icon
              className="w-5 h-5"
              strokeWidth={activeView === item.id ? 2.5 : 2}
            />
            <span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">
              {item.id === "tables"
                ? "Tables"
                : item.id === "analytics"
                  ? "Stats"
                  : item.label}
            </span>
            {activeView === item.id && (
              <motion.div
                layoutId="bottomNav"
                className="absolute bottom-[-6px] sm:bottom-[-8px] w-6 sm:w-8 h-0.5 sm:h-1 bg-emerald-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
