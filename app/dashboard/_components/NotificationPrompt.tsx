"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, BellRing, Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface NotificationPromptProps {
  managerId: string | null;
  getToken: () => Promise<string | null>;
}

export function NotificationPrompt({ managerId, getToken }: NotificationPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (e) {
      console.warn("ServiceWorker push check error:", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("apne_notif_banner_dismissed");
      if (dismissed) setIsBannerDismissed(true);

      // Register Service Worker early
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => checkSubscription())
          .catch((err) => console.error("SW Registration failed:", err));
      }
    }
  }, [checkSubscription]);

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported on this browser.");
      return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEBwTl7Lt6mGO9AoEqXtYWdcXXZHGL68yz6XBqdZ0Kp7VUn0e_jLF_fEz0a1VkTJFFtr6-iPfx2vgNaEUj0Fs_g";

    // 🔒 Security check: Web Push API strictly requires HTTPS or localhost
    const isSecureContext = window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isSecureContext) {
      toast.error("HTTPS Required for Mobile Push", {
        description: "Mobile browsers require a secure HTTPS connection (e.g. your live Vercel domain) or http://localhost on computers.",
        duration: 6000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Request Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        toast.error("Notification permission denied. Please enable notifications in your browser settings.");
        setIsLoading(false);
        return;
      }

      // 2. Register Service Worker & Subscribe
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      // 3. Send subscription to backend
      const idToken = await getToken();
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          managerId: managerId || "unknown",
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubscribed(true);
        toast.success("🔔 Push notifications enabled!", {
          description: "You will receive instant alerts on new orders, even when locked.",
        });
      } else {
        toast.error("Failed to save push subscription.");
      }
    } catch (err: any) {
      console.error("Subscription Error:", err);
      if (err?.name === "AbortError" || err?.message?.includes("push service error")) {
        toast.error("Push Service Error", {
          description: "Browser push services require an HTTPS domain (e.g. your live Vercel website) or http://localhost on computers.",
          duration: 6000,
        });
      } else {
        toast.error(err?.message || "Failed to enable notifications.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        const idToken = await getToken();
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({ endpoint }),
        });
      }

      setIsSubscribed(false);
      toast.info("Notifications disabled for this device.");
    } catch (e) {
      console.error("Unsubscribe error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("apne_notif_banner_dismissed", "true");
    }
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Header Quick Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
        className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all ${
          isSubscribed
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/80"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
        }`}
        title={isSubscribed ? "Push notifications active (click to disable)" : "Enable push notifications"}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-emerald-600" />
        ) : isSubscribed ? (
          <BellRing className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse" />
        ) : (
          <Bell className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
        )}
        <span>{isSubscribed ? "Alerts On" : "Enable Alerts"}</span>
      </Button>

      {/* Floating Prompt Banner (Shown when not yet subscribed & not dismissed) */}
      {!isSubscribed && permission === "default" && !isBannerDismissed && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-zinc-900/95 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-zinc-800 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                Lock-Screen Alerts <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <button
                onClick={handleDismissBanner}
                className="text-zinc-400 hover:text-white p-1 -mr-1"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Get instant notification alerts on your phone whenever a customer places an order, even when your screen is locked.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-xs px-3.5 py-1.5 h-8 rounded-lg shadow-md shadow-emerald-950"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                Enable Notifications
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissBanner}
                className="text-zinc-400 hover:text-white text-xs h-8 px-2.5"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
