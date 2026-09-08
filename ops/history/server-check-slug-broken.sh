#!/bin/bash
echo "=== current behavior for old-slug article (should NOT 301 yet) ==="
curl -s -o /dev/null -w "old-slug /news/test-1781496267610: %{http_code} -> %{redirect_url}\n" http://127.0.0.1:3000/news/test-1781496267610
curl -s -o /dev/null -w "xian-kaigongsi(#09, not in map): %{http_code}\n" http://127.0.0.1:3000/news/xian-kaigongsi-leixing-duibi-2026
