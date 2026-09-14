"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getClientSession, clearClientSession, TalentosUser } from "@/lib/session";
import ProfileEditModal from "@/components/ProfileEditModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { UserIcon, LockClosedIcon } from "@/components/Icons";

export default function SessionBar() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getClientSession());

    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    clearClientSession();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Fallback local clear
    }
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const roleColors: Record<string, string> = {
    STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
    TRAINER: "bg-purple-50 text-purple-700 border-purple-200",
    COLLEGE_ADMIN: "bg-amber-50 text-amber-800 border-amber-200",
    SUPER_ADMIN: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  return (
    <>
      <div className="relative flex items-center gap-2" ref={menuRef}>
        {/* User Badge / Trigger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-slate-700/80 transition-all text-left focus:outline-none"
          title="Manage profile and account settings"
        >
          {/* Avatar Thumbnail */}
          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-slate-300" />
            )}
          </div>

          <span className="hidden sm:inline text-xs font-medium text-slate-200 truncate max-w-[120px]">
            {user.name}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
              roleColors[user.role] || "bg-neutral-100 text-neutral-700 border-neutral-200"
            }`}
          >
            {user.role === "SUPER_ADMIN"
              ? "Admin"
              : user.role === "COLLEGE_ADMIN"
              ? "College"
              : user.role === "TRAINER"
              ? "Expert"
              : "Student"}
          </span>

          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E6E8EC] p-2 z-50 animate-fade-in font-['Poppins',sans-serif]">
            {/* User Info Header */}
            <div className="px-3 py-2.5 border-b border-[#F4F5F6]">
              <div className="text-xs font-bold text-[#23262F] truncate">{user.name}</div>
              <div className="text-[11px] text-[#777E90] truncate">{user.email}</div>
              {user.dos_id && (
                <div className="text-[10px] font-mono text-[#3772FF] mt-1 font-semibold">
                  Dossier: {user.dos_id}
                </div>
              )}
            </div>

            {/* Navigation Shortcuts */}
            <div className="py-1 border-b border-[#F4F5F6] space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  const target =
                    user.role === "SUPER_ADMIN"
                      ? "/admin"
                      : user.role === "TRAINER"
                      ? "/trainer"
                      : user.role === "COLLEGE_ADMIN"
                      ? "/college"
                      : `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`;
                  router.push(target);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#3772FF] hover:bg-[#3772FF]/10 rounded-xl transition-colors text-left"
              >
                <svg className="w-4 h-4 text-[#3772FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>
                  {user.role === "SUPER_ADMIN"
                    ? "Admin Console"
                    : user.role === "TRAINER"
                    ? "Expert Cockpit"
                    : user.role === "COLLEGE_ADMIN"
                    ? "College Portal"
                    : "My Student Dossier"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#23262F] hover:bg-[#F4F5F6] rounded-xl transition-colors text-left"
              >
                <svg className="w-4 h-4 text-[#777E90]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Public Home</span>
              </button>
            </div>

            {/* Account Settings */}
            <div className="py-1 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#23262F] hover:bg-[#F4F5F6] rounded-xl transition-colors text-left"
              >
                <UserIcon className="w-4 h-4 text-[#777E90]" />
                <span>Update Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setShowPasswordModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#23262F] hover:bg-[#F4F5F6] rounded-xl transition-colors text-left"
              >
                <LockClosedIcon className="w-4 h-4 text-[#777E90]" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="pt-1 mt-1 border-t border-[#F4F5F6]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#EF466F] hover:bg-[#EF466F]/10 rounded-xl transition-colors text-left"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileEditModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onUserUpdated={(updated) => setUser(updated)}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          userEmail={user.email}
        />
      )}
    </>
  );
}
