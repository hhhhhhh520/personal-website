"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  skills,
  getSkillsGroupedByCategory,
  getSkillCountByCategory,
  type Skill,
  type SkillCategory,
} from "@/data/skills";
import { projects } from "@/data/projects";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

// Dynamic import for 3D scene (SSR disabled)
const SkillScene = dynamic(
  () => import("@/components/three/SkillScene").then((mod) => mod.default),
  { ssr: false }
);

// View mode type
type ViewMode = "3d" | "list";

// View toggle button icons
const Icons = {
  cube: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  list: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  close: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// Category configuration
const categoryConfig: Record<
  SkillCategory,
  { label: string; icon: string; className: string }
> = {
  language: {
    label: "编程语言",
    icon: "Code",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  framework: {
    label: "框架",
    icon: "Package",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  tool: {
    label: "工具",
    icon: "Wrench",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  concept: {
    label: "概念",
    icon: "Lightbulb",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

// Level configuration
const levelConfig: Record<Skill["level"], { label: string; className: string }> = {
  expert: {
    label: "精通",
    className: "bg-primary/30 text-primary border-primary/40",
  },
  proficient: {
    label: "熟练",
    className: "bg-accent/30 text-accent border-accent/40",
  },
  familiar: {
    label: "了解",
    className: "bg-secondary/30 text-secondary border-secondary/40",
  },
};

// Category badge component
function CategoryBadge({ category }: { category: SkillCategory }) {
  const config = categoryConfig[category];
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

// Level badge component
function LevelBadge({ level }: { level: Skill["level"] }) {
  const config = levelConfig[level];
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

// Skill detail panel component
function SkillDetailPanel({
  skill,
  onClose,
}: {
  skill: Skill;
  onClose: () => void;
}) {
  // Get related projects
  const relatedProjects = useMemo(() => {
    return projects.filter((p) => skill.projects.includes(p.id));
  }, [skill]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed right-4 top-24 bottom-4 w-80 z-50 glass rounded-xl p-6 overflow-y-auto"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-foreground/10 transition-colors"
      >
        {Icons.close}
      </button>

      {/* Skill header */}
      <div className="mb-6 pr-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: `${skill.color}30` }}
        >
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: skill.color }}
          />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{skill.name}</h2>
        <div className="flex gap-2 flex-wrap">
          <CategoryBadge category={skill.category} />
          <LevelBadge level={skill.level} />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-secondary mb-2">描述</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {skill.description}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-secondary mb-2">经验</h3>
        <div className="flex items-center gap-2">
          <div
            className="h-2 flex-1 rounded-full bg-foreground/10 overflow-hidden"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(skill.years * 25, 100)}%`,
                backgroundColor: skill.color,
              }}
            />
          </div>
          <span className="text-sm text-foreground">{skill.years} 年</span>
        </div>
      </div>

      {/* Related projects */}
      {relatedProjects.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary mb-3">
            关联项目 ({relatedProjects.length})
          </h3>
          <div className="space-y-2">
            {relatedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {project.name}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-1 line-clamp-1">
                  {project.shortDesc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Stats section component
function StatsSection() {
  const skillCounts = getSkillCountByCategory();
  const totalSkills = skills.length;
  const expertCount = skills.filter((s) => s.level === "expert").length;
  const totalYears = skills.reduce((sum, s) => sum + s.years, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="p-4 rounded-lg bg-foreground/5">
        <div className="text-2xl font-bold text-primary mb-1">{totalSkills}</div>
        <div className="text-xs text-secondary">总技能数</div>
      </div>
      <div className="p-4 rounded-lg bg-foreground/5">
        <div className="text-2xl font-bold text-accent mb-1">{expertCount}</div>
        <div className="text-xs text-secondary">精通技能</div>
      </div>
      <div className="p-4 rounded-lg bg-foreground/5">
        <div className="text-2xl font-bold text-green-400 mb-1">{totalYears}</div>
        <div className="text-xs text-secondary">累计经验年</div>
      </div>
      <div className="p-4 rounded-lg bg-foreground/5">
        <div className="text-2xl font-bold text-purple-400 mb-1">
          {skillCounts.language}
        </div>
        <div className="text-xs text-secondary">编程语言</div>
      </div>
    </div>
  );
}

// Category filter tabs
function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: SkillCategory | null;
  onSelect: (category: SkillCategory | null) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
          selected === null
            ? "bg-primary/20 text-primary border-primary/40"
            : "bg-foreground/5 text-secondary border-foreground/10 hover:border-foreground/20"
        }`}
      >
        全部
      </button>
      {(["language", "framework", "tool", "concept"] as SkillCategory[]).map(
        (category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
              selected === category
                ? categoryConfig[category].className
                : "bg-foreground/5 text-secondary border-foreground/10 hover:border-foreground/20"
            }`}
          >
            {categoryConfig[category].label}
          </button>
        )
      )}
    </div>
  );
}

// Skill list card component
function SkillCard({ skill }: { skill: Skill }) {
  const relatedProjects = useMemo(() => {
    return projects.filter((p) => skill.projects.includes(p.id));
  }, [skill]);

  return (
    <motion.div
      className="glass rounded-xl p-5 hover:border-primary/50 transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${skill.color}30` }}
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: skill.color }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{skill.name}</h3>
            <div className="flex gap-1.5 mt-1">
              <CategoryBadge category={skill.category} />
              <LevelBadge level={skill.level} />
            </div>
          </div>
        </div>
        <span className="text-sm text-secondary">{skill.years}年</span>
      </div>

      {/* Description */}
      <p className="text-sm text-secondary line-clamp-2 mb-3">
        {skill.description}
      </p>

      {/* Related projects count */}
      {relatedProjects.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-secondary">
          <span>关联项目:</span>
          <div className="flex -space-x-1">
            {relatedProjects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="w-5 h-5 rounded-full border border-background"
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
            {relatedProjects.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs">
                +{relatedProjects.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export default function SkillsPage() {
  const { isMobile, hasWebGL } = useDeviceCapabilities();
  // Start with default "list" view to avoid hydration mismatch
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mounted, setMounted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<SkillCategory | null>(null);

  // Set the correct view mode after component mounts
  useEffect(() => {
    if (isMobile || !hasWebGL) {
      setViewMode("list");
    } else if (hasWebGL) {
      setViewMode("3d");
    }
    setMounted(true);
  }, [isMobile, hasWebGL]);

  // Toggle between view modes
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "3d" ? "list" : "3d"));
  };

  // Handle skill click from 3D scene
  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  // Filter skills for list view
  const filteredSkills = useMemo(() => {
    if (!filterCategory) return skills;
    return skills.filter((s) => s.category === filterCategory);
  }, [filterCategory]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
              技能矩阵
            </h1>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto mb-6">
            我的技术栈和能力分布，每个技能都经过项目实践的检验
          </p>

          {/* Category filter */}
          <div className="mb-4">
            <CategoryFilter
              selected={filterCategory}
              onSelect={setFilterCategory}
            />
          </div>

          {/* View Mode Toggle Button */}
          {mounted && hasWebGL && (
            <motion.button
              onClick={toggleViewMode}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="text-primary"
                >
                  {viewMode === "3d" ? Icons.list : Icons.cube}
                </motion.div>
              </AnimatePresence>
              <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">
                {viewMode === "3d" ? "列表视图" : "3D 视图"}
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StatsSection />
        </motion.div>

        {/* View Content */}
        <AnimatePresence mode="wait">
          {viewMode === "3d" && hasWebGL ? (
            // 3D View
            <motion.div
              key="3d-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-[500px] rounded-xl overflow-hidden glass"
            >
              <SkillScene
                onSkillClick={handleSkillClick}
                onSkillHover={setHoveredSkillId}
                hoveredSkillId={hoveredSkillId}
                filterCategory={filterCategory}
              />
              {/* 3D View Instructions */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-sm">
                  拖拽旋转 | 滚轮缩放 | 点击技能查看详情
                </div>
              </div>
            </motion.div>
          ) : (
            // List View
            <motion.div
              key="list-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skill detail panel */}
        <AnimatePresence>
          {selectedSkill && (
            <SkillDetailPanel
              skill={selectedSkill}
              onClose={() => setSelectedSkill(null)}
            />
          )}
        </AnimatePresence>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <span>-</span>
            <span>返回首页</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}