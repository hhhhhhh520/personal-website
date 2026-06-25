# 无代码分割 — 首屏加载巨大JS包
> 创建时间: 2026-06-25 | 状态: 🔴未解决

## 问题描述

整个项目只有一处动态导入（`i18n/request.ts`），所有组件都是同步导入。以下重量级库在首屏就会加载：

| 库 | 预估大小 (minified) |
|---|---|
| three | ~600KB |
| @react-three/fiber + drei + postprocessing | ~200KB+ |
| ogl | ~50KB |
| gsap | ~70KB |
| framer-motion | ~150KB |
| openai | ~100KB (服务端) |
| **合计** | **~1MB+** |

**后果**:
- 首屏加载时间长
- 移动端流量消耗大
- Lighthouse 性能评分低

## 出现原因

**时间线**:
- `bece13f` — 国际化支持，引入 framer-motion
- `bb5db39` — LightRays 背景，引入 ogl
- `cf306b8` — RAG 混合搜索，引入 openai

每次添加新功能时，都是直接 import，没有考虑代码分割。这是快速开发阶段的常见问题。

## 解决方案

**目标**: 使用 `next/dynamic` 懒加载重型组件

**步骤**:

1. 首页 LightRays 懒加载：
```typescript
// app/[locale]/page.tsx
import dynamic from 'next/dynamic';

const LightRays = dynamic(() => import('@/components/effects/LightRays'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e]" />
});
```

2. NovaGuide 懒加载：
```typescript
// app/[locale]/layout.tsx
const NovaGuide = dynamic(() => import('@/components/ai/NovaGuide').then(m => m.NovaGuide), {
  ssr: false
});
```

3. TargetCursor 懒加载：
```typescript
const TargetCursor = dynamic(() => import('@/components/effects/TargetCursor'), {
  ssr: false
});
```

4. ParticleBg、GlowEffect 等3D组件懒加载

5. 考虑将 ogl 迁移到 three，减少一个 WebGL 库

**验证**: 运行 `npm run build` 后检查 `.next/static/chunks/` 目录，确认代码是否被正确分割。

## 相关文件

- `app/[locale]/page.tsx` — 首页，使用 LightRays
- `app/[locale]/layout.tsx` — 布局，使用 NovaGuide
- `components/effects/LightRays.tsx` — 使用 ogl
- `components/effects/ParticleBg.tsx` — 使用 three
- `components/effects/TargetCursor.tsx` — 使用 gsap
- `components/ai/NovaGuide.tsx` — 聊天组件

## 参考资料

- Next.js Dynamic Imports: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
