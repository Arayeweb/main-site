// =========================================================
// Forced channel membership check
// =========================================================

import { getTelegramConfig } from "./config";
import { getChatMember } from "./api";
import { setMembershipFlags } from "./users";
import { tgDebugLog } from "@/lib/debugLog";

export type MembershipResult =
  | { ok: true; joinedMain: boolean; joinedSales: boolean; allJoined: boolean }
  | { ok: false; error: string };

export async function checkRequiredMembership(
  telegramId: number,
  userId?: string
): Promise<MembershipResult> {
  const started = Date.now();
  const { requiredChannelId, salesChannelId } = getTelegramConfig();

  if (!requiredChannelId && !salesChannelId) {
    return { ok: true, joinedMain: true, joinedSales: true, allJoined: true };
  }

  const apiStart = Date.now();
  const [main, sales] = await Promise.all([
    requiredChannelId
      ? getChatMember(requiredChannelId, telegramId)
      : Promise.resolve({ ok: true, joined: true }),
    salesChannelId
      ? getChatMember(salesChannelId, telegramId)
      : Promise.resolve({ ok: true, joined: true }),
  ]);
  const apiMs = Date.now() - apiStart;

  if (!main.ok || !sales.ok) {
    // #region agent log
    tgDebugLog("A", "membership.ts:checkRequiredMembership", "membership api_error", {
      apiMs,
      totalMs: Date.now() - started,
      mainOk: main.ok,
      salesOk: sales.ok,
    });
    // #endregion
    return { ok: false, error: "api_error" };
  }

  const joinedMain = main.joined;
  const joinedSales = sales.joined;
  const allJoined = joinedMain && joinedSales;

  let flagsMs = 0;
  if (userId) {
    const flagsStart = Date.now();
    await setMembershipFlags(userId, joinedMain, joinedSales);
    flagsMs = Date.now() - flagsStart;
  }

  // #region agent log
  tgDebugLog("A", "membership.ts:checkRequiredMembership", "membership check done", {
    apiMs,
    flagsMs,
    totalMs: Date.now() - started,
    allJoined,
  });
  // #endregion

  return { ok: true, joinedMain, joinedSales, allJoined };
}
