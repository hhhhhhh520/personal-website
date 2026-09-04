export interface Project {
  id: string;
  name: string;
  shortDesc: string;
  shortDescEn?: string;
  fullDesc: string;
  fullDescEn?: string;
  techStack: string[];
  highlights: string[];
  highlightsEn?: string[];
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
    shortDescEn: 'Lightweight Claude CLI with tool calling and multi-agent concurrency',
    fullDesc: '基于 LangGraph 和 LiteLLM 构建的轻量级 AI 编程助手。支持多模型切换（DeepSeek、通义千问、讯飞星辰等），实现工具调用、文件操作、Shell 命令执行等核心功能。采用多 Agent 并发架构，支持任务分解和并行执行。完整测试覆盖，包含 1497 个测试用例。',
    fullDescEn: 'Lightweight AI coding assistant built with LangGraph and LiteLLM. Supports multi-model switching (DeepSeek, Qwen, iFlytek), tool calling, file operations, and shell command execution. Multi-agent concurrent architecture with task decomposition and parallel execution. Complete test coverage with 1497 test cases.',
    techStack: ['Python', 'LiteLLM', 'LangGraph', 'asyncio'],
    highlights: ['1497 测试用例', '多模型支持', '并发 Agent', '工具调用'],
    highlightsEn: ['1497 Test Cases', 'Multi-Model Support', 'Concurrent Agents', 'Tool Calling'],
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
    shortDescEn: 'AI agent for code generation with sandbox execution',
    fullDesc: '端到端代码生成 Agent，支持从自然语言需求到可运行代码的完整流程。集成本地沙箱环境，支持代码执行和结果验证。采用多轮对话优化生成质量，包含智能错误修复和代码重构能力。',
    fullDescEn: 'End-to-end code generation agent supporting complete flow from natural language requirements to runnable code. Integrated local sandbox environment for code execution and result verification. Multi-turn dialogue optimization with smart error fixing and code refactoring.',
    techStack: ['Python', 'LangChain', 'Docker', 'FastAPI'],
    highlights: ['沙箱执行环境', '智能错误修复', '多轮优化'],
    highlightsEn: ['Sandbox Execution', 'Smart Error Fixing', 'Multi-turn Optimization'],
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
    shortDescEn: 'RAG-powered campus Q&A assistant',
    fullDesc: '基于 RAG 技术的校园信息问答助手，支持自然语言查询学校政策、课程安排、活动信息等。采用向量数据库存储和检索，结合 DeepSeek 大模型生成准确回答。支持流式输出和多轮对话。',
    fullDescEn: 'Campus information Q&A assistant based on RAG technology. Supports natural language queries for school policies, course schedules, and event information. Vector database storage and retrieval with DeepSeek LLM for accurate responses. Streaming output and multi-turn dialogue support.',
    techStack: ['Python', 'FastAPI', 'ChromaDB', 'DeepSeek', 'React'],
    highlights: ['RAG 检索增强', '流式输出', '多轮对话', '知识库管理'],
    highlightsEn: ['RAG Enhancement', 'Streaming Output', 'Multi-turn Dialogue', 'Knowledge Management'],
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
    shortDescEn: 'AI-powered phone recommendation chatbot',
    fullDesc: '基于 DeepSeek 大模型的智能手机选购助手，支持自然语言描述需求，系统自动推荐最适合的手机。包含 353 款手机数据，支持多轮对话引导、参数对比、价格查询等功能。完整的前后端分离架构。',
    fullDescEn: 'Smart phone shopping assistant powered by DeepSeek LLM. Supports natural language requirement description with automatic phone recommendation. 353 phone models with multi-turn dialogue guidance, spec comparison, and price queries. Complete frontend-backend separation architecture.',
    techStack: ['Python', 'FastAPI', 'DeepSeek', 'React', 'SQLite'],
    highlights: ['353 款手机数据', '多轮对话引导', '参数对比', '智能推荐'],
    highlightsEn: ['353 Phone Models', 'Multi-turn Guidance', 'Spec Comparison', 'Smart Recommendation'],
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
    shortDescEn: 'AI-driven resume customization tool',
    fullDesc: '基于大语言模型的智能简历生成系统。支持从用户信息自动生成专业简历，可根据目标职位 JD 自动优化简历内容，包含关键词注入策略和 ATS 优化功能。',
    fullDescEn: 'Intelligent resume generation system powered by LLM. Automatically generates professional resumes from user information. JD-based resume optimization with keyword injection strategy and ATS optimization.',
    techStack: ['Python', 'FastAPI', 'DeepSeek', 'docx'],
    highlights: ['JD 关键词注入', 'ATS 优化', '多模板支持'],
    highlightsEn: ['JD Keyword Injection', 'ATS Optimization', 'Multiple Templates'],
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
    shortDescEn: 'Game automation script engine',
    fullDesc: '基于计算机视觉的游戏自动化框架。支持模板匹配、OCR 文字识别、智能休眠算法，可用于游戏挂机、日常任务自动化等场景。包含完整的错误恢复和日志记录机制。',
    fullDescEn: 'Game automation framework based on computer vision. Template matching, OCR text recognition, and smart sleep algorithm for game AFK and daily task automation. Complete error recovery and logging mechanism.',
    techStack: ['Python', 'OpenCV', 'pyautogui', 'Tesseract'],
    highlights: ['模板匹配', 'OCR 识别', '智能休眠', '错误恢复'],
    highlightsEn: ['Template Matching', 'OCR Recognition', 'Smart Sleep', 'Error Recovery'],
    image: '/images/projects/game-agent.svg',
    color: '#6366F1',
    category: 'tool',
    status: 'archived',
    startDate: '2023-12',
  },
  {
    id: 'agenthub',
    name: 'AgentHub',
    shortDesc: 'IM 风格的多 Agent 协作平台，Orchestrator 智能编排任务',
    shortDescEn: 'IM-style multi-agent collaboration platform with an Orchestrator',
    fullDesc: '用户通过聊天与多个 AI Agent 协作，Orchestrator 负责选人、拆任务、监督与纠偏。核心是 9-action 状态机编排闭环（self/delegate/discuss/align_confirm/align_decompose/align_qa/execute/verify/done），并用 Contract v1 契约化协作（权威输入注入 + declaredFiles 越界校验 + outputSchema 结构校验）约束 LLM 的不可靠性。执行层强制验证，进程池按配置指纹隔离，Claude Code / OpenCode 双 CLI 适配层统一抽象。1050 个单元测试，每次修复配「真回归守卫」，pre-commit 三视角审查（攻击者/生命周期/声明vs实现）。',
    fullDescEn: 'A chat-driven multi-agent platform where an Orchestrator selects agents, decomposes tasks, supervises and course-corrects. Built around a 9-action state machine and Contract v1 (authoritative input injection, declaredFiles out-of-bounds checks, outputSchema validation) to tame LLM unreliability. Forced execution-layer verification, process-pool config fingerprinting, and a Claude Code / OpenCode dual-CLI adapter. 1050 unit tests with per-fix regression guards and three-lens pre-commit review.',
    techStack: ['Next.js', 'React', 'TypeScript', 'Vercel AI SDK', 'Prisma + libSQL', 'Playwright'],
    highlights: ['Orchestrator 9-action 状态机', 'Contract v1 契约化协作', '双 CLI 适配层', '1050 单元测试 + 真回归守卫'],
    highlightsEn: ['9-action Orchestrator state machine', 'Contract v1 collaboration', 'Dual-CLI adapter layer', '1050 tests + regression guards'],
    github: 'https://github.com/hhhhhhh520/agenthub',
    image: '/images/projects/agenthub.svg',
    color: '#06B6D4',
    category: 'ai',
    status: 'in-progress',
    startDate: '2026-05',
  },
  {
    id: 'iflytek-agent-challenge',
    name: '讯飞 Agent 算法挑战赛',
    shortDesc: '从自然语言到可执行工作流的 Agent，平台最优 71.47',
    shortDescEn: 'NL-to-executable-workflow agent, best platform score 71.47',
    fullDesc: '讯飞 AI 开发者大赛「Agent 算法挑战赛」参赛方案，赛题为从自然语言到可执行工作流，在官方仿真器上按 TSR(60) / 动作合法性(20) / 效率(10) / 鲁棒性(10) 评分。采用三阶段架构：Phase1 LLM 意图理解（不计步）→ Phase2 显式状态机推进（计步）→ Phase3 构造最终结果，用确定性状态机兜住 LLM 的步数与动作合法性。平台得分受 ±1.7 方差影响，多轮迭代后达到的最优为 71.47（2026-09-02）。',
    fullDescEn: 'Entry for the iFlytek AI Developer Contest Agent Algorithm Challenge ("natural language to executable workflow"), scored on TSR(60)/Action-validity(20)/Efficiency(10)/Robustness(10) against the official simulator. A three-stage architecture: LLM intent parsing (uncounted) → explicit state-machine stepping (counted) → result construction, using a deterministic state machine to bound LLM step count and action legality. Best platform score 71.47 (2026-09-02) reached over multiple iterations, with ±1.7 platform variance.',
    techStack: ['Python', 'LLM Agent', '显式状态机', 'Qwen'],
    highlights: ['三阶段架构（意图/状态机/结果）', '平台最优 71.47', '官方仿真器端到端验证', '鲁棒性变体测试'],
    highlightsEn: ['Three-stage architecture', 'Best score 71.47', 'E2E on official simulator', 'Robustness variant testing'],
    image: '/images/projects/iflytek-agent-challenge.svg',
    color: '#F43F5E',
    category: 'ai',
    status: 'in-progress',
    startDate: '2026-07',
  },
];

/**
 * Get localized project data based on locale
 */
export function getLocalizedProject(project: Project, locale: 'zh' | 'en'): {
  shortDesc: string;
  fullDesc: string;
  highlights: string[];
} {
  if (locale === 'en') {
    return {
      shortDesc: project.shortDescEn || project.shortDesc,
      fullDesc: project.fullDescEn || project.fullDesc,
      highlights: project.highlightsEn || project.highlights,
    };
  }
  return {
    shortDesc: project.shortDesc,
    fullDesc: project.fullDesc,
    highlights: project.highlights,
  };
}

/**
 * Get all localized projects
 */
export function getLocalizedProjects(locale: 'zh' | 'en'): Project[] {
  return projects.map((project) => ({
    ...project,
    shortDesc: getLocalizedProject(project, locale).shortDesc,
    fullDesc: getLocalizedProject(project, locale).fullDesc,
    highlights: getLocalizedProject(project, locale).highlights,
  }));
}