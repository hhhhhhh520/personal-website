/**
 * RRF (Reciprocal Rank Fusion) 融合算法
 *
 * RRF 是一种基于排名的融合算法，用于合并多个检索系统的结果。
 * 公式: score(d) = sum(1 / (k + rank(d)))
 *
 * 优势:
 * - 无需调参，k=60 为经验值
 * - 基于排名而非原始分数，避免分数归一化问题
 * - 对评分尺度不敏感，效果稳定
 *
 * @module rag/utils/rrfFusion
 */

import type { RankedResult, RRFResult, RRFConfig } from '../types/index';

/**
 * 默认 RRF 配置
 */
export const DEFAULT_RRF_CONFIG: RRFConfig = {
  k: 60,
};

/**
 * RRF (Reciprocal Rank Fusion) 结果融合
 *
 * 将多个检索系统的结果按排名位置融合，生成统一的排序结果。
 *
 * @param rankedLists 多个检索系统的排名结果列表
 * @param config RRF 配置参数
 * @returns 融合后的结果，按分数降序排列
 *
 * @example
 * ```typescript
 * const vectorResults = [{ docId: 'a', score: 0.9 }, { docId: 'b', score: 0.8 }];
 * const keywordResults = [{ docId: 'b', score: 5 }, { docId: 'c', score: 3 }];
 *
 * const fused = reciprocalRankFusion([vectorResults, keywordResults]);
 * // 结果: [{ docId: 'b', score: 0.032 }, { docId: 'a', score: 0.016 }, ...]
 * ```
 */
export function reciprocalRankFusion(
  rankedLists: RankedResult[][],
  config: RRFConfig = DEFAULT_RRF_CONFIG
): RRFResult[] {
  const { k } = config;
  const docScores: Map<string, number> = new Map();

  // 处理每个检索系统的结果
  for (const rankedList of rankedLists) {
    for (let rank = 0; rank < rankedList.length; rank++) {
      const { docId } = rankedList[rank];
      // RRF 公式: 1 / (k + rank + 1)，rank 从 0 开始所以 +1
      const score = 1.0 / (k + rank + 1);
      docScores.set(docId, (docScores.get(docId) || 0) + score);
    }
  }

  // 按分数降序排序
  return [...docScores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * 双路 RRF 融合（向量检索 + 关键词检索）
 *
 * 专门用于混合搜索场景，简化调用接口。
 *
 * @param vectorResults 向量检索结果（按 score 降序）
 * @param keywordResults 关键词检索结果（按 score 降序）
 * @param k RRF 参数，默认 60
 * @returns 融合后的结果
 */
export function rrfFusionTwoWay(
  vectorResults: RankedResult[],
  keywordResults: RankedResult[],
  k: number = 60
): RRFResult[] {
  return reciprocalRankFusion([vectorResults, keywordResults], { k });
}

/**
 * 计算 RRF 分数贡献
 *
 * 用于分析单个文档在不同检索系统中的贡献。
 *
 * @param rank 文档在某个检索结果中的排名位置（从 0 开始）
 * @param k RRF 参数
 * @returns 该排名位置的 RRF 分数贡献
 */
export function rrfScoreContribution(rank: number, k: number = 60): number {
  return 1.0 / (k + rank + 1);
}

/**
 * 获取文档在各检索系统中的排名信息
 *
 * @param docId 文档 ID
 * @param rankedLists 多个检索系统的排名结果列表
 * @returns 各检索系统中的排名位置（-1 表示未出现）
 */
export function getDocRanks(
  docId: string,
  rankedLists: RankedResult[][]
): number[] {
  return rankedLists.map((list) => {
    const index = list.findIndex((r) => r.docId === docId);
    return index === -1 ? -1 : index;
  });
}