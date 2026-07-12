"use client";

import { HERO_ANSWERS, HERO_QUESTION, SYNTHESIS_FLOW } from "@/lib/aiFeaturesPageData";

type MockupVariant = "hero" | "compare" | "synthesis" | "steps";

export default function ProductMockup({
  variant = "hero",
  activeStep = 1,
}: {
  variant?: MockupVariant;
  activeStep?: 1 | 2 | 3;
}) {
  if (variant === "synthesis") {
    return (
      <div className="feat-ui feat-ui--light" aria-hidden="true">
        <div className="feat-ui-bar">
          <span className="feat-ui-dot" />
          <span className="feat-ui-dot" />
          <span className="feat-ui-dot" />
          <span className="feat-ui-bar-title">جمع‌بندی</span>
        </div>
        <div className="feat-ui-body">
          <div className="feat-synth-sources">
            {SYNTHESIS_FLOW.inputs.map((item) => (
              <div key={item.model} className="feat-synth-chip">
                <span className="feat-ui-pill">{item.model}</span>
                <span>{item.note}</span>
              </div>
            ))}
          </div>
          <div className="feat-synth-arrow" aria-hidden="true">
            ↓
          </div>
          <div className="feat-synth-output">
            <span className="feat-ui-label">خروجی نهایی</span>
            <p>{SYNTHESIS_FLOW.output}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "steps") {
    return (
      <div className="feat-ui feat-ui--steps" aria-hidden="true">
        <div className="feat-ui-bar">
          <span className="feat-ui-dot" />
          <span className="feat-ui-dot" />
          <span className="feat-ui-dot" />
          <span className="feat-ui-bar-title">آرایه AI</span>
        </div>
        <div className="feat-ui-body">
          <div className={`feat-step-panel${activeStep === 1 ? " is-active" : ""}`}>
            <span className="feat-ui-label">مرحله ۱</span>
            <p className="feat-step-question">{HERO_QUESTION}</p>
          </div>
          <div className={`feat-step-panel${activeStep === 2 ? " is-active" : ""}`}>
            <span className="feat-ui-label">مرحله ۲</span>
            <div className="feat-ui-pills">
              {HERO_ANSWERS.map((a) => (
                <span key={a.model} className="feat-ui-pill" style={{ borderColor: a.color }}>
                  {a.model}
                </span>
              ))}
            </div>
          </div>
          <div className={`feat-step-panel${activeStep === 3 ? " is-active" : ""}`}>
            <span className="feat-ui-label">مرحله ۳</span>
            <div className="feat-ui-grid feat-ui-grid--3">
              {HERO_ANSWERS.map((a) => (
                <div
                  key={a.model}
                  className={`feat-ui-answer${a.selected ? " is-selected" : ""}`}
                >
                  <span className="feat-ui-pill feat-ui-pill--sm" style={{ color: a.color }}>
                    {a.model}
                  </span>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
            <button type="button" className="feat-ui-btn">
              ساخت جمع‌بندی
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`feat-ui${variant === "compare" ? " feat-ui--compact" : ""}`} aria-hidden="true">
      <div className="feat-ui-bar">
        <span className="feat-ui-dot" />
        <span className="feat-ui-dot" />
        <span className="feat-ui-dot" />
        <span className="feat-ui-bar-title">مقایسه</span>
        <span className="feat-ui-bar-mode">چند مدل</span>
      </div>
      <div className="feat-ui-body">
        <div className="feat-ui-question">
          <span className="feat-ui-label">سؤال شما</span>
          <p>{HERO_QUESTION}</p>
        </div>
        <div className="feat-ui-grid feat-ui-grid--3">
          {HERO_ANSWERS.map((a) => (
            <div
              key={a.model}
              className={`feat-ui-answer${a.selected ? " is-selected" : ""}`}
            >
              <div className="feat-ui-answer-head">
                <span className="feat-ui-pill feat-ui-pill--sm" style={{ color: a.color }}>
                  {a.model}
                </span>
                {a.selected && <span className="feat-ui-check">✓</span>}
              </div>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
        {variant === "hero" && (
          <div className="feat-ui-footer">
            <button type="button" className="feat-ui-btn feat-ui-btn--primary">
              ساخت جمع‌بندی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
