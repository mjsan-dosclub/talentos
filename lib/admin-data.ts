import { WORKSHOP_TOPICS_27 } from "./db";

export interface StudentMember {
  id: string;
  dosId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  institution: string;
  department: string;
  batch: string;
  completedWorkshops: number;
  status: "ACTIVE" | "ON_LEAVE" | "DEFENSE_READY" | "INACTIVE" | "ARCHIVED";
}

export interface ExpertMentor {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  designation: string;
  bio: string;
  avatar: string;
  linkedinUrl: string;
  githubUrl: string;
  domainSpecialties: string[];
  assignedWorkshops: string[];
  status: "ACTIVE" | "STANDBY" | "INACTIVE";
}

export interface PartnerInstitution {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  tier: string;
  region: string;
  lat: number;
  lng: number;
  geofenceRadiusMeters: number;
  studentCount: number;
  status: "ACTIVE" | "ONBOARDING" | "INACTIVE";
  pocName: string;
  pocRole: string;
  pocEmail: string;
  pocPhone: string;
}

export interface WorkshopItem {
  code: string;
  title: string;
  focusArea: string;
  expertName: string;
  mode: "IN_PERSON" | "HYBRID" | "VIRTUAL";
  testPassThreshold: number;
  status: "COMPLETED" | "ACTIVE_IN_SESSION" | "SCHEDULED" | "INACTIVE";
  date: string;
  detailedDescription?: string;
  prerequisites?: string;
}

export interface AuditLogEntry {
  id: string;
  category: "Students" | "Experts" | "Attendance" | "Certifications" | "System" | "Curriculum" | "Institutions" | "Enquiries";
  subcategory: string;
  action: "Create" | "Update" | "Perform" | "Archive" | "Delete" | "Bulk Update" | "Bulk Delete";
  modifiedBy: {
    name: string;
    email: string;
    avatar: string;
  };
  dateOfChange: string;
  sourceText: string;
  sourceUrl?: string;
}

export const INITIAL_STUDENTS: StudentMember[] = [];

export const INITIAL_EXPERTS: ExpertMentor[] = [];

export const INITIAL_INSTITUTIONS: PartnerInstitution[] = [];

export const INITIAL_WORKSHOPS: WorkshopItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
