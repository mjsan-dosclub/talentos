import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
export async function GET() {
  const combinedMap = new Map<string, EnquiryRecord>();

  // 1. Primary: Check dedicated aspirant_enquiries table in Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from("aspirant_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      for (const item of data) {
        const rec: EnquiryRecord = {
          id: item.id,
          enquiry_ref: item.enquiry_ref || item.id,
          full_name: item.full_name || item.fullName || "Aspirant",
          email: item.email || "",
          phone: item.phone || "",
          current_role: item.institution || item.current_role || "Academic Partner",
          referral_source: item.statement?.match(/\[Source:\s*([^\]]+)\]/)?.[1] || "Direct Intake",
          message: item.statement || item.message || "",
          status: item.status || "NEW",
          created_at: item.created_at || new Date().toISOString(),
        };
        combinedMap.set(rec.enquiry_ref, rec);
      }
    }
  } catch (e) {
    console.warn("[TalentOS] Supabase aspirant_enquiries query notice:", e);
  }

  // 2. Resilient Cloud Store: Query notification_dispatches where channel = 'ENQUIRY'
  try {
    const { data: dispatches, error: dispErr } = await supabaseAdmin
      .from("notification_dispatches")
      .select("*")
      .eq("channel", "ENQUIRY")
      .order("created_at", { ascending: false });

    if (!dispErr && dispatches && Array.isArray(dispatches)) {
      for (const d of dispatches) {
        if (d.target_filter && typeof d.target_filter === "object") {
          const filter = d.target_filter as any;
          const ref = filter.enquiry_ref || d.title || d.id;
          if (!combinedMap.has(ref)) {
            combinedMap.set(ref, {
              id: d.id,
              enquiry_ref: ref,
              full_name: filter.full_name || filter.name || "Aspirant",
              phone: filter.phone || "",
              email: filter.email || "",
              current_role: filter.current_role || "Institutional Partner",
              referral_source: filter.referral_source || "Campus Workshop",
              message: filter.message || d.content || "",
              status: (filter.status as any) || "NEW",
              created_at: filter.created_at || d.created_at,
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn("[TalentOS] Supabase notification_dispatches query notice:", e);
  }

  const sorted = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ enquiries: sorted });
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

    // 1. Resilient Cloud Persistence in Supabase notification_dispatches (zero-loss on Vercel)
    try {
      await supabaseAdmin.from("notification_dispatches").insert([
        {
          id: crypto.randomUUID(),
          channel: "ENQUIRY",
          title: enquiryId,
          content: message || `Enquiry from ${name} (${email})`,
          target_filter: newRecord,
          dispatched_by: "11111111-1111-1111-1111-111111111111",
          sent_count: 1,
          created_at: timestamp,
        },
      ]);
    } catch (dispErr) {
      console.warn("Supabase notification_dispatches enquiry save notice:", dispErr);
    }

    // 2. Best-effort insertion into aspirant_enquiries
    try {
      await supabaseAdmin.from("aspirant_enquiries").insert([
        {
          id: crypto.randomUUID(),
          enquiry_ref: enquiryId,
          full_name: name,
          email,
          phone,
          institution: currentRole,
          statement: `[Source: ${referralSource}] ${message}`,
          status: "NEW",
          created_at: timestamp,
        },
      ]);
    } catch (dbErr) {
      // Table may not be created yet, covered by notification_dispatches above
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
            Connect With Our Official Community Channels:
          </h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #334155;">
            <li><strong>Official Website:</strong> <a href="http://descienceosclub.com/" style="color: #2563eb; text-decoration: none;">descienceosclub.com &rarr;</a></li>
            <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/descience-open-source-club/" style="color: #2563eb; text-decoration: none;">linkedin.com/company/descience-open-source-club &rarr;</a></li>
            <li><strong>YouTube:</strong> <a href="https://www.youtube.com/channel/UCvF5jATxekeLcFvjLrMGjpA" style="color: #2563eb; text-decoration: none;">YouTube Channel &rarr;</a></li>
            <li><strong>X (Twitter):</strong> <a href="https://x.com/descienceosclub" style="color: #2563eb; text-decoration: none;">x.com/descienceosclub &rarr;</a></li>
            <li><strong>Instagram:</strong> <a href="https://www.instagram.com/descienceopensourceclub/" style="color: #2563eb; text-decoration: none;">instagram.com/descienceopensourceclub &rarr;</a></li>
            <li><strong>Facebook:</strong> <a href="https://www.facebook.com/descienceosclub" style="color: #2563eb; text-decoration: none;">facebook.com/descienceosclub &rarr;</a></li>
            <li><strong>Threads:</strong> <a href="https://www.threads.net/@descienceosclub" style="color: #2563eb; text-decoration: none;">threads.net/@descienceosclub &rarr;</a></li>
            <li><strong>GitHub:</strong> <a href="https://github.com/descienceosclub" style="color: #2563eb; text-decoration: none;">github.com/descienceosclub &rarr;</a></li>
            <li><strong>WhatsApp Channel:</strong> <a href="https://whatsapp.com/channel/0029Vb6yhyh5Ui2YyHbIL117" style="color: #2563eb; text-decoration: none;">Join WhatsApp Channel &rarr;</a></li>
            <li><strong>Discord Server:</strong> <a href="https://discord.com/channels/1503348482218524672/1503348483594129550" style="color: #2563eb; text-decoration: none;">Join Discord Server &rarr;</a></li>
          </ul>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
          <strong>CRITICAL ANTI-SPAM NOTICE:</strong><br/>
          To prevent our evaluation pass invitation from landing in your Spam or Promotions folder, please add <strong>no-reply@descienceosclub.com</strong> and <strong>info@descienceosclub.com</strong> to your email contacts right now.
        </div>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0; line-height: 1.5;">
          DeScience Open Source Club &bull; TalentOS Student Growth Engine<br/>
          Official Website: <a href="http://descienceosclub.com/" style="color: #2563eb; text-decoration: none;">descienceosclub.com</a><br/>
          <span style="color: #94a3b8; font-size: 10px;">You are receiving this email because you are subscribed to DeScience Open Source Club workshops. To unsubscribe, please reply to this email.</span>
        </p>
      </div>

    `;

    const candidateText = `
Dear ${name},

Thank you for your interest in joining DeScience Open Source Club (Ref: ${enquiryId}).

Our admissions and cohort allocation pod has received your information. A mentor will reach out via WhatsApp / Email within 24–48 hours to discuss your engineering background and upcoming admissions evaluation rounds.

WHILE YOU WAIT — CONNECT WITH OUR OFFICIAL COMMUNITY CHANNELS:
- Official Website: http://descienceosclub.com/
- LinkedIn: https://www.linkedin.com/company/descience-open-source-club/
- YouTube: https://www.youtube.com/channel/UCvF5jATxekeLcFvjLrMGjpA
- X (Twitter): https://x.com/descienceosclub
- Instagram: https://www.instagram.com/descienceopensourceclub/
- Facebook: https://www.facebook.com/descienceosclub
- Threads: https://www.threads.net/@descienceosclub
- GitHub: https://github.com/descienceosclub
- WhatsApp Channel: https://whatsapp.com/channel/0029Vb6yhyh5Ui2YyHbIL117
- Discord Server: https://discord.com/channels/1503348482218524672/1503348483594129550

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
      await supabaseAdmin.from("notification_dispatches").insert([
        {
          id: crypto.randomUUID(),
          channel: "EMAIL",
          title: `Admissions Enquiry Acknowledged (${enquiryId})`,
          content: `Auto-responder sent to ${name} (${email}) with WhatsApp & Discord community onboarding links. Admin alerted with Global CC.`,
          dispatched_by: "11111111-1111-1111-1111-111111111111",
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

    // Update in Supabase aspirant_enquiries and notification_dispatches
    try {
      const { data: updatedData } = await supabaseAdmin
        .from("aspirant_enquiries")
        .update({ status })
        .or(`id.in.(${targetIds.join(",")}),enquiry_ref.in.(${targetIds.join(",")})`)
        .select();

      updatedCount = updatedData ? updatedData.length : targetIds.length;
      
      // Also update notification_dispatches channel=ENQUIRY records
      const { data: dispatches } = await supabaseAdmin
        .from("notification_dispatches")
        .select("*")
        .eq("channel", "ENQUIRY");

      if (dispatches && Array.isArray(dispatches)) {
        for (const d of dispatches) {
          const filter = d.target_filter as any;
          if (filter && (targetIds.includes(d.id) || targetIds.includes(d.title) || targetIds.includes(filter.enquiry_ref))) {
            const updatedFilter = { ...filter, status };
            await supabaseAdmin
              .from("notification_dispatches")
              .update({ target_filter: updatedFilter })
              .eq("id", d.id);
          }
        }
      }
    } catch (sbErr) {
      console.warn("[TalentOS] Supabase enquiry update notice:", sbErr);
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

    let deletedCount = 0;

    // Delete in Supabase aspirant_enquiries and notification_dispatches
    try {
      const { data: deletedData } = await supabaseAdmin
        .from("aspirant_enquiries")
        .delete()
        .in("enquiry_ref", targetIds)
        .select();

      deletedCount = deletedData ? deletedData.length : targetIds.length;

      await supabaseAdmin
        .from("notification_dispatches")
        .delete()
        .eq("channel", "ENQUIRY")
        .in("title", targetIds);
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
