"use client";

import { useState } from "react";
import Link from "next/link";
import { trackAiCompareDemoInteraction } from "@/lib/aiTracking";

export default function AiCompareDemo({
  landingType,
  prompt,
  answers,
}: {
  landingType: string;
  prompt: string;
  answers: { model: string; text: string }[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="ail-demo">
      <p className="ail-demo-prompt">
        <strong>پرامپت نمونه:</strong> {prompt}
      </p>
      <div className="ail-demo-answers">
        {answers.map((ans, i) => (
          <button
            key={ans.model}
            type="button"
            className={`ail-demo-card${active === i ? " is-active" : ""}`}
            onClick={() => {
              setActive(i);
              trackAiCompareDemoInteraction({
                landing_type: landingType,
                action: "select_answer",
                model: ans.model,
              });
            }}
          >
            <b>{ans.model}</b>
            <p>{ans.text}</p>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 13, color: "var(--ail-muted)" }}>
        این یک شبیه‌سازی آموزشی است. برای مقایسه واقعی مدل‌ها،{" "}
        <Link
          href="/ai?mode=compare"
          onClick={() =>
            trackAiCompareDemoInteraction({
              landing_type: landingType,
              action: "try_live",
            })
          }
        >
          مقایسه زنده در آرایه
        </Link>{" "}
        را باز کن.
      </p>
    </div>
  );
}
