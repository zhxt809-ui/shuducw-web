# 国内服务器部署指南（2核2G 百度云）

本文档说明如何将本站部署到国内服务器（以百度智能云 2核2G 为例），
满足 ICP 备案、数据本地化合规要求，并针对轻量服务器做了性能优化。

## 一、部署架构

```
用户浏览器
    ↓ HTTPS
Nginx（80/443，反向代理 + 静态资源直出 + gzip）
    ↓ 反向代理到 3000 端口
Next.js standalone（Node.js，PM2 守护）
    ↓ 本地文件读写
data/ 目录（articles.json / consultations.json）
```

- 数据存储在本机 `data/` 目录，**不依赖任何海外数据库**，符合数据本地化要求
- 2核2G 内存完全够用：Nginx ~30MB，Node 进程 ~250-400MB

## 二、服务器初始化

```bash
# 1. 系统：Ubuntu 22.04 LTS（百度云镜像）

# 2. 创建 Swap（2G 内存必配，防止内存峰值 OOM）
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3. 安装 Node.js 20 LTS 与构建工具
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential nginx
```

## 三、构建与部署

### 方式 A：standalone 模式（推荐）

```bash
# 本机构建（或服务器上构建）
pnpm install
pnpm next build        # 生成 .next/standalone

# 上传到服务器 /var/www/shuducw/
# 注意 standalone 需要拷贝：
#   .next/standalone/          → /var/www/shuducw/
#   .next/static/              → /var/www/shuducw/.next/static/
#   public/                    → /var/www/shuducw/public/
#   data/                      → /var/www/shuducw/data/（先运行 init-data 脚本）

# 服务器上初始化数据目录
cd /var/www/shuducw
node scripts/init-data.mjs
```

> ⚠️ **构建前必须先同步服务器数据（2026-09-07 必读）**
> 文章数据以服务器 `data/articles.json` 为准（运行时通过 API 增删改）。构建时的静态/ISR 预渲染
> 读的是**本地** `data/articles.json`——若本地是旧数据，`/news` 等静态页会渲染旧文章列表
> （曾出现线上列表只有 13 篇 test 占位文章的问题）。**每次构建前**：
> ```bash
> python sftp-download.py /var/www/shuducw-run/data/articles.json extracted/projects/data/articles.json
> python sftp-download.py /var/www/shuducw-run/data/consultations.json extracted/projects/data/consultations.json
> ```
> 同时 `/news` 列表页已改为 ISR（revalidate=60），发布新文章后 1 分钟内前台自动更新。
> `data/` 不入 Git（运行时数据以服务器为准）。

> ⚠️ **Windows 打包部署的符号链接修复（2026-09-06 必读）**
> Next standalone + pnpm 的 `node_modules` 用 `.pnpm` 虚拟存储 + 顶层符号链接。**Windows 的 tar 无法忠实保存这些符号链接**，在 Linux 解压后 `styled-jsx`、`@next/env` 等顶层链接缺失，报错 `Cannot find module 'styled-jsx/package.json'`（线上曾因此宕机）。
> **解压后、重启前务必执行**（幂等）：
> ```bash
> bash /var/www/shuducw-run/scripts/standalone-symlink-fix.sh
> # 或从工作区上传 .server-standalone-symlink-fix.sh 执行
> ```

### 方式 B：标准 next start（简单）

```bash
pnpm install
pnpm next build
pnpm next start --port 3000
```

## 四、PM2 进程守护

```bash
sudo npm install -g pm2

# standalone 模式启动
pm2 start .next/standalone/server.js --name shuducw \
  --env PRODUCTION \
  -- --port 3000

# 或者标准模式
# pm2 start "pnpm next start --port 3000" --name shuducw

pm2 startup   # 设置开机自启（按提示执行输出的命令）
pm2 save      # 保存进程列表

# 常用命令
pm2 logs shuducw    # 查看日志
pm2 restart shuducw # 重启
pm2 monit           # 监控资源
```

## 五、Nginx 配置

创建 `/etc/nginx/sites-available/shuducw`：

```nginx
server {
    listen 80;
    server_name www.shuducw.com shuducw.com;

    # HTTP 强制跳转 HTTPS
    return 301 https://www.shuducw.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.shuducw.com;

    # SSL 证书：百度智能云控制台申请免费 DV 证书
    ssl_certificate     /etc/nginx/ssl/shuducw_fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/shuducw_privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # gzip 压缩
    gzip on;
    gzip_min_length 1k;
    gzip_types text/plain text/css application/json application/javascript
               application/xml image/svg+xml application/xhtml+xml;
    gzip_vary on;

    client_max_body_size 20m;

    # 静态资源长缓存
    location /_next/static/ {
        alias /var/www/shuducw/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /public/ {
        alias /var/www/shuducw/public/;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    # 动态请求反代到 Node
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/shuducw /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 六、环境变量

创建 `/var/www/shuducw/.env.production`：

```env
# 站点域名（用于 sitemap/robots 生成）
COZE_PROJECT_DOMAIN_DEFAULT=www.shuducw.com

# 数据目录（默认 ./data，可指定）
DATA_DIR=/var/www/shuducw/data

# 管理后台密码（服务端校验，必改！）
# 2026-09-06 起：后台 API（创建/更新/删除文章、查看咨询）改为服务端鉴权，
# 客户端登录时把密码放在 x-admin-token 头，与本变量比对。此值勿用 NEXT_PUBLIC_ 前缀。
ADMIN_API_PASSWORD=请更换为强密码

# 存储后端：file（默认，本地 JSON）/ supabase（过渡期兼容）
# DATA_STORE=file
```

> ⚠️ 管理后台密码务必修改默认值，否则 `/admin` 存在被爆破风险。
> 历史版本使用的 `NEXT_PUBLIC_ADMIN_PASSWORD` 已弃用（旧密码打进前端包、前端比对的弱校验，2026-09-06 移除）。

## 七、数据迁移（从 Supabase）

```bash
# 1. 在 Supabase SQL Editor 导出所有文章：
#    SELECT id, title, slug, category, summary, content, cover_image,
#           is_published, sort_order, published_at, created_at, updated_at
#    FROM articles ORDER BY id;
#
# 2. 将结果保存为 JSON 数组，覆盖写入 data/articles.json
# 3. 重启服务生效：pm2 restart shuducw
```

## 八、备份

```bash
# 每天凌晨 2 点备份数据目录（crontab -e）
0 2 * * * tar -czf /backup/shuducw-$(date +\%Y\%m\%d).tar.gz -C /var/www/shuducw data

# 建议同步备份到百度云 BOS 对象存储（跨机容灾）
```

## 九、GitHub 版本控制（2026-09 启用）

项目代码统一托管在 GitHub（私有仓库），任何代码变更遵循「改 → 提交 → 推送」流程。

- 仓库：`https://github.com/zhxt809-ui/shuducw-web`（私有，账户 zhxt809-ui）
- 分支：`main`
- 工作流：本地 `extracted/projects` 修改代码 → 构建/测试通过 → `git add` → `git commit` → `git push origin main`
- 已排除入库：`node_modules/`、`.next/`、`.env*`（密钥）、`data/`（运行时数据以服务器为准，不入库）
- 发布到服务器的新代码，同步 commit + push 到 GitHub，保持版本一致

### 本机 git 环境（Windows）

- TLS：已启用 OpenSSL 后端，绕过本机 schannel `SEC_E_NO_CREDENTIALS` 故障（`git config http.sslBackend openssl`）
- 代理：本机访问 GitHub 走 Clash 代理（`git config http.proxy http://127.0.0.1:7890`，https 同）
- 认证：Git Credential Manager（系统级 `manager`），推送时弹浏览器授权
- 以上为仓库内局部配置，换新仓库需重新设置

## 十、上线检查清单

- [ ] ICP 备案通过（百度智能云提交，2-4 周）
- [ ] 域名 A 记录指向服务器 IP（删除 Vercel 的 CNAME）
- [ ] HTTPS 证书配置完成
- [ ] 管理后台密码已修改
- [ ] `pm2 save` 开机自启已配置
- [ ] 数据目录 `data/` 已初始化
- [ ] 百度站长平台（ziyuan.baidu.com）提交 sitemap.xml
- [ ] 检查 `/api/health` 返回 ok

## 十一、SEO/AI 收录提交

1. 百度搜索资源平台：提交站点验证（已有 `baidu_verify_codeva-t1LOLMCF42.html`）+ sitemap
2. Bing Webmaster：提交 BingSiteAuth.xml（已有）
3. 必应/百度均会抓取 `llms.txt`，供 AI 大模型引用
4. 每周检查豆包 / DeepSeek / 千问中搜索"西安代理记账""西安数度财务咨询"，
   确认公司是否被 AI 引用推荐，缺哪个信源补哪个
