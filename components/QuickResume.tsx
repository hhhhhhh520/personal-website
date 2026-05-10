'use client';

/**
 * QuickResume - 快速简历侧边栏
 * 展示个人信息、核心技能、核心项目和联系方式
 */

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { projects } from '@/data/projects';
import { personal } from '@/data/personal';

interface QuickResumeProps {
  onClose: () => void;
}

export function QuickResume({ onClose }: QuickResumeProps) {
  const t = useTranslations('resume');
  const topSkills = personal.skills.flatMap((s) => s.items).slice(0, 7);

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-900/98 backdrop-blur-lg border-r border-gray-700 z-[60] overflow-y-auto"
    >
      <div className="p-6 text-white relative min-h-full">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl"
          aria-label={t('close')}
        >
          x
        </button>

        {/* 个人信息 */}
        <div className="mb-8 pt-2">
          <h1 className="text-2xl font-bold mb-2">{personal.name}</h1>
          <p className="text-gray-400 mb-1">{personal.title}</p>
          <p className="text-gray-500 text-sm">{personal.education[0]?.school} - {personal.education[0]?.major}</p>
        </div>

        {/* 核心技能 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">{t('coreSkills')}</h2>
          <div className="flex flex-wrap gap-2">
            {topSkills.map(skill => (
              <span
                key={skill}
                className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* 核心项目 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">{t('coreProjects')}</h2>
          <ul className="space-y-3">
            {projects.slice(0, 4).map(p => (
              <li key={p.id} className="group">
                <a
                  href={`/projects/${p.id}`}
                  className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                >
                  {p.name}
                </a>
                <p className="text-sm text-gray-400 mt-1">{p.shortDesc}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.techStack.slice(0, 3).map(tech => (
                    <span
                      key={tech}
                      className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 教育背景 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">{t('education')}</h2>
          {personal.education.map((edu, i) => (
            <div key={i} className="text-sm">
              <p className="text-white">{edu.school}</p>
              <p className="text-gray-400">{edu.major} | {edu.degree} | {edu.startDate.slice(0, 4)}-{edu.endDate?.slice(0, 4) || '至今'}</p>
            </div>
          ))}
        </section>

        {/* 联系方式 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">{t('contact')}</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="text-gray-500 mr-2">Email:</span>
              <a href={`mailto:${personal.email}`} className="text-indigo-400 hover:underline">
                {personal.email}
              </a>
            </p>
            {personal.phone && (
              <p className="text-gray-300">
                <span className="text-gray-500 mr-2">Phone:</span>
                <span className="text-gray-300">{personal.phone}</span>
              </p>
            )}
            {personal.socials.map((social) => (
              <p key={social.platform} className="text-gray-300">
                <span className="text-gray-500 mr-2">{social.platform}:</span>
                <a
                  href={social.url}
                  className="text-indigo-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.username}
                </a>
              </p>
            ))}
          </div>
        </section>

        {/* 下载简历按钮 */}
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/resume/resume.pdf';
              link.download = `${personal.name}-简历.pdf`;
              link.click();
            }}
            aria-label={t('downloadPdf')}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {t('downloadPdf')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
