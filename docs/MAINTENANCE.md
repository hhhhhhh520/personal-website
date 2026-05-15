# RAG 文档维护指南

本指南说明如何更新项目文档并触发 RAG 索引重建。

## 文档位置

| 文档类型 | 位置 | 说明 |
|----------|------|------|
| 项目文档 | `docs/projects/*.md` | 详细技术文档 |
| 项目概述 | `data/projects.ts` | 基本信息数据源 |
| 博客内容 | `content/blog/*.mdx` | MDX 格式博客文章 |
| 个人信息 | `data/personal.ts` | 个人简介数据 |

## 更新流程

### 1. 更新项目文档

```bash
# 编辑项目文档
vim docs/projects/mini-claude.md

# 重建 RAG 索引
npm run rag:build
```

### 2. 新增项目文档

```bash
# 复制模板
cp docs/projects/TEMPLATE.md docs/projects/new-project.md

# 编辑新文档
vim docs/projects/new-project.md

# 更新索引文件（添加新项目到 README.md）
vim docs/projects/README.md

# 重建索引
npm run rag:build
```

### 3. 批量更新

```bash
# 检查是否需要更新
npm run rag:update

# 强制重建（忽略哈希检查）
npm run rag:force
```

## 命令说明

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `npm run rag:build` | 智能构建（数据变化时才重建） | 日常更新 |
| `npm run rag:update` | 检查是否需要更新 | CI/CD 检查 |
| `npm run rag:force` | 强制重建 | 索引损坏时 |

## 文档模板结构

每个项目文档应包含以下章节：

1. **项目概述** - 基本信息、状态、仓库地址
2. **技术架构** - 架构图、技术栈、核心模块
3. **核心功能** - 功能清单、实现细节
4. **设计决策** - 技术选型、架构演进
5. **测试覆盖** - 测试策略、覆盖率
6. **部署说明** - 环境要求、启动步骤
7. **项目亮点** - 关键特性、性能指标

## 注意事项

### 文档格式

- 使用 Markdown 格式
- 支持 Mermaid 图表
- 代码块指定语言高亮
- 表格使用标准 Markdown 语法

### 避免重复

- `docs/projects/*.md` 包含详细技术文档
- `data/projects.ts` 只保留基本信息
- RAG 会合并两个来源的内容

### 性能优化

- 文档片段超过 400 字符会被分块
- 分块重叠 50 字符保持上下文连贯
- 总片段数建议控制在 500 以内

## 索引文件

索引构建后生成以下文件：

```
public/rag-index/
├── documents.json   # 文档片段列表
├── embeddings.json  # 1024 维向量
└── metadata.json    # 元数据和统计信息
```

## 验证检索效果

```bash
# 启动开发服务器
npm run dev

# 测试 RAG 检索
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Mini Claude 的并发机制"}'
```

## 故障排查

### 索引未更新

检查数据哈希是否变化：
```bash
cat public/rag-index/metadata.json | grep data_hash
```

### 检索结果不准确

1. 检查文档是否正确分块
2. 验证 embedding 模型是否加载
3. 查看检索分数分布

### 构建失败

1. 检查 Python 环境：`python --version`
2. 检查 embedding 模型路径
3. 查看错误日志

---

> 最后更新：2026-05-15
