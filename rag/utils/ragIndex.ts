/**
 * RAG 索引访问与混合检索
 *
 * 供 `/api/rag` 与 `/api/chat` 直接调用的公共检索层。
 * 此前 `/api/chat` 通过内部 HTTP 回环自打 `/api/rag`，在 serverless 上
 * 会多一次网络往返并占用函数并发；现统一改为本模块的进程内直接调用。
 *
 * @module rag/utils/ragIndex
 */

import fs from 'fs';
import path from 'path';

import type { SearchResult } from '../types/index';
import { rrfFusionTwoWay } from './rrfFusion';
import { keywordSearch } from './keywordSearch';
import { vectorSearch as vectorSearchUtil, averageVectors } from './vectorSearch';

export interface RagDocument {
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

export interface RagEmbeddings {
  dimension: number;
  count: number;
  doc_ids: string[];
  vectors: number[][];
}

let documents: RagDocument[] | null = null;
let embeddings: RagEmbeddings | null = null;
let indexLoadError: string | null = null;

/**
 * 加载索引（惰性、仅一次）。失败时记录原因并返回 false。
 */
export function loadIndex(): boolean {
  if (documents && embeddings) return true;
  if (indexLoadError) return false;

  try {
    const indexPath = path.join(process.cwd(), 'public', 'rag-index');
    const documentsData = fs.readFileSync(path.join(indexPath, 'documents.json'), 'utf-8');
    documents = JSON.parse(documentsData) as RagDocument[];
    const embeddingsData = fs.readFileSync(path.join(indexPath, 'embeddings.json'), 'utf-8');
    embeddings = JSON.parse(embeddingsData) as RagEmbeddings;
    console.log(`[RAG] Index loaded: ${documents.length} documents, ${embeddings.count} embeddings`);
    return true;
  } catch (error) {
    indexLoadError = error instanceof Error ? error.message : 'Unknown error loading index';
    console.error('[RAG] Failed to load index:', indexLoadError);
    return false;
  }
}

/** 索引是否可用（已加载且无加载错误） */
export function isIndexReady(): boolean {
  return loadIndex() && documents !== null && embeddings !== null;
}

/** 索引加载错误信息（供 API 返回 503 诊断） */
export function getIndexLoadError(): string | null {
  return indexLoadError;
}

/**
 * 从关键词检索结果构造伪查询向量（Top-K 命中文档的平均 embedding）。
 * 无实时 embedding 服务时的近似方法。
 */
function computePseudoQueryEmbedding(
  keywordResults: Array<{ docId: string; score: number }>,
  docIds: string[],
  vectors: number[][],
  topK: number = 3
): number[] {
  const topVectors: number[][] = [];
  for (const { docId } of keywordResults.slice(0, topK)) {
    const idx = docIds.indexOf(docId);
    if (idx !== -1) topVectors.push(vectors[idx]);
  }
  return topVectors.length > 0 ? averageVectors(topVectors) : [];
}

/**
 * 混合搜索：关键词检索 + 伪查询向量 + 向量检索 + RRF 融合。
 * 调用前请确保 isIndexReady() 为 true，否则返回空。
 */
export function hybridSearch(query: string, topK: number): SearchResult[] {
  if (!documents || !embeddings) return [];

  const keywordResults = keywordSearch(query, documents, {
    minTermLength: 2,
    titleWeight: 3.0,
    contentWeight: 0.5,
    maxResults: topK * 2,
  });

  const queryEmbedding = computePseudoQueryEmbedding(
    keywordResults,
    embeddings.doc_ids,
    embeddings.vectors,
    3
  );

  const vectorResults = vectorSearchUtil(
    queryEmbedding,
    embeddings.doc_ids,
    embeddings.vectors,
    { maxResults: topK * 2, minSimilarity: 0.0 }
  );

  const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults, 60);

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
