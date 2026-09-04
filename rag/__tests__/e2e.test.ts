import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadIndex, resetIndex, hybridSearch } from '../utils/ragIndex';

/**
 * End-to-end tests of the REAL retrieval pipeline (loadIndex → keyword +
 * pseudo-query vector + RRF fusion in rag/utils/ragIndex.ts).
 * Formerly a self-contained stub with a fabricated RAGPipeline class (ISSUE-001).
 */

function makePipelineFixture(dir: string): void {
  const documents = [
    {
      id: 'agenthub-doc', content: 'AgentHub 多 Agent 协作平台使用 Orchestrator 编排任务', source: 'project',
      source_id: 'agenthub', title: 'AgentHub', metadata: {}, chunk_index: 0,
      total_chunks: 1, char_count: 30, embedding_hash: 'cccc3333',
    },
    {
      id: 'phone-doc', content: '手机选购助手提供多轮对话推荐', source: 'project',
      source_id: 'phone', title: '手机选购助手', metadata: {}, chunk_index: 0,
      total_chunks: 1, char_count: 14, embedding_hash: 'dddd4444',
    },
  ];
  const embeddings = {
    dimension: 2,
    count: 2,
    doc_ids: ['agenthub-doc', 'phone-doc'],
    vectors: [[1, 0], [0, 1]],
  };
  fs.writeFileSync(path.join(dir, 'documents.json'), JSON.stringify(documents), 'utf-8');
  fs.writeFileSync(path.join(dir, 'embeddings.json'), JSON.stringify(embeddings), 'utf-8');
}

describe('RAG End-to-End (real pipeline)', () => {
  let dir: string;

  beforeEach(() => {
    resetIndex();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-e2e-fix-'));
    makePipelineFixture(dir);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    resetIndex();
  });

  it('full pipeline returns the relevant document first', () => {
    expect(loadIndex(dir)).toBe(true);
    const results = hybridSearch('AgentHub 多 Agent 协作', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].sourceId).toBe('agenthub');
  });

  it('topK limits the number of results', () => {
    loadIndex(dir);
    const results = hybridSearch('AgentHub', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('unrelated query still returns well-shaped results', () => {
    loadIndex(dir);
    const results = hybridSearch('完全不相关的查询词组', 2);
    for (const r of results) {
      expect(r).toHaveProperty('content');
      expect(r).toHaveProperty('sourceId');
    }
  });

  it('repeated queries are deterministic', () => {
    loadIndex(dir);
    const a = hybridSearch('AgentHub', 2);
    const b = hybridSearch('AgentHub', 2);
    expect(a).toEqual(b);
  });
});
