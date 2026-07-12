"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FEATURED_COMPARE_MODELS,
  FEATURES_FAQ,
  FREE_CREDIT_LABEL,
  PERSIAN_EXPERIENCE_POINTS,
  QUICK_BENEFITS,
  READY_TOOLS,
} from "@/lib/aiFeaturesPageData";
import {
  AI_PACKAGES,
  FREE_PACKAGE,
  formatPriceToman,
} from "@/lib/aiPricingConfig";
import { IconCheck } from "../icons";
import AudienceTabs from "./components/AudienceTabs";
import HowItWorksStrip from "./components/HowItWorksStrip";
import ProductMockup from "./components/ProductMockup";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FEATURES_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const PERSONAL_PLAN = AI_PACKAGES.plus;
const HEAVY_PLAN = AI_PACKAGES.pro;

export default function FeaturesLanding() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <a href="#feat-main" className="feat-skip">
        رفتن به محتوای اصلی
      </a>

      <header className="feat-nav">
        <div className="feat-nav-inner">
          <Link href="/ai/features" className="feat-brand">
            <span className="feat-brand-name">
              آرایه <em>AI</em>
            </span>
            <span className="feat-brand-parent">محصولی از آرایه</span>
          </Link>

          <nav className="feat-nav-links" aria-label="ناوبری اصلی">
            <a href="#features">امکانات</a>
            <a href="#use-cases">کاربردها</a>
            <a href="#models">مدل‌ها</a>
            <a href="#pricing">قیمت‌ها</a>
            <a href="#faq">سؤال‌ها</a>
          </nav>

          <div className="feat-nav-actions">
            <Link href="/ai" className="feat-link-login">
              ورود
            </Link>
            <Link href="/ai" className="ar-btn ar-btn-primary ar-btn-sm">
              رایگان امتحان کنید
            </Link>
          </div>
        </div>
      </header>

      <main id="feat-main">
        {/* Hero */}
        <section className="feat-hero">
          <div className="feat-container feat-hero-inner">
            <div className="feat-hero-copy">
              <span className="feat-eyebrow">یک سؤال، چند نگاه</span>
              <h1>از چند هوش مصنوعی بپرسید؛ پاسخ بهتر را انتخاب کنید.</h1>
              <p className="feat-lead">
                سؤال‌تان را یک‌بار بنویسید، پاسخ مدل‌های مختلف را کنار هم ببینید و بدون
                جابه‌جایی میان چند ابزار به نتیجه برسید.
              </p>
              <div className="feat-hero-cta">
                <Link href="/ai" className="ar-btn ar-btn-primary">
                  رایگان امتحان کنید
                </Link>
                <a href="#features" className="ar-btn ar-btn-ghost">
                  دیدن امکانات
                </a>
              </div>
              <p className="feat-hero-note">{FREE_CREDIT_LABEL}</p>
            </div>
            <div className="feat-hero-demo">
              <ProductMockup variant="hero" />
            </div>
          </div>
        </section>

        {/* Quick benefits */}
        <section className="feat-strip" aria-label="مزیت‌های سریع">
          <div className="feat-container">
            <ul className="feat-strip-list">
              {QUICK_BENEFITS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Compare feature */}
        <section className="feat-section" id="features">
          <div className="feat-container feat-split">
            <div className="feat-split-copy">
              <span className="feat-eyebrow">مقایسه</span>
              <h2>اولین پاسخ، همیشه بهترین پاسخ نیست.</h2>
              <p>
                همان سؤال را از چند مدل بپرسید و تفاوت نگاه، لحن و جزئیات پاسخ‌ها را کنار
                هم ببینید.
              </p>
              <ul className="feat-checklist">
                <li>
                  <IconCheck size={16} />
                  سؤال فقط یک‌بار نوشته می‌شود
                </li>
                <li>
                  <IconCheck size={16} />
                  پاسخ‌ها هم‌زمان قابل مشاهده‌اند
                </li>
                <li>
                  <IconCheck size={16} />
                  انتخاب پاسخ مناسب ساده‌تر می‌شود
                </li>
              </ul>
              <Link href="/ai" className="feat-text-cta">
                یک سؤال را مقایسه کنید ←
              </Link>
            </div>
            <div className="feat-split-visual">
              <ProductMockup variant="compare" />
            </div>
          </div>
        </section>

        {/* Synthesis */}
        <section className="feat-section feat-section--navy">
          <div className="feat-container feat-split feat-split--reverse">
            <div className="feat-split-copy">
              <span className="feat-eyebrow feat-eyebrow--light">جمع‌بندی هوشمند</span>
              <h2>نکته‌های بهتر هر پاسخ را در یک خروجی جمع کنید.</h2>
              <p>
                به‌جای انتخاب کامل یک پاسخ، از آرایه AI بخواهید نکته‌های مفید پاسخ‌های
                مختلف را به یک نتیجه منسجم تبدیل کند.
              </p>
            </div>
            <div className="feat-split-visual">
              <ProductMockup variant="synthesis" />
            </div>
          </div>
        </section>

        {/* Ready tools */}
        <section className="feat-section" id="use-cases">
          <div className="feat-container">
            <div className="feat-section-head">
              <h2>برای کارهای تکراری، لازم نیست از صفر شروع کنید.</h2>
            </div>
            <div className="feat-tools-grid">
              {READY_TOOLS.map((tool) => (
                <article key={tool.title} className="feat-tool-card">
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                  <div className="feat-tool-io">
                    <div>
                      <span>ورودی</span>
                      <p>{tool.input}</p>
                    </div>
                    <div>
                      <span>خروجی</span>
                      <p>{tool.output}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Audience */}
        <section className="feat-section feat-section--alt">
          <div className="feat-container">
            <div className="feat-section-head">
              <h2>برای چه کسانی ساخته شده؟</h2>
              <p>تولیدکنندگان محتوا، فریلنسرها، برنامه‌نویسان، دانشجویان و صاحبان کسب‌وکار.</p>
            </div>
            <AudienceTabs />
          </div>
        </section>

        {/* Models */}
        <section className="feat-section" id="models">
          <div className="feat-container">
            <div className="feat-section-head">
              <h2>مدل مناسب هر کار را انتخاب کنید.</h2>
            </div>
            <div className="feat-models-grid">
              {FEATURED_COMPARE_MODELS.map((model) => (
                <article key={model.id} className="feat-model-card">
                  <div className="feat-model-head">
                    <span
                      className="feat-model-dot"
                      style={{ background: model.color }}
                      aria-hidden="true"
                    />
                    <h3>{model.name}</h3>
                  </div>
                  <p>{model.blurb}</p>
                  <ul>
                    <li>مناسب برای امتحان‌کردن نگاه‌های مختلف</li>
                    <li>قابل انتخاب برای هر گفت‌وگو</li>
                    <li>امکان مقایسه در یک صفحه</li>
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Persian experience */}
        <section className="feat-section feat-section--alt">
          <div className="feat-container feat-split">
            <div className="feat-split-copy">
              <h2>برای استفاده فارسی، ساده‌تر طراحی شده است.</h2>
              <ul className="feat-checklist">
                {PERSIAN_EXPERIENCE_POINTS.map((point) => (
                  <li key={point}>
                    <IconCheck size={16} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="feat-split-visual feat-dashboard-wrap">
              <Image
                src="/ai/features/dashboard-fa.png"
                alt="داشبورد فارسی آرایه AI"
                width={960}
                height={600}
                className="feat-dashboard-img"
                priority={false}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="feat-section" id="how-it-works">
          <div className="feat-container">
            <div className="feat-section-head">
              <h2>در سه مرحله به پاسخ برسید.</h2>
            </div>
            <HowItWorksStrip />
          </div>
        </section>

        {/* Trust */}
        <section className="feat-section feat-trust">
          <div className="feat-container feat-container--narrow">
            <h2>پاسخ هوش مصنوعی را با قضاوت خودتان بررسی کنید.</h2>
            <p>
              مدل‌های هوش مصنوعی ممکن است اشتباه کنند. مقایسه چند پاسخ به شما دید بیشتری
              می‌دهد، اما اطلاعات مهم همچنان باید بررسی شوند.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="feat-section feat-section--alt" id="pricing">
          <div className="feat-container">
            <div className="feat-section-head">
              <h2>قیمت و شروع استفاده</h2>
            </div>
            <div className="feat-pricing-grid">
              <article className="feat-plan-card">
                <h3>{FREE_PACKAGE.nameFa ?? FREE_PACKAGE.name}</h3>
                <div className="feat-plan-price">
                  ۰<span> تومان</span>
                </div>
                <p>{FREE_PACKAGE.desc}</p>
                <ul>
                  {FREE_PACKAGE.features.slice(0, 3).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
              <article className="feat-plan-card">
                <h3>{PERSONAL_PLAN.nameFa ?? PERSONAL_PLAN.name}</h3>
                <div className="feat-plan-price">
                  {formatPriceToman(PERSONAL_PLAN.priceToman)}
                  <span> تومان</span>
                </div>
                <p>مناسب استفاده شخصی و روزمره</p>
                <ul>
                  {PERSONAL_PLAN.features.slice(0, 3).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
              <article className="feat-plan-card feat-plan-card--featured">
                <span className="feat-plan-badge">{HEAVY_PLAN.badge}</span>
                <h3>{HEAVY_PLAN.nameFa ?? HEAVY_PLAN.name}</h3>
                <div className="feat-plan-price">
                  {formatPriceToman(HEAVY_PLAN.priceToman)}
                  <span> تومان</span>
                </div>
                <p>مناسب استفاده بیشتر و کارهای جدی‌تر</p>
                <ul>
                  {HEAVY_PLAN.features.slice(0, 3).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="feat-pricing-cta">
              <Link href="/ai" className="ar-btn ar-btn-primary">
                رایگان شروع کنید
              </Link>
              <p>برای شروع به کارت بانکی نیاز نیست.</p>
              <Link href="/ai/pricing" className="feat-text-cta">
                جزئیات همه پلن‌ها ←
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="feat-section" id="faq">
          <div className="feat-container feat-container--narrow">
            <div className="feat-section-head">
              <h2>سؤال‌های متداول</h2>
            </div>
            <div className="feat-faq">
              {FEATURES_FAQ.map((item) => (
                <details key={item.q} className="feat-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="feat-final">
          <div className="feat-container feat-final-inner">
            <h2>یک سؤال دارید؟ از چند هوش مصنوعی بپرسید.</h2>
            <p>پاسخ‌ها را کنار هم ببینید و با دید بیشتری انتخاب کنید.</p>
            <div className="feat-final-actions">
              <Link href="/ai" className="ar-btn ar-btn-primary feat-btn-light">
                رایگان امتحان کنید
              </Link>
              <Link href="/ai/pricing" className="feat-final-link">
                مشاهده قیمت‌ها
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="feat-footer">
        <div className="feat-container feat-footer-inner">
          <div className="feat-footer-cols">
            <div>
              <strong>آرایه AI</strong>
              <p>محصولی از آرایه</p>
            </div>
            <nav aria-label="فوتر">
              <Link href="/ai/features">امکانات</Link>
              <Link href="/ai/features#use-cases">کاربردها</Link>
              <Link href="/ai/pricing">قیمت‌ها</Link>
              <Link href="/prompts">پرامپت‌ها</Link>
              <Link href="/ai/support">پشتیبانی</Link>
              <Link href="/about">قوانین و حریم خصوصی</Link>
            </nav>
          </div>
          <p className="feat-footer-copy">آرایه AI، محصولی از آرایه</p>
        </div>
      </footer>
    </>
  );
}
