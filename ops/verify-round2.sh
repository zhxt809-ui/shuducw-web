#!/bin/bash
B="https://www.shuducw.com"
echo "=== 新页面状态 ==="
for p in /privacy /self-check; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$B$p")
  echo "$p -> $code"
done
echo "=== 隐私页页脚入口 ==="
curl -s "$B/privacy" | grep -oE "隐私政策|信息收集范围|免责声明" | sort | uniq -c
echo "=== 首页页脚含隐私政策链接 ==="
curl -s "$B" | grep -oE 'href="/privacy"' | head -1
echo "=== 自查页关键元素 ==="
curl -s "$B/self-check" | grep -oE "账务风险自查|开始自查|3 道题" | sort | uniq -c
echo "=== 业务页免责声明 + 自查按钮 ==="
for p in /services/basic /services/compliance /services/consulting; do
  echo "-- $p --"
  curl -s "$B$p" | grep -oE "不构成个性化税务方案|账务风险自查" | sort | uniq -c
done
echo "=== 区县页免责声明 + 自查链接 ==="
curl -s "$B/services/district/gaoxin" | grep -oE "不构成个性化税务方案|账务风险自查" | sort | uniq -c
echo "=== 表单信任提示（首页表单所在页无表单? 检查联系页/自查页） ==="
curl -s "$B/contact" | grep -oE "持有代理记账资质的会计对接" | head -1
echo "=== 文章最后更新时间（选一篇较新文章） ==="
curl -s "$B/news/2026-caishui-4tiao-hongxian" | grep -oE "最后更新" | head -1
echo "=== FAQ 新条目 ==="
curl -s "$B/faq" | grep -oE "西安个体户不记账会有什么后果|西安电商个体户需要开对公账户吗|西安小规模企业季度申报流程" | sort | uniq -c
echo "=== 合规词巡检（业务页应无 避税/节税 营销用法） ==="
curl -s "$B/services/consulting" | grep -oE "逃税手段|避税工具|\"节税\"|\"避税\"" | sort | uniq -c
echo "=== sitemap 新页 ==="
curl -s "$B/sitemap.xml" | grep -oE "<loc>[^<]*(privacy|self-check)[^<]*</loc>" 
