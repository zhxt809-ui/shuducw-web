#!/bin/bash
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"

echo "===== 1. Baiduspider UA 的来源 IP 分布（区分真蜘蛛与伪 UA 扫描器）====="
grep "Baiduspider" "$ALL" | awk '{print $1}' | sort | uniq -c | sort -rn | head -8 | sed 's/^/  /'
echo ""
echo "  --- 探测敏感路径的 Baiduspider UA 来自哪些 IP ---"
grep "Baiduspider" "$ALL" | grep -E '\.env|server\.key|\.ssh|serviceAccountKey|values\.yaml|api/fs/exec|api/account|graphql|\.git' | awk '{print $1}' | sort | uniq -c | sort -rn | sed 's/^/  /'
echo ""
echo "  --- 抓首页的 Baiduspider UA 来自哪些 IP ---"
grep "Baiduspider" "$ALL" | grep -E 'GET / HTTP' | awk '{print $1}' | sort | uniq -c | sort -rn | head -5 | sed 's/^/  /'
echo ""
echo "  --- 抓内页的 Baiduspider UA 来自哪些 IP ---"
grep "Baiduspider" "$ALL" | grep -vE 'GET / HTTP|\.env|server\.key|\.ssh|values\.yaml|api/fs|api/account|graphql' | awk '{print $1, $7}' | sort | uniq -c | sort -rn | head -10 | sed 's/^/  /'
echo ""
echo "===== 2. HTTP 444（nginx 主动断连）来源 ====="
awk '$9==444 {print $1}' "$ALL" | sort | uniq -c | sort -rn | head -5 | sed 's/^/  /'
echo "  --- 444 的 UA ---"
awk '$9==444' "$ALL" | sed 's/.*" "//' | cut -c1-50 | sort | uniq -c | sort -rn | head -5 | sed 's/^/  /'
echo ""
echo "===== 3. 各真实搜索引擎蜘蛛的 IP 段（确认非伪造）====="
for ua in "Googlebot" "bingbot" "360Spider" "YandexBot"; do
  echo "  --- $ua TOP IP ---"
  grep "$ua" "$ALL" | awk '{print $1}' | sort | uniq -c | sort -rn | head -3 | sed 's/^/      /'
done
rm -f "$ALL"
