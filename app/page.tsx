"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Utensils, Zap, ShieldCheck, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setRedirecting(true);
        window.location.href = "/dashboard";
      }
    });
    return () => unsub();
  }, []);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans">
      {/* Header */}
      <header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
            <QrCode size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">ApneOrder</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-600">
          <Link href="#features" className="hover:text-zinc-900 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/onboarding">
            <Button size="sm" className="rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 px-6 lg:px-20 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-zinc-100 rounded-full text-zinc-600">
              Future of Dining
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Create your QR ordering <br />
              <span className="text-zinc-400 font-medium italic">system in 10 minutes.</span>
            </h1>
            <p className="text-lg lg:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Empower your restaurant with a seamless digital menu and instant UPI payments. 
              No app downloads needed for customers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg">
                  Start Free Trial <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <p className="text-sm text-zinc-400">No credit card required</p>
            </div>
          </motion.div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-24 bg-zinc-50 border-y border-zinc-100 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-900">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast Setup</h3>
                <p className="text-zinc-500 leading-relaxed">Go from sign-up to a live digital menu in under 10 minutes. Simple, guided, and efficient.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-900">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold">Secure UPI Payments</h3>
                <p className="text-zinc-500 leading-relaxed">Receive payments directly into your account with instant verification. No middleman delays.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-900">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold">Real-time Analytics</h3>
                <p className="text-zinc-500 leading-relaxed">Track your sales, popular items, and customer behavior with a powerful manager dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-20 border-t border-zinc-100 text-center">
        <p className="text-sm text-zinc-400">
          © {new Date().getFullYear()} ApneOrder. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
