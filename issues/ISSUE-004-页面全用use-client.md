# 所有页面都是 'use client' — 无真正SSR
> 创建时间: 2026-06-25 | 状态: ⚪已评估·保留现状（2026-09-04，决策记录见下）

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

## 决策记录（2026-09-04）：**保留现状，不改造**

按本文件「如果不改造」一节的评估结论执行：
- 项目为个人作品集，页面已由 `generateStaticParams` 静态生成（SSG），`'use client'` 仍会预渲染 HTML，SEO/首屏影响有限；
- 改为 Server/Client 拆分成本高（每页拆双组件 + 数据下传），收益与风险不成正比；
- 本轮已通过 ISSUE-003（重型组件懒加载）与 ISSUE-007（LightRays 帧率/动画优化）覆盖了真实的加载/性能痛点。

**结论**：维持全客户端渲染，不再投入改造。若未来页面数量/交互复杂度显著上升，再重新评估。
