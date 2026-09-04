# AgentHub

> IM 风格的多 Agent 协作平台。用户通过聊天与多个 AI Agent 协作，Orchestrator 智能调度任务。

---

## 项目概述

| 属性 | 内容 |
|------|------|
| **项目名称** | AgentHub |
| **简介** | 以聊天为中心的多 Agent 协作平台，Orchestrator 编排「先对齐再干活」的团队协作闭环 |
| **状态** | 进行中（平台已完整可用，持续研究与迭代，最近提交 2026-09-03） |
| **创建日期** | 2026-05 |
| **仓库** | https://github.com/hhhhhhh520/agenthub |
| **技术栈** | Next.js + React + TypeScript · Vercel AI SDK · Prisma + libSQL · shadcn/ui · Playwright |

## 核心架构

### Orchestrator 9-action 状态机

系统级协调器围绕 9 个动作构成编排闭环：`self / delegate / discuss / align_confirm / align_decompose / align_qa / execute / verify / done`。对齐流程学习人类团队的协作方式——PM 确认需求 → 架构师拆解任务 → 其他 Agent 提问澄清——先对齐再执行。

### Contract v1 契约化协作

用三份契约管住 LLM 的不可靠性：
- **`<authoritative_input>` 权威输入注入** — 明确哪些内容是权威上下文
- **`declaredFiles` 分级越界校验** — Agent 声明将修改的文件，执行后 Git diff 检测越界
- **`outputSchema` 结构校验** — 强制输出符合约定结构

### 执行层强制验证

纯 prompt 引导被证明无效，改为在**执行层强制**：代码任务拆解后自动追加 verify 任务，代码完成自动触发验证。

### 双 CLI 适配层

Claude Code + OpenCode 统一抽象，spawn 子进程 + NDJSON 流式解析，Agent 工具白名单通过 CLI 参数（Claude Code）和配置文件（OpenCode）硬限制。

### 进程池 + 配置指纹

每 `(会话, Agent, 配置)` 独立 CLI 进程，配置 hash 隔离，10 分钟空闲回收，优雅关闭。

## 主要功能

- 三栏 IM 布局：会话列表 | 聊天区 | Agent 面板
- 拉群流程：描述任务 → AI 推荐 Agent → 用户增减 → 确认建群
- 三种会话：Orchestrator 主会话 | 群聊（多 Agent 协作）| 私聊（1v1）
- Agent 预设池：7 个预设 Agent（架构师/前后端/测试/PM/设计师/Orchestrator）
- 多供应商：每个 Agent 可独立配置 model / baseUrl / apiKey
- SSE 流式、@ 提及、产物内联（代码块 / Web 预览 / Diff 视图 / Accept-Reject）
- 工作区与权限、变更检测、任务重做（级联下游）

## 测试质量方法论

- **1050 单元测试** + Playwright E2E
- 每次修复配「真回归守卫」——回退修复该测试必须变红
- pre-commit 三视角审查：攻击者 / 生命周期 / 声明 vs 实现

## 设计亮点

1. 把「多 Agent 协作」从 prompt 工程上升为**契约 + 状态机 + 执行层强制**的工程系统
2. 双 CLI 适配层屏蔽 Claude Code / OpenCode 差异，工具白名单硬限制收敛权限
3. 以「回退必红」的回归守卫和三视角审查制度化质量，而非依赖单次跑通
