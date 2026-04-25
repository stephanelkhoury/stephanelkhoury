'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt, faChevronLeft, faChevronRight, faTimes, faBolt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Modal from './Modal';
import type { Project, PerformanceMetrics } from './Projects';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

function ScoreRing({ score, label, size = 64 }: { score: number; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="transparent"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={color} fontSize={size * 0.28}
          fontWeight="bold" className="rotate-90" style={{ transformOrigin: 'center' }}>
          {score}
        </text>
      </svg>
      <span className="text-[10px] text-gray-400 text-center leading-tight">{label}</span>
    </div>
  );
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [liveTestResult, setLiveTestResult] = useState<PerformanceMetrics | null>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');

  if (!project) return null;

  const screenshots = project.screenshots || [];
  const desktopScreenshots = screenshots.filter((s) => s.type === 'desktop');
  const mobileScreenshots = screenshots.filter((s) => s.type === 'mobile');
  const metrics = liveTestResult || project.performanceMetrics;

  const runLiveTest = async () => {
    if (!project.live) return;
    setTesting(true);
    setTestError('');
    try {
      const res = await fetch('/api/performance-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: project.live }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestError(data.error || 'Test failed');
        return;
      }
      setLiveTestResult({
        performance: data.performance,
        accessibility: data.accessibility,
        bestPractices: data.bestPractices,
        seo: data.seo,
        testedAt: new Date().toISOString(),
      });
    } catch {
      setTestError('Test failed. Try again.');
    } finally {
      setTesting(false);
    }
  };

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % screenshots.length);
  };
  const prevImage = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={project.title}>
        <div className="space-y-8">
          {/* Hero Image + Meta */}
          <div className="relative aspect-video rounded-xl overflow-hidden group">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
              priority={true}
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full text-white">
                  {project.category}
                </span>
                {project.date && (
                  <span className="px-3 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full text-white">
                    {project.date}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description + Tech */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {project.fullDescription || project.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gradient-to-r from-[#3b82f6]/20 to-[#06b6d4]/20 border border-[#3b82f6]/30 rounded-full text-xs text-[#3b82f6] font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg text-white text-sm font-medium hover:from-gray-600 hover:to-gray-500 transition-all">
                    <FontAwesomeIcon icon={faGithub} /> View Code
                  </a>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-[#3b82f6]/25 transition-all">
                    <FontAwesomeIcon icon={faExternalLinkAlt} /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Features + Challenges */}
            <div className="space-y-4">
              {project.features && project.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Key Features</h3>
                  <div className="space-y-1.5">
                    {project.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                        <span className="text-[#3b82f6] mt-0.5 flex-shrink-0 text-xs">✓</span>
                        <span className="text-gray-300 text-xs leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {project.challenges && project.challenges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Challenges Solved</h3>
                  <div className="space-y-1.5">
                    {project.challenges.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                        <span className="text-[#06b6d4] mt-0.5 flex-shrink-0 text-xs">◆</span>
                        <span className="text-gray-300 text-xs leading-relaxed">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot Gallery */}
          {screenshots.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Screenshots</h3>

              {/* Desktop Screenshots */}
              {desktopScreenshots.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">🖥 Desktop</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {desktopScreenshots.map((ss, idx) => {
                      const globalIdx = screenshots.indexOf(ss);
                      return (
                        <motion.div
                          key={idx}
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group border border-white/10"
                          whileHover={{ scale: 1.03 }}
                          onClick={() => openLightbox(globalIdx)}
                        >
                          <Image src={ss.url} alt={ss.caption || `Desktop screenshot ${idx + 1}`} fill className="object-cover" sizes="300px" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                          </div>
                          {ss.caption && (
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-[10px] text-gray-300 truncate">
                              {ss.caption}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile Screenshots */}
              {mobileScreenshots.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">📱 Mobile</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {mobileScreenshots.map((ss, idx) => {
                      const globalIdx = screenshots.indexOf(ss);
                      return (
                        <motion.div
                          key={idx}
                          className="relative w-28 md:w-36 aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group border-2 border-white/10 flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => openLightbox(globalIdx)}
                        >
                          <Image src={ss.url} alt={ss.caption || `Mobile screenshot ${idx + 1}`} fill className="object-cover" sizes="150px" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                          {ss.caption && (
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-[9px] text-gray-300 truncate">
                              {ss.caption}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Metrics */}
          {(metrics || project.live) && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} className="text-yellow-400" />
                  Performance Report
                </h3>
                {project.live && (
                  <motion.button
                    onClick={runLiveTest}
                    disabled={testing}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {testing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Running Live Test...
                      </span>
                    ) : (
                      <>🚀 Run Live Lighthouse Test</>
                    )}
                  </motion.button>
                )}
              </div>

              {testError && <p className="text-xs text-red-400">{testError}</p>}

              {metrics ? (
                <div>
                  <div className="flex justify-center gap-6 md:gap-10">
                    <ScoreRing score={metrics.performance} label="Performance" size={72} />
                    <ScoreRing score={metrics.accessibility} label="Accessibility" size={72} />
                    <ScoreRing score={metrics.bestPractices} label="Best Practices" size={72} />
                    <ScoreRing score={metrics.seo} label="SEO" size={72} />
                  </div>
                  {metrics.testedAt && (
                    <p className="text-[10px] text-gray-500 text-center mt-3">
                      {liveTestResult ? 'Live test' : 'Tested'}: {new Date(metrics.testedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">
                  Click &quot;Run Live Lighthouse Test&quot; to see real-time performance scores for this project.
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && screenshots[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            {screenshots.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white/70 hover:text-white z-10 p-3">
                  <FontAwesomeIcon icon={faChevronLeft} size="lg" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white/70 hover:text-white z-10 p-3">
                  <FontAwesomeIcon icon={faChevronRight} size="lg" />
                </button>
              </>
            )}

            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={screenshots[lightboxIndex].url}
                alt={screenshots[lightboxIndex].caption || 'Screenshot'}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-auto rounded-lg"
              />
              {screenshots[lightboxIndex].caption && (
                <p className="text-center text-sm text-gray-300 mt-3">{screenshots[lightboxIndex].caption}</p>
              )}
              <p className="text-center text-[10px] text-gray-500 mt-1">
                {lightboxIndex + 1} / {screenshots.length} · {screenshots[lightboxIndex].type}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectModal;
