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

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  // Safe color mapping for Tailwind JIT
  const colorMap: Record<string, { bg: string; icon: string }> = {
    "text-orange-600": { bg: "bg-orange-50", icon: "text-orange-600" },
    "text-green-600": { bg: "bg-green-50", icon: "text-green-600" },
    "text-blue-600": { bg: "bg-blue-50", icon: "text-blue-600" },
    "text-purple-600": { bg: "bg-purple-50", icon: "text-purple-600" },
    "text-zinc-600": { bg: "bg-zinc-50", icon: "text-zinc-600" },
  };

  const { bg: bgColorClass } = colorMap[color] || colorMap["text-zinc-600"];

  return (
    <Card className="border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[24px] overflow-hidden bg-white group">
      <CardContent className="p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 leading-none">
              {label}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight flex items-baseline gap-1">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
              bgColorClass
            )}
          >
            <Icon className="w-6 h-6 text-zinc-900" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
