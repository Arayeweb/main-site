import { portfolioProjects } from "@/lib/homeData";
import SectionHeader from "./home/SectionHeader";
import PortfolioPreview from "./home/PortfolioPreview";
import { IconArrowLeft } from "./icons";

export default function RealPortfolio() {
  const featured = portfolioProjects.find((p) => p.featured) ?? portfolioProjects[0];
  const rest = portfolioProjects.filter((p) => p.name !== featured.name);
  const withPreview = rest.filter((p) => p.image);
  const compact = rest.filter((p) => !p.image);

  return (
    <section id="real-portfolio" className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه‌کارها"
          title="نمونه‌کارها و تجربه همکاری"
          subtitle="چند نمونه از محصول‌ها، وب‌سایت‌ها و همکاری‌هایی که تجربه طراحی و توسعه آن‌ها را داشته‌ایم."
        />

        <div className="mb-5 grid gap-6 overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card lg:grid-cols-2">
          <PortfolioPreview
            name={featured.name}
            previewKey={featured.key}
            image={featured.image}
            featured
            className="rounded-none border-0 min-h-[240px] lg:min-h-full"
          />
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <span className="badge mb-3 w-fit bg-brand-50 text-brand-600">{featured.category}</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{featured.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-navy-500 sm:text-base">
              {featured.description}
            </p>
            {featured.result ? (
              <p className="mt-3 text-sm font-medium text-green-700">{featured.result}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {featured.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-navy-100/60 px-2 py-0.5 text-xs text-navy-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            {featured.external && featured.url ? (
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                مشاهده پروژه
                <IconArrowLeft size={14} />
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {withPreview.map((project) => (
            <a
              key={project.name}
              href={project.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row"
            >
              <PortfolioPreview
                name={project.name}
                previewKey={project.key}
                image={project.image}
                className="rounded-none border-0 min-h-[180px] sm:w-2/5 sm:border-l sm:border-navy-100"
              />
              <div className="flex flex-1 flex-col justify-center p-5">
                <span className="text-xs font-semibold text-brand-600">{project.category}</span>
                <h3 className="mt-1 text-base font-extrabold text-navy-900">{project.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500 line-clamp-3">
                  {project.description}
                </p>
              </div>
            </a>
          ))}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {compact.map((project) => (
              <div
                key={project.name}
                className="flex flex-col justify-center rounded-2xl border border-navy-100 bg-navy-50/40 p-4 transition-colors hover:border-navy-200"
              >
                <span className="text-[11px] font-semibold text-brand-600">
                  {project.category}
                </span>
                <h3 className="mt-0.5 text-sm font-extrabold text-navy-900">{project.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-500 line-clamp-2">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-all duration-200 hover:border-navy-900 hover:bg-navy-900 hover:text-white"
          >
            مشاوره رایگان برای پروژه شما
            <IconArrowLeft size={14} className="rotate-180" />
          </a>
        </div>
      </div>
    </section>
  );
}
