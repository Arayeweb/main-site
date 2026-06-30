/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // صفحات استاتیک از public/ سرو می‌شوند؛ این rewriteها مسیرهای تمیز می‌سازند.
    return [
      { source: "/", destination: "/index.html" },
      { source: "/about", destination: "/about.html" },
      { source: "/clinic", destination: "/clinic.html" },
      { source: "/doctors", destination: "/doctors.html" },
      { source: "/restaurant", destination: "/restaurant.html" },
      { source: "/support", destination: "/support.html" },
      { source: "/admin", destination: "/admin.html" },
      { source: "/sales", destination: "/sales.html" },
      { source: "/results", destination: "/results.html" },
      { source: "/cases", destination: "/results.html" },
      { source: "/portfolio", destination: "/portfolio.html" },
      { source: "/software", destination: "/software.html" },
      { source: "/hamkari", destination: "/hamkari.html" },
      { source: "/spaces", destination: "/spaces.html" },
      { source: "/googlesabt", destination: "/googlesabt.html" },
      { source: "/google-sabt", destination: "/googlesabt.html" },
      { source: "/googlesabt-simple", destination: "/googlesabt-simple.html" },
      { source: "/seo", destination: "/seo.html" },
      { source: "/bizcard", destination: "/bizcard.html" },
      { source: "/bizcard-gen", destination: "/bizcard-gen.html" },
      { source: "/shortener", destination: "/shortener.html" },
      { source: "/qr", destination: "/qr.html" },
      { source: "/konkour", destination: "/konkour.html" },
      { source: "/privacy", destination: "/privacy.html" },
      { source: "/tashakor", destination: "/tashakor.html" },
      // بلاگ (قابل سرو روی subdomain یا مسیر /blog)
      { source: "/blog", destination: "/blog/index.html" },
      { source: "/blog/posts/:slug", destination: "/blog/posts/:slug.html" },
    ];
  },
};

module.exports = nextConfig;
