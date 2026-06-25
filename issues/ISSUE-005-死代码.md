# 死代码清理
> 创建时间: 2026-06-25 | 状态: 🔴未解决

## 问题描述

项目中存在多处未使用的代码：

| 文件/组件 | 说明 |
|-----------|------|
| `stores/sceneStore.ts` | 定义了 `currentArea`、`isTransitioning`，但无组件使用 |
| `hooks/usePreload.ts` | 633行的资源预加载系统，无页面使用 |
| `components/ui/OptimizedImage.tsx` | 完整的图片优化组件，但所有页面直接用 `next/image` |
| `components/effects/ProjectTransitionProvider` | 空壳组件，只渲染 children |
| `components/examples/` | 示例目录 |

## 出现原因

**时间线**:
- `ce13348` — 删除技能页和3D视图，`sceneStore` 变成死代码
- `usePreload` 和 `OptimizedImage` 可能是预留功能，从未集成

这是功能迭代过程中的遗留物，删除功能时没有清理相关依赖。

## 解决方案

**步骤**:

1. 删除 `stores/sceneStore.ts`：
```bash
rm stores/sceneStore.ts
# 更新 stores/index.ts，移除导出
```

2. 删除 `hooks/usePreload.ts`：
```bash
rm hooks/usePreload.ts
# 更新 hooks/index.ts，移除导出
```

3. 评估 `OptimizedImage`：
   - 如果计划使用：在页面中替换 `next/image` 为 `OptimizedImage`
   - 如果不使用：删除组件

4. 删除 `ProjectTransitionProvider`：
```typescript
// components/effects/ProjectTransition.tsx
// 删除 lines 106-117 的 ProjectTransitionProvider
// 删除 components/effects/index.ts 中的导出
```

5. 评估 `components/examples/` 目录

**验证**: 删除后运行 `npm run build`，确认无编译错误。

## 相关文件

- `stores/sceneStore.ts`
- `stores/index.ts`
- `hooks/usePreload.ts`
- `hooks/index.ts`
- `components/ui/OptimizedImage.tsx`
- `components/effects/ProjectTransition.tsx`
- `components/effects/index.ts`

## 参考资料

- 提交 `ce13348` 删除了3D视图功能
