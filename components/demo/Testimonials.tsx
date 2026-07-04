import type { Testimonial } from "@/lib/demoData";
import StarRating from "./StarRating";
import RevealSection from "./RevealSection";
import { IconQuote } from "@/components/icons";

export default function Testimonials({
  items,
  accentText,
}: {
  items: Testimonial[];
  accentText: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => (
        <RevealSection key={t.name} delayMs={i * 80}>
          <figure className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
            <IconQuote size={28} className={accentText} />
            <StarRating rating={t.rating} />
            <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-navy-600">
              «{t.text}»
            </blockquote>
            <figcaption className="mt-4 border-t border-navy-50 pt-3">
              <div className="text-sm font-bold text-navy-900">{t.name}</div>
              <div className="text-[11px] text-navy-400">{t.role}</div>
            </figcaption>
          </figure>
        </RevealSection>
      ))}
    </div>
  );
}
