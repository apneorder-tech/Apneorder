import React from "react";
import { QrCode, ChefHat, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrdersEmptyState({
  activeTab,
}: {
  activeTab: "verifying" | "active" | "completed";
}) {
  const config = {
    verifying: {
      icon: QrCode,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-300",
      title: "No Pending Payments",
      description:
        "Orders will appear here once customers confirm their UPI transfer.",
    },
    active: {
      icon: ChefHat,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-300",
      title: "The Kitchen is Quiet",
      description:
        "New orders will automatically pop up here with a notification sound.",
    },
    completed: {
      icon: Check,
      iconBg: "bg-green-50",
      iconColor: "text-green-300",
      title: "No Orders Completed Yet",
      description:
        "Completed orders for today will show up here once you finish them.",
    },
  };

  const c = config[activeTab];

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-zinc-200 px-6">
      <div
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6",
          c.iconBg
        )}
      >
        <c.icon className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8", c.iconColor)} />
      </div>
      <h3 className="text-sm sm:text-base lg:text-lg font-black text-zinc-900 uppercase tracking-tight">
        {c.title}
      </h3>
      <p className="text-zinc-400 text-[10px] sm:text-[11px] md:text-xs font-medium max-w-[240px] sm:max-w-[260px] md:max-w-[280px] mt-2 leading-relaxed">
        {c.description}
      </p>
    </div>
  );
}
