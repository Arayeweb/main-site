import type { DemoSiteContent } from "@/lib/demoData";
import type { AccentClasses } from "./accentConfig";
import SectionHeader from "@/components/home/SectionHeader";
import Testimonials from "./Testimonials";

export default function TestimonialsSection({
  content,
  accent,
}: {
  content: DemoSiteContent;
  accent: AccentClasses;
}) {
  return (
    <section id="testimonials" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نظر بیماران"
          badgeClassName={`${accent.badgeBg} ${accent.badgeText}`}
          title="چه کسانی به ما اعتماد کرده‌اند"
        />
        <Testimonials items={content.testimonials} accentText={accent.text} />
      </div>
    </section>
  );
}
