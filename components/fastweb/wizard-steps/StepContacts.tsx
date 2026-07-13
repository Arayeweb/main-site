"use client";

import type { FastWebBrief } from "@/lib/fastweb";
import Field from "./Field";

interface StepContactsProps {
  brief: FastWebBrief;
  onPatch: (patch: Partial<FastWebBrief>) => void;
  onPatchContacts: (patch: NonNullable<FastWebBrief["contacts"]>) => void;
}

export default function StepContacts({
  brief,
  onPatch,
  onPatchContacts,
}: StepContactsProps) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اطلاعات تماس و رسمی کسب‌وکار</h1>
        <p className="mt-2 text-sm text-slate-600 leading-7">
          این اطلاعات در فوتر سایت، صفحه تماس و در صورت نیاز برای فاکتور رسمی
          استفاده می‌شود. فیلدهای رسمی اختیاری‌اند؛ اگر فعلاً ندارید خالی
          بگذارید.
        </p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
        <p className="text-sm font-semibold text-slate-800">راه‌های تماس</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="شماره تماس *"
            value={brief.contacts?.phone || ""}
            onChange={(v) => onPatchContacts({ phone: v })}
            placeholder="0912..."
          />
          <Field
            label="واتساپ"
            value={brief.contacts?.whatsapp || ""}
            onChange={(v) => onPatchContacts({ whatsapp: v })}
          />
          <Field
            label="اینستاگرام"
            value={brief.contacts?.instagram || ""}
            onChange={(v) => onPatchContacts({ instagram: v })}
            placeholder="@username"
          />
          <Field
            label="ساعت کاری"
            value={brief.contacts?.hours || ""}
            onChange={(v) => onPatchContacts({ hours: v })}
          />
        </div>
        <Field
          label="آدرس"
          value={brief.contacts?.address || ""}
          onChange={(v) => onPatchContacts({ address: v })}
          textarea
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="لینک نقشه"
            value={brief.contacts?.locationUrl || ""}
            onChange={(v) => onPatchContacts({ locationUrl: v })}
          />
          <Field
            label="ایمیل"
            value={brief.contacts?.email || ""}
            onChange={(v) => onPatchContacts({ email: v })}
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
        <p className="text-sm font-semibold text-slate-800">اطلاعات رسمی (اختیاری)</p>
        <Field
          label="نام حقوقی / نام سایت"
          value={brief.legalName || ""}
          onChange={(v) => onPatch({ legalName: v })}
        />
        <Field
          label="شناسه ملی یا کد ملی"
          value={brief.nationalId || ""}
          onChange={(v) => onPatch({ nationalId: v })}
          placeholder="۱۰ یا ۱۱ رقم"
          hint="شرکت‌ها: شناسه ملی ۱۱ رقمی — اشخاص: کد ملی ۱۰ رقمی"
        />
        <Field
          label="شماره ثبت شرکت (اختیاری)"
          value={brief.companyRegistrationNumber || ""}
          onChange={(v) => onPatch({ companyRegistrationNumber: v })}
        />
        <Field
          label="کد پستی (اختیاری)"
          value={brief.postalCode || ""}
          onChange={(v) => onPatch({ postalCode: v })}
          hint="۱۰ رقم — برای دریافت نماد اعتماد الکترونیکی (اینماد)"
        />
        <Field
          label="نماد اعتماد الکترونیکی — اینماد"
          value={brief.enamadUrl || ""}
          onChange={(v) => onPatch({ enamadUrl: v })}
          placeholder="https://trustseal.enamad.ir/?id=...&Code=..."
          hint="لینک یا کد نماد از enamad.ir — برای فروشگاه آنلاین الزامی است"
        />
        <Field
          label="نماد ساماندهی (اختیاری)"
          value={brief.samandehiUrl || ""}
          onChange={(v) => onPatch({ samandehiUrl: v })}
          placeholder="https://logo.samandehi.ir/..."
        />
        <Field
          label="شبکه‌های اجتماعی (اختیاری)"
          value={brief.socialLinksRaw || ""}
          onChange={(v) => onPatch({ socialLinksRaw: v })}
          placeholder="لینک اینستاگرام، تلگرام، واتساپ..."
        />
      </div>
    </section>
  );
}
