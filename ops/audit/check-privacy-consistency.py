#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""隐私政策「声明」与「实际实现」一致性检查（ChatGPT 第三轮评审第 5 项）。

检查两件事：
① 隐私政策声明的处理方式（统计工具、Cookie、IP、删除权、更新时间、联系方式）是否与站点实际使用的一致；
② 咨询表单附近是否有可点的隐私政策入口，以及是否提示不要提交敏感信息。
"""
import html
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'https://www.shuducw.com'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; audit)'}


def get(path):
    raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
    return re.sub(r'<!--.*?-->', '', html.unescape(raw), flags=re.S)


pv = get('/privacy')
home = get('/')
contact = get('/contact')

print('=== ① 隐私政策声明的要点 ===')
for k in ['百度统计', 'Cookie', 'IP 地址', '删除', '更新', '邮箱', '电话', '第三方']:
    print(f'    「{k}」出现 {pv.count(k)} 处')

print()
print('=== ② 站点实际使用的统计/埋点（与声明比对） ===')
print('    首页存在百度统计脚本(hm.baidu.com):', 'hm.baidu.com' in home)
print('    首页存在自建埋点上报(/api/analytics):', '/api/analytics' in home)
print('    首页存在第三方字体/外链资源需 Cookie 提示:', bool(re.search(r'fonts\.googleapis|cdn\.jsdelivr', home)))

print()
print('=== ③ 表单附近的隐私提示（本轮新增项） ===')
print('    联系页有 /privacy 入口:', '/privacy' in contact)
print('    联系页有敏感信息提示:', '敏感信息' in contact)
print('    首页表单区有敏感信息提示:', '敏感信息' in home)
print('    首页/联系页有隐私政策文字入口:', ('隐私政策' in contact) or ('隐私政策' in home))

print()
print('=== ④ 隐私政策更新时间 ===')
m = re.search(r'更新[日时]期[：:]\s*([0-9]{4}[-年][0-9]{1,2}[-月][0-9]{1,2}日?)', pv)
print('    页面标注的更新时间:', m.group(1) if m else '未找到（需人工确认是否有「更新日期」标注）')
