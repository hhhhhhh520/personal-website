import { describe, it, expect } from 'vitest';
import { buildRAGContext } from '../utils/ragContext';
import type { SearchResult } from '../types/index';

/**
 * Chat-RAG integration tests against the REAL buildRAGContext
 * (extracted to rag/utils/ragContext.ts, used by app/api/chat/route.ts).
 * Formerly a self-contained stub (ISSUE-001).
 */
describe('Chat-RAG Integration (real buildRAGContext)', () => {
  const projectResult: SearchResult = {
    content: 'AgentHub 是 IM 风格的多 Agent 协作平台',
    score: 0.9,
    source: 'project',
    sourceId: 'agenthub',
    title: 'AgentHub',
  };
  const blogResult: SearchResult = {
    content: 'RRF 融合关键词与向量检索',
    score: 0.8,
    source: 'blog',
    sourceId: 'rag-hybrid-search',
    title: 'RAG 混合检索实战',
  };

  it('returns empty string for no results (caller skips injection)', () => {
    expect(buildRAGContext([])).toBe('');
  });

  it('labels project source as 项目', () => {
    const ctx = buildRAGContext([projectResult]);
    expect(ctx).toContain('[项目: AgentHub]');
    expect(ctx).toContain('AgentHub 是 IM 风格的多 Agent 协作平台');
  });

  it('labels blog source as 博客', () => {
    const ctx = buildRAGContext([blogResult]);
    expect(ctx).toContain('[博客: RAG 混合检索实战]');
  });

  it('labels other sources as 资料', () => {
    const other: SearchResult = {
      content: '个人简介内容',
      score: 0.7,
      source: 'personal',
      sourceId: 'me',
      title: '关于我',
    };
    expect(buildRAGContext([other])).toContain('[资料: 关于我]');
  });

  it('includes the 相关资料 section header and guidance', () => {
    const ctx = buildRAGContext([projectResult]);
    expect(ctx).toContain('## 相关资料');
    expect(ctx).toContain('重要提示');
  });

  it('joins multiple results into one context block', () => {
    const ctx = buildRAGContext([projectResult, blogResult]);
    expect(ctx).toContain('[项目: AgentHub]');
    expect(ctx).toContain('[博客: RAG 混合检索实战]');
  });
});
