import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  reserveCredits,
  refundCredits,
  settleCredits,
} from "@/lib/billing/credits";
import {
  computeActualCredits,
  isSettlementInvariantValid,
  settleRun,
} from "@/lib/ai/usage/settle";
import { prepareRun } from "@/lib/ai/orchestrator";
import {
  createBillingSupabase,
  resetBillingWalletLock,
  runBillingInvariant,
  type BillingSupabase,
} from "../mocks/billingSupabase";

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase";

const MIGRATION_FILES = [
  "supabase/migrations/20260715_ai_orchestration.sql",
  "supabase/migrations/20260716_ai_orchestration_hardening.sql",
];

function readMigration(name: string): string {
  return readFileSync(join(process.cwd(), name), "utf8");
}

function extractFunction(sql: string, fnName: string): string {
  const re = new RegExp(
    `create or replace function public\\.${fnName}[\\s\\S]*?\\$\\$;`,
    "i"
  );
  const match = sql.match(re);
  if (!match) throw new Error(`function ${fnName} not found in migration`);
  return match[0];
}

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const RUN_A = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const RUN_B = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function seedRun(
  db: BillingSupabase,
  opts: {
    runId: string;
    userId: string;
    reserved: number;
    status?: string;
  }
) {
  db.tables.ai_runs.push({
    id: opts.runId,
    user_id: opts.userId,
    mode: "direct",
    status: opts.status ?? "running",
    reserved_credits: opts.reserved,
    charged_credits: 0,
    refunded_credits: 0,
    metadata: {},
  });
}

describe("A — Credit RPC / DB security (SQL contract)", () => {
  for (const file of MIGRATION_FILES) {
    it(`${file} revokes credit RPC execute from anon and authenticated`, () => {
      const sql = readMigration(file);
      for (const fn of [
        "ai_reserve_credits",
        "ai_refund_credits",
        "ai_settle_credits",
      ]) {
        expect(sql).toMatch(
          new RegExp(
            `revoke all on function public\\.${fn}[\\s\\S]*?from anon`,
            "i"
          )
        );
        expect(sql).toMatch(
          new RegExp(
            `revoke all on function public\\.${fn}[\\s\\S]*?from authenticated`,
            "i"
          )
        );
        expect(sql).toMatch(
          new RegExp(
            `grant execute on function public\\.${fn}[\\s\\S]*?to service_role`,
            "i"
          )
        );
      }
    });
  }

  it("credit RPC functions are SECURITY DEFINER with hardened search_path", () => {
    const sql = readMigration(MIGRATION_FILES[1]);
    for (const fn of [
      "ai_reserve_credits",
      "ai_refund_credits",
      "ai_settle_credits",
    ]) {
      const body = extractFunction(sql, fn);
      expect(body).toMatch(/security definer/i);
      expect(body).toMatch(/set search_path = public,\s*pg_temp/i);
    }
  });

  it("reserve/refund/settle SQL enforce run ownership via user_id match", () => {
    const sql = readMigration(MIGRATION_FILES[1]);
    for (const fn of [
      "ai_reserve_credits",
      "ai_refund_credits",
      "ai_settle_credits",
    ]) {
      const body = extractFunction(sql, fn);
      expect(body).toMatch(/where id = p_run_id\s+and user_id = p_user_id/i);
      expect(body).toMatch(/raise exception 'run_not_found'/i);
    }
  });

  it("reserve SQL uses credits >= p_amount guard (no negative balance)", () => {
    const body = extractFunction(readMigration(MIGRATION_FILES[1]), "ai_reserve_credits");
    expect(body).toMatch(/and credits >= p_amount/i);
    expect(body).toMatch(/if v_balance is null then[\s\S]*return null;/i);
  });
});

describe("A — Credit RPC ownership (simulated wallet)", () => {
  let db: BillingSupabase;

  beforeEach(() => {
    resetBillingWalletLock();
    db = createBillingSupabase({
      ai_users: [
        { id: USER_A, plan: "pro", credits: 20 },
        { id: USER_B, plan: "pro", credits: 20 },
      ],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedRun(db, { runId: RUN_A, userId: USER_A, reserved: 6 });
    seedRun(db, { runId: RUN_B, userId: USER_B, reserved: 6 });
  });

  it("unauthorized caller cannot reserve credits for another user", async () => {
    const result = await reserveCredits(USER_B, 6, RUN_A);
    expect(result).toEqual({ ok: false, error: "server_error" });
    expect(db.tables.ai_users.find((u) => u.id === USER_A)?.credits).toBe(20);
    expect(db.tables.ai_credit_ledger).toHaveLength(0);
  });

  it("unauthorized caller cannot refund credits for another user", async () => {
    await reserveCredits(USER_A, 6, RUN_A);
    const result = await refundCredits(USER_B, 6, RUN_A);
    expect(result).toEqual({ ok: false, error: "server_error" });
    expect(db.tables.ai_users.find((u) => u.id === USER_A)?.credits).toBe(14);
  });

  it("unauthorized caller cannot settle credits for another user", async () => {
    await reserveCredits(USER_A, 6, RUN_A);
    const result = await settleCredits(USER_B, RUN_A, 6, 6);
    expect(result).toEqual({ ok: false, error: "server_error" });
    const run = db.tables.ai_runs.find((r) => r.id === RUN_A)!;
    expect(run.charged_credits).toBe(0);
    expect(run.refunded_credits).toBe(0);
  });
});

describe("B — Atomic credit reservation (simulated wallet)", () => {
  let db: BillingSupabase;

  beforeEach(() => {
    resetBillingWalletLock();
    db = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 10 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedRun(db, { runId: RUN_A, userId: USER_A, reserved: 8 });
    seedRun(db, { runId: RUN_B, userId: USER_A, reserved: 8 });
  });

  it("two concurrent reserve calls cannot overspend the same wallet", async () => {
    const [a, b] = await Promise.all([
      reserveCredits(USER_A, 8, RUN_A),
      reserveCredits(USER_A, 8, RUN_B),
    ]);

    const successes = [a, b].filter((r) => r.ok);
    const failures = [a, b].filter((r) => !r.ok);
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(db.tables.ai_users[0].credits).toBe(2);
    expect(db.tables.ai_credit_ledger.filter((e) => e.reason === "reserve")).toHaveLength(1);
  });

  it("credits never go negative", async () => {
    const first = await reserveCredits(USER_A, 8, RUN_A);
    expect(first.ok).toBe(true);
    const second = await reserveCredits(USER_A, 8, RUN_B);
    expect(second).toEqual({ ok: false, error: "insufficient_credits" });
    expect(db.tables.ai_users[0].credits).toBeGreaterThanOrEqual(0);
  });

  it("insufficient credits fail at reserve before run executor is returned", async () => {
    db.tables.ai_users[0].credits = 0;
    const runsBefore = db.tables.ai_runs.length;
    const reservesBefore = db.tables.ai_credit_ledger.filter((e) => e.reason === "reserve").length;

    const result = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "direct",
      prompt: "سلام",
      models: ["economy"],
    });

    expect(result).toMatchObject({ error: "insufficient_credits", status: 402 });
    expect(db.tables.ai_runs).toHaveLength(runsBefore);
    expect(db.tables.ai_credit_ledger.filter((e) => e.reason === "reserve")).toHaveLength(
      reservesBefore
    );
  });
});

describe("C — Settlement invariant (unit)", () => {
  beforeEach(() => {
    resetBillingWalletLock();
    vi.mocked(getSupabaseAdmin).mockReset();
  });

  it("successful direct settlement: reserved = charged + refunded", async () => {
    const db = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 20 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedRun(db, { runId: RUN_A, userId: USER_A, reserved: 3 });

    await reserveCredits(USER_A, 3, RUN_A);
    const result = await settleRun(USER_A, RUN_A, 3, [
      { model: "fast", credits: 3, succeeded: true },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(isSettlementInvariantValid(3, result.chargedCredits, result.refundedCredits)).toBe(true);
      expect(result.chargedCredits).toBe(3);
      expect(result.refundedCredits).toBe(0);
    }
    const run = db.tables.ai_runs[0];
    expect(runBillingInvariant(run)).toBe(true);
  });

  it("successful compare settlement charges sum of successful models", async () => {
    const db = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 30 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedRun(db, { runId: RUN_A, userId: USER_A, reserved: 12 });

    await reserveCredits(USER_A, 12, RUN_A);
    const result = await settleRun(USER_A, RUN_A, 12, [
      { model: "cmp-gpt-55", credits: 6, succeeded: true },
      { model: "cmp-claude-opus", credits: 6, succeeded: true },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.chargedCredits).toBe(12);
      expect(result.refundedCredits).toBe(0);
      expect(isSettlementInvariantValid(12, result.chargedCredits, result.refundedCredits)).toBe(true);
    }
  });

  it("compare with one failed model charges only successful side", async () => {
    const db = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 30 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedRun(db, { runId: RUN_A, userId: USER_A, reserved: 12 });

    await reserveCredits(USER_A, 12, RUN_A);
    const result = await settleRun(USER_A, RUN_A, 12, [
      { model: "cmp-gpt-55", credits: 6, succeeded: true },
      { model: "cmp-claude-opus", credits: 6, succeeded: false },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.chargedCredits).toBe(6);
      expect(result.refundedCredits).toBe(6);
      expect(isSettlementInvariantValid(12, 6, 6)).toBe(true);
    }
    expect(computeActualCredits([
      { model: "a", credits: 6, succeeded: true },
      { model: "b", credits: 6, succeeded: false },
    ])).toBe(6);
  });

  it("all-model failure refunds full reservation", async () => {
    const db = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 10 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedRun(db, { runId: RUN_A, userId: USER_A, reserved: 12 });

    await reserveCredits(USER_A, 12, RUN_A);
    const before = db.tables.ai_users[0].credits as number;
    const result = await settleRun(USER_A, RUN_A, 12, [
      { model: "a", credits: 6, succeeded: false },
      { model: "b", credits: 6, succeeded: false },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.chargedCredits).toBe(0);
      expect(result.refundedCredits).toBe(12);
      expect(db.tables.ai_users[0].credits).toBe(before + 12);
    }
  });

  it("settlement RPC failure returns settlement_failed without claiming success", async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } }),
    } as never);

    const result = await settleRun(USER_A, RUN_A, 6, [
      { model: "economy", credits: 6, succeeded: true },
    ]);

    expect(result).toEqual({
      ok: false,
      error: "settlement_failed",
      chargedCredits: 0,
      refundedCredits: 0,
      creditsRemaining: null,
    });
  });
});

describe("D — Plan gating (prepareRun)", () => {
  beforeEach(() => {
    resetBillingWalletLock();
    const db = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 100 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
  });

  it("free user cannot run Council", async () => {
    const result = await prepareRun({
      userId: USER_A,
      plan: "free",
      mode: "council",
      prompt: "test",
      models: [],
    });
    expect(result).toEqual({ error: "plan_upgrade_required", status: 403 });
  });

  it("starter user cannot run Council", async () => {
    const result = await prepareRun({
      userId: USER_A,
      plan: "starter",
      mode: "council",
      prompt: "test",
      models: [],
    });
    expect(result).toEqual({ error: "plan_upgrade_required", status: 403 });
  });

  it("pro user passes council plan gate when credits are enough", async () => {
    const slotSpy = vi.spyOn(await import("@/lib/redis/locks"), "acquireRunSlot").mockResolvedValue(true);

    const result = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "council",
      prompt: "test",
      models: ["cmp-deepseek-v4", "cmp-grok-4"],
    });

    slotSpy.mockRestore();
    expect(result).not.toHaveProperty("error");
    if (!("error" in result)) {
      expect(result.reservedCredits).toBeGreaterThan(0);
      expect(result.models.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("client cannot bypass plan gating with arbitrary council models", async () => {
    const result = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "council",
      prompt: "test",
      models: ["image-gpt", "video-sora"],
    });
    expect(result).toEqual({ error: "invalid_model", status: 422 });
  });
});

describe.skip("A/B/C — Postgres integration (requires test DB)", () => {
  /**
   * TODO: Wire a disposable Supabase/Postgres test database:
   * 1. Run migrations 20260702_ai_arena.sql through 20260716_ai_orchestration_hardening.sql
   * 2. Set TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY in CI
   * 3. Use real supabase-js client (not InMemorySupabase) to:
   *    - verify GRANT/REVOKE on ai_* RPC functions for anon/authenticated roles
   *    - run concurrent reserve from two sessions against one wallet
   *    - assert ai_runs_credit_settlement_check constraint on completed rows
   */
  it("placeholder — enable when TEST_SUPABASE_URL is configured", () => {});
});
