"use client";

import { useState } from "react";
import Link from "next/link";
import { getModel } from "@/lib/aiModels";

/**
 * Lightweight compare CTA widget for SEO pages.
 * Full live streaming lives in the app shell (/ai?mode=compare);
 * this widget seeds the prompt and deep-links into Arena.
 */
export default function CompareLiveWidget({
  modelAId,
  modelBId,
  samplePrompt,
  tryHref,
}: {
  modelAId: string;
  modelBId: string;
  samplePrompt: string;
  tryHref: string;
}) {
  const [prompt, setPrompt] = useState(samplePrompt);
  const modelA = getModel(modelAId);
  const modelB = getModel(modelBId);
  const href = `${tryHref}&q=${encodeURIComponent(prompt.trim() || samplePrompt)}`;

  return (
    <div className="ar-compare-live">
      <div className="ar-compare-live-models">
        <span style={{ borderColor: modelA?.color }}>{modelA?.name ?? "مدل A"}</span>
        <span className="ar-compare-live-vs">در برابر</span>
        <span style={{ borderColor: modelB?.color }}>{modelB?.name ?? "مدل B"}</span>
      </div>
      <label className="ar-compare-live-label" htmlFor="compare-live-prompt">
        پرامپت خود را بنویسید
      </label>
      <textarea
        id="compare-live-prompt"
        className="ar-compare-live-input"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        dir="auto"
      />
      <Link href={href} className="ar-btn ar-btn-primary ar-btn-block">
        مقایسه زنده در آرایه
      </Link>
      <p className="ar-compare-live-note">
        با کلیک، وارد محیط مقایسه آرایه می‌شوید و هر دو مدل واقعاً پاسخ می‌دهند.
      </p>
    </div>
  );
}
