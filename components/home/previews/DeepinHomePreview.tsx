import Image from "next/image";

export default function DeepinHomePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a1f2e] bg-[#0b0f18] shadow-[0_16px_48px_rgba(16,42,67,0.18)]">
      <Image
        src="/portfolio/deepinhq.png"
        alt="DeepinHQ — پلتفرم تحلیل مالی"
        width={1120}
        height={640}
        className="block aspect-[16/10] h-auto w-full object-cover object-top"
        sizes="(max-width: 900px) 100vw, 33vw"
      />
      <div className="border-t border-white/10 bg-[#0f1420] px-4 py-3 text-right">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#e8872b]">DEEPINHQ</p>
        <p className="mt-1 text-sm font-extrabold text-white">Deepin Finance</p>
      </div>
    </div>
  );
}
