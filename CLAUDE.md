# Personal Website

AI 应用开发者的沉浸式个人作品集网站，基于 Next.js 16 构建。

## 项目规则

### 数据源
- `data/personal.ts` 是**唯一个人信息数据源**，全站引用
- 修改个人信息只需改 `personal.ts` + `messages/zh.json` / `messages/en.json`

### 环境变量
| 变量 | 必填 | 说明 |
|------|------|------|
| `ASTRON_API_KEY` | 是 | 讯飞星辰 Astron Coding Plan API Key |

### 禁止事项
- 不要在 `app/` 目录下硬编码个人信息，必须从 `data/personal.ts` 引用
- 不要使用 next-themes（与 React 19 不兼容），使用自定义 `ThemeProvider`
- 不要启用 `@react-three/postprocessing` 的 GlowEffect（Three.js 兼容问题）
- 不要在 PageTransition 中使用 AnimatePresence + key={pathname}，会导致 WebGL context 丢失

### Nova AI 流式输出
- `stores/novaStore.ts` 的 `updateLastMessage` 必须**追加**内容，不能替换

### WebGL 注意事项
- 首页使用 Light Rays (ogl) 作为背景
- 页面切换时 WebGL context 不会销毁（PageTransition 无 AnimatePresence）
- 如需修改页面过渡动画，注意不要破坏 WebGL context 生命周期

### 自定义鼠标光标
- 使用 TargetCursor 组件（GSAP 驱动）
- 可交互元素需添加 `cursor-target` 类
- 移动端自动禁用（检测触摸屏）

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **动画**: Framer Motion + GSAP
- **AI 对话**: 讯飞星辰 Astron API (OpenAI 兼容协议)
- **国际化**: next-intl (中/英)

## 页面结构

| 路由 | 说明 |
|------|------|
| `/[locale]` | 首页，Light Rays 背景 |
| `/[locale]/about` | 关于页 |
| `/[locale]/projects` | 项目展示 |
| `/[locale]/projects/[id]` | 项目详情 |
| `/[locale]/blog` | 博客列表 (MDX) |
| `/[locale]/blog/[slug]` | 博客详情 |
| `/api/chat` | AI 对话 API |
| `/api/rag` | RAG 检索 API |

## RAG 知识库

Nova 使用预构建的 RAG 索引回答基于项目/博客/文档内容的问题。

### 混合搜索算法
- **RRF 融合**：关键词检索 + 向量检索 + Reciprocal Rank Fusion
- **N-gram 分词**：中文 2-4 字片段，解决无分词器问题
- **安全**：所有正则表达式使用 `escapeRegExp` 转义

### 索引构建
```bash
npm run rag:build    # 智能构建（数据变化时才重建）
npm run rag:update   # 检查是否需要更新
npm run rag:force    # 强制重建
```

### 索引文件
- `public/rag-index/documents.json` - 文档片段（310 个）
- `public/rag-index/embeddings.json` - 1024 维向量
- `public/rag-index/metadata.json` - 元数据（含数据哈希）

### 数据来源
| 来源 | 数量 | 说明 |
|------|------|------|
| `data/projects.ts` | 6 | 项目概述 |
| `data/personal.ts` | 1 | 个人简介 |
| `content/blog/*.mdx` | 6 | 博客内容 |
| `docs/projects/*.md` | 54 | 项目详细文档 |

### Embedding 模型
- 模型：bge-large-zh-v1.5（中文优化）
- 路径：`D:/my project/xybst/校园百事通项目/campus_helper/models/embedding/BAAI_bge-large-zh-v1.5/`
- Python 环境：`rag/venv/`

### 深入文档
- [docs/MAINTENANCE.md](docs/MAINTENANCE.md) — RAG 文档维护指南
- [docs/projects/README.md](docs/projects/README.md) — 项目文档索引

## 快速开始

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 ASTRON_API_KEY
npm run dev
```

访问 http://localhost:3000

## 数据源

| 文件 | 用途 |
|------|------|
| `data/personal.ts` | 个人信息 (唯一数据源) |
| `data/projects.ts` | 项目数据 |
| `data/blogs.ts` | 博客元数据 |
| `content/blog/*.mdx` | 博客正文 (MDX) |
| `messages/zh.json` / `en.json` | 国际化翻译 |

## 构建

```bash
npm run build
npm run start
```

## 测试

```bash
npm test              # 运行 TypeScript 测试 (Vitest)
npm run test:ui       # 测试 UI 界面
npm run test:coverage # 测试覆盖率报告
```

测试目录：
- `rag/__tests__/` - TypeScript 测试（219 个测试）
- `rag/scripts/test_*.py` - Python 测试（60 个测试）
