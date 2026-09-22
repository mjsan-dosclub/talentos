import { NextResponse } from "next/server";
import {
  CANONICAL_NOTIFICATION_TEMPLATES,
  generateGoogleCalendarUrl,
  generateIcsDataUri,
  generateWhatsAppWebUrl,
  NotificationTemplate,
} from "@/lib/notification-templates";
import { requireSuperAdmin } from "@/lib/api-auth";

// In-memory runtime storage for template customizations during local session
let currentTemplates: NotificationTemplate[] = [...CANONICAL_NOTIFICATION_TEMPLATES];

export async function GET(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let filtered = currentTemplates;
  if (category && category !== "ALL") {
    filtered = currentTemplates.filter((t) => t.category === category);
  }

  // Pre-generate sample calendar links for previewing WS-14 workshop assignment
  const sampleEvent = {
    title: "DOS Club WS-14: Distributed Systems & Consensus Defense",
    description: "Lead Technical Expert session on Raft & Paxos consensus validation. Anna University Hub.",
    location: "Anna University & DOS Club Hub, Guindy, Chennai",
    startTime: "2026-09-20T09:00:00+05:30",
    endTime: "2026-09-20T17:00:00+05:30",
  };

  const sampleGoogleCalendarUrl = generateGoogleCalendarUrl(sampleEvent);
  const sampleIcsUrl = generateIcsDataUri(sampleEvent);

  return NextResponse.json({
    templates: filtered,
    meta: {
      total: currentTemplates.length,
      categories: ["COLLEGE", "STUDENT", "TRAINER"],
      calendarSample: {
        googleUrl: sampleGoogleCalendarUrl,
        icsDataUriAvailable: true,
      },
    },
  });
}

export async function PUT(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const { id, subject, body: content } = body;

    if (!id || !subject || !content) {
      return NextResponse.json(
        { error: "Template ID, subject, and body content are required." },
        { status: 400 }
      );
    }

    const index = currentTemplates.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    currentTemplates[index] = {
      ...currentTemplates[index],
      subject,
      body: content,
    };

    return NextResponse.json({
      success: true,
      message: `Template '${currentTemplates[index].name}' updated successfully.`,
      template: currentTemplates[index],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update template." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const { action, templateId, recipientType, recipientTarget, customVariables } = body;

    if (action === "test_dispatch") {
      const template = currentTemplates.find((t) => t.id === templateId);
      if (!template) {
        return NextResponse.json({ error: "Template not found." }, { status: 404 });
      }

      // Populate variables
      let renderedSubject = template.subject;
      let renderedBody = template.body;

      const vars: Record<string, string> = {
        student_name: "Arunachalam Sundaram",
        dos_id: "DOS-B3-001",
        institution_name: "Anna University Campus Hub",
        department: "Computer Science & Engineering",
        workshop_code: "WS-14",
        workshop_title: "Distributed Consensus & Raft Plumbing",
        venue_name: "Anna University & DOS Club Hub, Chennai",
        start_time: "09:00 AM IST",
        end_time: "05:00 PM IST",
        session_date: "20 September 2026",
        cohort_size: "42",
        trainer_name: "Priya Sundaram",
        checkin_url: "https://talentos.dosclub.org/checkin",
        student_dossier_url: "https://talentos.dosclub.org/record/DOS-B3-001",
        college_portal_url: "https://talentos.dosclub.org/college",
        placement_roster_url: "https://talentos.dosclub.org/admin?tab=students",
        trainer_cockpit_url: "https://talentos.dosclub.org/trainer",
        public_ledger_url: "https://talentos.dosclub.org/ledger/DOS-CERT-2026-001",
        cert_id: "DOS-CERT-2026-001",
        sha256_hash: "62c81542f5c668acd536e37918239048a6081048b0a513",
        reviewer_name: "Faculty Lead Vikram Sethupathi",
        test_outcome: "PASSED (20/20 Test Specs)",
        feedback_score: "4.0",
        reviewer_notes: "Exemplary zero-grace commit signature and Raft leader election implementation.",
        commit_sha: "3f98e02",
        present_count: "40",
        total_cohort: "42",
        avg_rating: "3.9",
        feedback_highlight: "Strong clarity on log compaction and network partition test suites.",
        assigned_track: "Kernel & High-Throughput I/O",
        team_id: "TEAM-ALPHA-07",
        hackathon_brief_url: "https://talentos.dosclub.org/briefing/hackathon-b3",
        enrolled_count: "42",
        avg_attendance: "94.2",
        test_pass_rate: "91.8",
        defense_ready_count: "38",
        incident_date: "14 Sep 2026",
        google_calendar_url: generateGoogleCalendarUrl({
          title: "DOS Club WS-14: Distributed Systems & Consensus Defense",
          description: "Technical Expert session on Raft & Paxos consensus validation.",
          location: "Anna University & DOS Club Hub, Guindy, Chennai",
          startTime: "2026-09-20T09:00:00+05:30",
          endTime: "2026-09-20T17:00:00+05:30",
        }),
        apple_calendar_url: generateIcsDataUri({
          title: "DOS Club WS-14: Distributed Systems & Consensus Defense",
          description: "Technical Expert session on Raft & Paxos consensus validation.",
          location: "Anna University & DOS Club Hub, Guindy, Chennai",
          startTime: "2026-09-20T09:00:00+05:30",
          endTime: "2026-09-20T17:00:00+05:30",
        }),
        ...(customVariables || {}),
      };

      for (const [key, val] of Object.entries(vars)) {
        renderedSubject = renderedSubject.replace(new RegExp(`{{${key}}}`, "g"), val);
        renderedBody = renderedBody.replace(new RegExp(`{{${key}}}`, "g"), val);
      }

      const whatsappWebUrl = generateWhatsAppWebUrl(recipientTarget, `*${renderedSubject}*\n\n${renderedBody}`);

      return NextResponse.json({
        success: true,
        dispatched_at: new Date().toISOString(),
        recipientType: recipientType || "SINGLE_TEST",
        recipientTarget: recipientTarget || "test@dosclub.org",
        renderedSubject,
        renderedBody,
        whatsappWebUrl,
      });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process dispatch." }, { status: 500 });
  }
}
