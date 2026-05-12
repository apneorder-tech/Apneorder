import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Order } from "./types";
import { OrderCard } from "./OrderCard";
import { OrderCardSkeleton } from "./DashboardSkeleton";

export function OrdersGrid({
  orders,
  onStatusUpdate,
  loading = false,
}: {
  orders: Order[];
  onStatusUpdate: (id: string, status: Order["status"]) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {/*
        mode="popLayout" is the key fix for grid flicker:
        — Exiting card is immediately pulled out of the layout flow and rendered
          as an absolute overlay, so it animates out without pushing other cards.
        — Remaining cards use their `layout` prop to spring into their new
          grid positions cleanly, with no "cards sliding through a ghost" effect.
      */}
      <AnimatePresence mode="popLayout">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            layout="position"          // only animate x/y, never width/height
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              // Entering card slides up smoothly
              opacity: { duration: 0.18 },
              y: { type: "spring", stiffness: 320, damping: 28 },
              // Exiting card fades + shrinks quickly so the gap closes fast
              scale: { duration: 0.15 },
              // Remaining cards spring into their new positions
              layout: { type: "spring", stiffness: 280, damping: 30, mass: 0.85 },
            }}
          >
            <OrderCard order={order} onStatusUpdate={onStatusUpdate} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
