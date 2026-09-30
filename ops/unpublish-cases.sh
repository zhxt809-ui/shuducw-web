#!/bin/bash
set -e
F=/var/www/shuducw-run/data/articles.json
cp "$F" /root/articles-backup-$(date +%Y%m%d-%H%M%S).json
python3 << 'EOF'
import json
F = '/var/www/shuducw-run/data/articles.json'
arts = json.load(open(F, encoding='utf-8'))
targets = [7, 8, 15]
changed = []
for a in arts:
    if a['id'] in targets:
        a['is_published'] = False
        changed.append((a['id'], a['slug'], a['title'][:40]))
json.dump(arts, open(F, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('已下架:')
for c in changed:
    print(f'  id={c[0]} | {c[1]} | {c[2]}')
EOF
ls -la /root/articles-backup-*.json | tail -1
