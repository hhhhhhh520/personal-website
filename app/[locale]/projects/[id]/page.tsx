import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { projects, Project, getLocalizedProject } from "@/data/projects";
import ProjectDetailClient, {
  AnimatedSection,
  AnimatedFade,
} from "./ProjectDetailClient";

// Site configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://suchang.dev";
const AUTHOR_NAME = "苏畅";

// Generate static params for all projects
export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

// Generate metadata for each project with enhanced SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const localized = getLocalizedProject(project, locale === "en" ? "en" : "zh");
  const title = `${project.name} - Projects | ${AUTHOR_NAME}`;
  const description = localized.shortDesc;
  const url = `${SITE_URL}/${locale}/projects/${project.id}`;
  const imageUrl = `${SITE_URL}/images/projects/${project.id}.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: `${AUTHOR_NAME} Portfolio`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
      locale: locale === "en" ? "en_US" : "zh_CN",
      type: "article",
      authors: [AUTHOR_NAME],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@suchang",
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate JSON-LD structured data for a project
function generateProjectJsonLd(project: Project) {
  const categoryMap: Record<Project["category"], string> = {
    ai: "Artificial Intelligence Application",
    android: "Android Application",
    web: "Web Application",
    tool: "Developer Tool",
  };

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.fullDesc,
    applicationCategory: categoryMap[project.category],
    operatingSystem: "Web",
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    ...(project.github && { codeRepository: project.github }),
    ...(project.demo && { url: project.demo }),
    dateCreated: project.startDate,
    ...(project.endDate && { dateModified: project.endDate }),
    programmingLanguage: project.techStack.join(", "),
    screenshot: `${SITE_URL}/images/projects/${project.id}.svg`,
  };
}

// Get project by ID
function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const project = getProject(id);
  const t = await getTranslations({ locale, namespace: "projects" });

  // Handle project not found
  if (!project) {
    notFound();
  }

  // Get localized content
  const localized = getLocalizedProject(project, locale === "en" ? "en" : "zh");

  // Status badge config
  const statusConfig = {
    completed: {
      label: t("status.completed"),
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400",
    },
    "in-progress": {
      label: t("status.inProgress"),
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400",
    },
    archived: {
      label: t("status.archived"),
      className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      dot: "bg-slate-400",
    },
  };

  // Category badge config
  const categoryConfig = {
    ai: { label: t("category.ai"), className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    android: { label: t("category.android"), className: "bg-green-500/15 text-green-400 border-green-500/30" },
    web: { label: t("category.web"), className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    tool: { label: t("category.tool"), className: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  };

  // Generate JSON-LD structured data
  const jsonLd = generateProjectJsonLd(project);

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pt-16 pb-12">
      <ProjectDetailClient>
        {/* Hero Section with Project Image */}
        <AnimatedFade>
          <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[400px] rounded-2xl overflow-hidden mb-8">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={`/images/projects/${project.id}.svg`}
                alt={project.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
              style={{
                background: `linear-gradient(to top, rgba(15,15,35,1) 0%, rgba(15,15,35,0.7) 40%, rgba(15,15,35,0.3) 100%)`,
              }}
            />

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-4xl mx-auto">
                {/* Badges */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${categoryConfig[project.category].className}`}>
                    {categoryConfig[project.category].label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${statusConfig[project.status].className}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[project.status].dot}`} />
                    {statusConfig[project.status].label}
                  </span>
                </div>

                {/* Project name with glow effect */}
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
                  style={{
                    color: project.color,
                    textShadow: `0 0 30px ${project.color}40`,
                  }}
                >
                  {project.name}
                </h1>

                {/* Timeline */}
                <div className="flex items-center gap-2 text-sm text-secondary/80">
                  <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-90 4h18M17 8H7m10 0v8m-8 0V8m8 8H7" />
                  </svg>
                  <span>{project.startDate}</span>
                  {project.endDate && (
                    <>
                      <span className="opacity-40">—</span>
                      <span>{project.endDate}</span>
                    </>
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
              href={`/${locale}/projects`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass hover:border-primary/40 transition-all duration-300 mb-8 group"
            >
              <svg
                className="w-4 h-4 text-secondary group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-secondary group-hover:text-primary transition-colors">{t("detail.backToProjects")}</span>
            </Link>
          </AnimatedFade>

          {/* Short description card */}
          <AnimatedSection>
            <div className="glass rounded-xl p-6 mb-6">
              <p className="text-lg text-secondary leading-relaxed">{localized.shortDesc}</p>
            </div>
          </AnimatedSection>

          {/* Action links */}
          <AnimatedSection>
            <div className="flex flex-wrap gap-4 mb-8">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 group"
                >
                  <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-white/90 font-medium group-hover:text-white transition-colors">{t("detail.github")}</span>
                  <svg className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
                  style={{
                    boxShadow: `0 0 0 1px ${project.color}30`,
                  }}
                >
                  <svg className="w-5 h-5 text-accent/80 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-accent/90 font-medium group-hover:text-accent transition-colors">{t("detail.demo")}</span>
                  <svg className="w-4 h-4 text-accent/60 group-hover:text-accent group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </AnimatedSection>

          {/* Full description */}
          <AnimatedSection>
            <div className="glass rounded-xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                {t("detail.description")}
              </h2>
              <p className="text-secondary leading-relaxed text-base sm:text-lg">
                {localized.fullDesc}
              </p>
            </div>
          </AnimatedSection>

          {/* Tech stack */}
          <AnimatedSection>
            <div className="glass rounded-xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                {t("detail.techStackTitle")}
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary/90 border border-primary/20 hover:border-primary/40 hover:bg-primary/15 hover:text-primary transition-all duration-200"
                    style={{
                      borderColor: `${project.color}30`,
                      backgroundColor: `${project.color}10`,
                      color: project.color,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Highlights */}
          <AnimatedSection>
            <div className="glass rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                {t("detail.highlights")}
              </h2>
              <ul className="space-y-4">
                {localized.highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: `${project.color}20`,
                        border: `1px solid ${project.color}30`,
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke={project.color}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-secondary text-base leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </ProjectDetailClient>
    </div>
  </>
  );
}
