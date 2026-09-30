#!/bin/bash
B="https://www.shuducw.com"
echo "========== A. 可疑 URL 实际返回 =========="
for u in "/?utm_source=chatgpt.com" "/index%E6%95%B0%E5%BA%A6" "/index" "/index.html" "/article/detail-47023.html" "/article/detail-1.html" "/wp-admin/" "/admin.php" "/.env" "/phpinfo.php"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$B$u")
  size=$(curl -s --max-time 10 "$B$u" | wc -c)
  echo "  $u -> $code (${size}B)"
done

echo ""
echo "========== B. 首页是否被篡改（外链脚本检查） =========="
curl -s "$B/" > /tmp/home.html
echo "  页面字节数: $(wc -c < /tmp/home.html)"
echo "  外部 script src:"
grep -oE '<script[^>]+src="[^"]+"' /tmp/home.html | grep -oE 'src="[^"]+"' | sort -u | head -20
echo "  疑似注入关键词（赌博/药品/ dış 链接）:"
grep -ciE 'casino|viagra|porn|balenciaga|duilian|外围|博彩|澳門|威尼斯人' /tmp/home.html || echo "  0 处 ✓"

echo ""
echo "========== C. Nginx 日志：这些路径的访问来源 =========="
LOG="/var/log/nginx/access.log"
if [ -f "$LOG" ]; then
  echo "  --- /article/ 路径最近命中 ---"
  grep -E "GET /article/" "$LOG" | tail -8
  echo "  --- /index.html /index 数度 命中 ---"
  grep -E "GET /index(\.html|%E6%95%B0%E5%BA%A6)? " "$LOG" | tail -6
else
  echo "  $LOG 不存在，查找日志文件："
  ls -la /var/log/nginx/ 2>/dev/null | head -10
fi

echo ""
echo "========== D. 今日 top 访问 IP 与 404 比例 =========="
if [ -f "$LOG" ]; then
  TODAY=$(date +%d/%b/%Y)
  echo "  今日请求总数: $(grep -c "$TODAY" "$LOG")"
  echo "  今日 top 10 IP:"
  grep "$TODAY" "$LOG" | awk '{print $1}' | sort | uniq -c | sort -rn | head -10 | sed 's/^/    /'
  echo "  今日 404/444/403 数: $(grep "$TODAY" "$LOG" | grep -cE ' (404|444|403) ')"
fi
