"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pushGtmEvent } from "@/lib/gtm";

export default function BizcardHero({ countLabel }: { countLabel: string }) {
  const [label, setLabel] = useState(countLabel);

  useEffect(() => {
    fetch("/api/bizcards/count")
      .then((r) => r.json())
      .then((d: { ok?: boolean; count?: number }) => {
        if (d.ok && d.count && d.count > 0) {
          const n = Math.max(500, d.count);
          setLabel(n.toLocaleString("fa-IR") + "+");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-slate-50 pb-12 pt-14 sm:pb-16 sm:pt-20">
      <div className="container-mx container-px text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          رایگان — همیشه
        </span>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
          کارت ویزیت دیجیتال{" "}
          <span className="bg-gradient-to-l from-brand-600 to-brand-400 bg-clip-text text-transparent">
            برای همه کسب‌وکارها
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-navy-500 sm:text-base">
          لینک اختصاصی، QR کد، نقشه، تماس و شبکه‌های اجتماعی — همه در یک صفحه.
          بدون سایت، بدون کدنویسی، بدون هزینه.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#builder"
            onClick={() => pushGtmEvent("cta_click", { location: "bizcard_hero", page: "bizcard" })}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.98]"
          >
            همین حالا کارتت را بساز
          </a>
          <a
            href="#how"
            className="rounded-xl border border-navy-200 bg-white px-7 py-3.5 text-sm font-bold text-navy-700 transition hover:border-brand-200 hover:text-brand-600"
          >
            چطور کار می‌کند؟
          </a>
        </div>

        <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-3 text-xs font-bold text-navy-500">
          <span className="text-amber-500">★★★★★</span>
          <span>
            <b className="text-navy-800">{label}</b> کسب‌وکار از آرایه استفاده می‌کنند
          </span>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { num: label, lbl: "کارت ساخته‌شده" },
            { num: "۲ دقیقه", lbl: "تا آماده‌شدن" },
            { num: "۰ تومان", lbl: "هزینه ساخت" },
          ].map((s) => (
            <div
              key={s.lbl}
              className="rounded-2xl border border-navy-100 bg-white px-4 py-5 shadow-soft"
            >
              <div className="text-2xl font-extrabold text-brand-600">{s.num}</div>
              <div className="mt-1 text-xs font-bold text-navy-500">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {["رایگان", "لینک اختصاصی", "QR کد", "بدون نصب اپ"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-navy-100 bg-white px-3 py-1 text-[11px] font-bold text-navy-600"
            >
              ✓ {t}
            </span>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-[13px] leading-relaxed text-navy-400">
          می‌خواهید در گوگل‌مپ هم ثبت شوید و همه مسیریاب‌ها روی همین لینک باشد؟{" "}
          <Link href="/googlesabt?from=bizcard&package=popular#packages" className="font-bold text-[#4285F4] hover:underline">
            پکیج محبوب ثبت گوگل ←
          </Link>
        </p>
      </div>
    </section>
  );
}
