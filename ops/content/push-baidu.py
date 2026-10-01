#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
百度搜索资源平台 · 普通收录 API 推送
官方文档：https://ziyuan.baidu.com/college/courseinfo?id=267&page=2
接口：POST https://data.zz.baidu.com/urls?site=<站点>&token=<16位token>
      Content-Type: text/plain，每行一个 URL，单次最多 2000 条

重要（百度官方明确警告）：
  · 重复提交已发布的旧链接会浪费每日配额，且"经常重复提交旧链接会下调您的配额"，
    因此本脚本默认只推送**从未推送过**的链接（状态记录在 ops/content/.push-state/baidu.json）。
  · 配额按天计算，返回体里的 remain 是当天剩余可推送条数。

用法：
  # 1) 第一次用：把 token 写进配置（不要提交到 git）
  python ops/content/push-baidu.py --save-token <16位token>

  # 2) 推送 sitemap 里所有尚未推送过的链接（默认只推新链接）
  python ops/content/push-baidu.py

  # 3) 只推指定链接（例如刚发布的 4 个专题页）
  python ops/content/push-baidu.py --urls https://www.shuducw.com/invoice-compliance ...

  # 4) 演练（不真正提交，只看会推什么）
  python ops/content/push-baidu.py --dry-run
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
CONFIG = os.path.join(HERE, 'baidu-push.config.json')
STATE_DIR = os.path.join(HERE, '.push-state')
STATE = os.path.join(STATE_DIR, 'baidu.json')
SITEMAP = 'https://www.shuducw.com/sitemap.xml'
SITE = 'www.shuducw.com'
API = 'https://data.zz.baidu.com/urls'
BATCH = 2000  # 百度单次上限

ERROR_HINTS = {
    400: '站点未在站长平台验证 / 提交内容为空 / 超过当天配额 / 单次超过 2000 条',
    401: 'token 无效（请到 普通收录 → API 提交 复制最新 token）',
    404: '接口地址错误',
    500: '百度服务器偶发异常，通常重试即可成功',
}


def load_config():
    if not os.path.exists(CONFIG):
        return {}
    with open(CONFIG, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_config(cfg):
    with open(CONFIG, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    print(f'已写入配置: {CONFIG}')
    print('  注意：该文件包含 token，请勿提交到公开仓库（已加入 .gitignore）')


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
    root = ET.fromstring(raw)
    return [e.text.strip() for e in root.findall(f'{ns}url/{ns}loc')]


def push(site, token, urls):
    body = '\n'.join(urls).encode('utf-8')
    req = urllib.request.Request(
        f'{API}?site={site}&token={token}',
        data=body,
        headers={'Content-Type': 'text/plain', 'User-Agent': 'curl/7.81.0'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read().decode('utf-8', 'replace'))
    except urllib.error.HTTPError as e:
        text = e.read().decode('utf-8', 'replace')
        try:
            return e.code, json.loads(text)
        except Exception:
            return e.code, {'message': text[:300]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--save-token', metavar='TOKEN', help='保存 token 到本地配置')
    ap.add_argument('--site', default=None, help=f'站点域名（默认 {SITE}）')
    ap.add_argument('--token', default=None, help='临时指定 token（不保存）')
    ap.add_argument('--sitemap', default=SITEMAP, help='sitemap 地址')
    ap.add_argument('--urls', nargs='*', help='只推送指定 URL')
    ap.add_argument('--all', action='store_true', help='忽略历史状态，推送 sitemap 全部链接（慎用：会消耗配额）')
    ap.add_argument('--dry-run', action='store_true', help='演练：只显示将要推送的链接')
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
        print('获取方式：百度搜索资源平台 → 资源提交 → 普通收录 → API 提交 → 复制接口调用地址中的 token')
        sys.exit(2)

    # 待推送链接
    if args.urls:
        urls = [u.strip() for u in args.urls if u.strip()]
        print(f'指定推送 {len(urls)} 条链接')
    else:
        urls = fetch_sitemap_urls(args.sitemap)
        print(f'从 sitemap 读取到 {len(urls)} 条链接：{args.sitemap}')
        state = load_state()
        pushed = set(state.get('pushed', []))
        if not args.all:
            urls = [u for u in urls if u not in pushed]
            print(f'其中尚未推送过的 {len(urls)} 条（已跳过 {len(pushed)} 条历史记录；用 --all 可强制全量）')

    if not urls:
        print('没有需要推送的新链接，结束（这是好事：不浪费配额）')
        return

    if len(urls) > BATCH:
        print(f'超过单次上限 {BATCH} 条，将分批推送')
    if args.dry_run:
        print('\n[演练模式] 将要推送：')
        for u in urls:
            print('  ' + u)
        print('\n演练结束，未实际提交。')
        return

    total_success = 0
    state = load_state()
    pushed = set(state.get('pushed', []))
    for i in range(0, len(urls), BATCH):
        batch = urls[i:i + BATCH]
        code, resp = push(site, token, batch)
        if code == 200:
            ok = resp.get('success', 0)
            total_success += ok
            print(f'HTTP 200  成功推送 {ok} 条  当天剩余配额 {resp.get("remain", "未知")}')
            if resp.get('not_same_site'):
                print(f'  非本站链接被忽略: {resp["not_same_site"][:5]}')
            if resp.get('not_valid'):
                print(f'  不合法链接: {resp["not_valid"][:5]}')
            pushed.update(batch)
        else:
            print(f'HTTP {code}  推送失败：{resp.get("message", resp)}')
            print(f'  可能原因：{ERROR_HINTS.get(code, "见百度官方文档")}')
            break

    state['pushed'] = sorted(pushed)
    save_state(state)
    print(f'\n合计成功推送 {total_success} 条；状态已记录到 {STATE}')


if __name__ == '__main__':
    main()
