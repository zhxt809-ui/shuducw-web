/* eslint-disable no-console */
/**
 * 数据层功能验证脚本（本地文件存储）
 * 运行: npx tsx scripts/verify-store.ts
 */
import {
  listArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  createConsultation,
  listConsultations,
  healthCheck,
  slugExists,
} from '../src/lib/store';

async function main() {
  console.log('=== 数据层功能验证 ===\n');

  // 1. 健康检查
  const health = await healthCheck();
  console.log('[1] healthCheck:', health.status, '| 文章数:', health.articlesCount, '| 咨询数:', health.consultationsCount);
  if (health.status !== 'ok') throw new Error('健康检查失败');

  // 2. 创建文章
  const article = await createArticle({
    title: '西安代理记账多少钱？2025年费用标准详解',
    slug: 'xian-daili-jizhang-fee-2025',
    category: 'tips',
    summary: '详解西安代理记账收费标准，小规模纳税人与一般纳税人费用差异。',
    content: '## 西安代理记账费用\n\n西安代理记账费用因企业类型而异……',
    cover_image: null,
    is_published: true,
    sort_order: 10,
    published_at: new Date().toISOString(),
  });
  console.log('[2] createArticle:', article.id, article.slug);
  if (article.id !== 1) throw new Error('ID 应从 1 开始');

  // 3. slug 唯一性
  const exists = await slugExists('xian-daili-jizhang-fee-2025');
  console.log('[3] slugExists:', exists);
  if (!exists) throw new Error('slug 唯一性检查失败');

  // 4. 按 slug 查询
  const found = await getArticleBySlug('xian-daili-jizhang-fee-2025');
  console.log('[4] getArticleBySlug:', found?.title);
  if (!found || found.category !== 'tips') throw new Error('按 slug 查询失败');

  // 5. 列表（应只有已发布的 1 篇）
  const list = await listArticles({ publishedOnly: true, limit: 10 });
  console.log('[5] listArticles:', list.length, '篇');
  if (list.length !== 1) throw new Error('列表查询失败');

  // 6. 更新文章
  const updated = await updateArticle(article.id, { title: '西安代理记账费用标准详解（2025）' });
  console.log('[6] updateArticle:', updated?.title);
  if (!updated || !updated.title.includes('2025')) throw new Error('更新失败');

  // 7. 未发布文章不出现在公开列表
  await updateArticle(article.id, { is_published: false });
  const listAfterUnpublish = await listArticles({ publishedOnly: true, limit: 10 });
  console.log('[7] 未发布后公开列表:', listAfterUnpublish.length, '篇');
  if (listAfterUnpublish.length !== 0) throw new Error('未发布文章不应出现在公开列表');
  await updateArticle(article.id, { is_published: true });

  // 8. 咨询提交与查询
  const consultation = await createConsultation({
    company_name: '西安测试科技有限公司',
    phone: '13800138000',
    content: '想咨询代理记账服务',
  });
  console.log('[8] createConsultation:', consultation.id, consultation.status);
  const consults = await listConsultations();
  console.log('    listConsultations:', consults.length, '条');
  if (consultation.status !== 'pending' || consults.length !== 1) throw new Error('咨询功能失败');

  // 9. 删除文章
  const deleted = await deleteArticle(article.id);
  console.log('[9] deleteArticle:', deleted);
  if (!deleted) throw new Error('删除失败');
  const afterDelete = await getArticleBySlug('xian-daili-jizhang-fee-2025');
  if (afterDelete) throw new Error('删除后仍能查到');
  console.log('    删除后按 slug 查询:', afterDelete);

  console.log('\n=== 全部验证通过 ===');
}

main().catch((err) => {
  console.error('\n❌ 验证失败:', err);
  process.exit(1);
});
