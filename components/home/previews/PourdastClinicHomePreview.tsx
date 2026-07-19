import Image from "next/image";

export default function PourdastClinicHomePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_16px_48px_rgba(16,42,67,0.10)]">
      <Image
        src="/showcase-assets/pourdast/desktop.png"
        alt="صفحه اصلی سایت مطب دکتر عالیه پوردست"
        width={1120}
        height={700}
        className="block aspect-[16/10] h-auto w-full object-cover object-top"
        sizes="(max-width: 900px) 100vw, 33vw"
      />
      <div className="border-t border-navy-50 bg-white px-4 py-3 text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">
          Clinic Website
        </p>
        <p className="mt-1 text-sm font-extrabold text-navy-900">عالیه پوردست</p>
      </div>
    </div>
  );
}
