#!/bin/bash
# 逐条核验豆包给出的"旧版 .html 失联清单"与"www/非 www 并存"提醒
# 方法：不跟随跳转看真实状态码，再跟随跳转看落点；并用 nginx 日志找"外部到底有没有请求过这些旧 URL"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

echo "===== 1. 豆包清单中每个旧 URL 的真实状态码（不跟随跳转 / 跟随跳转）====="
printf "  %-22s %-8s %-8s %s\n" "路径" "原始码" "跟随码" "跳转落点"
for p in /index.html /about.html /intro.html /company.html /guanyu.html \
         /service.html /services.html /products.html /fuwu.html \
         /price.html /pricing.html /news.html /case.html /cases.html \
         /contact.html /contactus.html /liuyan.html /honor.html /team.html \
         /join.html /baike.html /404.html; do
  raw=$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" "https://www.shuducw.com$p")
  fin=$(curl -sL -o /dev/null -w '%{http_code}|%{url_effective}' -A "$UA" "https://www.shuducw.com$p")
  printf "  %-22s %-8s %-8s %s\n" "$p" "$raw" "${fin%%|*}" "${fin#*|}"
done

echo ""
echo "===== 2. 核验豆包的"两套域名并存"提醒（逐种协议+主机组合）====="
printf "  %-40s %-8s %s\n" "URL" "状态码" "落点"
for u in http://shuducw.com/ https://shuducw.com/ http://www.shuducw.com/ https://www.shuducw.com/ \
         http://shuducw.com/about http://www.shuducw.com/about https://shuducw.com/about; do
  r=$(curl -s -o /dev/null -w '%{http_code}|%{redirect_url}' -A "$UA" "$u")
  printf "  %-40s %-8s %s\n" "$u" "${r%%|*}" "${r#*|}"
done

echo ""
echo "===== 3. 决定性证据：nginx 日志里有没有任何来源请求过 .html 旧路径 ====="
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
echo "  日志窗口: $(head -1 "$TMP" | awk '{print $4}') → $(tail -1 "$TMP" | awk '{print $4}')"
echo "  （排除我方 IP 8.152.3.67 / 85.149.220.12）"
echo ""
echo "  所有对 *.html 的请求（除验证文件）:"
grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | grep -vE 'BingSiteAuth|ByteDanceVerify|google[0-9a-f]+\.html' | awk '{print "    " $1, $4, $7, $9}' | head -20
echo "  合计: $(grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | grep -vE 'BingSiteAuth|ByteDanceVerify|google[0-9a-f]+\.html' | wc -l) 次"
echo ""
echo "  这些 .html 请求里，专门的爬虫有哪些:"
grep -E 'GET [^ ]*\.html' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | grep -oiE 'baiduspider|bingbot|googlebot|360spider|sogou|bytespider|yisouspider|semrushbot|ahrefsbot|petalbot' | sort | uniq -c | sed 's/^/    /'
echo "  （空 = 没有任何搜索引擎爬虫请求过 .html 旧路径）"

echo ""
echo "===== 4. 标准链接核查：canonical 与 og:url 是否统一指向 www ====="
for u in https://www.shuducw.com/ https://www.shuducw.com/about https://www.shuducw.com/news/xian-jinshui4-fengkong-zicha-2026; do
  echo "  ▸ $u"
  curl -s -A "$UA" "$u" | grep -oE '<link rel="canonical" href="[^"]+"|<meta property="og:url" content="[^"]+"' | head -2 | sed 's/^/      /'
done
rm -f "$TMP"
