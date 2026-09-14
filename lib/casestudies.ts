export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudyStudent {
  name: string;
  dos_id: string;
  role: string;
  college: string;
  track: string;
  avatar: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "Distributed Systems" | "AI & Runtimes" | "Storage & Compaction" | "Security & Protocols";
  badge: string;
  summary: string;
  fullStory: string[];
  systemAudited: string;
  defenseStatus: "VERIFIED" | "PASSED_WITH_DISTINCTION";
  metrics: CaseStudyMetric[];
  student: CaseStudyStudent;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  tags: string[];
  commitHash: string;
  prUrl?: string;
  featured?: boolean;
  shortDescription?: string;
  bannerImage?: string;
  socialShareImage?: string;
  metaTitle?: string;
  metaKeywords?: string;
  status?: "DRAFT" | "PUBLISHED";
}

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-001",
    slug: "siddharth-raft-consensus-engine",
    title: "How Siddharth Built a 10,000 RPS Distributed Raft Consensus Engine in Rust",
    subtitle: "Zero-grace peer defense under live chaos failure injections and split-brain network partitions.",
    category: "Distributed Systems",
    badge: "SYSTEMS POD ALPHA",
    summary: "Deconstructed the Raft consensus algorithm from academic specification to production Rust code. Implemented log compaction, leader election heartbeats, and persistent WAL. Defended live before the batch under simulated node crashes.",
    fullStory: [
      "In distributed consensus, theoretical correctness on paper often fails when network latency spikes or a follower node drops packets. Siddharth set out to build a fully compliant Raft implementation in pure Rust, eschewing off-the-shelf crates to master the protocol down to the byte stream.",
      "During the live Zero-Grace Peer Defense, the evaluation lead injected an abrupt leader partition followed by a 40% packet loss simulation across node cluster RPCs. Siddharth's state machine maintained linearizable reads and elected a new leader in under 14ms without a single uncommitted log entry being lost.",
      "The final benchmark validated continuous throughput of 10,240 write operations per second with persistent disk flush, establishing a new gold standard for Systems Pod Alpha."
    ],
    systemAudited: "SYS-04: Distributed Consensus State Machine",
    defenseStatus: "PASSED_WITH_DISTINCTION",
    metrics: [
      { label: "Throughput", value: "10,240 RPS" },
      { label: "Election Latency", value: "< 14ms" },
      { label: "Defense Score", value: "98.4 / 100" }
    ],
    student: {
      name: "Siddharth Raman",
      dos_id: "DOS-B3-001",
      role: "Systems Pod Alpha • Kernel Auditor",
      college: "CEG Chennai",
      track: "Systems Engineering",
      avatar: "/images/students/student-1.jpg"
    },
    publishedAt: "Sep 12, 2026",
    readTime: "5 min read",
    coverImage: "/images/students/student-workshop-build.jpg",
    tags: ["Rust", "Raft", "Distributed Systems", "Chaos Engineering"],
    commitHash: "b3-raft-98a2f",
    featured: true
  },
  {
    id: "cs-002",
    slug: "ananya-paged-kv-cache-runtime",
    title: "Engineered a Paged KV-Cache AI Serving Engine with 4.2x Throughput Scaling",
    subtitle: "Eliminating GPU memory fragmentation for concurrent multi-turn LLM inference streams.",
    category: "AI & Runtimes",
    badge: "AI ARCHITECTURE POD",
    summary: "Addressed severe KV-cache memory bloat during multi-turn LLM inference by engineering virtual memory paging across GPU memory blocks and host RAM. Successfully verified against continuous stress benchmarks.",
    fullStory: [
      "Serving high-concurrency LLM inference suffers from massive memory fragmentation when request lengths vary dynamically. Ananya tackled this fundamental compute bottleneck by implementing Paged KV-Cache architecture in C++ with direct CUDA runtime hooks.",
      "Rather than allocating contiguous memory blocks for entire context windows, the runtime allocates small virtual memory pages on-demand. This eliminated 86% of stranded GPU memory and quadrupled the maximum concurrent request capacity on a single GPU node.",
      "In the live peer defense, Ananya defended her cache eviction invariants against concurrent streaming token generation, achieving a remarkable 99.1 defense rating."
    ],
    systemAudited: "SYS-12: High-Throughput Tensor Inference Engine",
    defenseStatus: "PASSED_WITH_DISTINCTION",
    metrics: [
      { label: "Throughput Boost", value: "4.2x Scale" },
      { label: "Memory Waste", value: "-86% Reduced" },
      { label: "Defense Score", value: "99.1 / 100" }
    ],
    student: {
      name: "Ananya Krishnan",
      dos_id: "DOS-B3-002",
      role: "AI Inference Pod • Vector Compute",
      college: "Anna University",
      track: "AI Systems",
      avatar: "/images/students/student-2.jpg"
    },
    publishedAt: "Sep 10, 2026",
    readTime: "6 min read",
    coverImage: "/images/students/student-laptop-focus.jpg",
    tags: ["AI Runtime", "CUDA / C++", "KV-Cache", "LLM Serving"],
    commitHash: "b3-ai-4c91d",
    featured: true
  },
  {
    id: "cs-003",
    slug: "karthik-lsm-tree-storage-engine",
    title: "Building an LSM-Tree Storage Engine with Leveled Compaction from Scratch",
    subtitle: "Handling high-write ingest with zero write stalls, Bloom filters, and SSTable merges.",
    category: "Storage & Compaction",
    badge: "CORE COMMONS POD",
    summary: "Replaced SQLite in a systems evaluation with an original Log-Structured Merge-Tree storage engine featuring SkipList MemTables, write-ahead logging (WAL), and tiered SSTable background compaction.",
    fullStory: [
      "Traditional B-Trees degrade under continuous random write spikes. Karthik designed and authored a storage engine based on Log-Structured Merge-Trees (LSM) in modern C++ with zero external dependencies.",
      "The engine features lock-free concurrent SkipLists for in-memory write buffering, block-based SSTables on NVMe storage, and fractional cascading Bloom filters to keep point lookup latency under 0.8ms.",
      "During peer defense, Karthik demonstrated sustained ingestion of 85,000 writes per second while background compaction threads kept read amplification strictly below 1.8x."
    ],
    systemAudited: "SYS-07: LSM-Tree Key-Value Storage Engine",
    defenseStatus: "VERIFIED",
    metrics: [
      { label: "Write Ingest", value: "85K Writes/s" },
      { label: "Read Amplification", value: "< 1.8x" },
      { label: "Defense Score", value: "97.8 / 100" }
    ],
    student: {
      name: "Karthik Subramanian",
      dos_id: "DOS-B3-003",
      role: "Distributed Storage • Log Compaction",
      college: "MIT Chennai",
      track: "Storage Architecture",
      avatar: "/images/students/student-3.jpg"
    },
    publishedAt: "Sep 08, 2026",
    readTime: "4 min read",
    coverImage: "/images/students/student-group-collab.jpg",
    tags: ["Storage Internals", "LSM-Tree", "Compaction", "Systems Programming"],
    commitHash: "b3-lsm-77e3c",
    featured: true
  },
  {
    id: "cs-004",
    slug: "meera-zerotrust-ephemeral-mtls",
    title: "Zero-Trust Service Mesh: Ephemeral mTLS Cryptographic Handshakes at Scale",
    subtitle: "Automated rotation of student keypairs with sub-millisecond handshake overhead.",
    category: "Security & Protocols",
    badge: "POD IDENTITY & AUDIT",
    summary: "Architected decentralized mTLS identity verification between student pods. Tied commit signing keys directly to physical attendance geofence receipts with automated 15-minute rotation.",
    fullStory: [
      "Securing communication between autonomous microservices without centralized bottlenecks requires automated, short-lived mutual TLS certificates. Meera engineered an ephemeral mTLS mesh runtime designed for zero-trust microservice clusters.",
      "The architecture integrates with TPM hardware chips and signs ephemeral session keys that automatically rotate every 15 minutes. Even if an individual private key is compromised, subsequent requests are cryptographically quarantined.",
      "Meera defended her cryptographic state transitions before the Cloud Infrastructure Council, achieving sub-millisecond connection handshake latency."
    ],
    systemAudited: "SYS-18: Zero-Trust Cryptographic Identity Mesh",
    defenseStatus: "PASSED_WITH_DISTINCTION",
    metrics: [
      { label: "Handshake Overhead", value: "0.82ms" },
      { label: "Key Rotation", value: "Every 15m" },
      { label: "Defense Score", value: "98.7 / 100" }
    ],
    student: {
      name: "Meera Soundararajan",
      dos_id: "DOS-B3-004",
      role: "Zero-Trust Identity • Cryptographic Proofs",
      college: "CEG Chennai",
      track: "Security & Protocols",
      avatar: "/images/students/student-4.jpg"
    },
    publishedAt: "Sep 05, 2026",
    readTime: "5 min read",
    coverImage: "/images/students/student-4.jpg",
    tags: ["Zero-Trust", "Cryptography", "mTLS", "Identity"],
    commitHash: "b3-sec-11f8a",
    featured: false
  }
];

// In-memory / persistent registry
let caseStudiesStore = [...INITIAL_CASE_STUDIES];

export function getCaseStudies(category?: string): CaseStudy[] {
  if (!category || category === "all") {
    return caseStudiesStore;
  }
  return caseStudiesStore.filter(
    (cs) =>
      cs.category.toLowerCase().includes(category.toLowerCase()) ||
      cs.student.track.toLowerCase().includes(category.toLowerCase())
  );
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudiesStore.find((cs) => cs.slug === slug || cs.id === slug);
}

export function addCaseStudy(newStudy: Omit<CaseStudy, "id">): CaseStudy {
  const study: CaseStudy = {
    ...newStudy,
    id: `cs-${Date.now().toString(36)}`,
    status: newStudy.status || "PUBLISHED",
  };
  caseStudiesStore.unshift(study);
  return study;
}

export function updateCaseStudy(id: string, updates: Partial<CaseStudy>): CaseStudy | null {
  const index = caseStudiesStore.findIndex((cs) => cs.id === id || cs.slug === id);
  if (index === -1) return null;
  caseStudiesStore[index] = {
    ...caseStudiesStore[index],
    ...updates,
  };
  return caseStudiesStore[index];
}

export function deleteCaseStudy(id: string): boolean {
  const initialLen = caseStudiesStore.length;
  caseStudiesStore = caseStudiesStore.filter((cs) => cs.id !== id && cs.slug !== id);
  return caseStudiesStore.length < initialLen;
}
