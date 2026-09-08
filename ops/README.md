# ops — 网站运维与多平台内容工具集

西安数度财务咨询官网（shuducw.com）的运维脚本全集，纳入 GitHub 管理以便多台电脑复用。
所有脚本均通过 `ssh-run.py` 在本机执行（SSH 到服务器运行）或直接在本机运行。

## 目录结构

```
ops/
├── ssh-run.py                    # SSH 执行服务器命令/脚本（本机入口）
├── sftp-upload.py                # 上传文件到服务器: python sftp-upload.py <本地> <远程>
├── sftp-download.py              # 从服务器下载文件: python sftp-download.py <远程> <本地>
├── deploy/
│   ├── deploy.sh                 # 部署主流程（打包上传后原子替换 .next/node_modules/server.js/public + 符号链接修复 + 重启）
│   ├── standalone-symlink-fix.sh # Windows 打包后重建 standalone 顶层符号链接（部署后必跑）
│   └── nginx-shuducw.conf        # 生产 Nginx 配置参考（443 default 444 + 未知 Host 掐断）
├── monitor/                      # 巡检脚本（在服务器上跑）
│   ├── crawlers-check.sh         # 各搜索引擎蜘蛛抓取统计
│   ├── bingbot-logs.sh           # Bingbot 访问明细与状态码
│   ├── security-audit.sh         # 安全审计（未知 Host/子域名探测/异常 UA）
│   ├── sitemap-count.sh          # sitemap 精确计数
│   ├── sitemap-force.sh          # 强制重生成 sitemap（rm ISR 缓存 + 重启）
│   └── verifyfiles-check.sh      # 各平台验证文件在线检查
├── content/                      # 官网文章发布工具（本机跑）
│   ├── create-article-10.py      # 创建文章 #10（读 ops/content/website-article-10-full.html）
│   ├── update-article-10.py      # 更新文章 #10 内容
│   ├── set-article10-draft.py    # 将文章 #10 设为草稿（审阅工作流）
│   ├── export-article-list.py    # 导出已发布文章列表
│   ├── submit-indexnow-all.py    # IndexNow 批量推送全部 URL
│   ├── submit-indexnow-newslugs.py # IndexNow 推送新 slug
│   ├── website-article-10-full.html    # 文章 #10 官网发布内容（官方法规核对版）
│   ├── baijiahao-article-content-10.html # 文章 #10 百家号版内容
│   └── zhihu-article-content-10.html    # 文章 #10 知乎版内容
├── publish/                      # 百家号/知乎发布自动化脚本（Playwright，需另装依赖）
└── history/                      # 一次性诊断/事故排查脚本归档（保留运维记录）
```

## 使用前提

- Python 3 + `paramiko`（本机）
- SSH 登录服务器：优先 `~/.ssh/id_ed25519` 密钥，其次 `SSH_PASS` 环境变量
- 服务器：8.152.3.67（百度云），站点目录 `/var/www/shuducw-run`，PM2 进程 `shuducw`

## 常用命令

```bash
# 执行服务器脚本（脚本内容上传后 bash 执行，无需服务器端保存）
python ops/ssh-run.py --script ops/monitor/crawlers-check.sh

# 部署新版本（前提：本地已 pnpm build + 打包 deploy-new.tar.gz 到项目根）
# 先同步服务器数据到本地（构建时用）：
python ops/sftp-download.py /var/www/shuducw-run/data/articles.json data/articles.json
python ops/sftp-download.py /var/www/shuducw-run/data/consultations.json data/consultations.json
# 上传安装包：
python ops/sftp-upload.py deploy-new.tar.gz /root/deploy-new.tar.gz
# 执行部署：
python ops/ssh-run.py --script ops/deploy/deploy.sh

# 内容发布（管理密码从环境变量读，不入库）：
$env:ADMIN_API_PASSWORD='你的管理密码'
python ops/content/update-article-10.py
```

## 安全约定

- **管理密码**（`ADMIN_API_PASSWORD` / 后台登录）不写入任何文件，运行时从环境变量读
- **SSH 密码**：用密钥，或用 `SSH_PASS` 环境变量，不硬编码
- `data/`（运行时数据）、`.env*`（密钥）、`node_modules`、`.next` 均不入库
- 仓库为私有（GitHub `zhxt809-ui/shuducw-web`）

## 部署流程速查（详见根目录 DEPLOY.md）

1. 服务器同步 `data/` → 本地（见上）
2. 本地 `pnpm build` → 打包 `.next/standalone` + `.next/static` + `public` → `tar -czf deploy-new.tar.gz`
3. 上传 → 服务器跑 `deploy.sh`（含符号链接修复，防 `styled-jsx` 缺失宕机）
4. 验证 `/api/health`、首页 200、sitemap 计数
5. `git add` + commit + push（改→提交→推送）
