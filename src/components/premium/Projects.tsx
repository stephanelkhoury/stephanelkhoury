'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

type ProjectRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  technologies: string[];
};

export default function PremiumProjects({ projects }: { projects: ProjectRecord[] }) {
  return (
    <section id="projects" className="py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-2">Portfolio</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">Featured Work</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">A selection of digital platforms, applications, and tools engineered for performance and designed for users.</p>
          </motion.div>

          <motion.a
            href="https://github.com/stephanelkhoury"
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
          >
            View GitHub Archive
            <ArrowUpRight size={16} />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-zinc-100/70 dark:bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-300/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col"
            >
              <div className="relative h-64 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800" />
                )}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 dark:bg-zinc-950/80 text-zinc-900 dark:text-white backdrop-blur-md border border-zinc-300 dark:border-zinc-800">
                    {project.summary}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{project.title}</h4>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    aria-label={`Open ${project.title} project page`}
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>

                <p className="text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed mb-6 flex-1">{project.description}</p>

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-300/60 dark:border-zinc-800/50">
                  {project.technologies.map((tag) => (
                    <span key={`${project.id}-${tag}`} className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  View project page
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
