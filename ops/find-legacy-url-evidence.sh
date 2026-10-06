#!/bin/bash
# 找出"到底哪些旧 .html 路径被真实请求过"（排除扫描器噪音），作为是否加 301 的证据
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
MINE='^(8\.152\.3\.67|85\.149\.220\.12) '

echo "===== 1. 所有 .html 请求按路径汇总（排除我方 IP）====="
grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE "$MINE" \
  | awk '{u=$7; sub(/\?.*/,"",u); print u}' | sort | uniq -c | sort -rn | head -25 | sed 's/^/    /'

echo ""
echo "===== 2. 其中"像旧站页面"的路径（排除漏洞扫描特征）====="
grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE "$MINE" \
  | grep -viE 'druid|/admin/|elrte|/html/ie\.html|phpmyadmin|\.env|\.git|setup|install|test\.html|shell|\.bak|wp-|config|backup|/tmp/|/vendor/' \
  | awk '{u=$7; sub(/\?.*/,"",u); print u, $1, $4, $9}' | sort | uniq -c | sort -rn | head -20 | sed 's/^/    /'

echo ""
echo "===== 3. 真实搜索引擎爬虫请求过的 .html 路径（含 UA 与状态码）====="
grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE "$MINE" | grep -iE 'baiduspider|bingbot|googlebot|360spider|sogou|bytespider|yisouspider|petalbot' \
  | grep -viE 'druid|/admin/|elrte|/html/ie\.html' \
  | awk '{u=$7; sub(/\?.*/,"",u); print u, $9, $1, $4}' | sort -u | head -25 | sed 's/^/    /'

echo ""
echo "===== 4. 是否有带 Referer 的 .html 请求（= 外部站点链接过来的证据）====="
grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE "$MINE" | awk -F'"' 'NF>=6 && $6 != "-" {print $6, $2, $7}' | head -15 | sed 's/^/    /'
echo "  带 Referer 的 .html 请求数: $(grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE "$MINE" | awk -F'"' 'NF>=6 && $6 != "-"' | wc -l)"

echo ""
echo "===== 5. 旧站存档线索：这一窗口内有没有请求过 .htm / .php / .asp（老站常见后缀）====="
for ext in htm php asp aspx shtml; do
  n=$(grep -E "GET [^ ]*\.$ext" "$TMP" | grep -vE "$MINE" | grep -viE 'druid|/admin/|\.env|\.git|phpmyadmin|wp-|setup|install|shell|\.bak|config|backup|xmlrpc|\.php\?' | wc -l)
  echo "    .$ext : $n 次"
done
grep -E 'GET [^ ]*\.(htm|php|asp)\b' "$TMP" | grep -vE "$MINE" \
  | grep -viE 'druid|/admin/|\.env|\.git|phpmyadmin|wp-|setup|install|shell|\.bak|config|backup|xmlrpc' \
  | awk '{u=$7; sub(/\?.*/,"",u); print u, $9}' | sort | uniq -c | sort -rn | head -10 | sed 's/^/    /'
rm -f "$TMP"
