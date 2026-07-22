"use client";

import type { FastWebBrief } from "@/lib/fastweb";
import Field from "./Field";

const EXAMPLE_PROMPTS = [
  "سالن زیبایی تخصصی رنگ و لایت با ۸ سال سابقه؛ مخاطب خانم‌های جوان شیراز؛ فضای لوکس و صمیمی.",
  "باشگاه بدنسازی مجهز با مربی اختصاصی و کلاس گروهی؛ مناسب جوانان؛ حال‌وهوای پرانرژی و مدرن.",
  "دفتر وکالت متخصص پرونده‌های ملکی و قراردادها؛ مشاوره حضوری و آنلاین؛ ظاهر رسمی و مطمئن.",
  "کافه با قهوه تخصصی، صبحانه و دسر روز؛ فضای گرم برای قرارهای دوستانه و کاری.",
];

interface StepBusinessProps {
  brief: FastWebBrief;
  onPatch: (patch: Partial<FastWebBrief>) => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function StepBusiness({
  brief,
  onPatch,
  onUpload,
  uploading,
}: StepBusinessProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-bold text-[#0F4C5C]">کمتر از ۳ دقیقه تا دیدن دمو</p>
        <h1 className="text-2xl font-bold">بیایید سایت واقعی کسب‌وکارتان را بسازیم</h1>
        <p className="mt-2 text-sm text-slate-600 leading-7">
          هرچه بیشتر بنویسید، سایت دقیق‌تری برایتان می‌سازیم. درباره کسب‌وکار،
          مخاطب، خدمات یا محصولات و حال‌وهوای دلخواه توضیح دهید؛ در صورت تمایل
          تصویر، لوگو یا فایل نمونه (PDF) هم اضافه کنید.
        </p>
      </div>

      <Field
        label="نام کسب‌وکار"
        value={brief.businessName || ""}
        onChange={(v) => onPatch({ businessName: v })}
        placeholder="مثلاً کافه رسپینا"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="حوزه فعالیت"
          value={brief.industry || ""}
          onChange={(v) => onPatch({ industry: v })}
          placeholder="مثلاً کلینیک پوست، کافه"
        />
        <Field
          label="شهر یا محدوده"
          value={brief.city || ""}
          onChange={(v) => onPatch({ city: v })}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-medium text-slate-700">
          برای بهترین نتیجه این‌ها را بنویسید:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "نوع کسب‌وکار",
            "مخاطب اصلی",
            "محصولات یا خدمات",
            "رنگ و حال‌وهوا",
            "بخش‌های موردنیاز",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Field
        label="توضیح کسب‌وکار"
        value={brief.shortDescription || ""}
        onChange={(v) => onPatch({ shortDescription: v })}
        textarea
        placeholder="مثلاً: می‌خواهم فروشگاه آنلاین لباس مردانه داشته باشم. مخاطب اصلی آقایان ۲۰ تا ۴۰ سال..."
      />

      <Field
        label="مهم‌ترین دلیل انتخاب شما (اختیاری اما مهم)"
        value={brief.mainAdvantage || ""}
        onChange={(v) => onPatch({ mainAdvantage: v })}
        placeholder="مثلاً: مشاوره اولیه رایگان، مواد اورجینال و تضمین رضایت"
        hint="این جمله در پیام اصلی و بخش‌های اعتمادساز دمو استفاده می‌شود."
      />

      <Field
        label="خدمات یا محصولات اصلی (اختیاری)"
        value={brief.offerings || ""}
        onChange={(v) => onPatch({ offerings: v })}
        textarea
        placeholder="هر مورد در یک خط"
      />

      <div>
        <p className="text-sm font-medium">افزودن فایل (اختیاری)</p>
        <p className="mt-1 text-xs text-slate-500">
          بهترین عکس واقعی کسب‌وکار، لوگو یا PDF — حداکثر ۱۰ مگابایت
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm hover:border-slate-300">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f);
                e.target.value = "";
              }}
            />
            {uploading ? "در حال آپلود..." : "انتخاب فایل"}
          </label>
          {brief.attachmentName ? (
            <div className="flex flex-wrap items-center gap-2">
              {brief.attachmentUrl &&
              /\.(avif|gif|jpe?g|png|webp)$/i.test(brief.attachmentName || "") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brief.attachmentUrl}
                  alt="تصویر انتخاب‌شده برای دمو"
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : null}
              <span className="max-w-[200px] truncate text-xs text-slate-600">
                {brief.attachmentName}
              </span>
              {/\.(avif|gif|jpe?g|png|webp)$/i.test(brief.attachmentName) ? (
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {[
                    { id: "hero" as const, label: "عکس اصلی سایت" },
                    { id: "logo" as const, label: "لوگو" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onPatch({ attachmentKind: option.id })}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                        brief.attachmentKind === option.id
                          ? "bg-white text-[#0F4C5C] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">چند نمونه برای شروع:</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXAMPLE_PROMPTS.map((text) => (
            <button
              key={text.slice(0, 24)}
              type="button"
              onClick={() => onPatch({ shortDescription: text })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-right text-xs leading-6 text-slate-600 hover:border-[#0F4C5C]/40 hover:bg-teal-50/50"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
