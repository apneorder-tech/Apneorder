import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ManageCategory } from "./types";

export function PreviewModal({
  isOpen,
  onClose,
  restaurantName,
  menuCategories,
}: {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  menuCategories: ManageCategory[];
}) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="absolute top-[44px] lg:top-[50px] left-0 w-full px-6 sm:px-8 flex justify-between items-center z-50">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-zinc-100 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Live Preview
                </span>
              </div>

              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-full h-full bg-white rounded-none lg:rounded-[44px] overflow-auto hide-scrollbar relative pt-16">
              {/* Menu Content */}
              <div className="p-6 sm:p-8 space-y-8 sm:space-y-12 pb-24">
                <header className="space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter uppercase leading-none">
                      {restaurantName}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
                      Menu Selection
                    </p>
                  </div>
                </header>

                <div className="space-y-8 sm:space-y-12">
                  {menuCategories.map((cat) => (
                    <section key={cat.id} className="space-y-5 sm:space-y-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <h4 className="text-[10px] sm:text-[11px] font-black text-zinc-900 uppercase tracking-[0.25em] whitespace-nowrap">
                          {cat.name}
                        </h4>
                        <div className="h-[1px] w-full bg-zinc-100" />
                      </div>

                      <div className="grid gap-4 sm:gap-6">
                        {cat.menuItems.map((item) => (
                          <div
                            key={item.id}
                            className="group relative flex flex-col gap-2 p-0 transition-all"
                          >
                            <div className="flex justify-between items-start gap-3 sm:gap-4">
                              <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
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
                                      "text-base sm:text-lg font-bold tracking-tight text-zinc-900",
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
                                <span className="px-2.5 sm:px-3 py-1 bg-zinc-100 rounded-full text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-tighter shrink-0">
                                  Sold Out
                                </span>
                              ) : (
                                <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm hover:bg-zinc-900 hover:text-white transition-all active:scale-95 shrink-0">
                                  <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
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
              <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-[85%] sm:w-[80%] p-3 sm:p-4 bg-zinc-900 text-white rounded-2xl sm:rounded-[24px] flex items-center justify-between shadow-2xl z-20">
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Cart Total
                  </span>
                  <span className="text-xs sm:text-sm font-black italic tracking-tighter">
                    ₹0.00
                  </span>
                </div>
                <Button className="h-8 sm:h-10 bg-white text-zinc-900 rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all">
                  View Cart
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Desktop "Close" button */}
          <button
            onClick={onClose}
            className="absolute top-10 right-10 hidden lg:flex w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-2xl xl:rounded-3xl items-center justify-center text-zinc-900 border border-zinc-200 shadow-2xl hover:bg-zinc-50 hover:scale-110 active:scale-95 transition-all z-50 group"
          >
            <X
              size={24}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>

          {/* Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3">
            <div className="px-5 sm:px-6 py-2.5 sm:py-3 bg-zinc-900 text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
              Mockup Preview
            </div>
            <p className="text-zinc-400 text-xs font-medium">
              Scroll inside to see more items
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
