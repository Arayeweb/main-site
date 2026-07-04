"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pushGtmEvent } from "@/lib/gtm";
import { demoPackages, specialties, formatToman, type DemoPackageKey } from "@/lib/demoData";
import { accentConfig } from "./accentConfig";
import { DynamicIcon, IconArrowLeft, IconCheck } from "@/components/icons";
import RevealSection from "./RevealSection";

export default function DemoFlow() {
  const router = useRouter();
  const [selected, setSelected] = useState<DemoPackageKey | null>(null);

  const choosePackage = (key: DemoPackageKey) => {
    setSelected(key);
    pushGtmEvent("demo_package_selected", { package: key });
    document.getElementById("specialty-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseSpecialty = (route: string, specialtyKey: string) => {
    pushGtmEvent("demo_specialty_selected", { specialty: specialtyKey, package: selected ?? "none" });
    const url = selected ? `${route}?package=${selected}` : route;
    router.push(url);
  };

  const selectedPkg = demoPackages.find((p) => p.key === selected) || null;

  return (
    <div>
      {/* Primary step — specialty selection. Clicking goes straight to the
          full demo site so prospects see the value before any price talk. */}
      <div id="specialty-step" className="scroll-mt-24">
        <RevealSection>
          <div className="mx-auto max-w-xl text-center">
            <span className="badge mb-4 bg-brand-50 text-brand-600">
              {selectedPkg ? `پکیج ${selectedPkg.name} انتخاب شد ✓` : "همین الان، بدون هیچ تعهدی"}
            </span>
            <h2 className="section-title">تخصص مطب یا کلینیک خود را انتخاب کنید</h2>
            <p className="section-subtitle">
              با یک کلیک، یک نمونه‌سایت واقعی و کامل مخصوص همان حوزه را می‌بینید — قیمت‌ها را هر وقت خواستید پایین‌تر مرور کنید.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {specialties.map((s) => {
              const accent = accentConfig[s.key];
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => chooseSpecialty(s.route, s.key)}
                  className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-navy-100 bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-card"
                >
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.softBg} ${accent.text}`}>
                    <DynamicIcon name={s.icon} size={26} />
                  </span>
                  <span className="text-sm font-extrabold text-navy-900">{s.label}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-navy-400 transition-colors group-hover:text-navy-700">
                    مشاهده نمونه‌سایت
                    <IconArrowLeft size={13} />
                  </span>
                </button>
              );
            })}
          </div>
        </RevealSection>
      </div>

      {/* Secondary, optional step — pricing. Shown after the specialty picker
          so prospects aren't asked to think about price before seeing value. */}
      <div id="packages" className="mx-auto mt-16 max-w-4xl">
        <RevealSection>
          <div className="mx-auto max-w-xl text-center">
            <span className="badge mb-4 bg-navy-50 text-navy-500">اختیاری</span>
            <h3 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
              می‌خواهید از حالا بدانید کدام پکیج مناسب شماست؟
            </h3>
            <p className="section-subtitle">
              یک پکیج را از پایین انتخاب کنید تا هنگام دیدن نمونه‌سایت، دقیقاً امکانات همان پکیج برایتان مشخص شود.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {demoPackages.map((p, i) => {
              const isSelected = selected === p.key;
              return (
                <RevealSection key={p.key} delayMs={i * 80}>
                  <div
                    className={`relative flex h-full flex-col rounded-3xl border-2 bg-white p-6 transition-all duration-300 ${
                      isSelected
                        ? "border-brand-500 shadow-card -translate-y-1"
                        : "border-navy-100 shadow-soft hover:-translate-y-1 hover:border-brand-200"
                    }`}
                  >
                    {p.popular ? (
                      <span className="absolute -top-3 right-6 rounded-full bg-brand-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-soft">
                        محبوب‌ترین
                      </span>
                    ) : null}

                    <h3 className="text-base font-extrabold text-navy-900">{p.name}</h3>
                    <p className="mt-1 text-xs font-bold text-brand-600">{p.tagline}</p>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-navy-500">{p.description}</p>

                    <div className="mt-4">
                      <span className="block text-xs text-navy-300 line-through">
                        {formatToman(p.oldPrice)} تومان
                      </span>
                      <span className="text-2xl font-extrabold text-brand-600">
                        {formatToman(p.price)}
                        <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                      </span>
                    </div>

                    <ul className="mt-4 flex flex-1 flex-col gap-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-600">
                          <IconCheck size={14} className="mt-1 shrink-0 text-brand-500" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => choosePackage(p.key)}
                      className={`mt-5 w-full rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                        isSelected
                          ? "bg-brand-600 text-white hover:bg-brand-700"
                          : "border border-navy-200 bg-white text-navy-700 hover:border-brand-300 hover:text-brand-700"
                      }`}
                    >
                      {isSelected ? "انتخاب شد ✓" : "انتخاب این پکیج"}
                    </button>
                  </div>
                </RevealSection>
              );
            })}
          </div>

          {selected ? (
            <p className="mt-6 text-center text-xs text-navy-400">
              عالی! حالا از بالا تخصص مطب‌تان را انتخاب کنید تا نمونه‌سایت را با امکانات پکیج {selectedPkg?.name} ببینید.
            </p>
          ) : null}
        </RevealSection>
      </div>
    </div>
  );
}
