# 个人网站项目进度
> 创建时间: 2026-05-09 | 最后更新: 2026-05-15

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

#### P12 — 简化页面结构（2026-05-14）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 删除技能页 | 移除 /skills 路由 | app/[locale]/skills/ | 2026-05-14 |
| 删除3D视图 | 项目页移除 3D 场景 | app/[locale]/projects/page.tsx | 2026-05-14 |
| 删除3D组件 | 移除 Three.js 相关组件 | components/three/ | 2026-05-14 |
| 导航更新 | 移除技能页链接 | components/ui/Navigation.tsx, MobileNav.tsx | 2026-05-14 |
| 翻译清理 | 移除 skills 相关翻译 | messages/zh.json, en.json | 2026-05-14 |

### ⏳ 进行中
| 任务 | 状态 | 预计完成 |
|------|------|----------|
| 无 | - | - |

### 📋 待办
| 优先级 | 任务 | 说明 |
|--------|------|------|
| P5 | 博客内容双语 | 6 篇 MDX 博客英文版本（可选） |

#### P17 — 自定义鼠标光标（2026-05-15）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| GSAP 依赖 | 安装动画库 | package.json | 2026-05-15 |
| TargetCursor 组件 | GSAP 驱动的旋转光标 | components/effects/TargetCursor.tsx | 2026-05-15 |
| CSS 样式 | 光标样式 + cursor-target 隐藏默认指针 | components/effects/TargetCursor.css | 2026-05-15 |
| 布局集成 | 全局引入 TargetCursor | app/[locale]/layout.tsx | 2026-05-15 |
| 页面适配 | 所有可交互元素添加 cursor-target 类 | 各页面组件 | 2026-05-15 |
| Nova 来源移除 | 禁用 RAG 来源链接显示 | app/api/chat/route.ts | 2026-05-15 |

#### P16 — RRF 融合算法实现（2026-05-15）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| RRF 融合模块 | reciprocalRankFusion 函数 | rag/utils/rrfFusion.ts | 2026-05-15 |
| 关键词检索模块 | N-gram 分词 + BM25 风格评分 | rag/utils/keywordSearch.ts | 2026-05-15 |
| 向量检索模块 | cosineSimilarity 封装 | rag/utils/vectorSearch.ts | 2026-05-15 |
| API 重构 | hybridSearch 集成 RRF | app/api/rag/route.ts | 2026-05-15 |
| 安全修复 | escapeRegExp 防止正则注入 | app/api/rag/route.ts, rag/utils/keywordSearch.ts | 2026-05-15 |
| 数据提取修复 | 消除博客数据重复 | rag/scripts/extract_data.py | 2026-05-15 |
| 索引重建 | 310 片段（无重复 doc_id） | public/rag-index/ | 2026-05-15 |
| RRF 测试 | 单元测试 + 混合搜索测试 | rag/__tests__/rrf.test.ts, hybrid.test.ts | 2026-05-15 |
| 个人信息检索测试 | RRF vs Legacy 对比 | rag/__tests__/personal-retrieval.test.ts | 2026-05-15 |

#### P15 — 完整文档体系构建（2026-05-15）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 文档模板 | 设计项目文档模板结构 | docs/projects/TEMPLATE.md | 2026-05-15 |
| 目录结构 | 创建 docs/projects/ 目录 | docs/projects/ | 2026-05-15 |
| mini-claude 文档 | LangGraph 状态机 + 多 Agent 并发 | docs/projects/mini-claude.md | 2026-05-15 |
| codecraft-agent 文档 | 8 状态机 + 沙箱执行 | docs/projects/codecraft-agent.md | 2026-05-15 |
| campus-agent 文档 | 混合检索 + RRF 融合 | docs/projects/campus-agent.md | 2026-05-15 |
| phone-pick-assistant 文档 | 多轮对话 + 场景排序 | docs/projects/phone-pick-assistant.md | 2026-05-15 |
| cv-generator 文档 | JD 关键词注入 + ATS 优化 | docs/projects/cv-generator.md | 2026-05-15 |
| game-agent 文档 | 模板匹配 + 智能休眠 | docs/projects/game-agent.md | 2026-05-15 |
| 脚本扩展 | extract_data.py 支持 Markdown | rag/scripts/extract_data.py | 2026-05-15 |
| 数据源更新 | build_index.py 包含项目文档 | rag/scripts/build_index.py | 2026-05-15 |
| 索引重建 | 316 片段（54 项目文档片段） | public/rag-index/ | 2026-05-15 |
| 维护指南 | 文档更新流程说明 | docs/MAINTENANCE.md | 2026-05-15 |

#### P14 — RAG 测试编写（2026-05-15）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 测试框架 | Vitest 配置 + npm scripts | vitest.config.ts, package.json | 2026-05-15 |
| TypeScript 单元测试 | 相似度、向量、关键词、缓存、混合搜索 | rag/__tests__/*.test.ts | 2026-05-15 |
| TypeScript 集成测试 | API、安全、Chat-RAG、端到端 | rag/__tests__/*.test.ts | 2026-05-15 |
| TypeScript 性能测试 | 性能基准、索引构建、增量更新 | rag/__tests__/*.test.ts | 2026-05-15 |
| Python 测试 | 分块器、数据提取 | rag/scripts/test_*.py | 2026-05-15 |
| 测试统计 | 279 测试全部通过 | - | 2026-05-15 |

#### P13 — Nova RAG 功能开发（2026-05-14）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| RAG 目录结构 | rag/{scripts,types,utils} | rag/ | 2026-05-14 |
| Python 环境 | venv + sentence-transformers | rag/venv/, requirements.txt | 2026-05-14 |
| TypeScript 类型 | RAGDocument, SearchResult 等 | rag/types/index.ts | 2026-05-14 |
| 数据提取脚本 | 从 projects/personal/blogs 提取 | rag/scripts/extract_data.py | 2026-05-14 |
| 分块策略 | TextChunker, DocumentChunker | rag/scripts/chunker.py | 2026-05-14 |
| Embedding 集成 | bge-large-zh-v1.5 本地模型 | rag/scripts/build_index.py | 2026-05-14 |
| 索引生成 | 89 文档片段 + 1024 维向量 | public/rag-index/ | 2026-05-14 |
| RAG API | POST /api/rag 查询端点 | app/api/rag/route.ts | 2026-05-14 |
| Chat 集成 | RAG 检索注入系统提示词 | app/api/chat/route.ts | 2026-05-14 |
| 增量更新 | 数据哈希 + npm 脚本 | build_index.py, package.json | 2026-05-14 |

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
| `/api/chat` | 动态 | ✅ | AI 对话 API |
| `/api/rag` | 动态 | ✅ | RAG 检索 API |

## 数据源

| 文件 | 用途 |
|------|------|
| `data/personal.ts` | 个人信息（唯一数据源） |
| `data/projects.ts` | 项目数据 |
| `data/blogs.ts` | 博客元数据 |
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
| 技能页 | 删除 | 简化页面结构，专注核心内容 | 2026-05-14 |
| 3D视图 | 删除 | 项目页改为纯列表视图，更简洁 | 2026-05-14 |
| RAG 方案 | 预构建索引 + JSON 部署 | Vercel serverless 兼容 | 2026-05-14 |
| Embedding | bge-large-zh-v1.5 本地模型 | 中文优化，免费，已有资源 | 2026-05-14 |
| 自定义光标 | TargetCursor (GSAP) | 提升交互体验，移动端自动禁用 | 2026-05-15 |
| Nova 来源链接 | 移除 | 简化回答，不显示 RAG 来源 | 2026-05-15 |
| 项目文档体系 | docs/projects/*.md 详细文档 | RAG 能回答项目细节问题 | 2026-05-15 |
| 混合搜索算法 | RRF 融合 + N-gram 分词 | 解决 pseudo-query embedding 偏差问题 | 2026-05-15 |
| 数据提取策略 | 只从 MDX 提取博客内容 | 消除 blogs.ts 和 MDX 重复 | 2026-05-15 |

## 技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| 博客内容双语 | 低 | 6 篇 MDX 博客英文版本（可选） |
