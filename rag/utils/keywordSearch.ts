/**
 * 关键词检索模块
 *
 * 实现 BM25 风格的中文关键词评分算法，
 * 用于混合搜索中的关键词检索部分。
 *
 * @module rag/utils/keywordSearch
 */

import type { KeywordSearchResult, KeywordSearchConfig } from '../types/index';

/**
 * 默认关键词检索配置
 */
export const DEFAULT_KEYWORD_CONFIG: KeywordSearchConfig = {
  minTermLength: 2,
  titleWeight: 3.0,
  contentWeight: 0.5,
  maxResults: 20,
};

/**
 * Escape special regex characters to prevent injection
 *
 * @param string Input string that may contain regex special characters
 * @returns Escaped string safe for use in RegExp
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 中文分词（N-gram 实现）
 *
 * 由于没有真正的中文分词器，使用 N-gram 方式提取关键词：
 * 1. 提取连续中文字符序列
 * 2. 对每个序列生成 2-4 字的 n-gram
 * 3. 提取英文单词
 *
 * @param text 输入文本
 * @param minLength 最小词长度
 * @returns 提取的关键词列表
 */
export function tokenizeChinese(text: string, minLength: number = 2): string[] {
  const normalizedText = text.toLowerCase();

  // 提取连续中文字符序列
  const chinesePattern = /[一-龥]+/g;
  const chineseSequences = normalizedText.match(chinesePattern) || [];

  const terms: string[] = [];

  // 对每个中文序列生成 n-gram
  for (const seq of chineseSequences) {
    if (seq.length <= 4) {
      // 短序列直接作为词
      if (seq.length >= minLength) {
        terms.push(seq);
      }
    } else {
      // 长序列生成 2-4 字 n-gram
      for (let n = 2; n <= 4; n++) {
        for (let i = 0; i <= seq.length - n; i++) {
          terms.push(seq.slice(i, i + n));
        }
      }
    }
  }

  // 提取英文单词
  const englishPattern = /[a-z0-9]+/g;
  const englishMatches = normalizedText.match(englishPattern) || [];
  terms.push(...englishMatches.filter((t) => t.length >= minLength));

  // 去重
  return [...new Set(terms)];
}

/**
 * 计算单个关键词的 BM25 风格评分
 *
 * 简化版 BM25，考虑词频和文档长度。
 *
 * @param term 关键词
 * @param content 文档内容
 * @param title 文档标题
 * @param config 配置参数
 * @returns 关键词评分
 */
export function computeTermScore(
  term: string,
  content: string,
  title: string,
  config: KeywordSearchConfig = DEFAULT_KEYWORD_CONFIG
): number {
  const { titleWeight, contentWeight } = config;

  const normalizedContent = content.toLowerCase();
  const normalizedTitle = title.toLowerCase();

  // Escape term to prevent regex injection
  const escapedTerm = escapeRegExp(term);

  let score = 0;

  // 标题匹配（权重更高）
  if (normalizedTitle.includes(term)) {
    // 标题中出现的次数
    const titleMatches = (normalizedTitle.match(new RegExp(escapedTerm, 'g')) || [])
      .length;
    score += titleMatches * titleWeight;
  }

  // 内容匹配
  const contentMatches = (normalizedContent.match(new RegExp(escapedTerm, 'g')) || [])
    .length;
  // 使用 BM25 风格的饱和函数，避免长文档过度加权
  const saturatedContentScore = contentMatches / (1 + contentMatches * 0.1);
  score += saturatedContentScore * contentWeight;

  return score;
}

/**
 * 关键词检索
 *
 * 对文档集合进行关键词匹配检索，返回按评分排序的结果。
 *
 * @param query 查询文本
 * @param documents 文档集合
 * @param config 配置参数
 * @returns 按评分降序排列的检索结果
 *
 * @example
 * ```typescript
 * const results = keywordSearch('教育背景', documents);
 * // 返回: [{ docId: 'personal_1', score: 15.5 }, ...]
 * ```
 */
export function keywordSearch<T extends { id: string; content: string; title?: string }>(
  query: string,
  documents: T[],
  config: KeywordSearchConfig = DEFAULT_KEYWORD_CONFIG
): KeywordSearchResult[] {
  const { minTermLength, maxResults } = config;

  // 提取查询关键词
  const queryTerms = tokenizeChinese(query, minTermLength);

  if (queryTerms.length === 0) {
    return [];
  }

  // 计算每个文档的关键词评分
  const scores: Map<string, number> = new Map();

  for (const doc of documents) {
    const title = doc.title || '';
    let docScore = 0;

    for (const term of queryTerms) {
      docScore += computeTermScore(term, doc.content, title, config);
    }

    if (docScore > 0) {
      scores.set(doc.id, docScore);
    }
  }

  // 按评分降序排序
  const sortedResults = [...scores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);

  // 返回 top 结果
  return sortedResults.slice(0, maxResults);
}

/**
 * 关键词检索结果转换为排名结果
 *
 * 用于 RRF 融合，将评分结果转换为排名格式。
 *
 * @param results 关键词检索结果
 * @returns 排名结果（已按评分降序）
 */
export function toRankedResults(
  results: KeywordSearchResult[]
): { docId: string; score: number }[] {
  return results.map((r) => ({ docId: r.docId, score: r.score }));
}