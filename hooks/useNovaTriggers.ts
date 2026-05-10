/**
 * useNovaTriggers Hook - 场景触发对话
 * 监听路由变化，实现场景触发：
 * 1. 进入项目页自动介绍
 * 2. 首次进入欢迎消息
 * 3. 长时间停留主动询问
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useNovaStore } from '@/stores/novaStore';
import { PROJECT_INTROS, PROACTIVE_MESSAGES } from '@/data/nova-prompts';

// 根据页面类型动态调整超时时间（秒）
const TRIGGER_TIMEOUTS: Record<string, number> = {
  hall: 30,      // 核心大厅：30秒
  projects: 60,  // 项目展厅：60秒
  blog: 90,      // 博客页面：90秒
  about: 45,     // 关于页面：45秒
};

// 从路径提取区域名称
function getAreaFromPathname(pathname: string): string {
  if (pathname === '/') return 'hall';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/about')) return 'about';
  return 'hall';
}

export function useNovaTriggers() {
  const pathname = usePathname();
  const messages = useNovaStore(state => state.messages);
  const addMessage = useNovaStore(state => state.addMessage);
  const lastTriggeredPath = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const area = getAreaFromPathname(pathname);

    // 清除之前的超时
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 检查是否进入项目详情页
    const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
    if (projectMatch) {
      const projectId = projectMatch[1];

      // 避免重复触发
      if (lastTriggeredPath.current === pathname) return;
      lastTriggeredPath.current = pathname;

      // 如果有对应的项目介绍，触发 AI 介绍
      if (PROJECT_INTROS[projectId] && messages.length === 0) {
        setTimeout(() => {
          addMessage({ role: 'assistant', content: PROJECT_INTROS[projectId] });
        }, 1000);
      }
      return;
    }

    // 首次进入欢迎消息
    if (pathname === '/' && messages.length === 0) {
      setTimeout(() => {
        addMessage({ role: 'assistant', content: PROACTIVE_MESSAGES.hall });
      }, 2000);
      return;
    }

    // 长时间停留主动询问
    const timeout = TRIGGER_TIMEOUTS[area] || 30;
    timeoutRef.current = setTimeout(() => {
      if (messages.length === 0) {
        addMessage({
          role: 'assistant',
          content: PROACTIVE_MESSAGES[area] || PROACTIVE_MESSAGES.hall
        });
      }
    }, timeout * 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, messages.length, addMessage]);
}
