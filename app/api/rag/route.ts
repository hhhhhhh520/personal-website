import { NextRequest, NextResponse } from 'next/server';

import type { SearchResult } from '../../../rag/types/index';
import { validateRequest } from '../../../rag/utils/validation';
import { QueryCache } from '../../../rag/utils/cache';
import { loadIndex, isIndexReady, getIndexLoadError, hybridSearch } from '../../../rag/utils/ragIndex';
import { corsPreflightResponse } from '../../../lib/cors';

interface RAGResponse {
  results: SearchResult[];
  query: string;
  duration: number;
}

// ============================================================================
// Cache (uses QueryCache from rag/utils/cache)
// ============================================================================

const queryCache = new QueryCache();

// Load index on module initialization
loadIndex();

// ============================================================================
// API Handler
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<RAGResponse | { error: string }>> {
  const startTime = Date.now();

  try {
    if (getIndexLoadError()) {
      return NextResponse.json(
        { error: `Index not available: ${getIndexLoadError()}` },
        { status: 503 }
      );
    }

    if (!isIndexReady()) {
      return NextResponse.json(
        { error: 'Index not loaded' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const { query, topK } = validation.data;

    const cacheKey = queryCache.getCacheKey(query, topK);
    const cachedResults = queryCache.get(cacheKey);

    if (cachedResults) {
      const duration = Date.now() - startTime;
      return NextResponse.json({ results: cachedResults, query, duration });
    }

    const results = hybridSearch(query, topK);
    queryCache.set(cacheKey, results);

    const duration = Date.now() - startTime;
    return NextResponse.json({ results, query, duration });
  } catch (error) {
    console.error('[RAG API] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return corsPreflightResponse();
}
