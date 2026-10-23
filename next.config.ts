import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 安全收紧（2026-10-22）：站点只使用本地图片（next/image 仅 /qr-wecom.png），
  // 不再允许 /_next/image 代理任意外部 https 图（原 hostname:'*' 构成 SSRF/图片处理攻击面，
  // 对应 2026-10-14 Next.js 安全更新 GHSA-2464-fhr4-w9xw / CVE-2026-96889 的加固）。
  images: {
    remotePatterns: [],
  },
  // 输出 standalone 模式，便于在 2核2G 轻量服务器上直接部署（无需额外 Node 框架）
  output: 'standalone',
};

export default nextConfig;
