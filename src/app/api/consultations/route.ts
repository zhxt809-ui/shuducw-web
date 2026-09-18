import { NextRequest, NextResponse } from 'next/server';
import { listConsultations, countConsultations, createConsultation } from '@/lib/store';
import { isAdminAuthorized, unauthorized } from '@/lib/admin-auth';

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
// 2026-09 安全加固：服务端强校验（电话格式/长度上限），防脏数据与滥用
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, phone, content } = body;

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
