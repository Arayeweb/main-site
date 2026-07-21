"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  phoneMasked: string | null;
  guestBattlesRemaining: number | null;
  guestDirectRemaining: number | null;
  historyItems: HistoryItem[];
  refresh: () => void;
  setCredits: (n: number) => void;
  prependHistory: (item: HistoryItem) => void;
  renameHistoryItem: (id: string, title: string) => void;
  removeHistoryItem: (id: string) => void;
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
let loadGeneration = 0;

/** Drop stale auth/history responses (e.g. guest check finishing after login). */
export function invalidateArenaAuthCache() {
  authCache = null;
  authInFlight = null;
  loadGeneration += 1;
}

function fetchAuth(force: boolean): Promise<AuthPayload | null> {
  if (!force) {
    if (authCache && Date.now() - authCache.at < AUTH_CACHE_TTL_MS) {
      return Promise.resolve(authCache.data);
    }
    if (authInFlight) return authInFlight;
  }

  const signal = AbortSignal.timeout(isE2eModeClient() ? 1500 : 4000);
  const p = fetch("/api/ai/auth", {
    credentials: "same-origin",
    cache: "no-store",
    signal,
  })
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

async function fetchHistoryOnce(): Promise<AuthPayload | null> {
  const signal = AbortSignal.timeout(isE2eModeClient() ? 1500 : 8000);
  try {
    const res = await fetch("/api/ai/history", {
      credentials: "same-origin",
      cache: "no-store",
      signal,
    });
    return res.ok ? ((await res.json()) as AuthPayload) : null;
  } catch {
    return null;
  }
}

async function fetchHistoryWithRetry(): Promise<AuthPayload | null> {
  const first = await fetchHistoryOnce();
  if (first?.ok) return first;
  return fetchHistoryOnce();
}

export function ArenaAuthProvider({
  children,
  initialAuthed,
  initialUserId,
  initialPlan,
}: {
  children: ReactNode;
  initialAuthed: boolean;
  initialUserId: string | null;
  initialPlan: string;
}) {
  const [authed, setAuthed] = useState<boolean | null>(initialAuthed);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState(initialPlan);
  const [phoneMasked, setPhoneMasked] = useState<string | null>(null);
  const [guestBattlesRemaining, setGuestBattlesRemaining] = useState<number | null>(null);
  const [guestDirectRemaining, setGuestDirectRemaining] = useState<number | null>(null);
  // Always start with [] so server and client render identically (avoids hydration
  // mismatch: readHistoryCache reads localStorage which is unavailable on the server).
  // The cache is loaded client-side in the first useEffect below.
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const userIdRef = useRef<string | null>(initialAuthed ? initialUserId : null);

  const loadHistory = useCallback((opts?: { force?: boolean }) => {
    const gen = ++loadGeneration;

    return fetchAuth(Boolean(opts?.force)).then(async (d) => {
      if (gen !== loadGeneration) return;

      if (!d) return;

      setAuthed(!!d.authed);

      if (d.authed && d.user) {
        const user = d.user as {
          id?: string;
          credits?: number;
          plan?: string;
          phoneMasked?: string;
        };
        const userId = user.id ?? null;
        userIdRef.current = userId;
        if (typeof user.credits === "number") setCredits(user.credits);
        if (user.plan) setPlan(user.plan);
        setPhoneMasked(typeof user.phoneMasked === "string" ? user.phoneMasked : null);

        // Show this user's cached sidebar list immediately after re-login.
        setHistoryItems(readHistoryCache(userId));

        const h = await fetchHistoryWithRetry();
        if (gen !== loadGeneration) return;

        if (h?.ok) {
          const serverItems = (h.items || []) as HistoryItem[];
          setHistoryItems((prev) => {
            const merged = mergeHistoryItems(serverItems, prev);
            writeHistoryCache(merged, userId);
            return merged;
          });
        }
        return;
      }

      userIdRef.current = null;
      setCredits(null);
      setPlan("free");
      setPhoneMasked(null);
      setHistoryItems(readHistoryCache(null));
      if (typeof d.guestBattlesRemaining === "number") {
        setGuestBattlesRemaining(d.guestBattlesRemaining);
      }
      if (typeof d.guestDirectRemaining === "number") {
        setGuestDirectRemaining(d.guestDirectRemaining);
      }
    });
  }, []);

  // Hydrate history from local cache immediately on mount (before the auth fetch
  // resolves) so the sidebar is populated without a visible flash.
  useEffect(() => {
    setHistoryItems(readHistoryCache(initialAuthed ? initialUserId : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount — initialAuthed/initialUserId are stable props

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
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
        writeHistoryCache(next, userIdRef.current);
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
        writeHistoryCache(next, userIdRef.current);
        return next;
      }
      const next = [item, ...prev];
      prependHistoryCache(item, userIdRef.current);
      return next;
    });
  }, []);

  const renameHistoryItem = useCallback((id: string, title: string) => {
    const nextTitle = title.trim().slice(0, 80);
    if (!nextTitle) return;
    setHistoryItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, title: nextTitle } : it));
      writeHistoryCache(next, userIdRef.current);
      return next;
    });
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistoryItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      writeHistoryCache(next, userIdRef.current);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      authed,
      credits,
      plan,
      phoneMasked,
      guestBattlesRemaining,
      guestDirectRemaining,
      historyItems,
      refresh: () => loadHistory({ force: true }),
      setCredits,
      prependHistory,
      renameHistoryItem,
      removeHistoryItem,
    }),
    [
      authed,
      credits,
      plan,
      phoneMasked,
      guestBattlesRemaining,
      guestDirectRemaining,
      historyItems,
      loadHistory,
      prependHistory,
      renameHistoryItem,
      removeHistoryItem,
    ]
  );

  return <ArenaAuthContext.Provider value={value}>{children}</ArenaAuthContext.Provider>;
}

export function useArenaAuth() {
  const ctx = useContext(ArenaAuthContext);
  if (!ctx) throw new Error("useArenaAuth must be used within ArenaAuthProvider");
  return ctx;
}
