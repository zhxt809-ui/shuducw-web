# Submit ALL site URLs (incl. all 14 articles) to Bing via IndexNow
import urllib.request, urllib.error, json

KEY = '9c615d0ffcf44fd4a1c860a302b08850'
HOST = 'www.shuducw.com'
KEY_LOCATION = f'https://{HOST}/{KEY}.txt'

all_urls = [
    'https://www.shuducw.com',
    'https://www.shuducw.com/about',
    'https://www.shuducw.com/services',
    'https://www.shuducw.com/services/basic',
    'https://www.shuducw.com/services/compliance',
    'https://www.shuducw.com/services/consulting',
    'https://www.shuducw.com/contact',
    'https://www.shuducw.com/faq',
    'https://www.shuducw.com/news',
    # categories
    'https://www.shuducw.com/news/cases',
    'https://www.shuducw.com/news/tips',
    'https://www.shuducw.com/news/policies',
    # 14 篇文章（2026-09 关键词 slug，与 sitemap 一致）
    'https://www.shuducw.com/news/xian-kaigongsi-leixing-duibi-2026',
    'https://www.shuducw.com/news/2026-geshui-9000yi',
    'https://www.shuducw.com/news/langzi-gaoxin-zige-quxiao',
    'https://www.shuducw.com/news/2026-shuiwu-cailiang-jizhun',
    'https://www.shuducw.com/news/yanfa-jijia-kouchu-yongmei',
    'https://www.shuducw.com/news/sailisi-kuisun-18yi',
    'https://www.shuducw.com/news/2026-caishui-4tiao-hongxian',
    'https://www.shuducw.com/news/shenfenmaoyong-zhuce-gongsi-fengxian',
    'https://www.shuducw.com/news/xian-wanglaizhang-guazhang-80wan',
    'https://www.shuducw.com/news/2026-shuiwujicha-zhongdian',
    'https://www.shuducw.com/news/shangshigongsi-zicha-butui',
    'https://www.shuducw.com/news/gongsi-liangtaozhang-fengxian',
    'https://www.shuducw.com/news/wuliangye-zhongxiaoqiye-caiwuhegui',
    'https://www.shuducw.com/news/xian-canyin-hezhengzhenshou-butui',
]

print('total URLs:', len(all_urls))

# POST submission (max 10,000 URLs per call)
body = json.dumps({
    'host': HOST,
    'key': KEY,
    'keyLocation': KEY_LOCATION,
    'urlList': all_urls,
}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body,
                             headers={'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'Mozilla/5.0'})
try:
    r = urllib.request.urlopen(req, timeout=30)
    print('IndexNow POST all 26 URLs:', r.status, '(200 = 已接收)')
except urllib.error.HTTPError as e:
    print('IndexNow POST:', e.code, e.read().decode('utf-8','ignore')[:200])
except Exception as e:
    print('IndexNow POST ERR:', str(e)[:100])

# Also submit sitemap again (already done earlier, harmless)
sitemap_url = 'https://www.shuducw.com/sitemap.xml'
req2 = urllib.request.Request(f'https://api.indexnow.org/indexnow?url={urllib.parse.quote(sitemap_url, safe=":/")}&key={KEY}',
                              headers={'User-Agent': 'Mozilla/5.0'})
try:
    r2 = urllib.request.urlopen(req2, timeout=30)
    print('sitemap re-submit:', r2.status)
except urllib.error.HTTPError as e:
    print('sitemap re-submit:', e.code, e.read().decode('utf-8','ignore')[:100])
