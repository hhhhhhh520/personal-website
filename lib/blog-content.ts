import fs from 'fs';
import path from 'path';
import { blogs, type BlogPost } from '@/data/blogs';

/**
 * 读取博客 MDX 内容（仅服务端使用）
 */
export function getBlogContent(blog: BlogPost): string {
  // 如果 content 字段已有值（旧数据），直接返回
  if (blog.content) {
    return blog.content;
  }

  // 从 MDX 文件读取
  if (blog.contentFile) {
    const filePath = path.join(process.cwd(), blog.contentFile);
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to read blog content file: ${filePath}`, error);
      return '';
    }
  }

  return '';
}

/**
 * 根据 slug 获取博客及其内容（服务端专用）
 */
export function getBlogWithContent(slug: string): (BlogPost & { fullContent: string }) | undefined {
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) return undefined;

  return {
    ...blog,
    fullContent: getBlogContent(blog),
  };
}
