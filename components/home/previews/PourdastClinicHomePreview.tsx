import Image from "next/image";

const POURDAST_PORTRAIT = "/showcase-assets/pourdast/portrait.webp";

export default function PourdastClinicHomePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_16px_48px_rgba(16,42,67,0.10)]">
      <div className="flex items-center justify-between border-b border-navy-50 bg-[#f8f9fa] px-4 py-2.5">
        <div className="text-right">
          <p className="text-sm font-extrabold text-navy-900">دکتر عالیه پوردست</p>
          <p className="text-[10px] font-semibold text-navy-500">متخصص بیماری‌های عفونی · تهران</p>
        </div>
        <span className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
          سایت مطب
        </span>
      </div>

      <div className="relative aspect-[16/10] bg-[#e8eaed]">
        <Image
          src={POURDAST_PORTRAIT}
          alt="سایت مطب دکتر عالیه پوردست"
          fill
          className="object-cover object-[center_58%]"
          sizes="(max-width: 900px) 100vw, 33vw"
        />
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/25 bg-black/30 px-3 py-2 text-right backdrop-blur-md">
          <p className="text-xs font-bold text-white">معرفی تخصص و مسیر نوبت‌گیری</p>
          <p className="mt-0.5 text-[10px] text-amber-100">اعتمادسازی برای بیماران جدید</p>
        </div>
      </div>

      <div className="border-t border-navy-50 px-4 py-3 text-right">
        <p className="text-[10px] font-bold tracking-[0.15em] text-navy-400">CLINIC WEBSITE</p>
        <p className="mt-1 text-sm font-extrabold text-navy-900">سایت مطب عالیه پوردست</p>
      </div>
    </div>
  );
}
