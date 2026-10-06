import { NextRequest, NextResponse } from 'next/server';
import { createConsultation } from '@/lib/store';
import { getClientIp, hitLimit, pruneRateMap, LIMITS } from '@/lib/rate-limit';

// 极简留资弹窗接口（2026-09-20 新增）：
// 字段：企业类型（白名单）+ 咨询问题（白名单）+ 手机号（强校验）
// 与完整表单共用同一套进程内限流与蜜罐防刷，键前缀 mini- 区分

const BUSINESS_TYPES = ['个体户', '小微企业', '一般纳税人企业', '高新技术企业', '集团/多主体企业', '其他'];
const QUESTION_TOPICS = ['代理记账报税', '税务异常处理', '乱账清理', '财税合规体检', '内部审计', '股权架构税务', '其他问题'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_type, question, phone, website } = body;

    // 蜜罐：隐藏字段被机器人自动填充时静默丢弃（返回成功但不入库）
    if (website && String(website).trim() !== '') {
      return NextResponse.json({ success: true, message: '咨询已提交' });
    }

    const now = Date.now();
    const ip = getClientIp(request);
    pruneRateMap();

    // 同 IP 最短提交间隔
    if (hitLimit(`mini-ip-fast:${ip}`, 1, LIMITS.minIntervalMs, now)) {
      return NextResponse.json({ error: '提交过于频繁，请稍后再试' }, { status: 429 });
    }
    // 同 IP 每小时限 5 条
    if (hitLimit(`mini-ip:${ip}`, LIMITS.perIpMax, LIMITS.perIpWindowMs, now)) {
      return NextResponse.json({ error: '提交过于频繁，请稍后再试，或直接拨打 029-88456877 咨询' }, { status: 429 });
    }

    const typeStr = String(business_type || '').trim();
    const questionStr = String(question || '').trim();
    const phoneStr = String(phone || '').trim();

    // 白名单校验（防注入/防脏数据）
    if (!BUSINESS_TYPES.includes(typeStr)) {
      return NextResponse.json({ error: '请选择有效的企业类型' }, { status: 400 });
    }
    if (!QUESTION_TOPICS.includes(questionStr)) {
      return NextResponse.json({ error: '请选择有效的咨询问题' }, { status: 400 });
    }
    if (!/^[\d\-+\s]{7,20}$/.test(phoneStr)) {
      return NextResponse.json({ error: '请输入有效的联系电话' }, { status: 400 });
    }

    // 同电话每天限 3 条
    if (hitLimit(`mini-phone:${phoneStr}`, LIMITS.perPhoneMax, LIMITS.perPhoneWindowMs, now)) {
      return NextResponse.json({ error: '该电话今日提交次数已达上限，请直接拨打 029-88456877 咨询' }, { status: 429 });
    }

    await createConsultation({
      company_name: typeStr,
      phone: phoneStr,
      content: `【极简留资】咨询问题：${questionStr}`,
    });

    return NextResponse.json({ success: true, message: '咨询已提交' });
  } catch (err) {
    console.error('API /api/consultations/mini POST error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
