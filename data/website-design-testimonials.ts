/**
 * فقط نظرهای تأییدشده مشتری — بدون ساختگی.
 * اگر آرایه خالی باشد، بخش «تجربه مشتریان» در صفحه نمایش داده نمی‌شود.
 */
export interface WebsiteDesignTestimonial {
  id: string;
  quote: string;
  name: string;
  projectType: string;
  href?: string;
  external?: boolean;
}

export const websiteDesignTestimonials: WebsiteDesignTestimonial[] = [
  {
    id: "pourdast",
    quote:
      "قبلاً بخش زیادی از هماهنگی نوبت‌ها به‌صورت دستی انجام می‌شد. بعد از راه‌اندازی سایت، بیماران در هر ساعتی می‌توانند خدمات را ببینند و برای نوبت اقدام کنند. برای من مهم بود که سایت تخصص و سابقه علمی‌ام را درست نشان بدهد و کارکردن با آن ساده باشد.",
    name: "دکتر عالیه پوردست",
    projectType: "طراحی سایت پزشکی",
    href: "https://aliehpourdast.com",
    external: true,
  },
  {
    id: "medisa",
    quote: "معمار هستم — سایت را خیلی سریع تحویل دادند و راضی بودم.",
    name: "مدیسا قاضی",
    projectType: "طراحی سایت نمونه‌کار",
    href: "/showcase/medisa-studio",
  },
];
