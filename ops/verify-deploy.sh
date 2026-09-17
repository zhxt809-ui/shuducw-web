#!/bin/bash
# 验证新部署页面状态码
for u in / /services/district/gaoxin /services/district/weiyang /services/district/lianhu \
         /services/district/yanta /services/district/changan /services/district/xixian \
         /services/district/xincheng /services/live-commerce /services/basic \
         /services/compliance /services/consulting /faq /services /about /contact /news; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://www.shuducw.com$u")
  echo "$u -> $code"
done
echo "--- 信任背书检查（首页应含 A 级纳税） ---"
curl -s https://www.shuducw.com/ | grep -o '2025 年度纳税信用' | head -1
echo "--- 区县页 FAQ Schema 检查 ---"
curl -s https://www.shuducw.com/services/district/xincheng | grep -o 'FAQPage' | head -1
echo "--- 直播电商页 ---"
curl -s https://www.shuducw.com/services/live-commerce | grep -o '直播电商个体户财税咨询' | head -1
echo "--- sitemap 计数 ---"
curl -s https://www.shuducw.com/sitemap.xml | grep -o '<loc>' | wc -l
echo "--- sitemap 含区县页 ---"
curl -s https://www.shuducw.com/sitemap.xml | grep -oE 'services/district/[a-z]+' | sort -u
