import fs from "fs";
import path from "path";
import { LandingCmsData, DEFAULT_LANDING_CMS } from "./cms-defaults";

export type { LandingCmsData };
export { DEFAULT_LANDING_CMS };


const DATA_DIR = path.join(process.cwd(), "data");
const CMS_FILE = path.join(DATA_DIR, "cms-landing.json");

let inMemoryCms: LandingCmsData | null = null;

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CMS_FILE)) {
      fs.writeFileSync(CMS_FILE, JSON.stringify(DEFAULT_LANDING_CMS, null, 2), "utf-8");
    }
  } catch {
    // Fallback gracefully in restricted environments
  }
}

export function getLandingCms(): LandingCmsData {
  if (inMemoryCms) {
    return inMemoryCms;
  }

  ensureDataFile();
  try {
    if (fs.existsSync(CMS_FILE)) {
      const raw = fs.readFileSync(CMS_FILE, "utf-8");
      inMemoryCms = { ...DEFAULT_LANDING_CMS, ...JSON.parse(raw) };
      return inMemoryCms!;
    }
  } catch {
    // Return default on error
  }

  inMemoryCms = { ...DEFAULT_LANDING_CMS };
  return inMemoryCms;
}

export function updateLandingCms(partial: Partial<LandingCmsData>): LandingCmsData {
  const current = getLandingCms();
  const updated: LandingCmsData = {
    ...current,
    ...partial,
    hero: { ...current.hero, ...(partial.hero || {}) },
    invisibleEngine: { ...current.invisibleEngine, ...(partial.invisibleEngine || {}) },
    lounge: { ...current.lounge, ...(partial.lounge || {}) },
    passport: { ...current.passport, ...(partial.passport || {}) },
    industry: { ...current.industry, ...(partial.industry || {}) },
    honour: { ...current.honour, ...(partial.honour || {}) },
    enquiry: { ...current.enquiry, ...(partial.enquiry || {}) },
  };

  inMemoryCms = updated;

  try {
    ensureDataFile();
    fs.writeFileSync(CMS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch {
    // Keep in-memory copy
  }

  return updated;
}

export function resetLandingCms(): LandingCmsData {
  inMemoryCms = { ...DEFAULT_LANDING_CMS };
  try {
    ensureDataFile();
    fs.writeFileSync(CMS_FILE, JSON.stringify(DEFAULT_LANDING_CMS, null, 2), "utf-8");
  } catch {
    // Keep in-memory
  }
  return inMemoryCms;
}
