"use client";

import { useEffect, useRef, useState } from "react";
import {
  BETTER_THAN_ONE_AI_SCENARIOS,
  type DemoScenario,
} from "@/lib/betterThanOneAiData";

const MODEL_COLORS: Record<string, string> = {
  GPT: "#10b981",
  Claude: "#f59e0b",
  Gemini: "#0ea5e9",
};

export default function BetterThanOneAiDemo({
  scenario,
  onScenarioChange,
}: {
  scenario: DemoScenario;
  onScenarioChange?: (id: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [scenario.id]);

  return (
    <div ref={rootRef} className="bto-demo" key={animKey}>
      <div className="bto-demo-tabs" role="tablist" aria-label="نمونه‌های قبل و بعد">
        {BETTER_THAN_ONE_AI_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={scenario.id === s.id}
            className={`bto-demo-tab${scenario.id === s.id ? " is-active" : ""}`}
            onClick={() => onScenarioChange?.(s.id)}
          >
            <span className="bto-demo-tab-icon" aria-hidden>
              {s.icon}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div
        className={`bto-demo-prompt${active ? " is-visible" : ""}`}
        aria-label="ورودی کاربر"
      >
        <span className="bto-demo-prompt-label">ورودی</span>
        <p>{scenario.prompt}</p>
      </div>

      <div className="bto-demo-compare">
        <article
          className={`bto-demo-panel bto-demo-panel--single${active ? " is-visible" : ""}`}
        >
          <header className="bto-demo-panel-head">
            <span className="bto-demo-badge bto-demo-badge--bad" aria-hidden>
              ❌
            </span>
            <div>
              <h3>پاسخ یک مدل</h3>
              <p>{scenario.singleModelLabel}</p>
            </div>
          </header>
          <p className="bto-demo-answer bto-demo-answer--muted">
            {scenario.singleModelAnswer}
          </p>
        </article>

        <article
          className={`bto-demo-panel bto-demo-panel--final${active ? " is-visible" : ""}`}
        >
          <header className="bto-demo-panel-head">
            <span className="bto-demo-badge bto-demo-badge--good" aria-hidden>
              ✅
            </span>
            <div>
              <h3>خروجی نهایی Araaye AI</h3>
              <p>ترکیب بهترین بخش‌های هر مدل</p>
            </div>
          </header>

          <ol className="bto-demo-pipeline" aria-label="مراحل ساخت خروجی">
            {scenario.pipeline.map((step, i) => (
              <li
                key={step.model}
                className="bto-demo-pipeline-step"
                style={
                  {
                    "--step-color": MODEL_COLORS[step.model],
                    "--step-delay": `${0.15 + i * 0.1}s`,
                  } as React.CSSProperties
                }
              >
                <span className="bto-demo-pipeline-model">{step.model}</span>
                <span className="bto-demo-pipeline-role">{step.role}</span>
                <span className="bto-demo-pipeline-snippet">{step.snippet}</span>
              </li>
            ))}
          </ol>

          <div className="bto-demo-final">
            <span className="bto-demo-final-label">نسخه نهایی</span>
            <p className="bto-demo-answer">{scenario.finalAnswer}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
