#!/bin/bash
# 核准当前时间 + 最近 7 天各引擎抓取实况（避免用陈旧窗口下结论）
echo "===== 0. 服务器当前时间 ====="
date '+  %Y-%m-%d %H:%M:%S %Z'
echo "  北京时间: $(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')"

cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
echo "  日志范围: $(head -1 "$TMP" | awk '{print $4}') → $(tail -1 "$TMP" | awk '{print $4}')"

echo ""
echo "===== 1. 最近 7 天各引擎/爬虫抓取量（排除我方 IP）====="
for ua in Googlebot bingbot Baiduspider 360Spider YisouSpider Sogou Bytespider GPTBot ClaudeBot OAI-SearchBot Applebot meta-externalagent DoubaoBot; do
  n=$(grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | wc -l)
  last=$(grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | tail -1 | awk '{print $4}')
  printf "  %-20s %6s 次   最后: %s\n" "$ua" "$n" "${last:-—}"
done

echo ""
echo "===== 2. bingbot 最近抓取（最后 10 次，含状态码）====="
grep -i 'bingbot' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | tail -10 | awk '{print "    " $1, $4, $7, $9}'

echo ""
echo "===== 3. 各引擎抓过的【内容页】数量（判断是否真在读内容）====="
for ua in bingbot Baiduspider Googlebot 360Spider Bytespider; do
  n=$(grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$7 ~ /^\/(news|services|about|faq|contact|tools|self-check|shareholder|invoice|social|high-tech|company)/' | awk '{print $7}' | sort -u | wc -l)
  printf "  %-14s 抓过的不同内容页: %s 个\n" "$ua" "$n"
done

echo ""
echo "===== 4. 10-02 之后（我们做完修复以后）各引擎首次/末次抓取 ====="
for ua in bingbot Baiduspider Googlebot Bytespider; do
  first=$(grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$4 ~ /0[3-9]\/Oct\/2026/' | head -1 | awk '{print $4, $7}')
  cnt=$(grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$4 ~ /0[3-9]\/Oct\/2026/' | wc -l)
  printf "  %-14s 10-03 之后共 %s 次；首次: %s\n" "$ua" "$cnt" "${first:-（无）}"
done

echo ""
echo "===== 5. 头条/字节侧：验证文件与 sitemap 是否仍被读取 ====="
grep -i 'bytespider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$4 ~ /0[3-9]\/Oct\/2026/' | awk '{print "    " $1, $4, $7, $9}' | tail -10
echo "  10-03 之后 Bytespider 请求数: $(grep -i 'bytespider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$4 ~ /0[3-9]\/Oct\/2026/' | wc -l)"
rm -f "$TMP"
