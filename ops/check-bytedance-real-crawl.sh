#!/bin/bash
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"

echo "===== 1. SamanthaDoubao（豆包客户端）请求明细 ====="
grep -i 'samanthadoubao' "$ALL" | sed 's/^/  /'

echo ""
echo "===== 2. 所谓 Bytespider：按 IP 归属判断真假 ====="
echo "  --- 中国境内 IP（可能是真 Bytespider，字节真实爬虫 IP 多为 110.249/111.225/180.184/42.x 等）---"
grep -i 'bytespider' "$ALL" | grep -E '^1(10\.249|11\.225)\.|^180\.184\.|^42\.|^122\.14\.|^^183\.' | awk '{print "    " $1, $4, $7, $9}'
echo "  --- 境外云厂商 IP（AWS 47.128/35.x、GCP 34.26/35.229 等，高度疑似扫描器伪装）---"
grep -i 'bytespider' "$ALL" | grep -E '^(47\.128|35\.|34\.26|34\.|18\.|52\.|3\.)' | awk '{print "    " $1, $4, $7, $9}' | head -12
echo ""
echo "  真爬虫应抓的内容路径（非探测路径）统计："
grep -i 'bytespider' "$ALL" | grep -E ' /(news|about|services|faq|contact|cases|tools|self-check|invoice-compliance|social-insurance-iit|high-tech-enterprise|company-deregistration|shareholder-loans)' | awk '{print "    " $1, $4, $7, $9}' | head -15
echo "    （无输出说明 Bytespider 从未抓取过任何真实内容页）"

echo ""
echo "===== 3. 112.14 等中国 IP 的 sitemap 请求（可能是真字节爬虫）====="
grep -E '^122\.14\.' "$ALL" | awk '{print "  " $1, $4, $7, $9}' | head -10

echo ""
echo "===== 4. 其他字节系产品 UA（抖音/头条 App 内访问）====="
for name in aweme JsSdk TikTok BytedanceWebview Toutiao; do
  echo "  $name: $(grep -c "$name" "$ALL")"
done
echo "  --- 抖音 App 内访问详情（最多 5 条）---"
grep -i 'aweme' "$ALL" | awk -F'"' '{print "    " $0}' | cut -c1-140 | head -5

rm -f "$ALL"
