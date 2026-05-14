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
  highlightsEn?: string[];
}

/** Work experience */
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string[];
  descriptionEn?: string[];
  techStack?: string[];
}

/** Award or honor */
export interface Award {
  title: string;
  titleEn?: string;
  date: string;
  level: 'national' | 'provincial' | 'school' | 'other';
  issuer?: string;
  description?: string;
  descriptionEn?: string;
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
  titleEn?: string;
  avatar: string;
  email: string;
  phone?: string;
  location: string;
  locationEn?: string;
  summary: string;
  summaryEn?: string;
  focus: string[];
  focusEn?: string[];
  education: Education[];
  experience?: Experience[];
  awards?: Award[];
  skills: SkillGroup[];
  socials: SocialLink[];
}

// ==================== Data ====================

export const personal: PersonalInfo = {
  name: '苏畅',
  title: '',
  titleEn: '',
  avatar: '/images/avatar.svg',

  email: '1838722433@qq.com',
  phone: '19083149896',
  location: '湖南长沙',
  locationEn: 'Changsha, China',

  summary: '独立完成多个 AI 应用的全栈开发，从需求分析到技术落地，追求代码质量和工程化实践。',
  summaryEn: 'Independently completed full-stack development of multiple AI applications, from requirement analysis to technical implementation, pursuing code quality and engineering practices.',

  focus: [
    'AI 应用开发',
    '后端开发',
    '前端开发',
    '工程化实践',
  ],
  focusEn: [
    'AI Application Development',
    'Backend Development',
    'Frontend Development',
    'Engineering Practices',
  ],

  education: [
    {
      school: '湖南农业大学',
      degree: '本科',
      major: '智能科学与技术',
      startDate: '2023-09',
      endDate: '2027-06',
      highlights: [
        '专注 AI 应用开发方向',
        '核心课程：机器学习、深度学习、自然语言处理',
      ],
      highlightsEn: [
        'Focus on AI application development',
        'Core courses: Machine Learning, Deep Learning, NLP',
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
      descriptionEn: [
        'Developed Mini Claude Code — lightweight AI coding assistant with 1497 tests',
        'Built Campus Assistant — RAG-powered campus Q&A system',
        'Created Phone Pick Assistant — AI-driven phone recommendation system',
        'Implemented CV Generator — JD keyword-optimized resume generation tool',
      ],
      techStack: ['Python', 'FastAPI', 'React', 'LangGraph', 'LiteLLM'],
    },
  ],

  awards: [],

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

/**
 * Get localized personal information
 */
export function getLocalizedPersonal(locale: 'zh' | 'en'): {
  title: string;
  summary: string;
  focus: string[];
  location: string;
} {
  if (locale === 'en') {
    return {
      title: personal.titleEn || personal.title,
      summary: personal.summaryEn || personal.summary,
      focus: personal.focusEn || personal.focus,
      location: personal.locationEn || personal.location,
    };
  }
  return {
    title: personal.title,
    summary: personal.summary,
    focus: personal.focus,
    location: personal.location,
  };
}

/**
 * Get localized education highlights
 */
export function getLocalizedEducationHighlights(edu: Education, locale: 'zh' | 'en'): string[] {
  if (locale === 'en' && edu.highlightsEn) {
    return edu.highlightsEn;
  }
  return edu.highlights || [];
}

/**
 * Get localized experience description
 */
export function getLocalizedExperienceDescription(exp: Experience, locale: 'zh' | 'en'): string[] {
  if (locale === 'en' && exp.descriptionEn) {
    return exp.descriptionEn;
  }
  return exp.description;
}

/**
 * Get localized award title and description
 */
export function getLocalizedAward(award: Award, locale: 'zh' | 'en'): { title: string; description?: string } {
  if (locale === 'en') {
    return {
      title: award.titleEn || award.title,
      description: award.descriptionEn || award.description,
    };
  }
  return {
    title: award.title,
    description: award.description,
  };
}

// Types are already exported above with interface definitions
