"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, CreditCard, Palette, LayoutGrid, CheckCircle2,
  ArrowRight, ArrowLeft, Mail, Building2, Utensils,
  Trash2, Plus, Download, Check, Loader2, Eye, EyeOff, Lock,
  ShieldCheck, Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { generateQR } from "@/lib/qr";
import { jsPDF } from "jspdf";

type Step = 'auth' | 'restaurant' | 'payment' | 'theme' | 'menu' | 'tables' | 'complete';

interface OnboardingMenuItem { name: string; price: string; type: string; }
interface OnboardingCategory { name: string; items: OnboardingMenuItem[]; }
interface ApiCategory {
  name: string;
  menuItems: { name: string; price: number | string; type: string; }[];
}

const STEPS: Step[] = ['auth', 'restaurant', 'payment', 'theme', 'menu', 'tables', 'complete'];

const STEP_META: Record<Step, { label: string; icon: React.ReactNode; desc: string }> = {
  auth:       { label: "Create Account",    icon: <ShieldCheck size={15} />, desc: "Secure sign-up" },
  restaurant: { label: "Restaurant Info",   icon: <Building2 size={15} />,   desc: "Your place, your brand" },
  payment:    { label: "Payment Setup",     icon: <CreditCard size={15} />,  desc: "Get paid instantly" },
  theme:      { label: "Brand Theme",       icon: <Palette size={15} />,     desc: "Pick your colours" },
  menu:       { label: "Menu Setup",        icon: <Utensils size={15} />,    desc: "Add your items" },
  tables:     { label: "Table Setup",       icon: <LayoutGrid size={15} />,  desc: "Configure your space" },
  complete:   { label: "All Done!",         icon: <Sparkles size={15} />,    desc: "You're live" },
};

const THEME_OPTIONS = [
  { color: '#18181b', name: 'Obsidian' },
  { color: '#D97706', name: 'Amber' },
  { color: '#059669', name: 'Emerald' },
  { color: '#2563EB', name: 'Sapphire' },
  { color: '#DC2626', name: 'Ruby' },
  { color: '#7C3AED', name: 'Violet' },
];

/* ─── Shared field component ─── */
function Field({
  label, hint, children
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-[10px] text-zinc-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all disabled:opacity-50 px-3.5";

/* ─── Nav buttons ─── */
function NavButtons({
  onBack, onNext, nextLabel = "Continue", loading = false, disabled = false, backStep
}: {
  onBack?: () => void; onNext: () => void; nextLabel?: string;
  loading?: boolean; disabled?: boolean; backStep?: Step;
}) {
  return (
    <div className={cn("flex mt-8 pt-6 border-t border-zinc-100", onBack ? "justify-between" : "justify-end")}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={loading || disabled}
        className="flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-100"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Please wait…" : nextLabel}
        {!loading && <ArrowRight size={15} />}
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [authData, setAuthData] = useState({ email: '', password: '', confirmPassword: '' });

  const [data, setData] = useState({
    restaurantName: '', ownerName: '', city: '', address: '',
    upiId: '', themeColor: '#18181b',
    menuCategories: [{ name: 'Coffee', items: [{ name: 'Espresso', price: '120', type: 'veg' }] }] as OnboardingCategory[],
    tableCount: '10', managerId: '', restaurantId: '',
  });

  // ─── Session check on mount ───
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setIsSyncing(false); return; }

      try {
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.success) setData(prev => ({ ...prev, managerId: syncData.managerId }));
        }
      } catch (e) { console.error("Auth sync error:", e); }

      try {
        const res = await fetch(`/api/onboarding/status?managerId=${session.user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const status = await res.json();
        if (status.exists && status.restaurant) {
          const r = status.restaurant;
          setData({
            managerId: session.user.id,
            restaurantName: r.name, ownerName: r.ownerName, city: r.city, address: r.address,
            upiId: r.upiId, themeColor: r.themeColor,
            menuCategories: r.categories.map((c: ApiCategory) => ({
              name: c.name,
              items: c.menuItems.map(i => ({ name: i.name, price: i.price.toString(), type: i.type })),
            })),
            tableCount: r.tables.length.toString(), restaurantId: r.id,
          });
          if (!r.name || !r.ownerName) setStep('restaurant');
          else if (!r.upiId) setStep('payment');
          else if (r.categories.length === 0) setStep('menu');
          else if (r.tables.length === 0) setStep('tables');
          else window.location.href = "/dashboard";
          return;
        } else { setStep('restaurant'); }
      } catch { setStep('restaurant'); }
      finally { setIsSyncing(false); }
    });
  }, []);

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  // ─── Handlers ───
  const handleSignup = async () => {
    const { email, password, confirmPassword } = authData;
    setAuthError("");
    if (!email.trim() || !password) { setAuthError("Please fill in all fields."); return; }
    if (password.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setAuthError("Passwords do not match."); return; }

    setIsLoading(true);
    try {
      const { data: signupData, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
      });
      if (error) {
        setAuthError(error.message.includes("already registered")
          ? "This email is already registered. Please sign in instead."
          : error.message);
        return;
      }
      if (signupData.session) {
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { Authorization: `Bearer ${signupData.session.access_token}` },
        });
        const syncData = await syncRes.json();
        if (syncData.success) setData(prev => ({ ...prev, managerId: syncData.managerId }));
        setStep('restaurant');
      } else {
        setAuthError("__EMAIL_CONFIRM__");
      }
    } catch { setAuthError("Something went wrong. Please try again."); }
    finally { setIsLoading(false); }
  };

  const nextStep = async (s: Step) => {
    if (s === 'complete') {
      setIsLoading(true);
      try {
        const session = await getSession();
        const token = session?.access_token;
        const res = await fetch('/api/onboarding/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          setData(prev => ({ ...prev, restaurantId: result.restaurantId }));
          const url = await generateQR(`${window.location.origin}/menu/${result.restaurantId}?table=1`);
          setQrCodeUrl(url);
          setStep(s);
        } else {
          throw new Error(result.details ? JSON.stringify(result.details) : result.error);
        }
      } catch (error: any) { alert(`Failed to save setup: ${error.message}`); }
      finally { setIsLoading(false); }
    } else { setStep(s); }
  };

  const prevStep = (s: Step) => setStep(s);

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const count = parseInt(data.tableCount) || 1;
    for (let i = 1; i <= count; i++) {
      if (i > 1) doc.addPage();
      const targetId = data.restaurantId || data.managerId;
      const qrImage = await generateQR(`${window.location.origin}/menu/${targetId}?table=${i}`);
      doc.setFontSize(28); doc.text(data.restaurantName || "Our Restaurant", 105, 40, { align: 'center' });
      doc.setFontSize(18); doc.text(`Table No: ${i}`, 105, 60, { align: 'center' });
      doc.addImage(qrImage, 'PNG', 45, 80, 120, 120);
      doc.setFontSize(10); doc.setTextColor(150);
      doc.text("Scan to Menu • Tap to Pay", 105, 210, { align: 'center' });
      doc.text("Powered by Apne Order", 105, 220, { align: 'center' });
    }
    doc.save(`${data.restaurantName || "Restaurant"}-QR-Codes.pdf`);
  };

  // ─── Step: Auth ───
  const renderAuth = () => (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-zinc-400 mt-1">Create your restaurant setup for the standard plan</p>
      </div>

      <div className="space-y-4">
        <Field label="Email Address">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input type="email" value={authData.email} placeholder="you@restaurant.com" disabled={isLoading}
              onChange={e => setAuthData(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              className={cn(inputCls, "pl-10")} />
          </div>
        </Field>

        <Field label="Password" hint="Min. 8 characters">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input type={showPassword ? "text" : "password"} value={authData.password}
              placeholder="••••••••" disabled={isLoading}
              onChange={e => setAuthData(p => ({ ...p, password: e.target.value }))}
              className={cn(inputCls, "pl-10 pr-10")} />
            <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {/* Password strength bar */}
          {authData.password.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className={cn("h-0.5 flex-1 rounded-full transition-all duration-300",
                  authData.password.length >= n * 3
                    ? n <= 1 ? "bg-red-400" : n <= 2 ? "bg-amber-400" : n <= 3 ? "bg-emerald-400" : "bg-emerald-500"
                    : "bg-zinc-100"
                )} />
              ))}
            </div>
          )}
        </Field>

        <Field label="Confirm Password">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input type={showConfirmPassword ? "text" : "password"} value={authData.confirmPassword}
              placeholder="Repeat your password" disabled={isLoading}
              onChange={e => setAuthData(p => ({ ...p, confirmPassword: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              className={cn(inputCls, "pl-10 pr-10",
                authData.confirmPassword && authData.password !== authData.confirmPassword
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                  : authData.confirmPassword && authData.password === authData.confirmPassword
                    ? "border-emerald-300 focus:border-emerald-400" : ""
              )} />
            <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            {authData.confirmPassword && authData.password === authData.confirmPassword && (
              <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-400" size={14} />
            )}
          </div>
        </Field>

        {/* Error states */}
        {authError && authError !== "__EMAIL_CONFIRM__" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-600 font-medium bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-100">
            {authError}
          </motion.p>
        )}
        {authError === "__EMAIL_CONFIRM__" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5 space-y-1">
            <p className="text-xs font-black text-emerald-800 uppercase tracking-wider">Check your inbox</p>
            <p className="text-xs text-emerald-700">
              Confirmation sent to <strong>{authData.email}</strong>. Click the link, then sign in.
            </p>
            <Link href="/login" className="text-xs font-bold text-emerald-900 underline underline-offset-2 hover:text-emerald-700 transition-colors">
              Sign in now →
            </Link>
          </motion.div>
        )}
      </div>

      <NavButtons onNext={handleSignup} nextLabel="Create Account" loading={isLoading} />

      <p className="text-xs text-zinc-400 text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-700 font-bold hover:underline">Sign in</Link>
      </p>
    </div>
  );

  // ─── Step: Restaurant ───
  const renderRestaurantDetails = () => (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Restaurant Details</h2>
        <p className="text-sm text-zinc-400 mt-1">Tell us about your café or restaurant</p>
      </div>

      <div className="space-y-4">
        <Field label="Restaurant / Café Name">
          <input placeholder="e.g. The Green Bean" value={data.restaurantName}
            onChange={e => setData({ ...data, restaurantName: e.target.value })}
            className={inputCls} />
        </Field>

        <Field label="Owner / Manager Name">
          <input placeholder="Full Name" value={data.ownerName}
            onChange={e => setData({ ...data, ownerName: e.target.value })}
            className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input placeholder="e.g. Mumbai" value={data.city}
              onChange={e => setData({ ...data, city: e.target.value })}
              className={inputCls} />
          </Field>
          <Field label="Landmark / Area">
            <input placeholder="e.g. Bandra West" value={data.address}
              onChange={e => setData({ ...data, address: e.target.value })}
              className={inputCls} />
          </Field>
        </div>
      </div>

      <NavButtons
        onBack={() => prevStep('auth')}
        onNext={() => nextStep('payment')}
        nextLabel="Next: Payment"
        disabled={!data.restaurantName || !data.ownerName || !data.city || !data.address}
      />
    </div>
  );

  // ─── Step: Payment ───
  const renderPayment = () => (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Payment Setup</h2>
        <p className="text-sm text-zinc-400 mt-1">Customers pay directly to your UPI — no middleman</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="bg-zinc-900 px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <CreditCard size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">UPI Payment</p>
            <p className="text-zinc-400 text-xs">Instant settlement to your account</p>
          </div>
          <ShieldCheck size={16} className="text-emerald-400 ml-auto" />
        </div>
        <div className="p-6 space-y-4 bg-white">
          <Field label="Your UPI ID" hint="e.g. name@paytm, name@upi">
            <div className="relative">
              <input placeholder="yourname@upi" value={data.upiId}
                onChange={e => setData({ ...data, upiId: e.target.value.trim() })}
                className={cn(inputCls, "pr-20 font-mono text-sm")} />
              {data.upiId && data.upiId.includes('@') && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  Valid
                </span>
              )}
            </div>
          </Field>
          <div className="flex flex-wrap gap-2">
            {['@paytm', '@ybl', '@oksbi', '@okhdfcbank'].map(s => (
              <button key={s} onClick={() => {
                const base = data.upiId.split('@')[0] || '';
                setData({ ...data, upiId: base + s });
              }} className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavButtons
        onBack={() => prevStep('restaurant')}
        onNext={() => nextStep('theme')}
        nextLabel="Next: Theme"
      />
    </div>
  );

  // ─── Step: Theme ───
  const renderTheme = () => (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Brand Theme</h2>
        <p className="text-sm text-zinc-400 mt-1">This colour appears on your digital menu for customers</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ color, name }) => (
          <button key={color} onClick={() => setData({ ...data, themeColor: color })}
            className={cn(
              "relative rounded-2xl overflow-hidden transition-all duration-200 group",
              data.themeColor === color
                ? "ring-2 ring-offset-2 ring-zinc-900 scale-[1.02]"
                : "hover:scale-[1.01] hover:shadow-md"
            )}>
            <div className="h-20 w-full" style={{ backgroundColor: color }} />
            <div className="px-3 py-2 bg-white border-t border-zinc-100">
              <p className="text-[11px] font-bold text-zinc-700 text-left">{name}</p>
            </div>
            {data.themeColor === color && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Check size={11} className="text-zinc-900" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Preview strip */}
      <div className="mt-5 rounded-xl border border-zinc-100 overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: data.themeColor }} />
        <div className="p-3 flex items-center gap-3 bg-zinc-50">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ backgroundColor: data.themeColor }}>A</div>
          <span className="text-xs text-zinc-500 font-medium">Menu preview with your brand colour</span>
        </div>
      </div>

      <NavButtons onBack={() => prevStep('payment')} onNext={() => nextStep('menu')} nextLabel="Next: Menu" />
    </div>
  );

  // ─── Step: Menu ───
  const renderMenuSetup = () => (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Menu Setup</h2>
        <p className="text-sm text-zinc-400 mt-1">Add your categories and items — you can edit this anytime</p>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {data.menuCategories.map((cat, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Utensils size={13} className="text-zinc-400" />
                <span className="text-sm font-bold text-zinc-800">{cat.name}</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full font-medium">
                  {cat.items.length} item{cat.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button className="text-zinc-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="divide-y divide-zinc-50">
              {cat.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-2 h-2 rounded-sm flex-shrink-0",
                      item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500')} />
                    <span className="text-sm text-zinc-700 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-zinc-500">₹{item.price}</span>
                    <button className="text-zinc-200 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-600 font-semibold transition-colors">
                  <Plus size={13} /> Add item
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-emerald-300 hover:text-emerald-600 text-xs font-bold transition-all">
        <Plus size={14} /> Add Category
      </button>

      <NavButtons onBack={() => prevStep('theme')} onNext={() => nextStep('tables')} nextLabel="Next: Tables" />
    </div>
  );

  // ─── Step: Tables ───
  const renderTables = () => {
    const count = parseInt(data.tableCount) || 0;
    return (
      <div>
        <div className="mb-7">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Table Setup</h2>
          <p className="text-sm text-zinc-400 mt-1">Each table gets its own QR code for ordering</p>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-center gap-6 py-8">
          <button
            onClick={() => setData({ ...data, tableCount: Math.max(1, count - 1).toString() })}
            className="w-12 h-12 rounded-xl border-2 border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 text-xl font-bold transition-all flex items-center justify-center leading-none">
            −
          </button>
          <div className="text-center w-24">
            <span className="text-5xl font-black text-zinc-900 tabular-nums">{data.tableCount}</span>
            <p className="text-[11px] text-zinc-400 font-medium mt-1">tables</p>
          </div>
          <button
            onClick={() => setData({ ...data, tableCount: (count + 1).toString() })}
            className="w-12 h-12 rounded-xl border-2 border-zinc-200 text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 text-xl font-bold transition-all flex items-center justify-center leading-none">
            +
          </button>
        </div>

        {/* Visual table grid */}
        <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">QR preview</p>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
            {Array.from({ length: Math.min(count, 24) }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-400 shadow-sm">
                {i + 1}
              </div>
            ))}
            {count > 24 && (
              <div className="w-7 h-7 rounded-lg bg-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                +{count - 24}
              </div>
            )}
          </div>
        </div>

        <NavButtons
          onBack={() => prevStep('menu')}
          onNext={() => nextStep('complete')}
          nextLabel="Generate QR Codes"
          loading={isLoading}
        />
      </div>
    );
  };

  // ─── Step: Complete ───
  const renderComplete = () => (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>
      <h2 className="text-2xl font-black text-zinc-900 tracking-tight">You're all set!</h2>
      <p className="text-sm text-zinc-400 mt-1 mb-8">{data.restaurantName} is live and ready to take orders</p>

      {/* QR preview card */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 space-y-4 mb-6">
        <div className="w-36 h-36 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto overflow-hidden">
          {qrCodeUrl
            ? <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain p-1" />
            : <QrCode size={80} className="text-zinc-200" strokeWidth={1.5} />
          }
        </div>
        <div>
          <p className="font-black text-zinc-900">{data.restaurantName}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{data.tableCount} QR codes generated</p>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={handleDownloadPDF}
          className="w-full h-12 rounded-xl border-2 border-zinc-200 text-zinc-700 hover:border-zinc-400 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-zinc-50">
          <Download size={16} /> Download QR PDFs for Print
        </button>
        <Link href="/dashboard" className="block">
          <button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-100">
            Open Dashboard <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );

  // ─── Loading screen ───
  if (isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="ApneOrder" className="w-10 h-10 object-contain" />
          <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Restoring your session…</p>
        </div>
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(step);
  const isComplete = step === 'complete';

  return (
    <div className="min-h-screen flex bg-white">

      {/* ─── Left sidebar (desktop) ─── */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col bg-zinc-900 text-white p-8 sticky top-0 h-screen">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-12">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-lg shadow-black/20 ring-1 ring-white/10 overflow-hidden">
            <img src="/logo.png" alt="ApneOrder" className="h-8 w-8 object-contain" />
          </span>
          <span className="font-black text-white tracking-tight text-lg">ApneOrder</span>
        </Link>

        {/* Step list */}
        <nav className="space-y-1 flex-1">
          {STEPS.filter(s => s !== 'complete').map((s, i) => {
            const meta = STEP_META[s];
            const isDone = STEPS.indexOf(s) < stepIndex;
            const isActive = s === step;
            return (
              <div key={s} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                isActive ? "bg-white/10" : "opacity-50"
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isDone ? "bg-emerald-500" : isActive ? "bg-white/20" : "bg-white/5"
                )}>
                  {isDone
                    ? <Check size={13} className="text-white" />
                    : <span className={cn("transition-colors", isActive ? "text-white" : "text-zinc-500")}>
                        {meta.icon}
                      </span>
                  }
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-bold leading-tight truncate",
                    isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-600")}>
                    {meta.label}
                  </p>
                  <p className={cn("text-[11px] truncate",
                    isActive ? "text-zinc-400" : "text-zinc-600")}>{meta.desc}</p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom tagline */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your restaurant will be live in minutes. Customers scan, order, and pay — all from their phone.
          </p>
        </div>
      </aside>

      {/* ─── Right panel ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* ─── Mobile header (sticky) ─── */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
          {/* Logo + step counter */}
          <div className="flex items-center justify-between px-5 h-14">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="ApneOrder" className="w-7 h-7 object-contain" />
              <span className="font-black text-zinc-900 text-sm tracking-tight">ApneOrder</span>
            </Link>
            {!isComplete && (
              <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                Step {stepIndex + 1} of {STEPS.length - 1}
              </span>
            )}
          </div>

          {/* Step info + segmented dots */}
          {!isComplete && (
            <div className="px-5 pb-3.5 flex items-center gap-3 border-b border-zinc-100">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
                {STEP_META[step].icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-zinc-900 leading-snug">{STEP_META[step].label}</p>
                <p className="text-[11px] text-zinc-400 leading-tight">{STEP_META[step].desc}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {STEPS.filter(s => s !== 'complete').map((s) => (
                  <div key={s} className={cn(
                    "rounded-full transition-all duration-300",
                    STEPS.indexOf(s) < stepIndex
                      ? "w-1.5 h-1.5 bg-emerald-500"
                      : s === step
                        ? "w-4 h-1.5 bg-zinc-900"
                        : "w-1.5 h-1.5 bg-zinc-200"
                  )} />
                ))}
              </div>
            </div>
          )}

          {/* Emerald progress bar */}
          {!isComplete && (
            <div className="h-0.5 bg-zinc-100">
              <motion.div className="h-full bg-emerald-500"
                initial={false}
                animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>
          )}
        </div>

        {/* Desktop progress (top bar) */}
        {!isComplete && (
          <div className="hidden lg:block">
            <div className="h-0.5 bg-zinc-100 w-full">
              <motion.div className="h-full bg-emerald-500"
                initial={false}
                animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>
          </div>
        )}

        {/* Form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-5 pb-20 pt-6 lg:px-8 lg:pb-12 lg:pt-0">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                {step === 'auth'       && renderAuth()}
                {step === 'restaurant' && renderRestaurantDetails()}
                {step === 'payment'    && renderPayment()}
                {step === 'theme'      && renderTheme()}
                {step === 'menu'       && renderMenuSetup()}
                {step === 'tables'     && renderTables()}
                {step === 'complete'   && renderComplete()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
