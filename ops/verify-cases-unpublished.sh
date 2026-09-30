#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 下架文章 URL 状态（应不再是正常文章页） ====="
for slug in wuliangye-zhongxiaoqiye-caiwuhegui xian-canyin-hezhengzhenshou-butui yanfa-jijia-kouchu-yongmei; do
  code=$(curl -s -o /tmp/art.html -w '%{http_code}' "$B/news/$slug")
  flag=$(grep -c '文章尚未发布\|文章不存在' /tmp/art.html)
  echo "  /news/$slug -> HTTP $code, 未发布提示: $flag"
done
echo ""
echo "===== 2. /news/cases 列表（应剩 5 篇公开案例分析） ====="
curl -s "$B/news/cases" > /tmp/cases.html
for t in '上市公司扎堆' '身份冒用' '赛力斯' '朗姿股份' '咸阳3242' '五粮液' '餐饮公司' '永明煤矿'; do
  echo "  '$t': $(grep -c "$t" /tmp/cases.html)"
done
echo ""
echo "===== 3. 服务实录不受影响 ====="
curl -s "$B/cases" > /tmp/shilu.html
echo "  /cases 页面: $(grep -oE '业财税一体化|保险销售企业|高新技术企业常年财税顾问' /tmp/shilu.html | sort -u | wc -l)/3 篇在"
home=$(curl -s "$B/")
echo "  首页案例区: $(echo "$home" | grep -c '我们实际解决过哪些企业财税问题')"
echo ""
echo "===== 4. sitemap 文章数 ====="
curl -s "$B/sitemap.xml" | grep -c '/news/' 
