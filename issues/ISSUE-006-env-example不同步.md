# .env.example 与实际环境变量不同步
> 创建时间: 2026-06-25 | 状态: 🔴未解决

## 问题描述

`.env.example` 文件内容：
```
DEEPSEEK_API_KEY=your_api_key_here
```

但代码中实际使用的环境变量是 `ASTRON_API_KEY`：
- `app/api/chat/route.ts:109` — `process.env.ASTRON_API_KEY`
- `app/api/chat/route.ts:203` — `process.env.ASTRON_API_KEY`

**后果**: 新开发者克隆项目后，按照 `.env.example` 配置 `DEEPSEEK_API_KEY`，功能不会工作。

## 出现原因

**提交**: `2b282b8` (更正 API Key 错误提示为 ASTRON_API_KEY)

项目从 DeepSeek API 迁移到讯飞星辰 Astron API 时，更新了代码中的环境变量名，但忘记更新 `.env.example`。

## 解决方案

**步骤**:

1. 更新 `.env.example`：
```bash
# Astron Coding Plan API Configuration
# Get your API key from: https://maas.xfyun.cn/
ASTRON_API_KEY=your_api_key_here
```

2. 同时更新 `README.md` 中的环境变量说明（如有）

## 相关文件

- `.env.example`
- `app/api/chat/route.ts`
- `README.md`

## 参考资料

- 提交 `2b282b8` 进行了 API 迁移
