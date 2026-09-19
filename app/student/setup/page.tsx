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

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      const cached = getClientSession();
      if (cached) {
        if (active) setUser(cached);
        return;
      }

      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) throw new Error("Session expired");
        const data = await response.json();
        if (!active) return;
        if (data.user) {
          setClientSession(data.user);
          setUser(data.user);
        } else {
          window.location.href = "/login?redirect=%2Fstudent%2Fsetup";
        }
      } catch {
        if (active) window.location.href = "/login?redirect=%2Fstudent%2Fsetup";
      }
    };
    restoreSession();
    return () => { active = false; };
  }, []);

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
    if (file.size > 10 * 1024 * 1024) return setMessage("The original photo must be 10MB or smaller.");
    setUploading(true);
    setMessage("Uploading photo…");
    try {
      const uploadFile = await preparePhoto(file);
      const form = new FormData(); form.append("file", uploadFile, file.name); form.append("type", "avatar");
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) return setMessage(data.error || `Photo upload failed (HTTP ${response.status}). Please choose another image.`);
      setPhoto(data.url);
      setPhotoName(file.name);
      setMessage("Photo uploaded. Click Continue to finish your account setup.");
    } catch (error) {
      console.error("Student photo upload failed", error);
      setMessage("Photo upload could not reach the server. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function preparePhoto(file: File): Promise<File> {
    const targetBytes = 200 * 1024;
    if (file.size <= targetBytes) return file;
    try {
      const bitmap = await createImageBitmap(file);
      let smallest: Blob | null = null;
      for (const maxDimension of [512, 384, 256, 192]) {
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext("2d");
        if (!context) continue;
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.8, 0.65, 0.5, 0.35]) {
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
          if (!blob) continue;
          smallest = blob;
          if (blob.size <= targetBytes) {
            bitmap.close();
            return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
          }
        }
      }
      bitmap.close();
      return smallest ? new File([smallest], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file;
    } catch {
      return file;
    }
  }

  async function finish() {
    if (!user || !passwordSaved || !photo) return setMessage("Save your password and upload a photo first.");
    try {
      const response = await fetch("/api/profile/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: user.name, avatar_url: photo }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(data.error || `Profile could not be saved (HTTP ${response.status}). Please try again.`);
      const updated = data.user || { ...user, avatar_url: photo, requiresOnboarding: false };
      setClientSession(updated);
      window.location.href = "/record/" + encodeURIComponent(updated.dos_id || "");
    } catch (error) {
      console.error("Student profile save failed", error);
      setMessage("Profile could not reach the server. Check your connection and try again.");
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
    <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP · automatically compressed to maximum 200KB</p>
    <input id="student-photo" className="mt-2 block w-full rounded border p-2 text-sm" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
    {uploading && <p className="mt-2 text-sm text-blue-700">Uploading photo…</p>}
    {photoName && !uploading && <p className="mt-2 text-sm text-green-700">Selected: {photoName}</p>}
    {photo && <img src={photo} alt="Uploaded profile" className="mt-4 h-24 w-24 rounded-full object-cover" />}
    <button className="mt-8 w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={!passwordSaved || !photo || uploading} onClick={finish}>Continue to student portal</button>
  </section></main>;
}
