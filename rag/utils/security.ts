/**
 * 安全验证模块
 *
 * 提供输入验证和安全检查函数，
 * 用于防止注入攻击和恶意输入。
 *
 * @module rag/utils/security
 */

/**
 * 清理查询字符串，移除潜在的注入模式
 *
 * @param query 原始查询字符串
 * @returns 清理后的查询字符串
 */
export function sanitizeQuery(query: string): string {
  return query
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .replace(/[<>]/g, '') // 移除剩余尖括号
    .trim();
}

/**
 * 验证查询长度
 *
 * @param query 查询字符串
 * @param maxLength 最大长度，默认 500
 * @returns 验证结果
 */
export function validateQueryLength(
  query: string,
  maxLength: number = 500
): { valid: boolean; error?: string } {
  if (query.length > maxLength) {
    return { valid: false, error: `Query exceeds maximum length of ${maxLength} characters` };
  }
  return { valid: true };
}

/**
 * 检测 SQL 注入模式
 *
 * @param query 查询字符串
 * @returns 是否检测到 SQL 注入模式
 */
export function checkSqlInjection(query: string): boolean {
  const sqlPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /('|")\s*(OR|AND)\s*('|")/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(query));
}

/**
 * 检测 XSS 攻击模式
 *
 * @param query 查询字符串
 * @returns 是否检测到 XSS 攻击模式
 */
export function checkXss(query: string): boolean {
  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b/i,
    /<img\b[^>]*onerror/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(query));
}

/**
 * 综合安全验证
 *
 * @param query 查询字符串
 * @returns 验证结果
 */
export function validateQuery(query: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // 1. 清理输入
  const sanitized = sanitizeQuery(query);

  // 2. 长度验证
  const lengthResult = validateQueryLength(sanitized);
  if (!lengthResult.valid) {
    return { valid: false, error: lengthResult.error };
  }

  // 3. SQL 注入检测
  if (checkSqlInjection(sanitized)) {
    return { valid: false, error: 'Query contains potentially dangerous SQL patterns' };
  }

  // 4. XSS 检测
  if (checkXss(sanitized)) {
    return { valid: false, error: 'Query contains potentially dangerous XSS patterns' };
  }

  return { valid: true, sanitized };
}
