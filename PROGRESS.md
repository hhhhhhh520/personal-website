# 个人网站项目进度
> 创建时间: 2026-05-09 | 最后更新: 2026-05-14

## 项目概述
**项目地址**: D:\my project\web\personal-website | **技术选型**: Next.js 16 + TypeScript + Tailwind CSS v4 + Three.js + Framer Motion | **目标**: AI 应用开发者的个人作品集网站

## 当前进度

### ✅ 已完成

#### P0 — 数据统一（2026-05-09）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 数据层 | `data/personal.ts` 作为唯一数据源 | data/personal.ts | 2026-05-09 |

#### P1 — 功能完善（2026-05-09）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 博客封面 | 创建 6 个 SVG 封面图 | public/images/blogs/*.svg | 2026-05-09 |
| MDX 迁移 | 博客内容迁移到 .mdx 文件 | content/blog/*.mdx | 2026-05-09 |
| API Key 检测 | 后端占位符检测，返回 503 | app/api/chat/route.ts | 2026-05-09 |

#### P2 — 体验优化（2026-05-10）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 简历下载 | QuickResume 实现下载功能 | components/QuickResume.tsx | 2026-05-10 |

#### P3 — 国际化与主题（2026-05-10）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| next-intl 集成 | 中英文国际化 | i18n/*.ts, messages/*.json | 2026-05-10 |
| 主题切换 | 自定义 ThemeProvider | components/providers/ThemeProvider.tsx | 2026-05-10 |

#### P4 — 全站国际化（2026-05-11）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 数据国际化 | 项目/技能/个人信息双语 | data/*.ts | 2026-05-11 |

#### P5 — 简历完善（2026-05-11）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| API 配置 | 切换到讯飞星辰 Astron | app/api/chat/route.ts | 2026-05-11 |

#### P6 — 依赖修复（2026-05-12）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| next-themes 替换 | 自定义 ThemeProvider 避免 React 19 冲突 | components/providers/ThemeProvider.tsx | 2026-05-12 |

#### P7 — 3D 核心场景重设计（2026-05-13）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 能量核心重写 | 多层结构 + 呼吸渐变色 | components/three/EnergyCore.tsx | 2026-05-13 |
| 传送门重写 | 多环嵌套 + 颜色区分 | components/three/Portal.tsx | 2026-05-13 |
| 主题色定义 | CSS 变量 + glass 工具类 | app/globals.css | 2026-05-13 |

#### P8 — shadcn 组件迁移（2026-05-13）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 组件迁移 | Card/Input/Progress/Sheet 替换手写组件 | 各页面 | 2026-05-13 |
| CSS 对比度修复 | 暗色模式文字可读性 | app/globals.css | 2026-05-13 |

#### P9 — 个人信息更新（2026-05-14）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 教育时间更新 | 入学 2023-09，毕业 2027-06 | data/personal.ts | 2026-05-14 |
| 简介重写 | 突出独立开发者、技术落地能力 | data/personal.ts, messages/*.json | 2026-05-14 |
| 移除 GPA | 不显示 GPA | data/personal.ts | 2026-05-14 |
| 移除奖项 | 不显示获奖荣誉 | data/personal.ts | 2026-05-14 |
| 移除职位头衔 | 首页不显示职位标签 | data/personal.ts, messages/*.json | 2026-05-14 |
| Nova 修复 | 流式输出追加而非替换 | stores/novaStore.ts | 2026-05-14 |

#### P10 — 首页背景重构（2026-05-14）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| Light Rays 背景 | WebGL 光线效果替换 Three.js | components/effects/LightRays.tsx | 2026-05-14 |
| ogl 依赖 | 安装 WebGL 库 | package.json | 2026-05-14 |
| 首页简化 | 移除 3D 传送门，保留简历模式 | app/[locale]/page.tsx | 2026-05-14 |

#### P11 — 主题与动画修复（2026-05-14）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 移除主题切换 | 固定深色模式 | components/ui/Navigation.tsx, ThemeProvider.tsx | 2026-05-14 |
| PageTransition 修复 | 移除 AnimatePresence 避免 WebGL context 丢失 | components/ui/PageTransition.tsx | 2026-05-14 |
| 按钮颜色修复 | "关于我"按钮深色背景可见 | app/[locale]/page.tsx | 2026-05-14 |

### ⏳ 进行中
| 任务 | 状态 | 预计完成 |
|------|------|----------|
| — | — | — |

### 📋 待办
| 优先级 | 任务 | 说明 |
|--------|------|------|
| P5 | 博客内容双语 | 6 篇 MDX 博客英文版本（可选） |

## 页面清单

| 路由 | 类型 | 状态 | 说明 |
|------|------|------|------|
| `/` | 重定向 | ✅ | 重定向到 /zh |
| `/zh` | 静态 | ✅ | 中文首页 |
| `/en` | 静态 | ✅ | 英文首页 |
| `/zh/about` | 静态 | ✅ | 关于页 |
| `/zh/projects` | 静态 | ✅ | 项目列表 |
| `/zh/projects/[id]` | 动态 | ✅ | 项目详情 |
| `/zh/blog` | 静态 | ✅ | 博客列表 |
| `/zh/blog/[slug]` | 动态 | ✅ | 博客详情 |
| `/zh/skills` | 静态 | ✅ | 技能矩阵 |
| `/api/chat` | 动态 | ✅ | AI 对话 API |

## 数据源

| 文件 | 用途 |
|------|------|
| `data/personal.ts` | 个人信息（唯一数据源） |
| `data/projects.ts` | 项目数据 |
| `data/blogs.ts` | 博客元数据 |
| `data/skills.ts` | 技能数据 |
| `content/blog/*.mdx` | 博客内容 |
| `messages/zh.json` / `en.json` | 国际化翻译 |

## 重要决策记录

| 决策 | 选择 | 原因 | 日期 |
|------|------|------|------|
| 数据源统一 | personal.ts 作为唯一数据源 | 消除数据不一致 | 2026-05-09 |
| 国际化方案 | next-intl + [locale] 路由 | App Router 官方推荐 | 2026-05-10 |
| LLM 服务 | 讯飞星辰 Astron | 国内可用 | 2026-05-11 |
| 主题方案 | 自定义 ThemeProvider | next-themes 与 React 19 不兼容 | 2026-05-13 |
| CSS 体系 | shadcn/ui oklch | 统一主题变量 | 2026-05-13 |
| 职位头衔 | 移除 | 简化首页，突出简介 | 2026-05-14 |
| 首页背景 | Light Rays (ogl) | 比 Three.js 更轻量，视觉效果更简洁 | 2026-05-14 |
| 主题模式 | 固定深色 | 简化配置，专注内容展示 | 2026-05-14 |
| 页面过渡 | 无 AnimatePresence | 避免 WebGL context 丢失 | 2026-05-14 |

## 技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| THREE.Clock deprecated | 低 | Three.js 新版推荐 Timer，影响项目/技能页 3D 场景 |
| WebGL context 数量 | 中 | 多页面 WebGL 可能超浏览器限制，需优化 context 管理 |
| 博客内容双语 | 低 | 可选 |
