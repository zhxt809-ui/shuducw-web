# Update live article #10 with corrected (Pro-verified) content
import urllib.request, urllib.error, json, os

# 管理密码从环境变量读取（不硬编码入库）
TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')

BASE = 'https://www.shuducw.com'
SLUG = 'zhuce-zijin-renjiao-2026'
HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'website-article-10-full.html')

def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'Mozilla/5.0', 'x-admin-token': TOKEN}, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=30)
        return resp.status, resp.read().decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore')
    except Exception as e:
        return -1, 'ERR:' + str(e)[:60]

# find article id by slug
st, body = req('GET', f'{BASE}/api/articles?limit=50&is_published=true')
arts = json.loads(body).get('data', []) if st == 200 else []
art = next((a for a in arts if a.get('slug') == SLUG), None)
if not art:
    print('!! article not found'); raise SystemExit
aid = art['id']
print('article id:', aid, '| title:', art['title'])

content = open(HTML_PATH, encoding='utf-8').read()
st, body = req('PUT', f'{BASE}/api/articles/{aid}', {'content': content})
print('PUT update:', st)
print(body[:200])
