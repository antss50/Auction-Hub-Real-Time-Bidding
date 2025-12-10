//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.daugiavietnam.com', // Domain ảnh đấu giá
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Domain ảnh bài viết (backend local)
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http', // Lỗi của bạn đang báo là http
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // Thêm luôn https cho chắc chắn
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', 
      },
    ]
  },
};

module.exports = nextConfig;
