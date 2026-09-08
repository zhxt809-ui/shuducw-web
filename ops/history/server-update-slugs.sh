#!/bin/bash
# 批量更新 13 篇文章 slug（通过 API，本地快速）
declare -A SLUGS=(
  [2]="gongsi-liangtaozhang-fengxian"
  [7]="wuliangye-zhongxiaoqiye-caiwuhegui"
  [8]="xian-canyin-hezhengzhenshou-butui"
  [9]="shangshigongsi-zicha-butui"
  [10]="2026-shuiwujicha-zhongdian"
  [11]="xian-wanglaizhang-guazhang-80wan"
  [12]="shenfenmaoyong-zhuce-gongsi-fengxian"
  [13]="2026-caishui-4tiao-hongxian"
  [14]="sailisi-kuisun-18yi"
  [15]="yanfa-jijia-kouchu-yongmei"
  [17]="2026-shuiwu-cailiang-jizhun"
  [18]="langzi-gaoxin-zige-quxiao"
  [19]="2026-geshui-9000yi"
)

for id in "${!SLUGS[@]}"; do
  new="${SLUGS[$id]}"
  code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "http://127.0.0.1:3000/api/articles/$id" \
    -H "Content-Type: application/json" \
    -d "{\"slug\":\"$new\"}")
  echo "id=$id -> $new [$code]"
done

echo "=== verify new slugs resolve to 200 (real article now) ==="
for s in gongsi-liangtaozhang-fengxian wuliangye-zhongxiaoqiye-caiwuhegui xian-canyin-hezhengzhenshou-butui shangshigongsi-zicha-butui 2026-shuiwujicha-zhongdian xian-wanglaizhang-guazhang-80wan shenfenmaoyong-zhuce-gongsi-fengxian 2026-caishui-4tiao-hongxian sailisi-kuisun-18yi yanfa-jijia-kouchu-yongmei 2026-shuiwu-cailiang-jizhun langzi-gaoxin-zige-quxiao 2026-geshui-9000yi; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/news/$s")
  echo "$code /news/$s"
done
