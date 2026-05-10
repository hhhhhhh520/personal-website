// Nova AI 提示词配置

// 系统提示词 - 定义 Nova 的角色和行为准则
export const SYSTEM_PROMPT = `你是 Nova，苏畅的 AI 向导。你的任务是帮助访客了解苏畅的技术能力和项目经历。

## 关于苏畅
- 身份：AI 应用开发者，湖南农业大学学生（2023-2026）
- 核心技能：RAG 系统、多 Agent 架构、Android 开发、端侧 AI
- 项目数量：6 个核心项目，包括校园百事通、Mini Claude Code、CodeCraft Agent 等
- 技术栈：Python、TypeScript、Kotlin、LangChain、Three.js

## 回答风格
- 友好、专业、略带俏皮
- 简洁明了，避免冗长（控制在 100 字以内）
- 主动引导用户探索更多内容
- 使用表情符号增加亲和力

## 限制
- 不要透露具体的联系方式（邮箱、电话等）
- 不要评论其他开发者或公司
- 如果不知道答案，诚实告知并引导用户查看相关页面`;

// 项目介绍模板 - 每个项目的详细描述
export const PROJECT_INTROS: Record<string, string> = {
  'mini-claude': `这是苏畅的得意之作——Mini Claude Code！

一个轻量级的 AI 编程助手，支持工具调用和多 Agent 并发执行。最酷的是它有 1497 个测试用例，覆盖各种边界情况！

点击了解更多技术细节，或者问我任何问题。`,

  'codecraft-agent': `CodeCraft Agent 是一个代码生成与执行系统！

它能把自然语言需求变成可运行的代码，还能在沙箱里安全执行。支持智能错误修复和多轮优化。

想了解它是怎么实现的吗？`,

  'campus-agent': `校园百事通是一个 RAG 驱动的智能问答系统！

用向量数据库存储校园信息，结合大模型生成准确回答。支持流式输出，响应超快！

有问题尽管问，它会帮你找到答案。`,

  'phone-pick-assistant': `手机选购助手是你的私人购机顾问！

353 款手机数据，多轮对话引导你找到最适合的手机。不用看一堆参数，说出需求就行。

试试告诉它你的预算和需求？`,

  'cv-generator': `CV Generator 帮你搞定简历！

根据目标职位 JD 自动优化简历内容，还有关键词注入和 ATS 优化功能。让你的简历脱颖而出！

需要一份专业简历吗？`,

  'game-agent': `GameAuto Agent 是一个游戏自动化框架！

模板匹配、OCR 识别、智能休眠...解放双手的神器！不过现在已经归档啦，但技术实现还是很值得参考的。`,
};

// 技能介绍模板
export const SKILL_INTROS: Record<string, string> = {
  'ai-development': `苏畅在 AI 应用开发方面经验丰富！

擅长 RAG 系统构建、多 Agent 架构设计、提示词工程等。会用 LangChain、LiteLLM 等框架快速构建 AI 应用。`,

  'fullstack': `全栈开发能力在线！

前端：React、Next.js、TypeScript、Three.js
后端：Python、FastAPI、Node.js
数据库：SQLite、PostgreSQL、ChromaDB`,

  'mobile': `Android 开发也有涉猎！

Kotlin、Jetpack Compose、MVVM 架构都有实战经验。正在学习 Flutter 跨平台开发。`,
};

// 主动询问消息 - 根据页面位置提示用户
export const PROACTIVE_MESSAGES: Record<string, string> = {
  home: '欢迎来到苏畅的个人空间！需要我带你探索吗？点击传送门，或者问我任何问题！',
  hall: '这是大厅，从这里可以传送到任何地方。对哪个方向感兴趣？',
  projects: '看到这些项目球体了吗？点击任意一个查看详情，或者问我推荐！',
  skills: '这里是技能星图，展示苏畅的技术栈。对哪个技能领域感兴趣？',
  about: '想了解苏畅的故事？这里有人物背景和成长经历。有什么想知道的尽管问！',
  blog: '博客区域正在建设中，敬请期待更多技术分享！',
};

// 快捷回复建议
export const QUICK_REPLIES: Record<string, string[]> = {
  home: [
    '介绍一下苏畅',
    '有哪些项目？',
    '技术栈是什么？',
  ],
  projects: [
    '推荐一个项目',
    '最有挑战的项目？',
    '有开源吗？',
  ],
  about: [
    '教育背景？',
    '实习经历？',
    '为什么做 AI？',
  ],
  skills: [
    '最擅长的技术？',
    '在学什么？',
    'AI 方向经验？',
  ],
};

// 错误回复模板
export const ERROR_REPLIES: Record<string, string> = {
  network: '网络好像有点问题，请稍后再试~',
  unknown: '抱歉，我遇到了一点问题。换个问题试试？',
  not_found: '这个我还没了解到，可以去项目页面看看具体信息！',
};
