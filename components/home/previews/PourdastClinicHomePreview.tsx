import Image from "next/image";

const POURDAST_PORTRAIT = "/showcase-assets/pourdast/portrait.webp";

export default function PourdastClinicHomePreview() {
  return (
    <div className="overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-navy-100/80 px-5 py-4">
        <div className="text-right">
          <p className="text-[15px] font-extrabold tracking-tight text-navy-900">دکتر عالیه پوردست</p>
          <p className="mt-0.5 text-[11px] font-medium text-navy-500">متخصص بیماری‌های عفونی · تهران</p>
        </div>
        <span className="rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white">
          رزرو نوبت
        </span>
      </div>

      <div className="relative aspect-[16/10] bg-navy-100">
        <Image
          src={POURDAST_PORTRAIT}
          alt="سایت مطب دکتر عالیه پوردست"
          fill
          className="object-cover object-[center_42%]"
          sizes="(max-width: 900px) 100vw, 40vw"
        />
      </div>

      <div className="border-t border-navy-50 px-5 py-4 text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">Clinic Website</p>
        <p className="mt-1 text-sm font-extrabold text-navy-900">عالیه پوردست</p>
      </div>
    </div>
  );
}
