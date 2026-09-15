import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email-service";

// In-memory fallback ledger for enquiries so admin panel displays submissions even when database is offline
export interface EnquiryRecord {
  id: string;
  enquiry_ref: string;
  full_name: string;
  phone: string;
  email: string;
  current_role: string;
  referral_source: string;
  message: string;
  status: "NEW" | "CONTACTED" | "ACCEPTED" | "INACTIVE";
  created_at: string;
}
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");

const INITIAL_ENQUIRIES: EnquiryRecord[] = [
  {
    id: "enq-001",
    enquiry_ref: "ENQ-2026-4819",
    full_name: "Siddharth Raman",
    phone: "+91 98401 23456",
    email: "siddharth.r@annauniv.edu",
    current_role: "Engineering Student (Year 3-4)",
    referral_source: "Campus Workshop / College Event",
    message: "Interested in Systems Pod Alpha and distributed consensus track for CodeZap 3.0.",
    status: "NEW",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "enq-002",
    enquiry_ref: "ENQ-2026-7291",
    full_name: "Divya Natesan",
    phone: "+91 97909 87654",
    email: "divya.n@mitindia.edu",
    current_role: "Recent Engineering Graduate",
    referral_source: "LinkedIn / Social Media",
    message: "Seeking zero-trust security track and hands-on Linux kernel internals training.",
    status: "CONTACTED",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function ensureEnquiriesFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ENQUIRIES_FILE)) {
      fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(INITIAL_ENQUIRIES, null, 2), "utf-8");
    }
  } catch {
    // Non-blocking fallback
  }
}

function loadEnquiries(): EnquiryRecord[] {
  ensureEnquiriesFile();
  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(ENQUIRIES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed reading enquiries.json:", e);
  }
  return [...INITIAL_ENQUIRIES];
}

function saveEnquiries(data: EnquiryRecord[]): void {
  ensureEnquiriesFile();
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed writing enquiries.json:", e);
  }
}

export async function GET() {
  try {
    // Try querying Supabase
    const { data, error } = await supabase
      .from("aspirant_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ enquiries: data });
    }
  } catch (err) {
    // Fallback to disk
  }

  return NextResponse.json({ enquiries: loadEnquiries() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Anti-Bot Honeypot Trap (Drops automated bots filling hidden input)
    const honeypot = body.hp_company_url || body.honeypot || body.website_url;
    if (honeypot && String(honeypot).trim().length > 0) {
      console.warn("[Anti-Bot] Automated spam bot caught via honeypot trap. Aborting email dispatch.");
      return NextResponse.json({
        success: true,
        enquiryId: "ENQ-BOT-FILTERED",
        message: "Request received.",
      });
    }

    // 2. Anti-Bot CAPTCHA Verification
    const captchaToken = body.captcha_token;
    const captchaAnswer = body.captcha_answer;

    if (captchaToken !== undefined && captchaToken !== null && String(captchaToken).trim().length > 0) {
      try {
        const decoded = JSON.parse(Buffer.from(String(captchaToken), "base64").toString("utf-8"));
        const expected = Number(decoded.a) + Number(decoded.b);
        if (Number(captchaAnswer) !== expected) {
          return NextResponse.json(
            { error: "Anti-bot verification failed. Please enter the correct answer to the security challenge." },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Security challenge expired or invalid. Please click the refresh icon to try a new challenge." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Anti-bot security verification is required to submit this form." },
        { status: 400 }
      );
    }

    const name = body.name || body.fullName;
    const phone = body.phone || body.whatsapp || body.contact;
    const email = body.email;
    const currentRole = body.current_role || body.category || "Engineering Student (Year 3-4)";
    const referralSource = body.referral_source || body.source || "Web Search / Direct";
    const message = body.message || body.statement || "";

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Institution Contact Person, Phone Number, and Institutional Email are all required." },
        { status: 400 }
      );
    }

    const enquiryId = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const newRecord: EnquiryRecord = {
      id: `enq-${Date.now()}`,
      enquiry_ref: enquiryId,
      full_name: name,
      phone,
      email,
      current_role: currentRole,
      referral_source: referralSource,
      message,
      status: "NEW",
      created_at: timestamp,
    };

    const enquiries = loadEnquiries();
    enquiries.unshift(newRecord);
    saveEnquiries(enquiries);

    // Best-effort insertion into Supabase
    try {
      await supabase.from("aspirant_enquiries").insert([
        {
          id: crypto.randomUUID(),
          enquiry_ref: enquiryId,
          full_name: name,
          email,
          phone,
          institution: currentRole,
          statement: `[Source: ${referralSource}] ${message}`,
          created_at: timestamp,
        },
      ]);
    } catch (dbErr) {
      console.warn("Supabase aspirant_enquiries notice:", dbErr);
    }

    // 1. Dispatch Candidate Auto-Responder Email (Thank You + Social Channels + Anti-Spam Whitelist)
    const candidateHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #0f172a;">
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: -0.02em;">DeScience Open Source Club</h2>
          <p style="color: #38bdf8; margin: 4px 0 0; font-size: 12px; font-weight: 600;">Admissions & Cohort Allocation Directorate</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${name}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Thank you for applying to the DeScience Open Source Club Systems Engineering Fellowship (Reference: <strong style="color: #2563eb;">${enquiryId}</strong>).
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Our admissions pod has received your submission. A mentor will review your background and reach out via WhatsApp / Email within 24–48 hours for your technical diagnostic evaluation.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a;">
            While You Wait &mdash; Connect With Our Builders Community:
          </h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #334155;">
            <li><strong>WhatsApp Community Channel:</strong> <a href="https://whatsapp.com/channel/0029VaDeScienceOSClub" style="color: #2563eb; text-decoration: none;">Join Channel &rarr;</a></li>
            <li><strong>Discord Builders Server:</strong> <a href="https://discord.gg/descience-osclub" style="color: #2563eb; text-decoration: none;">discord.gg/descience-osclub &rarr;</a></li>
            <li><strong>GitHub Commons:</strong> <a href="https://github.com/descience-osclub" style="color: #2563eb; text-decoration: none;">github.com/descience-osclub &rarr;</a></li>
            <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/touchmark-descience/" style="color: #2563eb; text-decoration: none;">Touchmark DeScience &rarr;</a></li>
          </ul>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
          <strong>CRITICAL ANTI-SPAM NOTICE:</strong><br/>
          To prevent our evaluation pass invitation from landing in your Spam or Promotions folder, please add <strong>admissions@dosclub.org</strong> and <strong>notifications@dosclub.org</strong> to your email contacts right now.
        </div>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          DeScience Open Source Club &bull; TalentOS Student Growth Engine<br/>
          This is an automated transmission dispatched with Global CC logging.
        </p>
      </div>
    `;

    const candidateText = `
Dear ${name},

Thank you for your interest in joining DeScience Open Source Club (Ref: ${enquiryId}).

Our admissions and cohort allocation pod has received your information. A mentor will reach out via WhatsApp / Email within 24–48 hours to discuss your engineering background and upcoming admissions evaluation rounds.

WHILE YOU WAIT — CONNECT WITH OUR COMMUNITY:
- WhatsApp Community Channel: https://whatsapp.com/channel/0029VaDeScienceOSClub
- Discord Builders Server: https://discord.gg/descience-osclub
- LinkedIn: https://www.linkedin.com/company/touchmark-descience/
- GitHub Commons: https://github.com/descience-osclub

ANTI-SPAM TIP:
Please save admissions@dosclub.org in your contacts so our interview scheduling invitation does not get delayed in your Spam folder.

Warm regards,
Admissions Directorate
DeScience Open Source Club
    `.trim();

    const candidateEmailResult = await sendEmail({
      to: email,
      subject: `We received your DOS Club Admissions Enquiry (Ref: ${enquiryId})`,
      text: candidateText,
      html: candidateHtml,
    });

    // 2. Dispatch Admin Alert Email
    const adminAlertText = `
TalentOS Admissions Alert:

A new admissions enquiry has been submitted on the landing page:
- Reference: ${enquiryId}
- Candidate Name: ${name}
- WhatsApp Contact: ${phone}
- Email Address: ${email}
- Current Role: ${currentRole}
- Referral Source: ${referralSource}

Candidate Statement / Message:
"${message || "No statement provided"}"

Review and manage this application in your Admin Console:
http://localhost:3000/admin?tab=enquiries

TalentOS Automated Dispatch
    `.trim();

    const adminAlertHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background: #dc2626; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px;">🚨 New Admissions Enquiry Received</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
          <tr><td style="color: #64748b; width: 140px; padding: 4px 0;">Reference ID:</td><td style="font-weight: bold; color: #0f172a;">${enquiryId}</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">Candidate:</td><td style="font-weight: bold; color: #0f172a;">${name}</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">Mobile (WhatsApp):</td><td style="font-weight: bold; color: #15803d;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="color: #15803d; text-decoration: none;">${phone} (Chat on WhatsApp)</a></td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">Email:</td><td style="color: #2563eb;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">Current Role:</td><td>${currentRole}</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">Source:</td><td>${referralSource}</td></tr>
        </table>
        ${
          message
            ? `<div style="background: #f8fafc; border-left: 3px solid #64748b; padding: 10px 14px; margin: 16px 0; font-size: 13px; font-style: italic;">
                "${message}"
               </div>`
            : ""
        }
        <div style="margin-top: 20px; text-align: center;">
          <a href="http://localhost:3000/admin?tab=enquiries" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 10px 20px; font-size: 12px; font-weight: bold; border-radius: 6px;">
            Open Enquiries Admin Roster &rarr;
          </a>
        </div>
      </div>
    `;

    const adminEmail = "admissions@dosclub.org";
    const adminEmailResult = await sendEmail({
      to: adminEmail,
      subject: `🚨 New Admissions Enquiry: ${name} (${currentRole})`,
      text: adminAlertText,
      html: adminAlertHtml,
    });

    console.log(`[TalentOS Notification] Candidate Confirmation:`, candidateEmailResult);
    console.log(`[TalentOS Notification] Admin Email Alert:`, adminEmailResult);

    // 3. Best-effort logging in notification_dispatches
    try {
      await supabase.from("notification_dispatches").insert([
        {
          channel: "EMAIL",
          title: `Admissions Enquiry Acknowledged (${enquiryId})`,
          content: `Auto-responder sent to ${name} (${email}) with WhatsApp & Discord community onboarding links. Admin alerted with Global CC.`,
          dispatched_by: "SYSTEM_ADMISSIONS_POD",
          sent_count: 2 + (candidateEmailResult.recipients.cc.length || 0),
          created_at: timestamp,
        },
      ]);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      enquiryId,
      enquiry: newRecord,
      message: "Enquiry submitted successfully! We sent a confirmation to your email. Check your inbox and join our WhatsApp community.",
      socialChannels: {
        whatsapp: "https://whatsapp.com/channel/0029VaDeScienceOSClub",
        discord: "https://discord.gg/descience-osclub",
        linkedin: "https://www.linkedin.com/company/touchmark-descience/",
        github: "https://github.com/descience-osclub",
        twitter: "https://x.com/descience_club",
        youtube: "https://youtube.com/@descienceosclub",
      },
    });
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { error: "Failed to process enquiry. Please try again or connect directly via the membership portal." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ids, status } = body;

    const targetIds: string[] = ids ? ids : id ? [id] : [];
    if (targetIds.length === 0 || !status) {
      return NextResponse.json(
        { error: "Enquiry ID(s) and target status are required." },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const enquiries = loadEnquiries();
    const updated = enquiries.map((enq) => {
      if (targetIds.includes(enq.id) || targetIds.includes(enq.enquiry_ref)) {
        updatedCount++;
        return { ...enq, status: status as EnquiryRecord["status"] };
      }
      return enq;
    });
    saveEnquiries(updated);

    // Best-effort update in Supabase
    try {
      await supabase
        .from("aspirant_enquiries")
        .update({ status })
        .in("id", targetIds);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      status,
      message: `Successfully updated ${updatedCount} enquiry record(s) to ${status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update enquiry status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    let targetIds: string[] = [];
    if (queryId) {
      targetIds = [queryId];
    } else {
      try {
        const body = await req.json();
        if (body.ids && Array.isArray(body.ids)) {
          targetIds = body.ids;
        } else if (body.id) {
          targetIds = [body.id];
        }
      } catch {
        // No json body
      }
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: "Enquiry ID(s) required for deletion." },
        { status: 400 }
      );
    }

    const enquiries = loadEnquiries();
    const initialLen = enquiries.length;
    const filtered = enquiries.filter(
      (enq) => !targetIds.includes(enq.id) && !targetIds.includes(enq.enquiry_ref)
    );
    const deletedCount = initialLen - filtered.length;
    saveEnquiries(filtered);

    // Best-effort delete in Supabase
    try {
      await supabase
        .from("aspirant_enquiries")
        .delete()
        .in("id", targetIds);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} enquiry record(s).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete enquiry record(s)" },
      { status: 500 }
    );
  }
}
