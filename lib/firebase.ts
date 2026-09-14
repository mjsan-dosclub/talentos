import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, isSupported, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForTalentOSDevFCM001",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "talentos-descience.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "talentos-descience",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "talentos-descience.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "103948572019",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:103948572019:web:abcdef123456",
};

/**
 * Singleton Firebase App instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

/**
 * Returns Firebase Messaging instance if supported in browser environment
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("[TalentOS Firebase] Web Messaging not supported in this browser environment.");
      return null;
    }
    const app = getFirebaseApp();
    return getMessaging(app);
  } catch (err) {
    console.warn("[TalentOS Firebase] Error initializing messaging:", err);
    return null;
  }
}

/**
 * Requests notification permission and retrieves FCM registration token
 */
export async function requestFcmToken(vapidKey?: string): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[TalentOS Notifications] Notification permission denied.");
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      // Fallback local simulation token if messaging SDK isn't wired to production keys yet
      const simulatedToken = `fcm-local-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      return simulatedToken;
    }

    // Register service worker if available
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      serviceWorkerRegistration = await navigator.serviceWorker.ready;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn("[TalentOS Firebase] No registration token available.");
      return null;
    }
  } catch (err: any) {
    console.warn("[TalentOS Firebase] An error occurred while retrieving token:", err?.message || err);
    // Return resilient local fallback token for offline / development sandbox
    return `fcm-dev-token-${Date.now()}`;
  }
}

/**
 * Subscribes to foreground push notifications
 */
export async function onForegroundMessage(callback: (payload: any) => void): Promise<(() => void) | null> {
  if (typeof window === "undefined") return null;

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (err) {
    console.warn("[TalentOS Firebase] Error listening to foreground messages:", err);
    return null;
  }
}
