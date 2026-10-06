#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. HTML 体积前后对比（未压缩 / gzip 传输）====="
# 改前基线：/ 274820、/about 167059、/news 206597、/contact 126961、/self-check 94185、/cases 119501
printf "  %-12s %10s %10s %12s %12s\n" "页面" "改前" "改后" "改前传输" "改后传输"
declare -A BEFORE=( [/]=274820 [/about]=167059 [/news]=206597 [/contact]=126961 [/self-check]=94185 [/cases]=119501 )
for p in / /about /news /contact /self-check /cases; do
  raw=$(curl -s "$B$p" | wc -c)
  tx=$(curl -s -o /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip' "$B$p")
  printf "  %-12s %10s %10s %12s %12s\n" "$p" "${BEFORE[$p]}" "$raw" "-" "$tx"
done
echo ""
echo "===== 2. inspector 调试属性已清除 ====="
for p in / /about /news /contact; do
  n=$(curl -s "$B$p" | grep -o 'data-inspector-' | wc -l)
  echo "  $p -> $n 次（应 0）"
done
echo ""
echo "===== 3. 资源体积（应无变化或更小）====="
curl -s "$B/" -o /tmp/h.html
js_total=0
for src in $(grep -oE 'src="/_next/static/[^"]+\.js"' /tmp/h.html | sed 's/src="//;s/"//' | sort -u); do
  sz=$(curl -s -o /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip' "$B$src")
  js_total=$((js_total+sz))
done
css_total=0
for href in $(grep -oE 'href="/_next/static/[^"]+\.css"' /tmp/h.html | sed 's/href="//;s/"//' | sort -u); do
  sz=$(curl -s -o /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip' "$B$href")
  css_total=$((css_total+sz))
done
echo "  JS 传输: $((js_total/1024)) KB（改前 207 KB）"
echo "  CSS 传输: $((css_total/1024)) KB（改前 26 KB）"
echo ""
echo "===== 4. 内容完整性抽查（关键文案仍在）====="
check() { n=$(curl -s "$B$1" | grep -c "$2"); echo "  $1 含「$2」: $n"; }
check / "西安数度财务咨询"
check /about "陈文华"
check /about "营业执照"
check /contact "到店环境"
check /contact "029-88456877"
check /news/tips "财税知识"
check /self-check "账务风险"
check /shareholder-loans "股东"
echo ""
echo "===== 5. 页面回归 ====="
for p in / /about /services /services/basic /services/compliance /services/consulting /services/live-commerce /services/delivery /cases /news /news/tips /news/cases /faq /contact /self-check /shareholder-loans /privacy; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
echo ""
echo "===== 6. 结构化数据未受影响 ====="
for p in / /contact; do
  echo "  $p JSON-LD 块数: $(curl -s $B$p | grep -o 'application/ld+json' | wc -l)"
done
