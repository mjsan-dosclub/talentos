"use client";

import React, { useState } from "react";
import { CheckIcon, LockClosedIcon } from "@/components/Icons";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Password changed successfully." });
        setTimeout(() => {
          onClose();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1200);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error updating password." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif]">
      <div className="bg-white border border-[#E6E8EC] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E8EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#3772FF]/10 text-[#3772FF] flex items-center justify-center">
              <LockClosedIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#23262F]">Change Password</h2>
              <p className="text-xs text-[#777E90] truncate max-w-[240px]">{userEmail}</p>
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

        {/* Status Message */}
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5">
              New Password (min 6 chars) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E6E8EC]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#E6E8EC] text-xs font-bold text-[#777E90] hover:text-[#23262F] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
