import { NextRequest, NextResponse } from 'next/server';
import { listArticles, countArticles, createArticle, slugExists } from '@/lib/store';

// GET /api/articles — 获取文章列表
// 查询参数: category, is_published, limit, offset
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const category = searchParams.get('category') || undefined;
    const isPublishedParam = searchParams.get('is_published');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const publishedOnly = isPublishedParam === null || isPublishedParam === undefined || isPublishedParam === ''
      ? undefined
      : isPublishedParam === 'true';

    const [data, total] = await Promise.all([
      listArticles({
        category,
        publishedOnly,
        limit,
        offset,
      }),
      countArticles({ category, publishedOnly }),
    ]);

    return NextResponse.json({ data, total, limit, offset });
  } catch (err) {
    console.error('API /api/articles GET error:', err);
    return NextResponse.json({ data: [], total: 0, limit: 20, offset: 0 });
  }
}

// POST /api/articles — 创建文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, slug, category, summary, content, cover_image, is_published, sort_order } = body;

    if (!title || !slug || !category || !content) {
      return NextResponse.json({ error: '缺少必填字段: title, slug, category, content' }, { status: 400 });
    }

    if (await slugExists(String(slug))) {
      return NextResponse.json({ error: 'slug 已存在，请更换唯一标识' }, { status: 409 });
    }

    const article = await createArticle({
      title: String(title),
      slug: String(slug),
      category: String(category),
      summary: summary ? String(summary) : null,
      content: String(content),
      cover_image: cover_image ? String(cover_image) : null,
      is_published: Boolean(is_published),
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      published_at: is_published ? new Date().toISOString() : null,
    });

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (err) {
    console.error('API /api/articles POST error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
