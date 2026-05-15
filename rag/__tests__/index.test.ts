import { describe, it, expect } from 'vitest'

// Index building logic for testing
interface Document {
  id: string
  content: string
  source: string
  source_id: string
  title: string
}

interface EmbeddingGenerator {
  generate(text: string): number[]
}

// Mock embedding generator for testing
class MockEmbeddingGenerator implements EmbeddingGenerator {
  private dimension: number

  constructor(dimension: number = 1024) {
    this.dimension = dimension
  }

  generate(text: string): number[] {
    // Generate deterministic "embedding" based on text hash
    const hash = this.simpleHash(text)
    const embedding = new Array(this.dimension).fill(0)
    for (let i = 0; i < this.dimension; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5
    }
    return embedding
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash)
  }
}

class IndexBuilder {
  private generator: EmbeddingGenerator
  private documents: Document[] = []
  private embeddings: number[][] = []
  private docIds: string[] = []

  constructor(generator: EmbeddingGenerator) {
    this.generator = generator
  }

  addDocument(doc: Document): void {
    const embedding = this.generator.generate(doc.content)
    this.documents.push(doc)
    this.embeddings.push(embedding)
    this.docIds.push(doc.id)
  }

  build(): { documents: Document[]; embeddings: number[][]; docIds: string[]; dimension: number } {
    const dimension = this.embeddings[0]?.length || 0
    return {
      documents: this.documents,
      embeddings: this.embeddings,
      docIds: this.docIds,
      dimension,
    }
  }

  clear(): void {
    this.documents = []
    this.embeddings = []
    this.docIds = []
  }
}

describe('Index Building', () => {
  describe('MockEmbeddingGenerator', () => {
    it('generates correct dimension', () => {
      const generator = new MockEmbeddingGenerator(512)
      const embedding = generator.generate('test')
      expect(embedding).toHaveLength(512)
    })

    it('generates consistent embeddings for same text', () => {
      const generator = new MockEmbeddingGenerator()
      const emb1 = generator.generate('React Tutorial')
      const emb2 = generator.generate('React Tutorial')
      expect(emb1).toEqual(emb2)
    })

    it('generates different embeddings for different text', () => {
      const generator = new MockEmbeddingGenerator()
      const emb1 = generator.generate('React Tutorial')
      const emb2 = generator.generate('Vue Guide')
      expect(emb1).not.toEqual(emb2)
    })

    it('handles empty string', () => {
      const generator = new MockEmbeddingGenerator()
      const embedding = generator.generate('')
      expect(embedding).toBeDefined()
      expect(embedding.length).toBeGreaterThan(0)
    })

    it('handles unicode text', () => {
      const generator = new MockEmbeddingGenerator()
      const embedding = generator.generate('中文测试 🚀')
      expect(embedding).toBeDefined()
    })
  })

  describe('IndexBuilder', () => {
    it('builds empty index', () => {
      const generator = new MockEmbeddingGenerator()
      const builder = new IndexBuilder(generator)
      const index = builder.build()

      expect(index.documents).toHaveLength(0)
      expect(index.embeddings).toHaveLength(0)
      expect(index.docIds).toHaveLength(0)
    })

    it('adds single document', () => {
      const generator = new MockEmbeddingGenerator()
      const builder = new IndexBuilder(generator)

      builder.addDocument({
        id: 'doc1',
        content: 'Test content',
        source: 'test',
        source_id: 'test1',
        title: 'Test',
      })

      const index = builder.build()
      expect(index.documents).toHaveLength(1)
      expect(index.embeddings).toHaveLength(1)
      expect(index.docIds).toContain('doc1')
    })

    it('adds multiple documents', () => {
      const generator = new MockEmbeddingGenerator()
      const builder = new IndexBuilder(generator)

      for (let i = 0; i < 5; i++) {
        builder.addDocument({
          id: `doc${i}`,
          content: `Content ${i}`,
          source: 'test',
          source_id: `test${i}`,
          title: `Doc ${i}`,
        })
      }

      const index = builder.build()
      expect(index.documents).toHaveLength(5)
      expect(index.dimension).toBe(1024)
    })

    it('clears index', () => {
      const generator = new MockEmbeddingGenerator()
      const builder = new IndexBuilder(generator)

      builder.addDocument({
        id: 'doc1',
        content: 'Test',
        source: 'test',
        source_id: 't1',
        title: 'Test',
      })

      expect(builder.build().documents).toHaveLength(1)

      builder.clear()
      expect(builder.build().documents).toHaveLength(0)
    })

    it('maintains document order', () => {
      const generator = new MockEmbeddingGenerator()
      const builder = new IndexBuilder(generator)

      builder.addDocument({ id: 'a', content: 'A', source: 'test', source_id: '1', title: 'A' })
      builder.addDocument({ id: 'b', content: 'B', source: 'test', source_id: '2', title: 'B' })
      builder.addDocument({ id: 'c', content: 'C', source: 'test', source_id: '3', title: 'C' })

      const index = builder.build()
      expect(index.docIds).toEqual(['a', 'b', 'c'])
    })
  })

  describe('Performance', () => {
    it('handles large number of documents', () => {
      const generator = new MockEmbeddingGenerator(128)
      const builder = new IndexBuilder(generator)

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        builder.addDocument({
          id: `doc${i}`,
          content: `Content for document ${i}`,
          source: 'test',
          source_id: `test${i}`,
          title: `Document ${i}`,
        })
      }
      const duration = performance.now() - start

      const index = builder.build()
      expect(index.documents).toHaveLength(100)
      expect(duration).toBeLessThan(1000) // Should complete in < 1s
    })
  })
})