// =========================================================
// Forced channel membership check
// =========================================================

import { getTelegramConfig } from "./config";
import { getChatMember } from "./api";
import { setMembershipFlags } from "./users";

export type MembershipResult =
  | { ok: true; joinedMain: boolean; joinedSales: boolean; allJoined: boolean }
  | { ok: false; error: string };

export async function checkRequiredMembership(
  telegramId: number,
  userId?: string
): Promise<MembershipResult> {
  const { requiredChannelId, salesChannelId } = getTelegramConfig();

  if (!requiredChannelId && !salesChannelId) {
    return { ok: true, joinedMain: true, joinedSales: true, allJoined: true };
  }

  const [main, sales] = await Promise.all([
    requiredChannelId
      ? getChatMember(requiredChannelId, telegramId)
      : Promise.resolve({ ok: true, joined: true }),
    salesChannelId
      ? getChatMember(salesChannelId, telegramId)
      : Promise.resolve({ ok: true, joined: true }),
  ]);

  if (!main.ok || !sales.ok) {
    return { ok: false, error: "api_error" };
  }

  const joinedMain = main.joined;
  const joinedSales = sales.joined;
  const allJoined = joinedMain && joinedSales;

  if (userId) {
    await setMembershipFlags(userId, joinedMain, joinedSales);
  }

  return { ok: true, joinedMain, joinedSales, allJoined };
}
