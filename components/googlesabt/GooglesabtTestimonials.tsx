import Image from "next/image";
import { googlesabtTestimonials } from "@/lib/googlesabtData";
import { IconStar } from "@/components/icons";

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
            <li key={item.id} className="text-center">
              <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full border border-navy-100 bg-white shadow-sm">
                <Image
                  src={item.logo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div
                className="mt-3 flex items-center justify-center gap-0.5 text-[#FABB05]"
                aria-label={`${item.rating} از ۵`}
              >
                {Array.from({ length: item.rating }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={14}
                    className="fill-current stroke-none"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-navy-600">
                «{item.review}»
              </p>
              <p className="mt-4 text-[13px] font-extrabold text-navy-900">{item.name}</p>
              <p className="mt-0.5 text-[12px] text-navy-400">{item.business}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
