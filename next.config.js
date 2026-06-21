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
      { source: "/results", destination: "/results.html" },
      { source: "/cases", destination: "/results.html" },
      // بلاگ (قابل سرو روی subdomain یا مسیر /blog)
      { source: "/blog", destination: "/blog/index.html" },
      { source: "/blog/posts/:slug", destination: "/blog/posts/:slug.html" },
    ];
  },
};

module.exports = nextConfig;
