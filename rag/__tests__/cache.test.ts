import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryCache, DEFAULT_CACHE_TTL } from '../utils/cache'

describe('Cache Mechanism', () => {
  let cache: QueryCache

  beforeEach(() => {
    cache = new QueryCache()
  })

  afterEach(() => {
    cache.clear()
  })

  describe('Cache key generation', () => {
    it('generates consistent keys for same query', () => {
      const key1 = cache.getCacheKey('React Tutorial', 3)
      const key2 = cache.getCacheKey('React Tutorial', 3)
      expect(key1).toBe(key2)
    })

    it('normalizes case', () => {
      const key1 = cache.getCacheKey('REACT', 3)
      const key2 = cache.getCacheKey('react', 3)
      expect(key1).toBe(key2)
    })

    it('trims whitespace', () => {
      const key1 = cache.getCacheKey('  React  ', 3)
      const key2 = cache.getCacheKey('React', 3)
      expect(key1).toBe(key2)
    })

    it('includes topK in key', () => {
      const key1 = cache.getCacheKey('React', 3)
      const key2 = cache.getCacheKey('React', 5)
      expect(key1).not.toBe(key2)
    })
  })

  describe('Cache operations', () => {
    const mockResults = [
      { content: 'Result 1', score: 0.9, source: 'test', sourceId: '1', title: 'Test 1' },
      { content: 'Result 2', score: 0.7, source: 'test', sourceId: '2', title: 'Test 2' },
    ]

    it('returns null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull()
    })

    it('stores and retrieves results', () => {
      const key = cache.getCacheKey('React', 3)
      cache.set(key, mockResults)
      const retrieved = cache.get(key)
      expect(retrieved).toEqual(mockResults)
    })

    it('clears cache', () => {
      cache.set('key1', mockResults)
      cache.set('key2', mockResults)
      expect(cache.size()).toBe(2)

      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('tracks cache size', () => {
      expect(cache.size()).toBe(0)
      cache.set('key1', mockResults)
      expect(cache.size()).toBe(1)
      cache.set('key2', mockResults)
      expect(cache.size()).toBe(2)
    })
  })

  describe('TTL expiration', () => {
    const mockResults = [
      { content: 'Result', score: 0.9, source: 'test', sourceId: '1', title: 'Test' },
    ]

    it('returns results for fresh cache', () => {
      const key = 'test::3'
      cache.set(key, mockResults)
      expect(cache.get(key)).toEqual(mockResults)
    })

    it('returns null for expired cache', () => {
      // Manually set expired timestamp
      const key = 'test::3'
      cache.set(key, mockResults)

      // Simulate expiration by modifying timestamp
      const entry = (cache as unknown as { cache: Map<string, { timestamp: number }> }).cache.get(key)
      if (entry) {
        entry.timestamp = Date.now() - DEFAULT_CACHE_TTL - 1000
      }

      expect(cache.get(key)).toBeNull()
      expect(cache.size()).toBe(0) // Expired entry is deleted
    })

    it('TTL is 5 minutes', () => {
      expect(DEFAULT_CACHE_TTL).toBe(5 * 60 * 1000)
    })
  })

  describe('Cache hit/miss scenarios', () => {
    const mockResults = [
      { content: 'Result', score: 0.9, source: 'test', sourceId: '1', title: 'Test' },
    ]

    it('cache hit for same query', () => {
      const key = cache.getCacheKey('React Tutorial', 3)
      cache.set(key, mockResults)
      expect(cache.get(key)).toEqual(mockResults)
    })

    it('cache miss for different query', () => {
      cache.set(cache.getCacheKey('React', 3), mockResults)
      expect(cache.get(cache.getCacheKey('Vue', 3))).toBeNull()
    })

    it('cache miss for different topK', () => {
      cache.set(cache.getCacheKey('React', 3), mockResults)
      expect(cache.get(cache.getCacheKey('React', 5))).toBeNull()
    })

    it('cache hit after normalization', () => {
      cache.set(cache.getCacheKey('React', 3), mockResults)
      // Different case but same normalized key
      expect(cache.get(cache.getCacheKey('REACT', 3))).toEqual(mockResults)
    })
  })

  describe('Performance', () => {
    it('cache operations are fast', () => {
      const mockResults = Array(10).fill({ content: 'Result', score: 0.9, source: 'test', sourceId: '1', title: 'Test' })

      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, mockResults)
      }
      const setDuration = performance.now() - start

      const getStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`)
      }
      const getDuration = performance.now() - getStart

      expect(setDuration).toBeLessThan(50)
      expect(getDuration).toBeLessThan(50)
    })

    it('handles large cache', () => {
      const mockResults = [{ content: 'Result', score: 0.9, source: 'test', sourceId: '1', title: 'Test' }]

      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, mockResults)
      }

      expect(cache.size()).toBe(10000)
      expect(cache.get('key9999')).toEqual(mockResults)
    })
  })
})
