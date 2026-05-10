/**
 * Personal Information Data Layer
 *
 * Defines types and data for personal portfolio information
 * including education, experience, awards, and social links.
 */

// ==================== Type Definitions ====================

/** Social media platform links */
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  username: string;
}

/** Education record */
export interface Education {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  highlights?: string[];
}

/** Work experience */
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string[];
  techStack?: string[];
}

/** Award or honor */
export interface Award {
  title: string;
  date: string;
  level: 'national' | 'provincial' | 'school' | 'other';
  issuer?: string;
  description?: string;
}

/** Technical skill group */
export interface SkillGroup {
  category: string;
  items: string[];
}

/** Personal information */
export interface PersonalInfo {
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  focus: string[];
  education: Education[];
  experience?: Experience[];
  awards?: Award[];
  skills: SkillGroup[];
  socials: SocialLink[];
}

// ==================== Data ====================

export const personal: PersonalInfo = {
  name: '苏畅',
  title: 'AI 应用开发者',
  avatar: '/images/avatar.svg',

  email: '1838722433@qq.com',
  phone: '19083149896',
  location: '湖南长沙',

  summary: '专注 AI 应用开发的本科生，具备 RAG 系统、LLM Agent 和端侧 AI 的实战经验，擅长将 AI 技术落地为可用的产品。',

  focus: [
    'RAG 系统',
    'LLM Agent',
    '端侧 AI',
    '全栈开发',
  ],

  education: [
    {
      school: '湖南农业大学',
      degree: '本科',
      major: '智能科学与技术',
      startDate: '2022-09',
      endDate: '2026-06',
      highlights: [
        'GPA: 3.5+/4.0',
        '专注 AI 应用开发方向',
        '核心课程：机器学习、深度学习、自然语言处理',
      ],
    },
  ],

  experience: [
    {
      company: '个人项目',
      position: '全栈开发',
      startDate: '2024-01',
      location: '远程',
      description: [
        '开发 Mini Claude Code — 轻量级 AI 编码助手，含 1497 个测试',
        '构建校园百事通 — 基于 RAG 的校园智能问答系统',
        '创建手机选购助手 — AI 驱动的手机推荐系统',
        '实现 CV Generator — JD 关键词优化的简历生成工具',
      ],
      techStack: ['Python', 'FastAPI', 'React', 'LangGraph', 'LiteLLM'],
    },
  ],

  awards: [
    {
      title: '全国创新创业大赛参赛',
      date: '2024-12',
      level: 'national',
      description: 'AI 驱动的学习平台项目',
    },
    {
      title: '校级奖学金',
      date: '2024-09',
      level: 'school',
      issuer: '湖南农业大学',
    },
  ],

  skills: [
    {
      category: 'Languages',
      items: ['Python', 'TypeScript', 'JavaScript', 'Java'],
    },
    {
      category: 'AI/ML',
      items: ['LangGraph', 'LangChain', 'LiteLLM', 'RAG', 'Vector DB'],
    },
    {
      category: 'Backend',
      items: ['FastAPI', 'Flask', 'SQLite', 'PostgreSQL'],
    },
    {
      category: 'Frontend',
      items: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
    },
    {
      category: 'Tools',
      items: ['Git', 'Docker', 'Linux', 'VS Code', 'Pytest'],
    },
  ],

  socials: [
    {
      platform: 'GitHub',
      url: 'https://github.com/hhhhhhh520',
      icon: 'github',
      username: 'hhhhhhhh520',
    },
    {
      platform: 'Email',
      url: 'mailto:1838722433@qq.com',
      icon: 'mail',
      username: '1838722433@qq.com',
    },
  ],
};

// ==================== Utility Functions ====================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Chinese mobile)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Get contact information with validation
 */
export function getValidatedContacts(): {
  email: string | null;
  phone: string | null;
} {
  return {
    email: isValidEmail(personal.email) ? personal.email : null,
    phone: personal.phone && isValidPhone(personal.phone) ? personal.phone : null,
  };
}

/**
 * Get social link by platform name
 */
export function getSocialLink(platform: string): SocialLink | undefined {
  return personal.socials.find(
    (s) => s.platform.toLowerCase() === platform.toLowerCase()
  );
}

/**
 * Get all skill items as flat array
 */
export function getAllSkills(): string[] {
  return personal.skills.flatMap((category) => category.items);
}

/**
 * Get education duration as formatted string
 */
export function formatEducationDuration(edu: Education): string {
  const start = edu.startDate;
  const end = edu.endDate || 'Present';
  return `${start} - ${end}`;
}

/**
 * Get experience duration as formatted string
 */
export function formatExperienceDuration(exp: Experience): string {
  const start = exp.startDate;
  const end = exp.endDate || 'Present';
  return `${start} - ${end}`;
}

// Types are already exported above with interface definitions
