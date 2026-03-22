"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  BarChart3,
  Check,
  Clock,
  Info,
  LayoutDashboard,
  Loader2,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  QrCode,
  UtensilsCrossed,
  Settings,
  ChefHat,
  XCircle,
  Bell,
  Copy,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { User, RecaptchaVerifier } from "firebase/auth";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// ─── Supabase Client ───
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

// ─── Types ───
interface OrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string; type: string };
}

interface Order {
  id: string;
  table: { tableNumber: string };
  totalAmount: number;
  status:
    | "payment_pending"
    | "pending"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  transactionId: string | null;
  createdAt: string;
  orderItems: OrderItem[];
  paymentMethod: "ONLINE" | "CASH";
}

interface ManageMenuItem {
  id: string;
  name: string;
  price: number;
  type: string;
  isAvailable: boolean;
}

interface ManageCategory {
  id: string;
  name: string;
  menuItems: ManageMenuItem[];
}

interface ManageTable {
  id: string;
  tableNumber: string;
  qrCodeUrl: string;
}

// ─── Constants ───
const ORDER_STATUS_CONFIG = {
  payment_pending: {
    label: "Awaiting Payment",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  pending: {
    label: "New Order",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  preparing: {
    label: "Preparing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  ready: {
    label: "Ready",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-zinc-50",
    text: "text-zinc-600",
    border: "border-zinc-200",
    dot: "bg-zinc-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
  },
} as const;

const NAV_ITEMS = [
  { id: "orders" as const, icon: LayoutDashboard, label: "Orders" },
  { id: "menu" as const, icon: UtensilsCrossed, label: "Menu" },
  { id: "tables" as const, icon: QrCode, label: "Tables & QR" },
  { id: "analytics" as const, icon: BarChart3, label: "Analytics" },
  { id: "settings" as const, icon: Settings, label: "Settings" },
];

// ─── Helpers ───
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Subcomponents ───

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap",
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
          <div
            className={cn(
              "p-2 sm:p-2.5 rounded-xl bg-zinc-50 shrink-0",
              color
            )}
          >
            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">
              {label}
            </p>
            <p className="text-base sm:text-lg md:text-xl font-black text-zinc-900 tracking-tight truncate">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsView({ stats }: { stats: any }) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  
  const currentData = stats.timeframes?.[timeRange] || { chartData: [], topItems: [] };
  const maxSales = Math.max(...currentData.chartData.map((d: any) => d.sales), 1);

  const ranges = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" }
  ] as const;

  return (
    <div className="space-y-6 lg:space-y-10 pb-20">
      {/* Time Range Selector */}
      <div className="flex justify-center sm:justify-start">
        <div className="bg-zinc-100 p-1 rounded-2xl flex gap-1 items-center">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
                timeRange === r.id ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
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

      {/* Sales Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white border-none shadow-sm overflow-hidden group rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <BarChart3 size={20} />
              </div>
              <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px]">DAILY</Badge>
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Sale Today</p>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">{formatCurrency(stats.totalSaleToday)}</h3>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 text-white border-none shadow-xl shadow-zinc-200/50 overflow-hidden relative rounded-[32px]">
          <div className="absolute top-0 right-0 p-4">
             <TrendingUp className="text-zinc-700 w-20 h-20 -mr-6 -mt-6 opacity-20" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
              <Badge className="bg-white/10 text-white border-none font-black text-[10px]">7 DAYS</Badge>
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Weekly Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{formatCurrency(stats.salesWeekly)}</h3>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm overflow-hidden rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShoppingBag size={20} />
              </div>
              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">30 DAYS</Badge>
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Monthly Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">{formatCurrency(stats.salesMonthly)}</h3>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm overflow-hidden rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Check size={20} />
              </div>
              <Badge className="bg-green-50 text-green-600 border-none font-black text-[10px]">YEARLY</Badge>
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Annual Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">{formatCurrency(stats.salesYearly || 0)}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Sales Trend (Bar Chart CSS) */}
        <Card className="border-none shadow-sm bg-white p-6 sm:p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
              {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Sales Trend
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-zinc-900" />
               <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Revenue</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            <div 
              className={cn(
                "flex items-end justify-between h-56 gap-1.5 sm:gap-3 px-2 transition-all duration-500",
                timeRange === 'year' ? "min-w-[650px] sm:min-w-full" : "min-w-full"
              )}
            >
              <AnimatePresence mode="popLayout">
                {currentData.chartData.map((item: any, i: number) => {
                  const hasData = item.sales > 0;
                  return (
                    <motion.div 
                      layout
                      key={`${timeRange}-${i}`}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      className="flex-1 flex flex-col items-center gap-4 group h-full justify-end origin-bottom"
                    >
                      {hasData ? (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div 
                              className="w-full bg-zinc-50 rounded-xl relative flex items-end min-h-[4px] transition-all duration-300 cursor-pointer"
                              style={{ height: `${(item.sales / maxSales) * 100}%` }}
                            >
                               <div className="w-full transition-all duration-500 h-full rounded-xl bg-zinc-900 shadow-sm" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            sideOffset={10}
                            className="bg-black text-white border-zinc-800 font-bold text-[10px] px-2 py-1 shadow-2xl animate-in fade-in zoom-in duration-200"
                          >
                            <p>₹{item.sales.toLocaleString('en-IN')}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div 
                          className="w-full bg-zinc-50 rounded-xl relative flex items-end min-h-[4px]"
                          style={{ height: '0%' }}
                        >
                           <div className="w-full h-full rounded-xl bg-zinc-100" />
                        </div>
                      )}
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate w-full text-center">{item.date}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Top Items */}
        <Card className="border-none shadow-sm bg-white p-6 sm:p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Top Dishes</h3>
            <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 border-zinc-200 text-zinc-500">
              {timeRange === 'week' ? '7 Days' : timeRange === 'month' ? '30 Days' : '365 Days'}
            </Badge>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {currentData.topItems.map((item: any, i: number) => (
                <motion.div 
                  layout
                  key={`${timeRange}-${item.name}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl hover:bg-zinc-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center font-black text-zinc-900 group-hover:scale-110 transition-transform text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-zinc-900">{item.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-zinc-900">{item.count}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Orders</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {currentData.topItems.length === 0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-3 opacity-50">
                   <ShoppingBag size={20} className="text-zinc-300" />
                </div>
                <p className="text-zinc-300 text-sm font-medium italic">No sales data for this period</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: Order["status"]) => void;
}) {
  return (
    <Card className="relative border border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group rounded-2xl sm:rounded-3xl w-full">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-5 flex items-center gap-2 border-b border-zinc-50 bg-zinc-50/30">
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white border border-zinc-200 shadow-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-zinc-900 font-black text-sm sm:text-base md:text-lg shrink-0 group-hover:scale-105 transition-transform">
            T{order.table.tableNumber}
          </div>
          <div className="min-w-0 flex-1 mr-16 sm:mr-20 text-balance">
            <h4 className="text-xs sm:text-sm font-black text-zinc-900 truncate tracking-tight uppercase">
              Order #{order.id.slice(-4).toUpperCase()}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                <Clock size={9} className="sm:w-[10px] sm:h-[10px] shrink-0" />
                <span className="truncate">{timeAgo(order.createdAt)}</span>
              </div>
              {order.paymentMethod === "CASH" && (
                <Badge className="h-4 px-1.5 bg-amber-100 text-amber-700 text-[8px] font-black border-none rounded-md">
                  CASH
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Absolute Status Badge */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
        {order.status === "payment_pending" && (
          <div className="bg-purple-50 border border-purple-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2">
            {order.paymentMethod === "CASH" ? (
              <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <ShoppingBag
                    size={10}
                    className="text-amber-600 sm:w-3 sm:h-3"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-black text-amber-600 uppercase tracking-wider leading-none">
                    Collect Cash
                  </p>
                  <p className="text-[9px] text-amber-600/60 font-medium mt-0.5">
                    Collect {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            ) : order.transactionId ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-purple-400 mb-0.5 sm:mb-1">
                    Customer UTR / TXID
                  </p>
                  <p className="text-xs sm:text-sm font-black text-purple-700 font-mono truncate tracking-tight">
                    {order.transactionId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg sm:rounded-xl shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      order.transactionId || ""
                    );
                    toast.success("Transaction ID Copied");
                  }}
                >
                  <Copy size={14} className="sm:w-4 sm:h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <AlertTriangle
                    size={10}
                    className="text-purple-600 sm:w-3 sm:h-3"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-purple-600/80 italic leading-tight">
                  Please check for the payment before proceeding
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Pay-After-Meal Cash Reminder */}
        {order.paymentMethod === "CASH" && order.status !== "payment_pending" && order.status !== "completed" && order.status !== "cancelled" && (
          <div className="bg-amber-50 border border-amber-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <ShoppingBag size={14} className="text-amber-600" />
             </div>
             <div className="min-w-0">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider leading-none">Collect Cash at End</p>
                <p className="text-[11px] font-bold text-amber-900/70 mt-1">₹{Number(order.totalAmount)} to be collected</p>
             </div>
          </div>
        )}

        <div className="space-y-2 sm:space-y-2.5">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  item.menuItem.type === "veg"
                    ? "bg-green-500"
                    : "bg-red-500"
                )}
              />
              <span className="text-xs sm:text-sm text-zinc-700 truncate flex-1">
                {item.menuItem.name}
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-400 shrink-0 font-medium">
                ×{item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 bg-zinc-50/80 space-y-2.5 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total
          </span>
          <span className="text-sm sm:text-base md:text-lg font-black text-zinc-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          {order.status === "payment_pending" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "pending")}
              className="flex-1 h-9 sm:h-10 md:h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg shadow-purple-200"
              size="sm"
            >
              <Check
                size={12}
                className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5"
              />
              <span className="truncate">
                {order.paymentMethod === "CASH" ? "Confirm Cash Received" : "Approve Payment"}
              </span>
            </Button>
          )}
          {order.status === "pending" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "preparing")}
              className="flex-1 h-9 sm:h-10 md:h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg shadow-zinc-200"
              size="sm"
            >
              <ChefHat
                size={12}
                className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5"
              />
              <span className="truncate">Start Cooking</span>
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "ready")}
              className="flex-1 h-9 sm:h-10 md:h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg shadow-blue-200"
              size="sm"
            >
              <Check
                size={12}
                className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5"
              />
              <span className="truncate">Mark Ready</span>
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              onClick={() => onStatusUpdate(order.id, "completed")}
              className="flex-1 h-9 sm:h-10 md:h-11 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg shadow-green-200"
              size="sm"
            >
              <Check
                size={12}
                className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5"
              />
              <span className="truncate">
                {order.paymentMethod === "CASH" ? "Collect Cash & Complete" : "Complete Order"}
              </span>
            </Button>
          )}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 p-0 shrink-0 text-zinc-400 hover:text-red-500 hover:border-red-200 rounded-lg sm:rounded-xl"
              onClick={() => onStatusUpdate(order.id, "cancelled")}
            >
              <XCircle size={14} className="sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function MenuItemRow({
  item,
  isUpdating,
  onUpdateName,
  onUpdatePrice,
  onToggleAvailability,
  onDelete,
}: {
  item: ManageMenuItem;
  isUpdating: boolean;
  onUpdateName: (id: string, name: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-50/50 rounded-2xl border border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-lg transition-all duration-300">
        {/* Left: Item info */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-[3px] shrink-0 mt-1 sm:mt-0",
              item.type === "veg"
                ? "bg-green-500 border-green-200"
                : "bg-red-500 border-red-200"
            )}
          />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <input
              defaultValue={item.name}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && val !== item.name) onUpdateName(item.id, val);
              }}
              className="font-bold text-base sm:text-lg text-zinc-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full truncate"
              placeholder="Dish Name"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-zinc-100 shadow-sm">
                <span className="text-xs font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  defaultValue={item.price}
                  onBlur={(e) => {
                    const p = parseFloat(e.target.value);
                    if (!isNaN(p) && p !== item.price)
                      onUpdatePrice(item.id, p);
                  }}
                  className="w-16 bg-transparent border-none p-0 text-sm font-bold text-zinc-800 focus:outline-none focus:ring-0"
                />
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {item.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                item.isAvailable ? "text-green-600" : "text-zinc-400"
              )}
            >
              {item.isAvailable ? "Live" : "Sold Out"}
            </span>
            <button
              disabled={isUpdating}
              onClick={() => onToggleAvailability(item.id, item.isAvailable)}
              className={cn(
                "w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner",
                item.isAvailable
                  ? "bg-green-500 shadow-green-200"
                  : "bg-zinc-200 shadow-zinc-100"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md",
                  item.isAvailable ? "left-[22px]" : "left-0.5"
                )}
              />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 text-zinc-300 hover:text-red-500 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Delete &quot;{item.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this dish from your menu. Customers
              will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(item.id)}
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SidebarContent({
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 lg:mb-12">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
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
            onClick={() => setActiveView(item.id)}
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-200 rounded-full shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{restaurantName}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State Component ───
function OrdersEmptyState({
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
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-zinc-200 px-6">
      <div
        className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6",
          c.iconBg
        )}
      >
        <c.icon size={28} className={cn(c.iconColor, "sm:w-8 sm:h-8")} />
      </div>
      <h3 className="text-base sm:text-lg font-black text-zinc-900 uppercase tracking-tight">
        {c.title}
      </h3>
      <p className="text-zinc-400 text-[11px] sm:text-xs font-medium max-w-[260px] sm:max-w-[280px] mt-2 leading-relaxed">
        {c.description}
      </p>
    </div>
  );
}

// ─── Tab Selector Component ───
function OrderTabSelector({
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
    <div className="w-full sm:w-auto">
      <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-100/60 p-1 sm:p-1.5 rounded-xl sm:rounded-xl border border-zinc-200/50 w-full sm:w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 sm:flex-initial px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all relative flex items-center justify-center gap-1.5 sm:gap-2",
                isActive
                  ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50"
              )}
            >
              <tab.icon
                size={12}
                className={cn(
                  "shrink-0",
                  isActive ? tab.activeIconColor : ""
                )}
              />

              {/* Short label on mobile, full on desktop */}
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>

              {tab.count > 0 && (
                <span
                  className={cn(
                    "text-white text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded-full leading-none min-w-[16px] sm:min-w-[18px] text-center",
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

// ─── Orders Grid Component ───
function OrdersGrid({
  orders,
  onStatusUpdate,
}: {
  orders: Order[];
  onStatusUpdate: (id: string, status: Order["status"]) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <OrderCard order={order} onStatusUpdate={onStatusUpdate} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───
export default function DashboardPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "verifying" | "active" | "completed"
  >("active");
  const [restaurantName, setRestaurantName] = useState("Your Restaurant");
  const [managerId, setManagerId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSaleToday: 0,
    salesWeekly: 0,
    salesMonthly: 0,
    preparedTodayCount: 0,
    tablesFilled: "0/0",
    activeOrdersCount: 0,
    topItems: [] as { name: string; count: number; type: string }[],
    chartData: [] as { date: string; sales: number }[],
  });
  const [activeView, setActiveView] = useState<
    "orders" | "menu" | "tables" | "analytics" | "settings"
  >("orders");
  const [menuCategories, setMenuCategories] = useState<ManageCategory[]>([]);
  const [tables, setTables] = useState<ManageTable[]>([]);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [tempUpiId, setTempUpiId] = useState("");
  const [isUpdatingUpi, setIsUpdatingUpi] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>("DISCONNECTED");

  // Dialog states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [initialDishName, setInitialDishName] = useState("");
  const [initialDishPrice, setInitialDishPrice] = useState("");

  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);
  const [addingToCategoryName, setAddingToCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemType, setNewItemType] = useState<"veg" | "non-veg">("veg");
  const [newItemDescription, setNewItemDescription] = useState("");

  const [renamingCategory, setRenamingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameCategoryValue, setRenameCategoryValue] = useState("");

  const [deletingCategory, setDeletingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [deletingTable, setDeletingTable] = useState<{
    id: string;
    tableNumber: string;
  } | null>(null);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);

  const [isShowingPreview, setIsShowingPreview] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Derived state
  const verifyingOrders = useMemo(
    () => orders.filter((o) => o.status === "payment_pending"),
    [orders]
  );
  const activeOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status !== "completed" &&
          o.status !== "cancelled" &&
          o.status !== "payment_pending"
      ),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "completed"),
    [orders]
  );
  const displayedOrders =
    activeTab === "verifying"
      ? verifyingOrders
      : activeTab === "active"
        ? activeOrders
        : completedOrders;

  const sortedTables = useMemo(() => {
    return [...tables].sort((a, b) =>
      a.tableNumber.localeCompare(b.tableNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [tables]);

  // ─── Auth & Data ───
  // ─── Realtime Listener ───
  useEffect(() => {
    if (!restaurantId || !managerId) return;

    console.log("Subscribing to realtime for restaurant:", restaurantId);

    const channel = supabase
      .channel(`dashboard-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        (payload) => {
          const tableName = payload.table.toLowerCase();
          if (tableName === "order" || tableName === "orders") {
            const mId = managerId;
            if (!mId) return;

            fetch(`/api/dashboard/data?managerId=${mId}`)
              .then((r) => r.json())
              .then((data) => {
                if (data.success) {
                  setOrders(data.orders);
                  if (data.stats) setDashboardStats(data.stats);
                  if (data.menuCategories)
                    setMenuCategories(data.menuCategories);

                  if (payload.eventType === "INSERT") {
                    const audio = new Audio(
                      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                    );
                    audio
                      .play()
                      .catch((e) => console.log("Audio play failed:", e));

                    toast.success("New Order Received!", {
                      description: "A customer has just placed an order.",
                      icon: (
                        <Bell className="text-purple-500 animate-bounce" />
                      ),
                    });
                  }
                }
              });
          }
        }
      )
      .subscribe((status) => {
        console.log("REALTIME STATUS UPDATED:", status);
        setRealtimeStatus(status);
      });

    return () => {
      console.log("Unsubscribing from realtime...");
      supabase.removeChannel(channel);
    };
  }, [restaurantId, managerId]);

  const fetchDashboardData = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/dashboard/data?managerId=${uid}`);
      const data = await res.json();

      if (!data.success) {
        window.location.href = "/onboarding";
        return;
      }

      if (!data.menuCategories || data.menuCategories.length === 0) {
        window.location.href = "/onboarding";
        return;
      }

      if (data.tables) setTables(data.tables);
      setOrders(data.orders);
      setRestaurantName(data.restaurantName);
      if (data.stats) setDashboardStats(data.stats);

      if (data.restaurantId) {
        setRestaurantId(data.restaurantId);
        setUpiId(data.upiId || "");
        setTempUpiId(data.upiId || "");

        if (data.menuCategories) {
          setMenuCategories(data.menuCategories);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      window.location.href = "/onboarding";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        let idToUse = user.uid;
        if (
          user.uid === "ADMIN_UID" &&
          localStorage.getItem("IMPERSONATE_USER_ID")
        ) {
          idToUse = localStorage.getItem("IMPERSONATE_USER_ID")!;
        }

        try {
          const idToken = await user.getIdToken();
          const syncRes = await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          const syncData = await syncRes.json();
          if (syncData.success) idToUse = syncData.managerId;
        } catch (e) {
          console.error("Sync error:", e);
        }
        setManagerId(idToUse);
        fetchDashboardData(idToUse);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, [fetchDashboardData]);

  // ─── Order Actions ───
  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]) => {
      const prev = orders.find((o) => o.id === orderId);
      setOrders((p) =>
        p.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          toast.success(`Order updated to ${status}`);
        } else {
          if (prev)
            setOrders((p) =>
              p.map((o) => (o.id === orderId ? prev : o))
            );
          toast.error("Failed to update order");
        }
      } catch {
        if (prev)
          setOrders((p) =>
            p.map((o) => (o.id === orderId ? prev : o))
          );
        toast.error("Network error");
      }
    },
    [orders]
  );

  // ─── Menu Actions ───
  const updateItemName = useCallback(
    async (itemId: string, newName: string) => {
      try {
        const res = await fetch(`/api/menu/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });
        if (res.ok) {
          setMenuCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              menuItems: cat.menuItems.map((i) =>
                i.id === itemId ? { ...i, name: newName } : i
              ),
            }))
          );
          toast.success("Name updated");
        }
      } catch {
        toast.error("Failed to update name");
      }
    },
    []
  );

  const updatePrice = useCallback(
    async (itemId: string, newPrice: number) => {
      try {
        setIsUpdating(itemId);
        const res = await fetch(`/api/menu/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: newPrice }),
        });
        if (res.ok) {
          setMenuCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              menuItems: cat.menuItems.map((i) =>
                i.id === itemId ? { ...i, price: newPrice } : i
              ),
            }))
          );
          toast.success("Price updated");
        }
      } catch {
        toast.error("Failed to update price");
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const toggleAvailability = useCallback(
    async (itemId: string, current: boolean) => {
      setMenuCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          menuItems: cat.menuItems.map((item) =>
            item.id === itemId ? { ...item, isAvailable: !current } : item
          ),
        }))
      );
      try {
        setIsUpdating(itemId);
        const res = await fetch(`/api/menu/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !current }),
        });
        if (!res.ok) {
          setMenuCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              menuItems: cat.menuItems.map((item) =>
                item.id === itemId
                  ? { ...item, isAvailable: current }
                  : item
              ),
            }))
          );
          toast.error("Failed to toggle availability");
        } else {
          toast.success(
            !current ? "Item is now live" : "Item marked as sold out"
          );
        }
      } catch {
        toast.error("Network error");
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menuItems: cat.menuItems.filter((item) => item.id !== itemId),
          }))
        );
        toast.success("Item deleted");
      }
    } catch {
      toast.error("Failed to delete item");
    }
  }, []);

  const handleAddItem = useCallback(
    async (categoryId: string) => {
      if (!newItemName.trim() || !newItemPrice.trim()) {
        toast.error("Please fill in name and price");
        return;
      }
      try {
        setIsUpdating(categoryId);
        const res = await fetch(
          `/api/menu/categories/${categoryId}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newItemName,
              price: parseFloat(newItemPrice),
              type: newItemType,
              description: newItemDescription,
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          setMenuCategories((prev) =>
            prev.map((cat) =>
              cat.id === categoryId
                ? { ...cat, menuItems: [...cat.menuItems, data.item] }
                : cat
            )
          );
          setIsAddingItem(null);
          setNewItemName("");
          setNewItemPrice("");
          setNewItemDescription("");
          setNewItemType("veg");
          toast.success("Dish added to menu!");
        }
      } catch {
        toast.error("Failed to add dish");
      } finally {
        setIsUpdating(null);
      }
    },
    [newItemName, newItemPrice, newItemType, newItemDescription]
  );

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim() || !restaurantId) {
      toast.error("Please enter a category name");
      return;
    }
    try {
      setIsUpdating("new-category");
      const res = await fetch(`/api/menu/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, name: newCategoryName }),
      });
      const data = await res.json();
      if (data.success) {
        const finalCategory = { ...data.category, menuItems: [] };
        if (initialDishName.trim() && initialDishPrice.trim()) {
          try {
            const itemRes = await fetch(
              `/api/menu/categories/${data.category.id}/items`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: initialDishName,
                  price: parseFloat(initialDishPrice),
                  type: "veg",
                  description: "",
                }),
              }
            );
            const itemData = await itemRes.json();
            if (itemData.success)
              finalCategory.menuItems = [itemData.item];
          } catch {}
        }
        setMenuCategories((prev) => [...prev, finalCategory]);
        setNewCategoryName("");
        setInitialDishName("");
        setInitialDishPrice("");
        setIsAddingCategory(false);
        toast.success("Category created!");
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsUpdating(null);
    }
  }, [newCategoryName, restaurantId, initialDishName, initialDishPrice]);

  const handleRenameCategory = useCallback(async () => {
    if (!renamingCategory || !renameCategoryValue.trim()) return;
    try {
      const res = await fetch(
        `/api/menu/categories/${renamingCategory.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: renameCategoryValue }),
        }
      );
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((c) =>
            c.id === renamingCategory.id
              ? { ...c, name: renameCategoryValue }
              : c
          )
        );
        toast.success("Category renamed");
      }
    } catch {
      toast.error("Failed to rename");
    } finally {
      setRenamingCategory(null);
      setRenameCategoryValue("");
    }
  }, [renamingCategory, renameCategoryValue]);

  const handleDeleteCategory = useCallback(async () => {
    if (!deletingCategory) return;
    try {
      const res = await fetch(
        `/api/menu/categories/${deletingCategory.id}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setMenuCategories((prev) =>
          prev.filter((c) => c.id !== deletingCategory.id)
        );
        toast.success("Category deleted");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingCategory(null);
    }
  }, [deletingCategory]);

  // ─── Loading ───
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
          <p className="text-zinc-500 font-medium text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );

  // ─── Render ───
  const handleAddTable = async (customNumber: string) => {
    const tableNum = parseInt(customNumber);
    const trimmedNum = customNumber.trim();
    
    // 1. Client-side validation: Uniqueness & Positive Number
    if (tables.some(t => t.tableNumber === trimmedNum)) {
      toast.error(`Table "${trimmedNum}" already exists`);
      return;
    }

    if (!restaurantId || isAddingTable || isNaN(tableNum) || tableNum <= 0) {
      if (tableNum <= 0) toast.error("Table number must be greater than 0");
      return;
    }
    setIsAddingTable(true);
    try {
      const res = await fetch("/api/tables/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          restaurantId, 
          tableNumber: customNumber.trim() 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTables([...tables, data.table].sort((a, b) => 
          a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true })
        ));
        const [active, total] = dashboardStats.tablesFilled
          .split("/")
          .map(Number);
        setDashboardStats({
          ...dashboardStats,
          tablesFilled: `${active}/${total + 1}`,
        });
        toast.success(`Table "${data.table.tableNumber}" added!`);
        setNewTableNumber("");
        setIsAddTableDialogOpen(false);
      } else {
        toast.error(data.error || "Failed to add table");
      }
    } catch (error) {
      console.error("Add Table Error:", error);
      toast.error("Failed to add table");
    } finally {
      setIsAddingTable(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTables(tables.filter((t) => t.id !== tableId));
        const [active, total] = dashboardStats.tablesFilled
          .split("/")
          .map(Number);
        setDashboardStats({
          ...dashboardStats,
          tablesFilled: `${active}/${total - 1}`,
        });
        toast.success("Table deleted successfully");
        setDeletingTable(null);
      } else {
        toast.error(data.error || "Failed to delete table");
      }
    } catch (error) {
      console.error("Delete Table Error:", error);
      toast.error("Internal server error");
    }
  };

  const handleUpdateUpi = async () => {
    if (!restaurantId || !tempUpiId.trim()) return;
    if (!tempUpiId.includes("@")) {
      toast.error("Invalid UPI ID format");
      return;
    }

    setIsUpdatingUpi(true);
    try {
      const res = await fetch("/api/restaurant/update-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, upiId: tempUpiId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setUpiId(data.upiId);
        toast.success("UPI ID updated successfully!");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Update UPI Error:", error);
      toast.error("Failed to update UPI ID");
    } finally {
      setIsUpdatingUpi(false);
    }
  };

  const downloadQR = (table: ManageTable) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(restaurantName.toUpperCase(), 105, 40, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(100);
    doc.text("SCAN TO ORDER", 105, 55, { align: "center" });

    const dynamicUrl = `${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(dynamicUrl, { margin: 1, width: 1000 }).then(
        (url) => {
          doc.addImage(url, "PNG", 55, 70, 100, 100);

          doc.setFontSize(24);
          doc.setTextColor(0);
          doc.text(`TABLE ${table.tableNumber}`, 105, 185, {
            align: "center",
          });

          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text("Powered by Apneorder", 105, 280, {
            align: "center",
          });

          doc.save(
            `${restaurantName.replace(/\s+/g, "_")}_Table_${table.tableNumber}.pdf`
          );
        }
      );
    });
  };

  const downloadAllQRs = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const QRCode = await import("qrcode");

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      if (i > 0) doc.addPage();

      const dynamicUrl = `${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text(restaurantName.toUpperCase(), 105, 40, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(100);
      doc.text("SCAN TO ORDER", 105, 55, { align: "center" });

      const url = await QRCode.toDataURL(dynamicUrl, {
        margin: 1,
        width: 1000,
      });
      doc.addImage(url, "PNG", 55, 70, 100, 100);

      doc.setFontSize(24);
      doc.setTextColor(0);
      doc.text(`TABLE ${table.tableNumber}`, 105, 185, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Powered by Apneorder", 105, 280, { align: "center" });
    }

    doc.save(
      `${restaurantName.replace(/\s+/g, "_")}_All_Tables.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-zinc-100 flex-col p-5 xl:p-6 sticky top-0 h-screen">
        <SidebarContent
          activeView={activeView}
          setActiveView={setActiveView}
          restaurantName={restaurantName}
        />
      </aside>

      {/* ─── Mobile Sidebar Sheet ─── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 border-none">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Access restaurant dashboard sections</SheetDescription>
          </SheetHeader>
          <SidebarContent
            activeView={activeView}
            setActiveView={(v) => {
              setActiveView(v);
              setMobileMenuOpen(false);
            }}
            restaurantName={restaurantName}
          />
        </SheetContent>
      </Sheet>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-30 bg-[#f8f9fa]/80 backdrop-blur-xl border-b border-zinc-100 lg:border-none px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-9 h-9 p-0 shrink-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight truncate">
                  {activeView === "orders"
                    ? "Orders"
                    : activeView === "menu"
                      ? "Menu"
                      : activeView === "tables"
                        ? "Tables"
                        : activeView === "settings"
                          ? "Settings"
                          : "Analytics"}
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-zinc-400 font-medium hidden sm:block">
                  {activeView === "orders"
                    ? "Manage orders in real-time"
                    : activeView === "menu"
                      ? "Update your digital menu"
                      : activeView === "tables"
                        ? "Manage your restaurant tables"
                        : activeView === "settings"
                          ? "Configure your restaurant"
                          : "View your analytics"}
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
              {/* Realtime Status Indicator */}
              <div
                className={cn(
                  "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border opacity-80",
                  realtimeStatus === "SUBSCRIBED"
                    ? "bg-green-50 border-green-100"
                    : "bg-zinc-50 border-zinc-100"
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    realtimeStatus === "SUBSCRIBED"
                      ? "bg-green-500"
                      : "bg-zinc-300"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    realtimeStatus === "SUBSCRIBED"
                      ? "text-green-700"
                      : "text-zinc-500"
                  )}
                >
                  {realtimeStatus === "SUBSCRIBED"
                    ? "Live Sync"
                    : realtimeStatus.toLowerCase()}
                </span>
                <button
                  onClick={() =>
                    managerId && fetchDashboardData(managerId)
                  }
                  className="ml-1 p-1 hover:bg-zinc-200 rounded-full transition-colors"
                  title="Manual Refresh"
                >
                  <RefreshCw
                    size={10}
                    className={cn(
                      "text-zinc-500",
                      loading && "animate-spin"
                    )}
                  />
                </button>
              </div>

              {activeView === "tables" && (
                <Button
                  onClick={downloadAllQRs}
                  variant="outline"
                  className="hidden md:flex gap-2"
                >
                  <QrCode size={16} />
                  Download All PDFs
                </Button>
              )}
              {activeView === "menu" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 text-xs font-bold rounded-lg hidden sm:flex"
                    onClick={() => setIsShowingPreview(true)}
                  >
                    <Eye size={14} className="mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 sm:h-10 text-xs font-bold rounded-lg bg-zinc-900"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    <Plus size={14} className="mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">New Category</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 p-0 text-zinc-400 relative"
                  >
                    <Bell size={18} />
                    {activeOrders.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="px-3 sm:px-5 md:px-6 lg:px-10 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          {/* ─── ORDERS VIEW ─── */}
          {activeView === "orders" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <StatCard
                  label="Active Orders"
                  value={dashboardStats.activeOrdersCount}
                  icon={Clock}
                  color="text-blue-600"
                />
                <StatCard
                  label="Prepared Today"
                  value={dashboardStats.preparedTodayCount}
                  icon={ChefHat}
                  color="text-green-600"
                />
                <StatCard
                  label="Tables"
                  value={dashboardStats.tablesFilled}
                  icon={LayoutDashboard}
                  color="text-amber-600"
                />
                <StatCard
                  label="Today's Sale"
                  value={formatCurrency(dashboardStats.totalSaleToday)}
                  icon={BarChart3}
                  color="text-purple-600"
                />
              </div>

              {/* Tab Selector */}
              <OrderTabSelector
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                verifyingCount={verifyingOrders.length}
                activeCount={activeOrders.length}
                completedCount={completedOrders.length}
              />

              {/* Section Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0",
                      activeTab === "verifying"
                        ? "bg-purple-100"
                        : activeTab === "active"
                          ? "bg-blue-100"
                          : "bg-green-100"
                    )}
                  >
                    {activeTab === "verifying" && (
                      <Clock
                        size={14}
                        className="text-purple-600 sm:w-4 sm:h-4"
                      />
                    )}
                    {activeTab === "active" && (
                      <ChefHat
                        size={14}
                        className="text-blue-600 sm:w-4 sm:h-4"
                      />
                    )}
                    {activeTab === "completed" && (
                      <Check
                        size={14}
                        className="text-green-600 sm:w-4 sm:h-4"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-black text-zinc-900 uppercase tracking-tight truncate">
                      {activeTab === "verifying"
                        ? "Payment Verification"
                        : activeTab === "active"
                          ? "Active Orders"
                          : "Completed Orders"}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate">
                      {activeTab === "verifying"
                        ? "Verify UPI payments before accepting"
                        : activeTab === "active"
                          ? "Orders being prepared or ready to serve"
                          : "Successfully fulfilled today"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] sm:text-xs font-black shrink-0 rounded-full px-2.5 sm:px-3 py-1",
                    activeTab === "verifying" && verifyingOrders.length > 0
                      ? "bg-purple-100 text-purple-700"
                      : activeTab === "active" && activeOrders.length > 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-100 text-zinc-500"
                  )}
                >
                  {displayedOrders.length}{" "}
                  {displayedOrders.length === 1 ? "order" : "orders"}
                </Badge>
              </div>

              {/* Orders Display - Stable Container */}
              <div className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {displayedOrders.length === 0 ? (
                      <OrdersEmptyState activeTab={activeTab} />
                    ) : (
                      <OrdersGrid
                        orders={displayedOrders}
                        onStatusUpdate={updateOrderStatus}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}

          {/* ─── MENU VIEW ─── */}
          {activeView === "menu" && (
            <div className="space-y-6 lg:space-y-8 pb-10">
              {menuCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                    <UtensilsCrossed
                      size={24}
                      className="text-zinc-300"
                    />
                  </div>
                  <p className="text-zinc-400 font-bold text-sm">
                    No menu categories yet
                  </p>
                  <p className="text-zinc-300 text-xs mt-1 mb-4">
                    Create your first category to start adding dishes
                  </p>
                  <Button
                    size="sm"
                    className="bg-zinc-900"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    <Plus size={14} className="mr-1.5" />
                    Create Category
                  </Button>
                </div>
              )}

              {menuCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-zinc-100 shadow-sm"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white shrink-0">
                        <UtensilsCrossed size={18} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 truncate">
                          {cat.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-0.5">
                          <button
                            onClick={() => {
                              setRenamingCategory({
                                id: cat.id,
                                name: cat.name,
                              });
                              setRenameCategoryValue(cat.name);
                            }}
                            className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors flex items-center gap-1"
                          >
                            <Pencil size={10} /> Rename
                          </button>
                          <button
                            onClick={() =>
                              setDeletingCategory({
                                id: cat.id,
                                name: cat.name,
                              })
                            }
                            className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-red-500 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-zinc-900 h-9 text-xs font-bold rounded-lg shrink-0 w-full sm:w-auto"
                      onClick={() => {
                        setIsAddingItem(cat.id);
                        setAddingToCategoryName(cat.name);
                        setNewItemName("");
                        setNewItemPrice("");
                        setNewItemDescription("");
                        setNewItemType("veg");
                      }}
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add Dish
                    </Button>
                  </div>

                  {/* Menu Items */}
                  {cat.menuItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-zinc-300 text-sm font-medium">
                        No dishes in this category yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cat.menuItems.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          isUpdating={isUpdating === item.id}
                          onUpdateName={updateItemName}
                          onUpdatePrice={updatePrice}
                          onToggleAvailability={toggleAvailability}
                          onDelete={deleteItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─── TABLES VIEW ─── */}
          {activeView === "tables" && (
            <div className="space-y-6 lg:space-y-8 pb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase">
                    Tables & QR Codes
                  </h2>
                  <p className="text-sm text-zinc-400 font-medium">
                    Manage your physical layout and generate digital menus
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddTableDialogOpen(true)}
                  className="bg-zinc-900 rounded-xl h-12 px-6 font-bold"
                >
                  <Plus size={18} className="mr-2" />
                  Add New Table
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedTables.map((table) => (
                  <Card
                    key={table.id}
                    className="overflow-hidden border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300 group"
                  >
                    <CardContent className="p-6 flex flex-col items-center gap-6">
                      <div className="w-full flex justify-between items-center">
                        <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Table {table.tableNumber}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      </div>

                      <div className="relative group/qr">
                        <div className="w-32 h-32 bg-white flex items-center justify-center border border-zinc-100 rounded-2xl overflow-hidden group-hover/qr:scale-105 transition-transform duration-500 shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`)}`}
                            alt={`QR for Table ${table.tableNumber}`}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest">
                            Digital Menu
                          </p>
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider"
                          onClick={() =>
                            window.open(
                              `${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`,
                              "_blank"
                            )
                          }
                        >
                          Visit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider bg-zinc-50 border-zinc-100 hover:bg-zinc-900 hover:text-white group"
                          onClick={() => downloadQR(table)}
                        >
                          PDF
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeletingTable(table)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete Table
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {tables.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200 text-center">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                    <LayoutDashboard
                      size={24}
                      className="text-zinc-200"
                    />
                  </div>
                  <p className="text-zinc-400 font-bold text-sm">
                    No tables set up yet
                  </p>
                  <Button
                    onClick={() => setIsAddTableDialogOpen(true)}
                    variant="link"
                    className="text-zinc-900 font-bold mt-2"
                  >
                    Add your first table
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ─── ANALYTICS VIEW ─── */}
          {activeView === "analytics" && (
            <AnalyticsView stats={dashboardStats} />
          )}

          {activeView === "settings" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tight uppercase italic">
                  Dashboard Settings
                </h2>
                <p className="text-zinc-500 font-medium">
                  Manage your restaurant business and payment details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* UPI Management Card */}
                <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[32px] overflow-hidden">
                  <div className="bg-zinc-900 p-8 text-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <QrCode size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                          Payment Settings
                        </p>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">
                          Merchant UPI
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                          Your UPI ID
                        </Label>
                        <Input
                          value={tempUpiId}
                          onChange={(e) => setTempUpiId(e.target.value)}
                          placeholder="e.g. restaurant@okicici"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-14 rounded-2xl font-bold text-lg focus:ring-white/20"
                        />
                      </div>
                      <Button
                        onClick={handleUpdateUpi}
                        disabled={isUpdatingUpi || tempUpiId === upiId}
                        className="w-full h-14 bg-white text-black hover:bg-zinc-100 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                      >
                        {isUpdatingUpi ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          "Save New UPI ID"
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-8 bg-zinc-50">
                    <div className="flex items-start gap-4">
                      <Info size={18} className="text-zinc-400 mt-1" />
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                        This UPI ID is used to generate the scan-to-order
                        QR codes for your customers. Make sure it&apos;s
                        active and connected to your bank account to
                        receive payments instantly.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Profile Card */}
                <Card className="border-zinc-100 shadow-sm rounded-[32px] p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
                        <UtensilsCrossed
                          size={24}
                          className="text-zinc-400"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                          Store Profile
                        </p>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">
                          {restaurantName}
                        </h3>
                      </div>
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Total Categories
                        </span>
                        <span className="text-sm font-black italic">
                          {menuCategories.length} Sections
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Total Tables
                        </span>
                        <span className="text-sm font-black italic">
                          {tables.length} Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-8">
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-zinc-100 font-bold text-zinc-500 hover:text-black hover:bg-zinc-50"
                      disabled
                    >
                      Edit Profile (Coming Soon)
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-2 pb-safe z-40">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px] relative",
                activeView === item.id
                  ? "text-zinc-900"
                  : "text-zinc-400"
              )}
            >
              <item.icon
                size={20}
                strokeWidth={activeView === item.id ? 2.5 : 2}
              />
              <span className="text-[10px] font-bold">{item.label}</span>
              {activeView === item.id && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute bottom-[-8px] w-8 h-1 bg-zinc-900 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── DIALOGS ─── */}

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new section to your menu like Starters, Desserts, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Category Name</Label>
              <Input
                id="catName"
                placeholder="e.g. Signature Pizzas"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>
            <Separator />
            <p className="text-xs text-zinc-400 font-medium">
              Optional: Add your first dish
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstDish">Dish Name</Label>
                <Input
                  id="firstDish"
                  placeholder="e.g. Margherita"
                  value={initialDishName}
                  onChange={(e) => setInitialDishName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstPrice">Price (₹)</Label>
                <Input
                  id="firstPrice"
                  type="number"
                  placeholder="199"
                  value={initialDishPrice}
                  onChange={(e) => setInitialDishPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddCategory}
              disabled={
                isUpdating === "new-category" ||
                !newCategoryName.trim()
              }
              className="bg-zinc-900"
            >
              {isUpdating === "new-category" ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog
        open={!!isAddingItem}
        onOpenChange={(open) => {
          if (!open) setIsAddingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
            <DialogDescription>
              Adding to{" "}
              <span className="font-bold">{addingToCategoryName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dish Name</Label>
                <Input
                  placeholder="e.g. Butter Chicken"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="299"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="A short description of the dish..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newItemType === "veg" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1",
                    newItemType === "veg" &&
                      "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={() => setNewItemType("veg")}
                >
                  <span className="w-2 h-2 rounded-full bg-green-300 mr-2" />
                  Veg
                </Button>
                <Button
                  type="button"
                  variant={
                    newItemType === "non-veg" ? "default" : "outline"
                  }
                  size="sm"
                  className={cn(
                    "flex-1",
                    newItemType === "non-veg" &&
                      "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={() => setNewItemType("non-veg")}
                >
                  <span className="w-2 h-2 rounded-full bg-red-300 mr-2" />
                  Non-Veg
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() =>
                isAddingItem && handleAddItem(isAddingItem)
              }
              disabled={
                isUpdating === isAddingItem ||
                !newItemName.trim() ||
                !newItemPrice.trim()
              }
              className="bg-zinc-900"
            >
              {isUpdating === isAddingItem ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Add to Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Category Dialog */}
      <Dialog
        open={!!renamingCategory}
        onOpenChange={(open) => {
          if (!open) setRenamingCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameCategoryValue}
              onChange={(e) => setRenameCategoryValue(e.target.value)}
              placeholder="Category name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameCategory();
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleRenameCategory}
              disabled={!renameCategoryValue.trim()}
              className="bg-zinc-900"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirm */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Delete &quot;{deletingCategory?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category and ALL its menu
              items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCategory}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Table Confirm */}
      <AlertDialog
        open={!!deletingTable}
        onOpenChange={(open) => {
          if (!open) setDeletingTable(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" />
              Delete Table {deletingTable?.tableNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the table and its digital QR code. You cannot
              delete tables with active orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 font-bold"
              onClick={() => {
                if (deletingTable) handleDeleteTable(deletingTable.id);
              }}
            >
              Delete Table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Table Dialog */}
      <Dialog
        open={isAddTableDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddTableDialogOpen(false);
            setNewTableNumber("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-zinc-900 px-6 py-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
                <Plus size={24} className="text-white" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">
                Add New Table
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium mt-1">
                Enter a name or number for your new table layout.
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-6 bg-white">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Table Number (e.g. 1, 5, 12)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold pointer-events-none transition-colors group-focus-within:text-zinc-900 border-r border-zinc-100 pr-3">
                  Table
                </div>
                <Input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="h-14 pl-[4.8rem] rounded-xl border-zinc-100 bg-zinc-50 focus:bg-white focus:ring-zinc-900 transition-all font-black text-xl"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && parseInt(newTableNumber) > 0) {
                      handleAddTable(newTableNumber);
                    }
                  }}
                />
              </div>
              {newTableNumber.trim() && tables.some(t => t.tableNumber === newTableNumber.trim()) && (
                <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                  This table number already exists.
                </p>
              )}
              <p className="text-[10px] text-zinc-400 font-medium ml-1 mt-1">
                Tables will automatically align themselves in numerical order.
              </p>
            </div>

            <Button
              className="w-full h-14 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-all disabled:opacity-50"
              disabled={
                parseInt(newTableNumber) <= 0 || 
                isAddingTable || 
                tables.some(t => t.tableNumber === newTableNumber.trim())
              }
              onClick={() => handleAddTable(newTableNumber)}
            >
              {isAddingTable ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Create Table"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Minimal Mobile-First Preview ─── */}
      <AnimatePresence>
        {isShowingPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex items-center justify-center p-0 lg:p-10"
          >
            {/* Desktop Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
              <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-zinc-100 rounded-full blur-[120px]" />
              <div className="absolute bottom-[10%] right-[10%] w-[25%] h-[25%] bg-zinc-50 rounded-full blur-[100px]" />
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[420px] h-full lg:h-[820px] bg-black rounded-none lg:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col p-2 lg:p-4 border-0 lg:border-[12px] border-zinc-900 overflow-hidden"
            >
              {/* Phone "Notch" */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-2xl hidden lg:block z-50 overflow-hidden">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-800 rounded-full" />
              </div>

              {/* Header with "Live" status */}
              <div className="absolute top-[44px] lg:top-[50px] left-0 w-full px-8 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-zinc-100 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Live Preview
                  </span>
                </div>

                <button
                  onClick={() => setIsShowingPreview(false)}
                  className="lg:hidden w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="w-full h-full bg-white rounded-none lg:rounded-[44px] overflow-auto hide-scrollbar relative pt-16">
                {/* Menu Content */}
                <div className="p-8 space-y-12 pb-24">
                  <header className="space-y-4">
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <QrCode size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
                        {restaurantName}
                      </h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
                        Menu Selection
                      </p>
                    </div>
                  </header>

                  <div className="space-y-12">
                    {menuCategories.map((cat) => (
                      <section key={cat.id} className="space-y-8">
                        <div className="flex items-center gap-4">
                          <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.25em] whitespace-nowrap">
                            {cat.name}
                          </h4>
                          <div className="h-[1px] w-full bg-zinc-100" />
                        </div>

                        <div className="grid gap-6">
                          {cat.menuItems.map((item) => (
                            <div
                              key={item.id}
                              className="group relative flex flex-col gap-2 p-0 transition-all"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full shrink-0 shadow-sm",
                                        item.type === "veg"
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      )}
                                    />
                                    <h5
                                      className={cn(
                                        "text-lg font-bold tracking-tight text-zinc-900",
                                        !item.isAvailable &&
                                          "text-zinc-400 line-through opacity-50"
                                      )}
                                    >
                                      {item.name}
                                    </h5>
                                  </div>
                                  <p className="text-sm font-black text-zinc-950">
                                    ₹{item.price}
                                  </p>
                                </div>
                                {!item.isAvailable ? (
                                  <span className="px-3 py-1 bg-zinc-100 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-tighter">
                                    Sold Out
                                  </span>
                                ) : (
                                  <button className="w-11 h-11 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm hover:bg-zinc-900 hover:text-white transition-all active:scale-95">
                                    <Plus size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>

                {/* Fixed footer */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] p-4 bg-zinc-900 text-white rounded-[24px] flex items-center justify-between shadow-2xl z-20">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      Cart Total
                    </span>
                    <span className="text-sm font-black italic tracking-tighter">
                      ₹0.00
                    </span>
                  </div>
                  <Button className="h-10 bg-white text-zinc-900 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all">
                    View Cart
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Desktop "Close" button */}
            <button
              onClick={() => setIsShowingPreview(false)}
              className="absolute top-10 right-10 hidden lg:flex w-16 h-16 bg-white rounded-3xl items-center justify-center text-zinc-900 border border-zinc-200 shadow-2xl hover:bg-zinc-50 hover:scale-110 active:scale-95 transition-all z-50 group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>

            {/* Hint */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3">
              <div className="px-6 py-3 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                Mockup Preview
              </div>
              <p className="text-zinc-400 text-xs font-medium">
                Scroll inside to see more items
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}