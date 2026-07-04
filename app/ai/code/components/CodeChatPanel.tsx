"use client";

import { useEffect, useRef } from "react";
import { IconSend, IconStop, UserAvatar } from "../../icons";
import ModelSelect from "../../ModelSelect";
import MarkdownMessage from "../../MarkdownMessage";
import type { CodeTurn } from "@/lib/hooks/useCodeStudio";

export default function CodeChatPanel({
  turns,
  input,
  streaming,
  err,
  chatModel,
  plan,
  quickPrompts,
  onInputChange,
  onSend,
  onStop,
  onQuickPrompt,
  onModelChange,
}: {
  turns: CodeTurn[];
  input: string;
  streaming: boolean;
  err: string;
  chatModel: string;
  plan: string;
  quickPrompts: string[];
  onInputChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  onQuickPrompt: (p: string) => void;
  onModelChange: (v: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  return (
    <div className="ar-code-chat">
      <div className="ar-code-chat-scroll">
        {turns.length === 0 && (
          <div className="ar-code-empty">
            <p className="ar-code-empty-hint">
              توضیح بده چه بسازی — کد در ادیتور اعمال می‌شود.
            </p>
            <div className="ar-code-quick-prompts">
              {quickPrompts.map((p) => (
                <button key={p} type="button" onClick={() => onQuickPrompt(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {turns.map((turn) => (
          <div key={turn.id} className="ar-code-turn">
            <div className="ar-msg-user-row">
              <UserAvatar initial="ش" size={30} />
              <div className="ar-msg-user-bubble">{turn.prompt}</div>
            </div>
            <div className="ar-msg-ai-block">
              {turn.streaming && !turn.response ? (
                <span className="ar-spinner" />
              ) : (
                <MarkdownMessage text={turn.response} />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {err && <div className="ar-code-err">{err}</div>}
      <div className="ar-code-composer">
        <ModelSelect picker="direct" value={chatModel} onChange={onModelChange} plan={plan} />
        <div className="ar-code-composer-box">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                streaming ? onStop() : onSend();
              }
            }}
            placeholder="درخواست کد…"
            rows={2}
          />
          <button
            type="button"
            className={`ar-send-btn ar-send-btn--dock${streaming ? " ar-send-btn--stop" : ""}`}
            disabled={!streaming && !input.trim()}
            onClick={streaming ? onStop : onSend}
            aria-label={streaming ? "توقف" : "ارسال"}
          >
            {streaming ? <IconStop size={16} /> : <IconSend size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
