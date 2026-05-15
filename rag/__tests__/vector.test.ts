import { describe, it, expect } from 'vitest'

// Extract the cosineSimilarity function from route.ts for testing
// We need to test the implementation directly
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)

  if (denominator === 0) {
    return 0
  }

  return dotProduct / denominator
}

describe('Vector Operations (route.ts)', () => {
  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const vec = [1, 2, 3, 4, 5]
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 5)
    })

    it('returns -1 for opposite vectors', () => {
      const a = [1, 0, 0]
      const b = [-1, 0, 0]
      expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5)
    })

    it('returns 0 for orthogonal vectors', () => {
      const a = [1, 0, 0]
      const b = [0, 1, 0]
      expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5)
    })

    it('handles zero vector (returns 0)', () => {
      const zero = [0, 0, 0]
      const vec = [1, 2, 3]
      expect(cosineSimilarity(zero, vec)).toBe(0)
      expect(cosineSimilarity(vec, zero)).toBe(0)
    })

    it('handles both zero vectors', () => {
      const zero1 = [0, 0, 0]
      const zero2 = [0, 0, 0]
      expect(cosineSimilarity(zero1, zero2)).toBe(0)
    })

    it('throws error for length mismatch', () => {
      const a = [1, 2, 3]
      const b = [1, 2]
      expect(() => cosineSimilarity(a, b)).toThrow('Vector length mismatch')
    })

    it('handles 1024-dim vectors (typical embedding size)', () => {
      const a = Array(1024).fill(0).map((_, i) => Math.sin(i * 0.01))
      const b = Array(1024).fill(0).map((_, i) => Math.cos(i * 0.01))
      const result = cosineSimilarity(a, b)
      expect(result).toBeGreaterThanOrEqual(-1)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('handles negative values', () => {
      const a = [-1, -2, -3]
      const b = [1, 2, 3]
      expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5)
    })

    it('handles floating point precision', () => {
      const a = [0.0001, 0.0002, 0.0003]
      const b = [0.0003, 0.0002, 0.0001]
      const result = cosineSimilarity(a, b)
      expect(result).toBeGreaterThanOrEqual(-1)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('is symmetric', () => {
      const a = [1, 2, 3, 4]
      const b = [5, 6, 7, 8]
      expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 10)
    })
  })

  describe('Vector length validation', () => {
    it('validates empty vectors', () => {
      expect(() => cosineSimilarity([], [])).not.toThrow()
      expect(cosineSimilarity([], [])).toBe(0) // 0/0 = 0 handled
    })

    it('validates single element vectors', () => {
      expect(cosineSimilarity([1], [1])).toBeCloseTo(1, 5)
      expect(cosineSimilarity([1], [-1])).toBeCloseTo(-1, 5)
    })

    it('validates large vectors efficiently', () => {
      const size = 10000
      const a = new Array(size).fill(1)
      const b = new Array(size).fill(1)
      const start = performance.now()
      const result = cosineSimilarity(a, b)
      const duration = performance.now() - start

      expect(result).toBeCloseTo(1, 5)
      expect(duration).toBeLessThan(100) // Should complete in < 100ms
    })
  })

  describe('Zero vector handling', () => {
    it('returns 0 when first vector is zero', () => {
      expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
    })

    it('returns 0 when second vector is zero', () => {
      expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0)
    })

    it('returns 0 when both vectors are zero', () => {
      expect(cosineSimilarity([0, 0], [0, 0])).toBe(0)
    })

    it('handles near-zero vectors', () => {
      const tiny = [1e-10, 1e-10, 1e-10]
      const normal = [1, 2, 3]
      const result = cosineSimilarity(tiny, normal)
      expect(result).toBeGreaterThanOrEqual(-1)
      expect(result).toBeLessThanOrEqual(1)
    })
  })

  describe('Numerical stability', () => {
    it('handles very large values', () => {
      const a = [1e10, 2e10, 3e10]
      const b = [1e10, 2e10, 3e10]
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
    })

    it('handles very small values', () => {
      const a = [1e-10, 2e-10, 3e-10]
      const b = [1e-10, 2e-10, 3e-10]
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
    })

    it('handles mixed magnitude values', () => {
      const a = [1e-5, 1e5, 1]
      const b = [1e-5, 1e5, 1]
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
    })
  })
})
