/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  images: {
    // Allow unsplash and other common hosts used in examples
    domains: [
      "images.unsplash.com",
      "cdn.jsdelivr.net",
      "your-storage-domain.com"
    ],
    // OR (recommended) use remotePatterns for more flexible matching:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
