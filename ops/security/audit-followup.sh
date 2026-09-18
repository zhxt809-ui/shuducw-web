#!/bin/bash
B="https://www.shuducw.com"
echo "########## 1. 正确的登录限流测试（POST /api/auth/check，错误 token 连打 7 次） ##########"
for i in 1 2 3 4 5 6 7; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/auth/check" -H "x-admin-token: wrong-token-$(date +%s%N)")
  echo "attempt $i -> $code"
  sleep 0.2
done
echo ""
echo "########## 2. 咨询接口防刷测试（10 次快速连发） ##########"
for i in $(seq 1 10); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/consultations" -H "Content-Type: application/json" -d "{\"company_name\":\"防刷测试$i\",\"phone\":\"13900000000\",\"content\":\"限流测试记录，将清理\"}")
  echo "consult $i -> $code"
done
echo ""
echo "########## 3. 308 跳转详情（/data/ /node_modules/ /src/） ##########"
for p in /data/ /node_modules/ /src/ /.git/; do
  loc=$(curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" "$B$p")
  echo "$p : $loc"
done
echo ""
echo "########## 4. 升级包列表 ##########"
apt list --upgradable 2>/dev/null | tail -n +2 | head -15
echo ""
echo "########## 5. 咨询数据中的测试记录 ##########"
python3 -c "
import json
d=json.load(open('/var/www/shuducw-run/data/consultations.json',encoding='utf-8'))
print('total consultations:', len(d))
tests=[c for c in d if '安全测试' in str(c.get('company_name','')) or '防刷测试' in str(c.get('company_name',''))]
print('test records:', len(tests))
for t in tests: print('-', t.get('id'), t.get('company_name'), t.get('created_at'))
"
