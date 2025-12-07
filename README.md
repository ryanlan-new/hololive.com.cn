## 项目简介

**hololive.com.cn** 是一个面向 HololiveCN MC 服务器的前台展示站点与后台管理系统，前端基于 **Vite + React + Tailwind CSS**，后端使用内嵌的 **PocketBase** 作为认证与内容存储。

- **前台站点**：多语言首页（支持动态 CMS 管理）、文档中心（包含网站公告、服务器信息、其他文档）、错误页等，用于展示服务器信息与基础说明。
- **后台管理**：通过隐藏入口路径与多重鉴权，提供首页管理、文章管理、公告管理、服务器地图管理、白名单管理、本地管理员管理以及系统设置等能力。
- **数据存储**：所有业务数据（用户、文章、公告、配置、首页内容等）存放于 `backend/pb_data` 下的 PocketBase SQLite 数据库中。
- **单一数据源架构**：所有媒体资源统一存储在 `media` 集合中，通过 Relation 字段引用，实现资源复用和统一管理。

## 技术栈概览

- **构建与运行**
  - **Vite 7.2.6**（`vite`）
  - **React 19.2.1**（`react`、`react-dom`）
  - **React Router DOM 7.10.1**（`react-router-dom`）
  - **ESLint 9** 用于代码质量检查
- **样式与 UI**
  - **Tailwind CSS 4**（通过 `@import "tailwindcss"` 与 `@theme` 自定义主题色）
  - **@tailwindcss/typography**：专业排版样式（用于文章内容渲染）
  - 自定义组件：`Button`、`Navbar`、`Footer`、`MainLayout`、`ImagePicker` 等
  - 图标：`lucide-react`、`react-icons`
- **路由与动效**
  - **React Router DOM 7**（`createBrowserRouter` + `RouterProvider`）
  - **framer-motion** 页面与组件动画（首页滚动背景效果）
- **国际化**
  - `i18next` + `react-i18next`
  - 内置 **中文 / 英文 / 日文** 三语文案，命名空间 `common`、`home`、`docs`
- **富文本编辑器**
  - **Tiptap**（`@tiptap/react`、`@tiptap/starter-kit`）：Headless WYSIWYG 编辑器核心
  - `@tiptap/extension-image`：图片插入与显示
  - `@tiptap/extension-link`：链接插入
  - `@tiptap/extension-placeholder`：占位符提示
- **内容展示**
  - `react-markdown` + `remark-gfm`：渲染 Markdown 内容（向后兼容）
  - `html-react-parser`：渲染 HTML 内容（富文本编辑器输出）
- **后端与数据**
  - **PocketBase v0.26.5** 可执行文件：`backend/pocketbase.exe`
  - JavaScript SDK：`pocketbase`（前端通过 `src/lib/pocketbase.js` 使用）
- **客户端翻译**
  - **MyMemory Translation API**：免费翻译服务，无需 API 密钥
  - 支持中文、英文、日文三语言互译
  - 客户端翻译，不占用服务器带宽
  - 支持固定字段和动态按钮数组的批量翻译

## 目录结构说明（简要）

```text
.
├─ backend/                     # PocketBase 后端目录
│  ├─ pocketbase.exe           # PocketBase 可执行文件（Windows）
│  ├─ pb_data/                 # 运行时数据（SQLite 数据库、备份等）
│  └─ pb_migrations/           # PocketBase 迁移脚本（JS）
│     ├─ 1710000000_initial_data.js      # 初始化系统设置、公告、白名单
│     ├─ 1710000001_recreate_users_and_rules.js  # 确保 users 集合存在
│     ├─ 1710000002_seed_admin_user.js   # 预置默认管理员账号
│     ├─ 1710000003_recreate_announcements.js    # 强制重建公告集合
│     ├─ 1710000004_create_media_collection.js   # 创建资源库集合（media）
│     ├─ 1710000006_fix_home_and_images.js       # 首页修复与图片上传
│     ├─ 1710000007_create_server_maps.js        # 创建服务器地图集合
│     ├─ 1765023122_init_cms_data.js    # 初始化 CMS 数据（首页分段、菜单、页脚）
│     ├─ 1765050029_migrate_hardcoded_whitelist.js  # 迁移硬编码白名单到数据库
│     ├─ 1765080000_init_server_info.js # 创建服务器信息字段集合（server_info_details）
│     ├─ 1765100000_migrate_posts_multilingual.js # 文章系统多语言迁移（title/summary/content 转为 JSON）
├─ public/                     # 静态资源（错误页图片、站点图片等）
│  ├─ errors/                  # 403/404/418/500/503 错误图
│  └─ holocn/                  # 站点图片与图标（背景图、图标等）
├─ src/
│  ├─ App.jsx                  # 应用根组件（注入 Analytics + Router）
│  ├─ main.jsx                 # 入口文件，挂载 React 与初始化 i18n
│  ├─ router.jsx               # React Router 路由配置（前台 + 后台）
│  ├─ i18n.js                  # i18next 配置与多语言文案
│  ├─ index.css                # Tailwind CSS + 全局样式（隐藏滚动条等）
│  ├─ lib/
│  │  ├─ pocketbase.js         # PocketBase JS SDK 单例封装
│  │  └─ translation.js        # 客户端翻译工具（MyMemory API）
│  ├─ config/
│  │  ├─ assets.js             # 静态资源路径常量
│  │  └─ auth_whitelist.js     # 管理员邮箱硬编码白名单（已迁移到数据库，保留用于向后兼容回退）
│  ├─ components/
│  │  ├─ layout/               # 布局组件
│  │  │  ├─ MainLayout.jsx    # 主布局（包含 Navbar、Outlet、Footer）
│  │  │  ├─ Navbar.jsx        # 导航栏（多语言切换）
│  │  │  └─ Footer.jsx         # 页脚（静态内容，使用 i18n）
│  │  ├─ admin/                # 后台管理组件
│  │  │  ├─ AdminLayout.jsx   # 后台统一布局（侧边栏、顶部栏）
│  │  │  ├─ editor/           # 富文本编辑器组件
│  │  │  │  ├─ MenuBar.jsx   # 编辑器工具栏（格式化按钮、图片上传、媒体库）
│  │  │  │  └─ RichTextEditor.jsx  # Tiptap 编辑器主组件
│  │  │  ├─ media/            # 资源库组件
│  │  │  │  └─ MediaManager.jsx   # 资源管理组件（上传、查看、删除、选择）
│  │  │  ├─ ImagePicker.jsx   # 可重用图片选择器组件（上传+媒体库选择）
│  │  │  ├─ MediaLibraryModal.jsx # 媒体库选择器模态框
│  │  │  └─ ui/               # 后台 UI 组件
│  │  │     └─ Modal.jsx      # 通用模态框组件
│  │  ├─ auth/                # 鉴权守卫组件（`AdminGuard`、`RequireAdminAuth`）
│  │  ├─ announcement/         # 全局横幅公告（`GlobalBanner`）
│  │  ├─ analytics/            # 统计脚本注入（`AnalyticsInjector`）
│  │  └─ ui/                   # 通用 UI 组件（`Button` 等）
│  ├─ hooks/
│  │  └─ useCmsData.js         # CMS 数据获取 Hook（useCmsSections，支持 Relation 展开）
│  ├─ utils/
│  │  └─ postHelpers.js        # 文章辅助函数（getLocalizedContent：获取本地化内容）
│  └─ pages/
│     ├─ Home.jsx              # 前台首页（动态读取 cms_sections，支持滚动动画）
│     ├─ Docs.jsx              # 前台文档中心（三个卡片：网站公告、服务器信息、其他文档）
│     ├─ WebsiteAnnouncements.jsx  # 网站公告列表页（从 posts 集合筛选 category="公告"）
│     ├─ ServerInfo.jsx       # 服务器信息页（静态信息 + 实时状态 + 地图选择器 + iframe 显示）
│     ├─ OtherDocuments.jsx   # 其他文档列表页（从 posts 集合筛选 category="文档"）
│     ├─ ArticleDetail.jsx    # 文章详情页（显示完整文章内容，支持三语言）
│     ├─ ErrorPage.jsx         # 全屏错误页（403/404/418/500/503）
│     └─ admin/                # 后台各功能页面
│        ├─ AdminLogin.jsx     # 后台登录（Microsoft OAuth2 + 本地登录）
│        ├─ Dashboard.jsx     # 仪表盘
│        ├─ HomeManager.jsx   # 首页分段管理（CMS）
│        ├─ SectionEditor.jsx # 首页分段编辑器（多语言、背景图、按钮、一键翻译）
│        ├─ Posts.jsx          # 文章列表
│        ├─ PostEditor.jsx    # 文章编辑器（富文本 WYSIWYG）
│        ├─ MediaPage.jsx     # 资源库管理页面
│        ├─ WhitelistPage.jsx # SSO 白名单管理
│        ├─ AdminUsersPage.jsx # 本地管理员账号管理 + 本地登录开关
│        ├─ SettingsPage.jsx   # 系统设置（统计、后台入口 Key）
│        ├─ AnnouncementPage.jsx # 公告管理（支持类型选择：普通/紧急）
│        ├─ ServerMapManager.jsx # 服务器地图管理（CRUD + 拖拽排序）
│        └─ ServerInfoFields.jsx # 服务器信息字段管理（动态管理服务器信息，支持拖拽排序）
├─ pb_schema.json              # PocketBase 集合结构定义（可直接导入）
├─ package.json
├─ vite.config.js              # Vite 7 配置（已优化：服务器、构建、依赖预构建）
└─ OPTIMIZATION_REPORT.md     # 代码库优化报告（最新优化记录）
```

## 快速开始（Quick Start）

### 前置条件

- **Node.js** ≥ 18（推荐使用 LTS 版本）
- **npm** ≥ 9
- Windows 环境下已可直接运行 `backend/pocketbase.exe`

### 1. 安装前端依赖

在项目根目录下执行：

```bash
npm install
```

> 项目为 `private` 包，不会发布到 npm，仅用于本地或私有部署。

### 2. 启动 PocketBase 后端

在项目根目录下：

**Windows PowerShell / CMD：**

```bash
cd backend
./pocketbase.exe serve
```

默认会监听 `http://127.0.0.1:8090`，管理面板地址为 `http://127.0.0.1:8090/_/`。

> **注意**：`backend/pb_data` 目录下存放的是实际数据（SQLite 数据文件、备份等），请做好备份；生产环境建议单独部署 PocketBase。

### 3. 导入数据库结构

首次启动 PocketBase 后，需要导入集合结构：

1. 打开 PocketBase Admin 面板：`http://127.0.0.1:8090/_/`
2. 进入 **Settings** → **Import Collections**
3. 选择项目根目录下的 `pb_schema.json` 文件
4. 点击 **Import** 完成导入

`pb_schema.json` 包含了以下集合的完整定义：
- `posts`：文章集合（支持三语言：title、summary、content 为 JSON 类型）
- `announcements`：公告集合（支持多语言内容和动态颜色类型）
- `whitelists`：SSO 白名单集合
- `system_settings`：系统设置集合（单例）
- `media`：资源库集合（图片、视频等附件，单一数据源）
- `cms_sections`：首页分段集合（CMS，支持多语言内容、公告字段，通过 `background_ref` Relation 引用媒体）
- `server_maps`：服务器地图集合（外部地图链接，如 Dynmap/BlueMap）
- `server_info_details`：服务器信息字段集合（动态管理服务器信息，支持多语言标签和值）

> **重要**：`users` 集合是 PocketBase 的内置认证集合，无需导入。如果导入过程中提示冲突，可以跳过 `users` 集合。

### 4. 自动数据迁移

项目包含自动迁移脚本（`backend/pb_migrations/*.js`），PocketBase 会在启动时自动执行这些迁移：

- **`1710000000_initial_data.js`**：初始化 `system_settings`（ID: "1"）、示例公告、示例白名单
- **`1710000001_recreate_users_and_rules.js`**：确保 `users` 集合存在并配置正确的 API 规则
- **`1710000002_seed_admin_user.js`**：预置默认管理员账号（`admin@local.dev` / `password123456`）
- **`1710000003_recreate_announcements.js`**：强制重建 `announcements` 集合以确保结构一致
- **`1710000004_create_media_collection.js`**：创建 `media` 资源库集合，用于存储富文本编辑器上传的图片等附件
- **`1710000006_fix_home_and_images.js`**：修复首页数据，自动上传背景图并填充首页分段内容
- **`1710000007_create_server_maps.js`**：创建 `server_maps` 集合，用于管理服务器外部地图链接（Dynmap/BlueMap），包含默认示例数据
- **`1765023122_init_cms_data.js`**：初始化 CMS 数据（创建 `cms_sections`、`cms_menus`、`cms_footer_info` 集合，插入默认首页分段、导航菜单、页脚信息）
- **`1765050029_migrate_hardcoded_whitelist.js`**：将硬编码白名单（`src/config/auth_whitelist.js`）中的管理员邮箱迁移到数据库 `whitelists` 集合
- **`1765080000_init_server_info.js`**：创建 `server_info_details` 集合并初始化默认服务器信息字段（IP、版本、运行模式等），支持多语言标签和值
- **`1765100000_migrate_posts_multilingual.js`**：将 `posts` 集合的 `title`、`summary`、`content` 字段从 Text 类型迁移到 JSON 类型，支持三语言内容

**迁移执行时机**：
- 首次启动 PocketBase 时自动执行
- 每次启动时会检查并执行未运行的迁移
- 迁移脚本按文件名时间戳顺序执行

> **提示**：如果迁移执行失败，请检查 PocketBase 控制台输出的错误信息，或查看 `backend/pb_data/logs.db` 中的迁移日志。

### 5. 启动前端开发服务

回到项目根目录：

```bash
npm run dev
```

默认访问地址为 `http://127.0.0.1:5173`（以实际 Vite 输出为准）。

### 6. 访问后台管理系统

1. 打开前端地址：`http://127.0.0.1:5173`
2. 访问后台入口：`http://127.0.0.1:5173/{adminKey}/webadmin`
   - 默认 `adminKey` 为 `secret-admin-entrance`（可在 `system_settings` 中修改）
   - 例如：`http://127.0.0.1:5173/secret-admin-entrance/webadmin`
3. 使用默认管理员账号登录：
   - **本地登录**：`admin@local.dev` / `password123456`
   - **Microsoft SSO**：需要先在 `whitelists` 集合中添加你的邮箱

### 常用脚本

- **启动开发环境**：`npm run dev`
- **构建生产包**：`npm run build`
- **预览构建结果**：`npm run preview`
- **代码检查**：`npm run lint`

## 环境变量配置

前端通过 `import.meta.env` 读取以下变量（需放在 `.env`/`.env.local` 等 Vite 支持的环境文件中）：

- **`VITE_POCKETBASE_URL`**：PocketBase 服务地址，例如：
  - 本地开发：`http://127.0.0.1:8090`
  - 生产环境：`https://api.yourdomain.com`

> **注意**：
> - `VITE_ADMIN_KEY` 环境变量已废弃。后台入口 Key 现在从数据库的 `system_settings.admin_entrance_key` 字段读取，`AdminGuard` 会自动从数据库验证 URL 中的 `adminKey`。
> - Vite 开发服务器配置（端口、严格端口检查等）可在 `vite.config.js` 中修改。

## PocketBase 数据模型与集合设计

### 集合结构定义

项目的所有集合结构定义在 `pb_schema.json` 中，可以直接导入到 PocketBase。这是**推荐的配置方式**，确保结构与前端代码完全一致。

> **注意**：旧版手动配置文档（`POCKETBASE_SETUP*.md`）已删除。现在请直接使用 `pb_schema.json` 导入，无需手动创建集合。

### 单一数据源架构（Single Source of Truth）

项目采用**单一数据源**策略管理所有媒体资源：

- **核心原则**：所有图片、视频等媒体文件统一存储在 `media` 集合中
- **引用方式**：其他集合通过 Relation 字段（如 `background_ref`）引用媒体资源
- **优势**：
  - 资源复用：多个内容可以共享同一张图片
  - 统一管理：所有媒体在媒体库中集中管理
  - 易于维护：删除或更新媒体时，所有引用自动更新
  - 节省存储：避免重复上传相同文件

### 核心集合摘要

#### 1. 用户集合 `users`（PocketBase 内置）

- **用途**：存储后台登录用户，用于：
  - Microsoft OAuth2 登录（SSO）
  - 本地账号密码登录（可通过 `system_settings.enable_local_login` 开关控制）
- **主要字段**：
  - `email`：邮箱，作为账号标识
  - `password` / `passwordConfirm`：密码字段
  - `verified`：是否已验证，可用于显式禁用账号
- **前端使用位置**：
  - `AdminLogin.jsx`：`users.authWithOAuth2({ provider: "microsoft" })`、`users.authWithPassword(email, password)`
  - `AdminUsersPage.jsx`：创建、更新、删除本地管理员账号，管理本地登录开关

#### 2. 白名单集合 `whitelists`

- **用途**：限制哪些邮箱可以通过 Microsoft SSO 或本地登录访问后台。所有管理员邮箱统一在此集合管理。
- **核心字段**：
  - `email` (Text, Required, Unique)：被允许的管理员邮箱
  - `description` (Text, Optional)：备注说明
- **API 规则**：
  - `List/View/Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **数据迁移**：
  - 硬编码白名单（`src/config/auth_whitelist.js`）已通过迁移脚本 `1765050029_migrate_hardcoded_whitelist.js` 自动迁移到数据库
  - 迁移的邮箱包括：`ryan.lan_home@outlook.com`、`admin@local.dev`
- **前端使用位置**：
  - `AdminLogin.jsx`：
    - SSO 登录：登录成功后查询 `whitelists` 集合，如果不存在则拒绝登录
    - 本地登录：优先查询数据库 `whitelists` 集合，失败时回退到硬编码白名单（向后兼容）
  - `WhitelistPage.jsx`：提供增删改查 UI 管理白名单记录

#### 3. 文章集合 `posts`

- **用途**：后台文章管理（公告、文档、更新日志等），支持**三语言内容**（中文、英文、日文）。
- **核心字段**：
  - `title` (JSON, Required)：多语言标题，如 `{ "zh": "...", "en": "...", "ja": "..." }`
  - `slug` (Text, Optional, Pattern: `^[a-z0-9-]+$`)：URL 标识
  - `category` (Select, Optional)：文章分类（公告 / 文档 / 更新日志）
  - `summary` (JSON, Optional)：多语言摘要
  - `content` (JSON, Required)：多语言 HTML 内容（由 Tiptap 富文本编辑器生成），如 `{ "zh": "<p>...</p>", "en": "...", "ja": "..." }`
  - `cover_ref` (Relation, Optional)：封面图片引用，指向 `media` 集合
  - `is_pinned` (Bool, Required, Default: false)：是否置顶显示
  - `is_public` (Bool, Required, Default: false)：是否公开发布
- **API 规则**：
  - `List/View`：`""`（公开读取）
  - `Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **前端使用位置**：
  - `Posts.jsx`：文章列表、删除（使用 `getLocalizedContent` 显示本地化标题）
  - `PostEditor.jsx`：创建/编辑文章，使用 Tiptap 富文本编辑器（WYSIWYG），支持：
    - 三语言切换编辑（语言标签：中文 | English | 日本語）
    - 图片拖拽上传、从媒体库选择图片
    - 封面图片选择（使用 `ImagePicker` 组件）
    - 摘要输入、置顶开关
    - 一键智能翻译（自动翻译所有三语言字段）
  - `ArticleDetail.jsx`：文章详情页（路由：`/docs/article/:id`），显示完整 HTML 内容，使用 `prose` 样式类确保排版美观
  - `WebsiteAnnouncements.jsx`、`OtherDocuments.jsx`：文章列表页，显示封面图片、标题、摘要、置顶标识
  - `postHelpers.js`：提供 `getLocalizedContent()` 辅助函数，根据当前语言获取本地化内容（支持 fallback）

#### 4. 公告集合 `announcements`

- **用途**：配置站点顶部的全局横幅公告，支持多语言内容、时间范围和动态颜色类型。
- **核心字段**：
  - `content` (JSON, Required)：多语言内容对象，如 `{ "zh": "...", "en": "...", "ja": "..." }`
  - `link` (Text, Optional)：可选跳转链接
  - `type` (Select, Optional)：公告类型（`info` 普通/蓝色 或 `urgent` 紧急/红色），默认 `info`
  - `is_active` (Bool, Required, Default: false)：是否启用该公告
  - `start_time` / `end_time` (Date, Optional)：生效时间区间
- **API 规则**：
  - `List/View`：`""`（公开读取）
  - `Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **前端使用位置**：
  - `GlobalBanner.jsx`：前台和后台顶部横幅组件
    - 查询条件：`is_active = true`，按 `-created` 排序取最新一条
    - 根据本地语言 `i18n.language` 选择当前语言文本，若无则回退到英文、中文等
    - 根据 `type` 字段动态设置背景颜色：`urgent` 显示红色，`info` 显示蓝色
    - 使用 `fixed` 定位，紧贴导航栏下方，不影响页面内容流
  - `AnnouncementPage.jsx`：后台公告管理（多语言编辑、类型选择、时间区间、启用/停用等）

#### 5. 资源集合 `media`（单一数据源）

- **用途**：**所有媒体资源的统一存储中心**，供全站引用。富文本编辑器、首页分段、文章等所有图片都存储在此集合中。
- **核心字段**：
  - `file` (File, Optional)：文件字段
    - 支持格式：`image/jpeg`、`image/png`、`image/gif`、`image/webp`
    - 最大大小：5MB
    - `maxSelect: 1`（单文件）
- **API 规则**：
  - `List/View`：`""`（公开可读，以便文章能显示图片）
  - `Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **前端使用位置**：
  - `MediaManager.jsx`：资源库管理组件
    - 独立页面模式：查看、上传、删除、分类浏览（全部/图片/视频/其他）
    - 选择器模式：在编辑器中从媒体库选择已有图片
  - `MediaLibraryModal.jsx`：媒体库选择器模态框（用于 `ImagePicker` 组件）
  - `ImagePicker.jsx`：可重用图片选择器组件，自动上传到媒体库并返回 ID
  - `RichTextEditor.jsx`：富文本编辑器
    - 图片上传：直接上传新图片到 `media` 集合
    - 媒体库选择：打开 Modal 选择已有图片
  - `MediaPage.jsx`：资源库独立管理页面
  - `SectionEditor.jsx`：首页分段编辑器，使用 `ImagePicker` 组件选择背景图片

#### 6. 首页分段集合 `cms_sections`

- **用途**：动态管理首页分段内容，支持多语言标题、副标题、内容、公告、背景图和按钮配置。
- **核心字段**：
  - `title` (JSON, Required)：多语言标题，如 `{ "zh": "...", "en": "...", "ja": "..." }`
  - `subtitle` (JSON, Optional)：多语言副标题
  - `content` (JSON, Optional)：多语言内容
  - `announcement` (JSON, Optional)：多语言公告
  - `background` (File, Optional)：**旧版背景图片字段（已废弃，保留用于向后兼容）**
  - `background_ref` (Relation, Optional)：**新版背景图片引用**，指向 `media` 集合（推荐使用）
  - `sort_order` (Number, Required)：排序顺序，数字越小越靠前
  - `buttons` (JSON, Optional)：按钮配置数组，每个按钮包含：
    - `label` (JSON)：多语言按钮文字，如 `{ "zh": "...", "en": "...", "ja": "..." }`
    - `link` (Text)：按钮链接
    - `style` (Text)：按钮样式（primary/secondary）
- **API 规则**：
  - `List/View`：`""`（公开读取，前台首页需要显示）
  - `Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **前端使用位置**：
  - `Home.jsx`：前台首页，使用 `useCmsSections()` Hook 读取分段数据（使用 `expand: "background_ref"` 获取关联媒体），支持 Framer Motion 滚动动画效果
  - `HomeManager.jsx`：后台首页分段管理页面（列表、排序、删除）
  - `SectionEditor.jsx`：首页分段编辑器（多语言编辑、使用 `ImagePicker` 组件选择背景图、按钮配置、一键智能翻译）

#### 7. 系统设置集合 `system_settings`（单例模式）

- **用途**：存储全局配置（单例记录，ID 固定为 `"1"`），主要用于：
  - 统计代码配置（Google / Baidu Analytics）
  - 后台入口 Key（与路由前缀 `/:adminKey/webadmin` 相关）
  - 本地登录开关（控制是否允许账号密码登录）
- **核心字段**：
  - `microsoft_auth_config` (JSON, Optional)：预留给 Microsoft OAuth 自定义配置（主要在 PocketBase 后台设置）
  - `analytics_config` (JSON, Optional)：统计代码配置
    - `google` (String, Optional)：Google Analytics ID，格式：`"G-XXXXXXXXXX"`
    - `baidu` (String, Optional)：百度统计 ID，32 位字符（支持智能提取，可直接粘贴完整代码）
  - `admin_entrance_key` (Text, Required, Default: `"secret-admin-entrance"`)：后台入口 Key
  - `enable_local_login` (Bool, Required, Default: `true`)：是否允许本地账号密码登录
- **API 规则**：
  - `List/View`：`""`（公开读取，登录页需要读取 `enable_local_login`）
  - `Create/Update`：`@request.auth.id != ""`（仅登录用户可管理）
  - `Delete`：`id = ''`（禁止删除）
- **前端使用位置**：
  - `AnalyticsInjector.jsx`：读取 `analytics_config`，动态注入对应的统计脚本（Google Analytics 和百度统计）。
  - `SettingsPage.jsx`：读取并编辑 `analytics_config` 与 `admin_entrance_key`
    - Google Analytics：支持输入 GA4 跟踪 ID（格式：`G-XXXXXXXXXX`）
    - 百度统计：支持智能输入，可直接粘贴完整代码自动提取 32 位 ID
    - 修改 `admin_entrance_key` 时会弹出警告提示
  - `AdminUsersPage.jsx`：读取并编辑 `enable_local_login`，控制本地登录功能的开关。
  - `AdminLogin.jsx`：读取 `enable_local_login`，决定是否显示本地登录表单。
  - `AdminGuard.jsx`：读取 `admin_entrance_key`，验证 URL 中的 `adminKey` 是否匹配。

#### 8. 服务器地图集合 `server_maps`

- **用途**：管理服务器外部地图链接（如 Dynmap、BlueMap 等），用于在"服务器信息"页面展示多个地图供用户选择。
- **核心字段**：
  - `name` (Text, Required)：地图名称，如"主世界地图"、"资源世界地图"等
  - `url` (URL, Required, Pattern: `^https?://.+`)：地图的外部链接地址
  - `sort_order` (Number, Optional)：排序顺序，数字越小越靠前
- **API 规则**：
  - `List/View`：`""`（公开读取，前台页面需要显示地图列表）
  - `Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **前端使用位置**：
  - `ServerInfo.jsx`：前台服务器信息页
    - 侧边栏显示地图列表，支持点击切换
    - 主区域使用 iframe 嵌入选中的地图 URL
    - 支持深度链接：通过 URL 参数 `?mapId=...` 自动选择指定地图
    - 如果 URL 中没有 `mapId`，则自动选择 `sort_order` 最小的地图
    - 支持网页全屏模式：点击最大化按钮可全屏显示地图，ESC 键退出
  - `ServerMapManager.jsx`：后台服务器地图管理页面
    - 提供完整的 CRUD 操作（创建、读取、更新、删除）
    - 支持拖拽排序：通过拖拽调整地图顺序，自动更新 `sort_order` 字段
    - 表单验证：确保名称和 URL 必填，URL 格式正确

#### 9. 服务器信息字段集合 `server_info_details`

- **用途**：动态管理服务器静态信息字段（IP、版本、运行模式等），支持多语言标签和值，可拖拽排序。
- **核心字段**：
  - `icon` (Text, Required)：Lucide 图标名称，如 `"Server"`、`"Gamepad2"`、`"ShieldCheck"`
  - `label` (JSON, Required)：多语言标签，如 `{ "zh": "服务器地址", "en": "Server Address", "ja": "サーバーアドレス" }`
  - `value` (JSON, Required)：多语言显示值，如 `{ "zh": "play.hololive.com.cn", "en": "...", "ja": "..." }`
  - `sort_order` (Number, Required)：排序顺序，数字越小越靠前
- **API 规则**：
  - `List/View`：`""`（公开读取，前台页面需要显示）
  - `Create/Update/Delete`：`@request.auth.id != ""`（仅登录用户可管理）
- **前端使用位置**：
  - `ServerInfo.jsx`：前台服务器信息页，动态显示所有字段（使用 `getText()` 获取当前语言值）
  - `ServerInfoFields.jsx`：后台服务器信息字段管理页面
    - 提供完整的 CRUD 操作（创建、读取、更新、删除）
    - 支持拖拽排序：通过拖拽调整字段顺序，自动更新 `sort_order` 字段
    - 支持三语言编辑：标签和值都支持中文、英文、日文输入

## 前端架构与路由设计

### 路由结构（`src/router.jsx`）

- **前台页面**（使用 `MainLayout` 统一布局）
  - `/`：首页（`Home`），通过 `MainLayout` 包含 `Navbar`、`GlobalBanner`、`Footer`
  - `/docs`：文档中心（`Docs`），展示三个卡片入口：网站公告、服务器信息、其他文档
  - `/docs/announcements`：网站公告列表页（`WebsiteAnnouncements`），从 `posts` 集合筛选 `category="公告"` 的已发布文章，支持封面图片、摘要、置顶标识
  - `/docs/article/:id`：文章详情页（`ArticleDetail`），显示完整文章内容，使用 `prose` 样式确保排版美观
  - `/docs/server-info`：服务器信息页（`ServerInfo`），包含：
    - 服务器静态信息字段（动态从 `server_info_details` 读取）
    - 实时服务器状态（通过 mcsrvstat API 获取在线人数、延迟、版本、MOTD）
    - 地图选择器和 iframe 显示（支持深度链接 `?mapId=...`、网页全屏模式）
  - `/docs/documents`：其他文档列表页（`OtherDocuments`），从 `posts` 集合筛选 `category="文档"` 的已发布文章，支持封面图片、摘要、置顶标识
  - `/403`、`/404`、`/418`、`/500`、`/503`：错误页（`ErrorPage`，根据 code 显示不同图片）
  - `*`：兜底 404，跳转到 `ErrorPage` with `E404`

- **后台管理入口**
  - `/:adminKey/webadmin`：后台入口根路径，其中：
    - 外层由 `AdminGuard` 保护：从数据库的 `system_settings.admin_entrance_key` 读取并校验 `adminKey`
    - 子路由：
      - `login`：后台登录页（`AdminLogin`）
      - 嵌套 `RequireAdminAuth`：二次认证守卫，检查 `pb.authStore.isValid`
        - `AdminLayout`：后台统一布局（侧边栏 + 用户信息 + 顶部横幅）
          - `dashboard`：仪表盘
          - `home`、`home/new`、`home/:id`：首页分段管理（CMS）
          - `posts`、`posts/new`、`posts/:id`：文章管理与编辑（三语言支持、富文本编辑器）
          - `media`：资源库管理（图片、视频等附件）
          - `accounts/whitelist`：SSO 白名单管理
          - `accounts/local`：本地管理员账号管理 + 本地登录开关
          - `settings`：系统设置
          - `announcements`：公告管理（支持类型选择：普通/紧急）
          - `server-maps`：服务器地图管理（CRUD 操作 + 拖拽排序）
          - `server-info-fields`：服务器信息字段管理（CRUD 操作 + 拖拽排序 + 三语言编辑）

### 布局组件

- **`MainLayout.jsx`**：前台主布局组件
  - 使用 Flexbox 布局（`flex flex-col min-h-screen`）确保页脚始终在底部
  - 包含：`Navbar`（固定置顶）、`GlobalBanner`（固定定位，紧贴导航栏）、`<main><Outlet /></main>`、`Footer`
  - `GlobalBanner` 使用 `fixed` 定位作为覆盖层，不影响页面内容流
  - 所有前台页面通过此布局统一管理

- **`AdminLayout.jsx`**：后台管理布局组件
  - 侧边栏导航、顶部用户信息、全局横幅
  - 所有后台管理页面通过此布局统一管理

### 鉴权与安全策略

- **第一道防线：隐藏入口 Key**
  - 通过 `/:adminKey/webadmin` + `AdminGuard` 从数据库读取 `admin_entrance_key` 并校验 URL 中的 `adminKey`
  - Key 不匹配时返回 404，而非 403，以降低暴露后台入口的风险
  - 如果数据库读取失败，会回退到环境变量 `VITE_ADMIN_KEY`（向后兼容）

- **第二道防线：PocketBase 认证状态**
  - `RequireAdminAuth` 在进入后台内部路由前检查 `pb.authStore.isValid`
  - 未登录用户会被重定向到 `login` 页面，并携带来源路径用于登录后回跳

- **第三道防线：白名单邮箱**
  - `AdminLogin.jsx` 在登录成功后检查：
    - **SSO 登录**：优先从数据库 `whitelists` 集合查询，如果不存在则拒绝登录
    - **本地登录**：优先从数据库 `whitelists` 集合查询，如果数据库查询失败则回退到硬编码白名单（`ALLOWED_ADMINS`）作为向后兼容
    - 硬编码白名单已通过迁移脚本 `1765050029_migrate_hardcoded_whitelist.js` 自动迁移到数据库

- **第四道防线：本地登录开关**
  - `system_settings.enable_local_login` 控制是否允许本地账号密码登录
  - 当开关关闭时，登录页仅显示 Microsoft SSO 登录按钮，完全隐藏账号密码输入框
  - 开关状态可在 `AdminUsersPage.jsx` 中管理

## 前台页面与国际化

- **国际化配置**：`src/i18n.js`
  - 资源对象 `resources` 内置 `zh` / `en` / `ja` 三种语言，命名空间 `common`、`home`、`docs`
  - 默认语言 `lng: "zh"`，回退语言 `fallbackLng: "zh"`
- **Navbar & Footer**
  - `Navbar.jsx`：支持三语切换（中/日/EN），首页与文档页样式差异（透明 vs 白底），使用 `useTranslation` 读取 i18n 文案
  - `Footer.jsx`：静态内容，使用 `t('footer.*', { ns: 'common' })` 显示多语言版权与鸣谢信息，包含联系方式、特别鸣谢、官方链接等
- **Home/Docs/ErrorPage**
  - `Home.jsx`：使用 `useCmsSections()` Hook 从数据库动态读取分段数据，使用 `framer-motion` 与背景图片实现双层滚动动画，支持多语言标题、副标题和按钮
  - `Docs.jsx`：以卡片形式展示「快速开始 / 服务器规则 / 常见问题」三块内容。
  - `ErrorPage.jsx`：根据路由参数或 props 中的 `code`，从 `ASSETS.ERRORS` 中选择错误图片，多语言返回首页按钮。

## CMS 首页管理功能

### 功能概述

首页内容通过 `cms_sections` 集合进行动态管理，支持：
- **多语言内容**：标题、副标题、内容、公告、按钮文字支持中文、英文、日文
- **背景图片**：每个分段可配置独立的背景图片，通过 `ImagePicker` 组件统一管理
- **动态按钮**：每个分段可配置多个按钮，支持自定义链接和样式
- **排序管理**：通过 `sort_order` 字段控制分段显示顺序
- **一键智能翻译**：使用 MyMemory Translation API 自动翻译所有多语言字段（包括动态按钮）

### 使用方式

1. **后台管理**：
   - 访问 `/{adminKey}/webadmin/home` 进入首页管理页面
   - 可以创建、编辑、删除首页分段
   - 支持拖拽排序（通过调整 `sort_order` 值）

2. **分段编辑**：
   - 点击"新建分段"或编辑现有分段进入 `SectionEditor`
   - 支持编辑标题、副标题、内容、公告的多语言版本
   - 使用 `ImagePicker` 组件选择背景图片：
     - 点击"上传图片"直接上传新图片到媒体库
     - 点击"从媒体库选择"从已有图片中选择
     - 所有图片自动存储到 `media` 集合，通过 `background_ref` Relation 字段引用
   - 可以添加多个按钮，每个按钮支持多语言标签
   - 点击"一键智能翻译 (免费版)"按钮，自动检测已填写的语言并翻译到其他语言

3. **前台展示**：
   - 首页自动从数据库读取分段数据（使用 `expand: "background_ref"` 获取关联媒体）
   - 根据当前语言自动选择对应的文案
   - 支持 Framer Motion 滚动动画效果
   - 优先使用 `background_ref` Relation 字段，向后兼容旧版 `background` 文件字段

### 客户端翻译功能

- **翻译服务**：使用 MyMemory Translation API（免费，无需 API 密钥）
- **支持语言**：中文（zh）、英文（en）、日文（ja）
- **翻译范围**：
  - 固定字段：标题（title）、副标题（subtitle）、内容（content）、公告（announcement）
  - 动态按钮：所有按钮的标签（label）字段（支持数组遍历翻译）
- **智能检测**：自动检测已填写的语言（优先级：中文 → 英文 → 日文）
- **批量翻译**：一次点击翻译所有字段和按钮
- **速率限制保护**：字段间自动延迟 500ms，避免触发 API 限制
- **错误处理**：API 失败时返回原文，确保 UI 不中断
- **进度提示**：翻译过程中显示实时进度信息（包括按钮翻译进度）

### 数据迁移

- `1710000006_fix_home_and_images.js` 迁移脚本会自动：
  - 从 `public/holocn/` 目录读取背景图片
  - 上传到 `media` 集合
  - 创建默认的首页分段记录
  - 关联背景图片到分段

## 媒体资源管理系统

### 单一数据源架构

项目采用**单一数据源（Single Source of Truth）**策略管理所有媒体资源：

- **核心原则**：所有图片、视频等媒体文件统一存储在 `media` 集合中
- **引用方式**：其他集合通过 Relation 字段引用媒体资源
  - `cms_sections.background_ref` → `media` 集合
  - 未来可扩展：`posts.cover_ref`、`announcements.image_ref` 等
- **架构优势**：
  - **资源复用**：多个内容可以共享同一张图片，节省存储空间
  - **统一管理**：所有媒体在媒体库中集中管理，便于查找和维护
  - **易于维护**：更新或删除媒体时，所有引用自动更新
  - **数据一致性**：确保所有地方使用的都是同一份资源

### ImagePicker 组件

`ImagePicker` 是一个可重用的图片选择器组件，封装了完整的"上传到媒体库并链接"逻辑：

- **功能特性**：
  - 自动上传：选择文件后自动上传到 `media` 集合
  - 媒体库选择：从已有图片中选择
  - 预览显示：自动加载并显示选中的图片
  - 向后兼容：支持旧版 URL 预览
  - 删除功能：一键清除选中的图片
- **使用方式**：
  ```jsx
  <ImagePicker
    value={formData.background_ref}  // Relation ID
    onChange={(id) => setFormData({...formData, background_ref: id})}
    previewUrl={legacyUrl}  // 可选，用于向后兼容
    label="背景图片"
  />
  ```
- **内部处理**：
  - 上传文件时自动调用 `pb.collection("media").create()`
  - 返回新创建的媒体 ID 给父组件
  - 父组件只需处理 Relation ID，不处理文件对象

### MediaLibraryModal 组件

媒体库选择器模态框，提供图片浏览和选择功能：

- **功能特性**：
  - 网格视图：以缩略图形式展示所有图片
  - 搜索过滤：支持按文件名搜索
  - 自动筛选：仅显示图片文件（过滤视频和其他文件）
  - 点击选择：点击图片后返回媒体 ID 并关闭模态框

### 数据读取模式

- **后台编辑**：使用 `expand: "background_ref"` 获取关联的媒体记录
  ```javascript
  const section = await pb.collection("cms_sections").getOne(id, {
    expand: "background_ref",
  });
  // section.expand.background_ref 包含完整的媒体记录
  ```
- **前台展示**：同样使用 `expand` 获取媒体 URL
  ```javascript
  const result = await pb.collection("cms_sections").getList(1, 100, {
    sort: "sort_order",
    expand: "background_ref",
  });
  ```

## 统计埋点（Analytics）

- **组件**：`AnalyticsInjector.jsx`
  - 在 `App.jsx` 中全局加载（始终在 Router 上方）
  - 从 `system_settings` 集合中读取 `analytics_config`：
    - `google`：注入 Google Analytics `gtag` 脚本
    - `baidu`：注入百度统计脚本（Tongji 2.0，异步模式）
  - 加载失败时仅在控制台输出 `console.warn`，不会影响页面正常渲染。

### Google Analytics

- **注入方式**：使用 Google Analytics 4 (GA4) 标准方式
- **脚本加载**：异步加载 `gtag.js` 脚本
- **初始化**：自动配置 `dataLayer` 和 `gtag` 函数

### 百度统计（Baidu Analytics / Tongji 2.0）

- **智能输入**（`SettingsPage.jsx`）：
  - 支持直接输入 32 位 ID
  - **自动提取功能**：支持直接粘贴完整 `<script>` 代码，系统会自动提取 32 位 ID
  - 正则匹配：使用 `hm\.js\?([a-z0-9]{32})` 模式匹配百度统计 2.0 代码格式
  - 用户反馈：提取成功后显示绿色提示"✓ 已自动从代码中提取 ID"
  - 支持 `onChange` 和 `onPaste` 两种触发方式

- **现代异步注入**（`AnalyticsInjector.jsx`）：
  - 使用官方推荐的异步注入模式（符合百度统计 2.0 标准）
  - **幂等性保证**：
    - 检查是否已存在相同 ID 的脚本（通过 `src` 属性匹配）
    - 检查是否已存在初始化脚本（通过 ID 检查）
    - 确保每个会话只注入一次，避免重复加载
  - 安全性：使用 `JSON.stringify` 转义 ID 值，防止代码注入攻击
  - 代码格式：
    ```javascript
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?" + ID;
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
    ```

## 部署建议（简要）

- **开发环境**
  - 本地启动 PocketBase：`backend/pocketbase.exe serve`
  - 本地启动前端：`npm run dev`
  - `VITE_POCKETBASE_URL` 指向 `http://127.0.0.1:8090`

- **生产环境（建议）**
  - 将 PocketBase 独立部署（服务 + 数据目录单独挂载/备份）
  - 使用 `npm run build` 生成静态资源，部署到任意静态服务器（Nginx、Vercel、Netlify 等）
  - 配置反向代理或环境变量，使前端能访问到 PocketBase API（HTTPS 推荐）
  - 妥善保管与定期更换 `system_settings.admin_entrance_key`，修改后需要更新访问 URL
  - 建议关闭本地登录功能（`system_settings.enable_local_login = false`），仅使用 Microsoft SSO

## 核心功能说明

### 首页管理（CMS）

- **动态内容**：首页分段通过数据库动态管理，无需修改代码即可更新内容
- **多语言支持**：标题、副标题、内容、公告、按钮文字支持中文、英文、日文三种语言
- **背景图片**：每个分段可配置独立背景图，使用 `ImagePicker` 组件统一管理
  - 支持直接上传新图片（自动存储到媒体库）
  - 支持从媒体库选择已有图片（资源复用）
  - 通过 `background_ref` Relation 字段引用媒体资源
- **按钮配置**：每个分段可配置多个按钮，支持自定义链接和样式（primary/secondary）
- **滚动动画**：使用 Framer Motion 实现平滑的滚动背景效果
- **一键翻译**：使用 MyMemory Translation API 自动翻译所有多语言字段，包括动态按钮数组

### 文章管理

- **三语言支持**：文章标题、摘要、内容支持中文、英文、日文三种语言
  - 字段类型：`title`、`summary`、`content` 均为 JSON 类型
  - 数据结构：`{ "zh": "...", "en": "...", "ja": "..." }`
  - 编辑器支持：语言标签切换，编辑不同语言的内容
  - 一键翻译：自动检测已填写语言，批量翻译到其他语言
- **富文本编辑**：基于 Tiptap 的所见即所得编辑器，支持：
  - 文本格式化：加粗、斜体、标题（H1-H3）、列表、引用、链接
  - 图片插入：支持拖拽上传、粘贴上传、点击上传、从媒体库选择
  - 实时预览：编辑即所见，使用 `prose` 样式类确保编辑器与前台显示一致
- **内容存储**：文章内容以 JSON 格式存储多语言 HTML（每个语言独立）
- **封面与置顶**：支持封面图片（Relation 引用 `media`）和置顶功能
- **内容展示**：
  - 列表页：显示封面图片、标题、摘要、置顶标识、日期
  - 详情页：完整文章内容，使用 `prose` 样式类确保排版美观
  - 本地化：使用 `getLocalizedContent()` 辅助函数，根据当前语言自动选择内容
- **向后兼容**：`getLocalizedContent()` 函数支持旧数据格式（字符串），自动转换

### 资源库管理

- **单一数据源**：所有媒体资源统一存储在 `media` 集合中
- **独立管理**：通过后台菜单"资源库"访问，统一管理所有上传的附件
- **分类浏览**：自动根据文件扩展名分类（图片/视频/其他），支持快速筛选
- **图片优化**：列表显示缩略图（使用 PocketBase 的 `?thumb=100x100` 功能），点击查看大图
- **编辑器集成**：在文章编辑器和首页分段编辑器中可通过"媒体库"按钮选择已有图片，避免重复上传
- **资源复用**：多个内容可以共享同一张图片，删除内容时不会删除关联的图片
- **Relation 引用**：通过 Relation 字段引用媒体，实现真正的单一数据源

### 客户端翻译功能

- **免费服务**：使用 MyMemory Translation API，无需配置 API 密钥
- **智能检测**：自动检测已填写的语言（优先级：中文 → 英文 → 日文）
- **批量翻译**：一次点击翻译所有字段（标题、副标题、内容、公告）和所有按钮标签
- **动态按钮支持**：自动遍历按钮数组，翻译每个按钮的 `label` 字段
- **速率限制保护**：字段间自动延迟 500ms，避免触发 API 限制
- **错误容错**：API 失败时返回原文，确保 UI 不中断
- **进度提示**：翻译过程中显示实时进度信息（包括按钮翻译进度）

### 可重用组件

- **`ImagePicker`**：可重用的图片选择器组件
  - 自动处理上传到媒体库的逻辑
  - 支持从媒体库选择已有图片
  - 父组件只需处理 Relation ID
  - 可在任何需要图片选择的地方使用
- **`MediaLibraryModal`**：媒体库选择器模态框
  - 网格视图展示图片
  - 支持搜索过滤
  - 返回媒体 ID 给父组件

### 文档中心功能

- **文档中心页面**（`/docs`）：展示三个卡片入口
  - **网站公告**：链接到 `/docs/announcements`，显示所有 `category="公告"` 的已发布文章
  - **服务器信息**：链接到 `/docs/server-info`，显示服务器静态信息、实时状态和地图选择器
  - **其他文档**：链接到 `/docs/documents`，显示所有 `category="文档"` 的已发布文章
- **文章列表页**：
  - `WebsiteAnnouncements.jsx`、`OtherDocuments.jsx`：横向卡片布局（桌面端左侧图片、右侧内容；移动端堆叠）
  - 显示内容：封面图片、标题（加粗）、摘要（行截断）、日期、置顶标识
  - 排序：置顶文章优先（`is_pinned DESC`），然后按创建时间倒序
- **文章详情页**（`ArticleDetail.jsx`）：
  - 路由：`/docs/article/:id`
  - 显示内容：封面图片、标题、更新日期、完整 HTML 内容
  - 样式：使用 `prose` 样式类确保排版美观（标题、列表、引用、图片等）
- **文章分类**：`posts` 集合的 `category` 字段支持以下分类：
  - `"公告"`：用于网站公告列表页
  - `"文档"`：用于其他文档列表页
  - `"更新日志"`：可用于未来扩展
- **多语言支持**：所有文章相关页面使用 `getLocalizedContent()` 函数获取本地化内容，根据当前语言自动选择

### 服务器信息管理

- **静态信息字段**（`server_info_details` 集合）：
  - 动态管理服务器信息字段（IP、版本、运行模式等）
  - 支持多语言标签和值（中文、英文、日文）
  - 支持拖拽排序，自动更新 `sort_order` 字段
  - 前台自动根据当前语言显示对应的标签和值
- **实时服务器状态**：
  - API 集成：使用 `https://api.mcsrvstat.us/3/{hostname}` 获取实时服务器状态（CORS 友好）
  - 自动提取：从 `server_info_details` 中提取服务器地址（`icon === 'Server'` 或 `sort_order === 1`）
  - 显示信息：
    - 在线人数：`{online} / {max}` 玩家
    - 在线/延迟：数字显示 `在线/{ping} ms`，布尔值显示 `在线`，其他显示 `离线/未知状态`
    - 版本：服务端版本号
    - MOTD：服务器标语（优先使用 clean 格式，fallback 到 raw）
  - 自动刷新：每 30 秒更新一次
  - 状态指示：在线显示绿色脉冲点，离线显示红色点
  - 离线处理：API 失败或服务器离线时显示友好错误信息（红色警告框）
  - 国际化支持：所有字段标签支持中文、英文、日文三语言显示
- **服务器地图管理**：
  - 功能概述：管理服务器外部地图链接（Dynmap、BlueMap 等），支持多个地图切换显示
  - 前台展示：
    - 服务器信息页面（`/docs/server-info`）提供地图选择器和 iframe 显示
    - 支持深度链接：通过 URL 参数 `?mapId=...` 自动选择指定地图
    - 自动选择：如果 URL 中没有 `mapId`，则选择 `sort_order` 最小的地图
    - 网页全屏模式：点击最大化按钮可全屏显示地图，ESC 键退出
  - 后台管理：
    - 通过 `ServerMapManager.jsx` 提供完整的 CRUD 操作
    - 支持拖拽排序：通过拖拽调整地图顺序，自动更新 `sort_order` 字段
    - 表单验证：确保名称和 URL 必填，URL 格式正确（必须为 http:// 或 https:// 开头）

---

## 版本更新记录

### 最新更新（2025-01-XX）

- **文章系统三语言支持**：
  - `posts` 集合的 `title`、`summary`、`content` 字段升级为 JSON 类型
  - 支持中文、英文、日文三种语言独立编辑
  - 编辑器支持语言标签切换和一键智能翻译
  - 前台自动根据当前语言显示对应内容，支持 fallback 机制
  - 迁移脚本 `1765100000_migrate_posts_multilingual.js` 自动将旧数据转换为新格式
- **实时服务器状态模块**：
  - 集成 mcsrvstat API（`https://api.mcsrvstat.us/3/{hostname}`），实时显示服务器在线人数、延迟、版本、MOTD
  - 自动从 `server_info_details` 集合中提取服务器地址
  - 支持自动刷新（每 30 秒）和离线状态处理
  - 显示字段：在线人数、在线/延迟、版本、服务器标语
- **公告动态颜色**：
  - 公告集合新增 `type` 字段（`info` 普通/蓝色、`urgent` 紧急/红色）
  - 前台横幅自动根据类型显示不同颜色背景
- **服务器信息字段管理**：
  - 新增 `server_info_details` 集合，支持动态管理服务器信息
  - 支持多语言标签和值，拖拽排序功能
  - 迁移脚本 `1765080000_init_server_info.js` 初始化默认数据
- **排版样式统一**：
  - 安装 `@tailwindcss/typography` 插件
  - 统一前台文章详情页和后台编辑器的富文本排版样式，确保 WYSIWYG 体验
- **全局横幅公告优化**：
  - 优化定位：使用 `fixed` 定位，紧贴导航栏下方，不影响页面内容流
  - 样式改进：图标文本对齐、专业排版、无间隙布局
- **Docs 卡片对齐优化**：
  - 修复卡片内文本对齐问题，使用 Flexbox 实现垂直居中、左对齐

### 2025-01 代码库全面优化

- **依赖版本确认**：
  - 所有依赖已确认为最新稳定版本（React 19.2.1、Vite 7.2.6、Tailwind CSS 4.1.17 等）
  - 无需升级，所有依赖均为最新版本
- **文件清理**：
  - 删除未使用的组件：`MicrosoftIcon.jsx`、`MarkdownPreview.jsx`
  - 删除占位文件：`__dummy__`、`__dummy__2`
  - 删除示例文件：`pb_sample_schema.json`
- **资源路径修复**：
  - 修复 `src/config/assets.js` 中 `SITE_ICON` 路径（从 `.jpg` 改为 `.png`）
- **代码质量优化**：
  - 确保所有 UI 组件默认文本为简体中文
  - 无 linter 错误
  - 所有组件均被正确引用
- **百度统计功能增强**：
  - **智能输入**：支持直接粘贴完整百度统计代码，自动提取 32 位 ID
  - **现代异步注入**：使用百度统计 2.0 官方推荐的异步注入模式
  - **幂等性保证**：确保脚本只注入一次，避免重复加载
  - **安全性增强**：使用 JSON.stringify 转义，防止代码注入攻击
  - **用户体验优化**：提取成功后显示友好提示信息
- 详细优化报告请查看 `OPTIMIZATION_REPORT.md`

---

如需进一步扩展（例如前台公开文章列表、更多文档分类等），建议在现有 `posts` 集合基础上扩展字段与路由，并复用 `PostEditor` 的富文本编辑能力。对于需要图片的集合，遵循单一数据源原则，添加对应的 `*_ref` Relation 字段并使用 `ImagePicker` 组件。
