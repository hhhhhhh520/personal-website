/**
 * Skill data layer for personal website
 * Defines skill categories, levels, and complete skill data
 */

// Skill category type
export type SkillCategory = 'language' | 'framework' | 'tool' | 'concept';

// Skill proficiency level type
export type SkillLevel = 'expert' | 'proficient' | 'familiar';

// Main Skill interface
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  years: number;
  projects: string[]; // Related project IDs
  icon: string; // Icon name or path
  color: string; // Brand/accent color
  description: string;
}

// Skill data array
export const skills: Skill[] = [
  // ==================== Languages ====================
  {
    id: 'python',
    name: 'Python',
    category: 'language',
    level: 'expert',
    years: 4,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent', 'phone-pick-assistant', 'cv-generator', 'game-agent'],
    icon: 'python',
    color: '#3776AB',
    description: 'Python 核心开发者，精通异步编程、类型注解、性能优化。熟悉 Python 生态系统的最佳实践。',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'language',
    level: 'proficient',
    years: 2,
    projects: ['campus-agent', 'phone-pick-assistant'],
    icon: 'typescript',
    color: '#3178C6',
    description: '熟悉 TypeScript 类型系统，掌握泛型、条件类型、类型推断等高级特性。有 React + TypeScript 开发经验。',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    category: 'language',
    level: 'proficient',
    years: 2,
    projects: [],
    icon: 'kotlin',
    color: '#7F52FF',
    description: '熟悉 Kotlin 语言特性，包括协程、扩展函数、DSL 等。有 Android 开发经验。',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'language',
    level: 'proficient',
    years: 3,
    projects: ['campus-agent', 'phone-pick-assistant'],
    icon: 'javascript',
    color: '#F7DF1E',
    description: '熟悉 ES6+ 特性，掌握异步编程、模块化、函数式编程风格。',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'language',
    level: 'proficient',
    years: 3,
    projects: ['campus-agent', 'phone-pick-assistant'],
    icon: 'database',
    color: '#4479A1',
    description: '熟悉 SQL 查询优化、索引设计、事务处理。有 MySQL、PostgreSQL、SQLite 使用经验。',
  },

  // ==================== Frameworks ====================
  {
    id: 'langchain',
    name: 'LangChain',
    category: 'framework',
    level: 'expert',
    years: 2,
    projects: ['codecraft-agent'],
    icon: 'chain',
    color: '#1C3C3C',
    description: '精通 LangChain 框架，深入理解 Chain、Agent、Memory、Tool 等核心概念。能够构建复杂的多步推理系统。',
  },
  {
    id: 'langgraph',
    name: 'LangGraph',
    category: 'framework',
    level: 'expert',
    years: 1,
    projects: ['mini-claude'],
    icon: 'git-branch',
    color: '#00B4D8',
    description: '精通 LangGraph 状态机架构，能够设计复杂的多 Agent 协作流程。深入理解节点、边、条件路由等概念。',
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'framework',
    level: 'expert',
    years: 2,
    projects: ['codecraft-agent', 'campus-agent', 'phone-pick-assistant', 'cv-generator'],
    icon: 'api',
    color: '#009688',
    description: '精通 FastAPI 框架，熟悉依赖注入、中间件、WebSocket、后台任务等特性。有生产环境部署经验。',
  },
  {
    id: 'react',
    name: 'React',
    category: 'framework',
    level: 'proficient',
    years: 2,
    projects: ['campus-agent', 'phone-pick-assistant'],
    icon: 'react',
    color: '#61DAFB',
    description: '熟悉 React Hooks、状态管理、组件设计模式。有 React + TypeScript 项目开发经验。',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'framework',
    level: 'proficient',
    years: 1,
    projects: [],
    icon: 'nextjs',
    color: '#000000',
    description: '熟悉 Next.js App Router、Server Components、路由处理、数据获取等特性。',
  },
  {
    id: 'litellm',
    name: 'LiteLLM',
    category: 'framework',
    level: 'proficient',
    years: 1,
    projects: ['mini-claude'],
    icon: 'bot',
    color: '#FF6B6B',
    description: '熟悉 LiteLLM 统一 LLM 接口，支持多模型切换、流式输出、成本追踪等功能。',
  },

  // ==================== Tools ====================
  {
    id: 'git',
    name: 'Git',
    category: 'tool',
    level: 'expert',
    years: 4,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent', 'phone-pick-assistant', 'cv-generator', 'game-agent'],
    icon: 'git',
    color: '#F05032',
    description: '精通 Git 版本控制，熟悉分支策略、Rebase、Cherry-pick、子模块等高级操作。',
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'tool',
    level: 'familiar',
    years: 1,
    projects: ['codecraft-agent'],
    icon: 'docker',
    color: '#2496ED',
    description: '了解 Docker 容器化技术，能够编写 Dockerfile 和 docker-compose 配置。',
  },
  {
    id: 'pytest',
    name: 'Pytest',
    category: 'tool',
    level: 'expert',
    years: 3,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent', 'phone-pick-assistant'],
    icon: 'test-tube',
    color: '#0A9EDC',
    description: '精通 Pytest 测试框架，熟悉 fixture、参数化、覆盖率报告、异步测试等特性。',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'tool',
    level: 'expert',
    years: 4,
    projects: [],
    icon: 'vscode',
    color: '#007ACC',
    description: '熟练使用 VS Code 进行开发，熟悉扩展生态、调试配置、快捷键优化等。',
  },
  {
    id: 'chromadb',
    name: 'ChromaDB',
    category: 'tool',
    level: 'proficient',
    years: 1,
    projects: ['campus-agent'],
    icon: 'database',
    color: '#FF6B6B',
    description: '熟悉 ChromaDB 向量数据库，掌握向量存储、相似度检索、元数据过滤等功能。',
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    category: 'tool',
    level: 'proficient',
    years: 3,
    projects: ['phone-pick-assistant'],
    icon: 'database',
    color: '#003B57',
    description: '熟悉 SQLite 数据库，掌握 SQL 查询优化、索引设计、全文检索等特性。',
  },

  // ==================== Concepts ====================
  {
    id: 'rag',
    name: 'RAG',
    category: 'concept',
    level: 'expert',
    years: 2,
    projects: ['campus-agent', 'phone-pick-assistant'],
    icon: 'search',
    color: '#10B981',
    description: '精通 RAG（检索增强生成）技术，熟悉向量检索、文档分块、重排序、多模态 RAG 等前沿技术。',
  },
  {
    id: 'agent',
    name: 'AI Agent',
    category: 'concept',
    level: 'expert',
    years: 2,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent', 'phone-pick-assistant'],
    icon: 'bot',
    color: '#8B5CF6',
    description: '精通 AI Agent 架构设计，深入理解工具调用、规划推理、多 Agent 协作、状态管理等核心概念。',
  },
  {
    id: 'llm-prompt',
    name: 'Prompt Engineering',
    category: 'concept',
    level: 'expert',
    years: 2,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent', 'phone-pick-assistant', 'cv-generator'],
    icon: 'message-square',
    color: '#F59E0B',
    description: '精通 Prompt Engineering，掌握思维链、少样本学习、结构化输出、角色扮演等技术。',
  },
  {
    id: 'async',
    name: 'Async Programming',
    category: 'concept',
    level: 'expert',
    years: 3,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent'],
    icon: 'zap',
    color: '#06B6D4',
    description: '精通 Python asyncio 异步编程，熟悉协程、事件循环、并发控制、异步上下文管理器等概念。',
  },
  {
    id: 'testing',
    name: 'Testing & QA',
    category: 'concept',
    level: 'expert',
    years: 3,
    projects: ['mini-claude', 'codecraft-agent', 'campus-agent', 'phone-pick-assistant'],
    icon: 'check-circle',
    color: '#22C55E',
    description: '测试驱动开发实践者，掌握单元测试、集成测试、E2E 测试、Mock 技术等方法论。',
  },
  {
    id: 'api-design',
    name: 'API Design',
    category: 'concept',
    level: 'proficient',
    years: 2,
    projects: ['codecraft-agent', 'campus-agent', 'phone-pick-assistant', 'cv-generator'],
    icon: 'api',
    color: '#EC4899',
    description: '熟悉 RESTful API 设计原则，了解 GraphQL、WebSocket 等协议。有 OpenAPI 文档编写经验。',
  },
];

// ==================== Helper Functions ====================

/**
 * Get skills filtered by category
 */
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter(skill => skill.category === category);
}

/**
 * Get skills filtered by level
 */
export function getSkillsByLevel(level: SkillLevel): Skill[] {
  return skills.filter(skill => skill.level === level);
}

/**
 * Get expert-level skills
 */
export function getExpertSkills(): Skill[] {
  return skills.filter(skill => skill.level === 'expert');
}

/**
 * Get proficient-level skills
 */
export function getProficientSkills(): Skill[] {
  return skills.filter(skill => skill.level === 'proficient');
}

/**
 * Get familiar-level skills
 */
export function getFamiliarSkills(): Skill[] {
  return skills.filter(skill => skill.level === 'familiar');
}

/**
 * Get skills related to a specific project
 */
export function getSkillsByProject(projectId: string): Skill[] {
  return skills.filter(skill => skill.projects.includes(projectId));
}

/**
 * Get skill by ID
 */
export function getSkillById(id: string): Skill | undefined {
  return skills.find(skill => skill.id === id);
}

/**
 * Get all skill categories with their skills
 */
export function getSkillsGroupedByCategory(): Record<SkillCategory, Skill[]> {
  return {
    language: getSkillsByCategory('language'),
    framework: getSkillsByCategory('framework'),
    tool: getSkillsByCategory('tool'),
    concept: getSkillsByCategory('concept'),
  };
}

/**
 * Get all skill levels with their skills
 */
export function getSkillsGroupedByLevel(): Record<SkillLevel, Skill[]> {
  return {
    expert: getExpertSkills(),
    proficient: getProficientSkills(),
    familiar: getFamiliarSkills(),
  };
}

/**
 * Get top N skills by years of experience
 */
export function getTopSkills(limit: number = 5): Skill[] {
  return [...skills].sort((a, b) => b.years - a.years).slice(0, limit);
}

/**
 * Get total years of experience across all skills
 */
export function getTotalExperience(): number {
  return skills.reduce((total, skill) => total + skill.years, 0);
}

/**
 * Get unique skill count by category
 */
export function getSkillCountByCategory(): Record<SkillCategory, number> {
  return {
    language: getSkillsByCategory('language').length,
    framework: getSkillsByCategory('framework').length,
    tool: getSkillsByCategory('tool').length,
    concept: getSkillsByCategory('concept').length,
  };
}

/**
 * Check if a skill is expert level
 */
export function isExpertSkill(skillId: string): boolean {
  const skill = getSkillById(skillId);
  return skill?.level === 'expert';
}

/**
 * Search skills by name or description
 */
export function searchSkills(query: string): Skill[] {
  const lowerQuery = query.toLowerCase();
  return skills.filter(
    skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery)
  );
}
