import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, slugExists } from '@/lib/store';
import { isAdminAuthorized, unauthorized } from '@/lib/admin-auth';
import { submitToIndexNow, articleUrl, categoryUrl } from '@/lib/indexnow';

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

// PUT /api/articles/[id] — 更新文章（需管理鉴权）
export async function PUT(
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

    // 更新前的快照：用于「首次发布时间」判定，以及 slug/分类变更时通知旧地址
    const before = await getArticleById(numericId);
    if (!before) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 首次发布时设置 published_at
    if (body.is_published === true && !before.published_at) {
      patch.published_at = new Date().toISOString();
    }

    const data = await updateArticle(numericId, patch);
    if (!data) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 变更即通知 Bing/Yandex 系重新抓取（单条流式提交，不阻塞响应）
    // 下架/改 slug 时，旧地址与旧分类列表页同样需要通知，否则 Bing 侧会保留过期内容
    const notifyUrls = [articleUrl(data.slug)];
    if (data.category) notifyUrls.push(categoryUrl(data.category));
    if (before.slug && before.slug !== data.slug) notifyUrls.push(articleUrl(before.slug));
    if (before.category && before.category !== data.category) notifyUrls.push(categoryUrl(before.category));
    void submitToIndexNow(notifyUrls);

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /api/articles/[id] PUT error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/articles/[id] — 删除文章（需管理鉴权）
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
      return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
    }

    const before = await getArticleById(numericId);
    const ok = await deleteArticle(numericId);
    if (!ok) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 删除后通知（Bing 官方第 9 节：内容永久移除时用 IndexNow 更新被删/变更的 URL）
    if (before) {
      const notifyUrls = [articleUrl(before.slug)];
      if (before.category) notifyUrls.push(categoryUrl(before.category));
      void submitToIndexNow(notifyUrls);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API /api/articles/[id] DELETE error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
