"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";
import StickyMobileCta from "./home/StickyMobileCta";

// Renders public-site chrome (ChatWidget) only on non-admin routes.
// /ai محصول مستقل است — ویجت چت سایت اصلی نباید روی آن بیاید.
// /seo چت‌بات اختصاصی سئو دارد (SeoChatWidget) — ویجت عمومی نباید بیاید.
// /website صفحات صنعت‌محور با sticky CTA اختصاصی دارند — ویجت عمومی تداخل ایجاد می‌کند.
// /doctors چت‌بات اختصاصی پزشکان دارد (DoctorsChatWidget) — ویجت عمومی نباید بیاید.
// /demo نمونه‌سایت‌های دموی فروش هستند — ویجت سایت اصلی روی آن‌ها گیج‌کننده است.
// /b/* کارت ویزیت آنلاین — BizcardChatWidget اختصاصی دارد.
export default function PublicOnlyChrome() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/seo") ||
    pathname.startsWith("/website") ||
    pathname.startsWith("/doctors") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/b/")
  )
    return null;
  return (
    <>
      <ChatWidget />
      {pathname === "/" ? <StickyMobileCta /> : null}
    </>
  );
}
