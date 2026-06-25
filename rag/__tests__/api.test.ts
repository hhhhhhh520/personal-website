import { describe, it, expect } from 'vitest'
import { validateRequest, createResponse } from '../utils/validation'

describe('RAG API Validation', () => {
  describe('Query validation', () => {
    it('accepts valid query', () => {
      const result = validateRequest({ query: 'React Tutorial' })
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.query).toBe('React Tutorial')
      }
    })

    it('rejects missing query', () => {
      const result = validateRequest({})
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
        expect(result.error).toContain('Query is required')
      }
    })

    it('rejects empty query', () => {
      const result = validateRequest({ query: '' })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
        // Empty string is caught by !query check
        expect(result.error).toContain('Query')
      }
    })

    it('rejects whitespace-only query', () => {
      const result = validateRequest({ query: '   ' })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('rejects non-string query', () => {
      const result = validateRequest({ query: 123 })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('trims query whitespace', () => {
      const result = validateRequest({ query: '  React  ' })
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.query).toBe('React')
      }
    })
  })

  describe('topK validation', () => {
    it('uses default topK of 3', () => {
      const result = validateRequest({ query: 'test' })
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.topK).toBe(3)
      }
    })

    it('accepts valid topK', () => {
      const result = validateRequest({ query: 'test', topK: 5 })
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.topK).toBe(5)
      }
    })

    it('rejects topK < 1', () => {
      const result = validateRequest({ query: 'test', topK: 0 })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('rejects topK > 10', () => {
      const result = validateRequest({ query: 'test', topK: 11 })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('rejects non-integer topK', () => {
      const result = validateRequest({ query: 'test', topK: 3.5 })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('rejects non-number topK', () => {
      const result = validateRequest({ query: 'test', topK: '5' })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })
  })

  describe('Request body validation', () => {
    it('rejects null body', () => {
      const result = validateRequest(null)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('rejects undefined body', () => {
      const result = validateRequest(undefined)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })

    it('rejects non-object body', () => {
      const result = validateRequest('string')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.status).toBe(400)
      }
    })
  })
})

describe('RAG API Response Format', () => {
  it('creates valid response structure', () => {
    const mockResults = [
      { content: 'Test content', score: 0.9, source: 'project', sourceId: 'p1', title: 'Test' },
    ]
    const response = createResponse(mockResults, 'test query', 50)

    expect(response).toHaveProperty('results')
    expect(response).toHaveProperty('query')
    expect(response).toHaveProperty('duration')
    expect(Array.isArray(response.results)).toBe(true)
    expect(typeof response.query).toBe('string')
    expect(typeof response.duration).toBe('number')
  })

  it('includes all required fields in results', () => {
    const mockResults = [
      { content: 'Test', score: 0.9, source: 'test', sourceId: '1', title: 'Title' },
    ]
    const response = createResponse(mockResults, 'test', 10)

    const result = response.results[0]
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('source')
    expect(result).toHaveProperty('sourceId')
    expect(result).toHaveProperty('title')
  })

  it('score is a valid number', () => {
    const mockResults = [
      { content: 'Test', score: 0.123, source: 'test', sourceId: '1', title: 'Title' },
    ]
    const response = createResponse(mockResults, 'test', 10)

    const score = response.results[0].score
    expect(typeof score).toBe('number')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})
