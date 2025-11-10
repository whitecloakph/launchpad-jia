/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure webpack to handle ES modules properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for isomorphic-dompurify and jsdom ES module issues
      config.externals.push({
        'jsdom': 'commonjs jsdom',
        'parse5': 'commonjs parse5'
      });
    }
    return config;
  },
};

module.exports = nextConfig;
