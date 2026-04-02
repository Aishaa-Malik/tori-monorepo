/** @type {import('next').NextConfig} */

//const DASHBOARD_URL = 'http://localhost:3001/';
//'https://tori-dashboard.vercel.app' ||
// Use local port for development, Vercel URL for production
//const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://tori-dashboard.vercel.app';
//const DASHBOARD_URL = 'http://localhost:3001/';
const DASHBOARD_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://tori-dashboard.vercel.app';

//export { DASHBOARD_URL };


const nextConfig = {
    reactStrictMode: false, // ← disable during development

  async rewrites() {
    return [
      // 1. Pages
      { source: '/login', destination: `${DASHBOARD_URL}/login` },
      { source: '/dashboard/:path*', destination: `${DASHBOARD_URL}/dashboard/:path*` },
      { source: '/services/:path*', destination: `${DASHBOARD_URL}/services/:path*` },
      { source: '/contact/:path*', destination: `${DASHBOARD_URL}/contact/:path*` },
      { source: '/about/:path*', destination: `${DASHBOARD_URL}/about/:path*` },
      { source: '/oauth/callback', destination: `${DASHBOARD_URL}/oauth/callback` },
      { source: '/payment-callback', destination: `${DASHBOARD_URL}/payment-callback` },
      { source: '/unauthorized', destination: `${DASHBOARD_URL}/unauthorized` },
      { source: '/update-password', destination: `${DASHBOARD_URL}/update-password` },
      { source: '/privacy-policy', destination: `${DASHBOARD_URL}/privacy-policy` },
      { source: '/onboarding', destination: `${DASHBOARD_URL}/onboarding` },
      { source: '/revenue/:path*', destination: `${DASHBOARD_URL}/revenue/:path*` },
      { source: '/employees/:path*', destination: `${DASHBOARD_URL}/employees/:path*` },
      { source: '/healthwellness-dashboard/:path*', destination: `${DASHBOARD_URL}/healthwellness-dashboard/:path*` },
      
      // 2. Folder Mappings (Assets)
      { source: '/js/:path*', destination: `${DASHBOARD_URL}/js/:path*` },
      { source: '/css/:path*', destination: `${DASHBOARD_URL}/css/:path*` },
      { source: '/images/:path*', destination: `${DASHBOARD_URL}/images/:path*` },
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