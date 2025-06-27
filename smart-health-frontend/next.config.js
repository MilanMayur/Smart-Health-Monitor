//next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /*async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/:path*', // <- your NestJS backend
      },
    ];
  },*/
};

module.exports = nextConfig;
