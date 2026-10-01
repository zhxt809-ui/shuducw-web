#!/bin/bash
# 排查豆包/字节系爬虫为何 0 抓取：先把所有可能的 UA 名字都查一遍
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"

echo "===== 1. 所有含 doubao / bytespider / bytedance / toutiao / tiktok 的 UA（大小写不敏感）====="
grep -iE 'doubao|bytespider|bytedance|toutiao|tiktok' "$ALL" | awk -F'"' '{print $6}' | sort | uniq -c | sort -rn | head -10 | sed 's/^/  /'
echo "  以上合计请求数: $(grep -icE 'doubao|bytespider|bytedance|toutiao|tiktok' "$ALL")"

echo ""
echo "===== 2. 逐一点名：各名字分别命中多少 ====="
for name in DoubaoBot doubao Doubao Bytespider bytespider ByteSpider ByteDanceSpider bytedance ToutiaoSpider TikTokSpider; do
  c=$(grep -c "$name" "$ALL")
  echo "  $name: $c"
done

echo ""
echo "===== 3. Bytespider 抓取的 URL 分布（去重，前 20）====="
grep -i 'bytespider' "$ALL" | awk '{print $7}' | sed 's/?.*//' | sort | uniq -c | sort -rn | head -20 | sed 's/^/  /'

echo ""
echo "===== 4. Bytespider 抓取时间分布（按天）====="
grep -i 'bytespider' "$ALL" | awk -F'[][]' '{print $2}' | awk '{print $1}' | sort | uniq -c | sed 's/^/  /'

echo ""
echo "===== 5. Bytespider 最近 8 次请求（看是否还在活跃）====="
grep -i 'bytespider' "$ALL" | tail -8 | awk '{print "  " $1, $4, $7, $9}'

echo ""
echo "===== 6. Bytespider 的 IP 与状态码 ====="
grep -i 'bytespider' "$ALL" | awk '{print $1}' | sort | uniq -c | sort -rn | head -8 | sed 's/^/  IP /'
echo "  状态码分布:"
grep -i 'bytespider' "$ALL" | awk '{print $9}' | sort | uniq -c | sort -rn | head -5 | sed 's/^/    /'

echo ""
echo "===== 7. 4 个新专题页被哪些爬虫抓过（含字节系）====="
for p in invoice-compliance social-insurance-iit high-tech-enterprise company-deregistration; do
  echo "  /$p:"
  grep "/$p" "$ALL" | awk '{print $1}' | sort | uniq -c | sed 's/^/    /'
  grep "/$p" "$ALL" | awk -F'"' '{print $6}' | sed 's/Mozilla\/5.0 //' | cut -c1-45 | sort -u | sed 's/^/    UA: /'
done

echo ""
echo "===== 8. 对照：其他 AI 爬虫的抓取量（说明站点对 AI 爬虫是开放的）====="
for ua in OAI-SearchBot GPTBot ClaudeBot PerplexityBot DeepSeek DeepSeekBot Applebot KimiBot QianfanBot; do
  c=$(grep -c "$ua" "$ALL")
  echo "  $ua: $c"
done

echo ""
echo "===== 9. robots.txt 中对豆包相关 UA 的声明 ====="
curl -s https://www.shuducw.com/robots.txt | grep -inE 'doubao|bytespider|bytedance' | sed 's/^/  /'
echo "  （若此处没有，说明豆包 UA 走的是 * 通配规则 Allow: /，同样允许抓取）"

rm -f "$ALL"
