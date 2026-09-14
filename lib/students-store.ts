import fs from "fs";
import path from "path";
import { StudentMember, INITIAL_STUDENTS } from "./admin-data";

const DATA_DIR = path.join(process.cwd(), "data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");

function ensureStudentsFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STUDENTS_FILE)) {
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Failed ensuring students.json file:", e);
  }
}

export function loadStudentsFromDisk(): StudentMember[] {
  ensureStudentsFile();
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const raw = fs.readFileSync(STUDENTS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed reading students.json:", e);
  }
  return [...INITIAL_STUDENTS];
}

export function saveStudentsToDisk(students: StudentMember[]): void {
  ensureStudentsFile();
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed writing students.json:", e);
  }
}

export function getStudents(includeArchived: boolean = false): StudentMember[] {
  const all = loadStudentsFromDisk();
  if (includeArchived) {
    return all;
  }
  return all.filter((s) => s.status !== "ARCHIVED");
}

export function getStudentById(query: string): StudentMember | undefined {
  const clean = query.trim().toUpperCase();
  const all = loadStudentsFromDisk();
  return all.find(
    (s) =>
      s.id.toUpperCase() === clean ||
      s.dosId.toUpperCase() === clean ||
      s.email.toLowerCase() === query.trim().toLowerCase()
  );
}

export function addStudent(newStudent: Omit<StudentMember, "id">): StudentMember {
  const all = loadStudentsFromDisk();
  const student: StudentMember = {
    ...newStudent,
    id: `a${String(Date.now()).slice(-7)}`,
  };
  all.push(student);
  saveStudentsToDisk(all);
  return student;
}

export function updateStudent(id: string, partial: Partial<StudentMember>): StudentMember | null {
  const all = loadStudentsFromDisk();
  const clean = id.trim().toUpperCase();
  const index = all.findIndex(
    (s) => s.id.toUpperCase() === clean || s.dosId.toUpperCase() === clean
  );
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...partial,
  };
  saveStudentsToDisk(all);
  return all[index];
}

export function archiveStudent(id: string): StudentMember | null {
  return updateStudent(id, { status: "ARCHIVED" });
}

export function restoreStudent(id: string): StudentMember | null {
  return updateStudent(id, { status: "ACTIVE" });
}

export function deleteStudentPermanently(id: string): boolean {
  const all = loadStudentsFromDisk();
  const clean = id.trim().toUpperCase();
  const filtered = all.filter(
    (s) => s.id.toUpperCase() !== clean && s.dosId.toUpperCase() !== clean
  );
  if (filtered.length < all.length) {
    saveStudentsToDisk(filtered);
    return true;
  }
  return false;
}
