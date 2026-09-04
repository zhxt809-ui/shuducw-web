import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, slugExists } from '@/lib/store';

// GET /api/articles/[id] — 获取单篇文章
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
    }

    const data = await getArticleById(numericId);
    if (!data) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /api/articles/[id] GET error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PUT /api/articles/[id] — 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
    }

    const body = await request.json();

    // slug 唯一性检查（排除自身）
    if (body.slug !== undefined && (await slugExists(String(body.slug), numericId))) {
      return NextResponse.json({ error: 'slug 已存在，请更换唯一标识' }, { status: 409 });
    }

    const patch: Record<string, unknown> = {};
    const allowedFields = ['title', 'slug', 'category', 'summary', 'content', 'cover_image', 'is_published', 'sort_order'] as const;
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        patch[field] = body[field];
      }
    }

    // 首次发布时设置 published_at
    if (body.is_published === true) {
      const existing = await getArticleById(numericId);
      if (existing && !existing.published_at) {
        patch.published_at = new Date().toISOString();
      }
    }

    const data = await updateArticle(numericId, patch);
    if (!data) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /api/articles/[id] PUT error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/articles/[id] — 删除文章
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
    }

    const ok = await deleteArticle(numericId);
    if (!ok) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API /api/articles/[id] DELETE error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
