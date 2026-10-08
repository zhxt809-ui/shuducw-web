#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
交付前自检（离线、确定性、可重复执行）—— 把"事后发现"变成"提交前拦住"。

为什么有这个脚本（每条规则都对应一次真实事故，2026-10-01）：
  1. 用 PowerShell 的 Get-Content/Set-Content 改 AGENTS.md，PS 5.1 把无 BOM 的 UTF-8
     按 GBK 读、写回变乱码 → 文件被编码损坏，且当次提交还静默失败。
  2. git commit -m 用 PowerShell 双引号字符串（内部含 \" 与多行）导致参数被拆散，
     报 "did not pass any file(s) known to git"，而我只看 push 输出以为成功了。
  3. git checkout -- <file> 是从"索引"恢复，索引里正是坏版本，我还以为修好了。
  4. 只凭一条管道命令的输出就断言"crontab 是空的"，实际内容一直在。
  共同点：把"没被验证的判断"当成结论。本脚本把这些判断变成可执行检查。

用法：
  python ops/selfcheck.py                 # 全量检查（建议每次交付前跑）
  python ops/selfcheck.py --staged-only   # 只查本次将提交的文件（pre-commit 钩子用）
退出码：全部通过 0；存在 FAIL 1。
"""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import date

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXT_EXT = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.txt',
            '.css', '.sh', '.py', '.yml', '.yaml', '.html', '.xml'}
# GBK 误解码 UTF-8 中文时的特征字（单独出现即可疑，成串出现几乎必是乱码）
MOJIBAKE_STRONG = ['\u9225', '\u951b', '\u9286', '\u9428', '\u93b4', '\u935c', '\u7f02', '\u9352', '\u7481', '\u941c', '\u93c2\u56e6', '\u9422\u3126', '\u6d93\u5d88', '\u93c4\u5267', '\u934f\u5145', '\u7eef\u8364', '\u93c1\u7248', '\u9365\u3224']
MOJIBAKE_WEAK = set('\u9225\u951b\u9286\u9428\u93b4\u935c\u7f02\u9352\u7481\u941c\u93c8\u93c2\u56e9\u6564\u6d93\u5d86\u69f8\u5267\u934f\u5145\u7eef\u8364\u93c1\u7248\u9365\u3224\u7490\u7ecb\u93c4\u9366\u93b5\u7f03\u7481\u93c7\u7ed4\u7f01\u941e\u935a\u7487\u701b\u93c3\u93cb\u9429\u93cd\u93c9')
# 站内绝不允许出现的第三方平台（长期要求）
BANNED_PLATFORMS = ['知乎', '百家号', '百家', '黄页']
# 违规承诺/绝对化用语（命中人工复核）
# 注意：不要收录"国家级"这类词——西安高新区/西咸新区的"国家级"是官方事实性称谓，
# 属正常表述；只有把它用作自身资质/水平宣称时才违规，故只匹配这类组合，避免误报。
RISKY_CLAIMS = ['包过', '保证通过', '必过', '100%成功', '绝对安全', '零风险', '无风险',
                '最专业', '全市第一', '国家级资质', '国家级认证', '国家级团队', '国家级水平']

results = []


def record(name, ok, fails=None, warns=None, note=''):
    results.append({'name': name, 'ok': ok, 'fails': fails or [], 'warns': warns or [], 'note': note})


def run_git(args):
    try:
        out = subprocess.run(['git'] + args, cwd=ROOT, capture_output=True, text=True,
                             encoding='utf-8', errors='replace')
        return out.stdout
    except Exception:
        return ''


def tracked_files():
    return [f for f in run_git(['ls-files']).splitlines() if f.strip()]


def staged_files():
    out = run_git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
    return [f for f in out.splitlines() if f.strip()]


def is_text_candidate(path, ext):
    """是否按文本检查：已知文本扩展名，或无扩展名但确实是 UTF-8 文本（如 git 钩子脚本）"""
    if ext in TEXT_EXT:
        return True
    if ext:
        return False
    try:
        raw = open(path, 'rb').read(8192)
    except Exception:
        return False
    if b'\x00' in raw:  # 二进制
        return False
    try:
        raw.decode('utf-8')
        return True
    except UnicodeDecodeError:
        return False


def check_encoding(files):
    """A. UTF-8 可解码、无替换字符 U+FFFD、无 GBK 乱码特征"""
    fails, warns = [], []
    checked = 0
    for rel in files:
        ext = os.path.splitext(rel)[1].lower()
        path = os.path.join(ROOT, rel)
        if not os.path.isfile(path):
            continue
        if not is_text_candidate(path, ext):
            continue
        checked += 1
        raw = open(path, 'rb').read()
        if raw.startswith(b'\xef\xbb\xbf'):
            warns.append(f'{rel}: 含 UTF-8 BOM（建议去掉）')
        try:
            text = raw.decode('utf-8')
        except UnicodeDecodeError as e:
            fails.append(f'{rel}: 不是合法 UTF-8（{e.reason} @byte {e.start}）')
            continue
        if '\ufffd' in text:
            fails.append(f'{rel}: 含替换字符 U+FFFD（发生过有损转码）')
        for line_no, line in enumerate(text.splitlines(), 1):
            if any(sig in line for sig in MOJIBAKE_STRONG):
                fails.append(f'{rel}:{line_no}: 疑似 GBK 乱码 → {line.strip()[:60]}')
                break
            weak_hits = sum(1 for ch in line if ch in MOJIBAKE_WEAK)
            if weak_hits >= 3:
                fails.append(f'{rel}:{line_no}: 疑似乱码（{weak_hits} 个特征字） → {line.strip()[:60]}')
                break
    record('A 编码/乱码检查', not fails, fails, warns, f'已检查 {checked} 个文本文件')


def check_banned_platforms(files):
    """B. 站内文件不得出现知乎/百家/黄页等平台名"""
    fails = []
    scope = [f for f in files if f.startswith('src/') or f.startswith('public/')]
    for rel in scope:
        path = os.path.join(ROOT, rel)
        if not os.path.isfile(path) or os.path.splitext(rel)[1].lower() not in TEXT_EXT:
            continue
        try:
            text = open(path, encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        for bad in BANNED_PLATFORMS:
            if bad in text:
                for line_no, line in enumerate(text.splitlines(), 1):
                    if bad in line:
                        fails.append(f'{rel}:{line_no}: 出现"{bad}" → {line.strip()[:70]}')
                        break
    record('B 禁用平台名（站内）', not fails, fails, [], f'扫描 {len(scope)} 个站内文件')


def check_risky_claims(files):
    """C. 违规承诺/绝对化用语（只告警，人工判定）"""
    warns = []
    scope = [f for f in files if f.startswith('src/') or f.startswith('public/')]
    for rel in scope:
        path = os.path.join(ROOT, rel)
        if not os.path.isfile(path) or os.path.splitext(rel)[1].lower() not in TEXT_EXT:
            continue
        text = open(path, encoding='utf-8', errors='replace').read()
        for word in RISKY_CLAIMS:
            if word in text:
                warns.append(f'{rel}: 命中"{word}"（请人工确认是否合规表述）')
    record('C 绝对化/承诺用语', True, [], warns, '仅告警，需人工判定')


def check_secret_leak(all_files, staged):
    """D. 密钥不得进入仓库、不得出现在受版本控制的文件里"""
    fails = []
    cfg = os.path.join(ROOT, 'ops', 'content', 'baidu-push.config.json')
    token = None
    if os.path.isfile(cfg):
        try:
            token = json.load(open(cfg, encoding='utf-8')).get('token')
        except Exception:
            token = None
    for must_ignore in ['ops/content/baidu-push.config.json', 'ops/content/sogou-push.config.json']:
        if must_ignore in all_files:
            fails.append(f'{must_ignore}: 已被 git 跟踪（含 token，必须从版本控制移除）')
    if any(f.startswith('ops/content/.push-state/') for f in all_files):
        fails.append('ops/content/.push-state/ 下的状态文件已被 git 跟踪')
    if token:
        for rel in all_files:
            path = os.path.join(ROOT, rel)
            if not os.path.isfile(path) or os.path.getsize(path) > 2_000_000:
                continue
            try:
                if token in open(path, encoding='utf-8', errors='ignore').read():
                    fails.append(f'{rel}: 出现推送 token（密钥泄漏）')
            except Exception:
                continue
    record('D 密钥泄漏检查', not fails, fails, [],
           '已核对 token 是否出现在受控文件中' if token else '未找到本地 token 配置，跳过内容比对')


def check_lastmod_data():
    """E. page-lastmod.json 结构正确、无未来日期、含通配规则"""
    fails, warns = [], []
    path = os.path.join(ROOT, 'src', 'data', 'page-lastmod.json')
    if not os.path.isfile(path):
        fails.append('src/data/page-lastmod.json 不存在（应运行 node scripts/gen-page-lastmod.mjs）')
        record('E lastmod 数据', False, fails, warns)
        return
    try:
        data = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        record('E lastmod 数据', False, [f'JSON 解析失败: {e}'], warns)
        return
    today = date.today().isoformat()
    for k, v in data.items():
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(v)):
            fails.append(f'{k}: 日期格式错误 {v}')
        elif str(v) > today:
            fails.append(f'{k}: 日期在未来 {v}（lastmod 不得早于/晚于事实）')
    for need in ['/news/*', '/services/district/*']:
        if need not in data:
            warns.append(f'缺少通配规则 {need}（对应动态页面会回退部署时间）')
    record('E lastmod 数据', not fails, fails, warns, f'{len(data)} 条路由日期')


def check_articles_data():
    """F. 文章数据可解析、必填字段齐全、分类合法"""
    fails = []
    path = os.path.join(ROOT, 'data', 'articles.json')
    if not os.path.isfile(path):
        record('F 文章数据', True, [], [], '本地无 data/articles.json，跳过')
        return
    try:
        data = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        record('F 文章数据', False, [f'JSON 解析失败: {e}'], [])
        return
    items = data if isinstance(data, list) else data.get('articles', [])
    allowed = {'cases', 'shilu', 'tips', 'policies'}
    for a in items:
        slug = a.get('slug')
        if not slug:
            fails.append(f'存在无 slug 的文章: {str(a)[:60]}')
        if a.get('is_published') and a.get('category') not in allowed:
            fails.append(f'{slug}: 分类非法 {a.get("category")}（允许 {sorted(allowed)}）')
    record('F 文章数据', not fails, fails, [], f'{len(items)} 篇文章')


def check_git_hygiene(all_files):
    """G. 构建产物/打包文件不得进入版本控制"""
    fails = []
    for f in all_files:
        if re.match(r'^deploy-.*\.tar\.gz$', f) or f.startswith('.deploy-stage/'):
            fails.append(f'{f}: 构建产物不应提交')
    record('G git 卫生', not fails, fails, [], f'共 {len(all_files)} 个受控文件')


def check_policy_ledger():
    """H. 政策更新台账：涉及页面是否存在 + 政策是否临近到期/已过期

    站内工具页与 llms.txt 直接写着政策口径，其中多条带明确执行到期日
    （增值税优惠衔接、个体户减半、年终奖单独计税均为 2027-12-31）。
    政策到期而页面未更新 = 对外发布失效口径，故在自检里做成告警。
    详细报告与按日期模拟用 ops/policy-ledger-check.py。
    """
    path = os.path.join(ROOT, 'ops', 'policy-ledger.json')
    try:
        with open(path, encoding='utf-8') as f:
            ledger = json.load(f)
    except (OSError, ValueError) as e:
        record('H 政策更新台账', False, [f'台账读取失败: {e}'], [])
        return
    window = int(ledger.get('_预警窗口天数', 180))
    policies = ledger.get('policies', [])
    today = date.today()
    fails, warns = [], []
    for p in policies:
        pid = p.get('id', '?')
        for rel in p.get('涉及页面', []):
            if not os.path.exists(os.path.join(ROOT, rel)):
                fails.append(f'{pid}: 涉及页面不存在 {rel}（页面已改名或删除，需同步台账）')
        expiry = p.get('执行到期日')
        if expiry:
            days = (date.fromisoformat(expiry) - today).days
            if days < 0:
                fails.append(f'{pid}: 政策已于 {expiry} 到期（{-days} 天前），必须复核是否延续并更新页面与 llms.txt')
            elif days <= window:
                warns.append(f'{pid}: 将于 {expiry} 到期（还有 {days} 天），需复核政策是否延续')
    record('H 政策更新台账', not fails, fails, warns, f'{len(policies)} 条政策，预警窗口 {window} 天')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--staged-only', action='store_true', help='只检查本次暂存的文件')
    args = ap.parse_args()

    all_files = tracked_files()
    scope = staged_files() if args.staged_only else all_files
    if args.staged_only and not scope:
        print('没有暂存文件，自检通过。')
        return 0

    mode = '仅暂存文件' if args.staged_only else '全量'
    print(f'===== 交付前自检（{mode}，共 {len(scope)} 个文件）=====')
    check_encoding(scope)
    check_banned_platforms(scope)
    check_risky_claims(scope)
    check_secret_leak(all_files, scope)
    if not args.staged_only:
        check_lastmod_data()
        check_articles_data()
        check_git_hygiene(all_files)
        check_policy_ledger()

    failed = 0
    for r in results:
        mark = 'PASS' if r['ok'] else 'FAIL'
        print(f'[{mark}] {r["name"]}  {r["note"]}')
        for f in r['fails']:
            print(f'         ✗ {f}')
            failed += 1
        for w in r['warns']:
            print(f'         ! {w}')

    print('')
    if failed:
        print(f'自检未通过：{failed} 项问题，请修复后再提交。')
        return 1
    print('自检全部通过 ✅')
    return 0


if __name__ == '__main__':
    sys.exit(main())
