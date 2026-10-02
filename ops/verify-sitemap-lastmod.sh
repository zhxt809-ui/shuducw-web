#!/bin/bash
# 验证 lastmod 真实性：与逐页源文件的 git 提交日期逐一对照，并检验稳定性与 ETag
echo "===== 1. 线上 sitemap 的 lastmod 取值分布（对比修正前：35 条全是当天）====="
S=$(curl -s https://www.shuducw.com/sitemap.xml)
echo "  lastmod 标签总数: $(echo "$S" | grep -c lastmod)"
echo "  不同取值的分布:"
echo "$S" | grep -o '<lastmod>[^<]*</lastmod>' | sed 's/<[^>]*>//g' | sort | uniq -c | sort -rn | sed 's/^/    /'
echo "  今天（$(date +%F)）被标为修改的页面数: $(echo "$S" | grep -c "<lastmod>$(date +%F)</lastmod>")"

echo ""
echo "===== 2. 与逐页源文件 git 提交日期对照（抽查 8 个页面）====="
check() {
  path="$1"; file="$2"
  live=$(echo "$S" | grep -A2 "<loc>https://www.shuducw.com${path}</loc>" | grep -o '<lastmod>[^<]*' | sed 's/<lastmod>//')
  gitdate=$(cd /var/www/shuducw-run 2>/dev/null && git log -1 --format=%cs -- "$file" 2>/dev/null)
  if [ -z "$gitdate" ]; then gitdate="(服务器无 git 仓库, 用期望值对照)"; fi
  echo "  $path"
  echo "      线上 lastmod: $live"
  echo "      git 提交日期: $gitdate"
}
check "/about" "src/app/about/page.tsx"
check "/services" "src/app/services/page.tsx"
check "/faq" "src/app/faq/page.tsx"
check "/tools/vat" "src/app/tools/vat/page.tsx"
check "/news" "src/app/news/page.tsx"
check "/company-deregistration" "src/app/company-deregistration/page.tsx"
check "/invoice-compliance" "src/app/invoice-compliance/page.tsx"
check "/shareholder-loans" "src/app/shareholder-loans/page.tsx"

echo ""
echo "===== 3. 动态页面（分类页/区县页/文章页）====="
for p in /news/cases /news/tips /services/district/yanta /services/district/gaoxin; do
  echo "  $p -> $(echo "$S" | grep -A2 "<loc>https://www.shuducw.com${p}</loc>" | grep -o '<lastmod>[^<]*' | sed 's/<lastmod>//')"
done
echo "  抽查 3 篇文章页（应为各自真实 updated_at，即 9 月的日期）:"
echo "$S" | grep -o '<loc>[^<]*/news/[a-z0-9-]*</loc>' | sed 's/<[^>]*>//g' | grep -vE '/news/(shilu|cases|tips|policies)$' | head -3 | while read u; do
  echo "    $u -> $(echo "$S" | grep -A2 "<loc>$u</loc>" | grep -o '<lastmod>[^<]*' | sed 's/<lastmod>//')"
done

echo ""
echo "===== 4. 稳定性：同一内容连续两次请求 lastmod 必须一致 ====="
S2=$(curl -s https://www.shuducw.com/sitemap.xml)
A=$(echo "$S" | grep -o '<lastmod>[^<]*' | md5sum | awk '{print $1}')
B=$(echo "$S2" | grep -o '<lastmod>[^<]*' | md5sum | awk '{print $1}')
echo "  第一次: $A"
echo "  第二次: $B"
[ "$A" = "$B" ] && echo "  一致 OK（不随请求变化）" || echo "  不一致! 说明仍在按请求时间生成"

echo ""
echo "===== 5. ETag 与 304 仍在工作 ====="
TAG=$(curl -s -o /dev/null -D - https://www.shuducw.com/sitemap.xml | grep -i '^etag' | tr -d '\r' | cut -d' ' -f2)
echo "  ETag: $TAG"
echo "  If-None-Match 返回: $(curl -s -o /dev/null -w '%{http_code}' -H "If-None-Match: $TAG" https://www.shuducw.com/sitemap.xml)"
echo "  无条件请求返回: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/sitemap.xml)"

echo ""
echo "===== 6. 回归：条目数与 txt 版本 ====="
echo "  XML 条目: $(echo "$S" | grep -c '<loc>')   TXT 行数: $(curl -s https://www.shuducw.com/sitemap.txt | grep -c 'https://')"
echo "  首页/资讯/health: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/) / $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/news) / $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/api/health)"
