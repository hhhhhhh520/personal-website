import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations } from "next-intl/server";
import { blogs, BlogPost, getBlogBySlug, getRelatedBlogs } from "@/data/blogs";
import { getBlogContent } from "@/lib/blog-content";
import { mdxComponents } from "@/components/blog/MDXComponents";
import BlogDetailClient, {
  AnimatedSection,
  AnimatedFade,
} from "./BlogDetailClient";

// Site configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://suchang.dev";
const AUTHOR_NAME = "Su Chang";

// Generate static params for all blog posts
export function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

// Generate metadata for each blog post with enhanced SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
    };
  }

  const title = `${blog.title} | ${AUTHOR_NAME} Blog`;
  const description = blog.excerpt;
  const url = `${SITE_URL}/${locale}/blog/${blog.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: `${AUTHOR_NAME} Blog`,
      type: "article",
      authors: [blog.author.name],
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      tags: blog.tags,
      ...(blog.coverImage && {
        images: [
          {
            url: blog.coverImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      }),
      locale: locale === "en" ? "en_US" : "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(blog.coverImage && { images: [blog.coverImage] }),
      creator: "@suchang",
    },
    alternates: {
      canonical: url,
    },
    keywords: blog.tags,
  };
}

// Generate JSON-LD structured data for a blog post
function generateBlogJsonLd(blog: BlogPost, categoryLabel: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    author: {
      "@type": "Person",
      name: blog.author.name,
      url: SITE_URL,
    },
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${blog.slug}`,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    articleSection: categoryLabel,
    keywords: blog.tags.join(", "),
    wordCount: blog.excerpt.split(/\s+/).length,
    timeRequired: `PT${blog.readTime}M`,
    ...(blog.coverImage && { image: blog.coverImage }),
  };
}

// Format date for display
function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Category badge colors
const categoryColors: Record<BlogPost["category"], string> = {
  "ai-development": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "project-experience": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "technical-tutorial": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "career-growth": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "tech-insights": "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const blog = getBlogBySlug(slug);
  const t = await getTranslations({ locale, namespace: "blog" });

  // Handle blog not found
  if (!blog) {
    notFound();
  }

  // Get related blogs
  const relatedBlogs = getRelatedBlogs(blog.id, 3);

  // Get category label from translations
  const categoryLabel = t(`categories.${blog.category}`);
  const categoryClassName = categoryColors[blog.category];

  // Generate JSON-LD structured data
  const jsonLd = generateBlogJsonLd(blog, categoryLabel);

  // Get MDX content
  const content = getBlogContent(blog);

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pt-16 pb-12">
        <BlogDetailClient>
          {/* Hero Section */}
          <AnimatedFade>
            <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[320px] rounded-2xl overflow-hidden mb-8">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
                </div>
              </div>

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
                style={{
                  background: `linear-gradient(to top, rgba(15,15,35,1) 0%, rgba(15,15,35,0.7) 40%, rgba(15,15,35,0.2) 100%)`,
                }}
              />

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Category */}
                  <div className="mb-4">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${categoryClassName}`}>
                      {categoryLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                    {blog.title}
                  </h1>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary/80">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">
                          {blog.author.name.charAt(0)}
                        </span>
                      </div>
                      <span>{blog.author.name}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{t("detail.publishedOn")} {formatDate(blog.createdAt, locale)}</span>
                    </div>

                    {/* Read time */}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{blog.readTime} {t("minRead")}</span>
                    </div>

                    {/* Updated badge */}
                    {blog.updatedAt && (
                      <span className="px-2 py-0.5 text-xs rounded bg-foreground/10 text-secondary/60">
                        Updated {formatDate(blog.updatedAt, locale)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedFade>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back navigation */}
            <AnimatedFade>
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass hover:border-primary/40 transition-all duration-300 mb-8 group cursor-target"
              >
                <svg
                  className="w-4 h-4 text-secondary group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-secondary group-hover:text-primary transition-colors">{t("detail.backToBlog")}</span>
              </Link>
            </AnimatedFade>

            {/* Excerpt */}
            <AnimatedSection>
              <div className="glass rounded-xl p-6 mb-6">
                <p className="text-lg text-secondary leading-relaxed italic border-l-2 border-primary/30 pl-4">
                  {blog.excerpt}
                </p>
              </div>
            </AnimatedSection>

            {/* Tags */}
            <AnimatedSection>
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary/90 border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all duration-200">
                    {tag}
                  </span>
                ))}
              </div>
            </AnimatedSection>

            {/* Content */}
            <AnimatedSection>
              <article className="glass rounded-xl p-6 sm:p-8 lg:p-10 mb-8">
                <div className="prose prose-invert max-w-none">
                  <MDXRemote source={content} components={mdxComponents} />
                </div>
              </article>
            </AnimatedSection>

            {/* Author Card */}
            <AnimatedSection>
              <div className="glass rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {blog.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">{blog.author.name}</h3>
                    <p className="text-secondary text-sm">{blog.author.bio}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
              <AnimatedSection>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                    {t("detail.relatedArticles")}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog.id}
                        href={`/${locale}/blog/${relatedBlog.slug}`}
                        className="glass rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group cursor-target"
                      >
                        {/* Category & Read Time */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${categoryColors[relatedBlog.category]}`}>
                            {t(`categories.${relatedBlog.category}`)}
                          </span>
                          <span className="text-xs text-secondary/60">{relatedBlog.readTime} {t("minRead")}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-foreground font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedBlog.title}
                        </h4>

                        {/* Excerpt */}
                        <p className="text-secondary text-sm line-clamp-2 mb-3">{relatedBlog.excerpt}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {relatedBlog.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded bg-foreground/5 text-secondary/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Back to Blog */}
            <AnimatedSection>
              <div className="text-center pt-8 border-t border-foreground/10">
                <Link
                  href={`/${locale}/blog`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 cursor-target"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{t("detail.backToBlog")}</span>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </BlogDetailClient>
      </div>
    </>
  );
}