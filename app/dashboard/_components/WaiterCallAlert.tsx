"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { WaiterCall } from "./types";

const AUTO_DISMISS_SECS = 120; // 2 minutes

function WaiterCallAlertItem({
  call,
  onAcknowledge,
}: {
  call: WaiterCall;
  onAcknowledge: (id: string) => void;
}) {
  const getSecondsLeft = useCallback(() => {
    const elapsed = Math.floor(
      (Date.now() - new Date(call.createdAt).getTime()) / 1000
    );
    return Math.max(0, AUTO_DISMISS_SECS - elapsed);
  }, [call.createdAt]);

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);
  const [isAcking, setIsAcking] = useState(false);

  useEffect(() => {
    // Auto-dismiss when timer hits zero
    if (secondsLeft === 0) {
      onAcknowledge(call.id);
      return;
    }

    const interval = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        onAcknowledge(call.id);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [call.id, getSecondsLeft, onAcknowledge, secondsLeft]);

  const handleAcknowledge = async () => {
    setIsAcking(true);
    onAcknowledge(call.id);
  };

  const progress = (secondsLeft / AUTO_DISMISS_SECS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-2xl shadow-amber-200/60 border border-amber-400/30"
    >
      {/* Countdown progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] bg-white/30 transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5">
        {/* Animated bell icon */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Bell
            size={18}
            className="text-white animate-[wiggle_0.6s_ease-in-out_infinite]"
            style={{
              animation: "wiggle 0.8s ease-in-out infinite",
            }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm sm:text-base leading-none tracking-tight">
            Table {call.tableNumber} needs assistance
          </p>
          <p className="text-[10px] sm:text-[11px] font-bold text-white/70 mt-0.5 uppercase tracking-wider">
            Auto-dismiss in {secondsLeft}s
          </p>
        </div>

        {/* Acknowledge button */}
        <button
          onClick={handleAcknowledge}
          disabled={isAcking}
          className="shrink-0 flex items-center gap-1.5 bg-white text-amber-600 hover:bg-amber-50 active:scale-95 transition-all rounded-xl px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-black uppercase tracking-wide shadow-md disabled:opacity-60"
        >
          <Check size={14} strokeWidth={3} />
          <span>Acknowledged</span>
        </button>
      </div>

      {/* CSS wiggle animation via inline style tag */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
        }
      `}</style>
    </motion.div>
  );
}

export function WaiterCallAlert({
  calls,
  onAcknowledge,
}: {
  calls: WaiterCall[];
  onAcknowledge: (id: string) => void;
}) {
  const activeCalls = calls.filter((c) => !c.isAcknowledged);

  return (
    <AnimatePresence mode="popLayout">
      {activeCalls.map((call) => (
        <WaiterCallAlertItem
          key={call.id}
          call={call}
          onAcknowledge={onAcknowledge}
        />
      ))}
    </AnimatePresence>
  );
}
