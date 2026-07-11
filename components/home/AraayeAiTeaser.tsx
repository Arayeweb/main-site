import AraayeAiComparePreview from "./AraayeAiComparePreview";

export default function AraayeAiTeaser() {
  return (
    <section
      id="ai-product"
      className="relative min-h-[800px] overflow-hidden bg-navy-900 py-16 sm:py-20"
    >
      {/* Subtle dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(59,108,255,0.08),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1180px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-teal-300">محصولی از آرایه</p>
          <h2 className="mt-2.5 text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
            یک سؤال؛ چند دیدگاه؛
            <span className="block">یک پاسخ بهتر</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">
            سؤال‌تان را یک‌بار بنویسید؛ پاسخ چند هوش مصنوعی را ببینید و نتیجه نهایی را از
            آرایه بگیرید.
          </p>
        </div>

        <AraayeAiComparePreview />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
          <a
            href="/ai"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:bg-white/90"
          >
            شروع با آرایه AI
          </a>
          <a
            href="/ai/features"
            className="inline-flex items-center justify-center rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            آشنایی بیشتر
          </a>
        </div>
      </div>
    </section>
  );
}
