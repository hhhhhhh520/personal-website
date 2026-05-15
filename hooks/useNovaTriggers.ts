/**
 * useNovaTriggers Hook - 场景触发对话
 * 监听路由变化，实现场景触发：
 * 1. 进入项目详情页自动介绍
 * 2. 首次进入首页根据时间段打招呼
 * 3. 进入其他页面显示页面介绍气泡
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useNovaStore } from '@/stores/novaStore';
import { PROJECT_INTROS, getTimeGreeting, PAGE_INTROS } from '@/data/nova-prompts';

// 根据页面类型动态调整超时时间（秒）
const TRIGGER_TIMEOUTS: Record<string, number> = {
  home: 30,
  projects: 60,
  blog: 90,
  about: 45,
};

// 从路径提取区域名称（处理带 locale 的路径如 /zh/projects）
function getAreaFromPathname(pathname: string): string {
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, '') || '/';
  if (pathWithoutLocale === '/') return 'home';
  if (pathWithoutLocale.startsWith('/projects')) return 'projects';
  if (pathWithoutLocale.startsWith('/blog')) return 'blog';
  if (pathWithoutLocale.startsWith('/about')) return 'about';
  return 'home';
}

// 检查是否是首页
function isHomePage(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, '') || '/';
  return pathWithoutLocale === '/';
}

// 提取项目 ID
function extractProjectId(pathname: string): string | null {
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, '');
  const match = pathWithoutLocale.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

// 检查是否是项目列表页
function isProjectsListPage(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, '') || '/';
  return pathWithoutLocale === '/projects';
}

// 检查是否是博客列表页
function isBlogListPage(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, '') || '/';
  return pathWithoutLocale === '/blog';
}

// 检查是否是关于页
function isAboutPage(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, '') || '/';
  return pathWithoutLocale === '/about';
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
    const projectId = extractProjectId(pathname);
    if (projectId) {
      // 避免重复触发
      if (lastTriggeredPath.current === pathname) return;
      lastTriggeredPath.current = pathname;

      // 如果有对应的项目介绍，触发 AI 介绍
      if (PROJECT_INTROS[projectId]) {
        setTimeout(() => {
          addMessage({ role: 'assistant', content: PROJECT_INTROS[projectId] });
        }, 1000);
      }
      return;
    }

    // 避免重复触发同一路径
    if (lastTriggeredPath.current === pathname) return;
    lastTriggeredPath.current = pathname;

    // 首次进入首页 - 根据时间段打招呼
    if (isHomePage(pathname)) {
      setTimeout(() => {
        addMessage({ role: 'assistant', content: getTimeGreeting() });
      }, 2000);
      return;
    }

    // 进入项目列表页
    if (isProjectsListPage(pathname)) {
      setTimeout(() => {
        addMessage({ role: 'assistant', content: PAGE_INTROS.projects });
      }, 1500);
      return;
    }

    // 进入关于页
    if (isAboutPage(pathname)) {
      setTimeout(() => {
        addMessage({ role: 'assistant', content: PAGE_INTROS.about });
      }, 1500);
      return;
    }

    // 进入博客列表页
    if (isBlogListPage(pathname)) {
      setTimeout(() => {
        addMessage({ role: 'assistant', content: PAGE_INTROS.blog });
      }, 1500);
      return;
    }

    // 长时间停留主动询问（兜底）
    const timeout = TRIGGER_TIMEOUTS[area] || 30;
    timeoutRef.current = setTimeout(() => {
      if (messages.length === 0) {
        addMessage({
          role: 'assistant',
          content: PAGE_INTROS[area] || PAGE_INTROS.home
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
