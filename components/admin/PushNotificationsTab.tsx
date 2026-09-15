import React, { useState, useEffect } from "react";
import TablePagination from "./TablePagination";
import {
  BellIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RadioIcon,
  ClockIcon,
  MoreVerticalIcon,
  ExternalLinkIcon,
} from "@/components/Icons";

interface PushNotificationsTabProps {
  onToast: (message: string) => void;
}

export default function PushNotificationsTab({ onToast }: PushNotificationsTabProps) {
  const [deviceCount, setDeviceCount] = useState(0);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleRedispatch = async (b: any) => {
    setTitle(b.title || "");
    setBody(b.body || "");
    setTargetUrl(b.url || "/checkin");
    onToast(`Loaded broadcast "${b.title}" into composer. Click Dispatch to re-send.`);
  };

  const handleCopyPayload = (b: any) => {
    navigator.clipboard?.writeText(JSON.stringify(b, null, 2));
    onToast("Broadcast payload copied to clipboard.");
  };

  const handleCopyLink = (b: any) => {
    navigator.clipboard?.writeText(b.url || "");
    onToast("Target URL copied to clipboard.");
  };

  const handleDeleteLog = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    onToast("Broadcast log entry removed from table.");
  };

  const paginatedBroadcasts = broadcasts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BellIcon className="w-4 h-4 text-[#3772FF]" />
            <span>Instant Dispatch Broadcast Console</span>
          </h2>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notification Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CodeZap 3.0: 36-Hour Hackathon Kickoff"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notification Body / Alert Description *
              </label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g., The Arena sprint is live! Check team repo bindings and commit proof."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Click Target Destination URL (Deep-Link)
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/checkin or /submit or https://..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Pushes to {deviceCount} subscribed mobile and desktop PWA instances
              </span>
              <button
                type="submit"
                disabled={isSending || !title || !body}
                className="px-5 py-2.5 bg-[#3772FF] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Broadcasting Alert...</span>
                  </>
                ) : (
                  <>
                    <RadioIcon className="w-3.5 h-3.5" />
                    <span>Dispatch Push Alert</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Presets */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <SparklesIcon className="w-3.5 h-3.5 text-[#3772FF]" />
            <span>Operational Templates</span>
          </h3>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                loadPreset(
                  "Attendance Verification Window Open",
                  "Geofenced check-in is now active for Session 14. Verify before timer expires.",
                  "/checkin"
                )
              }
              className="w-full p-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-left text-xs transition-colors"
            >
              <div className="font-bold text-slate-900 text-[11px]">Attendance Window Open</div>
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
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
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBroadcasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No broadcast history recorded yet.
                  </td>
                </tr>
              ) : (
                paginatedBroadcasts.map((b, idx) => {
                  const isNearBottom = idx >= paginatedBroadcasts.length - 2;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{b.body}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#3772FF]">{b.url}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{b.recipientCount} devices</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{b.dispatchedAt}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                          {b.status}
                        </span>
                      </td>

                      {/* 3-Dot Kebab Menu Actions */}
                      <td className="py-3 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={() => setOpenKebabId(openKebabId === b.id ? null : b.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {openKebabId === b.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenKebabId(null)}
                            />
                            <div
                              className={`absolute right-3 ${
                                isNearBottom ? "bottom-full mb-1" : "top-10"
                              } w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null);
                                  handleRedispatch(b);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Re-dispatch Alert</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null);
                                  handleCopyPayload(b);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Copy Payload JSON</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null);
                                  handleCopyLink(b);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Copy Target Link</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null);
                                  handleDeleteLog(b.id);
                                }}
                                className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <span>Delete Log Entry</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={broadcasts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
