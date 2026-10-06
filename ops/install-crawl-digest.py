#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在服务器上安装/更新"每日抓取摘要"：
   1) 上传 ops/crawl-digest.sh 到 /usr/local/bin/crawl-digest.sh 并加执行权限
   2) 确保 crontab 中存在每天 00:10 的条目（幂等，保留现有 crontab 内容，绝不覆盖）
   3) 立即跑一次，写入基线行
只读 nginx 日志，不改动站点文件。
"""
import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CRON_LINE = '10 0 * * * /usr/local/bin/crawl-digest.sh >/dev/null 2>&1'

cur = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
existing = cur.stdout if cur.returncode == 0 else ''
print('=== 当前 crontab ===')
print(existing.rstrip() or '  (空)')

if 'crawl-digest.sh' in existing:
    print('\n✅ 抓取摘要 cron 已存在，未重复添加')
else:
    new = existing.rstrip('\n') + '\n# 每日抓取摘要（2026-10-06 安装，只读日志）\n' + CRON_LINE + '\n'
    p = subprocess.run(['crontab', '-'], input=new, text=True, capture_output=True)
    print(f'\n投放 crontab 结果: 退出码 {p.returncode} {p.stderr.strip()}')
    after = subprocess.run(['crontab', '-l'], capture_output=True, text=True).stdout
    print('=== 安装后 crontab ===')
    print(after.rstrip())
    assert 'crawl-digest.sh' in after, 'cron 未写入成功'
    assert 'baidu-push' in after, '原有 baidu-push cron 丢失！'
    print('\n✅ 已添加，且原有 baidu-push 条目保留')

print('\n=== 立即跑一次（建立基线）===')
r = subprocess.run(['bash', '/usr/local/bin/crawl-digest.sh'], capture_output=True, text=True)
print(f'  退出码 {r.returncode} {r.stderr.strip()}')
if os.path.exists('/var/log/crawl-digest.log'):
    with open('/var/log/crawl-digest.log', encoding='utf-8') as f:
        lines = f.read().rstrip('\n').split('\n')
    print('  摘要文件最后 3 行：')
    for ln in lines[-3:]:
        print('    ' + ln)
    print('\n  格式说明：引擎:当天抓到内容页数/累计内容页数；baidu_sitemap_hits 为百度当天读 sitemap 次数')
