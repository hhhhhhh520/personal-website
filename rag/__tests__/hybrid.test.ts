import { describe, it, expect } from 'vitest';
import { rrfFusionTwoWay } from '../utils/rrfFusion';
import { cosineSimilarity } from '../utils/similarity';
import { keywordSearch } from '../utils/keywordSearch';
import { vectorSearch } from '../utils/vectorSearch';

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

  const docIds = mockDocuments.map(d => d.id);
  const vectors = mockDocuments.map(d => d.embedding);

  describe('RRF Fusion', () => {
    it('combines keyword and vector results', () => {
      // Keyword search
      const keywordResults = keywordSearch('React', mockDocuments);

      // Vector search with query embedding similar to doc1
      const queryEmbedding = [0.9, 0.1, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, docIds, vectors);

      // RRF fusion
      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      expect(fusedResults.length).toBeGreaterThan(0);
      // Doc1 should rank high (both keyword and vector match)
      expect(fusedResults.find(r => r.docId === 'doc1')).toBeDefined();
    });

    it('documents in both lists rank higher', () => {
      const keywordResults = keywordSearch('React', mockDocuments);
      const queryEmbedding = [0.9, 0.1, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // doc1 appears in both keyword (title match) and vector (embedding match)
      expect(fusedResults[0].docId).toBe('doc1');
    });

    it('handles empty keyword results', () => {
      const keywordResults = keywordSearch('xyznonexistent', mockDocuments);
      const queryEmbedding = [0.9, 0.1, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // Should still return vector-based results
      expect(fusedResults.length).toBeGreaterThan(0);
    });

    it('handles empty vector results', () => {
      const keywordResults = keywordSearch('React', mockDocuments);
      const zeroEmbedding = [0, 0, 0];
      const vectorResults = vectorSearch(zeroEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // Should still return keyword-based results
      expect(fusedResults.length).toBeGreaterThan(0);
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

    const mixedDocIds = mixedDocuments.map(d => d.id);
    const mixedVectors = mixedDocuments.map(d => d.embedding);

    it('RRF ranks personal doc higher for personal query', () => {
      const keywordResults = keywordSearch('我的教育背景', mixedDocuments);
      const queryEmbedding = [0.8, 0.2, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, mixedDocIds, mixedVectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // Personal doc should rank high due to vector similarity
      const personalResult = fusedResults.find(r => r.docId === 'personal_1');
      expect(personalResult).toBeDefined();
    });

    it('RRF is more robust to keyword noise', () => {
      const keywordResults = keywordSearch('教育背景', mixedDocuments);
      const queryEmbedding = [0.8, 0.2, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, mixedDocIds, mixedVectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // With RRF, personal_1 should still appear in results
      expect(fusedResults.some(r => r.docId === 'personal_1')).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('sorts by score descending', () => {
      const keywordResults = keywordSearch('React', mockDocuments);
      const queryEmbedding = [0.9, 0.1, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      for (let i = 1; i < fusedResults.length; i++) {
        expect(fusedResults[i - 1].score).toBeGreaterThanOrEqual(fusedResults[i].score);
      }
    });

    it('highest score is first', () => {
      const keywordResults = keywordSearch('React', mockDocuments);
      const queryEmbedding = [0.9, 0.1, 0.0];
      const vectorResults = vectorSearch(queryEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      const maxScore = Math.max(...fusedResults.map(r => r.score));
      expect(fusedResults[0].score).toBe(maxScore);
    });
  });

  describe('Edge cases', () => {
    it('handles empty documents', () => {
      const keywordResults = keywordSearch('test', []);
      const queryEmbedding = [0.5, 0.5, 0.5];
      const vectorResults = vectorSearch(queryEmbedding, [], []);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      expect(fusedResults).toHaveLength(0);
    });

    it('handles empty query', () => {
      const keywordResults = keywordSearch('', mockDocuments);
      const queryEmbedding = [0.5, 0.5, 0.5];
      const vectorResults = vectorSearch(queryEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // Vector search still works
      expect(fusedResults.length).toBeGreaterThan(0);
    });

    it('handles zero query embedding', () => {
      const keywordResults = keywordSearch('React', mockDocuments);
      const zeroEmbedding = [0, 0, 0];
      const vectorResults = vectorSearch(zeroEmbedding, docIds, vectors);

      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);

      // Keyword search still works
      expect(fusedResults.length).toBeGreaterThan(0);
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

      const largeDocIds = largeDocs.map(d => d.id);
      const largeVectors = largeDocs.map(d => d.embedding);

      const keywordResults = keywordSearch('Document', largeDocs);
      const queryEmbedding = [0.5, 0.5, 0.5];
      const vectorResults = vectorSearch(queryEmbedding, largeDocIds, largeVectors);

      const start = performance.now();
      const fusedResults = rrfFusionTwoWay(vectorResults, keywordResults);
      const duration = performance.now() - start;

      expect(fusedResults.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });
  });
});
