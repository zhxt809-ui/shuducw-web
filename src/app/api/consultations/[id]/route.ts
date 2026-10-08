import { NextRequest, NextResponse } from 'next/server';
import { updateConsultationStatus, deleteConsultation, listConsultations } from '@/lib/store';
import { isAdminAuthorized, unauthorized } from '@/lib/admin-auth';

const ALLOWED_STATUS = ['pending', 'contacted', 'closed'] as const;
type ConsultationStatus = (typeof ALLOWED_STATUS)[number];

// PATCH /api/consultations/[id] — 更新跟进状态（需管理鉴权）
// 说明：后台此前只显示状态、没有任何接口能改，导致记录永远停在 pending（2026-10-08 补）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdminAuthorized(request)) {
      return unauthorized();
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: '无效的咨询记录 ID' }, { status: 400 });
    }

    const body = await request.json();
    const status = String(body.status ?? '') as ConsultationStatus;
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { error: `状态只能是 ${ALLOWED_STATUS.join(' / ')}` },
        { status: 400 }
      );
    }

    const data = await updateConsultationStatus(numericId, status);
    if (!data) {
      return NextResponse.json({ error: '咨询记录不存在' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /api/consultations/[id] PATCH error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/consultations/[id] — 删除咨询记录（需管理鉴权）
// 仅在确认要删除时使用；删除前会把该条记录原样回传，便于误删后从响应内容恢复。
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdminAuthorized(request)) {
      return unauthorized();
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: '无效的咨询记录 ID' }, { status: 400 });
    }

    const before = (await listConsultations(1000)).find((c) => c.id === numericId);
    const ok = await deleteConsultation(numericId);
    if (!ok) {
      return NextResponse.json({ error: '咨询记录不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: before ?? null });
  } catch (err) {
    console.error('API /api/consultations/[id] DELETE error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
