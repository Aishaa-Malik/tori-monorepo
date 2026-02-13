/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/services/:path*',
        // Replace this with your actual dashboard URL once it's deployed
        destination: 'https://vercel-frontend2-taupe.vercel.app/services/:path*', 
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://vercel-frontend2-taupe.vercel.app/dashboard/:path*',
      },
    ]
  },
};

// Use "export default" instead of "module.exports"
export default nextConfig;