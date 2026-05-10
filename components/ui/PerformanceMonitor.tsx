'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Web Vitals 评级标准
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000], // Largest Contentful Paint
    FID: [100, 300],   // First Input Delay
    CLS: [0.1, 0.25],  // Cumulative Layout Shift
    TTFB: [800, 1800], // Time to First Byte
    INP: [200, 500],   // Interaction to Next Paint
    FCPS: [1800, 3000], // First Contentful Paint (scaled)
  };

  const [good, poor] = thresholds[name] || [0, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// 颜色映射
const ratingColors = {
  good: 'text-green-400',
  'needs-improvement': 'text-yellow-400',
  poor: 'text-red-400',
};

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 仅在开发环境运行
    if (process.env.NODE_ENV !== 'development') return;

    // 监听自定义 web-vitals 事件
    const handleWebVitals = (e: CustomEvent<PerformanceMetric>) => {
      const metric = e.detail;
      setMetrics((prev) => {
        // 更新或添加指标
        const existing = prev.findIndex((m) => m.name === metric.name);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = metric;
          return updated;
        }
        return [...prev, metric];
      });
    };

    window.addEventListener('web-vitals', handleWebVitals as EventListener);

    // 快捷键切换显示 (Ctrl/Cmd + Shift + P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        setIsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('web-vitals', handleWebVitals as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 非开发环境或无数据时不渲染
  if (process.env.NODE_ENV !== 'development') return null;
  if (metrics.length === 0 && !isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
            Web Vitals
          </span>
          <span className="text-[10px] text-white/40">
            Ctrl+Shift+P
          </span>
        </div>
        <div className="space-y-1">
          {metrics.length === 0 ? (
            <div className="text-xs text-white/40">Loading metrics...</div>
          ) : (
            metrics.map((metric) => (
              <div key={metric.name} className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-mono">{metric.name}</span>
                <span className={`font-mono ${ratingColors[metric.rating]}`}>
                  {metric.name === 'CLS'
                    ? metric.value.toFixed(3)
                    : `${Math.round(metric.value)}ms`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 导出辅助函数，用于触发事件
export function emitWebVital(metric: { name: string; value: number }) {
  if (typeof window === 'undefined') return;

  const rating = getRating(metric.name, metric.value);
  const event = new CustomEvent('web-vitals', {
    detail: { ...metric, rating },
  });
  window.dispatchEvent(event);
}
