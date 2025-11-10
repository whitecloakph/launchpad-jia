/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure webpack to handle ES modules properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude jsdom from server bundle to prevent ES module errors
      config.resolve.alias = {
        ...config.resolve.alias,
        'jsdom': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
