-- ============================================================================
-- DOS CLUB TALENTOS: SUPABASE RLS POLICIES & SEED DATA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mwpqlmptznykdjvnaqcd/sql
-- ============================================================================

-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable reading and writing for the talent intelligence platform

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public Read Institutions" ON institutions;
DROP POLICY IF EXISTS "Public Write Institutions" ON institutions;
DROP POLICY IF EXISTS "Public Read Batches" ON batches;
DROP POLICY IF EXISTS "Public Write Batches" ON batches;
DROP POLICY IF EXISTS "Public Read Cohort Groups" ON cohort_groups;
DROP POLICY IF EXISTS "Public Write Cohort Groups" ON cohort_groups;
DROP POLICY IF EXISTS "Public Read Students" ON students;
DROP POLICY IF EXISTS "Public Write Students" ON students;
DROP POLICY IF EXISTS "Public Read Workshops" ON workshops;
DROP POLICY IF EXISTS "Public Write Workshops" ON workshops;
DROP POLICY IF EXISTS "Public Read Attendance" ON attendance_records;
DROP POLICY IF EXISTS "Public Write Attendance" ON attendance_records;
DROP POLICY IF EXISTS "Public Read Submissions" ON evidence_submissions;
DROP POLICY IF EXISTS "Public Write Submissions" ON evidence_submissions;
DROP POLICY IF EXISTS "Public Read Audit Logs" ON audit_logs;
DROP POLICY IF EXISTS "Public Write Audit Logs" ON audit_logs;

-- Create Permissive Policies for Web Portal
CREATE POLICY "Public Read Institutions" ON institutions FOR SELECT USING (true);
CREATE POLICY "Public Write Institutions" ON institutions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Batches" ON batches FOR SELECT USING (true);
CREATE POLICY "Public Write Batches" ON batches FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Cohort Groups" ON cohort_groups FOR SELECT USING (true);
CREATE POLICY "Public Write Cohort Groups" ON cohort_groups FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Students" ON students FOR SELECT USING (true);
CREATE POLICY "Public Write Students" ON students FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Workshops" ON workshops FOR SELECT USING (true);
CREATE POLICY "Public Write Workshops" ON workshops FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Attendance" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Public Write Attendance" ON attendance_records FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Submissions" ON evidence_submissions FOR SELECT USING (true);
CREATE POLICY "Public Write Submissions" ON evidence_submissions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Audit Logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Audit Logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 2. INITIAL SEED DATA
-- ============================================================================

-- Insert Primary Institution
INSERT INTO institutions (id, name, code, contact_email, contact_person, default_lat, default_lng, geofence_radius_meters, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Anna University & DOS Club Hub',
  'AU-DOS-01',
  'contact@dosclub.org',
  'Faculty Lead Chennai',
  13.0110,
  80.2354,
  200,
  true
) ON CONFLICT (code) DO NOTHING;

-- Insert Active Batch 3 (2026)
INSERT INTO batches (id, institution_id, type, name, year, is_active)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'B2C',
  'Batch 3',
  2026,
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert Cohort Group Alpha (Strict 40-Student Capacity)
INSERT INTO cohort_groups (id, batch_id, group_name, max_capacity, is_closed)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'Systems Engineering - Group Alpha',
  40,
  false
) ON CONFLICT (id) DO NOTHING;

-- Insert Initial 5 Students
INSERT INTO students (id, group_id, dos_id, full_name, email, phone, course, department, year_of_study)
VALUES
  (
    'a0000001-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'DOS-B3-001',
    'Arunachalam Sundaram',
    'arun@student.dosclub.org',
    '+91 98401 23456',
    'B.Tech Computer Science & Engineering',
    'Anna University, Chennai',
    3
  ),
  (
    'a0000002-0000-0000-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'DOS-B3-002',
    'Kavitha Raman',
    'kavitha@student.dosclub.org',
    '+91 98402 34567',
    'B.E. Information Technology',
    'PSG College of Technology, Coimbatore',
    4
  ),
  (
    'a0000003-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'DOS-B3-003',
    'Dinesh Kumar V.',
    'dinesh@student.dosclub.org',
    '+91 98403 45678',
    'B.Tech Electronics & Communication',
    'NIT Trichy',
    3
  ),
  (
    'a0000004-0000-0000-0000-000000000004',
    '33333333-3333-3333-3333-333333333333',
    'DOS-B3-004',
    'Meera Subramanian',
    'meera@student.dosclub.org',
    '+91 98404 56789',
    'B.Tech Computer Science',
    'IIT Madras Research Park Hub',
    3
  ),
  (
    'a0000005-0000-0000-0000-000000000005',
    '33333333-3333-3333-3333-333333333333',
    'DOS-B3-005',
    'Siddharth Rajan',
    'siddharth@student.dosclub.org',
    '+91 98405 67890',
    'B.E. Computer Science',
    'Thiagarajar College of Engineering, Madurai',
    4
  )
ON CONFLICT (email) DO NOTHING;

-- Insert All 27 Workshops
INSERT INTO workshops (id, batch_id, session_number, title, description, trainer_name, session_mode, scheduled_at, duration_minutes, venue_name, venue_lat, venue_lng, venue_radius_meters, submission_required, submission_type, is_active)
VALUES
  ('w0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 1, 'WS-01: Linux Internals, File Descriptors & Syscalls', 'POSIX subsystems and syscalls', 'Faculty Lead', 'OFFLINE', '2026-03-01 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 2, 'WS-02: POSIX Threads, Synchronization & Race Conditions', 'Mutexes, condition variables, race conditions', 'Faculty Lead', 'OFFLINE', '2026-03-08 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 3, 'WS-03: Memory Allocators, Virtual Memory & Page Tables', 'Virtual memory, buddy allocators, paging', 'Faculty Lead', 'OFFLINE', '2026-03-15 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 4, 'WS-04: Network Stack, Sockets & epoll Event Loops', 'Non-blocking I/O and epoll reactor patterns', 'Faculty Lead', 'OFFLINE', '2026-03-22 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 5, 'WS-05: TCP/IP Flow Control & Congestion Algorithms', 'Sliding windows, cubic, BBR algorithms', 'Faculty Lead', 'OFFLINE', '2026-03-29 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 6, 'WS-06: HTTP/2 & HTTP/3 Frame Parsing & Multiplexing', 'Binary frames, HPACK, QUIC streams', 'Faculty Lead', 'OFFLINE', '2026-04-05 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', 7, 'WS-07: Protocol Buffers & gRPC Streaming Architectures', 'Protobuf serialization and bidirectional streaming', 'Faculty Lead', 'OFFLINE', '2026-04-12 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', 8, 'WS-08: Key-Value Stores & LSM-Tree Engine Architecture', 'MemTable, SSTable, compaction, WAL', 'Faculty Lead', 'OFFLINE', '2026-04-19 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222', 9, 'WS-09: B-Tree Indexing, Page Cache & WAL Crash Recovery', 'B+ Trees, page eviction, ACID guarantees', 'Faculty Lead', 'OFFLINE', '2026-04-26 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222', 10, 'WS-10: Relational Query Planners & Cost Estimators', 'AST parsing, cost models, volcano iterators', 'Faculty Lead', 'OFFLINE', '2026-05-03 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', 11, 'WS-11: Raft Consensus & Distributed Log Replication', 'Leader election, log replication, safety invariants', 'Faculty Lead', 'OFFLINE', '2026-05-10 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', 12, 'WS-12: Vector Clocks & Distributed Transaction Isolation', 'Causality, 2PC, serializable snapshot isolation', 'Faculty Lead', 'OFFLINE', '2026-05-17 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000013', '22222222-2222-2222-2222-222222222222', 13, 'WS-13: Paxos Algorithm & Quorum Lease Protocols', 'Multi-Paxos, Synod, leader leases', 'Faculty Lead', 'OFFLINE', '2026-05-24 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000014', '22222222-2222-2222-2222-222222222222', 14, 'WS-14: Resilient Microservices & Circuit Breakers', 'Token bucket, jitter, fallback degradation', 'Faculty Lead', 'OFFLINE', '2026-05-31 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', true),
  ('w0000000-0000-0000-0000-000000000015', '22222222-2222-2222-2222-222222222222', 15, 'WS-15: Distributed Tracing, OpenTelemetry & Span Contexts', 'Context propagation, W3C traceparent, spans', 'Faculty Lead', 'OFFLINE', '2026-06-07 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000016', '22222222-2222-2222-2222-222222222222', 16, 'WS-16: High-Throughput Event Streaming & Kafka Topologies', 'Partitioning, consumer rebalancing, exact-once', 'Faculty Lead', 'OFFLINE', '2026-06-14 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000017', '22222222-2222-2222-2222-222222222222', 17, 'WS-17: Actor Model & Fault-Tolerant Supervision Trees', 'Mailboxes, actor isolation, let-it-crash', 'Faculty Lead', 'OFFLINE', '2026-06-21 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000018', '22222222-2222-2222-2222-222222222222', 18, 'WS-18: Zero-Knowledge Proofs & Cryptographic Commitments', 'Pedersen commitments, zk-SNARK verifiers', 'Faculty Lead', 'OFFLINE', '2026-06-28 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000019', '22222222-2222-2222-2222-222222222222', 19, 'WS-19: Elliptic Curve Cryptography & Digital Signatures', 'secp256k1, Ed25519, threshold signatures', 'Faculty Lead', 'OFFLINE', '2026-07-05 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000020', '22222222-2222-2222-2222-222222222222', 20, 'WS-20: eBPF Kernel Tracing & Network Packet Filtering', 'XDP, kprobes, ring buffers, maps', 'Faculty Lead', 'OFFLINE', '2026-07-12 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000021', '22222222-2222-2222-2222-222222222222', 21, 'WS-21: Container Runtimes, cgroups & Linux Namespaces', 'Mount, PID namespaces, cgroups v2 resource limits', 'Faculty Lead', 'OFFLINE', '2026-07-19 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000022', '22222222-2222-2222-2222-222222222222', 22, 'WS-22: WebAssembly Runtimes, Memory Sandboxing & JIT', 'Wasm linear memory, WASI interfaces, Cranelift', 'Faculty Lead', 'OFFLINE', '2026-07-26 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000023', '22222222-2222-2222-2222-222222222222', 23, 'WS-23: Garbage Collection Algorithms & Stop-the-World Tuning', 'Mark-sweep, generational GC, safepoints', 'Faculty Lead', 'OFFLINE', '2026-08-02 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000024', '22222222-2222-2222-2222-222222222222', 24, 'WS-24: GPU Compute Shaders & Parallel Matrix Multiplication', 'Metal / WGSL shaders, thread groups, memory coalescing', 'Faculty Lead', 'OFFLINE', '2026-08-09 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000025', '22222222-2222-2222-2222-222222222222', 25, 'WS-25: Async IO Runtimes & Future Polling State Machines', 'Waker, Pinning, custom mini-Tokio runtime', 'Faculty Lead', 'OFFLINE', '2026-08-16 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000026', '22222222-2222-2222-2222-222222222222', 26, 'WS-26: Cache Coherence, MESI Protocols & Memory Fences', 'Store buffers, memory barriers, CPU cache lines', 'Faculty Lead', 'OFFLINE', '2026-08-23 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false),
  ('w0000000-0000-0000-0000-000000000027', '22222222-2222-2222-2222-222222222222', 27, 'WS-27: Production War Room: Multi-Region Disaster Recovery', 'Split-brain recovery, failover choreography, postmortems', 'Faculty Lead', 'OFFLINE', '2026-08-30 09:00:00+00', 180, 'Chennai Hub', 13.011, 80.2354, 150, true, 'GITHUB_REPO', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Evidence Submissions for WS-14
INSERT INTO evidence_submissions (id, workshop_id, student_id, status, artifact_url, notes)
VALUES
  (
    'e0000001-0000-0000-0000-000000000001',
    'w0000000-0000-0000-0000-000000000014',
    'a0000001-0000-0000-0000-000000000001',
    'SUBMITTED',
    'https://github.com/arun-systems/ws14-resiliency-suite',
    'Exponential backoff with full jitter and half-open state recovery. Passed 20/20 hermetic tests.'
  )
ON CONFLICT (workshop_id, student_id) DO NOTHING;
