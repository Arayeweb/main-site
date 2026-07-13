"use client";

import Link from "next/link";
import { doctorOutputs } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";
import { IconArrowLeft } from "@/components/icons";
import { pushGtmEvent } from "@/lib/gtm";

function OutputCard({
  href,
  external,
  title,
  description,
}: {
  href: string;
  external?: boolean;
  title: string;
  description: string;
}) {
  const onClick = () =>
    pushGtmEvent("cta_click", {
      location: "doctors_outputs",
      label: title,
      page: "doctors",
    });

  const inner = (
    <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-card">
      <h3 className="text-sm font-extrabold text-navy-900">{title}</h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-navy-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sky-700">
        مشاهده
        <IconArrowLeft size={14} />
      </span>
    </article>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {inner}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick}>
      {inner}
    </Link>
  );
}

export default function DoctorsOutputs() {
  return (
    <section id="outputs" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه خروجی‌ها"
          badgeClassName="bg-sky-50 text-sky-700"
          title="سایت و گزارش؛ نه فقط وعده"
          subtitle="ببینید خروجی واقعی چه شکلی است — بعد تصمیم بگیرید."
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {doctorOutputs.map((item) => (
            <OutputCard
              key={item.title}
              href={item.href}
              external={item.external}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
