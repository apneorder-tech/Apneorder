import React from "react";
import { Menu, RefreshCw, QrCode, Eye, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  activeView,
  realtimeStatus,
  loading,
  onRefresh,
  onDownloadAllQRs,
  onShowPreview,
  onAddCategory,
  activeOrdersCount,
  setMobileMenuOpen,
  subscriptionStatus,
}: {
  activeView: string;
  realtimeStatus: string;
  loading: boolean;
  onRefresh: () => void;
  onDownloadAllQRs: () => void;
  onShowPreview: () => void;
  onAddCategory: () => void;
  activeOrdersCount: number;
  setMobileMenuOpen: (open: boolean) => void;
  subscriptionStatus?: string;
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#f8f9fa]/80 backdrop-blur-xl border-b border-zinc-100 lg:border-none">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 lg:py-6 xl:py-8">
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
                {subscriptionStatus === "ACTIVE" && (
                  <Badge className="ml-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shadow-lg shadow-amber-100">
                    Premium
                  </Badge>
                )}
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
            {/* Realtime Status Indicator (Premium Only) */}
            {subscriptionStatus === "ACTIVE" && (
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
                  onClick={onRefresh}
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
            )}

            {activeView === "tables" && subscriptionStatus === "ACTIVE" && (
              <Button
                onClick={onDownloadAllQRs}
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 h-9 rounded-lg text-xs"
              >
                <QrCode size={14} />
                <span className="hidden lg:inline">Download All PDFs</span>
                <span className="lg:hidden">All PDFs</span>
              </Button>
            )}
            {activeView === "menu" && (
              subscriptionStatus === "ACTIVE" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 text-xs font-bold rounded-lg hidden sm:flex"
                    onClick={onShowPreview}
                  >
                    <Eye size={14} className="mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 sm:h-10 text-xs font-bold rounded-lg bg-zinc-900"
                    onClick={onAddCategory}
                  >
                    <Plus size={14} className="mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">New Category</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </>
              ) : null
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
