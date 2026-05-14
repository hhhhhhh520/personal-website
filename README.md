# Personal Website

AI 应用开发者的沉浸式个人作品集网站，基于 Next.js 16 构建。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **3D**: Three.js + React Three Fiber（项目/技能页）
- **WebGL 背景**: ogl（首页 Light Rays）
- **动画**: Framer Motion
- **AI 对话**: 讯飞星辰 Astron API
- **国际化**: next-intl (中/英)

## 页面结构

| 路由 | 说明 |
|------|------|
| `/[locale]` | 首页，3D 核心大厅 |
| `/[locale]/about` | 关于页 |
| `/[locale]/projects` | 项目展示 (3D + 列表双视图) |
| `/[locale]/projects/[id]` | 项目详情 |
| `/[locale]/blog` | 博客列表 (MDX) |
| `/[locale]/blog/[slug]` | 博客详情 |
| `/[locale]/skills` | 技能矩阵 |
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
| `data/skills.ts` | 技能数据 |
| `content/blog/*.mdx` | 博客正文 (MDX) |
| `messages/zh.json` / `en.json` | 国际化翻译 |

## 构建

```bash
npm run build
npm run start
```

## License

Private
