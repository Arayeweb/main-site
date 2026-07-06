"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mergeHistoryItems, type HistoryItem } from "@/lib/aiHistory";
import { isE2eModeClient } from "@/lib/e2eMode";
import {
  prependHistoryCache,
  readHistoryCache,
  writeHistoryCache,
} from "@/lib/aiHistoryCache";

type ArenaAuthState = {
  authed: boolean | null;
  credits: number | null;
  plan: string;
  hasContentBundle: boolean;
  guestBattlesRemaining: number | null;
  guestDirectRemaining: number | null;
  historyItems: HistoryItem[];
  refresh: () => void;
  setCredits: (n: number) => void;
  prependHistory: (item: HistoryItem) => void;
};

const ArenaAuthContext = createContext<ArenaAuthState | null>(null);

// -----------------------------------------------------------------
// Module-level dedupe + short cache for GET /api/ai/auth.
// NOTE: this cached auth state is UI-display only — it is never an
// authority. All server routes re-verify the httpOnly cookie.
// -----------------------------------------------------------------
const AUTH_CACHE_TTL_MS = 30_000;

type AuthPayload = Record<string, unknown>;

let authInFlight: Promise<AuthPayload | null> | null = null;
let authCache: { data: AuthPayload; at: number } | null = null;

function fetchAuth(force: boolean): Promise<AuthPayload | null> {
  if (!force) {
    if (authCache && Date.now() - authCache.at < AUTH_CACHE_TTL_MS) {
      return Promise.resolve(authCache.data);
    }
    if (authInFlight) return authInFlight;
  }

  const signal = AbortSignal.timeout(isE2eModeClient() ? 1500 : 4000);
  const p = fetch("/api/ai/auth", { credentials: "same-origin", signal })
    .then((r) => r.json() as Promise<AuthPayload>)
    .then((d) => {
      authCache = { data: d, at: Date.now() };
      return d;
    })
    .catch(() => null)
    .finally(() => {
      if (authInFlight === p) authInFlight = null;
    });
  authInFlight = p;
  return p;
}

function fetchHistory(): Promise<AuthPayload | null> {
  // Fired in parallel with auth — guests simply get a cheap 401.
  return fetch("/api/ai/history", {
    credentials: "same-origin",
    signal: AbortSignal.timeout(isE2eModeClient() ? 1500 : 4000),
  })
    .then((r) => (r.ok ? (r.json() as Promise<AuthPayload>) : null))
    .catch(() => null);
}

export function ArenaAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState("free");
  const [hasContentBundle, setHasContentBundle] = useState(false);
  const [guestBattlesRemaining, setGuestBattlesRemaining] = useState<number | null>(null);
  const [guestDirectRemaining, setGuestDirectRemaining] = useState<number | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback((opts?: { force?: boolean }) => {
    // Fire auth + history in parallel instead of a waterfall.
    const authP = fetchAuth(Boolean(opts?.force));
    const historyP = fetchHistory();

    return authP.then(async (d) => {
      if (!d) {
        setAuthed(false);
        setHistoryItems(readHistoryCache());
        return;
      }
      setAuthed(!!d.authed);
      setHasContentBundle(!!d.hasContentSalesBundle);
      if (d.authed && d.user) {
        const user = d.user as { credits: number; plan?: string };
        setCredits(user.credits);
        setPlan(user.plan || "free");
        const h = await historyP;
        if (h?.ok) {
          const serverItems = (h.items || []) as HistoryItem[];
          setHistoryItems((prev) => {
            const merged = mergeHistoryItems(serverItems, prev);
            writeHistoryCache(merged);
            return merged;
          });
        }
      } else {
        setCredits(null);
        setPlan("free");
        setHasContentBundle(false);
        setHistoryItems(readHistoryCache());
        if (typeof d.guestBattlesRemaining === "number") {
          setGuestBattlesRemaining(d.guestBattlesRemaining);
        }
        if (typeof d.guestDirectRemaining === "number") {
          setGuestDirectRemaining(d.guestDirectRemaining);
        }
      }
    });
  }, []);

  useEffect(() => {
    setHistoryItems(readHistoryCache());
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    // refresh (ai:refresh) bypasses the module-level auth cache
    const onRefresh = () => loadHistory({ force: true });
    window.addEventListener("ai:refresh", onRefresh);
    return () => window.removeEventListener("ai:refresh", onRefresh);
  }, [loadHistory]);

  useEffect(() => {
    const onThread = (e: Event) => {
      const detail = (e as CustomEvent<HistoryItem>).detail;
      if (!detail?.id) return;
      setAuthed(true);
      setHistoryItems((prev) => {
        const idx = prev.findIndex((x) => x.id === detail.id);
        const merged: HistoryItem =
          idx >= 0
            ? {
                ...prev[idx],
                ...detail,
                title: detail.title || prev[idx].title,
                latestRunId: detail.latestRunId ?? prev[idx].latestRunId,
              }
            : detail;
        const rest = idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
        const next = [merged, ...rest];
        writeHistoryCache(next);
        return next;
      });
    };
    window.addEventListener("ai:thread-created", onThread);
    return () => window.removeEventListener("ai:thread-created", onThread);
  }, []);

  const prependHistory = useCallback((item: HistoryItem) => {
    setHistoryItems((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        const merged = { ...prev[idx], ...item, latestRunId: item.latestRunId ?? prev[idx].latestRunId };
        const next = [merged, ...prev.filter((_, i) => i !== idx)];
        writeHistoryCache(next);
        return next;
      }
      const next = [item, ...prev];
      prependHistoryCache(item);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      authed,
      credits,
      plan,
      hasContentBundle,
      guestBattlesRemaining,
      guestDirectRemaining,
      historyItems,
      refresh: () => loadHistory({ force: true }),
      setCredits,
      prependHistory,
    }),
    [
      authed,
      credits,
      plan,
      hasContentBundle,
      guestBattlesRemaining,
      guestDirectRemaining,
      historyItems,
      loadHistory,
      prependHistory,
    ]
  );

  return <ArenaAuthContext.Provider value={value}>{children}</ArenaAuthContext.Provider>;
}

export function useArenaAuth() {
  const ctx = useContext(ArenaAuthContext);
  if (!ctx) throw new Error("useArenaAuth must be used within ArenaAuthProvider");
  return ctx;
}
