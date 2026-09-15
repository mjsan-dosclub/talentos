import { WelcomePopup, PopupContentType } from "./popups-types";
import { supabaseAdmin } from "./supabase-admin";

export type { WelcomePopup, PopupContentType };

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const POPUP_CHANNEL = "POPUP";
const SYSTEM_ACTOR_UUID = "11111111-1111-1111-1111-111111111111";

export const SEED_POPUPS: WelcomePopup[] = [
  {
    id: "popup-codezap-2026",
    title: "CodeZap 2026: National AI Systems Hackathon",
    contentType: "FLYER",
    mediaUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    badge: "FLASH ANNOUNCEMENT // CODEZAP 2026",
    description:
      "Touchmark Descience Open Source Club announces CodeZap 2026. 48-hour challenge building real-time distributed inference engines. Registrations open for all verified student members.",
    actionLabel: "Register for CodeZap 2026",
    actionUrl: "https://membership.descienceosclub.com/",
    startsAt: "2026-09-14T00:00:00.000Z",
    endsAt: null,
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
    mediaUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    badge: "DOS CLUB // RECENT ACHIEVER",
    description:
      "Divya completed 6 system defenses, validated 4 production AI pipelines at DOS Club, and secured a direct invite from NeuralScale with zero fresh graduate discount.",
    actionLabel: "Read Systems Story",
    actionUrl: "/casestudies/ananya-paged-kv-cache-runtime",
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
    mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    badge: "KEYNOTE STREAM // TOUCHMARK DESCIENCE",
    description:
      "Deep dive into the 6 verification rings, telemetry validation, and how student engineers deploy autonomous AI agents on edge hardware.",
    actionLabel: "Watch on YouTube",
    actionUrl: "https://www.youtube.com",
    startsAt: "2026-09-14T14:00:00.000Z",
    endsAt: "2026-09-15T14:00:00.000Z",
    isActive: false,
    isSuperseded: false,
    supersededBy: null,
    createdAt: "2026-09-14T02:00:00.000Z",
    updatedAt: "2026-09-14T02:00:00.000Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Supabase helpers
// ─────────────────────────────────────────────────────────────────────────────

async function readFromSupabase(): Promise<WelcomePopup[] | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notification_dispatches")
      .select("content, created_at")
      .eq("channel", POPUP_CHANNEL)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return null;

    const popups: WelcomePopup[] = [];
    for (const row of data) {
      try {
        const p: WelcomePopup =
          typeof row.content === "string" ? JSON.parse(row.content) : row.content;
        if (p && p.id) popups.push(p);
      } catch {
        // skip malformed rows
      }
    }
    return popups.length > 0 ? popups : null;
  } catch {
    return null;
  }
}

async function upsertToSupabase(popup: WelcomePopup): Promise<void> {
  try {
    const content = JSON.stringify(popup);

    const { data: existing } = await supabaseAdmin
      .from("notification_dispatches")
      .select("id")
      .eq("channel", POPUP_CHANNEL)
      .eq("title", popup.id)
      .maybeSingle();

    if (existing?.id) {
      await supabaseAdmin
        .from("notification_dispatches")
        .update({ content, target_filter: { popup: true } })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("notification_dispatches").insert({
        id: crypto.randomUUID(),
        channel: POPUP_CHANNEL,
        title: popup.id,
        content,
        target_filter: { popup: true },
        dispatched_by: SYSTEM_ACTOR_UUID,
        sent_count: 0,
      });
    }
  } catch {
    // Non-fatal
  }
}

async function deleteFromSupabase(popupId: string): Promise<void> {
  try {
    await supabaseAdmin
      .from("notification_dispatches")
      .delete()
      .eq("channel", POPUP_CHANNEL)
      .eq("title", popupId);
  } catch {
    // Non-fatal
  }
}

async function persistAllToSupabase(popups: WelcomePopup[]): Promise<void> {
  for (const p of popups) {
    await upsertToSupabase(p);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduling Precedence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scheduling Precedence Rule:
 * "when schedules announcement for morning 8 am and another for 10am —
 * the first must turn inactive if it has no end time."
 *
 * NOTE: Manual isActive toggles are source-of-truth — this only adjusts
 * isSuperseded flags based on scheduling order.
 */
export function reconcilePrecedence(
  popups: WelcomePopup[],
  asOfDate: Date = new Date()
): WelcomePopup[] {
  const nowMs = asOfDate.getTime();

  const sorted = [...popups]
    .map((p) => ({ ...p }))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentStartMs = new Date(current.startsAt).getTime();

    for (let j = i + 1; j < sorted.length; j++) {
      const next = sorted[j];
      const nextStartMs = new Date(next.startsAt).getTime();

      if (next.isActive && nextStartMs > currentStartMs) {
        if (!current.endsAt || new Date(current.endsAt).getTime() > nextStartMs) {
          if (nowMs >= nextStartMs) {
            current.isSuperseded = true;
            current.supersededBy = next.id;
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

// ─────────────────────────────────────────────────────────────────────────────
// Public API — all async (reads from Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllPopups(): Promise<WelcomePopup[]> {
  const fromDb = await readFromSupabase();
  if (fromDb && fromDb.length > 0) {
    return reconcilePrecedence(fromDb);
  }

  // First-run: seed Supabase from defaults
  const seeded = reconcilePrecedence(SEED_POPUPS);
  await persistAllToSupabase(seeded);
  return seeded;
}

export async function getActivePopup(asOfDate: Date = new Date()): Promise<WelcomePopup | null> {
  const popups = await getAllPopups();
  const reconciled = reconcilePrecedence(popups, asOfDate);
  const nowMs = asOfDate.getTime();

  const activeCandidates = reconciled.filter((p) => {
    if (!p.isActive) return false;
    if (p.isSuperseded) return false;
    const startMs = new Date(p.startsAt).getTime();
    if (startMs > nowMs) return false;
    if (p.endsAt) {
      const endMs = new Date(p.endsAt).getTime();
      if (endMs <= nowMs) return false;
    }
    return true;
  });

  if (activeCandidates.length === 0) return null;

  activeCandidates.sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
  );
  return activeCandidates[0];
}

export async function createPopup(
  data: Omit<WelcomePopup, "id" | "createdAt" | "updatedAt" | "isSuperseded" | "supersededBy">
): Promise<WelcomePopup> {
  const current = await getAllPopups();
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

  const list = reconcilePrecedence([...current, newPopup]);
  await persistAllToSupabase(list);
  return newPopup;
}

/**
 * Update a popup.
 * EXCLUSIVE ACTIVATION: if isActive === true, all other popups are deactivated first.
 */
export async function updatePopup(
  id: string,
  partial: Partial<WelcomePopup>
): Promise<WelcomePopup | null> {
  const current = await getAllPopups();
  const idx = current.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  let list = [...current];

  // Exclusive activation: deactivate all others when turning this one on
  if (partial.isActive === true) {
    list = list.map((p) =>
      p.id === id
        ? p
        : { ...p, isActive: false, isSuperseded: false, supersededBy: null }
    );
  }

  const updated: WelcomePopup = {
    ...list[idx],
    ...partial,
    id,
    isSuperseded: false,
    supersededBy: null,
    updatedAt: new Date().toISOString(),
  };
  list[list.findIndex((p) => p.id === id)] = updated;

  const reconciled = reconcilePrecedence(list);
  await persistAllToSupabase(reconciled);

  return reconciled.find((p) => p.id === id) ?? updated;
}

export async function deletePopup(id: string): Promise<boolean> {
  const current = await getAllPopups();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  await deleteFromSupabase(id);
  const reconciled = reconcilePrecedence(filtered);
  await persistAllToSupabase(reconciled);
  return true;
}

export async function togglePopupActive(id: string): Promise<WelcomePopup | null> {
  const current = await getAllPopups();
  const popup = current.find((p) => p.id === id);
  if (!popup) return null;
  return updatePopup(id, { isActive: !popup.isActive });
}
