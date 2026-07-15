import { seoDeliverables } from "@/lib/seoData";
import { IconCheck } from "@/components/icons";

export default function SeoDeliverables() {
  return (
    <section className="seo-deliverables section-py" aria-label="خروجی همکاری">
      <div className="container-mx container-px">
        <div className="seo-deliverables-layout">
          <div className="seo-deliverables-copy">
            <span className="seo-section-tag">خروجی‌ها</span>
            <h2>خروجی همکاری فقط یک گزارش رتبه نیست</h2>
            <p>
              در گزارش ماهانه مشخص می‌شود چه کاری انجام شده، چرا انجام شده، چه تغییری
              ایجاد شده و اولویت مرحله بعد چیست.
            </p>
          </div>

          <ul className="seo-deliverables-list">
            {seoDeliverables.map((item) => (
              <li key={item}>
                <IconCheck size={16} className="seo-deliverables-check" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
