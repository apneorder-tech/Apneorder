import React, { useState } from "react";
import { Trash2, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { ManageMenuItem } from "./types";
import { formatCurrency } from "./utils";

export function MenuItemRow({
  item,
  isUpdating,
  onUpdateName,
  onUpdatePrice,
  onUpdateCostPrice,
  onUpdatePrepTime,
  onToggleAvailability,
  onDelete,
}: {
  item: ManageMenuItem;
  isUpdating: boolean;
  onUpdateName: (id: string, name: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateCostPrice: (id: string, costPrice: number | null) => void;
  onUpdatePrepTime: (id: string, mins: number | null) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [prepInput, setPrepInput] = useState(
    item.prepTimeMinutes != null ? String(item.prepTimeMinutes) : ""
  );
  const [costInput, setCostInput] = useState(
    item.costPrice != null ? String(item.costPrice) : ""
  );

  const margin =
    item.costPrice != null && item.price > 0
      ? Math.round(((item.price - item.costPrice) / item.price) * 1000) / 10
      : null;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 md:p-5 bg-zinc-50/50 hover:bg-white rounded-xl sm:rounded-2xl border border-transparent hover:border-zinc-100 transition-all group/item gap-3 sm:gap-4 shadow-sm hover:shadow-md">
        {/* Left: Info */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div
            className={cn(
              "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1.5 sm:mt-2 shrink-0",
              item.type === "veg" ? "bg-green-500" : "bg-red-500"
            )}
          />
          <div className="min-w-0 space-y-1">
            <input
              className={cn(
                "w-full bg-transparent border-none p-0 text-sm sm:text-base font-black text-zinc-900 focus:ring-0 placeholder:text-zinc-300 transition-all",
                !item.isAvailable && "text-zinc-400 line-through opacity-50"
              )}
              defaultValue={item.name}
              onBlur={(e) => {
                if (e.target.value !== item.name)
                  onUpdateName(item.id, e.target.value);
              }}
              placeholder="Dish Name"
            />
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Selling Price */}
              <div className="flex items-center">
                <span className="text-[10px] sm:text-xs font-black text-zinc-400 mr-0.5">₹</span>
                <input
                  type="number"
                  className="w-16 sm:w-20 bg-transparent border-none p-0 text-[11px] sm:text-sm font-black text-zinc-600 focus:ring-0"
                  defaultValue={item.price}
                  onBlur={(e) => {
                    const price = parseFloat(e.target.value);
                    if (!isNaN(price) && price !== item.price)
                      onUpdatePrice(item.id, price);
                  }}
                />
              </div>
              {/* Cost Price + margin pill */}
              <div className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-0.5 border transition-colors group/cost",
                item.costPrice != null
                  ? margin !== null && margin < 20
                    ? "bg-red-50 border-red-200 hover:border-red-300"
                    : "bg-green-50 border-green-200 hover:border-green-300"
                  : "bg-zinc-100 border-zinc-200 hover:border-zinc-300"
              )}>
                <TrendingUp className={cn(
                  "w-2.5 h-2.5 shrink-0",
                  item.costPrice != null
                    ? margin !== null && margin < 20 ? "text-red-400" : "text-green-500"
                    : "text-zinc-400"
                )} />
                <span className="text-[9px] font-bold text-zinc-400 mr-0.5">₹</span>
                <input
                  type="number"
                  min={0}
                  placeholder="cost"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  onBlur={(e) => {
                    const raw = e.target.value.trim();
                    if (raw === "") {
                      if (item.costPrice != null) onUpdateCostPrice(item.id, null);
                      return;
                    }
                    const val = parseFloat(raw);
                    if (!isNaN(val) && val >= 0 && val !== item.costPrice) {
                      onUpdateCostPrice(item.id, val);
                    } else {
                      setCostInput(item.costPrice != null ? String(item.costPrice) : "");
                    }
                  }}
                  className="w-10 sm:w-12 bg-transparent border-none p-0 text-[10px] sm:text-[11px] font-black text-zinc-600 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {margin !== null && (
                  <span className={cn(
                    "text-[8px] font-black whitespace-nowrap",
                    margin < 20 ? "text-red-500" : margin < 40 ? "text-amber-500" : "text-green-600"
                  )}>
                    {margin}%
                  </span>
                )}
              </div>
              {/* Type badge */}
              <Badge
                variant="secondary"
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
              >
                {item.type}
              </Badge>
              {/* Prep time input */}
              <div className="flex items-center gap-1 bg-zinc-100 rounded-lg px-2 py-0.5 border border-zinc-200 hover:border-zinc-300 transition-colors group/prep">
                <Clock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={180}
                  placeholder="--"
                  value={prepInput}
                  onChange={(e) => setPrepInput(e.target.value)}
                  onBlur={(e) => {
                    const raw = e.target.value.trim();
                    if (raw === "") {
                      // Cleared → remove prep time
                      if (item.prepTimeMinutes != null) onUpdatePrepTime(item.id, null);
                      return;
                    }
                    const mins = parseInt(raw, 10);
                    if (!isNaN(mins) && mins >= 1 && mins <= 180 && mins !== item.prepTimeMinutes) {
                      onUpdatePrepTime(item.id, mins);
                    } else {
                      // Revert bad input to current value
                      setPrepInput(item.prepTimeMinutes != null ? String(item.prepTimeMinutes) : "");
                    }
                  }}
                  className="w-7 sm:w-8 bg-transparent border-none p-0 text-[10px] sm:text-[11px] font-black text-zinc-600 focus:ring-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[9px] font-bold text-zinc-400 whitespace-nowrap">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 justify-between sm:justify-end pl-7 sm:pl-0">
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span
              className={cn(
                "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider",
                item.isAvailable ? "text-green-600" : "text-zinc-400"
              )}
            >
              {item.isAvailable ? "Live" : "Sold Out"}
            </span>
            <button
              disabled={isUpdating}
              onClick={() => onToggleAvailability(item.id, item.isAvailable)}
              className={cn(
                "w-10 h-5 sm:w-11 sm:h-6 rounded-full relative transition-all duration-300 shadow-inner",
                item.isAvailable
                  ? "bg-green-500 shadow-green-200"
                  : "bg-zinc-200 shadow-zinc-100"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-all duration-300 shadow-md",
                  item.isAvailable
                    ? "left-[18px] sm:left-[22px]"
                    : "left-0.5"
                )}
              />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 h-9 p-0 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
              Delete &quot;{item.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently remove this dish from your menu. Customers
              will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 rounded-xl"
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
