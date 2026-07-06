/**
 * In-memory billing simulator mirroring Postgres RPC functions
 * (ai_reserve_credits / ai_refund_credits / ai_settle_credits).
 * Used for deterministic billing/security tests without a live DB.
 */

import { createTestSupabase, type InMemorySupabase } from "./supabaseMock";

type Row = Record<string, unknown>;

export type BillingTables = Record<string, Row[]> & {
  ai_users: Row[];
  ai_runs: Row[];
  ai_credit_ledger: Row[];
};

const RPC_ERRORS = {
  run_not_found: { message: "run_not_found", code: "P0001" },
  run_not_running: { message: "run_not_running", code: "P0001" },
  reserve_amount_mismatch: { message: "reserve_amount_mismatch", code: "P0001" },
  run_already_reserved: { message: "run_already_reserved", code: "P0001" },
  refund_exceeds_reserved: { message: "refund_exceeds_reserved", code: "P0001" },
  run_already_settled: { message: "run_already_settled", code: "P0001" },
  reserved_amount_mismatch: { message: "reserved_amount_mismatch", code: "P0001" },
  charged_exceeds_reserved: { message: "charged_exceeds_reserved", code: "P0001" },
} as const;

/** Serializes wallet mutations — approximates row-level locking in Postgres. */
let walletLock: Promise<void> = Promise.resolve();

function withWalletLock<T>(fn: () => T | Promise<T>): Promise<T> {
  const run = walletLock.then(fn, fn);
  walletLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function findRun(db: InMemorySupabase, runId: string, userId: string): Row | null {
  const row = db.tables.ai_runs?.find((r) => r.id === runId) ?? null;
  if (!row || row.user_id !== userId) return null;
  return row;
}

function userCredits(db: InMemorySupabase, userId: string): number {
  const user = db.tables.ai_users?.find((r) => r.id === userId);
  return (user?.credits as number) ?? 0;
}

function setUserCredits(db: InMemorySupabase, userId: string, credits: number) {
  const user = db.tables.ai_users?.find((r) => r.id === userId);
  if (user) user.credits = credits;
}

function hasLedgerReason(db: InMemorySupabase, runId: string, reason: string): boolean {
  return (
    db.tables.ai_credit_ledger?.some(
      (e) => e.run_id === runId && e.reason === reason
    ) ?? false
  );
}

function insertLedger(
  db: InMemorySupabase,
  entry: {
    user_id: string;
    delta: number;
    balance_after: number;
    reason: string;
    note: string;
    run_id: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (!db.tables.ai_credit_ledger) db.tables.ai_credit_ledger = [];
  db.tables.ai_credit_ledger.push({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...entry,
  });
}

async function rpcPrepareRunAndReserve(
  db: InMemorySupabase,
  p_user_id: string,
  p_run_id: string,
  p_mode: string,
  p_conversation_id: string | null,
  p_reserved_credits: number,
  p_metadata: Record<string, unknown> = {}
) {
  return withWalletLock(() => {
    if (p_reserved_credits <= 0) {
      return { data: null, error: { message: "amount must be > 0" } };
    }

    const user = db.tables.ai_users?.find((u) => u.id === p_user_id);
    if (!user) return { data: null, error: { message: "user_not_found" } };

    const balance = user.credits as number;
    if (balance < p_reserved_credits) {
      return {
        data: { ok: false, error: "insufficient_credits" },
        error: null,
      };
    }

    const convId = p_conversation_id || p_run_id;
    if (!db.tables.ai_runs) db.tables.ai_runs = [];
    if (db.tables.ai_runs.some((r) => r.id === p_run_id)) {
      return { data: null, error: { message: "run_already_exists" } };
    }

    db.tables.ai_runs.push({
      id: p_run_id,
      user_id: p_user_id,
      conversation_id: convId,
      mode: p_mode,
      status: "running",
      reserved_credits: p_reserved_credits,
      charged_credits: 0,
      refunded_credits: 0,
      metadata: p_metadata,
      created_at: new Date().toISOString(),
    });

    const newBalance = balance - p_reserved_credits;
    setUserCredits(db, p_user_id, newBalance);
    insertLedger(db, {
      user_id: p_user_id,
      delta: -p_reserved_credits,
      balance_after: newBalance,
      reason: "reserve",
      note: "reserve for run",
      run_id: p_run_id,
    });

    return {
      data: {
        ok: true,
        run_id: p_run_id,
        conversation_id: convId,
        plan: user.plan as string,
        credits_remaining: newBalance,
      },
      error: null,
    };
  });
}

async function rpcReserve(
  db: InMemorySupabase,
  p_user_id: string,
  p_amount: number,
  p_run_id: string
) {
  return withWalletLock(() => {
    if (p_amount <= 0) return { data: null, error: { message: "amount must be > 0" } };

    const run = findRun(db, p_run_id, p_user_id);
    if (!run) return { data: null, error: RPC_ERRORS.run_not_found };
    if (run.status !== "running") return { data: null, error: RPC_ERRORS.run_not_running };
    if (run.reserved_credits !== p_amount) {
      return { data: null, error: RPC_ERRORS.reserve_amount_mismatch };
    }
    if (hasLedgerReason(db, p_run_id, "reserve")) {
      return { data: null, error: RPC_ERRORS.run_already_reserved };
    }

    const balance = userCredits(db, p_user_id);
    if (balance < p_amount) return { data: null, error: null };

    const newBalance = balance - p_amount;
    setUserCredits(db, p_user_id, newBalance);
    insertLedger(db, {
      user_id: p_user_id,
      delta: -p_amount,
      balance_after: newBalance,
      reason: "reserve",
      note: "reserve for run",
      run_id: p_run_id,
    });
    return { data: newBalance, error: null };
  });
}

async function rpcRefund(
  db: InMemorySupabase,
  p_user_id: string,
  p_amount: number,
  p_run_id: string,
  p_note = "refund"
) {
  return withWalletLock(() => {
    if (p_amount <= 0) return { data: null, error: { message: "amount must be > 0" } };

    const run = findRun(db, p_run_id, p_user_id);
    if (!run) return { data: null, error: RPC_ERRORS.run_not_found };
    if (run.status !== "running") return { data: null, error: RPC_ERRORS.run_not_running };

    const reserved = run.reserved_credits as number;
    const charged = (run.charged_credits as number) ?? 0;
    const refunded = (run.refunded_credits as number) ?? 0;
    const remaining = Math.max(reserved - charged - refunded, 0);
    if (p_amount > remaining) return { data: null, error: RPC_ERRORS.refund_exceeds_reserved };

    const newBalance = userCredits(db, p_user_id) + p_amount;
    setUserCredits(db, p_user_id, newBalance);
    run.refunded_credits = refunded + p_amount;

    insertLedger(db, {
      user_id: p_user_id,
      delta: p_amount,
      balance_after: newBalance,
      reason: "refund",
      note: p_note,
      run_id: p_run_id,
    });
    return { data: newBalance, error: null };
  });
}

async function rpcSettle(
  db: InMemorySupabase,
  p_user_id: string,
  p_run_id: string,
  p_reserved: number,
  p_actual: number
) {
  return withWalletLock(() => {
    if (p_actual < 0) return { data: null, error: { message: "charged must be >= 0" } };

    const run = findRun(db, p_run_id, p_user_id);
    if (!run) return { data: null, error: RPC_ERRORS.run_not_found };
    if (run.status !== "running") return { data: null, error: RPC_ERRORS.run_not_running };

    const charged = (run.charged_credits as number) ?? 0;
    const refunded = (run.refunded_credits as number) ?? 0;
    if (charged !== 0 || refunded !== 0) {
      return { data: null, error: RPC_ERRORS.run_already_settled };
    }

    const v_reserved = run.reserved_credits as number;
    if (p_reserved !== v_reserved) {
      return { data: null, error: RPC_ERRORS.reserved_amount_mismatch };
    }
    if (p_actual > v_reserved) {
      return { data: null, error: RPC_ERRORS.charged_exceeds_reserved };
    }

    const v_refund = v_reserved - p_actual;
    let balance: number;

    if (v_refund > 0) {
      balance = userCredits(db, p_user_id) + v_refund;
      setUserCredits(db, p_user_id, balance);
    } else {
      balance = userCredits(db, p_user_id);
    }

    insertLedger(db, {
      user_id: p_user_id,
      delta: 0,
      balance_after: balance,
      reason: "charge",
      note: `charged ${p_actual} of ${v_reserved} reserved`,
      run_id: p_run_id,
      metadata: {
        reserved_credits: v_reserved,
        charged_credits: p_actual,
        refunded_credits: v_refund,
      },
    });

    if (v_refund > 0) {
      insertLedger(db, {
        user_id: p_user_id,
        delta: v_refund,
        balance_after: balance,
        reason: "refund",
        note: "unused reserved credits",
        run_id: p_run_id,
      });
    }

    run.charged_credits = p_actual;
    run.refunded_credits = v_refund;
    return { data: balance, error: null };
  });
}

export type BillingSupabase = InMemorySupabase & {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string; code?: string } | null }>;
};

/** Reset wallet lock between test files / suites. */
export function resetBillingWalletLock() {
  walletLock = Promise.resolve();
}

export function createBillingSupabase(initial: BillingTables): BillingSupabase {
  const db = createTestSupabase(initial) as BillingSupabase;

  db.rpc = async (fn, args) => {
    switch (fn) {
      case "ai_prepare_run_and_reserve_credits":
        return rpcPrepareRunAndReserve(
          db,
          String(args.p_user_id),
          String(args.p_run_id),
          String(args.p_mode),
          args.p_conversation_id != null ? String(args.p_conversation_id) : null,
          Number(args.p_reserved_credits),
          (args.p_metadata as Record<string, unknown>) ?? {}
        );
      case "ai_reserve_credits":
        return rpcReserve(
          db,
          String(args.p_user_id),
          Number(args.p_amount),
          String(args.p_run_id)
        );
      case "ai_refund_credits":
        return rpcRefund(
          db,
          String(args.p_user_id),
          Number(args.p_amount),
          String(args.p_run_id),
          typeof args.p_note === "string" ? args.p_note : "refund"
        );
      case "ai_settle_credits":
        return rpcSettle(
          db,
          String(args.p_user_id),
          String(args.p_run_id),
          Number(args.p_reserved),
          Number(args.p_actual)
        );
      default:
        return { data: null, error: { message: `unknown rpc: ${fn}` } };
    }
  };

  return db;
}

export function runBillingInvariant(run: Row): boolean {
  const reserved = (run.reserved_credits as number) ?? 0;
  const charged = (run.charged_credits as number) ?? 0;
  const refunded = (run.refunded_credits as number) ?? 0;
  const status = run.status as string;
  if (status === "settlement_failed") return true;
  if (status === "running") return charged + refunded <= reserved;
  return reserved === charged + refunded;
}
