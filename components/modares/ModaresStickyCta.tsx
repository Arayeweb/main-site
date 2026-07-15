"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { scrollToNearestModaresForm } from "@/lib/modaresScroll";

const KEYBOARD_THRESHOLD = 120;

export default function ModaresStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-modares-form]"));
    if (!forms.length) return;

    let formVisible = false;
    let keyboardOpen = false;

    const updateVisibility = () => {
      setVisible(!formVisible && !keyboardOpen);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        formVisible = entries.some((entry) => entry.isIntersecting);
        updateVisibility();
      },
      { threshold: 0.15 },
    );

    forms.forEach((form) => observer.observe(form));

    const onViewportChange = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        keyboardOpen = false;
        updateVisibility();
        return;
      }
      keyboardOpen = window.innerHeight - viewport.height > KEYBOARD_THRESHOLD;
      updateVisibility();
    };

    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("scroll", onViewportChange);
    onViewportChange();

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 backdrop-blur-sm sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="container-px py-2">
        <button
          type="button"
          onClick={() => {
            pushGtmEvent("cta_click", { location: "modares_sticky_mobile", page: "modares" });
            scrollToNearestModaresForm();
          }}
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white transition-colors hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transform-none active:scale-[0.98]"
        >
          دریافت نمونه و قیمت
        </button>
      </div>
    </div>
  );
}
