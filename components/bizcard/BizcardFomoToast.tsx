"use client";

import { useEffect, useRef, useState } from "react";
import { bizcardFomoItems } from "@/lib/bizcardData";

export default function BizcardFomoToast() {
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);
  const [item, setItem] = useState(bizcardFomoItems[0]);

  useEffect(() => {
    const show = () => {
      const d = bizcardFomoItems[indexRef.current % bizcardFomoItems.length];
      indexRef.current += 1;
      setItem(d);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };
    const t1 = setTimeout(show, 6000);
    const t2 = setInterval(show, 12000);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 flex max-w-[300px] items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-card transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-sm font-bold text-white`}
      >
        {item.av}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-navy-900">
          {item.name} از {item.biz}
        </div>
        <div className="text-xs text-navy-400">همین الان کارت ویزیت ساخت</div>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 text-lg leading-none text-navy-300 hover:text-navy-600"
        aria-label="بستن"
      >
        ×
      </button>
    </div>
  );
}
