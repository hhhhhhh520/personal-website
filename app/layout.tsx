import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { personal } from "@/data/personal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${personal.name} | AI 应用开发者`,
  description: `${personal.name}的个人作品集 — AI 应用、多 Agent 架构与技术博客`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var t=localStorage.getItem('theme');var d=t==='light'?'light':'dark';document.documentElement.classList.add(d)}catch(e){document.documentElement.classList.add('dark')}})()`}</Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
