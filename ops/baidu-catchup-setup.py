#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性补推：把内容已更新的工具页在百度配额恢复后（次日 08:30，早于每日 09:00 的常规推送）推给百度，
推完自动删除该定时任务，避免长期占用配额。

用法（服务器执行）: python3 baidu-catchup-setup.py
"""
import subprocess
import sys

MARK = 'baidu-catchup-once'
URLS = [
    'https://www.shuducw.com/tools/bonus-tax',
    'https://www.shuducw.com/tools/income-tax',
    'https://www.shuducw.com/tools/rmb-uppercase',
]
# 次日 08:30 执行（早于每日 09:00 常规推送，确保不与其抢配额）；执行后把自己从 crontab 删掉
# 注意：必须用 /usr/bin/python3 绝对路径——cron 的 PATH 很干净，裸 python3 可能找不到
CMD = (
    "30 8 8 10 * cd /root/baidu-push && /usr/bin/python3 push-baidu.py --urls "
    + ' '.join(URLS)
    + " >> /root/baidu-push/catchup.log 2>&1 ; crontab -l | grep -v %s | crontab -"
) % MARK

cur = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
lines = [l for l in (cur.stdout or '').splitlines() if l.strip() and MARK not in l]
lines.append(CMD)
new = '\n'.join(lines) + '\n'
subprocess.run(['crontab', '-'], input=new, text=True, check=True)
print('已写入 crontab 行:')
for l in lines:
    print('  ' + l)
print('\n当前 crontab 全文:')
print(subprocess.run(['crontab', '-l'], capture_output=True, text=True).stdout)
sys.exit(0)
