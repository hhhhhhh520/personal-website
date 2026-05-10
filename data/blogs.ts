// Blog CMS Data Layer
// Defines BlogPost interface and provides helper functions for blog content management

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  contentFile?: string;
  tags: string[];
  category: BlogCategory;
  author: Author;
  createdAt: string;
  updatedAt?: string;
  readTime: number; // in minutes
  coverImage: string;
  featured: boolean;
}

export type BlogCategory =
  | 'ai-development'
  | 'project-experience'
  | 'technical-tutorial'
  | 'career-growth'
  | 'tech-insights';

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
}

// Pre-defined authors
const authors: Record<string, Author> = {
  default: {
    name: 'AI Developer',
    avatar: '/images/avatar.svg',
    bio: 'AI application developer focused on LLM agents and automation tools.',
  },
};

// Blog posts data
export const blogs: BlogPost[] = [
  {
    id: 'langgraph-state-machine',
    slug: 'langgraph-state-machine-best-practices',
    title: 'LangGraph 状态机最佳实践：从混乱到优雅',
    excerpt: '深入探讨 LangGraph 状态机设计模式，分享在实际项目中如何构建可维护、可扩展的 AI Agent 架构。从状态设计到错误恢复，一文掌握核心要点。',
    contentFile: 'content/blog/langgraph-state-machine-best-practices.mdx',
    tags: ['LangGraph', '状态机', 'AI Agent', '架构设计'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-04-30',
    updatedAt: '2026-05-01',
    readTime: 8,
    coverImage: '/images/blogs/langgraph-state.svg',
    featured: true,
  },
  {
    id: 'multi-agent-concurrency',
    slug: 'multi-agent-concurrency-patterns',
    title: '多 Agent 并发实战：让 AI 团队高效协作',
    excerpt: '探索多 Agent 系统中的并发模式，从 asyncio 信号量到任务编排，解决真实场景下的并行执行挑战。',
    contentFile: 'content/blog/multi-agent-concurrency-patterns.mdx',
    tags: ['并发编程', 'asyncio', 'Multi-Agent', 'Python'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-04-25',
    readTime: 10,
    coverImage: '/images/blogs/multi-agent.svg',
    featured: true,
  },
  {
    id: 'building-mini-claude',
    slug: 'building-mini-claude-code-from-scratch',
    title: '从零构建 Mini Claude Code：一个 AI 编程助手的诞生',
    excerpt: '记录 Mini Claude Code 的完整开发过程，从需求分析到架构设计，再到 1497 个测试用例的完整覆盖。',
    contentFile: 'content/blog/building-mini-claude-code-from-scratch.mdx',
    tags: ['项目复盘', 'Claude CLI', 'LangGraph', '开源项目'],
    category: 'project-experience',
    author: authors.default,
    createdAt: '2026-04-20',
    readTime: 12,
    coverImage: '/images/blogs/mini-claude.svg',
    featured: true,
  },
  {
    id: 'rag-camping-assistant',
    slug: 'rag-powered-campus-assistant',
    title: 'RAG 技术实战：构建校园智能问答系统',
    excerpt: '使用 RAG 技术构建校园问答助手，从向量数据库选型到检索策略优化，分享完整的技术决策过程。',
    contentFile: 'content/blog/rag-powered-campus-assistant.mdx',
    tags: ['RAG', '向量数据库', 'Embedding', '校园问答'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-04-15',
    readTime: 9,
    coverImage: '/images/blogs/rag-system.svg',
    featured: false,
  },
  {
    id: 'ai-job-hunting-2026',
    slug: 'ai-application-engineer-job-hunting-guide-2026',
    title: '2026 AI 应用岗求职指南：从准备到 Offer',
    excerpt: '作为双非智能科学与技术专业的学生，如何在 2026 年秋招中拿到 AI 应用开发的 Offer？分享我的准备策略和面试经验。',
    contentFile: 'content/blog/ai-application-engineer-job-hunting-guide-2026.mdx',
    tags: ['求职', 'AI 应用岗', '秋招', '职业发展'],
    category: 'career-growth',
    author: authors.default,
    createdAt: '2026-04-10',
    readTime: 7,
    coverImage: '/images/blogs/job-hunting.svg',
    featured: false,
  },
  {
    id: 'tool-calling-design',
    slug: 'llm-tool-calling-design-patterns',
    title: 'LLM 工具调用设计模式：让 AI 真正"动手"',
    excerpt: '深入分析 LLM 工具调用的设计模式，从 Function Calling 到 ReAct，探讨如何让 AI Agent 有效地使用工具解决问题。',
    contentFile: 'content/blog/llm-tool-calling-design-patterns.mdx',
    tags: ['LLM', '工具调用', 'Agent', '设计模式'],
    category: 'tech-insights',
    author: authors.default,
    createdAt: '2026-04-05',
    readTime: 11,
    coverImage: '/images/blogs/tool-calling.svg',
    featured: false,
  },
];

// ============ Helper Functions ============

/**
 * Get a blog post by its slug
 */
export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

/**
 * Get a blog post by its ID
 */
export function getBlogById(id: string): BlogPost | undefined {
  return blogs.find((blog) => blog.id === id);
}

/**
 * Get all blog posts with a specific tag
 */
export function getBlogsByTag(tag: string): BlogPost[] {
  return blogs.filter((blog) =>
    blog.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all blog posts in a specific category
 */
export function getBlogsByCategory(category: BlogCategory): BlogPost[] {
  return blogs.filter((blog) => blog.category === category);
}

/**
 * Get all featured blog posts
 */
export function getFeaturedBlogs(): BlogPost[] {
  return blogs.filter((blog) => blog.featured);
}

/**
 * Get recent blog posts (sorted by createdAt, newest first)
 */
export function getRecentBlogs(limit: number = 5): BlogPost[] {
  return [...blogs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

/**
 * Get all unique tags from all blog posts
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Get all blog categories
 */
export function getAllCategories(): BlogCategory[] {
  const categorySet = new Set<BlogCategory>();
  blogs.forEach((blog) => categorySet.add(blog.category));
  return Array.from(categorySet);
}

/**
 * Search blog posts by title, excerpt, or content
 */
export function searchBlogs(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(lowerQuery) ||
      blog.excerpt.toLowerCase().includes(lowerQuery) ||
      (blog.content && blog.content.toLowerCase().includes(lowerQuery)) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get related blog posts based on tags and category
 */
export function getRelatedBlogs(
  currentBlogId: string,
  limit: number = 3
): BlogPost[] {
  const currentBlog = getBlogById(currentBlogId);
  if (!currentBlog) return [];

  return blogs
    .filter((blog) => blog.id !== currentBlogId)
    .map((blog) => {
      let score = 0;
      // Same category gets higher score
      if (blog.category === currentBlog.category) score += 3;
      // Shared tags
      const sharedTags = blog.tags.filter((tag) =>
        currentBlog.tags.includes(tag)
      );
      score += sharedTags.length * 2;
      return { blog, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.blog);
}

/**
 * Get blog posts count
 */
export function getBlogCount(): number {
  return blogs.length;
}

/**
 * Get blog posts count by category
 */
export function getBlogCountByCategory(category: BlogCategory): number {
  return blogs.filter((blog) => blog.category === category).length;
}
