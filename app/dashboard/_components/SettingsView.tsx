import React from "react";
import { QrCode, Loader2, Info, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ManageCategory, ManageTable } from "./types";
import { SubscriptionCard } from "./SubscriptionCard";

export function SettingsView({
  restaurantName,
  upiId,
  tempUpiId,
  setTempUpiId,
  isUpdatingUpi,
  onUpdateUpi,
  menuCategories,
  tables,
  subscription,
  loading,
}: {
  restaurantName: string;
  upiId: string;
  tempUpiId: string;
  setTempUpiId: (v: string) => void;
  isUpdatingUpi: boolean;
  onUpdateUpi: () => void;
  menuCategories: ManageCategory[];
  tables: ManageTable[];
  subscription?: {
    status: string;
    currentPeriodEnd: string;
  };
  loading?: boolean;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 lg:space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight uppercase italic">
          Dashboard Settings
        </h2>
        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
          Manage your restaurant business and payment details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* UPI Management Card */}
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="bg-zinc-900 p-5 sm:p-6 lg:p-8 text-white">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                  Payment Settings
                </p>
                <h3 className="text-base sm:text-lg lg:text-xl font-black uppercase italic tracking-tight">
                  Merchant UPI
                </h3>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                  Your UPI ID
                </Label>
                <Input
                  value={tempUpiId}
                  onChange={(e) => setTempUpiId(e.target.value)}
                  placeholder="e.g. restaurant@okicici"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg focus:ring-white/20"
                />
              </div>
              <Button
                onClick={onUpdateUpi}
                disabled={isUpdatingUpi || tempUpiId === upiId}
                className="w-full h-12 sm:h-14 bg-white text-black hover:bg-zinc-100 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all active:scale-95"
              >
                {isUpdatingUpi ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Save New UPI ID"
                )}
              </Button>
            </div>
          </div>
          <CardContent className="p-4 sm:p-6 lg:p-8 bg-zinc-50">
            <div className="flex items-start gap-3 sm:gap-4">
              <Info className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-relaxed italic">
                This UPI ID is used to generate the scan-to-order QR
                codes for your customers. Make sure it&apos;s active
                and connected to your bank account to receive payments
                instantly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Display Profile Card */}
        <Card className="border-zinc-100 shadow-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Store Profile
                </p>
                <h3 className="text-base sm:text-lg lg:text-xl font-black uppercase italic tracking-tight truncate">
                  {restaurantName}
                </h3>
              </div>
            </div>
            <Separator className="bg-zinc-100" />
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Total Categories
                </span>
                <span className="text-xs sm:text-sm font-black italic">
                  {menuCategories.length} Sections
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Total Tables
                </span>
                <span className="text-xs sm:text-sm font-black italic">
                  {tables.length} Active
                </span>
              </div>
            </div>
          </div>
          <div className="pt-6 sm:pt-8">
            <Button
              variant="outline"
              className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-zinc-100 font-bold text-zinc-500 hover:text-black hover:bg-zinc-50 text-xs sm:text-sm"
              disabled
            >
              Edit Profile (Coming Soon)
            </Button>
          </div>
        </Card>

        {/* Subscription Card - Full Width below or alongside */}
        <div className="md:col-span-2">
           <SubscriptionCard 
             status={subscription?.status} 
             expiryDate={subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : undefined} 
             isLoading={loading}
           />
        </div>
      </div>
    </div>
  );
}
