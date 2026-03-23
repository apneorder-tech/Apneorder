import React from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
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
import { ManageTable } from "./types";

export function AddTableDialog({
  open,
  onOpenChange,
  onAdd,
  isAddingTable,
  newTableNumber,
  setNewTableNumber,
  existingTables,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (num: string) => void;
  isAddingTable: boolean;
  newTableNumber: string;
  setNewTableNumber: (v: string) => void;
  existingTables: ManageTable[];
}) {
  const isDuplicate = existingTables.some(
    (t) => t.tableNumber === newTableNumber.trim()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl sm:rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-zinc-900 px-5 sm:px-6 py-6 sm:py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-2xl" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-md border border-white/10">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight italic text-white">
              Add New Table
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium mt-1 text-xs sm:text-sm">
              Enter a name or number for your new table layout.
            </DialogDescription>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Table Number (e.g. 1, 5, 12)
            </label>
            <div className="relative group">
              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold pointer-events-none transition-colors group-focus-within:text-zinc-900 border-r border-zinc-100 pr-2.5 sm:pr-3 text-sm sm:text-base">
                Table
              </div>
              <Input
                type="number"
                min="1"
                placeholder="5"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="h-12 sm:h-14 pl-[4.2rem] sm:pl-[4.8rem] rounded-xl border-zinc-100 bg-zinc-50 focus:bg-white focus:ring-zinc-900 transition-all font-black text-lg sm:text-xl"
                autoFocus
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    parseInt(newTableNumber) > 0 &&
                    !isDuplicate
                  ) {
                    onAdd(newTableNumber);
                  }
                }}
              />
            </div>
            {newTableNumber.trim() && isDuplicate && (
              <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                This table number already exists.
              </p>
            )}
            <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium ml-1 mt-1">
              Tables will automatically align themselves in numerical order.
            </p>
          </div>

          <Button
            className="w-full h-12 sm:h-14 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-all disabled:opacity-50 text-sm"
            disabled={
              parseInt(newTableNumber) <= 0 ||
              isAddingTable ||
              isDuplicate
            }
            onClick={() => onAdd(newTableNumber)}
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
  );
}

export function DeleteTableAlert({
  open,
  onOpenChange,
  onConfirm,
  tableNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tableNumber: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trash2 size={18} className="text-red-500 shrink-0" />
            Delete Table {tableNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            This will remove the table and its digital QR code. You cannot
            delete tables with active orders.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 font-bold rounded-xl"
            onClick={onConfirm}
          >
            Delete Table
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
