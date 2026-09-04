# 个人网站项目进度
> 创建时间: 2026-05-09 | 最后更新: 2026-09-04

## 项目概述
**项目地址**: D:\my project\web\personal-website | **技术选型**: Next.js 16 + TypeScript + Tailwind CSS v4 + Three.js + Framer Motion | **目标**: AI 应用开发者的个人作品集网站

## 当前进度

### ✅ 已完成

#### P23 — 死代码清理 + zustand 幻影依赖（2026-09-04）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 删除 | 5 个无消费者文件(~1311行):3D/转场时代遗留 sceneStore/usePreload/OptimizedImage/ProjectTransition/examples | 对应 5 文件 + `rmdir examples/` | 2026-09-04 |
| 同步 | barrel 删导出 | stores/index.ts, hooks/index.ts, components/effects/index.ts | 2026-09-04 |
| 加固 | zustand 由幻影(transitive)依赖 → 显式 `^5.0.13` + lock | package.json, package-lock.json | 2026-09-04 |
| 验证 | build exit0 / tsc0 / 243 测试 / 8 项目页×2 语言 SSG 不变；关 ISSUE-005 | — | 2026-09-04 |

#### P22 — 作品集新增 2 个项目（2026-09-04）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 数据层 | `projects.ts` 新增 AgentHub、讯飞 Agent 算法挑战赛（6→8） | data/projects.ts | 2026-09-04 |
| 封面 | 2 个 SVG 封面（仿现有风格） | public/images/projects/{agenthub,iflytek-agent-challenge}.svg | 2026-09-04 |
| 文档 | 2 份项目详细文档 + 索引表登记 | docs/projects/{agenthub,iflytek-agent-challenge}.md, docs/projects/README.md | 2026-09-04 |
| Nova 接线 | `PROJECT_INTROS` 补 2 键；"6→8 个核心项目"（含**实际生效的** `chat/route.ts` 系统提示词） | data/nova-prompts.ts, app/api/chat/route.ts | 2026-09-04 |
| RAG 索引 | 重建 546→563 片段，project 6→8，data_hash `f840f4a` | public/rag-index/*.json | 2026-09-04 |
| 提交审查 | pre-commit 三视角审查（攻击者/生命周期/声明vs实现），修正 62.65 归因不实、train200、AgentHub status、9-action 计数 | — | 2026-09-04 |

**pre-commit 审查 + 端到端 `npm run build` 发现的既有问题**：
- ✅ 已修（不修则 `npm run build` 无法通过）：`rag/utils/validation.ts` 的 `topK: number|undefined` 类型报错——收紧 `ValidationResult` 成功分支返回类型（运行时本已默认 3、`api.test.ts` 已锁定，属纯类型修正）；`content/blog/agent-fault-tolerance.mdx:305` 表格单元 `<100ms` 被 MDX 当 JSX 报错——改行内代码。修后 `npm run build` 全绿，8 个项目详情页全部 SSG。
- ⏳ 仍待办（不阻塞构建）：详情页 OG 图指向不存在的 `.png`（`app/[locale]/projects/[id]/page.tsx:42`，实际只有 `.svg`）；`data/nova-prompts.ts` 的 `SYSTEM_PROMPT`/`PROACTIVE_MESSAGES` 是与 `chat/route.ts` 内联副本重复的**死配置**；JSON-LD `dangerouslySetInnerHTML` 未转义 `<`（当前数据无可利用字符，属潜在 sink）；`build_index.py:526` 报错提示写成 `extract_content.py`（实为 `extract_data.py`）。

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

#### P18 — 博客新增（2026-05-23）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| RAG 混合搜索 | 关键词 + 向量 + RRF 融合实战 | content/blog/rag-hybrid-search-implementation.mdx | 2026-05-23 |
| Windows CI 踩坑 | 8.3路径、编码、Pydantic Mock | content/blog/windows-ci-pitfalls.mdx | 2026-05-23 |
| 上下文压缩对比 | Claude Code vs Mini Claude | content/blog/claude-code-vs-mini-claude-compression.mdx | 2026-05-23 |
| 测试之路 | 从零到 1733 测试 | content/blog/mini-claude-testing-journey.mdx | 2026-05-23 |
| AgentHub 平台 | IM 式多 Agent 协作 | content/blog/agenthub-multi-agent-collaboration.mdx | 2026-05-23 |
| SSE 流式输出 | 让 AI 响应"活"起来 | content/blog/sse-streaming-for-ai-apps.mdx | 2026-05-23 |
| 博客元数据 | 新增 6 篇博客配置 | data/blogs.ts | 2026-05-23 |

#### P20 — 博客新增（2026-06-26）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| Contract v1 | AgentHub 多 Agent 安全契约实战 | content/blog/agenthub-contract-v1.mdx | 2026-06-26 |
| 代码审查 | 三轮审查实战：从"能跑"到"能扛" | content/blog/multi-round-code-review.mdx | 2026-06-26 |
| 容错设计 | ToolDegradation + SQLite 持久化 | content/blog/agent-fault-tolerance.mdx | 2026-06-26 |
| 封面图 | 3 个 SVG 封面 | public/images/blogs/*.svg | 2026-06-26 |
| 博客元数据 | 新增 3 篇博客配置 | data/blogs.ts | 2026-06-26 |

#### P21 — 博客新增 + RAG 索引重建（2026-07-01）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| format DoS 博客 | str.format() 花括号 DoS 陷阱 | content/blog/python-format-string-brace-dos.mdx | 2026-07-01 |
| 安全清单博客 | LLM 应用上线安全清单 | content/blog/llm-app-security-hardening.mdx | 2026-07-01 |
| 封面图 | 2 个 SVG 封面（brace-dos + security-hardening） | public/images/blogs/*.svg | 2026-07-01 |
| 博客元数据 | 新增 2 篇博客配置 | data/blogs.ts | 2026-07-01 |
| RAG 索引重建 | 310→546 片段，blog 6→17 篇全量纳入 | public/rag-index/*.json | 2026-07-01 |
| GPU 构建修复 | 改用 CUDA venv，embedding 30s→7s | rag/scripts/build_index.py | 2026-07-01 |
| ISSUE-002 完成 | route.ts 删重复代码改导入 utils | app/api/rag/route.ts | 2026-07-01 |

#### P19 — 代码质量修复（2026-06-25）
| 阶段 | 内容 | 文件 | 完成日期 |
|------|------|------|----------|
| 问题追踪 | 创建 issues/ 目录，记录 9 个问题 | issues/*.md | 2026-06-25 |
| ISSUE-002 | route.ts 改为从 rag/utils 导入，删除重复代码 | app/api/rag/route.ts | 2026-06-25 |
| ISSUE-001 | 9 个测试文件改为导入实际实现 | rag/__tests__/*.test.ts | 2026-06-25 |
| 新增模块 | security.ts, validation.ts, cache.ts | rag/utils/*.ts | 2026-06-25 |
| 测试统计 | 243 个测试全部通过 | - | 2026-06-25 |

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
| Cloudflare 部署尝试 | 放弃 | workers.dev 被墙，需自定义域名或换 Zeabur | 2026-05-16 |
| 博客新增 | 6 篇技术博客 | RAG混合搜索、Windows CI、上下文压缩、测试之路、AgentHub、SSE流式 | 2026-05-23 |

## 技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| 博客内容双语 | 低 | 6 篇 MDX 博客英文版本（可选） |
