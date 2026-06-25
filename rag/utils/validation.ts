/**
 * API 验证模块
 *
 * 提供 RAG API 请求验证函数，
 * 用于验证查询和参数。
 *
 * @module rag/utils/validation
 */

/**
 * RAG 请求接口
 */
export interface RAGRequest {
  query: string;
  topK?: number;
}

/**
 * 验证结果类型
 */
export type ValidationResult =
  | { valid: true; data: RAGRequest }
  | { valid: false; error: string; status: number };

/**
 * 验证 RAG 请求
 *
 * @param body 请求体
 * @returns 验证结果
 */
export function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required', status: 400 };
  }

  const { query, topK } = body as RAGRequest;

  // 验证 query
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query is required and must be a string', status: 400 };
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return { valid: false, error: 'Query cannot be empty', status: 400 };
  }

  // 验证 topK
  if (topK !== undefined) {
    if (typeof topK !== 'number' || !Number.isInteger(topK)) {
      return { valid: false, error: 'topK must be an integer', status: 400 };
    }
    if (topK < 1) {
      return { valid: false, error: 'topK must be at least 1', status: 400 };
    }
    if (topK > 10) {
      return { valid: false, error: 'topK cannot exceed 10', status: 400 };
    }
  }

  return {
    valid: true,
    data: {
      query: trimmedQuery,
      topK: topK ? Math.max(1, Math.min(topK, 10)) : 3,
    },
  };
}

/**
 * RAG 响应接口
 */
export interface RAGResponse {
  results: Array<{
    content: string;
    score: number;
    source: string;
    sourceId: string;
    title: string;
  }>;
  query: string;
  duration: number;
}

/**
 * 创建 RAG 响应
 *
 * @param results 搜索结果
 * @param query 查询字符串
 * @param duration 耗时（毫秒）
 * @returns RAG 响应
 */
export function createResponse(
  results: RAGResponse['results'],
  query: string,
  duration: number
): RAGResponse {
  return {
    results,
    query,
    duration,
  };
}
