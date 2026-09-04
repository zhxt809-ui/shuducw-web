import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端（兼容 Coze 沙箱和 Vercel 环境）
 *
 * 环境变量：
 * - NEXT_PUBLIC_SUPABASE_URL / COZE_SUPABASE_URL：Supabase 项目 URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY / COZE_SUPABASE_ANON_KEY：Supabase 匿名密钥
 * - SUPABASE_SERVICE_ROLE_KEY / COZE_SUPABASE_SERVICE_ROLE_KEY：服务端密钥（可选）
 */
export function getSupabaseClient(token?: string): SupabaseClient {
  if (supabaseInstance && !token) {
    return supabaseInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase 环境变量未配置。请在 Vercel 项目设置中添加 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

  let key: string;
  if (token) {
    key = anonKey;
  } else {
    key = serviceRoleKey ?? anonKey;
  }

  const globalOptions: Record<string, string> = {};
  if (token) {
    globalOptions.Authorization = `Bearer ${token}`;
  }

  const client = createClient(url, key, {
    global: { headers: globalOptions },
    db: { timeout: 60000 },
  });

  if (!token) {
    supabaseInstance = client;
  }

  return client;
}

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;
  return !!(url && anonKey);
}
