import Image from "next/image";
import { googlesabtCaseStudies } from "@/lib/googlesabtData";

export default function GooglesabtProof() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="googlesabt-proof-heading">
      <div className="container-mx container-px">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="googlesabt-proof-heading"
            className="text-2xl font-extrabold leading-snug text-navy-900 sm:text-3xl lg:text-[2.1rem]"
          >
            ببینید بعد از راه‌اندازی چه چیزی دریافت می‌کنید.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            نمونه‌های واقعی از کسب‌وکارهایی که حضور آنلاین آن‌ها توسط آرایه راه‌اندازی شده است.
          </p>
        </header>

        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {googlesabtCaseStudies.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-[0_8px_30px_rgba(16,42,67,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(16,42,67,0.12)]"
            >
              <div className="grid grid-cols-2 gap-px bg-navy-100">
                <figure className="relative aspect-[4/5] overflow-hidden bg-[#f8f9fa]">
                  <Image
                    src={item.googleImage}
                    alt={`حضور ${item.name} در گوگل`}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 50vw, 18vw"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/70 to-transparent px-2.5 pb-2 pt-8">
                    <span className="text-[10px] font-bold text-white">گوگل</span>
                  </figcaption>
                </figure>
                <figure className="relative aspect-[4/5] overflow-hidden bg-navy-50">
                  <Image
                    src={item.smartLinkImage}
                    alt={`کارت هوشمند کسب‌وکار ${item.name}`}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 50vw, 18vw"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/70 to-transparent px-2.5 pb-2 pt-8">
                    <span className="text-[10px] font-bold text-white">کارت هوشمند</span>
                  </figcaption>
                </figure>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-navy-100 bg-white">
                    <Image
                      src={item.logo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-extrabold text-navy-900">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-navy-400">{item.category}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <a
                    href={item.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#4285F4] px-3 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#1b6ef3]"
                  >
                    مشاهده در گوگل
                  </a>
                  <a
                    href={item.smartLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-[12px] font-bold text-navy-700 transition hover:border-[#4285F4] hover:text-[#4285F4]"
                  >
                    مشاهده کارت هوشمند
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
