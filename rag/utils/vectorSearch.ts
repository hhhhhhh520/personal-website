/**
 * 向量检索模块
 *
 * 封装向量相似度计算和检索逻辑，
 * 用于混合搜索中的向量检索部分。
 *
 * @module rag/utils/vectorSearch
 */

import type { VectorSearchResult, VectorSearchConfig } from '../types/index';
import { cosineSimilarity } from './similarity';

/**
 * 默认向量检索配置
 */
export const DEFAULT_VECTOR_CONFIG: VectorSearchConfig = {
  maxResults: 20,
  minSimilarity: 0.0,
};

/**
 * 向量检索
 *
 * 使用预计算的文档 embedding 进行向量相似度检索。
 *
 * @param queryEmbedding 查询向量
 * @param docIds 文档 ID 列表
 * @param vectors 文档向量列表（与 docIds 对应）
 * @param config 配置参数
 * @returns 按相似度降序排列的检索结果
 *
 * @example
 * ```typescript
 * const results = vectorSearch(queryVec, docIds, vectors);
 * // 返回: [{ docId: 'doc_1', score: 0.85 }, ...]
 * ```
 */
export function vectorSearch(
  queryEmbedding: number[],
  docIds: string[],
  vectors: number[][],
  config: VectorSearchConfig = DEFAULT_VECTOR_CONFIG
): VectorSearchResult[] {
  const { maxResults, minSimilarity } = config;

  if (docIds.length !== vectors.length) {
    throw new Error('docIds and vectors must have the same length');
  }

  if (queryEmbedding.length === 0) {
    return [];
  }

  // 计算每个文档的相似度
  const results: VectorSearchResult[] = [];

  for (let i = 0; i < docIds.length; i++) {
    const docId = docIds[i];
    const vec = vectors[i];

    // 检查向量维度匹配
    if (vec.length !== queryEmbedding.length) {
      console.warn(`Vector dimension mismatch for doc ${docId}`);
      continue;
    }

    const similarity = cosineSimilarity(queryEmbedding, vec);

    if (similarity >= minSimilarity) {
      results.push({ docId, score: similarity });
    }
  }

  // 按相似度降序排序
  results.sort((a, b) => b.score - a.score);

  // 返回 top 结果
  return results.slice(0, maxResults);
}

/**
 * 向量检索结果转换为排名结果
 *
 * 用于 RRF 融合，将相似度结果转换为排名格式。
 *
 * @param results 向量检索结果
 * @returns 排名结果（已按相似度降序）
 */
export function toRankedResults(
  results: VectorSearchResult[]
): { docId: string; score: number }[] {
  return results.map((r) => ({ docId: r.docId, score: r.score }));
}

/**
 * 批量计算向量相似度
 *
 * 用于需要计算多个查询向量与文档集合相似度的场景。
 *
 * @param queryEmbeddings 查询向量列表
 * @param docIds 文档 ID 列表
 * @param vectors 文档向量列表
 * @returns 每个查询向量的检索结果列表
 */
export function batchVectorSearch(
  queryEmbeddings: number[][],
  docIds: string[],
  vectors: number[][],
  config: VectorSearchConfig = DEFAULT_VECTOR_CONFIG
): VectorSearchResult[][] {
  return queryEmbeddings.map((queryVec) =>
    vectorSearch(queryVec, docIds, vectors, config)
  );
}

/**
 * 计算平均向量
 *
 * 用于将多个向量合并为一个代表性向量。
 *
 * @param vectors 向量列表
 * @returns 平均向量
 */
export function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) {
    return [];
  }

  const dimension = vectors[0].length;
  const avgVec: number[] = new Array(dimension).fill(0);

  for (const vec of vectors) {
    if (vec.length !== dimension) {
      throw new Error('All vectors must have the same dimension');
    }
    for (let i = 0; i < dimension; i++) {
      avgVec[i] += vec[i];
    }
  }

  // 计算平均值
  for (let i = 0; i < dimension; i++) {
    avgVec[i] /= vectors.length;
  }

  return avgVec;
}