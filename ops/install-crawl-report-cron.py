#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""安装/更新"每日抓取摘要报告"的 cron（幂等）：

  · 保留原有 crontab 条目（绝不覆盖，尤其 baidu-push）
  · 移除早期的单行版 crawl-digest.sh 条目（已被报告版取代）
  · 添加每天 00:15 运行 crawl-daily-report.py 的条目
  · 安装后立即跑一次并打印报告摘要，确认可用

只读 nginx 日志，不改动站点文件。
"""
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
REPORT_LINE = '15 0 * * * /usr/local/bin/crawl-daily-report.py >/dev/null 2>&1'
OLD_LINE_KEY = 'crawl-digest.sh'

cur = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
existing = cur.stdout if cur.returncode == 0 else ''
print('=== 原 crontab ===')
print(existing.rstrip() or '  (空)')

kept, removed = [], []
for ln in existing.split('\n'):
    if OLD_LINE_KEY in ln:
        removed.append(ln)
        continue
    if '每日抓取摘要（2026-10-06 安装，只读日志）' in ln:
        removed.append(ln)
        continue
    kept.append(ln)

if removed:
    print('\n移除的旧条目：')
    for ln in removed:
        print(f'  - {ln}')

body = '\n'.join(kept).rstrip('\n')
has_report = any('crawl-daily-report.py' in ln for ln in kept)
if has_report:
    print('\n✅ 报告 cron 已存在，未重复添加')
    new = body + '\n'
else:
    new = body + '\n# 每日抓取摘要报告（只读日志）\n' + REPORT_LINE + '\n'

p = subprocess.run(['crontab', '-'], input=new, text=True, capture_output=True)
print(f'\n写入 crontab 退出码: {p.returncode} {p.stderr.strip()}')
after = subprocess.run(['crontab', '-l'], capture_output=True, text=True).stdout
print('=== 安装后 crontab ===')
print(after.rstrip())
assert 'crawl-daily-report.py' in after, '报告 cron 未写入'
assert 'push-baidu.py' in after, '原有百度推送 cron 丢失！'
assert OLD_LINE_KEY not in after, '旧的单行摘要 cron 未清理'
print('\n✅ 报告 cron 已就位；原有百度推送条目保留；旧单行条目已清理')

print('\n=== 试跑今日报告（摘要尾部）===')
r = subprocess.run(['python3', '/usr/local/bin/crawl-daily-report.py'], capture_output=True, text=True)
print(r.stdout[-1200:] if r.stdout else f'  ⚠️ 无输出，stderr: {r.stderr[:500]}')
