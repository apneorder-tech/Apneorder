"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"
import {
  QrCode, Smartphone, CreditCard, Bell, BarChart3, CheckCircle2,
  Zap, ShieldCheck, TrendingUp, Clock, IndianRupee, Utensils,
  ChefHat, ArrowDown, Star, Users, Receipt, Wifi, Package,
  Check, RefreshCw, AlertCircle, PieChart, Banknote, Timer,
  Table2, ArrowRight, Sparkles, CircleDot, BadgeCheck, Play,
  Layers, Globe, Lock, Cpu, Activity, Target, Award, Coffee,
  MessageSquare, PhoneCall, MapPin, TrendingDown, DollarSign,
  BarChart2, Maximize2, Send, Hash, Percent, ChevronRight,
  Eye, Heart, ThumbsUp, Share2, Bookmark, Filter, Search,
  Menu, X, Plus, Minus, ShoppingCart, Truck, Box, Gift,
  Camera, Settings, HelpCircle, LogOut, User, Home, Grid
} from "lucide-react"

/* ─── easing constants ─── */
const E  = [0.34, 1.15, 0.64, 1] as [number, number, number, number]
const ES = [0.22, 1,    0.36, 1] as [number, number, number, number]
const EI = [0.4,  0,    0.2,  1] as [number, number, number, number]
const EO = [0,    0,    0.2,  1] as [number, number, number, number]

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const tick = (now: number) => {
      if (!startTime) startTime = now
      const p = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setValue(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])
  return value
}

/* ─── Particle System ─── */
function Particles({ count = 30, color = "rgba(74,222,128,0.4)" }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -Math.random() * 80 - 20, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0, Math.random() * 0.8 + 0.2, 0],
            scale: [0, Math.random() * 1.5 + 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

/* ─── Glow Ring ─── */
function GlowRing({ color, size, delay = 0 }: { color: string; size: number; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        border: `1px solid ${color}`,
        top: "50%", left: "50%",
        x: "-50%", y: "-50%",
      }}
      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, ease: EI }}
    />
  )
}

/* ─── Floating Card ─── */
function FloatingCard({ children, delay = 0, className = "", style = {} }: any) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}

type Step = "hidden" | "active" | "done"

/* ════════════════════════════════════════════════════
   SCENE 1 — The Problem (Cinematic Opening)
════════════════════════════════════════════════════ */
function Scene1() {
  const [phase, setPhase] = useState(0)
  const [pills, setPills] = useState([false, false, false, false, false, false])
  const [metric, setMetric] = useState(false)
  const [scanline, setScanline] = useState(false)
  const counterVal = useAnimatedCounter(18, 1500, metric)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(100,  () => setScanline(true))
    T(400,  () => setPhase(1))
    T(900,  () => setPhase(2))
    T(1400, () => setPhase(3))
    T(1800, () => setPills([true, false, false, false, false, false]))
    T(2100, () => setPills([true, true, false, false, false, false]))
    T(2400, () => setPills([true, true, true, false, false, false]))
    T(2700, () => setPills([true, true, true, true, false, false]))
    T(3000, () => setPills([true, true, true, true, true, false]))
    T(3300, () => setPills([true, true, true, true, true, true]))
    T(4200, () => setMetric(true))
    return () => ts.forEach(clearTimeout)
  }, [])

  const pains = [
    { icon: <Receipt size={13} />,     text: "Paper menus get lost",      color: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.2)",   iconColor: "#ef4444" },
    { icon: <AlertCircle size={13} />, text: "Orders constantly misheard", color: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.2)",  iconColor: "#f59e0b" },
    { icon: <Banknote size={13} />,    text: "Cash-only payment chaos",    color: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.2)",   iconColor: "#ef4444" },
    { icon: <Users size={13} />,       text: "Undertrained floor staff",   color: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.2)",  iconColor: "#f59e0b" },
    { icon: <Clock size={13} />,       text: "Long wait times kill sales", color: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.2)",   iconColor: "#ef4444" },
    { icon: <TrendingDown size={13} />,text: "No sales data or insights",  color: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.2)",  iconColor: "#f59e0b" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: EO }}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111113 50%, #0f0a0a 100%)" }}>

      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(239,68,68,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.05) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />

      {/* Scanline effect */}
      <motion.div
        animate={{ y: scanline ? ["0%", "100%"] : "0%" }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        className="absolute inset-x-0 h-[2px] pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent)" }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(239,68,68,0.07) 0%, transparent 70%)" }} />

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -20, scale: phase >= 1 ? 1 : 0.8 }}
        transition={{ duration: 0.6, ease: E }}
        className="flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-5"
        style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", backdropFilter: "blur(8px)" }}>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[9px] font-black tracking-[6px] uppercase text-red-400">The Crisis</span>
        <span className="text-[9px] text-red-600 font-bold">Indian Restaurants in 2024</span>
      </motion.div>

      {/* Main headline */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 40, scale: phase >= 2 ? 1 : 0.9 }}
          transition={{ duration: 0.8, ease: E }}>
          <h1 className="font-black leading-none tracking-[-4px] text-center"
            style={{ fontSize: 62, color: "#fafafa" }}>
            Your restaurant
          </h1>
          <h1 className="font-black leading-none tracking-[-4px] text-center mt-1"
            style={{ fontSize: 62, color: "rgba(255,255,255,0.18)" }}>
            is bleeding money.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[12px] mt-2 text-center"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          Every missed order. Every long wait. Every cash transaction. All avoidable.
        </motion.p>
      </div>

      {/* Pain pills */}
      <div className="flex gap-2 flex-wrap justify-center mb-6 max-w-[700px] mt-6">
        {pains.map((p, i) => (
          <motion.div
            key={p.text}
            initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
            animate={{ opacity: pills[i] ? 1 : 0, scale: pills[i] ? 1 : 0.6, rotate: pills[i] ? 0 : -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex items-center gap-2.5 rounded-full px-4 py-2"
            style={{ background: p.color, border: `1px solid ${p.border}` }}>
            <span style={{ color: p.iconColor }}>{p.icon}</span>
            <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.75)" }}>{p.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Metric card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.85 }}
        animate={{ opacity: metric ? 1 : 0, y: metric ? 0 : 30, scale: metric ? 1 : 0.85 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative">

        {/* Glow rings */}
        <div className="relative">
          <GlowRing color="rgba(239,68,68,0.3)" size={120} />
          <GlowRing color="rgba(239,68,68,0.15)" size={120} delay={0.8} />
        </div>

        <div className="relative flex items-stretch gap-0 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}>

          {/* Left: timer animation */}
          <div className="px-8 py-6 flex flex-col items-center justify-center"
            style={{ background: "rgba(239,68,68,0.12)", borderRight: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="relative w-16 h-16 mb-2">
              <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="3" />
                <motion.circle
                  cx="32" cy="32" r="28" fill="none" stroke="#ef4444" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={175.9}
                  initial={{ strokeDashoffset: 175.9 }}
                  animate={{ strokeDashoffset: metric ? 175.9 * 0.22 : 175.9 }}
                  transition={{ duration: 1.8, ease: ES, delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Timer size={22} className="text-red-400" />
              </div>
            </div>
            <p className="text-[8px] font-black tracking-[3px] uppercase text-red-500">Avg Wait</p>
          </div>

          {/* Center: big number */}
          <div className="px-10 py-6 flex flex-col items-center justify-center"
            style={{ background: "rgba(20,10,10,0.9)" }}>
            <div className="flex items-end gap-1">
              <span className="font-black text-red-400 leading-none"
                style={{ fontSize: 56, letterSpacing: -3 }}>{counterVal}</span>
              <span className="text-[22px] font-black text-red-600 mb-1">min</span>
            </div>
            <p className="text-[9px] font-bold tracking-[4px] uppercase text-zinc-600 mt-1">customer wait time</p>
          </div>

          {/* Right: loss bar */}
          <div className="px-8 py-6 flex flex-col justify-center gap-2"
            style={{ background: "rgba(239,68,68,0.06)" }}>
            <p className="text-[8px] font-black text-red-500 tracking-widest uppercase">Revenue Lost</p>
            {["Per table", "Per day", "Per month"].map((label, i) => {
              const amounts = ["₹340", "₹4,200", "₹1.26L"]
              const widths = ["40%", "68%", "100%"]
              return (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-16 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400"
                      initial={{ width: "0%" }}
                      animate={{ width: metric ? widths[i] : "0%" }}
                      transition={{ duration: 1, ease: ES, delay: 0.4 + i * 0.15 }} />
                  </div>
                  <span className="text-[8px] text-zinc-500 w-10">{label}</span>
                  <span className="text-[9px] font-black text-red-400">{amounts[i]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      <Particles count={20} color="rgba(239,68,68,0.3)" />
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE 2 — QR Ordering (Immersive Customer POV)
════════════════════════════════════════════════════ */
function Scene2() {
  const [phase, setPhase] = useState(0)
  const [step, setStep] = useState<"scan" | "browse" | "cart" | "pay" | "done">("scan")
  const [items, setItems] = useState([false, false, false, false])
  const [cartItems, setCartItems] = useState<number[]>([])
  const [payAnim, setPayAnim] = useState(false)
  const [successPulse, setSuccessPulse] = useState(false)
  const [qrScan, setQrScan] = useState(false)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(200,  () => setPhase(1))
    T(700,  () => setPhase(2))
    T(1200, () => setQrScan(true))
    T(2000, () => { setStep("browse"); setItems([true, false, false, false]) })
    T(2500, () => setItems([true, true, false, false]))
    T(3000, () => setItems([true, true, true, false]))
    T(3500, () => setItems([true, true, true, true]))
    T(4200, () => { setStep("cart"); setCartItems([0]) })
    T(5000, () => setCartItems([0, 2]) )
    T(5800, () => setStep("pay") )
    T(6600, () => setPayAnim(true) )
    T(7400, () => { setStep("done"); setSuccessPulse(true) })
    return () => ts.forEach(clearTimeout)
  }, [])

  const menuItems = [
    { name: "Butter Chicken",      desc: "Rich tomato gravy",      price: 280, rating: 4.9, orders: "2.1k", emoji: "🍗", veg: false, popular: true  },
    { name: "Paneer Tikka Masala", desc: "Smoked cottage cheese",  price: 240, rating: 4.7, orders: "1.8k", emoji: "🧀", veg: true,  popular: false },
    { name: "Dal Makhani",         desc: "Slow-cooked black lentil",price: 180, rating: 4.8, orders: "1.5k", emoji: "🫘", veg: true,  popular: true  },
    { name: "Garlic Naan",         desc: "Tandoor-fresh, buttered", price: 50,  rating: 4.6, orders: "3.2k", emoji: "🫓", veg: true,  popular: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60, filter: "blur(4px)" }}
      transition={{ duration: 0.6, ease: EO }}
      className="absolute inset-0 flex items-center justify-center gap-12 px-12"
      style={{ background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #f0f4f0 100%)" }}>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: "radial-gradient(rgba(5,150,105,0.06) 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(5,150,105,0.08), transparent 70%)" }} />

      {/* Left copy */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -40 }}
        transition={{ duration: 0.7, ease: ES }}
        className="flex flex-col gap-3 w-[265px] flex-shrink-0">

        <div>
          <motion.div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 w-fit mb-3"
            style={{ background: "#18181b" }}
            animate={{ boxShadow: ["0 4px 20px rgba(0,0,0,0.2)", "0 8px 30px rgba(5,150,105,0.3)", "0 4px 20px rgba(0,0,0,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <Sparkles size={9} className="text-emerald-400" />
            <span className="text-[9px] font-black tracking-[3px] uppercase text-white">Scene 01</span>
            <span className="text-[9px] text-zinc-500 mx-1">·</span>
            <span className="text-[9px] font-bold text-emerald-400">Customer Experience</span>
          </motion.div>

          <h2 className="text-[34px] font-black tracking-[-2px] leading-[1.05] text-zinc-950 mb-2">
            Scan. Browse.<br />
            <span className="text-emerald-600">Order. Done.</span>
          </h2>
          <p className="text-[11.5px] text-zinc-400 leading-relaxed">
            No app needed. Customers scan the table QR and get a live menu instantly.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex flex-col gap-1">
          {[
            { id: "scan",   icon: <QrCode size={11} />,       label: "Scan QR at table",    sub: "Any phone, no app"      },
            { id: "browse", icon: <Utensils size={11} />,     label: "Browse live menu",     sub: "Real-time availability" },
            { id: "cart",   icon: <ShoppingCart size={11} />, label: "Add items & customise",sub: "Special requests OK"    },
            { id: "pay",    icon: <IndianRupee size={11} />,  label: "Pay via UPI",          sub: "GPay, PhonePe, BHIM"   },
          ].map((s, i) => {
            const states: (typeof step)[] = ["scan", "browse", "cart", "pay", "done"]
            const currentIndex = states.indexOf(step)
            const thisIndex = states.indexOf(s.id as typeof step)
            const isDone = currentIndex > thisIndex
            const isActive = currentIndex === thisIndex

            return (
              <motion.div key={s.id}
                animate={{
                  opacity: currentIndex >= thisIndex ? 1 : 0.3,
                  x: currentIndex >= thisIndex ? 0 : -10,
                  backgroundColor: isDone ? "rgba(5,150,105,0.06)" : isActive ? "rgba(24,24,27,0.04)" : "transparent",
                  borderColor: isDone ? "rgba(5,150,105,0.25)" : isActive ? "rgba(24,24,27,0.15)" : "rgba(24,24,27,0.06)",
                }}
                transition={{ duration: 0.4, ease: E }}
                className="flex items-center gap-2.5 rounded-xl border px-3 py-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[8px] font-black"
                  style={{ background: isDone ? "#059669" : isActive ? "#18181b" : "rgba(24,24,27,0.12)" }}>
                  {isDone ? <Check size={11} strokeWidth={3} /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[10.5px] font-black text-zinc-900">{s.label}</p>
                  <p className="text-[8.5px] text-zinc-400">{s.sub}</p>
                </div>
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                {isDone && <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />}
              </motion.div>
            )
          })}
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: <Wifi size={10} />,        text: "No app needed",  color: "#059669" },
            { icon: <Globe size={10} />,        text: "Multi-language", color: "#7c3aed" },
            { icon: <Zap size={10} />,          text: "Instant updates",color: "#f59e0b" },
            { icon: <ShieldCheck size={10} />,  text: "100% secure",    color: "#0ea5e9" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ color: f.color }}>{f.icon}</span>
              <span className="text-[9px] font-bold text-zinc-600">{f.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.88 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 40, scale: phase >= 2 ? 1 : 0.88 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 }}
        className="relative flex-shrink-0">

        {/* Glow effect behind phone */}
        <div className="absolute -inset-8 rounded-full opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(5,150,105,0.3), transparent 70%)", filter: "blur(20px)" }} />

        {/* Phone shell */}
        <div className="relative w-[208px] h-[430px] rounded-[42px] p-[10px]"
          style={{
            background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
            boxShadow: "0 0 0 1.5px #2a2a2a, 0 0 0 2.5px #0a0a0a, 0 40px 100px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          }}>

          {/* Side buttons */}
          <div className="absolute -right-[3px] top-20 w-[3px] h-10 rounded-r-full bg-zinc-700" />
          <div className="absolute -left-[3px] top-16 w-[3px] h-8 rounded-l-full bg-zinc-700" />
          <div className="absolute -left-[3px] top-28 w-[3px] h-12 rounded-l-full bg-zinc-700" />

          <div className="w-full h-full rounded-[34px] overflow-hidden flex flex-col bg-zinc-950">

            {/* Dynamic Island */}
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0 bg-zinc-950">
              <div className="w-24 h-5 rounded-full bg-zinc-900" />
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden"
              style={{ background: step === "done" ? "#f0fdf4" : "#faf9f6" }}>

              {/* QR Scan Screen */}
              <AnimatePresence mode="wait">
                {step === "scan" && (
                  <motion.div key="scan"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
                    <div className="relative">
                      <motion.div
                        animate={{ opacity: qrScan ? [1, 0.3, 1] : 1, scale: qrScan ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: qrScan ? 3 : 0 }}
                        className="w-28 h-28 rounded-2xl flex items-center justify-center"
                        style={{ background: "white", border: "2px solid rgba(5,150,105,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                        <QrCode size={60} className="text-zinc-800" />
                      </motion.div>
                      {/* Scan line */}
                      <motion.div
                        animate={{ y: qrScan ? [0, 100] : 0, opacity: qrScan ? [1, 1, 0] : 0 }}
                        transition={{ duration: 0.8, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 rounded-full"
                        style={{ background: "linear-gradient(90deg, transparent, #059669, transparent)", top: 10 }} />
                      {/* Corner accents */}
                      {[["top-0 left-0 border-t-2 border-l-2", "top-left"], ["top-0 right-0 border-t-2 border-r-2", "top-right"], ["bottom-0 left-0 border-b-2 border-l-2", "bot-left"], ["bottom-0 right-0 border-b-2 border-r-2", "bot-right"]].map(([cls]) => (
                        <div key={cls} className={`absolute w-4 h-4 border-emerald-500 ${cls}`} />
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-zinc-700 text-center">Scanning Table QR...</p>
                    <p className="text-[8px] text-zinc-400 text-center">Spice Garden · Table 5</p>
                    <motion.div
                      animate={{ opacity: qrScan ? 1 : 0 }}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                      style={{ background: "rgba(5,150,105,0.1)" }}>
                      <CheckCircle2 size={10} className="text-emerald-600" />
                      <span className="text-[8.5px] font-black text-emerald-700">QR Verified!</span>
                    </motion.div>
                  </motion.div>
                )}

                {(step === "browse" || step === "cart") && (
                  <motion.div key="browse"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="flex-1 flex flex-col overflow-hidden">

                    {/* Restaurant header */}
                    <div className="px-3 pt-2 pb-2.5 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #18181b, #1c1917)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <Utensils size={10} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white leading-none">Spice Garden</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={7} className="text-amber-400 fill-amber-400" />
                              <span className="text-[6.5px] text-zinc-400">4.8 · North Indian</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                          style={{ background: "rgba(5,150,105,0.2)" }}>
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[6px] font-black text-emerald-400">Table 5 · Open</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 overflow-hidden">
                        {["🔥 Popular", "🍗 Mains", "🍞 Breads", "🥗 Veg"].map((c, ci) => (
                          <div key={c} className={`rounded-full px-2 py-0.5 text-[6.5px] font-black whitespace-nowrap flex-shrink-0 ${ci === 0 ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>{c}</div>
                        ))}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="flex-1 overflow-hidden px-2 pt-2 flex flex-col gap-1.5 pb-1">
                      {menuItems.map((item, i) => (
                        <motion.div key={item.name}
                          animate={{ opacity: items[i] ? 1 : 0, y: items[i] ? 0 : 10 }}
                          transition={{ duration: 0.3, ease: E }}
                          className="rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: "white", border: cartItems.includes(i) ? "1.5px solid rgba(5,150,105,0.35)" : "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            {/* Veg/non-veg indicator */}
                            <div className={`w-2 h-2 rounded-sm border flex-shrink-0 ${item.veg ? "border-emerald-600" : "border-red-500"}`}
                              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div className={`w-1 h-1 rounded-full ${item.veg ? "bg-emerald-600" : "bg-red-500"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-[8px] font-black text-zinc-900 truncate">{item.name}</p>
                                {item.popular && (
                                  <span className="text-[5.5px] font-black bg-orange-100 text-orange-600 rounded-full px-1 py-0.5 flex-shrink-0">HOT</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-[6.5px] text-zinc-400 truncate">{item.desc}</p>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  <Star size={5} className="text-amber-400 fill-amber-400" />
                                  <span className="text-[5.5px] text-zinc-500">{item.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <p className="text-[8px] font-black text-zinc-800">₹{item.price}</p>
                              <motion.div
                                whileTap={{ scale: 0.85 }}
                                animate={{
                                  background: cartItems.includes(i) ? "#059669" : "#18181b",
                                  scale: cartItems.includes(i) ? 1.1 : 1
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="w-5 h-5 rounded-lg flex items-center justify-center cursor-pointer">
                                {cartItems.includes(i)
                                  ? <Check size={9} className="text-white" strokeWidth={3} />
                                  : <Plus size={9} className="text-white" />}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Cart bar */}
                    <motion.div
                      animate={{ opacity: cartItems.length > 0 ? 1 : 0, y: cartItems.length > 0 ? 0 : 12 }}
                      transition={{ duration: 0.35, ease: E }}
                      className="mx-2 mb-2 rounded-xl px-3 py-2 flex items-center justify-between flex-shrink-0"
                      style={{ background: "#18181b" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-emerald-600 flex items-center justify-center">
                          <ShoppingCart size={8} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[7.5px] font-black text-white">{cartItems.length} items · ₹{cartItems.reduce((s, i) => s + menuItems[i].price, 0)}</p>
                          <p className="text-[6px] text-zinc-500">Table 5</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg px-2 py-1 bg-emerald-600">
                        <span className="text-[7px] font-black text-white">Checkout</span>
                        <ArrowRight size={7} className="text-white" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {step === "pay" && (
                  <motion.div key="pay"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex-1 flex flex-col p-3 gap-2">
                    <p className="text-[9px] font-black text-zinc-800 mb-1">Order Summary</p>
                    {cartItems.map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[8px] text-zinc-600">{menuItems[i].name}</span>
                        <span className="text-[8px] font-black text-zinc-800">₹{menuItems[i].price}</span>
                      </div>
                    ))}
                    <div className="border-t border-zinc-100 pt-2 flex items-center justify-between">
                      <span className="text-[8.5px] font-black text-zinc-800">Total</span>
                      <span className="text-[10px] font-black text-zinc-900">₹{cartItems.reduce((s, i) => s + menuItems[i].price, 0)}</span>
                    </div>

                    <p className="text-[7.5px] font-black text-zinc-500 mt-1">Pay with UPI</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "GPay", color: "#1a73e8" },
                        { name: "PhonePe", color: "#5f259f" },
                        { name: "Paytm", color: "#002970" },
                        { name: "BHIM", color: "#0047ab" },
                      ].map((app, ai) => (
                        <motion.div key={app.name}
                          animate={{
                            scale: payAnim && ai === 0 ? [1, 1.05, 1] : 1,
                            boxShadow: payAnim && ai === 0 ? "0 0 0 2px rgba(26,115,232,0.5)" : "none"
                          }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer"
                          style={{ background: ai === 0 && payAnim ? `${app.color}15` : "rgba(0,0,0,0.03)", border: `1px solid ${ai === 0 && payAnim ? app.color : "rgba(0,0,0,0.06)"}` }}>
                          <div className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[6px] font-black flex-shrink-0"
                            style={{ background: app.color }}>{app.name[0]}</div>
                          <span className="text-[7.5px] font-bold text-zinc-700">{app.name}</span>
                          {ai === 0 && payAnim && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.3 }} className="ml-auto"><Check size={8} className="text-blue-600" /></motion.div>}
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      animate={{ opacity: payAnim ? 1 : 0, scale: payAnim ? 1 : 0.9 }}
                      className="mt-auto rounded-xl px-3 py-2 flex items-center justify-between"
                      style={{ background: "#18181b" }}>
                      <div>
                        <p className="text-[8px] font-black text-white">Paying ₹{cartItems.reduce((s, i) => s + menuItems[i].price, 0)}</p>
                        <p className="text-[6.5px] text-zinc-500">via GPay</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.div
                          animate={{ rotate: payAnim ? 360 : 0 }}
                          transition={{ duration: 0.6 }}
                          className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {step === "done" && (
                  <motion.div key="done"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
                    <div className="relative">
                      <GlowRing color="rgba(5,150,105,0.4)" size={80} />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Check size={28} className="text-white" strokeWidth={3} />
                      </motion.div>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="text-center">
                      <p className="text-[12px] font-black text-zinc-900">Order Confirmed! 🎉</p>
                      <p className="text-[9px] font-bold text-emerald-600 mt-1">₹{cartItems.reduce((s, i) => s + menuItems[i].price, 0)} · Paid via GPay</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      className="flex flex-col gap-1.5 w-full">
                      {[
                        { icon: "🧑‍🍳", text: "Sent to kitchen" },
                        { icon: "⏱️", text: "Est. 12-15 mins" },
                        { icon: "📱", text: "Get notified when ready" },
                      ].map(item => (
                        <div key={item.text} className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                          style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)" }}>
                          <span className="text-[10px]">{item.icon}</span>
                          <span className="text-[8.5px] font-bold text-emerald-800">{item.text}</span>
                        </div>
                      ))}
                    </motion.div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + s * 0.08, type: "spring" }}>
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-[7px] text-zinc-400">Rate your experience</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE 3 — Live Restaurant Dashboard
════════════════════════════════════════════════════ */
function Scene3() {
  const [phase, setPhase] = useState(0)
  const [tab, setTab] = useState<"orders" | "kitchen" | "waiter" | "tables">("orders")
  const [orders, setOrders] = useState([false, false, false, false, false])
  const [kitchRows, setKitchRows] = useState([false, false, false, false])
  const [waitRows, setWaitRows] = useState([false, false])
  const [tableRows, setTableRows] = useState([false, false, false, false, false, false])
  const [notif, setNotif] = useState(false)
  const [upiToast, setUpiToast] = useState(false)
  const [revenue, setRevenue] = useState(false)
  const revenueCount = useAnimatedCounter(6840, 1800, revenue)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(200,  () => setPhase(1))
    T(600,  () => setPhase(2))
    T(1000, () => setOrders([true, false, false, false, false]))
    T(1350, () => setOrders([true, true, false, false, false]))
    T(1700, () => setOrders([true, true, true, false, false]))
    T(2050, () => setOrders([true, true, true, true, false]))
    T(2400, () => setOrders([true, true, true, true, true]))
    T(3000, () => setRevenue(true))
    T(3800, () => setNotif(true))
    T(5200, () => setNotif(false))
    T(5600, () => setUpiToast(true))
    T(6400, () => { setTab("kitchen"); setKitchRows([false, false, false, false]) })
    T(6700, () => setKitchRows([true, false, false, false]))
    T(7000, () => setKitchRows([true, true, false, false]))
    T(7300, () => setKitchRows([true, true, true, false]))
    T(7600, () => setKitchRows([true, true, true, true]))
    T(8600, () => { setTab("tables"); setTableRows([false, false, false, false, false, false]) })
    T(8900, () => setTableRows([true, false, false, false, false, false]))
    T(9100, () => setTableRows([true, true, false, false, false, false]))
    T(9300, () => setTableRows([true, true, true, false, false, false]))
    T(9500, () => setTableRows([true, true, true, true, false, false]))
    T(9700, () => setTableRows([true, true, true, true, true, false]))
    T(9900, () => setTableRows([true, true, true, true, true, true]))
    T(10800,() => { setTab("waiter"); setWaitRows([false, false]) })
    T(11100,() => setWaitRows([true, false]))
    T(11400,() => setWaitRows([true, true]))
    return () => ts.forEach(clearTimeout)
  }, [])

  const orderData = [
    { table: "T-03", items: "Butter Chicken · Naan × 2", amt: "₹380", status: "new",  time: "Just now" },
    { table: "T-07", items: "Masala Chai × 3 · Samosa",  amt: "₹230", status: "prep", time: "4 min"    },
    { table: "T-01", items: "Dal Makhani · Jeera Rice",  amt: "₹320", status: "prep", time: "8 min"    },
    { table: "T-11", items: "Chicken Tikka · Roomali",   amt: "₹490", status: "done", time: "12 min"   },
    { table: "T-05", items: "Paneer Masala · Lachha",    amt: "₹410", status: "new",  time: "2 min"    },
  ]

  const kitchData = [
    { id: "#K-41", item: "Butter Chicken + Naan × 2", table: "T-03", mins: 3, priority: true  },
    { id: "#K-42", item: "Dal Makhani + Jeera Rice",  table: "T-01", mins: 6, priority: false },
    { id: "#K-43", item: "Masala Chai × 3 + Samosa",  table: "T-07", mins: 2, priority: true  },
    { id: "#K-44", item: "Paneer Masala + Lachha",    table: "T-05", mins: 9, priority: false },
  ]

  const tableData = [
    { id: "T-01", seats: 4, status: "busy",      order: "₹320",  guest: "Sharma Family" },
    { id: "T-03", seats: 2, status: "busy",      order: "₹380",  guest: "Priya & Rahul" },
    { id: "T-05", seats: 6, status: "busy",      order: "₹410",  guest: "Office Lunch"  },
    { id: "T-07", seats: 4, status: "ordering",  order: "₹230",  guest: "3 guests"      },
    { id: "T-09", seats: 2, status: "free",      order: "—",     guest: "Available"     },
    { id: "T-11", seats: 8, status: "paid",      order: "₹490",  guest: "Gupta Group"   },
  ]

  const waitData = [
    { table: "T-06", msg: "Needs water refill",    ago: "30s", urgent: true  },
    { table: "T-09", msg: "Extra napkins please",  ago: "1m",  urgent: false },
  ]

  const tabs = [
    { id: "orders",  label: "Live Orders",   icon: <Receipt size={10} />,  count: 5 },
    { id: "kitchen", label: "Kitchen",       icon: <ChefHat size={10} />,  count: 4 },
    { id: "tables",  label: "Floor Map",     icon: <Grid size={10} />,     count: 6 },
    { id: "waiter",  label: "Waiter Calls",  icon: <Bell size={10} />,     count: 2 },
  ] as { id: typeof tab; label: string; icon: React.ReactNode; count: number }[]

  const statusConfig = {
    new:  { bg: "rgba(5,150,105,0.12)",   text: "#059669",  label: "New",      dot: "#059669" },
    prep: { bg: "rgba(245,158,11,0.12)",  text: "#d97706",  label: "Cooking",  dot: "#f59e0b" },
    done: { bg: "rgba(113,113,122,0.12)", text: "#71717a",  label: "Paid",     dot: "#71717a" },
  }

  const tableStatusConfig = {
    busy:     { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",    text: "#ef4444", label: "Busy"     },
    free:     { bg: "rgba(5,150,105,0.1)",   border: "rgba(5,150,105,0.2)",    text: "#059669", label: "Free"     },
    ordering: { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",   text: "#d97706", label: "Ordering" },
    paid:     { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)",   text: "#6366f1", label: "Paid"     },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40, filter: "blur(4px)" }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0a0a0e 0%, #111116 50%, #0d0d12 100%)" }}>

      {/* BG effects */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(5,150,105,0.08) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 60% at 85% 80%, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -16 }}
        transition={{ duration: 0.6, ease: ES }}
        className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ border: "1px solid rgba(5,150,105,0.3)", background: "rgba(5,150,105,0.08)" }}>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-black tracking-[4px] uppercase text-emerald-400">Live Dashboard</span>
        </div>
        <span className="text-zinc-700 text-[9px]">·</span>
        <span className="text-[9px] text-zinc-600 font-bold">Spice Garden · Bengaluru</span>
      </motion.div>

      {/* Main dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30, scale: phase >= 2 ? 1 : 0.92 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
        className="w-[700px] rounded-2xl overflow-hidden"
        style={{
          background: "#15151a",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)"
        }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ background: "#111116", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #059669, #34d399)" }}>
                <Utensils size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[12px] font-black text-white leading-none">Spice Garden</p>
                <p className="text-[8px] text-zinc-600 mt-0.5">Restaurant Management System · v2.4</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Revenue counter */}
            <motion.div
              animate={{ opacity: revenue ? 1 : 0, scale: revenue ? 1 : 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
              style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.2)" }}>
              <TrendingUp size={9} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400">₹{revenueCount.toLocaleString("en-IN")} today</span>
            </motion.div>

            {/* Stat badges */}
            {[
              { val: "12", label: "Tables", icon: <Table2 size={7} /> },
              { val: "4",  label: "Active", icon: <Activity size={7} /> },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-zinc-500">{b.icon}</span>
                <span className="text-[8px] font-black text-white">{b.val}</span>
                <span className="text-[7px] text-zinc-600">{b.label}</span>
              </div>
            ))}

            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(5,150,105,0.15)", border: "1px solid rgba(5,150,105,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-400">Live</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 px-5 pt-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {tabs.map(t => (
            <motion.button key={t.id} onClick={() => setTab(t.id)}
              animate={{
                color: tab === t.id ? "#fff" : "rgba(255,255,255,0.3)",
                borderBottomColor: tab === t.id ? "#059669" : "transparent",
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-4 pb-2.5 text-[10px] font-black border-b-2 relative"
              style={{ borderRadius: "4px 4px 0 0" }}>
              {t.icon}
              {t.label}
              {(t.id === "waiter") && (
                <span className="ml-0.5 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-[6.5px] font-black text-white">{t.count}</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <div className="relative h-[200px] overflow-hidden">
          <AnimatePresence mode="wait">

            {/* Orders */}
            {tab === "orders" && (
              <motion.div key="orders"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 p-3 flex flex-col gap-1.5 overflow-hidden">
                {orderData.map((o, i) => {
                  const cfg = statusConfig[o.status as keyof typeof statusConfig]
                  return (
                    <motion.div key={o.table}
                      animate={{ opacity: orders[i] ? 1 : 0, x: orders[i] ? 0 : 20 }}
                      transition={{ duration: 0.3, ease: E }}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <motion.div
                        animate={{ opacity: o.status === "new" ? [1, 0.3, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: o.status === "new" ? Infinity : 0 }}
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: cfg.dot }} />
                      <span className="text-[10px] font-black text-white w-12 flex-shrink-0 font-mono">{o.table}</span>
                      <span className="text-[9.5px] text-zinc-500 flex-1 truncate">{o.items}</span>
                      <span className="text-[9px] text-zinc-600 flex-shrink-0">{o.time}</span>
                      <span className="text-[10px] font-black text-white flex-shrink-0">{o.amt}</span>
                      <span className="text-[8px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* Kitchen */}
            {tab === "kitchen" && (
              <motion.div key="kitchen"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 p-3 grid grid-cols-2 gap-2 content-start">
                {kitchData.map((k, i) => (
                  <motion.div key={k.id}
                    animate={{ opacity: kitchRows[i] ? 1 : 0, scale: kitchRows[i] ? 1 : 0.92 }}
                    transition={{ duration: 0.3, ease: E }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                    style={{ background: k.priority ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${k.priority ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)"}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: k.priority ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)" }}>
                      {k.priority
                        ? <Zap size={12} className="text-amber-400" />
                        : <ChefHat size={12} className="text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-white truncate">{k.item}</p>
                      <p className="text-[7.5px] text-zinc-600">{k.id} · {k.table}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                      style={{ background: k.priority ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)" }}>
                      <Timer size={7} className={k.priority ? "text-amber-400" : "text-zinc-600"} />
                      <span className={`text-[8px] font-black ${k.priority ? "text-amber-400" : "text-zinc-600"}`}>{k.mins}m</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Tables / Floor Map */}
            {tab === "tables" && (
              <motion.div key="tables"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 p-3 grid grid-cols-3 gap-2 content-start">
                {tableData.map((t, i) => {
                  const cfg = tableStatusConfig[t.status as keyof typeof tableStatusConfig]
                  return (
                    <motion.div key={t.id}
                      animate={{ opacity: tableRows[i] ? 1 : 0, y: tableRows[i] ? 0 : 10 }}
                      transition={{ duration: 0.3, ease: E }}
                      className="rounded-xl px-3 py-2.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-white">{t.id}</p>
                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: `${cfg.text}22`, color: cfg.text }}>{cfg.label}</span>
                      </div>
                      <p className="text-[7.5px] text-zinc-500 truncate">{t.guest}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Users size={7} className="text-zinc-600" />
                          <span className="text-[7px] text-zinc-600">{t.seats}</span>
                        </div>
                        <span className="text-[8px] font-black" style={{ color: cfg.text }}>{t.order}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* Waiter Calls */}
            {tab === "waiter" && (
              <motion.div key="waiter"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 p-3 flex flex-col gap-2">
                {waitData.map((w, i) => (
                  <motion.div key={w.table}
                    animate={{ opacity: waitRows[i] ? 1 : 0, x: waitRows[i] ? 0 : 20 }}
                    transition={{ duration: 0.3, ease: E }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                    style={{ background: w.urgent ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${w.urgent ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)"}` }}>
                    <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.12)" }}>
                      <Bell size={14} className="text-red-400" />
                      {w.urgent && (
                        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-white">{w.table} — {w.msg}</p>
                      <p className="text-[8px] text-zinc-500 mt-0.5">Called {w.ago} ago · Floor waiter notified</p>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5"
                        style={{ background: "rgba(5,150,105,0.15)", border: "1px solid rgba(5,150,105,0.2)" }}>
                        <Check size={8} className="text-emerald-400" />
                        <span className="text-[7.5px] font-bold text-emerald-400">Done</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <Smartphone size={11} className="text-zinc-600" />
                  <p className="text-[9px] text-zinc-500">
                    Customers press a button — no shouting, no waving. Waiter gets notified instantly.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating notification */}
      <motion.div
        animate={{ opacity: notif ? 1 : 0, y: notif ? 0 : -24, scale: notif ? 1 : 0.88 }}
        transition={{ duration: 0.4, ease: E }}
        className="absolute top-4 right-4 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)", minWidth: 240 }}>
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Bell size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="text-[11.5px] font-black text-zinc-900">Waiter Call · Table 6</p>
          <p className="text-[9px] text-orange-500 font-bold mt-0.5">Customer needs assistance</p>
          <p className="text-[8px] text-zinc-400 mt-0.5">Tap to acknowledge</p>
        </div>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
      </motion.div>

      {/* UPI toast */}
      <motion.div
        animate={{ opacity: upiToast ? 1 : 0, x: upiToast ? 0 : 30 }}
        transition={{ duration: 0.45, ease: E }}
        className="absolute bottom-5 right-4 flex items-center gap-3 rounded-2xl px-5 py-3.5"
        style={{ background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 12px 36px rgba(5,150,105,0.4)" }}>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <IndianRupee size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[12px] font-black text-white">₹490 received</p>
          <p className="text-[8.5px] mt-0.5 text-white/60">GPay · Table 11 · Instant settlement</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center ml-1">
          <CheckCircle2 size={14} className="text-white" />
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE 4 — UPI Payments Deep Dive
════════════════════════════════════════════════════ */
function Scene4() {
  const [phase, setPhase] = useState(0)
  const [txns, setTxns] = useState([false, false, false, false, false])
  const [total, setTotal] = useState(false)
  const [zeroFee, setZeroFee] = useState(false)
  const [stream, setStream] = useState(false)
  const totalCount = useAnimatedCounter(2340, 1600, total)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(200,  () => setPhase(1))
    T(600,  () => setPhase(2))
    T(1200, () => setTxns([true, false, false, false, false]))
    T(1700, () => setTxns([true, true, false, false, false]))
    T(2200, () => setTxns([true, true, true, false, false]))
    T(2700, () => setTxns([true, true, true, true, false]))
    T(3200, () => setTxns([true, true, true, true, true]))
    T(4000, () => setTotal(true))
    T(4800, () => setStream(true))
    T(5600, () => setZeroFee(true))
    return () => ts.forEach(clearTimeout)
  }, [])

  const transactions = [
    { app: "GPay",    icon: "G", amount: 380, table: "T-03", time: "2m ago",  color: "#1a73e8" },
    { app: "PhonePe", icon: "P", amount: 230, table: "T-07", time: "5m ago",  color: "#5f259f" },
    { app: "Paytm",   icon: "P", amount: 320, table: "T-01", time: "8m ago",  color: "#002970" },
    { app: "BHIM",    icon: "B", amount: 490, table: "T-11", time: "12m ago", color: "#0047ab" },
    { app: "GPay",    icon: "G", amount: 920, table: "T-02", time: "18m ago", color: "#1a73e8" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40, filter: "blur(4px)" }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex items-center justify-center gap-14 px-14"
      style={{ background: "linear-gradient(145deg, #faf9f6 0%, #f5f8f5 50%, #f0f5ff 100%)" }}>

      <div className="absolute inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: "radial-gradient(rgba(5,150,105,0.05) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, rgba(5,150,105,0.08), transparent 70%)" }} />

      {/* Left copy */}
      <motion.div
        initial={{ opacity: 0, x: -35 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -35 }}
        transition={{ duration: 0.7, ease: ES }}
        className="flex flex-col gap-3 w-[255px] flex-shrink-0">

        <div>
          <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 w-fit mb-3"
            style={{ border: "1.5px solid rgba(5,150,105,0.2)", background: "rgba(5,150,105,0.06)" }}>
            <IndianRupee size={9} className="text-emerald-600" />
            <span className="text-[9px] font-black tracking-[5px] uppercase text-emerald-700">UPI Payments</span>
          </div>
          <h2 className="text-[32px] font-black tracking-[-2px] leading-tight text-zinc-950 mb-2">
            Money in your<br />
            <span className="text-emerald-600">bank. Instantly.</span>
          </h2>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            GPay, PhonePe, Paytm, BHIM — every rupee settles in your account within seconds.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-1.5">
          {[
            { icon: <Zap size={11} />,         color: "#059669", text: "Instant settlement — not T+2" },
            { icon: <ShieldCheck size={11} />,  color: "#059669", text: "Bank-grade encryption" },
            { icon: <Smartphone size={11} />,   color: "#059669", text: "All UPI apps — one QR" },
            { icon: <Receipt size={11} />,      color: "#059669", text: "Auto-reconciliation & receipts" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{ background: "white", border: "1px solid rgba(5,150,105,0.1)" }}>
              <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(5,150,105,0.08)" }}>
                <span style={{ color: f.color }}>{f.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-700">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Zero commission card */}
        <motion.div
          animate={{ opacity: zeroFee ? 1 : 0, y: zeroFee ? 0 : 16, scale: zeroFee ? 1 : 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative rounded-2xl overflow-hidden px-5 py-4"
          style={{ background: "linear-gradient(135deg, #18181b, #111113)" }}>
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(5,150,105,0.15), transparent 60%)" }} />
          <p className="text-[7.5px] font-black tracking-[4px] uppercase text-zinc-500 mb-1.5 relative">Platform commission</p>
          <div className="flex items-end gap-2 relative">
            <p className="text-[44px] font-black text-emerald-400 leading-none tracking-tight">₹0</p>
            <div className="mb-1">
              <p className="text-[9px] text-zinc-500 line-through">₹2 per ₹100</p>
              <p className="text-[8px] text-emerald-400 font-bold">Saved</p>
            </div>
          </div>
          <p className="text-[8.5px] text-zinc-600 relative mt-1">Not 2%. Not 1%. Zero. Forever.</p>
        </motion.div>
      </motion.div>

      {/* Right: payment panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.91 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30, scale: phase >= 2 ? 1 : 0.91 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.15 }}
        className="flex flex-col gap-3 w-[295px] flex-shrink-0">

        {/* Payment stream card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#15151a", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: "#111116", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <Activity size={11} className="text-emerald-400" />
              <p className="text-[10.5px] font-black text-white">Payment Stream</p>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[8px] font-black text-emerald-400">Live</span>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-1.5">
            {transactions.map((t, i) => (
              <motion.div key={`${t.app}-${t.table}`}
                animate={{ opacity: txns[i] ? 1 : 0, x: txns[i] ? 0 : 20 }}
                transition={{ duration: 0.35, ease: E }}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                  style={{ background: t.color }}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] font-black text-white">{t.app}</p>
                  <p className="text-[7.5px] text-zinc-600">{t.table} · {t.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10.5px] font-black text-emerald-400">₹{t.amount}</p>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: txns[i] ? 1 : 0 }} transition={{ delay: 0.2, type: "spring" }}
                    className="flex justify-end mt-0.5">
                    <CheckCircle2 size={9} className="text-emerald-600" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <motion.div
            animate={{ opacity: total ? 1 : 0, y: total ? 0 : 8 }}
            transition={{ duration: 0.45, ease: E }}
            className="mx-3 mb-3 rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-emerald-400" />
              <div>
                <p className="text-[9px] font-black text-emerald-400">Today's Total</p>
                <p className="text-[7.5px] text-zinc-600">5 transactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-black text-emerald-400">₹{totalCount.toLocaleString("en-IN")}</p>
              <p className="text-[7px] text-zinc-600">settled instantly</p>
            </div>
          </motion.div>
        </div>

        {/* UPI apps grid */}
        <motion.div
          animate={{ opacity: stream ? 1 : 0, y: stream ? 0 : 10 }}
          transition={{ duration: 0.5, ease: E }}
          className="rounded-2xl p-4"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <p className="text-[8.5px] font-black text-zinc-500 tracking-[3px] uppercase mb-3">Accepted Everywhere</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "GPay",    color: "#1a73e8", bg: "#e8f0fe" },
              { name: "PhonePe", color: "#5f259f", bg: "#f3e8ff" },
              { name: "Paytm",   color: "#002970", bg: "#e8eeff" },
              { name: "BHIM",    color: "#0047ab", bg: "#e8f0ff" },
            ].map(app => (
              <div key={app.name} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[11px] text-white"
                  style={{ background: app.color }}>
                  {app.name[0]}
                </div>
                <p className="text-[7px] font-bold text-zinc-500">{app.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE 5 — Analytics & Insights
════════════════════════════════════════════════════ */
function Scene5() {
  const [phase, setPhase] = useState(0)
  const [bars, setBars] = useState([0, 0, 0, 0, 0, 0, 0])
  const [topItems, setTopItems] = useState([false, false, false, false])
  const [insights, setInsights] = useState([false, false, false, false])
  const [heatmap, setHeatmap] = useState(false)
  const revenueCount = useAnimatedCounter(48200, 2000, phase >= 2)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(200,  () => setPhase(1))
    T(600,  () => setPhase(2))
    T(1200, () => setBars([0.45, 0, 0, 0, 0, 0, 0]))
    T(1350, () => setBars([0.45, 0.62, 0, 0, 0, 0, 0]))
    T(1500, () => setBars([0.45, 0.62, 0.55, 0, 0, 0, 0]))
    T(1650, () => setBars([0.45, 0.62, 0.55, 0.78, 0, 0, 0]))
    T(1800, () => setBars([0.45, 0.62, 0.55, 0.78, 0.68, 0, 0]))
    T(1950, () => setBars([0.45, 0.62, 0.55, 0.78, 0.68, 0.92, 0]))
    T(2100, () => setBars([0.45, 0.62, 0.55, 0.78, 0.68, 0.92, 0.74]))
    T(3000, () => setTopItems([true, false, false, false]))
    T(3350, () => setTopItems([true, true, false, false]))
    T(3700, () => setTopItems([true, true, true, false]))
    T(4050, () => setTopItems([true, true, true, true]))
    T(5000, () => setHeatmap(true))
    T(5200, () => setInsights([true, false, false, false]))
    T(5500, () => setInsights([true, true, false, false]))
    T(5800, () => setInsights([true, true, true, false]))
    T(6100, () => setInsights([true, true, true, true]))
    return () => ts.forEach(clearTimeout)
  }, [])

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const revenues = [6200, 8600, 7400, 10800, 9200, 14400, 10800]

  const topItemData = [
    { name: "Butter Chicken",     pct: 94, orders: 52, trend: "+8%", veg: false },
    { name: "Masala Chai",        pct: 81, orders: 44, trend: "+3%", veg: true  },
    { name: "Garlic Naan",        pct: 70, orders: 38, trend: "+5%", veg: true  },
    { name: "Dal Makhani",        pct: 58, orders: 31, trend: "-2%", veg: true  },
  ]

  const insightData = [
    { icon: <Clock size={11} className="text-amber-400" />,      color: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.15)",  text: "Peak hours: 1–2 PM & 8–10 PM", sub: "Schedule extra staff for these windows" },
    { icon: <TrendingUp size={11} className="text-emerald-400" />, color: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.15)",   text: "Revenue up 34% vs last week",  sub: "Highest single-week growth ever"       },
    { icon: <Star size={11} className="text-violet-400" />,       color: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.15)", text: "4.8★ avg customer rating",     sub: "From 184 QR feedback scans"            },
    { icon: <Target size={11} className="text-cyan-400" />,       color: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.15)",  text: "Sat is your best day",         sub: "3× weekday avg — push weekend promos" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex items-center justify-center gap-10 px-12"
      style={{ background: "linear-gradient(135deg, #0a0a0e, #0f0f14, #090912)" }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 55% at 75% 30%, rgba(124,58,237,0.09) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Left: bar chart + insights */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -30 }}
        transition={{ duration: 0.7, ease: ES }}
        className="flex flex-col gap-3 w-[285px] flex-shrink-0">

        <div>
          <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 w-fit mb-3"
            style={{ border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.08)" }}>
            <BarChart3 size={9} className="text-violet-400" />
            <span className="text-[9px] font-black tracking-[5px] uppercase text-violet-400">Analytics</span>
          </div>
          <h2 className="text-[32px] font-black tracking-[-2px] leading-tight text-white mb-2">
            Know your<br />
            <span className="text-violet-400">restaurant deeply.</span>
          </h2>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Revenue charts, top dishes, peak hours, ratings — all in one place.
          </p>
        </div>

        {/* Bar chart */}
        <div className="rounded-2xl px-4 pt-3 pb-2"
          style={{ background: "#15151a", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[9.5px] font-black text-white">Weekly Revenue</p>
              <p className="text-[7.5px] text-zinc-600">7-day breakdown</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-black text-emerald-400">₹{revenueCount.toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp size={7} className="text-emerald-400" />
                <p className="text-[7.5px] text-emerald-400">+34% vs last week</p>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-[58px] mt-2">
            {bars.map((h, i) => (
              <div key={days[i]} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  animate={{ height: `${h * 44}px` }}
                  transition={{ duration: 0.7, ease: ES }}
                  className="w-full rounded-t-sm relative"
                  style={{ background: h === Math.max(...bars) ? "linear-gradient(to top, #059669, #4ade80)" : "rgba(255,255,255,0.06)", minHeight: 2 }}>
                  {h > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[5.5px] font-black"
                      style={{ color: h === Math.max(...bars) ? "#4ade80" : "rgba(255,255,255,0.22)" }}>
                      ₹{(revenues[i] / 1000).toFixed(1)}k
                    </motion.div>
                  )}
                </motion.div>
                <span className="text-[6.5px] text-zinc-600 font-bold">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights — 3 rows only */}
        <div className="flex flex-col gap-1.5">
          {insightData.slice(0, 3).map((ins, i) => (
            <motion.div key={ins.text}
              animate={{ opacity: insights[i] ? 1 : 0, x: insights[i] ? 0 : -16 }}
              transition={{ duration: 0.4, ease: E }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{ background: ins.color, border: `1px solid ${ins.border}` }}>
              <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}>{ins.icon}</div>
              <div>
                <p className="text-[9px] font-black text-white">{ins.text}</p>
                <p className="text-[7px] text-zinc-500">{ins.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right: top items */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : 30 }}
        transition={{ duration: 0.7, ease: ES, delay: 0.1 }}
        className="w-[265px] flex-shrink-0 flex flex-col gap-3">

        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-black tracking-[4px] uppercase text-zinc-500">Top Dishes This Week</p>
          <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.15)" }}>
            <TrendingUp size={7} className="text-emerald-400" />
            <span className="text-[7px] text-emerald-400 font-black">Live</span>
          </div>
        </div>

        {topItemData.map((item, i) => (
          <motion.div key={item.name}
            animate={{ opacity: topItems[i] ? 1 : 0, y: topItems[i] ? 0 : 18 }}
            transition={{ duration: 0.5, ease: E }}
            className="rounded-2xl p-4"
            style={{ background: "#15151a", border: i === 0 ? "1px solid rgba(5,150,105,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-sm border ${item.veg ? "border-emerald-500" : "border-red-500"}`}>
                  <div className={`w-1 h-1 rounded-full m-auto mt-0.5 ${item.veg ? "bg-emerald-500" : "bg-red-500"}`} />
                </div>
                <p className="text-[11px] font-black text-white">{item.name}</p>
                {i === 0 && (
                  <span className="text-[7px] font-black bg-amber-500/20 text-amber-400 rounded-full px-1.5 py-0.5">🔥 #1</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-black text-zinc-500">{item.orders} orders</span>
                <span className={`text-[8px] font-bold ${item.trend.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{item.trend}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  animate={{ width: topItems[i] ? `${item.pct}%` : "0%" }}
                  transition={{ duration: 1, ease: ES, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: i === 0 ? "linear-gradient(90deg, #059669, #4ade80)" : i === 1 ? "linear-gradient(90deg, #7c3aed, #a78bfa)" : "rgba(255,255,255,0.2)" }} />
              </div>
              <span className="text-[9px] font-black text-zinc-500 w-8 text-right">{item.pct}%</span>
            </div>
          </motion.div>
        ))}

        {/* Heatmap teaser */}
        <motion.div
          animate={{ opacity: heatmap ? 1 : 0, y: heatmap ? 0 : 10 }}
          transition={{ duration: 0.5, ease: E }}
          className="rounded-2xl p-4"
          style={{ background: "#15151a", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[9px] font-black text-zinc-500 tracking-[3px] uppercase mb-2">Hourly Footfall</p>
          <div className="grid grid-cols-12 gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const intensities = [0.1, 0.1, 0.15, 0.2, 0.4, 0.7, 0.85, 0.65, 0.45, 0.9, 0.95, 0.75]
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: heatmap ? 1 : 0, scaleY: heatmap ? 1 : 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="h-8 rounded-sm"
                  style={{ background: `rgba(5,150,105,${intensities[i]})`, transformOrigin: "bottom" }} />
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[6.5px] text-zinc-600">10 AM</span>
            <span className="text-[6.5px] text-zinc-400 font-bold">Peak: 8–10 PM</span>
            <span className="text-[6.5px] text-zinc-600">10 PM</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE 6 — Impact / Results (Before → After)
════════════════════════════════════════════════════ */
function Scene6() {
  const [phase, setPhase] = useState(0)
  const [bef, setBef] = useState(false)
  const [arr, setArr] = useState(false)
  const [aft, setAft] = useState(false)
  const [stats, setStats] = useState([false, false, false, false])
  const [testimonial, setTestimonial] = useState(false)
  const extraRevenue = useAnimatedCounter(14800, 2200, stats[0])

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(200,  () => setPhase(1))
    T(700,  () => setBef(true))
    T(1300, () => setArr(true))
    T(1900, () => setAft(true))
    T(3000, () => setStats([true, false, false, false]))
    T(3400, () => setStats([true, true, false, false]))
    T(3800, () => setStats([true, true, true, false]))
    T(4200, () => setStats([true, true, true, true]))
    T(5400, () => setTestimonial(true))
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-0 overflow-hidden"
      style={{ background: "linear-gradient(145deg, #fafaf8, #f5f7f5, #f8f5ff)" }}>

      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: "radial-gradient(rgba(5,150,105,0.05) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(5,150,105,0.08), transparent 60%)" }} />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -16 }}
        transition={{ duration: 0.6, ease: E }}
        className="flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
        style={{ border: "1.5px solid rgba(5,150,105,0.2)", background: "rgba(5,150,105,0.05)" }}>
        <Award size={9} className="text-emerald-600" />
        <span className="text-[9px] font-black tracking-[5px] uppercase text-emerald-700">Proven Results</span>
        <span className="w-px h-3 bg-emerald-200 mx-1" />
        <span className="text-[9px] text-emerald-600 font-bold">200+ restaurants</span>
      </motion.div>

      {/* Before / After comparison */}
      <div className="flex items-center gap-4 mb-6">
        {/* Before */}
        <motion.div
          animate={{ opacity: bef ? 1 : 0, y: bef ? 0 : 20 }}
          transition={{ duration: 0.6, ease: E }}
          className="relative rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 8px 28px rgba(239,68,68,0.1)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, #fff5f5, #fff0f0)", border: "1.5px solid #fecaca" }} />
          <div className="relative px-8 py-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <p className="text-[7.5px] font-black tracking-[3px] uppercase text-red-500">Before</p>
              </div>
            </div>
            {[
              { label: "Order wait",    val: "18 min" },
              { label: "Payments",      val: "Cash only" },
              { label: "Menu updates",  val: "Days" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-6 mb-1.5">
                <span className="text-[9.5px] text-zinc-500">{item.label}</span>
                <span className="text-[9.5px] font-black text-red-500">{item.val}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-red-100">
              <p className="text-[28px] font-black text-red-500 leading-none">₹82k</p>
              <p className="text-[8px] text-zinc-400 mt-0.5">avg monthly revenue</p>
            </div>
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          animate={{ opacity: arr ? 1 : 0, scale: arr ? 1 : 0.4 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="flex flex-col items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div className="w-px h-8 rounded-full"
              style={{ background: "linear-gradient(to bottom, #ef4444, transparent)" }} />
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full w-9 h-9 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #18181b, #27272a)", boxShadow: "0 6px 18px rgba(0,0,0,0.2)" }}>
              <ArrowRight size={14} className="text-emerald-400" />
            </motion.div>
            <div className="w-px h-8 rounded-full"
              style={{ background: "linear-gradient(to top, #059669, transparent)" }} />
          </div>
          <div className="text-center">
            <p className="text-[7px] font-black text-zinc-400 tracking-widest uppercase">Switch</p>
            <p className="text-[9px] font-black text-emerald-600">Today</p>
          </div>
        </motion.div>

        {/* After */}
        <motion.div
          animate={{ opacity: aft ? 1 : 0, y: aft ? 0 : 20 }}
          transition={{ duration: 0.6, ease: E }}
          className="relative rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 8px 28px rgba(5,150,105,0.12)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1.5px solid #bbf7d0" }} />
          <div className="relative px-8 py-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(5,150,105,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[7.5px] font-black tracking-[3px] uppercase text-emerald-600">With ApneOrder</p>
              </div>
            </div>
            {[
              { label: "Order wait",    val: "3 min"   },
              { label: "Payments",      val: "Instant" },
              { label: "Menu updates",  val: "Live"    },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-6 mb-1.5">
                <span className="text-[9.5px] text-zinc-500">{item.label}</span>
                <span className="text-[9.5px] font-black text-emerald-600">{item.val}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-emerald-100">
              <p className="text-[28px] font-black text-emerald-600 leading-none">₹96k</p>
              <p className="text-[8px] text-zinc-400 mt-0.5">avg monthly revenue</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stat row */}
      <div className="flex items-center gap-8 mb-5">
        {[
          { show: stats[0], icon: <IndianRupee size={13} className="text-emerald-400" />, num: `₹${extraRevenue.toLocaleString("en-IN")}+`, sub: "Extra / month",      dark: true  },
          { show: stats[1], icon: <Zap size={13} className="text-amber-400" />,           num: "83%",                                        sub: "Faster orders",      dark: false },
          { show: stats[2], icon: <Users size={13} className="text-blue-400" />,          num: "200+",                                       sub: "Restaurants live",   dark: false },
          { show: stats[3], icon: <Star size={13} className="text-violet-400" />,         num: "4.9★",                                       sub: "Customer rating",    dark: false },
        ].map((s, i) => (
          <motion.div key={s.sub}
            animate={{ opacity: s.show ? 1 : 0, y: s.show ? 0 : 16 }}
            transition={{ duration: 0.5, ease: E }}
            className="text-center flex flex-col items-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "#18181b" }}>
              {s.icon}
            </div>
            <p className={`text-[26px] font-black leading-none tracking-tight ${s.dark ? "text-emerald-600" : "text-zinc-950"}`}>{s.num}</p>
            <p className="text-[8px] font-bold tracking-[2px] uppercase text-zinc-400 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Testimonial — compact single row */}
      <motion.div
        animate={{ opacity: testimonial ? 1 : 0, y: testimonial ? 0 : 12 }}
        transition={{ duration: 0.5, ease: E }}
        className="flex items-center gap-3 rounded-xl px-5 py-3 max-w-[580px]"
        style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 font-black text-white text-[12px]">R</div>
        <p className="text-[10px] font-bold text-zinc-600 leading-snug italic flex-1">
          "Payment is instant, and I can see my bestsellers every morning. It changed how I run my restaurant."
        </p>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => <Star key={s} size={7} className="text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-[7.5px] text-zinc-400">Rajesh · Bengaluru</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE 7 — CTA (Cinematic Close)
════════════════════════════════════════════════════ */
function Scene7() {
  const [phase, setPhase] = useState(0)
  const [stats, setStats] = useState([false, false, false, false])
  const [sweep, setSweep] = useState(false)
  const [orbit, setOrbit] = useState(false)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    T(200,  () => setPhase(1))
    T(600,  () => setPhase(2))
    T(800,  () => setOrbit(true))
    T(1400, () => setStats([true, false, false, false]))
    T(1650, () => setStats([true, true, false, false]))
    T(1900, () => setStats([true, true, true, false]))
    T(2150, () => setStats([true, true, true, true]))
    T(3500, () => setSweep(true))
    return () => ts.forEach(clearTimeout)
  }, [])

  const features = [
    { icon: <QrCode size={10} />,        label: "QR Ordering",     color: "#059669" },
    { icon: <IndianRupee size={10} />,   label: "UPI Payments",    color: "#7c3aed" },
    { icon: <BarChart3 size={10} />,     label: "Live Analytics",  color: "#f59e0b" },
    { icon: <Bell size={10} />,          label: "Waiter Calls",    color: "#ef4444" },
    { icon: <ChefHat size={10} />,       label: "Kitchen Queue",   color: "#0ea5e9" },
    { icon: <PieChart size={10} />,      label: "Item Insights",   color: "#ec4899" },
    { icon: <Users size={10} />,         label: "Table Management",color: "#10b981" },
    { icon: <Star size={10} />,          label: "Customer Ratings",color: "#a78bfa" },
  ]

  const statsData = [
    { show: stats[0], num: "₹0",   sub: "Setup Cost",    highlight: true  },
    { show: stats[1], num: "10m",  sub: "To Go Live",    highlight: false },
    { show: stats[2], num: "∞",    sub: "Menu Items",    highlight: false },
    { show: stats[3], num: "0%",   sub: "Commission",    highlight: true  },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(145deg, #08080c 0%, #0c0c12 50%, #080c0a 100%)" }}>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      {/* Central glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 65% at 50% 52%, rgba(74,222,128,0.1) 0%, rgba(74,222,128,0.03) 40%, transparent 70%)" }} />

      {/* Particles */}
      <Particles count={40} color="rgba(74,222,128,0.25)" />

      {/* Orbit rings */}
      <motion.div
        animate={{ opacity: orbit ? 0.12 : 0, rotate: 360 }}
        transition={{ opacity: { duration: 1 }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
        className="absolute rounded-full border border-emerald-400 pointer-events-none"
        style={{ width: 700, height: 700 }} />
      <motion.div
        animate={{ opacity: orbit ? 0.07 : 0, rotate: -360 }}
        transition={{ opacity: { duration: 1 }, rotate: { duration: 30, repeat: Infinity, ease: "linear" } }}
        className="absolute rounded-full border border-emerald-400 pointer-events-none"
        style={{ width: 850, height: 850 }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 30 }}
        transition={{ duration: 0.9, ease: ES }}
        className="text-center relative z-10 flex flex-col items-center">

        {/* Eyebrow */}
        <motion.div
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : -10 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-4"
          style={{ border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.06)", backdropFilter: "blur(8px)" }}>
          <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-black tracking-[5px] uppercase text-emerald-400">Free to Start · Live in 10 Minutes</span>
          <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.div>

        {/* Wordmark */}
        <div className="relative mb-4">
          <motion.h1
            animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.85 }}
            transition={{ duration: 0.8, ease: E }}
            className="font-black text-white leading-none"
            style={{ fontSize: 76, letterSpacing: -6 }}>
            Apne<motion.span
              animate={{ color: phase >= 2 ? "#4ade80" : "#fff" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ display: "inline" }}>Order</motion.span>
          </motion.h1>
          {/* Tagline */}
          <motion.p
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-[11px] tracking-[4px] uppercase mt-1"
            style={{ color: "rgba(255,255,255,0.2)" }}>
            The Complete Restaurant Operating System
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-w-[560px]">
          {features.map((f, i) => (
            <motion.div key={f.label}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12, scale: phase >= 2 ? 1 : 0.8 }}
              transition={{ duration: 0.4, ease: E, delay: 0.05 * i + 0.5 }}
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: f.color }}>{f.icon}</span>
              <span className="text-[9.5px] font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{f.label}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <motion.div
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center gap-3 mb-5">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-2 rounded-full px-7 py-3 font-black text-[13px] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", color: "#0a0a0e", boxShadow: "0 12px 36px rgba(74,222,128,0.32)" }}>
            <Zap size={13} />
            Start Free — No Credit Card
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-2 rounded-full px-6 py-3 font-bold text-[11px] cursor-pointer"
            style={{ border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", backdropFilter: "blur(4px)" }}>
            <Play size={11} fill="rgba(255,255,255,0.4)" />
            Watch Demo
            <ArrowRight size={11} />
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <div className="flex items-center">
          {statsData.map((s, i) => (
            <div key={s.sub} className="flex items-center">
              {i > 0 && (
                <motion.div animate={{ opacity: s.show ? 0.12 : 0 }} className="w-px h-8 mx-6 bg-white" />
              )}
              <motion.div
                animate={{ opacity: s.show ? 1 : 0, y: s.show ? 0 : 12 }}
                transition={{ duration: 0.45, ease: E }}
                className="text-center">
                <p className={`font-black text-white leading-none ${s.highlight ? "text-emerald-400" : ""}`}
                  style={{ fontSize: 26, letterSpacing: -1 }}>{s.num}</p>
                <p className="text-[7.5px] font-bold tracking-[3px] uppercase mt-1.5"
                  style={{ color: "rgba(255,255,255,0.2)" }}>{s.sub}</p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* URL */}
        <motion.div
          animate={{ opacity: sweep ? 0.3 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-4 flex items-center gap-2">
          <Globe size={9} className="text-emerald-400" />
          <p className="text-[9px] tracking-[4px] font-bold text-white/40">apneorder.com</p>
        </motion.div>
      </motion.div>

      {/* Sweep line at bottom */}
      <motion.div
        animate={{ scaleX: sweep ? 1 : 0 }}
        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.6) 20%, #4ade80 50%, rgba(74,222,128,0.6) 80%, transparent 100%)", transformOrigin: "left" }} />

      {/* Corner accents */}
      {sweep && [
        "top-4 left-4 border-t border-l",
        "top-4 right-4 border-t border-r",
        "bottom-4 left-4 border-b border-l",
        "bottom-4 right-4 border-b border-r",
      ].map((cls, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className={`absolute w-8 h-8 border-emerald-400/50 ${cls}`} />
      ))}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE TRANSITION INDICATOR
════════════════════════════════════════════════════ */
function SceneIndicator({ scene, total, isDark }: { scene: number; total: number; isDark: boolean }) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === scene ? 24 : 6,
            background: i + 1 === scene
              ? (isDark ? "#4ade80" : "#18181b")
              : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)")
          }}
          transition={{ duration: 0.3, ease: E }}
          className="h-1.5 rounded-full" />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   ORCHESTRATOR
════════════════════════════════════════════════════ */
const SCENE_DURATIONS = [7000, 11000, 11000, 8500, 9000, 8500, 7000]
const SCENE_CUMULATIVE = SCENE_DURATIONS.reduce<number[]>((acc, d, i) => {
  acc.push((acc[i - 1] ?? 0) + d)
  return acc
}, [])
const TOTAL_DURATION = SCENE_CUMULATIVE[SCENE_CUMULATIVE.length - 1]

const DARK_SCENES = new Set([1, 3, 5, 7])

function MotionInner({ onDone }: { onDone: () => void }) {
  const [scene, setScene] = useState(1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const T = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms))
    const t0 = Date.now()
    const pid = setInterval(() => setProgress(Math.min((Date.now() - t0) / TOTAL_DURATION * 100, 100)), 50)

    SCENE_CUMULATIVE.slice(0, -1).forEach((time, i) => {
      T(time, () => setScene(i + 2))
    })
    T(TOTAL_DURATION, onDone)

    return () => { ts.forEach(clearTimeout); clearInterval(pid) }
  }, [onDone])

  const isDark = DARK_SCENES.has(scene)

  return (
    <>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-50"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <motion.div
          className="h-full"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #059669, #4ade80, #a78bfa, #4ade80)" }}
          transition={{ duration: 0.05 }} />
      </div>

      {/* Scene label */}
      <motion.div
        key={scene}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-4 left-5 flex items-center gap-2 z-40">
        <div className="flex items-center gap-2 rounded-full px-3 py-1"
          style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          <span className="text-[8px] font-black tracking-[3px]"
            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" }}>
            SCENE {String(scene).padStart(2, "0")} / 07
          </span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {scene === 1 && <Scene1 key="s1" />}
        {scene === 2 && <Scene2 key="s2" />}
        {scene === 3 && <Scene3 key="s3" />}
        {scene === 4 && <Scene4 key="s4" />}
        {scene === 5 && <Scene5 key="s5" />}
        {scene === 6 && <Scene6 key="s6" />}
        {scene === 7 && <Scene7 key="s7" />}
      </AnimatePresence>
    </>
  )
}

/* ════════════════════════════════════════════════════
   PAGE ROOT
════════════════════════════════════════════════════ */
export default function MotionPage() {
  const [runKey, setRunKey]         = useState(0)
  const [showReplay, setShowReplay] = useState(false)
  const [scale, setScale]           = useState(1)

  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / 960, window.innerHeight / 540, 1))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const onDone = useCallback(() => setShowReplay(true), [])
  const replay = () => { setShowReplay(false); setRunKey(k => k + 1) }

  return (
    <div className="w-screen h-screen flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, #111 0%, #050505 100%)" }}>

      {/* Frame */}
      <div style={{
        width: 960, height: 540,
        transform: `scale(${scale})`, transformOrigin: "center",
        position: "relative", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 0 0 4px rgba(255,255,255,0.02), 0 60px 140px rgba(0,0,0,0.9)"
      }}>
        <MotionInner key={runKey} onDone={onDone} />

        {/* Replay */}
        <AnimatePresence>
          {showReplay && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.38)" }}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                onClick={replay}
                className="absolute bottom-5 right-5 flex items-center gap-3 rounded-full px-4 py-3 group"
                style={{ background: "rgba(10,10,10,0.86)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", boxShadow: "0 10px 28px rgba(74,222,128,0.28)" }}>
                  <RefreshCw size={17} className="text-white group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="text-left pr-1">
                  <p className="text-[13px] font-black text-white">Watch Again</p>
                  <p className="text-[9px] text-white/40 mt-0.5 tracking-[2px]">REPLAY</p>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
