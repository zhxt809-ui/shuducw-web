#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""后台咨询记录「状态修改 + 删除」上线验收（2026-10-08）
在服务器本机执行：读服务端 ADMIN_API_PASSWORD 调用自家 API，全程不打印密钥。
删除前先备份 data/consultations.json；删除接口会把被删记录原样回传，便于恢复。"""
import datetime
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'http://127.0.0.1:3000'
ENVF = '/var/www/shuducw-run/.env.production'
DATAF = '/var/www/shuducw-run/data/consultations.json'


def token():
    if not os.path.exists(ENVF):
        return None
    for line in open(ENVF, encoding='utf-8', errors='replace'):
        if line.strip().startswith('ADMIN_API_PASSWORD='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    return None


def call(method, path, body=None, tok=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
    if tok:
        req.add_header('x-admin-token', tok)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, json.loads(r.read().decode('utf-8', 'replace') or '{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode('utf-8', 'replace') or '{}')
        except Exception:  # noqa: BLE001
            return e.code, {}


TOK = token()
print('=' * 72)
print('  后台咨询记录「状态修改 + 删除」上线验收')
print('=' * 72)
print(f'  服务端是否读到 ADMIN_API_PASSWORD: {"✅ 已读取（不显示内容）" if TOK else "❌ 未找到"}')

results = []


def check(name, ok, ev):
    results.append((name, ok, ev))
    print(f'  {"✅" if ok else "❌"} {name}')
    print(f'      {ev}')


# 1. 鉴权闸门
st, _ = call('DELETE', '/api/consultations/999999')
check('未带令牌删除 → 401（鉴权闸门有效）', st == 401, f'实际状态码 {st}')

st, _ = call('PATCH', '/api/consultations/999999', {'status': 'closed'})
check('未带令牌改状态 → 401', st == 401, f'实际状态码 {st}')

# 2. 参数校验
st, j = call('PATCH', '/api/consultations/999999', {'status': '乱填'}, TOK)
check('带令牌但状态值非法 → 400', st == 400, f'实际 {st}，返回：{j.get("error")}')

st, j = call('PATCH', '/api/consultations/999999', {'status': 'closed'}, TOK)
check('带令牌改不存在记录 → 404', st == 404, f'实际 {st}，返回：{j.get("error")}')

# 3. 真实记录：找到那条垃圾记录
st, j = call('GET', '/api/consultations', tok=TOK)
items = j.get('data', [])
print(f'\n  当前咨询记录 {len(items)} 条：')
for c in items:
    print(f'    id={c["id"]}  {c["company_name"]}  {c["phone"]}  {c["status"]}  {c["created_at"]}')

junk = next((c for c in items if c['company_name'] == '水电费水电费'), None)
check('找到垃圾记录（企业名"水电费水电费"）', junk is not None,
      f'id={junk["id"]}' if junk else '未找到，跳过删除实测')

if junk:
    # 备份
    stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    bak = f'/root/consultations.json.bak.{stamp}'
    shutil.copy2(DATAF, bak)
    print(f'\n  数据文件已备份: {bak}')

    st, j2 = call('PATCH', f'/api/consultations/{junk["id"]}', {'status': 'closed'}, TOK)
    check('把该记录状态改为 closed', st == 200 and j2.get('data', {}).get('status') == 'closed',
          f'实际 {st}，返回状态 {j2.get("data", {}).get("status")}')

    st, j2 = call('DELETE', f'/api/consultations/{junk["id"]}', tok=TOK)
    deleted = j2.get('deleted') or {}
    check('删除该记录', st == 200 and j2.get('success') is True,
          f'实际 {st}，被删记录原样回传：{json.dumps(deleted, ensure_ascii=False)}')

    st, j2 = call('GET', '/api/consultations', tok=TOK)
    left = j2.get('data', [])
    check('删除后列表只剩真实记录', len(left) == len(items) - 1 and not any(c['id'] == junk['id'] for c in left),
          f'剩余 {len(left)} 条：' + '、'.join(f'{c["company_name"]}({c["status"]})' for c in left))

    st, j3 = call('GET', '/api/health')
    print(f'  /api/health 咨询计数: {j3.get("consultationsCount")}（删除后应为 {len(items) - 1}）')

print('\n' + '=' * 72)
bad = sum(1 for _, ok, _ in results if not ok)
print(f'  结果：{len(results) - bad}/{len(results)} 项通过' + ('' if bad == 0 else f'，{bad} 项未通过'))
print('  说明：仅删除了企业名为"水电费水电费"的垃圾记录（内容已随响应回传，备份在服务器 /root 下，可完整恢复）')
