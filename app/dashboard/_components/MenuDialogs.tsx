import React from "react";
import { Plus, Loader2, AlertTriangle, Pencil } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Create New Category
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Add a new section to your menu like Starters, Desserts, etc.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="catName" className="text-xs sm:text-sm">
              Category Name
            </Label>
            <Input
              id="catName"
              placeholder="e.g. Signature Pizzas"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
            />
          </div>
          <Separator />
          <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">
            Optional: Add your first dish
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="firstDish" className="text-xs sm:text-sm">
                Dish Name
              </Label>
              <Input
                id="firstDish"
                placeholder="e.g. Margherita"
                value={initialDishName}
                onChange={(e) => setInitialDishName(e.target.value)}
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="firstPrice" className="text-xs sm:text-sm">
                Price (₹)
              </Label>
              <Input
                id="firstPrice"
                type="number"
                placeholder="199"
                value={initialDishPrice}
                onChange={(e) => setInitialDishPrice(e.target.value)}
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-lg sm:rounded-xl">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onAdd}
            disabled={isUpdating || !newCategoryName.trim()}
            className="bg-zinc-900 rounded-lg sm:rounded-xl"
          >
            {isUpdating ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            Create
          </Button>
        </DialogFooter>
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Add New Dish
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Adding to <span className="font-bold">{categoryName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Dish Name</Label>
              <Input
                placeholder="e.g. Butter Chicken"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoFocus
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Price (₹)</Label>
              <Input
                type="number"
                placeholder="299"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">
              Description (optional)
            </Label>
            <Input
              placeholder="A short description of the dish..."
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={newItemType === "veg" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 h-10 rounded-lg sm:rounded-xl",
                  newItemType === "veg" && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => setNewItemType("veg")}
              >
                <span className="w-2 h-2 rounded-full bg-green-300 mr-2" />
                Veg
              </Button>
              <Button
                type="button"
                variant={newItemType === "non-veg" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 h-10 rounded-lg sm:rounded-xl",
                  newItemType === "non-veg" && "bg-red-600 hover:bg-red-700"
                )}
                onClick={() => setNewItemType("non-veg")}
              >
                <span className="w-2 h-2 rounded-full bg-red-300 mr-2" />
                Non-Veg
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-lg sm:rounded-xl">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onAdd}
            disabled={isUpdating || !newItemName.trim() || !newItemPrice.trim()}
            className="bg-zinc-900 rounded-lg sm:rounded-xl"
          >
            {isUpdating ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            Add to Menu
          </Button>
        </DialogFooter>
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Rename Category
          </DialogTitle>
        </DialogHeader>
        <div className="py-3 sm:py-4">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Category name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onRename();
            }}
            className="h-10 sm:h-11 rounded-lg sm:rounded-xl"
          />
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-lg sm:rounded-xl">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onRename}
            disabled={!value.trim()}
            className="bg-zinc-900 rounded-lg sm:rounded-xl"
          >
            Save
          </Button>
        </DialogFooter>
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
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle size={18} className="text-red-500 shrink-0" />
            Delete &quot;{categoryName}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            This will permanently delete this category and ALL its menu
            items. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 rounded-xl"
            onClick={onDelete}
          >
            Delete Category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
