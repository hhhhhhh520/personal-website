# Personal Website

AI 应用开发者的沉浸式个人作品集网站，基于 Next.js 16 构建。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **WebGL 背景**: ogl（首页 Light Rays）
- **动画**: Framer Motion + GSAP
- **AI 对话**: 讯飞星辰 Astron API
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

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 ASTRON_API_KEY

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `ASTRON_API_KEY` | 是 | 讯飞星辰 Astron Coding Plan API Key |

AI 对话功能需要 API Key。未配置时页面仍可正常浏览，Nova 向导会显示配置提示。

## 数据源

所有数据集中在 `data/` 目录：

| 文件 | 用途 |
|------|------|
| `data/personal.ts` | 个人信息 (唯一数据源) |
| `data/projects.ts` | 项目数据 |
| `data/blogs.ts` | 博客元数据 |
| `content/blog/*.mdx` | 博客正文 (MDX) |
| `messages/zh.json` / `en.json` | 国际化翻译 |

## 文档

项目详细文档位于 `docs/` 目录：

| 文件 | 说明 |
|------|------|
| `docs/projects/*.md` | 6 个项目详细文档 |
| `docs/MAINTENANCE.md` | RAG 文档维护指南 |

## RAG 索引

Nova AI 使用 RAG 索引回答项目细节问题：

```bash
npm run rag:build    # 构建索引
npm run rag:force    # 强制重建
```

索引包含 310 个文档片段，覆盖项目、博客、个人简介。使用 RRF 融合算法进行混合搜索。

## 构建

```bash
npm run build
npm run start
```

## 测试

```bash
npm test              # 运行测试
npm run test:coverage # 测试覆盖率
```

## License

Private
