import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Types & Imports from rag/utils
// ============================================================================

import type {
  SearchResult,
} from '../../../rag/types/index';

import { rrfFusionTwoWay } from '../../../rag/utils/rrfFusion';
import { keywordSearch } from '../../../rag/utils/keywordSearch';
import { vectorSearch as vectorSearchUtil, averageVectors } from '../../../rag/utils/vectorSearch';
import { validateRequest } from '../../../rag/utils/validation';
import { QueryCache } from '../../../rag/utils/cache';

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


// ============================================================================
// Cache (uses QueryCache from rag/utils/cache)
// ============================================================================

const queryCache = new QueryCache();

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
// Helper: Compute pseudo-query embedding from keyword results
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
  topK: number = 3
): number[] {
  const topDocs = keywordResults.slice(0, topK);
  if (topDocs.length === 0 || vectors.length === 0) {
    return [];
  }

  // 收集 top 文档的向量
  const topVectors: number[][] = [];
  for (const { docId } of topDocs) {
    const idx = docIds.indexOf(docId);
    if (idx !== -1) {
      topVectors.push(vectors[idx]);
    }
  }

  if (topVectors.length === 0) {
    return [];
  }

  // 使用 averageVectors 计算平均向量
  return averageVectors(topVectors);
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
    minTermLength: 2,
    titleWeight: 3.0,
    contentWeight: 0.5,
    maxResults: topK * 2,
  });

  // 2. 构造伪查询向量
  const queryEmbedding = computePseudoQueryEmbedding(
    keywordResults,
    embeddings.doc_ids,
    embeddings.vectors,
    3
  );

  // 3. 向量检索
  const vectorResults = vectorSearchUtil(
    queryEmbedding,
    embeddings.doc_ids,
    embeddings.vectors,
    { maxResults: topK * 2, minSimilarity: 0.0 }
  );

  // 4. RRF 融合
  const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults, 60);

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

    // Parse and validate request
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const { query, topK } = validation.data;

    // Check cache
    const cacheKey = queryCache.getCacheKey(query, topK);
    const cachedResults = queryCache.get(cacheKey);

    if (cachedResults) {
      const duration = Date.now() - startTime;
      return NextResponse.json({
        results: cachedResults,
        query,
        duration,
      });
    }

    // Perform search
    const results = hybridSearch(query, topK);

    // Cache results
    queryCache.set(cacheKey, results);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      results,
      query,
      duration,
    });
  } catch (error) {
    console.error('[RAG API] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
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
