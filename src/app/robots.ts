import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'www.shuducw.com';
  // 确保 siteUrl 不包含重复的 https://
  const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;

  return {
    rules: [
      {
        // 主流搜索引擎爬虫
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Baiduspider',
          'Sogou',
          '360Spider',
          'Bytespider',
          'YandexBot',
        ],
        allow: ['/'],
        disallow: ['/admin/', '/api/'],
      },
      {
        // AI 大模型爬虫 - 允许抓取公开内容
        userAgent: [
          'GPTBot',           // OpenAI
          'ChatGPT-User',     // OpenAI ChatGPT
          'Google-Extended',  // Google AI 训练
          'GoogleOther',      // Google AI
          'ClaudeBot',        // Anthropic
          'Claude-User',      // Anthropic Claude
          'Applebot-Extended',// Apple AI
          'CCBot',            // Common Crawl
          'PerplexityBot',    // Perplexity
          'YouBot',           // You.com
          'KimiBot',          // 月之暗面 Kimi
          'DoubaoBot',        // 豆包（字节跳动）
          'ByteSpider',       // 字节跳动 AI
          'QianfanBot',       // 百度文心/千帆
          'Baidu-AI',         // 百度 AI
          'TongyiBot',        // 阿里通义千问
          'QwenBot',          // 阿里通义千问
          'DeepSeekBot',      // DeepSeek
          'DeepSeek-Spider',  // DeepSeek 爬虫
          'ZhipuBot',         // 智谱清言
          'GLMBot',           // 智谱 GLM
          'YiBot',            // 零一万物
          'MiniMaxBot',       // MiniMax 海螺
        ],
        allow: ['/'],
        disallow: ['/admin/', '/api/'],
      },
      {
        // 其他爬虫
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
