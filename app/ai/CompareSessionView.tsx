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
import PlanUpsellBanner from "./PlanUpsellBanner";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import { getModel, modelName } from "@/lib/aiModels";
import {
  startRunStream,
  stopRunStream,
  classifyRunStreamError,
  runStreamErrorMessage,
} from "@/lib/ai/client/runStream";
import type { RunSSEEvent } from "@/lib/ai/streaming/sse";
import type { StaticRunHydration } from "@/lib/ai/runs/types";
import ArenaComposer from "./ArenaComposer";

type PublicModel = { id: string; name: string; poweredBy?: string; brand: string };

type CompareTurn = {
  runId: string | null;
  prompt: string;
  modelIds: string[];
  responses: Record<string, string>;
  modelErrors: Record<string, string>;
  selectedVote: string | null;
};

function hydrationToTurn(h: StaticRunHydration): CompareTurn {
  return {
    runId: h.runId,
    prompt: h.prompt,
    modelIds: h.models,
    responses: h.answers,
    modelErrors: h.modelErrors,
    selectedVote: h.selectedVote,
  };
}

export default function CompareSessionView({
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
  conversationId: initialConversationId = null,
  threadRuns = [],
  onCreditsChange,
}: {
  /** Legacy prop — compare sessions only; council uses CouncilSessionView */
  mode?: "battle" | "side_by_side";
  bootstrapPrompt?: string | null;
  webSearch?: boolean;
  battleId?: string | null;
  prompt?: string;
  responseA?: string;
  responseB?: string;
  modelA?: PublicModel | null;
  modelB?: PublicModel | null;
  winner?: string | null;
  modelAId?: string;
  modelBId?: string;
  conversationId?: string | null;
  threadRuns?: StaticRunHydration[];
  onCreditsChange?: (n: number) => void;
}) {
  const bootRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef<string | null>(null);
  const streamAbortRef = useRef<(() => void) | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<string | null>(initialConversationId);

  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [archivedTurns, setArchivedTurns] = useState<CompareTurn[]>(() =>
    threadRuns.length ? threadRuns.map(hydrationToTurn) : []
  );
  const [followUpInput, setFollowUpInput] = useState("");
  const [runId, setRunId] = useState<string | null>(initialBattleId);
  const [prompt, setPrompt] = useState(initialPrompt || bootstrapPrompt || "");
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    if (initialModelA?.id) m[initialModelA.id] = initialResponseA;
    if (initialModelB?.id) m[initialModelB.id] = initialResponseB;
    if (modelAId && initialResponseA) m[modelAId] = initialResponseA;
    if (modelBId && initialResponseB) m[modelBId] = initialResponseB;
    return m;
  });
  const [modelIds, setModelIds] = useState<string[]>(() => {
    if (initialModelA?.id && initialModelB?.id) return [initialModelA.id, initialModelB.id];
    if (modelAId && modelBId) return [modelAId, modelBId];
    return [];
  });
  const [modelErrors, setModelErrors] = useState<Record<string, string>>({});
  const [selectedVote, setSelectedVote] = useState<string | null>(
    initialWinner === "a"
      ? initialModelA?.id ?? modelAId ?? null
      : initialWinner === "b"
        ? initialModelB?.id ?? modelBId ?? null
        : null
  );
  const [loading, setLoading] = useState(!!bootstrapPrompt && !initialBattleId);
  const [streaming, setStreaming] = useState(!!bootstrapPrompt && !initialBattleId);
  const [err, setErr] = useState("");
  const [voting, setVoting] = useState(false);
  const [voteErr, setVoteErr] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const canFollowUp =
    !!conversationId && !!modelAId && !!modelBId && !streaming && !loading;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [loading, responses, streaming, modelErrors, archivedTurns, followUpInput]);

  function notifyHistory(conversationAnchor: string, latestRunId: string, title: string) {
    window.dispatchEvent(
      new CustomEvent("ai:thread-created", {
        detail: {
          id: conversationAnchor,
          latestRunId,
          title: title.slice(0, 80),
          tier: "side_by_side",
          createdAt: new Date().toISOString(),
          source: "run",
        },
      })
    );
    window.setTimeout(() => window.dispatchEvent(new Event("ai:refresh")), 400);
  }

  async function runCompareStream(
    userPrompt: string,
    opts: { isBootstrap?: boolean; isFollowUp?: boolean }
  ) {
    if (!modelAId || !modelBId) return;
    setLoading(true);
    setStreaming(true);
    setErr("");
    setPrompt(userPrompt);
    setModelIds([modelAId, modelBId]);
    setResponses({ [modelAId]: "", [modelBId]: "" });
    setModelErrors({});
    setSelectedVote(null);
    setRunId(null);

    const ac = new AbortController();
    abortRef.current = ac;
    const conv = conversationRef.current ?? conversationId;
    const liveResponses: Record<string, string> = { [modelAId]: "", [modelBId]: "" };
    const liveErrors: Record<string, string> = {};

    const result = await startRunStream(
      {
        mode: "compare",
        models: [modelAId, modelBId],
        modelA: modelAId,
        modelB: modelBId,
        prompt: userPrompt,
        conversationId: conv,
        webSearch,
      },
      {
        onRunId: (id) => {
          runIdRef.current = id;
          setRunId(id);
        },
        onEvent: (ev: RunSSEEvent) => {
          if (ev.type === "run_started") {
            setModelIds(ev.models);
            if (!conv) {
              conversationRef.current = ev.runId;
              setConversationId(ev.runId);
            }
          } else if (ev.type === "model_delta") {
            liveResponses[ev.model] = (liveResponses[ev.model] ?? "") + ev.text;
            setResponses((prev) => ({
              ...prev,
              [ev.model]: (prev[ev.model] ?? "") + ev.text,
            }));
          } else if (ev.type === "model_error") {
            liveErrors[ev.model] = runStreamErrorMessage(ev.errorCode);
            setModelErrors((prev) => ({
              ...prev,
              [ev.model]: runStreamErrorMessage(ev.errorCode),
            }));
          } else if (ev.type === "usage_update") {
            onCreditsChange?.(ev.creditsRemaining);
          }
        },
      },
      ac.signal
    );

    streamAbortRef.current = result.abort;

    if (result.lastErrorCode) {
      const code = classifyRunStreamError(result.lastErrorCode);
      if (code === "unauthorized") {
        setErr("login");
        window.dispatchEvent(new Event("ai:open-login"));
      } else if (code === "insufficient_credits") setErr("credits_out");
      else if (code === "plan_upgrade_required") setErr("mode_locked");
      else if (code === "rate_limited" || code === "too_many_concurrent") setErr("rate_limited");
      else if (code === "provider_error") setErr("ai_error");
      else setErr("server_error");
    } else if (result.status === "completed" && result.runId) {
      const finalRunId = result.runId;
      const finalConv = conversationRef.current ?? conversationId ?? finalRunId;
      conversationRef.current = finalConv;
      setConversationId(finalConv);
      replaceThreadUrl(`/ai/runs/${finalRunId}`);
      setArchivedTurns((prev) => [
        ...prev,
        {
          runId: finalRunId,
          prompt: userPrompt,
          modelIds: [modelAId, modelBId],
          responses: { ...liveResponses },
          modelErrors: { ...liveErrors },
          selectedVote: null,
        },
      ]);
      setPrompt("");
      setResponses({});
      setModelIds([]);
      setRunId(null);
      notifyHistory(finalConv, finalRunId, userPrompt);
    } else if (result.status === "cancelled") {
      setErr("cancelled");
    }

    setLoading(false);
    setStreaming(false);
    runIdRef.current = null;
    streamAbortRef.current = null;
    abortRef.current = null;
  }

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current || initialBattleId || threadRuns.length > 0) return;
    if (!modelAId || !modelBId) return;
    bootRef.current = true;
    void runCompareStream(bootstrapPrompt, { isBootstrap: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  function sendFollowUp() {
    const q = followUpInput.trim();
    if (!q || !canFollowUp) return;
    setFollowUpInput("");
    void runCompareStream(q, { isFollowUp: true });
  }

  async function voteForModel(modelId: string, targetRunId: string) {
    if (!targetRunId || voting) return;
    const already = selectedVote || archivedTurns.some((t) => t.runId === targetRunId && t.selectedVote);
    if (already) return;
    setVoting(true);
    setVoteErr("");
    try {
      const res = await fetch("/api/feedback/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: targetRunId, selectedModel: modelId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setVoteErr("ثبت رأی ناموفق بود.");
        setVoting(false);
        return;
      }
      setSelectedVote(modelId);
      setArchivedTurns((prev) =>
        prev.map((t) => (t.runId === targetRunId ? { ...t, selectedVote: modelId } : t))
      );
    } catch {
      setVoteErr("ثبت رأی ناموفق بود.");
    }
    setVoting(false);
  }

  async function shareBattle(targetRunId: string) {
    if (!targetRunId || sharing) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/ai/runs/${targetRunId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  async function handleStop() {
    const id = runIdRef.current;
    abortRef.current?.abort();
    streamAbortRef.current?.();
    if (id) await stopRunStream(id, () => undefined);
    setStreaming(false);
    setLoading(false);
    setErr("cancelled");
  }

  function modelMeta(id: string): PublicModel | null {
    if (initialModelA?.id === id) return initialModelA;
    if (initialModelB?.id === id) return initialModelB;
    const m = getModel(id);
    if (!m) return null;
    return { id: m.id, name: m.name, poweredBy: m.poweredBy, brand: m.brand ?? "" };
  }

  function answerCard(
    modelId: string,
    turn: { responses: Record<string, string>; modelErrors: Record<string, string>; selectedVote: string | null },
    isLive: boolean
  ) {
    const response = turn.responses[modelId] ?? "";
    const model = modelMeta(modelId);
    const isWinner = turn.selectedVote === modelId;
    const modelErr = turn.modelErrors[modelId];
    const isStreamingSide = isLive && streaming && !response && !modelErr;

    return (
      <div className={`ar-compare-col${isWinner ? " winner" : ""}`} key={modelId}>
        <div className="ar-compare-col-head">
          {model ? (
            <>
              <ModelAvatar modelId={model.id} size={28} />
              <span className="name-block">
                <span className="name">{model.name}</span>
                {model.poweredBy && <span className="powered-by">{model.poweredBy}</span>}
              </span>
            </>
          ) : (
            <>
              <span className="ar-anon-badge sm">{modelId.slice(0, 2)}</span>
              <span className="name">{modelName(modelId)}</span>
            </>
          )}
          {isWinner && (
            <span className="ar-win-tag sm">
              <IconCheck size={11} />
              انتخاب شما
            </span>
          )}
        </div>
        <div className="ar-compare-col-body">
          {modelErr ? (
            <div className="ar-composer-err">{modelErr}</div>
          ) : (
            <>
              <MarkdownMessage text={response || (isStreamingSide ? "" : "…")} streaming={isLive && streaming && !!response} />
              {isStreamingSide && <div className="ar-img-skeleton">در حال نوشتن…</div>}
            </>
          )}
        </div>
      </div>
    );
  }

  const showGrid =
    modelIds.length > 0 &&
    (streaming || modelIds.some((id) => responses[id] || modelErrors[id]));

  const activeTurn: CompareTurn | null =
    prompt || streaming || loading
      ? {
          runId,
          prompt,
          modelIds,
          responses,
          modelErrors,
          selectedVote,
        }
      : null;

  function renderTurnBlock(turn: CompareTurn, live: boolean) {
    const show = turn.modelIds.length > 0 && turn.modelIds.some((id) => turn.responses[id] || turn.modelErrors[id] || live);
    const turnVotable =
      !!turn.runId &&
      !turn.selectedVote &&
      turn.modelIds.some((id) => turn.responses[id]?.trim()) &&
      !live &&
      !loading &&
      !streaming;
    const liveVotable =
      live &&
      !!turn.runId &&
      !turn.selectedVote &&
      !loading &&
      !streaming &&
      turn.modelIds.some((id) => turn.responses[id]?.trim());
    return (
      <div className="ar-turn" key={turn.runId ?? turn.prompt}>
        <div className="ar-msg-user-row">
          <UserAvatar initial="ش" size={34} />
          <div className="ar-msg-user-bubble">{turn.prompt}</div>
        </div>
        {live && loading && !show && (
          <div className="ar-loading-note">
            <IconSwords size={16} />
            در حال مقایسه…
          </div>
        )}
        {show && (
          <div className="ar-compare-grid">
            {turn.modelIds.map((id) => answerCard(id, turn, live))}
          </div>
        )}
        {liveVotable && (
          <div className="ar-vote-bar">
            <span>کدام بهتر بود؟</span>
            {turn.modelIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => voteForModel(id, turn.runId!)}
                disabled={voting || !!turn.modelErrors[id]}
              >
                {modelMeta(id)?.name ?? modelName(id)}
              </button>
            ))}
          </div>
        )}
        {turnVotable && (
          <div className="ar-vote-bar">
            <span>کدام بهتر بود؟</span>
            {turn.modelIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => voteForModel(id, turn.runId!)}
                disabled={voting || !!turn.modelErrors[id]}
              >
                {modelMeta(id)?.name ?? modelName(id)}
              </button>
            ))}
          </div>
        )}
        {turn.selectedVote && turn.runId && (
          <div className="ar-battle-result">
            انتخاب شما: {modelMeta(turn.selectedVote)?.name ?? modelName(turn.selectedVote)}
            <button
              type="button"
              className="ar-share-btn"
              onClick={() => shareBattle(turn.runId!)}
              disabled={sharing}
            >
              <IconShare size={14} />
              {copiedShare ? "کپی شد!" : "اشتراک"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ar-compare-wrap">
      {streaming && (
        <div className="ar-council-stop-bar">
          <button type="button" className="ar-council-stop-btn" onClick={handleStop}>
            توقف تولید
          </button>
        </div>
      )}
      <div className="ar-sr-only" aria-live="polite" aria-atomic="false">
        {streaming ? modelIds.map((id) => responses[id]?.slice(-40)).join(" ") : ""}
      </div>
      <div className="ar-chat-scroll" ref={scrollRef}>
        {archivedTurns.map((turn) => renderTurnBlock(turn, false))}
        {activeTurn && renderTurnBlock(activeTurn, true)}

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
        {err === "mode_locked" && <PlanUpsellBanner variant="mode" onDismiss={() => setErr("")} />}
        {err === "ai_error" && (
          <div className="ar-composer-err">{runStreamErrorMessage("provider_error")}</div>
        )}
        {err === "rate_limited" && (
          <div className="ar-composer-err">{runStreamErrorMessage("rate_limited")}</div>
        )}
        {err === "cancelled" && (
          <div className="ar-composer-err">{runStreamErrorMessage("cancelled")}</div>
        )}
        {err === "server_error" && (
          <div className="ar-composer-err">{runStreamErrorMessage("server_error")}</div>
        )}

        {voteErr && <div className="ar-composer-err">{voteErr}</div>}
      </div>
      {canFollowUp && (
        <div className="ar-chat-composer">
          <ArenaComposer
            input={followUpInput}
            onInputChange={setFollowUpInput}
            onSubmit={sendFollowUp}
            streaming={streaming}
            showAttach={false}
            showMic={false}
            placeholder="ادامه مقایسه…"
          />
        </div>
      )}
    </div>
  );
}
