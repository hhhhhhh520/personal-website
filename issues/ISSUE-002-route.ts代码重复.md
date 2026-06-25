# route.ts 与 rag/utils/ 代码完全重复
> 创建时间: 2026-06-25 | 状态: 🟢已解决

## 问题描述

`app/api/rag/route.ts` 中完整复制了 `rag/utils/` 目录下的以下函数：
- `cosineSimilarity` (route.ts:125)
- `rrfFusion` (route.ts:163)
- `tokenizeChinese` (route.ts:209)
- `keywordSearch` (route.ts:247)
- `escapeRegExp` (route.ts:197)
- `computePseudoQueryEmbedding` 等

两套代码完全独立，没有从 `rag/utils/` 导入任何内容。

**后果**:
- 维护噩梦：修改一处需要同步修改另一处
- 容易产生分歧：两套代码可能随时间变得不一致
- 增加认知负担：开发者需要理解存在两套实现

## 出现原因

**提交**: `cf306b8` (2026-05-15)
**作者**: Claude Opus 4.7 自动生成

AI 在生成 `app/api/rag/route.ts` 时，采用了"自包含"模式——将所有需要的函数都复制到同一个文件中，而不是从已存在的 `rag/utils/` 模块导入。

这与 ISSUE-001（测试脱节）是同一个问题的不同表现：AI 生成代码时偏好自包含，而不是模块化导入。

## 解决方案

**目标**: `app/api/rag/route.ts` 改为从 `rag/utils/` 导入所有函数

**步骤**:

1. 在 `app/api/rag/route.ts` 顶部添加导入：
```typescript
import { cosineSimilarity } from '@/rag/utils/similarity';
import { rrfFusion } from '@/rag/utils/rrfFusion';
import { tokenizeChinese, keywordSearch, escapeRegExp } from '@/rag/utils/keywordSearch';
import { vectorSearch, computePseudoQueryEmbedding } from '@/rag/utils/vectorSearch';
```

2. 删除 `app/api/rag/route.ts` 中重复的函数定义（约200-300行代码）

3. 确认路径别名 `@/rag` 是否在 `tsconfig.json` 中配置正确

4. 运行测试验证功能不变

**注意**: 需要检查 `rag/utils/` 中的函数签名是否与 route.ts 中使用的完全一致，可能需要调整。

## 相关文件

- `app/api/rag/route.ts` — 需要修改的文件
- `rag/utils/keywordSearch.ts` — 关键词搜索实现
- `rag/utils/similarity.ts` — 余弦相似度实现
- `rag/utils/rrfFusion.ts` — RRF融合实现
- `rag/utils/vectorSearch.ts` — 向量搜索实现
- `tsconfig.json` — 路径别名配置

## 参考资料

- 与 ISSUE-001 同源，都是 AI 生成代码时的自包含模式导致
