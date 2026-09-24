import type { SVGProps } from 'react';

// 小红书品牌图标（官方视觉：红底圆角方块 + 白色"笔记本书写"标识）
// 兼容 lucide 图标用法：size / className 属性
interface XiaohongshuIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function XiaohongshuIcon({ size = 22, ...props }: XiaohongshuIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      {/* 红底圆角方块 */}
      <rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="#FF2442" />
      {/* 白色笔记本书写标识 */}
      <path
        d="M8.5 6.9h5.3c.8 0 1.4.6 1.4 1.4v.8h.6c.8 0 1.4.6 1.4 1.4v4.9c0 .8-.6 1.4-1.4 1.4H8.5c-.8 0-1.4-.6-1.4-1.4V8.3c0-.8.6-1.4 1.4-1.4z"
        fill="#fff"
      />
      {/* 右上角书页折角 */}
      <path
        d="M15.7 7.2c-.3.5-.5 1.1-.5 1.7v.3h1.7c.6 0 1.1-.5 1.1-1.1v-.6c0-.3-.3-.5-.6-.5-.4 0-.8.1-1.1.2l-.6-.0z"
        fill="#fff"
      />
      {/* 上方圆点 */}
      <circle cx="16.9" cy="5.7" r="1" fill="#fff" />
    </svg>
  );
}
