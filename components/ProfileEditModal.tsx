"use client";

import React, { useState } from "react";
import { TalentosUser, setClientSession } from "@/lib/session";
import { CheckIcon, LockClosedIcon, ShieldCheckIcon, UserIcon } from "@/components/Icons";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TalentosUser;
  onUserUpdated?: (updated: TalentosUser) => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: ProfileEditModalProps) {
  const [fullName, setFullName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [bio, setBio] = useState(user.bio || "");
  const [headline, setHeadline] = useState(user.headline || "");
  const [githubHandle, setGithubHandle] = useState(user.github_handle || "");

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAvatarUrl(data.url);
        setMessage({ type: "success", text: "Photo uploaded. Click 'Save Profile' to apply." });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload photo." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during photo upload." });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          avatar_url: avatarUrl,
          bio,
          headline,
          github_handle: githubHandle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updated = data.user || {
          ...user,
          name: fullName,
          avatar_url: avatarUrl,
          bio,
          headline,
          github_handle: githubHandle,
        };
        setClientSession(updated);
        try {
          if (typeof window !== "undefined" && user.email) {
            localStorage.setItem(
              `profile_override_${user.email.toLowerCase()}`,
              JSON.stringify({
                name: fullName,
                avatar_url: avatarUrl,
                bio,
                headline,
                github_handle: githubHandle,
              })
            );
          }
        } catch {}

        if (onUserUpdated) onUserUpdated(updated);

        setMessage({ type: "success", text: "Profile updated successfully. Refreshing UI..." });
        setTimeout(() => {
          onClose();
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Could not save profile." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving profile." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif]">
      <div className="bg-white border border-[#E6E8EC] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E8EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FF592C]/10 text-[#FF592C] flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#23262F]">Update Profile</h2>
              <p className="text-xs text-[#777E90]">Personal information & display preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full border border-[#E6E8EC] text-[#777E90] hover:text-[#23262F] flex items-center justify-center text-sm font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Status Alert */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-[#45B26B]/10 text-[#2f8a36] border border-[#45B26B]/30"
                : "bg-[#EF466F]/10 text-[#EF466F] border border-[#EF466F]/30"
            }`}
          >
            {message.type === "success" ? <CheckIcon className="w-4 h-4 shrink-0" /> : null}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E6E8EC] bg-[#F4F5F6] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-[#777E90]" />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#23262F] mb-1">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                id="avatar-upload"
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E6E8EC] hover:border-[#23262F] text-xs font-bold text-[#23262F] cursor-pointer transition-colors"
              >
                {isUploadingPhoto ? "Uploading..." : "Change Photo"}
              </label>
              <span className="text-[11px] text-[#777E90] block mt-1">PNG, JPG up to 2MB</span>
            </div>
          </div>

          {/* Permitted: Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5">
              Full Display Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
            />
          </div>

          {/* Permitted: Headline / Role Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5">
              Technical Headline / Bio
            </label>
            <input
              type="text"
              placeholder="e.g. Systems Pod Alpha • Raft & Distributed Consensus"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
            />
          </div>

          {/* Permitted: GitHub Handle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5">
              GitHub Username
            </label>
            <input
              type="text"
              placeholder="e.g. arun-systems"
              value={githubHandle}
              onChange={(e) => setGithubHandle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
            />
          </div>

          {/* Locked Sensitive Fields Notice */}
          <div className="p-4 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#777E90] uppercase tracking-wider">
              <ShieldCheckIcon className="w-4 h-4 text-[#45B26B]" />
              <span>Tamper-Guarded Sensitive Fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#777E90] flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" /> Institutional Email
                </span>
                <span className="font-semibold text-[#23262F] block truncate mt-0.5">
                  {user.email}
                </span>
              </div>

              <div>
                <span className="text-[#777E90] flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" /> Student / Role ID
                </span>
                <span className="font-semibold text-[#23262F] block mt-0.5">
                  {user.dos_id || user.role}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#777E90] leading-relaxed">
              To prevent record tampering, your institutional email, mobile number, attendance history, and certifications are cryptographically locked and require administrative sanction to change.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E6E8EC]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#E6E8EC] text-xs font-bold text-[#777E90] hover:text-[#23262F] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-[#FF592C] hover:bg-[#f83500] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
