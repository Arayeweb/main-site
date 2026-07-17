import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { doctorSeoContentBlocks } from "@/lib/doctorsData";

export default function DoctorsSeoContent() {
  return (
    <section id="seo-content" className="section-py scroll-mt-24 bg-navy-50/30">
      <div className="container-mx container-px">
        <SectionHeader
          badge="راهنمای کامل"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="طراحی سایت پزشکی — پاسخ کامل به نیت‌های جستجو"
          subtitle="قیمت، نمونه، امکانات، نوبت‌دهی، تخصص‌ها، وردپرس یا اختصاصی، مراحل، سئو و مقایسه با اینستاگرام و سامانه‌های عمومی."
        />

        <div className="mx-auto grid max-w-4xl gap-4">
          {doctorSeoContentBlocks.map((block) => (
            <article
              key={block.title}
              className="rounded-2xl border border-navy-100 bg-white px-5 py-5 sm:px-6"
            >
              <h2 className="text-base font-extrabold text-navy-900 sm:text-lg">{block.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600 sm:text-[15px]">{block.body}</p>
            </article>
          ))}
        </div>

        <div className="-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="mx-auto min-w-[560px] w-full max-w-4xl border-collapse overflow-hidden rounded-2xl border border-navy-100 bg-white text-right text-sm">
            <thead>
              <tr className="bg-navy-900 text-white">
                <th className="px-4 py-3">موضوع</th>
                <th className="px-4 py-3">در پکیج مطب</th>
                <th className="px-4 py-3">توضیح</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["قیمت", "۲۰ میلیون ثابت", "شروع با ۶ میلیون"],
                ["نسخه اولیه", "۲ روز کاری", "بعد از دریافت اطلاعات"],
                ["صفحات خدمت", "۳ لندینگ", "مسیر نوبت روی هر خدمت"],
                ["نوبت‌دهی", "اتصال به سامانه موجود", "ساخت سامانه جدا نیست"],
                ["سئو", "فنی اولیه", "ماهانه نیازمند برآورد"],
                ["مالکیت", "دامنه و سایت پزشک", "دارایی رسمی مطب"],
              ].map(([a, b, c], i) => (
                <tr key={a} className={i % 2 === 0 ? "bg-white" : "bg-navy-50/40"}>
                  <th className="px-4 py-3 font-bold text-navy-800">{a}</th>
                  <td className="px-4 py-3 font-semibold text-cyan-800">{b}</td>
                  <td className="px-4 py-3 text-navy-600">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav
          aria-label="لینک‌های مرتبط"
          className="mx-auto mt-8 flex max-w-4xl flex-wrap gap-3 text-[13px] font-bold"
        >
          <Link
            href="/website/clinic"
            className="rounded-lg bg-white px-3 py-2 text-cyan-800 ring-1 ring-navy-100 hover:bg-cyan-50"
          >
            طراحی سایت کلینیک
          </Link>
          <Link
            href="/seo/doctor"
            className="rounded-lg bg-white px-3 py-2 text-cyan-800 ring-1 ring-navy-100 hover:bg-cyan-50"
          >
            سئو پزشکان
          </Link>
          <Link
            href="/#showcase"
            className="rounded-lg bg-white px-3 py-2 text-cyan-800 ring-1 ring-navy-100 hover:bg-cyan-50"
          >
            نمونه‌کارها
          </Link>
          <Link
            href="/contact"
            className="rounded-lg bg-white px-3 py-2 text-cyan-800 ring-1 ring-navy-100 hover:bg-cyan-50"
          >
            تماس با مشاور
          </Link>
        </nav>

        <div className="mt-8 text-center">
          <a
            href="#quote-form"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
          >
            صحبت با مشاور طراحی سایت پزشکی
          </a>
        </div>
      </div>
    </section>
  );
}
