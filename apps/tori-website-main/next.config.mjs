/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/login',
        destination: 'https://tori-dashboard.vercel.app/login',
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://tori-dashboard.vercel.app/dashboard/:path*',
      },
      {
        source: '/onboarding',
        destination: 'https://tori-dashboard.vercel.app/onboarding',
      },
      {
        source: '/healthwellness-dashboard/:path*',
        destination: 'https://tori-dashboard.vercel.app/healthwellness-dashboard/:path*',
      },
      // Keep your services directory if it's also in the dashboard
      {
        source: '/services/:path*',
        destination: 'https://tori-dashboard.vercel.app/services/:path*',
      }
    ]
  },
};

export default nextConfig;