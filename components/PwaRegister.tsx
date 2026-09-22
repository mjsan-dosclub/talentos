"use client";

import { useEffect, useState } from "react";
import { ArrowDownTrayIcon, XIcon, BellIcon } from "@/components/Icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Keep the install prompt hidden in QA/preview. Enable it explicitly in the
    // production deployment with NEXT_PUBLIC_ENABLE_PWA_INSTALL=true.
    const installPromptEnabled = process.env.NEXT_PUBLIC_ENABLE_PWA_INSTALL === "true" && process.env.NEXT_PUBLIC_APP_ENV === "production";
    // 1. Check if already running standalone PWA
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // 2. Register Service Worker for PWA & Offline
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              console.log("[TalentOS PWA] Service worker registered, scope:", reg.scope);
            })
            .catch((err) => {
              console.warn("[TalentOS PWA] SW registration failed:", err);
            });

          // Also register Firebase Messaging Service Worker
          navigator.serviceWorker
            .register("/firebase-messaging-sw.js")
            .then((fcmReg) => {
              console.log("[TalentOS FCM] Messaging SW registered, scope:", fcmReg.scope);
            })
            .catch((err) => {
              console.warn("[TalentOS FCM] Messaging SW notice:", err);
            });
        });
      }

      // 3. Listen for Add to Home Screen (A2HS) event
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Only show if user hasn't dismissed before in this session
        const dismissed = sessionStorage.getItem("talentos_pwa_dismissed");
        if (installPromptEnabled && !dismissed) {
          setShowInstallBanner(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setShowInstallBanner(false);
        setDeferredPrompt(null);
        console.log("[TalentOS PWA] App successfully installed.");
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("talentos_pwa_dismissed", "true");
    }
  };

  if (!showInstallBanner || isInstalled) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm w-full bg-white border border-[#E6E8EC] p-3.5 rounded-3xl shadow-xl animate-fade-in font-['Poppins',sans-serif] flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-[#FF592C]/10 text-[#FF592C] flex items-center justify-center shrink-0">
          <ArrowDownTrayIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs font-bold text-[#23262F] truncate">Install TalentOS App</h2>
          <p className="text-[10px] text-[#777E90] truncate">Offline check-in & Firebase push alerts</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          type="button"
          className="px-3.5 py-1.5 rounded-full bg-[#FF592C] hover:bg-[#f83500] text-white text-[11px] font-bold transition-colors shadow-xs"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          type="button"
          className="p-1 rounded-full text-[#777E90] hover:text-[#23262F] transition-colors"
          aria-label="Dismiss banner"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
