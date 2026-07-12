import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutPageContent from "@/components/about/AboutPageContent";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "درباره آرایه | راهکارهای دیجیتال برای رشد کسب‌وکار",
  description:
    "آرایه مجموعه‌ای از راهکارهای دیجیتال می‌سازد تا کسب‌وکارها بهتر دیده شوند، درخواست مشتری بگیرند و ارتباط با مشتری را منظم‌تر پیگیری کنند.",
  alternates: {
    canonical: canonicalUrl("/about"),
  },
  openGraph: {
    title: "درباره آرایه | راهکارهای دیجیتال برای رشد کسب‌وکار",
    description:
      "آرایه مجموعه‌ای از راهکارهای دیجیتال می‌سازد تا کسب‌وکارها بهتر دیده شوند، درخواست مشتری بگیرند و ارتباط با مشتری را منظم‌تر پیگیری کنند.",
    url: "/about",
    type: "website",
    locale: "fa_IR",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar solid />
      <main className="overflow-x-clip">
        <AboutPageContent />
      </main>
      <Footer />
    </>
  );
}
