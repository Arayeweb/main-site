import Image from "next/image";
import Link from "next/link";
import {
  googlesabtTestimonials,
  googlesabtTestimonialsMore,
  type GooglesabtTestimonial,
} from "@/lib/googlesabtData";
import { IconStar } from "@/components/icons";

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center justify-center gap-0.5 text-[#FABB05]"
      aria-label={`${rating} از ۵`}
    >
      {Array.from({ length: rating }).map((_, i) => (
        <IconStar key={i} size={14} className="fill-current stroke-none" strokeWidth={0} />
      ))}
    </div>
  );
}

function TestimonialCard({
  item,
  compact = false,
}: {
  item: GooglesabtTestimonial;
  compact?: boolean;
}) {
  const logoSize = compact ? 40 : 56;
  const isSvg = item.logo.endsWith(".svg");

  return (
    <li className={`text-center ${compact ? "opacity-95" : ""}`}>
      <div
        className={`relative mx-auto overflow-hidden rounded-full border border-navy-100 bg-white shadow-sm ${
          compact ? "h-10 w-10" : "h-14 w-14"
        }`}
      >
        {isSvg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <Image
            src={item.logo}
            alt=""
            fill
            className="object-cover"
            sizes={`${logoSize}px`}
          />
        )}
      </div>
      <div className={compact ? "mt-2" : "mt-3"}>
        <Stars rating={item.rating} />
      </div>
      <p
        className={`mt-3 leading-relaxed text-navy-600 ${
          compact ? "text-[12px]" : "text-[14px]"
        }`}
      >
        «{item.review}»
      </p>
      <p
        className={`mt-3 font-extrabold text-navy-900 ${
          compact ? "text-[12px]" : "text-[13px]"
        }`}
      >
        {item.name}
      </p>
      <p className={`mt-0.5 text-navy-400 ${compact ? "text-[11px]" : "text-[12px]"}`}>
        {item.business}
      </p>
      {item.cardUrl ? (
        <p className="mt-1">
          <Link
            href={item.cardUrl}
            className="text-[10px] font-medium text-navy-300 transition hover:text-[#4285F4]"
          >
            {item.cardUrl.replace(/^\//, "")}
          </Link>
        </p>
      ) : null}
    </li>
  );
}

export default function GooglesabtTestimonials() {
  return (
    <section
      className="bg-white py-16 sm:py-20"
      aria-labelledby="googlesabt-testimonials-heading"
    >
      <div className="container-mx container-px">
        <h2
          id="googlesabt-testimonials-heading"
          className="text-center text-xl font-extrabold text-navy-900 sm:text-2xl"
        >
          نظر مشتریان
        </h2>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3 sm:gap-10">
          {googlesabtTestimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </ul>

        <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-6 border-t border-navy-50 pt-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {googlesabtTestimonialsMore.map((item) => (
            <TestimonialCard key={item.id} item={item} compact />
          ))}
        </ul>
      </div>
    </section>
  );
}
