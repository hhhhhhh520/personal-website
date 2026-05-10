# 个人网站项目进度
> 创建时间: 2026-05-09 | 最后更新: 2026-05-10

## 项目概述
**项目地址**: D:\my project\web\personal-website | **技术选型**: Next.js 16 + TypeScript + Tailwind CSS v4 + Three.js + Framer Motion | **目标**: AI 应用开发者的个人作品集网站

## 当前进度

### ✅ 已完成

#### P0 — 数据统一（2026-05-09）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 数据层 | `data/personal.ts` 作为唯一数据源，合并 QuickResume 真实数据 | data/personal.ts, data/index.ts | 2026-05-09 |
| 首页 | 替换英文占位为中文真实数据（姓名、标题、技能标签） | app/page.tsx | 2026-05-09 |
| 关于页 | 移除硬编码 personalInfo，改用 personal.ts | app/about/page.tsx | 2026-05-09 |
| 布局 | metadata/JSON-LD/Footer 使用 personal 数据 | app/layout.tsx | 2026-05-09 |
| 快速简历 | QuickResume 组件改用 personal.ts | components/QuickResume.tsx | 2026-05-09 |
| Bug 修复 | 禁用 GlowEffect（Three.js postprocessing 兼容问题） | components/three/MainScene.tsx | 2026-05-09 |

#### P1 — 功能完善（2026-05-09，朝廷工作流 10 子任务）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 博客封面 | 创建 6 个 SVG 封面图，修复 OG 图片引用 | public/images/blogs/*.svg, data/blogs.ts | 2026-05-09 |
| MDX 迁移 | 博客内容从 TS 模板字符串迁移到 .mdx 文件 | content/blog/*.mdx × 6 | 2026-05-09 |
| MDX 配置 | 安装 @next/mdx + next-mdx-remote，配置 next.config.ts | next.config.ts, mdx-components.tsx | 2026-05-09 |
| 数据层重构 | BlogPost 接口 content→contentFile，新增 lib/blog-content.ts | data/blogs.ts, lib/blog-content.ts | 2026-05-09 |
| MDX 渲染 | 博客详情页改用 MDXRemote，删除 renderContent() | app/blog/[slug]/page.tsx, components/blog/MDXComponents.tsx | 2026-05-09 |
| 联系页面 | 新建 /contact 路由，表单+联系方式+toast | app/contact/page.tsx | 2026-05-09 |
| 导航更新 | 桌面+移动端导航添加 Contact 链接 | components/ui/Navigation.tsx, MobileNav.tsx | 2026-05-09 |
| API Key 检测 | 后端占位符检测，返回 503 + 特定错误码 | app/api/chat/route.ts | 2026-05-09 |
| 前端提示 | AI 错误分类 + useChat 配置引导 + NovaGuide 警告横幅 | lib/ai.ts, hooks/useChat.ts, components/ai/NovaGuide.tsx | 2026-05-09 |
| 构建验证 | 24 页面全部生成，零错误 | — | 2026-05-09 |

#### P2 — 体验优化（2026-05-10，朝廷工作流 4 子任务）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| metadataBase | layout.tsx 添加 metadataBase 配置，消除构建警告 | app/layout.tsx | 2026-05-10 |
| 博客封面 | blog/page.tsx 使用 Image 组件加载 SVG 封面，支持 fallback | app/blog/page.tsx | 2026-05-10 |
| 项目封面 | projects/page.tsx 使用 Image 组件加载 SVG 封面，hover 效果 | app/projects/page.tsx | 2026-05-10 |
| 简历下载 | QuickResume 实现下载功能，创建占位 PDF | components/QuickResume.tsx, public/resume/resume.pdf | 2026-05-10 |

#### P3 — 国际化与主题（2026-05-10）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| next-intl 集成 | 安装 next-intl，创建 i18n 配置 | i18n/request.ts, i18n/routing.ts | 2026-05-10 |
| 翻译文件 | 中英文翻译 JSON | messages/zh.json, messages/en.json | 2026-05-10 |
| middleware | 语言路由中间件 | middleware.ts | 2026-05-10 |
| 路由重构 | 页面迁移到 [locale] 目录 | app/[locale]/*.tsx | 2026-05-10 |
| LocaleSwitcher | 语言切换组件 | components/ui/LocaleSwitcher.tsx | 2026-05-10 |
| Navigation | 导航栏国际化 + 语言切换按钮 | components/ui/Navigation.tsx | 2026-05-10 |
| MobileNav | 移动导航国际化 | components/ui/MobileNav.tsx | 2026-05-10 |
| 首页国际化 | 首页内容翻译 | app/[locale]/page.tsx | 2026-05-10 |
| 主题切换 | next-themes 集成，暗色/亮色切换 | components/providers/ThemeProvider.tsx, components/ui/ThemeToggle.tsx | 2026-05-10 |
| 性能监控 | Web Vitals 追踪 + PerformanceMonitor | app/layout.tsx, components/ui/PerformanceMonitor.tsx | 2026-05-10 |
| Hydration 修复 | 修复嵌套 head/body 标签问题 | app/[locale]/layout.tsx | 2026-05-10 |
| 组件国际化 | QuickResume + NovaGuide 翻译 | components/QuickResume.tsx, components/ai/NovaGuide.tsx | 2026-05-10 |

### ⏳ 进行中
| 任务 | 状态 | 预计完成 |
|------|------|----------|
| DEEPSEEK_API_KEY 配置 | 等待用户手动替换占位符 | 用户操作 |

### 📋 待办

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P4 | 其他页面国际化 | projects/blog/skills/about/contact 详情页翻译 |
| P4 | 博客内容双语 | 6 篇 MDX 博客英文版本 |
| P4 | 项目描述翻译 | data/projects.ts 国际化 |
| P4 | 简历 PDF 完善 | 替换占位 PDF 为实际简历内容 |

## 页面清单

| 路由 | 类型 | 状态 | 说明 |
|------|------|------|------|
| `/` | 重定向 | ✅ | 重定向到 /zh |
| `/zh` | 静态 | ✅ | 中文首页 |
| `/en` | 静态 | ✅ | 英文首页 |
| `/zh/about` | 静态 | ✅ | 关于页，个人信息+教育+兴趣 |
| `/en/about` | 静态 | ✅ | About page |
| `/zh/projects` | 静态 | ✅ | 项目列表，3D + 列表双视图 |
| `/en/projects` | 静态 | ✅ | Projects list |
| `/zh/projects/[id]` | 动态 | ✅ | 项目详情，6 个项目 |
| `/zh/blog` | 静态 | ✅ | 博客列表，分类/标签/搜索筛选 |
| `/en/blog` | 静态 | ✅ | Blog list |
| `/zh/blog/[slug]` | 动态 | ✅ | 博客详情，MDX 渲染，6 篇文章 |
| `/zh/skills` | 静态 | ✅ | 技能矩阵，3D + 列表双视图 |
| `/en/skills` | 静态 | ✅ | Skills matrix |
| `/zh/contact` | 静态 | ✅ | 联系页面，表单+联系方式 |
| `/en/contact` | 静态 | ✅ | Contact page |
| `/api/chat` | 动态 | ✅ | AI 对话 API，DeepSeek 流式响应 |

## 数据源

| 文件 | 用途 | 说明 |
|------|------|------|
| `data/personal.ts` | 个人信息 | **唯一数据源**，全站引用 |
| `data/projects.ts` | 项目数据 | 6 个项目 |
| `data/blogs.ts` | 博客元数据 | 6 篇文章，content 已迁移到 MDX |
| `data/skills.ts` | 技能数据 | 技能矩阵 |
| `data/nova-prompts.ts` | AI 向导配置 | 快捷回复、降级文案 |
| `content/blog/*.mdx` | 博客内容 | MDX 格式，通过 lib/blog-content.ts 读取 |
| `messages/zh.json` | 中文翻译 | 导航、首页、按钮等文本 |
| `messages/en.json` | 英文翻译 | English translations |

## 修改历史

### 2026-05-10 P3 国际化支持（next-intl）
**修改文件**: 15+ 文件 | **新增文件**: 8 个 | **修改内容**: 中英文国际化切换 | **修改原因**: 支持多语言访问

**新增文件**:
- i18n/request.ts — next-intl 请求配置
- i18n/routing.ts — 语言路由配置
- messages/zh.json — 中文翻译
- messages/en.json — 英文翻译
- middleware.ts — 语言路由中间件
- components/ui/LocaleSwitcher.tsx — 语言切换组件
- app/[locale]/layout.tsx — locale 布局
- app/[locale]/page.tsx — 国际化首页

**改动详情**:
- next.config.ts — 集成 next-intl 插件
- app/layout.tsx — 简化为根布局，移除业务逻辑
- components/ui/Navigation.tsx — 使用 useTranslations，添加 LocaleSwitcher
- components/ui/MobileNav.tsx — 使用 useTranslations
- 删除 app/about, app/blog, app/contact, app/projects, app/skills（迁移到 [locale] 目录）

### 2026-05-10 P2 体验优化（朝廷工作流 4 子任务）
**修改文件**: 4 文件 | **新增文件**: 1 个 | **修改内容**: metadataBase、封面图展示、简历下载 | **修改原因**: 提升用户体验和 SEO

**改动详情**:
- app/layout.tsx — 添加 metadataBase 配置，消除构建警告
- app/blog/page.tsx — 使用 Image 组件加载 SVG 封面，支持 fallback
- app/projects/page.tsx — 使用 Image 组件加载项目封面，hover 效果
- components/QuickResume.tsx — 实现简历 PDF 下载功能
- public/resume/resume.pdf — 新建占位 PDF 文件

### 2026-05-09 P0 + P1 全量改进
**修改文件**: 20+ 文件 | **新增文件**: 17 个 | **修改内容**: 数据统一、联系页面、MDX 迁移、API Key 提示 | **修改原因**: 消除占位内容，提升专业度

**P0 改动**:
- data/personal.ts — 合并 QuickResume 真实数据，中文化
- app/page.tsx — 首页使用 personal.ts
- app/about/page.tsx — 移除硬编码
- app/layout.tsx — metadata 使用 personal 数据
- components/QuickResume.tsx — 改用 personal.ts
- components/three/MainScene.tsx — 禁用 GlowEffect

**P1 改动**:
- public/images/blogs/*.svg × 6 — 博客封面图
- content/blog/*.mdx × 6 — MDX 内容文件
- data/blogs.ts — 接口重构 content→contentFile
- lib/blog-content.ts — 服务端 MDX 读取
- next.config.ts — MDX 配置
- mdx-components.tsx — Next.js MDX 配置
- app/contact/page.tsx — 联系页面
- components/blog/MDXComponents.tsx — MDX 样式映射
- app/blog/[slug]/page.tsx — MDX 渲染替换
- components/ui/Navigation.tsx — Contact 导航
- components/ui/MobileNav.tsx — Contact 图标
- app/api/chat/route.ts — API Key 占位符检测
- lib/ai.ts — API_KEY_NOT_CONFIGURED 错误类型
- hooks/useChat.ts — 配置引导文案
- components/ai/NovaGuide.tsx — 警告横幅

## 重要决策记录

| 决策 | 选择 | 原因 | 日期 |
|------|------|------|------|
| 数据源统一 | personal.ts 作为唯一数据源 | 消除 QuickResume 与页面数据不一致 | 2026-05-09 |
| GlowEffect | 禁用 postprocessing | @react-three/postprocessing 与 Three.js 版本不兼容 | 2026-05-09 |
| 博客内容管理 | MDX 文件 + contentFile 引用 | 模板字符串不可维护，MDX 支持语法高亮和组件 | 2026-05-09 |
| MDX 渲染方案 | next-mdx-remote/rsc | MDX 文件在 content/ 目录而非 app/，需远程加载 | 2026-05-09 |
| API Key 检测 | 后端 503 + 前端错误分类 | 占位符导致 401 不友好，需要明确引导 | 2026-05-09 |
| 联系页面 | 纯前端表单 + toast | 无后端邮件服务，表单仅做展示 | 2026-05-09 |
| 国际化方案 | next-intl + [locale] 路由 | App Router 官方推荐，支持 SSG | 2026-05-10 |
| URL 格式 | /zh/xxx 和 /en/xxx | SEO 友好，默认语言为中文 | 2026-05-10 |

## 技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| GlowEffect 禁用 | 低 | 等待 @react-three/postprocessing 兼容性修复 |
| metadataBase 未设置 | 低 | OG 图片 URL 使用 localhost fallback |
| renderContent 遗留 import | 低 | Image 导入在 blog/[slug]/page.tsx 中未使用 |
| 简历 PDF 下载 | 中 | 按钮已存在但功能未实现 |
