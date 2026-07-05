/** @type {import('next').NextConfig} */

const DASHBOARD_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://tori-dashboard.vercel.app';

const nextConfig = {
  compress: true,
  allowedDevOrigins: [
    '192.168.1.68',
    '192.168.1.68:3000',
    '192.168.1.68:3001',
    '192.168.1.68:3002',
  ],
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  async headers() {
    return [
      {
        source:
          '/:path*.:ext(png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Dashboard pages (website keeps its own routes, e.g. /privacy-policy)
      { source: '/login', destination: `${DASHBOARD_URL}/login` },
      { source: '/dashboard/:path*', destination: `${DASHBOARD_URL}/dashboard/:path*` },
      { source: '/services/:path*', destination: `${DASHBOARD_URL}/services/:path*` },
      { source: '/contact/:path*', destination: `${DASHBOARD_URL}/contact/:path*` },
      { source: '/about/:path*', destination: `${DASHBOARD_URL}/about/:path*` },
      { source: '/oauth/callback', destination: `${DASHBOARD_URL}/oauth/callback` },
      { source: '/payment-callback', destination: `${DASHBOARD_URL}/payment-callback` },
      { source: '/unauthorized', destination: `${DASHBOARD_URL}/unauthorized` },
      { source: '/update-password', destination: `${DASHBOARD_URL}/update-password` },
      { source: '/delete-account', destination: `${DASHBOARD_URL}/delete-account` },
      { source: '/terms.html', destination: `${DASHBOARD_URL}/terms.html` },
      { source: '/refund-policy', destination: `${DASHBOARD_URL}/refund-policy` },
      { source: '/onboarding', destination: `${DASHBOARD_URL}/onboarding` },
      { source: '/revenue/:path*', destination: `${DASHBOARD_URL}/revenue/:path*` },
      { source: '/employees/:path*', destination: `${DASHBOARD_URL}/employees/:path*` },
      { source: '/fitness-sports-dashboard/:path*', destination: `${DASHBOARD_URL}/fitness-sports-dashboard/:path*` },
      { source: '/tori-employee/:path*', destination: `${DASHBOARD_URL}/tori-employee/:path*` },

      // Dashboard static assets only — do NOT rewrite /images (website uses public/images)
      { source: '/js/:path*', destination: `${DASHBOARD_URL}/js/:path*` },
      { source: '/css/:path*', destination: `${DASHBOARD_URL}/css/:path*` },
      { source: '/static/:path*', destination: `${DASHBOARD_URL}/static/:path*` },
      { source: '/features.js', destination: `${DASHBOARD_URL}/features.js` },
      { source: '/hero.js', destination: `${DASHBOARD_URL}/hero.js` },
      { source: '/hero-intro.js', destination: `${DASHBOARD_URL}/hero-intro.js` },
      { source: '/hero-intro-text.js', destination: `${DASHBOARD_URL}/hero-intro-text.js` },
      { source: '/COMINGSOON.png', destination: `${DASHBOARD_URL}/COMINGSOON.png` },
    ];
  },
};

export default nextConfig;
