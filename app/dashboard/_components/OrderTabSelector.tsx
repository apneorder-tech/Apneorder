import React from "react";
import { Clock, ChefHat, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderTabSelector({
  activeTab,
  setActiveTab,
  verifyingCount,
  activeCount,
  completedCount,
}: {
  activeTab: "verifying" | "active" | "completed";
  setActiveTab: (tab: "verifying" | "active" | "completed") => void;
  verifyingCount: number;
  activeCount: number;
  completedCount: number;
}) {
  const tabs = [
    {
      id: "verifying" as const,
      label: "Verifying",
      shortLabel: "Verify",
      icon: Clock,
      count: verifyingCount,
      activeIconColor: "text-purple-500",
      countBg: "bg-purple-600",
      pulse: true,
    },
    {
      id: "active" as const,
      label: "Active",
      shortLabel: "Active",
      icon: ChefHat,
      count: activeCount,
      activeIconColor: "text-blue-500",
      countBg: "bg-zinc-900",
      pulse: false,
    },
    {
      id: "completed" as const,
      label: "Completed",
      shortLabel: "Done",
      icon: Check,
      count: completedCount,
      activeIconColor: "text-green-500",
      countBg: "bg-green-600",
      pulse: false,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-100/60 p-1 sm:p-1.5 rounded-xl border border-zinc-200/50 w-full sm:w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 sm:flex-initial px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all relative flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2",
                isActive
                  ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50"
              )}
            >
              <tab.icon
                className={cn(
                  "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0",
                  isActive ? tab.activeIconColor : ""
                )}
              />

              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>

              {tab.count > 0 && (
                <span
                  className={cn(
                    "text-white text-[7px] sm:text-[8px] md:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded-full leading-none min-w-[14px] sm:min-w-[16px] md:min-w-[18px] text-center",
                    tab.countBg,
                    tab.pulse && "animate-pulse"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
