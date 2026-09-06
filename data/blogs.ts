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
    name: '苏畅',
    avatar: '/images/avatar.svg',
    bio: 'AI 应用开发者，专注 LLM Agent 与自动化工具的全栈实现。',
  },
};

// Blog posts data
export const blogs: BlogPost[] = [
  {
    id: 'from-3d-lab-to-light-rays',
    slug: 'from-3d-lab-to-light-rays',
    title: '从 3D 实验室到 Light Rays：我的个人网站架构演进与 WebGL 踩坑',
    excerpt: '设计文档里的"虚拟 AI 实验室"上线时只剩一道光线。AnimatePresence 偷走 WebGL context、next-themes 撞上 React 19、1300 行死代码——三次踩坑后的减法复盘。',
    contentFile: 'content/blog/from-3d-lab-to-light-rays.mdx',
    tags: ['Next.js', 'WebGL', '性能优化', '架构演进'],
    category: 'project-experience',
    author: authors.default,
    createdAt: '2026-09-06',
    readTime: 10,
    coverImage: '/images/blogs/light-rays.svg',
    featured: true,
  },
  {
    id: 'deleting-40-fake-tests',
    slug: 'deleting-40-fake-tests',
    title: '我删了 40 个能通过的测试：一次测试治理复盘',
    excerpt: '243 个测试全绿，其中 40 个测的是"测试文件自己"。发现、删除、重写、补洞的四步治理，以及"测试数量下降 17%"为什么反而是好事。',
    contentFile: 'content/blog/deleting-40-fake-tests.mdx',
    tags: ['测试', 'Vitest', '工程实践', '技术债务'],
    category: 'tech-insights',
    author: authors.default,
    createdAt: '2026-09-06',
    readTime: 9,
    coverImage: '/images/blogs/fake-tests.svg',
    featured: true,
  },
  {
    id: 'rag-on-serverless-json',
    slug: 'rag-on-serverless-json',
    title: 'Serverless 上跑 RAG：为什么我用 12.8MB 的 JSON 而不是向量数据库',
    excerpt: '563 个片段、三个 JSON 文件、运行时零模型。从约束清单到升级触发条件，小规模 RAG 在 Serverless 环境下的完整选型分析。',
    contentFile: 'content/blog/rag-on-serverless-json.mdx',
    tags: ['RAG', 'Serverless', '架构设计', '向量检索'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-09-06',
    readTime: 9,
    coverImage: '/images/blogs/rag-serverless.svg',
    featured: false,
  },
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
    excerpt: '记录 Mini Claude Code 的完整开发过程，从需求分析到架构设计，再到 1677 个测试用例的完整覆盖。',
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
  {
    id: 'rag-hybrid-search',
    slug: 'rag-hybrid-search-implementation',
    title: 'RAG 混合搜索实战：关键词 + 向量 + RRF 融合',
    excerpt: '在个人网站 Nova AI 助手中实现了一套混合搜索系统，关键词保底、语义补充，纯 TypeScript 实现无需外部依赖。',
    contentFile: 'content/blog/rag-hybrid-search-implementation.mdx',
    tags: ['RAG', '混合搜索', 'RRF', 'TypeScript'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-05-20',
    readTime: 8,
    coverImage: '/images/blogs/hybrid-search.svg',
    featured: true,
  },
  {
    id: 'windows-ci-pitfalls',
    slug: 'windows-ci-pitfalls',
    title: 'Windows CI 踩坑实录：从 8.3 路径到编码问题',
    excerpt: 'Mini Claude Code 项目花了三天解决 Windows CI 问题：8.3 短路径、PowerShell 多行命令、编码、Pydantic Mock...',
    contentFile: 'content/blog/windows-ci-pitfalls.mdx',
    tags: ['CI/CD', 'Windows', 'GitHub Actions', '踩坑'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-05-15',
    readTime: 6,
    coverImage: '/images/blogs/windows-ci.svg',
    featured: false,
  },
  {
    id: 'claude-code-compression',
    slug: 'claude-code-vs-mini-claude-compression',
    title: 'Claude Code vs Mini Claude：上下文压缩机制对比',
    excerpt: '研究 Claude Code changelog 后发现它使用 LLM 智能压缩，有 Circuit Breaker、图片剥离、Prompt Cache 等保护机制。',
    contentFile: 'content/blog/claude-code-vs-mini-claude-compression.mdx',
    tags: ['Claude Code', '上下文压缩', 'LLM', '机制分析'],
    category: 'tech-insights',
    author: authors.default,
    createdAt: '2026-05-10',
    readTime: 7,
    coverImage: '/images/blogs/compression.svg',
    featured: true,
  },
  {
    id: 'mini-claude-testing',
    slug: 'mini-claude-testing-journey',
    title: '从零到 1733 测试：Mini Claude Code 的测试之路',
    excerpt: 'Mini Claude Code 现有 1733 个测试用例。这些测试不是一次性写的，而是随功能迭代积累。',
    contentFile: 'content/blog/mini-claude-testing-journey.mdx',
    tags: ['测试', '单元测试', '集成测试', 'CI'],
    category: 'project-experience',
    author: authors.default,
    createdAt: '2026-05-13',
    readTime: 9,
    coverImage: '/images/blogs/testing.svg',
    featured: false,
  },
  {
    id: 'agenthub-platform',
    slug: 'agenthub-multi-agent-collaboration',
    title: 'AgentHub：从零构建 IM 式多 Agent 协作平台',
    excerpt: '参加 AI 全栈挑战赛，构建类似飞书/微信的多 Agent 协作平台。Orchestrator 三层 Prompt + 拓扑排序 + SSE 流式。',
    contentFile: 'content/blog/agenthub-multi-agent-collaboration.mdx',
    tags: ['AgentHub', '多Agent', 'Orchestrator', 'AI挑战赛'],
    category: 'project-experience',
    author: authors.default,
    createdAt: '2026-05-21',
    readTime: 10,
    coverImage: '/images/blogs/agenthub.svg',
    featured: true,
  },
  {
    id: 'sse-streaming',
    slug: 'sse-streaming-for-ai-apps',
    title: 'SSE 流式输出：让 AI 响应"活"起来',
    excerpt: '在 AgentHub 中使用 Server-Sent Events 实现实时流式输出。相比 WebSocket，SSE 更简单，更适合单向推送场景。',
    contentFile: 'content/blog/sse-streaming-for-ai-apps.mdx',
    tags: ['SSE', '流式输出', 'Next.js', '前端'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-05-22',
    readTime: 6,
    coverImage: '/images/blogs/streaming.svg',
    featured: false,
  },
  {
    id: 'agenthub-contract-v1',
    slug: 'agenthub-contract-v1',
    title: 'AgentHub Contract v1：给多 Agent 协作上一把安全锁',
    excerpt: '多 Agent 协作引入"契约"机制：Prompt 注入防御、文件边界控制、输出 Schema 校验、影子 Git 追踪变更。两波代码审查修了 48 个安全问题。',
    contentFile: 'content/blog/agenthub-contract-v1.mdx',
    tags: ['AgentHub', '安全', '多Agent', '架构设计'],
    category: 'project-experience',
    author: authors.default,
    createdAt: '2026-06-26',
    readTime: 12,
    coverImage: '/images/blogs/contract-v1.svg',
    featured: true,
  },
  {
    id: 'multi-round-code-review',
    slug: 'multi-round-code-review',
    title: '三轮代码审查实战：从"能跑"到"能扛"',
    excerpt: 'Mini Claude 和 AgentHub 两个项目一周内经历 5 轮审查，修了 56 个问题。单次 review 只能发现表面问题，多轮 review + 不同视角才能挖出深层 bug。',
    contentFile: 'content/blog/multi-round-code-review.mdx',
    tags: ['代码审查', '安全', '工程实践', '最佳实践'],
    category: 'tech-insights',
    author: authors.default,
    createdAt: '2026-06-26',
    readTime: 10,
    coverImage: '/images/blogs/code-review.svg',
    featured: true,
  },
  {
    id: 'agent-fault-tolerance',
    slug: 'agent-fault-tolerance',
    title: 'Agent 容错设计：ToolDegradation + SQLite 持久化',
    excerpt: '工具调用失败就崩溃、进程重启就丢状态——从"能用"到"可靠"的两步：优雅降级策略和 SQLite 会话持久化。',
    contentFile: 'content/blog/agent-fault-tolerance.mdx',
    tags: ['LangGraph', '容错', '持久化', 'AI Agent'],
    category: 'technical-tutorial',
    author: authors.default,
    createdAt: '2026-06-26',
    readTime: 8,
    coverImage: '/images/blogs/fault-tolerance.svg',
    featured: false,
  },
  {
    id: 'python-format-brace-dos',
    slug: 'python-format-string-brace-dos',
    title: 'str.format() 的隐藏陷阱：用户输入一个花括号，我的服务崩了',
    excerpt: '用户在对话框敲一个 {，LLM 服务直接 500。str.format() 把填充值二次解析为占位符，导致 KeyError 崩溃甚至属性链信息泄露。转义、string.Template、测试覆盖的完整修复路径。',
    contentFile: 'content/blog/python-format-string-brace-dos.mdx',
    tags: ['Python', '安全', 'str.format', '正则表达式'],
    category: 'tech-insights',
    author: authors.default,
    createdAt: '2026-07-01',
    readTime: 7,
    coverImage: '/images/blogs/brace-dos.svg',
    featured: true,
  },
  {
    id: 'llm-app-security-hardening',
    slug: 'llm-app-security-hardening',
    title: 'LLM 应用上线前的安全清单：提示词注入、API 耗尽、SSE 崩溃与 XSS',
    excerpt: '三个项目一周修了 30+ 个安全问题，高度集中在 7 类漏洞：提示词注入、错误信息泄露、健康检查烧额度、SSE 静默断连、XSS、分页遍历、重构回归。按漏洞类型整理的实战清单。',
    contentFile: 'content/blog/llm-app-security-hardening.mdx',
    tags: ['LLM', '安全', 'XSS', 'SSE', '上线清单'],
    category: 'tech-insights',
    author: authors.default,
    createdAt: '2026-07-01',
    readTime: 9,
    coverImage: '/images/blogs/security-hardening.svg',
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
