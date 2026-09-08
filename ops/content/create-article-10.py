# Create website article #10 via admin API
import urllib.request, urllib.error, json, time, os

# 管理密码从环境变量读取（不硬编码入库；运行时: $env:ADMIN_API_PASSWORD='...'）
TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')

BASE = 'https://www.shuducw.com'
HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'website-article-10-full.html')
SLUG = 'zhuce-zijin-renjiao-2026'

def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'Mozilla/5.0', 'x-admin-token': TOKEN}
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=30)
        return resp.status, resp.read().decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore')
    except Exception as e:
        return -1, 'ERR:' + str(e)[:60]

# 1. fetch list to compute sort_order
st, body = req('GET', f'{BASE}/api/articles?limit=50&is_published=true')
print('list:', st)
arts = []
if st == 200:
    arts = json.loads(body).get('data', [])
max_sort = max([a.get('sort_order') or 0 for a in arts]) if arts else 0
next_sort = max_sort + 1
print(f'existing: {len(arts)} articles, max sort_order={max_sort}, new sort_order={next_sort}')
# check slug not exists
for a in arts:
    if a.get('slug') == SLUG:
        print('!! slug already exists:', a.get('id'))
        raise SystemExit

# 2. read content HTML
content = open(HTML_PATH, encoding='utf-8').read()

payload = {
    'title': '公司注册资金填多少合适？2026 年认缴制下的注意事项与常见误区',
    'slug': SLUG,
    'category': 'tips',
    'summary': '公司注册资金填多少合适？认缴制并非不用缴：2024年新《公司法》要求认缴出资五年内实缴。一般贸易服务类公司10万-100万常见，有实缴门槛的行业按门槛填。附常见误区与自查清单。',
    'content': content,
    'cover_image': None,
    'is_published': True,
    'sort_order': next_sort,
}

# 3. create
st, body = req('POST', f'{BASE}/api/articles', payload)
print('create:', st)
print(body[:400])
