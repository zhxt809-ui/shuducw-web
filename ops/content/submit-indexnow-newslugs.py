# Re-submit all NEW article URLs + sitemap to Bing via IndexNow
import urllib.request, urllib.error, json, urllib.parse

KEY = '9c615d0ffcf44fd4a1c860a302b08850'
HOST = 'www.shuducw.com'
KEY_LOCATION = f'https://{HOST}/{KEY}.txt'

new_article_urls = [
    'https://www.shuducw.com/news/gongsi-liangtaozhang-fengxian',
    'https://www.shuducw.com/news/wuliangye-zhongxiaoqiye-caiwuhegui',
    'https://www.shuducw.com/news/xian-canyin-hezhengzhenshou-butui',
    'https://www.shuducw.com/news/shangshigongsi-zicha-butui',
    'https://www.shuducw.com/news/2026-shuiwujicha-zhongdian',
    'https://www.shuducw.com/news/xian-wanglaizhang-guazhang-80wan',
    'https://www.shuducw.com/news/shenfenmaoyong-zhuce-gongsi-fengxian',
    'https://www.shuducw.com/news/2026-caishui-4tiao-hongxian',
    'https://www.shuducw.com/news/sailisi-kuisun-18yi',
    'https://www.shuducw.com/news/yanfa-jijia-kouchu-yongmei',
    'https://www.shuducw.com/news/2026-shuiwu-cailiang-jizhun',
    'https://www.shuducw.com/news/langzi-gaoxin-zige-quxiao',
    'https://www.shuducw.com/news/2026-geshui-9000yi',
    'https://www.shuducw.com/news/xian-kaigongsi-leixing-duibi-2026',
]

# POST new article URLs
body = json.dumps({'host': HOST, 'key': KEY, 'keyLocation': KEY_LOCATION, 'urlList': new_article_urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body,
                             headers={'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'Mozilla/5.0'})
try:
    r = urllib.request.urlopen(req, timeout=30)
    print('IndexNow POST 14 new article URLs:', r.status, '(200 = 已接收)')
except urllib.error.HTTPError as e:
    print('POST:', e.code, e.read().decode('utf-8','ignore')[:200])
except Exception as e:
    print('POST ERR:', str(e)[:100])

# Re-submit sitemap (Bing re-fetches and discovers all new slugs)
sitemap_url = 'https://www.shuducw.com/sitemap.xml'
req2 = urllib.request.Request(f'https://api.indexnow.org/indexnow?url={urllib.parse.quote(sitemap_url, safe=":/")}&key={KEY}',
                              headers={'User-Agent': 'Mozilla/5.0'})
try:
    r2 = urllib.request.urlopen(req2, timeout=30)
    print('sitemap re-submit:', r2.status, '(200 = 已接收)')
except urllib.error.HTTPError as e:
    print('sitemap:', e.code, e.read().decode('utf-8','ignore')[:200])
