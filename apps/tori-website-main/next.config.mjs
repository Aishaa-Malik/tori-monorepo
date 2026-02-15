/** @type {import('next').NextConfig} */

// Use local port for development, Vercel URL for production
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://tori-dashboard.vercel.app';

const nextConfig = {
  async rewrites() {
    return [
      // 1. Pages
      { source: '/login', destination: `${DASHBOARD_URL}/login` },
      { source: '/dashboard/:path*', destination: `${DASHBOARD_URL}/dashboard/:path*` },
      { source: '/services/:path*', destination: `${DASHBOARD_URL}/services/:path*` },
      
      // 2. Folder Mappings (Assets)
      { source: '/js/:path*', destination: `${DASHBOARD_URL}/js/:path*` },
      { source: '/css/:path*', destination: `${DASHBOARD_URL}/css/:path*` },
      { source: '/public/images/:path*', destination: `${DASHBOARD_URL}/public/images/:path*` },
      { source: '/static/:path*', destination: `${DASHBOARD_URL}/static/:path*` },

      // 3. Root File Mappings (Scripts & Images)
      { source: '/features.js', destination: `${DASHBOARD_URL}/features.js` },
      { source: '/hero.js', destination: `${DASHBOARD_URL}/hero.js` },
      { source: '/hero-intro.js', destination: `${DASHBOARD_URL}/hero-intro.js` },
      { source: '/hero-intro-text.js', destination: `${DASHBOARD_URL}/hero-intro-text.js` },
      // { source: '/images/parkyoga.png', destination: `${DASHBOARD_URL}/images/parkyoga.png` },
      { source: '/COMINGSOON.png', destination: `${DASHBOARD_URL}/COMINGSOON.png` },
    ]
  },
};

export default nextConfig;