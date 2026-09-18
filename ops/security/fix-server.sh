#!/bin/bash
set -e
echo "===== 1. 检查 id=1 咨询记录 ====="
python3 <<'EOF'
import json
p = '/var/www/shuducw-run/data/consultations.json'
d = json.load(open(p, encoding='utf-8'))
one = [c for c in d if c.get('id') == 1]
if one:
    print(json.dumps(one[0], ensure_ascii=False))
else:
    print('id=1 not found')
print('total before cleanup:', len(d))
EOF
echo ""
echo "===== 2. 清理测试咨询记录（id 2-10） ====="
python3 <<'EOF'
import json
p = '/var/www/shuducw-run/data/consultations.json'
d = json.load(open(p, encoding='utf-8'))
keep = [c for c in d if c.get('id') == 1]
removed = [c for c in d if c.get('id') != 1]
json.dump(keep, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'kept: {len(keep)}, removed: {len(removed)}')
for r in removed:
    print('  removed id:', r.get('id'), r.get('company_name'))
EOF
echo ""
echo "===== 3. nginx 隐藏 X-Powered-By ====="
if grep -q "proxy_hide_header X-Powered-By" /etc/nginx/sites-available/shuducw; then
  echo "already present"
else
  sed -i 's|^    server_tokens off;|    server_tokens off;\n    proxy_hide_header X-Powered-By;|' /etc/nginx/sites-available/shuducw
  echo "added proxy_hide_header"
fi
nginx -t && systemctl reload nginx && echo "nginx reloaded"
echo ""
echo "===== 4. 修复 world-writable 权限 ====="
before=$(find /var/www/shuducw-run -type f -perm -o+w 2>/dev/null | wc -l)
chmod -R o-w /var/www/shuducw-run 2>/dev/null || true
after=$(find /var/www/shuducw-run -type f -perm -o+w 2>/dev/null | wc -l)
echo "world-writable files: before=$before after=$after"
echo ""
echo "===== 5. 验证 ====="
curl -sI https://www.shuducw.com/ | grep -iE "^(HTTP|server|x-powered-by)"
curl -s -o /dev/null -w "consultations POST (bad phone) -> %{http_code}\n" -X POST https://www.shuducw.com/api/consultations -H "Content-Type: application/json" -d '{"company_name":"x","phone":"abc","content":"x"}'
