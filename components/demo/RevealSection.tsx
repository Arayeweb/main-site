"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

// Lightweight IntersectionObserver-based fade-up reveal, no external deps.
// Respects prefers-reduced-motion via the .reveal CSS rule in globals.css.
export default function RevealSection({ children, className, delayMs = 0 }: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setVisible(true);
      return;
    }

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = window.setTimeout(() => setVisible(true), delayMs);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delayMs]);

  return (
    <div ref={ref} className={cn("reveal", visible && "reveal-visible", className)}>
      {children}
    </div>
  );
}
