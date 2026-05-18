import React from "react";
import { cn } from "@/lib/utils";

/* ─── Base shimmer block ──────────────────────────────────────────────────── */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-100",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:animate-[shimmer_1.6s_infinite]",
        className
      )}
    />
  );
}

/* ─── Stat card ───────────────────────────────────────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2.5 flex-1 min-w-0">
          <Skeleton className="h-3 w-20 rounded-lg" />
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
        <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

/* ─── Order tab selector ──────────────────────────────────────────────────── */
export function OrderTabSkeleton() {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-100/60 p-1 sm:p-1.5 rounded-xl border border-zinc-200/50 w-full sm:w-fit">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex-1 sm:flex-initial sm:w-28 h-9 sm:h-10 rounded-lg bg-white/70 flex items-center justify-center gap-2 px-4"
        >
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-2.5 w-12 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ─── Order card ──────────────────────────────────────────────────────────── */
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-50 mx-4 sm:mx-6" />

      {/* Items */}
      <div className="p-4 sm:p-6 py-3 sm:py-4 space-y-3 flex-1">
        <Skeleton className="h-3 w-20 rounded" />
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-3.5 w-28 rounded" />
            </div>
            <Skeleton className="h-3.5 w-10 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            <Skeleton className="h-3.5 w-10 rounded" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-50 mx-4 sm:mx-6" />

      {/* Footer */}
      <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Table card ──────────────────────────────────────────────────────────── */
export function TableCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-24 h-3" />
      </div>
      <Skeleton className="w-full h-10 rounded-xl" />
    </div>
  );
}

/* ─── Full dashboard page skeleton (sidebar + content) ───────────────────── */
export function DashboardPageSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#F1F5F1] font-sans">
      {/* Sidebar placeholder */}
      <aside className="hidden lg:flex w-[280px] flex-col sticky top-0 h-screen border-r border-emerald-100/60 bg-white z-50 p-6 gap-6">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <div className="space-y-2 flex-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 lg:h-16 border-b border-zinc-200/60 bg-white px-4 sm:px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          {/* Orders skeleton */}
          <OrdersViewSkeleton />
        </div>
      </main>
    </div>
  );
}

/* ─── Full orders view skeleton (tabs + grid) ─────────────────────────────── */
export function OrdersViewSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <OrderTabSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {[...Array(6)].map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Analytics skeleton ──────────────────────────────────────────────────── */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Range selector */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl w-48">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="flex-1 h-9 rounded-xl" />
        ))}
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl sm:rounded-[28px] p-4 sm:p-5 space-y-4",
              i === 1 ? "bg-emerald-600/10" : "bg-white border border-zinc-100"
            )}
          >
            <div className="flex justify-between items-start">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-5 w-12 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white border border-zinc-100 rounded-2xl sm:rounded-[28px] p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          {/* Bars */}
          <div className="flex items-end gap-2 h-40 sm:h-44 md:h-48">
            {[45, 70, 30, 90, 55, 80, 65].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end h-full">
                <Skeleton className="w-full rounded-xl" style={{ height: `${h}%` }} />
                <Skeleton className="w-full h-2 rounded" />
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="pt-4 border-t border-zinc-50 flex gap-6">
            {["Highest", "Avg", "Total"].map((l) => (
              <div key={l} className="space-y-1">
                <Skeleton className="h-2 w-12 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Top dishes */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl sm:rounded-[28px] p-4 sm:p-6 lg:p-8 space-y-5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-6 w-8 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50">
                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-2.5 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
