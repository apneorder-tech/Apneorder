import React, { useState, useCallback } from "react";
import {
  Clock,
  ChefHat,
  Check,
  XCircle,
  Banknote,
  Navigation,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Loader2,
  MessageCircle,
  StickyNote,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Order } from "./types";
import { StatusBadge } from "./StatusBadge";
import { timeAgo, formatCurrency } from "./utils";

export function OrderCard({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: Order["status"]) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = useCallback(
    async (newStatus: Order["status"]) => {
      setUpdating(true);
      await onStatusUpdate(order.id, newStatus);
      setUpdating(false);
    },
    [order.id, onStatusUpdate]
  );

  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";
  const isPending = order.status === "pending";
  const isVerifying = order.status === "payment_pending";
  const isPreparing = order.status === "preparing";
  const isReady = order.status === "ready";

  const isCash = order.paymentMethod?.toLowerCase() === "cash";

  return (
    <Card
      className={cn(
        "group relative flex flex-col h-full bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-500 overflow-hidden rounded-2xl sm:rounded-3xl",
        isVerifying && "ring-2 ring-purple-100 border-purple-200/50 shadow-purple-100/50"
      )}
    >
      {/* Top Banner for Cash Payment */}
      {isCash && !isCompleted && !isCancelled && (
        <div className="bg-amber-500 py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Banknote size={12} className="text-white animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
              Collect Cash Payment
            </span>
          </div>
          <span className="text-[10px] font-black text-white italic">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tighter">
                #{order.tableNumber}
              </span>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                  Table Number
                </span>
                <span className="text-[10px] font-bold text-zinc-500">
                  {timeAgo(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.customerPhone && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-green-100 bg-green-50 text-green-600 hover:bg-green-100 hover:border-green-200 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const message = encodeURIComponent(`Hi! Your order from Table ${order.tableNumber} is ready at the restaurant. Thank you for dining with us!`);
                  window.open(`https://wa.me/91${order.customerPhone}?text=${message}`, '_blank');
                }}
                title="Send WhatsApp Update"
              >
                <MessageCircle size={14} fill="currentColor" />
              </Button>
            )}
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {isVerifying && (
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95 h-9"
              onClick={() => handleUpdate("pending")}
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              Accept Payment
            </Button>
          )}

          {isPending && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 h-9"
              onClick={() => handleUpdate("preparing")}
            >
              <ChefHat size={14} className="mr-1.5" />
              Start Cooking
            </Button>
          )}

          {isPreparing && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 h-9"
              onClick={() => handleUpdate("ready")}
            >
              <Check size={14} className="mr-1.5" />
              Mark Ready
            </Button>
          )}

          {isReady && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 h-9 font-black"
              onClick={() => handleUpdate("completed")}
            >
              <Navigation size={14} className="mr-1.5" />
              Serve Dishes
            </Button>
          )}

          {!isCompleted && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 font-bold uppercase tracking-widest text-[9px] px-3 py-1.5 rounded-xl transition-all h-9"
              onClick={() => handleUpdate("cancelled")}
            >
              <XCircle size={14} className="mr-1.5" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 px-4 sm:px-6 py-4 bg-zinc-50/50 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Order Items
          </span>
          <span className="text-[10px] font-black text-zinc-900 italic">
            {(order.items || []).reduce((acc, item) => acc + item.quantity, 0)} Items
          </span>
        </div>
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start gap-3 group/item">
              {/* Left: quantity + name + optional note */}
              <div className="flex gap-2.5 min-w-0 flex-1">
                <span className="text-sm font-black text-zinc-900 mt-0.5 min-w-[1.2rem] shrink-0">
                  {item.quantity}×
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-600 leading-tight group-hover/item:text-zinc-900 transition-colors">
                    {item.name}
                  </p>
                  {item.notes && (
                    <div className="flex items-start gap-1 mt-1">
                      <StickyNote
                        size={10}
                        className="text-amber-500 shrink-0 mt-[2px]"
                      />
                      <p className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 leading-snug italic break-words">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: subtotal */}
              <span className="text-xs font-black text-zinc-900/40 italic whitespace-nowrap shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 bg-white mt-auto border-t border-zinc-100">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block leading-none">
              Total Amount
            </span>
            <span className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tighter italic">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] font-black uppercase tracking-wider rounded-lg px-2 py-0.5 border-none",
                isCash
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              {isCash ? (
                <div className="flex items-center gap-1">
                  <Banknote size={10} />
                  Cash
                </div>
              ) : (
                "UPI Payment"
              )}
            </Badge>
            {order.transactionId && !isCash && (
              <div className="flex items-center gap-1 text-zinc-400 group/utr cursor-help">
                <span className="text-[9px] font-bold">
                  UTR: {order.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>
        {!isCancelled && !isCompleted && (
          <div className="text-[10px] font-bold text-zinc-400/80 italic flex items-center gap-1.5 border-t border-zinc-50 pt-3 mt-3">
            <div className="w-1 h-1 rounded-full bg-zinc-200" />
            Kitchen order ID: {order.id.slice(-6).toUpperCase()}
          </div>
        )}
      </div>
    </Card>
  );
}
