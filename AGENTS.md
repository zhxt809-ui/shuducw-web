# AGENTS.md

## 项目概览

西安数度财务咨询有限公司官网，面向大模型 AI 抓取与搜索引擎 SEO 优化的企业门户网站。

### 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4 + 自定义品牌变量
- **Icons**: Lucide React

### 品牌色

- 主色（深海蓝）: `#1B3A5C` — CSS 变量 `--color-brand-navy`
- 辅助金色: `#B8860B` — CSS 变量 `--color-brand-gold`
- 使用 Tailwind 类名: `text-brand-navy`, `bg-brand-gold`, `bg-brand-bg` 等

## 目录结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局 (Header + Footer + 浮动咨询按钮)
│   ├── page.tsx                # 首页
│   ├── globals.css             # 全局样式 + 品牌变量
│   ├── robots.ts               # 搜索引擎爬虫规则（含国内 AI 爬虫）
│   ├── sitemap.xml/route.ts    # 站点地图（含文章/分类/FAQ）
│   ├── about/page.tsx          # 关于我们
│   ├── services/
│   │   ├── page.tsx            # 业务范围总览
│   │   ├── basic/page.tsx      # 基础财税服务
│   │   ├── compliance/page.tsx # 高端合规内审
│   │   └── consulting/page.tsx # 财税咨询风控
│   ├── news/
│   │   ├── page.tsx            # 财税资讯列表（复用 news-list 组件）
│   │   └── [slug]/page.tsx     # 文章详情 / 分类页(cases|tips|policies)
│   ├── faq/page.tsx            # 财税常见问题 FAQ（FAQPage Schema）
│   ├── contact/page.tsx        # 联系我们
│   ├── admin/page.tsx          # 管理后台
│   └── api/                    # articles / consultations / health
├── components/
│   ├── header.tsx              # 顶部导航（服务下拉菜单）
│   ├── footer.tsx              # 页脚（含 ICP 备案号）
│   ├── floating-consult.tsx    # 全站浮动咨询按钮
│   ├── news-list.tsx           # 资讯列表共享组件
│   ├── consultation-form.tsx   # 预约咨询表单
│   ├── share-button.tsx        # 分享按钮
│   ├── html-renderer.tsx       # HTML 内容渲染
│   └── ui/                     # shadcn/ui 组件库
└── lib/
    ├── store.ts                # 本地文件存储数据层（articles/consultations）
    ├── supabase.ts             # Supabase 兼容后端（DATA_STORE=supabase 时启用）
    └── utils.ts                # 工具函数
```

## 构建与测试命令

- 安装依赖: `pnpm install`
- 开发: `pnpm run dev` (端口 5000)
- 构建: `pnpm run build`
- 启动生产: `pnpm run start`
- 类型检查: `pnpm ts-check`
- 代码检查: `pnpm lint`

## SEO 与 AI 抓取规范

- 每个页面均配置独立的 TDK (Title / Description / Keywords)，遵循附件清单
- 首页和联系页包含 JSON-LD 结构化数据 (schema.org ProfessionalService / Organization)
- 站点提供 `robots.ts` 和 `sitemap.ts` 便于搜索引擎收录
- 内容使用语义化 HTML 标签，关键信息避免纯图片展示

### SEO 文件同步维护规范（强制）

每次修改网站内容时，**必须同步检查并更新**以下文件，确保大模型抓取与搜索引擎索引始终与网站实际内容一致：

| 文件 | 路径 | 同步触发条件 |
|------|------|------------|
| sitemap.xml | `src/app/sitemap.xml/route.ts` | 新增/删除/重命名页面路由 |
| llms.txt | `public/llms.txt` | 业务内容、联系方式、服务描述、页面链接变更 |
| robots.txt | `src/app/robots.ts` | 爬虫规则调整（如新增/屏蔽 AI 爬虫） |
| Schema JSON-LD | 各页面 `metadata` 中的 `jsonLD` | 对应页面的标题、描述、服务内容、联系方式变更 |
| 旧 URL 归位规则 | `src/proxy.ts` | 站点改版/路由重命名后，旧静态地址（`/xxx.html`）的 301 归位 |
| nginx 站点配置 | 服务器 `/etc/nginx/sites-enabled/shuducw`（改动脚本存 `ops/nginx-add-index-redirect.py`） | 域名跳转、反扫描规则、缓存策略调整 |

**执行原则**：
- sitemap 的 `lastmod` 由 `scripts/gen-page-lastmod.mjs` 依据 git 提交历史按页生成，写入
  `src/data/page-lastmod.json`，已串联到 build 前置步骤，构建时自动刷新，新增页面无需手工登记。
  **禁止把 lastmod 写成部署时间**：Google 官方文档明确只在"一致且可验证准确"时才采用 `<lastmod>`，
  按部署时间生成会让每次部署都把全部页面标成"当天修改"，导致该字段被忽略、并让爬虫反复重抓未变化的页面。
- 修改页面文案后 → 同步更新该页 Schema + llms.txt（如涉及）
- 新增页面后 → 同步更新 sitemap + llms.txt + 该页 Schema
- 删除页面后 → 同步从 sitemap + llms.txt 中移除
- 联系方式变更后 → 同步更新 llms.txt + 联系页 Schema + 页脚，并**全量替换**：仓库文本
  （`python ops/change-phone.py` 带演练模式）+ 服务器 `data/articles.json` 正文/摘要
  （`ops/change-phone-server.py`，改前自动备份）+ `ops/outreach/外链执行包.md` 标准信息块；
  改完用 `python ops/verify-phone-live.py` 按 sitemap 枚举全站页面验收（旧号码必须为 0 处）。
  > 注意：图片素材（名片/海报/二维码封面）里印刷的旧号码脚本改不了，需人工重新出图。
- **旧静态地址一律 301 归位，不要放任 404**。规则在 `src/proxy.ts`：`/xxx.html` → 301 → `/xxx`，
  `/index.html` → 301 → `/`，`.htm` 同理。原则性规则比逐个猜文件名可靠：
  只要新版存在对应 clean URL 就能接住，新版不存在的路径仍正常 404（不造假页面、不制造软 404）。
  **验证文件必须放行**（`ByteDanceVerify`、`baidu_verify_*`、`google*` 等 `.html`），否则已完成的站点验证会失效。
  服务器侧另有一条 nginx 规则处理 `/index.html`（见下）。
  > 事故记录：2026-10-06 nginx 反扫描规则 `location ~* ^/index { return 404; }` 把旧站入口
  > `/index.html` 一起拦了（日志证据：360Spider 54 次、Googlebot 1 次请求全 404）。
  > 修复脚本 `ops/nginx-add-index-redirect.py`（备份、`nginx -t` 校验、失败自动回滚）。
- **收录通知（IndexNow）必须单条流式提交，禁止全量批量推送**。依据《Bing Webmaster Guidelines》第 4 节原文：
  "Avoid batch submissions when possible. Streaming submissions provide faster updates, reduce server load,
  and improve indexing accuracy." 实现：`src/lib/indexnow.ts` 已接入文章发布/更新/删除接口
  （`/api/articles`、`/api/articles/[id]`），发布即逐条提交该文章页与分类页；下架/改 slug 时同时通知旧地址。
  手动提交用 `python ops/content/indexnow-submit-one.py <URL>`（或 `--changed`）。
  `ops/content/submit-indexnow-from-sitemap.py`（全量批量）**仅在全站重建等极端情况使用**。
  > 事故记录：2026-10-02 曾两次全量推送 55 条，与官方建议相反；已改为发布即单条提交。

## 交付自检规范（强制）

本仓库的返工几乎都来自同一类问题：**把"没被验证的判断"当成了结论**。以下规则逐条对应真实事故，
交付前必须自检，**不允许"应该没问题"式的交付**：

| # | 规则 | 对应事故 |
|---|------|---------|
| 1 | 不要用 PowerShell 的 `Get-Content`/`Set-Content` 改仓库文本文件（PS 5.1 会按 GBK 读写无 BOM 的 UTF-8 文件 → 编码损坏）。用编辑器/文件工具读写，写完回读校验中文与字节 | AGENTS.md 曾被写成乱码 |
| 2 | 多行提交信息一律 `git commit -F <消息文件>`，不用内联引号字符串（PowerShell 里 `\"` 不是转义 → 参数被拆散、提交静默失败） | 一次提交实际未产生 |
| 3 | 每次提交后核对 `git log --oneline -1` 与 `git status`，确认提交真的产生了；恢复文件用 `git checkout HEAD -- <file>`（`git checkout -- <file>` 是从**索引**恢复，索引里可能正是坏版本） | 误以为已恢复 |
| 4 | 任何结论（"已生效""为空""已修复"）都要用第二种独立方法复核；禁止只凭一条命令/管道的显示下结论——控制台编码本身会骗人 | 曾误报"crontab 是空的" |
| 5 | 改 SEO/机制类实现前先查官方文档并引用原文；部署后必须跑对应验证脚本并给出真实输出，**没有测试输出就不下结论** | lastmod 曾被写成部署时间 |
| 6 | 跳转类改动必须实测**落点 URL 本身**，不能只看状态码是 301。Next standalone 生成的绝对地址会带内部 host（`https://localhost:3000/...`），补 `X-Forwarded-Host` 也无效——必须用规范域名显式拼装落点 | 301 落点曾指向 localhost:3000，真实用户会失败 |
| 7 | 改服务器配置（nginx 等）：备份**绝不能放在会被一并加载的目录**（`sites-enabled/` 放备份会被当作第二份配置 → `limit_req_zone` 重复定义 → `nginx -t` 失败）；必须 `nginx -t` 通过后再 reload，失败自动回滚 | 本次备份误放 sites-enabled，配置一度无效 |
| 8 | **生成要上传到服务器的脚本时禁止 `Out-File -Encoding ascii`**：中文会静默变成 `?`（不只是显示乱码，是写进服务器文件里的真乱码）。脚本用文件工具以 UTF-8 写入后再 sftp 上传；数据文件（JSON 等）一律本地用文件工具直写、直传，不经过 shell 变量与 here-string | 小红书笔记标题一度被写成 `?????`（`ops/xiaohongshu-notes.json` 已用直传修正） |
| 9 | 外链内容的"链接形态"必须实测：小红书笔记去掉分享链接里的 `xsec_token`、或改成 `/explore/<id>` 形态，实测均被重定向到 `/404/sec_xxx`，访客打不开——**必须原样保留分享原始链接** | 曾计划"清理成干净短链"，实测后推翻 |
| 10 | **写线上验收断言前，先抓一次真实 HTML 校准**：React 渲染出的 HTML 与源码文本有三处系统性差异——①正文半角引号被转义成 `&quot;`（6 条问答断言曾全因此误报"内容缺失"）；②"表达式 + 文本"之间会插入 `<!-- -->` 文本分隔注释（如 `{金额} 元`，年终奖临界点表 5 项断言因此误报，而纯文本段落却能通过，极易误判为"站点出错"）；③属性顺序与源码不同、无关注释会改变结构。断言脚本必须先 `html.unescape()` 并剥离 `<!-- -->` 再比对；同时**断言与实现必须同步更新**（曾因删除通栏而断言未改，误报"结构有偏差"） | 三次假故障均出在自己的断言上，而非站点 |
| 11 | 涉及法规的文案必须**逐条核对官方原文**，不得凭记忆：本次核验发现"人民币大写"条款在财政部《会计基础工作规范》2019 修订版中已不在第五十二条（该条现为审计报告条款），且官方举例 ￥1,409.50 写作「伍角」而非「伍角整」（"在角之后可以不写整"）。引错条款或凭记忆写规则，等于给客户错误指引 | 差点引用已失效的条款编号 |
| 12 | **涉税口径必须按"施行日期"核对新旧差异，不得沿用生效前的旧口径**：增值税起征点在《增值税法》（2026-01-01 施行）下由"10 万元以下（含本数）免征"改为"未达到免征、达到全额计税"，即**刚好 10 万元由免征变为应税**；官方解读的举例只覆盖"超过"情形，**临界值必须回到法律条文本身判断**，不能靠举例推断。工具类计算逻辑一律用 `ops/test-*.mjs` **抽取真实源码表达式执行验证**（禁止手抄逻辑），且阈值/级距上限等临界值必须单列用例 | 增值税计算器曾按旧口径把"刚好 10 万"判为免征，属会给客户错误指引的实际错误 |
| 13 | 页面口径变更后必须同步 `public/llms.txt`：本次 VAT 页口径修正后，llms.txt 仍写着旧的"月销售额10万以下不征"。**llms.txt 是给大模型读的口径声明，写错等于对外发布错误政策**，改完要用 `python -c` 直接拉线上文本确认旧口径残留为 0 | llms.txt 一度保留错误起征点口径 |
| 14 | **一次性任务（cron 等）必须验证"它真的执行过"，而不是"它被安排上了"**：本次 08:30 的百度补推 cron 从未执行，直到去查它本该产生的日志文件 `/root/baidu-push/catchup.log` 不存在才发现（日志文件是否存在，比 `crontab -l` 里有没有那一行可靠得多）。同时该 cron 的自删逻辑写成 `crontab -l \| grep -v baidu-catchup-once \| crontab -`，而那一行里根本没有 `baidu-catchup-once` 这个标记，导致自删永远不生效、任务会在下一个周期重复触发——**自删脚本的匹配标记必须与命令行里真实存在的字符串一致，并在写入后立即回读 crontab 验证**。结论：能由每日任务覆盖的需求不要再加一次性任务 | 08:30 补推未执行且自删失效，已删除该行并改为依赖每日 09:00 常规推送 |
| 15 | **用 edit 修改结构化数据（对象数组、表格）时必须成对修改、改后回读该区域**：表头与单元格数量不一致会让整张表错列，对象字段被误删会让页面语法出错。本次实际操作中出现两次：一次误删 FAQ 对象的 `a:` 字段、一次改表格新列时表头文本不匹配导致只有单元格没有表头——两次都是靠"改完立刻回读该区域"发现的。含表格/数组的改动，提交前必须读回并数一遍列数与字段数 | 当天两次编辑失误，均发生在表格与对象数组上 |
| 16 | **法规未明文规定之处，以一线实务口径为准，并记录在案**：金额不足 1 元的大写，官方附一未单独举例，实务标准写法为「肆角贰分」（**不加"零"**，写成「零肆角贰分」一般也予认可）；**角位是 0 而分位有数时必须写"零"**（如 ￥16,409.02 → 壹万陆仟肆佰零玖元零贰分），这是规定与实务一致的标准写法，不得省略。该口径经一线实务确认，勿凭推测改回 | 大写工具原输出「零肆角贰分」，与实务标准写法不符 |

**自动化**：`pnpm selfcheck`（= `python ops/selfcheck.py`）检查编码/乱码、禁用平台名、绝对化用语、
密钥泄漏、lastmod 数据、文章数据、git 卫生、**政策更新台账（H：政策到期预警 + 台账所列页面是否仍存在）**。
政策台账本体在 `ops/policy-ledger.json`，逐条登记站内每个计算口径的生效日、执行到期日、依据文号与涉及页面；
单条政策需要提前复核时，用 `python ops/policy-ledger-check.py`（支持 `--as-of YYYY-MM-DD` 模拟日期，
用于验证告警机制本身有效，勿只验证"脚本能跑"）。
提交前钩子已启用（`git config core.hooksPath ops/git-hooks`），
只检查暂存文件，命中问题即阻止提交。
> 注：Windows 受限沙箱禁止 `sh.exe` 创建信号管道，钩子需在可运行 sh 的终端（或完整权限）下生效；
> 该限制不影响正常开发环境。

## 数据库

- 数据层: `src/lib/store.ts` — 本地文件存储（默认），数据保存在 `data/` 目录
- 兼容后端: Supabase (PostgreSQL) — 设置 `DATA_STORE=supabase` 时启用 `src/lib/supabase.ts`
- 环境变量: `DATA_DIR`（数据目录，默认 `./data`）、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 初始化: `node scripts/init-data.mjs` 创建空数据文件
- 健康检查: `/api/health` 可验证数据文件与计数

### 数据表

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| articles | 财税资讯文章 | slug(唯一), category(cases/tips/policies), is_published, sort_order |
| consultations | 预约咨询记录 | company_name, phone, content, status(pending/contacted/closed) |

### 部署须知

- 数据文件落在服务器本地 `data/` 目录，满足数据本地化合规要求
- 从 Supabase 迁移存量文章：在 Supabase SQL Editor 导出 articles 表为 JSON，写入 `data/articles.json`
- 部署细节见 `DEPLOY.md`（Nginx + PM2 + ICP 备案 + 2核2G 优化）

## 编码规范

- 默认 TypeScript strict 模式
- 禁止隐式 any 和 as any
- 中英文之间加空格
- 组件使用函数式组件 + React Hooks
- 响应式断点: sm(640) / md(768) / lg(1024) / xl(1280)
- 品牌相关样式统一使用 `card-brand`、`nav-link` 等自定义 CSS 类
