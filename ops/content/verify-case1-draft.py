# Verify case1 draft: exists in admin list + not publicly visible
import urllib.request, urllib.error, json, os

TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')
BASE = 'https://www.shuducw.com'
SLUG = 'xian-shipin-yecaishui-yitihua-anli'

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

# 1. admin list includes draft?
st, body = req('GET', f'{BASE}/api/articles?limit=100&is_published=false')
found = False
if st == 200:
    for a in json.loads(body).get('data', []):
        if a.get('slug') == SLUG:
            found = True
            print('draft found: id=%s is_published=%s category=%s sort=%s' % (
                a.get('id'), a.get('is_published'), a.get('category'), a.get('sort_order')))
print('admin list status:', st, '| draft found:', found)

# 2. public detail must NOT return the draft content
st2, body2 = req('GET', f'{BASE}/news/{SLUG}')
print('public article page status:', st2)
if st2 == 200 and '文章不存在' not in body2 and '尚未发布' not in body2:
    print('!! WARNING: draft content appears publicly')
else:
    print('OK: draft is not publicly visible')
