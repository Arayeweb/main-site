"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AraayePrompt } from "@/lib/prompts/promptTypes";
import { getCategoryLabel } from "@/lib/prompts/promptTypes";
import { getRelatedPrompts } from "@/lib/prompts/promptData";
import { pushGtmEvent } from "@/lib/gtm";
import CopyPromptButton from "./CopyPromptButton";
import RunInAraayeButton from "./RunInAraayeButton";

type Props = {
  prompt: AraayePrompt;
};

type ModelTab = "base" | "gpt" | "claude" | "gemini";

export default function PromptPage({ prompt }: Props) {
  const related = getRelatedPrompts(prompt).slice(0, 5);
  const hasModelVariants = Boolean(
    prompt.gptVersion || prompt.claudeVersion || prompt.geminiVersion
  );

  useEffect(() => {
    pushGtmEvent("prompt_page_view", {
      promptSlug: prompt.slug,
      category: prompt.category,
      page: "prompts",
    });
  }, [prompt.slug, prompt.category]);

  const tabs = useMemo(() => {
    const list: { id: ModelTab; label: string; text: string }[] = [
      { id: "base", label: "نسخه اصلی", text: prompt.basePrompt },
    ];
    if (prompt.gptVersion) {
      list.push({ id: "gpt", label: "نسخه GPT", text: prompt.gptVersion });
    }
    if (prompt.claudeVersion) {
      list.push({ id: "claude", label: "نسخه Claude", text: prompt.claudeVersion });
    }
    if (prompt.geminiVersion) {
      list.push({ id: "gemini", label: "نسخه Gemini", text: prompt.geminiVersion });
    }
    return list;
  }, [prompt]);

  const [activeTab, setActiveTab] = useState<ModelTab>("base");
  const activeText = tabs.find((t) => t.id === activeTab)?.text ?? prompt.basePrompt;

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-100 bg-gradient-to-b from-navy-50/80 via-white to-white">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
        <div className="container-mx container-px relative py-12 sm:py-16">
          <nav className="mb-6 text-sm text-navy-400" aria-label="breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-navy-700">
                  خانه
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/prompts" className="hover:text-navy-700">
                  پرامپت‌ها
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-navy-700">{prompt.title}</li>
            </ol>
          </nav>

          <span className="badge mb-4 bg-brand-50 text-brand-700">
            {getCategoryLabel(prompt.category)}
          </span>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">
            {prompt.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-navy-500 sm:text-lg">
            {prompt.shortDescription}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CopyPromptButton text={prompt.basePrompt} slug={prompt.slug} />
            <RunInAraayeButton
              prompt={prompt.basePrompt}
              slug={prompt.slug}
              label="اجرا در Araaye AI"
            />
          </div>
          <p className="mt-4 text-sm text-navy-400">
            مناسب برای: {prompt.targetUser}
          </p>
        </div>
      </section>

      <div className="container-mx container-px mt-10 space-y-12">
        {/* Main prompt */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-navy-900">پرامپت آماده</h2>
            <CopyPromptButton
              text={activeText}
              slug={prompt.slug}
              label="کپی این نسخه"
              className="!px-4 !py-2 text-xs"
            />
          </div>

          {hasModelVariants ? (
            <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="نسخه‌های مدل">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    activeTab === tab.id
                      ? "bg-navy-900 text-white"
                      : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mb-3 text-sm text-navy-400">
              برای اکثر مدل‌ها نسخه اصلی کافی است.
            </p>
          )}

          <pre
            className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-navy-100 bg-navy-950 p-4 text-sm leading-7 text-navy-50 sm:p-5"
            dir="auto"
          >
            {activeText}
          </pre>

          <div className="mt-4">
            <RunInAraayeButton
              prompt={activeText}
              slug={prompt.slug}
              label="همین نسخه را در Araaye AI اجرا کن"
            />
          </div>
        </section>

        {/* Example */}
        <section className="grid gap-6 lg:grid-cols-2">
          {prompt.exampleInput ? (
            <div className="rounded-2xl border border-navy-100 bg-white p-5">
              <h2 className="text-lg font-extrabold text-navy-900">نمونه ورودی</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-navy-600" dir="auto">
                {prompt.exampleInput}
              </pre>
            </div>
          ) : null}
          <div
            className={`rounded-2xl border border-navy-100 bg-white p-5 ${
              prompt.exampleInput ? "" : "lg:col-span-2"
            }`}
          >
            <h2 className="text-lg font-extrabold text-navy-900">نمونه خروجی</h2>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-navy-600" dir="auto">
              {prompt.exampleOutput}
            </pre>
          </div>
        </section>

        {/* Use cases */}
        <section>
          <h2 className="text-xl font-extrabold text-navy-900">چه زمانی از این پرامپت استفاده کنی</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {prompt.useCases.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Mistakes */}
        <section>
          <h2 className="text-xl font-extrabold text-navy-900">اشتباهات رایج</h2>
          <ul className="mt-4 space-y-2">
            {prompt.commonMistakes.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-7 text-navy-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section>
            <h2 className="text-xl font-extrabold text-navy-900">پرامپت‌های مرتبط</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={item.canonicalPath}
                  className="rounded-2xl border border-navy-100 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <div className="text-xs font-medium text-navy-400">
                    {getCategoryLabel(item.category)}
                  </div>
                  <div className="mt-1 font-bold text-navy-900">{item.title}</div>
                  <p className="mt-2 line-clamp-2 text-sm text-navy-500">
                    {item.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-navy-900">سؤالات پرتکرار</h2>
          <div className="mt-4 space-y-3">
            {prompt.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-navy-100 bg-white px-4 py-3"
              >
                <summary className="cursor-pointer list-none font-bold text-navy-900 marker:content-none">
                  <span className="flex items-center justify-between gap-3">
                    {item.question}
                    <span className="text-navy-300 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-navy-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-navy-900 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-2xl font-extrabold">همین پرامپت را با چند مدل تست کن</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-navy-200 sm:text-base">
            اگر می‌خواهی همین پرامپت را با چند مدل هوش مصنوعی تست کنی، آن را داخل Araaye AI اجرا
            کن.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <RunInAraayeButton
              prompt={prompt.basePrompt}
              slug={prompt.slug}
              label="همین الان داخل Araaye AI اجرا کن"
              className="!bg-white !text-navy-900 hover:!bg-navy-50"
            />
            <Link
              href="/ai/pricing"
              className="btn-ghost !text-navy-200 hover:!bg-white/10 hover:!text-white"
              data-event="prompt_signup_click"
              data-prompt-slug={prompt.slug}
            >
              مشاهده قیمت‌ها
            </Link>
          </div>
          <p className="mt-5 text-sm text-navy-300">
            یا به{" "}
            <Link href="/prompts" className="underline underline-offset-4 hover:text-white">
              کتابخانه پرامپت‌های آماده
            </Link>{" "}
            برگرد.
          </p>
        </section>
      </div>
    </div>
  );
}
