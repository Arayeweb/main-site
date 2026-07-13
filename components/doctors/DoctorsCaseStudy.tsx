import { doctorCaseStudy } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";
import { IconArrowLeft, IconCheck } from "@/components/icons";

export default function DoctorsCaseStudy() {
  const c = doctorCaseStudy;

  return (
    <section id="case-study" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="Case Study"
          badgeClassName="bg-sky-50 text-sky-700"
          title="یک پروژه واقعی، با لینک قابل‌مشاهده"
          subtitle="به‌جای فهرست نام‌های بدون مدرک، یک نمونه قابل‌تأیید."
        />

        <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft">
          <div className="border-b border-navy-50 bg-gradient-to-l from-sky-50 to-white px-6 py-5 sm:px-8">
            <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
              {c.specialty}
            </span>
            <h3 className="mt-3 text-lg font-extrabold text-navy-900 sm:text-xl">{c.title}</h3>
            {c.siteUrl ? (
              <a
                href={c.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-800"
              >
                مشاهده سایت
                <IconArrowLeft size={14} />
              </a>
            ) : null}
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <div>
              <h4 className="text-xs font-bold text-navy-400">چالش</h4>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{c.challenge}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-navy-400">کار انجام‌شده</h4>
              <ul className="mt-2 space-y-2">
                {c.work.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                    <IconCheck size={15} className="mt-0.5 shrink-0 text-sky-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-sky-50/80 px-4 py-4">
              <h4 className="text-xs font-bold text-sky-700">نتیجه</h4>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{c.outcome}</p>
            </div>

            {c.quote ? (
              <figure className="border-r-4 border-sky-500 pr-4">
                <blockquote className="text-sm leading-loose text-navy-600">«{c.quote}»</blockquote>
                {c.quoteRole ? (
                  <figcaption className="mt-2 text-xs text-navy-400">{c.quoteRole}</figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
