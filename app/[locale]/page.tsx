"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { personal } from "@/data/personal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LightRays from "@/components/effects/LightRays";

type ViewMode = "home" | "resume";

export default function Home() {
  const t = useTranslations("home");
  const { isMobile } = useDeviceCapabilities();
  const [mode, setMode] = useState<ViewMode>(() => (isMobile ? "resume" : "home"));

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "home" ? "resume" : "home"));
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Light Rays Background */}
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #0f0f23, #1a1a2e)" }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#6366f1"
          raysSpeed={0.8}
          lightSpread={0.6}
          rayLength={2.5}
          followMouse={true}
          mouseInfluence={0.15}
          pulsating={false}
          fadeDistance={1.2}
          saturation={0.8}
        />
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
          className="px-4 py-2 rounded-full glass border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all duration-300 pointer-events-auto cursor-target"
          aria-label={`Switch to ${mode === "home" ? "resume" : "home"} mode`}
        >
          {mode === "home" ? (t("viewProjects") === "View Projects" ? "View Resume" : "查看简历") : (t("viewProjects") === "View Projects" ? "Back to Home" : "返回首页")}
        </button>
      </motion.div>

      {/* Main Content — pointer-events-none lets 3D portal clicks through */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 pointer-events-none"
      >
        {mode === "home" ? (
          <div className="max-w-4xl w-full text-center relative z-10 p-8 sm:p-12 rounded-2xl" style={{ background: "rgba(15,15,35,0.55)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {/* Hero greeting */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/70 text-lg mb-4"
            >
              {t("greeting")}
            </motion.p>

            {/* Name with gradient */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-7xl font-bold mb-6 text-white"
            >
              {personal.name}
            </motion.h1>

            {/* Role */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl text-indigo-300 mb-8"
            >
              {t("title")}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/60 max-w-2xl mx-auto mb-12"
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
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity glow pointer-events-auto cursor-target"
              >
                {t("viewProjects")}
              </Link>
              <Link
                href="/about"
                className="px-8 py-3 rounded-full border border-white/30 text-white/80 font-medium hover:border-white/60 hover:text-white transition-colors pointer-events-auto cursor-target"
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
                    className="px-4 py-2 rounded-full text-sm text-white/60 border border-white/10 hover:text-white hover:border-white/30 transition-colors pointer-events-auto cursor-target"
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
            className="max-w-3xl w-full relative z-10 pointer-events-auto space-y-4"
          >
            <h2 className="text-3xl font-bold gradient-text mb-6">
              {t("viewProjects") === "View Projects" ? "Resume Preview" : "简历预览"}
            </h2>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t("viewProjects") === "View Projects" ? "Education" : "教育背景"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personal.education.map((edu, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="my-3" />}
                    <div className="text-secondary text-sm">
                      <p className="font-medium text-foreground">{edu.school} - {edu.major}</p>
                      <p>{edu.degree} | {edu.startDate} - {edu.endDate || (t("viewProjects") === "View Projects" ? "Present" : "至今")}</p>
                      {edu.highlights && (
                        <ul className="mt-1 list-disc list-inside">
                          {edu.highlights.map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t("viewProjects") === "View Projects" ? "Skills" : "技能"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {personal.skills.map((cat) => (
                    <div key={cat.category} className="text-sm">
                      <span className="text-primary font-medium">{cat.category}:</span>
                      <span className="text-secondary ml-1">{cat.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t("viewProjects") === "View Projects" ? "Experience" : "项目经历"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personal.experience?.map((exp, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="my-3" />}
                    <div className="text-secondary text-sm">
                      <p className="font-medium text-foreground">{exp.company} - {exp.position}</p>
                      <p>{exp.startDate} - {exp.endDate || (t("viewProjects") === "View Projects" ? "Present" : "至今")} | {exp.location}</p>
                      <ul className="mt-1 list-disc list-inside">
                        {exp.description.map((d, j) => <li key={j}>{d}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t("viewProjects") === "View Projects" ? "Contact" : "联系方式"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-secondary text-sm space-y-1">
                  <p>{t("viewProjects") === "View Projects" ? "Email" : "邮箱"}: {personal.email}</p>
                  {personal.phone && <p>{t("viewProjects") === "View Projects" ? "Phone" : "手机"}: {personal.phone}</p>}
                  <p>{t("viewProjects") === "View Projects" ? "Location" : "位置"}: {personal.location}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
