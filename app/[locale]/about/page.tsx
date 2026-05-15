"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { personal } from "@/data/personal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, GraduationCap, Lightbulb, ArrowLeft } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t("pageTitle")}
          </h1>
        </motion.div>

        {/* Main content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Profile card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Avatar placeholder */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white shrink-0">
                    {personal.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {personal.name}
                    </h2>
                    <p className="text-primary font-medium mb-4">{personal.title}</p>
                    <p className="text-secondary leading-relaxed">{personal.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact info */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {t("contact")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-secondary"><Mail className="w-4 h-4" /></span>
                    <a
                      href={`mailto:${personal.email}`}
                      className="text-foreground hover:text-primary transition-colors cursor-target"
                    >
                      {personal.email}
                    </a>
                  </div>
                  {personal.phone && (
                    <div className="flex items-center gap-3">
                      <span className="text-secondary"><Phone className="w-4 h-4" /></span>
                      <span className="text-foreground">{personal.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-secondary"><MapPin className="w-4 h-4" /></span>
                    <span className="text-foreground">{personal.location}</span>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex gap-4 mt-6">
                  {personal.socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg glass flex items-center justify-center text-sm font-bold hover:border-primary hover:text-primary transition-colors cursor-target"
                      aria-label={social.platform}
                    >
                      {social.platform === 'GitHub' ? 'GH' : social.platform === 'Email' ? '@' : social.platform.charAt(0)}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Education */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {t("education")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personal.education.map((edu, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="border-l-2 border-primary/30 pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h4 className="font-medium text-foreground">{edu.degree} - {edu.major}</h4>
                        <span className="text-sm text-secondary">{edu.startDate} - {edu.endDate || t("present")}</span>
                      </div>
                      <p className="text-primary text-sm">{edu.school}</p>
                      {edu.highlights && (
                        <ul className="text-secondary text-sm mt-1 list-disc list-inside">
                          {edu.highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Interests */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2"><Lightbulb className="w-4 h-4" /> {t("interests")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {personal.focus.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-2 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors cursor-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("backToHome")}</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
