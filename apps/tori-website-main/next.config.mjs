/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/services/:path*',
        destination: 'https://tori-dashboard.vercel.app/:path*', 
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://tori-dashboard.vercel.app/:path*',
      },
    ]
  },
};

export default nextConfig;