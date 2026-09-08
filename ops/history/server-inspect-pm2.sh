#!/bin/bash
echo "=== pm2 describe ==="
pm2 describe shuducw 2>/dev/null | grep -Ei 'script path|exec cwd|args|status|uptime'
echo "=== pm2 jlist summary ==="
pm2 jlist 2>/dev/null | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception as e:
    print("parse err", e); sys.exit(0)
a = data[0] if data else {}
e = a.get("pm2_env", {})
env = e.get("env", {})
print("name:", a.get("name"))
print("pm_exec_path:", e.get("pm_exec_path"))
print("pm_cwd:", e.get("pm_cwd"))
print("args:", e.get("args"))
print("exec_interpreter:", e.get("exec_interpreter"))
print("env COZE:", env.get("COZE_PROJECT_DOMAIN_DEFAULT"))
print("env keys with COZE:", [k for k in env if "COZE" in k or "DOMAIN" in k])
'
