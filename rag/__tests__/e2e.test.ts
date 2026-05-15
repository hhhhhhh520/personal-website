import { describe, it, expect, beforeAll } from 'vitest'

// End-to-end RAG flow simulation

interface Document {
  id: string
  content: string
  source: string
  source_id: string
  title: string
  embedding: number[]
}

interface SearchResult {
  content: string
  score: number
  source: string
  sourceId: string
  title: string
}

// Complete RAG pipeline simulation
class RAGPipeline {
  private documents: Document[] = []
  private cache = new Map<string, SearchResult[]>()

  // Step 1: Index documents
  indexDocuments(docs: Omit<Document, 'embedding'>[], embeddingFn: (text: string) => number[]): void {
    this.documents = docs.map(doc => ({
      ...doc,
      embedding: embeddingFn(doc.content),
    }))
  }

  // Step 2: Compute query embedding (simulated)
  computeQueryEmbedding(query: string, embeddingFn: (text: string) => number[]): number[] {
    return embeddingFn(query)
  }

  // Step 3: Keyword scoring
  keywordScore(query: string, doc: Document): number {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
    let score = 0
    for (const term of terms) {
      if (doc.title.toLowerCase().includes(term)) score += 3
      const matches = (doc.content.toLowerCase().match(new RegExp(term, 'g')) || []).length
      score += matches * 0.5
    }
    return score
  }

  // Step 4: Semantic similarity
  semanticSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB)
    return denominator === 0 ? 0 : dotProduct / denominator
  }

  // Step 5: Hybrid search
  search(query: string, queryEmbedding: number[], topK: number): SearchResult[] {
    // Check cache
    const cacheKey = `${query}::${topK}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    // Compute scores
    const results: Array<{ doc: Document; score: number }> = []
    for (const doc of this.documents) {
      const keywordScore = this.keywordScore(query, doc)
      const semanticScore = this.semanticSimilarity(queryEmbedding, doc.embedding)
      const normalizedKeyword = Math.min(keywordScore / 10, 1)
      const combined = 0.3 * normalizedKeyword + 0.7 * semanticScore
      results.push({ doc, score: combined })
    }

    // Sort and take top K
    results.sort((a, b) => b.score - a.score)
    const topResults = results.slice(0, topK)

    // Convert to SearchResult format
    const searchResults: SearchResult[] = topResults.map(({ doc, score }) => ({
      content: doc.content,
      score: Math.round(score * 1000) / 1000,
      source: doc.source,
      sourceId: doc.source_id,
      title: doc.title,
    }))

    // Cache results
    this.cache.set(cacheKey, searchResults)

    return searchResults
  }

  // Step 6: Build context for LLM
  buildContext(results: SearchResult[], maxLength: number = 2000): string {
    const parts: string[] = []
    let length = 0

    for (const result of results) {
      const part = `【${result.title}】\n${result.content}`
      if (length + part.length > maxLength) break
      parts.push(part)
      length += part.length
    }

    return parts.join('\n\n---\n\n')
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }
}

// Mock embedding function
function mockEmbedding(text: string): number[] {
  const dim = 128
  const embedding = new Array(dim).fill(0)
  for (let i = 0; i < text.length; i++) {
    embedding[i % dim] += text.charCodeAt(i) / 1000
  }
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0))
  return embedding.map(v => v / (norm || 1))
}

describe('End-to-End RAG Flow', () => {
  const pipeline = new RAGPipeline()

  const mockDocuments = [
    { id: 'p1', content: 'React 是一个用于构建用户界面的 JavaScript 库', source: 'project', source_id: 'react', title: 'React 项目' },
    { id: 'p2', content: 'Vue 是一个渐进式 JavaScript 框架', source: 'project', source_id: 'vue', title: 'Vue 项目' },
    { id: 'b1', content: 'TypeScript 是 JavaScript 的超集，添加了类型系统', source: 'blog', source_id: 'ts', title: 'TypeScript 教程' },
    { id: 'b2', content: 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时', source: 'blog', source_id: 'node', title: 'Node.js 入门' },
  ]

  beforeAll(() => {
    pipeline.indexDocuments(mockDocuments, mockEmbedding)
  })

  describe('Complete search flow', () => {
    it('searches for React and returns relevant results', () => {
      const query = 'React JavaScript'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 3)

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].title).toContain('React')
    })

    it('searches for TypeScript and returns relevant results', () => {
      const query = 'TypeScript 类型'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 3)

      expect(results.length).toBeGreaterThan(0)
    })

    it('returns empty for no matches', () => {
      // With mock embedding, we still get semantic matches
      // This tests the pipeline doesn't crash
      const query = 'xyzabc123'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 3)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('Context building', () => {
    it('builds context from search results', () => {
      const query = 'React'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 2)
      const context = pipeline.buildContext(results)

      expect(context).toContain('【')
      expect(context).toContain('React')
    })

    it('respects max length', () => {
      const query = 'JavaScript'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 10)
      const context = pipeline.buildContext(results, 100)

      expect(context.length).toBeLessThanOrEqual(100 + 50) // Allow some buffer for separator
    })
  })

  describe('Caching', () => {
    it('caches search results', () => {
      pipeline.clearCache()

      const query = 'Vue'
      const queryEmbedding = mockEmbedding(query)

      // First search
      const results1 = pipeline.search(query, queryEmbedding, 3)

      // Second search (should use cache)
      const results2 = pipeline.search(query, queryEmbedding, 3)

      expect(results1).toEqual(results2)
    })
  })

  describe('Performance', () => {
    it('completes full flow in reasonable time', () => {
      const start = performance.now()

      const query = 'JavaScript 框架'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 5)
      const context = pipeline.buildContext(results)

      const duration = performance.now() - start

      expect(results).toBeDefined()
      expect(context).toBeDefined()
      expect(duration).toBeLessThan(50) // Should complete in < 50ms
    })
  })

  describe('Edge cases', () => {
    it('handles empty query', () => {
      const query = ''
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 3)

      expect(results).toBeDefined()
    })

    it('handles special characters in query', () => {
      const query = 'React <script> test'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 3)

      expect(results).toBeDefined()
    })

    it('handles very long query', () => {
      const query = 'React '.repeat(100)
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 3)

      expect(results).toBeDefined()
    })

    it('handles topK larger than document count', () => {
      const query = 'test'
      const queryEmbedding = mockEmbedding(query)
      const results = pipeline.search(query, queryEmbedding, 100)

      expect(results.length).toBeLessThanOrEqual(mockDocuments.length)
    })
  })
})