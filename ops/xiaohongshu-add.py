#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在服务器上新增/更新「小红书近期笔记」（首页 ISR 约 60 秒后自动生效，无需重新部署）

用法（在服务器 /root 下执行）：
    python3 xiaohongshu-add.py "笔记标题" "分享链接" ["2026-10"]
    python3 xiaohongshu-add.py --list
    python3 xiaohongshu-add.py --remove "<分享链接或链接前缀>"

规则：
    · 链接必须含 xsec_token —— 实测去掉 token 会被小红书重定向到 404，访客打不开；
    · 同一链接重复添加只更新时间顺序（最新放最前），不会产生重复条目；
    · 最多保留 6 条，超出自动淘汰最旧的；
    · 写前自动备份为 xiaohongshu-notes.json.bak-<时间戳>；
    · 标题会自动去掉" - 数度财税"" | 小红书"等分享文案后缀，并做长度校验。
"""
import json
import os
import re
import shutil
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
DATA_DIR = os.environ.get('DATA_DIR', '/var/www/shuducw-run/data')
PATH = os.path.join(DATA_DIR, 'xiaohongshu-notes.json')
MAX_NOTES = 6
ALLOWED_HOSTS = ('www.xiaohongshu.com', 'xiaohongshu.com', 'xhslink.com', 'www.xhslink.com')


def load():
    if not os.path.exists(PATH):
        return []
    try:
        with open(PATH, encoding='utf-8') as f:
            data = json.load(f)
        return data if isinstance(data, list) else data.get('notes', [])
    except (OSError, ValueError) as e:
        print(f'❌ 读取失败（避免覆盖，已中止）：{e}')
        sys.exit(1)


def save(notes):
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(PATH):
        bak = f'{PATH}.bak-{datetime.now():%Y%m%d-%H%M%S}'
        shutil.copy2(PATH, bak)
        print(f'  备份: {bak}')
    tmp = PATH + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)
        f.write('\n')
    os.replace(tmp, PATH)


def clean_title(t):
    t = re.sub(r'\s*[\|\-–—]\s*数度财税.*$', '', t)
    t = re.sub(r'\s*\|\s*小红书.*$', '', t)
    t = re.sub(r'\s*[-–—]\s*你的生活兴趣社区.*$', '', t)
    return t.strip()


def validate_url(url):
    if not url.startswith('https://'):
        return '链接必须以 https:// 开头'
    host = re.sub(r'^https://([^/]+).*$', r'\1', url).split(':')[0].lower()
    if host not in ALLOWED_HOSTS:
        return f'不是小红书域名（{host}）'
    if 'xsec_token=' not in url:
        return ('链接缺少 xsec_token。实测去掉 token 会被小红书重定向到 404 页（访客打不开）。'
                '请用 App 内「分享 → 复制链接」得到的原始链接。')
    return None


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 1

    notes = load()

    if args[0] == '--list':
        print(f'当前 {len(notes)} 条（文件: {PATH}）')
        for i, n in enumerate(notes, 1):
            print(f'  {i}. {n.get("title","(无标题)")}')
            print(f'     {n.get("url","")[:110]}')
            if n.get('date'):
                print(f'     日期: {n["date"]}')
        return 0

    if args[0] == '--remove':
        if len(args) < 2:
            print('用法: --remove "<链接或链接前缀>"')
            return 1
        key = args[1]
        kept = [n for n in notes if not n.get('url', '').startswith(key)]
        if len(kept) == len(notes):
            print('⚠️ 未找到匹配的笔记，未改动')
            return 1
        save(kept)
        print(f'✅ 已删除 {len(notes) - len(kept)} 条，剩余 {len(kept)} 条')
        return 0

    if len(args) < 2:
        print('用法: xiaohongshu-add.py "标题" "分享链接" ["2026-10"]')
        return 1

    title = clean_title(args[0])
    url = args[1].strip()
    date = args[2].strip() if len(args) > 2 else ''

    if not title:
        print('❌ 标题为空')
        return 1
    if len(title) > 40:
        print(f'⚠️ 标题 {len(title)} 字偏长（首页一行放不下，建议 ≤ 25 字）：{title}')
    err = validate_url(url)
    if err:
        print(f'❌ {err}')
        return 1

    note = {'title': title, 'url': url}
    if date:
        note['date'] = date

    notes = [n for n in notes if n.get('url') != url]
    notes.insert(0, note)
    dropped = notes[MAX_NOTES:]
    notes = notes[:MAX_NOTES]
    save(notes)

    print(f'✅ 已加入: {title}')
    print(f'   链接: {url[:100]}')
    if date:
        print(f'   日期: {date}')
    else:
        print('   日期: （未提供，首页不显示日期）')
    if dropped:
        print(f'   已淘汰最旧 {len(dropped)} 条（上限 {MAX_NOTES} 条）')
    print(f'   当前共 {len(notes)} 条；首页约 60 秒后自动更新（无需重新部署）')
    return 0


if __name__ == '__main__':
    sys.exit(main())
