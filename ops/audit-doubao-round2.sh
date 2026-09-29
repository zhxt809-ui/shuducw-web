#!/bin/bash
B="https://www.shuducw.com"
echo "===== 豆包① 首页留资表单（我上午刚加的） ====="
home=$(curl -s "$B/")
echo "  select: $(echo "$home" | grep -o '<select' | wc -l)  input: $(echo "$home" | grep -o '<input' | wc -l)"
echo "  '30 秒留资': $(echo "$home" | grep -c '30 秒留资')  '提交，等顾问联系': $(echo "$home" | grep -c '提交，等顾问联系')"
echo ""
echo "===== 豆包⑤ 文章底部公私域导流（我上午刚加的） ====="
art=$(curl -s "$B/news/2026-shuiwujicha-zhongdian")
echo "  小红书链接: $(echo "$art" | grep -c '6521552259')  企微码: $(echo "$art" | grep -c 'qr-wecom')  自查入口: $(echo "$art" | grep -c '/self-check')"
echo ""
echo "===== 豆包② 服务页报价位置 ====="
echo "--- /services 总览页 费用参考模块 ---"
echo "  '服务费用参考': $(curl -s $B/services | grep -c '服务费用参考')"
echo "--- /services/basic 价格出现位置（标题后第几个区块） ---"
curl -s $B/services/basic > /tmp/basic.html
echo "  '2000-4000' 次数: $(grep -o '2000-4000' /tmp/basic.html | wc -l)"
python3 - <<'EOF'
import re
t = open('/tmp/basic.html').read()
# 找价格第一次出现的字节位置 vs 页面总长
i = t.find('2000-4000')
print(f"  价格首次出现位置: {i}/{len(t)} ({round(100*i/len(t))}% 处)")
# 页面主要区块 h2 位置
h2s = [(m.start(), re.sub(r'<[^>]+>','',m.group(0))[:30]) for m in re.finditer(r'<h2[^>]*>[^<]{0,60}', t)][:12]
prev = ''
for pos, name in h2s:
    mark = ' ← 价格在这之后' if pos < i else ''
    print(f"    {pos:7d}  {name}{mark}")
EOF
echo ""
echo "===== 豆包④ 区县页 FAQ 数量对齐（它说 gaoxin 是标杆） ====="
for d in gaoxin weiyang lianhu yanta changan xixian xincheng beilin baqiao; do
  n=$(curl -s "$B/services/district/$d" | python3 -c "import sys,re; t=sys.stdin.read(); print(len(re.findall(r'\"@type\":\"Question\"', t)))")
  echo "  $d -> $n 条 FAQ"
done
