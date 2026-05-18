"use client"

import {
  ArrowRight, QrCode, Zap, ShieldCheck, BarChart3,
  Loader2, CheckCircle2, Smartphone, TrendingUp, Check, Palette,
  IndianRupee, Clock3, Wallet,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
});

const launchPositioning = {
  proofLabel: "Now onboarding early restaurants",
  finalCta:
    "We are onboarding early restaurant partners who want QR ordering, direct UPI collection, and a cleaner live order flow.",
};

const launchStats = [
  { value: "Early", label: "Restaurant Partners", sub: "pilot onboarding open" },
  { value: "QR", label: "Table Ordering", sub: "scan, browse, and place order" },
  { value: "UPI", label: "Direct Payments", sub: "money goes to your account" },
  { value: "10 min", label: "Go Live", sub: "guided setup flow" },
];

const moneyOutcomes = [
  {
    icon: IndianRupee,
    label: "Order recovery",
    title: "Turn waiting customers into placed orders.",
    desc: "Guests can scan and order while staff is busy, so rush-hour demand does not depend on one waiter reaching every table.",
    stat: "More captured demand",
  },
  {
    icon: Clock3,
    label: "Service efficiency",
    title: "Reduce the manual order-taking loop.",
    desc: "Menu browsing, table number, item selection, and payment intent are already structured before the staff acts on the order.",
    stat: "Less service drag",
  },
  {
    icon: Wallet,
    label: "Payment control",
    title: "Keep collection direct to your UPI.",
    desc: "ApneOrder helps coordinate the order flow while the customer payment goes to the restaurant's own UPI account.",
    stat: "Cleaner cash flow",
  },
];

export default function Home() {
  const [redirecting, setRedirecting] = useState(false);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    const headerOffset = 82;
    const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setRedirecting(true); window.location.href = "/dashboard"; }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) { setRedirecting(true); window.location.href = "/dashboard"; }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfaf7] text-zinc-950 antialiased">

      {/* ─────────────────── NAV ─────────────────── */}
      <header className="sticky top-0 z-50 bg-[#fbfaf7]/88 backdrop-blur-xl border-b border-zinc-950/[0.06]">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-white border border-zinc-950/[0.08] shadow-sm overflow-hidden">
              <img src="/logo.png" alt="ApneOrder" className="h-8 w-8 object-contain" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-black text-zinc-950 tracking-tight text-[18px]">ApneOrder</span>
              <span className="hidden sm:block text-[10px] font-semibold text-zinc-500 mt-1">QR ordering for restaurants</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing'].map(n => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(n.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                {n}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login"
              className="hidden sm:block text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/onboarding">
              <button className="h-10 px-4 sm:px-5 rounded-[10px] bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-[0_10px_24px_rgba(24,24,27,0.16)]">
                Get Started <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ─────────────────── HERO ─────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-14 lg:pt-24 lg:pb-32">
          {/* Soft operational backdrop */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
            <div className="absolute right-[-10%] top-[-10%] w-[620px] h-[620px] bg-emerald-100/55 rounded-full blur-[140px]" />
            <div className="absolute left-[-18%] bottom-[-20%] w-[520px] h-[520px] bg-amber-100/45 rounded-full blur-[140px]" />
          </div>

          <div className="max-w-7xl mx-auto px-5 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

              {/* Left: copy */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp(0)}>

                {/* ── MOBILE HERO ── */}
                <div className="lg:hidden">

                  {/* Social proof row */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="flex items-center justify-between gap-3 mb-5"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-zinc-950/[0.08] px-3 py-1.5 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                      <p className="text-[11px] text-zinc-600 font-semibold">
                        Live table ordering
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-semibold">No app install</p>
                  </motion.div>

                  {/* Headline */}
                  <h1 className="text-[42px] font-black tracking-tight leading-[0.98] mb-5 max-w-[330px]">
                    Orders move faster.<br />
                    <span className="text-emerald-700">Tables stay clear.</span>
                  </h1>

                  {/* Live order proof card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                    className="bg-white border border-zinc-950/[0.08] rounded-[18px] px-4 py-4 mb-5 shadow-[0_18px_45px_rgba(24,24,27,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Check size={16} className="text-emerald-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black text-zinc-950 leading-tight">
                            Table 4 paid order
                          </p>
                          <p className="text-[12px] text-zinc-500 mt-1">
                            Espresso x 2 · <span className="text-emerald-700 font-bold">Rs. 240 via UPI</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                        <span className="text-[9px] font-black text-emerald-700">LIVE</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { value: '04', label: 'Table' },
                        { value: '2m', label: 'Ago' },
                        { value: 'UPI', label: 'Paid' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-[10px] bg-zinc-50 border border-zinc-100 px-2 py-2">
                          <p className="text-[12px] font-black text-zinc-950">{item.value}</p>
                          <p className="text-[9px] font-semibold text-zinc-400 mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Description */}
                  <p className="text-[15px] text-zinc-600 leading-relaxed mb-6 max-w-[340px]">
                    QR menu, UPI collection, waiter calls, and live kitchen-ready orders in one clean dashboard for Indian restaurants.
                  </p>

                  {/* CTA button */}
                  <Link href="/onboarding" className="block mb-4">
                    <button className="h-[54px] w-full rounded-[14px]
                      bg-emerald-700 active:bg-emerald-800
                      text-white font-black text-[15px]
                      flex items-center justify-center gap-2
                      shadow-[0_18px_34px_rgba(4,120,87,0.24)]">
                      Book Setup - Takes 10 Minutes
                      <ArrowRight size={15} />
                    </button>
                  </Link>

                  {/* 3-stat row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '₹0',    label: 'Setup cost' },
                      { value: '10 min',label: 'Go live' },
                      { value: 'UPI',   label: 'Payments' },
                    ].map(s => (
                      <div key={s.label}
                        className="bg-white/80 rounded-[12px] py-3 text-center border border-zinc-950/[0.07] shadow-sm">
                        <p className="text-[13px] font-black text-zinc-900">{s.value}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-semibold">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── DESKTOP HERO ── */}
                <div className="hidden lg:block">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-white border border-zinc-950/[0.08] shadow-sm mb-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-600 tracking-wide uppercase">
                      {launchPositioning.proofLabel}
                    </span>
                  </div>

                  <h1 className="text-[64px] font-black tracking-tight leading-[0.98] mb-6 max-w-[620px]">
                    Orders move faster.<br />
                    <span className="text-emerald-700">Tables stay clear.</span>
                  </h1>

                  <p className="text-lg text-zinc-600 leading-relaxed mb-8 max-w-[480px]">
                    QR menus, direct UPI collection, waiter calls, and real-time order management for Indian restaurants that want smoother service without building an app.
                  </p>

                  <div className="flex gap-3 mb-8">
                    <Link href="/onboarding">
                      <button className="h-12 px-7 rounded-[12px] bg-emerald-700 hover:bg-emerald-800 text-white
                        font-bold text-sm transition-all flex items-center gap-2 shadow-[0_14px_30px_rgba(4,120,87,0.18)]">
                        Book Setup <ArrowRight size={15} />
                      </button>
                    </Link>
                    <a href="#how-it-works">
                      <button className="h-12 px-7 rounded-[12px] border border-zinc-300 hover:border-zinc-400 bg-white/60
                        text-zinc-700 font-bold text-sm transition-all">
                        See How It Works
                      </button>
                    </a>
                  </div>

                  <div className="flex items-center gap-5 flex-wrap">
                    {['Free to start', 'No app needed', 'Instant UPI'].map((t) => (
                      <div key={t} className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-zinc-500">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>

              {/* Right: phone mockup */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="relative flex justify-center lg:justify-end"
              >
                {/* Glow */}
                <div className="absolute inset-10 bg-emerald-100 rounded-full blur-3xl opacity-35 pointer-events-none" />

                {/* Bottom fade mask on mobile */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fbfaf7] to-transparent z-20 lg:hidden pointer-events-none" />

                {/* Phone frame */}
                <div className="relative w-[238px] sm:w-[292px] h-[486px] sm:h-[590px] bg-zinc-950
                  rounded-[38px] sm:rounded-[42px] shadow-[0_30px_80px_rgba(24,24,27,0.22)] border-[4px] sm:border-[5px] border-zinc-800 overflow-hidden z-10">
                  {/* Dynamic island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6
                    bg-zinc-950 rounded-full z-20 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-800" />
                  </div>

                  {/* Screen */}
                  <div className="relative w-full h-full bg-[#fbfaf7] overflow-hidden pt-8">
                    {/* Restaurant header */}
                    <div className="relative overflow-hidden bg-zinc-950 px-4 pt-4 pb-5">
                      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-emerald-500/25 blur-2xl" />
                      <div className="relative flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-300">Table 4</span>
                          </div>
                          <p className="text-white font-black text-[14px] leading-tight">The Green Bean Café</p>
                          <p className="text-zinc-400 text-[10px] mt-1">Fresh coffee · quick bites</p>
                        </div>
                        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-zinc-950 shadow-sm">
                          <QrCode size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="px-3 py-3">
                      <div className="mb-3 flex gap-1.5 overflow-hidden">
                        {['Popular', 'Coffee', 'Snacks'].map((category, i) => (
                          <div
                            key={category}
                            className={`shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-black ${
                              i === 0
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-zinc-500 border border-zinc-100'
                            }`}
                          >
                            {category}
                          </div>
                        ))}
                      </div>

                      <div className="mb-3 rounded-[18px] bg-white p-2.5 shadow-sm border border-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-[11px] font-black text-amber-700">
                            GB
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[11px] font-black text-zinc-950">Chef&apos;s combo</p>
                              <p className="text-[11px] font-black text-zinc-950">₹300</p>
                            </div>
                            <p className="mt-0.5 text-[9px] font-medium text-zinc-400">Cappuccino + sandwich</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Popular items</p>
                        <p className="text-[8px] font-bold text-emerald-700">Live menu</p>
                      </div>

                      <div className="space-y-1.5">
                        {[
                          { name: 'Espresso', price: '₹120', note: 'Strong shot', qty: 1 },
                          { name: 'Cappuccino', price: '₹180', note: 'Foamed milk', qty: 0 },
                          { name: 'Latte', price: '₹160', note: 'Smooth blend', qty: 1 },
                        ].map((item) => (
                          <div key={item.name}
                            className="flex items-center justify-between rounded-[15px] bg-white px-2.5 py-2.5 border border-zinc-100 shadow-[0_6px_14px_rgba(24,24,27,0.03)]">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="truncate text-[10px] font-black text-zinc-900">{item.name}</p>
                                <p className="mt-0.5 text-[8px] font-medium text-zinc-400">{item.note}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-black text-zinc-600">{item.price}</span>
                              <div className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 ${
                                item.qty ? 'bg-emerald-600 text-white' : 'bg-zinc-950 text-white'
                              }`}>
                                <span className="text-[10px] font-black leading-none">{item.qty || '+'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Snacks</p>
                        <p className="text-[8px] font-bold text-zinc-400">2 available</p>
                      </div>
                      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                        {[
                          { name: 'Club Sandwich', price: '₹220' },
                          { name: 'Chicken Wrap', price: '₹260' },
                        ].map(item => (
                          <div key={item.name}
                            className="rounded-[15px] bg-white p-2.5 border border-zinc-100 shadow-[0_6px_14px_rgba(24,24,27,0.03)]">
                            <p className="truncate text-[9px] font-black text-zinc-900">{item.name}</p>
                            <p className="mt-1 text-[9px] font-bold text-zinc-500">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom order bar */}
                    <div className="absolute bottom-4 left-3 right-3">
                      <div className="bg-zinc-950 rounded-[22px] px-3 py-3 flex items-center justify-between shadow-[0_18px_35px_rgba(24,24,27,0.28)] border border-white/10">
                        <div>
                          <p className="text-white text-[11px] font-black">2 items selected</p>
                          <p className="text-emerald-300 text-[9px] mt-0.5">₹300 total · Table 4</p>
                        </div>
                        <div className="bg-emerald-500 rounded-[16px] px-3.5 py-2 shadow-[inset_0_-10px_18px_rgba(4,120,87,0.22)]">
                          <span className="text-white text-[10px] font-black">Pay UPI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating: new order notification — hidden on mobile */}
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="hidden sm:block absolute -right-6 top-16 bg-white rounded-2xl shadow-xl
                    border border-zinc-100 p-3 w-44 z-20"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-emerald-600" />
                    </div>
                    <p className="text-[11px] font-black text-zinc-900">New Order!</p>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed">Table 4 · Espresso × 2</p>
                  <p className="text-[9px] font-bold text-emerald-600 mt-1">₹240 · Paid via UPI ✓</p>
                </motion.div>

                {/* Floating: QR badge — hidden on mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="hidden sm:block absolute -left-8 bottom-24 bg-zinc-900 rounded-2xl shadow-xl p-3.5 z-20"
                >
                  <QrCode size={38} className="text-white" strokeWidth={1.4} />
                  <p className="text-[9px] text-zinc-400 text-center mt-1.5 font-semibold tracking-wide">
                    Scan · Order · Pay
                  </p>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ─────────────────── STATS BAR ─────────────────── */}
        <section className="bg-zinc-900 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-5 lg:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {launchStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center px-2 lg:px-4"
                >
                  <p className="text-2xl lg:text-4xl font-black text-white">{s.value}</p>
                  <p className="text-xs lg:text-sm font-bold text-zinc-300 mt-1">{s.label}</p>
                  <p className="text-[10px] lg:text-[11px] text-zinc-500 mt-0.5">{s.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────── MONEY OUTCOME ─────────────────── */}
        <section className="relative overflow-hidden py-12 lg:py-28 bg-[#f7f5ef]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300/80 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.08))]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp(0)}
              className="mb-7 lg:mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-2xl">
                <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.22em] text-emerald-800">
                  Restaurant economics
                </p>
                <h2 className="mt-3 lg:mt-4 text-[30px] sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.04] lg:leading-[1.02] text-zinc-950">
                  The money case is simple: fewer delays, cleaner orders, direct collection.
                </h2>
              </div>
              <p className="max-w-sm text-[14px] lg:text-base leading-relaxed text-zinc-600">
                ApneOrder is designed around the moments where restaurants lose time, orders, or payment clarity.
              </p>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55 }}
                className="relative overflow-hidden rounded-[22px] lg:rounded-[28px] bg-zinc-950 p-4 sm:p-7 lg:p-8 text-white shadow-[0_22px_55px_rgba(24,24,27,0.2)] lg:shadow-[0_28px_80px_rgba(24,24,27,0.22)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.18em] lg:tracking-[0.2em] text-zinc-500">Recovery model</p>
                      <h3 className="mt-2 lg:mt-3 text-[22px] sm:text-3xl font-black tracking-tight">1 extra table order per day</h3>
                    </div>
                    <div className="grid h-10 w-10 lg:h-12 lg:w-12 place-items-center rounded-[14px] lg:rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                      <IndianRupee size={20} className="text-emerald-300" />
                    </div>
                  </div>

                  <div className="mt-5 lg:mt-8 rounded-[18px] lg:rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 lg:p-4">
                    <div className="grid grid-cols-[1fr_auto] gap-y-3 lg:gap-y-4 text-[13px] lg:text-sm">
                      {[
                        ["Average order value", "Rs. 300"],
                        ["Recovered order frequency", "1/day"],
                        ["Monthly operating days", "30"],
                      ].map(([label, value], i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: 0.18 + i * 0.08 }}
                          className="contents"
                        >
                          <p className="border-b border-white/10 pb-3 text-zinc-400">{label}</p>
                          <p className="border-b border-white/10 pb-3 text-right font-black text-white">{value}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4 lg:mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.18em] lg:tracking-[0.2em] text-emerald-300">Potential captured value</p>
                        <p className="mt-1.5 lg:mt-2 text-4xl sm:text-5xl font-black tracking-tight">Rs. 9k</p>
                      </div>
                      <p className="max-w-[128px] lg:max-w-[150px] text-right text-[10px] lg:text-[11px] leading-relaxed text-zinc-500">
                        Example only. Real results depend on footfall, menu value, and adoption.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-5 flex items-start gap-3 rounded-[16px] lg:rounded-2xl bg-emerald-400/10 p-3.5 lg:p-4 ring-1 ring-emerald-300/10">
                    <CheckCircle2 size={16} className="mt-0.5 text-emerald-300 flex-shrink-0" />
                    <p className="text-[11px] lg:text-[12px] leading-relaxed text-zinc-300">
                      The goal is not magic growth. It is recovering small leaks in order-taking, service time, and payment handling.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="rounded-[22px] lg:rounded-[28px] border border-zinc-950/[0.08] bg-white/80 p-1.5 lg:p-2 shadow-[0_18px_48px_rgba(24,24,27,0.06)] lg:shadow-[0_24px_70px_rgba(24,24,27,0.07)] backdrop-blur">
                {moneyOutcomes.map((item, i) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.45, delay: i * 0.09 }}
                      className="group relative grid grid-cols-[38px_1fr] gap-3 rounded-[18px] lg:rounded-[22px] p-3.5 sm:grid-cols-[56px_1fr] sm:p-5 transition-colors duration-300 hover:bg-[#fbfaf7]"
                    >
                      {i < moneyOutcomes.length - 1 && (
                        <div className="absolute left-4 right-4 bottom-0 h-px bg-zinc-950/[0.06]" />
                      )}
                      <div className="grid h-9 w-9 sm:h-12 sm:w-12 place-items-center rounded-[13px] sm:rounded-2xl bg-zinc-950 text-white shadow-sm transition-all duration-300 group-hover:bg-emerald-700 group-hover:shadow-[0_12px_28px_rgba(4,120,87,0.2)]">
                        <Icon size={17} className="sm:hidden" strokeWidth={2} />
                        <Icon size={20} className="hidden sm:block" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] text-emerald-800">{item.label}</p>
                          <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400">{item.stat}</p>
                        </div>
                        <h3 className="mt-2 text-[16px] leading-snug sm:text-xl font-black tracking-tight text-zinc-950">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 sm:mt-2 max-w-xl text-[13px] sm:text-sm leading-relaxed text-zinc-600">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────── FEATURES ─────────────────── */}
        <section id="features" className="py-14 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 lg:px-10">

            {/* Header — left aligned with desc on right */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp(0)}
              className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-12"
            >
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Features</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mt-3">
                  Everything your<br className="hidden sm:block" /> restaurant needs.
                </h2>
              </div>
              <p className="text-zinc-500 text-base max-w-[280px] leading-relaxed lg:text-right">
                From first scan to final payment — the whole stack in one platform.
              </p>
            </motion.div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* ── Card 1: Setup — dark, large left ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="lg:col-span-7 bg-zinc-900 rounded-3xl p-8 lg:p-10 relative overflow-hidden"
              >
                {/* Watermark */}
                <div className="absolute -right-4 -bottom-4 text-[220px] font-black leading-none
                  select-none pointer-events-none text-white/[0.035]">10</div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-7">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Zap size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Setup</span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-black text-white leading-[1.1] mb-3">
                    Live in<br />10 minutes.
                  </h3>
                  <p className="text-zinc-400 text-sm mb-9 max-w-xs leading-relaxed">
                    No developers, no agency. Guided setup takes less time than a cup of coffee.
                  </p>

                  <div className="space-y-3.5">
                    {[
                      'Add restaurant & location details',
                      'Upload menu categories and items',
                      'Set your UPI ID for direct payments',
                      'Download QR codes — you\'re live.',
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 + i * 0.09 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700
                          flex items-center justify-center flex-shrink-0">
                          <span className="text-zinc-400 text-[10px] font-black">{i + 1}</span>
                        </div>
                        <span className="text-sm text-zinc-300 font-medium">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── Card 2: UPI Payments — emerald ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="lg:col-span-5 bg-emerald-600 rounded-3xl p-8 relative overflow-hidden"
              >
                <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-emerald-500
                  rounded-full blur-3xl opacity-50 pointer-events-none" />

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-auto">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                      <ShieldCheck size={14} className="text-emerald-100" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest">Payments</span>
                  </div>

                  <div className="my-7">
                    <p className="text-7xl font-black text-white leading-none">₹0</p>
                    <p className="text-emerald-200 font-semibold mt-2 text-lg">transaction fees. Ever.</p>
                  </div>

                  <p className="text-emerald-100/80 text-sm leading-relaxed mb-6">
                    Customers pay directly to your UPI. Every rupee lands in your account instantly.
                  </p>

                  {/* Live payment card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[11px] font-black">G</span>
                        </div>
                        <div>
                          <p className="text-white text-[11px] font-bold leading-tight">GPay · Table 4</p>
                          <p className="text-emerald-200 text-[9px]">Just now</p>
                        </div>
                      </div>
                      <p className="text-white font-black text-sm">₹340</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      <span className="text-emerald-200 text-[10px] font-semibold">Settled instantly to your UPI</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Card 3: Dashboard — white with live feed ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="lg:col-span-5 bg-white rounded-3xl p-8 border border-zinc-100 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BarChart3 size={14} className="text-blue-500" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Dashboard</span>
                  <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 text-[10px] font-bold">Live</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 leading-snug mb-6">
                  Every order,<br />in real time.
                </h3>

                <div className="space-y-2">
                  {[
                    { table: 4, items: 'Espresso × 2', amount: '₹240', status: 'new',  label: 'New' },
                    { table: 7, items: 'Latte, Sandwich', amount: '₹380', status: 'prep', label: 'Preparing' },
                    { table: 2, items: 'Cappuccino × 3', amount: '₹540', status: 'done', label: 'Paid' },
                  ].map((order, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.28 + i * 0.1 }}
                      className="flex items-center justify-between bg-zinc-50 rounded-xl px-3.5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          order.status === 'new'  ? 'bg-emerald-500 animate-pulse' :
                          order.status === 'prep' ? 'bg-amber-400' : 'bg-zinc-300'
                        }`} />
                        <div>
                          <p className="text-[12px] font-bold text-zinc-800">Table {order.table}</p>
                          <p className="text-[10px] text-zinc-400">{order.items}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'new'  ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'prep' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-zinc-100 text-zinc-400'
                        }`}>{order.label}</span>
                        <p className="text-[12px] font-black text-zinc-800">{order.amount}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── Card 4: Branding — zinc-50 ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.26 }}
                className="lg:col-span-7 bg-zinc-50 rounded-3xl p-8 border border-zinc-100 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-zinc-200 flex items-center justify-center">
                    <Palette size={14} className="text-zinc-600" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Branding</span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 leading-snug mb-2">
                  Your menu,<br />your brand colours.
                </h3>
                <p className="text-zinc-500 text-sm mb-8 max-w-xs leading-relaxed">
                  Every customer sees your brand on the menu. One click to change it anytime.
                </p>

                <div className="flex flex-wrap items-end gap-6">
                  {/* Colour swatches */}
                  <div className="flex items-center gap-2.5">
                    {[
                      { c: '#18181b', ring: true },
                      { c: '#059669' },
                      { c: '#2563EB' },
                      { c: '#D97706' },
                      { c: '#DC2626' },
                      { c: '#7C3AED' },
                    ].map(({ c, ring }, i) => (
                      <motion.div
                        key={c}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.35 + i * 0.06, type: 'spring', stiffness: 260, damping: 18 }}
                        className={`w-9 h-9 rounded-xl shadow-sm cursor-pointer
                          hover:scale-110 transition-transform duration-150 ${
                          ring ? 'ring-2 ring-offset-2 ring-zinc-800' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Mini menu card preview */}
                  <div className="flex items-stretch rounded-xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                    <div className="w-1.5 bg-zinc-900" />
                    <div className="px-4 py-3">
                      <p className="text-[12px] font-black text-zinc-900">The Green Bean</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Table 4 · Tap to order</p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ─────────────────── HOW IT WORKS ─────────────────── */}
        <section id="how-it-works" className="py-14 lg:py-32 bg-zinc-50 border-y border-zinc-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 lg:px-10">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp(0)} className="text-center mb-10 lg:mb-14"
            >
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">How It Works</span>
              <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-black tracking-tight mt-3 mb-4">
                From sign-up to live<br className="hidden sm:block" /> in 3 simple steps.
              </h2>
            </motion.div>

            <div className="relative max-w-5xl mx-auto">
              <svg
                className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-4 hidden h-12 w-[66.8%] md:block"
                viewBox="0 0 720 48"
                fill="none"
                aria-hidden="true"
              >
                <path d="M8 24 H712" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" />
                <motion.path
                  d="M8 24 H712"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="54 650"
                  animate={{ strokeDashoffset: [704, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              <div className="absolute left-[29px] top-14 bottom-28 w-px bg-zinc-200 md:hidden" />
              <motion.div
                className="absolute left-[29px] top-14 h-16 w-px bg-gradient-to-b from-transparent via-emerald-500 to-transparent md:hidden"
                animate={{ y: [0, 230, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-10">
              {[
                {
                  step: '01',
                  icon: <QrCode size={22} className="text-zinc-900" />,
                  title: 'Set Up Your Restaurant',
                  desc: 'Add your restaurant details, upload your menu categories and items, and set your UPI ID.',
                },
                {
                  step: '02',
                  icon: <Smartphone size={22} className="text-zinc-900" />,
                  title: 'Print & Place QR Codes',
                  desc: 'Download QR codes for each table. Print and place them — no app needed for customers.',
                },
                {
                  step: '03',
                  icon: <TrendingUp size={22} className="text-zinc-900" />,
                  title: 'Watch Orders Roll In',
                  desc: 'Customers scan, browse, and pay directly to your UPI. Track every order live.',
                },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.15 }}
                  className="relative z-10 flex items-start gap-4 rounded-[20px] border border-zinc-100 bg-white p-4 shadow-[0_12px_34px_rgba(24,24,27,0.04)] md:flex-col md:items-center md:text-center md:border-0 md:bg-transparent md:p-0 md:shadow-none"
                >
                  <div className="relative w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl
                    border border-zinc-200 shadow-[0_12px_28px_rgba(24,24,27,0.06)] flex items-center justify-center flex-shrink-0 md:mb-5">
                    <span className="absolute -left-1 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-300 md:block" />
                    <span className="absolute -right-1 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-300 md:block" />
                    {s.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 bg-zinc-900 rounded-full
                      flex items-center justify-center shadow-sm">
                      <span className="text-white text-[9px] font-black">{s.step}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[15px] md:text-lg font-black text-zinc-900 mb-1 md:mb-2">{s.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed md:max-w-[260px]">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-center mt-10 lg:mt-14"
            >
              <Link href="/onboarding">
                <button className="h-12 px-7 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white
                  font-bold text-sm transition-all flex items-center gap-2 mx-auto shadow-sm">
                  Start Setup Now <ArrowRight size={15} />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─────────────────── PRICING ─────────────────── */}
        <section id="pricing" className="py-14 lg:py-32">
          <div className="max-w-7xl mx-auto px-5 lg:px-10">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp(0)} className="text-center mb-10 lg:mb-16"
            >
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Pricing</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-3 mb-4">
                Simple, transparent pricing.
              </h2>
              <p className="text-zinc-500 text-lg max-w-md mx-auto">
                One standard plan for restaurants that want QR ordering, UPI payments, and live operations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="relative max-w-sm mx-auto rounded-[28px] bg-zinc-900 border border-zinc-900 text-white p-7 sm:p-8 overflow-hidden shadow-[0_28px_80px_rgba(24,24,27,0.18)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-400">
                      Standard Plan
                    </p>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-5xl font-black tracking-tight text-white">₹1,499</span>
                      <span className="text-sm text-zinc-400">/month</span>
                    </div>
                    <p className="mt-3 text-sm text-zinc-400">
                      Everything needed to run QR ordering for one restaurant.
                    </p>
                  </div>
                  <div className="w-fit rounded-full bg-emerald-500/15 px-3 py-1.5 text-[11px] font-black text-emerald-300 ring-1 ring-emerald-400/10">
                    One clear price
                  </div>
                </div>

                <div className="my-8 h-px bg-white/10" />

                <ul className="space-y-3.5">
                  {[
                    'Unlimited tables',
                    'QR menu & ordering',
                    'Direct UPI payments',
                    'Live order dashboard',
                    'Waiter call system',
                    'Analytics & branding',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/onboarding" className="block mt-8">
                  <button className="w-full h-12 rounded-[14px] bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm transition-all shadow-[0_16px_34px_rgba(16,185,129,0.22)]">
                    Start Standard Plan
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─────────────────── FINAL CTA ─────────────────── */}
        <section className="relative overflow-hidden bg-zinc-900 py-14 lg:py-32">
          <div className="absolute inset-0 -z-0 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2
              w-[700px] h-[400px] bg-emerald-900/40 rounded-full blur-[90px]" />
          </div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp(0)}
            className="relative z-10 max-w-3xl mx-auto px-5 lg:px-10 text-center"
          >
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Get Started Today</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-4 mb-5 leading-tight">
              Ready to take your<br className="hidden sm:block" /> restaurant digital?
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              {launchPositioning.finalCta} Setup takes 10 minutes.
              Start with the standard plan when your restaurant is ready.
            </p>
            <Link href="/onboarding">
              <button className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400
                text-white font-black text-lg transition-all
                shadow-2xl shadow-emerald-950/60 flex items-center gap-3 mx-auto">
                Book Setup <ArrowRight size={20} />
              </button>
            </Link>
            <p className="text-xs text-zinc-600 mt-5">Standard plan · Cancel anytime · Go live in 10 min</p>
          </motion.div>
        </section>

      </main>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="ApneOrder" className="h-7 w-7 object-contain opacity-40" />
                <span className="font-black text-zinc-400 text-sm tracking-tight">ApneOrder</span>
              </Link>
              <p className="text-xs text-zinc-600 text-center md:text-left max-w-[220px]">
                Restaurant management made simple for modern Indian restaurants.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex items-center gap-5">
                <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  Terms &amp; Conditions
                </Link>
                <span className="text-zinc-800 text-xs">·</span>
                <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  Privacy Policy
                </Link>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/apneorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ApneOrder on Instagram"
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com/apneorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ApneOrder on X (Twitter)"
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/apneorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ApneOrder on LinkedIn"
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
            <p className="text-xs text-zinc-700">
              © {new Date().getFullYear()} ApneOrder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
