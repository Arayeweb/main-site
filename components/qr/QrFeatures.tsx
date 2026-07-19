import SectionHeader from "@/components/home/SectionHeader";
import { IconCheck } from "@/components/icons";
import { qrFeatures } from "@/lib/qrData";

export default function QrFeatures() {
  return (
    <section className="section-py bg-gradient-to-b from-slate-50/80 to-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="امکانات"
          badgeClassName="bg-brand-50 text-brand-600"
          title="چرا ساخت QR کد آرایه؟"
          subtitle="سریع، رایگان و آماده پرینت"
        />
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {qrFeatures.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-card"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <IconCheck size={18} />
              </div>
              <h3 className="text-sm font-extrabold text-navy-900">{f.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
