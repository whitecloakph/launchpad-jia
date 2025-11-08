// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the function that defines custom HTTP headers for all pages.
  async headers() {
    return [
      {
        // Apply this header to all routes (which is necessary for the login flow)
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            // This value resolves the Firebase popup issue by allowing 
            // the main window to interact with the cross-origin login popup.
            value: 'same-origin-allow-popups', 
          },
        ],
      },
    ]
  },
  
  // You can add other Next.js specific configurations here in the future.
  // Example: i18n: { locales: ['en'], defaultLocale: 'en' },
};

module.exports = nextConfig;