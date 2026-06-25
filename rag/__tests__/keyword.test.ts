import { describe, it, expect } from 'vitest'
import { keywordSearch, tokenizeChinese, computeTermScore, escapeRegExp } from '../utils/keywordSearch'

describe('Keyword Search Module', () => {
  describe('tokenizeChinese', () => {
    it('returns empty array for empty query', () => {
      expect(tokenizeChinese('')).toEqual([])
    })

    it('returns empty array for whitespace query', () => {
      expect(tokenizeChinese('   ')).toEqual([])
    })

    it('filters out single character terms by default', () => {
      const terms = tokenizeChinese('a b React')
      expect(terms).not.toContain('a')
      expect(terms).not.toContain('b')
      expect(terms).toContain('react') // tokenizeChinese converts to lowercase
    })

    it('handles Chinese text with n-gram tokenization', () => {
      const terms = tokenizeChinese('中文测试')
      // Short sequences (<=4 chars) are returned directly
      expect(terms).toContain('中文测试')
    })

    it('handles short Chinese sequences directly', () => {
      const terms = tokenizeChinese('中文')
      expect(terms).toContain('中文')
    })

    it('handles mixed Chinese and English', () => {
      const terms = tokenizeChinese('React框架')
      expect(terms).toContain('react') // tokenizeChinese converts to lowercase
      expect(terms).toContain('框架')
    })

    it('deduplicates terms', () => {
      const terms = tokenizeChinese('React React React')
      const reactCount = terms.filter(t => t === 'react').length
      expect(reactCount).toBe(1)
    })
  })

  describe('escapeRegExp', () => {
    it('escapes special regex characters', () => {
      expect(escapeRegExp('(test)')).toBe('\\(test\\)')
      expect(escapeRegExp('[test]')).toBe('\\[test\\]')
      expect(escapeRegExp('test.*')).toBe('test\\.\\*')
    })

    it('handles strings without special characters', () => {
      expect(escapeRegExp('hello')).toBe('hello')
    })
  })

  describe('computeTermScore', () => {
    it('returns 0 for no matches', () => {
      const score = computeTermScore('xyz', 'hello world', 'title')
      expect(score).toBe(0)
    })

    it('gives higher weight to title matches', () => {
      const titleScore = computeTermScore('test', 'content', 'test title')
      const contentScore = computeTermScore('test', 'test content', 'title')
      expect(titleScore).toBeGreaterThan(contentScore)
    })

    it('uses saturation function for content matches', () => {
      // 10 matches with saturation: 10 / (1 + 10 * 0.1) = 5
      const score = computeTermScore('test', 'test '.repeat(10), 'title')
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('keywordSearch', () => {
    const documents = [
      { id: '1', content: 'React is a JavaScript library for building user interfaces', title: 'React Guide' },
      { id: '2', content: 'Vue.js is a progressive framework', title: 'Vue Guide' },
      { id: '3', content: 'React Native enables mobile development', title: 'React Native' },
    ]

    it('returns empty array for empty query', () => {
      const results = keywordSearch('', documents)
      expect(results).toEqual([])
    })

    it('returns results sorted by score descending', () => {
      const results = keywordSearch('React', documents)
      expect(results.length).toBeGreaterThan(0)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score)
      }
    })

    it('returns results with correct structure', () => {
      const results = keywordSearch('React', documents)
      expect(results[0]).toHaveProperty('docId')
      expect(results[0]).toHaveProperty('score')
      expect(typeof results[0].score).toBe('number')
    })

    it('finds documents matching the query', () => {
      const results = keywordSearch('React', documents)
      const docIds = results.map(r => r.docId)
      expect(docIds).toContain('1')
      expect(docIds).toContain('3')
    })

    it('respects maxResults config', () => {
      const results = keywordSearch('React', documents, { maxResults: 1, minTermLength: 2, titleWeight: 3, contentWeight: 0.5 })
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('handles Chinese queries', () => {
      const chineseDocs = [
        { id: '1', content: '这是一个中文文档', title: '中文标题' },
        { id: '2', content: 'English document', title: 'English' },
      ]
      const results = keywordSearch('中文', chineseDocs)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].docId).toBe('1')
    })
  })
})
