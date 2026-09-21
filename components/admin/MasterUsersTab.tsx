"use client";

import React, { useState, useEffect } from "react";
import { TalentosAdminUser } from "@/app/api/admins/route";
import { UsersIcon, TrashIcon, EditIcon, CheckIcon, XIcon, ShieldCheckIcon } from "@/components/Icons";

interface MasterUsersTabProps {
  onToast: (msg: string) => void;
  onAuditLog?: (category: any, subcategory: string, action: any, sourceText: string) => void;
}

const MODULE_OPTIONS = [
  { id: "all", label: "All Operational Modules (Full Access)" },
  { id: "workshops", label: "Workshops & Syllabus" },
  { id: "sessions", label: "Workshop Sessions & Scheduling" },
  { id: "institutions", label: "Colleges & Institutional POCs" },
  { id: "experts", label: "Technical Expert Mentors" },
  { id: "students", label: "Students Roster & Enrollment" },
  { id: "reports", label: "End-of-Day Controlled Reports" },
];

export default function MasterUsersTab({ onToast, onAuditLog }: MasterUsersTabProps) {
  const [admins, setAdmins] = useState<TalentosAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<TalentosAdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [customRoleName, setCustomRoleName] = useState("Workshop Scheduler");
  const [selectedModules, setSelectedModules] = useState<string[]>(["workshops", "sessions"]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to map role names to default module sets
  const getModulesForRole = (roleName: string): string[] => {
    switch (roleName) {
      case "Full Operations Admin":
        return ["all", "workshops", "sessions", "institutions", "experts", "students", "reports"];
      case "Expert Manager":
        return ["experts", "sessions"];
      case "Institution Manager":
        return ["institutions", "students"];
      case "Student Manager":
        return ["students", "reports"];
      case "Workshop Scheduler":
        return ["workshops", "sessions"];
      default:
        return ["workshops", "sessions"];
    }
  };

  const handleRoleChange = (roleName: string) => {
    setCustomRoleName(roleName);
    setSelectedModules(getModulesForRole(roleName));
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admins");
      const data = await res.json();
      if (data.success && data.admins) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.warn("Failed fetching admin users:", err);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !customRoleName.trim()) {
      setErrorMsg("Name, Email, and Custom Role Name are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim() || undefined,
          force_password_change: forcePasswordChange,
          custom_role_name: customRoleName.trim(),
          allowed_modules: selectedModules,
          created_by: "admin@dosclub.org",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onToast(`Successfully created additional admin: ${data.admin.name} (${data.admin.custom_role_name})`);
        onAuditLog?.("System", "Admin Management", "Create", `Created admin user ${data.admin.email} with role ${data.admin.custom_role_name}`);
        setIsAddOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        setForcePasswordChange(true);
        setCustomRoleName("Workshop Scheduler");
        setSelectedModules(["workshops", "sessions"]);
        fetchAdmins();
      } else {
        setErrorMsg(data.error || "Failed to create admin user.");
      }
    } catch {
      setErrorMsg("Network error creating admin user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (admin: TalentosAdminUser) => {
    try {
      const res = await fetch("/api/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admin.id, is_active: !admin.is_active }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast(`Admin user ${admin.email} is now ${!admin.is_active ? "ACTIVE" : "INACTIVE"}`);
        fetchAdmins();
      } else {
        onToast(data.error || "Failed to update admin status.");
      }
    } catch {
      onToast("Network error updating status.");
    }
  };

  const handleDeleteAdmin = async (admin: TalentosAdminUser) => {
    if (!confirm(`Are you sure you want to delete additional admin "${admin.name}" (${admin.email})?`)) return;

    try {
      const res = await fetch(`/api/admins?id=${encodeURIComponent(admin.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast(`Deleted admin user: ${admin.email}`);
        fetchAdmins();
      } else {
        onToast(data.error || "Failed to delete admin.");
      }
    } catch {
      onToast("Network error deleting admin user.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
            <ShieldCheckIcon className="w-3 h-3" />
            <span>Master User Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Master Users & Additional Admin Roles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision additional admin users, assign custom roles, and configure fine-grained module access.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+ Create Admin User</span>
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-3">User & Email</th>
              <th className="p-3">Custom Role</th>
              <th className="p-3">Assigned Module Access</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-mono text-xs">
                  LOADING_ADMIN_USERS...
                </td>
              </tr>
            ) : admins.map((adm) => (
              <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{adm.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{adm.email}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                    {adm.custom_role_name}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {adm.allowed_modules.map((m, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  {adm.is_super_admin ? (
                    <span className="bg-purple-100 text-purple-800 border border-purple-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      SUPER ADMIN
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 border border-slate-300 font-medium px-2 py-0.5 rounded text-[10px] uppercase">
                      ADDITIONAL ADMIN
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => !adm.is_super_admin && handleToggleActive(adm)}
                    disabled={adm.is_super_admin}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      adm.is_active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer"
                        : "bg-red-50 text-red-800 border border-red-200 cursor-pointer"
                    }`}
                  >
                    {adm.is_active ? "ACTIVE" : "INACTIVE"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  {!adm.is_super_admin ? (
                    <button
                      onClick={() => handleDeleteAdmin(adm)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Delete Admin"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono italic">UNREMOVABLE</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Create Additional Admin */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Provision Additional Admin User</h2>
                <p className="text-xs text-slate-500">Create custom admin roles with assigned module permissions.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Admin Display Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Manager"
                  className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Email Address:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anand@dosclub.org"
                  className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Initial Temporary Password:</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. TempPass@2026 (Leave blank for default admin@2026)"
                  className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="forcePwdChange"
                  checked={forcePasswordChange}
                  onChange={(e) => setForcePasswordChange(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="forcePwdChange" className="font-medium text-slate-700 cursor-pointer">
                  Require password change on first login
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Custom Role Name:</label>
                <select
                  value={customRoleName}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800 font-medium"
                >
                  <option value="Workshop Scheduler">Workshop Scheduler</option>
                  <option value="Expert Manager">Expert Manager</option>
                  <option value="Institution Manager">Institution Manager</option>
                  <option value="Student Manager">Student Manager</option>
                  <option value="Full Operations Admin">Full Operations Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-semibold text-slate-700">Assign Module Access Permissions:</label>
                <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                  {MODULE_OPTIONS.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(m.id)}
                        onChange={(e) => {
                          if (m.id === "all") {
                            if (e.target.checked) {
                              setSelectedModules(["all", "workshops", "sessions", "institutions", "experts", "students", "reports"]);
                              setCustomRoleName("Full Operations Admin");
                            } else {
                              setSelectedModules([]);
                            }
                          } else {
                            if (e.target.checked) {
                              const updated = [...selectedModules, m.id];
                              const allSub = ["workshops", "sessions", "institutions", "experts", "students", "reports"];
                              if (allSub.every((sub) => updated.includes(sub))) {
                                setSelectedModules(["all", ...allSub]);
                                setCustomRoleName("Full Operations Admin");
                              } else {
                                setSelectedModules(updated);
                              }
                            } else {
                              setSelectedModules(selectedModules.filter((id: string) => id !== m.id && id !== "all"));
                            }
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isSubmitting ? "Provisioning..." : "Save & Provision Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
