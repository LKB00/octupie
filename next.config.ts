import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev-only Next.js badge away from the sidebar account menu.
  devIndicators: { position: "bottom-right" },
  // Cache Components is off while the app runs on a mutable in-memory mock store:
  // every signed-in page renders per request (see app/(app)/layout.tsx).
  images: {
    // Mock thumbnails come from picsum.photos and profile photos from randomuser.me. Real thumbnails
    // will come from Supabase Storage, at which point optimisation can be switched back on.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
};

export default nextConfig;
