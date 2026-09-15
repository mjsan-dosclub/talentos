export interface AccessPass {
  id: string;
  pass_code: string;
  candidate_name: string;
  candidate_email: string;
  cohort_batch: string;
  institution: string;
  clearance_level: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  issued_at: string;
  expires_at: string;
  notes?: string;
}

export const INITIAL_PASSES: AccessPass[] = [];

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PASSES_FILE = path.join(DATA_DIR, "passes.json");

function ensurePassesFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PASSES_FILE)) {
      fs.writeFileSync(PASSES_FILE, JSON.stringify(INITIAL_PASSES, null, 2), "utf-8");
    }
  } catch {
    // Non-blocking fallback
  }
}

function loadPassesFromDisk(): AccessPass[] {
  ensurePassesFile();
  try {
    if (fs.existsSync(PASSES_FILE)) {
      const raw = fs.readFileSync(PASSES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed reading passes.json:", e);
  }
  return [...INITIAL_PASSES];
}

function savePassesToDisk(passes: AccessPass[]): void {
  ensurePassesFile();
  try {
    fs.writeFileSync(PASSES_FILE, JSON.stringify(passes, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed writing passes.json:", e);
  }
}

let passesStore: AccessPass[] | null = null;

function getStore(): AccessPass[] {
  if (!passesStore) {
    passesStore = loadPassesFromDisk();
  }
  return passesStore;
}

export function getAccessPasses(): AccessPass[] {
  return getStore();
}

export function getAccessPassByCode(query: string): AccessPass | undefined {
  const clean = query.trim().toUpperCase();
  return getStore().find(
    (p) =>
      p.pass_code.toUpperCase() === clean ||
      p.id.toUpperCase() === clean ||
      p.candidate_email.toUpperCase() === clean
  );
}

export function issueAccessPass(data: Omit<AccessPass, "id" | "issued_at">): AccessPass {
  const store = getStore();
  const now = new Date().toISOString();
  const pass: AccessPass = {
    ...data,
    id: `pass-${Date.now().toString(36)}`,
    pass_code: data.pass_code.trim().toUpperCase(),
    issued_at: now,
    status: data.status || "ACTIVE",
  };
  store.unshift(pass);
  savePassesToDisk(store);
  return pass;
}

export function updateAccessPassStatus(id: string, status: "ACTIVE" | "REVOKED" | "EXPIRED"): AccessPass | null {
  const store = getStore();
  const index = store.findIndex((p) => p.id === id || p.pass_code.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;
  store[index] = {
    ...store[index],
    status,
  };
  savePassesToDisk(store);
  return store[index];
}

export function deleteAccessPass(id: string): boolean {
  let store = getStore();
  const initialLen = store.length;
  passesStore = store.filter((p) => p.id !== id && p.pass_code.toUpperCase() !== id.toUpperCase());
  if (passesStore.length < initialLen) {
    savePassesToDisk(passesStore);
    return true;
  }
  return false;
}

