"use client";

import { useEffect, useRef } from "react";
import { seoServiceCards } from "@/lib/seoData";
import { trackSeoEvent } from "@/lib/seoAnalytics";

export default function SeoServicesArchitecture() {
  const ref = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackSeoEvent("seo_service_view");
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="services"
      className="seo-services section-py scroll-mt-24"
      aria-label="خدمات سئو آرایه"
    >
      <div className="container-mx container-px">
        <div className="seo-services-header">
          <span className="seo-section-tag">معماری خدمات</span>
          <h2>خدمات سئو آرایه دقیقاً شامل چیست؟</h2>
          <p>
            هر پروژه با توجه به وضعیت سایت و بازار برنامه اختصاصی دارد، اما خدمات آرایه در
            هشت بخش اصلی اجرا می‌شوند.
          </p>
        </div>

        <div className="seo-services-grid">
          {seoServiceCards.map((card) => (
            <article key={card.num} className="seo-services-card">
              <span className="seo-services-num">{card.num}</span>
              <h3>{card.title}</h3>
              <p className="seo-services-desc">{card.description}</p>
              <ul className="seo-services-includes">
                {card.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {card.note ? <p className="seo-services-note">{card.note}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
