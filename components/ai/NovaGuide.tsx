'use client';

/**
 * NovaGuide - AI 向导悬浮组件
 * 提供对话式交互界面，帮助访客了解站长信息
 * 移动端优化：全屏对话面板、底部安全区域适配、手势支持
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useChat } from '@/hooks/useChat';
import { useNovaTriggers } from '@/hooks/useNovaTriggers';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { usePathname } from 'next/navigation';
import { QUICK_REPLIES } from '@/data/nova-prompts';
import { QuickResume } from '@/components/QuickResume';
import { LoadingDots } from './LoadingDots';

// 根据路径获取当前页面区域
function getPageArea(pathname: string): string {
  if (pathname === '/' || pathname === '/home') return 'home';
  if (pathname.startsWith('/hall')) return 'hall';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/blog')) return 'blog';
  return 'home';
}

export function NovaGuide() {
  const t = useTranslations('nova');
  const tResume = useTranslations('resume');
  const [isOpen, setIsOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const pathname = usePathname();
  const device = useDeviceCapabilities();

  // 检测移动端 - 使用 useMemo 避免在 useEffect 中同步调用 setState
  const isMobile = useMemo(
    () => device.isMobile || (typeof window !== 'undefined' && window.innerWidth < 768),
    [device.isMobile]
  );

  // 场景触发：进入项目页自动介绍、首次进入欢迎、长时间停留主动询问
  useNovaTriggers();

  // 从 URL 提取项目 ID
  const projectId = pathname.startsWith('/projects/')
    ? pathname.split('/')[2]
    : undefined;

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({ projectId });

  // 获取当前页面的快捷回复
  const pageArea = getPageArea(pathname);
  const quickReplies = QUICK_REPLIES[pageArea] || QUICK_REPLIES.home;

  // 滑动手势关闭（移动端）
  const handleSwipeClose = useCallback(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const { handlers: touchHandlers } = useTouchGestures({
    onSwipe: (direction) => {
      if (direction === 'down') {
        handleSwipeClose();
      }
    },
    swipeThreshold: 80,
  });

  // 面板动画变体 - 移动端从底部滑入
  const panelVariants = isMobile
    ? {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
      }
    : {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
      };

  return (
    <>
      {/* 快速简历侧边栏 */}
      <AnimatePresence>
        {showResume && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResume(false)}
              className="fixed inset-0 bg-black/50 z-[55]"
            />
            {/* 简历侧边栏 */}
            <QuickResume onClose={() => setShowResume(false)} />
          </>
        )}
      </AnimatePresence>

      {/* 快速简历按钮 - 移动端调整位置避开底部导航 */}
      <motion.button
        className={`fixed w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg flex items-center justify-center z-50 ${
          isMobile ? 'bottom-20 left-4' : 'bottom-6 left-6'
        }`}
        onClick={() => {
          setShowResume(true);
          setIsOpen(false); // 打开简历时收起对话面板
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={tResume('viewQuickResume')}
      >
        <span className="text-lg">CV</span>
      </motion.button>

      {/* 悬浮头像按钮 - 移动端调整位置避开底部导航 */}
      <motion.button
        className={`fixed w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center z-50 ${
          isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? t('closeNova') : t('openNova')}
      >
        <span className="text-2xl">✨</span>
      </motion.button>

      {/* 对话面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`${
              isMobile
                ? 'fixed inset-x-0 bottom-0 top-20 rounded-t-3xl max-h-[85vh]'
                : 'fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-2xl'
            } bg-gray-900/95 backdrop-blur-lg shadow-2xl border border-gray-700 z-50 overflow-hidden flex flex-col`}
            {...(isMobile ? touchHandlers : {})}
          >
            {/* 拖动指示条（移动端） */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
            )}

            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t('title')}</h3>
                  <p className="text-xs text-gray-400">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
                  aria-label={t('clear')}
                >
                  {t('clear')}
                </button>
                {isMobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
                    aria-label="关闭面板"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 消息列表 */}
            <div className={`${isMobile ? 'flex-1' : 'h-80'} overflow-y-auto p-4 space-y-4`}>
              {/* API Key 未配置提示 */}
              {error?.type === 'API_KEY_NOT_CONFIGURED' && (
                <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
                  <p className="font-medium mb-1">{t('apiKeyNotConfigured')}</p>
                  <p className="text-yellow-300/80 text-xs">
                    {t('apiKeyHint')}
                  </p>
                </div>
              )}

              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p className="mb-4">{t('greeting')}</p>
                  <p className="text-sm">{t('askAnything')}</p>
                  {/* 快捷操作 */}
                  <div className="mt-4 space-y-2">
                    {quickReplies.slice(0, 3).map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(reply)}
                        className="block w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors active:scale-[0.98]"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 px-4 py-2 rounded-2xl text-gray-400">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>

            {/* 输入框 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.querySelector('input');
                if (input?.value.trim()) {
                  sendMessage(input.value.trim());
                  input.value = '';
                }
              }}
              className="p-4 border-t border-gray-700 flex-shrink-0"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('inputPlaceholder')}
                  className={`flex-1 bg-gray-800 text-white px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500 ${
                    isMobile ? 'text-base' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="off"
                  inputMode="text"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 transition-colors font-medium"
                  disabled={isLoading}
                >
                  {t('send')}
                </button>
              </div>
            </form>

            {/* 移动端底部安全区域 */}
            {isMobile && <div className="h-safe-area-inset-bottom bg-transparent" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端背景遮罩 */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-[49]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
