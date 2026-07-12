import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { IconMail, IconPhone } from "@/components/icons";
import ContactConversationForm from "./ContactConversationForm";
import ContactRoutingVisual from "./ContactRoutingVisual";
import {
  COMPANY_LEGAL_NAME,
  CONTACT_FAQ,
} from "@/lib/contactPageData";
import {
  FOOTER_ADDRESS,
  FOOTER_MAPS_URL,
} from "@/lib/homeData";
import {
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
  siteWhatsAppUrl,
} from "@/lib/siteContact";

const DIRECT_CHANNELS = [
  {
    key: "phone",
    title: "تماس تلفنی",
    value: SITE_PHONE_DISPLAY,
    href: SITE_PHONE_TEL,
    description: "برای گفت‌وگوی کوتاه درباره پروژه",
    icon: IconPhone,
  },
  {
    key: "whatsapp",
    title: "واتساپ",
    value: SITE_PHONE_DISPLAY,
    href: siteWhatsAppUrl("سلام، از صفحه تماس آرایه پیام می‌دهم."),
    description: "برای ارسال توضیحات، لینک یا نمونه",
    icon: null,
  },
  {
    key: "email",
    title: "ایمیل",
    value: "support@araaye.com",
    href: "mailto:support@araaye.com",
    description: "برای پیشنهاد همکاری و مکاتبات رسمی",
    icon: IconMail,
  },
] as const;

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ContactPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-36">
        <div className="container-mx container-px">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge mb-5 bg-navy-50 text-navy-600">تماس با آرایه</span>
            <h1 className="text-balance text-[1.75rem] font-extrabold leading-[1.3] tracking-tight text-navy-900 sm:text-4xl lg:text-[2.5rem]">
              از کجا شروع کنیم؟ مسئله کسب‌وکارتان را بگویید.
            </h1>
            <p className="mx-auto mt-5 text-base leading-relaxed text-navy-500 sm:text-lg">
              لازم نیست از قبل بدانید به سئو، صفحه فروش یا سایت جدید نیاز دارید. چند سؤال کوتاه
              می‌پرسیم تا مسیر مناسب مشخص شود.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-navy-400">
              برای پشتیبانی Araaye AI، از{" "}
              <Link href="/ai/support" className="font-semibold text-brand-600 hover:text-brand-700">
                داخل حساب کاربری
              </Link>{" "}
              پیام بفرستید.
            </p>
          </div>
        </div>
      </section>

      {/* Main form */}
      <section className="border-t border-navy-50 bg-navy-50/40 pb-16 sm:pb-20">
        <div className="container-mx container-px">
          <div className="mx-auto max-w-3xl">
            <ContactConversationForm />
          </div>
        </div>
      </section>

      {/* Direct channels */}
      <section className="bg-white py-14 sm:py-16">
        <div className="container-mx container-px">
          <SectionHeader
            badge="راه‌های دیگر"
            title="ارتباط مستقیم را ترجیح می‌دهید؟"
            badgeClassName="bg-navy-50 text-navy-600"
          />

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {DIRECT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.key}
                  href={channel.href}
                  target={channel.key === "whatsapp" ? "_blank" : undefined}
                  rel={channel.key === "whatsapp" ? "noopener noreferrer" : undefined}
                  className="group rounded-[18px] border border-navy-100 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-soft"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                    {Icon ? (
                      <Icon size={20} />
                    ) : (
                      <span className="text-emerald-600">
                        <WhatsAppGlyph />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-900">{channel.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-brand-600" dir="ltr">
                    {channel.value}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-navy-500">{channel.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Routing */}
      <section className="border-y border-navy-50 bg-navy-50/30 py-14 sm:py-16">
        <div className="container-mx container-px">
          <SectionHeader
            badge="مسیر درخواست"
            title="پیام شما به کدام بخش می‌رود؟"
            subtitle="هر درخواست مستقیماً به بخش مرتبط ارسال می‌شود."
            badgeClassName="bg-white text-navy-600"
          />
          <ContactRoutingVisual />
        </div>
      </section>

      {/* Company info */}
      <section className="bg-white py-12 sm:py-14">
        <div className="container-mx container-px">
          <div className="mx-auto max-w-2xl rounded-[20px] border border-navy-100 bg-navy-50/20 p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-navy-900">اطلاعات مجموعه</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="font-semibold text-navy-600">نام رسمی</dt>
                <dd className="text-navy-800">{COMPANY_LEGAL_NAME}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="font-semibold text-navy-600">شماره تماس</dt>
                <dd>
                  <a href={SITE_PHONE_TEL} className="font-semibold text-brand-600 hover:text-brand-700" dir="ltr">
                    {SITE_PHONE_DISPLAY}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="font-semibold text-navy-600">ایمیل</dt>
                <dd>
                  <a
                    href="mailto:support@araaye.com"
                    className="font-semibold text-brand-600 hover:text-brand-700"
                    dir="ltr"
                  >
                    support@araaye.com
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="font-semibold text-navy-600">آدرس</dt>
                <dd className="max-w-md text-left text-navy-700 sm:text-right">
                  <a
                    href={FOOTER_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-brand-700"
                  >
                    {FOOTER_ADDRESS}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-2 border-t border-navy-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="font-semibold text-navy-600">شبکه‌های اجتماعی</dt>
                <dd className="flex flex-wrap gap-3">
                  <a
                    href="https://instagram.com/araayecom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-navy-700 hover:text-brand-600"
                  >
                    اینستاگرام
                  </a>
                  <a
                    href="https://www.linkedin.com/company/araaye"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-navy-700 hover:text-brand-600"
                  >
                    لینکدین
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-navy-50 bg-navy-50/40 py-14 sm:py-16">
        <div className="container-mx container-px">
          <SectionHeader
            badge="پیش از تماس"
            title="سؤال‌های کوتاه قبل از تماس"
            badgeClassName="bg-white text-navy-600"
          />

          <div className="mx-auto max-w-2xl rounded-[20px] border border-navy-100 bg-white">
            {CONTACT_FAQ.map((item) => (
              <details key={item.q} className="group border-b border-navy-100 last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-right text-sm font-bold text-navy-900 sm:px-6 sm:py-5 sm:text-[15px] [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    className="shrink-0 text-xl font-light text-navy-300 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-navy-500 sm:px-6 sm:pb-5">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy-900 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src="/assets/logo-icon.svg"
            alt=""
            width={280}
            height={280}
            className="absolute left-1/2 top-1/2 h-[min(50vw,280px)] w-[min(50vw,280px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
          />
        </div>

        <div className="container-mx container-px relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
              هنوز مطمئن نیستید از کجا شروع کنید؟
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/70 sm:text-base">
              کافی است درباره کسب‌وکارتان چند خط بنویسید؛ درخواست را به بخش مناسب می‌فرستیم.
            </p>
            <a
              href="#start-conversation"
              className="mt-8 inline-flex items-center justify-center rounded-[18px] bg-brand-400 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-300 active:scale-[0.98]"
            >
              شروع گفت‌وگو
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
