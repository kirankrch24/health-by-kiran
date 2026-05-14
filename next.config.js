/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/health-by-kiran',
  assetPrefix: '/health-by-kiran/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
