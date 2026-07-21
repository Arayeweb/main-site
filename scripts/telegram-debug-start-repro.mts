import { config } from "dotenv";
config({ path: ".env" });
import { upsertTelegramUser } from "../lib/telegram/users.ts";
import { checkRequiredMembership } from "../lib/telegram/membership.ts";
import { trackEvent } from "../lib/telegram/events.ts";
import { tgDebugLog } from "../lib/debugLog.ts";

async function main() {
  const telegramId = 94148165;
  const startedAt = Date.now();
  const marks: Record<string, number> = {};

  let t = Date.now();
  const user = await upsertTelegramUser(telegramId, { first_name: "debug" });
  marks.upsert_ms = Date.now() - t;
  if (!user) throw new Error("no user");

  t = Date.now();
  await trackEvent("bot_started", {
    telegramUserId: user.id,
    telegramId,
    metadata: { debug_repro: true },
  });
  marks.track_started_ms = Date.now() - t;

  t = Date.now();
  const membership = await checkRequiredMembership(telegramId, user.id);
  marks.membership_ms = Date.now() - t;

  t = Date.now();
  await trackEvent("forced_join_completed", {
    telegramUserId: user.id,
    telegramId,
    metadata: { debug_repro: true },
  });
  marks.track_join_ms = Date.now() - t;

  marks.total_before_welcome_ms = Date.now() - startedAt;
  tgDebugLog(
    "E",
    "local-repro:handleStart",
    "start before welcome (no send)",
    {
      ...marks,
      allJoined:
        membership.ok && "allJoined" in membership ? membership.allJoined : false,
    },
    "repro1"
  );
  console.log(JSON.stringify({ ...marks, membership }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
