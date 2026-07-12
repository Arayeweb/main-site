"use client";

import { useState } from "react";
import { AUDIENCE_TABS } from "@/lib/aiFeaturesPageData";

export default function AudienceTabs() {
  const [activeId, setActiveId] = useState<string>(AUDIENCE_TABS[0].id);
  const active = AUDIENCE_TABS.find((t) => t.id === activeId) ?? AUDIENCE_TABS[0];

  return (
    <div className="feat-audience">
      <div className="feat-audience-tabs" role="tablist" aria-label="کاربردها">
        {AUDIENCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeId}
            className={`feat-audience-tab${tab.id === activeId ? " is-active" : ""}`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="feat-audience-panel" role="tabpanel">
        <p className="feat-audience-hint">نمونه سؤال‌هایی که می‌توانید بپرسید:</p>
        <ul className="feat-audience-questions">
          {active.questions.map((q) => (
            <li key={q}>
              <span className="feat-audience-qmark">؟</span>
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
