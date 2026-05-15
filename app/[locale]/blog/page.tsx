"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  blogs,
  BlogPost,
  BlogCategory,
  getAllTags,
  getAllCategories,
  getBlogCountByCategory,
} from "@/data/blogs";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Animation variants
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const filterVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Icons
const Icons = {
  search: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  filter: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  clock: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  calendar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  tag: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l9.41 9.41a2 2 0 0 1 0 2.83z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

// Category badge colors
const categoryColors: Record<BlogCategory, string> = {
  "ai-development": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "project-experience": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "technical-tutorial": "bg-green-500/20 text-green-400 border-green-500/30",
  "career-growth": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "tech-insights": "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

// Category badge component
function CategoryBadge({ category, t }: { category: BlogCategory; t: ReturnType<typeof useTranslations<"blog">> }) {
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full border ${categoryColors[category]}`}
    >
      {t(`categories.${category}`)}
    </span>
  );
}

export default function BlogPage() {
  const t = useTranslations("blog");
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all unique tags and categories
  const allTags = useMemo(() => getAllTags(), []);
  const allCategories = useMemo(() => getAllCategories(), []);

  // Filter blogs based on selected filters and search
  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((blog) => blog.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt.toLowerCase().includes(query) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort by date (newest first)
    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [selectedCategory, selectedTag, searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery("");
  };

  // Check if any filter is active
  const hasActiveFilters = selectedCategory || selectedTag || searchQuery.trim();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            {t("pageDescription")}
          </p>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          variants={filterVariants}
          initial="hidden"
          animate="visible"
          className="glass rounded-xl p-4 mb-8"
        >
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                {Icons.search}
              </div>
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-secondary hover:text-foreground transition-colors text-sm whitespace-nowrap"
              >
                {t("clearFilters")}
              </motion.button>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-secondary">
              {Icons.filter}
              <span>{t("categoryFilter")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  selectedCategory === null
                    ? "bg-primary/20 text-primary border-primary/50"
                    : "bg-foreground/5 text-secondary border-foreground/10 hover:border-primary/30"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("all")} ({blogs.length})
              </motion.button>
              {allCategories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    selectedCategory === category
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "bg-foreground/5 text-secondary border-foreground/10 hover:border-primary/30"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t(`categories.${category}`)} ({getBlogCountByCategory(category)})
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-secondary">
              {Icons.tag}
              <span>{t("tagFilter")}</span>
              {selectedTag && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-primary font-medium"
                >
                  ({t("selected")}: {selectedTag})
                </motion.span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <motion.button
                  key={tag}
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? null : tag)
                  }
                  className={`px-2 py-0.5 text-xs rounded border transition-all ${
                    selectedTag === tag
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "bg-foreground/5 text-secondary border-foreground/10 hover:border-primary/30"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-sm text-secondary"
        >
          {hasActiveFilters ? (
            <span>
              {t("foundArticles", { count: filteredBlogs.length })}
            </span>
          ) : (
            <span>
              {t("totalArticles", { count: blogs.length })}
            </span>
          )}
        </motion.div>

        {/* Blog Posts Grid */}
        <AnimatePresence mode="wait">
          {filteredBlogs.length > 0 ? (
            <motion.div
              key="blog-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredBlogs.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="cursor-target">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="hover:border-primary/50 transition-all duration-300 group h-full">
                      {/* Cover Image */}
                      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            loading={index < 4 ? "eager" : "lazy"}
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <span className="text-6xl font-bold opacity-50 text-primary">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Featured Badge */}
                        {post.featured && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
                              {t("featured")}
                            </span>
                          </div>
                        )}
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <CategoryBadge category={post.category} t={t} />
                        </div>
                      </div>

                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs rounded bg-foreground/5 text-secondary">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter>
                        <div className="flex items-center justify-between w-full text-xs text-secondary">
                          <div className="flex items-center gap-1">
                            {Icons.calendar}
                            <span>{post.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Icons.clock}
                            <span>{post.readTime} {t("minRead")}</span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4 opacity-20 text-secondary">...</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("noResults")}
              </h3>
              <p className="text-secondary mb-6">
                {t("noResultsHint")}
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-target"
              >
                {t("clearAllFilters")}
              </button>
            </motion.div>
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
