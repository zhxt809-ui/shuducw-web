#!/bin/bash
python3 <<'EOF'
import json
p = '/var/www/shuducw-run/data/consultations.json'
d = json.load(open(p, encoding='utf-8'))
before = len(d)
clean = [c for c in d if '防刷测试' not in str(c.get('company_name', '')) and '安全测试' not in str(c.get('company_name', ''))]
json.dump(clean, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'before: {before}, after: {len(clean)}, removed: {before - len(clean)}')
for c in clean:
    print('  kept:', c.get('id'), c.get('company_name'))
EOF
echo "--- 站点状态 ---"
curl -s -o /dev/null -w "home: %{http_code}\n" https://www.shuducw.com/
