// Service Worker for Apneorder Web Push Notifications

self.addEventListener("install", (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "🔔 New Order Received!",
    body: "You have received a new order.",
    icon: "/icon.png",
    badge: "/icon.png",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const baseUrl = self.location.origin;
  const options = {
    body: data.body,
    icon: data.icon ? (data.icon.startsWith("http") ? data.icon : `${baseUrl}${data.icon}`) : `${baseUrl}/icon.png`,
    badge: data.badge ? (data.badge.startsWith("http") ? data.badge : `${baseUrl}${data.badge}`) : `${baseUrl}/icon.png`,
    vibrate: [300, 150, 300, 150, 300, 150, 500],
    tag: data.tag || `order-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: {
      url: data.url || "/dashboard",
      dateOfArrival: Date.now(),
      ...data.data,
    },
    actions: [
      {
        action: "open-order",
        title: "View Order",
      },
    ],
  };


  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a dashboard tab is already open, focus it
      for (const client of clientList) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
