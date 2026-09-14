/**
 * TalentOS Notification Engine — Canonical Templates & Free Calendar Integrations
 * Channels: Email, Push (FCM), WhatsApp (Web & 1-Click Copy-and-Send)
 */

export interface NotificationTemplate {
  id: string;
  category: "COLLEGE" | "STUDENT" | "TRAINER";
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  hasCalendarLinks?: boolean;
}

/**
 * Converts ISO date strings to UTC basic format required by Google & iCal (YYYYMMDDTHHmmssZ)
 */
export function formatToCalendarDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return "20260920T033000Z";
    }
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  } catch {
    return "20260920T033000Z";
  }
}

/**
 * Free Google Calendar 1-Click Event Link
 * Opens directly in the user's Google Calendar with all prefilled details
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}): string {
  const start = formatToCalendarDate(event.startTime);
  const end = formatToCalendarDate(event.endTime);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Free Apple / Outlook / iCal RFC 5545 .ics Data URI
 * Works natively on iOS, macOS, Windows, and Android without any API or third-party cost
 */
export function generateIcsDataUri(event: {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}): string {
  const start = formatToCalendarDate(event.startTime);
  const end = formatToCalendarDate(event.endTime);
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DeScience Open Source Club//TalentOS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title.replace(/[,;]/g, " ")}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n").replace(/[,;]/g, " ")}`,
    `LOCATION:${event.location.replace(/[,;]/g, " ")}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines.join("\r\n"))}`;
}

/**
 * Formats WhatsApp text message with WhatsApp Web link (wa.me)
 */
export function generateWhatsAppWebUrl(phone: string | undefined, message: string): string {
  const cleanedPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const encodedText = encodeURIComponent(message);
  if (cleanedPhone) {
    return `https://wa.me/${cleanedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Canonical List of 9 Production Email & Communication Templates
 */
export const CANONICAL_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // ---------------------------------------------------------------------------
  // Category 1: College <-> DOS Club (Regular Institutional Communication)
  // ---------------------------------------------------------------------------
  {
    id: "college_monthly_digest",
    category: "COLLEGE",
    name: "College Monthly Academic Standing Digest",
    description: "Regular aggregate report sent to college principals, HODs, and placement officers detailing cohort attendance, milestone completions, and top performers.",
    subject: "TalentOS Monthly Report: {{institution_name}} Cohort Progress & Attendance Digest",
    body: `Respected Dean / Head of Department,

Greetings from DeScience Open Source Club.

Here is the monthly executive digest for students enrolled from {{institution_name}} in the Batch 3 Systems Engineering Cohort:

- Total Enrolled Students: {{enrolled_count}}
- Average Zero-Grace Attendance: {{avg_attendance}}%
- Hermetic Test Pass Rate: {{test_pass_rate}}%
- Students in Active Defense Standing: {{defense_ready_count}}

Detailed student audit trails and individual skill maturity matrices are available live in your College Portal:
{{college_portal_url}}

If any student requires academic intervention or schedule accommodations, please reply directly to this notice.

With regards,
DOS Club Executive Secretariat
TalentOS Academic Operations`,
    variables: ["institution_name", "enrolled_count", "avg_attendance", "test_pass_rate", "defense_ready_count", "college_portal_url"],
  },
  {
    id: "college_absence_sanction",
    category: "COLLEGE",
    name: "Student Attendance Sanction Notice",
    description: "Official sanction notification sent to college coordinators when a student breaches the zero-grace attendance threshold without an approved excuse.",
    subject: "ATTENDANCE SANCTION NOTICE: {{student_name}} ({{dos_id}}) - {{institution_name}}",
    body: `Dear Institution Faculty Coordinator,

Notice of Attendance Breach under DOS Club Zero-Grace Protocol:

Student: {{student_name}}
DOS ID: {{dos_id}}
Department: {{department}}
Missed Workshop: {{workshop_code}} — {{workshop_title}}
Incident Date: {{incident_date}}

Under the DeScience Open Source Club governance guidelines, missing an in-person workshop without prior approved leave marks the student's status as ABSENT_UNCONFIRMED and suspends automatic certificate issuance.

Please review the student's longitudinal ledger and submit an official institutional clarification if this absence was due to approved college examinations:
{{student_dossier_url}}

Sincerely,
Office of Academic Standards
DeScience Open Source Club`,
    variables: ["student_name", "dos_id", "institution_name", "department", "workshop_code", "workshop_title", "incident_date", "student_dossier_url"],
  },
  {
    id: "college_semester_readiness",
    category: "COLLEGE",
    name: "Semester Capstone & Placement Readiness Accreditation",
    description: "Accreditation summary sent to placement directorates confirming cohort members who have completed 20+ verified workshop test specs and are ready for hiring.",
    subject: "Industry Hiring Readiness: {{institution_name}} Batch 3 Engineers Cleared for Placement",
    body: `Dear Placement Directorate,

We are delighted to transmit the verified Systems Engineering Competency Accreditation for {{institution_name}} students who have cleared all 27 technical milestones in Batch 3.

Each accredited student has demonstrated:
1. Hermetic POSIX, Linux Kernel, and Distributed Storage implementation.
2. 100% cryptographic commit verification on private Git repositories.
3. Live defense of concurrent architectural solutions before industry experts.

Inspect verified credentials and cryptographic SHA-256 audit trails:
{{placement_roster_url}}

Thank you for your institutional partnership.

Warm regards,
Industry Placement Advisory
DeScience Open Source Club`,
    variables: ["institution_name", "placement_roster_url"],
  },

  // ---------------------------------------------------------------------------
  // Category 2: Student <-> DOS Club (Direct Member Alerts & Briefings)
  // ---------------------------------------------------------------------------
  {
    id: "student_checkin_reminder",
    category: "STUDENT",
    name: "Zero-Grace Geofence Check-In Reminder",
    description: "Triggered 30 minutes before workshop commencement instructing members to reach the campus hub and scan geofenced attendance.",
    subject: "[ACTION REQUIRED] Check-in Live: {{workshop_code}} at {{venue_name}}",
    body: `Hey {{student_name}},

The physical geofence beacon for {{workshop_code}}: {{workshop_title}} is now active at {{venue_name}}.

Key Instructions:
- Zero-Grace Gate: Entry shuts strictly at {{start_time}}.
- Bring your student ID and laptop with local Git commit environment ready.
- Check-in using the TalentOS Mobile Web App within the 200m perimeter:
{{checkin_url}}

Remember: Late check-ins require peer-auditor signoff. Let's build with discipline.

DeScience Open Source Club
Batch 3 Operations`,
    variables: ["student_name", "workshop_code", "workshop_title", "venue_name", "start_time", "checkin_url"],
  },
  {
    id: "student_deliverable_review",
    category: "STUDENT",
    name: "Engineering Deliverable Audit Sign-Off",
    description: "Sent after an expert or peer review group grades a submitted repository artifact, test outcome, and architectural schema.",
    subject: "Deliverable Outcome: {{workshop_code}} — Status: {{review_status}}",
    body: `Hi {{student_name}},

Your engineering submission for {{workshop_code}} ({{workshop_title}}) has been audited by {{reviewer_name}}.

Audit Summary:
- Test Verdict: {{test_outcome}}
- Feedback Rating: {{feedback_score}} / 4 Stars
- Reviewer Notes: "{{reviewer_notes}}"
- Cryptographic Commit Verified: {{commit_sha}}

Your longitudinal student ledger has been updated accordingly:
{{student_dossier_url}}

Keep shipping clean, verifiable code.

Technical Evaluation Panel
DeScience Open Source Club`,
    variables: ["student_name", "workshop_code", "workshop_title", "reviewer_name", "test_outcome", "feedback_score", "reviewer_notes", "commit_sha", "student_dossier_url"],
  },
  {
    id: "student_hackathon_briefing",
    category: "STUDENT",
    name: "36-Hour Hackathon Defense Briefing",
    description: "Comprehensive war room briefing detailing track allocation, rubrics, and defense timing for cohort hackathons.",
    subject: "WAR ROOM DISPATCH: 36-Hour Systems Hackathon Briefing & Rules of Engagement",
    body: `Engineers of Batch 3,

The 36-Hour Collaborative Systems Defense commences this weekend.

War Room Schedule:
- Kickoff & Architecture Defense: Saturday 09:00 AM IST
- Code Freeze & Git Plumbing Push: Sunday 03:00 PM IST
- Live Defense & Evaluation: Sunday 05:00 PM IST

Assigned Track: {{assigned_track}}
Team Identifier: {{team_id}}
Repository Requirements: All commits must be GPG signed with zero reliance on black-box boilerplate.

Review Full Problem Statement & Rubric:
{{hackathon_brief_url}}

Best of luck. Let the best architecture prevail.

DeScience Open Source Club Hub`,
    variables: ["assigned_track", "team_id", "hackathon_brief_url"],
  },
  {
    id: "student_cert_minted",
    category: "STUDENT",
    name: "Cryptographic Certificate Minted Alert",
    description: "Dispatched upon successful cohort graduation with permanent public verification ledger URL and PDF download.",
    subject: "Accreditation Minted: Systems Engineering Fellowship Certificate ({{dos_id}})",
    body: `Congratulations {{student_name}},

You have fulfilled all rigorous requirements of the DeScience Open Source Club Fellowship.

Your certificate has been permanently anchored in the TalentOS immutable ledger:
- Certificate ID: {{cert_id}}
- SHA-256 Digest: {{sha256_hash}}
- Verified Milestones: 27 / 27 Workshops Completed

View and share your public verification ledger:
{{public_ledger_url}}

We are proud to welcome you to the alumni network of systems engineers.

DeScience Open Source Club
Governing Board`,
    variables: ["student_name", "dos_id", "cert_id", "sha256_hash", "public_ledger_url"],
  },

  // ---------------------------------------------------------------------------
  // Category 3: Trainer / Expert <-> DOS Club (Workshops & Free Calendars)
  // ---------------------------------------------------------------------------
  {
    id: "trainer_workshop_assignment",
    category: "TRAINER",
    name: "Technical Expert Workshop Assignment & Free Calendar Sync",
    description: "Transmits scheduled session parameters to the expert mentor, complete with free 1-click Google Calendar integration and Apple .ics file download.",
    subject: "Workshop Assignment: {{workshop_code}} — {{workshop_title}}",
    body: `Dear {{trainer_name}},

You are officially assigned as the lead technical expert for the upcoming TalentOS session:

Session Details:
- Code: {{workshop_code}}
- Topic: {{workshop_title}}
- Date & Time: {{session_date}} from {{start_time}} to {{end_time}} (IST)
- Venue: {{venue_name}}
- Expected Cohort Size: {{cohort_size}} Engineers

1-Click Free Calendar Integration:
- Add directly to Google Calendar (Free):
  {{google_calendar_url}}
- Add to Apple Calendar / Outlook / iCal (Free .ics):
  {{apple_calendar_url}}

Access your Expert Cockpit for live attendance monitoring and submission grading:
{{trainer_cockpit_url}}

Thank you for mentoring the next generation of systems builders.

Sincerely,
Curriculum Operations Committee
DeScience Open Source Club`,
    variables: [
      "trainer_name",
      "workshop_code",
      "workshop_title",
      "session_date",
      "start_time",
      "end_time",
      "venue_name",
      "cohort_size",
      "google_calendar_url",
      "apple_calendar_url",
      "trainer_cockpit_url",
    ],
    hasCalendarLinks: true,
  },
  {
    id: "trainer_session_pulse",
    category: "TRAINER",
    name: "Post-Session Student Feedback & Attendance Pulse",
    description: "Automated debrief sent to trainer 2 hours after workshop checkout summarizing 4-star student feedback and attendance stats.",
    subject: "Session Debrief: {{workshop_code}} Student Pulse & Feedback Summary",
    body: `Dear {{trainer_name}},

Thank you for conducting {{workshop_code}}: {{workshop_title}} today.

Here is the immediate cohort feedback pulse:
- Total Checked-In: {{present_count}} / {{total_cohort}}
- Average Feedback Rating: {{avg_rating}} / 4.0 Stars
- Key Student Highlights: {{feedback_highlight}}

You can review all individual student submissions and run test validations in your Expert Cockpit:
{{trainer_cockpit_url}}

Warm regards,
Technical Operations
DeScience Open Source Club`,
    variables: ["trainer_name", "workshop_code", "workshop_title", "present_count", "total_cohort", "avg_rating", "feedback_highlight", "trainer_cockpit_url"],
  },
];
