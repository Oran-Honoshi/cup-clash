// PWA & Web Push utilities

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

    // When a new SW takes control, reload once to serve fresh assets
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    const activateWaiting = (sw: ServiceWorker) => sw.postMessage("SKIP_WAITING");

    // If a new SW is already waiting (page was open during a deploy), activate now
    if (reg.waiting) {
      activateWaiting(reg.waiting);
    }

    // Watch for future updates — activate as soon as the new SW finishes installing
    reg.addEventListener("updatefound", () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          activateWaiting(installing);
        }
      });
    });

    return reg;
  } catch (e) {
    console.warn("SW registration failed:", e);
    return null;
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return await Notification.requestPermission();
}

export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  try {
    const permission = await requestPushPermission();
    if (permission !== "granted") return false;

    const reg = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) { console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY not set"); return false; }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
    });

    // Save subscription to Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const key  = sub.getKey("p256dh");
    const auth = sub.getKey("auth");

    await sb.from("push_subscriptions").upsert({
      user_id:  userId,
      endpoint: sub.endpoint,
      p256dh:   key  ? btoa(String.fromCharCode(...new Uint8Array(key)))  : "",
      auth_key: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : "",
    }, { onConflict: "endpoint" });

    return true;
  } catch (e) {
    console.warn("Push subscription failed:", e);
    return false;
  }
}

// Badge API — shows count on homescreen icon
export function setAppBadge(count: number) {
  if ("setAppBadge" in navigator) {
    (navigator as Navigator & { setAppBadge: (n: number) => void }).setAppBadge(count);
  }
}

export function clearAppBadge() {
  if ("clearAppBadge" in navigator) {
    (navigator as Navigator & { clearAppBadge: () => void }).clearAppBadge();
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = atob(base64);
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)));
}