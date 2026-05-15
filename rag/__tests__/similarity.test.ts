import { describe, it, expect } from 'vitest'
import {
  cosineSimilarity,
  euclideanDistance,
  distanceToSimilarity,
  sortBySimilarity,
  filterByMinScore,
  getTopK,
} from '../utils/similarity'
import type { RAGSearchResult } from '../types/index'

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const vec = [1, 2, 3]
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 5)
  })

  it('returns -1 for opposite vectors', () => {
    const a = [1, 0, 0]
    const b = [-1, 0, 0]
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5)
  })

  it('returns 0 for orthogonal vectors', () => {
    const a = [1, 0]
    const b = [0, 1]
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5)
  })

  it('handles zero vectors', () => {
    const a = [0, 0, 0]
    const b = [1, 2, 3]
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('handles both zero vectors', () => {
    const a = [0, 0, 0]
    const b = [0, 0, 0]
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('throws for mismatched lengths', () => {
    const a = [1, 2, 3]
    const b = [1, 2]
    expect(() => cosineSimilarity(a, b)).toThrow('same length')
  })

  it('handles negative values', () => {
    const a = [-1, -2, -3]
    const b = [-1, -2, -3]
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
  })

  it('handles mixed positive and negative', () => {
    const a = [1, -2, 3]
    const b = [-1, 2, -3]
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5)
  })

  it('handles single element vectors', () => {
    expect(cosineSimilarity([5], [5])).toBeCloseTo(1, 5)
    expect(cosineSimilarity([5], [-5])).toBeCloseTo(-1, 5)
  })

  it('handles large vectors', () => {
    const a = Array(1000).fill(1)
    const b = Array(1000).fill(1)
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
  })

  it('handles floating point vectors', () => {
    const a = [0.1, 0.2, 0.3]
    const b = [0.3, 0.2, 0.1]
    const result = cosineSimilarity(a, b)
    expect(result).toBeGreaterThan(-1)
    expect(result).toBeLessThan(1)
  })
})

describe('euclideanDistance', () => {
  it('returns 0 for identical vectors', () => {
    const vec = [1, 2, 3]
    expect(euclideanDistance(vec, vec)).toBe(0)
  })

  it('calculates distance correctly', () => {
    const a = [0, 0]
    const b = [3, 4]
    // 3-4-5 triangle
    expect(euclideanDistance(a, b)).toBe(5)
  })

  it('handles single dimension', () => {
    expect(euclideanDistance([0], [5])).toBe(5)
    expect(euclideanDistance([5], [0])).toBe(5)
  })

  it('throws for mismatched lengths', () => {
    const a = [1, 2, 3]
    const b = [1, 2]
    expect(() => euclideanDistance(a, b)).toThrow('same length')
  })

  it('handles negative values', () => {
    const a = [-1, -2]
    const b = [-4, -6]
    // Distance: sqrt((3)^2 + (4)^2) = 5
    expect(euclideanDistance(a, b)).toBe(5)
  })

  it('is symmetric', () => {
    const a = [1, 2, 3]
    const b = [4, 5, 6]
    expect(euclideanDistance(a, b)).toBeCloseTo(euclideanDistance(b, a), 5)
  })

  it('handles large vectors', () => {
    const a = Array(1000).fill(0)
    const b = Array(1000).fill(1)
    expect(euclideanDistance(a, b)).toBeCloseTo(Math.sqrt(1000), 5)
  })
})

describe('distanceToSimilarity', () => {
  it('returns 1 for zero distance', () => {
    expect(distanceToSimilarity(0)).toBe(1)
  })

  it('returns 0.5 for distance 1', () => {
    expect(distanceToSimilarity(1)).toBe(0.5)
  })

  it('approaches 0 for large distances', () => {
    expect(distanceToSimilarity(1000)).toBeCloseTo(0.001, 3)
  })

  it('is always positive', () => {
    expect(distanceToSimilarity(0)).toBeGreaterThan(0)
    expect(distanceToSimilarity(100)).toBeGreaterThan(0)
    expect(distanceToSimilarity(0.5)).toBeGreaterThan(0)
  })

  it('decreases monotonically', () => {
    expect(distanceToSimilarity(0)).toBeGreaterThan(distanceToSimilarity(1))
    expect(distanceToSimilarity(1)).toBeGreaterThan(distanceToSimilarity(2))
    expect(distanceToSimilarity(10)).toBeGreaterThan(distanceToSimilarity(100))
  })
})

describe('sortBySimilarity', () => {
  const createResult = (score: number): RAGSearchResult => ({
    content: `Score: ${score}`,
    score,
    source: 'test',
    sourceId: 'test-id',
    title: 'Test',
  })

  it('sorts by score descending', () => {
    const results = [
      createResult(0.5),
      createResult(0.9),
      createResult(0.3),
    ]
    const sorted = sortBySimilarity(results)
    expect(sorted[0].score).toBe(0.9)
    expect(sorted[1].score).toBe(0.5)
    expect(sorted[2].score).toBe(0.3)
  })

  it('returns new array (does not mutate)', () => {
    const results = [createResult(0.5), createResult(0.9)]
    const sorted = sortBySimilarity(results)
    expect(sorted).not.toBe(results)
    expect(results[0].score).toBe(0.5)
  })

  it('handles empty array', () => {
    expect(sortBySimilarity([])).toEqual([])
  })

  it('handles single element', () => {
    const results = [createResult(0.5)]
    const sorted = sortBySimilarity(results)
    expect(sorted).toHaveLength(1)
    expect(sorted[0].score).toBe(0.5)
  })

  it('handles equal scores', () => {
    const results = [createResult(0.5), createResult(0.5), createResult(0.5)]
    const sorted = sortBySimilarity(results)
    expect(sorted).toHaveLength(3)
  })
})

describe('filterByMinScore', () => {
  const createResult = (score: number): RAGSearchResult => ({
    content: `Score: ${score}`,
    score,
    source: 'test',
    sourceId: 'test-id',
    title: 'Test',
  })

  it('filters by minimum score', () => {
    const results = [
      createResult(0.3),
      createResult(0.5),
      createResult(0.7),
      createResult(0.9),
    ]
    const filtered = filterByMinScore(results, 0.6)
    expect(filtered).toHaveLength(2)
    expect(filtered.every(r => r.score >= 0.6)).toBe(true)
  })

  it('handles threshold of 0', () => {
    const results = [createResult(0.1), createResult(0.5)]
    expect(filterByMinScore(results, 0)).toHaveLength(2)
  })

  it('handles threshold of 1', () => {
    const results = [createResult(0.5), createResult(1.0)]
    expect(filterByMinScore(results, 1)).toHaveLength(1)
  })

  it('handles empty array', () => {
    expect(filterByMinScore([], 0.5)).toEqual([])
  })

  it('returns empty when all below threshold', () => {
    const results = [createResult(0.1), createResult(0.2)]
    expect(filterByMinScore(results, 0.5)).toHaveLength(0)
  })
})

describe('getTopK', () => {
  const createResult = (score: number): RAGSearchResult => ({
    content: `Score: ${score}`,
    score,
    source: 'test',
    sourceId: 'test-id',
    title: 'Test',
  })

  it('returns top K results', () => {
    const results = [
      createResult(0.1),
      createResult(0.9),
      createResult(0.5),
      createResult(0.7),
    ]
    const top2 = getTopK(results, 2)
    expect(top2).toHaveLength(2)
    expect(top2[0].score).toBe(0.9)
    expect(top2[1].score).toBe(0.7)
  })

  it('handles K larger than array', () => {
    const results = [createResult(0.5), createResult(0.7)]
    const top5 = getTopK(results, 5)
    expect(top5).toHaveLength(2)
  })

  it('handles K of 0', () => {
    const results = [createResult(0.5)]
    expect(getTopK(results, 0)).toHaveLength(0)
  })

  it('handles empty array', () => {
    expect(getTopK([], 3)).toHaveLength(0)
  })

  it('preserves order for equal scores', () => {
    const results = [createResult(0.5), createResult(0.5)]
    const top2 = getTopK(results, 2)
    expect(top2).toHaveLength(2)
  })
})
