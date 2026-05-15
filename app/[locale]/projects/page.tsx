"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { projects, Project } from "@/data/projects";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Status badge component
function StatusBadge({ status, t }: { status: Project["status"]; t: ReturnType<typeof useTranslations<"projects">> }) {
  const statusConfig = {
    completed: {
      label: t("status.completed"),
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    "in-progress": {
      label: t("status.inProgress"),
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    archived: {
      label: t("status.archived"),
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
  };

  const config = statusConfig[status];
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// Category badge component
function CategoryBadge({ category, t }: { category: Project["category"]; t: ReturnType<typeof useTranslations<"projects">> }) {
  const categoryConfig = {
    ai: { label: t("category.ai"), className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    web: { label: t("category.web"), className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    android: { label: t("category.android"), className: "bg-green-500/20 text-green-400 border-green-500/30" },
    tool: { label: t("category.tool"), className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  };

  const config = categoryConfig[category];
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

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

export default function ProjectsPage() {
  const t = useTranslations("projects");

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
              {t("pageTitle")}
            </h1>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto mb-6">
            {t("pageDescription")}
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="cursor-target">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <Card className="hover:border-primary/50 transition-all duration-300 group h-full">
                  {/* Project image with SVG cover */}
                  <div className="relative w-full h-48 overflow-hidden group/cover">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover group-hover/cover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(to top, ${project.color}60, transparent)` }}
                    />
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <StatusBadge status={project.status} t={t} />
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.shortDesc}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.highlights.slice(0, 3).map((highlight) => (
                        <span
                          key={highlight}
                          className="px-2 py-0.5 text-xs rounded bg-foreground/5 text-secondary"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {/* Tech stack tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-3 py-1 text-xs rounded-full bg-foreground/5 text-secondary">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <div className="flex items-center justify-between w-full">
                      <CategoryBadge category={project.category} t={t} />
                      <div className="flex gap-3">
                        {project.github && (
                          <span className="text-secondary text-sm hover:text-primary transition-colors">
                            {t("viewCode")}
                          </span>
                        )}
                        {project.demo && (
                          <span className="text-secondary text-sm hover:text-primary transition-colors">
                            {t("viewDemo")}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
