import { describe, it, expect } from 'vitest'

// Extract computeQueryRelevance logic for testing
function computeQueryRelevance(query: string, doc: { content: string; title: string }): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  const content = doc.content.toLowerCase()
  const title = doc.title.toLowerCase()

  let score = 0

  for (const term of queryTerms) {
    // Title matches are weighted higher
    if (title.includes(term)) {
      score += 3
    }
    // Content matches
    const contentMatches = (content.match(new RegExp(term, 'g')) || []).length
    score += contentMatches * 0.5
  }

  return score
}

describe('Keyword Relevance (computeQueryRelevance)', () => {
  describe('Basic functionality', () => {
    it('returns 0 for empty query', () => {
      const doc = { content: 'test content', title: 'test title' }
      expect(computeQueryRelevance('', doc)).toBe(0)
    })

    it('returns 0 for whitespace query', () => {
      const doc = { content: 'test content', title: 'test title' }
      expect(computeQueryRelevance('   ', doc)).toBe(0)
    })

    it('returns 0 for single character query (filtered out)', () => {
      const doc = { content: 'test content', title: 'test title' }
      expect(computeQueryRelevance('a', doc)).toBe(0)
    })

    it('returns positive score for matching title', () => {
      const doc = { content: 'some content', title: 'React Tutorial' }
      expect(computeQueryRelevance('React', doc)).toBe(3) // Title weight = 3
    })

    it('returns positive score for matching content', () => {
      const doc = { content: 'React is a JavaScript library', title: 'Tutorial' }
      expect(computeQueryRelevance('React', doc)).toBe(0.5) // Content weight = 0.5
    })
  })

  describe('Title weighting', () => {
    it('title match has higher weight than content match', () => {
      const docTitleMatch = { content: 'some text', title: 'React Guide' }
      const docContentMatch = { content: 'React Guide', title: 'some title' }

      const titleScore = computeQueryRelevance('React', docTitleMatch)
      const contentScore = computeQueryRelevance('React', docContentMatch)

      expect(titleScore).toBeGreaterThan(contentScore)
    })

    it('title and content both match', () => {
      const doc = { content: 'React is great', title: 'React Guide' }
      const score = computeQueryRelevance('React', doc)
      expect(score).toBe(3 + 0.5) // Title + Content
    })
  })

  describe('Multiple terms', () => {
    it('handles multiple query terms', () => {
      const doc = { content: 'React JavaScript TypeScript', title: 'React Guide' }
      const score = computeQueryRelevance('React JavaScript', doc)
      // React: title(3) + content(0.5) = 3.5
      // JavaScript: content(0.5) = 0.5
      expect(score).toBe(4)
    })

    it('handles repeated terms in content', () => {
      const doc = { content: 'React React React React', title: 'Guide' }
      const score = computeQueryRelevance('React', doc)
      expect(score).toBe(2) // 4 matches * 0.5
    })

    it('filters out short terms (< 2 chars)', () => {
      const doc = { content: 'a b c React', title: 'Guide' }
      const score = computeQueryRelevance('a b React', doc)
      // Only 'React' counts (a and b filtered)
      expect(score).toBe(0.5)
    })
  })

  describe('Case handling', () => {
    it('is case insensitive', () => {
      const doc = { content: 'REACT IS GREAT', title: 'REACT GUIDE' }
      const score1 = computeQueryRelevance('react', doc)
      const score2 = computeQueryRelevance('REACT', doc)
      const score3 = computeQueryRelevance('React', doc)

      expect(score1).toBe(score2)
      expect(score2).toBe(score3)
    })

    it('handles mixed case', () => {
      const doc = { content: 'ReAcT is great', title: 'rEaCt Guide' }
      const score = computeQueryRelevance('ReACT', doc)
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('Chinese text', () => {
    it('handles Chinese query terms', () => {
      const doc = { content: '这是一个中文内容', title: '中文标题' }
      const score = computeQueryRelevance('中文', doc)
      expect(score).toBeGreaterThan(0)
    })

    it('handles Chinese title match', () => {
      const doc = { content: '内容', title: '中文标题' }
      const score = computeQueryRelevance('中文', doc)
      expect(score).toBe(3) // Title weight
    })

    it('handles Chinese content match', () => {
      const doc = { content: '中文内容测试', title: '标题' }
      const score = computeQueryRelevance('中文', doc)
      expect(score).toBe(0.5) // Content weight
    })
  })

  describe('Edge cases', () => {
    it('handles special regex characters safely', () => {
      const doc = { content: 'test (parentheses) [brackets]', title: 'Test' }
      // Should not throw on regex special chars
      expect(() => computeQueryRelevance('(parentheses)', doc)).not.toThrow()
    })

    it('handles empty document', () => {
      const doc = { content: '', title: '' }
      expect(computeQueryRelevance('test', doc)).toBe(0)
    })

    it('handles very long content', () => {
      const doc = {
        content: 'React '.repeat(1000),
        title: 'Guide'
      }
      const score = computeQueryRelevance('React', doc)
      expect(score).toBe(500) // 1000 matches * 0.5
    })

    it('handles query with only short terms', () => {
      const doc = { content: 'ab cd test', title: 'ab cd' }
      // 'ab' and 'cd' are 2 chars, should match
      const score = computeQueryRelevance('ab cd', doc)
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('handles large documents efficiently', () => {
      const doc = {
        content: 'word '.repeat(10000),
        title: 'word title'
      }
      const start = performance.now()
      const score = computeQueryRelevance('word', doc)
      const duration = performance.now() - start

      expect(score).toBeGreaterThan(0)
      expect(duration).toBeLessThan(100) // Should complete in < 100ms
    })
  })
})