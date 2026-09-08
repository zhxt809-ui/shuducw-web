#!/bin/bash
echo "=== 443 验证（444=掐断, 000=curl视角的连接关闭）==="
curl -s -o /dev/null -w "random.shuducw.com: %{http_code} (期望444/000)\n" -H "Host: random-audit-check-20260905.shuducw.com" https://127.0.0.1/ -k || echo "random.shuducw.com: 连接被掐断(444) OK"
curl -s -o /dev/null -w "IP 8.152.3.67: %{http_code} (期望444/000)\n" -H "Host: 8.152.3.67" https://127.0.0.1/ -k || echo "IP: 连接被掐断(444) OK"
curl -s -o /dev/null -w "www.shuducw.com: %{http_code} (期望200)\n" -H "Host: www.shuducw.com" https://127.0.0.1/ -k
curl -s -o /dev/null -w "shuducw.com: %{http_code} (期望301)\n" -H "Host: shuducw.com" https://127.0.0.1/ -k
echo "=== 80 验证 ==="
curl -s -o /dev/null -w "http random: %{http_code} (期望444/000)\n" -H "Host: random-audit-check-20260905.shuducw.com" http://127.0.0.1/ || echo "http random: 444 OK"
curl -s -o /dev/null -w "http www: %{http_code} (期望301)\n" -H "Host: www.shuducw.com" http://127.0.0.1/
echo "=== 外部可达性 ==="
curl -s -o /dev/null -w "public https www: %{http_code}\n" --max-time 15 https://www.shuducw.com/
