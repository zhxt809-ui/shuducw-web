#!/bin/bash
# 头条搜索/字节侧取证：Bytespider 抓了什么、头条验证是否真的来过、有无豆包等 UA
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"

echo "===== 1. 字节系爬虫总量（排除我方 IP）====="
for ua in Bytespider ByteSpider Toutiao toutiao Doubao DoubaoBot ByteDance bytedance so.toutiao; do
  n=$(grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | wc -l)
  echo "  $ua: $n"
done

echo ""
echo "===== 2. Bytespider 抓过的 URL（排除我方）====="
grep -i 'bytespider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print $7}' | sort | uniq -c | sort -rn | head -20 | sed 's/^/    /'

echo ""
echo "===== 3. Bytespider 来源 IP 反查身份 ====="
for ip in $(grep -i 'bytespider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print $1}' | sort -u | head -6); do
  echo -n "  $ip -> "
  python3 -c "
import socket
try: print(socket.gethostbyaddr('$ip')[0])
except Exception: print('(无 PTR)')
"
done

echo ""
echo "===== 4. 头条验证文件 /ByteDanceVerify.html 的全部访问（区分我方与外部）====="
grep 'ByteDanceVerify' "$TMP" | awk '{print "    " $1, $4, $9}' | tail -12
echo "  外部 IP 访问次数: $(grep 'ByteDanceVerify' "$TMP" | grep -vcE '^(8\.152\.3\.67|85\.149\.220\.12) ')"

echo ""
echo "===== 5. 今天(10-02) 所有非我方请求的来源 IP（看有没有字节/头条/微软/百度）====="
grep '02/Oct/2026' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print $1}' | sort | uniq -c | sort -rn | head -12 | sed 's/^/    /'

echo ""
echo "===== 6. 今天的 UA 汇总（非我方）====="
grep '02/Oct/2026' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | grep -oE '"[^"]*"$' | sort | uniq -c | sort -rn | head -12 | sed 's/^/    /'
rm -f "$TMP"
