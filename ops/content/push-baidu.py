#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
百度搜索资源平台 · 普通收录 API 推送
官方文档：https://ziyuan.baidu.com/college/courseinfo?id=267&page=2
接口：POST http(s)://data.zz.baidu.com/urls?site=<站点>&token=<token>
      Content-Type: text/plain，每行一个 URL，单次最多 2000 条

重要事实（2026-10-01 实测）：
  · 本站在百度搜索资源平台的每日配额很小（实测 8 条/天），因此不能一次性推送全部 55 条，
    必须按配额分日推送。脚本默认每批 5 条、每批后检查 remain，配额耗尽即停。
  · 百度官方明确警告：重复提交已发布的旧链接会浪费配额，且"经常重复提交旧链接会下调您的配额"，
    因此本脚本默认只推送从未推送过的链接（状态记录在 .push-state/baidu.json）。
  · https://data.zz.baidu.com 实测存在证书与主机名不匹配的问题（2026-10-02~06 稳定复现），
    故**优先官方 http 接口**、https 作为回退。

用法：
  python ops/content/push-baidu.py --save-token <16位token>   # 保存 token（文件已 gitignore）
  python ops/content/push-baidu.py --dry-run                  # 演练：只显示会推什么
  python ops/content/push-baidu.py                            # 按配额推送尚未推送过的链接
  python ops/content/push-baidu.py --urls <url1> <url2>       # 只推指定链接
  python ops/content/push-baidu.py --all                      # 忽略历史状态推全部（慎用，吃配额）
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.environ.get('BAIDU_PUSH_CONFIG', os.path.join(HERE, 'baidu-push.config.json'))
STATE_DIR = os.environ.get('BAIDU_PUSH_STATE_DIR', os.path.join(HERE, '.push-state'))
STATE = os.path.join(STATE_DIR, 'baidu.json')
SITEMAP = 'https://www.shuducw.com/sitemap.xml'
SITE = 'www.shuducw.com'
# 2026-10-06 修正：把官方 http 接口放在**第一位**。
# 依据：服务端 /var/log/baidu-push.log 连续 5 天（10-02 ~ 10-06）每天每条推送都记录
#   "接口 https://data.zz.baidu.com/urls 连接失败：URLError: [SSL: CERTIFICATE_VERIFY_FAILED]
#    certificate verify failed: Hostname mismatch"
# 即百度的 https 证书与主机名不匹配是**稳定复现**的，不是偶发；先试 https 只会每天白丢一次尝试
# （10-04 那次甚至因此整天空推：http 接口返回 HTTP 505 "please retry later" 后没有重试）。
ENDPOINTS = ['http://data.zz.baidu.com/urls', 'https://data.zz.baidu.com/urls']
BATCH = 2000  # 百度单次上限

ERROR_HINTS = {
    400: '站点未验证 / 提交内容为空 / 超过当天配额 / 单次超过 2000 条',
    401: 'token 无效（到 普通收录 → API 提交 复制最新 token）',
    404: '接口地址错误',
    500: '百度服务器偶发异常，通常稍后重试即可',
}


def load_config():
    if not os.path.exists(CONFIG):
        return {}
    with open(CONFIG, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_config(cfg):
    with open(CONFIG, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    try:
        os.chmod(CONFIG, 0o600)
    except Exception:
        pass
    print(f'已写入配置: {CONFIG}（权限 600，已加入 .gitignore）')


def load_state():
    if not os.path.exists(STATE):
        return {'pushed': []}
    with open(STATE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_state(state):
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(STATE, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def fetch_sitemap_urls(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; ShuduBaiduPush/1.0)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode('utf-8', 'replace')
    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    return [e.text.strip() for e in ET.fromstring(raw).findall(f'{ns}url/{ns}loc')]


def push(site, token, urls, verbose=False):
    """推送一批 URL。返回 (状态码, 响应体, 实际使用的接口地址)。
    仅当连接层失败（证书错误/网络不可达）才换下一个接口地址；
    只要 HTTP 层收到响应（含 4xx/5xx），说明链路是通的，直接用该结果。"""
    body = '\n'.join(urls).encode('utf-8')
    last_err = None
    for base in ENDPOINTS:
        req = urllib.request.Request(
            f'{base}?site={site}&token={token}',
            data=body,
            headers={'Content-Type': 'text/plain', 'User-Agent': 'curl/7.81.0'},
            method='POST',
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.status, json.loads(r.read().decode('utf-8', 'replace')), base
        except urllib.error.HTTPError as e:
            text = e.read().decode('utf-8', 'replace')
            try:
                return e.code, json.loads(text), base
            except Exception:
                return e.code, {'message': text[:300]}, base
        except Exception as e:
            if verbose:
                print(f'  接口 {base} 连接失败：{type(e).__name__}: {str(e)[:110]}')
            last_err = e
            continue
    raise last_err if last_err else RuntimeError('没有可用接口地址')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--save-token', metavar='TOKEN', help='保存 token 到本地配置')
    ap.add_argument('--site', default=None, help=f'站点域名（默认 {SITE}）')
    ap.add_argument('--token', default=None, help='临时指定 token（不保存）')
    ap.add_argument('--sitemap', default=SITEMAP, help='sitemap 地址')
    ap.add_argument('--urls', nargs='*', help='只推送指定 URL')
    ap.add_argument('--all', action='store_true', help='忽略历史状态，推送 sitemap 全部链接（慎用）')
    ap.add_argument('--dry-run', action='store_true', help='演练：只显示将要推送的链接')
    ap.add_argument('--chunk', type=int, default=5, help='每批条数（默认 5，便于在很小配额下尽量推成功）')
    ap.add_argument('--max', type=int, default=0, help='本次最多推送条数（0=不限，受配额限制）')
    args = ap.parse_args()

    cfg = load_config()
    if args.save_token:
        cfg['token'] = args.save_token.strip()
        cfg['site'] = args.site or cfg.get('site') or SITE
        save_config(cfg)
        return
    token = args.token or cfg.get('token')
    site = args.site or cfg.get('site') or SITE
    if not token and not args.dry_run:
        print('缺少 token。请先执行：python ops/content/push-baidu.py --save-token <16位token>')
        print('获取方式：百度搜索资源平台 → 资源提交 → 普通收录 → API 提交 → 复制接口地址中的 token')
        sys.exit(2)

    state = load_state()
    pushed = set(state.get('pushed', []))

    if args.urls:
        urls = [u.strip() for u in args.urls if u.strip()]
        print(f'指定推送 {len(urls)} 条链接')
    else:
        try:
            urls = fetch_sitemap_urls(args.sitemap)
        except Exception as e:
            print(f'读取 sitemap 失败：{type(e).__name__}: {str(e)[:150]}')
            sys.exit(3)
        print(f'从 sitemap 读取到 {len(urls)} 条链接：{args.sitemap}')
        if not args.all:
            pending = [u for u in urls if u not in pushed]
            print(f'尚未推送过 {len(pending)} 条（历史已推 {len(pushed)} 条；--all 可强制全量）')
            urls = pending

    if args.max and len(urls) > args.max:
        print(f'本次按 --max 限制为前 {args.max} 条')
        urls = urls[:args.max]

    if not urls:
        print('没有需要推送的新链接，结束（不浪费配额）')
        return
    if args.dry_run:
        print('\n[演练模式] 将要推送：')
        for u in urls:
            print('  ' + u)
        print('\n演练结束，未实际提交。')
        return

    chunk = max(1, min(args.chunk, BATCH))
    total_success, quota_left = 0, None
    for i in range(0, len(urls), chunk):
        batch = urls[i:i + chunk]
        try:
            code, resp, used = push(site, token, batch, verbose=True)
        except Exception as e:
            print(f'推送失败：{type(e).__name__}: {str(e)[:170]}')
            print('  提示：国内网络下在服务器上运行更稳定（python3 push-baidu.py）')
            break
        if code == 200:
            ok = resp.get('success', 0)
            quota_left = resp.get('remain', quota_left)
            total_success += ok
            if ok:
                pushed.update(batch[:ok] if ok < len(batch) else batch)
            print(f'  本批 {len(batch)} 条 -> 成功 {ok} 条，当天剩余配额 {quota_left}')
            if resp.get('not_same_site'):
                print(f'    非本站链接被忽略: {resp["not_same_site"][:5]}')
            if resp.get('not_valid'):
                print(f'    不合法链接: {resp["not_valid"][:5]}')
            if ok < len(batch):
                print('    部分未成功，可能已触及当天配额，停止本次推送（余下链接留待下次）')
                break
            if isinstance(quota_left, int) and quota_left <= 0:
                print('    当天配额已用尽，停止本次推送（余下链接留待下次）')
                break
        else:
            msg = str(resp.get('message', resp))
            print(f'  HTTP {code} 推送失败：{msg}')
            # 实测配额耗尽时百度返回 {"error":400,"message":"over quota"}（HTTP 也是 400）
            if resp.get('error') in (4, 400) or 'quota' in msg.lower():
                print('    判定为当天配额已用尽，停止本次推送（余下链接留待下次，不浪费请求）')
            else:
                print(f'    可能原因：{ERROR_HINTS.get(code, "见百度官方文档")}')
            break

    state['pushed'] = sorted(pushed)
    save_state(state)
    remaining = len([u for u in fetch_sitemap_urls(args.sitemap) if u not in pushed]) if not args.urls else None
    print(f'\n合计成功推送 {total_success} 条；当天剩余配额 {quota_left}')
    if remaining is not None:
        print(f'仍待推送 {remaining} 条（按配额分日推送即可，无需强制一天推完）')
    print(f'状态文件: {STATE}')


if __name__ == '__main__':
    main()
