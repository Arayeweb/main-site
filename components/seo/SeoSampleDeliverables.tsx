"use client";

import { useEffect, useRef } from "react";
import { seoSampleDeliverables } from "@/lib/seoData";
import { trackSeoEvent } from "@/lib/seoAnalytics";
import { scrollToSeoAuditForm } from "@/lib/seoPlanSelection";

function SamplePreview({ type }: { type: (typeof seoSampleDeliverables)[number]["type"] }) {
  switch (type) {
    case "audit":
      return (
        <div className="seo-sample-preview seo-sample-preview--audit" aria-hidden="true">
          <div className="seo-sample-row seo-sample-row--critical">
            <span>Index coverage</span>
            <span>۳ صفحه</span>
          </div>
          <div className="seo-sample-row seo-sample-row--warn">
            <span>Core Web Vitals</span>
            <span>نیاز به بهبود</span>
          </div>
          <div className="seo-sample-row">
            <span>Broken links</span>
            <span>۷ مورد</span>
          </div>
        </div>
      );
    case "keyword":
      return (
        <div className="seo-sample-preview seo-sample-preview--keyword" aria-hidden="true">
          <div className="seo-sample-kw">
            <span>دکتر پوست + منطقه</span>
            <span>صفحه خدمت</span>
          </div>
          <div className="seo-sample-kw">
            <span>لیزر موهای زائد</span>
            <span>لندینگ</span>
          </div>
        </div>
      );
    case "brief":
      return (
        <div className="seo-sample-preview seo-sample-preview--brief" aria-hidden="true">
          <p className="seo-sample-brief-title">Content Brief</p>
          <p className="seo-sample-brief-line">H1: خدمات …</p>
          <p className="seo-sample-brief-line">سوالات: هزینه، مدت، …</p>
          <span className="seo-sample-brief-cta">CTA: درخواست مشاوره</span>
        </div>
      );
    case "pages":
      return (
        <div className="seo-sample-preview seo-sample-preview--pages" aria-hidden="true">
          <span>خدمات</span>
          <span>محلی</span>
          <span>دسته‌بندی</span>
          <span>راهنما</span>
        </div>
      );
    case "report":
      return (
        <div className="seo-sample-preview seo-sample-preview--report" aria-hidden="true">
          <div className="seo-sample-metric">
            <span>Impression</span>
            <span>—</span>
          </div>
          <div className="seo-sample-metric">
            <span>Click</span>
            <span>—</span>
          </div>
          <div className="seo-sample-metric">
            <span>تماس</span>
            <span>—</span>
          </div>
        </div>
      );
    case "conversion":
      return (
        <div className="seo-sample-preview seo-sample-preview--conversion" aria-hidden="true">
          <span>Organic → Landing</span>
          <span>Form / Call</span>
          <span>Lead tracked</span>
        </div>
      );
  }
}

export default function SeoSampleDeliverables() {
  const ref = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackSeoEvent("seo_case_study_view");
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="samples"
      className="seo-samples section-py scroll-mt-24"
      aria-label="نمونه خروجی‌های پروژه"
    >
      <div className="container-mx container-px">
        <div className="seo-samples-header">
          <span className="seo-section-tag">نمونه خروجی</span>
          <h2>نمونه خروجی‌های پروژه سئو</h2>
          <p>پیش‌نمایش واقعی از ساختار deliverableها — بدون عدد یا نتیجه ساختگی.</p>
        </div>

        <div className="seo-samples-grid">
          {seoSampleDeliverables.map((item) => (
            <article key={item.title} className="seo-samples-card">
              <span className="seo-samples-badge">نمونه خروجی</span>
              <h3>{item.title}</h3>
              <p>{item.preview}</p>
              <SamplePreview type={item.type} />
            </article>
          ))}
        </div>

        <div className="seo-samples-cta">
          <p>می‌خواهید وضعیت سایت شما هم بررسی شود؟</p>
          <button type="button" className="seo-btn-primary" onClick={scrollToSeoAuditForm}>
            بررسی سایت من
          </button>
        </div>
      </div>
    </section>
  );
}
