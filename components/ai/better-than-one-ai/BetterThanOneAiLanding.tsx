"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BETTER_THAN_ONE_AI_AD_COPY,
  BETTER_THAN_ONE_AI_CTA_HREF,
  BETTER_THAN_ONE_AI_HERO,
  BETTER_THAN_ONE_AI_SCENARIOS,
} from "@/lib/betterThanOneAiData";
import BetterThanOneAiDemo from "./BetterThanOneAiDemo";

export default function BetterThanOneAiLanding() {
  const [scenarioId, setScenarioId] = useState(BETTER_THAN_ONE_AI_SCENARIOS[0].id);

  const scenario = useMemo(
    () =>
      BETTER_THAN_ONE_AI_SCENARIOS.find((s) => s.id === scenarioId) ??
      BETTER_THAN_ONE_AI_SCENARIOS[0],
    [scenarioId]
  );

  return (
    <div className="bto-page">
      <header className="bto-topbar">
        <Link href="/ai" className="ar-btn ar-btn-ghost ar-btn-sm">
          ← Araaye AI
        </Link>
        <span className="bto-topbar-label">کمپین «از ChatGPT به نتیجه»</span>
        <Link href={BETTER_THAN_ONE_AI_CTA_HREF} className="ar-btn ar-btn-primary ar-btn-sm">
          {BETTER_THAN_ONE_AI_AD_COPY.cta}
        </Link>
      </header>

      <section className="bto-hero" id="hero">
        <p className="bto-eyebrow">کاربر دنبال مدل بهتر نیست — دنبال نتیجه بهتر است</p>
        <h1 className="bto-h1">
          {BETTER_THAN_ONE_AI_HERO.line1}
          <br />
          <span className="bto-h1-accent">{BETTER_THAN_ONE_AI_HERO.line2}</span>
        </h1>

        <div className="bto-ad-copy">
          <h2 className="bto-ad-headline">{BETTER_THAN_ONE_AI_AD_COPY.headline}</h2>
          <div className="bto-ad-body">
            {BETTER_THAN_ONE_AI_AD_COPY.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="bto-hero-cta">
          <Link href={BETTER_THAN_ONE_AI_CTA_HREF} className="ar-btn ar-btn-primary">
            {BETTER_THAN_ONE_AI_AD_COPY.cta}
          </Link>
          <a href="#demo" className="ar-btn ar-btn-ghost">
            ببین چطور کار می‌کند
          </a>
        </div>
      </section>

      <section className="bto-section" id="demo">
        <div className="bto-section-head">
          <h2 className="bto-h2">تفاوت را در کمتر از ۳۰ ثانیه ببین</h2>
          <p className="bto-lead">
            یک نمونه را انتخاب کن — سمت چپ خروجی یک مدل، سمت راست خروجی نهایی Araaye AI.
          </p>
        </div>
        <BetterThanOneAiDemo scenario={scenario} onScenarioChange={setScenarioId} />
      </section>

      <section className="bto-section bto-section--alt" id="how">
        <div className="bto-section-head">
          <h2 className="bto-h2">Araaye AI حدس نمی‌زند</h2>
          <p className="bto-lead">
            چند مدل را کنار هم می‌گذارد، بهترین بخش هر کدام را برمی‌دارد و یک خروجی نهایی
            می‌سازد.
          </p>
        </div>
        <div className="bto-steps">
          {[
            { n: "۱", title: "سؤال را یک‌بار بنویس", desc: "همان درخواستی که به ChatGPT می‌دهی." },
            {
              n: "۲",
              title: "چند مدل پاسخ می‌دهند",
              desc: "GPT، Claude و Gemini — هر کدام از زاویه خودش.",
            },
            {
              n: "۳",
              title: "بهترین خروجی ساخته می‌شود",
              desc: "ایده، لحن و CTA — بدون جابه‌جایی بین ابزارها.",
            },
          ].map((step) => (
            <article key={step.n} className="bto-step-card">
              <span className="bto-step-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bto-section" id="instagram">
        <div className="bto-section-head">
          <h2 className="bto-h2">محتوای اینستاگرام</h2>
          <p className="bto-lead">همین ساختار را برای تبلیغ و ریلز استفاده کن.</p>
        </div>

        <div className="bto-insta-flow">
          <article className="bto-insta-card">
            <p className="bto-insta-hook">این متن را ChatGPT نوشت...</p>
            <pre className="bto-insta-pre bto-insta-pre--bad">{scenario.singleModelAnswer}</pre>
          </article>

          <div className="bto-insta-arrow" aria-hidden>
            ↓
          </div>

          <article className="bto-insta-card">
            <p className="bto-insta-hook">حالا همان درخواست را در Araaye AI اجرا کردیم.</p>
            <pre className="bto-insta-pre bto-insta-pre--good">{scenario.finalAnswer}</pre>
          </article>

          <p className="bto-insta-close">تفاوت را خودت ببین.</p>
        </div>
      </section>

      <section className="bto-section bto-section--cta" id="cta">
        <h2 className="bto-h2">به‌جای یک مدل، به نتیجه برس</h2>
        <p className="bto-lead">
          Compare Mode را امتحان کن — همان سؤال را از چند مدل بپرس و تفاوت را ببین.
        </p>
        <div className="bto-hero-cta">
          <Link href={BETTER_THAN_ONE_AI_CTA_HREF} className="ar-btn ar-btn-primary">
            {BETTER_THAN_ONE_AI_AD_COPY.cta}
          </Link>
        </div>
        <p className="bto-cta-note">بدون VPN · پرداخت تومان · کردیت رایگان برای شروع</p>
      </section>

      <footer className="bto-footer">
        <Link href="/ai/features">امکانات</Link>
        <Link href="/ai/pricing">قیمت‌ها</Link>
        <Link href="/ai">ورود به Araaye AI</Link>
      </footer>

      <div className="bto-sticky-cta">
        <Link href={BETTER_THAN_ONE_AI_CTA_HREF} className="ar-btn ar-btn-primary ar-btn-block">
          {BETTER_THAN_ONE_AI_AD_COPY.cta}
        </Link>
      </div>
    </div>
  );
}
