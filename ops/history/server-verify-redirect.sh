#!/bin/bash
echo "=== redirect chain: old slug -> 308 -> new slug ==="
declare -A CHAIN=(
  ["test-1781496267610"]="gongsi-liangtaozhang-fengxian"
  ["303-1781792348630"]="wuliangye-zhongxiaoqiye-caiwuhegui"
  ["850-1-24-2590-1782049886814"]="xian-canyin-hezhengzhenshou-butui"
  ["1-1782348852360"]="shangshigongsi-zicha-butui"
  ["2026-1782551611028"]="2026-shuiwujicha-zhongdian"
  ["1-80-1782786731908"]="xian-wanglaizhang-guazhang-80wan"
  ["5-10-1783086858170"]="shenfenmaoyong-zhuce-gongsi-fengxian"
  ["2026-4-1783647583539"]="2026-caishui-4tiao-hongxian"
  ["18-1783927822503"]="sailisi-kuisun-18yi"
  ["article-1785294311439"]="yanfa-jijia-kouchu-yongmei"
  ["2026-1785318511401"]="2026-shuiwu-cailiang-jizhun"
  ["5256-1785678940367"]="langzi-gaoxin-zige-quxiao"
  ["9000-13-1786156260332"]="2026-geshui-9000yi"
)
for old in "${!CHAIN[@]}"; do
  new="${CHAIN[$old]}"
  redir=$(curl -s -o /dev/null -w "%{http_code}->%{redirect_url}" "http://127.0.0.1:3000/news/$old")
  final=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/news/$new")
  echo "$old => $redir ; new($new)=$final"
done
echo "=== sitemap new slugs count ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c 'gongsi-liangtaozhang\|wuliangye\|xian-canyin\|zicha-butui\|shuiwujicha\|wanglaizhang\|shenfenmaoyong\|4tiao-hongxian\|sailisi\|yanfa-jijia\|cailiang-jizhun\|gaoxin-zige\|geshui-9000'
echo "=== sitemap total news urls ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c '/news/'
