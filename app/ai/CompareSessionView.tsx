"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconCheck,
  IconShare,
  IconSwords,
  ModelAvatar,
  UserAvatar,
} from "./icons";
import MarkdownMessage from "./MarkdownMessage";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";

type PublicModel = { id: string; name: string; poweredBy?: string; brand: string };
type Winner = "a" | "b" | "tie";
type Mode = "battle" | "side_by_side";

function historyTier(mode: Mode) {
  return mode === "side_by_side" ? "side_by_side" : "battle";
}

export default function CompareSessionView({
  mode,
  bootstrapPrompt = null,
  webSearch = false,
  battleId: initialBattleId = null,
  prompt: initialPrompt = "",
  responseA: initialResponseA = "",
  responseB: initialResponseB = "",
  modelA: initialModelA = null,
  modelB: initialModelB = null,
  winner: initialWinner = null,
  modelAId,
  modelBId,
  onCreditsChange,
}: {
  mode: Mode;
  bootstrapPrompt?: string | null;
  webSearch?: boolean;
  battleId?: string | null;
  prompt?: string;
  responseA?: string;
  responseB?: string;
  modelA?: PublicModel | null;
  modelB?: PublicModel | null;
  winner?: Winner | null;
  modelAId?: string;
  modelBId?: string;
  onCreditsChange?: (n: number) => void;
}) {
  const bootRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [battleId, setBattleId] = useState<string | null>(initialBattleId);
  const [prompt, setPrompt] = useState(initialPrompt || bootstrapPrompt || "");
  const [responseA, setResponseA] = useState(initialResponseA);
  const [responseB, setResponseB] = useState(initialResponseB);
  const [modelA, setModelA] = useState<PublicModel | null>(initialModelA);
  const [modelB, setModelB] = useState<PublicModel | null>(initialModelB);
  const [winner, setWinner] = useState<Winner | null>(initialWinner);
  const [loading, setLoading] = useState(!!bootstrapPrompt && !initialBattleId);
  const [streaming, setStreaming] = useState(!!bootstrapPrompt && !initialBattleId);
  const [err, setErr] = useState("");
  const [voting, setVoting] = useState(false);
  const [voteErr, setVoteErr] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const votable = !winner && !loading && !!responseA;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [loading, responseA, responseB, winner]);

  function notifyHistory(id: string, title: string) {
    window.dispatchEvent(
      new CustomEvent("ai:thread-created", {
        detail: {
          id,
          title: title.slice(0, 80),
          tier: historyTier(mode),
          createdAt: new Date().toISOString(),
        },
      })
    );
    window.setTimeout(() => window.dispatchEvent(new Event("ai:refresh")), 400);
  }

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current || initialBattleId) return;
    bootRef.current = true;
    setPrompt(bootstrapPrompt);

    (async () => {
      setLoading(true);
      setStreaming(true);
      setErr("");
      setResponseA("");
      setResponseB("");

      try {
        const body: Record<string, unknown> = {
          prompt: bootstrapPrompt,
          mode,
          webSearch,
        };
        if (mode === "side_by_side") {
          body.modelA = modelAId;
          body.modelB = modelBId;
        }

        const res = await fetch("/api/ai/battle/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.status === 401) {
          const data = await res.json().catch(() => null);
          if (data?.error === "guest_limit") {
            setErr("guest_limit");
            window.dispatchEvent(new Event("ai:guest-limit"));
          } else {
            setErr("login");
            window.dispatchEvent(new Event("ai:open-login"));
          }
          setLoading(false);
          setStreaming(false);
          return;
        }
        if (res.status === 402) {
          setErr("credits_out");
          setLoading(false);
          setStreaming(false);
          return;
        }
        if (res.status === 403) {
          setErr("mode_locked");
          setLoading(false);
          setStreaming(false);
          return;
        }
        if (!res.ok || !res.body) {
          setErr("server_error");
          setLoading(false);
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const line = chunk.trim();
            if (!line.startsWith("data:")) continue;
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(line.slice(5).trim());
            } catch {
              continue;
            }

            if (data.type === "delta" && typeof data.text === "string") {
              const side = data.side === "b" ? "b" : "a";
              if (side === "a") {
                setResponseA((prev) => prev + data.text);
              } else {
                setResponseB((prev) => prev + data.text);
              }
            } else if (data.type === "error") {
              const code = String(data.error ?? "");
              if (code === "guest_limit") {
                setErr("guest_limit");
                window.dispatchEvent(new Event("ai:guest-limit"));
              } else if (code === "plan_upgrade_required") {
                setErr("mode_locked");
              } else if (code === "insufficient_credits") {
                setErr("credits_out");
              } else if (code === "ai_error") {
                setErr("ai_error");
              } else {
                setErr("server_error");
              }
              setLoading(false);
              setStreaming(false);
              return;
            } else if (data.type === "done") {
              const id = String(data.id);
              setBattleId(id);
              setResponseA(String(data.responseA ?? ""));
              setResponseB(String(data.responseB ?? ""));
              if (data.modelA) setModelA(data.modelA as PublicModel);
              if (data.modelB) setModelB(data.modelB as PublicModel);
              if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);
              if (typeof data.guestBattlesRemaining === "number") {
                window.dispatchEvent(
                  new CustomEvent("ai:guest-remaining", { detail: data.guestBattlesRemaining })
                );
              }
              replaceThreadUrl(`/ai/battle/${id}`);
              notifyHistory(id, bootstrapPrompt);
              setLoading(false);
              setStreaming(false);
              return;
            }
          }
        }
      } catch {
        setErr("server_error");
      }
      setLoading(false);
      setStreaming(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  async function vote(w: Winner) {
    if (!battleId || voting || winner) return;
    setVoting(true);
    setVoteErr("");
    try {
      const res = await fetch("/api/ai/battle/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battleId, winner: w }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setVoteErr("ثبت رأی ناموفق بود.");
        setVoting(false);
        return;
      }
      setWinner(data.winner);
      setModelA(data.modelA);
      setModelB(data.modelB);
    } catch {
      setVoteErr("ثبت رأی ناموفق بود.");
    }
    setVoting(false);
  }

  async function shareBattle() {
    if (!battleId || sharing) return;
    setSharing(true);
    try {
      const res = await fetch("/api/ai/battle/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battleId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.shareUrl) {
        setVoteErr("اشتراک‌گذاری ناموفق بود.");
        setSharing(false);
        return;
      }
      try {
        await navigator.clipboard.writeText(data.shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch {
        /* ignore */
      }
    } catch {
      setVoteErr("اشتراک‌گذاری ناموفق بود.");
    }
    setSharing(false);
  }

  function answerCard(side: "a" | "b") {
    const response = side === "a" ? responseA : responseB;
    const model = side === "a" ? modelA : modelB;
    const isWinner = winner !== null && winner === side;
    const label = side === "a" ? "A" : "B";
    const isStreamingSide = streaming && !response;

    return (
      <div className={`ar-compare-col${isWinner ? " winner" : ""}`}>
        <div className="ar-compare-col-head">
          {model ? (
            <>
              <ModelAvatar modelId={model.id} size={28} />
              <span className="name-block">
                <span className="name">{model.name}</span>
                {model.poweredBy && (
                  <span className="powered-by">{model.poweredBy}</span>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="ar-anon-badge sm">{label}</span>
              <span className="name">مدل {label}</span>
            </>
          )}
          {isWinner && (
            <span className="ar-win-tag sm">
              <IconCheck size={11} />
              برنده
            </span>
          )}
        </div>
        <div className="ar-compare-col-body">
          <MarkdownMessage
            text={response || (isStreamingSide ? "" : "…")}
            streaming={streaming && !!response}
          />
          {isStreamingSide && <div className="ar-img-skeleton">در حال نوشتن…</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="ar-compare-wrap">
      <div
        className="ar-sr-only"
        aria-live="polite"
        aria-atomic="false"
      >
        {streaming ? `${responseA.slice(-60)} ${responseB.slice(-60)}`.trim() : ""}
      </div>
      <div className="ar-chat-scroll" ref={scrollRef}>
        <div className="ar-turn">
          <div className="ar-msg-user-row">
            <UserAvatar initial="ش" size={34} />
            <div className="ar-msg-user-bubble">{prompt}</div>
          </div>

          {loading && !responseA && !responseB && (
            <div className="ar-loading-note">
              <IconSwords size={16} />
              {mode === "battle" ? "دو مدل در حال پاسخ…" : "در حال مقایسه…"}
            </div>
          )}

          {(responseA || responseB || streaming) && (
            <div className="ar-compare-grid">
              {answerCard("a")}
              {answerCard("b")}
            </div>
          )}
        </div>

        {err === "guest_limit" && (
          <div className="ar-composer-err">
            ۲ نبرد رایگان تمام شد —{" "}
            <button type="button" className="ar-link-btn" onClick={() => window.dispatchEvent(new Event("ai:open-login"))}>
              ثبت‌نام کن
            </button>
          </div>
        )}
        {err === "login" && (
          <div className="ar-composer-err">
            برای این حالت{" "}
            <button type="button" className="ar-link-btn" onClick={() => window.dispatchEvent(new Event("ai:open-login"))}>
              وارد شو
            </button>
          </div>
        )}
        {err === "credits_out" && (
          <div className="ar-composer-err">
            کردیت کافی نیست — <Link href="/ai/pricing">خرید کردیت</Link>
          </div>
        )}
        {err === "mode_locked" && (
          <div className="ar-composer-err">
            این حالت در پلن فعلی نیست — <Link href="/ai/pricing">ارتقاء پلن</Link>
          </div>
        )}
        {err === "ai_error" && (
          <div className="ar-composer-err">مدل‌ها پاسخ ندادند. دوباره تلاش کن.</div>
        )}
        {err === "server_error" && (
          <div className="ar-composer-err">خطایی پیش آمد. دوباره تلاش کن.</div>
        )}

        {votable && mode === "battle" && (
          <div className="ar-vote-bar">
            <span>کدام بهتر بود؟</span>
            <button type="button" onClick={() => vote("a")} disabled={voting}>
              مدل A
            </button>
            <button type="button" onClick={() => vote("tie")} disabled={voting}>
              مساوی
            </button>
            <button type="button" onClick={() => vote("b")} disabled={voting}>
              مدل B
            </button>
          </div>
        )}
        {voteErr && <div className="ar-composer-err">{voteErr}</div>}

        {winner && (
          <div className="ar-battle-result">
            {winner === "tie" ? "مساوی!" : `برنده: مدل ${winner.toUpperCase()}`}
            {battleId && (
              <button type="button" className="ar-share-btn" onClick={shareBattle} disabled={sharing}>
                <IconShare size={14} />
                {copiedShare ? "کپی شد!" : "اشتراک"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
