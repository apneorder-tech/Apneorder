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
      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <OrderCard order={order} onStatusUpdate={onStatusUpdate} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
