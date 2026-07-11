import Image from "next/image";

export default function EmrozHomePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8ecf4] bg-[#f4f6fb] shadow-[0_16px_48px_rgba(16,42,67,0.10)]">
      <Image
        src="/portfolio/emroz-landing.png"
        alt="امروز — لندینگ محصول رشد فردی"
        width={1120}
        height={640}
        className="block aspect-[16/10] h-auto w-full object-cover object-top"
        sizes="(max-width: 900px) 100vw, 33vw"
      />
      <div className="border-t border-[#e8ecf4] bg-white px-4 py-3 text-right">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#5a7fd4]">EMROZ</p>
        <p className="mt-1 text-sm font-extrabold text-navy-900">امروز</p>
      </div>
    </div>
  );
}
