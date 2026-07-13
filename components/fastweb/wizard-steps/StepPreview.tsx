"use client";

import { Monitor, Smartphone } from "lucide-react";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import type { FastWebBrief, FastWebPreviewContent } from "@/lib/fastweb";

interface StepPreviewProps {
  brief: FastWebBrief;
  preview: FastWebPreviewContent;
  previewMode: "mobile" | "desktop";
  slugHint: string;
  onPreviewMode: (mode: "mobile" | "desktop") => void;
}

export default function StepPreview({
  brief,
  preview,
  previewMode,
  slugHint,
  onPreviewMode,
}: StepPreviewProps) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">پیش‌نمایش سایت</h1>
          <p className="mt-1 text-sm text-slate-600">
            این ساختار، ظاهر و رنگ سایت شماست. متن نهایی را تیم آرایه می‌نویسد
            و قبل از انتشار کنترل می‌کند.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onPreviewMode("mobile")}
            className={`rounded-md p-2 ${
              previewMode === "mobile" ? "bg-white shadow-sm" : ""
            }`}
            aria-label="نمایش موبایل"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPreviewMode("desktop")}
            className={`rounded-md p-2 ${
              previewMode === "desktop" ? "bg-white shadow-sm" : ""
            }`}
            aria-label="نمایش دسکتاپ"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`mx-auto mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-inner ${
          previewMode === "mobile" ? "max-w-[390px]" : "w-full"
        }`}
      >
        <FastWebSiteView content={preview} brief={brief} mode="preview" />
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-medium">آدرس سایت</p>
        <p className="mt-1 text-sm text-slate-600" dir="ltr">
          {slugHint}
        </p>
      </div>
    </section>
  );
}
