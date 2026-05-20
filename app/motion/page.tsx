"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ArrowRight, QrCode, CreditCard, Activity,
  Play, Pause, RotateCcw, CheckCircle2,
} from "lucide-react"

/* ─── easing ─────────────────────────────────────────── */
type E4 = [number, number, number, number]
const eSpring: E4 = [0.34, 1.15, 0.64, 1]

/* ─── timing ─────────────────────────────────────────── */
const SCENES = [5000, 5000, 4000, 5000, 6000, 5000, 5000]
const TOTAL  = SCENES.reduce((a, b) => a + b, 0)
const LOSS_AT_RISK = 27000
const MISSED_ORDERS_PER_DAY = 3
const AVG_ORDER_VALUE = 300

const STORY = [
  "1 of 7 — The Real Cost",
  "2 of 7 — Why It Happens",
  "3 of 7 — The Villain",
  "4 of 7 — The Solution",
  "5 of 7 — How It Works",
  "6 of 7 — The Result",
  "7 of 7 — Your Move",
]
const LABELS = ["Cost", "Why", "Villain", "Solution", "How", "Result", "Action"]

/* ─── counter hook ───────────────────────────────────── */
function useCounter(to: number, ms: number, on: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!on) return
    let t0: number | null = null
    let frame = 0
    const f = (now: number) => {
      if (!t0) t0 = now
      const p = Math.min((now - t0) / ms, 1)
      setV(Math.round((1 - Math.pow(1 - p, 3)) * to))
      if (p < 1) frame = requestAnimationFrame(f)
    }
    frame = requestAnimationFrame(f)
    return () => cancelAnimationFrame(frame)
  }, [to, ms, on])
  return v
}

/* ─── kinetic clip reveal ────────────────────────────── */
function KR({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties
}) {
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <motion.div className={className}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay }}>
        {children}
      </motion.div>
    </div>
  )
}

/* ─── fade in ────────────────────────────────────────── */
function FI({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties
}) {
  return (
    <motion.div className={className} style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: eSpring }}>
      {children}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 1 — THE REAL COST
   Hook: The loss number hits before anything else.
════════════════════════════════════════════════════════ */
function Scene1() {
  const n = useCounter(LOSS_AT_RISK, 3200, true)
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-14"
      style={{ paddingTop: 36, paddingBottom: 44 }}>

      <KR delay={0}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#999", marginBottom: 14 }}>
          Rush hour mein quietly
        </p>
      </KR>

      <KR delay={0.07}>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1,
          color: "#111", fontVariantNumeric: "tabular-nums" }}>
          ₹{n.toLocaleString()}
        </div>
      </KR>

      <KR delay={0.16}>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#111", marginTop: 8 }}>
          at risk hota hai.
        </div>
      </KR>

      <KR delay={0.25}>
        <div style={{ fontSize: 18, color: "#555", marginTop: 6 }}>
          Sirf 3 missed orders per day ka simple math.
        </div>
      </KR>

      <FI delay={0.7}>
        <div style={{ marginTop: 32, paddingTop: 22,
          borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          <div className="flex items-end gap-4 flex-wrap">
            {[
              { v: `${MISSED_ORDERS_PER_DAY} orders`, l: "miss/day",   bold: false },
              { v: "×",        op: true                      },
              { v: `₹${AVG_ORDER_VALUE}`,     l: "avg value",  bold: false  },
              { v: "×",        op: true                      },
              { v: "30 din",   l: "per month",  bold: false  },
              { v: "=",        op: true                      },
              { v: `₹${LOSS_AT_RISK.toLocaleString()}`,  l: "monthly risk", bold: true   },
            ].map((x, i) =>
              "op" in x ? (
                <div key={i} style={{ fontSize: 18, fontWeight: 700,
                  color: "#ccc", paddingBottom: 18 }}>
                  {x.v}
                </div>
              ) : (
                <div key={i}>
                  <div style={{ fontSize: 14, fontWeight: 800,
                    color: x.bold ? "#111" : "#555" }}>{x.v}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{x.l}</div>
                </div>
              )
            )}
          </div>
        </div>
      </FI>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 2 — WHY IT HAPPENS
   Each X appears one by one. Owner recognises their day.
════════════════════════════════════════════════════════ */
function Scene2() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setStep(4), 3400),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  const items = [
    "Customer wait karta hai — order late ho jaata hai",
    "Menu repeat hota hai — staff ka time waste hota hai",
    "Bill delay hota hai — table slow turn hota hai",
    "Manual flow hai — owner ko real picture late milti hai",
  ]

  return (
    <div className="absolute inset-0 flex flex-col justify-center px-14"
      style={{ paddingTop: 36, paddingBottom: 44 }}>

      <KR delay={0}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#999", marginBottom: 24 }}>
          Kyun hota hai yeh:
        </p>
      </KR>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {items.map((text, i) => (
          <motion.div key={i}
            className="flex items-center gap-4"
            style={{ padding: "12px 16px", borderRadius: 14,
              background: step >= i + 1 ? "rgba(0,0,0,0.05)" : "transparent" }}
            animate={{ opacity: step >= i + 1 ? 1 : 0.18 }}
            transition={{ duration: 0.35 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: step >= i + 1 ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 14 }}
              style={{ width: 24, height: 24, borderRadius: "50%",
                background: "#111", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={13} color="white" strokeWidth={2.5} />
            </motion.div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{text}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 8 }}
        transition={{ duration: 0.4, ease: eSpring }}
        style={{ borderTop: "2.5px solid #111", paddingTop: 18 }}>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#111" }}>
          Problem waiter ki nahi.{" "}
          <span style={{ color: "#888" }}>Problem flow ki hai.</span>
        </p>
      </motion.div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 3 — THE VILLAIN  [BLACK]
   Name the enemy. Make the villain feel real.
════════════════════════════════════════════════════════ */
function Scene3() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-14"
      style={{ background: "#111", paddingTop: 36, paddingBottom: 44 }}>

      {["WAITING.", "MANUAL ORDERING.", "MISSED."].map((word, i) => (
        <KR key={i} delay={i * 0.2}>
          <div style={{ fontSize: word.length > 12 ? 60 : 78, fontWeight: 900, lineHeight: 1.05, color: "#fff" }}>
            {word}
          </div>
        </KR>
      ))}

      <FI delay={0.72}>
        <div style={{ marginTop: 28, paddingTop: 22,
          borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
            Jab order flow manual hota hai,
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
            demand visible hone se pehle hi leak ho jaati hai.
          </p>
        </div>
      </FI>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 4 — THE SOLUTION
   Hero enters after the villain. Clean contrast.
════════════════════════════════════════════════════════ */
function Scene4() {
  const features = [
    { icon: QrCode,       label: "QR MENU",       sub: "Customer khud order karta hai" },
    { icon: CreditCard,   label: "DIRECT UPI",     sub: "Payment restaurant account mein" },
    { icon: Activity,     label: "LIVE ORDER SCREEN", sub: "Har table visible"          },
  ]

  return (
    <div className="absolute inset-0 flex items-center px-14 gap-14">

      {/* Left: brand text */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        <KR delay={0}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#999", marginBottom: 14 }}>
            Solution:
          </p>
        </KR>
        <KR delay={0.08}>
          <div style={{ fontSize: 70, fontWeight: 900, lineHeight: 1, color: "#111" }}>
            APNEORDER.
          </div>
        </KR>
        <KR delay={0.18}>
          <p style={{ fontSize: 17, color: "#555", marginTop: 8 }}>
            QR ordering for serious restaurants.
          </p>
        </KR>
        <FI delay={0.5}
          style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          <p style={{ fontSize: 18, fontWeight: 900, color: "#111", lineHeight: 1.5 }}>
            Customer order karega.<br />
            <span style={{ color: "#888" }}>Staff sirf flow manage karega.</span>
          </p>
        </FI>
      </div>

      {/* Right: 3 features */}
      <div style={{ width: 250, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map(({ icon: Ic, label, sub }, i) => (
          <FI key={i} delay={0.5 + i * 0.18}>
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 16,
              background: i === 0 ? "#111" : "rgba(0,0,0,0.05)",
              border: `1px solid ${i === 0 ? "transparent" : "rgba(0,0,0,0.08)"}`,
            }}>
              <Ic size={18} color={i === 0 ? "#fff" : "#111"} strokeWidth={2} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800,
                  color: i === 0 ? "#fff" : "#111" }}>{label}</div>
                <div style={{ fontSize: 11, color: i === 0 ? "rgba(255,255,255,0.4)" : "#999",
                  marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          </FI>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 5 — HOW IT WORKS
   The before/after transformation, row by row.
════════════════════════════════════════════════════════ */
function Scene5() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1900),
      setTimeout(() => setStep(3), 3300),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  const rows = [
    { label: "Ordering",              before: "WAITER DEPENDENT", after: "CUSTOMER SCANS" },
    { label: "Order handoff",         before: "VERBAL / PAPER",   after: "LIVE ORDER SCREEN" },
    { label: "Collection",            before: "MANUAL BILL",      after: "DIRECT UPI"     },
  ]

  return (
    <div className="absolute inset-0 flex flex-col justify-center px-14"
      style={{ paddingTop: 36, paddingBottom: 44 }}>

      <KR delay={0}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#999", marginBottom: 28 }}>
          Pehle vs. Ab:
        </p>
      </KR>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {rows.map(({ label, before, after }, i) => (
          <motion.div key={i}
            style={{
              display: "grid", gridTemplateColumns: "180px 1fr 28px 1fr",
              alignItems: "center", gap: 16,
              padding: "18px 0",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
            }}
            animate={{ opacity: step >= i + 1 ? 1 : 0.12 }}
            transition={{ duration: 0.4 }}>

            {/* label */}
            <div style={{ fontSize: 12, color: "#aaa", textTransform: "uppercase",
              letterSpacing: "0.1em", fontWeight: 600 }}>
              {label}
            </div>

            {/* before */}
            <div style={{ fontSize: 18, fontWeight: 900, color: "#ccc",
              textDecoration: step >= i + 1 ? "line-through" : "none" }}>
              {before}
            </div>

            {/* arrow */}
            <ArrowRight size={16} color="#ccc" />

            {/* after */}
            <motion.div
              animate={{ opacity: step >= i + 1 ? 1 : 0, x: step >= i + 1 ? 0 : -8 }}
              transition={{ delay: 0.15, duration: 0.35, ease: eSpring }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>{after}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 8 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ marginTop: 28, paddingTop: 22, borderTop: "2.5px solid #111" }}>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#111" }}>
          Scan se payment tak — one clean flow.
        </p>
      </motion.div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 6 — THE RESULT
   Every number from Scene 1 now resolved.
════════════════════════════════════════════════════════ */
function Scene6() {
  const potentialRisk = useCounter(LOSS_AT_RISK, 2500, true)

  return (
    <div className="absolute inset-0 flex items-center px-14 gap-14">

      {/* Left: 3 big stats */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
        <KR delay={0}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#999" }}>
            Ab kya hota hai:
          </p>
        </KR>

        {[
          { value: `₹${potentialRisk.toLocaleString()}`, note: "monthly potential risk", d: 0.08 },
          { value: "MORE",                         note: "orders captured", d: 0.28 },
          { value: "FASTER",                       note: "table turnover",  d: 0.48 },
        ].map(({ value, note, d }, i) => (
          <KR key={i} delay={d}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: "#111",
                fontVariantNumeric: "tabular-nums" }}>
                {value}
              </div>
              <div style={{ fontSize: 15, color: "#555", marginTop: 5 }}>{note}</div>
            </div>
          </KR>
        ))}

      </div>

      {/* Right: summary card */}
      <FI delay={0.8} style={{ width: 250, flexShrink: 0 }}>
        <div style={{ borderRadius: 20, padding: 24, background: "#111",
          boxShadow: "0 12px 48px rgba(0,0,0,0.18)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
            marginBottom: 10 }}>
            Less confusion
          </p>
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1,
            color: "#fff", fontVariantNumeric: "tabular-nums", marginBottom: 20 }}>
            Direct
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16,
            display: "flex", flexDirection: "column", gap: 10 }}>
            {["More orders captured", "Faster table turnover", "Direct UPI collection"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={12} color="rgba(255,255,255,0.35)" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Potential risk example:{" "}
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>
              ₹{LOSS_AT_RISK.toLocaleString()}/month
            </strong>
          </div>
        </div>
      </FI>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   SCENE 7 — YOUR MOVE
   Simple. Direct. The only logical next step.
════════════════════════════════════════════════════════ */
function Scene7() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-14"
      style={{ paddingTop: 36, paddingBottom: 44 }}>

      <FI delay={0}>
        <p style={{ fontSize: 17, fontWeight: 600, color: "#555", marginBottom: 14 }}>
          Built for Indian restaurants.
        </p>
      </FI>

      <KR delay={0.14}>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1, color: "#111" }}>
          AB AAPKI
        </div>
      </KR>
      <KR delay={0.24}>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1, color: "#111",
          marginBottom: 32 }}>
          BAARI.
        </div>
      </KR>

      <FI delay={0.65}>
        <div style={{ borderTop: "2.5px solid #111", paddingTop: 24,
          display: "flex", alignItems: "center", gap: 20 }}>

          {/* CTA button */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#111", borderRadius: 16, padding: "16px 22px",
            flex: 1, maxWidth: 360,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>
                Book your restaurant setup
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
                apneorder.com · book setup
              </div>
            </div>
            <ArrowRight size={20} color="#fff" />
          </div>

          {/* Trust bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "No tech knowledge needed",
              "Guided setup available",
              "Dedicated setup support",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={12} color="#111" strokeWidth={2.5} />
                <span style={{ fontSize: 13, color: "#555" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </FI>
    </div>
  )
}

/* ─── registry ───────────────────────────────────────── */
const SCENE_COMPONENTS = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7]

/* ════════════════════════════════════════════════════════
   MONITOR PLAYER
════════════════════════════════════════════════════════ */
export default function MotionPage() {
  const [scene, setScene]     = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [completed, setCompleted] = useState(false)
  const rafRef   = useRef<number | undefined>(undefined)
  const startRef = useRef<number>(0)
  const baseRef  = useRef<number>(0)
  const elapsedRef = useRef<number>(0)

  const totalElapsed = SCENES.slice(0, scene).reduce((a, b) => a + b, 0) + elapsed
  const progress     = (totalElapsed / TOTAL) * 100
  const currentSecs  = Math.floor(totalElapsed / 1000)
  const totalSecs    = Math.floor(TOTAL / 1000)

  const goToScene = useCallback((idx: number) => {
    cancelAnimationFrame(rafRef.current!)
    setScene(idx); setElapsed(0); baseRef.current = 0; elapsedRef.current = 0
    setCompleted(false)
  }, [])

  useEffect(() => {
    if (playing) {
      startRef.current = performance.now()
      const tick = () => {
        const delta = performance.now() - startRef.current + baseRef.current
        elapsedRef.current = delta
        setElapsed(delta)
        if (delta >= SCENES[scene]) {
          if (scene < SCENE_COMPONENTS.length - 1) {
            baseRef.current = 0; elapsedRef.current = 0; startRef.current = performance.now()
            setScene(s => s + 1); setElapsed(0)
          } else { setPlaying(false); setCompleted(true); return }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current!)
      baseRef.current = elapsedRef.current
    }
    return () => cancelAnimationFrame(rafRef.current!)
  }, [playing, scene])

  const SceneComp = SCENE_COMPONENTS[scene]

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", background: "#e8e8e8" }}>

      <div style={{ width: "100%", maxWidth: 1024,
        display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── monitor bezel ── */}
        <div style={{
          width: "100%", borderRadius: 28, padding: 12,
          background: "linear-gradient(160deg, #2a2a2a 0%, #111 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: [
            "0 0 0 1px rgba(0,0,0,0.4)",
            "0 40px 80px rgba(0,0,0,0.35)",
            "0 80px 120px rgba(0,0,0,0.18)",
            "inset 0 1px 0 rgba(255,255,255,0.06)",
          ].join(", "),
        }}>

          {/* screen */}
          <div style={{ position: "relative", borderRadius: 16,
            overflow: "hidden", background: "#fff", paddingTop: "62.5%" }}>

            {/* browser bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
              height: 38, display: "flex", alignItems: "center",
              padding: "0 16px", gap: 12,
              background: "#f5f5f5", borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#aaa", "#ccc", "#e0e0e0"].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12,
                    borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 12px", borderRadius: 8,
                  background: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}>
                  <div style={{ width: 6, height: 6,
                    borderRadius: "50%", background: "#999" }} />
                  <span style={{ fontSize: 11, color: "#aaa" }}>apneorder.com</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: "#bbb", minWidth: 180,
                textAlign: "right", overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap" }}>
                {STORY[scene]}
              </span>
            </div>

            {/* scene */}
            <div style={{ position: "absolute", inset: 0, top: 38 }}>
              <AnimatePresence mode="wait">
                <motion.div key={scene} style={{ position: "absolute", inset: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.01 } }}
                  exit={{ opacity: 0, transition: { duration: 0.14 } }}>
                  <SceneComp />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {completed && (
                <motion.button
                  type="button"
                  onClick={() => { goToScene(0); setPlaying(true) }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: eSpring }}
                  style={{
                    position: "absolute", right: 18, bottom: 18, zIndex: 30,
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "11px 14px", borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "#111", color: "#fff", cursor: "pointer",
                    boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
                    fontSize: 12, fontWeight: 800,
                  }}>
                  <RotateCcw size={13} />
                  Watch again
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* bezel brand */}
          <div style={{ display: "flex", justifyContent: "center",
            paddingTop: 10, paddingBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.14)" }}>
              ApneOrder
            </span>
          </div>
        </div>

        {/* ── monitor stand ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 90, height: 44,
            background: "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
            clipPath: "polygon(25% 0%, 75% 0%, 90% 100%, 10% 100%)" }} />
          <div style={{ width: 260, height: 14, borderRadius: 10,
            background: "linear-gradient(to bottom, #252525, #111)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }} />
        </div>

        {/* ── player controls ── */}
        <div style={{ width: "100%", marginTop: 32,
          display: "flex", flexDirection: "column", gap: 14 }}>

          {/* progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "#aaa", width: 28, fontVariantNumeric: "tabular-nums" }}>
              {currentSecs}s
            </span>
            <div style={{ flex: 1, height: 3, borderRadius: 99,
              background: "rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <motion.div style={{ height: "100%", borderRadius: 99, background: "#111" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }} />
            </div>
            <span style={{ fontSize: 11, color: "#aaa", width: 28,
              textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {totalSecs}s
            </span>
          </div>

          {/* buttons row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { goToScene(0); setPlaying(false) }}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)",
                background: "rgba(0,0,0,0.06)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RotateCcw size={13} color="#666" />
            </button>

            <button onClick={() => setPlaying(p => !p)}
              style={{ height: 36, padding: "0 24px", borderRadius: 10,
                background: "#111", border: "none", color: "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                opacity: playing ? 0.72 : 1 }}>
              {playing ? <><Pause size={13} />Pause</> : <><Play size={13} />Play</>}
            </button>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {LABELS.map((label, i) => (
                <button key={i}
                  onClick={() => { goToScene(i); setPlaying(true) }}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                    cursor: "pointer",
                    background: scene === i ? "#111" : "rgba(0,0,0,0.06)",
                    border: `1px solid ${scene === i ? "#111" : "rgba(0,0,0,0.1)"}`,
                    color: scene === i ? "#fff" : "#666",
                  }}>
                  {i + 1}. {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
