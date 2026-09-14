"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientSession, clearClientSession, TalentosUser } from "@/lib/session";

export default function SessionBar() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);

  useEffect(() => {
    setUser(getClientSession());
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
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
        <span className="text-neutral-500 font-sans">{user.name}</span>
        <span
          className={`px-2 py-0.5 rounded border text-[10px] uppercase font-semibold ${
            roleColors[user.role] || "bg-neutral-100 text-neutral-700 border-neutral-200"
          }`}
        >
          {user.role}
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="px-2.5 py-1 text-xs font-mono text-neutral-500 hover:text-red-700 hover:bg-red-50 border border-neutral-200 rounded transition-colors"
        title="Terminate active session"
      >
        Sign Out &rarr;
      </button>
    </div>
  );
}
