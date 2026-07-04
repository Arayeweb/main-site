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

export function ArenaAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState("free");
  const [hasContentBundle, setHasContentBundle] = useState(false);
  const [guestBattlesRemaining, setGuestBattlesRemaining] = useState<number | null>(null);
  const [guestDirectRemaining, setGuestDirectRemaining] = useState<number | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    return fetch("/api/ai/auth", { credentials: "same-origin" })
      .then((r) => r.json())
      .then(async (d) => {
        setAuthed(!!d.authed);
        setHasContentBundle(!!d.hasContentSalesBundle);
        if (d.authed && d.user) {
          setCredits(d.user.credits as number);
          setPlan((d.user.plan as string) || "free");
          const h = await fetch("/api/ai/history", { credentials: "same-origin" })
            .then((r) => r.json())
            .catch(() => null);
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
      })
      .catch(() => {
        setAuthed(false);
        setHistoryItems(readHistoryCache());
      });
  }, []);

  useEffect(() => {
    setHistoryItems(readHistoryCache());
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const onRefresh = () => loadHistory();
    window.addEventListener("ai:refresh", onRefresh);
    return () => window.removeEventListener("ai:refresh", onRefresh);
  }, [loadHistory]);

  useEffect(() => {
    const onThread = (e: Event) => {
      const detail = (e as CustomEvent<HistoryItem>).detail;
      if (!detail?.id) return;
      setAuthed(true);
      setHistoryItems((prev) => {
        if (prev.some((x) => x.id === detail.id)) return prev;
        const next = [detail, ...prev];
        prependHistoryCache(detail);
        return next;
      });
    };
    window.addEventListener("ai:thread-created", onThread);
    return () => window.removeEventListener("ai:thread-created", onThread);
  }, []);

  const prependHistory = useCallback((item: HistoryItem) => {
    setHistoryItems((prev) => {
      if (prev.some((x) => x.id === item.id)) return prev;
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
      refresh: loadHistory,
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
