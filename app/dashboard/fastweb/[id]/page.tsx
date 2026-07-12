import { Suspense } from "react";
import type { Metadata } from "next";
import FastWebOrderDashboard from "@/components/fastweb/FastWebOrderDashboard";

export const metadata: Metadata = {
  title: "داشبورد سفارش سایت فوری | آرایه",
  robots: { index: false, follow: false },
};

type PageProps = { params: { id: string } };

export default function FastWebDashboardPage({ params }: PageProps) {
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
      <FastWebOrderDashboard orderId={params.id} />
    </Suspense>
  );
}
