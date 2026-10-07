#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证本轮 6 处文案修正是否真的上线（新表述必须在、旧表述必须不在）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'https://www.shuducw.com'
CHECKS = [
    ('/faq', '小规模按月或按季（新）', r'选择按月或按季申报', True),
    ('/faq', '旧"以季度为纳税申报期"必须消失', r'以季度为纳税申报期', False),
    ('/faq', '无收入申报精确表述（新）', r'按税务机关核定的税（费）种和申报期限办理申报', True),
    ('/faq', '旧"各税种按期申报"必须消失', r'零申报（各税种按期申报）', False),
    ('/faq', '股权转让印花税减免提示（新）', r'六税两费', True),
    ('/faq', '更新日期（新）', r'更新于 2026 年 10 月', True),
    ('/faq', '旧更新日期必须消失', r'更新于 2026 年 9 月', False),
    ('/services/compliance', '金税四期降确定性（新）', r'真实可查', True),
    ('/services/compliance', '旧"四流一致是基本要求"必须消失', r'四流一致是基本要求', False),
    ('/about', '证据替代形容词（新）', r'资质与记录可查', True),
    ('/about', '旧"服务安全可靠"必须消失', r'服务安全可靠', False),
    # 注：咨询表单的①②③④清单位于"提交成功"状态，普通 GET 抓不到，
    # 只能做源码级校验（见下方 source_checks）。
]


def visible(html):
    html = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<style[^>]*>.*?</style>', ' ', html, flags=re.S | re.I)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html))


cache = {}
ok = fail = 0
for path, label, pat, should_exist in CHECKS:
    if path not in cache:
        try:
            with urllib.request.urlopen(urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'}), timeout=25) as r:
                cache[path] = visible(r.read().decode('utf-8', 'replace'))
        except Exception as e:
            print(f'  ❌ {path} 抓取失败: {e}')
            fail += 1
            continue
    found = bool(re.search(pat, cache[path]))
    good = found if should_exist else (not found)
    mark = '✅' if good else '❌'
    if good:
        ok += 1
    else:
        fail += 1
    state = '存在' if found else '不存在'
    print(f'  {mark} {path:<22} {label:<32} 实测:{state}')


print(f'\n  结果: {ok} 项通过 / {fail} 项失败')

# 源码级校验：仅"提交成功后"渲染的内容无法用 GET 验证
SRC = [
    ('src/components/consultation-form.tsx', r'按核定的税（费）种和期限办理零申报', True, '咨询表单清单（提交后可见）'),
    ('src/components/consultation-form.tsx', r'没有收入也要零申报', False, '咨询表单旧表述'),
]
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
print('\n  源码级校验（提交成功后渲染的内容，线上 GET 抓不到）:')
for rel, pat, should, label in SRC:
    p = root / rel
    txt = p.read_text(encoding='utf-8') if p.exists() else ''
    found = bool(re.search(pat, txt))
    good = found if should else (not found)
    if good:
        ok += 1
    else:
        fail += 1
    print(f'  {"✅" if good else "❌"} {label:<28} 实测:{"存在" if found else "不存在"}')
print(f'\n  最终: {ok} 项通过 / {fail} 项失败')
sys.exit(1 if fail else 0)
