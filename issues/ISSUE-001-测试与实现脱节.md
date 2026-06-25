# 测试与实现脱节 — 13/14个测试文件是假的
> 创建时间: 2026-06-25 | 状态: 🟡修复中

## 问题描述

`rag/__tests__/` 目录下14个测试文件中，有13个在文件内部重新定义了被测函数，而不是从 `rag/utils/` 导入实际实现。只有 `similarity.test.ts` 正确导入了实际代码。

**受影响的测试文件**:
- `keyword.test.ts` — 自定义 `computeQueryRelevance`
- `vector.test.ts` — 自定义 `cosineSimilarity`
- `rrf.test.ts` — 自定义 `rrfFusion`
- `cache.test.ts` — 自定义 `QueryCache` 类
- `security.test.ts` — 自定义 `sanitizeQuery`、`checkSqlInjection`
- `api.test.ts` — 自定义 `validateRequest`
- `hybrid.test.ts` — 自定义所有搜索函数
- `personal-retrieval.test.ts` — 自定义 `rrfFusion` 和 `legacyFusion`
- `e2e.test.ts` — 自定义 `RAGPipeline`
- `performance.test.ts` — 自定义 `cosineSimilarity`

**后果**: 测试通过只能证明复制的代码副本是正确的，而非实际生产代码。如果 `rag/utils/` 或 `app/api/rag/route.ts` 出现 bug，测试不会发现。

## 出现原因

**提交**: `cf306b8` (2026-05-15)
**作者**: Claude Opus 4.7 自动生成

在一次提交中同时生成了：
- RAG 核心实现 (`rag/utils/`)
- API 路由 (`app/api/rag/route.ts`)
- 14个测试文件 (279个测试用例)

AI 生成测试时采用了"自包含"模式——每个测试文件内部实现所有需要的函数，而不是导入外部模块。这导致测试与实际实现完全脱节。

## 解决方案

**目标**: 所有测试改为导入实际实现

**步骤**:

1. ✅ 修改 `keyword.test.ts` — 导入 `keywordSearch`, `tokenizeChinese`, `computeTermScore`, `escapeRegExp`
2. ✅ 修改 `vector.test.ts` — 导入 `cosineSimilarity`
3. ✅ 修改 `rrf.test.ts` — 导入 `rrfFusionTwoWay`, `reciprocalRankFusion`
4. ✅ 修改 `hybrid.test.ts` — 导入 `rrfFusionTwoWay`, `cosineSimilarity`, `keywordSearch`, `vectorSearch`
5. ⏳ 待修复: `cache.test.ts`, `security.test.ts`, `api.test.ts`, `personal-retrieval.test.ts`, `e2e.test.ts`, `performance.test.ts`

**已修复测试**: 4个文件，68个测试用例全部通过
**待修复测试**: 6个文件（这些文件测试的是API路由逻辑或辅助功能，rag/utils中无对应实现）

## 相关文件

- `rag/__tests__/*.test.ts` — 所有测试文件
- `rag/utils/keywordSearch.ts` — 关键词搜索实现
- `rag/utils/similarity.ts` — 余弦相似度实现
- `rag/utils/rrfFusion.ts` — RRF融合实现
- `rag/utils/vectorSearch.ts` — 向量搜索实现
- `app/api/rag/route.ts` — RAG API路由（也有重复代码）

## 参考资料

- 提交 `cf306b8` 的 git log 显示这是 AI 一次性生成的代码
