"use client";

import { useEffect, useState } from "react";
import { getClientSession, setClientSession, TalentosUser } from "@/lib/session";

export default function StudentSetupPage() {
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => setUser(getClientSession()), []);

  async function savePassword() {
    if (newPassword.length < 6) return setMessage("New password must be at least 6 characters.");
    const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Password could not be saved.");
    setPasswordSaved(true);
    setMessage("Password saved. Upload your photo to continue.");
  }

  async function uploadPhoto(file: File) {
    const form = new FormData(); form.append("file", file); form.append("type", "avatar");
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok || !data.url) return setMessage(data.error || "Photo upload failed.");
    setPhoto(data.url);
  }

  async function finish() {
    if (!user || !passwordSaved || !photo) return setMessage("Save your password and upload a photo first.");
    const response = await fetch("/api/profile/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: user.name, avatar_url: photo }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Profile could not be saved.");
    const updated = data.user || { ...user, avatar_url: photo, requiresOnboarding: false };
    setClientSession(updated);
    window.location.href = "/record/" + encodeURIComponent(updated.dos_id || "");
  }

  if (!user) return <main className="min-h-screen grid place-items-center">Loading account...</main>;
  return <main className="min-h-screen bg-slate-50 p-6 text-slate-900"><section className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-bold">Complete your student account</h1>
    <p className="mt-2 text-sm text-slate-600">Set a private password and upload a profile photo before entering the portal.</p>
    {message && <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
    <label className="mt-6 block text-sm font-semibold">Current password / DOS ID</label>
    <input className="mt-1 w-full rounded border p-3" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
    <label className="mt-4 block text-sm font-semibold">New password</label>
    <input className="mt-1 w-full rounded border p-3" type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
    <button className="mt-4 rounded bg-slate-900 px-4 py-3 text-sm font-semibold text-white" disabled={passwordSaved} onClick={savePassword}>{passwordSaved ? "Password saved" : "Save password"}</button>
    <label className="mt-8 block text-sm font-semibold">Profile photo</label>
    <input className="mt-1 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
    {photo && <img src={photo} alt="Uploaded profile" className="mt-4 h-24 w-24 rounded-full object-cover" />}
    <button className="mt-8 w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={!passwordSaved || !photo} onClick={finish}>Continue to student portal</button>
  </section></main>;
}
