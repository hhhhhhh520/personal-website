# 所有页面都是 'use client' — 无真正SSR
> 创建时间: 2026-06-25 | 状态: 🟡排查中

## 问题描述

`app/[locale]/` 下的所有页面组件都标记了 `"use client"`：
- `page.tsx` (首页)
- `about/page.tsx`
- `projects/page.tsx`
- `blog/page.tsx`

**影响**:
- 页面内容在客户端渲染，FCP/LCP 较慢
- 数据文件被打包到客户端 JS 中
- 无法使用 React Server Components 的优势

**注意**: Next.js 的 `'use client'` 组件仍然会在服务端预渲染 HTML，所以 SEO 影响没有想象的大。但无法使用流式 SSR 和 Suspense。

## 出现原因

**提交**: `bece13f` (国际化支持)

项目从一开始就采用了客户端渲染模式。可能的原因：
1. 使用了 framer-motion 动画，需要客户端
2. 使用了 `useState`、`useCallback` 等 hooks
3. 开发者熟悉客户端渲染，快速上手

这是项目架构的早期决策，不是最近改动造成的。

## 解决方案

**评估**: 改造成本较高，需要权衡收益。

**如果决定改造**:

1. 将页面拆分为 Server Component + Client Component：
```typescript
// app/[locale]/page.tsx — Server Component
import { personal } from '@/data/personal';
import { HomeClient } from './HomeClient';

export default function Home() {
  // 数据在服务端获取
  return <HomeClient personal={personal} />;
}

// app/[locale]/HomeClient.tsx — Client Component
'use client';
import { motion } from 'framer-motion';
// ... 交互逻辑
```

2. 首页的 LightRays 可以保持客户端（已经是动态导入候选）

3. About、Projects、Blog 列表页可以改为 Server Component，只在交互部分用 Client Component

**如果不改造**:
- 当前方案对个人网站来说是可以接受的
- 优先处理其他问题（测试、代码重复）

## 相关文件

- `app/[locale]/page.tsx`
- `app/[locale]/about/page.tsx`
- `app/[locale]/projects/page.tsx`
- `app/[locale]/blog/page.tsx`
- `app/[locale]/layout.tsx` (已经是 Server Component)

## 参考资料

- Next.js Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
