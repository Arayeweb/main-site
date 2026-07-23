import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";

export default function ToolFaqSection({
  items,
  index,
}: {
  items: readonly { q: string; a: string }[];
  index: string;
}) {
  return (
    <section className="tool-section">
      <div className="container-mx container-px">
        <ToolEditorialHeader
          index={index}
          kicker="پرسش‌های پرتکرار"
          title="پیش از ساخت، این‌ها را بدانید"
        />
        <div className="mt-2">
          {items.map((item, itemIndex) => (
            <details key={item.q} className="group border-t border-navy-200 first:border-t-0">
              <summary className="grid cursor-pointer list-none gap-3 py-5 marker:content-none sm:grid-cols-[72px_1fr_24px] sm:items-baseline">
                <span className="tool-index">{String(itemIndex + 1).padStart(2, "0")}</span>
                <span className="text-sm font-extrabold text-navy-900">{item.q}</span>
                <span className="text-left text-lg text-brand-700 group-open:hidden">+</span>
                <span className="hidden text-left text-lg text-brand-700 group-open:block">−</span>
              </summary>
              <p className="max-w-3xl pb-5 text-[13px] leading-7 text-navy-600 sm:mr-[72px]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
