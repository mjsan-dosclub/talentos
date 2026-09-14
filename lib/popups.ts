import fs from "fs";
import path from "path";
import { WelcomePopup, PopupContentType } from "./popups-types";

export type { WelcomePopup, PopupContentType };


const DATA_DIR = path.join(process.cwd(), "data");
const POPUPS_FILE = path.join(DATA_DIR, "popups.json");

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore error
  }
}

export const SEED_POPUPS: WelcomePopup[] = [
  {
    id: "popup-codezap-2026",
    title: "CodeZap 2026: National AI Systems Hackathon",
    contentType: "FLYER",
    mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    badge: "FLASH ANNOUNCEMENT // CODEZAP 2026",
    description: "Touchmark Descience Open Source Club announces CodeZap 2026. 48-hour challenge building real-time distributed inference engines. Registrations open for all verified student members.",
    actionLabel: "Register for CodeZap 2026",
    actionUrl: "https://membership.descienceosclub.com/",
    startsAt: "2026-09-14T00:00:00.000Z",
    endsAt: null, // Open-ended until superseded by next scheduled announcement
    isActive: true,
    isSuperseded: false,
    supersededBy: null,
    createdAt: "2026-09-14T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
  },
  {
    id: "popup-achiever-divya",
    title: "Batch 2 Achiever: Divya Nair joins NeuralScale as AI Engineer",
    contentType: "ACHIEVER",
    mediaUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    badge: "DOS CLUB // RECENT ACHIEVER",
    description: "Divya completed 6 system defenses, validated 4 production AI pipelines at DOS Club, and secured a direct invite from NeuralScale with zero fresh graduate discount.",
    actionLabel: "View Verified Dossier",
    actionUrl: "/record/DOS-B3-009",
    startsAt: "2026-09-14T10:00:00.000Z",
    endsAt: null,
    isActive: false,
    isSuperseded: false,
    supersededBy: null,
    createdAt: "2026-09-14T01:00:00.000Z",
    updatedAt: "2026-09-14T01:00:00.000Z",
  },
  {
    id: "popup-keynote-video",
    title: "Watch: DOS Club System Architecture Keynote",
    contentType: "YOUTUBE",
    mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // YouTube embed link
    badge: "KEYNOTE STREAM // TOUCHMARK DESCIENCE",
    description: "Deep dive into the 6 verification rings, telemetry validation, and how student engineers deploy autonomous AI agents on edge hardware.",
    actionLabel: "Watch on YouTube",
    actionUrl: "https://www.youtube.com",
    startsAt: "2026-09-14T14:00:00.000Z",
    endsAt: "2026-09-15T14:00:00.000Z",
    isActive: false,
    isSuperseded: false,
    supersededBy: null,
    createdAt: "2026-09-14T02:00:00.000Z",
    updatedAt: "2026-09-14T02:00:00.000Z",
  }
];

let inMemoryPopups: WelcomePopup[] | null = null;

export function getAllPopups(): WelcomePopup[] {
  if (inMemoryPopups) {
    return reconcilePrecedence(inMemoryPopups);
  }

  ensureDataDir();
  try {
    if (fs.existsSync(POPUPS_FILE)) {
      const raw = fs.readFileSync(POPUPS_FILE, "utf-8");
      const list: WelcomePopup[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        inMemoryPopups = reconcilePrecedence(list);
        return inMemoryPopups;
      }
    }
  } catch {
    // Fallback to seeds
  }

  inMemoryPopups = reconcilePrecedence(SEED_POPUPS);
  savePopupsToDisk(inMemoryPopups);
  return inMemoryPopups;
}

/**
 * Scheduling Precedence Rule:
 * "when schedules announcement for morning 8 am. and scheduled another for 10am -
 * the first scheduled must turn inactive 'if i havent given end time'"
 *
 * This function processes popups:
 * For any popup that has no `endsAt`, if there is another popup scheduled to start AFTER it,
 * the earlier open-ended popup is superseded once the newer scheduled popup's start time arrives,
 * and if the newer one is active, the earlier one is marked isSuperseded = true / isActive = false.
 */
export function reconcilePrecedence(popups: WelcomePopup[], asOfDate: Date = new Date()): WelcomePopup[] {
  const nowMs = asOfDate.getTime();

  // Sort by startsAt ascending
  const sorted = [...popups].map(p => ({ ...p })).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentStartMs = new Date(current.startsAt).getTime();

    // Check if there is a later popup that started after current
    for (let j = i + 1; j < sorted.length; j++) {
      const next = sorted[j];
      const nextStartMs = new Date(next.startsAt).getTime();

      // If next is enabled / active and its start time is after current
      if (next.isActive && nextStartMs > currentStartMs) {
        // If current had no end time given, or end time is after next starts
        if (!current.endsAt || new Date(current.endsAt).getTime() > nextStartMs) {
          // If the next popup's start time has arrived relative to now
          if (nowMs >= nextStartMs) {
            current.isSuperseded = true;
            current.supersededBy = next.id;
            // The first scheduled turns inactive if no end time was given
            if (!current.endsAt) {
              current.isActive = false;
            }
          }
        }
      }
    }
  }

  return sorted;
}

export function getActivePopup(asOfDate: Date = new Date()): WelcomePopup | null {
  const popups = getAllPopups();
  const reconciled = reconcilePrecedence(popups, asOfDate);
  const nowMs = asOfDate.getTime();

  // Find all currently valid active popups
  const activeCandidates = reconciled.filter(p => {
    if (!p.isActive) return false;
    if (p.isSuperseded) return false;
    const startMs = new Date(p.startsAt).getTime();
    if (startMs > nowMs) return false; // not started yet
    if (p.endsAt) {
      const endMs = new Date(p.endsAt).getTime();
      if (endMs <= nowMs) return false; // expired
    }
    return true;
  });

  if (activeCandidates.length === 0) {
    return null;
  }

  // Return the one with the latest start time (most recently active)
  activeCandidates.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  return activeCandidates[0];
}

function savePopupsToDisk(popups: WelcomePopup[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(POPUPS_FILE, JSON.stringify(popups, null, 2), "utf-8");
  } catch {
    // Keep in-memory copy
  }
}

export function createPopup(data: Omit<WelcomePopup, "id" | "createdAt" | "updatedAt" | "isSuperseded" | "supersededBy">): WelcomePopup {
  const current = getAllPopups();
  const id = `popup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const newPopup: WelcomePopup = {
    ...data,
    id,
    isActive: data.isActive !== undefined ? data.isActive : true,
    isSuperseded: false,
    supersededBy: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const list = [...current, newPopup];
  const reconciled = reconcilePrecedence(list);
  inMemoryPopups = reconciled;
  savePopupsToDisk(reconciled);
  return newPopup;
}

export function updatePopup(id: string, partial: Partial<WelcomePopup>): WelcomePopup | null {
  const current = getAllPopups();
  const idx = current.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const updated: WelcomePopup = {
    ...current[idx],
    ...partial,
    id, // protect id
    isSuperseded: false, // will be recalculated
    supersededBy: null,
    updatedAt: new Date().toISOString(),
  };

  current[idx] = updated;
  const reconciled = reconcilePrecedence(current);
  inMemoryPopups = reconciled;
  savePopupsToDisk(reconciled);
  return updated;
}

export function deletePopup(id: string): boolean {
  const current = getAllPopups();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;

  const reconciled = reconcilePrecedence(filtered);
  inMemoryPopups = reconciled;
  savePopupsToDisk(reconciled);
  return true;
}

export function togglePopupActive(id: string): WelcomePopup | null {
  const current = getAllPopups();
  const popup = current.find(p => p.id === id);
  if (!popup) return null;

  return updatePopup(id, { isActive: !popup.isActive });
}
