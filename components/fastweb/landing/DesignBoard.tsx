"use client";

import { useEffect, useState } from "react";
import MiniSite from "./MiniSite";
import { HERO_WORKSHOP, type FwPreviewVariant } from "./content";

/**
 * Raw design-board preview — no device chrome, no browser dots.
 * Looks like a page laid open on a designer’s desk: crop marks,
 * coordinates, section labels, and a status stamp.
 */
export default function DesignBoard({
  ready = false,
}: {
  ready?: boolean;
}) {
  const cycles = HERO_WORKSHOP.cycles;
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const active = cycles[index]!;

  useEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % cycles.length);
        setFading(false);
      }, 280);
    }, 4200);
    return () => window.clearInterval(id);
  }, [ready, cycles.length]);

  function select(i: number) {
    if (i === index) return;
    setFading(true);
    window.setTimeout(() => {
      setIndex(i);
      setFading(false);
    }, 200);
  }

  return (
    <div className="fw-board aspect-[16/11] w-full p-[4%] sm:p-[3.5%]">
      <span className="fw-crop fw-crop-tl" aria-hidden="true" />
      <span className="fw-crop fw-crop-tr" aria-hidden="true" />
      <span className="fw-crop fw-crop-bl" aria-hidden="true" />
      <span className="fw-crop fw-crop-br" aria-hidden="true" />

      <span className="fw-board-measure left-3 top-2 sm:left-4 sm:top-3" dir="ltr">
        {active.measure}
      </span>
      <span className="fw-board-measure bottom-2 left-3 sm:bottom-3 sm:left-4" dir="ltr">
        x: 0 · y: 0
      </span>
      <span className="fw-board-measure bottom-2 right-3 sm:bottom-3 sm:right-4">
        {active.industry}
      </span>

      {/* Desktop page plane */}
      <div
        className="fw-board-page relative ms-auto h-[86%] w-[78%] transition-opacity duration-300"
        style={{ opacity: fading ? 0.35 : 1 }}
      >
        <span className="fw-board-label right-2 top-2">Hero</span>
        <span className="fw-board-label bottom-[28%] left-2 hidden sm:block">Services</span>
        <span className="fw-board-label bottom-2 right-2">CTA</span>
        <div className="absolute inset-0">
          <MiniSite variant={active.variant as FwPreviewVariant} device="desktop" />
        </div>
      </div>

      {/* Mobile strip peeking from behind — not a phone mockup chrome */}
      <div
        className="fw-board-mobile bottom-[6%] start-[2%] hidden h-[72%] w-[22%] sm:block"
        style={{ opacity: fading ? 0.35 : 1 }}
        aria-hidden="true"
      >
        <div className="absolute inset-0">
          <MiniSite variant={active.variant as FwPreviewVariant} device="mobile" />
        </div>
      </div>

      {/* Status stamp — annotation, not a pill under the CTA */}
      <div className="absolute -bottom-3 start-1/2 z-10 -translate-x-1/2 sm:start-auto sm:end-8 sm:translate-x-0">
        <span className="fw-stamp" data-ready={ready ? "true" : "false"}>
          {ready ? (
            <>
              {HERO_WORKSHOP.stampReady}
              <span aria-hidden="true">✓</span>
            </>
          ) : (
            HERO_WORKSHOP.stampBuilding
          )}
        </span>
      </div>

      {/* Industry cycle controls — structural, not soft chips */}
      <div className="absolute -top-8 end-0 flex items-center gap-2">
        {cycles.map((c, i) => (
          <button
            key={c.variant}
            type="button"
            onClick={() => select(i)}
            className="fw-focus text-[0.7rem] font-bold"
            style={{
              color: i === index ? "var(--fw-ink)" : "var(--fw-muted)",
              borderBottom:
                i === index ? "1.5px solid var(--fw-accent)" : "1.5px solid transparent",
              paddingBottom: 2,
            }}
            aria-pressed={i === index}
          >
            {c.industry}
          </button>
        ))}
      </div>
    </div>
  );
}
