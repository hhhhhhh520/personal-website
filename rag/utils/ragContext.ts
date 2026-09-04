/**
 * Chat-RAG 上下文构建
 *
 * 把 RAG 检索结果格式化为注入系统提示词的「相关资料」段落。
 * 从 app/api/chat/route.ts 抽出，便于单独测试。
 *
 * @module rag/utils/ragContext
 */

import type { SearchResult } from '../types/index';

/**
 * 构建 RAG 上下文字符串。无结果时返回空串（调用方据此跳过注入）。
 */
export function buildRAGContext(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const contextSections = results.map((r) => {
    const sourceLabel = r.source === 'project' ? '项目' : r.source === 'blog' ? '博客' : '资料';
    return `[${sourceLabel}: ${r.title}]\n${r.content}`;
  });

  return `
## 相关资料
以下是与用户问题相关的资料，请参考这些内容回答：

${contextSections.join('\n\n')}

**重要提示**：
- 如果资料中有相关信息，请基于资料回答
- 如果资料中没有相关信息，请诚实告知并引导用户查看相关页面`;
}
