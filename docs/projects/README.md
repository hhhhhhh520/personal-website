# 项目文档索引

本目录包含所有项目的详细技术文档，用于 RAG 知识库索引。

## 文档列表

| 项目 | 文档 | 状态 | 最后更新 |
|------|------|------|----------|
| Mini Claude Code | [mini-claude.md](./mini-claude.md) | ✅ 已完成 | 2026-05-15 |
| CodeCraft Agent | [codecraft-agent.md](./codecraft-agent.md) | ✅ 已完成 | 2026-05-15 |
| 校园百事通 | [campus-agent.md](./campus-agent.md) | ✅ 已完成 | 2026-05-15 |
| 手机选购助手 | [phone-pick-assistant.md](./phone-pick-assistant.md) | ✅ 已完成 | 2026-05-15 |
| CV Generator | [cv-generator.md](./cv-generator.md) | ✅ 已完成 | 2026-05-15 |
| GameAuto Agent | [game-agent.md](./game-agent.md) | ✅ 已完成 | 2026-05-15 |

## 文档模板

新项目文档请使用 [TEMPLATE.md](./TEMPLATE.md) 模板。

## 文档维护

1. 更新项目文档后，运行 `npm run rag:build` 重建索引
2. 文档应包含：技术架构、核心功能、设计决策、测试覆盖、部署说明
3. 使用 Mermaid 图表展示架构和流程

## RAG 索引

这些文档会被 `rag/scripts/extract_data.py` 解析并纳入 RAG 知识库，用于 Nova AI 回答项目相关问题。
