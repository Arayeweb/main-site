import Link from "next/link";
import { websiteDesignTestimonials } from "@/data/website-design-testimonials";

const ACCENT = "#3157F6";

function ProjectLink({
  href,
  external,
}: {
  href: string;
  external?: boolean;
}) {
  const className =
    "inline-flex items-center text-sm font-bold transition-opacity hover:opacity-80";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={{ color: ACCENT }}
      >
        مشاهده پروژه
        <span aria-hidden="true" className="ms-1.5">
          ↗
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={{ color: ACCENT }}>
      مشاهده پروژه
      <span aria-hidden="true" className="ms-1.5">
        ↗
      </span>
    </Link>
  );
}

function TestimonialBlock({
  quote,
  name,
  projectType,
  href,
  external,
  large = false,
}: {
  quote: string;
  name: string;
  projectType: string;
  href?: string;
  external?: boolean;
  large?: boolean;
}) {
  return (
    <figure className={large ? "lg:py-2" : undefined}>
      <blockquote
        className={
          large
            ? "text-lg font-medium leading-[1.85] text-white sm:text-xl lg:text-[1.35rem] lg:leading-[1.9]"
            : "text-base font-medium leading-[1.85] text-white/92 sm:text-[17px]"
        }
      >
        «{quote}»
      </blockquote>
      <figcaption className="mt-5 border-t border-white/10 pt-5">
        <p className="text-sm font-extrabold text-white sm:text-[15px]">{name}</p>
        <p className="mt-1 text-[13px] font-semibold text-navy-300">{projectType}</p>
        {href ? (
          <div className="mt-3">
            <ProjectLink href={href} external={external} />
          </div>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default function WebsiteDesignTestimonials() {
  const items = websiteDesignTestimonials;

  if (!items.length) {
    return null;
  }

  const [featured, ...rest] = items;
  const twoOnly = items.length === 2;

  return (
    <section className="bg-navy-900 py-16 sm:py-20 lg:py-24">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold"
            style={{ backgroundColor: "rgba(49, 87, 246, 0.16)", color: ACCENT }}
          >
            تجربه مشتریان
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
            همکاری با آرایه از نگاه مشتریان
          </h2>
        </div>

        {twoOnly ? (
          <div className="mx-auto mt-10 grid max-w-[1100px] gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-12">
            {items.map((item) => (
              <TestimonialBlock key={item.id} {...item} large />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 grid max-w-[1100px] gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-12">
            <div className="lg:order-2">
              <TestimonialBlock {...featured} large />
            </div>
            <div className="flex flex-col gap-10 lg:order-1 lg:justify-center">
              {rest.map((item) => (
                <TestimonialBlock key={item.id} {...item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
