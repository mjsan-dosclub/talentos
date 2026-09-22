import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password-server";

const permissions = ["STUDENTS", "EXPERTS", "INSTITUTIONS", "WORKSHOPS", "NOTIFICATIONS", "GOVERNANCE", "SETTINGS"] as const;
const fields = "id,full_name,email,permissions,status,must_reset_password,created_at,updated_at";
const map = (row: any) => ({ id: row.id, fullName: row.full_name, email: row.email, permissions: row.permissions || [], status: row.status, mustResetPassword: row.must_reset_password, createdAt: row.created_at, updatedAt: row.updated_at });

function cleanPermissions(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && permissions.includes(item as any)) : [];
}

export async function GET() {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const { data, error } = await supabaseAdmin.from("custom_admins").select(fields).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, admins: (data || []).map(map) });
}

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const body = await req.json();
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();
  if (!fullName || !email || !password) return NextResponse.json({ error: "Name, email, and initial password are required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Initial password must be at least 8 characters." }, { status: 400 });
  const selectedPermissions = cleanPermissions(body.permissions);
  if (!selectedPermissions.length) return NextResponse.json({ error: "Select at least one module permission." }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("custom_admins").insert({ full_name: fullName, email, password_hash: hashPassword(password), permissions: selectedPermissions, status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE", must_reset_password: true }).select(fields).single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ success: true, admin: map(data) }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Admin ID is required." }, { status: 400 });
  const updates: Record<string, unknown> = {};
  if (body.fullName !== undefined) updates.full_name = String(body.fullName).trim();
  if (body.email !== undefined) updates.email = String(body.email).trim().toLowerCase();
  if (body.status !== undefined) updates.status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
  if (body.permissions !== undefined) updates.permissions = cleanPermissions(body.permissions);
  if (body.password) {
    if (String(body.password).trim().length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    updates.password_hash = hashPassword(String(body.password).trim());
    updates.must_reset_password = true;
  }
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from("custom_admins").update(updates).eq("id", body.id).select(fields).single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ success: true, admin: map(data) });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Admin ID is required." }, { status: 400 });
  const { error } = await supabaseAdmin.from("custom_admins").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
