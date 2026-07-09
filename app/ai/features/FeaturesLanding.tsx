"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import CinemaExperience from "./components/CinemaExperience";
import ModePreviewCards from "./components/ModePreviewCards";
import UseCaseCards from "./components/UseCaseCards";
import FeatureGrid from "./components/FeatureGrid";
import PricingSection from "./components/PricingSection";
import FaqSection from "./components/FaqSection";
import FinalCTA from "./components/FinalCTA";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Araaye AI چه فرقی با ChatGPT دارد؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatGPT یک مدل است؛ آرایه AI workspace چندمدله است.",
      },
    },
    {
      "@type": "Question",
      name: "مقایسه چند مدل AI یعنی چه؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "یک سؤال — چند پاسخ کنار هم — انتخاب بهترین خروجی.",
      },
    },
  ],
};

export default function FeaturesLanding() {
  return (
    <MotionConfig reducedMotion="user">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <a href="#feat-main" className="feat-skip">
        رفتن به محتوای اصلی
      </a>

      <header className="feat-nav">
        <div className="feat-nav-inner">
          <Link href="/ai/features" className="feat-logo">
            آرایه <span>AI</span>
          </Link>
          <nav className="feat-nav-links" aria-label="ناوبری اصلی">
            <a href="#how-it-works">چطور کار می‌کند</a>
            <a href="#modes">حالت‌ها</a>
            <a href="#features">قابلیت‌ها</a>
            <a href="#pricing">قیمت‌ها</a>
          </nav>
          <div className="feat-nav-cta">
            <Link href="/ai" className="ar-btn ar-btn-primary ar-btn-sm">
              شروع استفاده
            </Link>
          </div>
        </div>
      </header>

      <main id="feat-main" className="feat-main-after-cinema">
        <CinemaExperience />
        <ModePreviewCards />
        <UseCaseCards />
        <FeatureGrid />
        <PricingSection />
        <FaqSection />
        <FinalCTA />
      </main>

      <footer className="feat-footer">
        <div className="feat-footer-links">
          <Link href="/ai">شروع چت</Link>
          <Link href="/ai/pricing">قیمت‌ها</Link>
          <Link href="/prompts">پرامپت‌های آماده</Link>
          <Link href="/ai/support">پشتیبانی</Link>
          <Link href="/">درباره آرایه</Link>
        </div>
        <p>
          محصولی از <Link href="/">آرایه</Link> — پاسخ‌ها توسط مدل‌های هوش مصنوعی تولید
          می‌شوند.
        </p>
      </footer>
    </MotionConfig>
  );
}
