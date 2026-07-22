"use client";

import { openSiteChat } from "@/lib/openSiteChat";

const steps = [
  {
    number: "۱",
    title: "مسئله را دقیق می‌فهمیم",
    description: "درباره هدف، مخاطب، محدودیت‌ها و وضعیت فعلی کسب‌وکارتان گفت‌وگو می‌کنیم.",
    output: "خلاصه نیازها و هدف پروژه",
  },
  {
    number: "۲",
    title: "راهکار و اولویت‌ها را می‌چینیم",
    description: "مشخص می‌کنیم چه چیزی باید ساخته شود، از کجا شروع کنیم و چه کاری فعلاً لازم نیست.",
    output: "پیشنهاد شفاف زمان و اجرا",
  },
  {
    number: "۳",
    title: "می‌سازیم، آزمایش می‌کنیم و تحویل می‌دهیم",
    description: "خروجی را مرحله‌به‌مرحله می‌بینید، بازخورد می‌دهید و نسخه نهایی آماده انتشار می‌شود.",
    output: "خروجی قابل استفاده و آماده رشد",
  },
] as const;

export default function CollaborationProcess() {
  return (
    <section id="process" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            از گفت‌وگوی اول تا تحویل، مسیر روشن است
          </h2>
        </div>

        <ol className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-3 lg:gap-6">
          {steps.map((step) => (
            <li key={step.number} className="text-right">
              <p className="text-sm font-bold text-brand-600">{step.number}</p>
              <h3 className="mt-2 text-lg font-extrabold text-navy-900 sm:text-xl">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.description}</p>
              <p className="mt-4 border-t border-navy-100 pt-3 text-xs font-semibold text-navy-400">
                {step.output}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center sm:mt-12">
          <button
            type="button"
            onClick={() => openSiteChat("collaboration_process")}
            className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-800 active:scale-[0.98]"
          >
            درخواست مشاوره
          </button>
        </div>
      </div>
    </section>
  );
}
