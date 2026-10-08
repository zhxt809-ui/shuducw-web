#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修正百度补推 cron：删除从未执行且自删逻辑失效的 08:30 一次性任务，并用当天剩余配额补推新页面。
只改 crontab（改前备份），不改动任何站点文件。"""
import datetime
import subprocess

STAMP = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')


def sh(cmd, timeout=180):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    return (r.stdout or '') + (r.stderr or '')


old = sh('crontab -l')
open(f'/root/crontab.bak.{STAMP}', 'w', encoding='utf-8').write(old)
print('crontab 已备份到 /root/crontab.bak.' + STAMP)

kept = [ln for ln in old.splitlines() if '30 8 8 10' not in ln]
removed = [ln for ln in old.splitlines() if '30 8 8 10' in ln]
print('删除的行数:', len(removed))
for ln in removed:
    print('  -', ln[:120], '...')

if removed:
    p = subprocess.run('crontab -', shell=True, input='\n'.join(kept) + '\n', text=True,
                       capture_output=True, timeout=60)
    print('crontab 写入结果:', (p.stdout or '') + (p.stderr or '') or 'OK')

print('\n当前 crontab：')
now = sh('crontab -l')
print('  ' + now.replace('\n', '\n  ').strip())

print('\n是否仍存在 08:30 补推行:', '✅ 已清除' if '30 8 8 10' not in now else '❌ 仍存在')
print('每日 09:00 常规推送是否保留:', '✅ 保留' if 'push-baidu.py' in now else '❌ 丢失')

print('\n用当天剩余配额补推最重要的两个新页面（/tools 与 /tools/bonus-tax）：')
out = sh('cd /root/baidu-push && /usr/bin/python3 push-baidu.py --urls '
         'https://www.shuducw.com/tools https://www.shuducw.com/tools/bonus-tax', timeout=180)
print('  ' + out.replace('\n', '\n  ').strip())
