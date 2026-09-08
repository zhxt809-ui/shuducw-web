#!/bin/bash
echo "=== verify fixed behavior (old slugs should be 200 now, data not yet changed) ==="
curl -s -o /dev/null -w "old-slug test-1781496267610: %{http_code}\n" http://127.0.0.1:3000/news/test-1781496267610
curl -s -o /dev/null -w "old-slug 5256-1785678940367: %{http_code}\n" http://127.0.0.1:3000/news/5256-1785678940367
curl -s -o /dev/null -w "#09 xian-kaigongsi: %{http_code}\n" http://127.0.0.1:3000/news/xian-kaigongsi-leixing-duibi-2026
echo "=== new slugs should be 404 (not in data, not in legacy map as source) ==="
curl -s -o /dev/null -w "new-slug gongsi-liangtaozhang: %{http_code}\n" http://127.0.0.1:3000/news/gongsi-liangtaozhang-fengxian
