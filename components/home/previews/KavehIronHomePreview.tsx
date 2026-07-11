import Image from "next/image";
import { kavehImages } from "@/lib/showcaseSites/kaveh/config";

export default function KavehIronHomePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#3a3f46] bg-[#2a2f36] shadow-[0_16px_48px_rgba(16,42,67,0.18)]">
      <div className="flex items-center justify-between border-b-[3px] border-[#e8872b] bg-[#2a2f36] px-4 py-2.5">
        <div className="text-right">
          <p className="text-sm font-black text-white">آهن کاوه</p>
          <p className="text-[10px] font-semibold text-[#8a939e]">فروش و تأمین آهن‌آلات</p>
        </div>
        <span className="rounded-sm bg-[#e8872b] px-2.5 py-1 text-[10px] font-extrabold text-[#2a2f36]">
          استعلام قیمت
        </span>
      </div>

      <div
        className="relative px-4 py-4 sm:px-5 sm:py-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,47,54,0.92), rgba(42,47,54,0.92)), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px)",
        }}
      >
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_0.9fr]">
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-wide text-[#e8872b]">
              فروش و تأمین آهن‌آلات ساختمانی
            </p>
            <h3 className="mt-1.5 text-base font-black leading-snug text-white sm:text-lg">
              قیمت آهن را سریع بگیرید
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-[#b8bcc2]">
              میلگرد، تیرآهن، ورق — مشخصات سفارش را ثبت کنید تا برای هماهنگی تماس
              گرفته شود.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-sm bg-[#e8872b] px-2.5 py-1.5 text-[10px] font-extrabold text-[#2a2f36]">
                استعلام قیمت
              </span>
              <span className="rounded-sm border border-white/20 px-2.5 py-1.5 text-[10px] font-bold text-white">
                تماس مستقیم
              </span>
            </div>

            <div className="mt-4 space-y-1.5 rounded-sm border border-white/10 bg-white/5 p-2.5">
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <span className="rounded-sm bg-white/10 px-2 py-1.5 text-[#d0d4d9]">میلگرد A3</span>
                <span className="rounded-sm bg-white/10 px-2 py-1.5 text-[#d0d4d9]">۵ تن</span>
              </div>
              <span className="block w-full rounded-sm bg-[#e8872b] py-1.5 text-center text-[10px] font-extrabold text-[#2a2f36]">
                دریافت قیمت
              </span>
            </div>
          </div>

          <div className="relative">
            <Image
              src={kavehImages.hero}
              alt="انبار آهن‌آلات"
              width={400}
              height={280}
              className="aspect-[10/7] w-full rounded-sm object-cover"
              sizes="(max-width: 640px) 100vw, 240px"
            />
            <div className="absolute bottom-2 right-2 rounded-sm border border-white/15 bg-[#2a2f36]/90 px-2 py-1.5 text-[9px] font-bold text-white backdrop-blur-sm">
              پاسخ سریع کارشناس
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
