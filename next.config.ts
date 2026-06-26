import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * - `reactStrictMode` surfaces side-effect bugs early.
 * - `serverActions.bodySizeLimit` is raised to support document/file uploads
 *   routed through Server Actions (e.g. employee documents, payslips).
 * - `images.remotePatterns` whitelists the Supabase Storage host so avatars and
 *   documents can be rendered with `next/image`. Replace the host placeholder
 *   with your project ref before deploying.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  // Fail the production build on type or lint errors instead of silently shipping.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
