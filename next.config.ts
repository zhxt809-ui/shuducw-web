import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  // 输出 standalone 模式，便于在 2核2G 轻量服务器上直接部署（无需额外 Node 框架）
  output: 'standalone',
};

export default nextConfig;
