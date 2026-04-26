'use client';

import { motion } from 'framer-motion';
import { Bot, Search, Sparkles, Workflow } from 'lucide-react';

type SeoExpertiseProps = {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const pillars = [
  {
    icon: Search,
    title: 'Technical SEO Expert',
    description:
      'I fix crawlability, metadata, schema, internal linking, rendering, Core Web Vitals, and indexation so search engines can access and trust the site properly.',
    points: ['Metadata architecture', 'Schema markup', 'Indexation and crawl control'],
  },
  {
    icon: Bot,
    title: 'AI Search Engine Expert',
    description:
      'I optimize websites for AI-driven discovery across Google AI Overviews, ChatGPT, Gemini, and Perplexity by improving semantic structure, answerability, and authority signals.',
    points: ['AEO and GEO strategy', 'Entity clarity', 'AI-ready content structure'],
  },
  {
    icon: Workflow,
    title: 'SEO + Engineering Execution',
    description:
      'I implement SEO improvements directly in production codebases using Next.js, React, structured data, performance tuning, and scalable content architecture.',
    points: ['Next.js SEO implementation', 'Core Web Vitals improvements', 'Scalable page templates'],
  },
  {
    icon: Sparkles,
    title: 'Content That Can Be Cited',
    description:
      'I shape content so it is useful for users, understandable to search systems, and strong enough to be surfaced in summaries, rich results, and AI-generated answers.',
    points: ['FAQ design', 'Topic clustering', 'Answer-oriented content'],
  },
];

export default function PremiumSeoExpertise({ faqs }: SeoExpertiseProps) {
  return (
    <section id="seo-expertise" className="py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-3">SEO Expertise</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-5">
              SEO expert and AI search engine expert for modern brands.
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              I combine technical SEO, AEO, GEO, performance engineering, and content structure so websites can rank in classic search, qualify for rich results, and stay visible in AI-generated answers.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/50 p-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{pillar.title}</h4>
                <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed mb-5">{pillar.description}</p>
                <div className="flex flex-wrap gap-2">
                  {pillar.points.map((point) => (
                    <span
                      key={point}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-200 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-cyan-500/[0.08] p-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-500 mb-4">Search Coverage</p>
            <h4 className="text-3xl font-bold text-zinc-900 dark:text-white mb-5">From traditional SEO to AI answer engines.</h4>
            <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed mb-6">
              The goal is not just rankings. It is discoverability across search results, rich snippets, AI overviews, conversational engines, and answer-first interfaces where users increasingly make decisions.
            </p>
            <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 p-4">Google Search and Google AI Overviews</div>
              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 p-4">ChatGPT, Gemini, and Perplexity visibility</div>
              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 p-4">Schema markup, entities, FAQs, and semantic architecture</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/50 p-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-blue-500 mb-4">FAQ</p>
            <h4 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Common SEO and AI search questions.</h4>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 p-5">
                  <h5 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{faq.question}</h5>
                  <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}