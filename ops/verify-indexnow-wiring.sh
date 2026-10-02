#!/bin/bash
# 部署后验证：IndexNow 集成是否真的进了构建产物 + 站点回归
echo "===== 1. 构建产物里是否包含 IndexNow 提交逻辑（证明代码已生效，不只是源码里写了）====="
cd /var/www/shuducw-run || exit 1
HITS=$(grep -rl "api.indexnow.org" .next/server 2>/dev/null | head -5)
if [ -n "$HITS" ]; then
  echo "  找到引用 api.indexnow.org 的服务端文件:"
  echo "$HITS" | sed 's/^/    /'
else
  echo "  ❌ 未在 .next/server 中找到 api.indexnow.org —— 集成没有进构建产物"
fi
echo ""
echo "  9c615d0ffcf44fd4a1c860a302b08850（IndexNow 公钥）出现文件数: $(grep -rl '9c615d0ffcf44fd4a1c860a302b08850' .next/server 2>/dev/null | wc -l)"

echo ""
echo "===== 2. 文章接口回归（发布链路没被改坏）====="
echo "  GET /api/articles?is_published=true: HTTP $(curl -s -o /dev/null -w '%{http_code}' 'https://www.shuducw.com/api/articles?is_published=true&limit=1')"
echo "  GET /api/articles（未鉴权，应 401/403）: HTTP $(curl -s -o /dev/null -w '%{http_code}' 'https://www.shuducw.com/api/articles')"
echo "  /api/health: HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/api/health)"

echo ""
echo "===== 3. 站点回归 ====="
echo "  首页: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/)"
echo "  资讯: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/news)"
echo "  sitemap.xml: $(curl -s https://www.shuducw.com/sitemap.xml | grep -c '<loc>') 条"
echo "  BingSiteAuth.xml: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/BingSiteAuth.xml)"
echo "  ByteDanceVerify.html: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/ByteDanceVerify.html)"

echo ""
echo "===== 4. PM2 进程与近期错误日志 ====="
pm2 list 2>/dev/null | grep -E "shuducw|name" | sed 's/^/    /'
echo "  最近 10 行错误日志:"
pm2 logs shuducw --err --lines 10 --nostream 2>/dev/null | tail -10 | sed 's/^/    /'

echo ""
echo "===== 5. 是否有 IndexNow 提交日志（说明服务端真跑过）====="
pm2 logs shuducw --lines 200 --nostream 2>/dev/null | grep -i "IndexNow" | tail -5 | sed 's/^/    /'
echo "  （若为空：说明部署后还没有发布动作触发提交，属正常）"
