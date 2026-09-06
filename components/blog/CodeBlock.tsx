"use client";

import { Children, isValidElement, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/**
 * 博客代码块包装：语言标签 + 一键复制。
 * 语言取自子元素 <code class="language-xxx">（rehype-highlight 保留该类）。
 */
export default function CodeBlock({ children }: { children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  let language = "";
  const firstChild = Children.toArray(children)[0];
  if (isValidElement<{ className?: string }>(firstChild)) {
    const match = /language-([\w-]+)/.exec(firstChild.props.className || "");
    if (match) language = match[1];
  }

  const handleCopy = async () => {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // 剪贴板不可用（如非安全上下文）时静默失败
    }
  };

  return (
    <div className="relative my-6 rounded-xl border border-foreground/10 bg-foreground/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10 bg-foreground/[0.03]">
        <span className="text-xs font-mono uppercase tracking-widest text-secondary/70">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          aria-label="复制代码"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-secondary/70 hover:text-primary hover:bg-primary/10 transition-colors cursor-target"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <pre
        ref={preRef}
        className="p-4 overflow-x-auto text-sm leading-relaxed"
      >
        {children}
      </pre>
    </div>
  );
}
