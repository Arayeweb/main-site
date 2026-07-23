import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";
import { bizcardSteps } from "@/lib/bizcardData";

export default function BizcardSteps() {
  return (
    <section id="how" className="tool-section scroll-mt-24">
      <div className="container-mx container-px">
        <ToolEditorialHeader
          index="۰۲"
          kicker="فرایند"
          title="چطور کار می‌کند؟"
          subtitle="در کمتر از ۲ دقیقه لینک همه‌کاره کسب‌وکارتان آماده می‌شود."
        />
        <div className="mt-2">
          {bizcardSteps.map((s) => (
            <div
              key={s.num}
              className="tool-rule-row gap-3 sm:grid-cols-[96px_240px_1fr] sm:items-baseline"
            >
              <span className="text-3xl font-extrabold tabular-nums text-brand-700">{s.num}</span>
              <h3 className="text-sm font-extrabold text-navy-900">{s.title}</h3>
              <p className="text-[13px] leading-7 text-navy-500">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
