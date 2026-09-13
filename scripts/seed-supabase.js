const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local manually to ensure variables are available
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwpqlmptznykdjvnaqcd.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in environment or .env.local");
  process.exit(1);
}

// Create admin Supabase client that bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_INSTITUTION_ID = "11111111-1111-1111-1111-111111111111";
const SEED_BATCH_ID = "22222222-2222-2222-2222-222222222222";
const SEED_GROUP_ID = "33333333-3333-3333-3333-333333333333";

const WORKSHOP_TOPICS_27 = [
  "Linux Internals, File Descriptors & Syscalls",
  "POSIX Threads, Synchronization & Race Conditions",
  "Memory Allocators, Virtual Memory & Page Tables",
  "Network Stack, Sockets & epoll Event Loops",
  "TCP/IP Flow Control & Congestion Algorithms",
  "HTTP/2 & HTTP/3 Frame Parsing & Multiplexing",
  "Protocol Buffers & gRPC Streaming Architectures",
  "Key-Value Stores & LSM-Tree Engine Architecture",
  "B-Tree Indexing, Page Cache & WAL Crash Recovery",
  "Relational Query Planners & Cost Estimators",
  "Raft Consensus & Distributed Log Replication",
  "Vector Clocks & Distributed Transaction Isolation",
  "Paxos Algorithm & Quorum Lease Protocols",
  "Resilient Microservices & Circuit Breakers",
  "Distributed Tracing, OpenTelemetry & Span Contexts",
  "High-Throughput Event Streaming & Kafka Topologies",
  "Actor Model & Fault-Tolerant Supervision Trees",
  "Zero-Knowledge Proofs & Cryptographic Commitments",
  "Elliptic Curve Cryptography & Digital Signatures",
  "eBPF Kernel Tracing & Network Packet Filtering",
  "Container Runtimes, cgroups & Linux Namespaces",
  "WebAssembly Runtimes, Memory Sandboxing & JIT",
  "Garbage Collection Algorithms & Stop-the-World Tuning",
  "GPU Compute Shaders & Parallel Matrix Multiplication",
  "Async IO Runtimes & Future Polling State Machines",
  "Cache Coherence, MESI Protocols & Memory Fences",
  "Production War Room: Multi-Region Disaster Recovery",
];

async function seed() {
  console.log("=== TALENTOS SUPABASE LIVE SEEDING ===");
  console.log("Connecting to:", supabaseUrl);

  // 1. Seed Institution
  console.log("\n[1/6] Seeding Primary Institution...");
  const { error: instErr } = await supabaseAdmin.from("institutions").upsert(
    [
      {
        id: SEED_INSTITUTION_ID,
        name: "Anna University & DOS Club Hub",
        code: "AU-DOS-01",
        contact_email: "contact@dosclub.org",
        contact_person: "Faculty Lead Chennai",
        default_lat: 13.011,
        default_lng: 80.2354,
        geofence_radius_meters: 200,
        is_active: true,
      },
    ],
    { onConflict: "code" }
  );
  if (instErr) throw instErr;
  console.log("✓ Institution 'Anna University & DOS Club Hub' seeded.");

  // 2. Seed Batch
  console.log("\n[2/6] Seeding Active Batch...");
  const { error: batchErr } = await supabaseAdmin.from("batches").upsert(
    [
      {
        id: SEED_BATCH_ID,
        institution_id: SEED_INSTITUTION_ID,
        type: "B2C",
        name: "Batch 3",
        year: 2026,
        is_active: true,
      },
    ],
    { onConflict: "id" }
  );
  if (batchErr) throw batchErr;
  console.log("✓ Batch 'Batch 3' seeded.");

  // 3. Seed Cohort Group
  console.log("\n[3/6] Seeding Cohort Group...");
  const { error: groupErr } = await supabaseAdmin.from("cohort_groups").upsert(
    [
      {
        id: SEED_GROUP_ID,
        batch_id: SEED_BATCH_ID,
        group_name: "Systems Engineering - Group Alpha",
        max_capacity: 40,
        is_closed: false,
      },
    ],
    { onConflict: "id" }
  );
  if (groupErr) throw groupErr;
  console.log("✓ Group 'Systems Engineering - Group Alpha' (Capacity: 40) seeded.");

  // 4. Seed 5 Initial Students
  console.log("\n[4/6] Seeding Initial Students...");
  const studentsPayload = [
    {
      id: "a0000001-0000-0000-0000-000000000001",
      dos_id: "DOS-B3-001",
      group_id: SEED_GROUP_ID,
      full_name: "Arunachalam Sundaram",
      email: "arun@student.dosclub.org",
      phone: "+91 98401 23456",
      course: "B.Tech Computer Science & Engineering",
      department: "Anna University, Chennai",
      year_of_study: 3,
      is_archived: false,
    },
    {
      id: "a0000002-0000-0000-0000-000000000002",
      dos_id: "DOS-B3-002",
      group_id: SEED_GROUP_ID,
      full_name: "Kavitha Raman",
      email: "kavitha@student.dosclub.org",
      phone: "+91 98402 34567",
      course: "B.E. Information Technology",
      department: "PSG College of Technology, Coimbatore",
      year_of_study: 4,
      is_archived: false,
    },
    {
      id: "a0000003-0000-0000-0000-000000000003",
      dos_id: "DOS-B3-003",
      group_id: SEED_GROUP_ID,
      full_name: "Dinesh Kumar V.",
      email: "dinesh@student.dosclub.org",
      phone: "+91 98403 45678",
      course: "B.Tech Electronics & Communication",
      department: "NIT Trichy",
      year_of_study: 3,
      is_archived: false,
    },
    {
      id: "a0000004-0000-0000-0000-000000000004",
      dos_id: "DOS-B3-004",
      group_id: SEED_GROUP_ID,
      full_name: "Meera Subramanian",
      email: "meera@student.dosclub.org",
      phone: "+91 98404 56789",
      course: "B.Tech Computer Science",
      department: "IIT Madras Research Park Hub",
      year_of_study: 3,
      is_archived: false,
    },
    {
      id: "a0000005-0000-0000-0000-000000000005",
      dos_id: "DOS-B3-005",
      group_id: SEED_GROUP_ID,
      full_name: "Siddharth Rajan",
      email: "siddharth@student.dosclub.org",
      phone: "+91 98405 67890",
      course: "B.E. Computer Science",
      department: "Thiagarajar College of Engineering, Madurai",
      year_of_study: 4,
      is_archived: false,
    },
  ];

  const { error: stuErr } = await supabaseAdmin
    .from("students")
    .upsert(studentsPayload, { onConflict: "email" });
  if (stuErr) throw stuErr;
  console.log(`✓ Seeded ${studentsPayload.length} students into 'students' table.`);

  // 5. Seed All 27 Workshops
  console.log("\n[5/6] Seeding All 27 Workshops...");
  const workshopsPayload = WORKSHOP_TOPICS_27.map((topic, idx) => ({
    id: `c0000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`,
    batch_id: SEED_BATCH_ID,
    session_number: idx + 1,
    title: `WS-${String(idx + 1).padStart(2, "0")}: ${topic}`,
    description: `Deep-dive systems engineering workshop covering production invariants.`,
    trainer_name: "DeScience Systems Faculty Lead",
    session_mode: "OFFLINE",
    scheduled_at: new Date(2026, 2, 1 + idx * 7, 9, 0).toISOString(),
    duration_minutes: 180,
    venue_name: "Anna University Campus / Chennai Hub",
    venue_lat: 13.011,
    venue_lng: 80.2354,
    venue_radius_meters: 150,
    submission_required: true,
    submission_type: "GITHUB_REPO",
    is_active: idx === 13, // WS-14 is active workshop
  }));

  const { error: wsErr } = await supabaseAdmin
    .from("workshops")
    .upsert(workshopsPayload, { onConflict: "id" });
  if (wsErr) throw wsErr;
  console.log(`✓ Seeded ${workshopsPayload.length} workshops into 'workshops' table.`);

  // 6. Seed Sample Attendance & Evidence Submission for WS-14
  console.log("\n[6/6] Seeding Attendance & Evidence Submission for WS-14...");
  const ws14Id = workshopsPayload[13].id;
  const arunId = studentsPayload[0].id;

  const { error: attErr } = await supabaseAdmin.from("attendance_records").upsert(
    [
      {
        student_id: arunId,
        workshop_id: ws14Id,
        status: "CHECKED_IN",
        source: "QR_SCAN",
        check_in_time: new Date().toISOString(),
        check_in_lat: 13.0112,
        check_in_lng: 80.2355,
      },
    ],
    { onConflict: "student_id,workshop_id" }
  );
  if (attErr) throw attErr;

  const { error: subErr } = await supabaseAdmin.from("evidence_submissions").upsert(
    [
      {
        workshop_id: ws14Id,
        student_id: arunId,
        status: "SUBMITTED",
        artifact_url: "https://github.com/arun-systems/ws14-resiliency-suite",
        notes: "Implemented exponential backoff with full jitter and half-open state recovery. Passed 20/20 hermetic tests.",
        submitted_at: new Date().toISOString(),
      },
    ],
    { onConflict: "workshop_id,student_id" }
  );
  if (subErr) throw subErr;
  console.log("✓ Seeded sample attendance and evidence submission for WS-14.");

  console.log("\n===========================================");
  console.log("🎉 SUCCESS: All live Supabase tables seeded!");
  console.log("===========================================");
}

seed().catch((err) => {
  console.error("\n❌ SEED ERROR:", err);
  process.exit(1);
});
