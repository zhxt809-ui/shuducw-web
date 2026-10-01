# 百度收录自动推送（运维说明）

## 为什么需要它

2026-10-01 服务器日志实测结论：

| 引擎 | 是否读过 robots.txt | 是否读过 sitemap.xml | 内容页抓取 |
|---|---|---|---|
| 百度 Baiduspider | **0 次** | **0 次** | 1068 次几乎全打首页，内容页仅 `/services` 1 次 |
| 搜狗 | — | — | **0 次任何请求** |
| 必应 / Yandex | 是 | 是 | IndexNow 提交后 **2 分钟内**抓取新页面 |
| Googlebot | 是 | 15 次 | 正常 |
| 360Spider | 是 | 2 次 | 提交 sitemap 后已见抓取 |

结论：**百度不读 robots.txt、不读 sitemap，只能靠主动提交**。因此建立本自动推送机制。

## 配额事实（实测，非推测）

- 本站百度普通收录 API 的每日配额实测为 **8 条/天**：
  2026-10-01 推送 6 条后返回 `{"remain":2}`，再推 2 条后返回
  `{"error":400,"message":"over quota"}`
- 因此**不能一次性推送全部 55 条**，必须按配额分日推送（48 条待推 ÷ 8 条/天 ≈ 6 天推完）
- 百度官方警告：重复提交旧链接会浪费配额，且"经常重复提交旧链接会下调您的配额"
  → 脚本默认只推**从未推送过**的链接，状态记录在 `.push-state/baidu.json`

## 运行机制

**服务器端为唯一权威**（cron 在服务器上跑，状态文件也在服务器上）：

```
/root/baidu-push/
├── push-baidu.py                 # 推送脚本（仓库同步：ops/content/push-baidu.py）
├── baidu-push.config.json        # token 与站点（权限 600，仅 root 可读，禁止进仓库）
└── .push-state/baidu.json        # 已推送链接记录（避免重复消耗配额）
```

crontab（root，每天 09:00）：

```
0 9 * * * { echo "=== $(date -Is) ==="; cd /root/baidu-push && /usr/bin/python3 push-baidu.py; } >> /var/log/baidu-push.log 2>&1
```

- 每日推送量受百度当日配额限制，配额用尽脚本会自动停止，余下链接次日继续
- sitemap 中没有的新链接（新发布的文章）会被自动发现并排队推送，无需人工干预
- 无新链接时不发起任何 API 请求（不浪费配额）

## 常用命令

```bash
# 查看自动推送日志
tail -30 /var/log/baidu-push.log

# 查看还剩多少未推送
cd /root/baidu-push && python3 push-baidu.py --dry-run

# 手动立即推送一次（同样受当日配额限制）
cd /root/baidu-push && python3 push-baidu.py

# 整体验证（crontab 是否唯一、能否在最小环境执行、日志与权限）
python ops/ssh-run.py --script ops/verify-baidu-push.sh
```

## 注意事项

1. **不要在本地跑推送**：本地状态文件与服务端是两份，会导致重复推送、浪费配额。
   如需手动推送，请登录服务器在 `/root/baidu-push` 下执行。
2. **token 失效时**：到 百度搜索资源平台 → 资源提交 → 普通收录 → API 提交 复制新 token，
   然后 `python3 push-baidu.py --save-token <新token>`（在服务器上执行）。
3. **接口协议**：百度官方文档给的是 `http://data.zz.baidu.com/urls`；
   实测 `https://data.zz.baidu.com` 存在证书与主机名不匹配问题，
   脚本按"优先 https、连接层失败回退官方 http"处理。
4. **配额会变化**：站点质量与抓取表现提升后配额通常会上调，
   可通过推送返回的 `remain` 字段观察变化；无需改动脚本逻辑。
