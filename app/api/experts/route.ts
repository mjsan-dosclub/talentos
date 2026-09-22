import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password-server";

const fields = "id,full_name,email,phone,organization,designation,bio,avatar,linkedin_url,github_url,domain_specialties,assigned_workshops,status,created_at";
const map = (e: any) => ({ id: e.id, fullName: e.full_name, email: e.email, phone: e.phone, organization: e.organization, designation: e.designation, bio: e.bio, avatar: e.avatar, linkedinUrl: e.linkedin_url, githubUrl: e.github_url, domainSpecialties: e.domain_specialties || [], assignedWorkshops: e.assigned_workshops || [], status: e.status });

export async function GET() {
  const { data, error } = await supabaseAdmin.from("experts").select(fields).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ experts: (data || []).map(map), isLiveDb: true });
}

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const b = await req.json();
  if (!b.fullName?.trim() || !b.email?.trim() || !b.phone?.trim() || !b.password?.trim()) return NextResponse.json({ error: "Name, email, phone, and an initial password are required" }, { status: 400 });
  if (b.password.trim().length < 8) return NextResponse.json({ error: "Initial password must be at least 8 characters" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("experts").insert({ id: crypto.randomUUID(), full_name: b.fullName.trim(), email: b.email.trim().toLowerCase(), phone: b.phone.trim(), organization: b.organization?.trim() || "", designation: b.designation?.trim() || "", bio: b.bio || "", avatar: b.avatar || "", linkedin_url: b.linkedinUrl || "", github_url: b.githubUrl || "", domain_specialties: b.domainSpecialties || [], assigned_workshops: b.assignedWorkshops || [], status: b.status || "ACTIVE", password_hash: hashPassword(b.password.trim()), must_reset_password: true }).select(fields).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, expert: map(data) }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const b = await req.json(); const { id, ...rest } = b;
  if (!id) return NextResponse.json({ error: "Expert ID required" }, { status: 400 });
  const updates: any = {}; const keys: Record<string,string> = { fullName:"full_name", email:"email", phone:"phone", organization:"organization", designation:"designation", bio:"bio", avatar:"avatar", linkedinUrl:"linkedin_url", githubUrl:"github_url", domainSpecialties:"domain_specialties", assignedWorkshops:"assigned_workshops", status:"status" };
  Object.keys(keys).forEach((k) => { if (rest[k] !== undefined) updates[keys[k]] = rest[k]; });
  if (typeof rest.password === "string" && rest.password.trim()) {
    if (rest.password.trim().length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    updates.password_hash = hashPassword(rest.password.trim());
    updates.must_reset_password = true;
  }
  const { data, error } = await supabaseAdmin.from("experts").update(updates).eq("id", id).select(fields).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, expert: map(data) });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Expert ID required" }, { status: 400 });
  const { error } = await supabaseAdmin.from("experts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
