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
  category: string;
  badge: string;
  tag?: string;
  summary: string;
  fullStory: string[];
  systemAudited: string;
  defenseStatus: string;
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
    title: "The 36-Hour Hackathon & Singapore Immersion",
    subtitle: "How longitudinal telemetry filtered 200+ builders to select the top squad for international cross-border deployment.",
    category: "Distributed Systems",
    badge: "GLOBAL IMMERSION",
    tag: "GLOBAL IMMERSION",
    summary: "How longitudinal telemetry filtered 200+ builders to select the top squad for international cross-border deployment.",
    fullStory: [
      "In distributed consensus, theoretical correctness on paper often fails when network latency spikes or a follower node drops packets. Siddharth set out to build a fully compliant Raft implementation in pure Rust, eschewing off-the-shelf crates to master the protocol down to the byte stream.",
      "During the live Zero-Grace Peer Defense, the evaluation lead injected an abrupt leader partition followed by a 40% packet loss simulation across node cluster RPCs. Siddharth's state machine maintained linearizable reads and elected a new leader in under 14ms without a single uncommitted log entry being lost.",
      "The final benchmark validated continuous throughput of 10,240 write operations per second with persistent disk flush, establishing a new gold standard for Systems Pod Alpha and securing his clearance for the Singapore cross-border immersion squad."
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
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
    },
    publishedAt: "Sep 12, 2026",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    tags: ["Rust", "Raft", "Distributed Systems", "Global Immersion"],
    commitHash: "b3-raft-98a2f",
    featured: true,
    status: "PUBLISHED"
  },
  {
    id: "cs-002",
    slug: "ananya-paged-kv-cache-runtime",
    title: "From Campus Theory to High-Velocity Production",
    subtitle: "How an auditable repository ledger replaced the conventional resume for overseas SME engineering teams.",
    category: "AI & Runtimes",
    badge: "PRODUCTION DEPLOYMENT",
    tag: "PRODUCTION DEPLOYMENT",
    summary: "How an auditable repository ledger replaced the conventional resume for overseas SME engineering teams.",
    fullStory: [
      "Serving high-concurrency LLM inference suffers from massive memory fragmentation when request lengths vary dynamically. Ananya tackled this fundamental compute bottleneck by implementing Paged KV-Cache architecture in C++ with direct CUDA runtime hooks.",
      "Rather than allocating contiguous memory blocks for entire context windows, the runtime allocates small virtual memory pages on-demand. This eliminated 86% of stranded GPU memory and quadrupled the maximum concurrent request capacity on a single GPU node.",
      "In the live peer defense, Ananya defended her cache eviction invariants against concurrent streaming token generation, achieving a remarkable 99.1 defense rating and an immediate overseas production offer."
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
      avatar: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
    },
    publishedAt: "Sep 10, 2026",
    readTime: "6 min read",
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    tags: ["AI Runtime", "CUDA / C++", "KV-Cache", "LLM Serving"],
    commitHash: "b3-ai-4c91d",
    featured: true,
    status: "PUBLISHED"
  },
  {
    id: "cs-003",
    slug: "karthik-lsm-tree-storage-engine",
    title: "Autonomous AI Systems Delivery",
    subtitle: "Pre-final year students delivering live microservice APIs under production constraints and industry scrutiny.",
    category: "Storage & Compaction",
    badge: "SYSTEMS ARCHITECTURE",
    tag: "SYSTEMS ARCHITECTURE",
    summary: "Pre-final year students delivering live microservice APIs under production constraints and industry scrutiny.",
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
      avatar: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
    },
    publishedAt: "Sep 08, 2026",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    tags: ["Storage Internals", "LSM-Tree", "Compaction", "Systems Programming"],
    commitHash: "b3-lsm-77e3c",
    featured: true,
    status: "PUBLISHED"
  },
  {
    id: "cs-004",
    slug: "meera-zerotrust-ephemeral-mtls",
    title: "Cross-Border Engineering Placement",
    subtitle: "How verifiable Git commits helped candidate secure an international role without a single standard campus interview.",
    category: "Security & Protocols",
    badge: "CAREER ACCELERATION",
    tag: "CAREER ACCELERATION",
    summary: "How verifiable Git commits helped candidate secure an international role without a single standard campus interview.",
    fullStory: [
      "Securing communication between autonomous microservices without centralized bottlenecks requires automated, short-lived mutual TLS certificates. Meera engineered an ephemeral mTLS mesh runtime designed for zero-trust microservice clusters.",
      "The architecture integrates with TPM hardware chips and signs ephemeral session keys that automatically rotate every 15 minutes. Even if an individual private key is compromised, subsequent requests are cryptographically quarantined.",
      "Meera defended her cryptographic state transitions before the Cloud Infrastructure Council, securing a cross-border engineering placement directly through her repository telemetry."
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
      avatar: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
    },
    publishedAt: "Sep 05, 2026",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    tags: ["Zero-Trust", "Cryptography", "mTLS", "Identity"],
    commitHash: "b3-sec-11f8a",
    featured: false,
    status: "PUBLISHED"
  },
  {
    id: "cs-005",
    slug: "vikram-linux-ebpf-telemetry",
    title: "Open Source Core Contributor Track",
    subtitle: "Transforming undergraduate developers into recognized maintainers of production open source tooling.",
    category: "Kernel & eBPF",
    badge: "OPEN SOURCE LEADERSHIP",
    tag: "OPEN SOURCE LEADERSHIP",
    summary: "Transforming undergraduate developers into recognized maintainers of production open source tooling.",
    fullStory: [
      "Operating at the boundary between user space and kernel space requires deep understanding of the Linux networking subsystem. Vikram authored an eBPF tracing engine that captures per-socket TCP retransmit events with zero kernel modifications.",
      "By attaching custom BPF kprobes and tracepoints to kernel functions, the engine generates sub-microsecond latency histograms directly in kernel memory, eliminating expensive context switching.",
      "The pull request was merged upstream into the primary open source network monitoring project, promoting Vikram to recognized maintainer status before his final college semester."
    ],
    systemAudited: "SYS-21: eBPF Linux Network Observability Mesh",
    defenseStatus: "PASSED_WITH_DISTINCTION",
    metrics: [
      { label: "Trace Overhead", value: "< 0.2%" },
      { label: "Probe Latency", value: "240ns" },
      { label: "Defense Score", value: "99.4 / 100" }
    ],
    student: {
      name: "Vikram Natarajan",
      dos_id: "DOS-B3-005",
      role: "Kernel Pod • eBPF Tracing",
      college: "PSG Tech Coimbatore",
      track: "Systems Observability",
      avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
    },
    publishedAt: "Sep 02, 2026",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    tags: ["eBPF", "Linux Kernel", "C", "Observability"],
    commitHash: "b3-ebpf-33d11",
    featured: true,
    status: "PUBLISHED"
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
