"use client";

import { bizcardThemes, type BizcardTheme } from "@/lib/bizcardData";

export interface PreviewData {
  businessName: string;
  category: string;
  phone: string;
  address: string;
  mapsUrl: string;
  logoPreview: string | null;
  theme: BizcardTheme;
}

export default function BizcardPreview({ data }: { data: PreviewData }) {
  const name = data.businessName.trim() || "نام کسب‌وکار";
  const initial = name[0] ?? "ک";

  return (
    <div className="sticky top-24">
      <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wide text-navy-400">
        پیش‌نمایش کارت شما
      </p>
      <div
        className="mx-auto max-w-[340px] overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_-12px_rgba(16,19,26,0.2)]"
        style={
          {
            "--pv-brand": data.theme.brand,
            "--pv-deep": data.theme.deep,
          } as React.CSSProperties
        }
      >
        <div
          className="h-[90px]"
          style={{
            background: `linear-gradient(135deg, ${data.theme.brand}, ${data.theme.deep})`,
          }}
        />
        <div className="-mt-10 px-6 pb-5 text-center">
          <div
            className="mx-auto flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[22px] border-4 border-white text-3xl font-bold shadow-lg"
            style={{
              background: "linear-gradient(150deg,#fff,#f0f4fb)",
              color: data.theme.brand,
            }}
          >
            {data.logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="mt-3 text-lg font-extrabold text-navy-900">{name}</div>
          {data.category.trim() ? (
            <span className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {data.category.trim()}
            </span>
          ) : null}
        </div>

        <div className="space-y-0 px-6 pb-2">
          {data.phone.trim() ? (
            <div className="flex items-center gap-3 border-t border-navy-100 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-brand-600">
                📞
              </span>
              <span className="text-sm text-navy-700">{data.phone.trim()}</span>
            </div>
          ) : null}
          {data.address.trim() ? (
            <div className="flex items-center gap-3 border-t border-navy-100 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-brand-600">
                📍
              </span>
              <span className="text-sm text-navy-700">{data.address.trim()}</span>
            </div>
          ) : null}
        </div>

        {data.mapsUrl.trim() ? (
          <div className="px-6 pb-4">
            <div
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${data.theme.brand}, ${data.theme.deep})`,
              }}
            >
              مسیریابی
            </div>
          </div>
        ) : null}

        <div className="border-t border-navy-100 px-6 py-4 text-center text-[11px] font-bold text-navy-400">
          کارت ویزیت با <span className="text-brand-600">آرایه</span>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-[340px] rounded-xl border border-[#c6d3ff] bg-gradient-to-l from-blue-50 to-green-50 p-4 text-right">
        <p className="text-xs font-extrabold text-navy-800">ثبت حرفه‌ای در گوگل‌مپ؟</p>
        <p className="mt-1 text-[11px] leading-relaxed text-navy-500">
          کارت رایگان لینک شماست. پکیج محبوب: ثبت ۵ نقشه + همه مسیریاب‌ها روی همین لینک.
        </p>
        <a
          href="/googlesabt?from=bizcard&package=popular#packages"
          className="mt-3 inline-block rounded-lg bg-[#4285F4] px-3 py-2 text-[11px] font-bold text-white"
        >
          مشاهده پکیج ثبت گوگل
        </a>
      </div>
    </div>
  );
}

export { bizcardThemes };
