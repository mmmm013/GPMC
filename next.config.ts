import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  /* GD, 2026-10-14: "Downloads ONLY from Gputnammusic.com." A full-song download is bought and handed
     over at gputnammusic.com/api/song-download; the payment and the file are kept by the same system
     that sells every song (k-kut.com), passed through here so the address is gputnammusic.com's own. */
  async rewrites() {
    return [
      { source: "/api/song-download", destination: "https://www.k-kut.com/api/song-download" },
      { source: "/api/song-download/:path*", destination: "https://www.k-kut.com/api/song-download/:path*" },
    ];
  },

};
export default nextConfig;
