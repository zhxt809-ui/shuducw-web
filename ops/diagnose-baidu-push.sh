#!/bin/bash
# 查我们自己的百度推送自动化到底推了什么 URL + 验证重定向链
echo "===== 1. crontab ====="
crontab -l 2>/dev/null | sed 's/^/    /'

echo ""
echo "===== 2. 百度推送脚本内容（关键：它推哪些 URL）====="
for f in $(crontab -l 2>/dev/null | grep -oE '/[^ ]*\.(sh|py|js|mjs)' | sort -u); do
  echo "  ▸ $f"
  sed -n '1,60p' "$f" 2>/dev/null | sed 's/^/      /'
  echo "  ---- 以上为 $f 前 60 行 ----"
done

echo ""
echo "===== 3. 找仓库里的百度推送脚本 ====="
ls -la /var/www/shuducw-run/ops/content/ 2>/dev/null | sed 's/^/    /'
find /var/www/shuducw-run -maxdepth 3 -iname '*baidu*' 2>/dev/null | head -10 | sed 's/^/    /'

echo ""
echo "===== 4. 重定向链验证（http/https × www/裸域）====="
for u in "http://shuducw.com/" "https://shuducw.com/" "http://www.shuducw.com/" "https://www.shuducw.com/"; do
  echo "  ▸ $u"
  curl -s -o /dev/null -w '      最终: %{http_code}  %{url_effective}  (跳转 %{num_redirects} 次)\n' -L --max-redirs 5 "$u"
  curl -s -o /dev/null -w '      首跳: %{http_code} → %{redirect_url}\n' "$u"
done
