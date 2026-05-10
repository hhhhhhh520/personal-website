"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { personal } from "@/data/personal";

// Dynamic import for 3D scene (SSR disabled) - loads only when needed
const MainScene = dynamic(
  () => import("@/components/three/MainScene").then((mod) => mod.MainScene),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-surface" />
    ),
  }
);

type ViewMode = "3d" | "resume";

export default function Home() {
  const t = useTranslations("home");
  const { isMobile } = useDeviceCapabilities();
  // Use lazy initialization to compute initial mode based on device
  // This runs only once on mount, avoiding the cascading render issue
  const [mode, setMode] = useState<ViewMode>(() => (isMobile ? "resume" : "3d"));

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "3d" ? "resume" : "3d"));
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* 3D Scene Container - Full screen background */}
      <div className="fixed inset-0 -z-10">
        {mode === "3d" && <MainScene />}
      </div>

      {/* Mode Toggle Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed top-20 right-4 z-20"
      >
        <button
          onClick={toggleMode}
          className="px-4 py-2 rounded-full glass border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all duration-300"
          aria-label={`Switch to ${mode === "3d" ? "resume" : "3D"} mode`}
        >
          {mode === "3d" ? "View Resume" : "Back to 3D"}
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center pt-16 px-4"
      >
        {mode === "3d" ? (
          <div className="max-w-4xl w-full text-center relative z-10">
            {/* Hero greeting */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-secondary text-lg mb-4"
            >
              {t("greeting")}
            </motion.p>

            {/* Name with gradient */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">{personal.name}</span>
            </motion.h1>

            {/* Role */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl text-secondary mb-8"
            >
              {t("title")}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-secondary max-w-2xl mx-auto mb-12"
            >
              {t("summary")}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/projects"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity glow"
              >
                {t("viewProjects")}
              </Link>
              <Link
                href="/about"
                className="px-8 py-3 rounded-full border border-border text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {t("aboutMe")}
              </Link>
            </motion.div>

            {/* Tech stack preview */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 flex flex-wrap justify-center gap-3"
            >
              {personal.skills.flatMap((s) => s.items).slice(0, 8).map(
                (tech, index) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full text-sm text-secondary glass hover:text-primary hover:border-primary transition-colors"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {tech}
                  </span>
                )
              )}
            </motion.div>
          </div>
        ) : (
          /* Resume Mode Content */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl w-full glass rounded-xl p-8 relative z-10"
          >
            <h2 className="text-3xl font-bold gradient-text mb-6">
              {t("viewProjects") === "View Projects" ? "Resume Preview" : "简历预览"}
            </h2>

            {/* Education */}
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {t("viewProjects") === "View Projects" ? "Education" : "教育背景"}
                </h3>
                {personal.education.map((edu, i) => (
                  <div key={i} className="text-secondary text-sm">
                    <p className="font-medium text-foreground">{edu.school} - {edu.major}</p>
                    <p>{edu.degree} | {edu.startDate} - {edu.endDate || (t("viewProjects") === "View Projects" ? "Present" : "至今")}</p>
                    {edu.highlights && (
                      <ul className="mt-1 list-disc list-inside">
                        {edu.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {t("viewProjects") === "View Projects" ? "Skills" : "技能"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {personal.skills.map((cat) => (
                    <div key={cat.category} className="text-sm">
                      <span className="text-primary font-medium">{cat.category}:</span>
                      <span className="text-secondary ml-1">{cat.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {t("viewProjects") === "View Projects" ? "Experience" : "项目经历"}
                </h3>
                {personal.experience?.map((exp, i) => (
                  <div key={i} className="text-secondary text-sm">
                    <p className="font-medium text-foreground">{exp.company} - {exp.position}</p>
                    <p>{exp.startDate} - {exp.endDate || (t("viewProjects") === "View Projects" ? "Present" : "至今")} | {exp.location}</p>
                    <ul className="mt-1 list-disc list-inside">
                      {exp.description.map((d, j) => <li key={j}>{d}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {t("viewProjects") === "View Projects" ? "Contact" : "联系方式"}
                </h3>
                <div className="text-secondary text-sm space-y-1">
                  <p>{t("viewProjects") === "View Projects" ? "Email" : "邮箱"}: {personal.email}</p>
                  {personal.phone && <p>{t("viewProjects") === "View Projects" ? "Phone" : "手机"}: {personal.phone}</p>}
                  <p>{t("viewProjects") === "View Projects" ? "Location" : "位置"}: {personal.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
