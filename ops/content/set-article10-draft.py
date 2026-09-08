# Set article #10 to draft (admin-only) for user review
import urllib.request, urllib.error, json, os

# 管理密码从环境变量读取（不硬编码入库）
TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')

BASE = 'https://www.shuducw.com'
aid = 21

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

st, body = req('PUT', f'{BASE}/api/articles/{aid}', {'is_published': False})
print('set draft:', st)
if st == 200:
    import json as j
    d = j.loads(body)['data']
    print('is_published now:', d.get('is_published'))
