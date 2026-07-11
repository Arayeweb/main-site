import SectionHeader from "@/components/home/SectionHeader";
import { audienceGroups, projectOutputCategories } from "@/data/website-design";

export function WebsiteDesignAudiences() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مناسب چه کسب‌وکارهایی است؟"
          title="برای کسب‌وکارهایی که سایت را بخشی از فروش می‌دانند"
        />

        <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audienceGroups.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-navy-100 bg-navy-50/30 px-4 py-3.5 text-sm font-bold text-navy-800"
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-navy-500">
          نوع طراحی، ساختار صفحات و مسیر جذب مشتری بر اساس مدل کسب‌وکار و هدف پروژه مشخص
          می‌شود.
        </p>
      </div>
    </section>
  );
}

export function WebsiteDesignOutputs() {
  return (
    <section className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="خروجی پروژه"
          title="در پایان چه چیزی تحویل می‌گیرید؟"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {projectOutputCategories.map((category) => (
            <article
              key={category.title}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6"
            >
              <h3 className="text-base font-extrabold text-navy-900">{category.titleFa}</h3>
              <ul className="mt-4 space-y-2.5">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-navy-500">
          جزئیات دقیق خروجی بر اساس نوع و ابعاد پروژه در پیشنهاد رسمی مشخص می‌شود.
        </p>
      </div>
    </section>
  );
}
