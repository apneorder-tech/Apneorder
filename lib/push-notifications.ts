import webpush from "web-push";
import prisma from "./prisma-new";


const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BEBwTl7Lt6mGO9AoEqXtYWdcXXZHGL68yz6XBqdZ0Kp7VUn0e_jLF_fEz0a1VkTJFFtr6-iPfx2vgNaEUj0Fs_g";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "1xZhPBeQ5H_V2L86RtdM8dG39d-UtAWEnC1bqZNyw3Y";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:support@apneorder.com";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn("VAPID setup warning:", e);
}


export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Send a web push notification to all active devices registered by a manager.
 * Automatically prunes expired or unregistered subscriptions.
 */
export async function sendPushToManager(managerId: string, payload: PushPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured, skipping push notification.");
    return { success: false, reason: "VAPID_NOT_CONFIGURED" };
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { managerId },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, count: 0 };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon.png",
      badge: payload.badge || "/icon.png",
      tag: payload.tag || `order-${Date.now()}`,
      url: payload.url || "/dashboard",
      data: payload.data || {},
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, notificationPayload, {
          TTL: 86400, // 24 hours
          urgency: "high", // ⚡ High urgency wakes Android from Doze mode / screen off
        });
      } catch (err: any) {
        // HTTP 404 Not Found or 410 Gone means the subscription is expired / revoked
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          console.log(`Pruning expired push subscription: ${sub.id}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("Error sending web push notification:", err);
        }
      }
    });

    await Promise.allSettled(sendPromises);
    return { success: true, count: subscriptions.length };

  } catch (error) {
    console.error("sendPushToManager error:", error);
    return { success: false, error };
  }
}
