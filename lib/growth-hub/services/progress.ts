/**
 * Deterministic milestone progress:
 * floor(completed / total * 100). Empty milestone set → 0.
 * Matches public.gh_recalc_service_progress.
 */
export function calculateServiceProgress(
  milestones: Array<{ status: string }>,
): number {
  const total = milestones.length;
  if (total === 0) return 0;
  const completed = milestones.filter((m) => m.status === "completed").length;
  return Math.floor((completed / total) * 100);
}
