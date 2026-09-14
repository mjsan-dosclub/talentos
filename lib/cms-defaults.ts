export interface LandingCmsData {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    description: string;
    studentPhoto: string;
    studentPhotoCaption: string;
    collabPhoto: string;
    collabPhotoCaption: string;
    ctaPrimaryText: string;
    ctaPrimaryUrl: string;
    ctaSecondaryText: string;
    ctaSecondaryUrl: string;
    subAttribution: string;
  };
  invisibleEngine: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{
      code: string;
      title: string;
      telemetry: string;
      badge: string;
    }>;
    bannerPhoto: string;
    bannerTitle: string;
    bannerSubtitle: string;
    bannerTag: string;
  };
  lounge: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    pillars: Array<{
      id: string;
      tag: string;
      title: string;
      desc: string;
      image: string;
    }>;
  };
  passport: {
    eyebrow: string;
    title: string;
    description: string;
    quote: string;
    stamps: Array<{
      id: string;
      num: string;
      title: string;
      desc: string;
      footerLeft: string;
      footerRight: string;
      theme: "primary" | "accent";
    }>;
  };
  industry: {
    eyebrow: string;
    title: string;
    description: string;
    tags: string[];
  };
  honour: {
    eyebrow: string;
    title: string;
    description: string;
    dimensions: Array<{
      num: string;
      title: string;
      desc: string;
    }>;
  };
  enquiry: {
    eyebrow: string;
    title: string;
    description: string;
    memberCardTitle: string;
    memberCardDesc: string;
    memberCardCtaText: string;
    memberCardCtaUrl: string;
  };
}

export const DEFAULT_LANDING_CMS: LandingCmsData = {
  hero: {
    eyebrow: "DeScience Open Source Club",
    title: "Where engineers build systems together.",
    highlight: "Not competition. Collective capability.",
    subtitle: "A world-class engineering ecosystem for open-source builders.",
    description:
      "There is a world behind this door. An open-source ecosystem where Indian engineering minds master 27 real-world systems through peer architecture defense, collaborative codebases, and shared rigor. Graduating with authentic evidence that speaks before their résumé does.",
    studentPhoto: "/images/students/student-workshop-build.jpg",
    studentPhotoCaption: "Engineering Collaboration Workshop",
    collabPhoto: "/images/students/student-4.jpg",
    collabPhotoCaption: "Technical Evaluation Session",
    ctaPrimaryText: "Become a Member",
    ctaPrimaryUrl: "https://membership.descienceosclub.com/",
    ctaSecondaryText: "Enquire",
    ctaSecondaryUrl: "#enquire",
    subAttribution: "",
  },

  invisibleEngine: {
    eyebrow: "/ 01 - The Invisible Engine",
    title: "Behind every opportunity is evidence.",
    description:
      "No inflated self-assessments. Every capability is anchored in genuine code execution, verified commits, and real mentor observations.",
    steps: [
      {
        code: "01 // SESSIONS",
        title: "Workshops Attended",
        telemetry: "Geofenced physical presence verified",
        badge: "VERIFIED",
      },
      {
        code: "02 // CODE",
        title: "Problems Solved",
        telemetry: "Hermetic container builds cleared",
        badge: "PASS",
      },
      {
        code: "03 // SYSTEMS",
        title: "Primitives Built",
        telemetry: "Raft consensus & POSIX allocators",
        badge: "STAMPED",
      },
      {
        code: "04 // DEFENSE",
        title: "Skills Demonstrated",
        telemetry: "Live architecture defence in public",
        badge: "DEFENDED",
      },
      {
        code: "05 // OBSERVATION",
        title: "Mentors Who Noticed",
        telemetry: "Staff engineer evaluations logged",
        badge: "HONOURED",
      },
      {
        code: "06 // ATTESTATION",
        title: "Credentials Earned",
        telemetry: "Permanent registry attested proofs",
        badge: "OFFICIAL",
      },
    ],
    bannerPhoto: "/images/students/student-workshop-build.jpg",
    bannerTitle: "TalentOS quietly connects them.",
    bannerSubtitle:
      "When industry meets you, your work speaks before your résumé does. Real engineering minds building in the open.",
    bannerTag: "LIVE SYSTEMS EVALUATION",
  },
  lounge: {
    eyebrow: "/ 02 - The Lounge Principle",
    title: "Some students wait for opportunity.",
    highlight: "DOS Club members prepare before it arrives.",
    description:
      "Not superiority. But access, preparation, privilege, and recognition. The feeling of stepping into the lounge while the general public waits at the gate.",
    pillars: [
      {
        id: "pillar-1",
        tag: "01 // ACCESS",
        title: "Priority Access",
        desc: "Direct pathways into engineering conversations without getting lost in unverified applicant tracking black holes.",
        image: "/images/students/student-6.jpg",
      },
      {
        id: "pillar-2",
        tag: "02 // DEPTH",
        title: "Curated Learning",
        desc: "A 27-workshop systems curriculum exploring POSIX syscalls, Raft consensus, and AI infrastructure from first principles.",
        image: "/images/students/student-5.jpg",
      },
      {
        id: "pillar-3",
        tag: "03 // NETWORK",
        title: "Industry Exposure",
        desc: "Direct interactions with staff engineers, technical fellows, and architects who evaluate code through production lenses.",
        image: "/images/students/student-1.jpg",
      },
      {
        id: "pillar-4",
        tag: "04 // MERIT",
        title: "Recognition",
        desc: "Students who consistently show up, build, and submit receive durable, visible honour rather than generic participation paper.",
        image: "/images/students/student-4.jpg",
      },
      {
        id: "pillar-5",
        tag: "05 // HORIZONS",
        title: "International Opportunities",
        desc: "Connecting promising engineering minds across Tamil Nadu with global technology ecosystems, expanding where your capabilities can take you.",
        image: "/images/students/student-laptop-focus.jpg",
      },
    ],
  },
  passport: {
    eyebrow: "/ 03 - Digital Passport",
    title: "Your Passport to the AI World.",
    description:
      "Every student gradually collects six dimensions of real capability. Not gamified tokens, but permanent stamps of authentic engineering accomplishment.",
    quote: "Graduate with evidence, not just eligibility.",
    stamps: [
      {
        id: "stamp-1",
        num: "STAMP 01 // LEARNING",
        title: "27 Systems Workshops",
        desc: "POSIX internals, memory allocators, Raft log replication, eBPF & GPU shaders.",
        footerLeft: "AUDITED CURRICULUM",
        footerRight: "VERIFIED",
        theme: "primary",
      },
      {
        id: "stamp-2",
        num: "STAMP 02 // PROJECTS",
        title: "Production Code Repositories",
        desc: "Hermetic container builds, clean concurrency, and working distributed primitives.",
        footerLeft: "COMMITS STAMPED",
        footerRight: "ARCHIVED",
        theme: "primary",
      },
      {
        id: "stamp-3",
        num: "STAMP 03 // CREDENTIALS",
        title: "Verified Industry Certifications",
        desc: "Integrated validation from Linux Foundation, AWS, and accredited registries.",
        footerLeft: "REGISTRY ATTESTED",
        footerRight: "OFFICIAL",
        theme: "accent",
      },
      {
        id: "stamp-4",
        num: "STAMP 04 // RECOGNITION",
        title: "Staff Engineer Standouts",
        desc: "Independent citations honoring architectural clarity, grit, and peer mentorship.",
        footerLeft: "MERIT ENDORSEMENT",
        footerRight: "HONOUR",
        theme: "accent",
      },
      {
        id: "stamp-5",
        num: "STAMP 05 // EVIDENCE",
        title: "Zero-Grace Attendance Logs",
        desc: "Geofenced physical presence proving punctuality, discipline, and stamina.",
        footerLeft: "IMMUTABLE TIMESTAMPS",
        footerRight: "AUDITED",
        theme: "primary",
      },
      {
        id: "stamp-6",
        num: "STAMP 06 // EXPOSURE",
        title: "Industry Fellow Defenses",
        desc: "Defending systems architectures directly in front of engineering leadership.",
        footerLeft: "PEER VALIDATED",
        footerRight: "DEFENDED",
        theme: "accent",
      },
    ],
  },
  industry: {
    eyebrow: "/ 04 - Industry Shift",
    title: "Industry doesn't need another résumé. It needs proof.",
    description: "TalentOS helps DOS Club students build that proof over time.",
    tags: [
      "27 Workshops",
      "Projects",
      "Credentials",
      "Mentor Observations",
      "Learning Evidence",
    ],
  },
  honour: {
    eyebrow: "/ 05 - Growth Dimensions",
    title: "Commitment should be visible.",
    description:
      "Students who consistently attend, build, learn, submit, improve, and contribute deserve visible recognition. Not just a certificate at the end.",
    dimensions: [
      {
        num: "01",
        title: "Consistency",
        desc: "Punctual presence across every milestone.",
      },
      {
        num: "02",
        title: "Contribution",
        desc: "Writing code that strengthens the commons.",
      },
      {
        num: "03",
        title: "Improvement",
        desc: "Closing gaps through relentless iteration.",
      },
      {
        num: "04",
        title: "Initiative",
        desc: "Tackling hard bugs beyond assignments.",
      },
      {
        num: "05",
        title: "Completion",
        desc: "Delivering working systems to the finish line.",
      },
      {
        num: "06",
        title: "Execution",
        desc: "Real code performing in real environments.",
      },
    ],
  },
  enquiry: {
    eyebrow: "/ 06 - Admissions",
    title: "Enter the journey.",
    description:
      "Join the cohort directly through the membership portal, or send us a brief enquiry if you are exploring for yourself, your institution, or your company.",
    memberCardTitle: "Immediate Member Enrollment",
    memberCardDesc:
      "Access the complete 27-workshop curriculum, passport credentialing, and live engineering hub sessions.",
    memberCardCtaText: "Become a Member",
    memberCardCtaUrl: "https://membership.descienceosclub.com/",
  },
};
