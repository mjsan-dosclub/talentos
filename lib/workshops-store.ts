import fs from "fs";
import path from "path";
import { WORKSHOP_TOPICS_27 } from "./db";

export interface WorkshopStoreRecord {
  id?: string;
  session_number: number;
  title: string;
  description?: string;
  trainer_name?: string;
  session_mode?: string;
  scheduled_at?: string;
  venue_name?: string;
  venue_lat?: number;
  venue_lng?: number;
  venue_radius_meters?: number;
  is_active?: boolean;
}

const DATA_DIR = path.join(process.cwd(), "data");
const WORKSHOPS_FILE = path.join(DATA_DIR, "workshops.json");

const DEFAULT_WORKSHOPS: WorkshopStoreRecord[] = WORKSHOP_TOPICS_27.map((topic, idx) => ({
  id: `ws-${String(idx + 1).padStart(2, "0")}`,
  session_number: idx + 1,
  title: topic,
  description: `Hands-on engineering workshop covering ${topic}.`,
  trainer_name: idx >= 13 ? "Priya Sundaram" : "Dr. Vikram Sethupathi",
  session_mode: "OFFLINE",
  scheduled_at: new Date(Date.now() + idx * 86400000).toISOString(),
  venue_name: "Anna University Campus / Chennai Hub",
  venue_lat: 13.011,
  venue_lng: 80.2354,
  venue_radius_meters: 150,
  is_active: true,
}));

function ensureWorkshopsFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WORKSHOPS_FILE)) {
      fs.writeFileSync(WORKSHOPS_FILE, JSON.stringify(DEFAULT_WORKSHOPS, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Failed ensuring workshops.json file:", e);
  }
}

export function loadWorkshopsFromDisk(): WorkshopStoreRecord[] {
  ensureWorkshopsFile();
  try {
    if (fs.existsSync(WORKSHOPS_FILE)) {
      const raw = fs.readFileSync(WORKSHOPS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading workshops.json:", e);
  }
  return [...DEFAULT_WORKSHOPS];
}

export function saveWorkshopsToDisk(workshops: WorkshopStoreRecord[]): void {
  ensureWorkshopsFile();
  try {
    fs.writeFileSync(WORKSHOPS_FILE, JSON.stringify(workshops, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed writing workshops.json:", e);
  }
}
