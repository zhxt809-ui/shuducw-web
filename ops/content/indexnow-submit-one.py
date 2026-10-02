#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""IndexNow 单条流式提交（命令行版）。

依据《Bing Webmaster Guidelines》第 4 节：「Avoid batch submissions when possible.
Streaming submissions provide faster updates」。因此本脚本**逐条提交**，一次一条。

用法：
  python ops/content/indexnow-submit-one.py https://www.shuducw.com/news/xxx [更多 URL...]
  python ops/content/indexnow-submit-one.py --changed        # 自动取最近一次提交里改动的页面 URL
  python ops/content/indexnow-submit-one.py --home           # 只提交首页（首页内容有实质变化时才用）

禁止：全量批量推送。全站重建时才考虑 ops/content/submit-indexnow-from-sitemap.py。
"""
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

KEY = '9c615d0ffcf44fd4a1c860a302b08850'
HOST = 'www.shuducw.com'
KEY_LOCATION = f'https://{HOST}/{KEY}.txt'
ENDPOINT = 'https://api.indexnow.org/indexnow'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; ShuduIndexNow/1.0)'}


def submit(url: str) -> bool:
    target = f'{ENDPOINT}?url={urllib.parse.quote(url, safe="")}&key={KEY}&keyLocation={urllib.parse.quote(KEY_LOCATION, safe="")}'
    req = urllib.request.Request(target, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            ok = r.status in (200, 202)
            print(f'  [{"已接收" if ok else "未接收"}] HTTP {r.status}  {url}')
            return ok
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'ignore')[:160]
        print(f'  [失败] HTTP {e.code}  {url}  {detail}')
        return False
    except Exception as e:
        print(f'  [异常] {url}  {str(e)[:120]}')
        return False


def urls_from_last_commit() -> list:
    """从最近一次提交里推断受影响的页面 URL。"""
    try:
        out = subprocess.run(['git', 'diff', '--name-only', 'HEAD~1', 'HEAD'],
                             capture_output=True, text=True, check=True).stdout
    except Exception as e:
        print('读取 git 变更失败:', str(e)[:120])
        return []
    urls = []
    for path in out.splitlines():
        path = path.strip().replace('\\', '/')
        m = re.match(r'^src/app/(.*)/page\.tsx$', path)
        if m and '[' not in m.group(1) and 'admin' not in m.group(1):
            route = m.group(1)
            urls.append(f'https://{HOST}/' if route == '' else f'https://{HOST}/{route}')
        elif path in ('src/app/page.tsx',):
            urls.append(f'https://{HOST}/')
    return sorted(set(urls))


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 1

    if '--changed' in args:
        urls = urls_from_last_commit()
        print(f'最近一次提交涉及 {len(urls)} 个页面路由')
    elif '--home' in args:
        urls = [f'https://{HOST}/']
    else:
        urls = [a for a in args if a.startswith('http')]

    if not urls:
        print('没有需要提交的 URL')
        return 1

    print(f'准备逐条提交 {len(urls)} 条（单条流式，最多每秒 1 条）')
    accepted = 0
    for i, u in enumerate(urls):
        if submit(u):
            accepted += 1
        if i < len(urls) - 1:
            time.sleep(1.0)
    print(f'\n结果：{accepted}/{len(urls)} 条被 IndexNow 接收')
    return 0 if accepted == len(urls) else 1


if __name__ == '__main__':
    sys.exit(main())
