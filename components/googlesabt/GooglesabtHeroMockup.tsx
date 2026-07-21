import { IconMapPin, IconPhone, IconGlobe, IconClock, IconStar } from "@/components/icons";

export default function GooglesabtHeroMockup() {
  return (
    <div className="relative" aria-label="نمونه نتیجه ثبت کسب‌وکار در گوگل">
      <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-navy-800 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
        نتیجه‌ای که دریافت می‌کنید
      </span>
      <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-navy-100 bg-white p-4 shadow-2xl sm:p-5">
        {/* Google search bar */}
        <div className="mb-3 flex items-center gap-2 rounded-full border border-navy-100 bg-white px-3 py-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4285F4] text-xs font-bold text-white">
            G
          </span>
          <span className="flex-1 text-xs text-navy-600">کافه سنتی در اصفهان</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-navy-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* Map card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#EA4335] shadow">
              <IconMapPin size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-navy-800">کافه سنتی اصفهان</p>
              <p className="text-[10px] text-navy-500">کافه و رستوران</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-navy-600 shadow">مسیر</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-navy-600 shadow">تماس</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-navy-600 shadow">ذخیره</span>
          </div>
        </div>

        {/* Listing details */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2 text-[12px] text-navy-600">
            <IconStar size={14} className="mt-0.5 shrink-0 fill-current text-[#FABB05] stroke-none" strokeWidth={0} />
            <span>۴.۶ امتیاز از ۵ — ۱۲۸ نظر</span>
          </div>
          <div className="flex items-start gap-2 text-[12px] text-navy-600">
            <IconPhone size={14} className="mt-0.5 shrink-0 text-[#4285F4]" />
            <span dir="ltr">۰۳۱-۳۴۵۶۷۸۹۰</span>
          </div>
          <div className="flex items-start gap-2 text-[12px] text-navy-600">
            <IconGlobe size={14} className="mt-0.5 shrink-0 text-[#4285F4]" />
            <span>cafesemani.com</span>
          </div>
          <div className="flex items-start gap-2 text-[12px] text-navy-600">
            <IconMapPin size={14} className="mt-0.5 shrink-0 text-[#EA4335]" />
            <span>اصفهان، خیابان چهارباغ، کوچه‌ی ...</span>
          </div>
          <div className="flex items-start gap-2 text-[12px] text-navy-600">
            <IconClock size={14} className="mt-0.5 shrink-0 text-[#34A853]" />
            <span>امروز باز است — ۹ صبح تا ۱۱ شب</span>
          </div>
        </div>
      </div>
    </div>
  );
}
