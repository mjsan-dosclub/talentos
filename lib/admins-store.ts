import fs from "fs";
import path from "path";
import { TalentosAdminUser } from "@/app/api/admins/route";

const DATA_DIR = path.join(process.cwd(), "data");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

const INITIAL_ADMINS: TalentosAdminUser[] = [
  {
    id: "s0000001-0000-0000-0000-000000000001",
    name: "SUPER ADMIN",
    email: "admin@dosclub.org",
    custom_role_name: "Super Administrator",
    allowed_modules: ["all"],
    is_super_admin: true,
    is_active: true,
    force_password_change: false,
    created_at: "2026-01-01T00:00:00Z",
  },
];

function ensureAdminsFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ADMINS_FILE)) {
      fs.writeFileSync(ADMINS_FILE, JSON.stringify(INITIAL_ADMINS, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Failed ensuring admins.json file:", e);
  }
}

export function loadAdminsFromDisk(): TalentosAdminUser[] {
  ensureAdminsFile();
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const raw = fs.readFileSync(ADMINS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading admins.json:", e);
  }
  return [...INITIAL_ADMINS];
}

export function saveAdminsToDisk(admins: TalentosAdminUser[]): void {
  ensureAdminsFile();
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed writing admins.json:", e);
  }
}
