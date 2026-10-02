#!/bin/bash
# 用 nginx 日志的 Referer 字段反查"现在到底有哪些外部站点链到我们"——比渠道清单更实在
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"

echo "===== 1. 全部外部来源（Referer 非本站、非空）按域名聚合 ====="
python3 - "$TMP" <<'PY'
import re, sys, urllib.parse
from collections import Counter
c = Counter()
with open(sys.argv[1], encoding='utf-8', errors='replace') as f:
    for line in f:
        m = re.search(r'"([^"]*)"\s*"([^"]*)"\s*$', line.rstrip())
        if not m:
            continue
        ref = m.group(2)
        if not ref or ref == '-':
            continue
        try:
            host = urllib.parse.urlparse(ref).netloc.lower()
        except Exception:
            continue
        if not host or 'shuducw.com' in host:
            continue
        c[host] += 1
print(f'  共有 {len(c)} 个外部来源域名')
for host, n in c.most_common(40):
    print(f'    {n:5} 次  {host}')
PY

echo ""
echo "===== 2. 其中来自高校/政府/协会等"高价值域名"的引用 ====="
python3 - "$TMP" <<'PY'
import re, sys, urllib.parse
from collections import Counter
kw = ('.edu.cn', '.gov.cn', '.org.cn', 'xaufe', 'association', 'xh.', 'org')
c = Counter()
with open(sys.argv[1], encoding='utf-8', errors='replace') as f:
    for line in f:
        m = re.search(r'"([^"]*)"\s*"([^"]*)"\s*$', line.rstrip())
        if not m:
            continue
        ref = m.group(2)
        if not ref or ref == '-':
            continue
        host = urllib.parse.urlparse(ref).netloc.lower()
        if not host or 'shuducw.com' in host:
            continue
        if any(k in host for k in kw):
            c[ref] += 1
if c:
    for ref, n in c.most_common(20):
        print(f'    {n:5} 次  {ref}')
else:
    print('    （无）')
PY

echo ""
echo "===== 3. 日志覆盖范围（避免用不足窗口下结论）====="
echo "  最早一条: $(head -1 "$TMP" | awk '{print $4}')"
echo "  最新一条: $(tail -1 "$TMP" | awk '{print $4}')"
echo "  总请求数: $(wc -l < "$TMP")"
rm -f "$TMP"
