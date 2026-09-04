import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadIndex, resetIndex, isIndexReady, hybridSearch } from '../utils/ragIndex';

/**
 * Index loading tests against the REAL loadIndex / resetIndex / isIndexReady
 * from rag/utils/ragIndex.ts, using a temp-directory fixture.
 * Formerly a self-contained stub with a fabricated MockEmbeddingGenerator/IndexBuilder (ISSUE-001).
 */

function makeFixture(dir: string): void {
  const documents = [
    {
      id: 'd1', content: 'React 是一个用于构建用户界面的 JavaScript 库', source: 'project',
      source_id: 'react', title: 'React 教程', metadata: {}, chunk_index: 0,
      total_chunks: 1, char_count: 24, embedding_hash: 'aaaa1111',
    },
    {
      id: 'd2', content: 'Vue 是一个渐进式前端框架', source: 'project',
      source_id: 'vue', title: 'Vue 指南', metadata: {}, chunk_index: 0,
      total_chunks: 1, char_count: 12, embedding_hash: 'bbbb2222',
    },
  ];
  const embeddings = {
    dimension: 2,
    count: 2,
    doc_ids: ['d1', 'd2'],
    vectors: [[1, 0], [0, 1]],
  };
  fs.writeFileSync(path.join(dir, 'documents.json'), JSON.stringify(documents), 'utf-8');
  fs.writeFileSync(path.join(dir, 'embeddings.json'), JSON.stringify(embeddings), 'utf-8');
}

describe('Index Loading (real ragIndex)', () => {
  let dir: string;

  beforeEach(() => {
    resetIndex();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-index-fix-'));
    makeFixture(dir);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    resetIndex();
  });

  it('loads a valid fixture index', () => {
    expect(loadIndex(dir)).toBe(true);
    expect(isIndexReady()).toBe(true);
  });

  it('isIndexReady auto-loads the committed default index', () => {
    // default path <cwd>/public/rag-index is committed in-repo
    expect(isIndexReady()).toBe(true);
  });

  it('returns false for a missing directory', () => {
    expect(loadIndex(path.join(dir, 'does-not-exist'))).toBe(false);
  });

  it('hybridSearch retrieves the matching document', () => {
    loadIndex(dir);
    const results = hybridSearch('React 教程', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.content.includes('React'))).toBe(true);
    for (const r of results) {
      expect(r).toHaveProperty('content');
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('source');
      expect(r).toHaveProperty('sourceId');
      expect(typeof r.score).toBe('number');
    }
  });

  it('hybridSearch returns [] when index not loaded', () => {
    // resetIndex already ran in beforeEach; do not load
    expect(hybridSearch('React', 3)).toEqual([]);
  });
});
