#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第四轮 ChatGPT 评审采纳项 · 线上验收（2026-10-12）

检查本轮改动的 6 组页面：
1. 服务交付页：编号去重（<ol>→<ul>）、「审计报告」→「核查报告」
2. 基础财税服务页：费用分档展示 + 自有团队承接声明
3. 联系页/表单：自有团队承接说明块 + 承诺软化
4. 隐私政策/服务页/自检页：去掉「持有代理记账资质的会计」错误表述
5. 首页小红书模块：精准落地链接（landingUrl）
6. 全局：确认旧表述残留为 0
"""
import html as html_entities
import re
import sys
import time
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (compatible; round4-audit)'}
BASE = 'https://www.shuducw.com'


def fetch(path, twice=False):
    def once():
        raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
        return re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)
    if twice:
        once()  # 第一次：触发 ISR 重建（可能返回旧副本）
        time.sleep(4)
    return once()  # 第二次：拿到新副本


home = fetch('/', twice=True)
pages = {
    '首页': home,
    '业务范围': fetch('/services'),
    '基础财税页': fetch('/services/basic', twice=True),
    '交付页': fetch('/services/delivery', twice=True),
    '联系页': fetch('/contact', twice=True),
    '自检页': fetch('/self-check', twice=True),
    '隐私政策': fetch('/privacy'),
    '客户案例': fetch('/cases'),
}
all_text = '\n'.join(pages.values())
bad = 0


def check(name, ok, detail=''):
    global bad
    if not ok:
        bad += 1
    print(f'    {"✅" if ok else "❌"} {name}' + (f'  {detail}' if detail else ''))


print('① 服务交付页编号去重与交付物口径：')
check('交付页无「1. 1需求访谈」重复编号', '1. 1需求访谈' not in pages['交付页'] and '1需求访谈' not in pages['交付页'])
check('交付页含徽章编号+步骤（需求访谈）', '需求访谈' in pages['交付页'])
check('交付页交付物为「核查报告」', '核查报告' in pages['交付页'])
check('交付页无「审计报告」残留', '审计报告' not in pages['交付页'])

print('② 基础财税服务页费用分档与承接说明：')
check('含「代理记账费用参考」分档区', '代理记账费用参考' in pages['基础财税页'])
check('含「2,000–4,000 元/年」分档价格', '2,000–4,000 元/年' in pages['基础财税页'])
check('含三档（小规模/一般纳税人/个体户）', all(k in pages['基础财税页'] for k in ['小规模纳税人', '一般纳税人', '个体户']))
check('含「自有专业团队直接承接并实施，不转包给第三方」', '自有专业团队直接承接并实施，不转包给第三方' in pages['基础财税页'])
check('无旧「代账参考区间」残留', '代账参考区间' not in pages['基础财税页'])

print('③ 表单/联系页承接说明与承诺软化：')
check('表单区含「本公司持有《代理记账许可证书》」', '本公司持有《代理记账许可证书》' in pages['联系页'] or '本公司持有《代理记账许可证书》' in home)
check('表单区含「自有专业服务团队将与您联系」', '自有专业服务团队将与您联系' in pages['联系页'] or '自有专业服务团队将与您联系' in home)
check('联系页承诺已软化（含「在法律法规及服务合同约定范围内」）', '在法律法规及服务合同约定范围内开展工作' in pages['联系页'])
check('联系页无「确保落地见效」', '确保落地见效' not in pages['联系页'])
check('联系页无「持证专家团队，全程合法合规」', '持证专家团队，全程合法合规' not in pages['联系页'])

print('④ 错误表述「持有代理记账资质的会计」全站清空：')
hit_pages = [k for k, v in pages.items() if '持有代理记账资质的会计' in v]
check('8 个被测页面该表述均为 0', not hit_pages, f'命中: {hit_pages}' if hit_pages else '')

print('⑤ 首页小红书精准落地链接：')
check('首页含「相关：账务风险自查」落地链接', '相关：账务风险自查' in home)
check('首页含「相关：基础财税服务」落地链接', '相关：基础财税服务' in home)

print('⑥ 隐私政策/自检页表述更新：')
check('隐私政策含「自有专业服务团队与您对接」', '自有专业服务团队与您对接' in pages['隐私政策'])
check('自检页含「由本公司专业服务团队对接」', '由本公司专业服务团队对接' in pages['自检页'])

print()
print('结果：' + ('全部通过 ✅' if bad == 0 else f'{bad} 项失败 ❌'))
sys.exit(1 if bad else 0)
