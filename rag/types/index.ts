/**
 * RAG (Retrieval-Augmented Generation) 类型定义
 *
 * 本文件定义了 RAG 系统所需的所有 TypeScript 类型，
 * 包括文档、搜索结果、索引配置和元数据。
 *
 * @module rag/types
 */

/**
 * 数据来源类型
 *
 * - project: 项目相关文档（如项目介绍、技术栈说明）
 * - personal: 个人信息文档（如简历、自我介绍）
 * - blog: 博客文章内容
 */
export type DataSource = 'project' | 'personal' | 'blog';

/**
 * RAG 文档元数据
 *
 * 包含文档的来源信息和结构信息，用于搜索结果展示和过滤。
 */
export interface RAGDocumentMetadata {
  /** 数据来源类型 */
  source: DataSource;

  /** 来源 ID（如项目 ID、博客 slug） */
  sourceId: string;

  /** 文档标题 */
  title: string;

  /** 分块索引，标识该块在原文中的位置 */
  chunkIndex: number;

  /**
   * Markdown 标题路径
   * 表示该内容块在原文中的标题层级路径
   * @example "## 技术栈 > ### 前端"
   */
  headerPath?: string;
}

/**
 * RAG 文档类型
 *
 * 表示一个经过分块处理的文档片段，
 * 包含内容、唯一标识和元数据。
 */
export interface RAGDocument {
  /** 文档唯一标识（通常为内容的哈希值） */
  id: string;

  /** 文档内容（已分块的文本片段） */
  content: string;

  /** 文档元数据 */
  metadata: RAGDocumentMetadata;
}

/**
 * 搜索结果类型
 *
 * 表示一次向量搜索返回的匹配结果，
 * 包含匹配内容和相似度分数。
 */
export interface SearchResult {
  /** 匹配的文档内容 */
  content: string;

  /**
   * 相似度分数
   * 范围 0-1，值越高表示越相似
   */
  score: number;

  /** 数据来源类型 */
  source: string;

  /** 文档标题 */
  title: string;

  /** 来源 ID */
  sourceId: string;
}

/**
 * RAG 搜索结果类型（SearchResult 的别名）
 * @deprecated 使用 SearchResult 代替
 */
export type RAGSearchResult = SearchResult;

/**
 * RAG 文档块类型（RAGDocument 的别名）
 * @deprecated 使用 RAGDocument 代替
 */
export type RAGChunk = RAGDocument;

/**
 * 索引配置类型
 *
 * 定义 RAG 索引创建时的参数配置。
 */
export interface IndexConfig {
  /**
   * 分块大小（字符数）
   * 控制文档被切分成多大片段
   * @default 500
   */
  chunkSize: number;

  /**
   * 分块重叠字符数
   * 相邻块之间的重叠部分，保证上下文连续性
   * @default 50
   */
  chunkOverlap: number;

  /**
   * 向量嵌入维度
   * 与使用的嵌入模型相关
   * @default 1024 (适用于 text-embedding-3-small)
   */
  embeddingDimension: number;
}

/**
 * 索引元数据类型
 *
 * 记录索引的版本信息和统计信息，
 * 用于索引管理和增量更新检测。
 */
export interface IndexMetadata {
  /** 索引版本号（语义化版本） */
  version: string;

  /** 索引创建时间（ISO 8601 格式） */
  createdAt: string;

  /**
   * 数据哈希值
   * 用于检测源数据是否变化，触发增量更新
   */
  dataHash: string;

  /** 索引中的文档总数 */
  documentCount: number;

  /** 向量嵌入维度 */
  embeddingDimension: number;
}

/**
 * 默认索引配置
 */
export const DEFAULT_INDEX_CONFIG: IndexConfig = {
  chunkSize: 500,
  chunkOverlap: 50,
  embeddingDimension: 1024,
};

/**
 * 当前索引版本
 */
export const INDEX_VERSION = '1.0.0';

// ============================================================================
// RRF 融合相关类型
// ============================================================================

/**
 * 排名结果类型
 *
 * 用于表示单个检索系统返回的排名结果。
 */
export interface RankedResult {
  /** 文档 ID */
  docId: string;
  /** 原始评分（可以是相似度、BM25 分数等） */
  score: number;
}

/**
 * RRF 融合结果类型
 *
 * 表示经过 RRF 融合后的最终结果。
 */
export interface RRFResult {
  /** 文档 ID */
  docId: string;
  /** RRF 融合分数 */
  score: number;
}

/**
 * RRF 配置类型
 *
 * 控制 RRF 融合算法的行为。
 */
export interface RRFConfig {
  /**
   * RRF 参数 k
   * 控制排名位置对分数的影响程度
   * @default 60
   */
  k: number;
}

/**
 * 关键词检索结果类型
 */
export interface KeywordSearchResult {
  /** 文档 ID */
  docId: string;
  /** 关键词匹配评分 */
  score: number;
}

/**
 * 关键词检索配置类型
 */
export interface KeywordSearchConfig {
  /** 最小词长度 */
  minTermLength: number;
  /** 标题权重 */
  titleWeight: number;
  /** 内容权重 */
  contentWeight: number;
  /** 最大返回结果数 */
  maxResults: number;
}

/**
 * 向量检索结果类型
 */
export interface VectorSearchResult {
  /** 文档 ID */
  docId: string;
  /** 相似度分数 */
  score: number;
}

/**
 * 向量检索配置类型
 */
export interface VectorSearchConfig {
  /** 最大返回结果数 */
  maxResults: number;
  /** 最小相似度阈值 */
  minSimilarity: number;
}
