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
    <section className="border-b border-navy-300 pb-20 pt-12 sm:pb-24 sm:pt-16">
      <div className="container-mx container-px tool-reveal">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <p className="tool-kicker">ابزار ۰۱ / کارت دیجیتال</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.18] text-navy-950 sm:text-6xl lg:text-7xl">
              تمام راه‌های تماس،
              <span className="block text-brand-700">در یک نشانی ثابت.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-navy-600">
              مشتری با یک لینک به تماس، نقشه و شبکه‌های اجتماعی شما می‌رسد. در دو دقیقه
              بسازید؛ بدون سایت، کدنویسی یا هزینه.
            </p>
          </div>
          <aside className="border-r-2 border-brand-600 pr-5">
            <p className="text-3xl font-extrabold tabular-nums text-navy-950">{label}</p>
            <p className="mt-1 text-xs font-bold text-navy-500">کارت ساخته‌شده در آرایه</p>
            <p className="mt-5 text-sm font-extrabold text-navy-900">۰ تومان · همیشه رایگان</p>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#builder"
            onClick={() => pushGtmEvent("cta_click", { location: "bizcard_hero", page: "bizcard" })}
            className="inline-flex items-center gap-2 bg-navy-950 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 active:translate-y-px"
          >
            ساخت رایگان کارت من
          </a>
          <a
            href="#how"
            className="border-b border-navy-400 px-2 py-3 text-sm font-bold text-navy-700 transition hover:border-brand-600 hover:text-brand-700"
          >
            چطور کار می‌کند؟
          </a>
        </div>
        <p className="mt-8 max-w-xl border-t border-navy-200 pt-4 text-[13px] leading-relaxed text-navy-500">
          می‌خواهید در گوگل‌مپ هم ثبت شوید و همه مسیریاب‌ها روی همین لینک باشد؟{" "}
          <Link href="/googlesabt?from=bizcard&package=popular#packages" className="font-bold text-[#4285F4] hover:underline">
            پکیج محبوب ثبت گوگل ←
          </Link>
        </p>
      </div>
    </section>
  );
}
