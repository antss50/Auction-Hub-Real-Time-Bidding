//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
        // Khai báo tên miền chứa hình ảnh bên ngoài
        domains: ['example.com'], 
    },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Thay cổng 3000 bằng cổng backend thực tế của bạn (ví dụ NestJS thường là 3000 hoặc 3333)
        destination: 'http://localhost:3000/api/:path*', 
      },
    ]
  },
};

module.exports = nextConfig;
