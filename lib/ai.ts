/**
 * 讯飞星辰 Astron Coding Plan API 客户端封装
 * 提供流式对话、错误分类和降级策略
 */

import { PROJECT_INTROS, ERROR_REPLIES } from '../data/nova-prompts';

// 错误类型枚举
export enum AIErrorType {
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_DOWN = 'SERVICE_DOWN',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  UNKNOWN = 'UNKNOWN',
}

// 错误接口
export interface AIError {
  type: AIErrorType;
  message: string;
  retryable: boolean;
}

// 消息类型
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 对话上下文
export interface ChatContext {
  projectId?: string;
  messages?: Message[];
}

/**
 * 分类错误类型
 * @param error - 原始错误对象
 * @returns 分类后的 AIError
 */
function classifyError(error: unknown): AIError {
  const err = error as { code?: string; status?: number; name?: string };

  // 网络错误
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return {
      type: AIErrorType.NETWORK,
      message: ERROR_REPLIES.network,
      retryable: true,
    };
  }

  // HTTP 状态码错误
  if (err.status) {
    // 速率限制
    if (err.status === 429) {
      return {
        type: AIErrorType.RATE_LIMIT,
        message: '请求过于频繁，请稍后再试',
        retryable: true,
      };
    }

    // Service unavailable (API key not configured)
    if (err.status === 503) {
      return {
        type: AIErrorType.API_KEY_NOT_CONFIGURED,
        message: 'AI 功能需要配置 API Key',
        retryable: false,
      };
    }

    // 服务端错误
    if (err.status >= 500) {
      return {
        type: AIErrorType.SERVICE_DOWN,
        message: 'AI 服务暂时不可用',
        retryable: true,
      };
    }
  }

  // 超时错误
  if (err.name === 'AbortError' || err.code === 'ETIMEDOUT') {
    return {
      type: AIErrorType.NETWORK,
      message: '请求超时，请检查网络',
      retryable: true,
    };
  }

  // 未知错误
  return {
    type: AIErrorType.UNKNOWN,
    message: ERROR_REPLIES.unknown,
    retryable: false,
  };
}

/**
 * 流式对话函数
 * @param message - 用户消息
 * @param context - 对话上下文
 * @yields 生成的文本片段
 */
export async function* chatStream(
  message: string,
  context: ChatContext = {}
): AsyncGenerator<string, void, unknown> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      projectId: context.projectId,
      messages: context.messages || [],
    }),
  });

  // 处理 HTTP 错误
  if (!response.ok) {
    throw classifyError({ status: response.status });
  }

  // 检查响应体
  if (!response.body) {
    throw classifyError({ code: 'EMPTY_RESPONSE' });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按 \n\n 分段（SSE 标准分隔符）
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const lines = part.split('\n');

        for (const line of lines) {
          // 跳过空行
          if (!line.trim()) continue;

          // 处理 SSE data 字段
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            // 流结束标记
            if (data === '[DONE]') return;

            try {
              const json = JSON.parse(data);

              // 处理 OpenAI/DeepSeek 格式的响应
              if (json.choices?.[0]?.delta?.content) {
                yield json.choices[0].delta.content;
              } else if (json.text) {
                // 兼容简单文本格式
                yield json.text;
              } else if (json.content) {
                // 兼容其他格式
                yield json.content;
              }
            } catch {
              // JSON 解析失败，作为纯文本处理
              if (data) yield data;
            }
          }
        }
      }
    }

    // 处理缓冲区剩余内容
    if (buffer.trim()) {
      const lines = buffer.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data !== '[DONE]') {
            try {
              const json = JSON.parse(data);
              if (json.choices?.[0]?.delta?.content) {
                yield json.choices[0].delta.content;
              } else if (json.text) {
                yield json.text;
              }
            } catch {
              if (data) yield data;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 非流式对话（等待完整响应）
 * @param message - 用户消息
 * @param context - 对话上下文
 * @returns 完整的回复文本
 */
export async function chat(
  message: string,
  context: ChatContext = {}
): Promise<string> {
  const chunks: string[] = [];

  for await (const chunk of chatStream(message, context)) {
    chunks.push(chunk);
  }

  return chunks.join('');
}

/**
 * 降级策略：返回预设文案
 * @param projectId - 项目 ID（可选）
 * @returns 预设的回复文本
 */
export function getFallbackResponse(projectId?: string): string {
  // 如果有项目 ID，返回项目介绍
  if (projectId && PROJECT_INTROS[projectId]) {
    return PROJECT_INTROS[projectId];
  }

  // 默认降级消息
  return ERROR_REPLIES.unknown;
}

/**
 * 带重试的流式对话
 * @param message - 用户消息
 * @param context - 对话上下文
 * @param maxRetries - 最大重试次数
 * @param retryDelay - 重试延迟（毫秒）
 * @yields 生成的文本片段
 */
export async function* chatStreamWithRetry(
  message: string,
  context: ChatContext = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): AsyncGenerator<string, void, unknown> {
  let lastError: AIError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      yield* chatStream(message, context);
      return;
    } catch (error) {
      lastError = error as AIError;

      // 不可重试的错误，直接抛出
      if (!lastError.retryable) {
        throw lastError;
      }

      // 最后一次尝试失败
      if (attempt === maxRetries) {
        break;
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  // 所有重试失败，返回降级响应
  yield getFallbackResponse(context.projectId);
}

/**
 * 检查 AI 服务是否可用
 * @returns 服务状态
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/chat', {
      method: 'GET',
    });
    return response.ok || response.status === 405; // 405 表示路由存在但不支持 GET
  } catch {
    return false;
  }
}

// 导出错误分类函数供外部使用
export { classifyError };
