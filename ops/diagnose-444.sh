#!/bin/bash
# 查清 444 是谁返回的、对谁返回、什么规则导致的（444 = nginx 直接掐断连接，多见于反扫描/限流规则）
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
MINE='^(8\.152\.3\.67|85\.149\.220\.12) '

echo "===== 1. 所有 444 请求按 UA 归类（看是不是只有扫描器）====="
awk '$9==444' "$TMP" | grep -vE "$MINE" | sed -E 's/.*"([^"]*)"$/\1/' | sort | uniq -c | sort -rn | head -15 | sed 's/^/  /'

echo ""
echo "===== 2. OAI-SearchBot / ChatGPT-User 收到 444 的具体记录 ====="
grep -iE 'oai-searchbot|chatgpt-user' "$TMP" | grep -vE "$MINE" | awk '$9==444 {print "  " $1, $4, $7, $9}' | head -15

echo ""
echo "===== 3. 这些 444 的来源 IP 是什么（判断是真实 OpenAI 还是伪装扫描器）====="
grep -iE 'oai-searchbot|chatgpt-user' "$TMP" | grep -vE "$MINE" | awk '$9==444 {print $1}' | sort | uniq -c | sort -rn | sed 's/^/  /'
for ip in $(grep -iE 'oai-searchbot|chatgpt-user' "$TMP" | awk '$9==444 {print $1}' | sort -u | head -4); do
  printf "  %-18s -> " "$ip"
  python3 -c "
import socket
try: print(socket.gethostbyaddr('$ip')[0])
except Exception: print('(no PTR)')
"
done

echo ""
echo "===== 4. 正常抓取（200）的 OAI-SearchBot 来源 IP 对比 ====="
grep -i 'oai-searchbot' "$TMP" | grep -vE "$MINE" | awk '$9==200 {print $1}' | sort | uniq -c | sort -rn | head -6 | sed 's/^/  /'

echo ""
echo "===== 5. nginx 里产生 444 的规则 ====="
grep -nE '444|limit_req|limit_conn|bad_bot|return 444' /etc/nginx/sites-enabled/shuducw /etc/nginx/conf.d/*.conf 2>/dev/null | sed 's/^/  /'
rm -f "$TMP"
