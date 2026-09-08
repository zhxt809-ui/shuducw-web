#!/bin/bash
echo "=== 验证文件全部在线检查 ==="
for f in "9c615d0ffcf44fd4a1c860a302b08850.txt" "BingSiteAuth.xml" "baidu_verify_codeva-t1LOLMCF42.html" "google28fc85f4f8afed73.html" "ByteDanceVerify.html" "81d494eacc771fbdb6f8d6faa3f8238b.txt"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/$f")
  echo "$code  $f"
done
echo "=== IndexNow key 内容 ==="
curl -s http://127.0.0.1:3000/9c615d0ffcf44fd4a1c860a302b08850.txt
echo ""
echo "=== 文章 #10 当前状态（草稿，Bing 5日抓的是发布版，复刊后 Bing 会重新抓取）==="
curl -s http://127.0.0.1:3000/api/articles/21 | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print('published:', d['is_published'])"
