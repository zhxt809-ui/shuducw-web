#!/bin/bash
# 校验仓库中的 nginx 配置副本与线上一字不差（防止配置漂移）
LIVE="/etc/nginx/sites-enabled/shuducw"
REPO="/tmp/nginx-repo.conf"
echo "===== diff 线上 vs 仓库副本（无输出=完全一致）====="
if diff -u "$LIVE" "$REPO"; then
  echo "  [OK] 两边完全一致，无漂移"
  echo "  行数: 线上 $(wc -l < "$LIVE") / 仓库 $(wc -l < "$REPO")"
else
  echo "  [警告] 存在差异（上方为 diff）"
fi
echo ""
echo "===== 行数一致性与结尾换行检查 ====="
echo "  线上末字节: $(tail -c 1 "$LIVE" | xxd -p)"
echo "  仓库末字节: $(tail -c 1 "$REPO" | xxd -p)"
echo ""
echo "===== 语法复检 ====="
nginx -t 2>&1 | sed 's/^/  /'
