#!/bin/bash
ENV=/var/www/shuducw-run/.env.production
echo "=== before ==="
grep -c "ADMIN_API_PASSWORD" "$ENV" 2>/dev/null || echo "0 (未配置)"
if ! grep -q "^ADMIN_API_PASSWORD=" "$ENV"; then
  echo "" >> "$ENV"
  echo "# 管理后台服务端鉴权密码（2026-09-06 新增，API 操作必须携带）" >> "$ENV"
  echo "ADMIN_API_PASSWORD=<你的管理密码>" >> "$ENV"
  echo "已追加 ADMIN_API_PASSWORD"
fi
echo "=== after (脱敏显示) ==="
grep -E "^(ADMIN_API_PASSWORD|NEXT_PUBLIC_ADMIN_PASSWORD)=" "$ENV" | sed 's/=.*/=<已配置>/'
echo "=== 其他关键变量确认 ==="
grep -E "^(COZE_PROJECT_DOMAIN_DEFAULT|DATA_DIR)=" "$ENV"
