import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { Project } from '../../types/portfolio';

export const ProjectsSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { projects } = data;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const categories = ['all', ...new Set(projects.map((p) => p.category))];
    const filteredProjects =
        filter === 'all'
            ? projects
            : projects.filter((p) => p.category === filter);

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
                        Explore my recent work and creative endeavors
                    </p>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category) => (
                            <motion.button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${filter === category
                                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Projects Grid */}
                <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedProject(project)}
                            className="card-hover cursor-pointer group overflow-hidden"
                        >
                            {/* Project Image */}
                            <div className="relative h-48 mb-4 -mx-6 -mt-6 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {project.featured && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent-500 text-white text-sm font-semibold rounded-full">
                                        Featured
                                    </div>
                                )}
                            </div>

                            {/* Project Info */}
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {project.description}
                            </p>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies.slice(0, 3).map((tech, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full"
                                    >
                                        {tech}
                                    </span>
                                ))}
                                {project.technologies.length > 3 && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full">
                                        +{project.technologies.length - 3}
                                    </span>
                                )}
                            </div>

                            {/* Links */}
                            <div className="flex gap-3">
                                {project.liveUrl && (
                                    <a
                                        href={project.liveUrl}
                                        onClick={(e) => e.stopPropagation()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                    >
                                        Live Demo <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    </a>
                                )}
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        onClick={(e) => e.stopPropagation()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                    >
                                        GitHub <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Project Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProject(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                            >
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                <img
                                    src={selectedProject.image}
                                    alt={selectedProject.title}
                                    className="w-full h-64 object-cover rounded-xl mb-6"
                                />

                                <h2 className="text-3xl font-bold mb-4">{selectedProject.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                    {selectedProject.longDescription}
                                </p>

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-3">Technologies Used</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.technologies.map((tech, i) => (
                                            <span
                                                key={i}
                                                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {selectedProject.liveUrl && (
                                        <a
                                            href={selectedProject.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                        >
                                            View Live
                                        </a>
                                    )}
                                    {selectedProject.githubUrl && (
                                        <a
                                            href={selectedProject.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                        >
                                            View Code
                                        </a>
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
