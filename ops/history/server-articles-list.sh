#!/bin/bash
echo "=== articles.json structure (first article keys) ==="
python3 -c "
import json
d = json.load(open('/var/www/shuducw-run/data/articles.json'))
arts = d.get('articles', d) if isinstance(d, dict) else d
if isinstance(arts, dict):
    arts = list(arts.values())
print('total articles:', len(arts))
print('sample keys:', list(arts[0].keys()) if arts else 'empty')
"
echo "=== all articles: id | slug | title ==="
python3 -c "
import json
d = json.load(open('/var/www/shuducw-run/data/articles.json'))
arts = d.get('articles', d) if isinstance(d, dict) else d
if isinstance(arts, dict):
    arts = list(arts.values())
for a in arts:
    print(f\"{a.get('id')} | {a.get('slug')} | {a.get('title')}\")
"
