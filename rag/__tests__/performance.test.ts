import { describe, it, expect } from 'vitest'

// Performance benchmarking utilities

interface BenchmarkResult {
  name: string
  duration: number
  iterations: number
  avgDuration: number
  opsPerSecond: number
}

function benchmark(
  name: string,
  fn: () => void,
  iterations: number = 100
): BenchmarkResult {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const duration = performance.now() - start

  return {
    name,
    duration,
    iterations,
    avgDuration: duration / iterations,
    opsPerSecond: (iterations / duration) * 1000,
  }
}

// Vector operations for benchmarking
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

function generateRandomVector(dim: number): number[] {
  return Array(dim).fill(0).map(() => Math.random() * 2 - 1)
}

describe('Performance Benchmarks', () => {
  describe('Vector operations', () => {
    it('cosine similarity on 1024-dim vectors', () => {
      const a = generateRandomVector(1024)
      const b = generateRandomVector(1024)

      const result = benchmark('cosineSimilarity-1024', () => {
        cosineSimilarity(a, b)
      }, 1000)

      console.log(`  ${result.name}: ${result.avgDuration.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/s`)
      expect(result.avgDuration).toBeLessThan(1) // Should be < 1ms
    })

    it('cosine similarity on 512-dim vectors', () => {
      const a = generateRandomVector(512)
      const b = generateRandomVector(512)

      const result = benchmark('cosineSimilarity-512', () => {
        cosineSimilarity(a, b)
      }, 1000)

      console.log(`  ${result.name}: ${result.avgDuration.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/s`)
      expect(result.avgDuration).toBeLessThan(0.5)
    })
  })

  describe('Index loading simulation', () => {
    it('simulates loading 100 documents', () => {
      const documents = Array(100).fill(null).map((_, i) => ({
        id: `doc${i}`,
        content: `Content for document ${i}`.repeat(10),
        source: 'test',
        source_id: `test${i}`,
        title: `Document ${i}`,
      }))

      const result = benchmark('load-100-docs', () => {
        // Simulate loading by creating a map
        const map = new Map()
        for (const doc of documents) {
          map.set(doc.id, doc)
        }
      }, 100)

      console.log(`  ${result.name}: ${result.avgDuration.toFixed(3)}ms avg`)
      expect(result.avgDuration).toBeLessThan(5)
    })

    it('simulates loading 1000 embeddings', () => {
      const embeddings = Array(1000).fill(null).map(() => generateRandomVector(1024))
      const docIds = Array(1000).fill(null).map((_, i) => `doc${i}`)

      const result = benchmark('load-1000-embeddings', () => {
        const map = new Map()
        for (let i = 0; i < embeddings.length; i++) {
          map.set(docIds[i], embeddings[i])
        }
      }, 100)

      console.log(`  ${result.name}: ${result.avgDuration.toFixed(3)}ms avg`)
      expect(result.avgDuration).toBeLessThan(20)
    })
  })

  describe('Query processing', () => {
    it('keyword scoring on 100 documents', () => {
      const documents = Array(100).fill(null).map((_, i) => ({
        id: `doc${i}`,
        content: `Document ${i} content about React and TypeScript`,
        title: `Doc ${i}`,
      }))

      const query = 'React TypeScript'

      const result = benchmark('keyword-scoring-100', () => {
        for (const doc of documents) {
          const terms = query.toLowerCase().split(/\s+/)
          let score = 0
          for (const term of terms) {
            if (doc.content.toLowerCase().includes(term)) score++
          }
        }
      }, 100)

      console.log(`  ${result.name}: ${result.avgDuration.toFixed(3)}ms avg`)
      expect(result.avgDuration).toBeLessThan(5)
    })

    it('hybrid search on 100 documents', () => {
      const documents = Array(100).fill(null).map((_, i) => ({
        id: `doc${i}`,
        content: `Document ${i} content`,
        title: `Doc ${i}`,
        embedding: generateRandomVector(128),
      }))

      const queryEmbedding = generateRandomVector(128)

      const result = benchmark('hybrid-search-100', () => {
        const scores = documents.map(doc => ({
          id: doc.id,
          score: cosineSimilarity(queryEmbedding, doc.embedding),
        }))
        scores.sort((a, b) => b.score - a.score)
        scores.slice(0, 5)
      }, 100)

      console.log(`  ${result.name}: ${result.avgDuration.toFixed(3)}ms avg`)
      expect(result.avgDuration).toBeLessThan(10)
    })
  })

  describe('Memory estimation', () => {
    it('estimates memory for 1000 documents', () => {
      // Rough estimation
      const docCount = 1000
      const avgContentLength = 500 // chars
      const embeddingDim = 1024

      // Each char = 2 bytes (UTF-16)
      const contentBytes = docCount * avgContentLength * 2
      // Each number = 8 bytes (float64)
      const embeddingBytes = docCount * embeddingDim * 8

      const totalMB = (contentBytes + embeddingBytes) / (1024 * 1024)

      console.log(`  Estimated memory for 1000 docs: ${totalMB.toFixed(2)} MB`)
      expect(totalMB).toBeLessThan(20) // Should be under 20MB
    })
  })

  describe('Throughput benchmarks', () => {
    it('measures queries per second', () => {
      const documents = Array(100).fill(null).map((_, i) => ({
        id: `doc${i}`,
        content: `React TypeScript JavaScript ${i}`,
        title: `Doc ${i}`,
        embedding: generateRandomVector(128),
      }))

      let queryCount = 0
      const start = performance.now()
      const duration = 1000 // 1 second

      while (performance.now() - start < duration) {
        const queryEmbedding = generateRandomVector(128)
        for (const doc of documents) {
          cosineSimilarity(queryEmbedding, doc.embedding)
        }
        queryCount++
      }

      const qps = queryCount
      console.log(`  Throughput: ${qps} queries/second`)
      expect(qps).toBeGreaterThan(100) // Should handle at least 100 qps
    })
  })
})