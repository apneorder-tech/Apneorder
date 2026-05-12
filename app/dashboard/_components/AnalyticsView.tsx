import React, { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShoppingBag,
  Check,
  ChevronRight,
  AlertTriangle,
  Coins,
  Trophy,
  Info,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardStats } from "./types";
import { formatCurrency } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsSkeleton } from "./DashboardSkeleton";

export function AnalyticsView({ stats, loading = false }: { stats: any, loading?: boolean }) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  const currentData = stats.timeframes?.[timeRange] || {
    chartData: [],
    topItems: [],
  };

  if (loading) return <AnalyticsSkeleton />;

  const maxSales = Math.max(
    ...currentData.chartData.map((d: any) => d.sales),
    1
  );

  const ranges = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ] as const;

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-10 pb-24 lg:pb-10">
      {/* ── Time Range Selector ── */}
      <div className="flex justify-center sm:justify-start">
        <div className="bg-zinc-100 p-1 rounded-2xl flex gap-0.5 sm:gap-1 items-center w-full sm:w-auto">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={cn(
                "flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative",
                timeRange === r.id
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <span className="relative z-10">{r.label}</span>
              {timeRange === r.id && (
                <motion.div
                  layoutId="range-bg"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-zinc-200"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Revenue Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Daily */}
        <Card className="bg-white border border-zinc-100/80 shadow-sm overflow-hidden group rounded-2xl sm:rounded-[28px] hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg">
                DAILY
              </Badge>
            </div>
            <p className="text-zinc-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mb-1">
              Today&apos;s Sale
            </p>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-zinc-900 tracking-tight truncate leading-none">
              {formatCurrency(stats.totalSaleToday)}
            </h3>
          </CardContent>
        </Card>

        {/* Weekly – Hero Card */}
        <Card className="bg-zinc-900 text-white border-none shadow-xl shadow-zinc-300/30 overflow-hidden relative rounded-2xl sm:rounded-[28px]">
          <div className="absolute -top-6 -right-6 sm:-top-4 sm:-right-4">
            <TrendingUp className="text-zinc-700/20 w-16 h-16 sm:w-24 sm:h-24" />
          </div>
          <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <Badge className="bg-white/10 text-white/80 border-none font-black text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg">
                7 DAYS
              </Badge>
            </div>
            <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mb-1">
              Weekly
            </p>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-white tracking-tight truncate leading-none">
              {formatCurrency(stats.salesWeekly)}
            </h3>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card className="bg-white border border-zinc-100/80 shadow-sm overflow-hidden rounded-2xl sm:rounded-[28px] hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg">
                30 DAYS
              </Badge>
            </div>
            <p className="text-zinc-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mb-1">
              Monthly
            </p>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-zinc-900 tracking-tight truncate leading-none">
              {formatCurrency(stats.salesMonthly)}
            </h3>
          </CardContent>
        </Card>

        {/* Yearly */}
        <Card className="bg-white border border-zinc-100/80 shadow-sm overflow-hidden rounded-2xl sm:rounded-[28px] hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <Badge className="bg-green-50 text-green-600 border-none font-black text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg">
                YEARLY
              </Badge>
            </div>
            <p className="text-zinc-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mb-1">
              Annual
            </p>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-zinc-900 tracking-tight truncate leading-none">
              {formatCurrency(stats.salesYearly || 0)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
        {/* ── Sales Trend Bar Chart ── */}
        <Card className="lg:col-span-3 border border-zinc-100/80 shadow-sm bg-white rounded-2xl sm:rounded-[28px] overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Chart Header */}
            <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base lg:text-lg font-black text-zinc-900 uppercase tracking-tight truncate">
                  {timeRange === "week"
                    ? "Weekly"
                    : timeRange === "month"
                      ? "Monthly"
                      : "Yearly"}{" "}
                  Sales
                </h3>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium mt-0.5 hidden sm:block">
                  Revenue distribution over time
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-zinc-400 tracking-wider hidden sm:inline">
                  Revenue
                </span>
              </div>
            </div>

            {/* Chart Body */}
            <div className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
              <div
                className={cn(
                  "flex items-end justify-between h-36 sm:h-44 md:h-48 lg:h-56 gap-[3px] sm:gap-1.5 md:gap-2 lg:gap-3 transition-all duration-500",
                  timeRange === "year"
                    ? "min-w-[480px] sm:min-w-[580px] lg:min-w-full"
                    : "min-w-full"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {currentData.chartData.map((item: any, i: number) => {
                    const hasData = item.sales > 0;
                    const heightPct = hasData
                      ? Math.max((item.sales / maxSales) * 100, 4)
                      : 0;

                    return (
                      <motion.div
                        layout
                        key={`${timeRange}-${i}`}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: i * 0.03,
                          ease: "easeOut",
                        }}
                        className="flex-1 flex flex-col items-center gap-2 sm:gap-3 group h-full justify-end origin-bottom"
                      >
                        {hasData ? (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="w-full rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 relative group/bar"
                                  style={{ height: `${heightPct}%` }}
                                >
                                  <div className="w-full h-full rounded-lg sm:rounded-xl bg-zinc-900 group-hover/bar:bg-zinc-700 transition-colors duration-200 shadow-sm" />
                                  {/* Glow on hover */}
                                  <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-zinc-900/20 blur-md opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 -z-10" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                sideOffset={8}
                                className="bg-zinc-900 text-white border-zinc-700 font-bold text-[10px] sm:text-xs px-2.5 py-1.5 shadow-2xl rounded-lg"
                              >
                                <p className="font-black">
                                  ₹{item.sales.toLocaleString("en-IN")}
                                </p>
                                <p className="text-zinc-400 text-[8px] font-medium mt-0.5">
                                  {item.date}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div className="w-full rounded-lg sm:rounded-xl bg-zinc-50 min-h-[3px]" />
                        )}
                        <span className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate w-full text-center leading-none">
                          {item.date}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Chart Footer Summary */}
            {currentData.chartData.length > 0 && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-zinc-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
                  <div className="shrink-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                      Highest
                    </p>
                    <p className="text-xs sm:text-sm font-black text-zinc-900">
                      {formatCurrency(maxSales)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-zinc-100 shrink-0" />
                  <div className="shrink-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                      Avg
                    </p>
                    <p className="text-xs sm:text-sm font-black text-zinc-900">
                      {formatCurrency(
                        Math.round(
                          currentData.chartData.reduce(
                            (sum: number, d: any) => sum + d.sales,
                            0
                          ) / Math.max(currentData.chartData.length, 1)
                        )
                      )}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-zinc-100 shrink-0 hidden sm:block" />
                  <div className="shrink-0 hidden sm:block">
                    <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                      Total
                    </p>
                    <p className="text-xs sm:text-sm font-black text-zinc-900">
                      {formatCurrency(
                        currentData.chartData.reduce(
                          (sum: number, d: any) => sum + d.sales,
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Top Dishes ── */}
        <Card className="lg:col-span-2 border border-zinc-100/80 shadow-sm bg-white rounded-2xl sm:rounded-[28px] overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8 gap-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base lg:text-lg font-black text-zinc-900 uppercase tracking-tight">
                  Top Dishes
                </h3>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium mt-0.5 hidden sm:block">
                  Most ordered items
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[7px] sm:text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-zinc-200 text-zinc-400 shrink-0 rounded-lg"
              >
                {timeRange === "week"
                  ? "7D"
                  : timeRange === "month"
                    ? "30D"
                    : "1Y"}
              </Badge>
            </div>

            {/* List */}
            <div className="space-y-2 sm:space-y-2.5 flex-1">
              <AnimatePresence mode="popLayout">
                {currentData.topItems.map((item: any, i: number) => (
                  <motion.div
                    layout
                    key={`${timeRange}-${item.name}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="flex items-center justify-between p-2.5 sm:p-3 lg:p-3.5 bg-zinc-50/80 rounded-xl sm:rounded-2xl hover:bg-zinc-100/80 transition-all duration-200 group cursor-default"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 min-w-0">
                      {/* Rank */}
                      <div
                        className={cn(
                          "w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-transform group-hover:scale-110",
                          i === 0
                            ? "bg-amber-100 text-amber-700"
                            : i === 1
                              ? "bg-zinc-200 text-zinc-600"
                              : i === 2
                                ? "bg-orange-100 text-orange-600"
                                : "bg-white border border-zinc-100 text-zinc-500"
                        )}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs lg:text-sm font-black text-zinc-900 truncate leading-tight">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              item.type === "veg"
                                ? "bg-green-500"
                                : "bg-red-500"
                            )}
                          />
                          <p className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                            {item.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-black text-zinc-900 leading-tight">
                        {item.count}
                      </p>
                      <p className="text-[7px] sm:text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
                        orders
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {currentData.topItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 sm:py-14 text-center flex-1">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-200" />
                  </div>
                  <p className="text-zinc-300 text-[11px] sm:text-xs font-bold">
                    No sales data yet
                  </p>
                  <p className="text-zinc-200 text-[9px] sm:text-[10px] font-medium mt-1">
                    Data will appear as orders come in
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Profit Margins ── */}
      {stats.profitData ? (
        <div className="space-y-4 sm:space-y-5">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Profit Margins</h3>
              <p className="text-[10px] text-zinc-400 font-medium">Last 7 days · based on cost prices you set</p>
            </div>
            {stats.profitData.itemsWithoutCost > 0 && (
              <div className="ml-auto flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5">
                <Info className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="text-[10px] font-bold text-amber-700">
                  {stats.profitData.itemsWithoutCost} dish{stats.profitData.itemsWithoutCost > 1 ? "es" : ""} missing cost price
                </span>
              </div>
            )}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="bg-emerald-900 text-white border-none rounded-2xl shadow-lg shadow-emerald-900/20 overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-1">Estimated Profit</p>
                <p className="text-xl sm:text-2xl font-black tracking-tight">{formatCurrency(stats.profitData.totalProfitWeek)}</p>
                <p className="text-emerald-500 text-[9px] font-bold mt-0.5">this week (dishes with cost set)</p>
              </CardContent>
            </Card>
            {stats.profitData.topProfitItem && (
              <Card className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">Top Earner</p>
                  </div>
                  <p className="text-sm font-black text-zinc-900 leading-tight truncate">{stats.profitData.topProfitItem.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                    +{formatCurrency(stats.profitData.topProfitItem.profitContribution)} profit
                  </p>
                </CardContent>
              </Card>
            )}
            {stats.profitData.lossLeaders.length > 0 && (
              <Card className="bg-red-50 border border-red-100 rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <p className="text-red-400 text-[9px] font-black uppercase tracking-widest">Low Margin</p>
                  </div>
                  <p className="text-sm font-black text-red-700 leading-tight">{stats.profitData.lossLeaders.length} dish{stats.profitData.lossLeaders.length > 1 ? "es" : ""}</p>
                  <p className="text-[10px] font-bold text-red-500 mt-0.5">below 20% margin</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Loss-leader alerts */}
          {stats.profitData.lossLeaders.length > 0 && (
            <div className="space-y-2">
              {stats.profitData.lossLeaders.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-black text-red-800 truncate block">&quot;{item.name}&quot;</span>
                    <span className="text-[10px] font-bold text-red-500">
                      Only {item.margin}% margin — selling at ₹{item.price}, costs ₹{item.costPrice}. Consider repricing.
                    </span>
                  </div>
                  <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-1 rounded-lg shrink-0">{item.margin}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Per-item margin bars */}
          <Card className="border border-zinc-100/80 shadow-sm bg-white rounded-2xl sm:rounded-[28px] overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-xs sm:text-sm font-black text-zinc-900 uppercase tracking-tight">Margin per Dish</h4>
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />{"<"}20%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />20–50%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{">"}50%</span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence mode="popLayout">
                  {stats.profitData.items.map((item: any, i: number) => {
                    const barColor =
                      item.margin < 20 ? "bg-red-400"
                      : item.margin < 50 ? "bg-amber-400"
                      : "bg-emerald-500";
                    const textColor =
                      item.margin < 20 ? "text-red-600"
                      : item.margin < 50 ? "text-amber-600"
                      : "text-emerald-600";

                    return (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.type === "veg" ? "bg-green-500" : "bg-red-500")} />
                            <span className="text-xs font-black text-zinc-800 truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-bold text-zinc-400">
                              ₹{item.costPrice}→₹{item.price}
                            </span>
                            {item.quantitySold > 0 && (
                              <span className="text-[9px] font-bold text-zinc-400">
                                · {item.quantitySold}× = {formatCurrency(item.profitContribution)}
                              </span>
                            )}
                            <span className={cn("text-[10px] font-black w-10 text-right", textColor)}>
                              {item.margin}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(item.margin, 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                            className={cn("h-full rounded-full", barColor)}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* No cost prices set yet — prompt */
        <Card className="border border-dashed border-zinc-200 bg-zinc-50/50 rounded-2xl sm:rounded-[28px]">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tight mb-1">Unlock Profit Analytics</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Add a cost price to your dishes in the <span className="font-black text-zinc-700">Menu</span> tab.
                You&apos;ll see margin %, your most profitable dish, and low-margin alerts here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}