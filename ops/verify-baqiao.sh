#!/bin/bash
echo "=== 灞桥区页 ==="
curl -s -o /dev/null -w "baqiao: %{http_code}\n" "https://www.shuducw.com/services/district/baqiao"
curl -s "https://www.shuducw.com/services/district/baqiao" | grep -oE '白鹿原|纺织城|物流仓储' | sort | uniq -c
echo "=== 服务总览页网格含灞桥 ==="
curl -s "https://www.shuducw.com/services" | grep -oE 'services/district/baqiao' | head -1
echo "=== sitemap 含灞桥 ==="
curl -s "https://www.shuducw.com/sitemap.xml" | grep -oE '<loc>[^<]*baqiao[^<]*</loc>'
