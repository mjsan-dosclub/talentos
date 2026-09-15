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
  mediaEmbeds?: {
    videoUrl?: string;
    spotifyUrl?: string;
    githubRepoUrl?: string;
  };
}

export const INITIAL_CASE_STUDIES: CaseStudy[] = [];

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CASESTUDIES_FILE = path.join(DATA_DIR, "casestudies.json");

function ensureCaseStudiesFile(): CaseStudy[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CASESTUDIES_FILE)) {
      const raw = fs.readFileSync(CASESTUDIES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Write default seed if file doesn't exist
    fs.writeFileSync(CASESTUDIES_FILE, JSON.stringify(INITIAL_CASE_STUDIES, null, 2), "utf-8");
    return [...INITIAL_CASE_STUDIES];
  } catch (err) {
    console.error("Error loading casestudies.json:", err);
    return [...INITIAL_CASE_STUDIES];
  }
}

function saveCaseStudiesFile(studies: CaseStudy[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CASESTUDIES_FILE, JSON.stringify(studies, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving casestudies.json:", err);
  }
}

// In-memory / persistent registry initialized from file
let caseStudiesStore = ensureCaseStudiesFile();

export function getCaseStudies(category?: string): CaseStudy[] {
  // Always refresh from store file in server environment
  caseStudiesStore = ensureCaseStudiesFile();
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
  caseStudiesStore = ensureCaseStudiesFile();
  return caseStudiesStore.find((cs) => cs.slug === slug || cs.id === slug);
}

export function addCaseStudy(newStudy: Omit<CaseStudy, "id">): CaseStudy {
  caseStudiesStore = ensureCaseStudiesFile();
  const study: CaseStudy = {
    ...newStudy,
    id: `cs-${Date.now().toString(36)}`,
    status: newStudy.status || "PUBLISHED",
  };
  caseStudiesStore.unshift(study);
  saveCaseStudiesFile(caseStudiesStore);
  return study;
}

export function updateCaseStudy(id: string, updates: Partial<CaseStudy>): CaseStudy | null {
  caseStudiesStore = ensureCaseStudiesFile();
  const index = caseStudiesStore.findIndex((cs) => cs.id === id || cs.slug === id);
  if (index === -1) return null;
  caseStudiesStore[index] = {
    ...caseStudiesStore[index],
    ...updates,
  };
  saveCaseStudiesFile(caseStudiesStore);
  return caseStudiesStore[index];
}

export function deleteCaseStudy(id: string): boolean {
  caseStudiesStore = ensureCaseStudiesFile();
  const initialLen = caseStudiesStore.length;
  caseStudiesStore = caseStudiesStore.filter((cs) => cs.id !== id && cs.slug !== id);
  const success = caseStudiesStore.length < initialLen;
  if (success) {
    saveCaseStudiesFile(caseStudiesStore);
  }
  return success;
}
