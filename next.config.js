/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/b/:slug",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
  async rewrites() {
    // صفحات استاتیک از public/ سرو می‌شوند؛ این rewriteها مسیرهای تمیز می‌سازند.
    return [
      // Homepage is now served by Next.js app/page.tsx
      { source: "/about", destination: "/about.html" },
      { source: "/clinic", destination: "/clinic.html" },
      // /doctors از Next.js (app/doctors/page.tsx) سرو می‌شود — rewrite حذف شد
      { source: "/restaurant", destination: "/restaurant.html" },
      { source: "/support", destination: "/support.html" },
      // /admin handled by Next.js app router (app/admin/*) — legacy admin.html removed
      { source: "/sales", destination: "/sales.html" },
      { source: "/results", destination: "/results.html" },
      { source: "/cases", destination: "/results.html" },
      { source: "/portfolio", destination: "/portfolio.html" },
      { source: "/software", destination: "/software.html" },
      { source: "/hamkari", destination: "/hamkari.html" },
      // /googlesabt از Next.js (app/googlesabt/page.tsx) سرو می‌شود — rewrite حذف شد
      { source: "/google-sabt", destination: "/googlesabt" },
      { source: "/googlesabt-simple", destination: "/googlesabt-simple.html" },
      // /seo از Next.js (app/seo/page.tsx) سرو می‌شود — rewrite حذف شد
      // /bizcard از Next.js (app/bizcard/page.tsx) سرو می‌شود — rewrite حذف شد
      { source: "/bizcard-gen", destination: "/bizcard-gen.html" },
      { source: "/shortener", destination: "/shortener.html" },
      { source: "/qr", destination: "/qr.html" },
      { source: "/privacy", destination: "/privacy.html" },
      { source: "/tashakor", destination: "/tashakor.html" },
      // بلاگ (قابل سرو روی subdomain یا مسیر /blog)
      { source: "/blog", destination: "/blog/index.html" },
      { source: "/blog/posts/:slug", destination: "/blog/posts/:slug.html" },
    ];
  },
};

module.exports = nextConfig;
