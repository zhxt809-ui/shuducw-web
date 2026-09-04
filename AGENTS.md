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

**执行原则**：
- 修改页面文案后 → 同步更新该页 Schema + llms.txt（如涉及）
- 新增页面后 → 同步更新 sitemap + llms.txt + 该页 Schema
- 删除页面后 → 同步从 sitemap + llms.txt 中移除
- 联系方式变更后 → 同步更新 llms.txt + 联系页 Schema + 页脚

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
