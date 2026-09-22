"use client";

import { useEffect, useState } from "react";
import { AdminPermission } from "@/lib/session";

type AdminRecord = { id: string; fullName: string; email: string; permissions: AdminPermission[]; status: "ACTIVE" | "INACTIVE"; createdAt: string };
const permissionLabels: Array<[AdminPermission, string]> = [
  ["STUDENTS", "Students"], ["EXPERTS", "Experts / Trainers"], ["INSTITUTIONS", "Colleges"], ["WORKSHOPS", "Workshops & Scheduler"], ["NOTIFICATIONS", "Notifications"], ["GOVERNANCE", "Governance & Audit"], ["SETTINGS", "System Settings"],
];

export default function UserManagementTab() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", status: "ACTIVE", permissions: [] as AdminPermission[] });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin-users");
    const data = await res.json();
    if (res.ok) setAdmins(data.admins || []); else setMessage(data.error || "Could not load custom admins.");
  };
  useEffect(() => { load(); }, []);
  const reset = () => { setEditing(null); setForm({ fullName: "", email: "", password: "", status: "ACTIVE", permissions: [] }); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const res = await fetch("/api/admin-users", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { id: editing.id, ...form, password: form.password || undefined } : form) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Could not save administrator."); else { setMessage(editing ? "Administrator updated." : "Administrator created."); reset(); await load(); }
    setSaving(false);
  };
  const edit = (admin: AdminRecord) => { setEditing(admin); setForm({ fullName: admin.fullName, email: admin.email, password: "", status: admin.status, permissions: admin.permissions }); };
  const remove = async (id: string) => { if (!window.confirm("Remove this custom administrator?")) return; const res = await fetch(`/api/admin-users?id=${encodeURIComponent(id)}`, { method: "DELETE" }); if (res.ok) await load(); else setMessage("Could not remove administrator."); };
  const toggle = (permission: AdminPermission) => setForm((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] }));

  return <div className="flex flex-col gap-6">
    <div className="border-b border-slate-200 pb-5"><div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Platform &amp; Security</div><h1 className="text-2xl font-bold text-slate-900">Custom Admin Users</h1><p className="mt-1 text-sm text-slate-500">Create operational administrators with scoped module access. Super Admin credentials and management remain protected.</p></div>
    {message && <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">{message}</div>}
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Administrators</h2><p className="text-xs text-slate-500">Only the Super Admin can create, edit, deactivate, or remove these accounts.</p></div>{admins.length === 0 ? <p className="p-6 text-sm text-slate-500">No custom administrators created yet.</p> : <div className="divide-y divide-slate-100">{admins.map((admin) => <div key={admin.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><div className="font-semibold text-slate-900">{admin.fullName}</div><div className="text-sm text-slate-500">{admin.email}</div><div className="mt-1 text-xs text-slate-400">{admin.permissions.length} module permissions</div></div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${admin.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{admin.status}</span><button onClick={() => edit(admin)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Edit</button><button onClick={() => remove(admin.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">Remove</button></div></div>)}</div>}</section>
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{editing ? "Edit administrator" : "Create administrator"}</h2><div className="mt-4 flex flex-col gap-3"><label className="text-xs font-semibold text-slate-600">Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Administrator name" /></label><label className="text-xs font-semibold text-slate-600">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="admin@company.example" /></label><label className="text-xs font-semibold text-slate-600">{editing ? "New password (optional)" : "Initial password"}<input required={!editing} minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="At least 8 characters" /></label><label className="text-xs font-semibold text-slate-600">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option>ACTIVE</option><option>INACTIVE</option></select></label><div><div className="text-xs font-semibold text-slate-600">Module permissions</div><div className="mt-2 grid gap-2">{permissionLabels.map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.permissions.includes(value)} onChange={() => toggle(value)} />{label}</label>)}</div></div><div className="flex gap-2 pt-2"><button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create admin"}</button>{editing && <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>}</div></div></form>
    </div>
  </div>;
}
