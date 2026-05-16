/**
 * useChat Hook - AI 对话逻辑封装
 * 集成 novaStore 状态管理，提供流式消息更新
 */

import { useCallback } from 'react';
import { chatStream, getFallbackResponse } from '@/lib/ai';
import { useNovaStore } from '@/stores/novaStore';

interface UseChatOptions {
  projectId?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    updateLastMessage,
    setLoading,
    setError,
    clearMessages,
    trimMessages,
  } = useNovaStore();

  const sendMessage = useCallback(
    async (content: string) => {
      // 添加用户消息
      addMessage({ role: 'user', content });
      setLoading(true);

      // 添加空的 AI 消息占位
      addMessage({ role: 'assistant', content: '' });

      try {
        // 获取历史消息（排除最后一条空消息，限制历史长度）
        const history = messages.slice(-10);

        // 流式获取响应
        const stream = chatStream(content, {
          projectId: options.projectId,
          messages: history,
        });

        for await (const chunk of stream) {
          updateLastMessage(chunk);
        }

        // 发送完成后截断历史
        trimMessages(10);
      } catch (err) {
        const aiError = err as { type?: string; message?: string };

        // API Key 未配置 - 显示配置引导
        if (aiError.type === 'API_KEY_NOT_CONFIGURED') {
          updateLastMessage(
            '⚠️ AI 功能需要配置 ASTRON_API_KEY。\n\n请在项目根目录的 `.env.local` 文件中设置：\n```\nASTRON_API_KEY=your_api_key\n```\n\n获取 API Key：https://maas.xfyun.cn/packageSubscription'
          );
          setError({ type: 'API_KEY_NOT_CONFIGURED', message: aiError.message || '', retryable: false });
        } else {
          // 其他错误使用降级策略
          const fallback = getFallbackResponse(options.projectId);
          updateLastMessage(fallback);
          setError({ type: 'UNKNOWN', message: String(err), retryable: false });
        }
      } finally {
        setLoading(false);
      }
    },
    [
      options.projectId,
      messages,
      addMessage,
      updateLastMessage,
      setLoading,
      setError,
      trimMessages,
    ]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
