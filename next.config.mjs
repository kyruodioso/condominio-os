/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.themealdb.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['179.43.121.225:8080', 'localhost:3000'],
    },
  },
};

export default nextConfig;
