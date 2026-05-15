import { describe, it, expect } from 'vitest'

// Incremental update logic for testing
interface DocumentHash {
  id: string
  hash: string
}

function computeContentHash(content: string): string {
  // Simple hash function for testing
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

function computeDocumentHash(doc: { id: string; content: string }): DocumentHash {
  return {
    id: doc.id,
    hash: computeContentHash(doc.content),
  }
}

function checkNeedsUpdate(
  currentHashes: Map<string, string>,
  newHashes: DocumentHash[]
): { needsUpdate: boolean; added: string[]; removed: string[]; modified: string[] } {
  const added: string[] = []
  const removed: string[] = []
  const modified: string[] = []

  // Check for new and modified
  for (const newHash of newHashes) {
    const existingHash = currentHashes.get(newHash.id)
    if (!existingHash) {
      added.push(newHash.id)
    } else if (existingHash !== newHash.hash) {
      modified.push(newHash.id)
    }
  }

  // Check for removed
  const newIds = new Set(newHashes.map(h => h.id))
  for (const id of currentHashes.keys()) {
    if (!newIds.has(id)) {
      removed.push(id)
    }
  }

  return {
    needsUpdate: added.length > 0 || removed.length > 0 || modified.length > 0,
    added,
    removed,
    modified,
  }
}

describe('Incremental Update', () => {
  describe('computeContentHash', () => {
    it('generates consistent hash for same content', () => {
      const hash1 = computeContentHash('test content')
      const hash2 = computeContentHash('test content')
      expect(hash1).toBe(hash2)
    })

    it('generates different hash for different content', () => {
      const hash1 = computeContentHash('test content 1')
      const hash2 = computeContentHash('test content 2')
      expect(hash1).not.toBe(hash2)
    })

    it('handles empty string', () => {
      const hash = computeContentHash('')
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
    })

    it('handles unicode', () => {
      const hash = computeContentHash('中文测试 🚀')
      expect(hash).toBeDefined()
    })

    it('returns 8 character hex string', () => {
      const hash = computeContentHash('test')
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })
  })

  describe('computeDocumentHash', () => {
    it('computes hash for document', () => {
      const doc = { id: 'doc1', content: 'test content' }
      const result = computeDocumentHash(doc)

      expect(result.id).toBe('doc1')
      expect(result.hash).toBeDefined()
    })

    it('different documents have different hashes', () => {
      const doc1 = { id: 'doc1', content: 'content 1' }
      const doc2 = { id: 'doc2', content: 'content 2' }

      const hash1 = computeDocumentHash(doc1)
      const hash2 = computeDocumentHash(doc2)

      expect(hash1.hash).not.toBe(hash2.hash)
    })
  })

  describe('checkNeedsUpdate', () => {
    it('detects no changes', () => {
      const current = new Map([['doc1', 'abc12345']])
      const newHashes = [{ id: 'doc1', hash: 'abc12345' }]

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(false)
      expect(result.added).toHaveLength(0)
      expect(result.removed).toHaveLength(0)
      expect(result.modified).toHaveLength(0)
    })

    it('detects added documents', () => {
      const current = new Map([['doc1', 'abc12345']])
      const newHashes = [
        { id: 'doc1', hash: 'abc12345' },
        { id: 'doc2', hash: 'def67890' },
      ]

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(true)
      expect(result.added).toContain('doc2')
    })

    it('detects removed documents', () => {
      const current = new Map([
        ['doc1', 'abc12345'],
        ['doc2', 'def67890'],
      ])
      const newHashes = [{ id: 'doc1', hash: 'abc12345' }]

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(true)
      expect(result.removed).toContain('doc2')
    })

    it('detects modified documents', () => {
      const current = new Map([['doc1', 'abc12345']])
      const newHashes = [{ id: 'doc1', hash: 'newhash1' }]

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(true)
      expect(result.modified).toContain('doc1')
    })

    it('handles multiple changes', () => {
      const current = new Map([
        ['doc1', 'abc12345'],
        ['doc2', 'def67890'],
      ])
      const newHashes = [
        { id: 'doc1', hash: 'newhash1' }, // modified
        { id: 'doc3', hash: 'ghi11111' }, // added
        // doc2 removed
      ]

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(true)
      expect(result.modified).toContain('doc1')
      expect(result.added).toContain('doc3')
      expect(result.removed).toContain('doc2')
    })

    it('handles empty current state', () => {
      const current = new Map()
      const newHashes = [{ id: 'doc1', hash: 'abc12345' }]

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(true)
      expect(result.added).toContain('doc1')
    })

    it('handles empty new state', () => {
      const current = new Map([['doc1', 'abc12345']])
      const newHashes: DocumentHash[] = []

      const result = checkNeedsUpdate(current, newHashes)

      expect(result.needsUpdate).toBe(true)
      expect(result.removed).toContain('doc1')
    })
  })

  describe('Performance', () => {
    it('handles large number of documents efficiently', () => {
      // Create large current state
      const current = new Map<string, string>()
      for (let i = 0; i < 1000; i++) {
        current.set(`doc${i}`, `hash${i}`)
      }

      // Create new state with some changes
      const newHashes: DocumentHash[] = []
      for (let i = 0; i < 1000; i++) {
        if (i === 500) {
          newHashes.push({ id: `doc${i}`, hash: 'modified' }) // Modified
        } else if (i < 999) {
          newHashes.push({ id: `doc${i}`, hash: `hash${i}` })
        }
        // doc999 removed
      }
      newHashes.push({ id: 'doc1000', hash: 'new' }) // Added

      const start = performance.now()
      const result = checkNeedsUpdate(current, newHashes)
      const duration = performance.now() - start

      expect(result.needsUpdate).toBe(true)
      expect(result.added).toContain('doc1000')
      expect(result.removed).toContain('doc999')
      expect(result.modified).toContain('doc500')
      expect(duration).toBeLessThan(50) // Should be fast
    })
  })
})