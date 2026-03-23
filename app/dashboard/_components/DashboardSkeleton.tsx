import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-zinc-100 rounded-xl", className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 sm:p-6 lg:p-7 rounded-[24px] border border-zinc-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2.5">
          <Skeleton className="w-20 h-4 rounded-lg" />
          <Skeleton className="w-32 h-8 rounded-xl" />
        </div>
        <Skeleton className="w-12 h-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-[32px] border border-zinc-100/80 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
}

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

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 h-[400px]">
           <Skeleton className="w-full h-full rounded-2xl" />
        </div>
        <div className="bg-white rounded-3xl p-8 h-[400px]">
           <Skeleton className="w-full h-full rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    </div>
  );
}
