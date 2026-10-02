#!/bin/bash
# 核查字节/头条验证文件的实际状态（决定"是否已提交过"的判断）
echo "===== 1. ByteDanceVerify.html 线上可访问性 ====="
echo "  HTTP 状态: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/ByteDanceVerify.html)"
echo -n "  线上内容: "; curl -s https://www.shuducw.com/ByteDanceVerify.html; echo ""
echo -n "  内容类型: "; curl -s -o /dev/null -w '%{content_type}\n' https://www.shuducw.com/ByteDanceVerify.html
echo "  与本地一致性（本地 Rej+JakUyI7QGPqJJk/Q）: $(curl -s https://www.shuducw.com/ByteDanceVerify.html | grep -q 'Rej+JakUyI7QGPqJJk/Q' && echo 一致 || echo 不一致)"

echo ""
echo "===== 2. 谁访问过这个验证文件（若平台来校验过，会有记录） ====="
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"
grep -i 'ByteDanceVerify' "$ALL" | awk '{print "  " $1, $4, $7, $9}' | head -10
echo "  总请求次数: $(grep -ic 'ByteDanceVerify' "$ALL")"

echo ""
echo "===== 3. 该请求的来源 IP 归属（确认是否为字节官方校验）====="
for ip in $(grep -i 'ByteDanceVerify' "$ALL" | awk '{print $1}' | sort -u | head -5); do
  echo -n "  $ip -> "
  python3 -c "
import socket,sys
try: print(socket.gethostbyaddr('$ip')[0])
except Exception as e: print('(无 PTR 记录)')
"
done

echo ""
echo "===== 4. 其他验证文件的线上状态 ====="
for f in sogousiteverification.txt 9c615d0ffcf44fd4a1c860a302b08850.txt 81d494eacc771fbdb6f8d6faa3f8238b.txt BingSiteAuth.xml baidu_verify_codeva-g1bYVrbUdM.html; do
  echo "  /$f -> HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/$f)"
done

echo ""
echo "===== 5. Bytespider 是否抓取过 robots.txt（它在哪发现 sitemap 的）====="
grep -i 'bytespider' "$ALL" | grep -E '^1(10\.249|11\.225)\.|^122\.14\.' | awk '{print "  " $4, $7, $9}' | sort | uniq -c | sort -rn | head -10

rm -f "$ALL"
