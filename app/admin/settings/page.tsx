"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import {
  GlobeIcon,
  ColorPaletteIcon,
  SearchIcon,
  MailIcon,
  MessageSquareIcon,
  SendIcon,
  XIcon,
} from "@/components/Icons";
import { SystemConfig, DEFAULT_SYSTEM_CONFIG } from "@/lib/config";

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
  const [toast, setToast] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"general" | "branding" | "seo" | "email" | "messaging">("general");
  const [previewTime, setPreviewTime] = useState("");

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Email test & outbox state
  const [testRecipient, setTestRecipient] = useState("descienceosclub@gmail.com");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any>(null);
  const [outboxHistory, setOutboxHistory] = useState<any[]>([]);

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

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast("ERROR // Logo image exceeds 2MB limit");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setConfig((prev) => ({
          ...prev,
          branding: { ...prev.branding, logoUrl: dataUrl },
        }));

        // Persist upload
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "logo", dataUrl }),
        });

        setIsUploadingLogo(false);
        triggerToast("SUCCESS // Logo updated with live preview");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingLogo(false);
      triggerToast(`ERROR // Upload failed: ${err.message}`);
    }
  };

  // Favicon file upload handler
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "favicon", dataUrl }),
      });
      triggerToast("SUCCESS // Favicon updated");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        triggerToast("SUCCESS // All settings updated & synchronized across platform.");
      } else {
        const err = await res.json();
        triggerToast(`ERROR // ${err.error || "Failed to persist settings"}`);
      }
    } catch (err: any) {
      triggerToast(`ERROR // ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchOutboxHistory = async () => {
    try {
      const res = await fetch("/api/email/test");
      if (res.ok) {
        const data = await res.json();
        setOutboxHistory(data.recentEmails || []);
      }
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    if (activeCategory === "email") {
      fetchOutboxHistory();
    }
  }, [activeCategory]);

  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      triggerToast("ERROR // Please provide a valid test recipient email address.");
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: testRecipient }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult(data.dispatchResult);
        const ccStr = data.dispatchResult?.recipients?.cc?.length
          ? ` (CC: ${data.dispatchResult.recipients.cc.join(", ")})`
          : "";
        triggerToast(`SUCCESS // Test email dispatched via ${data.dispatchResult.provider}!${ccStr}`);
        fetchOutboxHistory();
      } else {
        triggerToast(`ERROR // ${data.error || "Failed to dispatch test email"}`);
      }
    } catch (err: any) {
      triggerToast(`ERROR // ${err.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // HubSpot-style settings sidebar items (media_1789356861243.png)
  const settingsMenu = [
    {
      group: "Account Defaults",
      items: [
        { id: "general", label: "General & Timezone", icon: <GlobeIcon className="w-4 h-4" /> },
        { id: "branding", label: "Branding, Logo & Favicon", icon: <ColorPaletteIcon className="w-4 h-4" /> },
        { id: "seo", label: "SEO & Social Metadata", icon: <SearchIcon className="w-4 h-4" /> },
      ],
    },
    {
      group: "Communications & Gateways",
      items: [
        { id: "email", label: "Email (SMTP Gateway)", icon: <MailIcon className="w-4 h-4" /> },
        { id: "messaging", label: "WhatsApp & Telegram", icon: <MessageSquareIcon className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <AppHeader />

      {/* Main Settings Body (HubSpot Reference Style) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Settings Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1.5"
            >
              <span>&larr;</span> Back to Admin
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-slate-900">Settings</h1>
            <p className="text-xs text-slate-400">System Preferences</p>
          </div>

          <div className="flex flex-col gap-5">
            {settingsMenu.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  {group.group}
                </span>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = activeCategory === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveCategory(item.id as any)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          isActive
                            ? "bg-slate-100 text-slate-900 font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-slate-400 shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Settings Form Container */}
        <main className="flex-1 p-6 sm:p-10 flex flex-col gap-6">
          {toast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-lg shadow-sm flex items-center justify-between">
              <span>{toast}</span>
              <button
                onClick={() => setToast(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                aria-label="Dismiss"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col gap-8">
            {/* ========================================================================= */}
            {/* TAB 1: GENERAL & TIMEZONE                                                 */}
            {/* ========================================================================= */}
            {activeCategory === "general" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Application Timezone & Clock</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All workshop check-ins, attendance receipts, and audit digests display in this active timezone.
                    </p>
                  </div>

                  {/* Live Clock Card */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 min-w-[220px]">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-emerald-800">
                      <span>Synchronized Clock:</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        <span>LIVE</span>
                      </span>
                    </div>
                    <div className="text-sm font-bold text-emerald-950 mt-1 font-mono">
                      {previewTime || "08:30:00 AM IST"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Application Timezone:</label>
                    <select
                      value={config.timezone}
                      onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                      className="border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-800"
                    >
                      {TIMEZONE_PRESETS.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Locale Format:</label>
                    <input
                      type="text"
                      value={config.locale}
                      onChange={(e) => setConfig({ ...config, locale: e.target.value })}
                      className="border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-800"
                      placeholder="en-IN"
                    />
                    <span className="text-[11px] text-slate-400">
                      e.g. en-IN (Indian English), en-SG (Singapore English)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: BRANDING, LOGO & FAVICON UPLOAD                                    */}
            {/* ========================================================================= */}
            {activeCategory === "branding" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Brand Identity, Logo & Favicon</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload official logos, favicons, and customize site typography and primary brand colors.
                  </p>
                </div>

                {/* Logo & Favicon Upload Cards (HubSpot Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Site Logo Upload Box */}
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Official Site Logo:</span>
                      <span className="text-[10px] text-slate-400">SVG, PNG, JPG (&lt; 2MB)</span>
                    </div>

                    <div className="h-24 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-4 relative group">
                      {config.branding.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={config.branding.logoUrl}
                          alt="Logo Preview"
                          className="h-16 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">No custom logo uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs transition-colors shadow-2xs"
                      >
                        {isUploadingLogo ? "Uploading..." : "Upload New Logo"}
                      </button>
                      {config.branding.logoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              branding: { ...config.branding, logoUrl: "" },
                            })
                          }
                          className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-md text-xs hover:bg-slate-50"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload Box */}
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Browser Favicon:</span>
                      <span className="text-[10px] text-slate-400">ICO, PNG (32x32)</span>
                    </div>

                    <div className="h-24 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-4">
                      <div className="flex items-center gap-2 p-2 border border-slate-200 rounded bg-slate-50">
                        <span className="h-4 w-4 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium text-slate-600">favicon.ico</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/x-icon,image/png"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-md text-xs transition-colors shadow-2xs"
                      >
                        Upload Favicon (.ico)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Brand Colors & Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Site Title:</label>
                    <input
                      type="text"
                      value={config.branding.siteTitle}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, siteTitle: e.target.value },
                        })
                      }
                      className="border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Tagline:</label>
                    <input
                      type="text"
                      value={config.branding.tagline}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, tagline: e.target.value },
                        })
                      }
                      className="border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Head / Accent Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.branding.headColor}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            branding: { ...config.branding, headColor: e.target.value },
                          })
                        }
                        className="h-10 w-12 border border-slate-300 rounded cursor-pointer p-0.5"
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
                        className="border border-slate-300 rounded-lg p-2.5 text-xs font-mono w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Font Family:</label>
                    <input
                      type="text"
                      value={config.branding.fontFamily}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, fontFamily: e.target.value },
                        })
                      }
                      className="border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: SEO & METADATA                                                     */}
            {/* ========================================================================= */}
            {activeCategory === "seo" && (
              <div className="flex flex-col gap-5 text-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">SEO & Social Previews</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure search engine metadata and social sharing OpenGraph previews.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700">Meta Title:</label>
                  <input
                    type="text"
                    value={config.seo.metaTitle}
                    onChange={(e) =>
                      setConfig({ ...config, seo: { ...config.seo, metaTitle: e.target.value } })
                    }
                    className="border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700">Meta Description:</label>
                  <textarea
                    rows={3}
                    value={config.seo.metaDescription}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, metaDescription: e.target.value },
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700">Keywords:</label>
                  <input
                    type="text"
                    value={config.seo.metaKeywords}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, metaKeywords: e.target.value },
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: EMAIL GATEWAY & GLOBAL CC                                          */}
            {/* ========================================================================= */}
            {activeCategory === "email" && (
              <div className="flex flex-col gap-6 text-xs">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Email Gateway & Outbound Services</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure email delivery (Resend API or SMTP), set platform-wide Global CC monitoring, and test live transmissions.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.email.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-[#3772FF] focus:ring-[#3772FF]"
                    />
                    Enable Outbound Email
                  </label>
                </div>

                {/* Email Provider Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Email Provider:</label>
                    <select
                      value={config.email.provider || "smtp"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, provider: e.target.value as any },
                        })
                      }
                      className="border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-800"
                    >
                      <option value="smtp">SMTP Relay (Brevo, Gmail App Password, SendGrid, Mailgun)</option>
                      <option value="resend">Resend REST API (Free 3,000 emails/mo via HTTP)</option>
                    </select>
                  </div>

                  {config.email.provider === "resend" ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-700">Resend API Key:</label>
                      <input
                        type="password"
                        placeholder="re_xxxxxxxxxxxxxx"
                        value={config.email.resendApiKey || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: { ...config.email, resendApiKey: e.target.value },
                          })
                        }
                        className="border border-slate-300 rounded-lg p-2.5 font-mono"
                      />
                      <span className="text-[10px] text-slate-400">
                        Get a free key with 3,000 monthly sends at resend.com
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-700">SMTP Host:</label>
                      <input
                        type="text"
                        value={config.email.smtpHost}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: { ...config.email, smtpHost: e.target.value },
                          })
                        }
                        className="border border-slate-300 rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  )}

                  {config.email.provider === "smtp" && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-slate-700">SMTP Port:</label>
                        <input
                          type="number"
                          value={config.email.smtpPort}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              email: { ...config.email, smtpPort: Number(e.target.value) },
                            })
                          }
                          className="border border-slate-300 rounded-lg p-2.5 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-slate-700">SMTP Username / API User:</label>
                        <input
                          type="text"
                          value={config.email.smtpUser}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              email: { ...config.email, smtpUser: e.target.value },
                            })
                          }
                          className="border border-slate-300 rounded-lg p-2.5 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-slate-700">SMTP Password / App Key:</label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={config.email.smtpPass || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              email: { ...config.email, smtpPass: e.target.value },
                            })
                          }
                          className="border border-slate-300 rounded-lg p-2.5 font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Sender Address (From):</label>
                    <input
                      type="email"
                      value={config.email.fromAddress}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, fromAddress: e.target.value },
                        })
                      }
                      className="border border-slate-300 rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700">Sender Display Name:</label>
                    <input
                      type="text"
                      value={config.email.fromName}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, fromName: e.target.value },
                        })
                      }
                      className="border border-slate-300 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* GLOBAL EMAIL CC COPY SETTINGS                                             */}
                {/* ========================================================================= */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="font-bold text-slate-900 flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-blue-600" />
                      <span>Global Email CC Copy (Comma-separated)</span>
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                      Applied to All Dispatches
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Any email dispatched anywhere from the platform &mdash; candidate admissions auto-confirmations, admin alerts, post-workshop executive summaries sent to college POCs, zero-grace attendance sanctions, and mentor briefs &mdash; will automatically carbon-copy these email addresses.
                  </p>

                  <input
                    type="text"
                    value={config.email.globalCc || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: { ...config.email, globalCc: e.target.value },
                      })
                    }
                    placeholder="e.g. descienceosclub@gmail.com, admissions@dosclub.org"
                    className="border border-blue-300 rounded-lg p-2.5 font-mono text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">
                    Separate multiple emails with commas. Leave blank to disable global CC copying.
                  </span>
                </div>

                {/* ========================================================================= */}
                {/* LIVE TEST EMAIL VERIFICATION                                              */}
                {/* ========================================================================= */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">Verify Outbound Email & Global CC</h3>
                      <p className="text-[11px] text-slate-500">
                        Dispatch a live test email to verify your SMTP / Resend connection and confirm that Global CC addresses receive a carbon copy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder="Enter recipient email (e.g. your email address)"
                      className="border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900 flex-1 min-w-[240px] focus:outline-none focus:border-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      disabled={isSendingTestEmail}
                      onClick={handleSendTestEmail}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <SendIcon className="w-3.5 h-3.5" />
                      <span>{isSendingTestEmail ? "Dispatching..." : "Send Test Email"}</span>
                    </button>
                  </div>

                  {testEmailResult && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[11px] text-emerald-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Test Email Dispatched Successfully via {testEmailResult.provider.toUpperCase()}</span>
                      </div>
                      <div className="font-mono text-[10px] text-emerald-800">
                        To: {testEmailResult.recipients.to.join(", ")}<br/>
                        Global CC: {testEmailResult.recipients.cc.length > 0 ? testEmailResult.recipients.cc.join(", ") : "(None)"}<br/>
                        Message ID: {testEmailResult.messageId}
                      </div>
                      {testEmailResult.note && (
                        <div className="text-slate-600 text-[10px] mt-1 italic">{testEmailResult.note}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* ========================================================================= */}
                {/* OUTBOX AUDIT LEDGER (LAST DISPATCHED EMAILS)                              */}
                {/* ========================================================================= */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Recent Outbound Email Dispatches (Audit Ledger)</span>
                    <button
                      type="button"
                      onClick={fetchOutboxHistory}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Refresh Ledger
                    </button>
                  </div>

                  {outboxHistory.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No emails dispatched in this session yet. Submit an enquiry or send a test email to view live audit records.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {outboxHistory.map((item) => (
                        <div key={item.id} className="p-3 text-xs flex flex-col gap-1 hover:bg-slate-50">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{item.subject}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                                {item.provider.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(item.timestamp).toLocaleTimeString("en-IN")}
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            To: <span className="text-slate-900">{item.to.join(", ")}</span>
                            {item.cc && item.cc.length > 0 && (
                              <> &bull; CC: <span className="text-blue-600">{item.cc.join(", ")}</span></>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.textSnippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: WHATSAPP & TELEGRAM                                                */}
            {/* ========================================================================= */}
            {activeCategory === "messaging" && (
              <div className="flex flex-col gap-6 text-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">WhatsApp & Telegram Gateways</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct automated mobile attendance alerts and technical workshop reminders.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 bg-slate-50/50">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquareIcon className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Business API</span>
                    </span>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Sender Phone Number:</label>
                      <input
                        type="text"
                        value={config.whatsapp.senderPhone}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            whatsapp: { ...config.whatsapp, senderPhone: e.target.value },
                          })
                        }
                        className="border border-slate-300 rounded p-2 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 bg-slate-50/50">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <SendIcon className="w-4 h-4 text-sky-600" />
                      <span>Telegram Broadcast Bot</span>
                    </span>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Alerts Channel / Chat:</label>
                      <input
                        type="text"
                        value={config.telegram.alertsChannel}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            telegram: { ...config.telegram, alertsChannel: e.target.value },
                          })
                        }
                        className="border border-slate-300 rounded p-2 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Changes apply instantly across all institutions and sessions.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 font-medium">
        DESCIENCE OPEN SOURCE CLUB • TALENT_OS V1.2 • DYNAMIC ENTERPRISE CONFIGURATION
      </footer>
    </div>
  );
}
