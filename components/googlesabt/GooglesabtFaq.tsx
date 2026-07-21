"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { googlesabtFaq } from "@/lib/googlesabtData";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL, siteWhatsAppUrl } from "@/lib/siteContact";

export default function GooglesabtFaq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="googlesabt-faq-heading">
      <div className="container-mx container-px">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="googlesabt-faq-heading"
            className="text-2xl font-extrabold text-navy-900 sm:text-3xl lg:text-[2.1rem]"
          >
            سوالات متداول
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            اگر سوال دیگری دارید، کارشناسان ما پاسخگو هستند.
          </p>
        </header>

        <div className="mx-auto mt-14 max-w-2xl">
          <ul className="divide-y divide-navy-100/80 border-y border-navy-100/80">
            {googlesabtFaq.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-right transition-colors sm:py-7"
                    aria-expanded={isOpen}
                    aria-controls={`gs-faq-panel-${i}`}
                    id={`gs-faq-trigger-${i}`}
                  >
                    <span
                      className={`text-[15px] font-extrabold leading-snug sm:text-base ${
                        isOpen ? "text-navy-900" : "text-navy-700"
                      }`}
                    >
                      {item.q}
                    </span>
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        isOpen
                          ? "bg-[#4285F4] text-white"
                          : "bg-navy-50 text-navy-400"
                      }`}
                      aria-hidden
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`gs-faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`gs-faq-trigger-${i}`}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-6 text-[14px] leading-relaxed text-navy-500 sm:pb-7 sm:text-[15px]">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={SITE_PHONE_TEL}
              className="text-[13px] font-bold text-navy-600 transition hover:text-[#4285F4]"
            >
              تماس: {SITE_PHONE_DISPLAY}
            </a>
            <span className="hidden text-navy-200 sm:inline" aria-hidden>
              ·
            </span>
            <a
              href={siteWhatsAppUrl("سلام، درباره ثبت گوگل سوال دارم.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-bold text-[#25D366] transition hover:opacity-80"
            >
              واتساپ پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
