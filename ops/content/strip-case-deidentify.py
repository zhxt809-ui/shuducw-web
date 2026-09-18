# Remove "应客户要求" from the 3 case drafts via admin API PUT
import urllib.request, urllib.error, json, os

TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')
BASE = 'https://www.shuducw.com'

DRAFTS = [
    (22, 'xian-shipin-yecaishui-yitihua-anli'),
    (23, 'xian-baoxian-caiwu-zixun-shuiwu-hegui-anli'),
    (24, 'xian-gaoxin-jishu-qiye-caiwu-guwen-anli'),
]

OLD = '应客户要求脱敏处理'
NEW = '脱敏处理'

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

for aid, slug in DRAFTS:
    # fetch current
    st, body = req('GET', f'{BASE}/api/articles/{aid}')
    if st != 200:
        print(f'id={aid} GET failed: {st}')
        continue
    art = json.loads(body).get('data', {})
    content = art.get('content') or ''
    if OLD not in content:
        print(f'id={aid} ({slug}): phrase not found, skip')
        continue
    new_content = content.replace(OLD, NEW)
    st2, body2 = req('PUT', f'{BASE}/api/articles/{aid}', {'content': new_content})
    print(f'id={aid} ({slug}): PUT {st2}, replaced {content.count(OLD)} occurrence(s)')
    if st2 != 200:
        print('  resp:', body2[:200])
