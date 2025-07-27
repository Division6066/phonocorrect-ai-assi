/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@phonocorrect-ai/common'],
  experimental: {
    externalDir: true,
  },
  output: 'standalone',
};

export default nextConfig;