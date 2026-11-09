import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Referrer-Policy", value: "no-referrer" },
    ];
    return [
      { source: "/vip/:path*", headers },
      { source: "/admin/:path*", headers },
      { source: "/api/loyalty/:path*", headers },
      { source: "/api/admin/loyalty/:path*", headers },
    ];
  },
};
export default nextConfig;
