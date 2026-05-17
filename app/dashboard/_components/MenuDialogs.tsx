import React from "react";
import { Plus, Loader2, AlertTriangle, Pencil, FolderPlus, Utensils, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAdd,
  isUpdating,
  newCategoryName,
  setNewCategoryName,
  initialDishName,
  setInitialDishName,
  initialDishPrice,
  setInitialDishPrice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  isUpdating: boolean;
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  initialDishName: string;
  setInitialDishName: (v: string) => void;
  initialDishPrice: string;
  setInitialDishPrice: (v: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden border-zinc-200/60">
        <DialogTitle className="sr-only">Create Category</DialogTitle>
        <DialogDescription className="sr-only">Add a new section to your menu</DialogDescription>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FolderPlus size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight leading-none">Create Category</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Add a new section like Starters, Desserts</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Category name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
              Category Name <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Signature Pizzas"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && newCategoryName.trim()) onAdd(); }}
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Optional divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-100" />
            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest px-1">Optional — First Dish</span>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>

          {/* First dish */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Margherita"
                value={initialDishName}
                onChange={(e) => setInitialDishName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Price (₹)</label>
              <input
                type="number"
                placeholder="199"
                value={initialDishPrice}
                onChange={(e) => setInitialDishPrice(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <DialogClose asChild>
            <button className="flex-1 h-11 rounded-xl border border-zinc-200 text-sm font-black text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={onAdd}
            disabled={isUpdating || !newCategoryName.trim()}
            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-100"
          >
            {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Create
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export function AddItemDialog({
  open,
  onOpenChange,
  onAdd,
  isUpdating,
  categoryName,
  newItemName,
  setNewItemName,
  newItemPrice,
  setNewItemPrice,
  newItemType,
  setNewItemType,
  newItemDescription,
  setNewItemDescription,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  isUpdating: boolean;
  categoryName: string;
  newItemName: string;
  setNewItemName: (v: string) => void;
  newItemPrice: string;
  setNewItemPrice: (v: string) => void;
  newItemType: "veg" | "non-veg";
  setNewItemType: (v: "veg" | "non-veg") => void;
  newItemDescription: string;
  setNewItemDescription: (v: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl p-0 gap-0 overflow-hidden border-zinc-200/60">
        <DialogTitle className="sr-only">Add New Dish</DialogTitle>
        <DialogDescription className="sr-only">Add a new dish to the menu category</DialogDescription>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Utensils size={17} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight leading-none">Add New Dish</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Adding to <span className="text-emerald-600 font-bold">{categoryName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Name + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                Dish Name <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Butter Chicken"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoFocus
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                Price (₹) <span className="text-emerald-500">*</span>
              </label>
              <input
                type="number"
                placeholder="299"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Description <span className="text-zinc-300 normal-case font-medium tracking-normal">— optional</span></label>
            <input
              type="text"
              placeholder="A short description of the dish…"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Type toggle */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setNewItemType("veg")}
                className={cn(
                  "h-10 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                  newItemType === "veg"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <div className={cn("w-3 h-3 rounded border-2 flex items-center justify-center", newItemType === "veg" ? "border-green-600" : "border-zinc-300")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", newItemType === "veg" ? "bg-green-600" : "bg-zinc-300")} />
                </div>
                Veg
              </button>
              <button
                type="button"
                onClick={() => setNewItemType("non-veg")}
                className={cn(
                  "h-10 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                  newItemType === "non-veg"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <div className={cn("w-3 h-3 rounded border-2 flex items-center justify-center", newItemType === "non-veg" ? "border-red-600" : "border-zinc-300")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", newItemType === "non-veg" ? "bg-red-600" : "bg-zinc-300")} />
                </div>
                Non-Veg
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <DialogClose asChild>
            <button className="flex-1 h-11 rounded-xl border border-zinc-200 text-sm font-black text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={onAdd}
            disabled={isUpdating || !newItemName.trim() || !newItemPrice.trim()}
            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-100"
          >
            {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Add to Menu
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export function RenameCategoryDialog({
  open,
  onOpenChange,
  onRename,
  value,
  setValue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: () => void;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl p-0 gap-0 overflow-hidden border-zinc-200/60">
        <DialogTitle className="sr-only">Rename Category</DialogTitle>
        <DialogDescription className="sr-only">Enter a new name for this category</DialogDescription>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
              <Tag size={16} className="text-zinc-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight leading-none">Rename Category</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Enter a new name below</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Category name"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onRename(); }}
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-[#F7FAF7] text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <DialogClose asChild>
            <button className="flex-1 h-11 rounded-xl border border-zinc-200 text-sm font-black text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={onRename}
            disabled={!value.trim()}
            className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Pencil size={14} />
            Save Name
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryAlert({
  open,
  onOpenChange,
  onDelete,
  categoryName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  categoryName: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden border-zinc-200/60">
        <AlertDialogTitle className="sr-only">Delete Category</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">Permanently delete this category and all its items</AlertDialogDescription>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-red-50">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight leading-none">Delete Category?</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-black">&quot;{categoryName}&quot;</span>{" "}
              and <span className="font-black">all its menu items</span>. Once deleted, there is no way to recover them.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <AlertDialogCancel className="flex-1 h-11 rounded-xl border border-zinc-200 text-sm font-black text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all bg-transparent shadow-none">
            Keep It
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-red-100"
          >
            <AlertTriangle size={14} />
            Delete Forever
          </AlertDialogAction>
        </div>

      </AlertDialogContent>
    </AlertDialog>
  );
}
