import { NextRequest, NextResponse } from 'next/server';
import { listConsultations, countConsultations, createConsultation } from '@/lib/store';
import { isAdminAuthorized, unauthorized } from '@/lib/admin-auth';
import { getClientIp, hitLimit, pruneRateMap, LIMITS } from '@/lib/rate-limit';

// GET /api/consultations — 获取咨询记录列表（含客户电话，需管理鉴权）
export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) {
      return unauthorized();
    }

    const [data, total] = await Promise.all([listConsultations(100), countConsultations()]);
    return NextResponse.json({ data, total });
  } catch (err) {
    console.error('API /api/consultations GET error:', err);
    return NextResponse.json({ data: [], total: 0 });
  }
}

// POST /api/consultations — 提交咨询
// 2026-09 安全加固：服务端强校验（电话格式/长度上限）+ 蜜罐字段 + 限流，防脏数据与垃圾灌入
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, phone, content, website } = body;

    // 蜜罐：隐藏字段被机器人自动填充时静默丢弃（返回成功但不入库）
    if (website && String(website).trim() !== '') {
      return NextResponse.json({ success: true, message: '咨询已提交' });
    }

    const now = Date.now();
    const ip = getClientIp(request);
    pruneRateMap();

    // 同 IP 最短提交间隔（挡脚本连发）
    if (hitLimit(`ip-fast:${ip}`, 1, LIMITS.minIntervalMs, now)) {
      return NextResponse.json({ error: '提交过于频繁，请稍后再试' }, { status: 429 });
    }
    // 同 IP 每小时限 5 条
    if (hitLimit(`ip:${ip}`, LIMITS.perIpMax, LIMITS.perIpWindowMs, now)) {
      return NextResponse.json({ error: '提交过于频繁，请稍后再试，或直接拨打 029-84556877 咨询' }, { status: 429 });
    }

    if (!company_name || !phone || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const name = String(company_name).trim();
    const phoneStr = String(phone).trim();
    const contentStr = String(content).trim();

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json({ error: '企业名称长度需在 2-50 字之间' }, { status: 400 });
    }
    if (!/^[\d\-+\s]{7,20}$/.test(phoneStr)) {
      return NextResponse.json({ error: '请输入有效的联系电话' }, { status: 400 });
    }
    if (contentStr.length < 5 || contentStr.length > 500) {
      return NextResponse.json({ error: '咨询内容长度需在 5-500 字之间' }, { status: 400 });
    }

    // 同电话每天限 3 条（在字段校验通过后再计数，避免垃圾数据占用额度）
    if (hitLimit(`phone:${phoneStr}`, LIMITS.perPhoneMax, LIMITS.perPhoneWindowMs, now)) {
      return NextResponse.json({ error: '该电话今日提交次数已达上限，请直接拨打 029-84556877 咨询' }, { status: 429 });
    }

    await createConsultation({
      company_name: name,
      phone: phoneStr,
      content: contentStr,
    });

    return NextResponse.json({ success: true, message: '咨询已提交' });
  } catch (err) {
    console.error('API /api/consultations POST error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
