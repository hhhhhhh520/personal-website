// JSON-LD 安全序列化测试
// 背景：JSON-LD 经 dangerouslySetInnerHTML 注入 <script type="application/ld+json">，
// JSON.stringify 不转义 < > /，数据里出现 </script> 可逃出 script 元素造成存储型 XSS。
// 回归自 29408ec（projects 页）；2026-09-08 抽公共 lib 并补齐 blog 页。

import { describe, it, expect } from 'vitest';
import { jsonLdSafeStringify } from '@/lib/jsonld';

describe('jsonLdSafeStringify', () => {
  it('输出中不含裸 < —— </script> 无法逃出 script 元素', () => {
    const malicious = {
      name: '</script><script>alert(1)</script>',
    };

    const output = jsonLdSafeStringify(malicious);

    expect(output).not.toContain('<');
  });

  it('转义 < > / 为 \\u003c \\u003e \\u002f', () => {
    const output = jsonLdSafeStringify({ a: '<>', b: '/' });

    expect(output).toContain('\\u003c');
    expect(output).toContain('\\u003e');
    expect(output).toContain('\\u002f');
  });

  it('输出是合法 JSON 且数据无损（round-trip）', () => {
    const data = {
      name: '苏畅',
      description: '含 </script> 与 <b> 标签的描述',
      url: 'https://suchang.dev/zh/projects/agenthub',
      nested: { tags: ['<img src=x onerror=alert(1)>'] },
    };

    const output = jsonLdSafeStringify(data);

    expect(JSON.parse(output)).toEqual(data);
  });

  it('不含 < > / 的普通内容与 JSON.stringify 输出一致', () => {
    const data = { name: 'AgentHub', stars: 1050, ok: true, nil: null };

    expect(jsonLdSafeStringify(data)).toBe(JSON.stringify(data));
  });
});
