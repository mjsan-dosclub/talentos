import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email-service";
import { PartnerInstitution } from "@/lib/admin-data";
import { requireSuperAdmin } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password-server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("institutions")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped: PartnerInstitution[] = data.map((inst: any) => ({
        id: inst.id,
        code: inst.code,
        name: inst.name,
        city: inst.name?.includes("Chennai") ? "Chennai" : inst.name?.includes("Coimbatore") ? "Coimbatore" : "Tamil Nadu Hub",
        state: "Tamil Nadu",
        tier: "Partner Institution Hub",
        region: "Tamil Nadu, India",
        lat: Number(inst.default_lat) || 13.011,
        lng: Number(inst.default_lng) || 80.2354,
        geofenceRadiusMeters: inst.geofence_radius_meters || 200,
        studentCount: 40,
        status: inst.is_active ? "ACTIVE" : "INACTIVE",
        pocName: inst.contact_person || "Institutional Coordinator",
        pocRole: "Point of Contact",
        pocEmail: inst.contact_email,
        pocPhone: inst.contact_phone || "",
      }));

      return NextResponse.json({ success: true, count: mapped.length, institutions: mapped });
    }

    return NextResponse.json({ success: true, count: 0, institutions: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  try {
    const body = await req.json();
    const { name, code, contact_person, contact_email, contact_phone, lat, lng, geofenceRadiusMeters } = body;

    const instName = (name || body.institutionName || "").trim();
    const instCode = (code || body.institutionCode || `INST-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
    const pocName = (contact_person || body.pocName || "Institutional Coordinator").trim();
    const pocEmail = (contact_email || body.pocEmail || "").trim().toLowerCase();
    const pocPhone = (contact_phone || body.pocPhone || "").trim();

    const initialPassword = String(body.password || "").trim();
    if (!instName || !pocEmail || !pocPhone || !initialPassword) {
      return NextResponse.json({ error: "Institution Name, POC Email, POC Phone, and an initial password are required." }, { status: 400 });
    }
    if (initialPassword.length < 8) {
      return NextResponse.json({ error: "Initial password must be at least 8 characters." }, { status: 400 });
    }

    const newId = crypto.randomUUID();

    // 1. Insert into Supabase
    let dbSuccess = false;
    try {
      const { data, error } = await supabaseAdmin
        .from("institutions")
        .insert([
          {
            id: newId,
            name: instName,
            code: instCode,
            contact_person: pocName,
            contact_email: pocEmail,
            contact_phone: pocPhone,
            default_lat: Number(lat) || 13.011,
            default_lng: Number(lng) || 80.2354,
            geofence_radius_meters: Number(geofenceRadiusMeters) || 200,
            is_active: true,
            password_hash: hashPassword(initialPassword),
            must_reset_password: true,
          },
        ])
        .select();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      dbSuccess = true;
    } catch (e) {
      console.warn("[TalentOS] Supabase institution insert exception:", e);
      return NextResponse.json({ error: "Could not create the institution record." }, { status: 500 });
    }

    // 2. Dispatch College Partnership Welcome & Onboarding Email
    const portalUrl = `https://dosclub-talentos.vercel.app/college`;
    try {
      await sendEmail({
        to: pocEmail,
        subject: `Welcome to TalentOS Partnership — Institutional Hub Setup (${instCode})`,
        text: `Dear ${pocName},\n\nWe are pleased to welcome ${instName} as an official partner institution in the DeScience Open Source Club Systems Engineering Fellowship.\n\nInstitutional Code: ${instCode}\nDesignated Hub Coordinator: ${pocName}\n\nAccess your College Institutional Portal to manage batch allocations and review live workshop reports:\n${portalUrl}\n\nDeScience Open Source Club — Academic Partnerships Directorate\nnotifications@descienceosclub.com`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #0f172a;">
            <div style="background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: -0.02em;">DeScience Open Source Club</h2>
              <p style="color: #38bdf8; margin: 4px 0 0; font-size: 12px; font-weight: 600;">Academic Partnerships & Campus Hub Directorate</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Dear <strong>${pocName}</strong>,<br/><br/>
              We are delighted to confirm <strong>${instName}</strong> as an official academic partner institution in the DeScience Open Source Club Systems Engineering Fellowship.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                Institutional Partner Accreditation
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">
                ${instName}
              </div>
              <div style="font-size: 13px; color: #0284c7; margin-top: 4px; font-family: monospace; font-weight: 700;">
                Hub Code: ${instCode} &bull; Geofence: ${geofenceRadiusMeters || 200}m
              </div>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Your dedicated College Portal allows department heads and faculty leads to track zero-grace student attendance, view defense milestones, and receive executive session summaries:
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${portalUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px;">
                Open College Institutional Portal &rarr;
              </a>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
              DeScience Open Source Club &bull; TalentOS Academic Operations<br/>
              Official Website: <a href="http://descienceosclub.com/" style="color: #2563eb; text-decoration: none;">descienceosclub.com</a><br/>
              <span style="color: #94a3b8; font-size: 10px;">You are receiving this email because you are subscribed to DeScience Open Source Club workshops and academic operations. To unsubscribe, please reply to this email.</span>
            </div>


          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("[TalentOS] College welcome email exception:", mailErr);
    }

    const createdRecord: PartnerInstitution = {
      id: newId,
      code: instCode,
      name: instName,
      city: "Chennai",
      state: "Tamil Nadu",
      tier: "Partner Institution Hub",
      region: "Tamil Nadu, India",
      lat: Number(lat) || 13.011,
      lng: Number(lng) || 80.2354,
      geofenceRadiusMeters: Number(geofenceRadiusMeters) || 200,
      studentCount: 0,
      status: "ACTIVE",
      pocName,
      pocRole: "Point of Contact",
      pocEmail,
      pocPhone,
    };

    return NextResponse.json({
      success: true,
      institution: createdRecord,
      persistedInDb: dbSuccess,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const code = searchParams.get("code");

    if (!id && !code) {
      return NextResponse.json({ error: "Institution id or code required." }, { status: 400 });
    }

    if (id) {
      await supabaseAdmin.from("institutions").delete().eq("id", id);
    } else if (code) {
      await supabaseAdmin.from("institutions").delete().eq("code", code);
    }

    return NextResponse.json({ success: true, message: "Institution deleted from database." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  const body = await req.json();
  const { id, name, code, pocName, pocEmail, pocPhone } = body;
  if (!id) return NextResponse.json({ error: "Institution id required." }, { status: 400 });
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code;
  if (pocName !== undefined) updates.contact_person = pocName;
  if (pocEmail !== undefined) updates.contact_email = pocEmail;
  if (pocPhone !== undefined) updates.contact_phone = pocPhone;
  if (body.lat !== undefined) updates.default_lat = Number(body.lat);
  if (body.lng !== undefined) updates.default_lng = Number(body.lng);
  if (body.geofenceRadiusMeters !== undefined) updates.geofence_radius_meters = Number(body.geofenceRadiusMeters);
  if (body.status !== undefined) updates.is_active = body.status === "ACTIVE";
  if (typeof body.password === "string" && body.password.trim()) {
    if (body.password.trim().length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    updates.password_hash = hashPassword(body.password.trim());
    updates.must_reset_password = true;
  }
  const { error } = await supabaseAdmin.from("institutions").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
