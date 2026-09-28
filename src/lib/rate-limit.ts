import { NextRequest } from 'next/server';

// ---- 表单防刷（2026-09 新增）：蜜罐 + 进程内限流 ----
// 说明：限流记录仅保存在进程内存中，不落盘、不采集/存储访客 IP，
// 重启后自动重置；适用于 PM2 单进程部署场景。
// 由 /api/consultations 与 /api/consultations/mini 共用。

type RateEntry = { timestamps: number[] };
const rateMap = new Map<string, RateEntry>();

export const LIMITS = {
  perIpMax: 5,               // 同 IP 每小时最多 5 条
  perIpWindowMs: 60 * 60 * 1000,
  perPhoneMax: 3,            // 同电话每天最多 3 条
  perPhoneWindowMs: 24 * 60 * 60 * 1000,
  minIntervalMs: 5 * 1000,   // 同 IP 提交最小间隔 5 秒
};
const RATE_MAP_MAX_KEYS = 5000;

export function hitLimit(key: string, max: number, windowMs: number, now: number): boolean {
  let entry = rateMap.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateMap.set(key, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  entry.timestamps.push(now);
  return entry.timestamps.length > max;
}

// 取真实客户端 IP（Nginx 反代场景：x-forwarded-for 首个地址）
export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

// 防止内存无限增长：超过阈值时清理过期记录
export function pruneRateMap(): void {
  if (rateMap.size <= RATE_MAP_MAX_KEYS) return;
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < LIMITS.perIpWindowMs);
    if (entry.timestamps.length === 0) rateMap.delete(key);
  }
}
