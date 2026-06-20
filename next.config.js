/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // صفحات استاتیک از public/ سرو می‌شوند؛ این rewriteها مسیرهای تمیز می‌سازند.
    return [
      { source: "/", destination: "/index.html" },
      { source: "/clinic", destination: "/clinic.html" },
      { source: "/doctors", destination: "/doctors.html" },
      { source: "/restaurant", destination: "/restaurant.html" },
    ];
  },
};

module.exports = nextConfig;
