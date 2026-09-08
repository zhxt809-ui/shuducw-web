#!/bin/bash
echo "=== crt.sh 证书透明度查询 (服务器直连) ==="
curl -s --max-time 25 -A "Mozilla/5.0" "https://crt.sh/?q=%25.shuducw.com&output=json" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    names = set()
    for row in data:
        for n in str(row.get('name_value','')).split('\n'):
            names.add(n.strip())
    names = sorted(names)
    print('证书中出现的所有域名/子域名:')
    for n in names:
        print('  ', n)
except Exception as e:
    print('解析失败:', e)
" 2>&1 | head -40
echo "=== done ==="
