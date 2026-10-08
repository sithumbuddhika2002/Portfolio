import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { XMarkIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { Project } from '../../types/portfolio';
import { normalizeCategory, isProjectInFilter, getCategoryBadgeStyle } from '../../utils/projectUtils';

export const ProjectsSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { projects } = data;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const INITIAL_LIMIT = 12;

    // Sort projects: featured first, then by date descending (most recent first)
    const sortedProjects = [...(projects || [])].sort((a, b) => {
        if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
        }
        return (b.date || '').localeCompare(a.date || '');
    });

    // Dynamically calculate counts for all categories present in existing projects
    const categoryCounts = new Map<string, number>();
    sortedProjects.forEach((p) => {
        const cat = normalizeCategory(p.category);
        if (cat) {
            categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        }
    });

    // Sort categories professionally: highest project count first, then alphabetical
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
        { id: 'all', label: 'All (Recent)', count: sortedProjects.length },
        ...sortedCategories,
    ];

    // Safe active filter fallback
    const activeFilter = tabs.some((t) => t.id === filter) ? filter : 'all';

    // Filter projects according to selected tab
    const filteredProjects = sortedProjects.filter((p) => isProjectInFilter(p.category, activeFilter));

    // Handle 12-item default limit with expand/collapse
    const displayedProjects = isExpanded ? filteredProjects : filteredProjects.slice(0, INITIAL_LIMIT);
    const hasMore = filteredProjects.length > INITIAL_LIMIT;

    const handleFilterChange = (tabId: string) => {
        setFilter(tabId);
        setIsExpanded(false); // Reset expansion to default 12 on tab switch
    };

    return (
        <section id="projects" className="section-padding bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        My <span className="gradient-text">Projects</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        Explore my recent work and creative endeavors across personal, academic, and corporate domains
                    </p>

                    {/* Filter Tabs: 2-by-2 responsive grid on mobile, flex-wrap centered pills on desktop */}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:items-center sm:gap-3 max-w-md sm:max-w-4xl mx-auto mb-10 px-2 sm:px-0">
                        {tabs.map((tab, index) => {
                            const isActive = activeFilter === tab.id;
                            const isAll = tab.id === 'all';
                            // If 'all' is at the top, it spans both columns on mobile (col-span-2)
                            // If remaining categories count is odd, the last item also spans 2 to keep rows balanced
                            const isLastOdd = !isAll && tabs.length % 2 === 0 && index === tabs.length - 1;
                            const colSpanClass = isAll || isLastOdd ? 'col-span-2 sm:col-span-1' : 'col-span-1';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleFilterChange(tab.id)}
                                    className={`w-full sm:w-auto min-h-[42px] px-2.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none active:scale-95 ${colSpanClass} ${
                                        isActive
                                            ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-sm shadow-primary-500/25'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="truncate">{tab.label}</span>
                                    <span
                                        className={`shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Projects Grid */}
                {displayedProjects.length > 0 ? (
                    <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                        <AnimatePresence>
                            {displayedProjects.map((project, index) => {
                                const badge = getCategoryBadgeStyle(project.category);
                                return (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: Math.min(index * 0.05, 0.4) }}
                                        whileHover={{ y: -6 }}
                                        onClick={() => setSelectedProject(project)}
                                        className="card-hover cursor-pointer group overflow-hidden flex flex-col justify-between p-3 sm:p-6 rounded-xl sm:rounded-2xl"
                                    >
                                        <div>
                                            {/* Project Image */}
                                            <div className="relative h-28 xs:h-36 sm:h-48 mb-2.5 sm:mb-4 -mx-3 -mt-3 sm:-mx-6 sm:-mt-6 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                <img
                                                    src={project.image}
                                                    alt={project.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                {project.featured && (
                                                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-500 text-white text-[9px] sm:text-xs font-semibold rounded-full shadow-xs">
                                                        Featured
                                                    </div>
                                                )}
                                                {project.date && (
                                                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-4 px-1.5 sm:px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white/90 text-[9px] sm:text-[11px] font-medium rounded-md">
                                                        {project.date}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Category Tag Name Box */}
                                            <div className="mb-1.5 sm:mb-2.5 flex items-center justify-between">
                                                <span
                                                    className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 sm:gap-1.5 truncate ${badge.bg} ${badge.text} ${badge.border}`}
                                                >
                                                    <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${badge.dot} shrink-0`} />
                                                    <span className="truncate">{normalizeCategory(project.category)}</span>
                                                </span>
                                            </div>

                                            {/* Project Info */}
                                            <h3 className="text-xs xs:text-sm sm:text-lg font-bold mb-1 sm:mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 sm:line-clamp-none">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-4 line-clamp-2 text-[11px] sm:text-sm leading-relaxed">
                                                {project.description}
                                            </p>

                                            {/* Technologies */}
                                            {project.technologies && project.technologies.length > 0 && (
                                                <div className="hidden xs:flex flex-wrap gap-1 sm:gap-1.5 mb-2.5 sm:mb-4">
                                                    {project.technologies.slice(0, 3).map((tech, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-1.5 sm:px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs rounded-md"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 3 && (
                                                        <span className="px-1.5 sm:px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] sm:text-xs rounded-md">
                                                            +{project.technologies.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Links */}
                                        <div className="flex flex-col xs:flex-row gap-1.5 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800">
                                            {project.liveUrl && (
                                                <a
                                                    href={project.liveUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] sm:text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                                >
                                                    Live Demo <ArrowTopRightOnSquareIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:underline flex items-center gap-1"
                                                >
                                                    GitHub <ArrowTopRightOnSquareIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No projects found in this category yet.
                        </p>
                    </div>
                )}

                {/* Expand / View All Projects Button - No glow effects */}
                {hasMore && (
                    <div className="mt-12 text-center flex flex-col items-center justify-center gap-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 transition-colors cursor-pointer"
                        >
                            {isExpanded ? (
                                <>
                                    <span>Show Less</span>
                                    <ChevronUpIcon className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <span>View All Projects ({filteredProjects.length})</span>
                                    <ChevronDownIcon className="w-4 h-4" />
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing {displayedProjects.length} of {filteredProjects.length} projects
                        </p>
                    </div>
                )}

                {/* Project Detail Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                            onClick={() => setSelectedProject(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 relative shadow-xl border border-gray-100 dark:border-gray-700"
                            >
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer z-10"
                                    aria-label="Close modal"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                </button>

                                <div className="relative w-full h-48 sm:h-72 rounded-xl overflow-hidden mb-5 bg-gray-100 dark:bg-gray-900">
                                    <img
                                        src={selectedProject.image}
                                        alt={selectedProject.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedProject.featured && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full shadow-xs">
                                            Featured Project
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span
                                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${getCategoryBadgeStyle(selectedProject.category).bg} ${getCategoryBadgeStyle(selectedProject.category).text} ${getCategoryBadgeStyle(selectedProject.category).border}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${getCategoryBadgeStyle(selectedProject.category).dot}`} />
                                        {normalizeCategory(selectedProject.category)}
                                    </span>
                                    {selectedProject.date && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedProject.date}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3 text-gray-900 dark:text-gray-100">
                                    {selectedProject.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                                    {selectedProject.longDescription || selectedProject.description}
                                </p>

                                <div className="mb-6">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                        Technologies Used
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.technologies.map((tech, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs rounded-full border border-gray-200 dark:border-gray-600"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {selectedProject.liveUrl && (
                                        <a
                                            href={selectedProject.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                                        >
                                            View Live Demo <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                        </a>
                                    )}
                                    {selectedProject.githubUrl && (
                                        <a
                                            href={selectedProject.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                                        >
                                            Source Code <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
