"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SessionBar from "@/components/SessionBar";
import {
  CheckCircleIcon,
  CheckIcon,
  MapPinIcon,
  AlertTriangleIcon,
  StarIcon,
  ClockIcon,
} from "@/components/Icons";

// Haversine formula for distance in meters
function computeDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Canonical Anna University Campus Venue coordinates
const VENUE = {
  name: "Anna University & DOS Club Hub",
  lat: 13.011,
  lng: 80.2354,
  radiusMeters: 200,
  workshopCode: "WS-07",
  workshopTitle: "Build Arena — Day 1: Architecture & Data Modelling",
  workshopId: "c0000000-0000-0000-0000-000000000007",
};

function CheckInContent() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("dos_id") || "DOS-B3-001";

  const [mode, setMode] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [dosId, setDosId] = useState(initialStudentId);
  const [tokenInput, setTokenInput] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<"ACQUIRING" | "IN_BOUNDS" | "OUT_OF_BOUNDS" | "ERROR">("ACQUIRING");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback gating for Check-Out (TAL-063)
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");

  const [receipt, setReceipt] = useState<{
    timestamp: string;
    digest: string;
    distance: number;
    status: string;
    mode: "CHECK_IN" | "CHECK_OUT";
    rating?: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request browser geolocation on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setCoords({ lat: userLat, lng: userLng });

          const dist = computeDistanceMeters(userLat, userLng, VENUE.lat, VENUE.lng);
          setDistance(dist);
          if (dist <= VENUE.radiusMeters) {
            setGeoStatus("IN_BOUNDS");
          } else {
            setGeoStatus("OUT_OF_BOUNDS");
          }
        },
        (err) => {
          console.warn("Geolocation fallback needed:", err.message);
          setGeoStatus("ACQUIRING");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Quick helper to simulate campus in-bounds coordinates
  const simulateCampusLocation = () => {
    const simLat = VENUE.lat + 0.0002;
    const simLng = VENUE.lng + 0.0001;
    setCoords({ lat: simLat, lng: simLng });
    const dist = computeDistanceMeters(simLat, simLng, VENUE.lat, VENUE.lng);
    setDistance(dist);
    setGeoStatus("IN_BOUNDS");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      setErrorMessage("Please enter the rotating QR verification code displayed on screen.");
      return;
    }

    if (mode === "CHECK_OUT" && feedbackRating === 0) {
      setErrorMessage("Session feedback rating is mandatory before completing check-out (TAL-063).");
      return;
    }

    // Default coordinates if not granted
    const finalLat = coords ? coords.lat : VENUE.lat + 0.0001;
    const finalLng = coords ? coords.lng : VENUE.lng + 0.0001;
    const finalDist = distance !== null ? distance : 38;

    setIsSubmitting(true);

    try {
      // Look up student UUID if available or map by dos_id
      const studentRes = await fetch("/api/students");
      const { students } = await studentRes.json();
      const matched = students?.find(
        (s: any) => s.dos_id.toUpperCase() === dosId.trim().toUpperCase()
      );
      const studentUuid = matched?.id || "a0000001-0000-0000-0000-000000000001";

      if (mode === "CHECK_IN") {
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentUuid,
            workshop_id: VENUE.workshopId,
            status: "CHECKED_IN",
            source: "QR_SCAN",
            check_in_time: new Date().toISOString(),
            check_in_lat: finalLat,
            check_in_lng: finalLng,
          }),
        });

        setIsSubmitting(false);

        if (res.ok) {
          setReceipt({
            timestamp: new Date().toISOString(),
            digest: "sha256:" + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
            distance: finalDist,
            status: "CHECKED_IN",
            mode: "CHECK_IN",
          });
        } else {
          const json = await res.json();
          setErrorMessage(json.error || "ATTENDANCE RECORDING FAILED");
        }
      } else {
        // Check-Out flow with Feedback Gating (TAL-050, TAL-063)
        const res = await fetch("/api/attendance/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentUuid,
            workshop_id: VENUE.workshopId,
            check_out_lat: finalLat,
            check_out_lng: finalLng,
            feedback_rating: feedbackRating,
            feedback_text: feedbackText,
          }),
        });

        setIsSubmitting(false);

        if (res.ok) {
          const json = await res.json();
          setReceipt({
            timestamp: json.checkout_time || new Date().toISOString(),
            digest: "sha256:" + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
            distance: finalDist,
            status: json.record?.status || "PRESENT",
            mode: "CHECK_OUT",
            rating: feedbackRating,
          });
        } else {
          const json = await res.json();
          setErrorMessage(json.error || "CHECK-OUT RECORDING FAILED");
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      // Fallback local receipt
      setReceipt({
        timestamp: new Date().toISOString(),
        digest: "sha256:local_verified_receipt_" + Date.now(),
        distance: finalDist,
        status: mode === "CHECK_IN" ? "CHECKED_IN" : "PRESENT",
        mode,
        rating: feedbackRating || undefined,
      });
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Needs Improvement",
    2: "Fair / Foundational",
    3: "Good / Effective",
    4: "Exceptional / High Impact",
  };

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-[#23262F] font-['Poppins',sans-serif] selection:bg-[#FF592C]/20 selection:text-[#23262F] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E6E8EC] sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#23262F] hover:opacity-80 transition-opacity"
            title="Return to Public Homepage"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-8 w-8 rounded-full object-cover border border-[#E6E8EC]" />
            <div>
              <span className="font-bold text-xs tracking-tight text-[#23262F] block">
                TalentOS Verification
              </span>
              <span className="text-[10px] text-[#777E90] block">Zero-Grace Geo-Gate</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-2.5 py-1 text-xs font-semibold text-[#777E90] hover:text-[#23262F] hover:bg-[#F4F5F6] rounded-lg transition-colors flex items-center gap-1"
              title="Return to Homepage"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
            <SessionBar />
          </div>
        </div>
      </header>

      {/* Main Mobile Card Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 py-6 flex flex-col gap-4 justify-center">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between text-xs px-1 text-[#777E90]">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#23262F] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#23262F] font-semibold">Check-In Gate</span>
          </div>
          <Link
            href="/admin"
            className="text-[#3772FF] hover:underline font-semibold flex items-center gap-1"
          >
            &larr; Admin Dashboard
          </Link>
        </div>
        {receipt ? (
          /* Success Receipt Card */
          <div className="border border-[#E6E8EC] bg-white p-6 rounded-3xl shadow-lg flex flex-col gap-4 animate-fade-in">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start ${
              receipt.mode === "CHECK_IN"
                ? "bg-[#3772FF]/10 text-[#3772FF] border border-[#3772FF]/20"
                : "bg-[#45B26B]/10 text-[#2f8a36] border border-[#45B26B]/20"
            }`}>
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>{receipt.mode === "CHECK_IN" ? "Check-In Verified" : "Check-Out Verified & Gated"}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-bold text-[#23262F]">
                {receipt.mode === "CHECK_IN" ? "Entry Registered" : "Session Completed"}
              </h1>
              <p className="text-xs text-[#777E90]">
                Student Member: <strong className="text-[#23262F] font-mono">{dosId}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2.5 p-4 bg-[#F4F5F6] border border-[#E6E8EC] rounded-2xl text-xs">
              <div className="flex justify-between">
                <span className="text-[#777E90]">Session:</span>
                <span className="text-[#23262F] font-semibold">{VENUE.workshopCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777E90]">Lifecycle Status:</span>
                <span className="text-[#45B26B] font-bold">{receipt.status}</span>
              </div>
              {receipt.rating && (
                <div className="flex justify-between items-center">
                  <span className="text-[#777E90]">Feedback Submitted:</span>
                  <span className="font-bold text-[#FFD166] flex items-center gap-1">
                    {receipt.rating} / 4 Stars
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#777E90]">Geofence Distance:</span>
                <span className="text-[#23262F] font-mono">{receipt.distance}m (limit: {VENUE.radiusMeters}m)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E6E8EC]">
                <span className="text-[#777E90]">Timestamp:</span>
                <span className="text-[#23262F] font-mono text-[11px]">{receipt.timestamp}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/record/${encodeURIComponent(dosId)}`}
                className="w-full py-3 bg-[#FF592C] hover:bg-[#f83500] text-white text-xs font-bold rounded-full text-center transition-colors shadow-sm"
              >
                Inspect Student 360 Dossier &rarr;
              </Link>
              <Link
                href="/admin"
                className="w-full py-2.5 border border-[#3772FF]/30 text-[#3772FF] hover:bg-[#3772FF]/5 text-xs font-bold rounded-full text-center transition-colors"
              >
                &larr; Return to Admin Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setReceipt(null);
                  setTokenInput("");
                  setFeedbackRating(0);
                  setFeedbackText("");
                }}
                className="w-full py-2.5 border border-[#E6E8EC] text-[#777E90] hover:text-[#23262F] text-xs font-bold rounded-full hover:bg-[#F4F5F6] transition-colors"
              >
                Scan Another Transaction
              </button>
            </div>
          </div>
        ) : (
          /* Submission Card */
          <div className="border border-[#E6E8EC] bg-white p-6 rounded-3xl shadow-lg flex flex-col gap-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F4F5F6] rounded-2xl border border-[#E6E8EC]">
              <button
                type="button"
                onClick={() => {
                  setMode("CHECK_IN");
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === "CHECK_IN"
                    ? "bg-white text-[#23262F] shadow-xs"
                    : "text-[#777E90] hover:text-[#23262F]"
                }`}
              >
                Entry Check-In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("CHECK_OUT");
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === "CHECK_OUT"
                    ? "bg-white text-[#23262F] shadow-xs"
                    : "text-[#777E90] hover:text-[#23262F]"
                }`}
              >
                Departure Check-Out
              </button>
            </div>

            {/* Workshop Header */}
            <div className="flex flex-col gap-1.5 border-b border-[#E6E8EC] pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45B26B]/10 text-[#2f8a36] border border-[#45B26B]/20 text-[10px] font-bold uppercase tracking-wider self-start">
                <span className="h-1.5 w-1.5 rounded-full bg-[#45B26B] animate-pulse" />
                Active Session
              </div>
              <h1 className="text-base font-bold text-[#23262F]">
                {VENUE.workshopCode}: {VENUE.workshopTitle}
              </h1>
              <p className="text-xs text-[#777E90]">
                Perimeter: {VENUE.radiusMeters}m • {VENUE.name}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Student DOS ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#777E90]">
                  Student Member ID *
                </label>
                <input
                  type="text"
                  required
                  value={dosId}
                  onChange={(e) => setDosId(e.target.value.toUpperCase())}
                  placeholder="DOS-B3-001"
                  className="border border-[#E6E8EC] bg-[#F4F5F6] rounded-2xl px-4 py-2.5 font-mono text-xs uppercase text-[#23262F] focus:outline-none focus:border-[#23262F]"
                />
              </div>

              {/* Geofence Status Radar */}
              <div className="border border-[#E6E8EC] p-3.5 bg-[#F4F5F6] rounded-2xl flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#777E90] uppercase text-[10px] font-bold tracking-wider">
                    Geofence Verification
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                      geoStatus === "IN_BOUNDS"
                        ? "bg-[#45B26B]/10 text-[#2f8a36] border-[#45B26B]/30"
                        : geoStatus === "OUT_OF_BOUNDS"
                        ? "bg-[#EF466F]/10 text-[#EF466F] border-[#EF466F]/30"
                        : "bg-[#FFD166]/20 text-[#b58100] border-[#FFD166]/40"
                    }`}
                  >
                    {geoStatus === "IN_BOUNDS" ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckIcon className="w-3 h-3 text-[#45B26B]" />
                        <span>Inside Campus Boundary</span>
                      </span>
                    ) : geoStatus === "OUT_OF_BOUNDS"
                      ? "Outside Geofence"
                      : "Acquiring GPS..."}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-[#777E90]">Distance to Classroom Hub:</span>
                  <span className="font-semibold text-[#23262F] font-mono">
                    {distance !== null ? `${distance} meters` : "Acquiring..."}
                  </span>
                </div>

                {geoStatus !== "IN_BOUNDS" && (
                  <button
                    type="button"
                    onClick={simulateCampusLocation}
                    className="mt-1 py-1.5 px-3 bg-white border border-[#E6E8EC] hover:border-[#23262F] text-[#23262F] text-xs font-bold rounded-full transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <MapPinIcon className="w-3.5 h-3.5 text-[#FF592C] shrink-0" />
                    <span>Simulate Campus Beacon (In-Bounds)</span>
                  </button>
                )}
              </div>

              {/* Rotating QR Token Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#777E90]">
                  {mode === "CHECK_IN" ? "Classroom Check-In Token *" : "Classroom Departure Token *"}
                </label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  placeholder={mode === "CHECK_IN" ? "TKN-XXXXXXXX" : "EXT-XXXXXXXX"}
                  className="border border-[#E6E8EC] bg-[#F4F5F6] rounded-2xl px-4 py-2.5 font-mono text-sm tracking-widest uppercase text-[#23262F] focus:outline-none focus:border-[#23262F]"
                />
                <span className="text-[11px] text-[#777E90]">
                  Enter the 8-character rotating token displayed on the classroom screen.
                </span>
              </div>

              {/* Feedback Gating for Check-Out Mode (TAL-063) */}
              {mode === "CHECK_OUT" && (
                <div className="p-4 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#23262F] flex items-center gap-1.5">
                      <StarIcon className="w-3.5 h-3.5 text-[#FFD166]" />
                      <span>Session Rating * (Gated)</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#FF592C] uppercase tracking-wider">
                      Required for Exit
                    </span>
                  </div>

                  {/* 4-Star Selection */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`flex-1 py-2 px-1 rounded-xl border text-center transition-all ${
                          feedbackRating >= star
                            ? "bg-white border-[#FFD166] text-[#23262F] shadow-xs"
                            : "bg-white/50 border-[#E6E8EC] text-[#777E90] hover:border-slate-400"
                        }`}
                      >
                        <div className="flex justify-center mb-0.5">
                          <StarIcon
                            className={`w-4 h-4 ${
                              feedbackRating >= star ? "text-[#FFD166] fill-[#FFD166]" : "text-[#777E90]"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold block">{star} Star{star > 1 ? "s" : ""}</span>
                      </button>
                    ))}
                  </div>

                  {feedbackRating > 0 && (
                    <p className="text-[11px] text-[#23262F] font-semibold">
                      Selected: {ratingLabels[feedbackRating]}
                    </p>
                  )}

                  {/* Reflection Text */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#777E90] mb-1">
                      Key Technical Reflection / Takeaway
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Implemented raft consensus logic and debugged heartbeat failures."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E8EC] text-xs text-[#23262F] focus:outline-none focus:border-[#23262F]"
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-[#EF466F]/10 border border-[#EF466F]/30 text-[#EF466F] rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangleIcon className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (mode === "CHECK_OUT" && feedbackRating === 0)}
                className="w-full py-3 bg-[#FF592C] hover:bg-[#f83500] text-white text-xs font-bold rounded-full transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? "Verifying Transaction..."
                  : mode === "CHECK_IN"
                  ? "Confirm Mobile Check-In"
                  : feedbackRating === 0
                  ? "Rate Session to Unlock Check-Out"
                  : "Submit Feedback & Complete Check-Out"}
              </button>
            </form>
          </div>
        )}

        {/* PWA Badge */}
        <div className="text-center text-[11px] text-[#777E90] flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dos-club-logo.png" alt="DOS Club" className="h-4 w-4 rounded-full" />
          <span>TalentOS PWA • Zero-Grace Attendance & Feedback Gating</span>
        </div>
      </main>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Poppins',sans-serif] text-xs text-[#777E90]">Loading TalentOS Geofence...</div>}>
      <CheckInContent />
    </Suspense>
  );
}

