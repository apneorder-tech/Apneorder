import React from "react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "./constants";
import { Order } from "./types";

export function StatusBadge({ status }: { status: Order["status"] }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shadow-sm",
        config.bg,
        config.text,
        config.border
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
      {config.label}
    </div>
  );
}
