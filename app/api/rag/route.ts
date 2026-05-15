import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Types
// ============================================================================

import type {
  SearchResult,
  RRFConfig,
  KeywordSearchConfig,
  VectorSearchConfig,
} from '../../../rag/types/index';

interface RAGResponse {
  results: SearchResult[];
  query: string;
  duration: number;
}

interface Document {
  id: string;
  content: string;
  source: string;
  source_id: string;
  title: string;
  metadata: Record<string, unknown>;
  chunk_index: number;
  total_chunks: number;
  char_count: number;
  embedding_hash: string;
}

interface EmbeddingsData {
  dimension: number;
  count: number;
  doc_ids: string[];
  vectors: number[][];
}

interface RAGRequest {
  query: string;
  topK?: number;
}

// ============================================================================
// Cache
// ============================================================================

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query: string, topK: number): string {
  return `${query.toLowerCase().trim()}::${topK}`;
}

function getFromCache(key: string): SearchResult[] | null {
  const entry = queryCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    queryCache.delete(key);
    return null;
  }

  return entry.results;
}

function setCache(key: string, results: SearchResult[]): void {
  queryCache.set(key, {
    results,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Index Data (loaded once at module level)
// ============================================================================

let documents: Document[] | null = null;
let embeddings: EmbeddingsData | null = null;
let indexLoadError: string | null = null;

function loadIndex(): void {
  if (documents && embeddings) return;

  try {
    const indexPath = path.join(process.cwd(), 'public', 'rag-index');

    // Load documents
    const documentsPath = path.join(indexPath, 'documents.json');
    const documentsData = fs.readFileSync(documentsPath, 'utf-8');
    documents = JSON.parse(documentsData) as Document[];

    // Load embeddings
    const embeddingsPath = path.join(indexPath, 'embeddings.json');
    const embeddingsData = fs.readFileSync(embeddingsPath, 'utf-8');
    embeddings = JSON.parse(embeddingsData) as EmbeddingsData;

    console.log(`[RAG API] Index loaded: ${documents?.length} documents, ${embeddings?.count} embeddings`);
  } catch (error) {
    indexLoadError = error instanceof Error ? error.message : 'Unknown error loading index';
    console.error('[RAG API] Failed to load index:', indexLoadError);
  }
}

// Load index on module initialization
loadIndex();

// ============================================================================
// Vector Operations
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 * Pure JS implementation, no external dependencies
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

// ============================================================================
// RRF Fusion Algorithm
// ============================================================================

/**
 * RRF (Reciprocal Rank Fusion) 双路融合
 *
 * 公式: score(d) = 1/(k + rank_vector) + 1/(k + rank_keyword)
 *
 * @param vectorResults 向量检索结果（按 score 降序）
 * @param keywordResults 关键词检索结果（按 score 降序）
 * @param k RRF 参数，默认 60
 * @returns 融合后的结果，按分数降序排列
 */
function rrfFusion(
  vectorResults: Array<{ docId: string; score: number }>,
  keywordResults: Array<{ docId: string; score: number }>,
  k: number = 60
): Array<{ docId: string; score: number }> {
  const docScores: Map<string, number> = new Map();

  // 处理向量检索结果
  for (let rank = 0; rank < vectorResults.length; rank++) {
    const { docId } = vectorResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  // 处理关键词检索结果
  for (let rank = 0; rank < keywordResults.length; rank++) {
    const { docId } = keywordResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  // 按分数降序排序
  return [...docScores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

// ============================================================================
// Keyword Search
// ============================================================================

/**
 * Escape special regex characters to prevent injection
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 中文分词（N-gram 实现）
 *
 * 由于没有真正的中文分词器，使用 N-gram 方式提取关键词：
 * 1. 提取连续中文字符序列
 * 2. 对每个序列生成 2-4 字的 n-gram
 * 3. 提取英文单词
 */
function tokenizeChinese(text: string, minLength: number = 2): string[] {
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
 * 关键词检索
 */
function keywordSearch(
  query: string,
  docs: Document[],
  config: { titleWeight: number; contentWeight: number; maxResults: number } = {
    titleWeight: 3.0,
    contentWeight: 0.5,
    maxResults: 20,
  }
): Array<{ docId: string; score: number }> {
  const { titleWeight, contentWeight, maxResults } = config;
  const queryTerms = tokenizeChinese(query);

  if (queryTerms.length === 0) {
    return [];
  }

  const scores: Map<string, number> = new Map();

  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const content = doc.content.toLowerCase();
    let docScore = 0;

    for (const term of queryTerms) {
      // Escape term to prevent regex injection
      const escapedTerm = escapeRegExp(term);

      // 标题匹配
      if (title.includes(term)) {
        const titleMatches = (title.match(new RegExp(escapedTerm, 'g')) || []).length;
        docScore += titleMatches * titleWeight;
      }

      // 内容匹配
      const contentMatches = (content.match(new RegExp(escapedTerm, 'g')) || []).length;
      const saturatedScore = contentMatches / (1 + contentMatches * 0.1);
      docScore += saturatedScore * contentWeight;
    }

    if (docScore > 0) {
      scores.set(doc.id, docScore);
    }
  }

  return [...scores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// ============================================================================
// Vector Search
// ============================================================================

/**
 * 向量检索
 */
function vectorSearch(
  queryEmbedding: number[],
  docIds: string[],
  vectors: number[][],
  maxResults: number = 20
): Array<{ docId: string; score: number }> {
  const results: Array<{ docId: string; score: number }> = [];

  for (let i = 0; i < docIds.length; i++) {
    const docId = docIds[i];
    const vec = vectors[i];
    const similarity = cosineSimilarity(queryEmbedding, vec);
    results.push({ docId, score: similarity });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

// ============================================================================
// Query Embedding (Pseudo-query from keywords)
// ============================================================================

/**
 * 从关键词检索结果构造伪查询向量
 *
 * 使用 Top-K 关键词匹配文档的平均 embedding 作为查询向量。
 * 这是一种近似方法，在无实时 embedding 服务时使用。
 */
function computePseudoQueryEmbedding(
  keywordResults: Array<{ docId: string; score: number }>,
  docIds: string[],
  vectors: number[][],
  dimension: number,
  topK: number = 3
): number[] {
  const queryEmbedding: number[] = new Array(dimension).fill(0);

  const topDocs = keywordResults.slice(0, topK);
  if (topDocs.length === 0) {
    return queryEmbedding;
  }

  for (const { docId } of topDocs) {
    const idx = docIds.indexOf(docId);
    if (idx !== -1) {
      const vec = vectors[idx];
      for (let i = 0; i < vec.length; i++) {
        queryEmbedding[i] += vec[i];
      }
    }
  }

  // 平均
  for (let i = 0; i < queryEmbedding.length; i++) {
    queryEmbedding[i] /= topDocs.length;
  }

  return queryEmbedding;
}

// ============================================================================
// Hybrid Search (RRF)
// ============================================================================

/**
 * 混合搜索：关键词检索 + 向量检索 + RRF 融合
 *
 * 流程:
 * 1. 关键词检索 → 排序列表 A
 * 2. 从 Top-K 关键词结果构造伪查询向量
 * 3. 向量检索 → 排序列表 B
 * 4. RRF 融合 A + B → 最终结果
 */
function hybridSearch(query: string, topK: number): SearchResult[] {
  if (!documents || !embeddings) {
    return [];
  }

  // 1. 关键词检索
  const keywordResults = keywordSearch(query, documents, {
    titleWeight: 3.0,
    contentWeight: 0.5,
    maxResults: topK * 2,
  });

  // 2. 构造伪查询向量
  const queryEmbedding = computePseudoQueryEmbedding(
    keywordResults,
    embeddings.doc_ids,
    embeddings.vectors,
    embeddings.dimension,
    3
  );

  // 3. 向量检索
  const vectorResults = vectorSearch(
    queryEmbedding,
    embeddings.doc_ids,
    embeddings.vectors,
    topK * 2
  );

  // 4. RRF 融合
  const fusedResults = rrfFusion(vectorResults, keywordResults, 60);

  // 5. 构建最终结果
  const results: SearchResult[] = [];
  for (const { docId, score } of fusedResults.slice(0, topK)) {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      results.push({
        content: doc.content,
        score: Math.round(score * 1000) / 1000,
        source: doc.source,
        sourceId: doc.source_id,
        title: doc.title,
      });
    }
  }

  return results;
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<RAGResponse | { error: string }>> {
  const startTime = Date.now();

  try {
    // Check if index is loaded
    if (indexLoadError) {
      return NextResponse.json(
        { error: `Index not available: ${indexLoadError}` },
        { status: 503 }
      );
    }

    if (!documents || !embeddings) {
      return NextResponse.json(
        { error: 'Index not loaded' },
        { status: 503 }
      );
    }

    // Parse request
    const body: RAGRequest = await req.json();
    const { query, topK = 3 } = body;

    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Validate topK
    const validTopK = Math.max(1, Math.min(topK, 10));

    // Check cache
    const cacheKey = getCacheKey(trimmedQuery, validTopK);
    const cachedResults = getFromCache(cacheKey);

    if (cachedResults) {
      const duration = Date.now() - startTime;
      return NextResponse.json({
        results: cachedResults,
        query: trimmedQuery,
        duration,
      });
    }

    // Perform search
    const results = hybridSearch(trimmedQuery, validTopK);

    // Cache results
    setCache(cacheKey, results);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      results,
      query: trimmedQuery,
      duration,
    });
  } catch (error) {
    console.error('[RAG API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
