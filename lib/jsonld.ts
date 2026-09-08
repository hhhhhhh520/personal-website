/**
 * JSON-LD 安全序列化。
 * JSON.stringify 只转义 " 和 \，不转义 < / 等；若数据里出现 </script>
 * 会逃出 script 元素造成存储型 XSS。按 HTML 内嵌 JSON 惯例做字符转义。
 * 供所有 dangerouslySetInnerHTML 注入 ld+json 的页面统一使用。
 */
export function jsonLdSafeStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f");
}
