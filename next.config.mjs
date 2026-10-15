/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    allowedDevOrigins: ["192.168.100.106", "localhost"],
  },
};

export default nextConfig;
