import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";
import { shortenerFeatures } from "@/lib/shortenerData";

export default function ShortenerFeatures() {
  return (
    <section className="tool-section">
      <div className="container-mx container-px">
        <ToolEditorialHeader
          index="۰۲"
          kicker="امکانات"
          title="چرا کوتاه‌کننده لینک آرایه؟"
          subtitle="لینک کوتاه، QR و آدرس دلخواه — رایگان و سریع"
        />
        <div className="mt-2">
          {shortenerFeatures.map((f, index) => (
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
