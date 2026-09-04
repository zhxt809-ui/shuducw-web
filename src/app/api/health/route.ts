import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/store';

export async function GET() {
  try {
    const health = await healthCheck();
    return NextResponse.json({
      status: health.status,
      backend: health.backend,
      dataDir: health.dataDir,
      tables: {
        articles: health.articlesFile ? 'ok' : 'missing',
        consultations: health.consultationsFile ? 'ok' : 'missing',
      },
      counts: {
        articles: health.articlesCount,
        consultations: health.consultationsCount,
      },
    });
  } catch (err) {
    console.error('API /api/health error:', err);
    return NextResponse.json(
      {
        status: 'degraded',
        backend: 'file',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
