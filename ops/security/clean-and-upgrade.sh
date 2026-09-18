#!/bin/bash
echo "===== 清理 id=1 测试残留 ====="
python3 <<'EOF'
import json
p = '/var/www/shuducw-run/data/consultations.json'
d = json.load(open(p, encoding='utf-8'))
d = [c for c in d if c.get('id') != 1]
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('consultations now:', len(d))
EOF
echo ""
echo "===== 启动 apt 升级（后台 nohup）====="
nohup bash -c 'export DEBIAN_FRONTEND=noninteractive; apt-get update >> /root/apt-upgrade.log 2>&1; apt-get upgrade -y >> /root/apt-upgrade.log 2>&1; echo DONE >> /root/apt-upgrade.log' >/dev/null 2>&1 &
echo "apt upgrade started in background, log: /root/apt-upgrade.log"
