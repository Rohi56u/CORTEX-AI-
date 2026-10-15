/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // In Next.js 14, allowedDevOrigins is experimental or root depending on patch version
  // We specify it cleanly
};

export default nextConfig;
