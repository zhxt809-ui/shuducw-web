#!/bin/bash
curl -s https://www.shuducw.com/sitemap.xml > /tmp/sm.xml
echo "总数: $(grep -c '<loc>' /tmp/sm.xml)"
echo "文章类 URL（分类4 + 文章22 应=26）: $(grep -oE 'https://www\.shuducw\.com/news/[a-z0-9-]+' /tmp/sm.xml | sort -u | wc -l)"
echo "--- 文章 URL 样例 ---"
grep -oE 'https://www\.shuducw\.com/news/[a-z0-9-]+' /tmp/sm.xml | sort -u | head -5
echo "--- sitemap 尾部 200 字节 ---"
tail -c 200 /tmp/sm.xml
