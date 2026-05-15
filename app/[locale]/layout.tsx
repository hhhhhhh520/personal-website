import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navigation from "@/components/ui/Navigation";
import MobileNav from "@/components/ui/MobileNav";
import PageTransition from "@/components/ui/PageTransition";
import { PerformanceMonitor, emitWebVital } from "@/components/ui/PerformanceMonitor";
import { NovaGuide } from "@/components/ai";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { personal } from "@/data/personal";
import TargetCursor from "@/components/effects/TargetCursor";

// Web Vitals metric type (Next.js 16 compatible)
interface WebVitalsMetric {
  name: string;
  value: number;
  rating?: string;
  id?: string;
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localized = locale === 'en'
    ? { title: personal.titleEn || personal.title, summary: personal.summaryEn || personal.summary }
    : { title: personal.title, summary: personal.summary };

  return {
    title: {
      default: `${personal.name} - ${localized.title}`,
      template: `%s | ${personal.name}`,
    },
    description: localized.summary,
    keywords: [
      personal.name,
      personal.title,
      ...personal.focus,
      ...personal.skills.flatMap((s) => s.items),
    ],
    authors: [{ name: personal.name }],
    creator: personal.name,
    openGraph: {
      type: "website",
      locale: locale === 'zh' ? "zh_CN" : "en_US",
      title: `${personal.name} - ${localized.title}`,
      description: localized.summary,
      siteName: locale === 'en' ? `${personal.name}'s Portfolio` : `${personal.name}的个人网站`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${personal.name} - ${localized.title}`,
      description: localized.summary,
    },
  };
}

// Web Vitals 性能监控上报函数
export function reportWebVitals(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
    emitWebVital({ name: metric.name, value: metric.value });
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'zh' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
        <Navigation />

        {/* Main content */}
        <main className="flex-1 relative">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-secondary text-sm border-t border-border/50 pb-20 md:pb-6">
          <p>&copy; 2024-2026 {personal.name}. {locale === 'en' ? 'All rights reserved.' : '保留所有权利。'}</p>
        </footer>

        {/* Mobile bottom navigation */}
        <MobileNav />

        {/* AI 向导 - 全局可用 */}
        <NovaGuide />

        {/* 自定义鼠标光标 */}
        <TargetCursor />

        {/* 性能监控面板 - 仅开发环境显示 */}
        <PerformanceMonitor />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
