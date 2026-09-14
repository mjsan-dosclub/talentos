export type PopupContentType = "YOUTUBE" | "FLYER" | "ACHIEVER" | "ANNOUNCEMENT";

export interface WelcomePopup {
  id: string;
  title: string;
  contentType: PopupContentType;
  mediaUrl: string; // YouTube embed URL, poster image, or portrait photo
  badge: string; // e.g. "CODEZAP 2026 // NATIONAL HACKATHON" or "ACHIEVER SPOTLIGHT"
  description: string;
  actionLabel: string;
  actionUrl: string;
  startsAt: string; // ISO 8601 string e.g. "2026-09-14T08:00:00"
  endsAt?: string | null; // ISO 8601 or null if open-ended
  isActive: boolean;
  isSuperseded?: boolean;
  supersededBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
