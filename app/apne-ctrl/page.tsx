"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LogOut, Store, CreditCard, ShoppingBag, UserPlus,
  Search, RefreshCw, ChevronUp, ChevronDown, IndianRupee,
  Activity, XCircle, AlertTriangle, MapPin, Mail, Phone,
  TrendingUp, CheckCircle2, Clock, ArrowUpRight, Zap,
  ShieldAlert, Users, BarChart2, Sparkles, Copy, Check,
  MessageCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELED";

interface Restaurant {
  id: string;
  name: string;
  city: string;
  ownerName: string;
  createdAt: string;
  manager: {
    email: string | null;
    phone: string | null;
    subscription: { status: SubStatus; currentPeriodEnd: string } | null;
  };
  _count: { orders: number };
}

interface AdminData {
  stats: {
    totalManagers: number;
    totalRestaurants: number;
    activeSubscriptions: number;
    mrr: number;
    ordersToday: number;
    ordersThisWeek: number;
    newSignupsWeek: number;
    newSignupsMonth: number;
  };
  subscriptionBreakdown: { status: string; _count: { status: number } }[];
  allRestaurants: Restaurant[];
  monthlySignups: { month: string; count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function fmtCurrency(n: number) {
  return "₹" + new Intl.NumberFormat("en-IN").format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function subLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ");
}

function subColor(status: string | undefined) {
  switch (status) {
    case "ACTIVE":   return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200", bar: "bg-emerald-500" };
    case "INACTIVE": return { bg: "bg-slate-50",   text: "text-slate-500",   dot: "bg-slate-400",   border: "border-slate-200",   bar: "bg-slate-400" };
    case "EXPIRED":  return { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     border: "border-red-200",     bar: "bg-red-500" };
    case "PAST_DUE": return { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   border: "border-amber-200",   bar: "bg-amber-500" };
    case "CANCELED": return { bg: "bg-rose-50",    text: "text-rose-600",    dot: "bg-rose-400",    border: "border-rose-200",    bar: "bg-rose-400" };
    default:         return { bg: "bg-slate-50",   text: "text-slate-400",   dot: "bg-slate-300",   border: "border-slate-200",   bar: "bg-slate-300" };
  }
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${text}`}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-md transition-all shrink-0 ${
        copied
          ? "text-emerald-600 bg-emerald-50"
          : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
      } ${className}`}
    >
      {copied
        ? <Check className="w-3 h-3" strokeWidth={2.5} />
        : <Copy className="w-3 h-3" strokeWidth={2} />
      }
    </button>
  );
}

// ─── WhatsApp Link ────────────────────────────────────────────────────────────

function whatsappUrl(phone: string, restaurantName: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("91") ? digits : `91${digits}`;
  const msg = encodeURIComponent(
    `Hi! This is a message from ApneOrder regarding your restaurant "${restaurantName}". We noticed your subscription needs attention. Please reach out so we can help you get back on track.`
  );
  return `https://wa.me/${normalized}?text=${msg}`;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError("Invalid credentials. Access denied.");
        setPassword("");
      }
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
            <Lock className="w-6 h-6 text-zinc-300" strokeWidth={1.8} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Restricted Access</h1>
          <p className="text-sm text-zinc-500 mt-1">ApneOrder Internal</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Access Key</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access key"
                  required autoFocus
                  className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 px-4 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 transition-all"
                />
                <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors text-xs font-medium">
                  {show ? "hide" : "show"}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-900/50 px-3 py-2 rounded-lg flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />{error}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={loading || !password}
              className="w-full h-11 rounded-xl bg-white text-zinc-900 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-zinc-100 transition-colors">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" />Authenticate</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon: Icon, iconColor, iconBg, delay = 0,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconColor: string; iconBg: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tight leading-none">
        {value}
      </p>
      <p className="text-xs font-semibold text-slate-600 mt-1.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ─── Subscription Health ──────────────────────────────────────────────────────

function SubscriptionHealth({
  breakdown, total,
}: {
  breakdown: { status: string; _count: { status: number } }[];
  total: number;
}) {
  const ORDER = ["ACTIVE", "INACTIVE", "EXPIRED", "PAST_DUE", "CANCELED"];
  const sorted = ORDER.map((s) => ({
    status: s,
    count: breakdown.find((b) => b.status === s)?._count.status ?? 0,
  })).filter((s) => s.count > 0);

  const activeCount = breakdown.find((b) => b.status === "ACTIVE")?._count.status ?? 0;
  const healthPct = total > 0 ? Math.round((activeCount / total) * 100) : 0;
  const atRiskCount = sorted
    .filter((s) => ["EXPIRED", "PAST_DUE", "CANCELED"].includes(s.status))
    .reduce((sum, s) => sum + s.count, 0);
  const healthTone = healthPct >= 70
    ? { text: "text-emerald-700", bg: "bg-emerald-50", ring: "rgba(16,185,129,0.96)", label: "Healthy" }
    : healthPct >= 40
    ? { text: "text-amber-700", bg: "bg-amber-50", ring: "rgba(245,158,11,0.96)", label: "Watch" }
    : { text: "text-red-700", bg: "bg-red-50", ring: "rgba(239,68,68,0.96)", label: "At risk" };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 sm:p-6 flex flex-col h-full">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-5 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <Activity className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Subscription Health</h3>
              <p className="text-xs text-slate-400 mt-0.5">{total} restaurants monitored</p>
            </div>
          </div>
        </div>

        <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${healthTone.ring} ${healthPct * 3.6}deg, #f1f5f9 0deg)` }}>
          <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className={`text-xl font-black tabular-nums leading-none ${healthTone.text}`}>{healthPct}%</p>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5">active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-2 mb-5">
        {[
          { icon: CheckCircle2, label: "Active", value: activeCount, tone: "text-emerald-700 bg-emerald-50 border-emerald-100" },
          { icon: AlertTriangle, label: "At risk", value: atRiskCount, tone: "text-amber-700 bg-amber-50 border-amber-100" },
          { icon: Users, label: "Total", value: total, tone: "text-slate-700 bg-slate-50 border-slate-100" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border px-3 py-2.5 ${item.tone}`}>
            <item.icon className="w-3.5 h-3.5 mb-2" strokeWidth={2.2} />
            <p className="text-lg font-black tabular-nums leading-none">{item.value}</p>
            <p className="text-[10px] font-bold mt-1 opacity-70">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${healthTone.bg} ${healthTone.text}`}>
            {healthTone.label}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">status mix</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex ring-1 ring-slate-100">
          {sorted.map(({ status, count }) => {
            const c = subColor(status);
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <motion.div
                key={status}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full ${c.bar}`}
              />
            );
          })}
        </div>
      </div>

      <div className="relative space-y-2.5 flex-1">
        {sorted.map(({ status, count }) => {
          const c = subColor(status);
          const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
          return (
            <div key={status} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${c.bg} ${c.text} ${c.border}`}>
                  {subLabel(status)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${c.bar}`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 tabular-nums w-6 text-right">{count}</span>
                <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Growth Chart ─────────────────────────────────────────────────────────────

function GrowthChart({ data }: { data: { month: string; count: number }[] }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const row = data.find((r) => r.month.slice(0, 7) === key);
    return {
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      count: row?.count ?? 0,
      isCurrent: i === 5,
    };
  });
  const max = Math.max(...months.map((m) => m.count), 1);
  const total = months.reduce((a, b) => a + b.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Restaurant Growth</h3>
          <p className="text-xs text-slate-400 mt-0.5">New signups, last 6 months</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{total}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">total new</p>
        </div>
      </div>

      <div className="flex items-end gap-1.5 flex-1" style={{ minHeight: 88 }}>
        {months.map(({ label, count, isCurrent }, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0 group/bar">
            <span className="text-[10px] font-bold text-slate-400 tabular-nums h-4 flex items-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
              {count > 0 ? count : ""}
            </span>
            <div className="w-full flex items-end justify-center h-16">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: count > 0 ? `${(count / max) * 100}%` : "3px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-t-lg min-h-[3px] transition-colors ${
                  isCurrent
                    ? "bg-indigo-500 group-hover/bar:bg-indigo-600"
                    : count > 0
                    ? "bg-slate-800 group-hover/bar:bg-slate-900"
                    : "bg-slate-100"
                }`}
                style={{ maxWidth: 44 }}
              />
            </div>
            <span className={`text-[10px] font-semibold ${isCurrent ? "text-indigo-500" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── At-Risk Restaurants ──────────────────────────────────────────────────────

function AtRiskSection({ restaurants }: { restaurants: Restaurant[] }) {
  const atRisk = useMemo(
    () =>
      restaurants
        .filter((r) =>
          r.manager.subscription?.status === "EXPIRED" ||
          r.manager.subscription?.status === "PAST_DUE" ||
          r.manager.subscription?.status === "CANCELED"
        )
        .sort((a, b) => new Date(a.manager.subscription?.currentPeriodEnd ?? 0).getTime() - new Date(b.manager.subscription?.currentPeriodEnd ?? 0).getTime()),
    [restaurants]
  );

  if (atRisk.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">At-Risk Accounts</h3>
            <p className="text-xs text-slate-400">Expired, past due, or canceled</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-semibold text-emerald-600">All clear!</p>
          <p className="text-xs text-slate-400 mt-1">No at-risk subscriptions right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-500" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">At-Risk Accounts</h3>
            <p className="text-xs text-slate-400">Expired, past due, or canceled</p>
          </div>
        </div>
        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
          {atRisk.length}
        </span>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] pr-1">
        {atRisk.map((r) => {
          const c = subColor(r.manager.subscription?.status);
          return (
            <div key={r.id} className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${c.bg} ${c.border}`}>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate">{r.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[10px] text-slate-500">{r.city}</span>
                </div>
                {r.manager.phone && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500">{r.manager.phone}</span>
                    <CopyButton text={r.manager.phone} />
                  </div>
                )}
                {r.manager.email && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{r.manager.email}</span>
                    <CopyButton text={r.manager.email} />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${c.text}`}>
                  {subLabel(r.manager.subscription?.status ?? "")}
                </span>
                {r.manager.subscription?.currentPeriodEnd && (
                  <p className="text-[9px] text-slate-400">
                    {fmtDateShort(r.manager.subscription.currentPeriodEnd)}
                  </p>
                )}
                {r.manager.phone && (
                  <a
                    href={whatsappUrl(r.manager.phone, r.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Send WhatsApp message"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle className="w-3 h-3" fill="currentColor" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Signups ───────────────────────────────────────────────────────────

function RecentSignups({ restaurants }: { restaurants: Restaurant[] }) {
  const recent = useMemo(
    () =>
      [...restaurants]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [restaurants]
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-600" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Recent Signups</h3>
          <p className="text-xs text-slate-400">Latest restaurants to join</p>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {recent.map((r, i) => {
          const c = subColor(r.manager.subscription?.status);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{r.name}</p>
                  <p className="text-[10px] text-slate-400">{r.city}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${c.bg} ${c.text} ${c.border}`}>
                  {subLabel(r.manager.subscription?.status ?? "No plan")}
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5">{fmtDateShort(r.createdAt)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Restaurants Table ────────────────────────────────────────────────────────

type SortKey = "name" | "city" | "orders" | "status" | "joined";

type StatusFilter = "ALL" | "SUBSCRIBED" | "NOT_SUBSCRIBED";

function RestaurantsTable({ restaurants }: { restaurants: Restaurant[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const subscribedCount = useMemo(
    () => restaurants.filter((r) => r.manager.subscription?.status === "ACTIVE").length,
    [restaurants]
  );
  const notSubscribedCount = restaurants.length - subscribedCount;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return restaurants
      .filter((r) => {
        if (statusFilter === "SUBSCRIBED")     return r.manager.subscription?.status === "ACTIVE";
        if (statusFilter === "NOT_SUBSCRIBED") return r.manager.subscription?.status !== "ACTIVE";
        return true;
      })
      .filter((r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.manager.email?.toLowerCase().includes(q) ||
        r.manager.phone?.includes(q)
      )
      .sort((a, b) => {
        let av: string | number = "";
        let bv: string | number = "";
        if (sortKey === "name")   { av = a.name;          bv = b.name; }
        if (sortKey === "city")   { av = a.city;          bv = b.city; }
        if (sortKey === "orders") { av = a._count.orders; bv = b._count.orders; }
        if (sortKey === "status") { av = a.manager.subscription?.status ?? ""; bv = b.manager.subscription?.status ?? ""; }
        if (sortKey === "joined") { av = a.createdAt;     bv = b.createdAt; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [restaurants, search, statusFilter, sortKey, sortDir]);

  function Th({ col, label, right }: { col?: SortKey; label: string; right?: boolean }) {
    const active = col && sortKey === col;
    if (!col) return (
      <th className={`px-5 py-3 text-left`}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      </th>
    );
    return (
      <th className={`px-5 py-3 ${right ? "text-right" : "text-left"}`}>
        <button onClick={() => toggleSort(col)}
          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${active ? "text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
          {!right && label}
          <span className="flex flex-col gap-px">
            <ChevronUp className={`w-2.5 h-2.5 ${active && sortDir === "asc" ? "text-slate-800" : "text-slate-300"}`} />
            <ChevronDown className={`w-2.5 h-2.5 ${active && sortDir === "desc" ? "text-slate-800" : "text-slate-300"}`} />
          </span>
          {right && label}
        </button>
      </th>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">All Restaurants</h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                {filtered.length}
              </span>
            </div>
            {(search || statusFilter !== "ALL") && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Showing {filtered.length} of {restaurants.length} restaurants
              </p>
            )}
          </div>
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, city, email…"
              className="w-full pl-9 pr-4 h-9 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Filter chips — Subscribed / Not Subscribed */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter(statusFilter === "SUBSCRIBED" ? "ALL" : "SUBSCRIBED")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
              statusFilter === "SUBSCRIBED"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusFilter === "SUBSCRIBED" ? "bg-white" : "bg-emerald-500"}`} />
            Subscribed
            <span className={`tabular-nums font-black text-[10px] ${statusFilter === "SUBSCRIBED" ? "opacity-75" : "text-slate-400"}`}>
              {subscribedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === "NOT_SUBSCRIBED" ? "ALL" : "NOT_SUBSCRIBED")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
              statusFilter === "NOT_SUBSCRIBED"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusFilter === "NOT_SUBSCRIBED" ? "bg-white" : "bg-slate-400"}`} />
            Not Subscribed
            <span className={`tabular-nums font-black text-[10px] ${statusFilter === "NOT_SUBSCRIBED" ? "opacity-75" : "text-slate-400"}`}>
              {notSubscribedCount}
            </span>
          </button>

          {statusFilter !== "ALL" && (
            <button
              onClick={() => { setStatusFilter("ALL"); setSearch(""); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <Th col="name" label="Restaurant" />
              <Th col="city" label="City" />
              <Th label="Manager" />
              <Th col="status" label="Plan" />
              <Th col="orders" label="Orders" right />
              <Th col="joined" label="Joined" right />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-6 h-6 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-400">No restaurants found</p>
                    <p className="text-xs text-slate-400">Try a different search term</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => {
                const c = subColor(r.manager.subscription?.status);
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Store className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{r.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                        {r.city}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {r.manager.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 group/email">
                            <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                            <span className="truncate max-w-[150px]">{r.manager.email}</span>
                            <span className="opacity-0 group-hover/email:opacity-100 transition-opacity">
                              <CopyButton text={r.manager.email} />
                            </span>
                          </div>
                        )}
                        {r.manager.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 group/phone">
                            <Phone className="w-3 h-3 text-slate-300 shrink-0" />
                            <span>{r.manager.phone}</span>
                            <span className="opacity-0 group-hover/phone:opacity-100 transition-opacity">
                              <CopyButton text={r.manager.phone} />
                            </span>
                          </div>
                        )}
                        {!r.manager.email && !r.manager.phone && <span className="text-xs text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.manager.subscription ? (
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                            {subLabel(r.manager.subscription.status)}
                          </span>
                          {r.manager.subscription.status === "ACTIVE" && (
                            <p className="text-[10px] text-slate-400 mt-0.5 pl-0.5">
                              until {fmtDate(r.manager.subscription.currentPeriodEnd)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">No plan</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-700 tabular-nums">{fmt(r._count.orders)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[11px] text-slate-500">{fmtDate(r.createdAt)}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  data, onLogout, onRefresh,
}: {
  data: AdminData; onLogout: () => void; onRefresh: () => void;
}) {
  const { stats, subscriptionBreakdown, allRestaurants, monthlySignups } = data;
  const [refreshing, setRefreshing] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  const metricCards = [
    {
      label: "Total Restaurants",
      value: fmt(stats.totalRestaurants),
      sub: `+${stats.newSignupsWeek} this week`,
      icon: Store,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      label: "Active Plans",
      value: fmt(stats.activeSubscriptions),
      sub: `${stats.totalRestaurants > 0 ? Math.round((stats.activeSubscriptions / stats.totalRestaurants) * 100) : 0}% of restaurants`,
      icon: CreditCard,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Monthly Revenue",
      value: fmtCurrency(stats.mrr),
      sub: "active subs × ₹1,499",
      icon: IndianRupee,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Orders Today",
      value: fmt(stats.ordersToday),
      sub: `${fmt(stats.ordersThisWeek)} this week`,
      icon: ShoppingBag,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
    },
    {
      label: "New This Month",
      value: fmt(stats.newSignupsMonth),
      sub: `${stats.newSignupsWeek} in last 7 days`,
      icon: UserPlus,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F8]">
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200/70 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm overflow-hidden">
              <img src="/logo.png" alt="ApneOrder" className="w-6 h-6 object-contain" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-black text-slate-900 tracking-tight">ApneOrder</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">HQ Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all px-3 py-1.5 rounded-xl disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all px-3 py-1.5 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Page heading ───────────────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {stats.totalRestaurants} restaurants · {stats.activeSubscriptions} active plans
            </p>
          </div>
        </div>

        {/* ── Metric cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metricCards.map((card, i) => (
            <MetricCard key={card.label} {...card} delay={i * 0.06} />
          ))}
        </div>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
            <SubscriptionHealth breakdown={subscriptionBreakdown} total={stats.totalRestaurants} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <GrowthChart data={monthlySignups} />
          </motion.div>
        </div>

        {/* ── Alerts + Recent signups row ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
            <AtRiskSection restaurants={allRestaurants} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <RecentSignups restaurants={allRestaurants} />
          </motion.div>
        </div>

        {/* ── Full table ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}>
          <RestaurantsTable restaurants={allRestaurants} />
        </motion.div>
      </main>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [state, setState] = useState<"loading" | "login" | "dashboard">("loading");
  const [data, setData] = useState<AdminData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) { setState("login"); return; }
      const json = await res.json();
      if (json.success) { setData(json); setState("dashboard"); }
      else setState("login");
    } catch {
      setState("login");
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {state === "login" ? (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoginScreen onSuccess={fetchData} />
        </motion.div>
      ) : data ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Dashboard data={data} onLogout={() => setState("login")} onRefresh={fetchData} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
