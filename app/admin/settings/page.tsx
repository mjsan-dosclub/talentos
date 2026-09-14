"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SessionBar from "@/components/SessionBar";
import { SystemConfig, DEFAULT_SYSTEM_CONFIG } from "@/lib/config";
import { formatConfigTime, formatConfigDateTime } from "@/lib/datetime";

const TIMEZONE_PRESETS = [
  { label: "Asia/Kolkata (India Standard Time • IST, UTC+5:30)", value: "Asia/Kolkata" },
  { label: "Asia/Singapore (Singapore Time • SGT, UTC+8:00)", value: "Asia/Singapore" },
  { label: "UTC (Coordinated Universal Time • UTC+0:00)", value: "UTC" },
  { label: "Europe/London (Greenwich Mean Time • GMT/BST)", value: "Europe/London" },
  { label: "America/New_York (Eastern Time • EST/EDT, UTC-5:00)", value: "America/New_York" },
  { label: "America/Los_Angeles (Pacific Time • PST/PDT, UTC-8:00)", value: "America/Los_Angeles" },
];

export default function SystemSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "seo" | "comms">("general");
  const [previewTime, setPreviewTime] = useState("");

  // Load configuration from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch settings, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Update live preview clock in configured timezone
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const str = new Intl.DateTimeFormat("en-IN", {
          timeZone: config.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZoneName: "short",
        }).format(new Date());
        setPreviewTime(str);
      } catch {
        setPreviewTime(new Date().toLocaleTimeString());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [config.timezone]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setNotification("SUCCESS // System settings updated and applied across all modules.");
        setTimeout(() => setNotification(null), 4000);
      } else {
        const err = await res.json();
        setNotification(`ERROR // ${err.error || "Failed to persist settings"}`);
      }
    } catch (err: any) {
      setNotification(`ERROR // ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <span className="text-neutral-400">&larr;</span>
              <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="tracking-wider uppercase font-medium">TALENT_OS // SYSTEM CONFIG</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="font-mono text-xs text-neutral-500 hover:text-neutral-900"
            >
              Admin Dashboard
            </Link>
            <SessionBar />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] text-neutral-700 tracking-wider uppercase font-semibold mb-2">
              DYNAMIC ARCHITECTURE • GLOBAL ENGINE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
              System Configuration & Environment
            </h1>
            <p className="font-mono text-xs text-neutral-500 mt-1">
              Configure universal application timezone, branding, typography, SEO metadata, and communication dispatch channels.
            </p>
          </div>

          {/* Live Timezone Clock Widget */}
          <div className="border border-emerald-300 bg-emerald-50/80 p-3 rounded font-mono text-xs flex flex-col gap-1 min-w-[240px]">
            <div className="flex justify-between text-[10px] text-emerald-800 uppercase font-semibold">
              <span>ACTIVE APPLICATION TIME:</span>
              <span className="animate-pulse">● LIVE</span>
            </div>
            <div className="text-sm font-bold text-emerald-950">
              {previewTime || "CALCULATING..."}
            </div>
            <div className="text-[10px] text-emerald-700">
              ZONE: {config.timezone}
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`p-3 font-mono text-xs border tracking-wide ${
              notification.startsWith("SUCCESS")
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-900"
            }`}
          >
            {notification}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 font-mono text-xs gap-2">
          {[
            { id: "general", label: "01. Timezone & Locale" },
            { id: "branding", label: "02. Branding & Styling" },
            { id: "seo", label: "03. SEO & Metadata" },
            { id: "comms", label: "04. Email, WhatsApp, Telegram" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 border-b-2 font-medium tracking-wide transition-colors ${
                activeTab === t.id
                  ? "border-neutral-900 text-neutral-950 font-bold bg-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="flex flex-col gap-8 bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
          {/* TAB 1: GENERAL & TIMEZONE */}
          {activeTab === "general" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-neutral-900">Application Timezone & Clock Synchronization</h2>
                <p className="font-mono text-xs text-neutral-500">
                  All check-ins, audit logs, rotating tokens, and session receipts reflect this timezone across all client devices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Standard Timezone:
                  </label>
                  <select
                    value={config.timezone}
                    onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                    className="border border-neutral-300 p-2.5 font-mono text-xs bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    {TIMEZONE_PRESETS.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Locale Identifier:
                  </label>
                  <input
                    type="text"
                    value={config.locale}
                    onChange={(e) => setConfig({ ...config, locale: e.target.value })}
                    placeholder="en-IN"
                    className="border border-neutral-300 p-2.5 font-mono text-xs bg-white focus:outline-none focus:border-neutral-900"
                  />
                  <span className="font-mono text-[10px] text-neutral-400">
                    E.g. en-IN for Indian English, en-SG for Singapore, en-US for US
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & STYLING */}
          {activeTab === "branding" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-neutral-900">Brand Identity & Visual Tokens</h2>
                <p className="font-mono text-xs text-neutral-500">
                  Customize site header identity, color palette, logo paths, and typography tokens.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Site Title:
                  </label>
                  <input
                    type="text"
                    value={config.branding.siteTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, siteTitle: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-sans text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Tagline:
                  </label>
                  <input
                    type="text"
                    value={config.branding.tagline}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, tagline: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-sans text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Organization Name:
                  </label>
                  <input
                    type="text"
                    value={config.branding.organizationName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, organizationName: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-sans text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Brand Head Color:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.branding.headColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, headColor: e.target.value },
                        })
                      }
                      className="h-9 w-12 border border-neutral-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.branding.headColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, headColor: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Font Family (Sans):
                  </label>
                  <input
                    type="text"
                    value={config.branding.fontFamily}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, fontFamily: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Monospace Font Family:
                  </label>
                  <input
                    type="text"
                    value={config.branding.monoFontFamily}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, monoFontFamily: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO & METADATA */}
          {activeTab === "seo" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-neutral-900">SEO & Social Meta Configuration</h2>
                <p className="font-mono text-xs text-neutral-500">
                  Global search engine optimization and Open Graph social preview settings.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Meta Title:
                  </label>
                  <input
                    type="text"
                    value={config.seo.metaTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, metaTitle: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-sans text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                    Meta Description:
                  </label>
                  <textarea
                    rows={3}
                    value={config.seo.metaDescription}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, metaDescription: e.target.value },
                      })
                    }
                    className="border border-neutral-300 p-2.5 font-sans text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                      Keywords (Comma Separated):
                    </label>
                    <input
                      type="text"
                      value={config.seo.metaKeywords}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          seo: { ...config.seo, metaKeywords: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2.5 font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs uppercase font-medium text-neutral-700">
                      Canonical App URL:
                    </label>
                    <input
                      type="text"
                      value={config.seo.canonicalUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          seo: { ...config.seo, canonicalUrl: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2.5 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMMS (EMAIL, WHATSAPP, TELEGRAM) */}
          {activeTab === "comms" && (
            <div className="flex flex-col gap-8">
              {/* Email Gateway */}
              <div className="flex flex-col gap-3 p-4 border border-neutral-200 bg-neutral-50/60 rounded">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <div className="font-mono text-xs uppercase font-bold text-neutral-900 flex items-center gap-2">
                    <span>📧 SMTP Email Gateway</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {config.email.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.email.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, enabled: e.target.checked },
                        })
                      }
                      className="rounded"
                    />
                    Enable Email Notices
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">SMTP Host:</label>
                    <input
                      type="text"
                      value={config.email.smtpHost}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, smtpHost: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">SMTP Port:</label>
                    <input
                      type="number"
                      value={config.email.smtpPort}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, smtpPort: Number(e.target.value) },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">Sender Address:</label>
                    <input
                      type="email"
                      value={config.email.fromAddress}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, fromAddress: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Gateway */}
              <div className="flex flex-col gap-3 p-4 border border-neutral-200 bg-neutral-50/60 rounded">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <div className="font-mono text-xs uppercase font-bold text-neutral-900 flex items-center gap-2">
                    <span>💬 WhatsApp Gateway (Meta Cloud API)</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {config.whatsapp.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.whatsapp.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, enabled: e.target.checked },
                        })
                      }
                      className="rounded"
                    />
                    Enable WhatsApp Dispatch
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">Sender Phone Number:</label>
                    <input
                      type="text"
                      value={config.whatsapp.senderPhone}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, senderPhone: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">Account SID / Business ID:</label>
                    <input
                      type="text"
                      value={config.whatsapp.accountSid}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, accountSid: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Telegram Gateway */}
              <div className="flex flex-col gap-3 p-4 border border-neutral-200 bg-neutral-50/60 rounded">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <div className="font-mono text-xs uppercase font-bold text-neutral-900 flex items-center gap-2">
                    <span>✈️ Telegram Bot Gateway</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {config.telegram.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.telegram.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          telegram: { ...config.telegram, enabled: e.target.checked },
                        })
                      }
                      className="rounded"
                    />
                    Enable Telegram Broadcasts
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">Bot Token:</label>
                    <input
                      type="text"
                      value={config.telegram.botToken}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          telegram: { ...config.telegram, botToken: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-neutral-600 uppercase">Broadcast Channel:</label>
                    <input
                      type="text"
                      value={config.telegram.alertsChannel}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          telegram: { ...config.telegram, alertsChannel: e.target.value },
                        })
                      }
                      className="border border-neutral-300 p-2 font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <span className="font-mono text-[11px] text-neutral-500">
              Changes apply instantly to live sessions and database journals.
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-neutral-900 text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-2xs"
            >
              {isSaving ? "SAVING CONFIGURATION..." : "SAVE ALL CONFIGURATIONS"}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
