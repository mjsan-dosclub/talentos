"use client";

import { useEffect, useState } from "react";
import { BellIcon, CheckCircleIcon, XIcon, SparklesIcon } from "@/components/Icons";
import { requestFcmToken, onForegroundMessage } from "@/lib/firebase";

export default function FcmNotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);

      // Check if previously registered token exists in local storage
      const savedToken = localStorage.getItem("talentos_fcm_token");
      if (savedToken) {
        setToken(savedToken);
      }

      // Check if banner was dismissed in this session
      const isDismissed = sessionStorage.getItem("talentos_fcm_dismissed");
      if (isDismissed) {
        setDismissed(true);
      }

      // Listen for foreground push messages
      let unsubscribe: (() => void) | null = null;
      onForegroundMessage((payload) => {
        const title = payload.notification?.title || payload.data?.title || "TalentOS Live Update";
        const body = payload.notification?.body || payload.data?.body || "New update received";
        setActiveToast({ title, body });

        // Auto dismiss toast after 6s
        setTimeout(() => {
          setActiveToast(null);
        }, 6000);
      }).then((unsub) => {
        unsubscribe = unsub;
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const fcmToken = await requestFcmToken();
      if (fcmToken) {
        setToken(fcmToken);
        setPermission("granted");
        localStorage.setItem("talentos_fcm_token", fcmToken);

        // Register token with backend
        await fetch("/api/notifications/fcm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            token: fcmToken,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });

        setActiveToast({
          title: "Push Alerts Activated",
          body: "You will now receive zero-grace attendance and session updates.",
        });
        setDismissed(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("talentos_fcm_dismissed", "true");
        }
        setTimeout(() => setActiveToast(null), 5000);
      } else {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied") {
          setPermission("denied");
        }
      }
    } catch (err) {
      console.warn("[TalentOS Notifications] Enable error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissBanner = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("talentos_fcm_dismissed", "true");
    }
  };

  return (
    <>
      {/* 1. Live Foreground Notification Toast */}
      {activeToast && (
        <aside
          aria-label="Notification Alert"
          className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white border-2 border-[#3772FF] rounded-2xl shadow-2xl p-4 animate-fade-in font-['Poppins',sans-serif]"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3772FF]/10 text-[#3772FF] flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3772FF]">
                  TalentOS Push Alert
                </span>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="text-[#777E90] hover:text-[#23262F] p-0.5"
                  aria-label="Close alert"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <h2 className="text-xs font-bold text-[#23262F] mt-0.5">{activeToast.title}</h2>
              <p className="text-[11px] text-[#777E90] mt-0.5 leading-relaxed">{activeToast.body}</p>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Floating Opt-in Banner (Only when not granted and not dismissed) */}
      {permission !== "granted" && !dismissed && (
        <aside
          aria-label="Notification Settings"
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-sm w-full bg-white border border-[#E6E8EC] p-3.5 rounded-3xl shadow-xl animate-fade-in font-['Poppins',sans-serif] flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#3772FF]/10 text-[#3772FF] flex items-center justify-center shrink-0">
              <BellIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[#23262F] truncate">Enable Push Alerts</h2>
              <p className="text-[10px] text-[#777E90] truncate">Get live check-in & hackathon alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              type="button"
              className="px-3.5 py-1.5 rounded-full bg-[#3772FF] hover:bg-[#2e62e0] text-white text-[11px] font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading ? "Enabling..." : "Allow"}
            </button>
            <button
              onClick={handleDismissBanner}
              type="button"
              className="p-1 rounded-full text-[#777E90] hover:text-[#23262F] transition-colors"
              aria-label="Dismiss banner"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
