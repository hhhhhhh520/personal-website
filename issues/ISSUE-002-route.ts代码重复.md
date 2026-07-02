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

**已完成**（2026-06-25 第一轮 + 2026-06-26 第二轮）：

第一轮（2026-06-25）：
1. 提取核心算法到 `rag/utils/` 模块（similarity, rrfFusion, keywordSearch, vectorSearch）
2. 新建 `rag/utils/security.ts`, `validation.ts`, `cache.ts` 模块
3. route.ts 添加从 rag/utils 的导入，删除内联算法函数（~200 行）

第二轮（2026-06-26）— 补完集成：
4. route.ts 内联 cache 替换为 `QueryCache`（from `rag/utils/cache.ts`）
5. route.ts 内联验证替换为 `validateRequest()`（from `rag/utils/validation.ts`）
6. 删除 stale imports（cosineSimilarity, tokenizeChinese, escapeRegExp）
7. JSON 解析错误独立 try/catch 返回 400（而非 500）
8. 错误处理不再泄露 `error.message`

最终导入：
```typescript
import { rrfFusionTwoWay } from '../../../rag/utils/rrfFusion';
import { keywordSearch } from '../../../rag/utils/keywordSearch';
import { vectorSearch as vectorSearchUtil, averageVectors } from '../../../rag/utils/vectorSearch';
import { validateRequest } from '../../../rag/utils/validation';
import { QueryCache } from '../../../rag/utils/cache';
```

243 个测试全部通过。

## 相关文件

- `app/api/rag/route.ts` — 已修改
- `rag/utils/keywordSearch.ts` — 关键词搜索实现
- `rag/utils/similarity.ts` — 余弦相似度实现
- `rag/utils/rrfFusion.ts` — RRF融合实现
- `rag/utils/vectorSearch.ts` — 向量搜索实现
- `rag/utils/validation.ts` — API 请求验证
- `rag/utils/cache.ts` — 查询结果缓存
- `rag/utils/security.ts` — 安全验证（已实现，暂未集成到 route）

## 参考资料

- 与 ISSUE-001 同源，都是 AI 生成代码时的自包含模式导致
- security.ts 的 sanitizeQuery/checkSqlInjection/checkXss 已实现但暂未集成，因该 API 为只读搜索，无数据库写入，实际攻击面有限
