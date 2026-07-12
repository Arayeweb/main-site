import { Suspense } from "react";
import type { Metadata } from "next";
import FastWebWizard from "@/components/fastweb/FastWebWizard";

export const metadata: Metadata = {
  title: "ساخت سایت فوری | آرایه",
  description:
    "ویزارد ساخت سایت معرفی کسب‌وکار — پیش‌نمایش رایگان قبل از پرداخت.",
  robots: { index: false, follow: false },
};

export default function FastWebNewPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center bg-[#F4F7F8]"
          dir="rtl"
        >
          در حال بارگذاری…
        </div>
      }
    >
      <FastWebWizard />
    </Suspense>
  );
}
