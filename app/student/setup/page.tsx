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
  const [photoName, setPhotoName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => setUser(getClientSession()), []);

  async function savePassword() {
    if (newPassword.length < 6) return setMessage("New password must be at least 6 characters.");
    setSavingPassword(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(data.error || "Password could not be saved. Please try again.");
      setPasswordSaved(true);
      setMessage("Password saved. Now choose a profile photo.");
    } catch {
      setMessage("Password could not be saved because the network request failed. Check your connection and try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function uploadPhoto(file: File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return setMessage("Please choose a JPG, PNG, or WebP image.");
    if (file.size > 2 * 1024 * 1024) return setMessage("Photo must be 2MB or smaller.");
    setUploading(true);
    setMessage("Uploading photo…");
    try {
      const form = new FormData(); form.append("file", file); form.append("type", "avatar");
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) return setMessage(data.error || "Photo upload failed. Please choose another image.");
      setPhoto(data.url);
      setPhotoName(file.name);
      setMessage("Photo uploaded. Click Continue to finish your account setup.");
    } catch {
      setMessage("Photo upload failed because the network request failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function finish() {
    if (!user || !passwordSaved || !photo) return setMessage("Save your password and upload a photo first.");
    try {
      const response = await fetch("/api/profile/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: user.name, avatar_url: photo }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(data.error || "Profile could not be saved. Please try again.");
      const updated = data.user || { ...user, avatar_url: photo, requiresOnboarding: false };
      setClientSession(updated);
      window.location.href = "/record/" + encodeURIComponent(updated.dos_id || "");
    } catch {
      setMessage("Profile could not be saved because the network request failed. Please try again.");
    }
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
    <button className="mt-4 rounded bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={passwordSaved || savingPassword} onClick={savePassword}>{savingPassword ? "Saving password…" : passwordSaved ? "Password saved" : "Save password"}</button>
    <label className="mt-8 block text-sm font-semibold" htmlFor="student-photo">Profile photo</label>
    <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP · maximum 2MB</p>
    <input id="student-photo" className="mt-2 block w-full rounded border p-2 text-sm" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
    {uploading && <p className="mt-2 text-sm text-blue-700">Uploading photo…</p>}
    {photoName && !uploading && <p className="mt-2 text-sm text-green-700">Selected: {photoName}</p>}
    {photo && <img src={photo} alt="Uploaded profile" className="mt-4 h-24 w-24 rounded-full object-cover" />}
    <button className="mt-8 w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={!passwordSaved || !photo || uploading} onClick={finish}>Continue to student portal</button>
  </section></main>;
}
