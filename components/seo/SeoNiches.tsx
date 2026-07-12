import { seoNiches } from "@/lib/seoData";

export default function SeoNiches() {
  return (
    <section id="niches" className="seo-niches section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-niches-header">
          <span className="seo-section-tag">مناسب چه کسب‌وکارهایی</span>
          <h2>هر جا مشتری در گوگل جستجو می‌کند</h2>
        </div>

        <div className="seo-niche-grid">
          {seoNiches.map((niche) => (
            <article key={niche.title} className="seo-niche-card">
              <h3>{niche.title}</h3>
              <p className="seo-niche-search">«{niche.exampleSearch}»</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
          <h3 className="text-sm font-bold text-navy-900">لندینگ‌های تخصصی برای پزشکان و کلینیک‌ها</h3>
          <p className="mt-1 text-sm text-navy-600">
            سیستم سرچ تا نوبت/رزرو — لندینگ، CRM و گزارش لید برای این دو گروه.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/seo/doctor"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
            >
              سئو پزشکان
            </a>
            <a
              href="/seo/clinic"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
            >
              سئو کلینیک
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
