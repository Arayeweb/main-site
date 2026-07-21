"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import type { AraayePrompt } from "@/lib/prompts/promptTypes";
import { getCategoryLabel } from "@/lib/prompts/promptTypes";
import { getRelatedPrompts } from "@/lib/prompts/promptData";
import { pushGtmEvent } from "@/lib/gtm";
import CopyPromptButton from "./CopyPromptButton";
import PromptCodeBlock, { type PromptModelTab } from "./PromptCodeBlock";
import RunInAraayeButton from "./RunInAraayeButton";

type Props = {
  prompt: AraayePrompt;
};

export default function PromptPage({ prompt }: Props) {
  const related = getRelatedPrompts(prompt).slice(0, 5);

  useEffect(() => {
    pushGtmEvent("prompt_page_view", {
      promptSlug: prompt.slug,
      category: prompt.category,
      page: "prompts",
    });
  }, [prompt.slug, prompt.category]);

  const tabs = useMemo(() => {
    const list: PromptModelTab[] = [
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
              <li>
                <Link
                  href={`/prompts/category/${prompt.category}`}
                  className="hover:text-navy-700"
                >
                  {getCategoryLabel(prompt.category)}
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
            <RunInAraayeButton
              prompt={prompt.basePrompt}
              slug={prompt.slug}
              label="همین پرامپت را در Araaye AI اجرا کن"
            />
            <CopyPromptButton text={prompt.basePrompt} slug={prompt.slug} />
          </div>
          <p className="mt-4 text-sm text-navy-400">
            مناسب برای: {prompt.targetUser}
          </p>
        </div>
      </section>

      <div className="container-mx container-px mt-10 space-y-12">
        {prompt.whatItDoes && prompt.whatItDoes.length > 0 ? (
          <section>
            <h2 className="text-xl font-extrabold text-navy-900">
              این پرامپت چه کاری انجام می‌دهد؟
            </h2>
            <div className="mt-4 max-w-3xl space-y-4 text-base leading-8 text-navy-600">
              {prompt.whatItDoes.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : null}

        {/* Main prompt */}
        <section>
          <h2 className="mb-4 text-xl font-extrabold text-navy-900">خود پرامپت</h2>
          <PromptCodeBlock slug={prompt.slug} tabs={tabs} />
        </section>

        {prompt.promptVariations && prompt.promptVariations.length > 0 ? (
          <section>
            <h2 className="text-xl font-extrabold text-navy-900">واریانت‌های آماده کپی</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-navy-500">
              سه سبک رایج برای پرامپت طراحی لوگو — نام برند و صنعت را جایگزین کنید و مستقیم در
              مدل تصویر بچسبانید.
            </p>
            <div className="mt-5 space-y-4">
              {prompt.promptVariations.map((variant) => (
                <div
                  key={variant.label}
                  className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-5"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-navy-900">{variant.label}</h3>
                    <CopyPromptButton
                      text={variant.text}
                      slug={prompt.slug}
                      label="کپی پرامپت"
                      className="!px-3 !py-1.5 text-xs"
                    />
                  </div>
                  <pre
                    className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-navy-100 bg-navy-950 p-3 text-sm leading-7 text-navy-50"
                    dir="ltr"
                  >
                    {variant.text}
                  </pre>
                  <div className="mt-3">
                    <RunInAraayeButton
                      prompt={variant.text}
                      slug={prompt.slug}
                      label="اجرای این واریانت در Araaye AI"
                      className="!px-4 !py-2 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

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
          <h2 className="text-2xl font-extrabold">
            این پرامپت را با GPT، Claude و Gemini هم‌زمان اجرا کن و بهترین پاسخ را انتخاب کن
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-navy-200 sm:text-base">
            در حالت Compare Mode همان پرامپت را یک‌بار می‌فرستی و پاسخ سه مدل را کنار هم
            می‌بینی — بدون کپی‌کردن مجدد یا جابه‌جایی بین تب‌ها.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <RunInAraayeButton
              prompt={prompt.basePrompt}
              slug={prompt.slug}
              label="اجرای هم‌زمان در Araaye AI"
              compare
              className="!bg-white !text-navy-900 hover:!bg-navy-50"
            />
            <RunInAraayeButton
              prompt={prompt.basePrompt}
              slug={prompt.slug}
              label="اجرای تک‌مدلی"
              variant="secondary"
              className="!border-white/20 !text-navy-100 hover:!bg-white/10"
            />
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
