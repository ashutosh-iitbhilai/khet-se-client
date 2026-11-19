import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for small Docker images (see client/Dockerfile).
  output: 'standalone',
  // Lets a production build run alongside `next dev` without overwriting its .next folder:
  //   NEXT_DIST_DIR=.next-build npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  // Production on one address: serve the API under this site's /api by proxying to the API
  // server (e.g. API_PROXY_TARGET=http://127.0.0.1:5050 with NEXT_PUBLIC_API_URL=/api).
  // Set at build time. Next forwards the client's IP in X-Forwarded-For for rate limiting.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
    return target ? [{ source: '/api/:path*', destination: `${target}/api/:path*` }] : [];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Optimised variants are reused for a week (source photos rarely change).
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Catalogue photography (freely licensed, see server/src/scripts/catalogue.data.ts)
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  async headers() {
    return [
      {
        // Site and catalogue photos are not content-hashed, so cache for a week (not "immutable").
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
