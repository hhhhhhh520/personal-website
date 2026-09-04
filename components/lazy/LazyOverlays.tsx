"use client";

import dynamic from "next/dynamic";

/**
 * 懒加载的全局交互覆盖层（AI 向导 + 自定义光标）。
 *
 * 之所以单独包一层客户端组件：根布局是 Server Component，
 * `next/dynamic` 的 `ssr: false` 只能在客户端组件里使用。
 * 懒加载后，NovaGuide（聊天）与 TargetCursor（gsap）的代码
 * 不再进入首屏关键路径。
 */
const NovaGuide = dynamic(
  () => import("@/components/ai/NovaGuide").then((m) => m.NovaGuide),
  { ssr: false }
);

const TargetCursor = dynamic(() => import("@/components/effects/TargetCursor"), {
  ssr: false,
});

export function LazyOverlays() {
  return (
    <>
      <NovaGuide />
      <TargetCursor />
    </>
  );
}
