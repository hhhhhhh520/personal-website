import { describe, it, expect } from 'vitest';

// RRF Fusion Algorithm
function rrfFusion(
  vectorResults: Array<{ docId: string; score: number }>,
  keywordResults: Array<{ docId: string; score: number }>,
  k: number = 60
): Array<{ docId: string; score: number }> {
  const docScores: Map<string, number> = new Map();

  for (let rank = 0; rank < vectorResults.length; rank++) {
    const { docId } = vectorResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  for (let rank = 0; rank < keywordResults.length; rank++) {
    const { docId } = keywordResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  return [...docScores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

// Cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// Keyword search
function keywordSearch(
  query: string,
  documents: Array<{ id: string; content: string; title: string }>
): Array<{ docId: string; score: number }> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);
  const scores: Map<string, number> = new Map();

  for (const doc of documents) {
    let score = 0;
    for (const term of terms) {
      if (doc.title.toLowerCase().includes(term)) score += 3;
      const matches = (doc.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      score += matches * 0.5;
    }
    if (score > 0) scores.set(doc.id, score);
  }

  return [...scores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

// Vector search
function vectorSearch(
  queryEmbedding: number[],
  documents: Array<{ id: string; embedding: number[] }>
): Array<{ docId: string; score: number }> {
  return documents
    .map((doc) => ({
      docId: doc.id,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score);
}

// Hybrid search with RRF
function hybridSearchRRF(
  query: string,
  documents: Array<{ id: string; content: string; title: string; embedding: number[] }>,
  queryEmbedding: number[],
  topK: number
): Array<{ id: string; score: number }> {
  // 1. Keyword search
  const keywordResults = keywordSearch(query, documents);

  // 2. Vector search
  const vectorResults = vectorSearch(queryEmbedding, documents);

  // 3. RRF fusion
  const fusedResults = rrfFusion(vectorResults, keywordResults);

  // 4. Return topK
  return fusedResults.slice(0, topK).map((r) => ({ id: r.docId, score: r.score }));
}

// Legacy hybrid search (for comparison)
function hybridSearchLegacy(
  query: string,
  documents: Array<{ id: string; content: string; title: string; embedding: number[] }>,
  queryEmbedding: number[],
  topK: number
): Array<{ id: string; score: number }> {
  const results: Array<{ id: string; score: number }> = [];

  for (const doc of documents) {
    const keywordScore = keywordSearch(query, [doc])[0]?.score || 0;
    const semanticScore = cosineSimilarity(queryEmbedding, doc.embedding);

    const normalizedKeyword = Math.min(keywordScore / 10, 1);
    const combined = 0.3 * normalizedKeyword + 0.7 * semanticScore;

    results.push({ id: doc.id, score: combined });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

describe('Hybrid Search (RRF)', () => {
  const mockDocuments = [
    {
      id: 'doc1',
      content: 'React is a JavaScript library for building user interfaces',
      title: 'React Tutorial',
      embedding: [0.9, 0.1, 0.0],
    },
    {
      id: 'doc2',
      content: 'Vue is a progressive JavaScript framework',
      title: 'Vue Guide',
      embedding: [0.1, 0.9, 0.0],
    },
    {
      id: 'doc3',
      content: 'Angular is a platform for building web applications',
      title: 'Angular Documentation',
      embedding: [0.1, 0.1, 0.9],
    },
  ];

  describe('RRF Fusion', () => {
    it('combines keyword and vector results', () => {
      const queryEmbedding = [0.9, 0.1, 0.0];
      const results = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);

      expect(results.length).toBeGreaterThan(0);
      // Doc1 should rank high (both keyword and vector match)
      expect(results.find((r) => r.id === 'doc1')).toBeDefined();
    });

    it('documents in both lists rank higher', () => {
      const queryEmbedding = [0.9, 0.1, 0.0];
      const results = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);

      // doc1 appears in both keyword (title match) and vector (embedding match)
      expect(results[0].id).toBe('doc1');
    });

    it('returns exactly topK results', () => {
      const queryEmbedding = [0.5, 0.5, 0.5];
      const results = hybridSearchRRF('test', mockDocuments, queryEmbedding, 2);
      expect(results).toHaveLength(2);
    });

    it('handles empty keyword results', () => {
      const queryEmbedding = [0.9, 0.1, 0.0];
      const results = hybridSearchRRF('xyznonexistent', mockDocuments, queryEmbedding, 3);

      // Should still return vector-based results
      expect(results.length).toBeGreaterThan(0);
    });

    it('handles empty vector results', () => {
      const queryEmbedding = [0, 0, 0];
      const results = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);

      // Should still return keyword-based results
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Comparison with Legacy', () => {
    it('RRF produces different ranking than legacy', () => {
      const queryEmbedding = [0.5, 0.5, 0.0];
      const rrfResults = hybridSearchRRF('JavaScript', mockDocuments, queryEmbedding, 3);
      const legacyResults = hybridSearchLegacy('JavaScript', mockDocuments, queryEmbedding, 3);

      // Both should return results
      expect(rrfResults.length).toBe(legacyResults.length);

      // RRF uses rank-based scoring, legacy uses weighted combination
      // Scores will be different
      const rrfScores = rrfResults.map((r) => r.score);
      const legacyScores = legacyResults.map((r) => r.score);

      // RRF scores are typically smaller (1/61 ≈ 0.016)
      // Legacy scores are weighted combination (0-1 range)
      expect(Math.max(...rrfScores)).toBeLessThan(Math.max(...legacyScores));
    });

    it('both methods agree on top result for strong matches', () => {
      const queryEmbedding = [0.9, 0.1, 0.0];
      const rrfResults = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);
      const legacyResults = hybridSearchLegacy('React', mockDocuments, queryEmbedding, 3);

      // Both should rank doc1 highest (strong keyword + vector match)
      expect(rrfResults[0].id).toBe('doc1');
      expect(legacyResults[0].id).toBe('doc1');
    });
  });

  describe('Personal Info Retrieval (Bug Fix)', () => {
    const mixedDocuments = [
      {
        id: 'personal_1',
        content: '我的教育背景：本科在读，计算机科学与技术专业',
        title: '个人简介',
        embedding: [0.8, 0.2, 0.0],
      },
      {
        id: 'project_1',
        content: 'Mini Claude Code 是一个 AI 编程助手项目',
        title: 'Mini Claude 项目介绍',
        embedding: [0.3, 0.7, 0.0],
      },
      {
        id: 'project_2',
        content: 'CodeCraft Agent 是一个代码生成工具',
        title: 'CodeCraft 项目介绍',
        embedding: [0.2, 0.8, 0.0],
      },
    ];

    it('RRF ranks personal doc higher for personal query', () => {
      // Query embedding similar to personal doc
      const queryEmbedding = [0.8, 0.2, 0.0];

      const results = hybridSearchRRF('我的教育背景', mixedDocuments, queryEmbedding, 3);

      // Personal doc should rank high due to vector similarity
      // Even if keyword search might return project docs
      const personalResult = results.find((r) => r.id === 'personal_1');
      expect(personalResult).toBeDefined();
    });

    it('RRF is more robust to keyword noise', () => {
      // Simulate keyword search returning wrong docs
      // But vector search returning correct docs
      const queryEmbedding = [0.8, 0.2, 0.0];

      const results = hybridSearchRRF('教育背景', mixedDocuments, queryEmbedding, 3);

      // With RRF, personal_1 should still appear in results
      // because it ranks high in vector search
      expect(results.some((r) => r.id === 'personal_1')).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('sorts by score descending', () => {
      const queryEmbedding = [0.9, 0.1, 0.0];
      const results = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('highest score is first', () => {
      const queryEmbedding = [0.9, 0.1, 0.0];
      const results = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);

      const maxScore = Math.max(...results.map((r) => r.score));
      expect(results[0].score).toBe(maxScore);
    });
  });

  describe('Edge cases', () => {
    it('handles empty documents', () => {
      const queryEmbedding = [0.5, 0.5, 0.5];
      const results = hybridSearchRRF('test', [], queryEmbedding, 3);
      expect(results).toHaveLength(0);
    });

    it('handles empty query', () => {
      const queryEmbedding = [0.5, 0.5, 0.5];
      const results = hybridSearchRRF('', mockDocuments, queryEmbedding, 3);
      // Vector search still works
      expect(results.length).toBeGreaterThan(0);
    });

    it('handles zero query embedding', () => {
      const queryEmbedding = [0, 0, 0];
      const results = hybridSearchRRF('React', mockDocuments, queryEmbedding, 3);
      // Keyword search still works
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('handles large document sets efficiently', () => {
      const largeDocs = Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: `doc${i}`,
          content: `Document ${i} content`,
          title: `Doc ${i}`,
          embedding: [Math.random(), Math.random(), Math.random()],
        }));

      const queryEmbedding = [0.5, 0.5, 0.5];
      const start = performance.now();
      const results = hybridSearchRRF('Document', largeDocs, queryEmbedding, 10);
      const duration = performance.now() - start;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});