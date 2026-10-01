#!/bin/bash
B="https://www.shuducw.com"
echo "===== /contact 各 section 背景类（应 白-灰-白-灰 交替）====="
curl -s "$B/contact" | grep -oE '<section[^>]*class="[^"]*"' | sed 's/.*class="//' | head -8
echo ""
echo "===== 各页面 section 数 ====="
for p in /contact /about; do
  echo "  $p: $(curl -s $B$p | grep -oE '<section[^>]*' | wc -l) 个 section"
done
