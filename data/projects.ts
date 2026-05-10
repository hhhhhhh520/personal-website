export interface Project {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  techStack: string[];
  highlights: string[];
  github?: string;
  demo?: string;
  image: string;
  color: string;
  category: 'ai' | 'android' | 'web' | 'tool';
  status: 'completed' | 'in-progress' | 'archived';
  startDate: string;
  endDate?: string;
}

export const projects: Project[] = [
  {
    id: 'mini-claude',
    name: 'Mini Claude Code',
    shortDesc: '迷你版 Claude CLI，支持工具调用和多 Agent 并发',
    fullDesc: '基于 LangGraph 和 LiteLLM 构建的轻量级 AI 编程助手。支持多模型切换（DeepSeek、通义千问、讯飞星辰等），实现工具调用、文件操作、Shell 命令执行等核心功能。采用多 Agent 并发架构，支持任务分解和并行执行。完整测试覆盖，包含 1497 个测试用例。',
    techStack: ['Python', 'LiteLLM', 'LangGraph', 'asyncio'],
    highlights: ['1497 测试用例', '多模型支持', '并发 Agent', '工具调用'],
    github: 'https://github.com/hhhhhhh520/mini-claude',
    image: '/images/projects/mini-claude.svg',
    color: '#3B82F6',
    category: 'ai',
    status: 'completed',
    startDate: '2024-04',
  },
  {
    id: 'codecraft-agent',
    name: 'CodeCraft Agent',
    shortDesc: '代码生成与执行的 AI Agent 系统',
    fullDesc: '端到端代码生成 Agent，支持从自然语言需求到可运行代码的完整流程。集成本地沙箱环境，支持代码执行和结果验证。采用多轮对话优化生成质量，包含智能错误修复和代码重构能力。',
    techStack: ['Python', 'LangChain', 'Docker', 'FastAPI'],
    highlights: ['沙箱执行环境', '智能错误修复', '多轮优化'],
    github: 'https://github.com/hhhhhhh520/CodeCraft-Agent',
    image: '/images/projects/codecraft-agent.svg',
    color: '#8B5CF6',
    category: 'ai',
    status: 'completed',
    startDate: '2024-03',
  },
  {
    id: 'campus-agent',
    name: '校园百事通',
    shortDesc: 'RAG 驱动的校园智能问答系统',
    fullDesc: '基于 RAG 技术的校园信息问答助手，支持自然语言查询学校政策、课程安排、活动信息等。采用向量数据库存储和检索，结合 DeepSeek 大模型生成准确回答。支持流式输出和多轮对话。',
    techStack: ['Python', 'FastAPI', 'ChromaDB', 'DeepSeek', 'React'],
    highlights: ['RAG 检索增强', '流式输出', '多轮对话', '知识库管理'],
    github: 'https://github.com/hhhhhhh520/campus-assistant',
    image: '/images/projects/campus-agent.svg',
    color: '#10B981',
    category: 'web',
    status: 'completed',
    startDate: '2024-02',
  },
  {
    id: 'phone-pick-assistant',
    name: '手机选购助手',
    shortDesc: 'AI 对话式手机选购推荐系统',
    fullDesc: '基于 DeepSeek 大模型的智能手机选购助手，支持自然语言描述需求，系统自动推荐最适合的手机。包含 353 款手机数据，支持多轮对话引导、参数对比、价格查询等功能。完整的前后端分离架构。',
    techStack: ['Python', 'FastAPI', 'DeepSeek', 'React', 'SQLite'],
    highlights: ['353 款手机数据', '多轮对话引导', '参数对比', '智能推荐'],
    github: 'https://github.com/hhhhhhh520/phone-pick-assistant',
    image: '/images/projects/phone-pick-assistant.svg',
    color: '#F59E0B',
    category: 'ai',
    status: 'completed',
    startDate: '2024-04',
  },
  {
    id: 'cv-generator',
    name: 'CV Generator',
    shortDesc: 'AI 驱动的简历定制工具',
    fullDesc: '基于大语言模型的智能简历生成系统。支持从用户信息自动生成专业简历，可根据目标职位 JD 自动优化简历内容，包含关键词注入策略和 ATS 优化功能。',
    techStack: ['Python', 'FastAPI', 'DeepSeek', 'docx'],
    highlights: ['JD 关键词注入', 'ATS 优化', '多模板支持'],
    github: 'https://github.com/hhhhhhh520/cv-generator',
    image: '/images/projects/cv-generator.svg',
    color: '#EC4899',
    category: 'tool',
    status: 'completed',
    startDate: '2024-04',
  },
  {
    id: 'game-agent',
    name: 'GameAuto Agent',
    shortDesc: '游戏自动化脚本引擎',
    fullDesc: '基于计算机视觉的游戏自动化框架。支持模板匹配、OCR 文字识别、智能休眠算法，可用于游戏挂机、日常任务自动化等场景。包含完整的错误恢复和日志记录机制。',
    techStack: ['Python', 'OpenCV', 'pyautogui', 'Tesseract'],
    highlights: ['模板匹配', 'OCR 识别', '智能休眠', '错误恢复'],
    image: '/images/projects/game-agent.svg',
    color: '#6366F1',
    category: 'tool',
    status: 'archived',
    startDate: '2023-12',
  },
];
