/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/services/:path*',
        destination: 'https://vercel-frontend2-taupe.vercel.app/services/:path*', 
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://vercel-frontend2-taupe.vercel.app/dashboard/:path*',
      },
    ]
  },
}

module.exports = nextConfig