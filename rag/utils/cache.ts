/**
 * 缓存模块
 *
 * 提供查询结果缓存功能，
 * 用于提高 RAG API 的响应速度。
 *
 * @module rag/utils/cache
 */

import type { SearchResult } from '../types/index';

/**
 * 缓存条目接口
 */
export interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

/**
 * 默认缓存 TTL（5分钟）
 */
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * 查询缓存类
 *
 * 使用内存 Map 存储查询结果，支持 TTL 过期。
 */
export class QueryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number;

  /**
   * 创建查询缓存实例
   *
   * @param ttl 缓存 TTL（毫秒），默认 5 分钟
   */
  constructor(ttl: number = DEFAULT_CACHE_TTL) {
    this.ttl = ttl;
  }

  /**
   * 生成缓存键
   *
   * @param query 查询字符串
   * @param topK 返回结果数量
   * @returns 缓存键
   */
  getCacheKey(query: string, topK: number): string {
    return `${query.toLowerCase().trim()}::${topK}`;
  }

  /**
   * 获取缓存结果
   *
   * @param key 缓存键
   * @returns 缓存的结果，如果不存在或已过期则返回 null
   */
  get(key: string): SearchResult[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.results;
  }

  /**
   * 设置缓存结果
   *
   * @param key 缓存键
   * @param results 搜索结果
   */
  set(key: string, results: SearchResult[]): void {
    this.cache.set(key, {
      results,
      timestamp: Date.now(),
    });
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   *
   * @returns 缓存条目数量
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * 全局查询缓存实例
 */
export const globalQueryCache = new QueryCache();
