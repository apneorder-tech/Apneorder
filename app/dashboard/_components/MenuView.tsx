import React from "react";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManageCategory } from "./types";
import { MenuItemRow } from "./MenuItemRow";
import { Skeleton } from "./DashboardSkeleton";

export function MenuView({
  menuCategories,
  isUpdating,
  onAddCategory,
  onAddItem,
  onRenameCategory,
  onDeleteCategory,
  onUpdateItemName,
  onUpdatePrice,
  onToggleAvailability,
  onDeleteItem,
  loading = false,
}: {
  menuCategories: ManageCategory[];
  isUpdating: string | null;
  onAddCategory: () => void;
  onAddItem: (categoryId: string, categoryName: string) => void;
  onRenameCategory: (category: { id: string; name: string }) => void;
  onDeleteCategory: (category: { id: string; name: string }) => void;
  onUpdateItemName: (id: string, name: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
  onDeleteItem: (id: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-24 h-10 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="w-full h-12 rounded-2xl" />
              <Skeleton className="w-full h-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (menuCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-300" />
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
          onClick={onAddCategory}
        >
          <Plus size={14} className="mr-1.5" />
          Create Category
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
      {menuCategories.map((cat) => (
        <div
          key={cat.id}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 border border-zinc-100 shadow-sm"
        >
          {/* Category Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white shrink-0">
                <UtensilsCrossed className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-zinc-900 truncate">
                  {cat.name}
                </h2>
                <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                  <button
                    onClick={() => onRenameCategory({ id: cat.id, name: cat.name })}
                    className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors flex items-center gap-1"
                  >
                    <Pencil className="w-2.5 h-2.5 sm:w-[10px] sm:h-[10px]" />{" "}
                    Rename
                  </button>
                  <button
                    onClick={() => onDeleteCategory({ id: cat.id, name: cat.name })}
                    className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-2.5 h-2.5 sm:w-[10px] sm:h-[10px]" />{" "}
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-zinc-900 h-9 text-xs font-bold rounded-lg shrink-0 w-full sm:w-auto"
              onClick={() => onAddItem(cat.id, cat.name)}
            >
              <Plus size={14} className="mr-1.5" />
              Add Dish
            </Button>
          </div>

          {/* Menu Items */}
          {cat.menuItems.length === 0 ? (
            <div className="py-6 sm:py-8 text-center">
              <p className="text-zinc-300 text-xs sm:text-sm font-medium">
                No dishes in this category yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {cat.menuItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  isUpdating={isUpdating === item.id}
                  onUpdateName={onUpdateItemName}
                  onUpdatePrice={onUpdatePrice}
                  onToggleAvailability={onToggleAvailability}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
