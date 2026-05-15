/**
 * Similarity Calculation Utilities
 *
 * This module provides functions for calculating similarity between vectors.
 * Used for ranking RAG search results.
 */

import type { RAGSearchResult, RAGChunk } from '../types/index';

/**
 * Calculate cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Similarity score between -1 and 1 (1 = identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Calculate Euclidean distance between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Distance (0 = identical, higher = more different)
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Convert distance to similarity score (0-1)
 * @param distance Euclidean distance
 * @returns Similarity score (1 = identical, 0 = very different)
 */
export function distanceToSimilarity(distance: number): number {
  return 1 / (1 + distance);
}

/**
 * Sort search results by similarity score (descending)
 * @param results Array of search results
 * @returns Sorted results
 */
export function sortBySimilarity(results: RAGSearchResult[]): RAGSearchResult[] {
  return [...results].sort((a, b) => b.score - a.score);
}

/**
 * Filter results by minimum similarity threshold
 * @param results Array of search results
 * @param minScore Minimum similarity score (0-1)
 * @returns Filtered results
 */
export function filterByMinScore(
  results: RAGSearchResult[],
  minScore: number
): RAGSearchResult[] {
  return results.filter((r) => r.score >= minScore);
}

/**
 * Find top K results from a list
 * @param results Array of search results
 * @param k Number of results to return
 * @returns Top K results
 */
export function getTopK(results: RAGSearchResult[], k: number): RAGSearchResult[] {
  return sortBySimilarity(results).slice(0, k);
}

// Placeholder for future: BM25 text similarity
// export function bm25Similarity(query: string, document: string): number { ... }

// Placeholder for future: Hybrid search combining vector and keyword similarity
// export function hybridSimilarity(vectorScore: number, keywordScore: number, weights: { vector: number; keyword: number }): number { ... }
