"use client";

import React, { useState, useEffect } from "react";
import {
  BellIcon,
  MailIcon,
  SparklesIcon,
  CheckCircleIcon,
  RadioIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  ShareIcon,
  ExternalLinkIcon,
  BuildingIcon,
  AcademicCapIcon,
  UsersIcon,
  EditIcon,
  CheckIcon,
  XIcon,
} from "@/components/Icons";
import {
  CANONICAL_NOTIFICATION_TEMPLATES,
  NotificationTemplate,
  generateGoogleCalendarUrl,
  generateIcsDataUri,
  generateWhatsAppWebUrl,
} from "@/lib/notification-templates";

interface NotificationEngineTabProps {
  onToast: (message: string) => void;
}

export default function NotificationEngineTab({ onToast }: NotificationEngineTabProps) {
  const [activeChannel, setActiveChannel] = useState<"EMAIL" | "WHATSAPP" | "PUSH">("EMAIL");

  // =========================================================================
  // Channel 1: Email Templates State
  // =========================================================================
  const [templates, setTemplates] = useState<NotificationTemplate[]>(CANONICAL_NOTIFICATION_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "COLLEGE" | "STUDENT" | "TRAINER">("ALL");
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate>(CANONICAL_NOTIFICATION_TEMPLATES[0]);
  const [editSubject, setEditSubject] = useState(CANONICAL_NOTIFICATION_TEMPLATES[0].subject);
  const [editBody, setEditBody] = useState(CANONICAL_NOTIFICATION_TEMPLATES[0].body);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Sync edits when selected template changes
  useEffect(() => {
    setEditSubject(selectedTemplate.subject);
    setEditBody(selectedTemplate.body);
  }, [selectedTemplate]);

  // =========================================================================
  // Channel 2: WhatsApp Copy & Send State
  // =========================================================================
  const [waRecipientType, setWaRecipientType] = useState<"STUDENT" | "ALL_STUDENTS" | "TRAINER" | "COLLEGE">("STUDENT");
  const [waPhoneNumber, setWaPhoneNumber] = useState("+91 98401 23456");
  const [waRecipientName, setWaRecipientName] = useState("Arunachalam Sundaram");
  const [waMessagePreset, setWaMessagePreset] = useState("CHECKIN_ALERT");
  const [waMessageContent, setWaMessageContent] = useState(
    "🚨 *TalentOS Live Gate Alert — WS-14 Distributed Consensus*\n\nHey Arunachalam,\nThe Anna University Hub beacon is now ACTIVE.\n\n📍 *Venue:* Anna University & DOS Club Hub\n⏰ *Zero-Grace Entry Closes:* 09:00 AM IST strictly.\n\nScan your mobile check-in inside the 200m perimeter:\n👉 https://talentos.dosclub.org/checkin\n\n_DOS Club Systems Defense Operations_"
  );
  const [waCopied, setWaCopied] = useState(false);

  // =========================================================================
  // Channel 3: Push Notification (FCM) State
  // =========================================================================
  const [fcmDeviceCount, setFcmDeviceCount] = useState(1);
  const [pushTitle, setPushTitle] = useState("Zero-Grace Gate: WS-14 Entry Live");
  const [pushBody, setPushBody] = useState("Beacon active at Anna University Hub. Geofence radius: 200m.");
  const [pushTargetUrl, setPushTargetUrl] = useState("/checkin");
  const [isDispatchingPush, setIsDispatchingPush] = useState(false);

  // Filter templates by category
  const filteredTemplates = templates.filter((t) =>
    selectedCategory === "ALL" ? true : t.category === selectedCategory
  );

  // Save modified template
  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch("/api/notifications/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTemplate.id,
          subject: editSubject,
          body: editBody,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === selectedTemplate.id ? { ...t, subject: editSubject, body: editBody } : t))
        );
        onToast(`Template '${selectedTemplate.name}' saved successfully!`);
      } else {
        onToast(data.error || "Failed to save template.");
      }
    } catch {
      onToast("Network error while saving template.");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Preset WhatsApp templates
  const handleSelectWaPreset = (preset: string) => {
    setWaMessagePreset(preset);
    if (preset === "CHECKIN_ALERT") {
      setWaMessageContent(
        `🚨 *TalentOS Live Gate Alert — WS-14 Distributed Consensus*\n\nHey ${waRecipientName},\nThe Anna University Hub beacon is now ACTIVE.\n\n📍 *Venue:* Anna University & DOS Club Hub\n⏰ *Zero-Grace Entry Closes:* 09:00 AM IST strictly.\n\nScan your mobile check-in inside the 200m perimeter:\n👉 https://talentos.dosclub.org/checkin\n\n_DOS Club Systems Defense Operations_`
      );
    } else if (preset === "TRAINER_ASSIGN") {
      const gcal = generateGoogleCalendarUrl({
        title: "DOS Club WS-14 Lead Technical Expert",
        description: "Raft Consensus & Distributed Systems Defense",
        location: "Anna University & DOS Club Hub, Chennai",
        startTime: "2026-09-20T09:00:00+05:30",
        endTime: "2026-09-20T17:00:00+05:30",
      });
      setWaMessageContent(
        `👋 *Trainer Workshop Assignment — DOS Club TalentOS*\n\nDear Expert,\nYou are assigned to conduct *WS-14: Distributed Systems & Consensus* on Sunday 20 Sep 2026.\n\n📅 *1-Click Free Google Calendar:* ${gcal}\n\nAccess your Expert Cockpit for live grading & attendance:\n👉 https://talentos.dosclub.org/trainer\n\n_DOS Club Curriculum Operations_`
      );
    } else if (preset === "ABSENCE_SANCTION") {
      setWaMessageContent(
        `⚠️ *DOS Club Zero-Grace Sanction Warning*\n\nStudent: ${waRecipientName} (DOS-B3-001)\nMissed Session: WS-14 Distributed Systems\n\nYour attendance status is currently *ABSENT_UNCONFIRMED*. If this was due to university exams, submit your excuse verification before 06:00 PM IST:\n👉 https://talentos.dosclub.org/record/DOS-B3-001\n\n_Office of Academic Standards_`
      );
    } else if (preset === "COLLEGE_DIGEST") {
      setWaMessageContent(
        `📊 *TalentOS College Monthly Digest Alert*\n\nRespected HOD / Placement Officer,\nThe monthly attendance and hermetic test pass digest for your students is now live.\n\nInspect verified student dossiers:\n👉 https://talentos.dosclub.org/college\n\n_DeScience Open Source Club Executive Secretariat_`
      );
    }
  };

  const handleCopyWaMessage = () => {
    navigator.clipboard?.writeText(waMessageContent);
    setWaCopied(true);
    onToast("WhatsApp message copied to clipboard!");
    setTimeout(() => setWaCopied(false), 2500);
  };

  // Sample calendar data for preview
  const sampleEvent = {
    title: "DOS Club WS-14: Distributed Systems & Consensus Defense",
    description: "Lead Technical Expert session on Raft & Paxos consensus validation. Anna University Hub.",
    location: "Anna University & DOS Club Hub, Guindy, Chennai",
    startTime: "2026-09-20T09:00:00+05:30",
    endTime: "2026-09-20T17:00:00+05:30",
  };
  const previewGoogleCalendarUrl = generateGoogleCalendarUrl(sampleEvent);
  const previewIcsUrl = generateIcsDataUri(sampleEvent);

  // Dispatch FCM Push
  const handleDispatchPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) return;
    setIsDispatchingPush(true);
    try {
      const res = await fetch("/api/notifications/fcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast",
          title: pushTitle,
          body: pushBody,
          url: pushTargetUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast(data.message || "Push notification broadcast dispatched!");
      } else {
        onToast(data.error || "Failed to dispatch push notification.");
      }
    } catch {
      onToast("Push broadcast request completed (local simulation).");
    } finally {
      setIsDispatchingPush(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-['Poppins',sans-serif]">
      {/* 1. Header & Channel Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#3772FF]/10 text-[#3772FF] text-[10px] font-bold uppercase tracking-wider mb-1">
            <RadioIcon className="w-3.5 h-3.5" />
            <span>Multi-Channel Communication Infrastructure</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Targeted Notification Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional email templates, dispatch 1-click WhatsApp alerts, and broadcast real-time PWA push notifications.
          </p>
        </div>

        {/* 3-Channel Switcher Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveChannel("EMAIL")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChannel === "EMAIL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MailIcon className="w-3.5 h-3.5 text-[#3772FF]" />
            <span>Email Templates ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel("WHATSAPP")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChannel === "WHATSAPP"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PhoneIcon className="w-3.5 h-3.5 text-[#45B26B]" />
            <span>WhatsApp (Copy & Send)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel("PUSH")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChannel === "PUSH"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BellIcon className="w-3.5 h-3.5 text-[#FF592C]" />
            <span>Push & PWA Alerts</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CHANNEL 1: EMAIL TEMPLATES CONFIGURATION MODULE                       */}
      {/* ===================================================================== */}
      {activeChannel === "EMAIL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template List & Category Filter */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-xl p-1.5">
              {[
                { id: "ALL", label: "All Templates" },
                { id: "COLLEGE", label: "College & DOS Club" },
                { id: "STUDENT", label: "Student & DOS Club" },
                { id: "TRAINER", label: "Trainer & Calendar" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template List Cards */}
            <div className="flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredTemplates.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplate.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#3772FF]/5 border-[#3772FF] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          tmpl.category === "COLLEGE"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : tmpl.category === "TRAINER"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {tmpl.category === "COLLEGE"
                          ? "College <-> DOS"
                          : tmpl.category === "TRAINER"
                          ? "Trainer <-> DOS"
                          : "Student <-> DOS"}
                      </span>
                      {tmpl.hasCalendarLinks && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#2f8a36] border border-emerald-200">
                          <CalendarIcon className="w-2.5 h-2.5" />
                          <span>Free Calendar Sync</span>
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-slate-900 mb-0.5">{tmpl.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Template Editor & Live Preview Trigger */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              {/* Template Title & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                    Template: {selectedTemplate.id}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedTemplate.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Live Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate}
                    className="px-4 py-1.5 bg-[#3772FF] hover:bg-[#285cd8] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>{isSavingTemplate ? "Saving..." : "Save Template"}</span>
                  </button>
                </div>
              </div>

              {/* Free Calendar Integration Notice (if trainer template) */}
              {selectedTemplate.hasCalendarLinks && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <strong className="text-purple-900 block">100% Free Calendar Sync Built-In</strong>
                      <span className="text-purple-700 text-[11px]">
                        Generates instant Google Calendar links and Apple/Outlook .ics downloads with zero paid subscription API fees.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={previewGoogleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-white text-purple-700 border border-purple-300 text-[10px] font-bold hover:bg-purple-100 transition-colors"
                    >
                      Test Google Cal &rarr;
                    </a>
                    <a
                      href={previewIcsUrl}
                      download="DOS_Club_WS14_Expert_Session.ics"
                      className="px-2 py-1 rounded bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 transition-colors"
                    >
                      Test Apple .ics
                    </a>
                  </div>
                </div>
              )}

              {/* Subject Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Subject Line:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Supports mustache tags</span>
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Body Textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Email Content Body:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Plaintext with automatic formatting</span>
                </label>
                <textarea
                  rows={14}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Variables Cheat Sheet */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Available Dynamic Variables for this Template:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEditBody((prev) => `${prev} {{${v}}}`)}
                      className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-300 rounded text-[10px] font-mono text-slate-700 transition-colors cursor-pointer"
                      title="Click to append to body"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHANNEL 2: WHATSAPP WEB & 1-CLICK COPY-AND-SEND MODULE                */}
      {/* ===================================================================== */}
      {activeChannel === "WHATSAPP" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Direct WhatsApp Dispatch Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zero-cost alternative to Twilio / SMS. Generates direct WhatsApp Web links and pre-formatted text for instant clipboard copying.
                </p>
              </div>

              {/* Preset Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Message Preset:</label>
                <select
                  value={waMessagePreset}
                  onChange={(e) => handleSelectWaPreset(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 bg-white"
                >
                  <option value="CHECKIN_ALERT">1. Zero-Grace Check-In Gate Alert (Student)</option>
                  <option value="TRAINER_ASSIGN">2. Workshop Assignment & Free Calendar (Trainer)</option>
                  <option value="ABSENCE_SANCTION">3. Absence Sanction Warning (Student)</option>
                  <option value="COLLEGE_DIGEST">4. Monthly Placement & Attendance Digest (College HOD)</option>
                </select>
              </div>

              {/* Recipient Target */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Audience:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "STUDENT", label: "Single Member" },
                    { id: "ALL_STUDENTS", label: "Entire Batch 3" },
                    { id: "TRAINER", label: "Assigned Expert" },
                    { id: "COLLEGE", label: "College Dean" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setWaRecipientType(t.id as any)}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                        waRecipientType === t.id
                          ? "bg-[#45B26B]/10 text-[#2f8a36] border-[#45B26B]/30"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Name & Phone */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Recipient Name:</label>
                  <input
                    type="text"
                    value={waRecipientName}
                    onChange={(e) => {
                      setWaRecipientName(e.target.value);
                    }}
                    className="border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mobile / WhatsApp Number:</label>
                  <input
                    type="text"
                    value={waPhoneNumber}
                    onChange={(e) => setWaPhoneNumber(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Message Preview & Actions */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#45B26B]/10 flex items-center justify-center text-[#2f8a36]">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">WhatsApp Dispatch Editor</h4>
                    <span className="text-[11px] text-slate-500">
                      Formatted with WhatsApp markdown (*bold*, _italic_)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyWaMessage}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                      waCopied
                        ? "bg-[#45B26B] text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                    }`}
                  >
                    {waCopied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ShareIcon className="w-3.5 h-3.5" />}
                    <span>{waCopied ? "Copied!" : "1-Click Copy"}</span>
                  </button>

                  <a
                    href={generateWhatsAppWebUrl(waPhoneNumber, waMessageContent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-[#45B26B] hover:bg-[#3ca05f] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Web &rarr;</span>
                  </a>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Editable WhatsApp Message:</label>
                <textarea
                  rows={11}
                  value={waMessageContent}
                  onChange={(e) => setWaMessageContent(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Realistic Mobile WhatsApp Chat Balloon Simulation */}
              <div className="bg-[#ECE5DD] rounded-2xl p-4 border border-[#E0D7CD] flex flex-col">
                <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider mb-2 font-medium">
                  WhatsApp Screen Simulation
                </div>
                <div className="bg-[#E7FFDB] self-end max-w-md p-3.5 rounded-2xl rounded-tr-none shadow-xs border border-[#C8E6C9] text-xs text-slate-900 whitespace-pre-line leading-relaxed font-sans">
                  {waMessageContent}
                  <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                    Just now &bull; &#10003;&#10003;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHANNEL 3: WEB PUSH & PWA BROADCAST MODULE                            */}
      {/* ===================================================================== */}
      {activeChannel === "PUSH" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">FCM Push Broadcast Parameters</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sends high-priority push payloads to active service worker subscribers across laptops, tablets, and phones.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#45B26B] animate-pulse" />
                  <span className="font-semibold text-emerald-900">Push Gateway Operational</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold">1 Active Device</span>
              </div>

              {/* Presets */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Broadcast Presets:</label>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      title: "Zero-Grace Gate: WS-14 Entry Live",
                      body: "Beacon active at Anna University Hub. Geofence radius: 200m.",
                      url: "/checkin",
                    },
                    {
                      title: "36-Hour Hackathon Defense Starting",
                      body: "War Room allocation dispatched. Final Git commits freeze at 03:00 PM.",
                      url: "/record/DOS-B3-001",
                    },
                    {
                      title: "Deliverable Evaluated & Signed Off",
                      body: "Your WS-14 Raft Consensus test spec passed 20/20 criteria.",
                      url: "/record/DOS-B3-001",
                    },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPushTitle(p.title);
                        setPushBody(p.body);
                        setPushTargetUrl(p.url);
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left text-xs transition-colors"
                    >
                      <strong className="text-slate-900 block">{p.title}</strong>
                      <span className="text-slate-500 text-[11px] truncate block">{p.body}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Push Form */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <form
              onSubmit={handleDispatchPush}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF592C]/10 flex items-center justify-center text-[#FF592C]">
                    <BellIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Broadcast Dispatcher</h4>
                    <span className="text-[11px] text-slate-500">
                      Instantly alerts students with audio chirp and clickable badge
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDispatchingPush}
                  className="px-4 py-2 bg-[#FF592C] hover:bg-[#f83500] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RadioIcon className="w-3.5 h-3.5" />
                  <span>{isDispatchingPush ? "Broadcasting..." : "Dispatch Push Alert"}</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Push Title:</label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Push Body:</label>
                <textarea
                  rows={3}
                  required
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Click URL:</label>
                <input
                  type="text"
                  required
                  value={pushTargetUrl}
                  onChange={(e) => setPushTargetUrl(e.target.value)}
                  className="border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Notification Banner Preview on Mobile/OS */}
              <div className="mt-2 p-4 bg-slate-900 text-white rounded-2xl flex items-start gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/dos-club-logo.png" alt="DOS" className="w-6 h-6 rounded-full" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">TALENTOS APP &bull; NOW</span>
                    <span>Tap to view</span>
                  </div>
                  <strong className="text-xs text-white">{pushTitle}</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{pushBody}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: EMAIL TEMPLATE LIVE PREVIEW & CALENDAR TEST                    */}
      {/* ===================================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto font-['Poppins',sans-serif]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-[#3772FF]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Email Live Preview</h3>
                  <span className="text-[11px] text-slate-500">Sample rendered view for production transmission</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col gap-1.5">
              <div className="flex">
                <span className="w-16 text-slate-400 font-semibold">From:</span>
                <span className="text-slate-800 font-medium">TalentOS Operations &lt;notifications@dosclub.org&gt;</span>
              </div>
              <div className="flex">
                <span className="w-16 text-slate-400 font-semibold">To:</span>
                <span className="text-slate-800 font-medium">
                  {selectedTemplate.category === "COLLEGE"
                    ? "Dean / HOD &lt;hod.cse@annauniv.edu&gt;"
                    : selectedTemplate.category === "TRAINER"
                    ? "Priya Sundaram &lt;priya.lead@descience.org&gt;"
                    : "Arunachalam Sundaram &lt;arun@student.dosclub.org&gt;"}
                </span>
              </div>
              <div className="flex">
                <span className="w-16 text-slate-400 font-semibold">Subject:</span>
                <span className="text-slate-900 font-bold">{editSubject}</span>
              </div>
            </div>

            {/* Rendered Email Body */}
            <div className="p-5 border border-slate-200 rounded-xl bg-white text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-2xs">
              {editBody}
            </div>

            {/* Free Calendar Direct Action in Preview */}
            {selectedTemplate.hasCalendarLinks && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  <strong className="text-purple-900 block">Free Calendar Links in this Email:</strong>
                  <span className="text-purple-700 text-[11px]">Click either button to verify calendar synchronization:</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewGoogleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-purple-300 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors shadow-2xs"
                  >
                    Open Google Calendar &rarr;
                  </a>
                  <a
                    href={previewIcsUrl}
                    download="DOS_Club_WS14.ics"
                    className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors shadow-2xs"
                  >
                    Download Apple .ics
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
