/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add any image domains you might use in the future
  },
  // Environment variables that should be available on the client
  env: {
    APP_NAME: "Taxbot",
  },
  // You can add custom webpack config if needed
  webpack: (config, { isServer }) => {
    // Custom webpack config
    return config;
  },
};

module.exports = nextConfig;
