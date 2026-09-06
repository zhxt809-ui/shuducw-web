import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized, unauthorized } from '@/lib/admin-auth';

// POST /api/auth/check — 校验管理密码（登录）
// 客户端将用户输入的密码放在 x-admin-token 头，服务端与 ADMIN_API_PASSWORD 比对。
// 2026-09-06 新增：替代原先"密码打进前端包 + 纯前端比对"的弱校验。
export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return unauthorized();
  }
  return NextResponse.json({ ok: true });
}
