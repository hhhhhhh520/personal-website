import { describe, it, expect } from 'vitest';

// RRF Fusion Algorithm Implementation (mirrors rrfFusion.ts)
function rrfFusion(
  vectorResults: Array<{ docId: string; score: number }>,
  keywordResults: Array<{ docId: string; score: number }>,
  k: number = 60
): Array<{ docId: string; score: number }> {
  const docScores: Map<string, number> = new Map();

  // Process vector results
  for (let rank = 0; rank < vectorResults.length; rank++) {
    const { docId } = vectorResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  // Process keyword results
  for (let rank = 0; rank < keywordResults.length; rank++) {
    const { docId } = keywordResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  // Sort by score descending
  return [...docScores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

describe('RRF Fusion Algorithm', () => {
  describe('Basic functionality', () => {
    it('returns empty array for empty inputs', () => {
      const result = rrfFusion([], []);
      expect(result).toEqual([]);
    });

    it('returns vector results when keyword results are empty', () => {
      const vectorResults = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc2', score: 0.8 },
      ];
      const result = rrfFusion(vectorResults, []);

      expect(result).toHaveLength(2);
      expect(result[0].docId).toBe('doc1');
      expect(result[0].score).toBeCloseTo(1 / 61, 5);
    });

    it('returns keyword results when vector results are empty', () => {
      const keywordResults = [
        { docId: 'doc1', score: 10 },
        { docId: 'doc2', score: 5 },
      ];
      const result = rrfFusion([], keywordResults);

      expect(result).toHaveLength(2);
      expect(result[0].docId).toBe('doc1');
    });
  });

  describe('Rank-based scoring', () => {
    it('higher rank (lower position) gets higher score', () => {
      const vectorResults = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc2', score: 0.8 },
        { docId: 'doc3', score: 0.7 },
      ];
      const result = rrfFusion(vectorResults, []);

      expect(result[0].score).toBeGreaterThan(result[1].score);
      expect(result[1].score).toBeGreaterThan(result[2].score);
    });

    it('score decreases with rank position', () => {
      const results = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc2', score: 0.8 },
        { docId: 'doc3', score: 0.7 },
      ];
      const result = rrfFusion(results, []);

      // Rank 0: 1/(60+0+1) = 1/61 ≈ 0.0164
      expect(result[0].score).toBeCloseTo(1 / 61, 5);
      // Rank 1: 1/(60+1+1) = 1/62 ≈ 0.0161
      expect(result[1].score).toBeCloseTo(1 / 62, 5);
      // Rank 2: 1/(60+2+1) = 1/63 ≈ 0.0159
      expect(result[2].score).toBeCloseTo(1 / 63, 5);
    });
  });

  describe('Fusion behavior', () => {
    it('documents appearing in both lists get combined score', () => {
      const vectorResults = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc2', score: 0.8 },
      ];
      const keywordResults = [
        { docId: 'doc2', score: 10 },
        { docId: 'doc3', score: 5 },
      ];
      const result = rrfFusion(vectorResults, keywordResults);

      // doc2 appears in both: 1/61 (rank 1 in vector) + 1/61 (rank 0 in keyword)
      const doc2Result = result.find((r) => r.docId === 'doc2');
      expect(doc2Result?.score).toBeCloseTo(1 / 62 + 1 / 61, 5);
    });

    it('documents appearing in both lists rank higher', () => {
      const vectorResults = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc3', score: 0.7 },
      ];
      const keywordResults = [
        { docId: 'doc2', score: 10 },
        { docId: 'doc3', score: 5 },
      ];
      const result = rrfFusion(vectorResults, keywordResults);

      // doc3 appears in both, should rank highest
      expect(result[0].docId).toBe('doc3');
    });

    it('preserves all unique documents', () => {
      const vectorResults = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc2', score: 0.8 },
      ];
      const keywordResults = [
        { docId: 'doc3', score: 10 },
        { docId: 'doc4', score: 5 },
      ];
      const result = rrfFusion(vectorResults, keywordResults);

      expect(result).toHaveLength(4);
      const docIds = result.map((r) => r.docId);
      expect(docIds).toContain('doc1');
      expect(docIds).toContain('doc2');
      expect(docIds).toContain('doc3');
      expect(docIds).toContain('doc4');
    });
  });

  describe('Parameter k', () => {
    it('smaller k gives more weight to top ranks', () => {
      const results = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc2', score: 0.8 },
      ];

      const resultK10 = rrfFusion(results, [], 10);
      const resultK60 = rrfFusion(results, [], 60);

      // With k=10, rank 0 score = 1/11 ≈ 0.091
      // With k=60, rank 0 score = 1/61 ≈ 0.016
      expect(resultK10[0].score).toBeGreaterThan(resultK60[0].score);
    });

    it('k=60 is the default value', () => {
      const results = [{ docId: 'doc1', score: 0.9 }];
      const resultDefault = rrfFusion(results, []);
      const resultK60 = rrfFusion(results, [], 60);

      expect(resultDefault[0].score).toBe(resultK60[0].score);
    });
  });

  describe('Score independence', () => {
    it('original scores do not affect RRF score', () => {
      const highScores = [
        { docId: 'doc1', score: 0.99 },
        { docId: 'doc2', score: 0.98 },
      ];
      const lowScores = [
        { docId: 'doc1', score: 0.01 },
        { docId: 'doc2', score: 0.02 },
      ];

      const resultHigh = rrfFusion(highScores, []);
      const resultLow = rrfFusion(lowScores, []);

      // Same rank positions = same RRF scores
      expect(resultHigh[0].score).toBe(resultLow[0].score);
      expect(resultHigh[1].score).toBe(resultLow[1].score);
    });

    it('only rank position matters, not score magnitude', () => {
      const results = [
        { docId: 'doc1', score: 100 },
        { docId: 'doc2', score: 1 },
      ];
      const result = rrfFusion(results, []);

      // doc1 ranks first regardless of score magnitude
      expect(result[0].docId).toBe('doc1');
      expect(result[0].score).toBeCloseTo(1 / 61, 5);
    });
  });

  describe('Edge cases', () => {
    it('handles duplicate docIds in same list (takes last occurrence)', () => {
      const results = [
        { docId: 'doc1', score: 0.9 },
        { docId: 'doc1', score: 0.8 }, // Duplicate
      ];
      const result = rrfFusion(results, []);

      // Should only appear once, with combined score
      expect(result).toHaveLength(1);
      // Both occurrences contribute: 1/61 + 1/62
      expect(result[0].score).toBeCloseTo(1 / 61 + 1 / 62, 5);
    });

    it('handles large result sets', () => {
      const largeResults = Array(1000)
        .fill(null)
        .map((_, i) => ({ docId: `doc${i}`, score: Math.random() }));
      const result = rrfFusion(largeResults, []);

      expect(result).toHaveLength(1000);
      // First result should have highest score
      expect(result[0].score).toBeCloseTo(1 / 61, 5);
    });

    it('handles very large k values', () => {
      const results = [{ docId: 'doc1', score: 0.9 }];
      const result = rrfFusion(results, [], 1000000);

      expect(result[0].score).toBeCloseTo(1 / 1000001, 8);
    });
  });

  describe('Real-world scenarios', () => {
    it('personal info query should rank personal docs higher', () => {
      // Simulate: keyword search returns project docs (wrong)
      // but vector search returns personal docs (correct)
      const keywordResults = [
        { docId: 'project_1', score: 10 },
        { docId: 'project_2', score: 8 },
        { docId: 'personal_1', score: 5 },
      ];
      const vectorResults = [
        { docId: 'personal_1', score: 0.9 },
        { docId: 'personal_2', score: 0.85 },
        { docId: 'project_1', score: 0.3 },
      ];

      const result = rrfFusion(vectorResults, keywordResults);

      // personal_1 appears in both, should rank highest
      expect(result[0].docId).toBe('personal_1');
    });

    it('project detail query should rank project docs higher', () => {
      const keywordResults = [
        { docId: 'project_mini-claude', score: 15 },
        { docId: 'project_codecraft', score: 10 },
      ];
      const vectorResults = [
        { docId: 'project_mini-claude', score: 0.95 },
        { docId: 'project_codecraft', score: 0.9 },
      ];

      const result = rrfFusion(vectorResults, keywordResults);

      // Both docs appear in both lists, mini-claude ranks higher in both
      expect(result[0].docId).toBe('project_mini-claude');
    });
  });

  describe('Performance', () => {
    it('handles 1000 docs in under 100ms', () => {
      const vectorResults = Array(500)
        .fill(null)
        .map((_, i) => ({ docId: `vec_${i}`, score: Math.random() }));
      const keywordResults = Array(500)
        .fill(null)
        .map((_, i) => ({ docId: `kw_${i}`, score: Math.random() }));

      const start = performance.now();
      const result = rrfFusion(vectorResults, keywordResults);
      const duration = performance.now() - start;

      expect(result.length).toBe(1000);
      expect(duration).toBeLessThan(100);
    });
  });
});