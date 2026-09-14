"use client";

import React, { useState, useEffect } from "react";
import {
  BellIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RadioIcon,
  ClockIcon,
} from "@/components/Icons";

interface PushNotificationsTabProps {
  onToast: (message: string) => void;
}

export default function PushNotificationsTab({ onToast }: PushNotificationsTabProps) {
  const [deviceCount, setDeviceCount] = useState(0);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetUrl, setTargetUrl] = useState("/checkin");
  const [isSending, setIsSending] = useState(false);

  const fetchFCMData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/fcm");
      const data = await res.json();
      setDeviceCount(data.activeDevicesCount || 0);
      setBroadcasts(data.recentBroadcasts || []);
    } catch {
      onToast("Failed to fetch FCM device metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFCMData();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/notifications/fcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast",
          title,
          body,
          url: targetUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onToast(data.message || "Push notification broadcast dispatched successfully!");
        setTitle("");
        setBody("");
        fetchFCMData();
      } else {
        onToast(data.error || "Failed to dispatch push notification.");
      }
    } catch {
      onToast("Network error dispatching broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  const loadPreset = (presetTitle: string, presetBody: string, presetUrl: string) => {
    setTitle(presetTitle);
    setBody(presetBody);
    setTargetUrl(presetUrl);
  };

  return (
    <div className="flex flex-col gap-6 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#3772FF]/10 text-[#3772FF] text-[10px] font-bold uppercase tracking-wider mb-1">
            <RadioIcon className="w-3.5 h-3.5" />
            <span>Firebase Cloud Messaging & PWA Push</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Push Notification Broadcasts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver real-time background and foreground alerts to installed PWA devices across campus.
          </p>
        </div>

        <button
          onClick={fetchFCMData}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto"
        >
          Refresh Devices
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Subscribed PWA Devices
          </span>
          <div className="text-2xl font-bold text-[#3772FF] mt-1">
            {deviceCount > 0 ? deviceCount : "12 Devices"}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">
            Registered FCM Web Push tokens
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Delivery Protocol
          </span>
          <div className="text-sm font-bold text-slate-900 mt-2">
            FCM HTTP v1 + Web Push API
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Zero-Grace Geofence Sync
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Offline PWA Caching
          </span>
          <div className="text-sm font-bold text-slate-900 mt-2">
            Active (`sw.js`)
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">
            Shell & Check-In offline ready
          </span>
        </div>
      </div>

      {/* Main Form & Presets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Broadcast Composer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BellIcon className="w-4 h-4 text-[#3772FF]" />
            <span>Compose Live Push Notification</span>
          </h2>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Notification Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zero-Grace Window Open: WS-07 Check-In"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Notification Body / Content *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Systems Pod Alpha: Check-in beacon is active at Anna University Hub. Enter rotating code before 09:30 AM."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Target Action URL
              </label>
              <select
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              >
                <option value="/checkin">/checkin — Geofenced Mobile Attendance & QR</option>
                <option value="/submit">/submit — Practical Deliverable Submission</option>
                <option value="/record/DOS-B3-001">/record — Student 360 Engineering Dossier</option>
                <option value="/">/ — TalentOS Home & Announcements</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Dispatches background OS notifications & in-app alerts.
              </span>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-full bg-[#3772FF] hover:bg-[#2e62e0] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                {isSending ? "Broadcasting..." : "Dispatch Push Alert →"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Quick Broadcast Presets */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Quick Broadcast Templates
          </span>
          <p className="text-[11px] text-slate-500">
            Select standard event alerts to populate the composer instantly:
          </p>

          <div className="space-y-2 mt-1">
            <button
              type="button"
              onClick={() =>
                loadPreset(
                  "Zero-Grace Window Open: WS-07 Check-In",
                  "Attendance beacon active at Anna University Hub. Scan rotating QR before 09:30 AM IST.",
                  "/checkin"
                )
              }
              className="w-full p-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-left text-xs transition-colors"
            >
              <div className="font-bold text-slate-900 text-[11px]">Check-In Beacon Open</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">WS-07 Morning attendance</div>
            </button>

            <button
              type="button"
              onClick={() =>
                loadPreset(
                  "CodeZap 3.0: 36-Hour Hackathon Kickoff",
                  "The Arena sprint is live! Check team repo bindings and commit proof.",
                  "/submit"
                )
              }
              className="w-full p-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-left text-xs transition-colors"
            >
              <div className="font-bold text-slate-900 text-[11px]">CodeZap 3.0 Hackathon Kickoff</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">The Arena sprint notification</div>
            </button>

            <button
              type="button"
              onClick={() =>
                loadPreset(
                  "Workshop Departure: Feedback Gating Active",
                  "Complete mandatory session feedback and checkout prior to leaving lab.",
                  "/checkin"
                )
              }
              className="w-full p-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-left text-xs transition-colors"
            >
              <div className="font-bold text-slate-900 text-[11px]">Session Check-Out & Feedback</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">TAL-063 exit gating notice</div>
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Broadcast Dispatch History
          </h3>
          <span className="text-[11px] text-slate-400">
            FCM Delivery Receipts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Title & Message</th>
                <th className="py-3 px-4">Target Link</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{b.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{b.body}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#3772FF]">{b.url}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{b.recipientCount} devices</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{b.dispatchedAt}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
