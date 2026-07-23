import Link from "next/link";
import {
  websiteDesignDefinition,
  WEBSITE_DESIGN_PAGE,
} from "@/data/website-design";
import {
  FASTWEB_START_PRICE_TOMAN,
  WEBSITE_PRICING_UPDATED_AT,
  formatWebsiteDesignPrice,
  websiteDesignPricingPlans,
} from "@/lib/websitePricing";

/**
 * Crawlable definition + comparison blocks for AI SEO extractability.
 * Keep this a Server Component (no "use client").
 */
export default function WebsiteDesignAiExtract() {
  const customFrom = websiteDesignPricingPlans[0].priceFrom;
  const shopFrom = websiteDesignPricingPlans[2].priceFrom;

  return (
    <section className="border-y border-navy-100 bg-white py-12 sm:py-14" aria-labelledby="website-design-definition">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-3xl text-right">
          <h2 id="website-design-definition" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            {websiteDesignDefinition.heading}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-navy-600 sm:text-base">
            {websiteDesignDefinition.answer}
          </p>
          <p className="mt-3 text-xs text-navy-400">
            {websiteDesignDefinition.lastUpdatedLabel}: {WEBSITE_PRICING_UPDATED_AT}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-x-auto">
          <h2 className="text-center text-lg font-extrabold text-navy-900 sm:text-xl">
            مقایسه سایت فوری و طراحی اختصاصی
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-navy-500">
            اعداد از تعرفه رسمی آرایه؛ جزئیات در{" "}
            <Link href="/website-design/cost" className="font-bold text-teal-700 hover:text-teal-800">
              صفحه قیمت طراحی سایت
            </Link>
            .
          </p>
          <table className="mt-6 w-full min-w-[520px] border-collapse text-right text-sm">
            <caption className="sr-only">
              مقایسه قیمت، زمان و مناسب‌بودن سایت فوری و طراحی اختصاصی آرایه
            </caption>
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/50">
                <th scope="col" className="px-3 py-3 font-extrabold text-navy-800">
                  معیار
                </th>
                <th scope="col" className="px-3 py-3 font-extrabold text-navy-800">
                  سایت فوری (FastWeb)
                </th>
                <th scope="col" className="px-3 py-3 font-extrabold text-navy-800">
                  طراحی اختصاصی
                </th>
              </tr>
            </thead>
            <tbody className="text-navy-600">
              <tr className="border-b border-navy-50">
                <th scope="row" className="px-3 py-3 font-bold text-navy-800">
                  قیمت شروع
                </th>
                <td className="px-3 py-3">
                  از {formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان
                </td>
                <td className="px-3 py-3">
                  از {formatWebsiteDesignPrice(customFrom)} تا{" "}
                  {formatWebsiteDesignPrice(shopFrom)} تومان
                </td>
              </tr>
              <tr className="border-b border-navy-50">
                <th scope="row" className="px-3 py-3 font-bold text-navy-800">
                  زمان تحویل
                </th>
                <td className="px-3 py-3">نسخه اول در ۲۴ ساعت کاری</td>
                <td className="px-3 py-3">۳ تا ۱۲ هفته</td>
              </tr>
              <tr className="border-b border-navy-50">
                <th scope="row" className="px-3 py-3 font-bold text-navy-800">
                  مناسب برای
                </th>
                <td className="px-3 py-3">حضور رسمی سریع، معرفی یک‌صفحه‌ای</td>
                <td className="px-3 py-3">برند، چند خدمت، فروشگاه و امکانات سفارشی</td>
              </tr>
              <tr>
                <th scope="row" className="px-3 py-3 font-bold text-navy-800">
                  مسیر شروع
                </th>
                <td className="px-3 py-3">
                  <Link href="/fastweb" className="font-bold text-teal-700 hover:text-teal-800">
                    /fastweb
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <Link href={WEBSITE_DESIGN_PAGE} className="font-bold text-teal-700 hover:text-teal-800">
                    /website-design
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-center text-xs text-navy-400">
            آخرین به‌روزرسانی تعرفه: {WEBSITE_PRICING_UPDATED_AT} ·{" "}
            <Link href="/pricing.md" className="font-semibold text-teal-700 hover:text-teal-800">
              pricing.md
            </Link>{" "}
            ·{" "}
            <Link href="/llms.txt" className="font-semibold text-teal-700 hover:text-teal-800">
              llms.txt
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
