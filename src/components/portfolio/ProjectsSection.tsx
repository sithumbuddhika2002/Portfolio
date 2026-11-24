import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import {
    XMarkIcon,
    ArrowTopRightOnSquareIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';
import type { Project } from '../../types/portfolio';
import { normalizeCategory, isProjectInFilter } from '../../utils/projectUtils';

const isPlaceholderCopy = (text?: string): boolean => {
    if (!text) return true;
    const trimmed = text.trim();
    if (!trimmed) return true;
    return (
        /^(project\s+)?(short\s+|long\s+)?description\.?$/i.test(trimmed) ||
        /^lorem ipsum/i.test(trimmed) ||
        /^(add|enter)\s+(a\s+)?(project\s+)?description/i.test(trimmed)
    );
};

const getProjectSummary = (project: Project): string => {
    if (!isPlaceholderCopy(project.description)) return project.description.trim();
    if (!isPlaceholderCopy(project.longDescription)) return project.longDescription.trim();
    return '';
};

const getProjectLongCopy = (project: Project): string => {
    if (!isPlaceholderCopy(project.longDescription)) return project.longDescription.trim();
    if (!isPlaceholderCopy(project.description)) return project.description.trim();
    return '';
};

const ProjectThumb: React.FC<{ src?: string; alt: string; className?: string }> = ({
    src,
    alt,
    className = '',
}) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[var(--pf-surface-2)] text-xs font-mono text-[var(--pf-subtle)]">
                No preview image
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            onError={() => setFailed(true)}
        />
    );
};

export const ProjectsSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { projects } = data;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const prefersReducedMotion = useReducedMotion();

    const INITIAL_LIMIT = 12;

    useEffect(() => {
        if (!selectedProject) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedProject(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [selectedProject]);

    const sortedProjects = [...(projects || [])].sort((a, b) => {
        if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
        }
        return (b.date || '').localeCompare(a.date || '');
    });

    const categoryCounts = new Map<string, number>();
    sortedProjects.forEach((p) => {
        const cat = normalizeCategory(p.category);
        if (cat) {
            categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        }
    });

    const sortedCategories = Array.from(categoryCounts.entries())
        .filter(([, count]) => count > 0)
        .sort((a, b) => {
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            }
            return a[0].localeCompare(b[0]);
        })
        .map(([cat, count]) => ({
            id: cat,
            label: cat,
            count,
        }));

    const tabs = [
        { id: 'all', label: 'All', count: sortedProjects.length },
        ...sortedCategories,
    ];

    const activeFilter = tabs.some((t) => t.id === filter) ? filter : 'all';
    const filteredProjects = sortedProjects.filter((p) =>
        isProjectInFilter(p.category, activeFilter)
    );
    const displayedProjects = isExpanded
        ? filteredProjects
        : filteredProjects.slice(0, INITIAL_LIMIT);
    const hasMore = filteredProjects.length > INITIAL_LIMIT;

    const handleFilterChange = (tabId: string) => {
        setFilter(tabId);
        setIsExpanded(false);
    };

    const fadeProps = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 12 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
          };

    return (
        <section id="projects" className="pf-section" aria-labelledby="projects-heading">
            <div className="pf-container">
                {/* Header & Filters */}
                <motion.div
                    {...fadeProps}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12"
                >
                    <div className="space-y-3">
                        <p className="pf-eyebrow">
                            <span className="pf-eyebrow-index">03</span>
                            <span>/</span>
                            <span>Selected Work</span>
                        </p>
                        <h2 id="projects-heading" className="pf-heading text-3xl sm:text-4xl lg:text-[2.75rem]">
                            Projects
                        </h2>
                        <p className="pf-lead text-sm sm:text-base max-w-xl">
                            Selected engineering work across personal, academic, and client environments.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div
                        className="flex flex-wrap gap-2"
                        role="tablist"
                        aria-label="Filter projects by category"
                    >
                        {tabs.map((tab) => {
                            const isActive = activeFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => handleFilterChange(tab.id)}
                                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium border transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer ${
                                        isActive
                                            ? 'bg-[var(--pf-ink)] text-[var(--pf-bg)] border-[var(--pf-ink)]'
                                            : 'bg-[var(--pf-surface)] text-[var(--pf-muted)] border-[var(--pf-border)] hover:border-[var(--pf-border-strong)] hover:text-[var(--pf-ink)]'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-[11px] font-mono ${
                                            isActive ? 'opacity-80' : 'text-[var(--pf-subtle)]'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Bento Grid */}
                {displayedProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {displayedProjects.map((project, index) => {
                            const summary = getProjectSummary(project);
                            const categoryLabel = normalizeCategory(project.category);
                            const isLeadBento =
                                index === 0 && project.featured && activeFilter === 'all';

                            return (
                                <article
                                    key={project.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedProject(project)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedProject(project);
                                        }
                                    }}
                                    className={`pf-bento overflow-hidden hover:border-[var(--pf-border-strong)] transition-colors duration-150 flex flex-col justify-between cursor-pointer group text-left ${
                                        isLeadBento
                                            ? 'lg:col-span-2 lg:grid lg:grid-cols-12 lg:items-stretch'
                                            : ''
                                    }`}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className={`bg-[var(--pf-surface-2)] overflow-hidden ${
                                            isLeadBento
                                                ? 'aspect-[16/10] lg:aspect-auto lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--pf-border)]'
                                                : 'aspect-[16/10] w-full border-b border-[var(--pf-border)]'
                                        }`}
                                    >
                                        <ProjectThumb
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content + Footer */}
                                    <div
                                        className={`flex flex-col justify-between flex-1 ${
                                            isLeadBento ? 'lg:col-span-5' : ''
                                        }`}
                                    >
                                        <div className="p-5 sm:p-6">
                                            {/* Metadata */}
                                            <div className="flex items-center justify-between gap-2 mb-2.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--pf-subtle)]">
                                                <span className="truncate">{categoryLabel}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {project.featured && (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--pf-surface-2)] text-[var(--pf-accent)] border border-[var(--pf-border-strong)]">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {project.date && <span>{project.date}</span>}
                                                </div>
                                            </div>

                                            {/* Title & Description */}
                                            <h3
                                                className={`font-display font-semibold text-[var(--pf-ink)] group-hover:text-[var(--pf-accent)] transition-colors leading-snug mb-2 ${
                                                    isLeadBento ? 'text-xl sm:text-2xl' : 'text-lg'
                                                }`}
                                            >
                                                {project.title}
                                            </h3>

                                            {summary && (
                                                <p
                                                    className={`text-sm text-[var(--pf-muted)] leading-relaxed mb-4 ${
                                                        isLeadBento ? 'line-clamp-3' : 'line-clamp-2'
                                                    }`}
                                                >
                                                    {summary}
                                                </p>
                                            )}

                                            {/* Technologies */}
                                            {project.technologies && project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.technologies.slice(0, 4).map((tech, i) => (
                                                        <span
                                                            key={`${tech}-${i}`}
                                                            className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-[var(--pf-surface-2)] text-[var(--pf-muted)] border border-[var(--pf-border)]"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 4 && (
                                                        <span className="px-2 py-0.5 text-[11px] font-mono text-[var(--pf-subtle)]">
                                                            +{project.technologies.length - 4}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer Links */}
                                        <div className="px-5 sm:px-6 py-3.5 border-t border-[var(--pf-border)] flex items-center justify-between gap-3 text-xs font-medium">
                                            <div className="flex items-center gap-4">
                                                {project.liveUrl && (
                                                    <a
                                                        href={project.liveUrl}
                                                        onClick={(e) => e.stopPropagation()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--pf-ink)] hover:text-[var(--pf-accent)] transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <span>Live Demo</span>
                                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a
                                                        href={project.githubUrl}
                                                        onClick={(e) => e.stopPropagation()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--pf-muted)] hover:text-[var(--pf-ink)] transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <span>GitHub</span>
                                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                                    </a>
                                                )}
                                            </div>

                                            <span className="text-[var(--pf-muted)] group-hover:text-[var(--pf-ink)] transition-colors font-mono text-[11px] uppercase tracking-wider">
                                                Details →
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pf-bento p-12 text-center">
                        <p className="text-sm text-[var(--pf-muted)]">
                            No projects found in this category.
                        </p>
                    </div>
                )}

                {/* Expand / Collapse Button */}
                {hasMore && (
                    <div className="mt-8 pf-bento p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-mono text-[var(--pf-muted)]">
                            Showing {displayedProjects.length} of {filteredProjects.length} projects
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            className="pf-btn-secondary"
                        >
                            {isExpanded ? (
                                <>
                                    <span>Show Fewer</span>
                                    <ChevronUpIcon className="w-4 h-4" aria-hidden="true" />
                                </>
                            ) : (
                                <>
                                    <span>View All Projects ({filteredProjects.length})</span>
                                    <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Project Detail Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                            transition={{ duration: 0.16 }}
                            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                            onClick={() => setSelectedProject(null)}
                        >
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="project-modal-title"
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                onClick={(e) => e.stopPropagation()}
                                className="pf-bento border-[var(--pf-border-strong)] max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
                            >
                                <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-7 py-4 bg-[var(--pf-surface)] border-b border-[var(--pf-border)]">
                                    <div className="flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--pf-muted)] min-w-0">
                                        <span className="truncate">{normalizeCategory(selectedProject.category)}</span>
                                        {selectedProject.date && (
                                            <>
                                                <span>·</span>
                                                <span className="shrink-0">{selectedProject.date}</span>
                                            </>
                                        )}
                                        {selectedProject.featured && (
                                            <span className="px-2 py-0.5 rounded-md bg-[var(--pf-surface-2)] text-[var(--pf-accent)] border border-[var(--pf-border-strong)] shrink-0">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProject(null)}
                                        className="w-9 h-9 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] hover:border-[var(--pf-border-strong)] flex items-center justify-center text-[var(--pf-ink)] transition-colors cursor-pointer shrink-0"
                                        aria-label="Close project details"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-5 sm:p-7 space-y-6">
                                    <div className="aspect-[16/9] w-full rounded-xl bg-[var(--pf-surface-2)] border border-[var(--pf-border)] overflow-hidden">
                                        <ProjectThumb
                                            src={selectedProject.image}
                                            alt={selectedProject.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div>
                                        <h3
                                            id="project-modal-title"
                                            className="text-2xl sm:text-3xl font-display font-semibold text-[var(--pf-ink)] tracking-tight mb-3"
                                        >
                                            {selectedProject.title}
                                        </h3>

                                        {getProjectLongCopy(selectedProject) ? (
                                            <p className="text-sm sm:text-base text-[var(--pf-muted)] leading-relaxed whitespace-pre-line">
                                                {getProjectLongCopy(selectedProject)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-[var(--pf-subtle)] italic">
                                                Detailed project summary has not been added yet.
                                            </p>
                                        )}
                                    </div>

                                    {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--pf-subtle)] mb-3">
                                                Technologies
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.technologies.map((tech, i) => (
                                                    <span
                                                        key={`${tech}-${i}`}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--pf-surface-2)] text-[var(--pf-ink)] border border-[var(--pf-border)]"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(selectedProject.liveUrl || selectedProject.githubUrl) && (
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--pf-border)]">
                                            {selectedProject.liveUrl && (
                                                <a
                                                    href={selectedProject.liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="pf-btn-primary w-full sm:w-auto"
                                                >
                                                    <span>View Live Demo</span>
                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" aria-hidden="true" />
                                                </a>
                                            )}
                                            {selectedProject.githubUrl && (
                                                <a
                                                    href={selectedProject.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="pf-btn-secondary w-full sm:w-auto"
                                                >
                                                    <span>Source Code</span>
                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" aria-hidden="true" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
