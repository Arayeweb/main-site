import { Suspense } from "react";
import type { Metadata } from "next";
import BizcardOwnerEditor from "@/components/bizcard/BizcardOwnerEditor";

export const metadata: Metadata = {
  title: "پنل ویرایش کارت ویزیت | آرایه",
  robots: { index: false, follow: false },
};

type PageProps = { params: { slug: string } };

export default function BizcardOwnerDashboardPage({ params }: PageProps) {
  const slug = (params.slug || "").toLowerCase().trim();

  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-[#F4F7F8]"
          dir="rtl"
        >
          در حال بارگذاری…
        </div>
      }
    >
      <BizcardOwnerEditor slug={slug} />
    </Suspense>
  );
}
