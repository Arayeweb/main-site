import { seoProcessSteps } from "@/lib/seoData";

export default function SeoProcess() {
  return (
    <section id="process" className="seo-process-section section-py bg-navy-50/40 scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-process-header">
          <span className="seo-section-tag">فرآیند همکاری</span>
          <h2>از جلسه شناخت تا گزارش ماهانه</h2>
        </div>

        <ol className="seo-process-timeline">
          {seoProcessSteps.map((step) => (
            <li key={step.num} className="seo-process-step">
              <span className="seo-process-dot">{step.num}</span>
              <span className="seo-process-title">{step.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
