import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";
import { bizcardFeatures } from "@/lib/bizcardData";

export default function BizcardFeatures() {
  return (
    <section className="tool-section">
      <div className="container-mx container-px">
        <ToolEditorialHeader
          index="۰۳"
          kicker="اجزای کارت"
          title="چه چیزهایی روی کارتتان می‌گذارید؟"
          subtitle="همه راه‌های ارتباطی کسب‌وکار — یکجا در یک لینک"
        />
        <div className="mt-2">
          {bizcardFeatures.map((f, index) => (
            <div
              key={f.title}
              className="tool-rule-row gap-3 sm:grid-cols-[72px_220px_1fr] sm:items-baseline"
            >
              <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-sm font-extrabold text-navy-900">{f.title}</h3>
              <p className="text-[13px] leading-7 text-navy-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
