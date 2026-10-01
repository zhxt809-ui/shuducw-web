#!/bin/bash
# 百度验证文件部署验证：文件存在、权限正确、内容字节一致、HTTP 200
NEW="baidu_verify_codeva-g1bYVrbUdM.html"
OLD="baidu_verify_codeva-t1LOLMCF42.html"
DIR="/var/www/shuducw-run/public"

echo "===== 1. 服务器文件状态 ====="
ls -l "$DIR/$NEW" "$DIR/$OLD" 2>&1

echo ""
echo "===== 2. 服务器上文件内容与 sha256（应为 1833be75c2f9f98c91ea78b323e5c7de）====="
echo -n "  内容: "; cat "$DIR/$NEW"; echo ""
echo -n "  字节数: "; wc -c < "$DIR/$NEW"
echo -n "  sha256: "; sha256sum "$DIR/$NEW" | awk '{print $1}'

echo ""
echo "===== 3. HTTP 访问（百度将从这里校验）====="
for u in "https://www.shuducw.com/$NEW" "https://shuducw.com/$NEW" "http://www.shuducw.com/$NEW"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -L "$u")
  ct=$(curl -s -o /dev/null -w '%{content_type}' -L "$u")
  echo "  $u -> HTTP $code  ($ct)"
done

echo ""
echo "===== 4. 线上返回内容与本地文件是否字节一致 ====="
curl -s "https://www.shuducw.com/$NEW" -o /tmp/dl.html
echo -n "  线上 sha256: "; sha256sum /tmp/dl.html | awk '{print $1}'
echo -n "  本地 sha256: "; sha256sum "$DIR/$NEW" | awk '{print $1}'
if [ "$(sha256sum /tmp/dl.html | awk '{print $1}')" = "$(sha256sum "$DIR/$NEW" | awk '{print $1}')" ]; then
  echo "  一致 OK（内容未被编码转换或添加换行）"
else
  echo "  不一致! 需检查是否有 BOM/换行被改动"
fi
echo -n "  线上内容: "; cat /tmp/dl.html; echo ""
rm -f /tmp/dl.html

echo ""
echo "===== 5. 回归：原有百度验证文件仍然可用 ====="
echo "  /$OLD -> HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/$OLD)"

echo ""
echo "===== 6. robots.txt 是否允许抓取该验证文件（应允许）====="
curl -s https://www.shuducw.com/robots.txt | grep -iE '^(Disallow|Allow|Sitemap)' | sort -u | sed 's/^/  /'

echo ""
echo "===== 7. 站点回归 ====="
for p in / /about /contact /sitemap.xml /sitemap.txt; do
  echo "  $p -> HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com$p)"
done
