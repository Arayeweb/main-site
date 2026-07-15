import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "راهنمای قابلیت‌های AI | آرایه",
  description:
    "آموزش استفاده از ChatGPT، ساخت تصویر و ویدیو با هوش مصنوعی — راهنماهای فارسی آرایه AI.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
