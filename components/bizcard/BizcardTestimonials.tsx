import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";
import { bizcardTestimonials } from "@/lib/bizcardData";

export default function BizcardTestimonials() {
  return (
    <section className="tool-section">
      <div className="container-mx container-px">
        <ToolEditorialHeader
          index="۰۴"
          kicker="روایت کاربران"
          title="کسب‌وکارهایی که دیجیتال شدند"
          subtitle="بدون هزینه و بدون دانش فنی"
        />
        <div className="mt-8 grid border-y border-navy-300 lg:grid-cols-3">
          {bizcardTestimonials.map((t, index) => (
            <div
              key={t.name}
              className="flex flex-col border-b border-navy-300 p-6 last:border-b-0 lg:border-b-0 lg:border-l lg:last:border-l-0"
            >
              <span className="tool-index">نقل‌قول {String(index + 1).padStart(2, "0")}</span>
              <p className="mt-5 flex-1 text-[14px] leading-8 text-navy-700">«{t.quote}»</p>
              <div className="mt-6 border-t border-navy-200 pt-4">
                <div>
                  <div className="text-sm font-bold text-navy-900">{t.name}</div>
                  <div className="text-xs text-navy-400">{t.biz}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
