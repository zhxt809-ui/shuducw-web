#!/bin/bash
echo "--- 首页许可证徽章 ---"
curl -s https://www.shuducw.com/ | grep -oE '代理记账许可证书|DLJZ61010120170035' | sort | uniq -c
echo "--- 首页 Schema hasCredential ---"
curl -s https://www.shuducw.com/ | grep -o 'hasCredential' | head -1
echo "--- 关键页状态 ---"
for u in / /services/district/xincheng /services/live-commerce /faq /services/basic; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://www.shuducw.com$u")
  echo "$u -> $code"
done
echo "--- sitemap 计数 ---"
curl -s https://www.shuducw.com/sitemap.xml | grep -o '<loc>' | wc -l
