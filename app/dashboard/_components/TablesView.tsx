import React from "react";
import { Plus, Trash2, LayoutDashboard, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ManageTable } from "./types";
import { TableCardSkeleton } from "./DashboardSkeleton";

function TableCard({
  table,
  restaurantId,
  upiId,
  onDeleteTable,
  onDownloadQR,
  onClearTable,
}: {
  table: ManageTable;
  restaurantId: string | null;
  upiId: string;
  onDeleteTable: (t: ManageTable) => void;
  onDownloadQR: (t: ManageTable) => void;
  onClearTable: (t: ManageTable) => void;
}) {
  const [clearing, setClearing] = React.useState(false);

  const handleClear = async () => {
    setClearing(true);
    await onClearTable(table);
    setClearing(false);
  };

  return (
    <Card
      className={`overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300 group rounded-2xl ${
        table.isOccupied
          ? "border-amber-200 bg-amber-50/30"
          : "border-zinc-100"
      }`}
    >
      <CardContent className="p-4 sm:p-5 lg:p-6 flex flex-col items-center gap-4 sm:gap-5">

        {/* Header: table number + occupancy indicator */}
        <div className="w-full flex justify-between items-center">
          <div className="px-2.5 sm:px-3 py-1 bg-zinc-100 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Table {table.tableNumber}
          </div>
          {table.isOccupied ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Occupied</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Free</span>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="relative group/qr">
          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white flex items-center justify-center border border-zinc-100 rounded-xl sm:rounded-2xl overflow-hidden group-hover/qr:scale-105 transition-transform duration-500 shadow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/menu/${restaurantId}?table=${table.tableNumber}`)}&upi=${upiId}`}
              alt={`QR for Table ${table.tableNumber}`}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div className="absolute inset-0 bg-black/60 rounded-xl sm:rounded-2xl opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
            <p className="text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              Digital Menu
            </p>
          </div>
        </div>

        {/* Visit + PDF */}
        <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider"
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
            className="h-8 sm:h-9 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider bg-zinc-50 border-zinc-100 hover:bg-zinc-900 hover:text-white"
            onClick={() => onDownloadQR(table)}
          >
            PDF
          </Button>
        </div>

        {/* Clear Table — only shown when occupied */}
        {table.isOccupied && (
          <Button
            size="sm"
            disabled={clearing}
            className="w-full h-8 sm:h-9 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md shadow-amber-100"
            onClick={handleClear}
          >
            {clearing ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
            ) : (
              <UserX className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
            )}
            {clearing ? "Clearing…" : "Clear Table"}
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 sm:h-9 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          onClick={() => onDeleteTable(table)}
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
          Delete Table
        </Button>

      </CardContent>
    </Card>
  );
}

export function TablesView({
  tables,
  restaurantId,
  upiId,
  onAddTable,
  onDeleteTable,
  onDownloadQR,
  onDownloadAllQRs,
  onClearTable,
  loading = false,
}: {
  tables: ManageTable[];
  restaurantId: string | null;
  upiId: string;
  onAddTable: () => void;
  onDeleteTable: (table: ManageTable) => void;
  onDownloadQR: (table: ManageTable) => void;
  onDownloadAllQRs: () => void;
  onClearTable: (table: ManageTable) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(5)].map((_, i) => (
            <TableCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const sortedTables = [...tables].sort((a, b) =>
    a.tableNumber.localeCompare(b.tableNumber, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl font-black text-zinc-900 tracking-tight uppercase truncate">
            Tables & QR Codes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            Manage your physical layout and generate digital menus
          </p>
        </div>
        <Button
          onClick={onAddTable}
          className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 sm:h-11 md:h-12 px-4 sm:px-6 font-bold text-xs sm:text-sm w-full sm:w-auto shadow-md shadow-emerald-100"
        >
          <Plus size={16} className="mr-1.5 sm:mr-2" />
          Add New Table
        </Button>
      </div>

      {sortedTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-[#F7FAF7] rounded-2xl sm:rounded-3xl border border-dashed border-emerald-200/60 text-center px-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-200" />
          </div>
          <p className="text-zinc-400 font-bold text-sm">
            No tables set up yet
          </p>
          <Button
            onClick={onAddTable}
            variant="link"
            className="text-zinc-900 font-bold mt-2"
          >
            Add your first table
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {sortedTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              restaurantId={restaurantId}
              upiId={upiId}
              onDeleteTable={onDeleteTable}
              onDownloadQR={onDownloadQR}
              onClearTable={onClearTable}
            />
          ))}
        </div>
      )}
    </div>
  );
}
