"use client";

import { useRef } from "react";
import { sfCarouselServices } from "@/lib/showdemoto/salamat-farda/config";
import styles from "./salamat-farda.module.css";

export default function SalamatFardaServicesCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "prev" | "next") {
    const el = trackRef.current;
    if (!el) return;
    const amount = dir === "next" ? -280 : 280;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className={styles.carouselWrap}>
      <button
        type="button"
        className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
        aria-label="خدمات قبلی"
        onClick={() => scroll("prev")}
      >
        ›
      </button>

      <div ref={trackRef} className={styles.carousel} role="list">
        {sfCarouselServices.map((service) => (
          <a
            key={service.id}
            href="#contact"
            className={styles.carouselItem}
            role="listitem"
          >
            <div className={styles.carouselCircle}>
              <div>
                <div className={styles.carouselTitle}>{service.title}</div>
                {service.icon ? (
                  <div className={styles.carouselIcon} aria-hidden="true">
                    {service.icon}
                  </div>
                ) : null}
              </div>
            </div>
            <p className={styles.carouselSubtitle}>{service.subtitle}</p>
          </a>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
        aria-label="خدمات بعدی"
        onClick={() => scroll("next")}
      >
        ‹
      </button>
    </div>
  );
}
