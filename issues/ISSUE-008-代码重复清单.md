# 代码重复清单
> 创建时间: 2026-06-25 | 状态: 🟡部分解决（2026-09-04：抽出 2 处，3 处评估后确认"并非真正重复"而保留）

## 问题描述

项目中存在多处代码重复：

| 重复项 | 位置 | 说明 |
|--------|------|------|
| 路径解析函数 | NovaGuide.tsx vs useNovaTriggers.ts | `getPageArea` 和 `getAreaFromPathname` 逻辑相似但不完全相同 |
| 动画 variants | projects/page.tsx, blog/page.tsx, about/page.tsx | `containerVariants` 和 `itemVariants` 定义完全相同 |
| Message 类型 | stores/novaStore.ts vs lib/ai.ts | 两处定义不同形状的 Message 接口 |
| 移动端检测 | useDeviceCapabilities.ts vs NovaGuide.tsx vs TargetCursor.tsx | 三处不同的检测逻辑 |
| CORS handler | chat/route.ts vs rag/route.ts | 完全相同的 OPTIONS 处理函数 |

## 出现原因

**原因**: 快速开发过程中，各组件独立实现相似功能，没有抽取公共模块。

**时间线**:
- NovaGuide 和 useNovaTriggers 在不同时间点开发，各自实现了路径解析
- 动画 variants 在各页面开发时复制粘贴
- Message 类型在 store 和 lib 中分别定义

## 解决方案

**步骤**:

1. **提取路径解析工具**:
```typescript
// lib/path-utils.ts
export function getPathArea(pathname: string): 'home' | 'projects' | 'blog' | 'about' | 'other' {
  // 统一实现
}
```

2. **提取动画 variants**:
```typescript
// lib/animations.ts
export const containerVariants = { /* ... */ };
export const itemVariants = { /* ... */ };
```

3. **统一 Message 类型**:
```typescript
// types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
```

4. **统一移动端检测**:
```typescript
// hooks/useDeviceCapabilities.ts 已有完整实现
// NovaGuide 和 TargetCursor 改为使用这个 hook
```

5. **提取 CORS 中间件**:
```typescript
// lib/cors.ts
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
```

## 相关文件

- `components/ai/NovaGuide.tsx`
- `hooks/useNovaTriggers.ts`
- `app/[locale]/projects/page.tsx`
- `app/[locale]/blog/page.tsx`
- `app/[locale]/about/page.tsx`
- `stores/novaStore.ts`
- `lib/ai.ts`
- `hooks/useDeviceCapabilities.ts`
- `components/effects/TargetCursor.tsx`
- `app/api/chat/route.ts`
- `app/api/rag/route.ts`

## 参考资料

- 无

## 解决记录（2026-09-04）

✅ **已抽取（确为重复）**：
- **CORS OPTIONS** → `lib/cors.ts` `corsPreflightResponse()`，`chat/route.ts` 与 `rag/route.ts` 共用。
- **Message 类型** → `types/chat.ts` 统一（原 novaStore 与 lib/ai 各一份、形状不一致），两处改为导入并 re-export，`stores/index.ts` 不受影响。

⚠️ **评估后保留（核实发现并非真正重复，盲目合并会改变行为）**：
- **动画 variants**：blog 用横向滑入（`x:-20`）+ `stagger 0.08/duration 0.4`，与 projects/about 的纵向（`y:20`/`0.1`/`0.5`）**不同**——清单"定义完全相同"的说法不成立，故按页保留。
- **路径解析**：`getPageArea` 不剥 locale、含 `/hall`；`getAreaFromPathname` 剥 `/zh|/en`、无 `/hall`。locale 语义不同，合并有行为风险，保留。
- **移动端检测**：`useDeviceCapabilities`、NovaGuide(+`innerWidth<768`)、TargetCursor(`ontouchstart`/`<=768`) 阈值各异，是各自有意为之的判定，强行统一会改变光标禁用/面板行为，保留。
