import { NextRequest, NextResponse } from 'next/server';

// 管理 API 服务端鉴权（2026-09-06 新增，修复"后台 API 无鉴权"漏洞）
// 客户端调用管理 API 时，须在请求头携带 x-admin-token，与服务端环境变量 ADMIN_API_PASSWORD 比对。
// 该密钥仅在服务端读取（不使用 NEXT_PUBLIC_ 前缀，避免进入前端打包）。
// 安全默认：未配置 ADMIN_API_PASSWORD 时，一律拒绝管理操作（fail closed）。
const SECRET = process.env.ADMIN_API_PASSWORD;

export function isAdminAuthorized(request: NextRequest): boolean {
  if (!SECRET) return false;
  const token = request.headers.get('x-admin-token');
  return token === SECRET;
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: '未授权：缺少或错误的访问令牌' }, { status: 401 });
}
