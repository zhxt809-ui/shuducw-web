import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { found: false, slug, message: '文章不存在' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      found: true,
      slug,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        is_published: article.is_published,
        published_at: article.published_at,
        created_at: article.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: '服务器异常',
        detail: err instanceof Error ? err.message : String(err),
        slug,
      },
      { status: 500 }
    );
  }
}
