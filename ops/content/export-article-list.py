# Export published article list (sort_order|slug|title) to UTF-8 file
import urllib.request, json

d = json.loads(urllib.request.urlopen(
    urllib.request.Request('https://www.shuducw.com/api/articles?limit=50&is_published=true',
                           headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read())
lines = []
for a in sorted(d['data'], key=lambda x: x['sort_order']):
    lines.append(f"{a['sort_order']}|{a['slug']}|{a['title']}")
open(r'D:\md\数度网站\.tools\article-list-utf8.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('written', len(lines), 'articles')
