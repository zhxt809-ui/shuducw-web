#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""扫描攻击 IP 处置：
  1) 生成 nginx 封锁清单 /etc/nginx/conf.d/block-scan-ips.conf（deny 指定 IP，http 级生效）
  2) 改前备份 + nginx -t 校验 + reload，失败自动回滚
  3) 机制自测：临时 deny 127.0.0.1 → 期望 403 → 移除 → 期望 200（证明拦截真的生效，而不是"配置写进去了"）
  4) 生成举报取证材料 /root/abuse-report-2026-10-08.md
刻意不封整个 Google Cloud 网段（34.0.0.0/8 等）：合法爬虫与用户也分布在 GCP，误伤代价远大于收益。"""
import datetime
import gzip
import os
import re
import subprocess
import time

CONF = '/etc/nginx/conf.d/block-scan-ips.conf'
STAMP = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
REVIEW = '2027-01-08'

# 近 4 天对本站做敏感路径探测、且从未拿到 200 的 IP（数据来源：scan-ip-report.py）
# 明确排除 8.152.3.67（本机自身审计流量）
SCAN_IPS = {
    '34.101.220.1': '1122 次全部 444，探测 .env 系列',
    '34.21.135.165': '1108 次全部 444，探测 .env 系列',
    '35.185.17.194': '1006 次全部 444，探测 .env 系列',
    '8.231.107.130': '452 次，探测 .env 系列',
    '35.229.235.80': '450 次',
    '199.102.44.194': '438 次，另冒充 ClaudeBot/python-requests',
    '185.93.89.167': '336 次',
    '34.65.72.53': '225 次',
    '104.208.73.227': '162 次',
    '20.210.186.186': '162 次',
    '34.47.57.247': '156 次，单 IP 冒充 7 种爬虫身份',
    '20.219.185.206': '150 次',
    '211.101.237.45': '104 次',
    '35.240.100.200': '102 次',
    '62.60.130.173': '94 次',
    '20.197.26.46': '72 次',
    '185.215.166.25': '64 次',
    '45.148.10.5': '55 次',
    '20.194.96.114': '50 次',
    '193.32.204.199': '48 次',
    '20.70.173.30': '36 次',
    '165.22.245.150': '28 次',
    '40.27.47.22': '21 次',
    '20.213.164.192': '20 次',
}


def sh(cmd, timeout=120):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    return (r.stdout or '') + (r.stderr or '')


def write_conf(path, body):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(body)


def reload_nginx():
    t = sh('nginx -t 2>&1')
    if 'successful' not in t:
        return False, t
    return True, sh('systemctl reload nginx 2>&1') or 'reload ok'


print('=' * 74)
print(f'  扫描攻击 IP 处置  {STAMP}')
print('=' * 74)

# ---------- 1. 写封锁清单 ----------
os.makedirs('/etc/nginx/conf.d', exist_ok=True)
backup = CONF + '.bak.' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
if os.path.exists(CONF):
    write_conf(backup, open(CONF, encoding='utf-8').read())
    print(f'  已有配置已备份: {backup}')

lines = [
    f'# 扫描/探测来源 IP 封锁清单  生成时间 {STAMP}  复核日期 {REVIEW}',
    '# 依据：近 4 天 nginx 日志，这些 IP 仅访问 .env/.git/@fs/ 等敏感路径，从未取得任何正常页面（无 200）。',
    '# 维护：新增/复查用 ops/security/scan-ip-report.py 重新统计；过期 IP 应删除，避免长期堆积误伤。',
    '# 刻意不封整个云厂商网段（如 34.0.0.0/8）：合法爬虫与用户同样分布其中。',
    '',
]
for ip, why in SCAN_IPS.items():
    lines.append(f'deny {ip};   # {why}')
write_conf(CONF, '\n'.join(lines) + '\n')
print(f'  已写入 {CONF}（{len(SCAN_IPS)} 条 IP）')

ok, out = reload_nginx()
print(f'  nginx -t + reload: {"✅ 成功" if ok else "❌ 失败"}')
if not ok:
    print('  ' + out.strip()[:400])
    if os.path.exists(backup):
        write_conf(CONF, open(backup, encoding='utf-8').read())
        sh('systemctl reload nginx 2>&1')
        print('  已回滚到备份版本')
    raise SystemExit(1)

# ---------- 2. 机制自测 ----------
# 注意：不能直接 curl https://www.shuducw.com —— 服务器访问自己的公网域名时，源地址是服务器自己的
# 外网 IP（经 NAT 回环），**不是 127.0.0.1**，deny 127.0.0.1 永远不会命中（首版自测就是这样误报"未通过"）。
# 必须用 --resolve 把域名指到 127.0.0.1 并保持 Host/SNI 为 www.shuducw.com，才真正走本站 server 块。
TEST = ("curl -s -o /dev/null -w '%{http_code}' -k -m 10 "
        "--resolve www.shuducw.com:443:127.0.0.1 https://www.shuducw.com/api/health")
body = open(CONF, encoding='utf-8').read()
baseline = sh(TEST).strip()
write_conf(CONF, body + '\ndeny 127.0.0.1;   # 临时自测\n')
sh('systemctl reload nginx 2>&1')
time.sleep(2)  # 必须等新 worker 接管：不加等待会打到旧 worker，得到假的"未生效"结论（本脚本首版即此坑）
code_blocked = sh(TEST).strip()
write_conf(CONF, body)
sh('systemctl reload nginx 2>&1')
time.sleep(2)
code_ok = sh(TEST).strip()
print(f'  机制自测（自 127.0.0.1 发起，Host=www.shuducw.com）：')
print(f'    封锁前基线 {baseline} → 临时 deny 127.0.0.1 后 {code_blocked}（期望 403）→ 移除后 {code_ok}（期望 200）')
print(f'    {"✅ 拦截机制确实生效" if code_blocked == "403" and code_ok == "200" else "❌ 自测未通过，请人工检查"}')
print('  说明：命中 location 中 return 404/444 的深链探测由 rewrite 阶段先应答（access 阶段不再执行），',
      '\n        deny 的作用是让这些 IP 无法再触达 Next.js 应用与正常页面。')

# ---------- 3. 举报取证材料 ----------
LINE = re.compile(r'(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<ts>[^\]]+)\] "(?P<req>[^"]*)" (?P<st>\d{3})')
targets = set(SCAN_IPS)
samples = {ip: [] for ip in targets}
counts = {ip: 0 for ip in targets}
files = sorted([os.path.join('/var/log/nginx', f) for f in os.listdir('/var/log/nginx')
                if 'access' in f and 'log' in f], key=os.path.getmtime)
for fp in files:
    try:
        opener = gzip.open if fp.endswith('.gz') else open
        with opener(fp, 'rt', encoding='utf-8', errors='replace') as fh:
            for line in fh:
                m = LINE.search(line)
                if not m or m.group('ip') not in targets:
                    continue
                ip = m.group('ip')
                counts[ip] += 1
                if len(samples[ip]) < 4:
                    samples[ip].append(line.rstrip()[:220])
    except Exception:  # noqa: BLE001
        pass

rep = ['# 网站扫描攻击举报材料', '',
       f'被攻击站点：https://www.shuducw.com （西安数度财务咨询有限公司官网，服务器位于阿里云）',
       f'统计时间：{STAMP}', '',
       '情况说明：以下 IP 在近期持续对本站发起漏洞扫描，请求路径集中于 `.env`、`.git`、'
       '`/@fs/proc/self/cwd/.env`、`/config.js`、`/wp-admin/...` 等敏感位置，'
       '其中部分 IP 还伪造百度、Google、Anthropic 等搜索/AI 爬虫的 User-Agent。'
       '这些请求全部未取得任何正常页面内容（无一次 HTTP 200），但持续消耗服务器资源并污染访问日志。',
       '', '## 按 IP 的证据', '']
for ip in SCAN_IPS:
    if not counts[ip]:
        continue
    rep += [f'### {ip}（{counts[ip]} 次请求，网段归属：见 RDAP）', '', '原始日志样例：', '', '```']
    rep += samples[ip]
    rep += ['```', '']
rep += ['## 投诉去向', '',
        '- GCP 网段（34.x / 35.x / 8.228.0.0/14 等）：`google-cloud-compliance@google.com`'
        '（Google Cloud 官方滥用举报，RDAP 登记的联系邮箱）',
        '- 199.102.44.194：`abuse@host4yourself.com`（H4Y Technologies LLC / iWebFusion）', '']
with open('/root/abuse-report-2026-10-08.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(rep))
print(f'  取证材料已生成: /root/abuse-report-2026-10-08.md（覆盖 {sum(1 for v in counts.values() if v)} 个 IP）')

print('\n  当前生效的封锁条数:', len([l for l in open(CONF, encoding='utf-8') if l.startswith('deny')]))
print('  确认本机审计 IP 8.152.3.67 未被封锁:',
      '✅ 未被封锁' if '8.152.3.67' not in open(CONF, encoding='utf-8').read() else '❌ 误封锁，需删除')
