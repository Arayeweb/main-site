"use client";

import { useMemo, useState, type ReactNode } from "react";
import CopyPromptButton from "./CopyPromptButton";
import RunInAraayeButton from "./RunInAraayeButton";

export type PromptModelTab = {
  id: string;
  label: string;
  text: string;
};

type Props = {
  slug: string;
  tabs: PromptModelTab[];
  defaultTabId?: string;
};

function highlightPlaceholders(text: string): ReactNode[] {
  const parts = text.split(/(\{\{[^{}]+\}\})/g);
  return parts.map((part, index) => {
    if (/^\{\{[^{}]+\}\}$/.test(part)) {
      return (
        <span
          key={`ph-${index}`}
          className="rounded bg-amber-400/20 px-1 font-semibold text-amber-300"
        >
          {part}
        </span>
      );
    }
    return <span key={`t-${index}`}>{part}</span>;
  });
}

export default function PromptCodeBlock({ slug, tabs, defaultTabId }: Props) {
  const initial = defaultTabId ?? tabs[0]?.id ?? "base";
  const [activeTab, setActiveTab] = useState(initial);
  const activeText = useMemo(
    () => tabs.find((t) => t.id === activeTab)?.text ?? tabs[0]?.text ?? "",
    [tabs, activeTab]
  );
  const charCount = activeText.length;
  const tokenEstimate = Math.max(1, Math.ceil(charCount / 4));
  const hasMultipleTabs = tabs.length > 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-950 shadow-soft">
      {hasMultipleTabs ? (
        <div
          className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-navy-800 bg-navy-950/95 px-3 py-3 backdrop-blur sm:px-4"
          role="tablist"
          aria-label="نسخه‌های مدل"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-navy-900"
                  : "bg-navy-800 text-navy-200 hover:bg-navy-700"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-800 bg-navy-900/80 px-3 py-2.5 sm:px-4">
        <p className="text-xs text-navy-400">
          {hasMultipleTabs ? "نسخه فعال را کپی یا اجرا کن" : "پرامپت آماده کپی"}
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyPromptButton
            text={activeText}
            slug={slug}
            label="کپی این نسخه"
            variant="ghost"
            className="!border-navy-700 !bg-navy-800 !px-3 !py-1.5 !text-xs !text-navy-50 hover:!bg-navy-700"
          />
          <RunInAraayeButton
            prompt={activeText}
            slug={slug}
            label="اجرا در Araaye AI"
            className="!px-3 !py-1.5 !text-xs"
          />
        </div>
      </div>

      <pre
        className="max-h-[min(70vh,36rem)] overflow-auto whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-navy-50 sm:px-5 sm:py-5"
        dir="auto"
      >
        {highlightPlaceholders(activeText)}
      </pre>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-800 px-3 py-2.5 text-xs text-navy-400 sm:px-4">
        <span>
          {charCount.toLocaleString("fa-IR")} کاراکتر · حدود{" "}
          {tokenEstimate.toLocaleString("fa-IR")} توکن
        </span>
        {!hasMultipleTabs ? (
          <span>برای اکثر مدل‌ها همین نسخه کافی است</span>
        ) : null}
      </div>
    </div>
  );
}
