export const TEACHERS_LEAD_DEDUP_WINDOW_MS = 30 * 60 * 1000;

export const TEACHERS_LEAD_CHANNEL = "teachers_landing";
export const TEACHERS_LEAD_GOAL = "teacher_website";

export type TeachersLeadRow = {
  contact: string;
  channel: string | null;
  goal: string | null;
  created_at: string;
};

export function isTeachersCampaignLead(channel: string | null, goal: string | null): boolean {
  return channel === TEACHERS_LEAD_CHANNEL && goal === TEACHERS_LEAD_GOAL;
}

export function hasRecentTeachersLead(
  rows: TeachersLeadRow[],
  contact: string,
  now = Date.now(),
  windowMs = TEACHERS_LEAD_DEDUP_WINDOW_MS,
): boolean {
  const since = now - windowMs;
  return rows.some((row) => {
    if (row.contact !== contact) return false;
    if (!isTeachersCampaignLead(row.channel, row.goal)) return false;
    return new Date(row.created_at).getTime() >= since;
  });
}

export function teachersLeadDedupSinceIso(
  now = Date.now(),
  windowMs = TEACHERS_LEAD_DEDUP_WINDOW_MS,
): string {
  return new Date(now - windowMs).toISOString();
}
