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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, phone, content } = body;

    if (!company_name || !phone || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    await createConsultation({
      company_name: String(company_name).trim(),
      phone: String(phone).trim(),
      content: String(content).trim(),
    });

    return NextResponse.json({ success: true, message: '咨询已提交' });
  } catch (err) {
    console.error('API /api/consultations POST error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
