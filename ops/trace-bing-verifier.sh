#!/bin/bash
# 查清 85.149.220.12 的身份（是否为 Bing 验证服务），以及验证过程的完整时间线
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"

echo "===== 1. 85.149.220.12 的完整请求记录（含 UA）====="
grep '^85.149.220.12' "$TMP" | tail -20

echo ""
echo "===== 2. 反查该 IP ====="
python3 -c "
import socket
for ip in ['85.149.220.12']:
    try: print('  %s -> %s' % (ip, socket.gethostbyaddr(ip)[0]))
    except Exception as e: print('  %s -> (无 PTR: %s)' % (ip, e))
"

echo ""
echo "===== 3. 该 IP 的 UA 汇总 ====="
grep '^85.149.220.12' "$TMP" | grep -oE '"[^"]*"$' | sort | uniq -c | sed 's/^/    /'

echo ""
echo "===== 4. /BingSiteAuth.xml 全部访问记录（区分我方与外部）====="
grep 'BingSiteAuth' "$TMP" | awk '{print "    " $1, $4, $9}' | sort -k2 | tail -20

echo ""
echo "===== 5. 今天(10-02)所有非我方 IP 的请求（看是否有 Bing 验证/抓取）====="
grep '02/Oct/2026' "$TMP" | grep -v '^8.152.3.67' | awk '{print $1}' | sort | uniq -c | sort -rn | head -15 | sed 's/^/    /'

echo ""
echo "===== 6. 今天非我方 IP 抓取的具体 URL（前 30）====="
grep '02/Oct/2026' "$TMP" | grep -v '^8.152.3.67' | awk '{print $1, $7, $9}' | sort | uniq -c | sort -rn | head -30 | sed 's/^/    /'
rm -f "$TMP"
