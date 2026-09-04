import { NextResponse } from 'next/server';

/**
 * CORS 预检（OPTIONS）公共响应。
 *
 * 原本在 /api/chat 与 /api/rag 两处各写了一份完全相同的 OPTIONS（ISSUE-008），
 * 现统一到这里。
 */
export function corsPreflightResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
