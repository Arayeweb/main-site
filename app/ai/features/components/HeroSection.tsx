"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import AnimatedHeroMockup from "./AnimatedHeroMockup";
import FloatingModelCards from "./FloatingModelCards";
import { ensureGsapScroll, gsap } from "../gsapSetup";

const HEADLINE_PARTS = [
  "یک سؤال بپرس،",
  "چند AI جواب بدهند،",
  "خروجی بهتر بگیر",
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureGsapScroll();
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(".feat-hero-line"), {
        opacity: 0,
        y: 36,
        filter: "blur(10px)",
        stagger: 0.13,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(section.querySelector(".feat-hero-eyebrow"), {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from(section.querySelector(".feat-hero-sub"), {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.35,
      });
      gsap.from(section.querySelector(".feat-hero-actions"), {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.5,
      });
      gsap.from(section.querySelector(".feat-hero-visual-inner"), {
        opacity: 0,
        y: 50,
        rotateX: 12,
        scale: 0.9,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.25,
      });

      /* Depth parallax on scroll through hero */
      section.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const d = Number(layer.dataset.depth ?? 4);
        const factor = [0.12, 0.22, 0.45, 0.7, 1, 1.15][d] ?? 1;
        gsap.to(layer, {
          y: () => -80 * factor,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      /* Mockup tilts into 3D as user scrolls away */
      gsap.to(section.querySelector(".feat-hero-visual-inner"), {
        rotateX: 18,
        rotateY: -14,
        z: -80,
        scale: 0.92,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "center top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* Headline drifts up with blur */
      gsap.to(section.querySelector(".feat-hero-copy"), {
        y: -60,
        opacity: 0.15,
        filter: "blur(4px)",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="feat-hero feat-scene" data-scene="hero">
      <div className="feat-hero-bg" data-depth="0" aria-hidden="true" />
      <div className="feat-hero-glow" data-depth="1" aria-hidden="true" />

      <div className="feat-container feat-hero-inner">
        <div className="feat-hero-grid">
          <div className="feat-hero-copy" data-depth="4">
            <span className="feat-eyebrow feat-hero-eyebrow">یک سؤال؛ چند AI؛ یک خروجی بهتر</span>
            <h1>
              {HEADLINE_PARTS.map((part) => (
                <span key={part} className="feat-hero-line">
                  {part}
                </span>
              ))}
            </h1>
            <p className="feat-sub feat-hero-sub">
              Araaye AI یک پنل فارسی برای پرسیدن، مقایسه کردن و گرفتن خروجی بهتر از چند
              مدل هوش مصنوعی است.
            </p>
            <div className="feat-hero-actions">
              <Link href="/ai" className="ar-btn ar-btn-primary feat-btn-lg">
                شروع استفاده از Araaye AI
              </Link>
              <a href="#how-it-works" className="ar-btn feat-btn-ghost-light feat-btn-lg">
                دیدن قابلیت‌ها
              </a>
            </div>
          </div>

          <div className="feat-hero-visual" data-depth="3">
            <div className="feat-hero-visual-inner">
              <FloatingModelCards />
              <AnimatedHeroMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
