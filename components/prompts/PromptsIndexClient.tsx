"use client";

import Link from "next/link";
import { ALL_PROMPTS } from "@/lib/prompts/promptData";
import { PROMPT_CATEGORIES } from "@/lib/prompts/promptTypes";
import PromptCard from "./PromptCard";
import { pushGtmEvent } from "@/lib/gtm";

export default function PromptsIndexClient() {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-cyan-50" />
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
        <div className="container-mx container-px relative py-14 sm:py-20">
          <p className="text-sm font-bold text-brand-600">Araaye AI Prompts</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-5xl">
            پرامپت‌های آماده هوش مصنوعی
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-navy-500 sm:text-lg">
            بهترین پرامپت‌های آماده برای ChatGPT، Claude، Gemini و Araaye AI؛ کپی کن یا مستقیم داخل
            Araaye AI اجرا کن.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ai"
              className="btn-primary"
              data-event="prompt_signup_click"
              onClick={() =>
                pushGtmEvent("prompt_signup_click", { location: "prompts_hero", page: "prompts" })
              }
            >
              شروع با Araaye AI
            </Link>
            <a href="#prompt-grid" className="btn-secondary">
              دیدن پرامپت‌ها
            </a>
          </div>
        </div>
      </section>

      {/* Category hubs */}
      <section className="container-mx container-px pt-10 sm:pt-12">
        <h2 className="text-lg font-extrabold text-navy-900">دسته‌بندی‌ها</h2>
        <p className="mt-2 text-sm text-navy-500">
          پرامپت‌ها بر اساس کاربرد دسته‌بندی شده‌اند — هر دسته صفحهٔ SEO جدا دارد.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PROMPT_CATEGORIES.map((cat) => {
            const count = ALL_PROMPTS.filter((p) => p.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/prompts/category/${cat.id}`}
                className="rounded-2xl border border-navy-100 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div className="text-sm font-extrabold text-navy-900">{cat.label}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-navy-500">
                  {cat.description}
                </p>
                <div className="mt-3 text-xs font-bold text-brand-600">
                  {count.toLocaleString("fa-IR")} پرامپت
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Filters + grid */}
      <section id="prompt-grid" className="container-mx container-px pt-10 sm:pt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-navy-900">همه پرامپت‌ها</h2>
            <p className="mt-1 text-sm text-navy-500">
              {ALL_PROMPTS.length.toLocaleString("fa-IR")} پرامپت آماده
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="میانبر دسته‌ها">
            {PROMPT_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/prompts/category/${cat.id}`}
                className="rounded-xl bg-navy-50 px-3 py-2 text-xs font-bold text-navy-600 transition-colors hover:bg-navy-100"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_PROMPTS.map((prompt) => (
            <PromptCard key={prompt.slug} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* SEO intro */}
      <section className="container-mx container-px mt-16">
        <div className="max-w-3xl rounded-3xl border border-navy-100 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-navy-900">پرامپت رایگان، آماده اجرا</h2>
          <p className="mt-3 text-sm leading-8 text-navy-600 sm:text-base">
            این پرامپت‌ها رایگان‌اند؛ می‌توانی کپی‌شان کنی یا مستقیم داخل{" "}
            <Link href="/ai" className="font-bold text-brand-600 hover:underline">
              Araaye AI
            </Link>{" "}
            اجرا کنی. هر صفحه شامل پرامپت قابل استفاده، نمونه خروجی و نکات کاربردی است تا سریع‌تر به
            نتیجه برسی.
          </p>
          <p className="mt-3 text-sm leading-8 text-navy-600 sm:text-base">
            برای مقایسه مدل‌ها و پلن‌ها به{" "}
            <Link href="/ai/pricing" className="font-bold text-brand-600 hover:underline">
              قیمت‌گذاری Araaye AI
            </Link>{" "}
            سر بزن. اگر برای کسب‌وکار محلی به سئو نیاز داری،{" "}
            <Link href="/free-seo-audit" className="font-bold text-brand-600 hover:underline">
              بررسی رایگان سئو
            </Link>{" "}
            هم در دسترس است.
          </p>
        </div>
      </section>
    </div>
  );
}
