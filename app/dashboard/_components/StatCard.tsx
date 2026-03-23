import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card
      className={cn(
        "border border-zinc-200/60 rounded-2xl bg-white",
        "shadow-none hover:shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:border-zinc-300/60"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[12px] sm:text-[13px] font-medium text-zinc-500 leading-none truncate">
              {label}
            </p>
            <p
              className={cn(
                "text-xl sm:text-2xl font-extrabold text-zinc-900",
                "leading-none tracking-tight tabular-nums"
              )}
            >
              {value}
            </p>
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}