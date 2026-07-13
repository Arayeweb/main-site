"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconSpark, ModelAvatar, UserAvatar } from "./icons";
import MarkdownMessage from "./MarkdownMessage";
import PlanUpsellBanner from "./PlanUpsellBanner";
import ArenaComposer from "./ArenaComposer";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import { getModel, modelName } from "@/lib/aiModels";
import {
  startRunStream,
  stopRunStream,
  classifyRunStreamError,
  runStreamErrorMessage,
} from "@/lib/ai/client/runStream";
import { buildMultiModelRunMessages } from "@/lib/ai/client/buildMessages";
import type { RunSSEEvent } from "@/lib/ai/streaming/sse";
import type { StaticRunHydration } from "@/lib/ai/runs/types";

type CouncilTurn = StaticRunHydration;

export default function CouncilSessionView({
  bootstrapPrompt = null,
  modelAId,
  modelBId,
  conversationId: initialConversationId = null,
  threadRuns = [],
  onCreditsChange,
}: {
  bootstrapPrompt?: string | null;
  modelAId?: string;
  modelBId?: string;
  conversationId?: string | null;
  threadRuns?: StaticRunHydration[];
  onCreditsChange?: (n: number) => void;
}) {
  const bootRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<string | null>(initialConversationId);

  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [archivedTurns, setArchivedTurns] = useState<CouncilTurn[]>(() => threadRuns);
  const [followUpInput, setFollowUpInput] = useState("");

  const [prompt, setPrompt] = useState("");
  const [modelIds, setModelIds] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [modelErrors, setModelErrors] = useState<Record<string, string>>({});
  const [critique, setCritique] = useState("");
  const [summary, setSummary] = useState("");
  const [showCritique, setShowCritique] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canFollowUp =
    !!conversationId && !bootstrapPrompt && !streaming && !loading && archivedTurns.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [archivedTurns, responses, critique, summary, streaming, showCritique, showSummary, followUpInput]);

  function notifyHistory(conversationAnchor: string, latestRunId: string, title: string) {
    window.dispatchEvent(
      new CustomEvent("ai:thread-created", {
        detail: {
          id: conversationAnchor,
          latestRunId,
          title: title.slice(0, 80),
          tier: "council",
          createdAt: new Date().toISOString(),
          source: "run",
        },
      })
    );
    window.setTimeout(() => window.dispatchEvent(new Event("ai:refresh")), 400);
  }

  async function runCouncilStream(userPrompt: string, opts: { isBootstrap?: boolean }) {
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setStreaming(true);
    setErr("");
    setPrompt(userPrompt);
    setCritique("");
    setSummary("");
    setShowCritique(false);
    setShowSummary(false);
    setModelErrors({});
    setResponses({});

    const conv = conversationRef.current ?? conversationId;
    const liveResponses: Record<string, string> = {};
    const liveModelIds: string[] = [];
    let liveCritique = "";
    let liveSummary = "";

    const models = modelAId && modelBId ? [modelAId, modelBId] : undefined;
    const historyMessages =
      archivedTurns.length > 0
        ? buildMultiModelRunMessages(
            archivedTurns.map((t) => ({
              id: t.runId,
              prompt: t.prompt,
              answers: t.answers,
              summary: t.summary,
              critique: t.critique,
              selectedVote: t.selectedVote,
              modelIds: t.models,
            }))
          )
        : undefined;

    const result = await startRunStream(
      {
        mode: "council",
        models,
        modelA: modelAId,
        modelB: modelBId,
        prompt: userPrompt,
        ...(historyMessages?.length ? { messages: historyMessages } : {}),
        conversationId: conv,
      },
      {
        onRunId: (id) => {
          runIdRef.current = id;
        },
        onEvent: (ev: RunSSEEvent) => {
          if (ev.type === "run_started") {
            liveModelIds.splice(0, liveModelIds.length, ...ev.models);
            setModelIds(ev.models);
            setResponses(Object.fromEntries(ev.models.map((m) => [m, ""])));
            for (const m of ev.models) liveResponses[m] = "";
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
            setModelErrors((prev) => ({
              ...prev,
              [ev.model]: runStreamErrorMessage(ev.errorCode),
            }));
          } else if (ev.type === "critique_started") {
            setShowCritique(true);
          } else if (ev.type === "critique_delta") {
            liveCritique += ev.text;
            setCritique((c) => c + ev.text);
          } else if (ev.type === "summary_started") {
            setShowSummary(true);
          } else if (ev.type === "summary_delta") {
            liveSummary += ev.text;
            setSummary((s) => s + ev.text);
          } else if (ev.type === "usage_update") {
            onCreditsChange?.(ev.creditsRemaining);
          }
        },
      },
      ac.signal
    );

    if (result.lastErrorCode) {
      const code = classifyRunStreamError(result.lastErrorCode);
      if (code === "unauthorized") {
        setErr("login");
        window.dispatchEvent(new Event("ai:open-login"));
      } else if (code === "insufficient_credits") setErr("credits_out");
      else if (code === "plan_upgrade_required") setErr("mode_locked");
      else if (code === "rate_limited" || code === "too_many_concurrent") setErr("rate_limited");
      else if (code === "cancelled" || result.status === "cancelled") setErr("cancelled");
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
          mode: "council",
          status: "completed",
          prompt: userPrompt,
          models: liveModelIds.length ? liveModelIds : Object.keys(liveResponses),
          answers: { ...liveResponses },
          modelErrors: {},
          critique: liveCritique,
          summary: liveSummary,
          selectedVote: null,
        },
      ]);
      setPrompt("");
      setModelIds([]);
      setResponses({});
      notifyHistory(finalConv, finalRunId, userPrompt);
    } else if (result.status === "cancelled") {
      setErr("cancelled");
    }

    setLoading(false);
    setStreaming(false);
    runIdRef.current = null;
    abortRef.current = null;
  }

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current || threadRuns.length > 0) return;
    bootRef.current = true;
    void runCouncilStream(bootstrapPrompt, { isBootstrap: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  async function handleStop() {
    const id = runIdRef.current;
    abortRef.current?.abort();
    if (id) await stopRunStream(id, () => undefined);
    setStreaming(false);
    setErr("cancelled");
  }

  function sendFollowUp() {
    const q = followUpInput.trim();
    if (!q || !canFollowUp) return;
    setFollowUpInput("");
    void runCouncilStream(q, { isBootstrap: false });
  }

  function renderCouncilTurn(turn: CouncilTurn, live: boolean) {
    const ids = turn.models;
    const showModels = ids.length > 0 && ids.some((id) => turn.answers[id] || turn.modelErrors[id] || live);

    return (
      <div className="ar-turn" key={turn.runId}>
        <div className="ar-msg-user-row">
          <UserAvatar initial="ش" size={34} />
          <div className="ar-msg-user-bubble">{turn.prompt}</div>
        </div>

        {live && loading && !showModels && (
          <div className="ar-loading-note">
            <IconSpark size={16} />
            شورای AI در حال همفکری…
          </div>
        )}

        {showModels && (
          <section className="ar-council-section">
            <h2 className="ar-council-section-title">پاسخ مدل‌ها</h2>
            <div className="ar-compare-grid ar-council-models-grid">
              {ids.map((modelId) => {
                const response = (live ? responses : turn.answers)[modelId] ?? "";
                const modelErr = (live ? modelErrors : turn.modelErrors)[modelId];
                const model = getModel(modelId);
                const isStreamingSide = live && streaming && !response && !modelErr;
                return (
                  <div className="ar-compare-col ar-council-model-card" key={modelId}>
                    <div className="ar-compare-col-head">
                      <ModelAvatar modelId={modelId} size={28} />
                      <span className="name-block">
                        <span className="name">{model?.name ?? modelName(modelId)}</span>
                        {model?.poweredBy && <span className="powered-by">{model.poweredBy}</span>}
                      </span>
                    </div>
                    <div className="ar-compare-col-body">
                      {modelErr ? (
                        <div className="ar-composer-err">{modelErr}</div>
                      ) : (
                        <>
                          <MarkdownMessage
                            text={response || (isStreamingSide ? "" : "…")}
                            streaming={live && streaming && !!response}
                          />
                          {isStreamingSide && <div className="ar-img-skeleton">در حال نوشتن…</div>}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(live ? showCritique : !!turn.critique) && (
          <section className="ar-council-section">
            <h2 className="ar-council-section-title">نقد و اختلاف‌ها</h2>
            <div className="ar-council-panel">
              <MarkdownMessage text={live ? critique : turn.critique} streaming={live && streaming && !showSummary} />
            </div>
          </section>
        )}

        {(live ? showSummary : !!turn.summary) && (
          <section className="ar-council-section ar-council-section--final">
            <h2 className="ar-council-section-title">جمع‌بندی نهایی آرایه</h2>
            <div className="ar-council-final-card">
              <MarkdownMessage text={live ? summary : turn.summary} streaming={live && streaming} />
            </div>
          </section>
        )}
      </div>
    );
  }

  const activeTurn: CouncilTurn | null =
    prompt || streaming || loading
      ? {
          runId: runIdRef.current ?? "live",
          mode: "council",
          status: streaming ? "running" : "completed",
          prompt,
          models: modelIds,
          answers: responses,
          modelErrors,
          critique,
          summary,
          selectedVote: null,
        }
      : null;

  return (
    <div className="ar-compare-wrap ar-council-wrap">
      {streaming && (
        <div className="ar-council-stop-bar">
          <button type="button" className="ar-council-stop-btn" onClick={handleStop}>
            توقف تولید
          </button>
        </div>
      )}

      <div className="ar-chat-scroll" ref={scrollRef}>
        {archivedTurns.map((turn) => renderCouncilTurn(turn, false))}
        {activeTurn && renderCouncilTurn(activeTurn, true)}

        {err === "login" && (
          <div className="ar-composer-err">
            برای همفکری AI{" "}
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
            placeholder="ادامه همفکری…"
          />
        </div>
      )}
    </div>
  );
}
